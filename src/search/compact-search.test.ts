import { describe, expect, test, vi } from 'vitest';
import {
  type CompactBlock,
  type CompactManifest,
  type CompactRecord,
  type Dictionaries,
  encodeColumns,
  flattenRecord,
} from '../shared/compact-data.js';
import { CompactSearch } from './compact-search.js';
import * as addressComparison from './compare-search-address.js';
import * as candidateScoring from './search-candidates.js';
import { createSearchIndex, searchCandidates } from './search-candidates.js';

const archiveSha256 = 'a'.repeat(64);
const dictionaries: Dictionaries = Array.from({ length: 21 }, () => null);

function id(value: number): string {
  return value.toString(16).padStart(64, '0');
}

function record(
  value: number,
  name: string,
  roadAddress = '',
  parcelAddress = '',
  processedStatus = '행정상 영업',
): CompactRecord {
  return {
    id: id(value),
    name,
    roadAddress,
    parcelAddress,
    categoryName: `category-${value}`,
    businessTypes: [{ sourceField: '업태구분명', value: `type-${value}` }],
    rawStatus: {
      operatingCode: processedStatus === '확인되지 않음' ? '99' : '01',
      operatingName: processedStatus === '확인되지 않음' ? '새 상태' : '영업/정상',
      detailedCode: null,
      detailedName: '',
    },
    processedStatus,
    lifecycle: {
      licensedOn: '2020-01-01',
      licenseCancelledOn: null,
      suspendedFrom: '',
      suspendedThrough: null,
      reopenedOn: '',
      closedOn: null,
      sourceUpdatedAt: `source-${value}`,
      sourceLastModifiedAt: '',
    },
    sourceLabel: '행정안전부',
    sourceUrl: 'https://www.data.go.kr/',
  };
}

function fixture(records: readonly CompactRecord[], blockSize = 23) {
  const blocks: CompactBlock[] = [];
  const entries: CompactManifest['entries'][number][] = [];
  for (let start = 0; start < records.length; start += blockSize) {
    const rows = records.slice(start, start + blockSize).map(flattenRecord);
    const columns = encodeColumns(rows, dictionaries);
    const count = rows.length;
    for (const [role, selected] of [
      ['search', columns.slice(0, 4)],
      ['evidence', columns.slice(4)],
    ] as const) {
      const sha256 = (entries.length + 1).toString(16).repeat(64).slice(0, 64);
      entries.push({
        name: `assets/compact-${sha256}.json`,
        sha256,
        byteLength: 1,
        role,
        start,
        count,
      });
      blocks.push({ version: 1, archiveSha256, role, start, count, columns: selected });
    }
  }
  const dictionarySha256 = 'f'.repeat(64);
  entries.push({
    name: `assets/compact-${dictionarySha256}.json`,
    sha256: dictionarySha256,
    byteLength: 1,
    role: 'dictionaries',
    start: 0,
    count: 0,
  });
  const manifest: CompactManifest = {
    version: 1,
    kind: 'compact-dataset',
    schemaVersion: 2,
    identifierContractVersion: 1,
    normalizationContractVersion: 1,
    archiveSha256,
    policyRevision: 'test-policy',
    dateBasis: 'collection',
    sourceDataAsOf: null,
    recordCount: records.length,
    orderedIdsSha256: 'b'.repeat(64),
    metadata: {
      sourceLabel: '행정안전부',
      sourceUrl: 'https://www.data.go.kr/',
      coverage: { kind: 'collected', date: '2026-09-14' },
      exampleQuery: '봄카페 서울특별시 강남구 테헤란로 12',
    },
    entries,
  };
  return { manifest, blocks, dictionaries };
}

function representativeRecords(): CompactRecord[] {
  const broad = Array.from({ length: 47 }, (_, index) =>
    record(300 - index, `강남상점${index}`, `서울특별시 강남구 테헤란로 ${100 + index}`),
  );
  return [
    ...broad,
    record(5, '별빛카페', '서울특별시 마포구 월드컵로 20'),
    record(4, '봄카페', '서울특별시 강남구 테헤란로 12'),
    record(2, '봄카페', '서울특별시 강남구 테헤란로 12'),
    record(3, '봄카페', '서울특별시 서초구 테헤란로 12'),
    record(1, '숫자가게', '서울특별시 송파구 올림픽로 12', '', '확인되지 않음'),
  ];
}

