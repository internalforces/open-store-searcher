// Throwaway full-source feasibility probe. Not a production codec or adopted contract.

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const source = '/Users/sonmyeong-gwan/Downloads/dataset.json';
const receipt = JSON.parse(
  await readFile('/Users/sonmyeong-gwan/Downloads/observation.json', 'utf8'),
);
const out = process.argv[2];
if (!out) throw Error('output required');
await mkdir(out, { recursive: false });
const started = performance.now();
const inputHash = createHash('sha256');
let inputBytes = 0;
for await (const b of createReadStream(source)) {
  inputHash.update(b);
  inputBytes += b.length;
}
assert.equal(inputBytes, receipt.dataset.byteLength);
assert.equal(inputHash.digest('hex'), receipt.dataset.sha256);
const fields = [
  'id',
  'name',
  'roadAddress',
  'parcelAddress',
  'categoryName',
  'businessTypes',
  'rawStatus.operatingCode',
  'rawStatus.operatingName',
  'rawStatus.detailedCode',
  'rawStatus.detailedName',
  'processedStatus',
  'lifecycle.licensedOn',
  'lifecycle.licenseCancelledOn',
  'lifecycle.suspendedFrom',
  'lifecycle.suspendedThrough',
  'lifecycle.reopenedOn',
  'lifecycle.closedOn',
  'lifecycle.sourceUpdatedAt',
  'lifecycle.sourceLastModifiedAt',
  'sourceLabel',
  'sourceUrl',
];
const get = (r, k) => (k.includes('.') ? r[k.split('.')[0]][k.split('.')[1]] : r[k]);
const reconstruct = (v) => ({
  id: v[0],
  name: v[1],
  roadAddress: v[2],
  parcelAddress: v[3],
  categoryName: v[4],
  businessTypes: v[5],
  rawStatus: { operatingCode: v[6], operatingName: v[7], detailedCode: v[8], detailedName: v[9] },
  processedStatus: v[10],
  lifecycle: {
    licensedOn: v[11],
    licenseCancelledOn: v[12],
    suspendedFrom: v[13],
    suspendedThrough: v[14],
    reopenedOn: v[15],
    closedOn: v[16],
    sourceUpdatedAt: v[17],
    sourceLastModifiedAt: v[18],
  },
  sourceLabel: v[19],
  sourceUrl: v[20],
});
const cardinal = fields.map(() => new Set());
const stats = fields.map((field) => ({ field, valueBytes: 0, nulls: 0, empty: 0 }));
const top = {};
const variants = ['tuples', 'dictionary-tuples', 'dictionary-columns'];
const totals = Object.fromEntries(
  variants.map((v) => [
    v,
    { bytes: 0, gzipBytes: 0, searchBytes: 0, evidenceBytes: 0, blocks: [] },
  ]),
);
for (const v of variants) await mkdir(join(out, v));
let rows = 0,
  block = [],
  metadata,
  originalRecordBytes = 0,
  descendingIds = 0,
  lastId = '',
  roundTrip = 0;
const orderedIds = createHash('sha256');
const unorderedIds = new Set();
const bsize = 8192;
async function emit() {
  if (!block.length) return;
  const start = rows - block.length;
  const columns = fields.map((_, j) => block.map((r) => r.values[j]));
  const encoded = columns.map((c) => {
    const m = new Map();
    const values = [];
    const refs = c.map((v) => {
      const k = JSON.stringify(v);
      if (!m.has(k)) {
        m.set(k, values.length);
        values.push(v);
      }
      return m.get(k);
    });
    const raw = { values: c };
    const dict = { dictionary: values, refs };
    return Buffer.byteLength(JSON.stringify(dict)) < Buffer.byteLength(JSON.stringify(raw))
      ? dict
      : raw;
  });
  for (const variant of variants) {
    const search =
      variant === 'tuples'
        ? { rows: block.map((r) => r.values.slice(0, 4)) }
        : variant === 'dictionary-columns'
          ? { columns: encoded.slice(0, 4) }
          : {
              dictionaries: encoded.slice(0, 4).map((c) => c.dictionary ?? null),
              rows: block.map((_, i) =>
                encoded.slice(0, 4).map((c) => (c.refs ? c.refs[i] : c.values[i])),
              ),
            };
    const evidence =
      variant === 'tuples'
        ? { rows: block.map((r) => r.values.slice(4)) }
        : variant === 'dictionary-columns'
          ? { columns: encoded.slice(4) }
          : {
              dictionaries: encoded.slice(4).map((c) => c.dictionary ?? null),
              rows: block.map((_, i) =>
                encoded.slice(4).map((c) => (c.refs ? c.refs[i] : c.values[i])),
              ),
            };
    const parts = [];
    for (const [role, data] of [
      ['search', search],
      ['evidence', evidence],
    ]) {
      const bytes = Buffer.from(
        `${JSON.stringify({
          researchVersion: 1,
          sourceSha256: receipt.dataset.sha256,
          start,
          count: block.length,
          role,
          ...data,
        })}\n`,
      );
      const name = `${start}-${role}.json`;
      await writeFile(join(out, variant, name), bytes, { flag: 'wx' });
      const packed = gzipSync(bytes);
      await writeFile(join(out, variant, `${name}.gz`), packed, { flag: 'wx' });
      totals[variant].bytes += bytes.length;
      totals[variant].gzipBytes += packed.length;
      totals[variant][`${role}Bytes`] += bytes.length;
      totals[variant].blocks.push({
        name,
        start,
        count: block.length,
        role,
        bytes: bytes.length,
        gzipBytes: packed.length,
        sha256: createHash('sha256').update(bytes).digest('hex'),
      });
      parts.push(JSON.parse((await readFile(join(out, variant, name))).toString()));
    }
    const decode = (p, i) =>
      p.columns
        ? p.columns.map((c) => (c.dictionary ? c.dictionary[c.refs[i]] : c.values[i]))
        : p.dictionaries
          ? p.rows[i].map((v, j) => (p.dictionaries[j] ? p.dictionaries[j][v] : v))
          : p.rows[i];
    for (let i = 0; i < block.length; i++) {
      const restored = JSON.stringify(
        reconstruct([...decode(parts[0], i), ...decode(parts[1], i)]),
      );
      assert.equal(restored, block[i].json);
      roundTrip++;
    }
  }
  block = [];
  if (rows % (bsize * 16) === 0)
    console.log(
      JSON.stringify({
        rows,
        elapsedMs: Math.round(performance.now() - started),
        rss: process.memoryUsage().rss,
      }),
    );
}
// Bounded JSON object scanner; only one record and one block are retained, plus cardinality sets.
let prefix = '',
  inRecords = false,
  inString = false,
  stringEscape = false,
  depth = 0,
  record = '',
  tail = '';
