// Trusted operator inputs only. Never use PR artifacts or fabricate missing review evidence.
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { readFile, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createServer } from 'vite';

const [configPath, outputPath, mode] = process.argv.slice(2);
if (
  !configPath ||
  !outputPath ||
  process.argv.length > 5 ||
  (mode !== undefined && mode !== '--bootstrap')
)
  throw new Error(
    'Usage: node scripts/stage-refresh.mjs reviewed-config.json NEW-output-directory',
  );
const config = JSON.parse(await readFile(configPath, 'utf8'));
if (!config.policy)
  throw new Error(
    'Publication requires reviewed policy and baseline; collection date does not waive quality gates.',
  );
for (const key of ['maxEntryBytes', 'maxTotalRows', 'entryTimeoutMs'])
  if (!Number.isSafeInteger(config[key]) || config[key] <= 0)
    throw new Error(`Explicit ${key} required`);
const stagingRoot = await mkdtemp(join(tmpdir(), 'open-store-refresh-'));
const server = await createServer({
  configFile: false,
  appType: 'custom',
  logLevel: 'error',
  server: { middlewareMode: true, watch: null, ws: false },
});
try {
  const { readDeployedBaseline } = await server.ssrLoadModule(
    '/src/pipeline/read-deployed-baseline.ts',
  );
  const baseline =
    mode === '--bootstrap'
      ? config.baseline
      : await readDeployedBaseline(config.previousReleaseUrl, config.policy.maxJsonBytes);
  if (baseline?.dateBasis !== 'collection')
    throw new Error('Reviewed collection-date baseline required');
  const { collectSeoulArchive } = await server.ssrLoadModule(
    '/src/pipeline/collect-seoul-archive.ts',
  );
  const { DEFAULT_COLLECTOR_LIMITS } = await server.ssrLoadModule(
    '/src/pipeline/collector-types.ts',
  );
  const { runProcess, UTF8_UNZIP_OPTIONS } = await server.ssrLoadModule(
    '/src/pipeline/unzip-archive.ts',
  );
  const { parseLicenseCsv } = await server.ssrLoadModule('/src/pipeline/parse-license-csv.ts');
  const { stageValidatedRelease } = await server.ssrLoadModule(
    '/src/pipeline/stage-validated-release.ts',
  );
  const collection = await collectSeoulArchive({
    stagingRoot,
    previousAcceptedSha256: baseline.archiveSha256,
    fetchedAt: new Date().toISOString(),
    limits: DEFAULT_COLLECTOR_LIMITS,
  });
  if (collection.kind !== 'accepted') throw new Error(`Collection rejected: ${collection.code}`);
  collection.fetchedAt = new Date().toISOString();
  const archiveContract = JSON.parse(
    await readFile('src/pipeline/contracts/seoul-archive-contract.json', 'utf8'),
  );
  const permissionManifest = JSON.parse(
    await readFile('reports/source-permission-manifest-2026-08-28.json', 'utf8'),
  );
  const rows = [],
    ingestion = [];
  const hashArchive = async () => {
    const hash = createHash('sha256');
    for await (const chunk of createReadStream(collection.archivePath)) hash.update(chunk);
    if (hash.digest('hex') !== collection.sha256) throw new Error('Staged archive hash changed');
  };
  await hashArchive();
  for (const entry of archiveContract.entries) {
    const result = await runProcess({
      executable: 'unzip',
      args: [...UTF8_UNZIP_OPTIONS, '-p', collection.archivePath, entry.entryName],
      maxOutputBytes: config.maxEntryBytes,
      timeoutMs: config.entryTimeoutMs,
    });
    if (result.exitCode !== 0 || result.truncated)
      throw new Error('Incomplete category extraction');
    const categoryRows = parseLicenseCsv(result.stdout, entry, config.maxTotalRows - rows.length);
    for (const row of categoryRows) rows.push(row);
    ingestion.push({
      fileDataId: entry.fileDataId,
      entryName: entry.entryName,
      headers: entry.headers,
      completed: true,
      rowCount: categoryRows.length,
      archiveSha256: collection.sha256,
    });
  }
  await hashArchive();
  await stageValidatedRelease(
    {
      dateBasis: 'collection',
      collection,
      archiveContract,
      permissionManifest,
      rows,
      ingestion,
      policy: config.policy,
      baseline,
      now: new Date().toISOString(),
    },
    resolve(outputPath),
  );
  if (process.env.GITHUB_OUTPUT)
    await writeFile(process.env.GITHUB_OUTPUT, `source_change=${collection.change}\n`, {
      flag: 'a',
    });
  console.log(
    JSON.stringify({
      kind: 'staged',
      change: collection.change,
      dateBasis: 'collection',
      sourceDataAsOf: null,
      records: rows.length,
    }),
  );
} finally {
  await server.close();
  await rm(stagingRoot, { recursive: true, force: true });
}
