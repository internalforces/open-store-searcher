import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import {
  assessFullSourceSamples,
  measureFixture,
  requirePreparedInventory,
  resolveMeasuredAsset,
} from './full-source-performance-support.mjs';

const identity = { recordCount: 2951024, manifestSha256: 'a'.repeat(64) };
function sample(profile = 'desktop', cache = 'cold') {
  const result = {
    profile,
    cache,
    iteration: 0,
    recordCount: identity.recordCount,
    manifestSha256: identity.manifestSha256,
    visible: true,
    primaryMs: 2500,
    preInteractionLcpMs: 2500,
    readyMs: 60000,
    searches: ['broad-district', 'partial-address', 'absent'].map((fixtureId) => ({
      fixtureId,
      elapsedMs: 500,
      visible: true,
      resultRegionHasLayout: true,
      eligibleCount: 0,
      similarCount:
        fixtureId === 'broad-district' ? 323695 : fixtureId === 'partial-address' ? 32399 : 0,
      requestDelta: 0,
    })),
  };
  for (const search of result.searches)
    search.observations = Array.from({ length: 3 }, () => ({ ...search }));
  return result;
}
const complete = () =>
  ['desktop', 'mobile-main-thread-4x'].flatMap((profile) =>
    ['cold', 'warm'].map((cache) => sample(profile, cache)),
  );

test('post-search errors cannot yield a passing diagnostic', () => {
  const error = complete();
  error[0].error = 'ProtocolError';
  assert.equal(assessFullSourceSamples(error, identity, 1).budgetsMet, false);
});
test('missing raw repetitions cannot yield a passing diagnostic', () => {
  const missing = complete();
  for (const row of missing) for (const search of row.searches) delete search.observations;
  assert.equal(assessFullSourceSamples(missing, identity, 1).budgetsMet, false);
});

test('changing measured application bytes fails the preparation-bound complete inventory', () => {
  const inventory = {
    version: 1,
    kind: 'publication-inventory',
    files: [{ name: 'index.html', byteLength: 5, sha256: 'a'.repeat(64) }],
  };
  const encoded = Buffer.from(`${JSON.stringify(inventory)}\n`);
  const binding = {
    byteLength: encoded.length,
    sha256: createHash('sha256').update(encoded).digest('hex'),
  };
  assert.doesNotThrow(() => requirePreparedInventory(inventory, binding));
  const changed = structuredClone(inventory);
  changed.files[0].sha256 = 'b'.repeat(64);
  assert.throws(() => requirePreparedInventory(changed, binding), /inventory/i);
  assert.throws(
    () => requirePreparedInventory(inventory, { ...binding, byteLength: 1 }),
    /inventory/i,
  );
});

test('a failed repetition retains earlier over-budget evidence and its failed ordinal', async () => {
  const searches = [];
  await assert.rejects(
    measureFixture(searches, 'broad-district', async (repetition) => {
      if (repetition === 1) throw new Error('observed timeout');
      return { elapsedMs: 650, similarCount: 323695 };
    }),
    /observed timeout/,
  );
  assert.equal(searches.length, 1);
  assert.equal(searches[0].observations[0].elapsedMs, 650);
  assert.equal(searches[0].observations[1].status, 'failed');
  assert.equal(searches[0].observations[1].repetition, 1);
  assert.equal(searches[0].failedRepetition, 1);
});

test('assesses complete full-source results at inclusive budgets without certifying physical release', () => {
  const verdict = assessFullSourceSamples(complete(), identity, 1);
  assert.equal(verdict.budgetsMet, true);
  assert.equal(verdict.physicalDeviceVerified, false);
  assert.equal(verdict.publicationApproved, false);
});

test('incomplete, censored, hidden and wrong-source observations cannot pass', () => {
  for (const mutate of [
    (rows) => rows.pop(),
    (rows) => {
      rows[0].readyMs = null;
    },
    (rows) => {
      rows[0].recordCount--;
    },
    (rows) => {
      rows[0].manifestSha256 = 'b'.repeat(64);
    },
    (rows) => {
      rows[0].visible = false;
    },
    (rows) => {
      rows[0].preInteractionLcpMs = null;
    },
    (rows) => {
      rows[0].searches.pop();
    },
    (rows) => {
      rows[0].searches[0].similarCount--;
    },
    (rows) => {
      rows[0].searches[0].requestDelta = 1;
    },
    (rows) => {
      rows[0].searches[0].resultRegionHasLayout = false;
    },
    (rows) => {
      rows[0].searches[0].elapsedMs = Number.NaN;
    },
    (rows) => {
      rows[0].searches[0].elapsedMs = 500.01;
    },
    (rows) => {
      const search = rows[0].searches[0];
      search.observations = [
        structuredClone(search),
        structuredClone(search),
        { ...search, similarCount: 0 },
      ];
    },
  ]) {
    const rows = complete();
    mutate(rows);
    assert.equal(assessFullSourceSamples(rows, identity, 1).budgetsMet, false);
  }
});

test('duplicate cells and primary-content misses cannot replace missing evidence', () => {
  const duplicate = complete();
  duplicate[3] = structuredClone(duplicate[2]);
  assert.equal(assessFullSourceSamples(duplicate, identity, 1).budgetsMet, false);
  const slow = complete();
  slow[0].primaryMs = 2500.01;
  assert.equal(assessFullSourceSamples(slow, identity, 1).budgetsMet, false);
});

test('measurement server serves only inventoried same-origin assets without query parameters', () => {
  const assets = new Set(['index.html', 'assets/data.json']);
  assert.equal(resolveMeasuredAsset('/open-store-searcher/', assets), 'index.html');
  assert.equal(
    resolveMeasuredAsset('/open-store-searcher/assets/data.json', assets),
    'assets/data.json',
  );
  for (const value of [
    '/other/index.html',
    '/open-store-searcher/../index.html',
    '/open-store-searcher/%2e%2e/index.html',
    '/open-store-searcher/assets/data.json?q=private',
    '/open-store-searcher/missing.json',
    '/open-store-searcher//index.html',
  ])
    assert.equal(resolveMeasuredAsset(value, assets), null);
});
