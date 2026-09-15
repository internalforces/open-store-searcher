import { COMPACT_MAX_BYTES, requireCompact } from '../shared/compact-data.js';
import { loadCompactSnapshot, readCompactResponse } from '../shared/load-compact-data.js';
import { CompactSearch } from '../search/compact-search.js';
import type { WorkerReply, WorkerRequest } from './compact-worker-protocol.js';
const scope = self as unknown as {
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
  postMessage: (v: WorkerReply) => void;
};
let searchReady = false;
let store: CompactSearch | null = null,
  controller: AbortController | null = null,
  generation = -1,
  latest = -1;
scope.onmessage = (event) => {
  const message = event.data;
  if (
    message?.version !== 1 ||
    !Number.isSafeInteger(message.request) ||
    !Number.isSafeInteger(message.generation)
  )
    return;
  if (message.kind !== 'load' && (message.generation !== generation || message.request <= latest))
    return;
  if (message.kind === 'cancel') {
    controller?.abort();
    latest = message.request;
    return;
  }
  if (message.kind === 'page') {
    if (!store || !searchReady || message.generation !== generation) {
      scope.postMessage({
        version: 1,
        generation,
        request: message.request,
        kind: 'error',
        message: 'Search not ready',
      });
      return;
    }
    latest = message.request;
    try {
      scope.postMessage({
        version: 1,
        generation,
        request: latest,
        kind: 'page',
        result: store.page(message.page),
      });
    } catch {
      scope.postMessage({
        version: 1,
        generation,
        request: latest,
        kind: 'error',
        message: 'Unable to display page',
      });
    }
    return;
  }
  searchReady = false;
  controller?.abort();
  controller = new AbortController();
  const signal = controller.signal;
  latest = message.request;
  if (message.kind === 'load') generation = message.generation;
  const request = message.request;
  const reply = (v: WorkerReply) => {
    if (!signal.aborted && latest === request) scope.postMessage(v);
  };
  void (async () => {
    if (message.kind === 'load') {
      const started = performance.now();
      const url = new URL(message.url),
        match = /\/assets\/compact-manifest-([a-f0-9]{64})\.json$/.exec(url.pathname);
      requireCompact(
        match && !url.search && !url.hash && ['http:', 'https:'].includes(url.protocol),
      );
      const bytes = await readCompactResponse(url.href, COMPACT_MAX_BYTES, signal);
      const base = new URL('../', url);
      const snapshot = await loadCompactSnapshot(
        bytes,
        required(match[1]),
        (name, max) => readCompactResponse(new URL(name, base).href, max, signal),
        signal,
      );
      const loaded = performance.now();
      const candidate = new CompactSearch(
        snapshot.manifest,
        snapshot.blocks,
        snapshot.dictionaries,
      );
      await candidate.prepare(signal);
      signal.throwIfAborted();
      store = candidate;
      reply({
        version: 1,
        generation,
        request,
        kind: 'ready',
        metadata: snapshot.manifest.metadata,
        recordCount: snapshot.manifest.recordCount,
        manifestHash: required(match[1]),
        timings: { loadMs: loaded - started, prepareMs: performance.now() - loaded },
      });
    } else {
      requireCompact(store && message.generation === generation);
      await store.search(message.query, signal);
      signal.throwIfAborted();
      searchReady = true;
      reply({ version: 1, generation, request, kind: 'page', result: store.page(0) });
    }
  })().catch(() =>
    reply({
      version: 1,
      generation,
      request,
      kind: 'error',
      message: 'Unable to prepare or search complete data',
    }),
  );
};

function required<T>(value: T | null | undefined): T {
  if (value === undefined || value === null) throw new Error('Missing required compact value');
  return value;
}