for await (const chunk of createReadStream(source, {
  encoding: 'utf8',
  highWaterMark: 1024 * 1024,
})) {
  let text = chunk;
  if (!inRecords) {
    prefix += text;
    const at = prefix.indexOf('"records":[');
    if (at < 0) continue;
    metadata = JSON.parse(`${prefix.slice(0, at)}"records":[]}`);
    text = prefix.slice(at + 11);
    prefix = '';
    inRecords = true;
  }
  let segment = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (depth === 0) {
      if (c === '{') {
        depth = 1;
        segment = i;
        inString = false;
        stringEscape = false;
      } else if (!/[\s,\]]/.test(c)) {
        tail += c;
      }
      continue;
    }
    if (inString) {
      if (stringEscape) stringEscape = false;
      else if (c === '\\') stringEscape = true;
      else if (c === '"') inString = false;
    } else if (c === '"') inString = true;
    else if (c === '{') depth++;
    else if (c === '}') depth--;
    if (depth === 0) {
      record += text.slice(segment, i + 1);
      const r = JSON.parse(record);
      assert.equal(JSON.stringify(r), record);
      assert.match(r.id, /^[a-f0-9]{64}$/);
      assert(!unorderedIds.has(r.id), 'duplicate ID');
      unorderedIds.add(r.id);
      if (lastId > r.id) descendingIds++;
      lastId = r.id;
      orderedIds.update(`${r.id}\n`);
      originalRecordBytes += Buffer.byteLength(record);
      for (const [k, v] of Object.entries(r))
        top[k] = (top[k] ?? 0) + Buffer.byteLength(`${JSON.stringify(k)}:${JSON.stringify(v)}`);
      const values = fields.map((k, j) => {
        const v = get(r, k);
        assert.notEqual(v, undefined);
        const key = JSON.stringify(v);
        stats[j].valueBytes += Buffer.byteLength(key);
        if (v === null) stats[j].nulls++;
        if (v === '') stats[j].empty++;
        if (j !== 0) cardinal[j].add(key);
        return v;
      });
      block.push({ json: record, values });
      rows++;
      record = '';
      if (block.length === bsize) await emit();
      segment = i + 1;
    }
  }
  if (depth > 0) record += text.slice(segment);
}
assert.equal(depth, 0);
assert.equal(tail, '}');
assert.equal(rows, receipt.recordCount);
await emit();
const report = {
  kind: 'research-only-full-source-profile',
  node: process.version,
  platform: process.platform,
  input: {
    ...receipt.dataset,
    recordCount: rows,
    orderedIdsSha256: orderedIds.digest('hex'),
    adjacentDescendingPublicIds: descendingIds,
  },
  metadata,
  fields: stats.map((s, i) => ({ ...s, distinct: i === 0 ? rows : cardinal[i].size })),
  topLevelFieldBytes: top,
  originalRecordBytes,
  nonRecordBytes: inputBytes - originalRecordBytes,
  roundTripComparisons: roundTrip,
  blockRows: bsize,
  indexBytes: 0,
  indexKind: 'scan-only, no published index',
  variants: totals,
  elapsedMs: Math.round(performance.now() - started),
  peakRssKiB: process.resourceUsage().maxRSS,
};
await writeFile(join(out, 'profile.json'), `${JSON.stringify(report, null, 2)}\n`, { flag: 'wx' });
console.log(
  JSON.stringify({
    ...report,
    variants: Object.fromEntries(
      Object.entries(totals).map(([k, v]) => [k, { ...v, blocks: v.blocks.length }]),
    ),
  }),
);
