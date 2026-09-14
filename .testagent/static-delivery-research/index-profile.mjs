// Research-only full-corpus exact-key postings; not a completeness-proven retrieval path.

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import { open, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { createGzip } from 'node:zlib';
import { createServer } from 'vite';

const root = process.argv[2];
const report = JSON.parse(await readFile(join(root, 'profile.json'), 'utf8'));
const vite = await createServer({
  configFile: false,
  appType: 'custom',
  logLevel: 'error',
  server: { middlewareMode: true, watch: null, ws: false },
});
const { projectSearchText } = await vite.ssrLoadModule('/src/search/prepare-search-query.ts');
const maps = [new Map(), new Map()];
let rows = 0;
const started = performance.now();
for (const b of report.variants.tuples.blocks.filter((b) => b.role === 'search')) {
  const bytes = await readFile(join(root, 'tuples', b.name));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), b.sha256);
  const data = JSON.parse(bytes);
  for (const [_id, name, road, parcel] of data.rows) {
    const keys = [
      projectSearchText(name).nameKey,
      ...[road, parcel].map((s) =>
        projectSearchText(s)
          .addressTokens.map((t) =>
            ['서울', '서울시', '서울특별시'].includes(t) ? '서울특별시' : t,
          )
          .join(' '),
      ),
    ];
    for (const [j, strings] of [
      [0, [keys[0]]],
      [1, [...new Set(keys.slice(1))]],
    ])
      for (const key of strings) {
        if (!key) continue;
        let posting = maps[j].get(key);
        if (!posting) {
          posting = [];
          maps[j].set(key, posting);
        }
        posting.push(rows);
      }
    rows++;
  }
  if (rows % 262144 === 0)
    console.log(
      JSON.stringify({
        rows,
        elapsedMs: Math.round(performance.now() - started),
        rss: process.memoryUsage().rss,
      }),
    );
}
assert.equal(rows, report.input.recordCount);
const measured = [];
for (let j = 0; j < maps.length; j++) {
  const path = join(root, j === 0 ? 'exact-name-index.json' : 'exact-address-index.json');
  const file = await open(path, 'wx');
  const hash = createHash('sha256');
  let bytes = 0,
    postings = 0,
    maxPosting = 0,
    first = true,
    buffer = '[';
  const flush = async () => {
    hash.update(buffer);
    bytes += Buffer.byteLength(buffer);
    await file.writeFile(buffer);
    buffer = '';
  };
  for (const [key, list] of maps[j]) {
    postings += list.length;
    maxPosting = Math.max(maxPosting, list.length);
    buffer += (first ? '' : ',') + JSON.stringify([key, list]);
    first = false;
    if (buffer.length > 1048576) await flush();
  }
  buffer += ']\n';
  await flush();
  await file.close();
  await pipeline(
    createReadStream(path),
    createGzip(),
    createWriteStream(`${path}.gz`, { flags: 'wx' }),
  );
  const packed = await readFile(`${path}.gz`);
  measured.push({
    kind: j === 0 ? 'exact-name' : 'exact-address-key',
    distinct: maps[j].size,
    postings,
    maxPosting,
    bytes,
    gzipBytes: packed.length,
    sha256: hash.digest('hex'),
  });
  maps[j].clear();
}
await vite.close();
const result = {
  kind: 'research-only-exact-postings-profile',
  source: report.input,
  rows,
  elapsedMs: Math.round(performance.now() - started),
  peakRssKiB: process.resourceUsage().maxRSS,
  indexes: measured,
  completeRetrieval: false,
  substringStrategy:
    'No added substring postings; complete local scan remains required. Scanning distinct normalized keys can reduce repeated name comparisons without dropping containment in either direction; component-address relevance still needs a complete fallback.',
};
await writeFile(join(root, 'index-profile.json'), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result));
