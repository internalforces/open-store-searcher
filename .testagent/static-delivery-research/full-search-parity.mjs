// Complete-source correctness check. Timings are not browser performance claims.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createServer } from 'vite';
const root = process.argv[2];
const report = JSON.parse(await readFile(join(root, 'measurement.json'), 'utf8'));
const queries = ['강남구', '스타벅스', '테헤란로 123', '龘靐齉爩'];
const server = await createServer({
  configFile: false,
  logLevel: 'error',
  server: { middlewareMode: true, watch: null, ws: false },
});
try {
  const { loadCompactSnapshot } = await server.ssrLoadModule('/src/shared/load-compact-data.ts');
  const { columnValue } = await server.ssrLoadModule('/src/shared/compact-data.ts');
  const { CompactSearch } = await server.ssrLoadModule('/src/search/compact-search.ts');
  const { createSearchIndex, searchCandidates } = await server.ssrLoadModule(
    '/src/search/search-candidates.ts',
  );
  const snapshot = await loadCompactSnapshot(
    await readFile(join(root, report.manifestEntry.name)),
    report.manifestEntry.sha256,
    (name) => readFile(join(root, name)),
  );
  const store = new CompactSearch(snapshot.manifest, snapshot.blocks, snapshot.dictionaries);
  await store.prepare();
  const reduce = (m) => ({
    id: m.record.id,
    score: m.score,
    confidence: m.confidence,
    nameMatch: m.nameMatch,
    addressMatch: m.addressMatch,
    reasons: m.reasons,
  });
  const expected = queries.map(() => ({ eligible: [], similar: [] }));
  for (const block of snapshot.blocks.filter((b) => b.role === 'search')) {
    const records = Array.from({ length: block.count }, (_, row) => {
      const v = block.columns.map((c) => columnValue(c, row, snapshot.dictionaries));
      return { id: v[0], name: v[1], roadAddress: v[2], parcelAddress: v[3] };
    });
    const index = createSearchIndex(records);
    for (let q = 0; q < queries.length; q++) {
      const r = searchCandidates(index, queries[q]);
      // Oracle Top-3 alone is insufficient to combine eligible ties across blocks. All current
      // district/name/partial/absent probes have zero eligible matches; assert that condition.
      assert.equal(r.eligibleCount, 0);
      expected[q].similar.push(...r.similarCandidates.map(reduce));
    }
  }
  const compare = (a, b) =>
    Number(a.reasons.some((r) => r.startsWith('address_conflict:'))) -
      Number(b.reasons.some((r) => r.startsWith('address_conflict:'))) ||
    b.score - a.score ||
    (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  const results = [];
  for (let q = 0; q < queries.length; q++) {
    const oracle = expected[q].similar.sort(compare);
    await store.search(queries[q]);
    let count = 0;
    const hash = createHash('sha256');
    const first = store.page(0);
    assert.equal(first.eligibleCount, 0);
    assert.equal(first.similarCount, oracle.length);
    assert.equal(first.ambiguousTop, false);
    assert.equal(first.primaryMatch, null);
    for (let page = 0; page < Math.max(1, Math.ceil(oracle.length / 20)); page++) {
      const actual = store.page(page);
      assert.equal(actual.page, page);
      for (const match of actual.similarCandidates) {
        const reduced = reduce(match);
        assert.deepEqual(reduced, oracle[count++]);
        hash.update(JSON.stringify(reduced) + '\n');
      }
    }
    assert.equal(count, oracle.length);
    results.push({
      query: queries[q],
      completeSimilarCount: count,
      rankedFieldsSha256: hash.digest('hex'),
      eligibleCount: 0,
      allFieldsEqual: true,
    });
    console.log(JSON.stringify(results.at(-1)));
  }
  assert.equal(results.at(-1).completeSimilarCount, 0);
  await writeFile(
    join(root, 'full-search-parity.json'),
    JSON.stringify(
      {
        recordCount: store.recordCount,
        source: report.source,
        manifestSha256: report.manifestEntry.sha256,
        results,
        publicationApproved: false,
      },
      null,
      2,
    ) + '\n',
  );
} finally {
  await server.close();
}
