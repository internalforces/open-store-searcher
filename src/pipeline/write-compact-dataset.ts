import { createHash } from 'node:crypto';
import { appendFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { DisplayDataset } from '../app/display-data.js';
import {
  COMPACT_BLOCK_ROWS,
  COMPACT_MAX_BYTES,
  type Column,
  type CompactEntry,
  type CompactManifest,
  type Dictionaries,
  encodeColumns,
  flattenRecord,
  requireCompact,
  validateManifest,
} from '../shared/compact-data.js';

const bytes = (v: unknown) => Buffer.from(`${JSON.stringify(v)}\n`);
const sha = (v: Uint8Array | string) => createHash('sha256').update(v).digest('hex');
export interface CompactInput {
  archiveSha256: string;
  policyRevision: string | null;
  recordCount: number;
  metadata: Omit<DisplayDataset, 'records'>;
}
/** Three bounded passes. Dictionary limits are encoding fallbacks, never quality filters. */
export async function writeCompactDataset(
  input: CompactInput,
  records: () => AsyncIterable<unknown>,
  output: string,
) {
  await mkdir(join(output, 'assets'), { recursive: true });
  const scratch = await mkdtemp(join(output, '.identities-'));
  const selected = new Set([5, 6, 7, 10, 11, 12, 16, 19]);
  const dictionaries: Dictionaries = Array.from({ length: 21 }, (_, j) =>
    selected.has(j) ? [] : null,
  );
  const maps = Array.from({ length: 21 }, () => new Map<string, number>()),
    sizes = Array(21).fill(0) as number[];
  const bucketBuffers = new Map<string, string[]>();
  let pending = 0;
  const bucketSizes = new Map<string, number>();
  const flush = async () => {
    for (const [name, a] of bucketBuffers)
      await appendFile(join(scratch, name), `${a.join('\n')}\n`);
    bucketBuffers.clear();
    pending = 0;
  };
  const ordered = createHash('sha256'),
    content = createHash('sha256');
  let count = 0;
  try {
    for await (const r of records()) {
      const row = flattenRecord(r);
      const id = row[0] as string;
      ordered.update(`${id}\n`);
      content.update(bytes(r));
      count++;
      const bucket = id.slice(0, 2),
        size = (bucketSizes.get(bucket) ?? 0) + 65;
      requireCompact(size <= 64 * 1024 * 1024);
      bucketSizes.set(bucket, size);
      const a = bucketBuffers.get(bucket) ?? [];
      a.push(id);
      bucketBuffers.set(bucket, a);
      pending += 65;
      if (pending >= 1024 * 1024) await flush();
      for (const j of selected) {
        if (!dictionaries[j]) continue;
        const key = JSON.stringify(row[j]);
        if (required(maps[j]).has(key)) continue;
        sizes[j] = required(sizes[j]) + Buffer.byteLength(key) + 1;
        if (required(sizes[j]) > 512 * 1024 || required(maps[j]).size >= 65536) {
          dictionaries[j] = null;
          required(maps[j]).clear();
          continue;
        }
        required(maps[j]).set(key, required(dictionaries[j]).length);
        required(dictionaries[j]).push(row[j]);
      }
    }
    await flush();
    requireCompact(count === input.recordCount);
    for (const name of bucketSizes.keys()) {
      const ids = (await readFile(join(scratch, name), 'utf8')).trimEnd().split('\n');
      requireCompact(new Set(ids).size === ids.length);
    }
    const expectedContent = content.digest('hex');
    const originalOrder = ordered.digest('hex');
    const localCost = Array(21).fill(0) as number[],
      sharedCost = Array(21).fill(0) as number[];
    async function* batches() {
      let rows: unknown[][] = [];
      const digest = createHash('sha256');
      let n = 0;
      for await (const r of records()) {
        digest.update(bytes(r));
        rows.push(flattenRecord(r));
        n++;
        if (rows.length === COMPACT_BLOCK_ROWS) {
          yield rows;
          rows = [];
        }
      }
      if (rows.length) yield rows;
      requireCompact(n === input.recordCount && digest.digest('hex') === expectedContent);
    }
    for await (const rows of batches()) {
      const local = encodeColumns(rows);
      for (const j of selected) {
        if (!dictionaries[j]) continue;
        localCost[j] = required(localCost[j]) + bytes(local[j]).length;
        const refs = rows.map((r) => required(maps[j]).get(JSON.stringify(r[j])));
        requireCompact(refs.every((i) => i !== undefined));
        sharedCost[j] = required(sharedCost[j]) + bytes({ shared: j, refs }).length;
      }
    }
    for (const j of selected)
      if (
        dictionaries[j] &&
        required(sharedCost[j]) + bytes(dictionaries[j]).length >= required(localCost[j])
      )
        dictionaries[j] = null;
    const entries: CompactEntry[] = [];
    async function emit(value: unknown, role: CompactEntry['role'], start: number, count: number) {
      const data = bytes(value);
      requireCompact(data.length <= COMPACT_MAX_BYTES);
      const hash = sha(data);
      const name = `assets/compact-${hash}.json`;
      await writeFile(join(output, name), data, { flag: 'wx' });
      requireCompact(sha(await readFile(join(output, name))) === hash);
      const entry = { name, sha256: hash, byteLength: data.length, role, start, count };
      entries.push(entry);
      return entry;
    }
    await emit(
      { version: 1, archiveSha256: input.archiveSha256, dictionaries },
      'dictionaries',
      0,
      0,
    );
    let start = 0;
    async function emitRows(rows: unknown[][]): Promise<void> {
      const local = encodeColumns(rows);
      const columns = local.map(
        (c, j): Column =>
          dictionaries[j]
            ? {
                shared: j,
                refs: rows.map((r) => required(required(maps[j]).get(JSON.stringify(r[j])))),
              }
            : c,
      );
      const header = { version: 1, archiveSha256: input.archiveSha256, start, count: rows.length };
      const search = { ...header, role: 'search', columns: columns.slice(0, 4) },
        evidence = { ...header, role: 'evidence', columns: columns.slice(4) };
      if (Math.max(bytes(search).length, bytes(evidence).length) > COMPACT_MAX_BYTES) {
        requireCompact(rows.length > 1);
        const half = Math.floor(rows.length / 2);
        await emitRows(rows.slice(0, half));
        await emitRows(rows.slice(half));
        return;
      }
      await emit(search, 'search', start, rows.length);
      await emit(evidence, 'evidence', start, rows.length);
      start += rows.length;
    }
    for await (const rows of batches()) await emitRows(rows);
    const manifest: CompactManifest = {
      version: 1,
      kind: 'compact-dataset',
      schemaVersion: 2,
      identifierContractVersion: 1,
      normalizationContractVersion: 1,
      archiveSha256: input.archiveSha256,
      policyRevision: input.policyRevision,
      dateBasis: 'collection',
      sourceDataAsOf: null,
      recordCount: input.recordCount,
      orderedIdsSha256: originalOrder,
      metadata: input.metadata,
      entries,
    };
    validateManifest(manifest);
    const data = bytes(manifest);
    requireCompact(data.length <= COMPACT_MAX_BYTES);
    const hash = sha(data);
    const name = `assets/compact-manifest-${hash}.json`;
    await writeFile(join(output, name), data, { flag: 'wx' });
    return { manifest, manifestEntry: { name, sha256: hash, byteLength: data.length }, entries };
  } finally {
    await rm(scratch, { recursive: true, force: true });
  }
}

function required<T>(value: T | null | undefined): T {
  if (value === undefined || value === null) throw new Error('Missing required compact value');
  return value;
}
