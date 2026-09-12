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
  const { collectSeoulArchive } = await server.ssrLoadModule(
    '/src/pipeline/collect-seoul-archive.ts',
  );
  const { DEFAULT_COLLECTOR_LIMITS } = await server.ssrLoadModule(
    '/src/pipeline/collector-types.ts',
  );
  const { runProcess } = await server.ssrLoadModule('/src/pipeline/unzip-archive.ts');
  const { parseLicenseCsv } = await server.ssrLoadModule('/src/pipeline/parse-license-csv.ts');
  const { validateLicenseRefreshV1 } = await server.ssrLoadModule(
    '/src/pipeline/validate-license-refresh.ts',
  );
  const collection = await collectSeoulArchive({
    stagingRoot,
    fetchedAt: new Date().toISOString(),
    limits: DEFAULT_COLLECTOR_LIMITS,
  });
  if (collection.kind !== 'accepted') {
    console.log(JSON.stringify({ kind: 'observation-rejected', code: collection.code }));
    process.exitCode = 1;
  } else {
    collection.fetchedAt = new Date().toISOString();
    const archiveContract = JSON.parse(
      await readFile('src/pipeline/contracts/seoul-archive-contract.json', 'utf8'),
    );
    const permissionManifest = JSON.parse(
      await readFile('reports/source-permission-manifest-2026-08-28.json', 'utf8'),
    );
    const checkHash = async () => {
      const digest = createHash('sha256');
      for await (const bytes of createReadStream(collection.archivePath)) digest.update(bytes);
      if (digest.digest('hex') !== collection.sha256)
        throw new Error('Observation archive changed');
    };
    await checkHash();
    const rows = [],
      ingestion = [],
      entries = [];
    for (const entry of archiveContract.entries) {
      const begin = performance.now();
      const extracted = await runProcess({
        executable: 'unzip',
        args: ['-p', collection.archivePath, entry.entryName],
        maxOutputBytes: resourceLimits.maxEntryBytes,
        timeoutMs: resourceLimits.entryTimeoutMs,
      });
      if (extracted.exitCode !== 0 || extracted.truncated)
        throw new Error('Incomplete observation extraction');
      const parsed = parseLicenseCsv(
        extracted.stdout,
        entry,
        resourceLimits.maxTotalRows - rows.length,
      );
      for (const row of parsed) rows.push(row);
      ingestion.push({
        fileDataId: entry.fileDataId,
        entryName: entry.entryName,
        headers: entry.headers,
        completed: true,
        rowCount: parsed.length,
        archiveSha256: collection.sha256,
      });
      entries.push({
        fileDataId: entry.fileDataId,
        bytes: extracted.stdout.length,
        rows: parsed.length,
        elapsedMs: Math.round(performance.now() - begin),
      });
      console.log(JSON.stringify({ kind: 'category-observed', ...entries.at(-1) }));
    }
    await checkHash();
    // Missing policy/baseline deliberately keeps the validator in review_required.
    const result = validateLicenseRefreshV1({
      dateBasis: 'collection',
      collection,
      archiveContract,
      permissionManifest,
      rows,
      ingestion,
      now: new Date().toISOString(),
    });
    const { archivePath: _privatePath, ...collectionEvidence } = collection;
    const report = {
      version: 1,
      kind: 'quality-observation',
      publicationApproved: false,
      sourceDataAsOf: null,
      collection: collectionEvidence,
      resourceLimits,
      entries,
      validation: result,
      elapsedMs: Math.round(performance.now() - started),
      maxRssKiB: process.resourceUsage().maxRSS,
    };
    if (result.kind === 'accepted')
      throw new Error('Observation unexpectedly approved publication');
    const bytes = Buffer.from(JSON.stringify(report));
    console.log(`OBSERVATION_SHA256 ${createHash('sha256').update(bytes).digest('hex')}`);
    const encoded = bytes.toString('base64');
    for (let offset = 0; offset < encoded.length; offset += 8000)
      console.log(`OBSERVATION_CHUNK ${encoded.slice(offset, offset + 8000)}`);
    console.log('OBSERVATION_END');
    if (result.kind === 'rejected' || !result.metrics) process.exitCode = 1;
  }
} finally {
  await server.close();
  await rm(stagingRoot, { recursive: true, force: true });
}
