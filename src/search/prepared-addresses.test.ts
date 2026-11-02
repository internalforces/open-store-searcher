import { describe, expect, test } from 'vitest';
import { parseSearchAddress } from './compare-search-address.js';
import { PreparedAddresses } from './prepared-addresses.js';

describe('native prepared address values (FR-02, FR-03, FR-07)', () => {
  test('preserves every parsed field, exact key and input across sealing', () => {
    const values = [
      '',
      '서울특별시 강남구 테헤란로 123',
      '서울 강남구 역삼동 산 12-3',
      '서울특별시 강남구 테헤란로 123, 지하1층',
      '테헤란로 123 (역삼동 12)',
      '강남구 서초구 테헤란로 123',
      'unclassified A 112 12',
      '서울특별시 성북구 보문로 12길 3',
    ];
    const store = new PreparedAddresses();
    const parts = values.map(parseSearchAddress);
    const expected = structuredClone(parts);
    for (const [index, value] of values.entries()) {
      const part = parts[index];
      if (!part) throw new Error('Missing fixture address');
      expect(store.add(part, value)).toBe(index);
    }
    expect(parts).toEqual(expected);
    const changed = parts[1];
    if (!changed) throw new Error('Missing mutable fixture address');
    changed.district = 'changed after insertion';
    store.seal();
    expect(store.length).toBe(values.length);
    for (let index = 0; index < values.length; index++)
      expect(store.read(index)).toEqual(expected[index]);
    const target = parseSearchAddress('');
    for (let index = values.length - 1; index >= 0; index--)
      expect(store.read(index, target)).toEqual(expected[index]);
    expect(() => store.add(parseSearchAddress('추가동 1'))).toThrow();
    expect(() => store.read(-1)).toThrow();
    expect(() => store.read(values.length)).toThrow();
  });

  test('keeps earlier records through growth and reuses only an explicit query target', () => {
    const store = new PreparedAddresses();
    const expected = Array.from({ length: 1_025 }, (_, index) =>
      parseSearchAddress(`서울특별시 강남구 테헤란로 ${index + 1}`),
    );
    for (const parts of expected) store.add(parts);
    store.seal();
    store.seal();
    const first = store.read(0);
    const target = parseSearchAddress('');
    for (let index = 0; index < expected.length; index++) {
      expect(store.read(index, target)).toBe(target);
      expect(target).toEqual(expected[index]);
      expect(store.key(index)).toBe(expected[index]?.key);
    }
    expect(first).toEqual(expected[0]);
    expect(store.read(0)).not.toBe(first);
  });

  test('looks up query components without retaining unknown input or confusing missing evidence', () => {
    const store = new PreparedAddresses();
    for (const value of [
      '서울특별시 강남구 테헤란로 123',
      '서울특별시 강남구 역삼동 123',
      '서울특별시 서초구 반포대로 7',
      '',
    ])
      store.add(parseSearchAddress(value));
    store.seal();
    const count = store.componentCount;
    const district = store.componentReference('강남구');
    const road = store.componentReference('테헤란로');
    const missing = store.componentReference('not part of source data');
    expect(district).toBeGreaterThan(0);
    expect(road).toBeGreaterThan(0);
    expect(missing).toBe(-1);
    expect(store.componentReference('')).toBe(0);
    expect(store.componentCount).toBe(count);
    expect(store.isRelevant(0, district, 0, 'unspecified')).toBe(true);
    expect(store.isRelevant(1, district, 0, 'unspecified')).toBe(true);
    expect(store.isRelevant(2, district, 0, 'unspecified')).toBe(false);
    expect(store.isRelevant(0, 0, road, 'road')).toBe(true);
    expect(store.isRelevant(1, 0, road, 'road')).toBe(false);
    expect(store.isRelevant(3, missing, missing, 'unspecified')).toBe(false);
    expect(store.hasConflictingDistrict(0, district)).toBe(false);
    expect(store.hasConflictingDistrict(2, district)).toBe(true);
    expect(store.hasConflictingDistrict(3, district)).toBe(false);
    expect(store.hasConflictingDistrict(0, missing)).toBe(true);
    expect(store.hasConflictingDistrict(0, 0)).toBe(false);
  });
});
