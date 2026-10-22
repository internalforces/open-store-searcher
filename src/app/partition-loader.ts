import type { DisplayDataset } from './display-data.js';
import type { DisplayLoader } from './use-display-data.js';

export interface PartitionOptions {
  metadata: Omit<DisplayDataset, 'records'>;
  kind: DisplayLoader['kind'];
  parts: readonly ((signal: AbortSignal) => Promise<unknown>)[];
  waitForPaint?: (signal: AbortSignal) => Promise<void>;
}

/** Deferred rendering opportunities; timer fallback does not certify physical paint. */
export function afterShellPaint(signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    signal.throwIfAborted();
    let settled = false;
    let frame: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const clearPhase = () => {
      if (frame !== undefined) cancelAnimationFrame(frame);
      if (timer !== undefined) clearTimeout(timer);
      frame = undefined;
      timer = undefined;
    };
    const cleanup = () => {
      clearPhase();
      signal.removeEventListener('abort', onAbort);
    };
    const onAbort = () => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(signal.reason);
    };
    const schedule = (remaining: number) => {
      let advanced = false;
      const advance = () => {
        if (settled || advanced) return;
        advanced = true;
        clearPhase();
        if (remaining > 1) schedule(remaining - 1);
        else {
          settled = true;
          cleanup();
          resolve();
        }
      };
      // Match the locked Preact effect scheduler's liveness fallback, not a paint deadline.
      timer = setTimeout(advance, 35);
      frame = requestAnimationFrame(advance);
    };
    signal.addEventListener('abort', onAbort, { once: true });
    schedule(2);
  });
}

/** Fixed, query-independent batches. Never expose a partially assembled snapshot. */
export function createPartitionLoader(options: PartitionOptions): DisplayLoader {
  if (!options.parts.length) throw new Error('At least one data part is required.');
  const parts = [...options.parts];
  return {
    sourceLabel: options.metadata.sourceLabel,
    sourceUrl: options.metadata.sourceUrl,
    kind: options.kind,
    async load(parentSignal) {
      const controller = new AbortController();
      const abort = () => controller.abort(parentSignal?.reason);
      if (parentSignal?.aborted) abort();
      parentSignal?.addEventListener('abort', abort, { once: true });
      const { signal } = controller;
      try {
        signal.throwIfAborted();
        await (options.waitForPaint ?? afterShellPaint)(signal);
        const records: unknown[] = [];
        for (let start = 0; start < parts.length; start += 2) {
          signal.throwIfAborted();
          const batch = await Promise.all(
            parts.slice(start, start + 2).map(async (load) => {
              signal.throwIfAborted();
              const rows = await load(signal);
              signal.throwIfAborted();
              if (!Array.isArray(rows)) throw new Error('Invalid data part.');
              return rows;
            }),
          );
          for (const rows of batch) for (const record of rows) records.push(record);
        }
        signal.throwIfAborted();
        return { ...options.metadata, records };
      } catch (error) {
        controller.abort();
        throw error;
      } finally {
        parentSignal?.removeEventListener('abort', abort);
      }
    },
  };
}
