export interface ArchiveEntry {
  name: string;
  modifiedDate: string;
}

export interface ArchiveAdapter {
  checkEnvironment(signal?: AbortSignal): Promise<{ ok: boolean; version?: string }>;
  testIntegrity(archivePath: string, signal?: AbortSignal): Promise<{ ok: boolean }>;
  listEntries(archivePath: string, signal?: AbortSignal): Promise<ArchiveEntry[]>;
  readEntryPrefix(
    archivePath: string,
    entryName: string,
    maxBytes: number,
    signal?: AbortSignal,
  ): Promise<Uint8Array>;
}

export interface ProcessRequest {
  executable: string;
  args: string[];
  maxOutputBytes: number;
  timeoutMs: number;
  signal?: AbortSignal;
  truncateStdoutAt?: number;
}

export interface ProcessResult {
  exitCode: number | null;
  stdout: Uint8Array;
  stderr: Uint8Array;
  truncated: boolean;
}

export type ProcessRunner = (request: ProcessRequest) => Promise<ProcessResult>;
