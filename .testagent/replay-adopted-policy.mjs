// Local, non-publishing verification adapter. All raw data and per-file receipts stay local.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { readFile, writeFile, readdir, access } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createServer } from 'vite';
const [archivePath, root] = process.argv.slice(2);
assert(archivePath && root && process.argv.length === 4);
const config = JSON.parse(await readFile('publication/validation-config.json', 'utf8'));
const proposal = JSON.parse(
  await readFile('reports/task-008-validation-policy-proposal-2026-10-16.json', 'utf8'),
);
const observation = JSON.parse(
  await readFile('reports/observation-2026-10-16-bounded-source.json', 'utf8'),
);
const archiveContract = JSON.parse(
  await readFile('src/pipeline/contracts/seoul-archive-contract.json', 'utf8'),
);
const permissionManifest = JSON.parse(
  await readFile('reports/source-permission-manifest-2026-08-28.json', 'utf8'),
);
const canonical = (x) => createHash('sha256').update(JSON.stringify(x)).digest('hex');
assert.equal(canonical(config.policy), proposal.qa.policyCanonicalSha256);
assert.equal(canonical(config.baseline), proposal.initialBaselineCandidate.baselineCanonicalSha256);
assert.deepEqual(
  config.reviewedUnverifiedPairs,
  JSON.parse(await readFile('src/pipeline/contracts/reviewed-unverified-pairs-v1.json', 'utf8')),
);
const hashFile = async (path) => {
  const h = createHash('sha256');
  let byteLength = 0;
  for await (const chunk of createReadStream(path)) {
    h.update(chunk);
    byteLength += chunk.length;
  }
  return { sha256: h.digest('hex'), byteLength };
};
const archiveBefore = await hashFile(archivePath);
assert.equal(archiveBefore.sha256, config.baseline.archiveSha256);
assert.equal(archiveBefore.byteLength, observation.collection.byteLength);
const collection = { ...observation.collection, archivePath: resolve(archivePath) };
const output = resolve(root, 'accepted');
const server = await createServer({
  configFile: false,
  appType: 'custom',
  logLevel: 'error',
  server: { middlewareMode: true, watch: null, ws: false },
});
const started = performance.now();
const implementationSha256 = {};
for (const path of [
  '.testagent/replay-adopted-policy.mjs',
  'src/pipeline/stage-bounded-release.ts',
  'src/pipeline/validate-license-refresh.ts',
  'src/pipeline/parse-license-csv.ts',
  'src/pipeline/write-compact-dataset.ts',
  'src/pipeline/contracts/seoul-archive-contract.json',
  'src/pipeline/contracts/reviewed-unverified-pairs-v1.json',
  'reports/source-permission-manifest-2026-08-28.json',
  'publication/validation-config.json',
  'package-lock.json',
])
  implementationSha256[path] = (await hashFile(path)).sha256;