async function expectCompleteOracleParity(
  store: CompactSearch,
  records: readonly CompactRecord[],
  query: string,
) {
  const oracle = searchCandidates(createSearchIndex(records), query);
  await store.search(query);
  const pageCount = Math.max(1, Math.ceil(oracle.similarCount / 20));
  const completeSimilar: typeof oracle.similarCandidates = [];
  for (let page = 0; page < pageCount; page++) {
    const actual = store.page(page);
    expect(actual.page).toBe(page);
    expect(actual.validation).toEqual(oracle.validation);
    expect(actual.topMatches).toEqual(oracle.topMatches);
    expect(actual.eligibleCount).toBe(oracle.eligibleCount);
    expect(actual.similarCount).toBe(oracle.similarCount);
    expect(actual.primaryMatch).toEqual(oracle.primaryMatch);
    expect(actual.ambiguousTop).toBe(oracle.ambiguousTop);
    expect(actual.diagnostics).toEqual(oracle.diagnostics);
    expect(actual.similarCandidates).toEqual(
      oracle.similarCandidates.slice(page * 20, page * 20 + 20),
    );
    completeSimilar.push(...(actual.similarCandidates as typeof oracle.similarCandidates));
  }
  expect(completeSimilar).toEqual(oracle.similarCandidates);
}

