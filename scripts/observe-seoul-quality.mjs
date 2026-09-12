// Research only. Emits aggregate evidence, never a publication policy or source rows.
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'vite';

if (process.argv.length !== 2) throw new Error('This observation accepts no input overrides');
// Research resource ceilings, not calibrated production quality thresholds.
const resourceLimits = {
  maxEntryBytes: 512 * 1024 * 1024,
  maxTotalRows: 3_000_000,
  entryTimeoutMs: 120_000,
};
const stagingRoot = await mkdtemp(join(tmpdir(), 'open-store-observation-'));
const server = await createServer({
  configFile: false,
  appType: 'custom',
  logLevel: 'error',
  server: { middlewareMode: true, watch: null, ws: false },
});
const started = performance.now();
try {
  const { createSeoulCollector } = await server.ssrLoadModule(
    '/src/pipeline/collect-seoul-archive.ts',
  );
  const { DEFAULT_COLLECTOR_LIMITS } = await server.ssrLoadModule(
    '/src/pipeline/collector-types.ts',
  );
  const { runProcess, UnzipArchiveAdapter, UTF8_UNZIP_OPTIONS } = await server.ssrLoadModule(
    '/src/pipeline/unzip-archive.ts',
  );
  const { probeSourceContract } = await server.ssrLoadModule('/src/pipeline/probe-source.ts');
  const { downloadArchiveToStaging } = await server.ssrLoadModule(
    '/src/pipeline/staged-download.ts',
  );
  const { inspectArchive } = await server.ssrLoadModule('/src/pipeline/inspect-archive.ts');
  const { parsePermissionManifest } = await server.ssrLoadModule(
    '/src/pipeline/source-contract.ts',
  );
  const { parseArchiveContract } = await server.ssrLoadModule('/src/pipeline/archive-contract.ts');
  // Use exactly the normal dependencies; add inventory diagnostics without changing acceptance.
  const collectSeoulArchive = createSeoulCollector({
    checkArchiveEnvironment: (options) =>
      new UnzipArchiveAdapter('unzip', options.limits).checkEnvironment(options.signal),
    probeSource: (options) =>
      probeSourceContract({
        ...options,
        fetchImpl: async (input, init) => {
          try {
            return await options.fetchImpl(input, init);
          } catch (error) {
            console.log(
              `SOURCE_CONNECTION_DIAGNOSTIC ${JSON.stringify({
                name: error.name,
                code: error.cause?.code,
                cause: error.cause?.message,
              })}`,
            );
            throw error;
          }
        },
      }),
    downloadArchive: downloadArchiveToStaging,
    cleanupRejectedDownload: (archivePath) => rm(archivePath, { force: true }),
    loadContracts: async () => ({
      permissionManifest: parsePermissionManifest(
        JSON.parse(await readFile('reports/source-permission-manifest-2026-08-28.json', 'utf8')),
      ),
      archiveContract: parseArchiveContract(
        JSON.parse(await readFile('src/pipeline/contracts/seoul-archive-contract.json', 'utf8')),
      ),
    }),
    inspectArchive: async (options) => {
      const result = await inspectArchive(options);
      if (result.kind === 'rejected' && result.code === 'category_manifest_changed') {
        const listed = await options.adapter.listEntries(options.archivePath);
        const actual = listed
          .filter((entry) => !entry.name.endsWith('/'))
          .map((entry) => entry.name.normalize('NFC'))
          .sort();
        const expected = options.contract.entries
          .map((entry) => entry.entryName.normalize('NFC'))
          .sort();
        const digest = createHash('sha256');
        for await (const bytes of createReadStream(options.archivePath)) digest.update(bytes);
        console.log(
          `INVENTORY_DIAGNOSTIC ${JSON.stringify({
            archiveSha256: digest.digest('hex'),
            expectedCount: expected.length,
            actualCount: actual.length,
            missing: expected.filter((name) => !actual.includes(name)),
            added: actual.filter((name) => !expected.includes(name)),
            message: result.message,
          })}`,
        );
        for (const args of [
          ['-Z', '-O', 'UTF-8', '-1', options.archivePath],
          ['-O', 'UTF-8', '-Z1', options.archivePath],
        ]) {
          const probe = await runProcess({
            executable: 'unzip',
            args,
            maxOutputBytes: DEFAULT_COLLECTOR_LIMITS.maxProcessOutputBytes,
            timeoutMs: 30_000,
          });
          const names = new TextDecoder('utf-8', { fatal: true })
            .decode(probe.stdout)
            .split(/\r?\n/)
            .filter(Boolean);
          console.log(
            `ENCODING_DIAGNOSTIC ${JSON.stringify({
              args: args.slice(0, -1),
              exitCode: probe.exitCode,
              count: names.length,
              matching: names.filter((name) => expected.includes(name.normalize('NFC'))).length,
              sample: names.slice(0, 2),
              stderr: new TextDecoder().decode(probe.stderr).slice(0, 300),
            })}`,
          );
        }
        const metadata = await runProcess({
          executable: 'python3',
          args: [
            '-c',
            'import zipfile,json,sys; z=zipfile.ZipFile(sys.argv[1]); print(json.dumps([{ "flags": i.flag_bits, "system": i.create_system, "decoded": i.filename, "utf8": i.filename if i.flag_bits & 2048 else i.filename.encode("cp437").decode("utf-8") } for i in z.infolist()[:2]],ensure_ascii=False))',
            options.archivePath,
          ],
          maxOutputBytes: 10000,
          timeoutMs: 30_000,
        });
        console.log(`ZIP_METADATA ${new TextDecoder().decode(metadata.stdout).trim()}`);
      }
      return result;
    },
  });
  const { parseLicenseCsv } = await server.ssrLoadModule('/src/pipeline/parse-license-csv.ts');
  const collection = await collectSeoulArchive({
    stagingRoot,
    fetchedAt: new Date().toISOString(),
    limits: DEFAULT_COLLECTOR_LIMITS,
  });
  if (collection.kind !== 'accepted') {
    console.log(
      JSON.stringify({
        kind: 'observation-rejected',
        code: collection.code,
        message: collection.message,
      }),
    );
    process.exitCode = 1;
  } else {
    collection.fetchedAt = new Date().toISOString();
    const archiveContract = JSON.parse(
      await readFile('src/pipeline/contracts/seoul-archive-contract.json', 'utf8'),
    );
    const checkHash = async () => {
      const digest = createHash('sha256');
      for await (const bytes of createReadStream(collection.archivePath)) digest.update(bytes);
      if (digest.digest('hex') !== collection.sha256)
        throw new Error('Observation archive changed');
    };
    await checkHash();
    const entries = [];
    let complete = true;
    let parsedRowCount = 0;
    for (const entry of archiveContract.entries) {
      const begin = performance.now();
      const extracted = await runProcess({
        executable: 'unzip',
        args: [...UTF8_UNZIP_OPTIONS, '-p', collection.archivePath, entry.entryName],
        maxOutputBytes: resourceLimits.maxEntryBytes,
        timeoutMs: resourceLimits.entryTimeoutMs,
      });
      if (extracted.exitCode !== 0 || extracted.truncated)
        throw new Error('Incomplete observation extraction');
      let parsed = null;
      let parseError = null;
      try {
        parsed = parseLicenseCsv(
          extracted.stdout,
          entry,
          resourceLimits.maxTotalRows - parsedRowCount,
        );
        parsedRowCount += parsed.length;
      } catch (error) {
        parseError = error.code ?? error.message;
        complete = false;
      }
      entries.push({
        fileDataId: entry.fileDataId,
        bytes: extracted.stdout.length,
        rows: parsed?.length ?? null,
        completed: parsed !== null,
        parseError,
        sha256: createHash('sha256').update(extracted.stdout).digest('hex'),
        elapsedMs: Math.round(performance.now() - begin),
      });
      console.log(JSON.stringify({ kind: 'category-observed', ...entries.at(-1) }));
      // Retain only counts/hashes across categories, never all source rows simultaneously.
      parsed = null;
    }
    await checkHash();
    const { archivePath: _privatePath, ...collectionEvidence } = collection;
    const report = {
      version: 2,
      kind: 'parser-inventory-observation',
      complete,
      publicationApproved: false,
      sourceDataAsOf: null,
      collection: collectionEvidence,
      resourceLimits,
      entries,
      parsedRowCount,
      validation: null,
      validationNotRunReason:
        'Full-candidate retention exceeded the 6144 MiB research heap; this inventory does not establish transformation, quality metrics or a baseline.',
      elapsedMs: Math.round(performance.now() - started),
      maxRssKiB: process.resourceUsage().maxRSS,
    };
    const bytes = Buffer.from(JSON.stringify(report));
    console.log(`OBSERVATION_SHA256 ${createHash('sha256').update(bytes).digest('hex')}`);
    const encoded = bytes.toString('base64');
    for (let offset = 0; offset < encoded.length; offset += 8000)
      console.log(`OBSERVATION_CHUNK ${encoded.slice(offset, offset + 8000)}`);
    console.log('OBSERVATION_END');
    if (!complete) process.exitCode = 1;
  }
} finally {
  await server.close();
  await rm(stagingRoot, { recursive: true, force: true });
}
