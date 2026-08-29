import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';
import { DEFAULT_COLLECTOR_LIMITS } from './collector-types.js';
import { runProcess, UnzipArchiveAdapter } from './unzip-archive.js';

const fixture = (name: string) =>
  fileURLToPath(new URL(`../../tests/fixtures/pipeline/collector/${name}`, import.meta.url));

describe('UnzipArchiveAdapter', () => {
  test('lists and streams entries from a valid local archive', async () => {
    const adapter = new UnzipArchiveAdapter('/usr/bin/unzip', DEFAULT_COLLECTOR_LIMITS);
    await expect(adapter.checkEnvironment()).resolves.toMatchObject({ ok: true });
    await expect(adapter.testIntegrity(fixture('valid-two-category.zip'))).resolves.toEqual({
      ok: true,
    });
    await expect(adapter.listEntries(fixture('valid-two-category.zip'))).resolves.toEqual([
      { name: 'category-a.csv', modifiedDate: '2026-08-25' },
      { name: 'category-b.csv', modifiedDate: '2026-08-25' },
    ]);
    const prefix = await adapter.readEntryPrefix(
      fixture('valid-two-category.zip'),
      'category-a.csv',
      256,
    );
    expect(new TextDecoder().decode(prefix)).toContain('사업장명');
  });

  test('reports a corrupt archive without extracting it', async () => {
    const adapter = new UnzipArchiveAdapter('/usr/bin/unzip', DEFAULT_COLLECTOR_LIMITS);
    await expect(adapter.testIntegrity(fixture('corrupt.zip'))).resolves.toEqual({ ok: false });
  });

  test('reports an unavailable executable and refuses option-like entry names', async () => {
    const adapter = new UnzipArchiveAdapter('/definitely/missing/unzip', DEFAULT_COLLECTOR_LIMITS);
    await expect(adapter.checkEnvironment()).resolves.toEqual({ ok: false });
    const valid = new UnzipArchiveAdapter('/usr/bin/unzip', DEFAULT_COLLECTOR_LIMITS);
    await expect(
      valid.readEntryPrefix(fixture('valid-two-category.zip'), '-unsafe', 256),
    ).rejects.toThrow('unsafe archive entry');
  });

  test('terminates process output that exceeds the configured cap', async () => {
    await expect(
      runProcess({
        executable: process.execPath,
        args: ['-e', "process.stdout.write('x'.repeat(100))"],
        maxOutputBytes: 16,
        timeoutMs: 1_000,
      }),
    ).rejects.toThrow('aborted');
  });

  test('rejects a process request whose signal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      runProcess({
        executable: process.execPath,
        args: ['-e', 'process.exit(0)'],
        maxOutputBytes: 16,
        timeoutMs: 1_000,
        signal: controller.signal,
      }),
    ).rejects.toThrow('aborted');
  });
});
