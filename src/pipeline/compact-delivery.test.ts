import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, test } from 'vitest';
import { writeCompactDataset } from './write-compact-dataset.js';
import { verifyCompactDirectory } from './verify-compact-directory.js';
import { loadCompactSnapshot } from '../shared/load-compact-data.js';
import {
  columnValue,
  materializeRecord,
  validateManifest,
  type CompactManifest,
} from '../shared/compact-data.js';
const roots: string[] = [];
const sha = (v: Uint8Array) => createHash('sha256').update(v).digest('hex');
const bytes = (v: unknown) => Buffer.from(`${JSON.stringify(v)}\n`);
const record = (id: string) => ({
  id: id.repeat(64),
  name: '원본',
  roadAddress: '',
  parcelAddress: '서울 강남구 1',
  categoryName: '원문.csv',
  businessTypes: [{ sourceField: '업태', value: ' ' }],
  rawStatus: {
    operatingCode: '05',
    operatingName: '제외/삭제/전출',
    detailedCode: '',
    detailedName: null,
  },
  processedStatus: '확인되지 않음',
  lifecycle: {
    licensedOn: '',
    licenseCancelledOn: null,
    suspendedFrom: '',
    suspendedThrough: null,
    reopenedOn: '',
    closedOn: null,
    sourceUpdatedAt: '날짜 원문',
    sourceLastModifiedAt: '',
  },
  sourceLabel: '행정안전부',
  sourceUrl: null,
});
async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'compact-tests-'));
  roots.push(root);
  const records = [record('f'), record('a')];
  const input = {
    archiveSha256: 'b'.repeat(64),
    policyRevision: null,
    recordCount: 2,
    metadata: {
      sourceLabel: 'source',
      sourceUrl: null,
      exampleQuery: '',
      coverage: { kind: 'collected' as const, date: '2026-09-14' },
    },
  };
  const output = await writeCompactDataset(
    input,
    async function* () {
      yield* records;
    },
    root,
  );
  return { root, records, input, ...output };
}
afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});
test('production codec preserves all exact evidence, original identifier order and count', async () => {
  const f = await fixture();
  const m = await verifyCompactDirectory(f.root, f.manifestEntry);
  expect(m.recordCount).toBe(2);
  const snapshot = await loadCompactSnapshot(
    await readFile(join(f.root, f.manifestEntry.name)),
    f.manifestEntry.sha256,
    (name) => readFile(join(f.root, name)),
  );
  const restored = f.records.map((_, i) =>
    materializeRecord(
      snapshot.blocks.flatMap((b) =>
        b.columns.map((c) => columnValue(c, i, snapshot.dictionaries)),
      ),
    ),
  );
  expect(restored).toEqual(f.records);
  expect(snapshot.manifest.orderedIdsSha256).toBe(
    sha(Buffer.from(f.records.map((r) => `${r.id}\n`).join(''))),
  );
});
test.each(['missing', 'corrupt', 'truncated', 'invalid-utf8'] as const)(
  'rejects %s blocks without accepting a partial snapshot',
  async (failure) => {
    const f = await fixture();
    const target = required(f.entries.find((e) => e.role === 'evidence'));
    await expect(
      loadCompactSnapshot(
        await readFile(join(f.root, f.manifestEntry.name)),
        f.manifestEntry.sha256,
        async (name) => {
          if (name !== target.name) return readFile(join(f.root, name));
          if (failure === 'missing') throw new Error('missing');
          const b = await readFile(join(f.root, name));
          if (failure === 'truncated') return b.subarray(0, b.length - 1);
          b[0] = failure === 'invalid-utf8' ? 255 : 32;
          return b;
        },
      ),
    ).rejects.toThrow();
  },
);
test.each(['mixed-version', 'mixed-archive', 'bad-reference', 'duplicate-id'] as const)(
  'rejects correctly hashed %s content before readiness and builder acceptance',
  async (failure) => {
    const f = await fixture();
    const target = required(f.entries.find((e) => e.role === 'search'));
    const block = JSON.parse(await readFile(join(f.root, target.name), 'utf8'));
    if (failure === 'mixed-version') block.version = 2;
    if (failure === 'mixed-archive') block.archiveSha256 = 'c'.repeat(64);
    if (failure === 'bad-reference')
      block.columns[0] = { dictionary: ['a'.repeat(64)], refs: [0, 1] };
    if (failure === 'duplicate-id') block.columns[0] = { values: ['a'.repeat(64), 'a'.repeat(64)] };
    const b = bytes(block);
    Object.assign(target, {
      sha256: sha(b),
      byteLength: b.length,
      name: `assets/compact-${sha(b)}.json`,
    });
    await writeFile(join(f.root, target.name), b);
    // Rewrite all declared hashes to prove semantic validation, not only digest rejection.
    const mb = bytes(f.manifest);
    const me = {
      name: `assets/compact-manifest-${sha(mb)}.json`,
      sha256: sha(mb),
      byteLength: mb.length,
    };
    await writeFile(join(f.root, me.name), mb);
    await expect(
      loadCompactSnapshot(mb, me.sha256, (name) => readFile(join(f.root, name))),
    ).rejects.toThrow();
    await expect(verifyCompactDirectory(f.root, me)).rejects.toThrow();
  },
);
test.each([
  'missing-role',
  'overlap',
  'wrong-count',
  'wrong-date',
  'wrong-version',
  'unknown-field',
] as const)('rejects manifest %s', async (failure) => {
  const f = await fixture();
  const m: CompactManifest = structuredClone(f.manifest);
  if (failure === 'missing-role') m.entries = m.entries.filter((e) => e.role !== 'evidence');
  if (failure === 'overlap') required(m.entries.find((e) => e.role === 'evidence')).start = 1;
  if (failure === 'wrong-count') m.recordCount++;
  if (failure === 'wrong-date')
    m.metadata = { ...m.metadata, coverage: { kind: 'collected', date: '2026-02-30' } };
  if (failure === 'wrong-version') Object.assign(m, { normalizationContractVersion: 2 });
  if (failure === 'unknown-field') Object.assign(m, { records: [] });
  expect(() => validateManifest(m)).toThrow();
});
test('rejects source changes between replay passes and duplicate global identities', async () => {
  const f = await fixture();
  let pass = 0;
  await expect(
    writeCompactDataset(
      f.input,
      async function* () {
        pass++;
        yield { ...f.records[0], name: pass === 1 ? 'old' : 'new' };
        yield f.records[1];
      },
      join(f.root, 'changed'),
    ),
  ).rejects.toThrow();
  await expect(
    writeCompactDataset(
      f.input,
      async function* () {
        yield f.records[0];
        yield f.records[0];
      },
      join(f.root, 'duplicate'),
    ),
  ).rejects.toThrow();
});
test('cancels before fetching any blocks and does not accept the candidate', async () => {
  const f = await fixture();
  const signal = AbortSignal.abort();
  let reads = 0;
  await expect(
    loadCompactSnapshot(
      await readFile(join(f.root, f.manifestEntry.name)),
      f.manifestEntry.sha256,
      async (name) => {
        reads++;
        return readFile(join(f.root, name));
      },
      signal,
    ),
  ).rejects.toThrow();
  expect(reads).toBe(0);
});

