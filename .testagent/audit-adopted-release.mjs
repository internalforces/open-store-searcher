// Non-publishing TASK-008 artifact and quality-failure preservation verification.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { readFile, readdir, writeFile, access } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createServer } from 'vite';

const [rootArgument] = process.argv.slice(2);
assert(rootArgument && process.argv.length === 3);
const root = resolve(rootArgument);
const output = join(root, 'accepted');
const canonical = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const json = async (path) => JSON.parse(await readFile(path, 'utf8'));
const hashFile = async (path) => {
  const digest = createHash('sha256');
  let byteLength = 0;
  for await (const bytes of createReadStream(path)) {
    digest.update(bytes);
    byteLength += bytes.length;
  }
  return { sha256: digest.digest('hex'), byteLength };
};
const config = await json('publication/validation-config.json');
const proposal = await json('reports/task-008-validation-policy-proposal-2026-10-16.json');
const observation = await json('reports/observation-2026-10-16-bounded-source.json');
const receipt = await json(join(root, 'receipt.json'));
const inventory = await json(join(root, 'private-file-inventory.json'));
assert.deepEqual(config.policy, proposal.policy);
assert.deepEqual(config.baseline, proposal.initialBaselineCandidate.baseline);
assert.equal(canonical(config.policy), receipt.policySha256);
assert.equal(canonical(config.baseline), receipt.initialBaselineSha256);
assert.equal(canonical(inventory), receipt.artifactInventorySha256);
assert.equal(receipt.validationKind, 'accepted');
assert.equal(receipt.publicationApproved, false);
assert.equal(receipt.sourceDataAsOf, null);
const snapshot = async () => {
  const fresh = [];
  for (const file of inventory) {
    const actual = await hashFile(join(output, file.name));
    assert.deepEqual(actual, { sha256: file.sha256, byteLength: file.byteLength });
    fresh.push({ name: file.name, ...actual });
  }
  return fresh;
};
const before = await snapshot();
const baseline = await json(join(output, 'baseline.json'));
const release = await json(join(output, 'release.json'));
assert.deepEqual(baseline.metrics, config.baseline.metrics);
assert.equal(baseline.archiveSha256, config.baseline.archiveSha256);
assert.equal(baseline.dataAsOf, config.baseline.dataAsOf);
assert.equal(release.policyRevision, config.policy.revision);
assert.equal(release.recordCount, 2951024);
assert.equal(release.collectedAt, observation.collection.fetchedAt);
assert.equal(release.sourceDataAsOf, null);
assert.deepEqual(release.warnings, [{ code: 'source_coverage_unverified', severity: 'warning' }]);
assert.equal(before.length, 726);
assert.equal(
  before.reduce((sum, file) => sum + file.byteLength, 0),
  receipt.totalJsonBytes,
);
const server = await createServer({
  configFile: false,
  appType: 'custom',
  logLevel: 'error',
  server: { middlewareMode: true, watch: null, ws: false },
});
try {
  const { stageBoundedRelease } = await server.ssrLoadModule(
    '/src/pipeline/stage-bounded-release.ts',
  );
  const archiveContract = await json('src/pipeline/contracts/seoul-archive-contract.json');
  const permissionManifest = await json('reports/source-permission-manifest-2026-08-28.json');
  const input = {
    dateBasis: 'collection',
    collection: {
      ...observation.collection,
      archivePath: `/work/task008-calibration-archives/${observation.collection.sha256}.zip`,
    },
    archiveContract,
    permissionManifest,
    ...config,
    now: '2026-10-18T12:00:00.000Z',
  };
  const rejected = join(root, 'quality-rejected');
  let reason = '';
  await assert.rejects(
    stageBoundedRelease(
      input,
      (async function* () {
        for (const entry of archiveContract.entries) yield { entry, rows: [] };
      })(),
      rejected,
    ),
    (error) => {
      reason = error.message;
      return reason.startsWith('Publication blocked:') && reason.includes('count_below_minimum');
    },
  );
  await assert.rejects(access(rejected), { code: 'ENOENT' });
  const after = await snapshot();
  assert.deepEqual(after, before);
  assert.deepEqual((await readdir(root)).sort(), [
    'accepted',
    'private-file-inventory.json',
    'receipt.json',
  ]);
  const summary = {
    kind: 'approved-policy-quality-failure-preservation',
    executedAt: new Date().toISOString(),
    publicationApproved: false,
    policySha256: canonical(config.policy),
    initialBaselineSha256: canonical(config.baseline),
    sourceArchive: await hashFile(input.collection.archivePath),
    categoryCount: archiveContract.entries.length,
    injectedFailure:
      'All 195 categories complete but zero rows; exact approved policy rejects counts',
    reasonCodes: [...new Set(reason.slice('Publication blocked: '.length).split(', '))].sort(),
    rejectedOutputAbsent: true,
    temporaryCandidatesAbsent: true,
    acceptedFilesRehashed: after.length,
    beforeInventorySha256: canonical(before),
    afterInventorySha256: canonical(after),
    totalJsonBytes: receipt.totalJsonBytes,
    sizeHeadroom: config.policy.maxJsonBytes - receipt.totalJsonBytes,
  };
  await writeFile(
    join(root, 'quality-preservation.json'),
    `${JSON.stringify(summary, null, 2)}\n`,
    { flag: 'wx' },
  );
  console.log(JSON.stringify(summary));
} finally {
  await server.close();
}
