import { expect, test } from 'vitest';
import type { ArchiveAdapter } from './archive-adapter.js';
import { DEFAULT_COLLECTOR_LIMITS } from './collector-types.js';
import type { PermissionManifest } from './collector-types.js';
import { discoverArchiveContract } from './discover-archive-contract.js';

const manifest: PermissionManifest = {
  provider: '행정안전부',
  expectedCategoryCount: 195,
  verifiedCategoryCount: 195,
  permissionLabel: '이용허락범위 제한 없음',
  categories: ['문화_음반업', '식품_일반음식점'].map((title, index) => ({
    apiId: `api-${index}`,
    apiTitle: `행정안전부_${title} 조회서비스`,
    fileDataId: `file-${index}`,
    fileDataTitle: `행정안전부_${title}`,
    fileDataUrl: `https://www.data.go.kr/data/file-${index}/fileData.do`,
  })),
};

function adapter(names: string[]): ArchiveAdapter {
  return {
    async checkEnvironment() {
      return { ok: true };
    },
    async testIntegrity() {
      return { ok: true };
    },
    async listEntries() {
      return names.map((name) => ({ name, modifiedDate: '2026-08-28' }));
    },
    async readEntryPrefix() {
      return new TextEncoder().encode('사업장명,주소,최종수정시점\nrecord values are never read');
    },
  };
}

test('discovers a deterministic schema-only contract', async () => {
  const result = await discoverArchiveContract({
    adapter: adapter(['식품_일반음식점.csv', '문화_음반업.csv']),
    archivePath: '/tmp/source.zip',
    permissionManifest: manifest,
    limits: DEFAULT_COLLECTOR_LIMITS,
  });
  expect(result).toEqual({
    provider: '행정안전부',
    permissionLabel: '이용허락범위 제한 없음',
    expectedEntryCount: 2,
    entries: [
      expect.objectContaining({ entryName: '문화_음반업.csv', fileDataId: 'file-0' }),
      expect.objectContaining({ entryName: '식품_일반음식점.csv', fileDataId: 'file-1' }),
    ],
  });
  expect(JSON.stringify(result)).not.toContain('record values');
});

test('rejects a filename that cannot map uniquely to approved permission evidence', async () => {
  await expect(
    discoverArchiveContract({
      adapter: adapter(['unknown.csv', '문화_음반업.csv']),
      archivePath: '/tmp/source.zip',
      permissionManifest: manifest,
      limits: DEFAULT_COLLECTOR_LIMITS,
    }),
  ).rejects.toThrow('unique permission mapping');
});
