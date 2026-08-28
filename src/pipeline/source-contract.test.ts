import { describe, expect, test } from 'vitest';
import {
  createProviderHeaders,
  isAllowedProviderUrl,
  parsePermissionManifest,
} from './source-contract.js';

function categories() {
  return Array.from({ length: 195 }, (_, index) => ({
    apiId: `api-${index}`,
    apiTitle: `행정안전부_분류-${index} 조회서비스`,
    fileDataId: String(index),
    fileDataTitle: `행정안전부_분류-${index}`,
    fileDataUrl: `https://www.data.go.kr/data/${index}/fileData.do`,
  }));
}

describe('parsePermissionManifest', () => {
  test('accepts 195 unique approved category mappings', () => {
    const result = parsePermissionManifest({
      provider: '행정안전부',
      expectedCategoryCount: 195,
      verifiedCategoryCount: 195,
      permissionLabel: '이용허락범위 제한 없음',
      categories: categories(),
    });
    expect(result.categories).toHaveLength(195);
  });

  test('rejects duplicate file identifiers and mismatched titles', () => {
    const duplicate = categories();
    const first = duplicate[0];
    const second = duplicate[1];
    if (!first || !second) throw new Error('test fixture is incomplete');
    duplicate[1] = { ...second, fileDataId: first.fileDataId };
    expect(() =>
      parsePermissionManifest({
        provider: '행정안전부',
        expectedCategoryCount: 195,
        verifiedCategoryCount: 195,
        permissionLabel: '이용허락범위 제한 없음',
        categories: duplicate,
      }),
    ).toThrow('duplicate file-data identifier');

    const mismatch = categories();
    const initial = mismatch[0];
    if (!initial) throw new Error('test fixture is incomplete');
    mismatch[0] = { ...initial, fileDataTitle: '행정안전부_다른분류' };
    expect(() =>
      parsePermissionManifest({
        provider: '행정안전부',
        expectedCategoryCount: 195,
        verifiedCategoryCount: 195,
        permissionLabel: '이용허락범위 제한 없음',
        categories: mismatch,
      }),
    ).toThrow('title mapping');
  });
});

test('allows only HTTPS requests to the approved provider host', () => {
  expect(isAllowedProviderUrl('https://file.localdata.go.kr/file/download-all')).toBe(true);
  expect(isAllowedProviderUrl('http://file.localdata.go.kr/file/download-all')).toBe(false);
  expect(isAllowedProviderUrl('https://example.com/file/download-all')).toBe(false);
});

test('creates fixed credential-free headers', () => {
  expect(createProviderHeaders('archive')).toEqual({
    accept: 'application/zip, application/octet-stream;q=0.9',
    referer: 'https://www.data.go.kr/',
    'user-agent':
      'Mozilla/5.0 (compatible; open-store-searcher/0.1; +https://github.com/internalforces/open-store-searcher)',
  });
});
