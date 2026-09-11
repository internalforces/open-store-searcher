import { createHash } from 'node:crypto';
import { readFile, realpath, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { createServer } from 'vite';

// Offline only: generated fixtures, no collector, fetch, provider records, or publication.
const repository = await realpath(fileURLToPath(new URL('../', import.meta.url)));
const { values } = parseArgs({
  options: {
    staging: { type: 'string' },
    output: { type: 'string' },
    rows: { type: 'string' },
    profile: { type: 'string' },
  },
});
const external = (path) => {
  const rel = relative(repository, path);
  return rel === '..' || rel.startsWith('../') || isAbsolute(rel);
};
if (
  !values.staging ||
  !values.output ||
  !isAbsolute(values.staging) ||
  !isAbsolute(values.output) ||
  !external(await realpath(values.staging)) ||
  !external(await realpath(dirname(values.output))) ||
  !['short', 'long'].includes(values.profile) ||
  !/^[1-9]\d*$/.test(values.rows ?? '')
)
  throw new Error('invalid_benchmark_arguments');
const longKeys = values.profile === 'long';
const target = Number(values.rows);
if (!Number.isSafeInteger(target) || target > (longKeys ? 5000 : 3000000))
  throw new Error('invalid_benchmark_arguments');
const paths = [
  'scripts/benchmark-research-index.mjs',
  'src/pipeline/research-index-store.ts',
  'src/pipeline/research-metrics-accumulator.ts',
  'src/pipeline/transform-license-records.ts',
  'src/pipeline/refresh-validation-metrics.ts',
  'src/pipeline/contracts/seoul-archive-contract.json',
];
const hashes = async () =>
  Object.fromEntries(
    await Promise.all(
      paths.map(async (path) => [
        path,
        createHash('sha256')
          .update(await readFile(`${repository}/${path}`))
          .digest('hex'),
      ]),
    ),
  );
const implementation = await hashes();
const server = await createServer({
  root: repository,
  configFile: false,
  appType: 'custom',
  logLevel: 'silent',
});
const { ResearchIndexStore, RESEARCH_STORAGE_LIMITS } = await server.ssrLoadModule(
  '/src/pipeline/research-index-store.ts',
);
const { ResearchMetricsAccumulator } = await server.ssrLoadModule(
  '/src/pipeline/research-metrics-accumulator.ts',
);
const { transformLicenseRecordsV2 } = await server.ssrLoadModule(
  '/src/pipeline/transform-license-records.ts',
);
const batchSize = 64,
  maxRssBytes = 3221225472,
  timeoutMs = 600000;
let store,
  rows = 0,
  peakRss = 0,
  peakHeap = 0,
  complete = false,
  code = null,
  metrics = null;
const start = performance.now();
const check = () => {
  const memory = process.memoryUsage();
  peakRss = Math.max(peakRss, memory.rss);
  peakHeap = Math.max(peakHeap, memory.heapUsed);
  if (
    memory.rss > maxRssBytes ||
    memory.heapUsed > RESEARCH_STORAGE_LIMITS.maxHeapBytes ||
    performance.now() - start >= timeoutMs
  )
    throw new Error('benchmark_budget_exceeded');
};
try {
  store = await ResearchIndexStore.create(values.staging, repository, check);
  const archiveContract = JSON.parse(
    await readFile(`${repository}/src/pipeline/contracts/seoul-archive-contract.json`, 'utf8'),
  );
  const entry = archiveContract.entries[0],
    ids = archiveContract.entries.map((e) => e.fileDataId);
  const accumulator = new ResearchMetricsAccumulator(ids, target, { deferIndexes: true });
  accumulator.beginCategory(entry.fileDataId);
  for (let offset = 0; offset < target; offset += batchSize) {
    check();
    const batch = Array.from({ length: Math.min(batchSize, target - offset) }, (_, j) => {
      const n = String(offset + j).padStart(8, '0');
      return {
        categoryFileDataId: entry.fileDataId,
        sourceFileDataUrl: `https://www.data.go.kr/data/${entry.fileDataId}/fileData.do`,
        values: {
          ...Object.fromEntries(entry.headers.map((h) => [h, null])),
          개방자치단체코드: '6110000',
          관리번호: `synthetic-management-${n}`,
          사업장명: longKeys ? 'x'.repeat(60000) + n : `synthetic-unique-business-${n}`,
          도로명주소: longKeys ? null : `synthetic-unique-road-address-${n}`,
          지번주소: longKeys ? null : `synthetic-unique-parcel-address-${n}`,
          영업상태코드: '01',
          영업상태명: '영업/정상',
        },
      };
    });
    await store.appendBatch(
      accumulator.addBatch(
        transformLicenseRecordsV2({
          archiveContract,
          archive: { sha256: 'a'.repeat(64), fetchedAt: '2026-09-04T00:00:00.000Z' },
          rows: batch,
        }),
      ),
    );
    rows += batch.length;
    check();
  }
  accumulator.endCategory();
  for (const id of ids.slice(1)) {
    accumulator.beginCategory(id);
    accumulator.endCategory();
  }
  const result = await accumulator.finishFromStore(store);
  check();
  if (JSON.stringify(implementation) !== JSON.stringify(await hashes()))
    throw new Error('benchmark_implementation_changed');
  metrics = {
    recordCount: result.total.recordCount,
    collisionGroupCount: result.total.collisionGroupCount,
  };
  complete = true;
} catch (error) {
  code = [
    'benchmark_budget_exceeded',
    'benchmark_implementation_changed',
    'observation_index_limit_exceeded',
    'observation_storage_space_exceeded',
  ].includes(error.message)
    ? error.message
    : 'benchmark_failed';
} finally {
  try {
    await store?.cleanup();
  } catch {
    complete = false;
    metrics = null;
    code = 'benchmark_cleanup_failed';
  }
  await server.close();
}
const report = {
  synthetic: true,
  complete,
  code,
  node: process.version,
  profile: values.profile,
  rows,
  distinctSearchKeys: rows * (longKeys ? 1 : 4),
  sourceNameCharacters: longKeys ? 60008 : 'synthetic-unique-business-00000000'.length,
  batchSize,
  retainedProviderRows: false,
  sampledPeakRssBytes: peakRss,
  sampledPeakHeapBytes: peakHeap,
  elapsedMs: Math.round(performance.now() - start),
  limits: { maxRows: target, maxRssBytes, timeoutMs, ...RESEARCH_STORAGE_LIMITS },
  storage: store?.statistics,
  metrics,
  implementation,
};
await writeFile(values.output, `${JSON.stringify(report, null, 2)}\n`, { flag: 'wx' });
console.log(JSON.stringify({ synthetic: true, complete, rows, code }));
process.exitCode = complete ? 0 : 1;
