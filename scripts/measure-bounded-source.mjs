// Local research replay only. Requires bytes already matched to a successful Ubuntu observation.
// Python ZIP extraction is a diagnostic adapter; it never replaces the approved production collector.
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createServer } from 'vite';

const [archivePath, outputPath] = process.argv.slice(2);
if (!archivePath || !outputPath || process.argv.length !== 4)
  throw new Error(
    'Usage: node scripts/measure-bounded-source.mjs OBSERVED-archive.zip NEW-research-directory',
  );
const receipt = JSON.parse(
  await readFile('reports/observation-2026-09-12-parser-inventory.json', 'utf8'),
);
const checkHash = async () => {
  const hash = createHash('sha256');
  for await (const bytes of createReadStream(archivePath)) hash.update(bytes);
  if (hash.digest('hex') !== receipt.collection.sha256)
    throw new Error('Archive differs from observed bytes');
};
await checkHash();
const vite = await createServer({
  configFile: false,
  appType: 'custom',
  logLevel: 'error',
  server: { middlewareMode: true, watch: null, ws: false },
});
const implementationSha256 = {};
for (const path of [
  'scripts/measure-bounded-source.mjs',
  'src/pipeline/stage-bounded-release.ts',
  'src/pipeline/validate-license-refresh.ts',
  'src/pipeline/refresh-validation-metrics.ts',
  'src/pipeline/transform-license-records.ts',
  'src/pipeline/parse-license-csv.ts',
  'src/pipeline/decode-csv.ts',
])
  implementationSha256[path] = createHash('sha256')
    .update(await readFile(path))
    .digest('hex');
const started = performance.now();
try {
  const { runProcess } = await vite.ssrLoadModule('/src/pipeline/unzip-archive.ts');
  const { iterateLicenseCsv } = await vite.ssrLoadModule('/src/pipeline/parse-license-csv.ts');
  const { observeBoundedRelease } = await vite.ssrLoadModule(
    '/src/pipeline/stage-bounded-release.ts',
  );
  const archiveContract = JSON.parse(
    await readFile('src/pipeline/contracts/seoul-archive-contract.json', 'utf8'),
  );
  const permissionManifest = JSON.parse(
    await readFile('reports/source-permission-manifest-2026-08-28.json', 'utf8'),
  );
  let rows = 0;
  async function* categories() {
    for (const entry of archiveContract.entries) {
      const result = await runProcess({
        executable: 'python',
        args: [
          '-c',
          'import sys,zipfile; z=zipfile.ZipFile(sys.argv[1]); i=next(i for i in z.infolist() if (i.filename if i.flag_bits & 2048 else i.filename.encode("cp437").decode("utf-8"))==sys.argv[2]); sys.stdout.buffer.write(z.read(i))',
          resolve(archivePath),
          entry.entryName,
        ],
        maxOutputBytes: receipt.resourceLimits.maxEntryBytes,
        timeoutMs: 120000,
      });
      if (result.exitCode !== 0 || result.truncated)
        throw new Error('Incomplete research extraction');
      function* iterate() {
        for (const row of iterateLicenseCsv(
          result.stdout,
          entry,
          receipt.resourceLimits.maxTotalRows - rows,
        )) {
          rows++;
          yield row;
        }
      }
      yield { entry, rows: iterate() };
      console.log(
        JSON.stringify({
          kind: 'category-transformed',
          fileDataId: entry.fileDataId,
          totalRows: rows,
          maxRssKiB: process.resourceUsage().maxRSS,
        }),
      );
    }
    await checkHash();
  }
  const result = await observeBoundedRelease(
    {
      dateBasis: 'collection',
      collection: { ...receipt.collection, archivePath: resolve(archivePath) },
      archiveContract,
      permissionManifest,
      now: new Date().toISOString(),
    },
    categories(),
    resolve(outputPath),
  );
  const resource = {
    kind: 'local-bounded-replay',
    implementationSha256,
    platform: process.platform,
    node: process.version,
    publicationApproved: false,
    archiveSha256: receipt.collection.sha256,
    rows,
    elapsedMs: Math.round(performance.now() - started),
    maxRssKiB: process.resourceUsage().maxRSS,
  };
  await writeFile(join(result.outputDirectory, 'resources.json'), `${JSON.stringify(resource)}\n`, {
    flag: 'wx',
  });
  console.log(JSON.stringify(resource));
} finally {
  await vite.close();
}
