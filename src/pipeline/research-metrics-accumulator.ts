import type { AggregateVocabularyVersion } from './aggregate-vocabulary.js';
import {
  measureValidationMetricsForVocabulary,
  validValidationMetricsForVocabulary,
} from './refresh-validation-metrics.js';
import {
  compareText,
  RAW_COMPLETENESS_FIELDS,
  requireValue,
  VALIDATION_STATUSES,
  type ValidationMetricsV1,
  type ValidationMetricV1,
} from './refresh-validation-types.js';
import type { ResearchIndex, ResearchIndexStore } from './research-index-store.js';
import { frameExactIdentityV1, type TransformationResultV2 } from './transform-license-records.js';

const CODES = [
  'observation_index_limit_exceeded',
  'observation_storage_failed',
  'observation_storage_invalid',
  'observation_storage_path_invalid',
  'observation_storage_space_exceeded',
  'observation_cleanup_failed',
  'observation_category_order_invalid',
  'observation_rows_exceeded',
  'observation_metrics_invalid',
  'duplicate_exact_source_tuple',
  'identifier_digest_collision',
] as const;
type AccumulationCode = (typeof CODES)[number];
export class ObservationAccumulationError extends Error {
  readonly code: AccumulationCode;
  constructor(code: AccumulationCode) {
    super(code);
    this.code = code;
  }
}
export function isAccumulationCode(value: unknown): value is AccumulationCode {
  return CODES.some((code) => code === value);
}

function mergeMetric(target: ValidationMetricV1, source: ValidationMetricV1): void {
  for (const key of [
    'recordCount',
    'missingNameCount',
    'missingBothAddressCount',
    'unknownPairCount',
  ] as const)
    target[key] += source[key];
  for (const status of VALIDATION_STATUSES)
    target.statusCounts[status] += source.statusCounts[status];
  for (const field of RAW_COMPLETENESS_FIELDS)
    for (const kind of ['null', 'empty', 'whitespace'] as const)
      target.rawMissing[field][kind] += source.rawMissing[field][kind];
  // Global collisions are measured from records below, never from batch diagnostics.
}

/** Research-only exact metrics; retains bounded identity/search indexes, not source records. */
export class ResearchMetricsAccumulator {
  private readonly ids: string[];
  private readonly vocabularyVersion: AggregateVocabularyVersion;
  private readonly maxRows: number;
  private readonly maxGroups: number;
  private readonly metrics: ValidationMetricsV1;
  private readonly pairs = new Map<
    ValidationMetricV1,
    Map<string, ValidationMetricV1['aggregatePairs'][number]>
  >();
  private readonly maxPairs: number;
  private readonly maxPairBytes: number;
  private pairBytes = 0;
  private readonly digests = new Map<string, string>();
  private readonly deferIndexes: boolean;
  private readonly maxPartitionKeys: number;
  private readonly maxKeyBytes: number;
  private readonly maxPendingBytes: number;
  private keyBytes = 0;
  private identityCount = 0;
  private collisionIndexCount = 0;
  private expectedCollisionIndexes = 0;
  private replayed = false;
  private readonly ranges: { start: number; end: number }[] = [];
  private categoryStart = 0;
  private readonly groups = new Map<string, number | number[]>();
  private readonly collisionPages = new Map<number, Uint8Array>();
  private participationCount = 0;
  private seenRows = 0;
  private nextCategory = 0;
  private categoryOpen = false;
  private failed: AccumulationCode | undefined;
  private finished = false;

  constructor(
    categoryIds: readonly string[],
    maxRows: number,
    options: {
      vocabularyVersion?: AggregateVocabularyVersion;
      maxPairs?: number;
      maxPairBytes?: number;
      deferIndexes?: boolean;
      maxPartitionKeys?: number;
      maxKeyBytes?: number;
      maxPendingBytes?: number;
    } = {},
  ) {
    this.vocabularyVersion = options.vocabularyVersion ?? 1;
    this.deferIndexes = options.deferIndexes ?? false;
    this.maxPartitionKeys = options.maxPartitionKeys ?? (this.deferIndexes ? 250_000 : maxRows * 5);
    this.maxKeyBytes =
      options.maxKeyBytes ?? (this.deferIndexes ? 33_554_432 : Number.MAX_SAFE_INTEGER);
    this.maxPendingBytes = options.maxPendingBytes ?? 16_777_216;
    this.maxPairs = options.maxPairs ?? 100_000;
    this.maxPairBytes = options.maxPairBytes ?? 33_554_432;
    if (
      ![this.maxPartitionKeys, this.maxKeyBytes, this.maxPendingBytes].every(
        (n) => Number.isSafeInteger(n) && n > 0,
      ) ||
      this.maxPendingBytes > 16_777_216 ||
      (this.deferIndexes && (this.maxPartitionKeys > 250_000 || this.maxKeyBytes > 33_554_432)) ||
      !Number.isSafeInteger(this.maxPairBytes) ||
      this.maxPairBytes < 1 ||
      this.maxPairBytes > 33_554_432 ||
      !Number.isSafeInteger(this.maxPairs) ||
      this.maxPairs < 1 ||
      this.maxPairs > 100_000 ||
      !Array.isArray(categoryIds) ||
      categoryIds.length === 0 ||
      categoryIds.length > 256 ||
      !Array.from(categoryIds).every((id) => typeof id === 'string' && id.length > 0) ||
      new Set(categoryIds).size !== categoryIds.length ||
      !Number.isSafeInteger(maxRows) ||
      maxRows < 1 ||
      maxRows > Math.floor(Number.MAX_SAFE_INTEGER / 256)
    ) {
      throw new ObservationAccumulationError('observation_index_limit_exceeded');
    }
    this.ids = [...categoryIds];
    this.maxRows = maxRows;
    this.maxGroups = maxRows * 4;
    this.metrics = measureValidationMetricsForVocabulary(
      {
        schemaVersion: 2,
        identifierContractVersion: 1,
        normalizationContractVersion: 1,
        records: [],
        diagnostics: [],
      },
      [...this.ids].sort(compareText),
      this.vocabularyVersion,
    );
  }

