import { lstat, mkdir, mkdtemp, open, rename, rm, rmdir } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { validateInitialSourceApproval } from './initial-import-approval.js';
import {
  INITIAL_SOURCE,
  type InitialSourceApprovalV1,
  type InitialSourceAssetV1,
  type InitialSourceFilesV1,
} from './initial-import-types.js';
import { readRecoveryResource } from './recovery-download.js';
import { RECOVERY_LIMITS, type ByteBinding } from './recovery-types.js';
import { object } from './refresh-validation-types.js';

const API = 'https://api.github.com/repos/internalforces/open-store-searcher';
const roles = ['archive', 'observation'] as const;
type FileIdentity = { dev: number; ino: number };
function sameFile(actual: FileIdentity, expected: FileIdentity): boolean {
  return actual.dev === expected.dev && actual.ino === expected.ino;
}
async function existing(path: string) {
  try {
    return await lstat(path);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
    throw error;
  }
}
async function newOutput(path: string): Promise<void> {
  if (await existing(path)) throw new Error('Initial source output already exists');
  const parent = await lstat(dirname(path));
  if (!parent.isDirectory() || parent.isSymbolicLink())
    throw new Error('Unsafe initial source output parent');
}
async function removeOwned(path: string, identity: FileIdentity, directory = false) {
  const current = await existing(path);
  if (current && sameFile(current, identity)) {
    try {
      await rm(path, { recursive: directory, force: true });
    } catch {
      throw new Error('Initial source cleanup failed');
    }
  }
}
function equalBinding(actual: ByteBinding, expected: ByteBinding): void {
  if (actual.byteLength !== expected.byteLength || actual.sha256 !== expected.sha256)
    throw new Error('Initial source byte binding mismatch');
}

/** Stream one immutable same-repository asset into a newly owned regular file. */
export async function downloadInitialAsset(
  asset: InitialSourceAssetV1,
  newFile: string,
  fetcher: typeof fetch = fetch,
): Promise<ByteBinding> {
  // Small exact byte bindings are useful for exercising the transport primitive; only the
  // high-level approval validator can admit the selected retained source as source authority.
  if (
    !Number.isSafeInteger(asset.id) ||
    asset.id <= 0 ||
    !roles.some((role) => asset.name === INITIAL_SOURCE.assetNames[role]) ||
    !Number.isSafeInteger(asset.byteLength) ||
    asset.byteLength <= 0 ||
    !/^[a-f0-9]{64}$/.test(asset.sha256)
  )
    throw new Error('Invalid initial source asset binding');
  const assetUrl = new URL(`${API}/releases/assets/${asset.id}`);
  const assetFetcher: typeof fetch = (input, options) => {
    const requested = new URL(input instanceof Request ? input.url : String(input));
    if (requested.hostname === 'api.github.com' && requested.href !== assetUrl.href)
      throw new Error('Unsupported initial source API redirect');
    return fetcher(input, options);
  };
  const output = resolve(newFile);
  await newOutput(output);
  const file = await open(output, 'wx', 0o600);
  let identity: FileIdentity | undefined;
  try {
    let result: ByteBinding;
    try {
      const stat = await file.stat();
      identity = stat;
      if (!stat.isFile()) throw new Error('Initial source output is not a regular file');
      result = (
        await readRecoveryResource(assetUrl, asset.byteLength, assetFetcher, {
          binary: true,
          onChunk: async (chunk) => {
            let offset = 0;
            while (offset < chunk.length) {
              const { bytesWritten } = await file.write(chunk, offset, chunk.length - offset);
              if (
                !Number.isSafeInteger(bytesWritten) ||
                bytesWritten <= 0 ||
                bytesWritten > chunk.length - offset
              )
                throw new Error('Initial source write made no progress');
              offset += bytesWritten;
            }
          },
        })
      ).binding;
      equalBinding(result, asset);
      const current = await lstat(output);
      if (!current.isFile() || !sameFile(current, stat))
        throw new Error('Initial source output ownership changed');
    } finally {
      await file.close();
    }
    return result;
  } catch (error) {
    if (identity) await removeOwned(output, identity);
    throw error;
  }
}

