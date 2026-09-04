import { execFile } from 'node:child_process';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { describe, expect, test } from 'vitest';

describe('research observation command', () => {
  test.each([
    ['max-bytes', '268435457'],
    ['max-rows', '100001'],
    ['max-record-chars', '65537'],
    ['timeout-ms', '600001'],
    ['max-rss-bytes', '3221225473'],
  ])('refuses a live %s override above the reviewed ceiling', async (key, value) => {
    const staging = await mkdtemp(join(tmpdir(), 'oss-observation-cli-'));
    const limits = {
      'max-bytes': '268435456',
      'max-rows': '100000',
      'max-record-chars': '65536',
      'timeout-ms': '600000',
      'max-rss-bytes': '3221225472',
      [key]: value,
    };
    try {
      await expect(
        promisify(execFile)(process.execPath, [
          '--import',
          'data:text/javascript,globalThis.fetch=()=>{console.log("unexpected_provider_request");throw new Error("offline test")}',
          'scripts/observe-seoul-source.mjs',
          `--staging=${staging}`,
          `--output=${join(staging, 'report.json')}`,
          ...Object.entries(limits).map(([k, v]) => `--${k}=${v}`),
        ]),
      ).rejects.toMatchObject({
        code: 1,
        stdout: '',
        stderr: '{"kind":"rejected","code":"observation_command_failed"}\n',
      });
      expect(await readdir(staging)).toEqual([]);
    } finally {
      await rm(staging, { recursive: true, force: true });
    }
  });

  test.each([{ args: [] }, { args: ['--staging=relative'] }, { args: ['--unknown=1'] }])(
    'rejects invalid CLI arguments before collector work: %j',
    async ({ args }) => {
      try {
        await promisify(execFile)(process.execPath, [
          '--import',
          'data:text/javascript,globalThis.fetch=()=>{console.log("unexpected_provider_request");throw new Error("offline test")}',
          'scripts/observe-seoul-source.mjs',
          ...args,
        ]);
        throw new Error('unexpected command success');
      } catch (error) {
        const result = error as { code: number; stdout: string; stderr: string };
        expect(result.code).toBe(1);
        expect(result.stdout).toBe('');
        expect(result.stderr).toBe('{"kind":"rejected","code":"observation_command_failed"}\n');
      }
    },
  );
});
