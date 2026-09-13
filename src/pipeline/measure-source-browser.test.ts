import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { expect, test } from 'vitest';

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'pr21-browser-binding-'));
  const bytes = '{"records":["가","나"]}';
  const observation = {
    kind: 'bounded-source-observation',
    publicationApproved: false,
    archiveSha256: 'a'.repeat(64),
    recordCount: 2,
    dataset: {
      byteLength: Buffer.byteLength(bytes),
      sha256: createHash('sha256').update(bytes).digest('hex'),
    },
  };
  await writeFile(join(root, 'dataset.json'), bytes);
  await writeFile(join(root, 'observation.json'), JSON.stringify(observation));
  const hook = join(root, 'hook.mjs');
  const fakeVite = `import { writeFile } from 'node:fs/promises';
    export async function createServer() {
      await writeFile(${JSON.stringify(join(root, 'server-started'))}, 'started');
      return { listen: async () => {}, close: async () => {}, resolvedUrls: { local: ['http://localhost/'] } };
    }`;
  const fakeBrowser = `export const chromium = { launch: async () => ({
    version: () => 'test-browser', close: async () => {}, newPage: async () => ({
      on: () => {}, goto: async () => {}, waitForFunction: async () => {},
      evaluate: async () => ({ phase: 'ready', records: 2 }),
    }),
  }) };`;
  await writeFile(
    hook,
    `import { registerHooks } from 'node:module';
    const mocks = { vite: ${JSON.stringify(fakeVite)}, '@playwright/test': ${JSON.stringify(fakeBrowser)} };
    registerHooks({ resolve(specifier, context, nextResolve) {
      if (specifier in mocks && context.parentURL?.endsWith('/scripts/measure-source-browser.mjs'))
        return { url: 'data:text/javascript,' + encodeURIComponent(mocks[specifier]), shortCircuit: true };
      return nextResolve(specifier, context);
    } });`,
  );
  const run = () =>
    promisify(execFile)(process.execPath, [
      '--import',
      hook,
      'scripts/measure-source-browser.mjs',
      root,
      join(root, 'report.json'),
    ]);
  return { root, bytes, observation, run };
}

test('binds browser report to verified observation dataset bytes', async () => {
  const { root, observation, run } = await fixture();
  try {
    await run();
    const report = JSON.parse(await readFile(join(root, 'report.json'), 'utf8'));
    expect(report).toMatchObject({
      archiveSha256: observation.archiveSha256,
      recordCount: 2,
      datasetBytes: observation.dataset.byteLength,
      datasetSha256: observation.dataset.sha256,
      result: { phase: 'ready', records: 2 },
    });
    expect(await readFile(join(root, 'server-started'), 'utf8')).toBe('started');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test.each([
  'truncated',
  'same-size-modified',
  'foreign',
  'missing',
  'missing-binding',
  'invalid-hash',
  'invalid-size',
])('rejects %s dataset before browser measurement or report creation', async (kind) => {
  const { root, bytes, observation, run } = await fixture();
  try {
    if (kind === 'truncated') await writeFile(join(root, 'dataset.json'), bytes.slice(0, -1));
    if (kind === 'same-size-modified') {
      const altered = bytes.replace('가', '다');
      expect(Buffer.byteLength(altered)).toBe(observation.dataset.byteLength);
      await writeFile(join(root, 'dataset.json'), altered);
    }
    if (kind === 'foreign') await writeFile(join(root, 'dataset.json'), '{"records":[]}');
    if (kind === 'missing') await rm(join(root, 'dataset.json'));
    if (kind === 'missing-binding')
      await writeFile(
        join(root, 'observation.json'),
        JSON.stringify({ ...observation, dataset: null }),
      );
    if (kind === 'invalid-hash' || kind === 'invalid-size') {
      const dataset = {
        ...observation.dataset,
        ...(kind === 'invalid-hash' ? { sha256: 'invalid' } : { byteLength: 0 }),
      };
      await writeFile(join(root, 'observation.json'), JSON.stringify({ ...observation, dataset }));
    }
    await expect(run()).rejects.toThrow(kind === 'missing' ? 'ENOENT' : 'Observed dataset');
    const names = await readdir(root);
    expect(names).not.toContain('server-started');
    expect(names).not.toContain('report.json');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
