import * as fs from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createInitialImportFixture } from '../../tests/fixtures/initial-import.js';
import { INITIAL_SOURCE, type InitialSourceAssetV1 } from './initial-import-types.js';
import { downloadInitialAsset, downloadInitialSource } from './initial-source-download.js';
import * as recovery from './recovery-download.js';
import { RECOVERY_LIMITS, sha256Bytes } from './recovery-types.js';

vi.mock('node:fs/promises', async (original) => {
  const actual = await original<typeof fs>();
  return { ...actual, open: vi.fn(actual.open), rm: vi.fn(actual.rm) };
});
const api = 'https://api.github.com/repos/internalforces/open-store-searcher';
const roots: string[] = [];
const actualFs = await vi.importActual<typeof fs>('node:fs/promises');
beforeEach(() => {
  vi.mocked(fs.open).mockReset().mockImplementation(actualFs.open);
  vi.mocked(fs.rm).mockReset().mockImplementation(actualFs.rm);
  vi.stubGlobal('fetch', () => {
    throw new Error('Real network is forbidden in initial-source tests');
  });
});
afterEach(async () => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
  await Promise.all(
    roots.splice(0).map((path) => actualFs.rm(path, { recursive: true, force: true })),
  );
});
async function output() {
  const root = await fs.mkdtemp(join(tmpdir(), 'initial-source-'));
  roots.push(root);
  return { root, path: join(root, 'download') };
}
function bindingFor(bytes: Buffer): InitialSourceAssetV1 {
  return {
    id: 102,
    name: INITIAL_SOURCE.assetNames.archive,
    byteLength: bytes.length,
    sha256: sha256Bytes(bytes),
  };
}
function stream(chunks: Uint8Array[], close = true) {
  const cancel = vi.fn();
  let index = 0;
  return {
    cancel,
    response: new Response(
      new ReadableStream<Uint8Array>({
        pull(controller) {
          const chunk = chunks[index++];
          if (chunk) controller.enqueue(chunk);
          else if (close) controller.close();
        },
        cancel,
      }),
    ),
  };
}
function fetchResponse(response: Response): typeof fetch {
  return vi.fn(async () => response) as unknown as typeof fetch;
}
async function absent(path: string) {
  await expect(fs.access(path)).rejects.toThrow();
}

