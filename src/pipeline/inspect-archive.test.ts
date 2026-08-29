import { describe, expect, test } from 'vitest';
import type { ArchiveAdapter, ArchiveEntry } from './archive-adapter.js';
import type { ArchiveContract } from './archive-contract.js';
import { DEFAULT_COLLECTOR_LIMITS } from './collector-types.js';
import type { PermissionManifest } from './collector-types.js';
import { inspectArchive } from './inspect-archive.js';

const header = new TextEncoder().encode('사업장명,주소,최종수정시점\n');
const permissionManifest: PermissionManifest = {
  provider: '행정안전부',
  expectedCategoryCount: 195,
  verifiedCategoryCount: 195,
  permissionLabel: '이용허락범위 제한 없음',
  categories: ['a', 'b'].map((name) => ({
    apiId: `api-${name}`,
    apiTitle: `행정안전부_${name} 조회서비스`,
    fileDataId: `file-${name}`,
    fileDataTitle: `행정안전부_${name}`,
    fileDataUrl: `https://www.data.go.kr/data/file-${name}/fileData.do`,
  })),
};
const contract: ArchiveContract = {
  provider: '행정안전부',
  permissionLabel: '이용허락범위 제한 없음',
  expectedEntryCount: 2,
  entries: ['a', 'b'].map((name) => ({
    entryName: `category-${name}.csv`,
    fileDataId: `file-${name}`,
    encoding: 'utf-8',
    delimiter: ',',
    headers: ['사업장명', '주소', '최종수정시점'],
    timestampFields: ['최종수정시점'],
  })),
};

class MemoryAdapter implements ArchiveAdapter {
  readonly entries: ArchiveEntry[];
  readonly integrity: boolean;
  readonly bytes: Map<string, Uint8Array>;

  constructor(
    entries: ArchiveEntry[],
    integrity = true,
    bytes = new Map(contract.entries.map((entry) => [entry.entryName, header])),
  ) {
    this.entries = entries;
    this.integrity = integrity;
    this.bytes = bytes;
  }
  async checkEnvironment() {
    return { ok: true };
  }
  async testIntegrity() {
    return { ok: this.integrity };
  }
  async listEntries() {
    return this.entries;
  }
  async readEntryPrefix(_archivePath: string, entryName: string) {
    const value = this.bytes.get(entryName);
    if (!value) throw new Error('missing');
    return value;
  }
}

const entries = (dates = ['2026-08-25', '2026-08-25']): ArchiveEntry[] =>
  contract.entries.map((entry, index) => ({
    name: entry.entryName,
    modifiedDate: dates[index] ?? '',
  }));

function inspect(adapter: ArchiveAdapter, selectedContract: ArchiveContract = contract) {
  return inspectArchive({
    adapter,
    archivePath: '/tmp/source.zip',
    permissionManifest,
    contract: selectedContract,
    limits: DEFAULT_COLLECTOR_LIMITS,
  });
}

describe('inspectArchive', () => {
  test('accepts an exact contract and creates deterministic schema evidence', async () => {
    const result = await inspect(new MemoryAdapter(entries()));
    expect(result).toMatchObject({
      kind: 'accepted',
      evidence: {
        entryCount: 2,
        providerModifiedDate: '2026-08-25',
        schemaManifestSha256: expect.stringMatching(/^[a-f0-9]{64}$/),
      },
    });
    await expect(inspect(new MemoryAdapter(entries().reverse()))).resolves.toEqual(result);
  });

  test.each(['', '/absolute.csv', '../escape.csv', 'dir\\entry.csv', '-option.csv'])(
    'rejects unsafe entry name %j',
    async (name) => {
      await expect(
        inspect(new MemoryAdapter([{ name, modifiedDate: '2026-08-25' }])),
      ).resolves.toMatchObject({
        kind: 'rejected',
        code: 'archive_entry_unsafe',
      });
    },
  );

  test('rejects corruption, missing categories, and mixed timestamps', async () => {
    await expect(inspect(new MemoryAdapter(entries(), false))).resolves.toMatchObject({
      kind: 'rejected',
      code: 'archive_corrupt',
    });
    await expect(inspect(new MemoryAdapter(entries().slice(0, 1)))).resolves.toMatchObject({
      kind: 'rejected',
      code: 'category_manifest_changed',
    });
    await expect(
      inspect(new MemoryAdapter(entries(['2026-08-25', '2026-08-26']))),
    ).resolves.toMatchObject({ kind: 'rejected', code: 'timestamp_evidence_inconsistent' });
  });

  test.each(['2026-00-00', '2026-02-30', '2026-13-01'])(
    'rejects impossible archive modification date %s',
    async (date) => {
      await expect(inspect(new MemoryAdapter(entries([date, date])))).resolves.toMatchObject({
        kind: 'rejected',
        code: 'timestamp_evidence_inconsistent',
      });
    },
  );

  test('rejects permission and CSV schema drift', async () => {
    await expect(
      inspect(new MemoryAdapter(entries()), { ...contract, permissionLabel: 'changed' }),
    ).resolves.toMatchObject({ kind: 'rejected', code: 'permission_manifest_changed' });
    const bytes = new Map(contract.entries.map((entry) => [entry.entryName, header]));
    bytes.set('category-a.csv', new TextEncoder().encode('사업장명,다른주소,최종수정시점\n'));
    await expect(inspect(new MemoryAdapter(entries(), true, bytes))).resolves.toMatchObject({
      kind: 'rejected',
      code: 'csv_contract_changed',
    });
  });
});
