// Offline fixed-fixture diagnostics only. No network, collection or publication authority.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { Session } from 'node:inspector';
import { cpus } from 'node:os';
import { join, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { createServer } from 'vite';

const [siteArgument, outputArgument] = process.argv.slice(2);
assert(
  siteArgument && outputArgument && process.argv.length === 4,
  'Usage: node --expose-gc scripts/profile-compact-search.mjs VERIFIED-SITE NEW-REPORT.json',
);
const site = resolve(siteArgument);
const output = resolve(outputArgument);
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const report = {
  version: 1,
  kind: 'offline-compact-cpu-allocation-diagnostic',
  recordedAt: new Date().toISOString(),
  runtime: { node: process.version, platform: process.platform, cpu: cpus()[0].model },
  physicalDeviceVerified: false,
  publicationApproved: false,
  profiles: {},
  searches: [],
  codeBindings: {},
  limitations: [
    'Node CPU/allocation diagnostics are not browser, Worker, hosted or physical-mobile acceptance.',
    'Sampling profiles perturb timing; unprofiled repetitions are reported separately.',
    'Heap sampling and process snapshots are not peak or total browser memory.',
    'Retained original compact inputs are hash-validated; no source collection is repeated.',
  ],
};
for (const path of [
  'src/search/compact-search.ts',
  'src/search/compare-search-address.ts',
  'src/search/prepare-search-query.ts',
  'src/search/search-candidates.ts',
  'src/shared/load-compact-data.ts',
  'src/shared/compact-data.ts',
  'scripts/profile-compact-search.mjs',
]) {
  const bytes = await readFile(path);
  report.codeBindings[path] = { bytes: bytes.length, sha256: hash(bytes) };
}
const server = await createServer({
  configFile: false,
  appType: 'custom',
  logLevel: 'error',
  server: { middlewareMode: true, watch: null, ws: false },
});
const session = new Session();
session.connect();
const post = (method, params = {}) =>
  new Promise((done, reject) =>
    session.post(method, params, (error, result) => (error ? reject(error) : done(result))),
  );
const gcMemory = () => {
  globalThis.gc?.();
  return process.memoryUsage();
};
const frame = (callFrame) => ({
  function: callFrame.functionName,
  url: callFrame.url,
  line: callFrame.lineNumber + 1,
});
function summarizeCpu(profile) {
  const nodes = new Map(profile.nodes.map((node) => [node.id, node]));
  const totals = new Map();
  for (let index = 0; index < profile.samples.length; index++) {
    const id = profile.samples[index];
    totals.set(id, (totals.get(id) ?? 0) + profile.timeDeltas[index]);
  }
  return [...totals]
    .map(([id, us]) => ({ ...frame(nodes.get(id).callFrame), selfMs: us / 1000 }))
    .sort((a, b) => b.selfMs - a.selfMs)
    .slice(0, 35);
}
function summarizeHeap(node, rows = []) {
  if (node.selfSize) rows.push({ ...frame(node.callFrame), bytes: node.selfSize });
  for (const child of node.children) summarizeHeap(child, rows);
  return rows.sort((a, b) => b.bytes - a.bytes).slice(0, 30);
}
async function profile(label, action, heap = false) {
  await post('Profiler.enable');
  if (heap) {
    await post('HeapProfiler.enable');
    await post('HeapProfiler.startSampling', { samplingInterval: 524288 });
  }
  await post('Profiler.start');
  const started = performance.now();
  await action();
  const elapsedMs = performance.now() - started;
  const { profile: cpu } = await post('Profiler.stop');
  const cpuBytes = JSON.stringify(cpu);
  await writeFile(output + '.' + label + '.cpuprofile', cpuBytes, { flag: 'wx' });
  const result = { elapsedMs, cpuSha256: hash(cpuBytes), cpuSelf: summarizeCpu(cpu) };
  if (heap) {
    const { profile: allocation } = await post('HeapProfiler.stopSampling');
    const bytes = JSON.stringify(allocation);
    await writeFile(output + '.' + label + '.heapprofile', bytes, { flag: 'wx' });
    result.allocationSha256 = hash(bytes);
    result.retainedSampledAllocations = summarizeHeap(allocation.head);
  }
  report.profiles[label] = result;
  console.log(JSON.stringify({ phase: label, elapsedMs, topCpu: result.cpuSelf.slice(0, 4) }));
}
try {
  const { loadCompactSnapshot } = await server.ssrLoadModule('/src/shared/load-compact-data.ts');
  const { CompactSearch } = await server.ssrLoadModule('/src/search/compact-search.ts');
  const release = JSON.parse(await readFile(join(site, 'release.json'), 'utf8'));
  const entry = release.entries.find((e) => e.name.includes('compact-manifest-'));
  assert(entry);
  report.manifestSha256 = entry.sha256;
  report.sourceArchiveSha256 = release.archiveSha256;
  report.beforeLoad = gcMemory();
  const loadStart = performance.now();
  const snapshot = await loadCompactSnapshot(
    await readFile(join(site, entry.name)),
    entry.sha256,
    (name) => readFile(join(site, name)),
  );
  report.loadMs = performance.now() - loadStart;
  assert.equal(snapshot.manifest.recordCount, 2951024);
  report.recordCount = snapshot.manifest.recordCount;
  report.afterLoad = gcMemory();
  console.log(
    JSON.stringify({
      phase: 'validated-load',
      loadMs: report.loadMs,
      recordCount: report.recordCount,
    }),
  );
  const store = new CompactSearch(snapshot.manifest, snapshot.blocks, snapshot.dictionaries);
  await profile('prepare', () => store.prepare(), true);
  report.afterPrepare = gcMemory();
  report.projectionCounts = {
    names: store.nameProjections.length,
    addresses: store.addressProjections.length,
  };
  const fixtures = [
    { id: 'district', query: '강남구' },
    { id: 'name', query: '스타벅스' },
    { id: 'address', query: '테헤란로' },
    { id: 'zero-candidate', query: '龘靐齉爩' },
    { id: 'mixed', query: '스타벅스 서울특별시 강남구 테헤란로 123' },
  ];
  for (const fixture of fixtures) {
    await profile('search-' + fixture.id, () => store.search(fixture.query));
    const samples = [];
    for (let iteration = 0; iteration < 3; iteration++) {
      const start = performance.now();
      await store.search(fixture.query);
      const page = store.page(0);
      samples.push({
        searchAndPageMs: performance.now() - start,
        eligibleCount: page.eligibleCount,
        similarCount: page.similarCount,
      });
      if (fixture.id === 'zero-candidate') assert.equal(page.eligibleCount + page.similarCount, 0);
    }
    const state = store.state;
    const vectorHash = (values) =>
      hash(new Uint8Array(values.buffer, values.byteOffset, values.byteLength));
    const pageHashes = [
      0,
      Math.floor(Math.max(0, Math.ceil(state.similarOrdinals.length / 20) - 1) / 2),
      Math.max(0, Math.ceil(state.similarOrdinals.length / 20) - 1),
    ].map((page) => ({ page, sha256: hash(JSON.stringify(store.page(page))) }));
    const result = {
      fixture: fixture.id,
      query: fixture.query,
      samples,
      eligibleVectorSha256: vectorHash(state.eligibleOrdinals),
      similarVectorSha256: vectorHash(state.similarOrdinals),
      pageHashes,
    };
    report.searches.push(result);
    console.log(JSON.stringify({ phase: 'unprofiled-search', ...result }));
  }
  report.afterSearch = gcMemory();
  await writeFile(output, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
  console.log(JSON.stringify({ phase: 'complete', report: output }));
} finally {
  session.disconnect();
  await server.close();
}
