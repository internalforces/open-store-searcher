import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { link, lstat, mkdir, open, readFile, symlink, utimes, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, expect, test } from 'vitest';
import { createRecoveryFixture } from '../../tests/fixtures/publication-recovery.js';
import { scanPublicationDirectory } from './recovery-inventory.js';
import { validateSnapshotInventory } from './recovery-types.js';

const fixtures: Awaited<ReturnType<typeof createRecoveryFixture>>[] = [];
async function fixture() {
  const f = await createRecoveryFixture();
  fixtures.push(f);
  return f;
}
afterEach(async () => {
  await Promise.all(fixtures.splice(0).map((f) => f.cleanup()));
});

test('inventories every app Worker baseline and empty file with exact bytes and ordinal names', async () => {
  const f = await fixture();
  const inventory = await scanPublicationDirectory(f.siteDir);
  const release = JSON.parse(await readFile(join(f.siteDir, 'release.json'), 'utf8'));
  const manifestEntry = release.entries.find(
    (entry: { name: string }) => entry.name !== 'baseline.json',
  );
  const manifest = JSON.parse(await readFile(join(f.siteDir, manifestEntry.name), 'utf8'));
  expect(inventory.files.map((entry) => entry.name)).toEqual(
    [
      '.nojekyll',
      'assets/app.js',
      'assets/worker.js',
      'baseline.json',
      'index.html',
      'release.json',
      manifestEntry.name,
      ...manifest.entries.map((entry: { name: string }) => entry.name),
    ].sort(),
  );
  expect(inventory.files.map((e) => e.name)).toContain('assets/app.js');
  expect(inventory.files.map((e) => e.name)).toContain('assets/worker.js');
  expect(inventory.files.map((e) => e.name)).toContain('baseline.json');
  expect(inventory.files.map((e) => e.name)).toEqual(inventory.files.map((e) => e.name).sort());
  expect(inventory.files.find((e) => e.name === '.nojekyll')).toEqual({
    name: '.nojekyll',
    byteLength: 0,
    sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  });
  let bytes = 0;
  for (const entry of inventory.files) {
    const actual = await readFile(join(f.siteDir, entry.name));
    expect(entry.byteLength).toBe(actual.length);
    expect(entry.sha256).toBe(createHash('sha256').update(actual).digest('hex'));
    bytes += actual.length;
  }
  expect(inventory.totalBytes).toBe(bytes);
  expect(existsSync(join(f.root, 'executed'))).toBe(false);
});

