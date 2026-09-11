import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, test, vi } from 'vitest';
import { VOCABULARY_V2 } from './aggregate-vocabulary.js';
import { parseArchiveContract } from './archive-contract.js';
import * as observation from './observe-license-archive.js';
import { finalizeResearchObservation, observeLicenseArchive } from './observe-license-archive.js';
import { requireValue } from './refresh-validation-types.js';
import { ResearchIndexStore } from './research-index-store.js';
import {
  parsePermissionManifest,
  SOURCE_ARCHIVE_URL,
  SOURCE_PROVIDER_FRESHNESS,
} from './source-contract.js';
import { CsvParseError } from './stream-csv.js';
import * as transformer from './transform-license-records.js';
import { validateLicenseRefreshV1 } from './validate-license-refresh.js';

function fixture() {
  const archiveContract = parseArchiveContract(
    JSON.parse(
      readFileSync(new URL('./contracts/seoul-archive-contract.json', import.meta.url), 'utf8'),
    ),
  );
  // Synthetic bytes use UTF-8; production continues using each committed encoding.
  for (const entry of archiveContract.entries) entry.encoding = 'utf-8';
  const permissionManifest = parsePermissionManifest(
    JSON.parse(
      readFileSync(
        new URL('../../reports/source-permission-manifest-2026-08-28.json', import.meta.url),
        'utf8',
      ),
    ),
  );
  const hash = 'a'.repeat(64);
  const schemaManifestSha256 = createHash('sha256')
    .update(
      JSON.stringify(
        [...archiveContract.entries]
          .sort((a, b) => a.entryName.localeCompare(b.entryName))
          .map((e) => ({ ...e, entryName: e.entryName.normalize('NFC') })),
      ),
    )
    .digest('hex');
  const input = {
    archiveContract,
    permissionManifest,
    collection: {
      kind: 'accepted' as const,
      change: 'changed' as const,
      archivePath: '/synthetic/archive.zip',
      sha256: hash,
      byteLength: 100,
      fetchedAt: '2026-09-04T00:00:00.000Z',
      sourceEvidence: {
        expectedBytes: 100,
        finalUrl: SOURCE_ARCHIVE_URL,
        providerFreshness: SOURCE_PROVIDER_FRESHNESS,
      },
      archiveEvidence: {
        entryCount: 195,
        schemaManifestSha256,
        providerModifiedDate: '2026-09-04',
      },
    },
    now: '2026-09-04T01:00:00.000Z',
    limits: {
      maxTotalBytes: 1_000_000,
      maxRows: 1000,
      maxRecordChars: 10000,
      timeoutMs: 10000,
      maxRssBytes: 1_000_000,
    },
  };
  const records = new Map(
    archiveContract.entries.map((e) => [
      e.entryName,
      [Object.fromEntries(e.headers.map((h) => [h, '']))],
    ]),
  );
  for (const rows of records.values())
    Object.assign(requireValue(rows[0]), {
      개방자치단체코드: '6110000',
      관리번호: 'private-identifier',
      사업장명: 'private-business',
      도로명주소: 'private-address',
      영업상태코드: '01',
      영업상태명: '영업/정상',
    });
  const deps = {
    hashArchive: vi.fn(async () => hash),
    rss: () => 0,
    readEntry: vi.fn(async function* (_path: string, name: string) {
      const entry = requireValue(archiveContract.entries.find((e) => e.entryName === name));
      const csv = [
        entry.headers,
        ...requireValue(records.get(name)).map((r) => entry.headers.map((h) => r[h] ?? '')),
      ]
        .map((row) => row.map((v) => `"${v.replaceAll('"', '""')}"`).join(','))
        .join('\r\n');
      yield new TextEncoder().encode(csv);
    }),
  };
  return { input, deps, records };
}

