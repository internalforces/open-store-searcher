import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createRecoveryFixture } from '../../tests/fixtures/publication-recovery.js';
import { verifyPublicationDirectory } from './verify-publication-directory.js';
import { readDeployedBaseline } from './read-deployed-baseline.js';
import { reconcilePublication, readRecoveryPrecondition } from './reconcile-publication.js';
import {
  inventoryBytes,
  sha256Bytes,
  type RecoveryApprovalV1,
  type VerifiedPublicationV1,
} from './recovery-types.js';

beforeEach(() => {
  vi.stubGlobal('fetch', () => {
    throw new Error('Real network is forbidden in recovery tests');
  });
});
afterEach(() => {
  vi.unstubAllGlobals();
});
const siteUrl = 'https://internalforces.github.io/open-store-searcher/';
const cleanups: (() => Promise<void>)[] = [];
afterEach(async () => {
  vi.useRealTimers();
  await Promise.all(cleanups.splice(0).map((fn) => fn()));
});
function approvalFor(verified: VerifiedPublicationV1): RecoveryApprovalV1 {
  const { inventory, inventorySha256, ...identity } = verified;
  const binding = { byteLength: 32, sha256: 'a'.repeat(64) };
  const receipt = {
    version: 1 as const,
    kind: 'public-bytes-verified' as const,
    siteUrl,
    checkedAt: '2026-10-18T00:00:00.000Z',
    inventorySha256,
    releaseSha256: identity.releaseSha256,
  };
  const inventoryBinding = {
    byteLength: inventoryBytes(inventory).length,
    sha256: inventorySha256,
  };
  // Synthetic IDs are never evidence of actual hosted success.
  return {
    id: 'synthetic-backup',
    repository: 'internalforces/open-store-searcher',
    siteUrl,
    releaseId: 11,
    tag: 'fixture-tag',
    assets: {
      snapshot: { id: 12, name: 'snapshot.tar.gz', ...binding },
      inventory: { id: 13, name: 'inventory.json', ...inventoryBinding },
      provenance: { id: 14, name: 'provenance.json', ...binding },
    },
    expectedProvenance: {
      version: 1,
      kind: 'verified-publication-backup',
      repository: 'internalforces/open-store-searcher',
      siteUrl,
      sourceCommit: 'c'.repeat(40),
      workflowCommit: 'd'.repeat(40),
      workflowPath: '.github/workflows/refresh.yml',
      runId: 15,
      artifactId: 16,
      deploymentId: 'synthetic-deployment',
      deploymentOutcome: 'success',
      verifiedAt: receipt.checkedAt,
      identity,
      inventory: inventoryBinding,
      tar: binding,
      gzip: binding,
      publicVerification: {
        receipt,
        binding: {
          byteLength: Buffer.byteLength(`${JSON.stringify(receipt)}\n`),
          sha256: sha256Bytes(Buffer.from(`${JSON.stringify(receipt)}\n`)),
        },
      },
    },
  };
}
async function fixture() {
  const f = await createRecoveryFixture();
  cleanups.push(f.cleanup);
  const expected = await verifyPublicationDirectory(f.siteDir);
  const files = new Map(
    await Promise.all(
      expected.inventory.files.map(
        async (entry) =>
          [new URL(entry.name, siteUrl).href, await readFile(join(f.siteDir, entry.name))] as const,
      ),
    ),
  );
  const requests: { url: string; init: RequestInit | undefined }[] = [];
  let releaseReads = 0,
    active = 0,
    peak = 0;
  const options = { changeDescriptor: false, latency: false };
  const fetcher = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    requests.push({ url, init });
    active++;
    peak = Math.max(peak, active);
    try {
      if (options.latency) await new Promise((resolve) => setTimeout(resolve, 1));
      const bytes = files.get(url);
      if (url.endsWith('/release.json') && ++releaseReads >= 2 && options.changeDescriptor)
        return new Response('{}');
      return bytes ? new Response(bytes) : new Response(null, { status: 404 });
    } finally {
      active--;
    }
  }) as unknown as typeof fetch;
  return {
    ...f,
    expected,
    approval: approvalFor(expected),
    files,
    requests,
    fetcher,
    options,
    peak: () => peak,
  };
}
describe('reconcilePublication', () => {
  it('verifies every expected app/data/baseline byte with at most four exact subpath requests and a bound receipt', async () => {
    const f = await fixture();
    f.options.latency = true;
    const result = await reconcilePublication(siteUrl, f.expected, f.fetcher);
    expect(result).toEqual({
      kind: 'verified',
      receipt: {
        version: 1,
        kind: 'public-bytes-verified',
        siteUrl,
        checkedAt: expect.stringMatching(/^\d{4}-\d\d-\d\dT.*Z$/),
        inventorySha256: f.expected.inventorySha256,
        releaseSha256: f.expected.releaseSha256,
      },
    });
    expect(Object.keys(result)).toEqual(['kind', 'receipt']);
    expect(f.peak()).toBeLessThanOrEqual(4);
    expect(f.peak()).toBeGreaterThan(1);
    expect(f.requests).toHaveLength(f.expected.inventory.files.length + 1);
    expect(f.requests.filter((r) => r.url.endsWith('/release.json'))).toHaveLength(2);
    for (const entry of f.expected.inventory.files)
      expect(f.requests.map((r) => r.url)).toContain(new URL(entry.name, siteUrl).href);
    for (const request of f.requests)
      expect(request.init).toMatchObject({
        redirect: 'error',
        credentials: 'omit',
        cache: 'no-store',
        referrerPolicy: 'no-referrer',
      });
    await expect(access(join(f.root, 'executed'))).rejects.toThrow();
  });
  it('accepts compressed HTTP wire lengths only when decoded public bytes exactly match', async () => {
    const f = await fixture();
    const fetcher = (async (input: string | URL | Request, init?: RequestInit) => {
      const response = await f.fetcher(input, init);
      const bytes = new Uint8Array(await response.arrayBuffer());
      return new Response(bytes, {
        headers: { 'content-encoding': 'gzip', 'content-length': String(bytes.length + 500) },
      });
    }) as typeof fetch;
    expect((await reconcilePublication(siteUrl, f.expected, fetcher)).kind).toBe('verified');
    f.files.set(`${siteUrl}assets/app.js`, Buffer.from('wrong decoded app'));
    expect((await reconcilePublication(siteUrl, f.expected, fetcher)).kind).toBe('unverified');
  });
  it.each([
    'app',
    'worker',
    'data',
    'baseline',
    'missing',
    'descriptor replacement',
    'timeout',
    'redirect',
    'oversized',
  ])('reports unverified for %s without a deployment or preservation claim', async (reason) => {
    const f = await fixture();
    let fetcher = f.fetcher;
    const name =
      reason === 'worker'
        ? 'assets/worker.js'
        : reason === 'data'
          ? required(
              f.expected.inventory.files.find(
                (e) => e.name.startsWith('assets/compact-') && !e.name.includes('manifest'),
              ),
            ).name
          : reason === 'baseline'
            ? 'baseline.json'
            : 'assets/app.js';
    if (['app', 'worker', 'data', 'baseline'].includes(reason))
      f.files.set(new URL(name, siteUrl).href, Buffer.from('wrong bytes'));
    if (reason === 'missing') f.files.delete(new URL(name, siteUrl).href);
    if (reason === 'descriptor replacement') f.options.changeDescriptor = true;
    if (reason === 'timeout')
      fetcher = vi.fn(async () => {
        throw new DOMException('timeout', 'TimeoutError');
      }) as unknown as typeof fetch;
    if (reason === 'redirect')
      fetcher = vi.fn(
        async () =>
          new Response(null, { status: 302, headers: { location: 'https://other.example/' } }),
      ) as unknown as typeof fetch;
    if (reason === 'oversized')
      fetcher = vi.fn(
        async () =>
          new Response(Buffer.alloc(8 * 1024 * 1024 + 1), { headers: { 'content-length': '1' } }),
      ) as unknown as typeof fetch;
    expect(await reconcilePublication(siteUrl, f.expected, fetcher)).toEqual({
      kind: 'unverified',
      reason: expect.any(String),
    });
  });
  it('rejects stale expected inventory, identity bindings and unsafe site/path contracts before network', async () => {
    const f = await fixture();
    for (const expected of [
      { ...f.expected, inventorySha256: '0'.repeat(64) },
      { ...f.expected, baselineSha256: '0'.repeat(64) },
      {
        ...f.expected,
        inventory: {
          ...f.expected.inventory,
          files: f.expected.inventory.files.map((e) => ({ ...e, name: `../${e.name}` })),
        },
      },
    ])
      expect((await reconcilePublication(siteUrl, expected, f.fetcher)).kind).toBe('unverified');
    for (const site of [
      'http://internalforces.github.io/open-store-searcher/',
      'https://internalforces.github.io/open-store-searcher/?q=1',
      'https://internalforces.github.io/other/',
    ])
      expect((await reconcilePublication(site, f.expected, f.fetcher)).kind).toBe('unverified');
    expect(f.requests).toEqual([]);
  });
});
describe('readRecoveryPrecondition', () => {
  it('accepts the exact active snapshot only after stable manifest/baseline/date/policy binding', async () => {
    const f = await fixture();
    expect(await readRecoveryPrecondition(siteUrl, f.approval, f.fetcher)).toEqual({
      kind: 'same-snapshot',
      status: 200,
      releaseSha256: f.expected.releaseSha256,
    });
    expect(f.requests.filter((r) => r.url.endsWith('/release.json'))).toHaveLength(2);
    expect(f.requests.map((r) => r.url)).toContain(`${siteUrl}baseline.json`);
  });
  it('records confirmed descriptor absence and bounded corrupt bytes explicitly', async () => {
    for (const mode of ['absent', 'malformed', 'stale baseline', 'missing baseline']) {
      const f = await fixture();
      const releaseUrl = `${siteUrl}release.json`;
      if (mode === 'absent') f.files.delete(releaseUrl);
      if (mode === 'malformed') f.files.set(releaseUrl, Buffer.from('{broken'));
      if (mode === 'stale baseline') f.files.set(`${siteUrl}baseline.json`, Buffer.from('{}'));
      if (mode === 'missing baseline') f.files.delete(`${siteUrl}baseline.json`);
      const result = await readRecoveryPrecondition(siteUrl, f.approval, f.fetcher);
      expect(result).toEqual({
        kind: mode === 'absent' ? 'absent' : 'corrupt',
        status: mode === 'absent' ? 404 : 200,
        releaseSha256:
          mode === 'absent'
            ? null
            : mode === 'malformed'
              ? sha256Bytes(Buffer.from('{broken'))
              : f.expected.releaseSha256,
      });
    }
  });
  it('blocks a coherent different snapshot even when the backup was previously approved', async () => {
    const f = await fixture(),
      url = `${siteUrl}release.json`;
    const release = JSON.parse(required(f.files.get(url)).toString());
    f.files.set(url, Buffer.from(`${JSON.stringify(release)}\n `));
    await expect(readRecoveryPrecondition(siteUrl, f.approval, f.fetcher)).rejects.toThrow(
      'different',
    );
  });
  it.each(['coherent', 'partially corrupt', 'malformed JSON'])(
    'blocks exposed later collection time in a %s descriptor before any rollback',
    async (mode) => {
      const f = await fixture(),
        url = `${siteUrl}release.json`;
      const release = JSON.parse(required(f.files.get(url)).toString());
      release.collectedAt = '2026-10-19T00:00:00.000Z';
      if (mode === 'coherent') {
        const baseline = JSON.parse(required(f.files.get(`${siteUrl}baseline.json`)).toString());
        baseline.dataAsOf = '2026-10-19';
        const baselineBytes = Buffer.from(JSON.stringify(baseline));
        f.files.set(`${siteUrl}baseline.json`, baselineBytes);
        const manifestEntry = release.entries.find((e: { name: string }) =>
          e.name.startsWith('assets/'),
        );
        const manifest = JSON.parse(
          required(f.files.get(new URL(manifestEntry.name, siteUrl).href)).toString(),
        );
        manifest.metadata.coverage.date = '2026-10-19';
        const manifestBytes = Buffer.from(JSON.stringify(manifest)),
          hash = sha256Bytes(manifestBytes);
        Object.assign(manifestEntry, {
          name: `assets/compact-manifest-${hash}.json`,
          byteLength: manifestBytes.length,
          sha256: hash,
        });
        f.files.set(new URL(manifestEntry.name, siteUrl).href, manifestBytes);
        Object.assign(
          release.entries.find((e: { name: string }) => e.name === 'baseline.json'),
          { byteLength: baselineBytes.length, sha256: sha256Bytes(baselineBytes) },
        );
        f.files.set(url, Buffer.from(JSON.stringify(release)));
        expect((await readDeployedBaseline(url, 8 * 1024 * 1024, f.fetcher)).dataAsOf).toBe(
          '2026-10-19',
        );
        f.requests.splice(0);
      } else {
        release.entries = 'broken';
        f.files.set(
          url,
          Buffer.from(JSON.stringify(release) + (mode === 'malformed JSON' ? ',broken' : '')),
        );
      }
      await expect(readRecoveryPrecondition(siteUrl, f.approval, f.fetcher)).rejects.toThrow(
        'later collection',
      );
      expect(f.requests).toHaveLength(1);
    },
  );
  it.each([
    [
      'broken prefix string and literal key/value',
      '{"broken":"oops, "collectedAt":"2026-10-19T00:00:00.000Z","entries":"broken"}',
    ],
    [
      'broken prefix string and escaped key',
      String.raw`{"broken":"oops, "collected\u0041t":"2026-10-19T00:00:00.000Z","entries":"broken"}`,
    ],
    [
      'broken prefix string and escaped value',
      String.raw`{"broken":"oops, "collectedAt":"2026-10-19T00:00:00.00\u0030Z","entries":"broken"}`,
    ],
    [
      'broken prefix string and escaped key/value',
      String.raw`{"broken":"oops, "collected\u0041t":"2026-10-19T00:00:00.00\u0030Z","entries":"broken"}`,
    ],
    [
      'broken prefix string and fully escaped key/value',
      String.raw`{"broken":"oops, "\u0063\u006f\u006c\u006c\u0065\u0063\u0074\u0065\u0064\u0041\u0074":"\u0032\u0030\u0032\u0036\u002d\u0031\u0030\u002d\u0031\u0039\u0054\u0030\u0030\u003a\u0030\u0030\u003a\u0030\u0030\u002e\u0030\u0030\u0030\u005a","entries":"broken"}`,
    ],
    ['escaped key', String.raw`{"collected\u0041t":"2026-10-19T00:00:00.000Z","entries":"broken"}`],
    [
      'escaped value',
      String.raw`{"collectedAt":"2026-10-19T00:00:00.00\u0030Z","entries":"broken"}`,
    ],
    [
      'escaped key in malformed JSON',
      String.raw`{"collected\u0041t":"2026-10-19T00:00:00.000Z","entries":"broken"},broken`,
    ],
    [
      'escaped value in malformed JSON',
      String.raw`{"collectedAt":"2026-10-19T00:00:00.00\u0030Z","entries":"broken"},broken`,
    ],
    [
      'escaped key and value in malformed JSON',
      String.raw`{"collected\u0041t":"2026-10-19T00:00:00.00\u0030Z","entries":"broken"},broken`,
    ],
  ])(
    'rejects a later collection timestamp with %s before dependency or corruption handling',
    async (_mode, descriptor) => {
      const f = await fixture();
      f.files.set(`${siteUrl}release.json`, Buffer.from(descriptor));
      await expect(readRecoveryPrecondition(siteUrl, f.approval, f.fetcher)).rejects.toThrow(
        'later collection',
      );
      expect(f.requests.map((request) => request.url)).toEqual([`${siteUrl}release.json`]);
    },
  );
  it.each(
    [
      ['literal key/value', '"collectedAt":"2026-10-19T00:00:00.000Z"'],
      ['escaped key', String.raw`"collected\u0041t":"2026-10-19T00:00:00.000Z"`],
      ['escaped value', String.raw`"collectedAt":"2026-10-19T00:00:00.00\u0030Z"`],
      ['escaped key/value', String.raw`"collected\u0041t":"2026-10-19T00:00:00.00\u0030Z"`],
    ].flatMap(([mode, pair]) => ['before', 'after'].map((position) => [mode, position, pair])),
  )(
    'rejects later %s evidence with unrelated invalid UTF-8 %s the pair before dependency or corruption handling',
    async (_mode, position, pair) => {
      const f = await fixture();
      const damaged = Buffer.concat([
        Buffer.from('"damaged":"'),
        Buffer.from([0xff]),
        Buffer.from('"'),
      ]);
      const descriptor =
        position === 'before'
          ? Buffer.concat([Buffer.from('{'), damaged, Buffer.from(`,${pair}}`)])
          : Buffer.concat([Buffer.from(`{${pair},`), damaged, Buffer.from('}')]);
      f.files.set(`${siteUrl}release.json`, descriptor);
      await expect(readRecoveryPrecondition(siteUrl, f.approval, f.fetcher)).rejects.toThrow(
        'later collection',
      );
      expect(f.requests.map((request) => request.url)).toEqual([`${siteUrl}release.json`]);
    },
  );
  it('retains stable invalid UTF-8 without later evidence as corruption without semantic dependency reads', async () => {
    const f = await fixture();
    const descriptor = Buffer.concat([
      Buffer.from(`{"collectedAt":"${f.expected.collectedAt}","damaged":"`),
      Buffer.from([0xff]),
      Buffer.from('"}'),
    ]);
    f.files.set(`${siteUrl}release.json`, descriptor);
    await expect(readRecoveryPrecondition(siteUrl, f.approval, f.fetcher)).resolves.toEqual({
      kind: 'corrupt',
      status: 200,
      releaseSha256: sha256Bytes(descriptor),
    });
    expect(f.requests.map((request) => request.url)).toEqual([
      `${siteUrl}release.json`,
      `${siteUrl}release.json`,
    ]);
  });
  it.each(['timeout', '500', '403', 'redirect', 'baseline timeout', 'descriptor replacement'])(
    'aborts %s uncertainty rather than classifying corruption',
    async (mode) => {
      const f = await fixture();
      const fetcher = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
        if (
          mode === 'timeout' ||
          (mode === 'baseline timeout' && String(input).endsWith('/baseline.json'))
        )
          throw new DOMException('timeout', 'TimeoutError');
        if (mode === '500' || mode === '403') return new Response(null, { status: Number(mode) });
        if (mode === 'redirect') return new Response(null, { status: 302 });
        if (mode === 'descriptor replacement') f.options.changeDescriptor = true;
        return f.fetcher(input, init);
      }) as unknown as typeof fetch;
      await expect(readRecoveryPrecondition(siteUrl, f.approval, fetcher)).rejects.toThrow();
    },
  );
});

function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error('Missing synthetic test fixture value');
  return value;
}
