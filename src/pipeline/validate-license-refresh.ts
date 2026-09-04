import { createHash } from 'node:crypto';
import { evaluateDataFreshnessV1, seoulCalendarDate } from '../shared/data-freshness.js';
import { parseArchiveContract, type ArchiveContract } from './archive-contract.js';
import { isCalendarDate } from './calendar-date.js';
import {
  isCanonicalUtc,
  type CollectionResult,
  type PermissionManifest,
} from './collector-types.js';
import { measureValidationMetrics, validValidationMetrics } from './refresh-validation-metrics.js';
import {
  VALIDATION_STATUSES,
  compareText,
  count,
  object,
  sameKeys,
  requireValue,
  sha256,
  text,
  type MetricLimitsV1,
  type ValidationBaselineV1,
  type ValidationDiagnosticV1,
  type ValidationInputV1,
  type ValidationMetricsV1,
  type ValidationPolicyV1,
  type ValidationResultV1,
} from './refresh-validation-types.js';
import {
  SOURCE_PROVIDER_FRESHNESS,
  isAllowedProviderUrl,
  parsePermissionManifest,
} from './source-contract.js';
import {
  TransformationRejected,
  transformLicenseRecordsV2,
  type TransformationResultV2,
} from './transform-license-records.js';
export type {
  ValidationInputV1,
  ValidationPolicyV1,
  ValidationBaselineV1,
  ValidationResultV1,
} from './refresh-validation-types.js';
function finite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}
function rate(value: unknown): value is number {
  return finite(value) && value <= 1;
}
function strings(value: unknown): value is string[] {
  return Array.isArray(value) && Array.from(value).every((item) => typeof item === 'string');
}
function sameArray(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}
function validCollection(value: Record<string, unknown>): value is Extract<
  CollectionResult,
  {
    kind: 'accepted';
  }
