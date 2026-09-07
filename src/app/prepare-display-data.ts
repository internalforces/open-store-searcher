import { createSearchIndex } from '../search/search-candidates.js';
import type { Coverage, DisplayDataset, DisplayRecord } from './display-data.js';

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
const nullableText = (value: unknown): value is string | null =>
  value === null || typeof value === 'string';

function coverage(value: unknown): value is Coverage {
  return (
    object(value) &&
    (value.kind === 'unavailable' ||
      ((value.kind === 'synthetic' || value.kind === 'verified') && typeof value.date === 'string'))
  );
}

function displayRecord(value: unknown): value is DisplayRecord {
  if (!object(value)) return false;
  return (
    typeof value.categoryName === 'string' &&
    typeof value.sourceLabel === 'string' &&
    nullableText(value.sourceUrl) &&
    Array.isArray(value.businessTypes) &&
    value.businessTypes.every(
      (type) =>
        object(type) && typeof type.sourceField === 'string' && typeof type.value === 'string',
    ) &&
    object(value.rawStatus) &&
    ['operatingCode', 'operatingName', 'detailedCode', 'detailedName'].every((key) =>
      nullableText((value.rawStatus as Record<string, unknown>)[key]),
    ) &&
    object(value.lifecycle) &&
    [
      'licensedOn',
      'licenseCancelledOn',
      'suspendedFrom',
      'suspendedThrough',
      'reopenedOn',
      'closedOn',
      'sourceUpdatedAt',
      'sourceLastModifiedAt',
    ].every((key) => nullableText((value.lifecycle as Record<string, unknown>)[key]))
  );
}

/** Internal presentation validation only; never a production publication or freshness gate. */
export function prepareDisplayData(value: unknown): {
  dataset: DisplayDataset;
  excludedCount: number;
} {
  if (
    !object(value) ||
    !Array.isArray(value.records) ||
    !coverage(value.coverage) ||
    typeof value.sourceLabel !== 'string' ||
    !value.sourceLabel.trim() ||
    !nullableText(value.sourceUrl) ||
    typeof value.exampleQuery !== 'string'
  ) {
    throw new Error('Unusable display dataset.');
  }
  // Check identity across all input rows before filtering malformed display fields, so a
  // malformed duplicate cannot cause its peer to become a falsely unique match.
  const records = createSearchIndex(value.records)
    .entries.map((entry) => entry.record)
    .filter(displayRecord);
  if (value.records.length > 0 && records.length === 0) throw new Error('No usable records.');
  return {
    dataset: {
      records,
      coverage: value.coverage,
      sourceLabel: value.sourceLabel,
      sourceUrl: value.sourceUrl,
      exampleQuery: value.exampleQuery,
    },
    excludedCount: value.records.length - records.length,
  };
}
