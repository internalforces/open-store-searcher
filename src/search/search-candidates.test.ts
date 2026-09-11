import { describe, expect, expectTypeOf, test } from 'vitest';
import { createSearchIndex, searchCandidates } from './search-candidates.js';

const record = (id: string, name: string, roadAddress = '', parcelAddress = '') => ({
  id,
  name,
  roadAddress,
  parcelAddress,
});

const matchIds = (result: ReturnType<typeof searchCandidates>) =>
  result.topMatches.map((match) => match.record.id);

const similarIds = (result: ReturnType<typeof searchCandidates>) =>
  result.similarCandidates.map((match) => match.record.id);

describe('TASK-012 candidate search and confidence (FR-03, FR-07)', () => {
  test('S01 reuses query normalization, preserves original records, and rejects invalid input', () => {
    const original = Object.freeze({
      ...record('unicode', '봄 카페 & 빵', '강남구 테헤란로 12'),
      status: Object.freeze({ raw: '01', processed: '행정상 영업' }),
    });
    const index = createSearchIndex([original] as const);
    const before = structuredClone(original);

    const normalized = searchCandidates(index, '  봄&nbsp;카페 &amp; 빵!!!  ');
    expect(normalized.topMatches).toEqual([]);
    expect(similarIds(normalized)).toEqual(['unicode']);
    expect(normalized.similarCandidates[0]).toMatchObject({
      record: original,
      nameMatch: 'exact',
      confidence: 'low',
    });
    expect(original).toEqual(before);
    expect(normalized.similarCandidates[0]?.record).toMatchObject({ status: before.status });

    for (const input of ['', '가', ' - () ']) {
      const result = searchCandidates(index, input);
      expect(result.validation.ok).toBe(false);
      expect(result.topMatches).toEqual([]);
      expect(result.similarCandidates).toEqual([]);
      expect(result.primaryMatch).toBeNull();
    }

    const guardedIndex = new Proxy(index, {
      get(target, key, receiver) {
        if (key === 'entries') throw new Error('invalid input must not scan indexed records');
        return Reflect.get(target, key, receiver);
      },
    });
    expect(() => searchCandidates(guardedIndex, '')).not.toThrow();

    const unmatched = searchCandidates(index, '없는상호');
    expect(unmatched.validation.ok).toBe(true);
    expect(unmatched.topMatches).toEqual([]);
    expect(unmatched.similarCandidates).toEqual([]);
    expect(unmatched.primaryMatch).toBeNull();
    expect(unmatched).not.toHaveProperty('status');
  });

  test('S02 interprets name-first, address-first, address-only, and ambiguous address spans', () => {
    const index = createSearchIndex([
      record('road', '봄카페', '강남구 테헤란로 12'),
      record('parcel', '봄카페', '', '강남구 역삼동 123'),
      record('address-word-name', '테헤란로카페'),
    ]);

    for (const query of ['봄카페 강남구 테헤란로12', '강남구 테헤란로12 봄카페']) {
      const result = searchCandidates(index, query);
      expect(matchIds(result)).toEqual(['road']);
      expect(result.topMatches[0]).toMatchObject({ confidence: 'high', score: 500 });
    }

    const addressOnly = searchCandidates(index, '강남구 테헤란로 12');
    expect(matchIds(addressOnly)).toEqual(['road']);
    expect(addressOnly.topMatches[0]).toMatchObject({
      confidence: 'medium',
      nameMatch: 'none',
      addressMatch: 'exact',
      score: 100,
    });

    const namelessAddress = searchCandidates(
      createSearchIndex([record('nameless-address', '', '강남구 테헤란로 12')]),
      '강남구 테헤란로 12',
    );
    expect(matchIds(namelessAddress)).toEqual(['nameless-address']);
    expect(namelessAddress.topMatches[0]).toMatchObject({
      confidence: 'medium',
      nameMatch: 'none',
      addressMatch: 'exact',
      score: 100,
    });

    const nameWithAddressWord = searchCandidates(index, '테헤란로카페');
    expect(nameWithAddressWord.topMatches).toEqual([]);
    expect(similarIds(nameWithAddressWord)).toEqual(['address-word-name']);

    const multiSpan = searchCandidates(index, '봄카페 강남구 테헤란로 12 강북구 도봉로 3');
    expect(multiSpan.topMatches).toEqual([]);
    expect(
      [...multiSpan.topMatches, ...multiSpan.similarCandidates].every(
        (match) => match.confidence === 'low',
      ),
    ).toBe(true);
  });

  test('S03 ranks exact and core evidence ahead of partial and name-only candidates', () => {
    const index = createSearchIndex([
      record('exact', '봄카페', '강남구 테헤란로 12'),
      record('core', '봄카페', '강남구 테헤란로 12 101호'),
      record('partial-name', '봄카페 플러스', '강남구 테헤란로 12 102호'),
      record('name-only', '봄카페'),
      record('missing', '', '', ''),
    ]);

    const result = searchCandidates(index, '봄카페 강남구 테헤란로 12');
    expect(matchIds(result)).toEqual(['exact', 'core', 'partial-name']);
    expect(result.topMatches.map((match) => [match.score, match.confidence])).toEqual([
      [500, 'high'],
      [400, 'medium'],
      [300, 'medium'],
    ]);
    expect(similarIds(result)).toEqual(['name-only']);
    expect(similarIds(result)).not.toContain('missing');

    const mismatchingName = searchCandidates(index, '다른상호 강남구 테헤란로 12');
    expect(mismatchingName.topMatches).toEqual([]);
    expect(similarIds(mismatchingName)).toContain('exact');
    expect(
      mismatchingName.similarCandidates.find((match) => match.record.id === 'exact'),
    ).toMatchObject({
      confidence: 'low',
    });

    const oneGraphemePartial = searchCandidates(
      createSearchIndex([record('one-grapheme-partial', '봄카페', '강남구 테헤란로 12')]),
      '봄 강남구 테헤란로 12',
    );
    expect(oneGraphemePartial.topMatches).toEqual([]);
    expect(similarIds(oneGraphemePartial)).toEqual(['one-grapheme-partial']);
    expect(oneGraphemePartial.similarCandidates[0]).toMatchObject({
      nameMatch: 'none',
      confidence: 'low',
    });
  });

  test('S04 keeps conflicting district, road, locality, and number evidence out of Top-3 and primary', () => {
    const roadIndex = createSearchIndex([
      record('road-match', '봄카페', '강남구 테헤란로 12'),
      record('wrong-district', '봄카페', '서초구 테헤란로 12'),
      record('wrong-road', '봄카페', '강남구 역삼로 12'),
      record('wrong-number', '봄카페', '강남구 테헤란로 13'),
    ]);
    const roadResult = searchCandidates(roadIndex, '봄카페 강남구 테헤란로 12');
    expect(matchIds(roadResult)).toEqual(['road-match']);
    expect(roadResult.primaryMatch?.record.id).toBe('road-match');
    expect(similarIds(roadResult)).toEqual(['wrong-district', 'wrong-number', 'wrong-road']);
    expect(roadResult.similarCandidates.every((match) => match.confidence === 'low')).toBe(true);

    const parcelIndex = createSearchIndex([
      record('parcel-match', '봄카페', '', '강남구 역삼동 123'),
      record('wrong-locality', '봄카페', '', '강남구 논현동 123'),
    ]);
    const parcelResult = searchCandidates(parcelIndex, '봄카페 강남구 역삼동 123');
    expect(matchIds(parcelResult)).toEqual(['parcel-match']);
    expect(similarIds(parcelResult)).toEqual(['wrong-locality']);
    expect(parcelResult.similarCandidates[0]).toMatchObject({ confidence: 'low' });
  });

  test('S05 compares complete numeric tokens, Unicode hyphens, and missing numbers conservatively', () => {
    const index = createSearchIndex([
      record('twelve', '숫자카페', '강남구 테헤란로 12'),
      record('one-twenty', '숫자카페', '강남구 테헤란로 120'),
      record('twelve-one', '숫자카페', '강남구 테헤란로 12-1'),
      record('one-twenty-one', '숫자카페', '강남구 테헤란로 121'),
      record('missing-number', '숫자카페', '강남구 테헤란로'),
    ]);

    for (const [query, id] of [
      ['숫자카페 강남구 테헤란로 12', 'twelve'],
      ['숫자카페 강남구 테헤란로 120', 'one-twenty'],
      ['숫자카페 강남구 테헤란로 12‑1', 'twelve-one'],
      ['숫자카페 강남구 테헤란로 121', 'one-twenty-one'],
    ] as const) {
      const result = searchCandidates(index, query);
      expect(matchIds(result)).toEqual([id]);
      expect(result.primaryMatch?.record.id).toBe(id);
      expect(similarIds(result)).toContain('missing-number');
      expect(
        result.similarCandidates.find((match) => match.record.id === 'missing-number'),
      ).toMatchObject({
        confidence: 'low',
      });
      for (const otherId of ['twelve', 'one-twenty', 'twelve-one', 'one-twenty-one'].filter(
        (candidateId) => candidateId !== id,
      )) {
        expect(similarIds(result)).toContain(otherId);
        expect(result.similarCandidates.find((match) => match.record.id === otherId)).toMatchObject(
          {
            confidence: 'low',
          },
        );
      }
    }
  });

  test('S06 keeps road and parcel comparison independent and does not union fields', () => {
    const index = createSearchIndex([
      record('road', '봄카페', '강남구 테헤란로 12'),
      record('parcel', '봄카페', '', '강남구 역삼동 123'),
      record('split-fields', '봄카페', '강남구 테헤란로', '역삼동 12'),
      record('alternate-family', '봄카페', '강남구 테헤란로 12', '강남구 역삼동 77'),
      record('contradictory-alternate', '봄카페', '강남구 테헤란로 12', '서초구 방배동 77'),
    ]);

    const roadResult = searchCandidates(index, '봄카페 강남구 테헤란로 12');
    expect(matchIds(roadResult)).toEqual(['alternate-family', 'road']);
    expect(similarIds(roadResult)).toContain('split-fields');
    expect(similarIds(roadResult)).toContain('contradictory-alternate');
    expect(
      roadResult.topMatches.find((match) => match.record.id === 'alternate-family'),
    ).toMatchObject({
      confidence: 'high',
    });
    expect(
      roadResult.similarCandidates.find((match) => match.record.id === 'contradictory-alternate'),
    ).toMatchObject({ confidence: 'low' });

    const parcelResult = searchCandidates(index, '봄카페 강남구 역삼동 123');
    expect(matchIds(parcelResult)).toEqual(['parcel']);
    expect(similarIds(parcelResult)).toContain('split-fields');
  });

  test('S07 separates high, medium, and low confidence without mutating status data', () => {
    const original = Object.freeze({
      ...record('high', '봄카페', '강남구 테헤란로 12'),
      status: Object.freeze({ raw: '01', processed: '행정상 영업' }),
    });
    const index = createSearchIndex([
      original,
      record('medium', '봄카페', '강남구 테헤란로 12 101호'),
      record('low', '봄카페'),
    ]);

    const result = searchCandidates(index, '봄카페 강남구 테헤란로 12');
    expect(matchIds(result)).toEqual(['high', 'medium']);
    expect(result.topMatches.map((match) => match.confidence)).toEqual(['high', 'medium']);
    expect(similarIds(result)).toEqual(['low']);
    expect(result.similarCandidates[0]?.confidence).toBe('low');
    for (const match of [...result.topMatches, ...result.similarCandidates]) {
      expect(match.reasons.length).toBeGreaterThan(0);
      expect(match.reasons.every((reason) => typeof reason === 'string')).toBe(true);
    }
    expect(result.topMatches[0]?.record).toBe(original);
    expect(original.status).toEqual({ raw: '01', processed: '행정상 영업' });
  });

  test('S08 returns deterministic Top-3 counts, keeps low matches separate, and suppresses tied primary matches', () => {
    const eligible = [
      record('d', '봄카페', '강남구 테헤란로 12'),
      record('b', '봄카페', '강남구 테헤란로 12'),
      record('a', '봄카페', '강남구 테헤란로 12'),
      record('c', '봄카페', '강남구 테헤란로 12'),
    ];

    for (const count of [0, 1, 2, 3, 4]) {
      const result = searchCandidates(
        createSearchIndex(eligible.slice(0, count)),
        '봄카페 강남구 테헤란로 12',
      );
      expect(result.eligibleCount).toBe(count);
      expect(result.topMatches).toHaveLength(Math.min(count, 3));
      expect(result.similarCount).toBe(0);
    }

    const withLow = createSearchIndex([...eligible, record('low', '봄카페')]);
    const first = searchCandidates(withLow, '봄카페 강남구 테헤란로 12');
    const permuted = searchCandidates(
      createSearchIndex([...eligible].reverse().concat(record('low', '봄카페'))),
      '봄카페 강남구 테헤란로 12',
    );
    expect(matchIds(first)).toEqual(['a', 'b', 'c']);
    expect(matchIds(permuted)).toEqual(matchIds(first));
    expect(first.eligibleCount).toBe(4);
    expect(similarIds(first)).toEqual(['low']);
    expect(first.similarCount).toBe(1);
    expect(first.primaryMatch).toBeNull();
    expect(first.ambiguousTop).toBe(true);
  });

  test('S09 excludes malformed records and duplicate-ID groups without merging distinct records', () => {
    const index = createSearchIndex([
      null,
      {},
      { id: 7, name: '봄카페', roadAddress: '', parcelAddress: '' },
      { id: 'wrong-name', name: null, roadAddress: '', parcelAddress: '' },
      record('duplicate', '봄카페', '강남구 테헤란로 12'),
      record('duplicate', '봄카페', '강남구 테헤란로 12'),
      record('distinct-a', '봄카페', '강남구 테헤란로 12'),
      record('distinct-b', '봄카페', '강남구 테헤란로 12'),
    ]);

    const result = searchCandidates(index, '봄카페 강남구 테헤란로 12');
    expect(result.diagnostics).toEqual({ invalidRecordCount: 4, duplicateIdRecordCount: 2 });
    expect(matchIds(result)).toEqual(['distinct-a', 'distinct-b']);
    expect([...matchIds(result), ...similarIds(result)]).not.toContain('duplicate');
  });
});

