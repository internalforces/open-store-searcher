import { mkdtemp, readFile, readdir, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { DEFAULT_COLLECTOR_LIMITS } from './collector-types.js';
import { SOURCE_ARCHIVE_URL } from './source-contract.js';
import { downloadArchiveToStaging } from './staged-download.js';

const roots: string[] = [];
async function stagingRoot() {
  const root = await mkdtemp(join(tmpdir(), 'open-store-collector-'));
  roots.push(root);
  return root;
}
afterEach(async () => {
  vi.useRealTimers();
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true })));
});

function options(root: string, response: Response, expectedBytes = 4) {
  return {
    fetchImpl: async () => response,
    repositoryRoot: process.cwd(),
    stagingRoot: root,
    sourceEvidence: {
      expectedBytes,
      finalUrl: SOURCE_ARCHIVE_URL,
      providerFreshness: {
        updateCadence: 'daily' as const,
        coverageLagDays: 2 as const,
        sourceUrl: 'https://www.data.go.kr/data/15045016/fileData.do',
      },
    },
    fetchedAt: '2026-08-28T00:00:00.000Z',
    limits: { ...DEFAULT_COLLECTOR_LIMITS, minArchiveBytes: 4 },
  };
}

describe('downloadArchiveToStaging', () => {
  test('publishes a complete staged ZIP only after streamed hashing', async () => {
    const root = await stagingRoot();
    const bytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);
    const result = await downloadArchiveToStaging(
      options(
        root,
        new Response(bytes, {
          status: 200,
          headers: { 'content-length': String(bytes.length) },
        }),
      ),
    );
    expect(result).toMatchObject({
      kind: 'accepted',
      byteLength: 4,
      sha256: '8dcc7e601606217f3b754766511182a916b17e9a26a94c9d887104eba92e9bb2',
    });
    if (result.kind === 'accepted')
      expect(await readFile(result.archivePath)).toEqual(Buffer.from(bytes));
    expect((await readdir(root)).some((name) => name.endsWith('.part'))).toBe(false);
  });

  test('normalizes the supplied repository root before enforcing the staging boundary', async () => {
    const root = await stagingRoot();
    const bytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);
    const result = await downloadArchiveToStaging({
      ...options(root, new Response(bytes, { status: 200 })),
      repositoryRoot: `${process.cwd()}/`,
    });

    expect(result).toMatchObject({ kind: 'accepted', byteLength: 4 });
  });

  test.each([
    [new Response(new Uint8Array([1, 2, 3, 4]), { status: 200 }), 4, 'transfer_incomplete'],
    [
      new Response(new Uint8Array([0x50, 0x4b, 3, 4]), {
        status: 200,
        headers: { 'content-length': '5' },
      }),
      4,
      'transfer_incomplete',
    ],
    [new Response(new Uint8Array([0x50, 0x4b, 3, 4]), { status: 200 }), 5, 'transfer_incomplete'],
  ])('rejects incomplete or non-ZIP transfers', async (response, expectedBytes, code) => {
    const root = await stagingRoot();
    await expect(
      downloadArchiveToStaging(options(root, response, expectedBytes)),
    ).resolves.toMatchObject({
      kind: 'rejected',
      code,
    });
    expect(await readdir(root)).toEqual([]);
  });

  test('cleans up when the response body fails', async () => {
    const root = await stagingRoot();
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array([0x50, 0x4b]));
        controller.error(new Error('broken stream'));
      },
    });
    const result = await downloadArchiveToStaging(options(root, new Response(body), 4));
    expect(result).toMatchObject({ kind: 'rejected', code: 'transfer_incomplete' });
    expect(await readdir(root)).toEqual([]);
  });

  test('aborts and cleans up a transfer after the configured inactivity timeout', async () => {
    vi.useFakeTimers();
    const root = await stagingRoot();
    const caller = new AbortController();
    let requestSignal: AbortSignal | undefined;
    let markFetchStarted: (() => void) | undefined;
    const fetchStarted = new Promise<void>((resolve) => {
      markFetchStarted = resolve;
    });
    let markBodyRead: (() => void) | undefined;
    const bodyRead = new Promise<void>((resolve) => {
      markBodyRead = resolve;
    });
    const resultPromise = downloadArchiveToStaging({
      ...options(root, new Response(null), 4),
      fetchImpl: async (_input, init) => {
        requestSignal = init?.signal ?? undefined;
        markFetchStarted?.();
        let sentPrefix = false;
        const body = new ReadableStream<Uint8Array>({
          start(controller) {
            requestSignal?.addEventListener('abort', () => controller.error(new Error('aborted')), {
              once: true,
            });
          },
          pull(controller) {
            if (sentPrefix) return;
            sentPrefix = true;
            controller.enqueue(new Uint8Array([0x50, 0x4b]));
            markBodyRead?.();
          },
        });
        return new Response(body, { status: 200 });
      },
      limits: {
        ...DEFAULT_COLLECTOR_LIMITS,
        minArchiveBytes: 4,
        downloadInactivityTimeoutMs: 10,
        downloadDeadlineMs: 1_000,
      },
      signal: caller.signal,
    });

    await fetchStarted;
    await bodyRead;
    let stagedBytes = 0;
    for (let attempts = 0; attempts < 20 && stagedBytes !== 2; attempts += 1) {
      const partName = (await readdir(root)).find((name) => name.endsWith('.part'));
      if (partName) stagedBytes = (await stat(join(root, partName))).size;
    }
    expect(stagedBytes).toBe(2);
    await vi.advanceTimersByTimeAsync(11);
    const inactivityTriggered = requestSignal?.aborted ?? false;
    if (!inactivityTriggered) caller.abort();
    const result = await resultPromise;

    expect(inactivityTriggered).toBe(true);
    expect(result).toMatchObject({ kind: 'rejected', code: 'transfer_incomplete' });
    expect(await readdir(root)).toEqual([]);
  });

  test('rejects unsafe staging roots and non-canonical UTC evidence', async () => {
    const response = new Response(new Uint8Array([0x50, 0x4b, 3, 4]), { status: 200 });
    await expect(
      downloadArchiveToStaging({
        ...options(process.cwd(), response),
        fetchedAt: '2026-08-28 00:00:00',
      }),
    ).resolves.toMatchObject({ kind: 'rejected', code: 'transfer_incomplete' });
  });

  test('rejects staging inside the repository root supplied by the collector', async () => {
    const repositoryRoot = await mkdtemp(join(tmpdir(), 'open-store-repository-'));
    roots.push(repositoryRoot);
    const root = await mkdtemp(join(repositoryRoot, 'staging-'));
    const bytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);

    await expect(
      downloadArchiveToStaging({
        ...options(root, new Response(bytes, { status: 200 })),
        repositoryRoot,
      }),
    ).resolves.toMatchObject({ kind: 'rejected', code: 'transfer_incomplete' });
    expect(await readdir(root)).toEqual([]);
  });
});
