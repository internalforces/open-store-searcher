import { describe, expect, test } from 'vitest';
import { streamProcessBytes } from './stream-process.js';

async function run(code: string, overrides = {}) {
  const chunks: Uint8Array[] = [];
  for await (const chunk of streamProcessBytes({
    executable: process.execPath,
    args: ['-e', code],
    maxBytes: 1024,
    timeoutMs: 5000,
    ...overrides,
  }))
    chunks.push(chunk);
  return Buffer.concat(chunks).toString();
}

describe('research process stream', () => {
  test('requires successful exit after complete stdout', async () => {
    expect(await run("process.stdout.write('complete')")).toBe('complete');
    await expect(run("process.stdout.write('partial');process.exitCode=2")).rejects.toThrow(
      'process_failed',
    );
  });
  test('accepts the byte ceiling and rejects overflow', async () => {
    expect(await run("process.stdout.write('abcd')", { maxBytes: 4 })).toBe('abcd');
    await expect(run("process.stdout.write('abcde')", { maxBytes: 4 })).rejects.toThrow(
      'process_bytes_exceeded',
    );
  });
  test('rejects a stalled child and waits for termination', async () => {
    await expect(run('setInterval(()=>{},1000)', { timeoutMs: 30 })).rejects.toThrow(
      'process_timeout',
    );
  });
  test('rejects stderr without exposing its text', async () => {
    await expect(run("process.stderr.write('private-row')")).rejects.toThrow(/^process_stderr$/);
  });
  test('rejects spawn failures and pre-aborted work', async () => {
    await expect(run('', { executable: '/nonexistent/oss-test-executable' })).rejects.toThrow(
      'process_failed',
    );
    await expect(run('', { signal: AbortSignal.abort() })).rejects.toThrow('process_aborted');
  });
  test('aborts a running child', async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 50);
    try {
      await expect(run('setInterval(()=>{},1000)', { signal: controller.signal })).rejects.toThrow(
        'process_aborted',
      );
    } finally {
      clearTimeout(timer);
    }
  });
  test('validates resource limits before spawning', async () => {
    await expect(run('', { maxBytes: 0 })).rejects.toThrow('invalid_process_limits');
    await expect(run('', { timeoutMs: Number.NaN })).rejects.toThrow('invalid_process_limits');
  });
  test('cancels a child when the consumer stops early', async () => {
    const stream = streamProcessBytes({
      executable: process.execPath,
      args: ['-e', "process.stdout.write('a');setInterval(()=>{},1000)"],
      maxBytes: 1024,
      timeoutMs: 5000,
    });
    for await (const chunk of stream) {
      expect(Buffer.from(chunk).toString()).toBe('a');
      break;
    }
  });
});