test('S03 retrieves literal partial address text without treating numeric prefixes as matches', () => {
  const index = createSearchIndex([
    record('twelve', '상점A', '강남구 테헤란로 12'),
    record('one-twenty', '상점B', '강남구 테헤란로 120'),
    record('hyphen', '상점C', '강남구 테헤란로 12-1'),
  ]);
  const text = searchCandidates(index, '테헤란');
  expect(text.topMatches).toEqual([]);
  expect(similarIds(text)).toEqual(['hyphen', 'one-twenty', 'twelve']);
  expect(text.similarCandidates.every((match) => match.confidence === 'low')).toBe(true);
  expect(similarIds(searchCandidates(index, '12'))).toEqual(['twelve']);
  expect(similarIds(searchCandidates(index, '12-1'))).toEqual(['hyphen']);
});

test('preserves source and status types on original record references', () => {
  const original = {
    ...record('typed', '봄카페', '강남구 테헤란로 12'),
    rawStatus: '01',
    processedStatus: '행정상 영업',
    source: 'synthetic-source',
    dataAsOf: '2026-09-05',
  };
  const index = createSearchIndex([original]);
  const result = searchCandidates(index, '봄카페 강남구 테헤란로 12');
  expectTypeOf(result.primaryMatch?.record).toEqualTypeOf<typeof original | undefined>();
  expectTypeOf(index.entries[0]?.record).toEqualTypeOf<typeof original | undefined>();
  expect(result.primaryMatch?.record).toBe(original);
  expect(result.primaryMatch?.record.rawStatus).toBe('01');
  expect(result.primaryMatch?.record.source).toBe('synthetic-source');
  expect(result.primaryMatch?.record.dataAsOf).toBe('2026-09-05');
});
