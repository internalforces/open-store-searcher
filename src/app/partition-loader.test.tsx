import { act, fireEvent, render, screen, waitFor } from '@testing-library/preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from './app.js';
import { demoDataset } from './demo-data.js';
import { afterShellPaint, createPartitionLoader } from './partition-loader.js';
import { prepareDisplayData } from './prepare-display-data.js';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
const metadata = { ...demoDataset, records: undefined };
const ready = async () => {};
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('partitioned loading', () => {
  it('starts no part for a pre-aborted load or cancellation while waiting for paint', async () => {
    const paint = deferred<void>();
    const part = vi.fn(async () => []);
    const loader = createPartitionLoader({
      metadata,
      kind: 'synthetic',
      parts: [part],
      waitForPaint: () => paint.promise,
    });
    const before = new AbortController();
    before.abort();
    await expect(loader.load(before.signal)).rejects.toThrow();
    const during = new AbortController();
    const pending = loader.load(during.signal);
    during.abort();
    paint.resolve();
    await expect(pending).rejects.toThrow();
    expect(part).not.toHaveBeenCalled();
  });

  it.each(['unmount', 'replacement'])(
    'aborts obsolete parts and schedules no later batch on %s',
    async (change) => {
      const pending = deferred<unknown>();
      let startedSignal: AbortSignal | undefined;
      const later = vi.fn(async () => []);
      const loader = createPartitionLoader({
        metadata,
        kind: 'synthetic',
        waitForPaint: ready,
        parts: [
          (signal) => {
            startedSignal = signal;
            return pending.promise;
          },
          async () => [],
          later,
        ],
      });
      const view = render(<App loader={loader} />);
      await waitFor(() => expect(startedSignal).toBeDefined());
      if (change === 'unmount') view.unmount();
      else view.rerender(<App dataset={demoDataset} />);
      expect(startedSignal?.aborted).toBe(true);
      await act(async () => pending.resolve(demoDataset.records));
      expect(later).not.toHaveBeenCalled();
      if (change === 'replacement')
        expect(screen.getByText('예시 데이터 기준일: 2026-09-01')).toBeTruthy();
      else expect(screen.queryByRole('main')).toBeNull();
    },
  );

  it('accepts explicitly empty parts without inventing records', async () => {
    const loader = createPartitionLoader({
      metadata,
      kind: 'synthetic',
      waitForPaint: ready,
      parts: [async () => []],
    });
    expect(prepareDisplayData(await loader.load()).dataset.records).toEqual([]);
  });

  it('defers requests and assembles complete parts in fixed two-request batches', async () => {
    const paint = deferred<void>();
    const first = deferred<unknown>();
    const second = deferred<unknown>();
    const started: number[] = [];
    const loader = createPartitionLoader({
      metadata,
      kind: 'synthetic',
      waitForPaint: () => paint.promise,
      parts: [
        () => {
          started.push(0);
          return first.promise;
        },
        () => {
          started.push(1);
          return second.promise;
        },
        async () => {
          started.push(2);
          return demoDataset.records.slice(4);
        },
      ],
    });
    const loaded = loader.load();
    let complete = false;
    void loaded.then(() => {
      complete = true;
    });
    expect(started).toEqual([]);
    paint.resolve();
    await waitFor(() => expect(started).toEqual([0, 1]));
    second.resolve(demoDataset.records.slice(2, 4));
    await Promise.resolve();
    expect(started).toEqual([0, 1]);
    expect(complete).toBe(false);
    first.resolve(demoDataset.records.slice(0, 2));
    expect(await loaded).toEqual(demoDataset);
    expect(started).toEqual([0, 1, 2]);
  });

  it('aborts the batch on failure, starts no later part, and retries a complete snapshot', async () => {
    let fail = true;
    let secondSignal: AbortSignal | undefined;
    const third = vi.fn(async () => demoDataset.records.slice(4));
    const loader = createPartitionLoader({
      metadata,
      kind: 'synthetic',
      waitForPaint: ready,
      parts: [
        async () => {
          if (fail) throw new Error('unavailable');
          return demoDataset.records.slice(0, 2);
        },
        async (signal) => {
          secondSignal = signal;
          return demoDataset.records.slice(2, 4);
        },
        third,
      ],
    });
    await expect(loader.load()).rejects.toThrow('unavailable');
    expect(secondSignal?.aborted).toBe(true);
    expect(third).not.toHaveBeenCalled();
    fail = false;
    expect(await loader.load()).toEqual(demoDataset);
    expect(third).toHaveBeenCalledTimes(1);
  });

  it.each([null, { records: [] }])('rejects a malformed part %j', async (part) => {
    const loader = createPartitionLoader({
      metadata,
      kind: 'synthetic',
      waitForPaint: ready,
      parts: [async () => part],
    });
    await expect(loader.load()).rejects.toThrow();
  });

  it('rejects an absent part list rather than publishing an accidental empty snapshot', () => {
    expect(() => createPartitionLoader({ metadata, kind: 'synthetic', parts: [] })).toThrow();
  });

  it('keeps duplicate identity checks global across parts', async () => {
    const record = demoDataset.records[0];
    const loader = createPartitionLoader({
      metadata,
      kind: 'synthetic',
      waitForPaint: ready,
      parts: [async () => [record], async () => [record, demoDataset.records[2]]],
    });
    const prepared = prepareDisplayData(await loader.load());
    expect(prepared.dataset.records.map((row) => row.id)).toEqual(['demo-closed']);
    expect(prepared.index.diagnostics.duplicateIdRecordCount).toBe(2);
  });

  it('waits for two animation frames and cancels deferred work on abort', async () => {
    const callbacks = new Map<number, FrameRequestCallback>();
    let next = 0;
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callbacks.set(++next, callback);
      return next;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => callbacks.delete(id));
    const controller = new AbortController();
    let done = false;
    const painted = afterShellPaint(controller.signal).then(() => {
      done = true;
    });
    callbacks.get(1)?.(0);
    await Promise.resolve();
    expect(done).toBe(false);
    callbacks.get(2)?.(16);
    await painted;
    expect(done).toBe(true);
    const cancelled = afterShellPaint(controller.signal);
    controller.abort();
    await expect(cancelled).rejects.toThrow();
    expect(callbacks.has(3)).toBe(false);
  });

  it('never searches a partial snapshot and keeps previous results after a part fails', async () => {
    let fail = false;
    const later = deferred<unknown>();
    const loader = createPartitionLoader({
      metadata,
      kind: 'synthetic',
      waitForPaint: ready,
      parts: [
        async () => {
          if (fail) throw new Error('offline');
          return demoDataset.records.slice(0, 2);
        },
        () => later.promise,
      ],
    });
    render(<App loader={loader} />);
    fireEvent.input(screen.getByRole('searchbox'), { target: { value: demoDataset.exampleQuery } });
    fireEvent.submit(screen.getByRole('searchbox').closest('form') as HTMLFormElement);
    expect(screen.queryByRole('article')).toBeNull();
    expect(
      (screen.getByRole('button', { name: '검색', exact: true }) as HTMLButtonElement).disabled,
    ).toBe(true);
    await act(async () => later.resolve(demoDataset.records.slice(2)));
    await waitFor(() =>
      expect(
        (screen.getByRole('button', { name: '검색', exact: true }) as HTMLButtonElement).disabled,
      ).toBe(false),
    );
    fireEvent.submit(screen.getByRole('searchbox').closest('form') as HTMLFormElement);
    expect(screen.getAllByRole('article')).toHaveLength(2);
    fail = true;
    fireEvent.click(screen.getByRole('button', { name: '데이터 다시 불러오기' }));
    expect((await screen.findByRole('alert')).textContent).toContain('이전 데이터');
    expect(screen.getAllByRole('article')).toHaveLength(2);
  });
});
