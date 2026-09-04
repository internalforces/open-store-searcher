import type { ProcessedStatusV1 } from '../domain/map-license-status.js';
import type { ArchiveContract } from './archive-contract.js';
import type { CollectionResult, PermissionManifest } from './collector-types.js';
import type { StagedLicenseRowV1, TransformationResultV2 } from './transform-license-records.js';

export const VALIDATION_STATUSES = ['행정상 영업', '휴업', '폐업', '확인되지 않음'] as const;
export const RAW_COMPLETENESS_FIELDS = [
  'businessName',
  'roadAddress',
  'parcelAddress',
  'detailedCode',
  'detailedName',
] as const;
export type RawCompletenessField = (typeof RAW_COMPLETENESS_FIELDS)[number];
export interface MissingCellCounts {
  null: number;
  empty: number;
  whitespace: number;
}
export interface ValidationMetricV1 {
  recordCount: number;
  missingNameCount: number;
  missingBothAddressCount: number;
  unknownPairCount: number;
  statusCounts: Record<ProcessedStatusV1, number>;
  rawMissing: Record<RawCompletenessField, MissingCellCounts>;
  aggregatePairs: Array<{ code: string | null; name: string | null; count: number }>;
  collisionGroupCount: number;
  collisionRecordCount: number;
}
export interface ValidationMetricsV1 {
  total: ValidationMetricV1;
  categories: Record<string, ValidationMetricV1>;
}
export interface MetricLimitsV1 {
  evidenceReference: string;
  minCount: number;
  maxCount: number;
  maxAbsoluteCountChange: number;
  maxRelativeCountChange: number;
  maxMissingNameRate: number;
  maxMissingBothAddressRate: number;
  maxStatusShareChange: Record<ProcessedStatusV1, number>;
}
export interface ValidationPolicyV1 {
  version: 1;
  revision: string;
  evidenceReference: string;
  maxJsonBytes: number;
  total: MetricLimitsV1;
  categories: Record<string, MetricLimitsV1>;
  allowedEmptyCategories: string[];
}
export interface ValidationBaselineV1 {
  validationVersion: 1;
  schemaVersion: 2;
  identifierContractVersion: 1;
  normalizationContractVersion: 1;
  policyRevision: string;
  archiveSha256: string;
  schemaManifestSha256: string;
  dataAsOf: string;
  evidenceReference: string;
  metrics: ValidationMetricsV1;
}
export interface CoverageAssertionV1 {
  archiveSha256: string;
  timezone: 'Asia/Seoul';
  evidenceReference: string;
  categories: Array<{ fileDataId: string; dataAsOf: string }>;
}
export interface IngestionCategoryV1 {
  fileDataId: string;
  entryName: string;
  headers: string[];
  completed: boolean;
  rowCount: number;
  archiveSha256: string;
}
export interface ValidationInputV1 {
  collection: CollectionResult;
  archiveContract: ArchiveContract;
  permissionManifest: PermissionManifest;
  rows: StagedLicenseRowV1[];
  ingestion: IngestionCategoryV1[];
  policy?: ValidationPolicyV1;
  baseline?: ValidationBaselineV1;
  coverage?: CoverageAssertionV1;
  now: string;
}
export interface ValidationDiagnosticV1 {
  code: string;
  severity: 'rejection' | 'review' | 'warning';
  categoryId?: string;
  metric?: string;
  actual?: number;
  limit?: number;
  evidenceReference?: string;
}
interface ValidationReportV1 {
  validationVersion: 1;
  archiveSha256: string | null;
  policyRevision: string | null;
  metrics: ValidationMetricsV1 | null;
  dataAsOf: string | null;
  diagnostics: ValidationDiagnosticV1[];
}
export type ValidationResultV1 =
  | (ValidationReportV1 & { kind: 'accepted'; dataAsOf: string; candidate: TransformationResultV2 })
  | (ValidationReportV1 & { kind: 'rejected' | 'review_required' });

export function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
export function text(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
export function count(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0;
}
export function sha256(value: unknown): value is string {
  return typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
}
export function sameKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return (
    Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key))
  );
}
export function compareText(a: string, b: string): number {
  return Buffer.compare(Buffer.from(a), Buffer.from(b));
}

/** Internal consistency check after complete category validation; never silently drop a record. */
export function requireValue<T>(value: T | null | undefined): T {
  if (value === undefined || value === null) throw new Error('Missing validated category value');
  return value;
}