describe('TASK-008 research-only archive observation', () => {
  test('binds all 195 completed categories and returns aggregates without publication evidence', async () => {
    const { input, deps } = fixture();
    const r = await observeLicenseArchive(input, deps);
    expect(r.kind).toBe('review_required');
    expect(r.complete).toBe(true);
    expect(r.ingestion).toHaveLength(195);
    expect(r.metrics?.total.recordCount).toBe(195);
    expect(r.metrics?.total.statusCounts['행정상 영업']).toBe(195);
    expect(r.dataAsOf).toBeNull();
    expect(r.diagnostics.map((d) => d.code)).toEqual(
      expect.arrayContaining([
        'data_as_of_unverified',
        'policy_review_required',
        'baseline_review_required',
      ]),
    );
    for (const value of [
      'private-identifier',
      'private-business',
      'private-address',
      'candidate',
      'values',
    ])
      expect(JSON.stringify(r)).not.toContain(value);
    expect(deps.hashArchive).toHaveBeenCalledTimes(2);
    expect(
      r.ingestion.every(
        (e) => e.archiveSha256 === input.collection.sha256 && e.completed && e.rowCount === 1,
      ),
    ).toBe(true);
  });
  test('distinguishes a completed header-only category from a failed read', async () => {
    const { input, deps, records } = fixture();
    records.set(requireValue(input.archiveContract.entries[0]).entryName, []);
    const r = await observeLicenseArchive(input, deps);
    expect(r.complete).toBe(true);
    expect(r.metrics?.total.recordCount).toBe(194);
    expect(
      r.ingestion.find(
        (e) => e.fileDataId === requireValue(input.archiveContract.entries[0]).fileDataId,
      )?.rowCount,
    ).toBe(0);
  });
  test('rejects changed archive bytes before entry reads and after complete ingestion', async () => {
    for (const after of [false, true]) {
      const { input, deps } = fixture();
      if (after) deps.hashArchive.mockResolvedValueOnce(input.collection.sha256);
      deps.hashArchive.mockResolvedValue('b'.repeat(64));
      const r = await observeLicenseArchive(input, deps);
      expect(r.kind).toBe('rejected');
      expect(r.complete).toBe(false);
      expect(r.metrics).toBeNull();
      expect(r.diagnostics[0]?.code).toBe('archive_changed');
      expect(deps.readEntry).toHaveBeenCalledTimes(after ? 195 : 0);
    }
  });
  test('rejects incomplete child output without leaking rows or trusting partial counts', async () => {
    const { input, deps } = fixture();
    deps.readEntry.mockImplementation(async function* () {
      yield new TextEncoder().encode('partial');
      throw new Error('private-business');
    });
    const r = await observeLicenseArchive(input, deps);
    expect(r.kind).toBe('rejected');
    expect(r.metrics).toBeNull();
    expect(r.complete).toBe(false);
    expect(r.ingestion).toEqual([]);
    expect(JSON.stringify(r)).not.toContain('private-business');
  });
  test('preserves typed CSV failure codes without exposing source content', async () => {
    const { input, deps } = fixture();
    deps.readEntry.mockImplementation(async function* () {
      yield new TextEncoder().encode('private-business\n');
    });
    const result = await observeLicenseArchive(input, deps);
    expect(result.diagnostics).toEqual([
      {
        code: 'csv_header_mismatch',
        severity: 'rejection',
        categoryId: requireValue(input.archiveContract.entries[0]).fileDataId,
      },
    ]);
    expect(result.metrics).toBeNull();
    expect(JSON.stringify(result)).not.toContain('private-business');
  });

  test('rejects forged typed error codes without exposing private text', async () => {
    const { input, deps } = fixture();
    const forged = new CsvParseError('csv_stream_failed');
    Object.defineProperty(forged, 'code', { value: 'private-business' });
    deps.readEntry.mockImplementation(async function* () {
      yield new Uint8Array();
      throw forged;
    });
    const result = await observeLicenseArchive(input, deps);
    expect(result.diagnostics[0]?.code).toBe('observation_read_failed');
    expect(JSON.stringify(result)).not.toContain('private-business');
  });

  test('preserves transformer rejection of duplicate identities', async () => {
    const { input, deps, records } = fixture();
    const name = requireValue(input.archiveContract.entries[0]).entryName;
    requireValue(records.get(name)).push({ ...requireValue(requireValue(records.get(name))[0]) });
    const r = await observeLicenseArchive(input, deps);
    expect(r.kind).toBe('rejected');
    expect(r.metrics).toBeNull();
    expect(r.diagnostics.map((d) => d.code)).toContain('duplicate_exact_source_tuple');
  });
  test.each(['maxRows', 'maxTotalBytes', 'maxRssBytes'] as const)(
    'rejects exhausted %s without partial metrics',
    async (key) => {
      const { input, deps } = fixture();
      input.limits[key] = 1;
      if (key === 'maxRssBytes') deps.rss = () => 2;
      const r = await observeLicenseArchive(input, deps);
      expect(r.kind).toBe('rejected');
      expect(r.complete).toBe(false);
      expect(r.metrics).toBeNull();
    },
  );
  test('aborts an in-flight archive hash at the observation deadline', async () => {
    const { input, deps } = fixture();
    input.limits.timeoutMs = 30;
    const hashArchive = async (_path: string, signal: AbortSignal): Promise<string> => {
      await new Promise<void>((_resolve, reject) =>
        signal.addEventListener('abort', () => reject(new Error('private-timeout')), {
          once: true,
        }),
      );
      return input.collection.sha256;
    };
    const result = await observeLicenseArchive(input, { ...deps, hashArchive });
    expect(result.complete).toBe(false);
    expect(result.metrics).toBeNull();
    expect(result.diagnostics[0]?.code).toBe('observation_timeout');
    expect(deps.readEntry).not.toHaveBeenCalled();
  });

  test('rejects malformed limits and mismatched schema before any I/O', async () => {
    for (const malformed of [true, false]) {
      const { input, deps } = fixture();
      if (malformed) input.limits.maxRows = 0;
      else input.collection.archiveEvidence.schemaManifestSha256 = 'b'.repeat(64);
      const r = await observeLicenseArchive(input, deps);
      expect(r.kind).toBe('rejected');
      expect(deps.hashArchive).not.toHaveBeenCalled();
      expect(deps.readEntry).not.toHaveBeenCalled();
    }
  });
});

