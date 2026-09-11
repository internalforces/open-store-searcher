import type { ObservationReport } from './observe-license-archive.js';
import type { ValidationMetricsV1 } from './refresh-validation-types.js';

type Complete = ObservationReport & { metrics: ValidationMetricsV1 };

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { canonicalJson, VOCABULARY_V2 } from './aggregate-vocabulary.js';
import { parseArchiveContract } from './archive-contract.js';
import * as derivation from './derive-research-observation.js';
import { validValidationMetrics } from './refresh-validation-metrics.js';

const reportBytes = readFileSync(
  new URL('../../reports/observation-2026-09-04-task-008-complete.json', import.meta.url),
);
const auditBytes = readFileSync(
  new URL('../../reports/observation-2026-09-04-task-008-complete-audit.json', import.meta.url),
);
const archiveContract = parseArchiveContract(
  JSON.parse(
    readFileSync(new URL('./contracts/seoul-archive-contract.json', import.meta.url), 'utf8'),
  ),
);
const hash = (bytes: Uint8Array | string) => createHash('sha256').update(bytes).digest('hex');
const implementation = [{ path: 'synthetic/derivation.ts', sha256: 'a'.repeat(64) }];
function fixture() {
  return {
    sourceReportBytes: reportBytes,
    sourceAuditBytes: auditBytes,
    archiveContract,
    derivationImplementation: implementation,
  };
}
function changedReport(mutator: (report: Complete) => void) {
  const report: Complete = JSON.parse(reportBytes.toString('utf8'));
  mutator(report);
  const sourceReportBytes = Buffer.from(JSON.stringify(report));
  const audit = JSON.parse(auditBytes.toString('utf8'));
  audit.reportSha256 = hash(sourceReportBytes);
  return { ...fixture(), sourceReportBytes, sourceAuditBytes: Buffer.from(JSON.stringify(audit)) };
}
describe('ADR-017 offline observation derivation', () => {
  test('derives all 195 categories from bound V1 bytes while preserving historical evidence and missing gates', () => {
    expect(derivation.deriveResearchObservationV2).toBeTypeOf('function');
    const source = JSON.parse(reportBytes.toString('utf8'));
    const result = derivation.deriveResearchObservationV2(fixture());
    expect(result).toMatchObject({
      observationVersion: 2,
      validationVersion: 2,
      ...VOCABULARY_V2,
      complete: true,
      kind: 'review_required',
      researchOnly: true,
      independentTemporalObservation: false,
      productionBaselineCreated: false,
      dataAsOf: null,
      derivationVersion: 1,
      sourceReportSha256: '1e218c054100dc8dbdccf387a383ab37e85e0797d82e72a7ba341755bc6edab6',
      sourceAuditSha256: hash(auditBytes),
      derivationImplementation: implementation,
    });
    expect(result.metrics?.total).toMatchObject({
      recordCount: 2936760,
      unknownPairCount: 0,
      statusCounts: { '확인되지 않음': 380285 },
    });
    expect(result.ingestion).toEqual(source.ingestion);
    let changedCategories = 0;
    for (const id of Object.keys(source.metrics.categories)) {
      const previous = structuredClone(source.metrics.categories[id]);
      if (previous.unknownPairCount > 0) changedCategories++;
      previous.unknownPairCount = 0;
      expect(result.metrics?.categories[id]).toEqual(previous);
    }
    expect(changedCategories).toBe(68);
    expect(Object.keys(result.metrics?.categories ?? {})).toHaveLength(195);
    expect(result.diagnostics.map((d) => d.code)).toEqual([
      'baseline_review_required',
      'data_as_of_unverified',
      'policy_review_required',
    ]);
    expect(result).not.toHaveProperty('candidate');
    // Compare the whole archived envelope, including resources/limits and every total metric,
    // after restoring only the ADR-017 fields whose changes were asserted above.
    const comparable = structuredClone(result);
    for (const key of [
      'validationVersion',
      'aggregateVocabularyVersion',
      'aggregateVocabularySha256',
      'derivationVersion',
      'sourceReportSha256',
      'sourceAuditSha256',
      'derivationImplementation',
      'researchOnly',
      'independentTemporalObservation',
      'productionBaselineCreated',
    ])
      Reflect.deleteProperty(comparable, key);
    Object.assign(comparable, { observationVersion: 1, diagnostics: source.diagnostics });
    if (!comparable.metrics) throw new Error('Expected complete metrics');
    comparable.metrics.total.unknownPairCount = source.metrics.total.unknownPairCount;
    for (const id of Object.keys(source.metrics.categories)) {
      const metric = comparable.metrics.categories[id];
      if (!metric) throw new Error('Missing category');
      metric.unknownPairCount = source.metrics.categories[id].unknownPairCount;
    }
    expect(comparable).toEqual(source);
    expect(
      validValidationMetrics(
        source.metrics,
        archiveContract.entries.map((e) => e.fileDataId),
      ),
    ).toBe(true);
    expect(source.metrics.total.unknownPairCount).toBe(186887);
    expect(hash(reportBytes)).toBe(result.sourceReportSha256);
    expect(canonicalJson(derivation.deriveResearchObservationV2(fixture()))).toBe(
      canonicalJson(result),
    );
    expect(derivation.validateResearchObservationV2(result, archiveContract)).toMatchObject({
      valid: true,
    });
    expect(derivation.validateResearchObservationV2(source, archiveContract)).toEqual({
      valid: false,
      code: 'vocabulary_revision_mismatch',
    });
  });
  test.each([
    'report-bytes',
    'audit-hash',
    'audit-incomplete',
    'implementation',
    'invalid-json',
  ] as const)('rejects %s without derived evidence', (kind) => {
    const input = fixture();
    if (kind === 'report-bytes')
      input.sourceReportBytes = Buffer.concat([reportBytes, Buffer.from(' ')]);
    if (kind === 'audit-hash')
      input.sourceAuditBytes = Buffer.from(
        auditBytes.toString().replace('1e218c0541', '0e218c0541'),
      );
    if (kind === 'audit-incomplete') {
      const audit = JSON.parse(auditBytes.toString());
      audit.implementationMatchedAfter = false;
      input.sourceAuditBytes = Buffer.from(JSON.stringify(audit));
    }
    if (kind === 'implementation') input.derivationImplementation = [];
    if (kind === 'invalid-json') input.sourceReportBytes = Buffer.from('{');
    expect(() => derivation.deriveResearchObservationV2(input)).toThrow();
  });
  test.each(['version', 'metrics', 'category', 'ingestion', 'diagnostics', 'partial'] as const)(
    'rejects inconsistent %s even with a matching audit digest',
    (kind) => {
      const input = changedReport((report) => {
        if (kind === 'version') Object.assign(report, { observationVersion: 2 });
        if (kind === 'metrics') report.metrics.total.unknownPairCount = 0;
        if (kind === 'category') delete report.metrics.categories['15045028'];
        if (kind === 'ingestion')
          Object.assign(report.ingestion[0] ?? {}, { archiveSha256: 'f'.repeat(64) });
        if (kind === 'diagnostics') report.diagnostics = [];
        if (kind === 'partial') report.complete = false;
      });
      expect(() => derivation.deriveResearchObservationV2(input)).toThrow();
    },
  );
  test('retains an unregistered future pair diagnostic during derivation', () => {
    const input = changedReport((report) => {
      // Rename every exact 06 pair to an unregistered future pair; both remain unverified in V1.
      for (const metric of [report.metrics.total, ...Object.values(report.metrics.categories)]) {
        for (const pair of metric.aggregatePairs)
          if (pair.code === '06') {
            pair.code = '07';
            pair.name = 'future';
          }
      }
    });
    const result = derivation.deriveResearchObservationV2(input);
    expect(result.metrics?.total.unknownPairCount).toBe(23);
    expect(
      result.diagnostics
        .filter((d) => d.code === 'aggregate_pair_review_required')
        .reduce((n, d) => n + (d.actual ?? 0), 0),
    ).toBe(23);
  });
  test.each([
    'validationVersion',
    'aggregateVocabularyVersion',
    'aggregateVocabularySha256',
  ] as const)('rejects a V2 report with missing %s', (field) => {
    const report = derivation.deriveResearchObservationV2(fixture());
    Reflect.deleteProperty(report, field);
    expect(derivation.validateResearchObservationV2(report, archiveContract)).toEqual({
      valid: false,
      code: 'vocabulary_revision_mismatch',
    });
  });
});

