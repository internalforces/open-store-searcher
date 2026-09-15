import { afterEach, expect, test, vi } from 'vitest';
import { readCompactResponse } from './load-compact-data.js';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

test('aborts a response body that stalls mid-transfer instead of hanging forever', async () => {
  vi.useFakeTimers();
  const fetchImpl = vi.fn(async (_url: string, init?: RequestInit) => {
    const requestSignal = init?.signal ?? undefined;
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array([1, 2, 3]));
        requestSignal?.addEventListener('abort', () => controller.error(new Error('aborted')), {
          once: true,
        });
      },
    });
    return new Response(body, { status: 200 });
  });
  vi.stubGlobal('fetch', fetchImpl);
  const caller = new AbortController();
  const promise = readCompactResponse('https://example.test/stalled', 1024, caller.signal);
  const assertion = expect(promise).rejects.toThrow();
  await vi.runAllTimersAsync();
  await assertion;
});
