import { expect, test, vi } from 'vitest';
import type { ArchiveContract } from './archive-contract.js';
import { createSeoulCollector } from './collect-seoul-archive.js';
import type { ArchiveEvidence, PermissionManifest, SourceEvidence } from './collector-types.js';
import { DEFAULT_COLLECTOR_LIMITS } from './collector-types.js';
import type { ArchiveInspectionResult } from './inspect-archive.js';
import type { SourceProbeResult } from './probe-source.js';
import type { StagedDownloadResult } from './staged-download.js';

const sourceEvidence: SourceEvidence = {
  expectedBytes: 4,
  finalUrl: 'https://file.localdata.go.kr/file/source.zip',
  providerFreshness: {
    updateCadence: 'daily',
    coverageLagDays: 2,
    sourceUrl: 'https://www.data.go.kr/data/15045016/fileData.do',
  },
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
    checkArchiveEnvironment: vi.fn(async () => ({ ok: true })),
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

test('rejects an incompatible archive environment before probing the provider', async () => {
  const injected = dependencies();
  injected.checkArchiveEnvironment.mockResolvedValueOnce({ ok: false });

  await expect(createSeoulCollector(injected)(options)).resolves.toMatchObject({
    kind: 'rejected',
    code: 'environment_unavailable',
  });
  expect(injected.probeSource).not.toHaveBeenCalled();
  expect(injected.downloadArchive).not.toHaveBeenCalled();
});

test('rejects a non-canonical fetchedAt before loading contracts or external work', async () => {
  const injected = dependencies();

  await expect(
    createSeoulCollector(injected)({
      ...options,
      fetchedAt: '2026-08-28 00:00:00',
    }),
  ).resolves.toMatchObject({
    kind: 'rejected',
    code: 'transfer_incomplete',
    fetchedAt: '2026-08-28 00:00:00',
  });
  expect(injected.loadContracts).not.toHaveBeenCalled();
  expect(injected.checkArchiveEnvironment).not.toHaveBeenCalled();
  expect(injected.probeSource).not.toHaveBeenCalled();
  expect(injected.downloadArchive).not.toHaveBeenCalled();
  expect(injected.inspectArchive).not.toHaveBeenCalled();
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

const mismatch = { expectedBytes: 4, declaredBytes: 5 };
const mismatchResult = {
  kind: 'rejected' as const,
  code: 'transfer_incomplete' as const,
  message: 'Declared archive size disagrees with range evidence.',
  lengthMismatch: mismatch,
};

test('recovers once from a pre-body length mismatch using a fresh probe and retains failure evidence', async () => {
  const injected = dependencies();
  const fresh = { ...sourceEvidence, expectedBytes: 5 };
  injected.probeSource
    .mockResolvedValueOnce({ kind: 'accepted', evidence: sourceEvidence })
    .mockResolvedValueOnce({ kind: 'accepted', evidence: fresh });
  injected.downloadArchive.mockResolvedValueOnce(mismatchResult).mockResolvedValueOnce({
    kind: 'accepted',
    archivePath: '/tmp/staged/source.zip',
    sha256: 'new-digest',
    byteLength: 5,
  });
  const result = await createSeoulCollector(injected)(options);
  expect(result).toMatchObject({
    kind: 'accepted',
    byteLength: 5,
    sourceEvidence: fresh,
    lengthMismatches: [mismatch],
  });
  expect(injected.probeSource).toHaveBeenCalledTimes(2);
  expect(injected.downloadArchive).toHaveBeenCalledTimes(2);
  expect(injected.downloadArchive).toHaveBeenNthCalledWith(
    2,
    expect.objectContaining({ sourceEvidence: fresh }),
  );
  expect(injected.inspectArchive).toHaveBeenCalledOnce();
  expect(injected.cleanupRejectedDownload).not.toHaveBeenCalled();
});

test('rejects a second pre-body mismatch without a third attempt or archive inspection', async () => {
  const injected = dependencies();
  injected.downloadArchive.mockResolvedValue(mismatchResult);
  const result = await createSeoulCollector(injected)(options);
  expect(result).toMatchObject({
    kind: 'rejected',
    code: 'transfer_incomplete',
    lengthMismatches: [mismatch, mismatch],
  });
  expect(injected.probeSource).toHaveBeenCalledTimes(2);
  expect(injected.downloadArchive).toHaveBeenCalledTimes(2);
  expect(injected.inspectArchive).not.toHaveBeenCalled();
});

test('retains mismatch history when the fresh probe is denied without retrying the denial', async () => {
  const injected = dependencies();
  injected.downloadArchive.mockResolvedValueOnce(mismatchResult);
  injected.probeSource
    .mockResolvedValueOnce({ kind: 'accepted', evidence: sourceEvidence })
    .mockResolvedValueOnce({ kind: 'rejected', code: 'download_limit_denied', message: 'denied' });
  expect(await createSeoulCollector(injected)(options)).toMatchObject({
    kind: 'rejected',
    code: 'download_limit_denied',
    lengthMismatches: [mismatch],
  });
  expect(injected.probeSource).toHaveBeenCalledTimes(2);
  expect(injected.downloadArchive).toHaveBeenCalledOnce();
});

test('retains mismatch history and cleans a recovered archive when inspection fails', async () => {
  const injected = dependencies();
  injected.downloadArchive.mockResolvedValueOnce(mismatchResult);
  injected.inspectArchive.mockResolvedValueOnce({
    kind: 'rejected',
    code: 'archive_corrupt',
    message: 'corrupt',
  });
  expect(await createSeoulCollector(injected)(options)).toMatchObject({
    kind: 'rejected',
    code: 'archive_corrupt',
    lengthMismatches: [mismatch],
  });
  expect(injected.cleanupRejectedDownload).toHaveBeenCalledWith('/tmp/staged/source.zip');
});

test('does not retry a mismatch after cancellation', async () => {
  const injected = dependencies();
  const controller = new AbortController();
  injected.downloadArchive.mockImplementationOnce(async () => {
    controller.abort();
    return mismatchResult;
  });
  expect(
    await createSeoulCollector(injected)({ ...options, signal: controller.signal }),
  ).toMatchObject({ kind: 'rejected', lengthMismatches: [mismatch] });
  expect(injected.probeSource).toHaveBeenCalledOnce();
  expect(injected.downloadArchive).toHaveBeenCalledOnce();
  expect(injected.inspectArchive).not.toHaveBeenCalled();
});

test.each(['transfer_incomplete', 'download_limit_denied', 'http_contract_changed'] as const)(
  'does not retry %s without explicit pre-body mismatch evidence',
  async (code) => {
    const injected = dependencies();
    injected.downloadArchive.mockResolvedValueOnce({ kind: 'rejected', code, message: 'failure' });
    expect(await createSeoulCollector(injected)(options)).toMatchObject({ kind: 'rejected', code });
    expect(injected.probeSource).toHaveBeenCalledOnce();
    expect(injected.downloadArchive).toHaveBeenCalledOnce();
    expect(injected.inspectArchive).not.toHaveBeenCalled();
  },
);
