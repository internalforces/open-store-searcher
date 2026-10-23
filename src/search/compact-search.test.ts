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