function referenceRows(f: ReturnType<typeof fixture>) {
  return f.input.archiveContract.entries.flatMap((entry) =>
    requireValue(f.records.get(entry.entryName)).map((values) => ({
      categoryFileDataId: entry.fileDataId,
      sourceFileDataUrl: `https://www.data.go.kr/data/${entry.fileDataId}/fileData.do`,
      values,
    })),
  );
}

describe('batched research finalization', () => {
  test.each(['ordinary', 'empty', 'unknown'] as const)(
    'matches full validator kind, metrics and diagnostics for %s complete input',
    async (kind) => {
      const f = fixture();
      if (kind === 'empty') for (const key of f.records.keys()) f.records.set(key, []);
      if (kind === 'unknown') {
        for (const rows of f.records.values())
          Object.assign(requireValue(rows[0]), { 영업상태코드: '99', 영업상태명: 'synthetic-new' });
      }
      const actual = await observeLicenseArchive(f.input, f.deps);
      const expected = validateLicenseRefreshV1({
        ...f.input,
        rows: referenceRows(f),
        ingestion: actual.ingestion,
      });
      expect(actual.complete).toBe(true);
      expect(actual.kind).toBe(expected.kind);
      expect(actual.metrics).toEqual(expected.metrics);
      expect(actual.diagnostics).toEqual(expected.diagnostics);
      expect(actual.dataAsOf).toBeNull();
    },
  );

  test('bounds transformed batches while matching the complete-array oracle', async () => {
    const f = fixture();
    const name = requireValue(f.input.archiveContract.entries[0]).entryName;
    const original = requireValue(requireValue(f.records.get(name))[0]);
    f.records.set(
      name,
      Array.from({ length: 1005 }, (_, i) => ({ ...original, 관리번호: `synthetic-${i}` })),
    );
    f.input.limits.maxRows = 2000;
    f.input.limits.maxTotalBytes = 10000000;
    const spy = vi.spyOn(transformer, 'transformLicenseRecordsV2');
    let actual: Awaited<ReturnType<typeof observeLicenseArchive>>;
    try {
      actual = await observeLicenseArchive(f.input, f.deps);
      expect(Math.max(...spy.mock.calls.map(([input]) => input.rows.length))).toBeLessThanOrEqual(
        1000,
      );
      expect(spy.mock.calls.filter(([input]) => input.rows.length > 0).length).toBeGreaterThan(195);
    } finally {
      spy.mockRestore();
    }
    const expected = validateLicenseRefreshV1({
      ...f.input,
      rows: referenceRows(f),
      ingestion: actual.ingestion,
    });
    expect(actual.complete).toBe(true);
    expect(actual.metrics).toEqual(expected.metrics);
    expect(actual.diagnostics).toEqual(expected.diagnostics);
  });

  test('rejects a duplicate across the 1000-row batch boundary without partial aggregates', async () => {
    const f = fixture();
    const name = requireValue(f.input.archiveContract.entries[0]).entryName;
    const original = requireValue(requireValue(f.records.get(name))[0]);
    f.records.set(
      name,
      Array.from({ length: 1001 }, (_, i) => ({ ...original, 관리번호: `synthetic-${i % 1000}` })),
    );
    f.input.limits.maxRows = 2000;
    f.input.limits.maxTotalBytes = 10000000;
    const actual = await observeLicenseArchive(f.input, f.deps);
    expect(actual.complete).toBe(false);
    expect(actual.metrics).toBeNull();
    expect(actual.ingestion).toEqual([]);
    expect(actual.diagnostics[0]?.code).toBe('duplicate_exact_source_tuple');
  });

  test.each(['hash', 'count', 'headers', 'missing-category', 'metrics'] as const)(
    'rejects inconsistent aggregate finalization evidence: %s',
    async (kind) => {
      const f = fixture();
      const observed = await observeLicenseArchive(f.input, f.deps);
      const metrics = requireValue(observed.metrics);
      const ingestion = observed.ingestion;
      const entry = requireValue(ingestion[0]);
      if (kind === 'hash') entry.archiveSha256 = 'b'.repeat(64);
      if (kind === 'count') entry.rowCount++;
      if (kind === 'headers') entry.headers = [];
      if (kind === 'missing-category') ingestion.pop();
      if (kind === 'metrics') metrics.total.recordCount++;
      const result = finalizeResearchObservation(f.input, metrics, ingestion, observed.bytesRead);
      expect(result.kind).toBe('rejected');
      expect(result.complete).toBe(false);
      expect(result.metrics).toBeNull();
      expect(result.ingestion).toEqual([]);
      expect(JSON.stringify(result)).not.toContain('private-business');
    },
  );
});