  private reject(code: AccumulationCode): never {
    this.failed ??= code;
    throw new ObservationAccumulationError(this.failed);
  }
  private active(): void {
    if (this.failed) throw new ObservationAccumulationError(this.failed);
    if (this.finished) this.reject('observation_category_order_invalid');
  }
  beginCategory(id: string): void {
    this.active();
    if (this.categoryOpen || id !== this.ids[this.nextCategory])
      this.reject('observation_category_order_invalid');
    this.categoryStart = this.seenRows;
    this.categoryOpen = true;
  }
  endCategory(): void {
    this.active();
    if (!this.categoryOpen) this.reject('observation_category_order_invalid');
    this.ranges.push({ start: this.categoryStart, end: this.seenRows });
    this.categoryOpen = false;
    this.nextCategory++;
  }

  private markCollision(ordinal: number, category: number): void {
    if (ordinal < 0 || ordinal >= this.seenRows || ordinal >= this.maxRows)
      this.reject('observation_index_limit_exceeded');
    const pageId = Math.floor(ordinal / 65536);
    let page = this.collisionPages.get(pageId);
    if (!page) {
      page = new Uint8Array(8192);
      this.collisionPages.set(pageId, page);
    }
    const local = ordinal % 65536;
    const byte = local >>> 3;
    const mask = 1 << (local % 8);
    const previous = requireValue(page[byte]);
    if ((previous & mask) === 0) {
      page[byte] = previous | mask;
      this.metrics.total.collisionRecordCount++;
      requireValue(this.metrics.categories[requireValue(this.ids[category])])
        .collisionRecordCount++;
    }
  }
  private addParticipation(categories: number[], category: number): void {
    if (categories.includes(category)) return;
    if (this.participationCount >= this.maxGroups) this.reject('observation_index_limit_exceeded');
    this.participationCount++;
    categories.push(category);
    requireValue(this.metrics.categories[requireValue(this.ids[category])]).collisionGroupCount++;
  }
  private collision(key: string, ordinal: number, category: number): void {
    const found = this.groups.get(key);
    if (found === undefined) {
      this.reserveKey(Buffer.byteLength(key, 'utf8'));
      if (this.groups.size >= this.maxGroups) this.reject('observation_index_limit_exceeded');
      this.groups.set(key, ordinal * 256 + category);
      return;
    }
    let categories: number[];
    if (typeof found === 'number') {
      this.metrics.total.collisionGroupCount++;
      categories = [];
      const firstCategory = found % 256;
      this.addParticipation(categories, firstCategory);
      this.markCollision(Math.floor(found / 256), firstCategory);
      this.groups.set(key, categories);
    } else categories = found;
    this.addParticipation(categories, category);
    this.markCollision(ordinal, category);
  }

  private merge(target: ValidationMetricV1, source: ValidationMetricV1): void {
    mergeMetric(target, source);
    let pairs = this.pairs.get(target);
    if (!pairs) {
      pairs = new Map();
      this.pairs.set(target, pairs);
    }
    for (const pair of source.aggregatePairs) {
      const key = JSON.stringify([pair.code, pair.name]);
      const found = pairs.get(key);
      if (found) found.count += pair.count;
      else {
        const bytes = Buffer.byteLength(key, 'utf8') * 2;
        if (pairs.size >= this.maxPairs || bytes > this.maxPairBytes - this.pairBytes)
          this.reject('observation_index_limit_exceeded');
        this.pairBytes += bytes;
        pairs.set(key, { ...pair });
      }
    }
  }