test.each(['directory-symlink', 'file-symlink', 'hardlink'] as const)(
  'rejects %s before reading protected contents',
  async (kind) => {
    const f = await fixture();
    const protectedPath = join(f.root, 'protected');
    await writeFile(protectedPath, 'must remain unread');
    await utimes(
      protectedPath,
      new Date('2000-01-01T00:00:00.000Z'),
      new Date('2000-01-01T00:00:00.000Z'),
    );
    const before = await lstat(protectedPath);
    if (kind === 'directory-symlink') await symlink(f.root, join(f.siteDir, 'alias'));
    if (kind === 'file-symlink') await symlink(protectedPath, join(f.siteDir, 'alias'));
    if (kind === 'hardlink') await link(protectedPath, join(f.siteDir, 'alias'));
    await expect(scanPublicationDirectory(f.siteDir)).rejects.toThrow();
    expect((await lstat(protectedPath)).atimeMs).toBe(before.atimeMs);
    expect(await readFile(protectedPath, 'utf8')).toBe('must remain unread');
  },
);
test.each(['.git', '.github', '.env', '.env.production', 'private.key', 'id_rsa', 'package.json'])(
  'rejects forbidden repository or secret metadata %s',
  async (name) => {
    const f = await fixture();
    await mkdir(join(f.siteDir, 'nested'));
    await writeFile(join(f.siteDir, 'nested', name), 'must remain unread');
    await expect(scanPublicationDirectory(f.siteDir)).rejects.toThrow();
  },
);
test('rejects a symlink root and an oversized sparse file before hashing', async () => {
  const f = await fixture();
  await symlink(f.siteDir, join(f.root, 'alias'));
  await expect(scanPublicationDirectory(join(f.root, 'alias'))).rejects.toThrow();
  const file = await open(join(f.siteDir, 'huge'), 'w');
  await file.truncate(536_870_913);
  await file.close();
  await expect(scanPublicationDirectory(f.siteDir)).rejects.toThrow();
});
test('rejects complete-site byte excess before reading sparse payloads', async () => {
  const f = await fixture();
  for (const name of ['large-a', 'large-b']) {
    const file = await open(join(f.siteDir, name), 'w');
    await file.truncate(500_000_001);
    await file.close();
  }
  await expect(scanPublicationDirectory(f.siteDir)).rejects.toThrow('site limit');
});
test('rejects more than ten thousand regular files before payload reads', async () => {
  const f = await fixture();
  for (let i = 0; i < 10_001; i++) await writeFile(join(f.siteDir, `file-${i}`), '');
  await expect(scanPublicationDirectory(f.siteDir)).rejects.toThrow('Too many snapshot files');
});
test('accepts exact file and site byte ceilings in strict inventory metadata', () => {
  expect(
    validateSnapshotInventory({
      version: 1,
      kind: 'publication-inventory',
      files: [
        { name: 'a', byteLength: 536_870_912, sha256: 'a'.repeat(64) },
        { name: 'b', byteLength: 463_129_088, sha256: 'b'.repeat(64) },
      ],
      totalBytes: 1_000_000_000,
    }).totalBytes,
  ).toBe(1_000_000_000);
});
test('rejects canonical inventory encoding exceeding four MiB', () => {
  const files = Array.from({ length: 10_000 }, (_, i) => ({
    name: `${String(i).padStart(5, '0')}${'"'.repeat(250)}`,
    byteLength: 0,
    sha256: 'a'.repeat(64),
  }));
  expect(() =>
    validateSnapshotInventory({ version: 1, kind: 'publication-inventory', files, totalBytes: 0 }),
  ).toThrow('inventory exceeds byte limit');
});
test.each([
  '../escape',
  '/absolute',
  'a/../b',
  'a//b',
  'a\\b',
  './a',
  'a/%2e%2e/b',
  'a?b',
  'a#b',
  'a\u0000b',
  'x'.repeat(256),
])('rejects unsafe inventory path %s before materialization', (name) => {
  expect(() =>
    validateSnapshotInventory({
      version: 1,
      kind: 'publication-inventory',
      files: [{ name, byteLength: 0, sha256: 'a'.repeat(64) }],
      totalBytes: 0,
    }),
  ).toThrow();
});
test.each([
  'unknown',
  'missing',
  'negative',
  'unsafe',
  'bad-hash',
  'duplicate',
  'unsorted',
  'total',
  'count',
  'total-limit',
])('rejects invalid inventory envelope %s', (kind) => {
  const value = {
    version: 1,
    kind: 'publication-inventory',
    files: [{ name: 'a', byteLength: 0, sha256: 'a'.repeat(64) }],
    totalBytes: 0,
  };
  if (kind === 'unknown') Object.assign(value, { extra: true });
  if (kind === 'missing') Reflect.deleteProperty(value, 'totalBytes');
  if (kind === 'negative') required(value.files[0]).byteLength = -1;
  if (kind === 'unsafe') required(value.files[0]).byteLength = Number.MAX_SAFE_INTEGER + 1;
  if (kind === 'bad-hash') required(value.files[0]).sha256 = 'A'.repeat(64);
  if (kind === 'duplicate') value.files.push({ ...required(value.files[0]) });
  if (kind === 'unsorted') value.files.unshift({ ...required(value.files[0]), name: 'z' });
  if (kind === 'total') value.totalBytes = 1;
  if (kind === 'count')
    value.files = Array.from({ length: 10_001 }, (_, i) => ({
      name: `x${String(i).padStart(5, '0')}`,
      byteLength: 0,
      sha256: 'a'.repeat(64),
    }));
  if (kind === 'total-limit') {
    value.files = [
      { name: 'a', byteLength: 500_000_001, sha256: 'a'.repeat(64) },
      { name: 'b', byteLength: 500_000_000, sha256: 'b'.repeat(64) },
    ];
    value.totalBytes = 1_000_000_001;
  }
  expect(() => validateSnapshotInventory(value)).toThrow();
});

function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error('Missing synthetic fixture value');
  return value;
}
