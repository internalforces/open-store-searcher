import { createHash } from 'node:crypto';
import { lstat, mkdir, mkdtemp, open, rename, rm, rmdir } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { validateRecoveryApproval, validateRecoveryProvenance } from './recovery-approval.js';
import { object } from './refresh-validation-types.js';
import {
  inventoryBytes,
  RECOVERY_LIMITS,
  sha256Bytes,
  validateSnapshotInventory,
  type ByteBinding,
  type RecoveryApprovalV1,
  type RecoveryProvenanceV1,
  type SnapshotInventoryV1,
} from './recovery-types.js';

const API = 'https://api.github.com/repos/internalforces/open-store-searcher';
const HOSTS = new Set([
  'api.github.com',
  'github.com',
  'release-assets.githubusercontent.com',
  'objects.githubusercontent.com',
]);
function allowedRedirect(value: string, base: URL): URL {
  const url = new URL(value, base);
  if (
    url.protocol !== 'https:' ||
    !HOSTS.has(url.hostname) ||
    url.port ||
    url.username ||
    url.password ||
    url.hash
  )
    throw new Error('Unsupported recovery redirect');
  return url;
}
function equalBinding(actual: ByteBinding, expected: ByteBinding) {
  if (actual.byteLength !== expected.byteLength || actual.sha256 !== expected.sha256)
    throw new Error('Recovery byte binding mismatch');
}

