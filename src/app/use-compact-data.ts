import { useEffect, useRef, useState } from 'preact/hooks';
import type { DisplayDataset } from './display-data.js';
import type { CompactPage, WorkerReply, WorkerRequest } from './compact-worker-protocol.js';
interface Handle {
  worker: Worker;
  generation: number;
  url: string;
  request: number;
  pending: Map<number, { resolve: (v: CompactPage) => void; reject: (e: Error) => void }>;
}
interface State {
  source: string | null;
  phase: 'loading' | 'ready' | 'error';
  dataset: DisplayDataset | null;
  loadedAt: string | null;
  searchAvailable: boolean;
}
const stop = (h: Handle | null) => {
  if (!h) return;
  h.worker.terminate();
  for (const p of h.pending.values()) p.reject(new Error('Obsolete search'));
  h.pending.clear();
};
/** One accepted Worker and at most one candidate. A failed candidate never terminates accepted data. */
export function useCompactData(url: string | null) {
  const [state, setState] = useState<State>({
    source: url,
    phase: 'loading',
    dataset: null,
    loadedAt: null,
    searchAvailable: false,
  });
  const [attempt, setAttempt] = useState(0);
  const accepted = useRef<Handle | null>(null),
    candidate = useRef<Handle | null>(null),
    generation = useRef(0),
    busy = useRef(false);

  useEffect(
    () => () => {
      stop(accepted.current);
      stop(candidate.current);
    },
    [],
  );
  // biome-ignore lint/correctness/useExhaustiveDependencies: attempt deliberately starts an explicit retry.
  useEffect(() => {
    if (!url) {
      stop(accepted.current);
      accepted.current = null;
      setState({
        source: null,
        phase: 'loading',
        dataset: null,
        loadedAt: null,
        searchAvailable: false,
      });
      return;
    }
    busy.current = true;
    setState((s) => ({ ...s, source: url, phase: 'loading' }));
    let h: Handle;
    try {
      h = {
        worker: new Worker(new URL('./compact-search.worker.ts', import.meta.url), {
          type: 'module',
        }),
        generation: ++generation.current,
        url,
        request: 0,
        pending: new Map(),
      };
    } catch {
      busy.current = false;
      setState((s) => ({ ...s, phase: 'error' }));
      return;
    }
    candidate.current = h;
    const fail = () => {
      if (candidate.current === h) {
        candidate.current = null;
        stop(h);
        busy.current = false;
        setState((s) => ({ ...s, phase: 'error' }));
      } else if (accepted.current === h) {
        stop(h);
        accepted.current = null;
        setState((s) => ({ ...s, phase: 'error', searchAvailable: false }));
      }
    };
    h.worker.onerror = fail;
    h.worker.onmessageerror = fail;
    h.worker.onmessage = (event: MessageEvent<WorkerReply>) => {
      const m = event.data;
      if (m?.version !== 1 || m.generation !== h.generation) return;
      if (m.kind === 'ready' && candidate.current === h) {
        stop(accepted.current);
        accepted.current = h;
        candidate.current = null;
        busy.current = false;
        setState({
          source: url,
          phase: 'ready',
          dataset: { ...m.metadata, records: [] },
          loadedAt: new Date().toISOString(),
          searchAvailable: true,
        });
      } else if (m.kind === 'error') {
        if (candidate.current === h) fail();
        else {
          h.pending.get(m.request)?.reject(new Error(m.message));
          h.pending.delete(m.request);
        }
      } else if (m.kind === 'page' && accepted.current === h) {
        if (m.request === h.request) h.pending.get(m.request)?.resolve(m.result);
        else h.pending.get(m.request)?.reject(new Error('Obsolete page'));
        h.pending.delete(m.request);
      }
    };
    try {
      h.worker.postMessage({
        version: 1,
        generation: h.generation,
        request: 0,
        kind: 'load',
        url,
      } satisfies WorkerRequest);
    } catch {
      fail();
    }
    return () => {
      if (candidate.current === h) {
        candidate.current = null;
        stop(h);
        busy.current = false;
      }
    };
  }, [url, attempt]);
  const query = (request: { kind: 'search'; query: string } | { kind: 'page'; page: number }) => {
    const h = accepted.current;
    if (!h) return Promise.reject(new Error('Search unavailable'));
    for (const p of h.pending.values()) p.reject(new Error('Obsolete request'));
    h.pending.clear();
    const id = ++h.request;
    return new Promise<CompactPage>((resolve, reject) => {
      h.pending.set(id, { resolve, reject });
      try {
        h.worker.postMessage({
          version: 1,
          generation: h.generation,
          request: id,
          ...request,
        } satisfies WorkerRequest);
      } catch {
        h.pending.delete(id);
        reject(new Error('Unable to contact search Worker'));
      }
    });
  };
  return {
    ...state,
    reload: () => {
      if (!busy.current) setAttempt((x) => x + 1);
    },
    search: (queryText: string) => query({ kind: 'search', query: queryText }),
    page: (page: number) => query({ kind: 'page', page }),
  };
}
