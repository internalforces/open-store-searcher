// Local research only: exercise production codec without approving a release or baseline.
import assert from 'node:assert/strict';
import { createReadStream } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { createServer } from 'vite';
const source = '/Users/sonmyeong-gwan/Downloads/dataset.json';
const receipt = JSON.parse(
  await readFile('/Users/sonmyeong-gwan/Downloads/observation.json', 'utf8'),
);
const out = process.argv[2];
await mkdir(out);
let metadata;
async function* records() {
  let prefix = '',
    inRecords = false,
    inString = false,
    stringEscape = false,
    depth = 0,
    record = '',
    tail = '',
    count = 0;
  const hash = createHash('sha256');
  let size = 0;
  for await (const bytes of createReadStream(source, { highWaterMark: 1024 * 1024 })) {
    hash.update(bytes);
    size += bytes.length;
  }
  assert.equal(size, receipt.dataset.byteLength);
  assert.equal(hash.digest('hex'), receipt.dataset.sha256);
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
      delete metadata.records;
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
        } else if (!/[\s,\]]/.test(c)) tail += c;
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
        yield JSON.parse(record);
        count++;
        record = '';
        segment = i + 1;
      }
    }
    if (depth > 0) record += text.slice(segment);
  }
  assert.equal(depth, 0);
  assert.equal(tail, '}');
  assert.equal(count, receipt.recordCount);
}
// Read metadata without loading the record array.
const probe = records();
await probe.next();
await probe.return();
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { writeCompactDataset } = await server.ssrLoadModule(
    '/src/pipeline/write-compact-dataset.ts',
  );
  const { verifyCompactDirectory } = await server.ssrLoadModule(
    '/src/pipeline/verify-compact-directory.ts',
  );
  const { validateDictionaries, validateBlock, columnValue, materializeRecord } =
    await server.ssrLoadModule('/src/shared/compact-data.ts');
  const started = performance.now();
  const encoded = await writeCompactDataset(
    {
      archiveSha256: receipt.archiveSha256,
      policyRevision: null,
      recordCount: receipt.recordCount,
      metadata,
    },
    records,
    out,
  );
  console.log(JSON.stringify({ stage: 'encoded', elapsedMs: performance.now() - started }));
  await verifyCompactDirectory(out, encoded.manifestEntry);
  const dictEntry = encoded.entries.find((e) => e.role === 'dictionaries');
  const dictionaries = validateDictionaries(
    JSON.parse(await readFile(join(out, dictEntry.name), 'utf8')),
    receipt.archiveSha256,
  );
  const iterator = records();
  let comparisons = 0,
    rawBytes = 0,
    gzipBytes = 0;
  const roleBytes = { search: 0, evidence: 0, dictionaries: 0 };
  for (const e of [encoded.manifestEntry, ...encoded.entries]) {
    const b = await readFile(join(out, e.name));
    rawBytes += b.length;
    gzipBytes += gzipSync(b).length;
    if (e.role) roleBytes[e.role] += b.length;
  }
  const blocks = encoded.entries.filter((e) => e.role !== 'dictionaries');
  for (let i = 0; i < blocks.length; i += 2) {
    const entries = blocks.slice(i, i + 2);
    const pair = [];
    for (const e of entries)
      pair.push(
        validateBlock(
          JSON.parse(await readFile(join(out, e.name), 'utf8')),
          e,
          receipt.archiveSha256,
          dictionaries,
        ),
      );
    for (let row = 0; row < pair[0].count; row++) {
      const restored = materializeRecord(
        pair.flatMap((b) => b.columns.map((c) => columnValue(c, row, dictionaries))),
      );
      const original = await iterator.next();
      assert(!original.done);
      assert.deepEqual(restored, original.value);
      comparisons++;
    }
  }
  assert((await iterator.next()).done);
  assert.equal(comparisons, receipt.recordCount);
  const report = {
    kind: 'production-codec-research-only',
    publicationApproved: false,
    node: process.version,
    platform: process.platform,
    source: receipt.dataset,
    recordCount: comparisons,
    orderedIdsSha256: encoded.manifest.orderedIdsSha256,
    manifestEntry: encoded.manifestEntry,
    roleBytes,
    rawBytes,
    gzipBytes,
    elapsedMs: performance.now() - started,
    peakRssBytes: process.resourceUsage().maxRSS * 1024,
  };
  await writeFile(join(out, 'measurement.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report));
} finally {
  await server.close();
}