/** Bounded unauthenticated reads. Errors deliberately omit request URLs and response bodies. */
export async function readRecoveryResource(
  target: URL,
  maxBytes: number,
  fetcher: typeof fetch,
  options: {
    binary?: boolean;
    allow404?: boolean;
    onChunk?: (chunk: Uint8Array) => Promise<void>;
  } = {},
): Promise<{ status: 200 | 404; bytes: Buffer; binding: ByteBinding }> {
  let url = target;
  const deadline = Date.now() + RECOVERY_LIMITS.archiveTimeoutMs;
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let rejectTimeout: (error: Error) => void = () => {};
  const timeout = new Promise<never>((_resolve, reject) => {
    rejectTimeout = reject;
  });
  const reset = () => {
    clearTimeout(timer);
    timer = setTimeout(
      () => {
        controller.abort();
        rejectTimeout(new Error('Recovery network read failed'));
      },
      Math.max(0, Math.min(RECOVERY_LIMITS.inactivityTimeoutMs, deadline - Date.now())),
    );
  };
  try {
    for (let redirects = 0; ; redirects++) {
      reset();
      const response = await Promise.race([
        fetcher(url, {
          redirect: options.binary ? 'manual' : 'error',
          credentials: 'omit',
          cache: 'no-store',
          referrerPolicy: 'no-referrer',
          headers: {
            Accept: options.binary ? 'application/octet-stream' : 'application/vnd.github+json',
          },
          signal: controller.signal,
        }),
        timeout,
      ]);
      if (response.redirected) {
        await response.body?.cancel();
        throw new Error('Unexpected followed recovery redirect');
      }
      if (response.status === 302 && options.binary) {
        await response.body?.cancel();
        if (redirects >= RECOVERY_LIMITS.maxRedirects)
          throw new Error('Too many recovery redirects');
        const location = response.headers.get('location');
        if (!location) throw new Error('Missing recovery redirect');
        url = allowedRedirect(location, url);
        continue;
      }
      if (response.status === 404 && options.allow404) {
        await response.body?.cancel();
        return {
          status: 404,
          bytes: Buffer.alloc(0),
          binding: { byteLength: 0, sha256: sha256Bytes(Buffer.alloc(0)) },
        };
      }
      if (response.status !== 200 || !response.body) {
        await response.body?.cancel();
        throw new Error('Recovery HTTP state unavailable');
      }
      // Fetch decodes HTTP content coding; a compressed wire length is not the decoded file size.
      const encoding = response.headers.get('content-encoding');
      const header =
        !encoding || encoding.trim().toLowerCase() === 'identity'
          ? response.headers.get('content-length')
          : null;
      if (
        header !== null &&
        (!/^\d+$/.test(header) ||
          !Number.isSafeInteger(Number(header)) ||
          Number(header) > maxBytes)
      ) {
        await response.body.cancel();
        throw new Error('Recovery response exceeds byte limit');
      }
      const reader = response.body.getReader();
      const hash = createHash('sha256');
      const chunks: Buffer[] = [];
      let size = 0;
      try {
        while (true) {
          reset();
          const next = await Promise.race([reader.read(), timeout]);
          if (next.done) break;
          size += next.value.length;
          if (size > maxBytes) throw new Error('Recovery response exceeds byte limit');
          hash.update(next.value);
          if (options.onChunk) await Promise.race([options.onChunk(next.value), timeout]);
          else chunks.push(Buffer.from(next.value));
        }
        if (header !== null && Number(header) !== size)
          throw new Error('Recovery response length mismatch');
      } catch (error) {
        controller.abort();
        await reader.cancel().catch(() => {});
        throw error;
      } finally {
        reader.releaseLock();
      }
      return {
        status: 200,
        bytes: Buffer.concat(chunks),
        binding: { byteLength: size, sha256: hash.digest('hex') },
      };
    }
  } catch {
    controller.abort();
    throw new Error('Recovery network read failed');
  } finally {
    clearTimeout(timer);
  }
}
function parse(bytes: Buffer): unknown {
  return JSON.parse(new TextDecoder('utf8', { fatal: true }).decode(bytes));
}
async function metadata(path: string, fetcher: typeof fetch): Promise<Record<string, unknown>> {
  const result = parse(
    (await readRecoveryResource(new URL(`${API}/${path}`), RECOVERY_LIMITS.maxJsonBytes, fetcher))
      .bytes,
  );
  if (!object(result)) throw new Error('Invalid recovery API metadata');
  return result;
}
function assertAssetMetadata(asset: unknown, binding: RecoveryApprovalV1['assets']['snapshot']) {
  if (
    !object(asset) ||
    asset.id !== binding.id ||
    asset.name !== binding.name ||
    asset.size !== binding.byteLength ||
    asset.state !== 'uploaded' ||
    asset.url !== `${API}/releases/assets/${binding.id}`
  )
    throw new Error('Recovery asset metadata mismatch');
}
async function verifyRelease(approval: RecoveryApprovalV1, fetcher: typeof fetch) {
  const release = await metadata(`releases/${approval.releaseId}`, fetcher);
  if (
    release.id !== approval.releaseId ||
    release.url !== `${API}/releases/${approval.releaseId}` ||
    release.tag_name !== approval.tag ||
    release.draft !== false ||
    !Array.isArray(release.assets)
  )
    throw new Error('Recovery release mismatch');
  for (const binding of Object.values(approval.assets)) {
    const matches = release.assets.filter(
      (asset) => object(asset) && (asset.id === binding.id || asset.name === binding.name),
    );
    if (matches.length !== 1) throw new Error('Recovery asset missing or replaced');
    const asset = matches[0];
    assertAssetMetadata(asset, binding);
  }
  const reference = await metadata(`git/ref/tags/${encodeURIComponent(approval.tag)}`, fetcher);
  if (reference.ref !== `refs/tags/${approval.tag}`)
    throw new Error('Recovery tag reference mismatch');
  let current = reference.object;
  const seen = new Set<string>();
  for (let hops = 0; ; hops++) {
    if (
      !object(current) ||
      typeof current.sha !== 'string' ||
      !/^[a-f0-9]{40}$/.test(current.sha) ||
      (current.type !== 'commit' && current.type !== 'tag') ||
      current.url !== `${API}/git/${current.type === 'tag' ? 'tags' : 'commits'}/${current.sha}`
    )
      throw new Error('Invalid recovery tag target');
    if (current.type === 'commit') {
      if (current.sha !== approval.expectedProvenance.sourceCommit)
        throw new Error('Recovery source commit mismatch');
      const commit = await metadata(`git/commits/${current.sha}`, fetcher);
      if (commit.sha !== current.sha) throw new Error('Recovery commit mismatch');
      return;
    }
    if (hops >= 5 || seen.has(current.sha))
      throw new Error('Recovery tag chain exceeds bound or cycles');
    seen.add(current.sha);
    const tag = await metadata(`git/tags/${current.sha}`, fetcher);
    if (tag.sha !== current.sha) throw new Error('Recovery annotated tag mismatch');
    current = tag.object;
  }
}