describe('TASK-008 compact complete search (FR-02, FR-03, FR-07)', () => {
  test('owns packed column references and releases source containers without changing input', async () => {
    const records = representativeRecords();
    const input = fixture(records);
    const original = JSON.stringify(input.blocks);
    const store = new CompactSearch(input.manifest, input.blocks, input.dictionaries);
    await store.prepare();
    const prepared = store as unknown as {
      blocks: readonly CompactBlock[] | null;
      preparedBlocks: { block: CompactBlock; evidence: CompactBlock }[];
    };
    const packed = prepared.preparedBlocks.flatMap(({ block, evidence }) => [block, evidence]);
    const columns = packed.flatMap((block) => block.columns).filter((column) => 'refs' in column);
    expect(columns.length).toBeGreaterThan(0);
    expect(columns.every((column) => 'refs' in column && column.refs instanceof Uint32Array)).toBe(
      true,
    );
    expect(prepared.blocks).toBeNull();
    expect(JSON.stringify(input.blocks)).toBe(original);
    for (const block of packed) {
      const source = input.blocks.find(
        (value) => value.role === block.role && value.start === block.start,
      );
      expect(block).not.toBe(source);
      block.columns.forEach((column, index) => {
        if ('refs' in column) {
          const before = source?.columns[index];
          expect(before && 'refs' in before && Array.from(column.refs)).toEqual(
            before && 'refs' in before ? before.refs : null,
          );
        }
      });
    }
    for (const query of ['강남구', '봄카페', '테헤란로 123'])
      await expectCompleteOracleParity(store, records, query);
  });

  test('retains original data for retry when cancellation arrives while packing evidence references', async () => {
    const records = representativeRecords();
    const input = fixture(records);
    const original = JSON.stringify(input.blocks);
    const column = input.blocks
      .find((block) => block.role === 'evidence')
      ?.columns.find((value) => 'refs' in value);
    if (!column || !('refs' in column)) throw new Error('Fixture needs evidence references');
    const descriptor = Object.getOwnPropertyDescriptor(column.refs, '0') as PropertyDescriptor;
    const value = column.refs[0];
    const controller = new AbortController();
    Object.defineProperty(column.refs, '0', {
      configurable: true,
      enumerable: true,
      get() {
        controller.abort();
        return value;
      },
    });
    const store = new CompactSearch(input.manifest, input.blocks, input.dictionaries);
    try {
      await expect(store.prepare(controller.signal)).rejects.toMatchObject({ name: 'AbortError' });
    } finally {
      Object.defineProperty(column.refs, '0', descriptor);
    }
    const retryable = (store as unknown as { blocks: CompactBlock[] }).blocks;
    expect(retryable).not.toBe(input.blocks);
    expect(retryable).toHaveLength(input.blocks.length);
    expect(
      retryable[0]?.columns.some((value) => 'refs' in value && value.refs instanceof Uint32Array),
    ).toBe(true);
    expect(JSON.stringify(input.blocks)).toBe(original);
    await store.prepare();
    await expectCompleteOracleParity(store, records, '강남구');
    await expectCompleteOracleParity(store, records, '봄카페');
  });

  test('reuses zeroed scratch buffers across distinct searches without changing full results', async () => {
    const records = representativeRecords();
    const input = fixture(records);
    const store = new CompactSearch(input.manifest, input.blocks, input.dictionaries);
    let byteArrays = 0;
    let scoreArrays = 0;
    vi.stubGlobal(
      'Uint8Array',
      new Proxy(Uint8Array, {
        construct(target, args) {
          byteArrays++;
          return Reflect.construct(target, args);
        },
      }),
    );
    vi.stubGlobal(
      'Int16Array',
      new Proxy(Int16Array, {
        construct(target, args) {
          scoreArrays++;
          return Reflect.construct(target, args);
        },
      }),
    );
    try {
      // Include initialization so preparation-time allocation is counted too.
      await store.prepare();
      for (const query of ['강남구', '테헤란로 12', '없는상호', '서초구', '봄카페', '테헤란로 123'])
        await expectCompleteOracleParity(store, records, query);
      expect(byteArrays).toBeLessThanOrEqual(4);
      expect(scoreArrays).toBe(1);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  test('isolates scratch buffers for an overlapping cancelled search', async () => {
    const records = Array.from({ length: 2500 }, (_, index) =>
      record(index + 1, `검색상점${index}`, `서울특별시 강남구 테헤란로 ${index + 1}`),
    );
    const input = fixture(records, 500);
    const store = new CompactSearch(input.manifest, input.blocks, input.dictionaries);
    await store.prepare();
    let release: (() => void) | undefined;
    let first = true;
    vi.stubGlobal('scheduler', {
      yield() {
        if (!first) return Promise.resolve();
        first = false;
        return new Promise<void>((resolve) => {
          release = resolve;
        });
      },
    });
    const controller = new AbortController();
    try {
      const pending = store.search('테헤란로 123', controller.signal);
      const rejection = expect(pending).rejects.toMatchObject({ name: 'AbortError' });
      await expectCompleteOracleParity(store, records, '검색상점1000');
      const accepted = store.page(0);
      controller.abort();
      release?.();
      await rejection;
      expect(store.page(0)).toEqual(accepted);
      await expectCompleteOracleParity(store, records, '테헤란로 2500');
    } finally {
      release?.();
      vi.unstubAllGlobals();
    }
  });

  test('does not repeat identical interpreted and literal name comparisons', async () => {
    const records = Array.from({ length: 200 }, (_, index) => record(index + 1, `페카봄${index}`));
    const input = fixture(records);
    const store = new CompactSearch(input.manifest, input.blocks, input.dictionaries);
    await store.prepare();
    const compare = vi.spyOn(candidateScoring, 'matchName');
    try {
      await store.search('봄카페');
      expect(compare.mock.calls.length).toBe(records.length);
      expect(store.page(0).similarCount).toBe(0);
    } finally {
      compare.mockRestore();
    }
  });

  test('keeps prepared numeric filters within the allocation-free small-integer range', async () => {
    const records = [
      record(1, 'abcdefghijklmnopqrstuvwxyz 가나다라마사아자차카타파하'),
      record(2, '봄카페', '서울특별시 강남구 테헤란로 123'),
    ];
    const input = fixture(records);
    const store = new CompactSearch(input.manifest, input.blocks, input.dictionaries);
    const arrays: (Uint16Array | Uint32Array)[] = [];
    for (const [name, Native] of [
      ['Uint16Array', Uint16Array],
      ['Uint32Array', Uint32Array],
    ] as const)
      vi.stubGlobal(
        name,
        new Proxy(Native, {
          construct(target, args) {
            const value = Reflect.construct(target, args) as Uint16Array | Uint32Array;
            arrays.push(value);
            return value;
          },
        }),
      );
    try {
      await store.prepare();
    } finally {
      vi.unstubAllGlobals();
    }
    expect(arrays.length).toBeGreaterThan(0);
    expect(arrays.every((values) => values.every((value) => value <= 0x3fffffff))).toBe(true);
    for (const query of ['봄카페', '테헤란로 123', 'ab b', '가나다'])
      await expectCompleteOracleParity(store, records, query);
  });

  test.each([
    ['an', 'z'],
    ['nn', 'f'],
  ])(
    'retains distinct character rejection for %s using small numeric values',
    async (query, letter) => {
      const records = Array.from({ length: 200 }, (_, index) =>
        record(index + 1, letter.repeat(index + 2), '', ''),
      );
      const input = fixture(records);
      const store = new CompactSearch(input.manifest, input.blocks, input.dictionaries);
      await store.prepare();
      const compare = vi.spyOn(candidateScoring, 'matchName');
      let comparisons = 0;
      try {
        await store.search(query);
        comparisons = compare.mock.calls.length;
      } finally {
        compare.mockRestore();
      }
      expect(comparisons).toBe(0);
      await expectCompleteOracleParity(store, records, query);
    },
  );

  test('filters incompatible name projections before detailed substring comparison', async () => {
    const records = Array.from({ length: 200 }, (_, index) => record(index + 1, `봄카페${index}`));
    const input = fixture(records);
    const store = new CompactSearch(input.manifest, input.blocks, input.dictionaries);
    await store.prepare();
    const compare = vi.spyOn(candidateScoring, 'matchName');
    let comparisons = 0;
    try {
      await store.search('스타벅스');
      comparisons = compare.mock.calls.length;
    } finally {
      compare.mockRestore();
    }
    expect(comparisons).toBeLessThan(records.length / 2);
    await expectCompleteOracleParity(store, records, '스타벅스');
  });

  test('filters incompatible literal address projections before detailed token comparison', async () => {
    const records = Array.from({ length: 200 }, (_, index) =>
      record(index + 1, `봄카페${index}`, `서울특별시 강남구 테헤란로 ${index + 1}`),
    );
    const input = fixture(records);
    const store = new CompactSearch(input.manifest, input.blocks, input.dictionaries);
    await store.prepare();
    const compare = vi.spyOn(candidateScoring, 'matchesLiteralAddressKey');
    let comparisons = 0;
    try {
      await store.search('스타벅스');
      comparisons = compare.mock.calls.length;
    } finally {
      compare.mockRestore();
    }
    expect(comparisons).toBeLessThan(records.length / 2);
    await expectCompleteOracleParity(store, records, '스타벅스');
  });

  test('preserves substring direction, overlapping literal tokens and Unicode character evidence', async () => {
    const names = [
      '봄카페',
      '카페',
      '봄카페본점',
      '봄 카페',
      '가👨‍👩‍👧‍👦',
      'e\u0301카페',
      '①カフェ',
    ];
    const records = names.map((name, index) =>
      record(index + 1, name, index % 2 ? 'ab' : '112 12', index % 3 ? '' : '카페 길 12-3'),
    );
    const input = fixture(records);
    const store = new CompactSearch(input.manifest, input.blocks, input.dictionaries);
    await store.prepare();
    for (const query of [
      '봄카페',
      '카페',
      '봄카페본점',
      'ab b',
      '12',
      '12-3',
      '가👨‍👩‍👧‍👦',
      'é카페',
      '①カフェ',
      '龘靐齉爩',
    ])
      await expectCompleteOracleParity(store, records, query);
  });

  test('ranks address-only candidates without constructing detailed field-comparison objects', async () => {
    const records = Array.from({ length: 200 }, (_, index) =>
      record(index + 1, `상점${index}`, `테헤란로 ${index + 1}`),
    );
    const input = fixture(records);
    const store = new CompactSearch(input.manifest, input.blocks, input.dictionaries);
    await store.prepare();
    const compare = vi.spyOn(addressComparison, 'compareSearchAddress');
    let detailedComparisons = 0;
    try {
      await store.search('테헤란로 123');
      detailedComparisons = compare.mock.calls.length;
    } finally {
      compare.mockRestore();
    }
    expect(detailedComparisons).toBe(0);
    await expectCompleteOracleParity(store, records, '테헤란로 123');
  });

  test('compares repeated address projections once per address-only search', async () => {
    const records = Array.from({ length: 200 }, (_, index) =>
      record(index + 1, `상점${index}`, '서울특별시 강남구 테헤란로 124'),
    );
    const input = fixture(records);
    const store = new CompactSearch(input.manifest, input.blocks, input.dictionaries);
    await store.prepare();
    const compare = vi.spyOn(addressComparison, 'compareSearchAddressFlags');
    const detailed = vi.spyOn(addressComparison, 'compareSearchAddress');
    try {
      await store.search('테헤란로 123');
      expect(compare.mock.calls.length).toBe(2);
      expect(detailed.mock.calls.length).toBe(0);
      expect(store.page(0).similarCount).toBe(200);
    } finally {
      compare.mockRestore();
      detailed.mockRestore();
    }
    for (const query of ['테헤란로 123', '테헤란로 124', '테헤란로', '역삼동 12'])
      await expectCompleteOracleParity(store, records, query);
  });

  test('reuses repeated address comparisons for mixed queries without inventing name matches', async () => {
    const records = Array.from({ length: 200 }, (_, index) =>
      record(index + 1, `다른상점${index}`, '서울특별시 강남구 테헤란로 124'),
    );
    const input = fixture(records);
    const store = new CompactSearch(input.manifest, input.blocks, input.dictionaries);
    await store.prepare();
    const compare = vi.spyOn(addressComparison, 'compareSearchAddressFlags');
    const detailed = vi.spyOn(addressComparison, 'compareSearchAddress');
    try {
      await store.search('봄카페 서울특별시 강남구 테헤란로 123');
      expect(compare.mock.calls.length).toBe(2);
      expect(detailed.mock.calls.length).toBe(0);
      expect(store.page(0).similarCount).toBe(200);
    } finally {
      compare.mockRestore();
      detailed.mockRestore();
    }
    for (const query of [
      '봄카페 서울특별시 강남구 테헤란로 123',
      '봄카페 서울특별시 강남구 테헤란로 124',
    ])
      await expectCompleteOracleParity(store, records, query);
  });

  test('prepares reusable flag and score storage before the first search', async () => {
    const records = Array.from({ length: 200 }, (_, index) =>
      record(index + 1, `상점${index}`, '서울특별시 강남구 테헤란로 124'),
    );
    const input = fixture(records);
    const store = new CompactSearch(input.manifest, input.blocks, input.dictionaries);
    await store.prepare();
    let allocatedBytes = 0;
    for (const [name, Native] of [
      ['Uint8Array', Uint8Array],
      ['Int16Array', Int16Array],
    ] as const)
      vi.stubGlobal(
        name,
        new Proxy(Native, {
          construct(target, args) {
            const value = Reflect.construct(target, args) as Uint8Array | Int16Array;
            allocatedBytes += value.byteLength;
            return value;
          },
        }),
      );
    try {
      await store.search('테헤란로 123');
    } finally {
      vi.unstubAllGlobals();
    }
    expect(allocatedBytes).toBe(0);
    await expectCompleteOracleParity(store, records, '테헤란로 123');
  });

  test('does not accumulate admitted ordinals in transient JavaScript arrays', async () => {
    const records = Array.from({ length: 200 }, (_, index) =>
      record(500 - index, '봄카페', '서울특별시 강남구 테헤란로 123'),
    );
    const input = fixture(records);
    const store = new CompactSearch(input.manifest, input.blocks, input.dictionaries);
    await store.prepare();
    const descriptor = Object.getOwnPropertyDescriptor(
      Array.prototype,
      'push',
    ) as PropertyDescriptor;
    const push = Array.prototype.push;
    let numericEntries = 0;
    Object.defineProperty(Array.prototype, 'push', {
      ...descriptor,
      value(this: unknown[], ...values: unknown[]) {
        for (const value of values) if (typeof value === 'number') numericEntries++;
        return Reflect.apply(push, this, values);
      },
    });
    try {
      await store.search('봄카페 서울특별시 강남구 테헤란로 123');
    } finally {
      Object.defineProperty(Array.prototype, 'push', descriptor);
    }
    expect(store.page(0).eligibleCount).toBe(200);
    expect(numericEntries).toBeLessThan(records.length);
    await expectCompleteOracleParity(store, records, '봄카페 서울특별시 강남구 테헤란로 123');
  });

  test('bounds transient ordinal allocation while retaining every mixed-query candidate', async () => {
    const records = Array.from({ length: 200 }, (_, index) =>
      record(500 - index, '봄카페', '서울특별시 강남구 테헤란로 123'),
    );
    const input = fixture(records);
    const store = new CompactSearch(input.manifest, input.blocks, input.dictionaries);
    await store.prepare();
    const Native = Uint32Array;
    let allocatedEntries = 0;
    vi.stubGlobal(
      'Uint32Array',
      new Proxy(Native, {
        construct(target, args) {
          const value = Reflect.construct(target, args) as Uint32Array;
          allocatedEntries += value.length;
          return value;
        },
      }),
    );
    try {
      await store.search('봄카페 서울특별시 강남구 테헤란로 123');
      expect(store.page(0).eligibleCount).toBe(200);
      expect(allocatedEntries).toBeLessThanOrEqual(records.length);
    } finally {
      vi.unstubAllGlobals();
    }
    await expectCompleteOracleParity(store, records, '봄카페 서울특별시 강남구 테헤란로 123');
  });

  test('preserves blank-name eligibility and nonmatching-name rejection in exact mixed queries', async () => {
    const records = [
      record(1, '', '서울특별시 강남구 테헤란로 123'),
      record(2, '다른상점', '서울특별시 강남구 테헤란로 123'),
      record(3, '봄카페', '서울특별시 강남구 테헤란로 123'),
      record(4, '봄카페', '서울특별시 강남구 테헤란로 124'),
      record(5, '', '서울특별시 강남구 테헤란로 123', '서초구 역삼동 12'),
    ];
    const input = fixture(records);
    const store = new CompactSearch(input.manifest, input.blocks, input.dictionaries);
    await store.prepare();
    await expectCompleteOracleParity(store, records, '봄카페 서울특별시 강남구 테헤란로 123');
    const page = store.page(0);
    expect(page.topMatches.find((match) => match.record.id === id(1))).toMatchObject({
      score: 100,
      confidence: 'medium',
    });
    expect(page.similarCandidates.find((match) => match.record.id === id(2))).toMatchObject({
      score: 0,
      confidence: 'low',
    });
  });

  test('preserves address-only ranks, literal-name fallback and contradictory field evidence', async () => {
    const roads = [
      '테헤란로 123',
      '서울특별시 강남구 테헤란로 123',
      '서울특별시 강남구 테헤란로 124',
      '서울특별시 서초구 테헤란로 123',
      '테헤란로 서초대로 123',
      '',
      '테헤란로',
      '역삼동 123',
    ];
    const records = Array.from({ length: 89 }, (_, index) =>
      record(
        1000 + ((index * 37) % 89),
        index % 5 === 0 ? '테헤란로 123' : index % 7 === 0 ? '' : `상점${index}`,
        roads[index % roads.length],
        index % 3 === 0 ? '서울특별시 서초구 역삼동 123' : '',
      ),
    );
    const input = fixture(records, 11);
    const store = new CompactSearch(input.manifest, input.blocks, input.dictionaries);
    await store.prepare();
    for (const query of [
      '테헤란로 123',
      '테헤란로 124',
      '테헤란로',
      '서울특별시 강남구 테헤란로 123',
      '역삼동 123',
      '강남구 역삼동',
      '테헤란로 서초대로 123',
      '상점 테헤란로 123',
      '테헤란로 123',
    ])
      await expectCompleteOracleParity(store, records, query);
  });

  test('preserves full ID ranking across interleaved district conflicts and empty searches', async () => {
    const roads = [
      '서울특별시 강남구 테헤란로 12',
      '서울특별시 서초구 서초대로 20',
      '',
      '강남구 서초구 테헤란로 123',
      '서울특별시 강남구',
    ];
    const records = Array.from({ length: 67 }, (_, index) =>
      record(
        10_000 + ((index * 37) % 67),
        index % 7 === 0 ? '강남구문구' : `순서상점${index}`,
        roads[index % roads.length],
        index % 3 === 0
          ? '서울특별시 강남구 역삼동 12'
          : index % 3 === 1
            ? '서울특별시 서초구 서초동 12'
            : '',
      ),
    );
    const input = fixture(records, 11);
    const store = new CompactSearch(input.manifest, input.blocks, input.dictionaries);
    await store.prepare();
    for (const query of ['강남구', '서초구', '서울특별시 강남구', '강동구', '강남구'])
      await expectCompleteOracleParity(store, records, query);
  });

  test('preserves all pages when key-only admission meets numeric substrings, Unicode and empty addresses', async () => {
    const records = [
      ...Array.from({ length: 49 }, (_, i) =>
        record(
          950 - i,
          `봄&amp;빵${i}`,
          i % 3 === 0 ? '112 12' : i % 3 === 1 ? '서울 강남구 테헤란로 12-3' : '',
          i % 2 === 0 ? 'a bc 121' : '서초구 서초동 12',
        ),
      ),
      record(990, '&amp;lt;봄&amp;gt;', '서울 강남구 테헤란로１２길 34 (역삼동 1)', ''),
    ];
    const input = fixture(records);
    const store = new CompactSearch(input.manifest, input.blocks, input.dictionaries);
    await store.prepare();
    for (const query of [
      '12',
      '12-3',
      'abc',
      'a bc',
      '봄 빵',
      '&amp;lt;봄&amp;gt;',
      '서초구',
      '테헤란로12길 34',
      '龘靐齉爩',
    ])
      await expectCompleteOracleParity(store, records, query);
  });
  test('preserves district-only zero-score conflict ordering and keeps strong named queries fully scored', async () => {
    const records = [
      ...Array.from({ length: 90 }, (_, index) =>
        record(
          800 - index,
          index % 5 === 0 ? '강남구' : `지역상점${index}`,
          index % 3 === 0
            ? `서울특별시 강남구 테헤란로 ${index + 1}`
            : index % 3 === 1
              ? `서울특별시 서초구 테헤란로 ${index + 1}`
              : '',
          index % 4 === 0 ? '서울특별시 강남구 역삼동 12' : '서울특별시 서초구 서초동 12',
          index % 4 === 0 ? '확인되지 않음' : '행정상 영업',
        ),
      ),
      record(9_000, '정확상점', '서울특별시 강남구 테헤란로 12'),
      record(9_001, '강남구', '', ''),
      record(9_002, '주소상점', '강남구 서초구 테헤란로 123', ''),
    ];
    const input = fixture(records);
    const store = new CompactSearch(input.manifest, input.blocks, input.dictionaries);
    await store.prepare();

    for (const query of ['강남구', '서초구', '서울특별시 강남구', '서울시 서초구']) {
      const oracle = searchCandidates(createSearchIndex(records), query);
      expect(oracle.eligibleCount).toBe(0);
      expect(oracle.similarCandidates.length).toBeGreaterThan(20);
      expect(
        oracle.similarCandidates.every((match) => match.score === 0 && match.confidence === 'low'),
      ).toBe(true);
      await expectCompleteOracleParity(store, records, query);
    }
    for (const query of [
      '지역상점 강남구',
      '강남구 역삼동',
      '강남구 서초구',
      '테헤란로 12',
      '정확상점 서울특별시 강남구 테헤란로 12',
    ]) {
      await expectCompleteOracleParity(store, records, query);
    }
    expect(store.page(0).primaryMatch).toMatchObject({
      record: { id: id(9_000) },
      score: 500,
      confidence: 'high',
    });
  });

  test('retains complete address-candidate recall for broad, conflicting, ambiguous, exact-key and cross-family evidence', async () => {
    const records = [
      ...representativeRecords(),
      record(601, '주소상점', '테헤란로 123', '역삼동 12'),
      record(602, '주소상점', '서울특별시 강남구 봉은사로 123', '서울특별시 강남구 역삼동 12'),
      record(603, '주소상점', '서울특별시 서초구 테헤란로 123', '서울특별시 서초구 역삼동 12'),
      record(604, '주소상점', '강남구 서초구 테헤란로 123', '강남구 역삼동 12'),
      record(605, '주소상점', '서울특별시', ''),
      record(606, '주소상점', '', ''),
    ];
    const input = fixture(records);
    const store = new CompactSearch(input.manifest, input.blocks, input.dictionaries);
    await store.prepare();

    for (const query of [
      '강남구',
      '서초구',
      '테헤란로',
      '테헤란로 123',
      '역삼동',
      '역삼동 12',
      '서울특별시',
      '강남구 서초구 테헤란로 123',
      '주소상점 서울특별시 강남구 테헤란로 123',
      '주소상점 서울특별시 강남구 역삼동 12',
      '주소상점',
    ]) {
      await expectCompleteOracleParity(store, records, query);
    }
  });

  test('avoids repeated task scheduling for short batches without changing complete ranked results', async () => {
    const records = Array.from({ length: 4_500 }, (_, index) =>
      record(4_500 - index, `성능상점${index}`, `서울특별시 강남구 테헤란로 ${index + 1}`),
    );
    let scheduledTasks = 0;
    vi.stubGlobal('performance', { now: () => 0 });
    vi.stubGlobal('scheduler', {
      async yield() {
        scheduledTasks++;
      },
    });
    try {
      const input = fixture(records, 500);
      const store = new CompactSearch(input.manifest, input.blocks, input.dictionaries);
      await store.prepare();
      await expectCompleteOracleParity(store, records, '강남구');

      // A stationary work clock must not queue another task for each short batch.
      // Retain an initial task boundary for preparation, scanning and ranking.
      expect(scheduledTasks).toBeGreaterThan(0);
      expect(scheduledTasks).toBeLessThanOrEqual(4);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  test('continues yielding when processing consumes time and preserves the accepted result on cancellation', async () => {
    const records = Array.from({ length: 4_500 }, (_, index) =>
      record(4_500 - index, `시간상점${index}`, `서울특별시 강남구 테헤란로 ${index + 1}`),
    );
    let clock = 0;
    let scheduledTasks = 0;
    let abort: AbortController | null = null;
    vi.stubGlobal('performance', { now: () => (clock += 10) });
    vi.stubGlobal('scheduler', {
      async yield() {
        scheduledTasks++;
        if (abort && scheduledTasks >= 2) abort.abort();
      },
    });
    try {
      const input = fixture(records, 500);
      const store = new CompactSearch(input.manifest, input.blocks, input.dictionaries);
      await store.prepare();
      await store.search('시간상점4499');
      const accepted = store.page(0);
      expect(scheduledTasks).toBeGreaterThan(4);

      scheduledTasks = 0;
      abort = new AbortController();
      await expect(store.search('없는상호', abort.signal)).rejects.toMatchObject({
        name: 'AbortError',
      });
      expect(store.page(0)).toEqual(accepted);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  test('matches every oracle result field across complete pages for broad district, reverse substring, conflict, numeric, unknown-status, and absent queries', async () => {
    const records = representativeRecords();
    const input = fixture(records);
    const store = new CompactSearch(input.manifest, input.blocks, input.dictionaries);

    expect(store.recordCount).toBe(records.length);
    expect(store.metadata).toBe(input.manifest.metadata);
    await store.prepare();

    for (const query of [
      '강남구',
      '별빛카페본점',
      '봄카페 서울특별시 강남구 테헤란로 12',
      '12',
      '숫자가게 서울특별시 송파구 올림픽로 12',
      '존재하지않는상호',
    ]) {
      await expectCompleteOracleParity(store, records, query);
    }

    await store.search('봄카페 서울특별시 강남구 테헤란로 12');
    expect(store.page(0).topMatches.map((match) => match.record.id)).toEqual([id(2), id(4)]);
  });

  test('returns only Top-3 and the requested 20-item similar page, then resets an invalid range after a new search', async () => {
    const records = representativeRecords();
    const input = fixture(records);
    const store = new CompactSearch(input.manifest, input.blocks, input.dictionaries);
    await store.prepare();

    await store.search('강남구');
    expect(store.page(1)).toMatchObject({ page: 1, similarCount: 49 });
    expect(store.page(1).similarCandidates).toHaveLength(20);
    expect(store.page(1).topMatches).toHaveLength(0);

    await store.search('존재하지않는상호');
    expect(store.page(99)).toMatchObject({ page: 0, similarCount: 0 });
    expect(store.page(-1).page).toBe(0);
    expect(store.page(1.5).page).toBe(0);
  });

  test('cancels preparation cooperatively and can prepare successfully afterward', async () => {
    const records = Array.from({ length: 2_500 }, (_, index) =>
      record(index + 1, `준비상점${index}`, `서울특별시 강남구 테헤란로 ${index + 1}`),
    );
    const input = fixture(records, 500);
    const store = new CompactSearch(input.manifest, input.blocks, input.dictionaries);
    const controller = new AbortController();

    const pending = store.prepare(controller.signal);
    setTimeout(() => controller.abort(), 0);
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });

    await store.prepare();
    await store.search('준비상점2499 서울특별시 강남구 테헤란로 2500');
    expect(store.page(0).topMatches[0]?.record.id).toBe(id(2_500));
  });

  test('cancels complete scanning without replacing the last successful query state', async () => {
    const records = Array.from({ length: 4_500 }, (_, index) =>
      record(index + 1, `검색상점${index}`, `서울특별시 강남구 테헤란로 ${index + 1}`),
    );
    const input = fixture(records, 500);
    const store = new CompactSearch(input.manifest, input.blocks, input.dictionaries);
    await store.prepare();
    await store.search('검색상점4499');
    const accepted = store.page(0);
    const controller = new AbortController();

    const pending = store.search('없는상호 강남구', controller.signal);
    setTimeout(() => controller.abort(), 0);
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
    expect(store.page(0)).toEqual(accepted);
  });

  test('cancels cooperative sorting without publishing partial ranked references', async () => {
    const records = Array.from({ length: 1_000 }, (_, index) =>
      record(2_000 - index, `정렬상점${index}`, `서울특별시 강남구 테헤란로 ${index + 1}`),
    );
    const input = fixture(records, 500);
    const store = new CompactSearch(input.manifest, input.blocks, input.dictionaries);
    await store.prepare();
    await store.search('정렬상점999');
    const accepted = store.page(0);
    const controller = new AbortController();

    const pending = store.search('강남구', controller.signal);
    setTimeout(() => controller.abort(), 0);
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
    expect(store.page(0)).toEqual(accepted);
  });
});
