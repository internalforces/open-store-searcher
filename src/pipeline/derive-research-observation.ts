import { createHash } from 'node:crypto';
import {
  type AggregateVocabularyVersion,
  canonicalJson,
  knownPairForVocabulary,
  matchesVocabularyV2,
  VOCABULARY_V2,
} from './aggregate-vocabulary.js';
import type { ArchiveContract } from './archive-contract.js';
import type { ObservationReport, ObservationReportV2 } from './observe-license-archive.js';
import { validValidationMetricsForVocabulary } from './refresh-validation-metrics.js';
import {
  count,
  object,
  sha256,
  text,
  type ValidationMetricsV1,
} from './refresh-validation-types.js';
import { researchObservationDiagnostics } from './research-observation-diagnostics.js';

export interface ImplementationDigest {
  path: string;
  sha256: string;
}
// Reviewed ADR-017 offline evidence limits; these are not production data-quality thresholds.
export const DERIVATION_INPUT_LIMITS = Object.freeze({
  maxReportBytes: 16 * 1024 * 1024,
  maxAuditBytes: 256 * 1024,
});
export interface DerivedResearchObservationV2 extends ObservationReportV2 {
  derivationVersion: 1;
  sourceReportSha256: string;
  sourceAuditSha256: string;
  derivationImplementation: ImplementationDigest[];
  researchOnly: true;
  independentTemporalObservation: false;
  productionBaselineCreated: false;
}
type CompleteReport = (ObservationReport | ObservationReportV2) & { metrics: ValidationMetricsV1 };
export class ObservationDerivationError extends Error {
  readonly code:
    | 'vocabulary_revision_mismatch'
    | 'invalid_observation_evidence'
    | 'invalid_derivation_evidence';
  constructor(code: ObservationDerivationError['code']) {
    super(code);
    this.code = code;
  }
}
const digest = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
function validImplementation(value: unknown): value is ImplementationDigest[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.length <= 256 &&
    Array.from(value).every((item) => object(item) && text(item.path) && sha256(item.sha256)) &&
    new Set(value.map((item) => item.path)).size === value.length
  );
}
function validReport(
  value: unknown,
  archive: ArchiveContract,
  version: AggregateVocabularyVersion,
): value is CompleteReport {
  if (
    !object(value) ||
    value.complete !== true ||
    value.kind !== 'review_required' ||
    value.dataAsOf !== null ||
    !sha256(value.archiveSha256) ||
    !count(value.bytesRead) ||
    archive.entries.length !== 195 ||
    !validValidationMetricsForVocabulary(
      value.metrics,
      archive.entries.map((e) => e.fileDataId),
      version,
    ) ||
    value.metrics.total.recordCount === 0 ||
    !Array.isArray(value.ingestion) ||
    value.ingestion.length !== 195 ||
    canonicalJson(value.diagnostics) !==
      canonicalJson(researchObservationDiagnostics(value.metrics))
  )
    return false;
  const metrics = value.metrics;
  return archive.entries.every((entry, i) => {
    const item: unknown = (value.ingestion as unknown[])[i];
    return (
      object(item) &&
      item.completed === true &&
      item.fileDataId === entry.fileDataId &&
      item.entryName === entry.entryName &&
      item.archiveSha256 === value.archiveSha256 &&
      item.rowCount === metrics.categories[entry.fileDataId]?.recordCount &&
      canonicalJson(item.headers) === canonicalJson(entry.headers)
    );
  });
}
/** Parses complete V2 research envelopes; V1 or mixed revisions never become V2 implicitly. */
export function validateResearchObservationV2(
  value: unknown,
  archive: ArchiveContract,
): { valid: true; report: ObservationReportV2 } | { valid: false; code: string } {
  if (
    !object(value) ||
    value.validationVersion !== 2 ||
    value.observationVersion !== 2 ||
    !matchesVocabularyV2(value)
  )
    return { valid: false, code: 'vocabulary_revision_mismatch' };
  if (!validReport(value, archive, 2))
    return { valid: false, code: 'invalid_observation_evidence' };
  // A derived envelope must be complete; removing one provenance field cannot turn it into a live report.
  if (
    'derivationVersion' in value ||
    'researchOnly' in value ||
    'sourceReportSha256' in value ||
    'sourceAuditSha256' in value ||
    'derivationImplementation' in value ||
    'independentTemporalObservation' in value ||
    'productionBaselineCreated' in value
  ) {
    if (
      value.derivationVersion !== 1 ||
      value.researchOnly !== true ||
      value.independentTemporalObservation !== false ||
      value.productionBaselineCreated !== false ||
      !sha256(value.sourceReportSha256) ||
      !sha256(value.sourceAuditSha256) ||
      !validImplementation(value.derivationImplementation)
    )
      return { valid: false, code: 'invalid_derivation_evidence' };
  }
  return { valid: true, report: value as ObservationReportV2 };
}

