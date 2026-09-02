import { resolve } from 'node:path';
import { expect, test } from 'vitest';
import type { StagedDownloadResult } from './staged-download.js';
import { parseManualProbeArguments, runManualProbe } from './manual-probe.js';

const acceptedDownload: StagedDownloadResult = {
  kind: 'accepted',
  archivePath: '/tmp/staged/source.zip',
  sha256: 'archive-digest',
  byteLength: 4,
};

test('checks the archive environment before any manual provider request', async () => {
  const result = await runManualProbe({
    checkEnvironment: async () => ({ ok: false }),
    probeSource: async () => {
      throw new Error('provider request must not run');
    },
    downloadArchive: async () => acceptedDownload,
    discoverArchive: async () => ({
      provider: '행정안전부',
      permissionLabel: '이용허락범위 제한 없음',
      expectedEntryCount: 0,
      entries: [],
    }),
    cleanupArchive: async () => undefined,
  });

  expect(result).toEqual({
    kind: 'rejected',
    code: 'environment_unavailable',
    message: 'Approved Info-ZIP environment is unavailable.',
  });
});

test('rejects the unsupported Docker option before starting the manual probe', () => {
  expect(() =>
    parseManualProbeArguments([
      '--staging=/tmp/staging',
      '--output=/tmp/candidate.json',
      '--docker-container=ubuntu-probe',
    ]),
  ).toThrow('unsupported manual probe option');
});

test('parses the supported manual probe arguments', () => {
  const stagingRoot = resolve('tmp/manual-probe-staging');
  const outputPath = resolve('tmp/manual-probe-candidate.json');
  expect(
    parseManualProbeArguments([
      `--staging=${stagingRoot}`,
      `--output=${outputPath}`,
      '--unzip=unzip',
    ]),
  ).toEqual({
    stagingRoot,
    outputPath,
    unzipExecutable: 'unzip',
  });
});