test.each([
  'date',
  'count',
  'archive',
  'policy',
  'timestamp',
  'unapproved',
  'baseline-version',
] as const)('rejects correctly hashed baseline/release %s mismatch', async (failure) => {
  const { validateCompactReleaseBinding } = await import('../shared/compact-data.js');
  const f = await fixture();
  f.manifest.policyRevision = 'synthetic-binding-only';
  const release = {
    version: 2,
    dateBasis: 'collection',
    sourceDataAsOf: null,
    collectedAt: '2026-09-14T00:00:00.000Z',
    archiveSha256: f.manifest.archiveSha256,
    policyRevision: 'synthetic-binding-only',
    recordCount: 2,
  };
  const baseline = {
    archiveSha256: release.archiveSha256,
    validationVersion: 1,
    schemaVersion: 2,
    identifierContractVersion: 1,
    normalizationContractVersion: 1,
    policyRevision: 'synthetic-binding-only' as string | null,
    dateBasis: 'collection',
    dataAsOf: '2026-09-14',
    metrics: { total: { recordCount: 2 } },
  };
  expect(() => validateCompactReleaseBinding(f.manifest, release, baseline)).not.toThrow();
  if (failure === 'date') baseline.dataAsOf = '2026-09-13';
  if (failure === 'count') baseline.metrics.total.recordCount = 3;
  if (failure === 'archive') baseline.archiveSha256 = 'c'.repeat(64);
  if (failure === 'policy') baseline.policyRevision = 'other';
  if (failure === 'unapproved') f.manifest.policyRevision = null;
  if (failure === 'baseline-version') baseline.identifierContractVersion = 2;
  if (failure === 'timestamp') release.collectedAt = '2026-09-12T00:00:00.000Z';
  expect(() => validateCompactReleaseBinding(f.manifest, release, baseline)).toThrow();
});

function required<T>(v: T | null | undefined): T {
  if (v === null || v === undefined) throw new Error('Missing required compact value');
  return v;
}