async function metadata(path: string, fetcher: typeof fetch): Promise<Record<string, unknown>> {
  const { bytes } = await readRecoveryResource(
    new URL(`${API}/${path}`),
    RECOVERY_LIMITS.maxJsonBytes,
    fetcher,
  );
  // Invalid JSON error messages can contain body excerpts. Keep downloaded content private.
  try {
    const value: unknown = JSON.parse(new TextDecoder('utf8', { fatal: true }).decode(bytes));
    if (object(value)) return value;
  } catch {
    /* Omit untrusted metadata content. */
  }
  throw new Error('Invalid initial source API metadata');
}
function assetMetadata(value: unknown, binding: InitialSourceAssetV1) {
  if (
    !object(value) ||
    value.id !== binding.id ||
    value.name !== binding.name ||
    value.size !== binding.byteLength ||
    value.state !== 'uploaded' ||
    value.url !== `${API}/releases/assets/${binding.id}`
  )
    throw new Error('Initial source asset metadata mismatch');
  // download_count changes during a valid read. Retain identity/content metadata only.
  return {
    id: value.id,
    name: value.name,
    size: value.size,
    state: value.state,
    url: value.url,
    created_at: value.created_at,
    updated_at: value.updated_at,
    digest: value.digest,
  };
}
async function tagTarget(approval: InitialSourceApprovalV1, fetcher: typeof fetch) {
  const reference = await metadata(`git/ref/tags/${approval.tag}`, fetcher);
  if (
    reference.ref !== `refs/tags/${approval.tag}` ||
    reference.url !== `${API}/git/refs/tags/${approval.tag}`
  )
    throw new Error('Initial source tag reference mismatch');
  let current = reference.object;
  const seen = new Set<string>();
  const chain: string[] = [];
  for (let hops = 0; ; hops++) {
    if (
      !object(current) ||
      typeof current.sha !== 'string' ||
      !/^[a-f0-9]{40}$/.test(current.sha) ||
      (current.type !== 'commit' && current.type !== 'tag') ||
      current.url !== `${API}/git/${current.type === 'tag' ? 'tags' : 'commits'}/${current.sha}`
    )
      throw new Error('Invalid initial source tag target');
    chain.push(current.sha);
    if (current.type === 'commit') {
      if (current.sha !== approval.tagCommit) throw new Error('Initial source tag commit mismatch');
      const commit = await metadata(`git/commits/${current.sha}`, fetcher);
      if (commit.sha !== current.sha || commit.url !== current.url)
        throw new Error('Initial source commit metadata mismatch');
      return chain;
    }
    if (hops >= 5 || seen.has(current.sha))
      throw new Error('Initial source tag chain exceeds bound or cycles');
    seen.add(current.sha);
    const tag = await metadata(`git/tags/${current.sha}`, fetcher);
    if (tag.sha !== current.sha || tag.url !== current.url)
      throw new Error('Initial source annotated tag mismatch');
    current = tag.object;
  }
}
async function verifyMetadata(approval: InitialSourceApprovalV1, fetcher: typeof fetch) {
  const release = await metadata(`releases/${approval.releaseId}`, fetcher);
  if (
    release.id !== approval.releaseId ||
    release.url !== `${API}/releases/${approval.releaseId}` ||
    release.tag_name !== approval.tag ||
    release.draft !== false ||
    typeof release.published_at !== 'string' ||
    !Number.isFinite(Date.parse(release.published_at)) ||
    !Array.isArray(release.assets)
  )
    throw new Error('Initial source release metadata mismatch');
  const listed = roles.map((role) => {
    const binding = approval.assets[role];
    const matches = (release.assets as unknown[]).filter(
      (asset) => object(asset) && (asset.id === binding.id || asset.name === binding.name),
    );
    if (matches.length !== 1) throw new Error('Initial source asset missing or replaced');
    return assetMetadata(matches[0], binding);
  });
  const chain = await tagTarget(approval, fetcher);
  const individual = [];
  for (const role of roles) {
    const binding = approval.assets[role];
    individual.push(
      assetMetadata(await metadata(`releases/assets/${binding.id}`, fetcher), binding),
    );
  }
  if (!isDeepStrictEqual(listed, individual))
    throw new Error('Initial source metadata changed during admission');
  return { publishedAt: release.published_at, listed, individual, chain };
}

/** Admit selected authority before materialization and promote only complete stable downloads. */
export async function downloadInitialSource(
  approval: InitialSourceApprovalV1,
  newDirectory: string,
  fetcher: typeof fetch = fetch,
): Promise<InitialSourceFilesV1> {
  const trusted = validateInitialSourceApproval(approval);
  const output = resolve(newDirectory);
  await newOutput(output);
  const before = await verifyMetadata(trusted, fetcher);
  const scratch = await mkdtemp(join(dirname(output), `.${basename(output)}.download-`));
  const owned = await lstat(scratch);
  let reserved: FileIdentity | undefined;
  try {
    for (const role of roles)
      await downloadInitialAsset(
        trusted.assets[role],
        join(scratch, INITIAL_SOURCE.assetNames[role]),
        fetcher,
      );
    const after = await verifyMetadata(trusted, fetcher);
    if (!isDeepStrictEqual(before, after))
      throw new Error('Initial source metadata changed during download');
    const current = await lstat(scratch);
    if (!current.isDirectory() || !sameFile(current, owned))
      throw new Error('Initial source staging ownership changed');
    await mkdir(output, { mode: 0o700 });
    reserved = await lstat(output);
    await rename(scratch, output);
    reserved = undefined;
  } catch (error) {
    let cleanupFailed = false;
    try {
      await removeOwned(scratch, owned, true);
    } catch {
      cleanupFailed = true;
    }
    if (reserved) {
      try {
        const current = await existing(output);
        if (current && sameFile(current, reserved)) await rmdir(output);
      } catch {
        cleanupFailed = true;
      }
    }
    if (cleanupFailed) throw new Error('Initial source cleanup failed');
    throw error;
  }
  return {
    archivePath: join(output, INITIAL_SOURCE.assetNames.archive),
    observationPath: join(output, INITIAL_SOURCE.assetNames.observation),
    transport: {
      kind: 'github-release',
      releaseId: trusted.releaseId,
      tag: trusted.tag,
      tagCommit: trusted.tagCommit,
      assets: trusted.assets,
      downloadedAt: new Date().toISOString(),
    },
  };
}