> &
  Record<string, unknown> {
  if (
    value.kind !== 'accepted' ||
    (value.change !== 'changed' && value.change !== 'unchanged') ||
    !text(value.archivePath) ||
    !sha256(value.sha256) ||
    !count(value.byteLength) ||
    value.byteLength === 0 ||
    typeof value.fetchedAt !== 'string' ||
    !isCanonicalUtc(value.fetchedAt)
  )
    return false;
  const source = value.sourceEvidence,
    archive = value.archiveEvidence;
  if (
    !object(source) ||
    !object(archive) ||
    !object(source.providerFreshness) ||
    source.expectedBytes !== value.byteLength ||
    typeof source.finalUrl !== 'string' ||
    !isAllowedProviderUrl(source.finalUrl)
  )
    return false;
  const freshness = source.providerFreshness;
  return (
    freshness.updateCadence === SOURCE_PROVIDER_FRESHNESS.updateCadence &&
    freshness.coverageLagDays === SOURCE_PROVIDER_FRESHNESS.coverageLagDays &&
    freshness.sourceUrl === SOURCE_PROVIDER_FRESHNESS.sourceUrl &&
    archive.entryCount === 195 &&
    sha256(archive.schemaManifestSha256) &&
    typeof archive.providerModifiedDate === 'string' &&
    isCalendarDate(archive.providerModifiedDate)
  );
}
function contracts(input: Record<string, unknown>): {
  archive: ArchiveContract;
  permission: PermissionManifest;
} | null {
  const rawArchive = input.archiveContract;
  if (
    !object(rawArchive) ||
    !Array.isArray(rawArchive.entries) ||
    !Array.from(rawArchive.entries).every(
      (entry) => object(entry) && strings(entry.headers) && strings(entry.timestampFields),
    )
  )
    return null;
  // Existing parsers own malformed external JSON. This catch is limited to those parsing calls.
  let archive: ArchiveContract;
  let permission: PermissionManifest;
  try {
    archive = parseArchiveContract(input.archiveContract);
    permission = parsePermissionManifest(input.permissionManifest);
  } catch {
    return null;
  }
  if (
    archive.expectedEntryCount !== 195 ||
    archive.provider !== permission.provider ||
    archive.permissionLabel !== permission.permissionLabel
  )
    return null;
  const ids = new Set<string>(),
    names = new Set<string>();
  const permissionIds = new Set(permission.categories.map((c) => c.fileDataId));
  for (const entry of archive.entries) {
    if (
      !permissionIds.has(entry.fileDataId) ||
      ids.has(entry.fileDataId) ||
      !text(entry.entryName) ||
      names.has(entry.entryName) ||
      new Set(entry.headers).size !== entry.headers.length ||
      entry.headers.some((h) => !text(h))
    )
      return null;
    ids.add(entry.fileDataId);
    names.add(entry.entryName);
  }
  return {
    archive,
    permission,
  };
}
function validStaging(
  input: Record<string, unknown>,
  archive: ArchiveContract,
  permission: PermissionManifest,
  hash: string,
): input is Record<string, unknown> & Pick<ValidationInputV1, 'rows' | 'ingestion'> {
  if (
    !Array.isArray(input.rows) ||
    !Array.isArray(input.ingestion) ||
    input.ingestion.length !== archive.entries.length
  )
    return false;
  const entries = new Map(archive.entries.map((e) => [e.fileDataId, e]));
  const urls = new Map(permission.categories.map((c) => [c.fileDataId, c.fileDataUrl]));
  const rowCounts = new Map(archive.entries.map((e) => [e.fileDataId, 0]));
  for (const row of input.rows) {
    if (
      !object(row) ||
      typeof row.categoryFileDataId !== 'string' ||
      !entries.has(row.categoryFileDataId) ||
      row.sourceFileDataUrl !== urls.get(row.categoryFileDataId) ||
      !object(row.values)
    )
      return false;
    rowCounts.set(row.categoryFileDataId, requireValue(rowCounts.get(row.categoryFileDataId)) + 1);
  }
  const seen = new Set<string>();
  for (const item of input.ingestion) {
    if (
      !object(item) ||
      typeof item.fileDataId !== 'string' ||
      seen.has(item.fileDataId) ||
      !strings(item.headers)
    )
      return false;
    const entry = entries.get(item.fileDataId);
    if (
      !entry ||
      item.entryName !== entry.entryName ||
      !sameArray(item.headers, entry.headers) ||
      item.completed !== true ||
      !count(item.rowCount) ||
      item.rowCount !== rowCounts.get(item.fileDataId) ||
      item.archiveSha256 !== hash
    )
      return false;
    seen.add(item.fileDataId);
  }
  return true;
}
type PolicyState = 'valid' | 'missing' | 'invalid';
function combineStates(states: PolicyState[]): PolicyState {
  return states.includes('invalid') ? 'invalid' : states.includes('missing') ? 'missing' : 'valid';
}
function fieldsState(
  value: Record<string, unknown>,
  rules: Record<string, (value: unknown) => boolean>,
): PolicyState {
  return combineStates(
    Object.entries(rules).map(([key, check]) =>
      value[key] === undefined ? 'missing' : check(value[key]) ? 'valid' : 'invalid',
    ),
  );
}
function statusLimitsState(value: unknown): PolicyState {
  if (value === undefined) return 'missing';
  if (
    !object(value) ||
    Object.keys(value).some((key) => !VALIDATION_STATUSES.some((s) => s === key))
  )
    return 'invalid';
  return fieldsState(
    value,
    Object.fromEntries(VALIDATION_STATUSES.map((status) => [status, rate])),
  );
}
function limitsState(value: unknown): PolicyState {
  if (value === undefined) return 'missing';
  if (!object(value)) return 'invalid';
  if (count(value.minCount) && count(value.maxCount) && value.minCount > value.maxCount)
    return 'invalid';
  return combineStates([
    fieldsState(value, {
      evidenceReference: text,
      minCount: count,
      maxCount: count,
      maxAbsoluteCountChange: count,
      maxRelativeCountChange: finite,
      maxMissingNameRate: rate,
      maxMissingBothAddressRate: rate,
    }),
    statusLimitsState(value.maxStatusShareChange),
  ]);
}
function policyState(value: unknown, ids: string[]): PolicyState {
  if (value === undefined) return 'missing';
  if (!object(value)) return 'invalid';
  const basic = fieldsState(value, {
    version: (v) => v === 1,
    revision: text,
    evidenceReference: text,
    maxJsonBytes: (v) => count(v) && v > 0,
    categories: (v) => object(v) && Object.keys(v).every((id) => ids.includes(id)),
    allowedEmptyCategories: (v) =>
      strings(v) && new Set(v).size === v.length && v.every((id) => ids.includes(id)),
  });
  const categories = object(value.categories) ? value.categories : {};
  return combineStates([
    basic,
    limitsState(value.total),
    ...ids.map((id) => limitsState(categories[id])),
  ]);
}
function baselineState(
  value: unknown,
  ids: string[],
  policy: ValidationPolicyV1 | null,
  schemaHash: string,
): 'valid' | 'missing' | 'invalid' | 'incompatible' {
  if (value === undefined) return 'missing';
  if (
    !object(value) ||
    !text(value.evidenceReference) ||
    !sha256(value.archiveSha256) ||
    !sha256(value.schemaManifestSha256) ||
    typeof value.dataAsOf !== 'string' ||
    !isCalendarDate(value.dataAsOf) ||
    !text(value.policyRevision)
  )
    return 'invalid';
  if (
    value.validationVersion !== 1 ||
    value.schemaVersion !== 2 ||
    value.identifierContractVersion !== 1 ||
    value.normalizationContractVersion !== 1 ||
    value.schemaManifestSha256 !== schemaHash ||
    (policy !== null && value.policyRevision !== policy.revision)
  )
    return 'incompatible';
  if (
    !object(value.metrics) ||
    !object(value.metrics.categories) ||
    !sameKeys(value.metrics.categories, ids)
  )
    return 'incompatible';
  return validValidationMetrics(value.metrics, ids) ? 'valid' : 'invalid';
}
function compareMetric(
  current: ValidationMetricsV1['total'],
  previous: ValidationMetricsV1['total'] | null,
  limits: MetricLimitsV1,
  categoryId: string | undefined,
  add: (d: ValidationDiagnosticV1) => void,
): void {
  const context = {
    evidenceReference: limits.evidenceReference,
    ...(categoryId === undefined
      ? {}
      : {
          categoryId,
        }),
  };
  const reject = (code: string, metric: string, actual: number, limit: number) =>
    add({
      code,
      severity: 'rejection',
      ...context,
      metric,
      actual,
      limit,
    });
  const n = current.recordCount;
  if (n < limits.minCount) reject('count_below_minimum', 'recordCount', n, limits.minCount);
  if (n > limits.maxCount) reject('count_above_maximum', 'recordCount', n, limits.maxCount);
  if (n > 0) {
    const missingName = current.missingNameCount / n,
      missingAddress = current.missingBothAddressCount / n;
    if (missingName > limits.maxMissingNameRate)
      reject(
        'missing_name_rate_exceeded',
        'missingNameRate',
        missingName,
        limits.maxMissingNameRate,
      );
    if (missingAddress > limits.maxMissingBothAddressRate)
      reject(
        'missing_address_rate_exceeded',
        'missingBothAddressRate',
        missingAddress,
        limits.maxMissingBothAddressRate,
      );
  }
  if (previous === null) return;
  const delta = Math.abs(n - previous.recordCount);
  if (delta > limits.maxAbsoluteCountChange)
    reject('count_change_exceeded', 'absoluteCountChange', delta, limits.maxAbsoluteCountChange);
  if (previous.recordCount === 0) {
    if (n > 0)
      add({
        code: 'zero_baseline_growth_review_required',
        severity: 'review',
        ...context,
      });
    return;
  }
  const relative = delta / previous.recordCount;
  if (relative > limits.maxRelativeCountChange)
    reject('count_change_exceeded', 'relativeCountChange', relative, limits.maxRelativeCountChange);
  if (n === 0) return; // No status distribution exists for an empty category; counts still apply.
  for (const status of VALIDATION_STATUSES) {
    const difference = Math.abs(
      current.statusCounts[status] / n - previous.statusCounts[status] / previous.recordCount,
    );
    if (difference > limits.maxStatusShareChange[status])
      reject(
        'status_share_change_exceeded',
        status,
        difference,
        limits.maxStatusShareChange[status],
      );
  }
}