  private reserveKey(bytes: number): void {
    if (
      this.groups.size + this.digests.size >= this.maxPartitionKeys ||
      bytes > this.maxKeyBytes - this.keyBytes
    )
      this.reject('observation_index_limit_exceeded');
    this.keyBytes += bytes;
  }
  private acceptIndex(index: ResearchIndex): void {
    const ordinal = index[0] === 'i' ? index[3] : index[2];
    const category = index[0] === 'i' ? index[4] : index[3];
    const range =
      this.ranges[category] ??
      (this.categoryOpen && category === this.nextCategory
        ? { start: this.categoryStart, end: this.seenRows }
        : undefined);
    if (!range || ordinal < range.start || ordinal >= range.end)
      this.reject('observation_storage_invalid');
    if (index[0] === 'i') {
      const found = this.digests.get(index[1]);
      if (found !== undefined)
        this.reject(
          found === index[2] ? 'duplicate_exact_source_tuple' : 'identifier_digest_collision',
        );
      this.reserveKey(Buffer.byteLength(index[1]) + Buffer.byteLength(index[2]));
      this.digests.set(index[1], index[2]);
      this.identityCount++;
      if (this.identityCount > this.maxRows) this.reject('observation_index_limit_exceeded');
    } else {
      if (++this.collisionIndexCount > this.maxGroups)
        this.reject('observation_index_limit_exceeded');
      this.collision(index[1], ordinal, category);
    }
  }
  async finishFromStore(store: ResearchIndexStore): Promise<ValidationMetricsV1> {
    try {
      this.active();
      if (
        !this.deferIndexes ||
        this.replayed ||
        this.categoryOpen ||
        this.nextCategory !== this.ids.length
      )
        this.reject('observation_category_order_invalid');
      for await (const partition of store.partitions()) {
        this.groups.clear();
        this.digests.clear();
        this.keyBytes = 0;
        for await (const index of partition.records) this.acceptIndex(index);
      }
      this.replayed = true;
      return this.finish();
    } catch (error) {
      if (error instanceof ObservationAccumulationError) this.reject(error.code);
      this.reject('observation_storage_failed');
    }
  }

  addBatch(result: TransformationResultV2): ResearchIndex[] {
    this.active();
    if (!this.categoryOpen) this.reject('observation_category_order_invalid');
    const id = requireValue(this.ids[this.nextCategory]);
    if (result.records.length > this.maxRows - this.seenRows)
      this.reject('observation_rows_exceeded');
    if (result.records.some((r) => r.identity.source.categoryFileDataId !== id))
      this.reject('observation_category_order_invalid');
    const batch = measureValidationMetricsForVocabulary(
      { ...result, diagnostics: [] },
      [id],
      this.vocabularyVersion,
    );
    this.merge(this.metrics.total, batch.total);
    this.merge(requireValue(this.metrics.categories[id]), requireValue(batch.categories[id]));
    const indexes: ResearchIndex[] = [];
    let pendingBytes = 0;
    const emit = (index: ResearchIndex) => {
      if (this.deferIndexes) {
        const bytes = Buffer.byteLength(JSON.stringify(index), 'utf8') + 1;
        if (bytes > this.maxPendingBytes - pendingBytes)
          this.reject('observation_index_limit_exceeded');
        pendingBytes += bytes;
        indexes.push(index);
      } else this.acceptIndex(index);
    };
    for (const record of result.records) {
      const ordinal = this.seenRows++;
      emit([
        'i',
        Buffer.from(record.identity.digest).toString('base64'),
        Buffer.from(frameExactIdentityV1(record.identity.source)).toString('base64'),
        ordinal,
        this.nextCategory,
      ]);
      for (const field of ['businessName', 'roadAddress', 'parcelAddress'] as const) {
        const value = record.search[field];
        if (value !== null) {
          this.expectedCollisionIndexes++;
          emit(['c', JSON.stringify([field, value]), ordinal, this.nextCategory]);
        }
      }
      const { businessName, roadAddress, parcelAddress } = record.search;
      if (businessName !== null && (roadAddress !== null || parcelAddress !== null)) {
        this.expectedCollisionIndexes++;
        emit([
          'c',
          JSON.stringify([
            'businessNameAndAddress',
            JSON.stringify([businessName, roadAddress, parcelAddress]),
          ]),
          ordinal,
          this.nextCategory,
        ]);
      }
    }
    return indexes;
  }

  finish(): ValidationMetricsV1 {
    this.active();
    if (this.categoryOpen || this.nextCategory !== this.ids.length)
      this.reject('observation_category_order_invalid');
    for (const [metric, pairs] of this.pairs) {
      metric.aggregatePairs = [...pairs.entries()]
        .sort(([a], [b]) => compareText(a, b))
        .map(([, pair]) => pair);
    }
    if (
      this.metrics.total.recordCount !== this.seenRows ||
      this.identityCount !== this.seenRows ||
      this.collisionIndexCount !== this.expectedCollisionIndexes ||
      (this.deferIndexes && !this.replayed) ||
      !validValidationMetricsForVocabulary(this.metrics, this.ids, this.vocabularyVersion)
    )
      this.reject('observation_metrics_invalid');
    this.finished = true;
    return structuredClone(this.metrics);
  }
}
