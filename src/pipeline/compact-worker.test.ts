import { expect, test, vi } from 'vitest';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { writeCompactDataset } from './write-compact-dataset.js';
import type { WorkerReply, WorkerRequest } from '../app/compact-worker-protocol.js';

test('real Worker protocol accepts only complete data, cancels stale work and pages without fetches', async () => {
  const root = await mkdtemp(join(tmpdir(), 'worker-protocol-'));
  const messages: WorkerReply[] = [];
  const scope: {
    onmessage: ((event: { data: WorkerRequest }) => void) | null;
    postMessage: (reply: WorkerReply) => void;
  } = {
    onmessage: null,
    postMessage: (m) => {
      messages.push(m);
    },
  };
  try {
    const row = {
      id: 'a'.repeat(64),
      name: '테스트상점',
      roadAddress: '서울특별시 강남구 테헤란로 1',
      parcelAddress: '',
      categoryName: 'category',
      businessTypes: [],
      rawStatus: {
        operatingCode: '99',
        operatingName: 'unknown',
        detailedCode: null,
        detailedName: null,
      },
      processedStatus: '확인되지 않음',
      lifecycle: {
        licensedOn: null,
        licenseCancelledOn: null,
        suspendedFrom: null,
        suspendedThrough: null,
        reopenedOn: null,
        closedOn: null,
        sourceUpdatedAt: null,
        sourceLastModifiedAt: null,
      },
      sourceLabel: 'source',
      sourceUrl: null,
    };
    const output = await writeCompactDataset(
      {
        archiveSha256: 'b'.repeat(64),
        policyRevision: null,
        recordCount: 1,
        metadata: {
          sourceLabel: 'source',
          sourceUrl: null,
          coverage: { kind: 'collected', date: '2026-09-14' },
          exampleQuery: '',
        },
      },
      async function* () {
        yield row;
      },
      root,
    );
    let corrupt = false;
    const fetcher = vi.fn(async (url: string) => {
      const name = new URL(url).pathname.replace(/^\//, '');
      return new Response(
        corrupt && name === output.entries[1]?.name ? 'bad' : await readFile(join(root, name)),
      );
    });
    vi.stubGlobal('self', scope);
    vi.stubGlobal('fetch', fetcher);
    vi.resetModules();
    await import('../app/compact-search.worker.js');
    const send = (request: WorkerRequest) => scope.onmessage?.({ data: request });
    const base = { version: 1 as const, generation: 7 };
    send({
      ...base,
      request: 0,
      kind: 'load',
      url: `https://example.test/${output.manifestEntry.name}`,
    });
    await vi.waitFor(() => expect(messages.at(-1)?.kind).toBe('ready'));
    const loads = fetcher.mock.calls.length;
    send({ ...base, request: 1, kind: 'search', query: '테스트상점' });
    send({ ...base, request: 2, kind: 'cancel' });
    await new Promise((r) => setTimeout(r, 10));
    expect(messages.filter((m) => m.kind === 'page')).toHaveLength(0);
    send({ ...base, generation: 6, request: 999, kind: 'search', query: 'stale' });
    send({ ...base, request: 3, kind: 'search', query: '테스트상점' });
    await vi.waitFor(() =>
      expect(messages.at(-1)).toMatchObject({
        kind: 'page',
        request: 3,
        result: { similarCount: 1 },
      }),
    );
    send({ ...base, request: 4, kind: 'page', page: 0 });
    expect(messages.at(-1)).toMatchObject({
      kind: 'page',
      request: 4,
      result: { page: 0, similarCount: 1 },
    });
    expect(fetcher).toHaveBeenCalledTimes(loads);
    // A fresh candidate receiving corrupt evidence never emits ready or a partial result.
    corrupt = true;
    messages.length = 0;
    vi.resetModules();
    await import('../app/compact-search.worker.js');
    send({
      ...base,
      request: 0,
      kind: 'load',
      url: `https://example.test/${output.manifestEntry.name}`,
    });
    await vi.waitFor(() => expect(messages.at(-1)?.kind).toBe('error'));
    expect(messages.some((m) => m.kind === 'ready')).toBe(false);
  } finally {
    vi.unstubAllGlobals();
    vi.resetModules();
    await rm(root, { recursive: true, force: true });
  }
});
