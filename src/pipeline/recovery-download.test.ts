import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { access, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { downloadApprovedRecovery, readRecoveryResource } from './recovery-download.js';
import { inventoryBytes, sha256Bytes, type RecoveryApprovalV1 } from './recovery-types.js';

beforeEach(() => {
  vi.stubGlobal('fetch', () => {
    throw new Error('Real network is forbidden in recovery tests');
  });
});
afterEach(() => {
  vi.unstubAllGlobals();
});
const siteUrl = 'https://internalforces.github.io/open-store-searcher/';
const api = 'https://api.github.com/repos/internalforces/open-store-searcher';
const roots: string[] = [];
afterEach(async () => {
  vi.useRealTimers();
  await Promise.all(roots.splice(0).map((path) => rm(path, { recursive: true, force: true })));
});
async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'recovery-download-'));
  roots.push(root);
  const binding = (bytes: Buffer) => ({ byteLength: bytes.length, sha256: sha256Bytes(bytes) });
  const gzip = Buffer.from('synthetic archive bytes; never executed');
  const inventory = {
    version: 1 as const,
    kind: 'publication-inventory' as const,
    files: [{ name: 'index.html', ...binding(Buffer.from('fixture app')) }],
    totalBytes: 11,
  };
  const inventoryBuffer = inventoryBytes(inventory);
  const receipt = {
    version: 1 as const,
    kind: 'public-bytes-verified' as const,
    siteUrl,
    checkedAt: '2026-10-18T00:00:00.000Z',
    inventorySha256: sha256Bytes(inventoryBuffer),
    releaseSha256: 'b'.repeat(64),
  };
  // Synthetic history only; no live GitHub identity or public-success claim.
  const provenance = {
    version: 1 as const,
    kind: 'verified-publication-backup' as const,
    repository: 'internalforces/open-store-searcher',
    siteUrl,
    sourceCommit: 'c'.repeat(40),
    workflowCommit: 'd'.repeat(40),
    workflowPath: '.github/workflows/refresh.yml',
    runId: 15,
    artifactId: 16,
    deploymentId: 'synthetic-deployment',
    deploymentOutcome: 'success' as const,
    verifiedAt: receipt.checkedAt,
    identity: {
      releaseSha256: 'b'.repeat(64),
      manifestSha256: 'e'.repeat(64),
      baselineSha256: 'f'.repeat(64),
      archiveSha256: '1'.repeat(64),
      collectedAt: '2026-10-17T00:00:00.000Z',
      recordCount: 2,
      policyRevision: 'fixture-policy',
      schemaVersion: 2 as const,
      identifierVersion: 1 as const,
      normalizationVersion: 1 as const,
    },
    inventory: binding(inventoryBuffer),
    tar: binding(Buffer.from('synthetic tar')),
    gzip: binding(gzip),
    publicVerification: { receipt, binding: binding(Buffer.from(`${JSON.stringify(receipt)}\n`)) },
  };
  const provenanceBuffer = Buffer.from(`${JSON.stringify(provenance)}\n`);
  const approval: RecoveryApprovalV1 = {
    id: 'synthetic-backup',
    repository: provenance.repository,
    siteUrl,
    releaseId: 11,
    tag: 'fixture-tag',
    assets: {
      snapshot: { id: 12, name: 'snapshot.tar.gz', ...binding(gzip) },
      inventory: { id: 13, name: 'inventory.json', ...binding(inventoryBuffer) },
      provenance: { id: 14, name: 'provenance.json', ...binding(provenanceBuffer) },
    },
    expectedProvenance: provenance,
  };
  const asset = (value: RecoveryApprovalV1['assets']['snapshot']) => ({
    id: value.id,
    name: value.name,
    size: value.byteLength,
    state: 'uploaded',
    url: `${api}/releases/assets/${value.id}`,
  });
  const release = {
    id: 11,
    url: `${api}/releases/11`,
    tag_name: 'fixture-tag',
    draft: false,
    assets: Object.values(approval.assets).map(asset),
  };
  const routes = new Map<string, unknown>([
    [`${api}/releases/11`, release],
    [
      `${api}/git/ref/tags/fixture-tag`,
      {
        ref: 'refs/tags/fixture-tag',
        object: {
          type: 'commit',
          sha: provenance.sourceCommit,
          url: `${api}/git/commits/${provenance.sourceCommit}`,
        },
      },
    ],
    [`${api}/git/commits/${provenance.sourceCommit}`, { sha: provenance.sourceCommit }],
    [`${api}/releases/assets/12`, gzip],
    [`${api}/releases/assets/13`, inventoryBuffer],
    [`${api}/releases/assets/14`, provenanceBuffer],
  ]);
  const assetMetadata = new Map(release.assets.map((asset) => [asset.url, { ...asset }]));
  const requests: { url: string; init: RequestInit | undefined }[] = [];
  const fetcher = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    requests.push({ url, init });
    if (
      assetMetadata.has(url) &&
      new Headers(init?.headers).get('accept') !== 'application/octet-stream'
    )
      return new Response(JSON.stringify(assetMetadata.get(url)));
    if (!routes.has(url)) throw new Error('Unexpected network URL');
    const value = routes.get(url);
    if (value instanceof Response) return value;
    if (value instanceof Error) throw value;
    return new Response(Buffer.isBuffer(value) ? new Uint8Array(value) : JSON.stringify(value));
  }) as unknown as typeof fetch;
  return {
    root,
    output: join(root, 'download'),
    approval,
    gzip,
    inventory,
    provenance,
    routes,
    requests,
    release,
    assetMetadata,
    fetcher,
  };
}
describe('downloadApprovedRecovery', () => {
  it('downloads exact approved assets through immutable IDs without executing historical code', async () => {
    const f = await fixture();
    const result = await downloadApprovedRecovery(f.approval, f.output, f.fetcher);
    expect(await readFile(result.gzipPath)).toEqual(f.gzip);
    expect(result.inventory).toEqual(f.inventory);
    expect(result.provenance).toEqual(f.provenance);
    expect(await readdir(f.output)).toEqual(['snapshot.tar.gz']);
    expect(f.requests.map((r) => r.url)).toContain(`${api}/git/ref/tags/fixture-tag`);
    for (const request of f.requests) {
      expect(request.init).toMatchObject({
        credentials: 'omit',
        cache: 'no-store',
        redirect:
          new Headers(request.init?.headers).get('accept') === 'application/octet-stream'
            ? 'manual'
            : 'error',
      });
      expect(new Headers(request.init?.headers).has('authorization')).toBe(false);
    }
    expect(
      f.requests
        .filter((r) => r.url.endsWith('/assets/12'))
        .map((r) => new Headers(r.init?.headers).get('accept')),
    ).toEqual(['application/vnd.github+json', 'application/octet-stream']);
  });
  it.each([
    'draft',
    'missing',
    'renamed',
    'replaced',
    'size',
    'state',
    'repository',
    'release ID',
    'tag',
    'commit',
    'workflow',
    'digest',
    'inventory self-assertion',
    'provenance self-assertion',
  ])('rejects %s mismatch and cleans private downloads', async (reason) => {
    const f = await fixture();
    if (reason === 'draft') f.release.draft = true;
    if (reason === 'missing') f.release.assets.pop();
    if (reason === 'renamed') required(f.release.assets[0]).name = 'other.tar.gz';
    if (reason === 'replaced') required(f.release.assets[0]).id = 99;
    if (reason === 'size') required(f.release.assets[0]).size++;
    if (reason === 'state') required(f.release.assets[0]).state = 'new';
    if (reason === 'repository')
      f.release.url = 'https://api.github.com/repos/attacker/repo/releases/11';
    if (reason === 'release ID') f.release.id = 99;
    if (reason === 'tag') f.release.tag_name = 'other';
    if (reason === 'commit')
      f.routes.set(`${api}/git/ref/tags/fixture-tag`, {
        ref: 'refs/tags/fixture-tag',
        object: {
          type: 'commit',
          sha: 'a'.repeat(40),
          url: `${api}/git/commits/${'a'.repeat(40)}`,
        },
      });
    if (reason === 'workflow')
      f.approval.expectedProvenance.workflowPath = '.github/workflows/untrusted.yml';
    if (reason === 'digest')
      f.routes.set(`${api}/releases/assets/12`, Buffer.alloc(f.gzip.length, 0));
    if (reason === 'inventory self-assertion')
      f.routes.set(`${api}/releases/assets/13`, Buffer.from('{}'));
    if (reason === 'provenance self-assertion')
      f.routes.set(
        `${api}/releases/assets/14`,
        Buffer.from(JSON.stringify({ ...f.provenance, deploymentId: 'forged' })),
      );
    await expect(downloadApprovedRecovery(f.approval, f.output, f.fetcher)).rejects.toThrow();
    await expect(access(f.output)).rejects.toThrow();
    expect(await readdir(f.root)).toEqual([]);
  });
  it('uses reviewed hashes independently of the optional GitHub digest', async () => {
    const f = await fixture();
    Object.assign(required(f.release.assets[0]), { digest: `sha256:${'0'.repeat(64)}` });
    Object.assign(required(f.assetMetadata.get(`${api}/releases/assets/12`)), {
      digest: `sha256:${'0'.repeat(64)}`,
    });
    expect(
      await readFile((await downloadApprovedRecovery(f.approval, f.output, f.fetcher)).gzipPath),
    ).toEqual(f.gzip);
    const corrupted = await fixture();
    Object.assign(required(corrupted.release.assets[0]), {
      digest: `sha256:${corrupted.approval.assets.snapshot.sha256}`,
    });
    corrupted.routes.set(`${api}/releases/assets/12`, Buffer.alloc(corrupted.gzip.length, 0));
    await expect(
      downloadApprovedRecovery(corrupted.approval, corrupted.output, corrupted.fetcher),
    ).rejects.toThrow('binding');
  });
  it('rejects asset metadata renamed after the release listing', async () => {
    const f = await fixture();
    required(f.assetMetadata.get(`${api}/releases/assets/12`)).name = 'replaced.tar.gz';
    await expect(downloadApprovedRecovery(f.approval, f.output, f.fetcher)).rejects.toThrow();
    await expect(access(f.output)).rejects.toThrow();
  });
  it('rejects independently hash-bound provenance whose history differs from reviewed main', async () => {
    const f = await fixture();
    const bytes = Buffer.from(
      JSON.stringify({ ...f.provenance, deploymentId: 'self-asserted-history' }),
    );
    f.routes.set(`${api}/releases/assets/14`, bytes);
    Object.assign(f.approval.assets.provenance, {
      byteLength: bytes.length,
      sha256: sha256Bytes(bytes),
    });
    required(f.release.assets[2]).size = bytes.length;
    required(f.assetMetadata.get(`${api}/releases/assets/14`)).size = bytes.length;
    await expect(downloadApprovedRecovery(f.approval, f.output, f.fetcher)).rejects.toThrow(
      'reviewed authority',
    );
    expect(await readdir(f.root)).toEqual([]);
  });
  it('accepts five annotated tag hops, rejects a sixth hop, a cycle and a mismatched ref', async () => {
    for (const mode of ['five', 'six', 'cycle', 'wrong-ref']) {
      const f = await fixture();
      const first = '1'.repeat(40);
      f.routes.set(`${api}/git/ref/tags/fixture-tag`, {
        ref: mode === 'wrong-ref' ? 'refs/tags/fixture-tag-suffix' : 'refs/tags/fixture-tag',
        object: { type: 'tag', sha: first, url: `${api}/git/tags/${first}` },
      });
      for (let i = 1; i <= 6; i++) {
        const current = String(i).repeat(40),
          last = i === (mode === 'six' ? 6 : 5);
        const next =
          mode === 'cycle' ? first : last ? f.provenance.sourceCommit : String(i + 1).repeat(40);
        f.routes.set(`${api}/git/tags/${current}`, {
          sha: current,
          object: {
            type: last && mode !== 'cycle' ? 'commit' : 'tag',
            sha: next,
            url: `${api}/git/${last && mode !== 'cycle' ? 'commits' : 'tags'}/${next}`,
          },
        });
      }
      if (mode === 'five')
        expect(
          (await downloadApprovedRecovery(f.approval, f.output, f.fetcher)).provenance.sourceCommit,
        ).toBe('c'.repeat(40));
      else
        await expect(downloadApprovedRecovery(f.approval, f.output, f.fetcher)).rejects.toThrow();
    }
  });
  it.each([
    'release-assets.githubusercontent.com',
    'objects.githubusercontent.com',
    'github.com',
    'api.github.com',
  ])('follows binary 302 to allowlisted HTTPS %s with no credentials', async (host) => {
    const f = await fixture(),
      redirected = `https://${host}/fixture?synthetic-signature=do-not-log`;
    f.routes.set(
      `${api}/releases/assets/12`,
      new Response(null, { status: 302, headers: { location: redirected } }),
    );
    f.routes.set(redirected, f.gzip);
    expect(
      await readFile((await downloadApprovedRecovery(f.approval, f.output, f.fetcher)).gzipPath),
    ).toEqual(f.gzip);
  });
  it.each([
    'https://attacker.example/x',
    'http://github.com/x',
    'https://github.com.evil/x',
    'https://user:pass@github.com/x',
  ])('rejects unsupported redirect %s without fetching it', async (destination) => {
    const f = await fixture();
    f.routes.set(
      `${api}/releases/assets/12`,
      new Response(null, { status: 302, headers: { location: destination } }),
    );
    await expect(downloadApprovedRecovery(f.approval, f.output, f.fetcher)).rejects.toThrow();
    expect(f.requests.some((r) => r.url === destination)).toBe(false);
  });
  it('rejects a sixth redirect, oversized streamed body, dishonest Content-Length, and preserves existing output', async () => {
    for (const mode of ['redirects', 'oversized', 'length', 'existing']) {
      const f = await fixture();
      if (mode === 'redirects') {
        for (let i = 0; i <= 6; i++)
          f.routes.set(
            i === 0 ? `${api}/releases/assets/12` : `https://github.com/redirect-${i}`,
            new Response(null, {
              status: 302,
              headers: { location: `https://github.com/redirect-${i + 1}` },
            }),
          );
      }
      if (mode === 'oversized')
        f.routes.set(
          `${api}/releases/assets/12`,
          new Response(Buffer.alloc(f.gzip.length + 1), { headers: { 'content-length': '1' } }),
        );
      if (mode === 'length')
        f.routes.set(
          `${api}/releases/assets/12`,
          new Response(f.gzip, { headers: { 'content-length': String(f.gzip.length + 1) } }),
        );
      if (mode === 'existing') await writeFile(f.output, 'preserved');
      await expect(downloadApprovedRecovery(f.approval, f.output, f.fetcher)).rejects.toThrow();
      if (mode === 'existing') expect(await readFile(f.output, 'utf8')).toBe('preserved');
    }
  });
  it('aborts pre-header and stalled body reads after inactivity without leaking signed URLs', async () => {
    for (const mode of ['headers', 'body']) {
      const f = await fixture();
      vi.useFakeTimers();
      let started: () => void = () => {};
      const ready = new Promise<void>((resolve) => {
        started = resolve;
      });
      const fetcher = vi.fn(async () => {
        started();
        return mode === 'headers'
          ? new Promise<Response>(() => {})
          : new Response(new ReadableStream({ start() {} }));
      }) as unknown as typeof fetch;
      const pending = downloadApprovedRecovery(f.approval, f.output, fetcher);
      const rejection = expect(pending).rejects.toThrow('Recovery network read failed');
      await ready;
      await vi.advanceTimersByTimeAsync(30_001);
      await rejection;
      vi.useRealTimers();
      expect(await readdir(f.root)).toEqual([]);
    }
  });
});

it('enforces the fifteen-minute overall archive limit despite continuous chunks', async () => {
  vi.useFakeTimers();
  let interval: ReturnType<typeof setInterval> | undefined;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      interval = setInterval(() => controller.enqueue(new Uint8Array([1])), 20_000);
    },
    cancel() {
      clearInterval(interval);
    },
  });
  const fetcher = vi.fn(async () => new Response(stream)) as unknown as typeof fetch;
  const pending = readRecoveryResource(new URL(`${api}/releases/assets/12`), 100, fetcher, {
    binary: true,
  });
  const outcome = pending.catch((error) => error as Error);
  await vi.advanceTimersByTimeAsync(900_001);
  expect(await outcome).toMatchObject({ message: 'Recovery network read failed' });
});

function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error('Missing synthetic test fixture value');
  return value;
}
