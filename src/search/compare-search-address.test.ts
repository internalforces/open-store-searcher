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

test('recognizes an explicit Seoul boundary after address-like business names in either order', () => {
  for (const name of ['별담문구', '신사동']) {
    for (const input of [
      `${name} 서울특별시 강서구 화곡로 87`,
      `서울특별시 강서구 화곡로 87 ${name}`,
    ]) {
      expect(query(input)).toMatchObject({
        nameKey: name,
        ambiguous: false,
        address: { province: '서울특별시', district: '강서구', road: '화곡로', number: '87' },
      });
    }
  }
});

test('does not discard known district contradictions while locating an explicit boundary', () => {
  for (const input of [
    '강남구 서울특별시 서초구 테헤란로 12',
    '봄카페 서울특별시 강남구 서초구 테헤란로 12',
    '봄카페 강남구 테헤란로 12 서초구',
  ])
    expect(query(input).ambiguous).toBe(true);
});

test('does not trust a province token without a known Seoul district boundary', () => {
  expect(query('테스트 서울특별시 전주구 가상로 12').ambiguous).toBe(true);
});

test('preserves a complete detailed address after an explicit name-first Seoul boundary', () => {
  const input = '달빛식당 서울특별시 강남구 테헤란로 12, 가상빌딩 지하1층 101호 (역삼동)';
  const result = query(input);
  expect(result.nameKey).toBe('달빛식당');
  expect(result.ambiguous).toBe(false);
  expect(result.address?.key).toBe(parseSearchAddress(input.slice('달빛식당 '.length)).key);
});

test('parses numbered legal localities without treating their lot numbers as ambiguous', () => {
  for (const locality of ['명륜2가', '성수동2가', '충정로3가']) {
    expect(parseSearchAddress(`서울특별시 종로구 ${locality} 12-1`)).toMatchObject({
      locality,
      number: '12-1',
      family: 'parcel',
      strong: true,
      ambiguous: false,
    });
  }
});

test('separates building and floor detail from administrative locality and primary number', () => {
  for (const detail of [
    '173동 10호',
    '상가동 103,104호',
    'B1-동 25호호',
    '지상1층 1,2호',
    '1,4층',
  ]) {
    expect(parseSearchAddress(`서울특별시 강북구 수유동 173-10 ${detail}`)).toMatchObject({
      locality: '수유동',
      number: '173-10',
      strong: true,
      ambiguous: false,
    });
  }
});

test('keeps parenthesized parcel annotations separate from road building numbers', () => {
  const parts = parseSearchAddress('서울특별시 용산구 한림말5길 11 (옥수동, 365-6 지상1층)');
  expect(parts).toMatchObject({
    road: '한림말5길',
    number: '11',
    locality: '옥수동',
    ambiguous: false,
  });
  expect(parseSearchAddress('서울특별시 강남구 테헤란로 12 (서초구)')).toMatchObject({
    ambiguous: true,
  });
});

test('preserves mountain lot qualifiers as conflicting numeric evidence', () => {
  const mountain = parseSearchAddress('서울특별시 동작구 상도1동 산 131-0');
  expect(mountain).toMatchObject({
    locality: '상도1동',
    number: '산 131-0',
    strong: true,
    ambiguous: false,
  });
  expect(
    compareSearchAddress(mountain, parseSearchAddress('서울특별시 동작구 상도1동 131-0')).conflicts,
  ).toContain('number');
});

test('R1 preserves parenthesized localities in address-only queries', () => {
  for (const input of [
    '서울특별시 영등포구 신길로34길 14 (신길동)',
    '영등포구 신길로34길14 (신길동)',
    '서울특별시 양천구 화곡로3길 3, 1층 1호 (신월동)',
    '서울특별시 양천구 화곡로3길 3,1층 1호 (신월동)',
    '서울특별시 성동구 한림말5길 11 (옥수동, 365-6 지상1층)',
  ]) {
    expect(query(input)).toMatchObject({ nameKey: '', ambiguous: false });
    expect(query(input).address).toEqual(parseSearchAddress(input));
  }
  expect(query('서울특별시 영등포구 신길로34길 14 신사동')).toMatchObject({
    nameKey: '신사동',
    inferredNameBoundary: true,
    ambiguous: false,
  });
  expect(query('서울특별시 영등포구 신길로34길 14 (신길동, 강남구)').ambiguous).toBe(true);
});

test.each(['지상1층104,105호', '3층3066', '지하1층101호', '1,3층104,105호'])(
  'R3 consumes adjacent floor and unit notation atomically: %s',
  (detail) => {
    expect(parseSearchAddress(`서울특별시 강남구 대치동 989-0 ${detail}`)).toMatchObject({
      locality: '대치동',
      number: '989-0',
      ambiguous: false,
    });
    expect(parseSearchAddress(`서울특별시 강남구 대치동 989-0 ${detail} 999`).ambiguous).toBe(true);
  },
);