/**
 * ADR-014: validates staged evidence only. Approved contracts/policy/assertions are caller-owned
 * review inputs, not cryptographic attestations. There is no I/O, baseline promotion, or public
 * artifact serializer; TASK-009 must validate and bind the exact publication bytes separately.
 */
export function validateLicenseRefreshV1(input: unknown): ValidationResultV1 {
  const diagnostics: ValidationDiagnosticV1[] = [];
  let archiveSha256: string | null = null,
    policyRevision: string | null = null,
    dataAsOf: string | null = null;
  let metrics: ValidationMetricsV1 | null = null;
  const add = (diagnostic: ValidationDiagnosticV1) => {
    diagnostics.push(diagnostic);
  };
  const finish = (candidate?: TransformationResultV2): ValidationResultV1 => {
    diagnostics.sort(
      (a, b) =>
        compareText(a.code, b.code) ||
        compareText(a.categoryId ?? '', b.categoryId ?? '') ||
        compareText(a.metric ?? '', b.metric ?? ''),
    );
    const report = {
      validationVersion: 1 as const,
      archiveSha256,
      policyRevision,
      dataAsOf,
      metrics,
      diagnostics,
    };
    if (diagnostics.some((d) => d.severity === 'rejection'))
      return {
        ...report,
        kind: 'rejected',
      };
    if (diagnostics.some((d) => d.severity === 'review'))
      return {
        ...report,
        kind: 'review_required',
      };
    if (!candidate || dataAsOf === null)
      throw new Error('Validation result has no proven candidate');
    return {
      ...report,
      kind: 'accepted',
      dataAsOf,
      candidate,
    };
  };
  const reject = (code: string) => {
    add({
      code,
      severity: 'rejection',
    });
    return finish();
  };
  if (!object(input) || !object(input.collection)) return reject('malformed_validation_input');
  const collection = input.collection;
  if (collection.kind === 'rejected')
    return reject(text(collection.code) ? collection.code : 'collection_rejected');
  if (!validCollection(collection)) return reject('malformed_collection_evidence');
  archiveSha256 = collection.sha256;
  if (typeof input.now !== 'string' || !isCanonicalUtc(input.now)) return reject('invalid_now');
  if (collection.fetchedAt > input.now) return reject('retrieval_in_future');
  const parsed = contracts(input);
  if (!parsed) return reject('source_contract_mismatch');
  const { archive, permission } = parsed;
  const schemaHash = createHash('sha256')
    .update(
      JSON.stringify(
        [...archive.entries]
          .sort((a, b) => a.entryName.localeCompare(b.entryName))
          .map((entry) => ({
            ...entry,
            entryName: entry.entryName.normalize('NFC'),
          })),
      ),
    )
    .digest('hex');
  if (schemaHash !== collection.archiveEvidence.schemaManifestSha256)
    return reject('schema_hash_mismatch');
  if (!validStaging(input, archive, permission, archiveSha256))
    return reject('ingestion_evidence_mismatch');
  let transformed: TransformationResultV2;
  try {
    transformed = transformLicenseRecordsV2({
      archiveContract: archive,
      archive: {
        fetchedAt: collection.fetchedAt,
        sha256: archiveSha256,
      },
      rows: input.rows,
    });
  } catch (error) {
    if (error instanceof TransformationRejected) return reject(error.code);
    throw error;
  }
  const ids = archive.entries.map((e) => e.fileDataId).sort(compareText);
  metrics = measureValidationMetrics(transformed, ids);
  if (metrics.total.recordCount === 0)
    add({
      code: 'empty_refresh',
      severity: 'rejection',
    });
  for (const id of ids)
    if (requireValue(metrics.categories[id]).unknownPairCount > 0)
      add({
        code: 'aggregate_pair_review_required',
        severity: 'review',
        categoryId: id,
        metric: 'unknownPairCount',
        actual: requireValue(metrics.categories[id]).unknownPairCount,
      });
  const policyStatus = policyState(input.policy, ids);
  const policy = policyStatus === 'valid' ? (input.policy as ValidationPolicyV1) : null;
  if (policy) policyRevision = policy.revision;
  else
    add({
      code: policyStatus === 'missing' ? 'policy_review_required' : 'invalid_validation_policy',
      severity: policyStatus === 'missing' ? 'review' : 'rejection',
    });
  const baselineStatus = baselineState(input.baseline, ids, policy, schemaHash);
  const baseline = baselineStatus === 'valid' ? (input.baseline as ValidationBaselineV1) : null;
  if (!baseline)
    add({
      code:
        baselineStatus === 'missing'
          ? 'baseline_review_required'
          : baselineStatus === 'incompatible'
            ? 'baseline_incompatible'
            : 'invalid_baseline',
      severity: baselineStatus === 'invalid' ? 'rejection' : 'review',
    });
  if (policy) {
    compareMetric(metrics.total, baseline?.metrics.total ?? null, policy.total, undefined, add);
    for (const id of ids) {
      const current = requireValue(metrics.categories[id]);
      if (current.recordCount === 0 && !policy.allowedEmptyCategories.includes(id))
        add({
          code: 'empty_category_not_approved',
          severity: 'rejection',
          categoryId: id,
        });
      compareMetric(
        current,
        baseline?.metrics.categories[id] ?? null,
        requireValue(policy.categories[id]),
        id,
        add,
      );
    }
  }
  const coverage = input.coverage;
  if (coverage === undefined)
    add({
      code: 'data_as_of_unverified',
      severity: 'review',
    });
  else {
    if (
      !object(coverage) ||
      coverage.archiveSha256 !== archiveSha256 ||
      coverage.timezone !== 'Asia/Seoul' ||
      !text(coverage.evidenceReference) ||
      !Array.isArray(coverage.categories) ||
      coverage.categories.length !== ids.length
    )
      return reject('invalid_coverage_evidence');
    const dates = new Set<string>(),
      seen = new Set<string>();
    for (const item of coverage.categories) {
      if (
        !object(item) ||
        typeof item.fileDataId !== 'string' ||
        !ids.includes(item.fileDataId) ||
        seen.has(item.fileDataId) ||
        typeof item.dataAsOf !== 'string' ||
        !isCalendarDate(item.dataAsOf)
      )
        return reject('invalid_coverage_evidence');
      seen.add(item.fileDataId);
      dates.add(item.dataAsOf);
    }
    if (dates.size !== 1) return reject('inconsistent_category_coverage');
    const date = requireValue([...dates][0]);
    const freshness = evaluateDataFreshnessV1(date, input.now);
    if (freshness.kind === 'rejected') return reject(freshness.code);
    const retrievalDate = seoulCalendarDate(collection.fetchedAt);
    if (retrievalDate === null || date > retrievalDate) return reject('coverage_after_retrieval');
    if (baseline && date < baseline.dataAsOf)
      add({
        code: 'data_as_of_regressed',
        severity: 'rejection',
      });
    if (baseline && baseline.archiveSha256 === archiveSha256 && date !== baseline.dataAsOf)
      add({
        code: 'same_archive_coverage_changed',
        severity: 'rejection',
      });
    dataAsOf = date;
    if (freshness.kind === 'stale')
      add({
        code: 'data_stale',
        severity: 'warning',
        metric: 'ageDays',
        actual: freshness.ageDays,
        limit: 7,
        evidenceReference: coverage.evidenceReference,
      });
  }
  return finish(transformed);
}
