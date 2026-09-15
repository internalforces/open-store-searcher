import { seoulCalendarDate } from './data-freshness.js';
import { isCalendarDate } from '../pipeline/calendar-date.js';
import type { DisplayDataset, DisplayRecord } from '../app/display-data.js';
import { mapLicenseStatusV1 } from '../domain/map-license-status.js';

export const COMPACT_BLOCK_ROWS = 8192;
export const COMPACT_MAX_BYTES = 8 * 1024 * 1024;
export const COMPACT_FIELDS = [
  'id',
  'name',
  'roadAddress',
  'parcelAddress',
  'categoryName',
  'businessTypes',
  'operatingCode',
  'operatingName',
  'detailedCode',
  'detailedName',
  'processedStatus',
  'licensedOn',
  'licenseCancelledOn',
  'suspendedFrom',
  'suspendedThrough',
  'reopenedOn',
  'closedOn',
  'sourceUpdatedAt',
  'sourceLastModifiedAt',
  'sourceLabel',
  'sourceUrl',
] as const;
export type CompactRecord = DisplayRecord & { readonly processedStatus: string };
export type Column =
  | { values: unknown[] }
  | { dictionary: unknown[]; refs: number[] }
  | { shared: number; refs: number[] };
export type Dictionaries = (unknown[] | null)[];
export interface CompactEntry {
  name: string;
  sha256: string;
  byteLength: number;
  role: 'search' | 'evidence' | 'dictionaries';
  start: number;
  count: number;
}
export interface CompactBlock {
  version: 1;
  archiveSha256: string;
  role: 'search' | 'evidence';
  start: number;
  count: number;
  columns: Column[];
}
export interface CompactManifest {
  version: 1;
  kind: 'compact-dataset';
  schemaVersion: 2;
  identifierContractVersion: 1;
  normalizationContractVersion: 1;
  archiveSha256: string;
  policyRevision: string | null;
  dateBasis: 'collection';
  sourceDataAsOf: null;
  recordCount: number;
  orderedIdsSha256: string;
  metadata: Omit<DisplayDataset, 'records'>;
  entries: CompactEntry[];
}
export const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v);
export const digestString = (v: unknown): v is string =>
  typeof v === 'string' && /^[a-f0-9]{64}$/.test(v);
const integer = (v: unknown): v is number =>
  typeof v === 'number' && Number.isSafeInteger(v) && v >= 0;
export function requireCompact(condition: unknown): asserts condition {
  if (!condition) throw new Error('Invalid compact dataset');
}
const exactKeys = (v: Record<string, unknown>, keys: string[]) =>
  Object.keys(v).length === keys.length && keys.every((k) => Object.hasOwn(v, k));