/** Retrieve only byte-bound approved public assets; extraction/semantic validation is Task 2. */
export async function downloadApprovedRecovery(
  approval: RecoveryApprovalV1,
  newDirectory: string,
  fetcher: typeof fetch = fetch,
): Promise<{ gzipPath: string; inventory: SnapshotInventoryV1; provenance: RecoveryProvenanceV1 }> {
  const trusted = validateRecoveryApproval(approval, {
    siteUrl: approval.siteUrl,
    policyRevision: approval.expectedProvenance.identity.policyRevision,
  });
  const output = resolve(newDirectory);
  try {
    await lstat(output);
    throw new Error('Recovery output already exists');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
  const parent = await lstat(dirname(output));
  if (!parent.isDirectory() || parent.isSymbolicLink())
    throw new Error('Unsafe recovery download parent');
  // Verify authority before creating even a private staging directory.
  await verifyRelease(trusted, fetcher);
  for (const binding of Object.values(trusted.assets))
    assertAssetMetadata(await metadata(`releases/assets/${binding.id}`, fetcher), binding);
  const scratch = await mkdtemp(join(dirname(output), `.${basename(output)}.download-`));
  let reserved: Awaited<ReturnType<typeof lstat>> | undefined;
  try {
    async function assetBytes(role: 'inventory' | 'provenance') {
      const binding = trusted.assets[role];
      const result = await readRecoveryResource(
        new URL(`${API}/releases/assets/${binding.id}`),
        binding.byteLength,
        fetcher,
        { binary: true },
      );
      equalBinding(result.binding, binding);
      return result.bytes;
    }
    const inventory = validateSnapshotInventory(parse(await assetBytes('inventory')));
    equalBinding(
      {
        byteLength: inventoryBytes(inventory).length,
        sha256: sha256Bytes(inventoryBytes(inventory)),
      },
      trusted.expectedProvenance.inventory,
    );
    const provenance = validateRecoveryProvenance(parse(await assetBytes('provenance')), {
      siteUrl: trusted.siteUrl,
      policyRevision: trusted.expectedProvenance.identity.policyRevision,
    });
    if (!isDeepStrictEqual(provenance, trusted.expectedProvenance))
      throw new Error('Recovery provenance differs from reviewed authority');
    const file = await open(join(scratch, 'snapshot.tar.gz'), 'wx', 0o600);
    try {
      const binding = trusted.assets.snapshot;
      const result = await readRecoveryResource(
        new URL(`${API}/releases/assets/${binding.id}`),
        binding.byteLength,
        fetcher,
        {
          binary: true,
          onChunk: async (chunk) => {
            let offset = 0;
            while (offset < chunk.length) {
              const { bytesWritten } = await file.write(chunk, offset, chunk.length - offset);
              if (bytesWritten === 0) throw new Error('Recovery download write made no progress');
              offset += bytesWritten;
            }
          },
        },
      );
      equalBinding(result.binding, binding);
    } finally {
      await file.close();
    }
    await mkdir(output, { mode: 0o700 });
    reserved = await lstat(output);
    await rename(scratch, output);
    reserved = undefined;
    return { gzipPath: join(output, 'snapshot.tar.gz'), inventory, provenance };
  } finally {
    await rm(scratch, { recursive: true, force: true });
    if (reserved) {
      const current = await lstat(output).catch(() => undefined);
      if (current?.ino === reserved.ino && current.dev === reserved.dev)
        await rmdir(output).catch(() => {});
    }
  }
}
