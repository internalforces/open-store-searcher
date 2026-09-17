// Research-only aggregate replay. It does not read source rows or create publication inputs.
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { createServer } from 'vite';

const OBSERVATION_PATH = 'reports/observation-2026-09-13-hosted-source.json.raw';
const OBSERVATION_SHA256 = 'f05984f434ff5553d65e5c22b50bf657e8ec65238be9d7c57c3b144cdd8d3b60';
const CONTRACT_PATH = 'src/pipeline/contracts/reviewed-unverified-pairs-v1.json';

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function diagnosticCounts(result) {
  return Object.fromEntries(
    [...new Set(result.diagnostics.map(({ code }) => code))]
      .sort()
      .map((code) => [code, result.diagnostics.filter((item) => item.code === code).length]),
  );
}

const observationBytes = await readFile(OBSERVATION_PATH);
assert(sha256(observationBytes) === OBSERVATION_SHA256, 'Retained observation hash changed');
const observation = JSON.parse(observationBytes);
const contractBytes = await readFile(CONTRACT_PATH);
const reviewedUnverifiedPairs = JSON.parse(contractBytes);
const implementationSha256 = Object.fromEntries(
  await Promise.all(
    [
      '.testagent/replay-reviewed-pairs.mjs',
      'src/pipeline/reviewed-unverified-pairs.ts',
      'src/pipeline/refresh-validation-types.ts',
      'src/pipeline/validate-license-refresh.ts',
    ].map(async (path) => [path, sha256(await readFile(path))]),
  ),
);
const archiveContract = JSON.parse(
  await readFile('src/pipeline/contracts/seoul-archive-contract.json', 'utf8'),
);
const permissionManifest = JSON.parse(
  await readFile('reports/source-permission-manifest-2026-08-28.json', 'utf8'),
);
const metrics = observation.validation?.metrics;
assert(observation.complete === true, 'Observation is incomplete');
assert(observation.publicationApproved === false, 'Observation unexpectedly approves publication');
assert(metrics?.total?.recordCount === 2_940_404, 'Unexpected retained record count');
assert(metrics.total.unknownPairCount === 187_222, 'Unexpected retained unknown-pair count');
assert(
  Object.values(metrics.categories).filter(({ unknownPairCount }) => unknownPairCount > 0)
    .length === 68,
  'Unexpected retained unknown-pair category count',
);
const retainedMetricsJson = JSON.stringify(metrics);
const retainedMetricsSha256 = sha256(retainedMetricsJson);

const vite = await createServer({
  configFile: false,
  appType: 'custom',
  logLevel: 'error',
  server: { middlewareMode: true, watch: null, ws: false },
});

try {
  const { validateMeasuredRefresh } = await vite.ssrLoadModule(
    '/src/pipeline/validate-license-refresh.ts',
  );
  const common = {
    dateBasis: 'collection',
    // The retained aggregate receipt intentionally omits the transient archive path. The pure
    // validator checks only that this field is nonempty; the measurement callback never reads it.
    collection: {
      ...observation.collection,
      archivePath: '/retained-aggregate-replay/no-source-archive',
    },
    archiveContract,
    permissionManifest,
    now: observation.collection.fetchedAt,
  };
  const measure = () => ({ candidate: { researchOnly: true }, metrics: structuredClone(metrics) });
  const before = validateMeasuredRefresh(common, measure);
  const after = validateMeasuredRefresh({ ...common, reviewedUnverifiedPairs }, measure);
  const beforeCounts = diagnosticCounts(before);
  const afterCounts = diagnosticCounts(after);

  assert(
    before.kind === 'review_required',
    `Control replay must remain review_required: ${before.kind} ${JSON.stringify(beforeCounts)}`,
  );
  assert(
    after.kind === 'review_required',
    `Reviewed-pair replay must remain review_required: ${after.kind} ${JSON.stringify(afterCounts)}`,
  );
  assert(
    beforeCounts.aggregate_pair_review_required === 68,
    'Control replay must contain 68 aggregate pair review diagnostics',
  );
  assert(
    afterCounts.aggregate_pair_review_required === undefined,
    'Approved exact contract did not remove aggregate pair review diagnostics',
  );
  for (const code of ['policy_review_required', 'baseline_review_required']) {
    assert(beforeCounts[code] === 1, `Control replay missing ${code}`);
    assert(afterCounts[code] === 1, `Reviewed-pair replay missing ${code}`);
  }
  assert(
    JSON.stringify(beforeCounts) ===
      JSON.stringify({
        aggregate_pair_review_required: 68,
        baseline_review_required: 1,
        policy_review_required: 1,
        source_coverage_unverified: 1,
      }),
    'Control replay contains unexpected diagnostics',
  );
  assert(
    JSON.stringify(afterCounts) ===
      JSON.stringify({
        baseline_review_required: 1,
        policy_review_required: 1,
        source_coverage_unverified: 1,
      }),
    'Reviewed-pair replay contains unexpected diagnostics',
  );
  assert(
    JSON.stringify(metrics) === retainedMetricsJson &&
      JSON.stringify(before.metrics) === retainedMetricsJson &&
      JSON.stringify(after.metrics) === retainedMetricsJson &&
      sha256(JSON.stringify(before.metrics)) === retainedMetricsSha256 &&
      sha256(JSON.stringify(after.metrics)) === retainedMetricsSha256,
    'Replay changed retained raw metrics',
  );

  console.log(
    JSON.stringify({
      version: 1,
      kind: 'reviewed-unverified-pairs-aggregate-replay',
      scope: 'retained aggregate metrics only; no source-row replay',
      publicationApproved: false,
      adapterLimitation: {
        retainedReceiptOmittedTransientArchivePath: true,
        suppliedArchivePath: '/retained-aggregate-replay/no-source-archive',
        archiveFileRead: false,
        measurementSource: 'retained validation.metrics',
      },
      implementationSha256,
      observation: {
        path: OBSERVATION_PATH,
        sha256: OBSERVATION_SHA256,
        archiveSha256: observation.collection.sha256,
        recordCount: metrics.total.recordCount,
        unknownPairCount: metrics.total.unknownPairCount,
        unknownPairCategoryCount: 68,
        metricsSha256: retainedMetricsSha256,
      },
      contract: { path: CONTRACT_PATH, sha256: sha256(contractBytes) },
      before: { kind: before.kind, diagnostics: beforeCounts },
      after: { kind: after.kind, diagnostics: afterCounts },
      assertions: {
        aggregatePairReviewDiagnosticsRemoved: 68,
        policyReviewPreserved: true,
        baselineReviewPreserved: true,
        sourceCoverageWarningPreserved: true,
        noUnexpectedDiagnostics: true,
        rawMetricsUnchanged: true,
      },
    }),
  );
} finally {
  await vite.close();
}