try {
  const { runProcess, UTF8_UNZIP_OPTIONS } = await server.ssrLoadModule(
    '/src/pipeline/unzip-archive.ts',
  );
  const { iterateLicenseCsv } = await server.ssrLoadModule('/src/pipeline/parse-license-csv.ts');
  const { validateMeasuredRefresh } = await server.ssrLoadModule(
    '/src/pipeline/validate-license-refresh.ts',
  );
  const { stageBoundedRelease } = await server.ssrLoadModule(
    '/src/pipeline/stage-bounded-release.ts',
  );
  let totalRows = 0,
    categoryCount = 0;
  async function* categories() {
    for (const entry of archiveContract.entries) {
      const result = await runProcess({
        executable: 'unzip',
        args: [...UTF8_UNZIP_OPTIONS, '-p', collection.archivePath, entry.entryName],
        maxOutputBytes: observation.resourceLimits.maxEntryBytes,
        timeoutMs: observation.resourceLimits.entryTimeoutMs,
      });
      assert.equal(result.exitCode, 0);
      assert.equal(result.truncated, false);
      function* rows() {
        for (const row of iterateLicenseCsv(
          result.stdout,
          entry,
          observation.resourceLimits.maxTotalRows - totalRows,
        )) {
          totalRows++;
          yield row;
        }
      }
      categoryCount++;
      yield { entry, rows: rows() };
    }
    assert.deepEqual(await hashFile(archivePath), archiveBefore);
  }
  // Replays the original collection instant; this is not a new collection or source-freshness claim.
  const input = {
    dateBasis: 'collection',
    collection,
    archiveContract,
    permissionManifest,
    ...config,
    now: '2026-10-18T12:00:00.000Z',
  };
  const measured = (metrics) => () => ({ candidate: true, metrics });
  const control = validateMeasuredRefresh(
    input,
    measured(structuredClone(config.baseline.metrics)),
  );
  assert.equal(control.kind, 'accepted');
  const noPolicy = { ...input, policy: undefined };
  assert.equal(
    validateMeasuredRefresh(noPolicy, measured(structuredClone(config.baseline.metrics))).kind,
    'review_required',
  );
  const changedMetrics = structuredClone(config.baseline.metrics);
  const zeroChangeCategory = Object.keys(config.policy.categories).find(
    (id) =>
      config.policy.categories[id].maxAbsoluteCountChange === 0 &&
      changedMetrics.categories[id].recordCount > 0,
  );
  changedMetrics.categories[zeroChangeCategory].recordCount++;
  changedMetrics.categories[zeroChangeCategory].statusCounts['행정상 영업']++;
  changedMetrics.total.recordCount++;
  changedMetrics.total.statusCounts['행정상 영업']++;
  const injectedPair = changedMetrics.categories[zeroChangeCategory].aggregatePairs[0];
  injectedPair.count++;
  changedMetrics.total.aggregatePairs.find(
    (pair) => pair.code === injectedPair.code && pair.name === injectedPair.name,
  ).count++;
  const countRejected = validateMeasuredRefresh(input, measured(changedMetrics));
  assert.equal(countRejected.kind, 'rejected');
  assert(
    countRejected.diagnostics.some(
      (item) => item.code === 'count_change_exceeded' && item.categoryId === zeroChangeCategory,
    ),
    JSON.stringify(countRejected.diagnostics),
  );
  const result = await stageBoundedRelease(input, categories(), output);
  assert.equal(categoryCount, 195);
  assert.equal(totalRows, 2951024);
  assert.deepEqual(result.metrics, config.baseline.metrics);
  const files = await Promise.all(
    result.files.sort().map(async (name) => ({ name, ...(await hashFile(join(output, name))) })),
  );
  const bytes = files.reduce((sum, file) => sum + file.byteLength, 0);
  assert(bytes <= config.policy.maxJsonBytes);
  const before = canonical(files);
  const injected = resolve(root, 'rejected');
  await assert.rejects(
    stageBoundedRelease(
      input,
      (async function* () {
        yield { entry: archiveContract.entries[0], rows: [] };
        throw new Error('Injected incomplete category stream');
      })(),
      injected,
    ),
    /Injected incomplete category stream/,
  );
  await assert.rejects(access(injected));
  await assert.rejects(
    stageBoundedRelease(
      input,
      (async function* () {
        yield* [];
        throw new Error('Must not consume existing output');
      })(),
      output,
    ),
    /Publication output already exists/,
  );
  const afterFiles = await Promise.all(
    result.files.sort().map(async (name) => ({ name, ...(await hashFile(join(output, name))) })),
  );
  assert.deepEqual(afterFiles, files);
  assert.deepEqual((await readdir(root)).sort(), ['accepted']);
  const release = JSON.parse(await readFile(join(output, 'release.json'), 'utf8'));
  const receipt = {
    kind: 'accepted-offline-replay',
    executedAt: new Date().toISOString(),
    validationNow: input.now,
    environment: { platform: process.platform, architecture: process.arch, node: process.version },
    implementationSha256,
    validationKind: control.kind,
    missingPolicyKind: 'review_required',
    zeroChangeCategoryRejection: { categoryId: zeroChangeCategory, kind: countRejected.kind },
    publicationApproved: false,
    sourceDataAsOf: null,
    collectedAt: collection.fetchedAt,
    archive: archiveBefore,
    policyRevision: config.policy.revision,
    policySha256: canonical(config.policy),
    initialBaselineSha256: canonical(config.baseline),
    categoryCount,
    totalRows,
    jsonFileCount: files.length,
    totalJsonBytes: bytes,
    maxJsonBytes: config.policy.maxJsonBytes,
    sizeHeadroom: config.policy.maxJsonBytes - bytes,
    warnings: release.warnings,
    release: await hashFile(join(output, 'release.json')),
    nextBaseline: await hashFile(join(output, 'baseline.json')),
    artifactInventorySha256: before,
    failurePreservation: {
      incompleteStreamRejected: true,
      existingOutputRejected: true,
      rejectedOutputAbsent: true,
      temporaryCandidatesAbsent: true,
      acceptedFilesRehashed: files.length,
      beforeInventorySha256: before,
      afterInventorySha256: canonical(afterFiles),
    },
    elapsedMs: Math.round(performance.now() - started),
  };
  await writeFile(resolve(root, 'receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`, {
    flag: 'wx',
  });
  await writeFile(
    resolve(root, 'private-file-inventory.json'),
    `${JSON.stringify(files, null, 2)}\n`,
    { flag: 'wx' },
  );
  console.log(JSON.stringify(receipt));
} finally {
  await server.close();
}