export function flattenRecord(value: unknown): unknown[] {
  requireCompact(object(value) && object(value.rawStatus) && object(value.lifecycle));
  const r = value;
  const raw = r.rawStatus as Record<string, unknown>,
    life = r.lifecycle as Record<string, unknown>;
  const values = [
    r.id,
    r.name,
    r.roadAddress,
    r.parcelAddress,
    r.categoryName,
    r.businessTypes,
    raw.operatingCode,
    raw.operatingName,
    raw.detailedCode,
    raw.detailedName,
    r.processedStatus,
    ...COMPACT_FIELDS.slice(11, 19).map((k) => life[k]),
    r.sourceLabel,
    r.sourceUrl,
  ];
  values.forEach((v, j) => {
    validateValue(v, j);
  });
  requireCompact(
    exactKeys(raw, COMPACT_FIELDS.slice(6, 10)) && exactKeys(life, COMPACT_FIELDS.slice(11, 19)),
  );
  requireCompact(
    exactKeys(r, [
      'id',
      'name',
      'roadAddress',
      'parcelAddress',
      'categoryName',
      'businessTypes',
      'rawStatus',
      'processedStatus',
      'lifecycle',
      'sourceLabel',
      'sourceUrl',
    ]),
  );
  requireCompact(
    r.processedStatus ===
      mapLicenseStatusV1({
        operatingCode: values[6] as string | null,
        operatingName: values[7] as string | null,
      }),
  );
  return values;
}
function validateValue(v: unknown, field: number) {
  if (field === 0) requireCompact(digestString(v));
  else if (field === 5)
    requireCompact(
      Array.isArray(v) &&
        v.every(
          (x) =>
            object(x) &&
            exactKeys(x, ['sourceField', 'value']) &&
            typeof x.sourceField === 'string' &&
            typeof x.value === 'string',
        ),
    );
  else if (field === 10)
    requireCompact(['행정상 영업', '휴업', '폐업', '확인되지 않음'].includes(v as string));
  else if ((field >= 6 && field <= 9) || (field >= 11 && field <= 18) || field === 20)
    requireCompact(v === null || typeof v === 'string');
  else requireCompact(typeof v === 'string' && (field !== 19 || v.trim().length > 0));
}
export function materializeRecord(v: readonly unknown[]): CompactRecord {
  requireCompact(v.length === 21);
  return {
    id: v[0],
    name: v[1],
    roadAddress: v[2],
    parcelAddress: v[3],
    categoryName: v[4],
    businessTypes: v[5],
    rawStatus: { operatingCode: v[6], operatingName: v[7], detailedCode: v[8], detailedName: v[9] },
    processedStatus: v[10],
    lifecycle: Object.fromEntries(COMPACT_FIELDS.slice(11, 19).map((k, i) => [k, v[i + 11]])),
    sourceLabel: v[19],
    sourceUrl: v[20],
  } as CompactRecord;
}
export function columnValue(column: Column, row: number, dictionaries: Dictionaries): unknown {
  if ('values' in column) return column.values[row];
  const values = 'dictionary' in column ? column.dictionary : dictionaries[column.shared];
  requireCompact(values && integer(column.refs[row]) && column.refs[row] < values.length);
  return values[column.refs[row]];
}
export function encodeColumns(
  rows: readonly (readonly unknown[])[],
  shared: Dictionaries = [],
): Column[] {
  if (rows.length === 0) return [];
  return required(rows[0]).map((_, j) => {
    const values = rows.map((r) => r[j]);
    const unique: unknown[] = [];
    const ids = new Map<string, number>();
    const refs = values.map((v) => {
      const k = JSON.stringify(v);
      let i = ids.get(k);
      if (i === undefined) {
        i = unique.length;
        ids.set(k, i);
        unique.push(v);
      }
      return i;
    });
    const options: Column[] = [{ values }, { dictionary: unique, refs }];
    if (shared[j]) {
      const map = new Map(shared[j]?.map((v, i) => [JSON.stringify(v), i]));
      const indices = values.map((v) => map.get(JSON.stringify(v)));
      if (indices.every((i) => i !== undefined))
        options.push({ shared: j, refs: indices as number[] });
    }
    return options.reduce((a, b) =>
      new TextEncoder().encode(JSON.stringify(a)).length <=
      new TextEncoder().encode(JSON.stringify(b)).length
        ? a
        : b,
    );
  });
}
export function validateDictionaries(value: unknown, archive: string): Dictionaries {
  requireCompact(
    object(value) &&
      exactKeys(value, ['version', 'archiveSha256', 'dictionaries']) &&
      value.version === 1 &&
      value.archiveSha256 === archive &&
      Array.isArray(value.dictionaries) &&
      value.dictionaries.length === 21,
  );
  for (let j = 0; j < 21; j++) {
    const a = value.dictionaries[j];
    requireCompact(a === null || Array.isArray(a));
    if (a) for (const v of a) validateValue(v, j);
  }
  return value.dictionaries as Dictionaries;
}
export function validateBlock(
  value: unknown,
  entry: Pick<CompactEntry, 'role' | 'start' | 'count'>,
  archive: string,
  shared: Dictionaries,
): CompactBlock {
  requireCompact(
    object(value) &&
      exactKeys(value, ['version', 'archiveSha256', 'role', 'start', 'count', 'columns']) &&
      value.version === 1 &&
      value.archiveSha256 === archive &&
      value.role === entry.role &&
      value.start === entry.start &&
      value.count === entry.count &&
      Array.isArray(value.columns),
  );
  const offset = entry.role === 'search' ? 0 : 4,
    width = entry.role === 'search' ? 4 : 17;
  requireCompact(value.columns.length === width);
  for (let j = 0; j < width; j++) {
    const c = value.columns[j];
    requireCompact(object(c));
    if ('values' in c) {
      requireCompact(
        exactKeys(c, ['values']) && Array.isArray(c.values) && c.values.length === entry.count,
      );
      for (const v of c.values) validateValue(v, offset + j);
    } else {
      requireCompact(Array.isArray(c.refs) && c.refs.length === entry.count);
      let values: unknown[] | null | undefined;
      if ('dictionary' in c) {
        requireCompact(exactKeys(c, ['dictionary', 'refs']) && Array.isArray(c.dictionary));
        values = c.dictionary;
      } else {
        requireCompact(
          exactKeys(c, ['shared', 'refs']) && integer(c.shared) && c.shared === offset + j,
        );
        values = shared[c.shared];
      }
      requireCompact(Array.isArray(values));
      for (const v of values) validateValue(v, offset + j);
      for (const i of c.refs) requireCompact(integer(i) && i < values.length);
    }
  }
  if (entry.role === 'evidence')
    for (let i = 0; i < entry.count; i++)
      requireCompact(
        columnValue(value.columns[6] as Column, i, shared) ===
          mapLicenseStatusV1({
            operatingCode: columnValue(value.columns[2] as Column, i, shared) as string | null,
            operatingName: columnValue(value.columns[3] as Column, i, shared) as string | null,
          }),
      );
  return value as unknown as CompactBlock;
}
export function validateManifest(value: unknown): CompactManifest {
  requireCompact(
    object(value) &&
      exactKeys(value, [
        'version',
        'kind',
        'schemaVersion',
        'identifierContractVersion',
        'normalizationContractVersion',
        'archiveSha256',
        'policyRevision',
        'dateBasis',
        'sourceDataAsOf',
        'recordCount',
        'orderedIdsSha256',
        'metadata',
        'entries',
      ]) &&
      value.version === 1 &&
      value.kind === 'compact-dataset' &&
      value.schemaVersion === 2 &&
      value.identifierContractVersion === 1 &&
      value.normalizationContractVersion === 1 &&
      digestString(value.archiveSha256) &&
      digestString(value.orderedIdsSha256) &&
      integer(value.recordCount) &&
      value.dateBasis === 'collection' &&
      value.sourceDataAsOf === null &&
      (value.policyRevision === null ||
        (typeof value.policyRevision === 'string' && value.policyRevision.trim().length > 0)) &&
      object(value.metadata) &&
      Array.isArray(value.entries),
  );
  const meta = value.metadata;
  requireCompact(
    exactKeys(meta, ['sourceLabel', 'sourceUrl', 'exampleQuery', 'coverage']) &&
      typeof meta.sourceLabel === 'string' &&
      meta.sourceLabel.trim().length > 0 &&
      (meta.sourceUrl === null || typeof meta.sourceUrl === 'string') &&
      typeof meta.exampleQuery === 'string' &&
      object(meta.coverage) &&
      exactKeys(meta.coverage, ['kind', 'date']) &&
      meta.coverage.kind === 'collected' &&
      typeof meta.coverage.date === 'string' &&
      isCalendarDate(meta.coverage.date),
  );
  const names = new Set<string>();
  const end = { search: 0, evidence: 0 };
  let dictionaryCount = 0;
  for (const e of value.entries) {
    requireCompact(
      object(e) &&
        exactKeys(e, ['name', 'sha256', 'byteLength', 'role', 'start', 'count']) &&
        digestString(e.sha256) &&
        e.name === `assets/compact-${e.sha256}.json` &&
        !names.has(e.name) &&
        integer(e.byteLength) &&
        e.byteLength > 0 &&
        e.byteLength <= COMPACT_MAX_BYTES &&
        integer(e.start) &&
        integer(e.count),
    );
    names.add(e.name);
    if (e.role === 'dictionaries') {
      dictionaryCount++;
      requireCompact(e.start === 0 && e.count === 0);
    } else {
      requireCompact(e.role === 'search' || e.role === 'evidence');
      requireCompact(e.start === end[e.role] && e.count > 0 && e.count <= COMPACT_BLOCK_ROWS);
      end[e.role] += e.count;
    }
  }
  requireCompact(
    dictionaryCount === 1 && end.search === value.recordCount && end.evidence === value.recordCount,
  );
  const search = value.entries.filter(
      (e) => (e as CompactEntry).role === 'search',
    ) as CompactEntry[],
    evidence = value.entries.filter(
      (e) => (e as CompactEntry).role === 'evidence',
    ) as CompactEntry[];
  requireCompact(
    search.length === evidence.length &&
      search.every((e, i) => e.start === evidence[i]?.start && e.count === evidence[i]?.count),
  );
  return value as unknown as CompactManifest;
}

