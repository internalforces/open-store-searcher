import { spawn } from 'node:child_process';
import type { CollectorLimits } from './collector-types.js';
import type {
  ArchiveAdapter,
  ArchiveEntry,
  ProcessRequest,
  ProcessResult,
  ProcessRunner,
} from './archive-adapter.js';

function concat(chunks: Uint8Array[], length: number): Uint8Array {
  const result = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

export const runProcess: ProcessRunner = (request: ProcessRequest) =>
  new Promise<ProcessResult>((resolve, reject) => {
    if (request.signal?.aborted) {
      reject(new Error('archive process aborted'));
      return;
    }
    const child = spawn(request.executable, request.args, {
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const stdout: Uint8Array[] = [];
    const stderr: Uint8Array[] = [];
    let stdoutLength = 0;
    let stderrLength = 0;
    let truncated = false;
    let settled = false;
    const finishError = (error: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      request.signal?.removeEventListener('abort', abort);
      reject(error);
    };
    const abort = () => {
      child.kill('SIGKILL');
      finishError(new Error('archive process aborted'));
    };
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      finishError(new Error('archive process timed out'));
    }, request.timeoutMs);
    request.signal?.addEventListener('abort', abort, { once: true });
    child.on('error', finishError);
    child.stdout.on('data', (chunk: Buffer) => {
      if (settled) return;
      const remaining = request.maxOutputBytes - stdoutLength - stderrLength;
      if (remaining <= 0) return abort();
      const prefixLimit = request.truncateStdoutAt ?? Number.POSITIVE_INFINITY;
      const take = Math.min(chunk.length, remaining, Math.max(0, prefixLimit - stdoutLength));
      if (take > 0) {
        stdout.push(chunk.subarray(0, take));
        stdoutLength += take;
      }
      if (stdoutLength >= prefixLimit) {
        truncated = true;
        child.kill('SIGKILL');
      } else if (chunk.length > remaining) {
        abort();
      }
    });
    child.stderr.on('data', (chunk: Buffer) => {
      if (settled) return;
      if (stdoutLength + stderrLength + chunk.length > request.maxOutputBytes) return abort();
      stderr.push(chunk);
      stderrLength += chunk.length;
    });
    child.on('close', (exitCode) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      request.signal?.removeEventListener('abort', abort);
      resolve({
        exitCode,
        stdout: concat(stdout, stdoutLength),
        stderr: concat(stderr, stderrLength),
        truncated,
      });
    });
  });

function decode(bytes: Uint8Array): string {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    throw new Error('archive process output is not UTF-8');
  }
}

function assertSafeArguments(archivePath: string, entryName?: string): void {
  if (!archivePath.startsWith('/') || archivePath.includes('\0'))
    throw new Error('unsafe archive path');
  if (
    entryName !== undefined &&
    (!entryName || entryName.startsWith('-') || entryName.includes('\0'))
  ) {
    throw new Error('unsafe archive entry');
  }
}

export class UnzipArchiveAdapter implements ArchiveAdapter {
  readonly #executable: string;
  readonly #limits: CollectorLimits;
  readonly #runner: ProcessRunner;

  constructor(executable: string, limits: CollectorLimits, runner: ProcessRunner = runProcess) {
    this.#executable = executable;
    this.#limits = limits;
    this.#runner = runner;
  }

  async #run(args: string[], signal?: AbortSignal, truncateStdoutAt?: number) {
    const request: ProcessRequest = {
      executable: this.#executable,
      args,
      maxOutputBytes: this.#limits.maxProcessOutputBytes,
      timeoutMs: this.#limits.httpProbeTimeoutMs,
    };
    if (signal) request.signal = signal;
    if (truncateStdoutAt !== undefined) request.truncateStdoutAt = truncateStdoutAt;
    return this.#runner(request);
  }

  async checkEnvironment(signal?: AbortSignal): Promise<{ ok: boolean; version?: string }> {
    try {
      const result = await this.#run(['-v'], signal);
      if (result.exitCode !== 0) return { ok: false };
      return { ok: true, version: decode(result.stdout).split(/\r?\n/, 1)[0] ?? '' };
    } catch {
      return { ok: false };
    }
  }

  async testIntegrity(archivePath: string, signal?: AbortSignal): Promise<{ ok: boolean }> {
    assertSafeArguments(archivePath);
    try {
      const result = await this.#run(['-tqq', archivePath], signal);
      return { ok: result.exitCode === 0 };
    } catch {
      return { ok: false };
    }
  }

  async listEntries(archivePath: string, signal?: AbortSignal): Promise<ArchiveEntry[]> {
    assertSafeArguments(archivePath);
    const [namesResult, metadataResult] = await Promise.all([
      this.#run(['-Z1', archivePath], signal),
      this.#run(['-Z', '-T', archivePath], signal),
    ]);
    if (namesResult.exitCode !== 0 || metadataResult.exitCode !== 0) {
      throw new Error('archive inventory failed');
    }
    const names = decode(namesResult.stdout).split(/\r?\n/).filter(Boolean);
    const dates = new Map<string, string>();
    for (const line of decode(metadataResult.stdout).split(/\r?\n/)) {
      const match = /\s(\d{8})\.\d{6}\s+(.+)$/.exec(line);
      const value = match?.[1];
      const name = match?.[2];
      if (value && name) {
        dates.set(name, `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`);
      }
    }
    return names.map((name) => {
      const modifiedDate = dates.get(name);
      if (!modifiedDate) throw new Error('archive timestamp metadata is missing');
      return { name, modifiedDate };
    });
  }

  async readEntryPrefix(
    archivePath: string,
    entryName: string,
    maxBytes: number,
    signal?: AbortSignal,
  ): Promise<Uint8Array> {
    assertSafeArguments(archivePath, entryName);
    if (
      !Number.isSafeInteger(maxBytes) ||
      maxBytes <= 0 ||
      maxBytes > this.#limits.maxHeaderBytes
    ) {
      throw new Error('invalid archive prefix limit');
    }
    const result = await this.#run(['-p', archivePath, entryName], signal, maxBytes);
    if (result.exitCode !== 0 && !result.truncated) throw new Error('archive entry read failed');
    return result.stdout;
  }
}
