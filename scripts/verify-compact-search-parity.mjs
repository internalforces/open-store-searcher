// Compare fixed complete-source queries against a separately frozen original implementation.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { createServer } from 'vite';

const [siteArgument, originalArgument, reportArgument] = process.argv.slice(2);
assert(
  siteArgument && originalArgument && reportArgument && process.argv.length === 5,
  'Usage: node --expose-gc scripts/verify-compact-search-parity.mjs VERIFIED-SITE FROZEN-ORIGINAL-SOURCE NEW-REPORT.json',
);
const site = resolve(siteArgument);
const original = resolve(originalArgument);
const reportPath = resolve(reportArgument);
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const options = {
  configFile: false,
  appType: 'custom',
  logLevel: 'error',
  server: { middlewareMode: true, watch: null, ws: false },
};
const currentServer = await createServer(options);
const originalServer = await createServer({ ...options, root: original });
const districts = [
  '종로구',
  '중구',
  '용산구',
  '성동구',
  '광진구',
  '동대문구',
  '중랑구',
  '성북구',
  '강북구',
  '도봉구',
  '노원구',
  '은평구',
  '서대문구',
  '마포구',
  '양천구',
  '강서구',
  '구로구',
  '금천구',
  '영등포구',
  '동작구',
  '관악구',
  '서초구',
  '강남구',
  '송파구',
  '강동구',
];
const queries = [
  ...districts,
  ...districts.map((district) => `서울특별시 ${district}`),
  '스타벅스',
  '테헤란로',
  '龘靐齉爩',
  '스타벅스 서울특별시 강남구 테헤란로 123',
  '테헤란로 12-3',
];
const report = {
  version: 1,
  kind: 'complete-source-original-current-parity',
  node: process.version,
  recordedAt: new Date().toISOString(),
  publicationApproved: false,
  physicalDeviceVerified: false,
  queries: [],
  codeBindings: {},
  limitations: [
    'Offline Node equivalence and timing only; no browser/network/mobile acceptance.',
    'One preparation per implementation, original first; order/JIT/GC effects are not isolated.',
  ],
};
for (const name of [
  'src/search/compact-search.ts',
  'src/search/compare-search-address.ts',
  'src/search/prepare-search-query.ts',
  'src/search/search-candidates.ts',
  'src/shared/compact-data.ts',
  'src/shared/load-compact-data.ts',
]) {
  report.codeBindings[name] = {
    original: hash(await readFile(join(original, name))),
    current: hash(await readFile(name)),
  };
}
function identity(store, query) {
  const state = store.state;
  const vector = (values) =>
    hash(new Uint8Array(values.buffer, values.byteOffset, values.byteLength));
  const last = Math.max(0, Math.ceil(state.similarOrdinals.length / 20) - 1);
  return {
    query,
    eligibleCount: state.eligibleOrdinals.length,
    similarCount: state.similarOrdinals.length,
    eligibleVectorSha256: vector(state.eligibleOrdinals),
    similarVectorSha256: vector(state.similarOrdinals),
    pages: [...new Set([0, Math.floor(last / 2), last])].map((page) => ({
      page,
      sha256: hash(JSON.stringify(store.page(page))),
    })),
  };
}
let originalStore;
let currentStore;
try {
  const { loadCompactSnapshot } = await currentServer.ssrLoadModule(
    '/src/shared/load-compact-data.ts',
  );
  const OriginalSearch = (await originalServer.ssrLoadModule('/src/search/compact-search.ts'))
    .CompactSearch;
  const CurrentSearch = (await currentServer.ssrLoadModule('/src/search/compact-search.ts'))
    .CompactSearch;
  const release = JSON.parse(await readFile(join(site, 'release.json'), 'utf8'));
  const entry = release.entries.find((e) => e.name.includes('compact-manifest-'));
  assert(entry);
  const snapshot = await loadCompactSnapshot(
    await readFile(join(site, entry.name)),
    entry.sha256,
    (name) => readFile(join(site, name)),
  );
  assert.equal(snapshot.manifest.recordCount, 2951024);
  report.recordCount = snapshot.manifest.recordCount;
  report.manifestSha256 = entry.sha256;
  report.orderedSourceIdsSha256 = snapshot.manifest.orderedIdsSha256;
  originalStore = new OriginalSearch(snapshot.manifest, snapshot.blocks, snapshot.dictionaries);
  const originalStart = performance.now();
  await originalStore.prepare();
  report.originalPrepareMs = performance.now() - originalStart;
  for (const query of queries) {
    await originalStore.search(query);
    report.queries.push({ original: identity(originalStore, query) });
  }
  originalStore = null;
  globalThis.gc?.();
  console.log(
    JSON.stringify({
      phase: 'original-complete',
      queries: queries.length,
      prepareMs: report.originalPrepareMs,
    }),
  );
  currentStore = new CurrentSearch(snapshot.manifest, snapshot.blocks, snapshot.dictionaries);
  const currentStart = performance.now();
  await currentStore.prepare();
  report.currentPrepareMs = performance.now() - currentStart;
  for (let index = 0; index < queries.length; index++) {
    const query = queries[index];
    await currentStore.search(query);
    const current = identity(currentStore, query);
    assert.deepEqual(current, report.queries[index].original, query);
    report.queries[index].current = current;
    if (query === '龘靐齉爩') assert.equal(current.eligibleCount + current.similarCount, 0);
  }
  report.allEqual = true;
  await writeFile(reportPath, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
  console.log(
    JSON.stringify({
      phase: 'complete',
      queryCount: queries.length,
      originalPrepareMs: report.originalPrepareMs,
      currentPrepareMs: report.currentPrepareMs,
      allEqual: true,
    }),
  );
} finally {
  originalStore = null;
  currentStore = null;
  await originalServer.close();
  await currentServer.close();
}
