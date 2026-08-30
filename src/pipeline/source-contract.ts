import type {
  PermissionCategory,
  PermissionManifest,
  ProviderFreshnessEvidence,
} from './collector-types.js';

export const SOURCE_INFO_URL = 'https://file.localdata.go.kr/file/general_restaurants/info';
export const SOURCE_LIMIT_URL = 'https://file.localdata.go.kr/file/validate/download-count';
export const SOURCE_ARCHIVE_URL =
  'https://file.localdata.go.kr/file/download-all?orgCode=6110000_ALL';
export const SOURCE_PROVIDER_FRESHNESS: ProviderFreshnessEvidence = Object.freeze({
  updateCadence: 'daily',
  coverageLagDays: 2,
  sourceUrl: 'https://www.data.go.kr/data/15045016/fileData.do',
});
export const APPROVED_ARCHIVE_ENTRY_ALIASES: Readonly<Record<string, string>> = Object.freeze({
  '자원환경_단독정화조-오수처리시설설계시공업.csv': '15045011',
});

const PROVIDER_HOST = 'file.localdata.go.kr';
const USER_AGENT =
  'Mozilla/5.0 (compatible; open-store-searcher/0.1; +https://github.com/internalforces/open-store-searcher)';

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('permission manifest must be an object');
  }
  return value as Record<string, unknown>;
}

function stringField(value: unknown, name: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`permission manifest ${name} is invalid`);
  }
  return value;
}

export function parsePermissionManifest(value: unknown): PermissionManifest {
  const input = record(value);
  if (input.provider !== '행정안전부' || input.permissionLabel !== '이용허락범위 제한 없음') {
    throw new Error('permission manifest provider or permission changed');
  }
  if (input.expectedCategoryCount !== 195 || input.verifiedCategoryCount !== 195) {
    throw new Error('permission manifest category count changed');
  }
  if (!Array.isArray(input.categories) || input.categories.length !== 195) {
    throw new Error('permission manifest must contain exactly 195 categories');
  }

  const apiIds = new Set<string>();
  const fileIds = new Set<string>();
  const categories: PermissionCategory[] = input.categories.map((unknownCategory) => {
    const category = record(unknownCategory);
    const apiId = stringField(category.apiId, 'apiId');
    const apiTitle = stringField(category.apiTitle, 'apiTitle');
    const fileDataId = stringField(category.fileDataId, 'fileDataId');
    const fileDataTitle = stringField(category.fileDataTitle, 'fileDataTitle');
    const fileDataUrl = stringField(category.fileDataUrl, 'fileDataUrl');
    if (apiIds.has(apiId)) throw new Error('duplicate API identifier');
    if (fileIds.has(fileDataId)) throw new Error('duplicate file-data identifier');
    apiIds.add(apiId);
    fileIds.add(fileDataId);
    if (apiTitle !== `${fileDataTitle} 조회서비스`) {
      throw new Error('permission manifest title mapping changed');
    }
    const url = new URL(fileDataUrl);
    if (
      url.protocol !== 'https:' ||
      url.hostname !== 'www.data.go.kr' ||
      url.pathname !== `/data/${fileDataId}/fileData.do` ||
      url.search !== ''
    ) {
      throw new Error('permission manifest file-data URL changed');
    }
    return { apiId, apiTitle, fileDataId, fileDataTitle, fileDataUrl };
  });

  return {
    provider: '행정안전부',
    expectedCategoryCount: 195,
    verifiedCategoryCount: 195,
    permissionLabel: '이용허락범위 제한 없음',
    categories,
  };
}

export function isAllowedProviderUrl(value: string | URL): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === PROVIDER_HOST;
  } catch {
    return false;
  }
}

export function createProviderHeaders(kind: 'archive' | 'limit'): Record<string, string> {
  return {
    accept: kind === 'archive' ? 'application/zip, application/octet-stream;q=0.9' : '*/*',
    referer: 'https://www.data.go.kr/',
    'user-agent': USER_AGENT,
  };
}
