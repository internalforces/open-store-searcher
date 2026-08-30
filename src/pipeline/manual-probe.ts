import { isAbsolute, resolve } from 'node:path';
import type { ArchiveContract } from './archive-contract.js';
import type { SourceEvidence } from './collector-types.js';
import type { SourceProbeResult } from './probe-source.js';
import type { StagedDownloadResult } from './staged-download.js';

export interface ManualProbeArguments {
  stagingRoot: string;
  outputPath: string;
  unzipExecutable: string;
}

function argument(args: string[], name: string): string | undefined {
  const prefix = `--${name}=`;
  const values = args.filter((value) => value.startsWith(prefix));
  if (values.length > 1) throw new Error(`duplicate manual probe option: --${name}`);
  return values[0]?.slice(prefix.length);
}

export function parseManualProbeArguments(args: string[]): ManualProbeArguments {
  const supportedPrefixes = ['--staging=', '--output=', '--unzip='];
  if (args.some((value) => !supportedPrefixes.some((prefix) => value.startsWith(prefix)))) {
    throw new Error('unsupported manual probe option');
  }
  const stagingRoot = argument(args, 'staging');
  const outputPath = argument(args, 'output');
  const unzipExecutable = argument(args, 'unzip') ?? 'unzip';
  if (
    !stagingRoot ||
    !outputPath ||
    !isAbsolute(stagingRoot) ||
    !isAbsolute(outputPath) ||
    resolve(stagingRoot) !== stagingRoot ||
    resolve(outputPath) !== outputPath
  ) {
    throw new Error('manual probe paths must be canonical absolute paths');
  }
  return { stagingRoot, outputPath, unzipExecutable };
}

export interface ManualProbeDependencies {
  checkEnvironment(): Promise<{ ok: boolean }>;
  probeSource(): Promise<SourceProbeResult>;
  downloadArchive(sourceEvidence: SourceEvidence): Promise<StagedDownloadResult>;
  discoverArchive(archivePath: string): Promise<ArchiveContract>;
  cleanupArchive(archivePath: string): Promise<void>;
}

export type ManualProbeResult =
  | {
      kind: 'accepted';
      contract: ArchiveContract;
      sha256: string;
      byteLength: number;
    }
  | Extract<SourceProbeResult | StagedDownloadResult, { kind: 'rejected' }>
  | {
      kind: 'rejected';
      code: 'environment_unavailable';
      message: string;
    };

export async function runManualProbe(
  dependencies: ManualProbeDependencies,
): Promise<ManualProbeResult> {
  let environment: { ok: boolean };
  try {
    environment = await dependencies.checkEnvironment();
  } catch {
    environment = { ok: false };
  }
  if (!environment.ok) {
    return {
      kind: 'rejected',
      code: 'environment_unavailable',
      message: 'Approved Info-ZIP environment is unavailable.',
    };
  }
  const probe = await dependencies.probeSource();
  if (probe.kind === 'rejected') return probe;
  const download = await dependencies.downloadArchive(probe.evidence);
  if (download.kind === 'rejected') return download;
  try {
    return {
      kind: 'accepted',
      contract: await dependencies.discoverArchive(download.archivePath),
      sha256: download.sha256,
      byteLength: download.byteLength,
    };
  } finally {
    await dependencies.cleanupArchive(download.archivePath);
  }
}