describe('disk observation lifecycle', () => {
  test.each(['complete', 'read-failure', 'cleanup-failure'] as const)(
    'requires scratch cleanup before reporting %s',
    async (kind) => {
      const root = await mkdtemp(join(tmpdir(), 'oss-observer-disk-'));
      const f = fixture();
      let owned: ResearchIndexStore | undefined;
      try {
        if (kind === 'read-failure')
          f.deps.readEntry.mockImplementation(async function* () {
            yield new Uint8Array();
            throw new Error('private-path');
          });
        const result = await observeLicenseArchive(f.input, {
          ...f.deps,
          createIndexStore: async (_path: string, check: () => void) => {
            owned = await ResearchIndexStore.create(root, process.cwd(), check);
            if (kind === 'cleanup-failure')
              vi.spyOn(owned, 'cleanup').mockRejectedValueOnce(new Error('private-path'));
            return owned;
          },
        });
        expect(owned).toBeDefined();
        expect(result.complete).toBe(kind === 'complete');
        if (kind === 'cleanup-failure') {
          expect(result.diagnostics[0]?.code).toBe('observation_cleanup_failed');
          expect(result.metrics).toBeNull();
          expect(result.ingestion).toEqual([]);
          await owned?.cleanup();
        }
        expect(await readdir(root)).toEqual([]);
        expect(JSON.stringify(result)).not.toContain('private-path');
        if (kind === 'complete') expect(result.metrics?.total.collisionRecordCount).toBe(195);
      } finally {
        await rm(root, { recursive: true, force: true });
      }
    },
  );
  test('rejects the fixed heap stop before source processing', async () => {
    const f = fixture();
    const result = await observeLicenseArchive(f.input, { ...f.deps, heap: () => 1_610_612_737 });
    expect(result.complete).toBe(false);
    expect(result.metrics).toBeNull();
    expect(result.ingestion).toEqual([]);
    expect(result.diagnostics[0]?.code).toBe('observation_heap_exceeded');
    expect(f.deps.readEntry).not.toHaveBeenCalled();
  });
  test('preserves the heap-stop reason during an awaited disk write and removes scratch', async () => {
    const root = await mkdtemp(join(tmpdir(), 'oss-observer-disk-'));
    const f = fixture();
    let exhausted = false;
    try {
      const result = await observeLicenseArchive(f.input, {
        ...f.deps,
        heap: () => (exhausted ? 1_610_612_737 : 0),
        createIndexStore: async (_path, check) => {
          const store = await ResearchIndexStore.create(root, process.cwd(), check);
          const append = store.appendBatch.bind(store);
          vi.spyOn(store, 'appendBatch').mockImplementation(async (indexes) => {
            exhausted = true;
            await append(indexes);
          });
          return store;
        },
      });
      expect(result.complete).toBe(false);
      expect(result.metrics).toBeNull();
      expect(result.ingestion).toEqual([]);
      expect(result.diagnostics[0]?.code).toBe('observation_heap_exceeded');
      expect(await readdir(root)).toEqual([]);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});

test('V2 observation preserves complete V1 evidence except vocabulary diagnostics and unknown counts', async () => {
  expect(observation.observeLicenseArchiveV2).toBeTypeOf('function');
  const { input, deps, records } = fixture();
  for (const rows of records.values())
    Object.assign(requireValue(rows[0]), { 영업상태코드: '06', 영업상태명: '기타' });
  const legacy = await observeLicenseArchive(input, deps);
  const modern = await observation.observeLicenseArchiveV2(
    { ...input, validationVersion: 2, ...VOCABULARY_V2 },
    deps,
  );
  expect(modern).toMatchObject({
    observationVersion: 2,
    validationVersion: 2,
    ...VOCABULARY_V2,
    complete: true,
    kind: 'review_required',
    dataAsOf: null,
  });
  expect(modern.ingestion).toEqual(legacy.ingestion);
  expect(modern.metrics?.total.unknownPairCount).toBe(0);
  expect(legacy.metrics?.total.unknownPairCount).toBe(195);
  expect(modern.metrics?.total.statusCounts).toEqual(legacy.metrics?.total.statusCounts);
  expect(modern.diagnostics.map((d) => d.code)).toEqual([
    'baseline_review_required',
    'data_as_of_unverified',
    'policy_review_required',
  ]);
  expect(deps.hashArchive).toHaveBeenCalledTimes(4);
  const limited = await observation.observeLicenseArchiveV2(
    { ...input, validationVersion: 2, ...VOCABULARY_V2, limits: { ...input.limits, maxRows: 1 } },
    deps,
  );
  expect(limited).toMatchObject({
    observationVersion: 2,
    complete: false,
    metrics: null,
    ingestion: [],
  });
});

test('V2 observation rejects unbound vocabulary before source I/O', async () => {
  expect(observation.observeLicenseArchiveV2).toBeTypeOf('function');
  const { input, deps } = fixture();
  const result = await observation.observeLicenseArchiveV2(input, deps);
  expect(result.diagnostics[0]?.code).toBe('vocabulary_revision_mismatch');
  expect(result.complete).toBe(false);
  expect(deps.readEntry).not.toHaveBeenCalled();
  expect(deps.hashArchive).not.toHaveBeenCalled();
});

test('V2 disk observation retains future-pair review and cleans owned scratch on success and limit failure', async () => {
  const root = await mkdtemp(join(tmpdir(), 'oss-v2-observe-'));
  try {
    const { input, deps, records } = fixture();
    const first = requireValue([...records.values()][0]);
    Object.assign(requireValue(first[0]), { 영업상태코드: '07', 영업상태명: 'future' });
    const createIndexStore = () => ResearchIndexStore.create(root, process.cwd(), () => {});
    const bound = { ...input, validationVersion: 2 as const, ...VOCABULARY_V2 };
    const result = await observation.observeLicenseArchiveV2(bound, { ...deps, createIndexStore });
    expect(result.complete).toBe(true);
    expect(result.metrics?.total.unknownPairCount).toBe(1);
    expect(
      result.diagnostics.filter((d) => d.code === 'aggregate_pair_review_required'),
    ).toMatchObject([{ actual: 1 }]);
    expect(result.resources?.storage?.indexCount).toBeGreaterThan(0);
    expect(await readdir(root)).toEqual([]);
    const limited = await observation.observeLicenseArchiveV2(
      { ...bound, limits: { ...input.limits, maxRows: 1 } },
      { ...deps, createIndexStore },
    );
    expect(limited).toMatchObject({ complete: false, metrics: null, ingestion: [] });
    expect(await readdir(root)).toEqual([]);
    const legacy = await observeLicenseArchive(bound, deps);
    expect(legacy.diagnostics[0]?.code).toBe('vocabulary_revision_mismatch');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
