import { mkdtemp, mkdir, open, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, test } from 'vitest';
import { requirePagesSize, directoryBytes } from './publication-size.js';

test.each([999_999_999, 1_000_000_000])('accepts total Pages bytes %i', (bytes) => {
  expect(() => requirePagesSize(bytes)).not.toThrow();
});
test.each([1_000_000_001, 2_439_358_850, Number.MAX_SAFE_INTEGER + 1, NaN, -1])(
  'rejects oversized or invalid total Pages bytes %s',
  (bytes) => {
    expect(() => requirePagesSize(bytes)).toThrow('GitHub Pages site size exceeds');
  },
);
test('counts nested site assets and state metadata in the Pages budget', async () => {
  const root = await mkdtemp(join(tmpdir(), 'pr21-budget-'));
  try {
    await mkdir(join(root, 'assets'));
    const file = await open(join(root, 'assets', 'dataset.json'), 'wx');
    try {
      await file.truncate(999_999_990);
    } finally {
      await file.close();
    }
    await writeFile(join(root, 'index.html'), '12345');
    await writeFile(join(root, 'baseline.json'), '123');
    await writeFile(join(root, 'release.json'), '12');
    expect(await directoryBytes(root)).toBe(1_000_000_000);
    requirePagesSize(await directoryBytes(root));
    await writeFile(join(root, 'assets', 'app.js'), '1');
    expect(await directoryBytes(root)).toBe(1_000_000_001);
    expect(() => requirePagesSize(1_000_000_001)).toThrow('GitHub Pages site size exceeds');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
