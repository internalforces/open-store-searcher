import { describe, expect, test } from 'vitest';
import { compareSearchAddress, parseSearchAddress } from './compare-search-address.js';
import { interpretSearchQuery } from './interpret-search-query.js';
import { prepareSearchQuery } from './prepare-search-query.js';

function query(value: string) {
  const prepared = prepareSearchQuery(value);
  if (!prepared.ok) throw new Error('Invalid fixture');
  return interpretSearchQuery(prepared);
}

describe('TASK-012 address interpretation and comparison', () => {
  test('extracts name-first and address-first spans with attached road numbers', () => {
    for (const value of [
      '봄카페 서울 강남구 테헤란로12길34-5',
      '서울 강남구 테헤란로12길34-5 봄카페',
    ]) {
      expect(query(value)).toMatchObject({
        nameKey: '봄카페',
        ambiguous: false,
        address: {
          province: '서울특별시',
          district: '강남구',
          road: '테헤란로12길',
          number: '34-5',
          strong: true,
        },
      });
    }
    expect(query('강남구 역삼동 12-1')).toMatchObject({
      nameKey: '',
      ambiguous: false,
      address: { locality: '역삼동', number: '12-1', strong: true },
    });
  });
  test('keeps no-address names and flags weak, split, repeated and unsupported address interpretations', () => {
    expect(query('봄 카페')).toMatchObject({ nameKey: '봄 카페', address: null, ambiguous: false });
    for (const value of [
      '봄 강남구',
      '강남구 카페 역삼동 12',
      '강남구 서초구 테헤란로 12',
      '봄카페 강남구 테헤란로 12 101호',
    ]) {
      expect(query(value).ambiguous).toBe(true);
    }
    expect(query('카페 가로')).toMatchObject({ ambiguous: true });
  });
  test('recognizes partial district-locality evidence and Seoul aliases without source mutation', () => {
    expect(query('봄카페 강남구 역삼동')).toMatchObject({
      ambiguous: false,
      address: { core: true, strong: false },
    });
    const original = '서울시 강남구 테헤란로 12';
    const parsed = parseSearchAddress(original);
    expect(parsed.province).toBe('서울특별시');
    expect(
      compareSearchAddress(parsed, parseSearchAddress('서울특별시 강남구 테헤란로12')),
    ).toMatchObject({ match: 'exact', conflicts: [] });
    expect(original).toBe('서울시 강남구 테헤란로 12');
  });
  test.each([
    ['12', '120'],
    ['12-1', '121'],
    ['12', '012'],
    ['12-1', '12-2'],
  ])('compares complete number tokens %s versus %s', (left, right) => {
    expect(
      compareSearchAddress(
        parseSearchAddress(`강남구 테헤란로 ${left}`),
        parseSearchAddress(`강남구 테헤란로 ${right}`),
      ),
    ).toMatchObject({ match: 'none', conflicts: ['number'] });
  });
  test('distinguishes missing numbers from contradictory numbers and canonicalizes Unicode dashes', () => {
    expect(
      compareSearchAddress(
        parseSearchAddress('강남구 테헤란로 12'),
        parseSearchAddress('강남구 테헤란로'),
      ),
    ).toMatchObject({ match: 'none', conflicts: [] });
    expect(
      compareSearchAddress(parseSearchAddress('역삼동 12–1'), parseSearchAddress('역삼동 12-1')),
    ).toMatchObject({ match: 'exact', conflicts: [] });
  });
  test('does not compare road building numbers against parcel lot numbers', () => {
    expect(
      compareSearchAddress(
        parseSearchAddress('강남구 테헤란로 12'),
        parseSearchAddress('강남구 역삼동 999'),
      ),
    ).toMatchObject({ match: 'none', conflicts: [] });
  });
  test.each([
    ['서초구 테헤란로 12', 'district'],
    ['강남구 봉은사로 12', 'road'],
  ])('records explicit %s contradictions', (candidate, conflict) => {
    expect(
      compareSearchAddress(parseSearchAddress('강남구 테헤란로 12'), parseSearchAddress(candidate))
        .conflicts,
    ).toContain(conflict);
  });
  test('records parcel locality conflicts without converting between address systems', () => {
    expect(
      compareSearchAddress(
        parseSearchAddress('강남구 역삼동 12'),
        parseSearchAddress('강남구 삼성동 12'),
      ),
    ).toMatchObject({ match: 'none', conflicts: ['locality'] });
  });
  test('allows core agreement when candidate includes extra detail, never invents an exact match', () => {
    expect(
      compareSearchAddress(
        parseSearchAddress('강남구 테헤란로 12'),
        parseSearchAddress('서울 강남구 테헤란로 12 (역삼동)'),
      ),
    ).toMatchObject({ match: 'core', conflicts: [] });
    expect(compareSearchAddress(parseSearchAddress(''), parseSearchAddress(''))).toMatchObject({
      match: 'none',
      conflicts: [],
    });
  });
});
