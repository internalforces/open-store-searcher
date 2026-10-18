import { readFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import type { ArchiveContract } from './archive-contract.js';
import { parseArchiveContract } from './archive-contract.js';
import type {
  CollectionResult,
  CollectorOptions,
  PermissionManifest,
  TransferLengthMismatchEvidence,
} from './collector-types.js';
import { isCanonicalUtc } from './collector-types.js';
import type { ArchiveInspectionResult, InspectionOptions } from './inspect-archive.js';
import { inspectArchive } from './inspect-archive.js';
import type { ProbeOptions, SourceProbeResult } from './probe-source.js';
import { probeSourceContract } from './probe-source.js';
import { parsePermissionManifest } from './source-contract.js';
import type { DownloadOptions, StagedDownloadResult } from './staged-download.js';
import { downloadArchiveToStaging } from './staged-download.js';
import { UnzipArchiveAdapter } from './unzip-archive.js';

interface Contracts {
  permissionManifest: PermissionManifest;
  archiveContract: ArchiveContract;
}

interface ArchiveEnvironmentOptions {
  limits: CollectorOptions['limits'];
  signal?: AbortSignal;
}

export interface CollectorDependencies {
  checkArchiveEnvironment(options: ArchiveEnvironmentOptions): Promise<{ ok: boolean }>;
  probeSource(options: ProbeOptions): Promise<SourceProbeResult>;
  downloadArchive(options: DownloadOptions): Promise<StagedDownloadResult>;
  inspectArchive(options: InspectionOptions): Promise<ArchiveInspectionResult>;
  cleanupRejectedDownload(archivePath: string): Promise<void>;
  loadContracts(): Promise<Contracts>;
}

function rejection(
  result: Extract<
    SourceProbeResult | StagedDownloadResult | ArchiveInspectionResult,
    { kind: 'rejected' }
  >,
  fetchedAt: string,
  lengthMismatches: TransferLengthMismatchEvidence[] = [],
): CollectionResult {
  return {
    kind: result.kind,
    code: result.code,
    message: result.message,
    fetchedAt,
    ...(lengthMismatches.length ? { lengthMismatches } : {}),
  };
}

export function createSeoulCollector(dependencies: CollectorDependencies) {
  return async (options: CollectorOptions): Promise<CollectionResult> => {
    if (!isCanonicalUtc(options.fetchedAt)) {
      return {
        kind: 'rejected',
        code: 'transfer_incomplete',
        message: 'Retrieval evidence is invalid.',
        fetchedAt: options.fetchedAt,
      };
    }
    let contracts: Contracts;
    try {
      contracts = await dependencies.loadContracts();
    } catch {
      return {
        kind: 'rejected',
        code: 'permission_manifest_changed',
        message: 'Committed collector contracts could not be loaded.',
        fetchedAt: options.fetchedAt,
      };
    }
    let environment: { ok: boolean };
    try {
      environment = await dependencies.checkArchiveEnvironment({
        limits: options.limits,
        ...(options.signal ? { signal: options.signal } : {}),
      });
    } catch {
      environment = { ok: false };
    }
    if (!environment.ok) {
      return {
        kind: 'rejected',
        code: 'environment_unavailable',
        message: 'Approved Info-ZIP environment is unavailable.',
        fetchedAt: options.fetchedAt,
      };
    }
    const lengthMismatches: TransferLengthMismatchEvidence[] = [];
    let probe: Extract<SourceProbeResult, { kind: 'accepted' }>;
    let download: Extract<StagedDownloadResult, { kind: 'accepted' }>;
    for (let attempt = 0; ; attempt++) {
      const nextProbe = await dependencies.probeSource({
        fetchImpl: fetch,
        limits: options.limits,
        ...(options.signal ? { signal: options.signal } : {}),
      });
      if (nextProbe.kind === 'rejected')
        return rejection(nextProbe, options.fetchedAt, lengthMismatches);
      const nextDownload = await dependencies.downloadArchive({
        fetchImpl: fetch,
        repositoryRoot,
        stagingRoot: options.stagingRoot,
        sourceEvidence: nextProbe.evidence,
        fetchedAt: options.fetchedAt,
        limits: options.limits,
        ...(options.signal ? { signal: options.signal } : {}),
      });
      if (nextDownload.kind === 'rejected') {
        if (nextDownload.lengthMismatch) lengthMismatches.push(nextDownload.lengthMismatch);
        // At most one new limit/range/full transaction, and never retry a body/HTTP failure.
        if (attempt === 0 && nextDownload.lengthMismatch && !options.signal?.aborted) continue;
        return rejection(nextDownload, options.fetchedAt, lengthMismatches);
      }
      probe = nextProbe;
      download = nextDownload;
      break;
    }
    let inspection: ArchiveInspectionResult;
    try {
      inspection = await dependencies.inspectArchive({
        adapter: new UnzipArchiveAdapter('unzip', options.limits),
        archivePath: download.archivePath,
        permissionManifest: contracts.permissionManifest,
        contract: contracts.archiveContract,
        limits: options.limits,
        ...(options.signal ? { signal: options.signal } : {}),
      });
    } catch {
      inspection = {
        kind: 'rejected',
        code: 'archive_corrupt',
        message: 'Archive inspection failed.',
      };
    }
    if (inspection.kind === 'rejected') {
      await dependencies.cleanupRejectedDownload(download.archivePath);
      return rejection(inspection, options.fetchedAt, lengthMismatches);
    }
    return {
      kind: 'accepted',
      change: options.previousAcceptedSha256 === download.sha256 ? 'unchanged' : 'changed',
      archivePath: download.archivePath,
      sha256: download.sha256,
      byteLength: download.byteLength,
      fetchedAt: options.fetchedAt,
      ...(lengthMismatches.length ? { lengthMismatches } : {}),
      sourceEvidence: probe.evidence,
      archiveEvidence: inspection.evidence,
    };
  };
}

const repositoryRoot = fileURLToPath(new URL('../../', import.meta.url));

const defaultDependencies: CollectorDependencies = {
  checkArchiveEnvironment: async (options) =>
    new UnzipArchiveAdapter('unzip', options.limits).checkEnvironment(options.signal),
  probeSource: probeSourceContract,
  downloadArchive: downloadArchiveToStaging,
  inspectArchive,
  cleanupRejectedDownload: async (archivePath) => rm(archivePath, { force: true }),
  loadContracts: async () => {
    const permissionValue: unknown = JSON.parse(
      await readFile(`${repositoryRoot}reports/source-permission-manifest-2026-08-28.json`, 'utf8'),
    );
    const archiveValue: unknown = JSON.parse(
      await readFile(`${repositoryRoot}src/pipeline/contracts/seoul-archive-contract.json`, 'utf8'),
    );
    return {
      permissionManifest: parsePermissionManifest(permissionValue),
      archiveContract: parseArchiveContract(archiveValue),
    };
  },
};

export const collectSeoulArchive = createSeoulCollector(defaultDependencies);
