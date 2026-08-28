import { expect, test, vi } from 'vitest';
import type { ArchiveContract } from './archive-contract.js';
import { createSeoulCollector } from './collect-seoul-archive.js';
import { DEFAULT_COLLECTOR_LIMITS } from './collector-types.js';
import type { ArchiveEvidence, PermissionManifest, SourceEvidence } from './collector-types.js';
import type { ArchiveInspectionResult } from './inspect-archive.js';
import type { SourceProbeResult } from './probe-source.js';
import type { StagedDownloadResult } from './staged-download.js';

const sourceEvidence: SourceEvidence = {
  expectedBytes: 4,
  finalUrl: 'https://file.localdata.go.kr/file/source.zip',
};
const archiveEvidence: ArchiveEvidence = {
  entryCount: 195,
  schemaManifestSha256: 'schema-digest',
  providerModifiedDate: '2026-08-25',
};
const contracts = {
  permissionManifest: {} as PermissionManifest,
  archiveContract: {} as ArchiveContract,
};
const options = {
  stagingRoot: '/tmp/staged',
  previousAcceptedSha256: 'old-digest',
  fetchedAt: '2026-08-28T00:00:00.000Z',
  limits: DEFAULT_COLLECTOR_LIMITS,
};

function dependencies() {
  return {
    probeSource: vi.fn(
      async (): Promise<SourceProbeResult> => ({ kind: 'accepted', evidence: sourceEvidence }),
    ),
    downloadArchive: vi.fn(
      async (): Promise<StagedDownloadResult> => ({
        kind: 'accepted' as const,
        archivePath: '/tmp/staged/source.zip',
        sha256: 'new-digest',
        byteLength: 4,
      }),
    ),
    inspectArchive: vi.fn(
      async (): Promise<ArchiveInspectionResult> => ({
        kind: 'accepted',
        evidence: archiveEvidence,
      }),
    ),
    cleanupRejectedDownload: vi.fn(async () => undefined),
    loadContracts: vi.fn(async () => contracts),
  };
}

test('returns changed only after every stage accepts', async () => {
  const injected = dependencies();
  const result = await createSeoulCollector(injected)(options);
  expect(result).toMatchObject({ kind: 'accepted', change: 'changed', sha256: 'new-digest' });
  expect(injected.probeSource).toHaveBeenCalledOnce();
  expect(injected.downloadArchive).toHaveBeenCalledOnce();
  expect(injected.inspectArchive).toHaveBeenCalledOnce();
});

test('returns unchanged without rewriting or publishing', async () => {
  const injected = dependencies();
  const result = await createSeoulCollector(injected)({
    ...options,
    previousAcceptedSha256: 'new-digest',
  });
  expect(result).toMatchObject({ kind: 'accepted', change: 'unchanged' });
  expect(injected.cleanupRejectedDownload).not.toHaveBeenCalled();
});

test('short-circuits a probe rejection', async () => {
  const injected = dependencies();
  injected.probeSource.mockResolvedValueOnce({
    kind: 'rejected',
    code: 'download_limit_denied',
    message: 'denied',
  });
  await expect(createSeoulCollector(injected)(options)).resolves.toMatchObject({
    kind: 'rejected',
    code: 'download_limit_denied',
    fetchedAt: options.fetchedAt,
  });
  expect(injected.downloadArchive).not.toHaveBeenCalled();
});

test('removes the staged archive after inspection rejection', async () => {
  const injected = dependencies();
  injected.inspectArchive.mockResolvedValueOnce({
    kind: 'rejected',
    code: 'archive_corrupt',
    message: 'corrupt',
  });
  await expect(createSeoulCollector(injected)(options)).resolves.toMatchObject({
    kind: 'rejected',
    code: 'archive_corrupt',
  });
  expect(injected.cleanupRejectedDownload).toHaveBeenCalledWith('/tmp/staged/source.zip');
});
