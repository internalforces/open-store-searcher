import { act, cleanup, renderHook, waitFor } from '@testing-library/preact';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { useCompactData } from './use-compact-data.js';
import type { WorkerRequest } from './compact-worker-protocol.js';
class FakeWorker {
  static instances: FakeWorker[] = [];
  onmessage: ((event: { data: unknown }) => void) | null = null;
  onerror: (() => void) | null = null;
  onmessageerror: (() => void) | null = null;
  messages: WorkerRequest[] = [];
  terminate = vi.fn();
  constructor() {
    FakeWorker.instances.push(this);
  }
  postMessage(message: WorkerRequest) {
    this.messages.push(message);
  }
  reply(value: Record<string, unknown>) {
    this.onmessage?.({
      data: {
        version: 1,
        generation: required(this.messages[0]).generation,
        request: required(this.messages.at(-1)).request,
        ...value,
      },
    });
  }
  ready() {
    this.reply({
      kind: 'ready',
      metadata: {
        sourceLabel: 'source',
        sourceUrl: null,
        exampleQuery: '',
        coverage: { kind: 'collected', date: '2026-09-14' },
      },
      recordCount: 10,
      manifestHash: 'a'.repeat(64),
    });
  }
}
const url = `https://example.test/assets/compact-manifest-${'a'.repeat(64)}.json`;
beforeEach(() => {
  FakeWorker.instances = [];
  vi.stubGlobal('Worker', FakeWorker);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
test('keeps the accepted snapshot searchable after candidate failure and retries atomically', async () => {
  const { result } = renderHook(() => useCompactData(url));
  await waitFor(() => expect(FakeWorker.instances).toHaveLength(1));
  const first = required(FakeWorker.instances[0]);
  act(() => first.ready());
  await waitFor(() => expect(result.current.searchAvailable).toBe(true));
  const snapshot = result.current.dataset;
  act(() => result.current.reload());
  await waitFor(() => expect(FakeWorker.instances).toHaveLength(2));
  act(() => required(FakeWorker.instances[1]).reply({ kind: 'error', message: 'corrupt block' }));
  await waitFor(() => expect(result.current.phase).toBe('error'));
  expect(result.current.dataset).toBe(snapshot);
  expect(result.current.searchAvailable).toBe(true);
  expect(first.terminate).not.toHaveBeenCalled();
  const pending = result.current.search('강남구');
  act(() => first.reply({ kind: 'page', result: { page: 0 } }));
  await expect(pending).resolves.toEqual({ page: 0 });
  act(() => result.current.reload());
  await waitFor(() => expect(FakeWorker.instances).toHaveLength(3));
  act(() => required(FakeWorker.instances[2]).ready());
  await waitFor(() => expect(result.current.phase).toBe('ready'));
  expect(first.terminate).toHaveBeenCalledOnce();
});
test('disables search on accepted Worker crash and recovers through a new Worker', async () => {
  const { result } = renderHook(() => useCompactData(url));
  await waitFor(() => expect(FakeWorker.instances).toHaveLength(1));
  const first = required(FakeWorker.instances[0]);
  act(() => first.ready());
  await waitFor(() => expect(result.current.searchAvailable).toBe(true));
  const snapshot = result.current.dataset;
  act(() => first.onerror?.());
  await waitFor(() => expect(result.current.searchAvailable).toBe(false));
  expect(result.current.dataset).toBe(snapshot);
  await expect(result.current.search('query')).rejects.toThrow('unavailable');
  act(() => result.current.reload());
  await waitFor(() => expect(FakeWorker.instances).toHaveLength(2));
  act(() => required(FakeWorker.instances[1]).ready());
  await waitFor(() => expect(result.current.searchAvailable).toBe(true));
});
test('rejects superseded queries and ignores stale query and dataset responses; paging only messages the Worker', async () => {
  const { result, rerender, unmount } = renderHook(({ source }) => useCompactData(source), {
    initialProps: { source: url },
  });
  await waitFor(() => expect(FakeWorker.instances).toHaveLength(1));
  const first = required(FakeWorker.instances[0]);
  act(() => first.ready());
  await waitFor(() => expect(result.current.searchAvailable).toBe(true));
  const old = result.current.search('old');
  const oldError = expect(old).rejects.toThrow('Obsolete');
  const request = required(first.messages.at(-1)).request;
  const current = result.current.search('new');
  await oldError;
  let resolved = false;
  void current.then(() => {
    resolved = true;
  });
  act(() => first.reply({ kind: 'page', request, result: { page: 99 } }));
  await Promise.resolve();
  expect(resolved).toBe(false);
  act(() => first.reply({ kind: 'page', result: { page: 0 } }));
  await expect(current).resolves.toEqual({ page: 0 });
  const page = result.current.page(2);
  expect(first.messages.at(-1)).toMatchObject({ kind: 'page', page: 2 });
  act(() => first.reply({ kind: 'page', result: { page: 2 } }));
  await expect(page).resolves.toEqual({ page: 2 });
  rerender({ source: url.replaceAll('a'.repeat(64), 'b'.repeat(64)) });
  await waitFor(() => expect(FakeWorker.instances).toHaveLength(2));
  act(() => first.ready());
  expect(result.current.searchAvailable).toBe(true);
  act(() => required(FakeWorker.instances[1]).ready());
  await waitFor(() => expect(result.current.searchAvailable).toBe(true));
  unmount();
  expect(required(FakeWorker.instances[1]).terminate).toHaveBeenCalled();
});

test('preserves old data when a different manifest fails and releases it on leaving compact mode', async () => {
  const { result, rerender } = renderHook(
    ({ source }: { source: string | null }) => useCompactData(source),
    { initialProps: { source: url as string | null } },
  );
  await waitFor(() => expect(FakeWorker.instances).toHaveLength(1));
  const first = FakeWorker.instances[0] as FakeWorker;
  act(() => first.ready());
  await waitFor(() => expect(result.current.searchAvailable).toBe(true));
  const previous = result.current.dataset;
  rerender({ source: url.replaceAll('a'.repeat(64), 'b'.repeat(64)) });
  await waitFor(() => expect(FakeWorker.instances).toHaveLength(2));
  act(() =>
    (FakeWorker.instances[1] as FakeWorker).reply({ kind: 'error', message: 'missing block' }),
  );
  await waitFor(() => expect(result.current.phase).toBe('error'));
  expect(result.current.dataset).toBe(previous);
  expect(result.current.searchAvailable).toBe(true);
  expect(first.terminate).not.toHaveBeenCalled();
  rerender({ source: null });
  await waitFor(() => expect(first.terminate).toHaveBeenCalledOnce());
  rerender({ source: url });
  await waitFor(() => expect(FakeWorker.instances).toHaveLength(3));
  expect(result.current.dataset).toBeNull();
  expect(result.current.searchAvailable).toBe(false);
});

function required<T>(value: T | null | undefined): T {
  if (value === undefined || value === null) throw new Error('Missing required compact value');
  return value;
}
