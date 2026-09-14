// Research-only global evidence dictionaries, chosen by measured total serialized cost.

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const root = process.argv[2],
  report = JSON.parse(await readFile(join(root, 'profile.json'), 'utf8'));
const output = join(root, 'shared-columns');
await mkdir(output);
const started = performance.now();
const maps = Array.from({ length: 17 }, () => new Map()),
  values = Array.from({ length: 17 }, () => []),
  localBytes = Array(17).fill(0),
  refBytes = Array(17).fill(0);
const blocks = report.variants['dictionary-columns'].blocks.filter((b) => b.role === 'evidence');
const unpack = (c) => (c.dictionary ? c.refs.map((i) => c.dictionary[i]) : c.values);
for (const b of blocks) {
  const p = JSON.parse(await readFile(join(root, 'dictionary-columns', b.name), 'utf8'));
  for (let j = 0; j < 17; j++) {
    localBytes[j] += Buffer.byteLength(JSON.stringify(p.columns[j]));
    if (j === 14) continue;
    const refs = unpack(p.columns[j]).map((v) => {
      const k = JSON.stringify(v);
      if (!maps[j].has(k)) {
        maps[j].set(k, values[j].length);
        values[j].push(v);
      }
      return maps[j].get(k);
    });
    refBytes[j] += Buffer.byteLength(JSON.stringify({ shared: j, refs }));
  }
}
const selection = values.map(
  (v, j) => j !== 14 && Buffer.byteLength(JSON.stringify(v)) + refBytes[j] < localBytes[j],
);
const dictionaries = values.map((v, j) => (selection[j] ? v : null));
let bytes = 0,
  gzipBytes = 0,
  comparisons = 0;
const entries = [];
async function emit(name, p) {
  const b = Buffer.from(`${JSON.stringify(p)}\n`);
  await writeFile(join(output, name), b, { flag: 'wx' });
  bytes += b.length;
  const gz = gzipSync(b);
  gzipBytes += gz.length;
  entries.push({
    name,
    bytes: b.length,
    gzipBytes: gz.length,
    sha256: createHash('sha256').update(b).digest('hex'),
  });
}
await emit('dictionaries.json', {
  researchVersion: 1,
  sourceSha256: report.input.sha256,
  dictionaries,
});
for (const b of blocks) {
  const p = JSON.parse(await readFile(join(root, 'dictionary-columns', b.name), 'utf8'));
  const old = p.columns;
  p.columns = old.map((c, j) =>
    selection[j] ? { shared: j, refs: unpack(c).map((v) => maps[j].get(JSON.stringify(v))) } : c,
  );
  await emit(b.name, p);
  const disk = JSON.parse(await readFile(join(output, b.name), 'utf8'));
  for (let j = 0; j < 17; j++) {
    const decoded =
      disk.columns[j].shared !== undefined
        ? disk.columns[j].refs.map((i) => dictionaries[j][i])
        : unpack(disk.columns[j]);
    assert.deepEqual(decoded, unpack(old[j]));
    comparisons += decoded.length;
  }
}
const result = {
  kind: 'research-only-shared-evidence-profile',
  sourceSha256: report.input.sha256,
  fields: report.fields.slice(4).map((f, j) => ({
    field: f.field,
    selected: selection[j],
    distinct: f.distinct,
    dictionaryEntriesBuilt: maps[j].size,
    localColumnBytes: localBytes[j],
    sharedCandidateBytes:
      j === 14 ? null : Buffer.byteLength(JSON.stringify(values[j])) + refBytes[j],
  })),
  evidenceBytes: bytes,
  evidenceGzipBytes: gzipBytes,
  searchBytes: report.variants['dictionary-columns'].searchBytes,
  totalDataBytes: bytes + report.variants['dictionary-columns'].searchBytes,
  totalDataGzipBytes:
    gzipBytes +
    report.variants['dictionary-columns'].blocks
      .filter((b) => b.role === 'search')
      .reduce((s, b) => s + b.gzipBytes, 0),
  exactEvidenceValueComparisons: comparisons,
  elapsedMs: Math.round(performance.now() - started),
  peakRssKiB: process.resourceUsage().maxRSS,
  entries,
};
await writeFile(join(root, 'shared-profile.json'), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ ...result, entries: entries.length }));
