import { spawn } from 'node:child_process';

export interface StreamProcessOptions {
  executable: string;
  args: string[];
  maxBytes: number;
  timeoutMs: number;
  signal?: AbortSignal;
}

/** Bounded process output; EOF is successful only after a zero exit and empty stderr. */
export async function* streamProcessBytes(
  options: StreamProcessOptions,
): AsyncGenerator<Uint8Array> {
  if (![options.maxBytes, options.timeoutMs].every((v) => Number.isSafeInteger(v) && v > 0))
    throw new Error('invalid_process_limits');
  if (options.signal?.aborted) throw new Error('process_aborted');
  const child = spawn(options.executable, options.args, {
    shell: false,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let failure: string | null = null;
  let finished = false;
  const stop = (code: string) => {
    failure ??= code;
    if (!finished) child.kill('SIGKILL');
  };
  const closed = new Promise<void>((resolve) => {
    child.on('error', () => stop('process_failed'));
    child.on('close', (code) => {
      finished = true;
      if (code !== 0) failure ??= 'process_failed';
      resolve();
    });
  });
  child.stderr.on('data', () => stop('process_stderr'));
  const timer = setTimeout(() => stop('process_timeout'), options.timeoutMs);
  const abort = () => stop('process_aborted');
  options.signal?.addEventListener('abort', abort, { once: true });
  if (options.signal?.aborted) abort();
  let byteLength = 0;
  try {
    for await (const chunk of child.stdout) {
      byteLength += chunk.byteLength;
      if (byteLength > options.maxBytes) stop('process_bytes_exceeded');
      if (failure) throw new Error(failure);
      yield chunk;
    }
    await closed;
    if (failure) throw new Error(failure);
  } catch {
    throw new Error(failure ?? 'process_failed');
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener('abort', abort);
    if (!finished) child.kill('SIGKILL');
    await closed;
  }
}
