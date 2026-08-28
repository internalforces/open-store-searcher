import { createHash, randomUUID } from 'node:crypto';
import { open, realpath, rename, rm } from 'node:fs/promises';
import { isAbsolute, relative, resolve } from 'node:path';
import type { FileHandle } from 'node:fs/promises';
import type {
  CollectorLimits,
  CollectorRejectionCode,
  FetchLike,
  SourceEvidence,
} from './collector-types.js';
import { createProviderHeaders, isAllowedProviderUrl } from './source-contract.js';

export type StagedDownloadResult =
  | { kind: 'accepted'; archivePath: string; sha256: string; byteLength: number }
  | { kind: 'rejected'; code: CollectorRejectionCode; message: string };

export interface DownloadOptions {
  fetchImpl: FetchLike;
  stagingRoot: string;
  sourceEvidence: SourceEvidence;
  fetchedAt: string;
  limits: CollectorLimits;
  signal?: AbortSignal;
}

function reject(code: CollectorRejectionCode, message: string): StagedDownloadResult {
  return { kind: 'rejected', code, message };
}

function isCanonicalUtc(value: string): boolean {
  const parsed = new Date(value);
  return (
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) &&
    !Number.isNaN(parsed.valueOf()) &&
    parsed.toISOString() === value
  );
}

async function validateStagingRoot(stagingRoot: string): Promise<string | undefined> {
  if (!isAbsolute(stagingRoot) || resolve(stagingRoot) !== stagingRoot) return undefined;
  const root = await realpath(stagingRoot).catch(() => undefined);
  if (!root) return undefined;
  const repository = await realpath(process.cwd());
  const fromRepository = relative(repository, root);
  if (fromRepository === '' || (!fromRepository.startsWith('..') && !isAbsolute(fromRepository))) {
    return undefined;
  }
  return root;
}

export async function downloadArchiveToStaging(
  options: DownloadOptions,
): Promise<StagedDownloadResult> {
  const root = await validateStagingRoot(options.stagingRoot);
  if (
    !root ||
    !isCanonicalUtc(options.fetchedAt) ||
    !isAllowedProviderUrl(options.sourceEvidence.finalUrl)
  ) {
    return reject('transfer_incomplete', 'Staging path or retrieval evidence is invalid.');
  }
  const token = randomUUID();
  const partPath = resolve(root, `${token}.part`);
  const archivePath = resolve(root, `${token}.zip`);
  let handle: FileHandle | undefined;
  try {
    const deadlineSignal = AbortSignal.timeout(options.limits.downloadDeadlineMs);
    const signal = options.signal
      ? AbortSignal.any([options.signal, deadlineSignal])
      : deadlineSignal;
    const response = await options.fetchImpl(options.sourceEvidence.finalUrl, {
      method: 'GET',
      headers: createProviderHeaders('archive'),
      redirect: 'manual',
      signal,
    });
    if (response.status !== 200 || !response.body) {
      return reject('transfer_incomplete', 'Full archive response was not HTTP 200 with a body.');
    }
    if ((response.headers.get('content-type') ?? '').toLowerCase().includes('text/html')) {
      return reject('http_contract_changed', 'Provider returned HTML instead of archive bytes.');
    }
    const declaredLength = response.headers.get('content-length');
    if (
      declaredLength !== null &&
      Number(declaredLength) !== options.sourceEvidence.expectedBytes
    ) {
      return reject('transfer_incomplete', 'Declared archive size disagrees with range evidence.');
    }
    handle = await open(partPath, 'wx');
    const hash = createHash('sha256');
    let byteLength = 0;
    let signature = new Uint8Array();
    for await (const chunk of response.body) {
      const bytes = chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk);
      if (signature.length < 2) {
        const combined = new Uint8Array(Math.min(2, signature.length + bytes.length));
        combined.set(signature);
        combined.set(bytes.subarray(0, combined.length - signature.length), signature.length);
        signature = combined;
      }
      byteLength += bytes.length;
      if (
        byteLength > options.limits.maxArchiveBytes ||
        byteLength > options.sourceEvidence.expectedBytes
      ) {
        return reject('archive_size_out_of_bounds', 'Archive exceeded the approved byte count.');
      }
      hash.update(bytes);
      await handle.write(bytes);
    }
    if (
      byteLength !== options.sourceEvidence.expectedBytes ||
      byteLength < options.limits.minArchiveBytes ||
      (declaredLength !== null && Number(declaredLength) !== byteLength)
    ) {
      return reject(
        'transfer_incomplete',
        'Archive transfer did not match the expected byte count.',
      );
    }
    if (signature[0] !== 0x50 || signature[1] !== 0x4b) {
      return reject('transfer_incomplete', 'Archive does not have a ZIP signature.');
    }
    await handle.sync();
    await handle.close();
    handle = undefined;
    await rename(partPath, archivePath);
    return { kind: 'accepted', archivePath, sha256: hash.digest('hex'), byteLength };
  } catch {
    return reject('transfer_incomplete', 'Archive transfer or staging failed.');
  } finally {
    await handle?.close().catch(() => undefined);
    await rm(partPath, { force: true }).catch(() => undefined);
  }
}
