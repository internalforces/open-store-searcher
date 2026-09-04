import { mapLicenseStatusV1 } from '../domain/map-license-status.js';
import type {
  TransformationResultV2,
  TransformedLicenseRecordV2,
} from './transform-license-records.js';
import {
  RAW_COMPLETENESS_FIELDS,
  VALIDATION_STATUSES,
  compareText,
  count,
  object,
  sameKeys,
  requireValue,
  type ValidationMetricV1,
  type ValidationMetricsV1,
} from './refresh-validation-types.js';

// ADR-013's known mixed bucket remains unverified; the mapper alone cannot distinguish it from drift.
export function knownAggregatePair(code: string | null, name: string | null): boolean {
  return (
    mapLicenseStatusV1({
      operatingCode: code,
      operatingName: name,
    }) !== '확인되지 않음' ||
    (code === '04' && name === '취소/말소/만료/정지/중지')
  );
}
function emptyMetric(): ValidationMetricV1 {
  return {
    recordCount: 0,
    missingNameCount: 0,
    missingBothAddressCount: 0,
    unknownPairCount: 0,
    statusCounts: {
      '행정상 영업': 0,
      휴업: 0,
      폐업: 0,
      '확인되지 않음': 0,
    },
    rawMissing: {
      businessName: {
        null: 0,
        empty: 0,
        whitespace: 0,
      },
      roadAddress: {
        null: 0,
        empty: 0,
        whitespace: 0,
      },
      parcelAddress: {
        null: 0,
        empty: 0,
        whitespace: 0,
      },
      detailedCode: {
        null: 0,
        empty: 0,
        whitespace: 0,
      },
      detailedName: {
        null: 0,
        empty: 0,
        whitespace: 0,
      },
    },
    aggregatePairs: [],
    collisionGroupCount: 0,
    collisionRecordCount: 0,
  };
}
function measure(records: TransformedLicenseRecordV2[]): ValidationMetricV1 {
  const metric = emptyMetric();
  const pairs = new Map<
    string,
    {
      code: string | null;
      name: string | null;
      count: number;
    }
  >();
  for (const record of records) {
    metric.recordCount++;
    if (record.search.businessName === null || record.search.businessName === '')
      metric.missingNameCount++;
    if (!record.search.roadAddress && !record.search.parcelAddress)
      metric.missingBothAddressCount++;
    metric.statusCounts[record.processedStatus]++;
    const { operatingCode: code, operatingName: name } = record.rawStatus;
    if (!knownAggregatePair(code, name)) metric.unknownPairCount++;
    const key = JSON.stringify([code, name]);
    const pair = pairs.get(key) ?? {
      code,
      name,
      count: 0,
    };
    pair.count++;
    pairs.set(key, pair);
    for (const field of RAW_COMPLETENESS_FIELDS) {
      const value =
        field === 'detailedCode' || field === 'detailedName'
          ? record.rawStatus[field]
          : record.display[field];
      if (value === null) metric.rawMissing[field].null++;
      else if (value === '') metric.rawMissing[field].empty++;
      else if (/^\p{White_Space}+$/u.test(value)) metric.rawMissing[field].whitespace++;
    }
  }
  metric.aggregatePairs = [...pairs.entries()]
    .sort(([a], [b]) => compareText(a, b))
    .map(([, pair]) => pair);
  return metric;
}

