import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, expect, test, vi } from 'vitest';
import { createRecoveryFixture } from '../../tests/fixtures/publication-recovery.js';
import { scanPublicationDirectory } from './recovery-inventory.js';
import * as compactVerifier from './verify-compact-directory.js';
import { verifyPublicationDirectory } from './verify-publication-directory.js';

const fixtures: Awaited<ReturnType<typeof createRecoveryFixture>>[] = [];
async function fixture() {
  const f = await createRecoveryFixture();
  fixtures.push(f);
  return f;
}
afterEach(async () => {
  vi.restoreAllMocks();
  await Promise.all(fixtures.splice(0).map((f) => f.cleanup()));
});
test('rejects application bytes changed during semantic verification', async () => {
  const f = await fixture();
  const verify = compactVerifier.verifyCompactDirectory;
  vi.spyOn(compactVerifier, 'verifyCompactDirectory').mockImplementationOnce(async (...args) => {
    const manifest = await verify(...args);
    await writeFile(join(f.siteDir, 'assets/app.js'), 'replacement after semantic verification');
    return manifest;
  });
  await expect(verifyPublicationDirectory(f.siteDir)).rejects.toThrow(
    'changed during verification',
  );
});
const json = (v: unknown) => Buffer.from(`${JSON.stringify(v)}\n`);
const sha = (v: Uint8Array) => createHash('sha256').update(v).digest('hex');

test('accepts the existing V2 producer source coverage warning without changing publication evidence', async () => {
  const f = await fixture();
  const path = join(f.siteDir, 'release.json');
  const release = JSON.parse(await readFile(path, 'utf8'));
  release.warnings = [{ code: 'source_coverage_unverified', severity: 'warning' }];
  const bytes = json(release);
  await writeFile(path, bytes);
  const verified = await verifyPublicationDirectory(f.siteDir);
  expect(verified.releaseSha256).toBe(sha(bytes));
  expect(verified.recordCount).toBe(2);
  expect(verified.collectedAt).toBe('2026-09-14T15:00:00.000Z');
  expect(verified.baselineSha256).toBe(f.identity.baselineSha256);
  expect(verified.manifestSha256).toBe(f.identity.manifestSha256);
  expect(existsSync(join(f.root, 'executed'))).toBe(false);
});
test.each([7, 8])(
  'accepts producer collection_stale warning at age %i with original collection time',
  async (age) => {
    const f = await fixture();
    const path = join(f.siteDir, 'release.json');
    const release = JSON.parse(await readFile(path, 'utf8'));
    release.warnings = [
      { code: 'collection_stale', severity: 'warning', metric: 'ageDays', actual: age, limit: 7 },
      { code: 'source_coverage_unverified', severity: 'warning' },
    ];
    await writeFile(path, json(release));
    const verified = await verifyPublicationDirectory(f.siteDir);
    expect(verified.collectedAt).toBe(f.identity.collectedAt);
    expect(verified.recordCount).toBe(2);
  },
);
test('preserves verification compatibility for descriptors without warning metadata', async () => {
  const f = await fixture();
  const path = join(f.siteDir, 'release.json');
  const release = JSON.parse(await readFile(path, 'utf8'));
  delete release.warnings;
  await writeFile(path, json(release));
  expect((await verifyPublicationDirectory(f.siteDir)).recordCount).toBe(2);
});
test.each([
  ['null', null],
  ['object', { code: 'source_coverage_unverified', severity: 'warning' }],
  ['nonobject item', [null]],
  ['unknown code', [{ code: 'new_warning', severity: 'warning' }]],
  ['coverage metadata', [{ code: 'source_coverage_unverified', severity: 'warning', actual: 0 }]],
  ['review severity', [{ code: 'source_coverage_unverified', severity: 'review' }]],
  ['rejection severity', [{ code: 'source_coverage_unverified', severity: 'rejection' }]],
  ['missing severity', [{ code: 'source_coverage_unverified' }]],
  [
    'duplicate code',
    [
      { code: 'source_coverage_unverified', severity: 'warning' },
      { code: 'source_coverage_unverified', severity: 'warning' },
    ],
  ],
  [
    'too many warnings',
    [
      { code: 'source_coverage_unverified', severity: 'warning' },
      { code: 'collection_stale', severity: 'warning', metric: 'ageDays', actual: 7, limit: 7 },
      { code: 'source_coverage_unverified', severity: 'warning' },
    ],
  ],
  ...[
    ['below boundary', { actual: 6 }],
    ['negative age', { actual: -1 }],
    ['fractional age', { actual: 7.5 }],
    ['unsafe age', { actual: Number.MAX_SAFE_INTEGER + 1 }],
    ['string age', { actual: '7' }],
    ['null age', { actual: null }],
    ['missing age', { actual: undefined }],
    ['wrong metric', { metric: 'recordCount' }],
    ['wrong limit', { limit: 8 }],
    ['unknown field', { extra: true }],
  ].map(([name, fields]) => [
    name,
    [
      {
        code: 'collection_stale',
        severity: 'warning',
        metric: 'ageDays',
        actual: 7,
        limit: 7,
        ...(fields as Record<string, unknown>),
      },
    ],
  ]),
] as [string, unknown][])(
  'rejects unsupported producer warning form: %s',
  async (_name, warnings) => {
    const f = await fixture();
    const path = join(f.siteDir, 'release.json');
    const release = JSON.parse(await readFile(path, 'utf8'));
    release.warnings = warnings;
    await writeFile(path, json(release));
    await expect(verifyPublicationDirectory(f.siteDir)).rejects.toThrow('publication descriptor');
  },
);

