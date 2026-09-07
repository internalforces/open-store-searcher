import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { DisplayDataset } from './display-data.js';
import { prepareDisplayData } from './prepare-display-data.js';

/** Injected internal loader. It never accepts a search term or defines a public data URL. */
export interface DisplayLoader {
  readonly sourceLabel: string;
  readonly sourceUrl: string | null;
  readonly kind: 'synthetic' | 'source';
  readonly load: () => Promise<unknown>;
}
interface Snapshot {
  source: DisplayDataset | DisplayLoader;
  prepared: ReturnType<typeof prepareDisplayData> | null;
  phase: 'loading' | 'ready' | 'error';
  loadedAt: string | null;
}

export function useDisplayData(source: DisplayDataset | DisplayLoader) {
  const initial = useMemo<Snapshot>(() => {
    if ('load' in source) return { source, prepared: null, phase: 'loading', loadedAt: null };
    try {
      return { source, prepared: prepareDisplayData(source), phase: 'ready', loadedAt: null };
    } catch {
      return { source, prepared: null, phase: 'error', loadedAt: null };
    }
  }, [source]);
  const [snapshot, setSnapshot] = useState(initial);
  const [attempt, setAttempt] = useState(0);
  const busy = useRef(false);
  const current = snapshot.source === source ? snapshot : initial;
  // biome-ignore lint/correctness/useExhaustiveDependencies: attempt intentionally starts a new explicit retry.
  useEffect(() => {
    if (!('load' in source)) {
      setSnapshot(initial);
      return;
    }
    let cancelled = false;
    busy.current = true;
    setSnapshot((previous) => ({
      ...(previous.source === source ? previous : initial),
      phase: 'loading',
    }));
    void Promise.resolve()
      .then(() => source.load())
      .then((value) => {
        if (cancelled) return;
        const prepared = prepareDisplayData(value);
        if (!cancelled)
          setSnapshot({ source, prepared, phase: 'ready', loadedAt: new Date().toISOString() });
      })
      .catch(() => {
        if (!cancelled) setSnapshot((previous) => ({ ...previous, phase: 'error' }));
      })
      .finally(() => {
        if (!cancelled) busy.current = false;
      });
    return () => {
      cancelled = true;
      busy.current = false;
    };
  }, [source, initial, attempt]);
  return {
    ...current,
    reload: () => {
      if (!('load' in source) || busy.current) return;
      busy.current = true;
      setSnapshot((previous) => ({ ...previous, phase: 'loading' }));
      setAttempt((previous) => previous + 1);
    },
  };
}