/** Offline derivation only. Audit hashes bind historical evidence, not a new source observation. */
export function deriveResearchObservationV2(input: {
  sourceReportBytes: Uint8Array;
  sourceAuditBytes: Uint8Array;
  archiveContract: ArchiveContract;
  derivationImplementation: ImplementationDigest[];
}): DerivedResearchObservationV2 {
  if (
    input.sourceReportBytes.byteLength > DERIVATION_INPUT_LIMITS.maxReportBytes ||
    input.sourceAuditBytes.byteLength > DERIVATION_INPUT_LIMITS.maxAuditBytes
  )
    throw new ObservationDerivationError('invalid_derivation_evidence');
  let source: unknown, audit: unknown;
  try {
    const decoder = new TextDecoder('utf-8', { fatal: true });
    source = JSON.parse(decoder.decode(input.sourceReportBytes));
    audit = JSON.parse(decoder.decode(input.sourceAuditBytes));
  } catch {
    throw new ObservationDerivationError('invalid_derivation_evidence');
  }
  if (
    !object(source) ||
    source.observationVersion !== 1 ||
    'validationVersion' in source ||
    'aggregateVocabularyVersion' in source ||
    'aggregateVocabularySha256' in source
  )
    throw new ObservationDerivationError('vocabulary_revision_mismatch');
  if (!validReport(source, input.archiveContract, 1))
    throw new ObservationDerivationError('invalid_observation_evidence');
  const sourceReportSha256 = digest(input.sourceReportBytes),
    sourceAuditSha256 = digest(input.sourceAuditBytes);
  if (
    !object(audit) ||
    audit.auditVersion !== 1 ||
    audit.reportSha256 !== sourceReportSha256 ||
    audit.archiveSha256 !== source.archiveSha256 ||
    audit.implementationMatchedBefore !== true ||
    audit.implementationMatchedAfter !== true ||
    audit.stagingEmptyAfter !== true ||
    audit.productionPublication !== false ||
    audit.sourceCutConfirmed !== false ||
    !object(audit.implementation) ||
    Object.keys(audit.implementation).length === 0 ||
    !Object.values(audit.implementation).every(sha256) ||
    !validImplementation(input.derivationImplementation)
  )
    throw new ObservationDerivationError('invalid_derivation_evidence');
  const metrics = structuredClone(source.metrics);
  for (const metric of [metrics.total, ...Object.values(metrics.categories)]) {
    metric.unknownPairCount = metric.aggregatePairs.reduce(
      (sum, pair) => sum + (knownPairForVocabulary(pair.code, pair.name, 2) ? 0 : pair.count),
      0,
    );
  }
  const result: DerivedResearchObservationV2 = {
    ...structuredClone(source),
    observationVersion: 2,
    validationVersion: 2,
    ...VOCABULARY_V2,
    metrics,
    diagnostics: researchObservationDiagnostics(metrics),
    derivationVersion: 1,
    sourceReportSha256,
    sourceAuditSha256,
    derivationImplementation: structuredClone(input.derivationImplementation),
    researchOnly: true,
    independentTemporalObservation: false,
    productionBaselineCreated: false,
  };
  if (!validateResearchObservationV2(result, input.archiveContract).valid)
    throw new ObservationDerivationError('invalid_observation_evidence');
  return result;
}