test('verifies a complete two-record V2 site using trusted code without executing app scripts', async () => {
  const f = await fixture();
  const before = await scanPublicationDirectory(f.siteDir);
  const result = await verifyPublicationDirectory(f.siteDir, before);
  expect(result).toMatchObject(f.identity);
  expect(result.recordCount).toBe(2);
  expect(result.inventory).toEqual(before);
  expect(result.inventorySha256).toBe(sha(json(before)));
  expect(await scanPublicationDirectory(f.siteDir)).toEqual(before);
  expect(existsSync(join(f.root, 'executed'))).toBe(false);
});
test.each(['remove', 'add', 'modify', 'altered-inventory'])(
  'rejects complete-site inventory %s mismatch',
  async (kind) => {
    const f = await fixture();
    const expected = await scanPublicationDirectory(f.siteDir);
    if (kind === 'remove') await rm(join(f.siteDir, 'assets/worker.js'));
    if (kind === 'add') await writeFile(join(f.siteDir, 'added'), 'unexpected');
    if (kind === 'modify') await writeFile(join(f.siteDir, 'assets/app.js'), 'changed');
    if (kind === 'altered-inventory') required(expected.files[0]).sha256 = 'a'.repeat(64);
    await expect(verifyPublicationDirectory(f.siteDir, expected)).rejects.toThrow();
  },
);
test.each([
  'manifest-archive',
  'manifest-policy',
  'manifest-count',
  'baseline-archive',
  'baseline-date',
  'baseline-count',
  'baseline-policy',
  'category-missing',
  'category-invalid',
  'status-metrics',
  'schema-hash',
  'release-date',
  'release-count',
  'release-policy',
  'release-unknown',
  'entry-unknown',
  'entry-traversal',
  'entry-duplicate',
  'release-missing',
  'release-version',
  'manifest-corrupt',
  'baseline-corrupt',
  'manifest-hash',
  'manifest-length',
  'baseline-hash',
  'baseline-length',
])('rejects rehashed publication %s inconsistency', async (kind) => {
  const f = await fixture();
  const release = JSON.parse(await readFile(join(f.siteDir, 'release.json'), 'utf8'));
  const baseline = JSON.parse(await readFile(join(f.siteDir, 'baseline.json'), 'utf8'));
  const manifestEntry = release.entries.find((e: { name: string }) => e.name !== 'baseline.json');
  const manifest = JSON.parse(await readFile(join(f.siteDir, manifestEntry.name), 'utf8'));
  if (kind === 'manifest-archive') manifest.archiveSha256 = 'c'.repeat(64);
  if (kind === 'manifest-policy') manifest.policyRevision = 'other';
  if (kind === 'manifest-count') manifest.recordCount = 3;
  if (kind === 'baseline-archive') baseline.archiveSha256 = 'c'.repeat(64);
  if (kind === 'baseline-date') baseline.dataAsOf = '2026-09-14';
  if (kind === 'baseline-count') baseline.metrics.total.recordCount = 3;
  if (kind === 'baseline-policy') baseline.policyRevision = 'other';
  const first = required(Object.keys(baseline.metrics.categories)[0]);
  if (kind === 'category-missing') delete baseline.metrics.categories[first];
  if (kind === 'category-invalid') baseline.metrics.categories[first].recordCount = -1;
  if (kind === 'status-metrics') baseline.metrics.total.statusCounts['행정상 영업'] = 2;
  if (kind === 'schema-hash') baseline.schemaManifestSha256 = 'c'.repeat(64);
  if (kind === 'release-date') release.collectedAt = '2026-09-14T14:59:59.999Z';
  if (kind === 'release-count') release.recordCount = 3;
  if (kind === 'release-policy') release.policyRevision = 'other';
  if (kind === 'release-unknown') release.unexpected = true;
  if (kind === 'release-missing') delete release.collectedAt;
  if (kind === 'release-version') release.version = 1;
  const bb = kind === 'baseline-corrupt' ? Buffer.from('{') : json(baseline);
  await writeFile(join(f.siteDir, 'baseline.json'), bb);
  Object.assign(
    release.entries.find((e: { name: string }) => e.name === 'baseline.json'),
    { byteLength: bb.length, sha256: sha(bb) },
  );
  const mb = kind === 'manifest-corrupt' ? Buffer.from('{') : json(manifest);
  const oldName = manifestEntry.name;
  Object.assign(manifestEntry, {
    byteLength: mb.length,
    sha256: sha(mb),
    name: `assets/compact-manifest-${sha(mb)}.json`,
  });
  if (oldName !== manifestEntry.name) await rm(join(f.siteDir, oldName));
  await writeFile(join(f.siteDir, manifestEntry.name), mb);
  if (kind === 'entry-unknown') manifestEntry.unexpected = true;
  if (kind === 'entry-traversal') manifestEntry.name = '../protected';
  if (kind === 'entry-duplicate') release.entries.push(release.entries[0]);
  if (kind === 'manifest-hash') manifestEntry.sha256 = 'a'.repeat(64);
  if (kind === 'manifest-length') manifestEntry.byteLength++;
  const baselineEntry = release.entries.find((e: { name: string }) => e.name === 'baseline.json');
  if (kind === 'baseline-hash') baselineEntry.sha256 = 'a'.repeat(64);
  if (kind === 'baseline-length') baselineEntry.byteLength++;
  await writeFile(join(f.siteDir, 'release.json'), json(release));
  await expect(verifyPublicationDirectory(f.siteDir)).rejects.toThrow();
  expect(existsSync(join(f.root, 'executed'))).toBe(false);
});

function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error('Missing synthetic fixture value');
  return value;
}