/** Measures every category, including completed zero-row categories; never filters incomplete records. */
export function measureValidationMetrics(
  result: TransformationResultV2,
  categoryIds: string[],
): ValidationMetricsV1 {
  const grouped = new Map(categoryIds.map((id) => [id, [] as TransformedLicenseRecordV2[]]));
  for (const record of result.records)
    requireValue(grouped.get(record.identity.source.categoryFileDataId)).push(record);
  const categories = Object.fromEntries(
    categoryIds.map((id) => [id, measure(requireValue(grouped.get(id)))]),
  );
  const total = measure(result.records);
  const collided = new Set<string>();
  const perCategory = new Map(categoryIds.map((id) => [id, new Set<string>()]));
  for (const diagnostic of result.diagnostics) {
    total.collisionGroupCount++;
    const groupCounts = new Map<string, number>();
    for (const identity of diagnostic.identities) {
      const key = JSON.stringify(identity);
      collided.add(key);
      requireValue(perCategory.get(identity.categoryFileDataId)).add(key);
      groupCounts.set(
        identity.categoryFileDataId,
        (groupCounts.get(identity.categoryFileDataId) ?? 0) + 1,
      );
    }
    // Category metrics count participation in a global collision, including cross-category matches.
    for (const id of groupCounts.keys()) requireValue(categories[id]).collisionGroupCount++;
  }
  total.collisionRecordCount = collided.size;
  for (const id of categoryIds)
    requireValue(categories[id]).collisionRecordCount = requireValue(perCategory.get(id)).size;
  return {
    total,
    categories,
  };
}
function validMetric(value: unknown): value is ValidationMetricV1 {
  if (
    !object(value) ||
    ![
      'recordCount',
      'missingNameCount',
      'missingBothAddressCount',
      'unknownPairCount',
      'collisionGroupCount',
      'collisionRecordCount',
    ].every((key) => count(value[key]))
  )
    return false;
  const n = value.recordCount as number;
  const groups = value.collisionGroupCount as number,
    participants = value.collisionRecordCount as number;
  if ((groups === 0) !== (participants === 0) || groups > 4 * participants) return false;
  if (
    [
      'missingNameCount',
      'missingBothAddressCount',
      'unknownPairCount',
      'collisionRecordCount',
    ].some((key) => (value[key] as number) > n) ||
    (value.collisionGroupCount as number) > 4 * n
  )
    return false;
  if (
    !object(value.statusCounts) ||
    !sameKeys(value.statusCounts, VALIDATION_STATUSES) ||
    !Object.values(value.statusCounts).every(count) ||
    Object.values(value.statusCounts).reduce<number>((a, b) => a + (b as number), 0) !== n
  )
    return false;
  if (!object(value.rawMissing) || !sameKeys(value.rawMissing, RAW_COMPLETENESS_FIELDS))
    return false;
  for (const field of RAW_COMPLETENESS_FIELDS) {
    const cells = value.rawMissing[field];
    if (
      !object(cells) ||
      !sameKeys(cells, ['null', 'empty', 'whitespace']) ||
      !Object.values(cells).every(count) ||
      Object.values(cells).reduce<number>((a, b) => a + (b as number), 0) > n
    )
      return false;
  }
  if (!Array.isArray(value.aggregatePairs)) return false;
  const statuses = emptyMetric().statusCounts;
  let total = 0;
  let unknown = 0;
  const seen = new Set<string>();
  for (const pair of value.aggregatePairs) {
    if (
      !object(pair) ||
      !(pair.code === null || typeof pair.code === 'string') ||
      !(pair.name === null || typeof pair.name === 'string') ||
      !count(pair.count) ||
      pair.count === 0
    )
      return false;
    const key = JSON.stringify([pair.code, pair.name]);
    if (seen.has(key)) return false;
    seen.add(key);
    total += pair.count;
    statuses[
      mapLicenseStatusV1({
        operatingCode: pair.code,
        operatingName: pair.name,
      })
    ] += pair.count;
    if (!knownAggregatePair(pair.code, pair.name)) unknown += pair.count;
  }
  return (
    total === n &&
    unknown === value.unknownPairCount &&
    VALIDATION_STATUSES.every(
      (s) => statuses[s] === (value.statusCounts as Record<string, unknown>)[s],
    )
  );
}

/** Rejects corrupted baseline aggregates before any arithmetic with previous observations. */
export function validValidationMetrics(
  value: unknown,
  ids: string[],
): value is ValidationMetricsV1 {
  if (
    !object(value) ||
    !validMetric(value.total) ||
    !object(value.categories) ||
    !sameKeys(value.categories, ids) ||
    !Object.values(value.categories).every(validMetric)
  )
    return false;
  const categories = Object.values(value.categories) as ValidationMetricV1[];
  const totalGroupCount = value.total.collisionGroupCount;
  if (value.total.collisionGroupCount > 0 && value.total.collisionRecordCount < 2) return false;
  if (value.total.collisionGroupCount > 2 * value.total.collisionRecordCount) return false;
  const groupParticipations = categories.reduce((sum, m) => sum + m.collisionGroupCount, 0);
  if (
    groupParticipations < value.total.collisionGroupCount ||
    groupParticipations > 4 * value.total.collisionRecordCount ||
    categories.some((m) => m.collisionGroupCount > totalGroupCount)
  )
    return false;
  for (const key of [
    'recordCount',
    'missingNameCount',
    'missingBothAddressCount',
    'unknownPairCount',
    'collisionRecordCount',
  ] as const) {
    if (categories.reduce((sum, m) => sum + m[key], 0) !== value.total[key]) return false;
  }
  for (const status of VALIDATION_STATUSES)
    if (
      categories.reduce((sum, m) => sum + m.statusCounts[status], 0) !==
      value.total.statusCounts[status]
    )
      return false;
  for (const field of RAW_COMPLETENESS_FIELDS)
    for (const state of ['null', 'empty', 'whitespace'] as const)
      if (
        categories.reduce((sum, m) => sum + m.rawMissing[field][state], 0) !==
        value.total.rawMissing[field][state]
      )
        return false;
  const summed = new Map<string, number>();
  for (const category of categories)
    for (const pair of category.aggregatePairs) {
      const key = JSON.stringify([pair.code, pair.name]);
      summed.set(key, (summed.get(key) ?? 0) + pair.count);
    }
  return (
    summed.size === value.total.aggregatePairs.length &&
    value.total.aggregatePairs.every(
      (pair) => summed.get(JSON.stringify([pair.code, pair.name])) === pair.count,
    )
  );
}
