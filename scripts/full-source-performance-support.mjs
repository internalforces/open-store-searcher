import { createHash } from 'node:crypto';

export function requirePreparedInventory(inventory, binding) {
  const bytes = Buffer.from(`${JSON.stringify(inventory)}\n`);
  if (
    bytes.length !== binding.byteLength ||
    createHash('sha256').update(bytes).digest('hex') !== binding.sha256
  )
    throw new Error('Measured publication inventory does not match preparation');
}

/** Keep completed and failed repetition outcomes attached even when the caller aborts. */
export async function measureFixture(searches, fixtureId, measure) {
  const result = { fixtureId, observations: [] };
  searches.push(result);
  for (let repetition = 0; repetition < 3; repetition++) {
    try {
      result.observations.push({ ...(await measure(repetition)), status: 'measured', repetition });
    } catch (error) {
      result.observations.push({ repetition, status: 'failed', error: error.name });
      result.failedRepetition = repetition;
      throw error;
    }
  }
  const samples = result.observations;
  Object.assign(result, samples[0], {
    elapsedMs: Math.max(...samples.map((value) => value.elapsedMs)),
    visible: samples.every((value) => value.visible),
    resultRegionHasLayout: samples.every((value) => value.resultRegionHasLayout),
    requestDelta: Math.max(...samples.map((value) => value.requestDelta)),
  });
  return result;
}

export const fullSourceFixtures = [
  { id: 'broad-district', value: '강남구', similarCount: 323695 },
  { id: 'partial-address', value: '테헤란로 123', similarCount: 32399 },
  { id: 'absent', value: '龘靐齉爩', similarCount: 0 },
];

const finite = (value) => typeof value === 'number' && Number.isFinite(value) && value >= 0;

/** Diagnostic budgets never establish physical-device or publication acceptance. */
export function assessFullSourceSamples(samples, identity, repetitions) {
  const failures = [];
  const expected = new Set(
    ['desktop', 'mobile-main-thread-4x'].flatMap((profile) =>
      ['cold', 'warm'].flatMap((cache) =>
        Array.from({ length: repetitions }, (_, i) => `${profile}/${cache}/${i}`),
      ),
    ),
  );
  for (const row of samples) {
    const key = `${row.profile}/${row.cache}/${row.iteration}`;
    if (row.error !== undefined) failures.push(`${key}: measurement error`);
    if (!expected.delete(key)) failures.push(`${key}: unexpected or duplicate cell`);
    if (row.recordCount !== identity.recordCount || row.manifestSha256 !== identity.manifestSha256)
      failures.push(`${key}: incomplete or different source`);
    if (row.visible !== true || !finite(row.readyMs))
      failures.push(`${key}: readiness unavailable`);
    for (const field of ['primaryMs', 'preInteractionLcpMs'])
      if (!finite(row[field]) || row[field] > 2500)
        failures.push(`${key}: ${field} budget unavailable or exceeded`);
    const searches = Array.isArray(row.searches) ? row.searches : [];
    if (searches.length !== fullSourceFixtures.length)
      failures.push(`${key}: incomplete fixture set`);
    for (const fixture of fullSourceFixtures) {
      const matches = searches.filter((search) => search.fixtureId === fixture.id);
      if (matches.length !== 1) {
        failures.push(`${key}: ${fixture.id} missing or duplicated`);
        continue;
      }
      const search = matches[0];
      const valid = (item) =>
        finite(item.elapsedMs) &&
        item.elapsedMs <= 500 &&
        item.visible === true &&
        item.resultRegionHasLayout === true &&
        item.eligibleCount === 0 &&
        item.similarCount === fixture.similarCount &&
        item.requestDelta === 0;
      if (
        !valid(search) ||
        !Array.isArray(search.observations) ||
        search.observations.length !== 3 ||
        !search.observations.every(valid)
      )
        failures.push(`${key}: ${fixture.id} invalid or exceeded`);
    }
  }
  if (expected.size) failures.push(`Missing ${expected.size} measurement cells`);
  return {
    budgetsMet: failures.length === 0,
    failures,
    physicalDeviceVerified: false,
    publicationApproved: false,
  };
}

/** Only fixed inventoried test-site paths; no query logging or arbitrary file access. */
export function resolveMeasuredAsset(target, assets) {
  const prefix = '/open-store-searcher/';
  if (
    typeof target !== 'string' ||
    !target.startsWith(prefix) ||
    !/^\/[A-Za-z0-9/_.-]*$/.test(target)
  )
    return null;
  const name = target.slice(prefix.length) || 'index.html';
  if (name.split('/').some((part) => !part || part === '.' || part === '..')) return null;
  return assets.has(name) ? name : null;
}