/** A release's hash-bound manifest and quality baseline must describe the same snapshot. */
export function validateCompactReleaseBinding(
  manifest: CompactManifest,
  release: unknown,
  baseline: unknown,
): void {
  requireCompact(
    object(release) &&
      object(baseline) &&
      object(baseline.metrics) &&
      object(baseline.metrics.total),
  );
  requireCompact(
    release.version === 2 &&
      release.dateBasis === 'collection' &&
      release.sourceDataAsOf === null &&
      typeof release.collectedAt === 'string',
  );
  requireCompact(
    typeof manifest.policyRevision === 'string' && manifest.policyRevision.trim().length > 0,
  );
  requireCompact(
    baseline.validationVersion === 1 &&
      baseline.schemaVersion === manifest.schemaVersion &&
      baseline.identifierContractVersion === manifest.identifierContractVersion &&
      baseline.normalizationContractVersion === manifest.normalizationContractVersion,
  );
  requireCompact(
    release.archiveSha256 === manifest.archiveSha256 &&
      release.policyRevision === manifest.policyRevision &&
      release.recordCount === manifest.recordCount,
  );
  requireCompact(
    manifest.metadata.coverage.kind === 'collected' &&
      seoulCalendarDate(release.collectedAt) === manifest.metadata.coverage.date,
  );
  requireCompact(
    baseline.archiveSha256 === manifest.archiveSha256 &&
      baseline.policyRevision === manifest.policyRevision &&
      baseline.dateBasis === 'collection' &&
      baseline.dataAsOf === manifest.metadata.coverage.date &&
      baseline.metrics.total.recordCount === manifest.recordCount,
  );
}

function required<T>(value: T | null | undefined): T {
  if (value === undefined || value === null) throw new Error('Missing required compact value');
  return value;
}