describe('downloadInitialAsset real bounded bytes (II-02)', () => {
  it('streams and independently hashes exact small bytes from only the fixed asset ID endpoint', async () => {
    const f = await output();
    const bytes = Buffer.from('abc');
    const fetcher = fetchResponse(stream([bytes.subarray(0, 1), bytes.subarray(1)]).response);
    expect(await downloadInitialAsset(bindingFor(bytes), f.path, fetcher)).toEqual({
      byteLength: 3,
      sha256: sha256Bytes(bytes),
    });
    expect(await fs.readFile(f.path)).toEqual(bytes);
    expect((await fs.lstat(f.path)).isFile()).toBe(true);
    expect(vi.mocked(fetcher).mock.calls[0]).toEqual([
      new URL(`${api}/releases/assets/102`),
      expect.objectContaining({
        credentials: 'omit',
        redirect: 'manual',
        cache: 'no-store',
        referrerPolicy: 'no-referrer',
      }),
    ]);
  });
  it.each(['truncation', 'overflow', 'hash'])(
    'rejects %s and removes its partial file',
    async (mode) => {
      const f = await output();
      const body = stream(
        [Buffer.from(mode === 'truncation' ? 'ab' : mode === 'overflow' ? 'abcd' : 'abd')],
        mode !== 'overflow',
      );
      await expect(
        downloadInitialAsset(bindingFor(Buffer.from('abc')), f.path, fetchResponse(body.response)),
      ).rejects.toThrow();
      await absent(f.path);
      if (mode === 'overflow') expect(body.cancel).toHaveBeenCalledOnce();
    },
  );
  it('rejects dishonest Content-Length and cancels its body', async () => {
    const f = await output();
    const body = stream([Buffer.from('abc')], false);
    body.response.headers.set('content-length', '4');
    await expect(
      downloadInitialAsset(bindingFor(Buffer.from('abc')), f.path, fetchResponse(body.response)),
    ).rejects.toThrow();
    expect(body.cancel).toHaveBeenCalledOnce();
    await absent(f.path);
  });
  it.each(['id', 'name', 'length', 'sha256'])(
    'rejects invalid primitive %s before materialization or network',
    async (field) => {
      const f = await output();
      const binding = bindingFor(Buffer.from('abc'));
      if (field === 'id') binding.id = -1;
      if (field === 'name') binding.name = '../other.zip';
      if (field === 'length') binding.byteLength = 0;
      if (field === 'sha256') binding.sha256 = 'bad';
      const fetcher = vi.fn();
      await expect(downloadInitialAsset(binding, f.path, fetcher)).rejects.toThrow();
      expect(fetcher).not.toHaveBeenCalled();
      expect(await fs.readdir(f.root)).toEqual([]);
    },
  );
  it.each(['file', 'symlink', 'directory'])(
    'preserves an existing %s output without fetching',
    async (kind) => {
      const f = await output();
      if (kind === 'file') await fs.writeFile(f.path, 'keep');
      if (kind === 'directory') await fs.mkdir(f.path);
      if (kind === 'symlink') await fs.symlink('foreign', f.path);
      const fetcher = vi.fn();
      await expect(
        downloadInitialAsset(bindingFor(Buffer.from('abc')), f.path, fetcher),
      ).rejects.toThrow();
      expect(fetcher).not.toHaveBeenCalled();
      expect(
        (await fs.lstat(f.path))[
          kind === 'file' ? 'isFile' : kind === 'symlink' ? 'isSymbolicLink' : 'isDirectory'
        ](),
      ).toBe(true);
      if (kind === 'file') expect(await fs.readFile(f.path, 'utf8')).toBe('keep');
    },
  );
  it('rejects a symbolic-link parent before fetching', async () => {
    const f = await output();
    const link = join(f.root, 'link');
    await fs.symlink(f.root, link);
    const fetcher = vi.fn();
    await expect(
      downloadInitialAsset(bindingFor(Buffer.from('abc')), join(link, 'new'), fetcher),
    ).rejects.toThrow();
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('retries short writes until the whole streamed chunk is retained', async () => {
    const f = await output();
    vi.mocked(fs.open).mockImplementationOnce(async (...args: Parameters<typeof fs.open>) => {
      const file = await actualFs.open(...args);
      const write = file.write.bind(file);
      vi.spyOn(file, 'write').mockImplementation((async (bytes: Uint8Array, offset: number) =>
        write(bytes, offset, 1)) as typeof file.write);
      return file;
    });
    await downloadInitialAsset(
      bindingFor(Buffer.from('abc')),
      f.path,
      fetchResponse(stream([Buffer.from('abc')]).response),
    );
    expect(await fs.readFile(f.path, 'utf8')).toBe('abc');
  });
  it('cancels and cleans a zero-progress write', async () => {
    const f = await output();
    const body = stream([Buffer.from('abc')], false);
    vi.mocked(fs.open).mockImplementationOnce(async (...args: Parameters<typeof fs.open>) => {
      const file = await actualFs.open(...args);
      vi.spyOn(file, 'write').mockImplementation(
        async <T extends NodeJS.ArrayBufferView | string>(
          buffer: T,
        ): Promise<{ bytesWritten: number; buffer: T }> => ({ bytesWritten: 0, buffer }),
      );
      return file;
    });
    await expect(
      downloadInitialAsset(bindingFor(Buffer.from('abc')), f.path, fetchResponse(body.response)),
    ).rejects.toThrow();
    expect(body.cancel).toHaveBeenCalledOnce();
    await absent(f.path);
  });
  it('reports cleanup failure without pretending partial-output removal succeeded', async () => {
    const f = await output();
    vi.mocked(fs.rm).mockRejectedValueOnce(new Error('synthetic denied cleanup'));
    await expect(
      downloadInitialAsset(
        bindingFor(Buffer.from('abc')),
        f.path,
        fetchResponse(new Response('ab')),
      ),
    ).rejects.toThrow('cleanup');
    expect(await fs.readFile(f.path, 'utf8')).toBe('ab');
  });
  it('never removes a foreign file that replaced its owned partial path', async () => {
    const f = await output();
    const fetcher = vi.fn(async () => {
      await fs.rename(f.path, join(f.root, 'owned-moved'));
      await fs.writeFile(f.path, 'foreign');
      return new Response('ab');
    }) as unknown as typeof fetch;
    await expect(
      downloadInitialAsset(bindingFor(Buffer.from('abc')), f.path, fetcher),
    ).rejects.toThrow();
    expect(await fs.readFile(f.path, 'utf8')).toBe('foreign');
  });
  it.each([
    'https://attacker.invalid/private?secret=hidden',
    'https://api.github.com/repos/attacker/repo/releases/assets/102',
    'http://github.com/x',
    'https://u:p@github.com/x',
    'https://github.com:444/x',
    'https://github.com/x#fragment',
  ])('rejects malicious redirect %s without exposing or fetching it', async (destination) => {
    const f = await output();
    const body = stream([], false);
    const fetcher = fetchResponse(
      new Response(body.response.body, { status: 302, headers: { location: destination } }),
    );
    await expect(
      downloadInitialAsset(bindingFor(Buffer.from('abc')), f.path, fetcher),
    ).rejects.toThrow(/^Recovery network read failed$/);
    expect(vi.mocked(fetcher)).toHaveBeenCalledOnce();
    expect(body.cancel).toHaveBeenCalledOnce();
    await absent(f.path);
  });
  it('accepts five approved binary redirects but rejects the sixth', async () => {
    for (const count of [5, 6]) {
      const f = await output();
      let reads = 0;
      const fetcher = vi.fn(async () =>
        reads++ < count
          ? new Response(null, {
              status: 302,
              headers: {
                location: `https://release-assets.githubusercontent.com/${reads}?signed=private`,
              },
            })
          : new Response('abc'),
      ) as unknown as typeof fetch;
      if (count === 5) await downloadInitialAsset(bindingFor(Buffer.from('abc')), f.path, fetcher);
      else {
        await expect(
          downloadInitialAsset(bindingFor(Buffer.from('abc')), f.path, fetcher),
        ).rejects.toThrow();
        await absent(f.path);
      }
      expect(vi.mocked(fetcher)).toHaveBeenCalledTimes(6);
    }
  });
  it('aborts an inactive request at thirty seconds and removes its partial file', async () => {
    const f = await output();
    vi.useFakeTimers();
    let signal: AbortSignal | undefined;
    const fetcher = vi.fn((_url, init) => {
      signal = init?.signal as AbortSignal;
      return new Promise<Response>(() => {});
    }) as unknown as typeof fetch;
    const pending = downloadInitialAsset(bindingFor(Buffer.from('abc')), f.path, fetcher).catch(
      (error: unknown) => error,
    );
    await vi.waitFor(() => expect(fetcher).toHaveBeenCalledOnce());
    await vi.advanceTimersByTimeAsync(30_000);
    expect(await pending).toEqual(
      expect.objectContaining({ message: 'Recovery network read failed' }),
    );
    expect(signal?.aborted).toBe(true);
    await absent(f.path);
  });
});

async function sourceFixture() {
  const f = await output();
  const { approval } = createInitialImportFixture();
  const asset = (binding: InitialSourceAssetV1) => ({
    id: binding.id,
    name: binding.name,
    size: binding.byteLength,
    state: 'uploaded',
    url: `${api}/releases/assets/${binding.id}`,
    updated_at: '2026-10-21T00:00:00Z',
  });
  const release = {
    id: approval.releaseId,
    url: `${api}/releases/${approval.releaseId}`,
    tag_name: approval.tag,
    draft: false,
    published_at: '2026-10-21T00:00:00Z',
    assets: Object.values(approval.assets).map(asset),
  };
  const target = (type: string, sha: string) => ({
    type,
    sha,
    url: `${api}/git/${type === 'tag' ? 'tags' : 'commits'}/${sha}`,
  });
  const reference = {
    ref: `refs/tags/${approval.tag}`,
    url: `${api}/git/refs/tags/${approval.tag}`,
    object: target('commit', approval.tagCommit),
  };
  const routes = new Map<string, unknown>([
    [`${api}/releases/${approval.releaseId}`, release],
    [`${api}/git/ref/tags/${approval.tag}`, reference],
    [
      `${api}/git/commits/${approval.tagCommit}`,
      { sha: approval.tagCommit, url: `${api}/git/commits/${approval.tagCommit}` },
    ],
    ...release.assets.map((item): [string, unknown] => [item.url, structuredClone(item)]),
  ]);
  const requests: string[] = [];
  let binaryReads = 0;
  const fetcher = vi.fn(async (input, init) => {
    const url = String(input);
    requests.push(url);
    if (new Headers(init?.headers).get('accept') === 'application/octet-stream') {
      binaryReads++;
      return new Response('not the approved source');
    }
    if (!routes.has(url)) throw new Error('Unexpected fixture network URL; no provider fallback');
    return new Response(JSON.stringify(routes.get(url)));
  }) as unknown as typeof fetch;
  return {
    ...f,
    approval,
    release,
    reference,
    routes,
    requests,
    fetcher,
    target,
    get binaryReads() {
      return binaryReads;
    },
  };
}

describe('downloadInitialSource selected authority and metadata (II-02)', () => {
  it('rejects rewritten source authority before network or output creation', async () => {
    const f = await sourceFixture();
    f.approval.collectedAt = '2026-10-21T00:00:00.000Z';
    await expect(downloadInitialSource(f.approval, f.path, f.fetcher)).rejects.toThrow('authority');
    expect(f.requests).toEqual([]);
    expect(await fs.readdir(f.root)).toEqual([]);
  });
  it.each([
    'draft',
    'unpublished',
    'missing role',
    'duplicate role',
    'same-name replacement',
    'other repository',
    'asset state',
    'asset URL',
    'asset size',
    'wrong tag',
    'wrong commit',
    'commit URL',
    'reference URL',
  ])('rejects %s before materializing downloads', async (reason) => {
    const f = await sourceFixture();
    const first = f.release.assets[0];
    if (!first) throw new Error('Missing fixture asset');
    if (reason === 'draft') f.release.draft = true;
    if (reason === 'unpublished') Object.assign(f.release, { published_at: null });
    if (reason === 'missing role') f.release.assets.pop();
    if (reason === 'duplicate role') f.release.assets.push({ ...first, id: 999 });
    if (reason === 'same-name replacement') first.id = 999;
    if (reason === 'other repository')
      f.release.url = 'https://api.github.com/repos/attacker/repo/releases/101';
    if (reason === 'asset state') first.state = 'new';
    if (reason === 'asset URL')
      first.url = 'https://api.github.com/repos/attacker/repo/releases/assets/102';
    if (reason === 'asset size') first.size++;
    if (reason === 'wrong tag') f.release.tag_name = 'other';
    if (reason === 'wrong commit') f.reference.object = f.target('commit', 'b'.repeat(40));
    if (reason === 'commit URL')
      f.reference.object.url = `https://api.github.com/repos/attacker/repo/git/commits/${f.approval.tagCommit}`;
    if (reason === 'reference URL')
      f.reference.url = 'https://api.github.com/repos/attacker/repo/git/refs/tags/x';
    await expect(downloadInitialSource(f.approval, f.path, f.fetcher)).rejects.toThrow();
    expect(f.binaryReads).toBe(0);
    expect(f.requests.length).toBeGreaterThan(0);
    expect(await fs.readdir(f.root)).toEqual([]);
    expect(f.requests.every((url) => url.startsWith(`${api}/`))).toBe(true);
  });
  it('checks individual asset metadata before creating private downloads', async () => {
    const f = await sourceFixture();
    f.routes.set(`${api}/releases/assets/103`, { ...f.release.assets[1], state: 'new' });
    await expect(downloadInitialSource(f.approval, f.path, f.fetcher)).rejects.toThrow();
    expect(f.binaryReads).toBe(0);
    expect(f.requests.length).toBeGreaterThan(0);
    expect(await fs.readdir(f.root)).toEqual([]);
  });
  it('rejects synthetic bytes against actual selected hashes and never uses a provider fallback', async () => {
    const f = await sourceFixture();
    await expect(downloadInitialSource(f.approval, f.path, f.fetcher)).rejects.toThrow('binding');
    expect(f.binaryReads).toBe(1);
    expect(await fs.readdir(f.root)).toEqual([]);
    expect(f.requests.every((url) => url.startsWith(`${api}/`))).toBe(true);
  });
  it.each(['cycle', 'six hops', 'other repository tag', 'tag SHA'])(
    'rejects annotated tag %s before binary reads',
    async (reason) => {
      const f = await sourceFixture();
      const tags = Array.from({ length: 6 }, (_, index) => (index + 1).toString().repeat(40));
      f.reference.object = f.target('tag', tags[0] as string);
      for (let index = 0; index < tags.length; index++) {
        const sha = tags[index] as string;
        f.routes.set(`${api}/git/tags/${sha}`, {
          sha,
          url: `${api}/git/tags/${sha}`,
          object: f.target('tag', tags[index + 1] ?? sha),
        });
      }
      const first = f.routes.get(`${api}/git/tags/${tags[0]}`) as {
        sha: string;
        object: ReturnType<typeof f.target>;
      };
      if (reason === 'cycle') first.object = f.target('tag', tags[0] as string);
      if (reason === 'other repository tag')
        first.object.url = `https://api.github.com/repos/attacker/repo/git/tags/${tags[1]}`;
      if (reason === 'tag SHA') first.sha = 'f'.repeat(40);
      await expect(downloadInitialSource(f.approval, f.path, f.fetcher)).rejects.toThrow();
      expect(f.binaryReads).toBe(0);
      expect(f.requests.length).toBeGreaterThan(0);
      expect(await fs.readdir(f.root)).toEqual([]);
    },
  );
  // This test-only reader seam verifies orchestration with pinned real authority; it makes no
  // claim of a 217 MB source happy path. Real bytes/hashes are tested by the primitive above.
  it.each([
    'release replacement',
    'individual replacement',
    'tag moved',
    'asset disappeared',
    'asset updated',
  ])('refuses promotion after %s during download (synthetic wiring only)', async (change) => {
    const f = await sourceFixture();
    const read = recovery.readRecoveryResource;
    let downloads = 0;
    vi.spyOn(recovery, 'readRecoveryResource').mockImplementation(
      async (target, maxBytes, fetcher, options) => {
        if (!options?.binary) return read(target, maxBytes, fetcher, options);
        downloads++;
        const role = target.pathname.endsWith('/102') ? 'archive' : 'observation';
        if (downloads === 2) {
          if (change === 'release replacement')
            Object.assign(f.release.assets[0] as object, { id: 999 });
          if (change === 'individual replacement')
            f.routes.set(`${api}/releases/assets/102`, { ...f.release.assets[0], id: 999 });
          if (change === 'tag moved') f.reference.object = f.target('commit', 'b'.repeat(40));
          if (change === 'asset disappeared') f.routes.delete(`${api}/releases/assets/102`);
          if (change === 'asset updated')
            Object.assign(f.release.assets[0] as object, { updated_at: '2026-10-22T00:00:00Z' });
        }
        return { status: 200, bytes: Buffer.alloc(0), binding: { ...INITIAL_SOURCE[role] } };
      },
    );
    await expect(downloadInitialSource(f.approval, f.path, f.fetcher)).rejects.toThrow();
    expect(downloads).toBe(2);
    expect(await fs.readdir(f.root)).toEqual([]);
    expect(f.requests.every((url) => url.startsWith(`${api}/`))).toBe(true);
  });
  it('admits exactly five annotated tag hops before enforcing the actual byte binding', async () => {
    const f = await sourceFixture();
    const tags = Array.from({ length: 5 }, (_, index) => (index + 1).toString().repeat(40));
    f.reference.object = f.target('tag', tags[0] as string);
    for (const [index, sha] of tags.entries()) {
      f.routes.set(`${api}/git/tags/${sha}`, {
        sha,
        url: `${api}/git/tags/${sha}`,
        object:
          index === 4
            ? f.target('commit', f.approval.tagCommit)
            : f.target('tag', tags[index + 1] as string),
      });
    }
    await expect(downloadInitialSource(f.approval, f.path, f.fetcher)).rejects.toThrow('binding');
    expect(f.binaryReads).toBe(1);
    expect(f.requests.filter((url) => url.includes('/git/tags/'))).toHaveLength(5);
    expect(await fs.readdir(f.root)).toEqual([]);
  });
  it('promotes only after two complete metadata checks and returns bound Release transport (synthetic wiring only)', async () => {
    const f = await sourceFixture();
    const read = recovery.readRecoveryResource;
    let downloads = 0;
    vi.spyOn(recovery, 'readRecoveryResource').mockImplementation(
      async (target, maxBytes, fetcher, options) => {
        if (!options?.binary) return read(target, maxBytes, fetcher, options);
        downloads++;
        const role = target.pathname.endsWith('/102') ? 'archive' : 'observation';
        return { status: 200, bytes: Buffer.alloc(0), binding: { ...INITIAL_SOURCE[role] } };
      },
    );
    const result = await downloadInitialSource(f.approval, f.path, f.fetcher);
    expect(downloads).toBe(2);
    expect(result).toEqual({
      archivePath: join(f.path, INITIAL_SOURCE.assetNames.archive),
      observationPath: join(f.path, INITIAL_SOURCE.assetNames.observation),
      transport: {
        kind: 'github-release',
        releaseId: f.approval.releaseId,
        tag: f.approval.tag,
        tagCommit: f.approval.tagCommit,
        assets: f.approval.assets,
        downloadedAt: expect.any(String),
      },
    });
    expect(
      Number.isFinite(
        Date.parse(result.transport.kind === 'github-release' ? result.transport.downloadedAt : ''),
      ),
    ).toBe(true);
    for (const path of [
      'releases/101',
      'releases/assets/102',
      'releases/assets/103',
      `git/ref/tags/${f.approval.tag}`,
      `git/commits/${f.approval.tagCommit}`,
    ])
      expect(f.requests.filter((url) => url === `${api}/${path}`)).toHaveLength(2);
    expect(await fs.readdir(f.root)).toEqual(['download']);
    expect((await fs.readdir(f.path)).sort()).toEqual(
      Object.values(INITIAL_SOURCE.assetNames).sort(),
    );
  });
  it('preserves a pre-existing directory before metadata or downloads', async () => {
    const f = await sourceFixture();
    await fs.mkdir(f.path);
    await fs.writeFile(join(f.path, 'keep'), 'foreign');
    await expect(downloadInitialSource(f.approval, f.path, f.fetcher)).rejects.toThrow(
      'already exists',
    );
    expect(f.requests).toEqual([]);
    expect(await fs.readFile(join(f.path, 'keep'), 'utf8')).toBe('foreign');
  });
  it('reports private-directory cleanup failure and leaves unrelated siblings untouched', async () => {
    const f = await sourceFixture();
    await fs.writeFile(join(f.root, 'keep'), 'foreign');
    vi.mocked(fs.rm).mockImplementation(async (path, options) => {
      if (String(path).includes('.download-'))
        throw new Error('synthetic denied directory cleanup');
      return actualFs.rm(path, options);
    });
    await expect(downloadInitialSource(f.approval, f.path, f.fetcher)).rejects.toThrow('cleanup');
    await absent(f.path);
    expect(await fs.readFile(join(f.root, 'keep'), 'utf8')).toBe('foreign');
    expect((await fs.readdir(f.root)).some((name) => name.includes('.download-'))).toBe(true);
  });
  it('rejects redirected JSON metadata and cancels the unconsumed body before output creation', async () => {
    const f = await sourceFixture();
    const body = stream([], false);
    Object.defineProperty(body.response, 'redirected', { value: true });
    const fetcher = fetchResponse(body.response);
    await expect(downloadInitialSource(f.approval, f.path, fetcher)).rejects.toThrow('network');
    expect(body.cancel).toHaveBeenCalledOnce();
    expect(vi.mocked(fetcher).mock.calls[0]?.[1]?.redirect).toBe('error');
    expect(await fs.readdir(f.root)).toEqual([]);
  });
  it('bounds metadata JSON to one MiB without creating output', async () => {
    const f = await sourceFixture();
    f.routes.set(`${api}/releases/101`, 'x'.repeat(RECOVERY_LIMITS.maxJsonBytes));
    await expect(downloadInitialSource(f.approval, f.path, f.fetcher)).rejects.toThrow('network');
    expect(f.binaryReads).toBe(0);
    expect(f.requests.length).toBeGreaterThan(0);
    expect(await fs.readdir(f.root)).toEqual([]);
  });
});