test('offline derivation command binds current implementation and emits deterministic research JSON', () => {
  const execute = () =>
    execFileSync(
      process.execPath,
      [
        '--import',
        'data:text/javascript,globalThis.fetch=()=>{throw new Error("network forbidden")}',
        'scripts/derive-task008-observation.mjs',
      ],
      { maxBuffer: 4 * 1024 * 1024 },
    );
  const first = execute();
  expect(execute()).toEqual(first);
  const report = JSON.parse(first.toString());
  expect(report).toMatchObject({
    complete: true,
    observationVersion: 2,
    researchOnly: true,
    independentTemporalObservation: false,
  });
  expect(report.derivationImplementation.length).toBeGreaterThan(10);
  for (const entry of report.derivationImplementation)
    expect(hash(readFileSync(entry.path))).toBe(entry.sha256);
  expect(hash(reportBytes)).toBe(report.sourceReportSha256);
});

test.each(['report', 'audit'] as const)(
  'bounds %s bytes before parsing and accepts the exact offline ceiling',
  (target) => {
    const input = fixture();
    const limit = target === 'report' ? 16 * 1024 * 1024 : 256 * 1024;
    if (target === 'report') {
      input.sourceReportBytes = Buffer.concat([
        reportBytes,
        Buffer.alloc(limit - reportBytes.byteLength, 0x20),
      ]);
      const audit = JSON.parse(auditBytes.toString());
      audit.reportSha256 = hash(input.sourceReportBytes);
      input.sourceAuditBytes = Buffer.from(JSON.stringify(audit));
    } else
      input.sourceAuditBytes = Buffer.concat([
        auditBytes,
        Buffer.alloc(limit - auditBytes.byteLength, 0x20),
      ]);
    expect(derivation.deriveResearchObservationV2(input).complete).toBe(true);
    if (target === 'report')
      input.sourceReportBytes = Buffer.concat([input.sourceReportBytes, Buffer.from(' ')]);
    else input.sourceAuditBytes = Buffer.concat([input.sourceAuditBytes, Buffer.from(' ')]);
    if (target === 'report') {
      const audit = JSON.parse(input.sourceAuditBytes.toString());
      audit.reportSha256 = hash(input.sourceReportBytes);
      input.sourceAuditBytes = Buffer.from(JSON.stringify(audit));
    }
    expect(() => derivation.deriveResearchObservationV2(input)).toThrow(
      'invalid_derivation_evidence',
    );
  },
);
