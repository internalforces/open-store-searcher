// Offline decision support only. Does not implement or approve vocabulary V2.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
const canonical = (value) =>
  JSON.stringify(value, (_key, entry) => {
    if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
      return Object.fromEntries(
        Object.keys(entry)
          .sort()
          .map((key) => [key, entry[key]]),
      );
    }
    return entry;
  });
const sourceReport = 'reports/observation-2026-09-04-task-008-complete.json';
const sourceAudit = 'reports/observation-2026-09-04-task-008-complete-audit.json';
const reportBytes = readFileSync(sourceReport);
const auditBytes = readFileSync(sourceAudit);
const report = JSON.parse(reportBytes);
const audit = JSON.parse(auditBytes);
assert.equal(audit.reportSha256, sha(reportBytes));
assert.equal(audit.archiveSha256, report.archiveSha256);
assert.equal(report.complete, true);
assert.equal(report.observationVersion, 1);
const pairs = [
  { code: '01', name: '영업/정상' },
  { code: '02', name: '휴업' },
  { code: '03', name: '폐업' },
  { code: '04', name: '취소/말소/만료/정지/중지' },
  { code: '05', name: '제외/삭제/전출' },
  { code: '06', name: '기타' },
];
const vocabulary = { aggregateVocabularyVersion: 2, pairs };
const known = (pair, limit) =>
  pairs
    .slice(0, limit)
    .some((candidate) => candidate.code === pair.code && candidate.name === pair.name);
const projected = structuredClone(report);
const comparison = [];
for (const [category, metric] of [
  ['total', report.metrics.total],
  ...Object.entries(report.metrics.categories),
]) {
  const count = (limit) =>
    metric.aggregatePairs.reduce((sum, pair) => sum + (known(pair, limit) ? 0 : pair.count), 0);
  assert.equal(metric.unknownPairCount, count(4));
  const target =
    category === 'total' ? projected.metrics.total : projected.metrics.categories[category];
  target.unknownPairCount = count(6);
  comparison.push({
    category,
    recordCount: metric.recordCount,
    observedUnknownPairCountV1: count(4),
    proposedUnknownPairCountV2: count(6),
  });
}
const pairDiagnostics = report.diagnostics.filter(
  (item) => item.code === 'aggregate_pair_review_required',
);
assert.equal(pairDiagnostics.length, 68);
for (const diagnostic of pairDiagnostics) {
  assert.equal(
    diagnostic.actual,
    report.metrics.categories[diagnostic.categoryId].unknownPairCount,
  );
  assert.equal(projected.metrics.categories[diagnostic.categoryId].unknownPairCount, 0);
}
projected.diagnostics = report.diagnostics.filter(
  (item) => item.code !== 'aggregate_pair_review_required',
);
assert.deepEqual(projected.diagnostics.map((item) => item.code).sort(), [
  'baseline_review_required',
  'data_as_of_unverified',
  'policy_review_required',
]);
assert.equal(known({ code: '07', name: 'future-pair' }, 6), false);
const immutableProjection = (value) => {
  const copy = structuredClone(value);
  for (const key of [
    'observationVersion',
    'validationVersion',
    'aggregateVocabularyVersion',
    'aggregateVocabularySha256',
    'derivationVersion',
    'sourceReportSha256',
    'sourceAuditSha256',
    'derivationImplementation',
    'independentTemporalObservation',
  ])
    delete copy[key];
  copy.diagnostics = copy.diagnostics.filter(
    (item) => item.code !== 'aggregate_pair_review_required',
  );
  for (const metric of [copy.metrics.total, ...Object.values(copy.metrics.categories)])
    delete metric.unknownPairCount;
  return copy;
};
assert.equal(canonical(immutableProjection(report)), canonical(immutableProjection(projected)));
assert.deepEqual(projected.ingestion, report.ingestion);
assert.equal(Object.keys(report.metrics.categories).length, 195);
assert.equal(
  comparison.slice(1).reduce((sum, row) => sum + row.recordCount, 0),
  report.metrics.total.recordCount,
);
const changed = comparison
  .slice(1)
  .filter((row) => row.observedUnknownPairCountV1 !== row.proposedUnknownPairCountV2);
assert.equal(changed.length, 68);
assert.equal(
  changed.reduce((sum, row) => sum + row.observedUnknownPairCountV1, 0),
  186887,
);
assert.equal(comparison[0].proposedUnknownPairCountV2, 0);
const implementationPaths = [
  'scripts/analyze-task008-vocabulary-proposal.mjs',
  'src/pipeline/refresh-validation-metrics.ts',
  'src/domain/map-license-status.ts',
];
const output = {
  artifactKind: 'unapproved_vocabulary_impact_proposal',
  derivationVersion: 1,
  researchOnly: true,
  proposalApproved: false,
  sourceReport,
  sourceReportSha256: sha(reportBytes),
  sourceAudit,
  sourceAuditSha256: sha(auditBytes),
  sourceArchiveSha256: report.archiveSha256,
  proposedEnvelope: {
    observationVersion: 2,
    validationVersion: 2,
    aggregateVocabularyVersion: 2,
    aggregateVocabularySha256: sha(canonical(vocabulary)),
  },
  vocabulary,
  canonicalization:
    'Recursive lexicographic object-key sorting; array order preserved; compact JSON UTF-8; no trailing newline',
  derivationImplementation: implementationPaths.map((path) => ({
    path,
    sha256: sha(readFileSync(path)),
  })),
  proposedAddedPairs: report.metrics.total.aggregatePairs.filter(
    (pair) => !known(pair, 4) && known(pair, 6),
  ),
  processedStatusChange: false,
  unverifiedRowsBeforeAndAfter: report.metrics.total.statusCounts['확인되지 않음'],
  categoryCount: 195,
  changedCategoryCount: changed.length,
  comparison,
  proposedDiagnostics: projected.diagnostics,
  diagnosticChanges: {
    removedKnownPairReviewDiagnostics: 68,
    remainingPairReviewDiagnostics: 0,
    futureUnregisteredPairRemainsUnknown: true,
  },
  equivalence: {
    allCategoryIdsAndCountsPreserved: true,
    immutableProjectionUnchanged: true,
    immutableProjectionSha256: sha(canonical(immutableProjection(report))),
    ingestionSha256: sha(canonical(report.ingestion)),
  },
  independentTemporalObservation: false,
  productionBaselineCreated: false,
};
process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
