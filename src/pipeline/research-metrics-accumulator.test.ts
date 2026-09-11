import { readFileSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { parseArchiveContract } from './archive-contract.js';
import { measureValidationMetrics } from './refresh-validation-metrics.js';
import { requireValue } from './refresh-validation-types.js';
import { indexPartition, type ResearchIndex, ResearchIndexStore } from './research-index-store.js';
import { ResearchMetricsAccumulator } from './research-metrics-accumulator.js';
import { type StagedLicenseRowV1, transformLicenseRecordsV2 } from './transform-license-records.js';

const archiveContract = parseArchiveContract(
  JSON.parse(
    readFileSync(new URL('./contracts/seoul-archive-contract.json', import.meta.url), 'utf8'),
  ),
);
const entries = archiveContract.entries.slice(0, 4);
const ids = entries.map((e) => e.fileDataId);
const archive = { fetchedAt: '2026-09-04T00:00:00.000Z', sha256: 'a'.repeat(64) };
function row(
  category: number,
  management: string,
  values: Record<string, string | null> = {},
): StagedLicenseRowV1 {
  const entry = requireValue(entries[category]);
  return {
    categoryFileDataId: entry.fileDataId,
    sourceFileDataUrl: `https://www.data.go.kr/data/${entry.fileDataId}/fileData.do`,
    values: {
      ...Object.fromEntries(entry.headers.map((h) => [h, null])),
      개방자치단체코드: '6110000',
      관리번호: management,
      사업장명: 'Same',
      도로명주소: 'Road',
      영업상태코드: '01',
      영업상태명: '영업/정상',
      ...values,
    },
  };
}
function transform(rows: StagedLicenseRowV1[]) {
  return transformLicenseRecordsV2({ archiveContract, archive, rows });
}
function fixtures() {
  return [
    row(0, 'one', { 사업장명: 'ＳＡＭＥ' }),
    row(0, 'two', { 사업장명: ' same ', 영업상태코드: '02', 영업상태명: '휴업' }),
    row(1, 'one', { 영업상태코드: '03', 영업상태명: '폐업' }),
    row(1, 'two', { 사업장명: null, 도로명주소: null, 영업상태코드: 'new', 영업상태명: 'new' }),
    row(2, 'one', { 사업장명: '', 도로명주소: '', 지번주소: '' }),
    row(2, 'two', { 사업장명: '  ', 도로명주소: '  ', 지번주소: '  ' }),
  ];
}

describe('compact research metrics', () => {
  test.each([1, 2, 100])(
    'matches full transformation metrics across categories with batch size %i',
    (size) => {
      const rows = fixtures();
      const expected = measureValidationMetrics(transform(rows), ids);
      const accumulator = new ResearchMetricsAccumulator(ids, rows.length);
      for (const id of ids) {
        accumulator.beginCategory(id);
        const category = rows.filter((r) => r.categoryFileDataId === id);
        for (let start = 0; start < category.length; start += size)
          accumulator.addBatch(transform(category.slice(start, start + size)));
        accumulator.endCategory();
      }
      const actual = accumulator.finish();
      expect(actual).toEqual(expected);
      expect(actual.total).toMatchObject({
        recordCount: 6,
        collisionGroupCount: 7,
        collisionRecordCount: 5,
        missingNameCount: 3,
        missingBothAddressCount: 3,
        unknownPairCount: 1,
      });
      expect(actual.total.statusCounts).toEqual({
        '행정상 영업': 3,
        휴업: 1,
        폐업: 1,
        '확인되지 않음': 1,
      });
      expect(actual.total.aggregatePairs).toEqual([
        { code: '01', name: '영업/정상', count: 3 },
        { code: '02', name: '휴업', count: 1 },
        { code: '03', name: '폐업', count: 1 },
        { code: 'new', name: 'new', count: 1 },
      ]);
      expect(actual.total.rawMissing.businessName).toEqual({ null: 1, empty: 1, whitespace: 1 });
      expect(actual.categories[requireValue(ids[0])]).toMatchObject({
        collisionGroupCount: 3,
        collisionRecordCount: 2,
      });
      expect(actual.categories[requireValue(ids[1])]).toMatchObject({
        collisionGroupCount: 3,
        collisionRecordCount: 1,
      });
      expect(actual.categories[requireValue(ids[2])]).toMatchObject({
        collisionGroupCount: 4,
        collisionRecordCount: 2,
      });
      expect(actual.categories[requireValue(ids[3])]?.recordCount).toBe(0);
    },
  );

  test('merges many distinct raw pairs once and rejects the configured pair bound', () => {
    const rows = Array.from({ length: 20 }, (_, i) =>
      row(0, `pair-${i}`, {
        영업상태코드: `code-${i}`,
        영업상태명: `name-${i}`,
      }),
    );
    const accumulator = new ResearchMetricsAccumulator(ids, 100, { maxPairs: 20 });
    accumulator.beginCategory(requireValue(ids[0]));
    for (const item of rows) accumulator.addBatch(transform([item]));
    accumulator.addBatch(
      transform([row(0, 'repeat', { 영업상태코드: 'code-0', 영업상태명: 'name-0' })]),
    );
    accumulator.endCategory();
    for (const id of ids.slice(1)) {
      accumulator.beginCategory(id);
      accumulator.endCategory();
    }
    expect(accumulator.finish()).toEqual(
      measureValidationMetrics(
        transform([...rows, row(0, 'repeat', { 영업상태코드: 'code-0', 영업상태명: 'name-0' })]),
        ids,
      ),
    );
    const limited = new ResearchMetricsAccumulator(ids, 100, { maxPairs: 19 });
    limited.beginCategory(requireValue(ids[0]));
    expect(() => limited.addBatch(transform(rows))).toThrow('observation_index_limit_exceeded');
    expect(() => limited.finish()).toThrow('observation_index_limit_exceeded');
  });

  test('reserves retained raw-pair bytes before adding a long value', () => {
    const accumulator = new ResearchMetricsAccumulator(ids, 10, { maxPairBytes: 32 });
    accumulator.beginCategory(requireValue(ids[0]));
    expect(() =>
      accumulator.addBatch(
        transform([
          row(0, 'long', {
            영업상태코드: 'new',
            영업상태명: 'x'.repeat(32),
          }),
        ]),
      ),
    ).toThrow('observation_index_limit_exceeded');
    expect(() => accumulator.finish()).toThrow('observation_index_limit_exceeded');
  });

  test('rejects exact duplicate identities across separate batches', () => {
    const accumulator = new ResearchMetricsAccumulator(ids, 10);
    accumulator.beginCategory(requireValue(ids[0]));
    accumulator.addBatch(transform([row(0, 'one')]));
    accumulator.addBatch(transform([row(0, 'two')]));
    expect(() => accumulator.addBatch(transform([row(0, 'one')]))).toThrow(
      'duplicate_exact_source_tuple',
    );
    expect(() => accumulator.endCategory()).toThrow('duplicate_exact_source_tuple');
    expect(() => accumulator.finish()).toThrow('duplicate_exact_source_tuple');
  });

  test('rejects identifier digest collisions across categories', () => {
    const accumulator = new ResearchMetricsAccumulator(ids, 10);
    const hashed = (category: number) =>
      transformLicenseRecordsV2(
        { archiveContract, archive, rows: [row(category, 'one')] },
        { hash: () => new Uint8Array(32) },
      );
    accumulator.beginCategory(requireValue(ids[0]));
    accumulator.addBatch(hashed(0));
    accumulator.endCategory();
    accumulator.beginCategory(requireValue(ids[1]));
    expect(() => accumulator.addBatch(hashed(1))).toThrow('identifier_digest_collision');
  });

  test('rejects a row beyond the total limit across batches', () => {
    const accumulator = new ResearchMetricsAccumulator(ids, 2);
    accumulator.beginCategory(requireValue(ids[0]));
    accumulator.addBatch(transform([row(0, 'one'), row(0, 'two')]));
    expect(() => accumulator.addBatch(transform([row(0, 'three')]))).toThrow(
      'observation_rows_exceeded',
    );
  });

  test('requires exact category order and completed categories before final metrics', () => {
    const accumulator = new ResearchMetricsAccumulator(ids, 10);
    expect(() => accumulator.finish()).toThrow('observation_category_order_invalid');
    expect(() => accumulator.beginCategory(requireValue(ids[1]))).toThrow(
      'observation_category_order_invalid',
    );
    const valid = new ResearchMetricsAccumulator(ids, 10);
    valid.beginCategory(requireValue(ids[0]));
    expect(() => valid.addBatch(transform([row(1, 'one')]))).toThrow(
      'observation_category_order_invalid',
    );
  });

  test('does not allow a completed category to reopen', () => {
    const accumulator = new ResearchMetricsAccumulator(ids, 10);
    accumulator.beginCategory(requireValue(ids[0]));
    accumulator.endCategory();
    expect(() => accumulator.beginCategory(requireValue(ids[0]))).toThrow(
      'observation_category_order_invalid',
    );
  });

  test('returns complete zero metrics when all categories are empty', () => {
    const accumulator = new ResearchMetricsAccumulator(ids, 10);
    for (const id of ids) {
      accumulator.beginCategory(id);
      accumulator.endCategory();
    }
    expect(accumulator.finish()).toEqual(measureValidationMetrics(transform([]), ids));
  });
  test.each([0, -1, Number.NaN, Number.MAX_SAFE_INTEGER])(
    'rejects unsafe row/index capacity %s',
    (maxRows) => {
      expect(() => new ResearchMetricsAccumulator(ids, maxRows)).toThrow(
        'observation_index_limit_exceeded',
      );
    },
  );

  test('rejects duplicate or sparse category namespaces before allocation', () => {
    expect(
      () => new ResearchMetricsAccumulator([requireValue(ids[0]), requireValue(ids[0])], 10),
    ).toThrow('observation_index_limit_exceeded');
    expect(() => new ResearchMetricsAccumulator(new Array<string>(2), 10)).toThrow(
      'observation_index_limit_exceeded',
    );
  });

  test('counts collision participation across a bitset byte boundary only once per record', () => {
    const accumulator = new ResearchMetricsAccumulator(ids, 10);
    const rows = Array.from({ length: 10 }, (_, i) => row(0, `unique-${i}`));
    accumulator.beginCategory(requireValue(ids[0]));
    for (const item of rows) accumulator.addBatch(transform([item]));
    accumulator.endCategory();
    for (const id of ids.slice(1)) {
      accumulator.beginCategory(id);
      accumulator.endCategory();
    }
    const result = accumulator.finish();
    expect(result.total.collisionRecordCount).toBe(10);
    expect(result.total.collisionGroupCount).toBe(3);
    expect(result).toEqual(measureValidationMetrics(transform(rows), ids));
    expect(() => accumulator.beginCategory(requireValue(ids[0]))).toThrow(
      'observation_category_order_invalid',
    );
  });
});

describe('partitioned research metrics', () => {
  test('matches the full oracle across reordered disk partitions and multi-field record unions', async () => {
    const root = await mkdtemp(join(tmpdir(), 'oss-disk-metrics-'));
    const store = await ResearchIndexStore.create(root, process.cwd(), () => {});
    try {
      const rows = fixtures();
      const accumulator = new ResearchMetricsAccumulator(ids, 100, { deferIndexes: true });
      for (const id of ids) {
        accumulator.beginCategory(id);
        for (const item of rows.filter((r) => r.categoryFileDataId === id))
          await store.appendBatch(accumulator.addBatch(transform([item])));
        accumulator.endCategory();
      }
      expect(await accumulator.finishFromStore(store)).toEqual(
        measureValidationMetrics(transform(rows), ids),
      );
    } finally {
      await store.cleanup();
      await rm(root, { recursive: true });
    }
  });
  test.each(['duplicate', 'digest-collision'] as const)(
    'rejects a cross-batch %s after disk replay',
    async (kind) => {
      const root = await mkdtemp(join(tmpdir(), 'oss-disk-metrics-'));
      const store = await ResearchIndexStore.create(root, process.cwd(), () => {});
      try {
        const accumulator = new ResearchMetricsAccumulator(ids, 10, { deferIndexes: true });
        for (let category = 0; category < ids.length; category++) {
          accumulator.beginCategory(requireValue(ids[category]));
          if (category === 0 || (category === 1 && kind === 'digest-collision')) {
            const transformed = transformLicenseRecordsV2(
              { archiveContract, archive, rows: [row(category, 'one')] },
              { hash: () => new Uint8Array(32) },
            );
            await store.appendBatch(accumulator.addBatch(transformed));
            if (kind === 'duplicate') await store.appendBatch(accumulator.addBatch(transformed));
          }
          accumulator.endCategory();
        }
        await expect(accumulator.finishFromStore(store)).rejects.toThrow(
          kind === 'duplicate' ? 'duplicate_exact_source_tuple' : 'identifier_digest_collision',
        );
        expect(() => accumulator.finish()).toThrow();
      } finally {
        await store.cleanup();
        await rm(root, { recursive: true });
      }
    },
  );
  test('rejects retained partition payload and pending-index bytes before inserting long keys', async () => {
    const root = await mkdtemp(join(tmpdir(), 'oss-disk-metrics-'));
    const store = await ResearchIndexStore.create(root, process.cwd(), () => {});
    try {
      const accumulator = new ResearchMetricsAccumulator(ids, 10, {
        deferIndexes: true,
        maxKeyBytes: 32,
      });
      accumulator.beginCategory(requireValue(ids[0]));
      await store.appendBatch(
        accumulator.addBatch(transform([row(0, 'long-identity'.repeat(10))])),
      );
      accumulator.endCategory();
      for (const id of ids.slice(1)) {
        accumulator.beginCategory(id);
        accumulator.endCategory();
      }
      await expect(accumulator.finishFromStore(store)).rejects.toThrow(
        'observation_index_limit_exceeded',
      );
      const pending = new ResearchMetricsAccumulator(ids, 10, {
        deferIndexes: true,
        maxPendingBytes: 32,
      });
      pending.beginCategory(requireValue(ids[0]));
      expect(() => pending.addBatch(transform([row(0, 'pending')]))).toThrow(
        'observation_index_limit_exceeded',
      );
      expect(() => pending.finish()).toThrow('observation_index_limit_exceeded');
    } finally {
      await store.cleanup();
      await rm(root, { recursive: true });
    }
  });
  test('refuses final metrics when generated disk indexes were not all stored', async () => {
    const root = await mkdtemp(join(tmpdir(), 'oss-disk-metrics-'));
    const store = await ResearchIndexStore.create(root, process.cwd(), () => {});
    try {
      const accumulator = new ResearchMetricsAccumulator(ids, 10, { deferIndexes: true });
      accumulator.beginCategory(requireValue(ids[0]));
      accumulator.addBatch(transform([row(0, 'omitted')]));
      accumulator.endCategory();
      for (const id of ids.slice(1)) {
        accumulator.beginCategory(id);
        accumulator.endCategory();
      }
      await expect(accumulator.finishFromStore(store)).rejects.toThrow(
        'observation_metrics_invalid',
      );
    } finally {
      await store.cleanup();
      await rm(root, { recursive: true });
    }
  });
  test('enforces the resident partition key count even when input keys hash to one partition', async () => {
    const root = await mkdtemp(join(tmpdir(), 'oss-disk-metrics-'));
    const store = await ResearchIndexStore.create(root, process.cwd(), () => {});
    try {
      const names = new Map<number, string>();
      let chosen: string[] = [];
      for (let i = 0; chosen.length === 0; i++) {
        const name = `unique-${i}`;
        const bucket = indexPartition(['c', JSON.stringify(['businessName', name]), 0, 0]);
        const earlier = names.get(bucket);
        if (earlier) chosen = [earlier, name];
        else names.set(bucket, name);
      }
      const accumulator = new ResearchMetricsAccumulator(ids, 10, {
        deferIndexes: true,
        maxPartitionKeys: 1,
      });
      accumulator.beginCategory(requireValue(ids[0]));
      await store.appendBatch(
        accumulator.addBatch(
          transform(
            chosen.map((name, i) => row(0, `id-${i}`, { 사업장명: name, 도로명주소: null })),
          ),
        ),
      );
      accumulator.endCategory();
      for (const id of ids.slice(1)) {
        accumulator.beginCategory(id);
        accumulator.endCategory();
      }
      await expect(accumulator.finishFromStore(store)).rejects.toThrow(
        'observation_index_limit_exceeded',
      );
    } finally {
      await store.cleanup();
      await rm(root, { recursive: true });
    }
  });
  test('rejects an index ordinal paired with the wrong completed category', async () => {
    const root = await mkdtemp(join(tmpdir(), 'oss-disk-metrics-'));
    const store = await ResearchIndexStore.create(root, process.cwd(), () => {});
    try {
      const accumulator = new ResearchMetricsAccumulator(ids, 10, { deferIndexes: true });
      accumulator.beginCategory(requireValue(ids[0]));
      const indexes = accumulator.addBatch(transform([row(0, 'one')]));
      const altered: ResearchIndex[] = indexes.map((index) =>
        index[0] === 'i' ? ['i', index[1], index[2], index[3], 1] : index,
      );
      await store.appendBatch(altered);
      accumulator.endCategory();
      for (const id of ids.slice(1)) {
        accumulator.beginCategory(id);
        accumulator.endCategory();
      }
      await expect(accumulator.finishFromStore(store)).rejects.toThrow(
        'observation_storage_invalid',
      );
    } finally {
      await store.cleanup();
      await rm(root, { recursive: true });
    }
  });
});
