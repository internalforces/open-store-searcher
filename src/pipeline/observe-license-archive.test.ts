import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, test, vi } from 'vitest';
import { parseArchiveContract } from './archive-contract.js';
import { observeLicenseArchive } from './observe-license-archive.js';
import { requireValue } from './refresh-validation-types.js';
import {
  parsePermissionManifest,
  SOURCE_ARCHIVE_URL,
  SOURCE_PROVIDER_FRESHNESS,
} from './source-contract.js';
import { CsvParseError } from './stream-csv.js';

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
