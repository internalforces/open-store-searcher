import { createHash } from 'node:crypto';
import type { ValidationBaselineV1 } from './refresh-validation-types.js';
import { object, sha256 } from './refresh-validation-types.js';
import { validateJsonBytesV1 } from './validate-json-bytes.js';

/** Fail closed on missing, changed, oversized or mismatched deployed state. Never bootstrap. */
export async function readDeployedBaseline(
  releaseUrl: string,
  maxBytes: number,
  fetcher: typeof fetch = fetch,
): Promise<ValidationBaselineV1> {
  const url = new URL(releaseUrl);
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    !url.pathname.endsWith('/release.json')
  )
    throw new Error('Invalid deployed release URL');
  if (!Number.isSafeInteger(maxBytes) || maxBytes <= 0)
    throw new Error('Invalid deployed state limit');
  const read = async (target: URL) => {
    const response = await fetcher(target, {
      redirect: 'error',
      credentials: 'omit',
      cache: 'no-store',
      referrerPolicy: 'no-referrer',
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok || !response.body) {
      await response.body?.cancel();
      throw new Error('Deployed baseline unavailable; explicit bootstrap review required');
    }
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      while (true) {
        const next = await reader.read();
        if (next.done) break;
        size += next.value.length;
        if (size > maxBytes) throw new Error('Deployed state exceeds byte limit');
        chunks.push(next.value);
      }
    } catch (error) {
      await reader.cancel();
      throw error;
    } finally {
      reader.releaseLock();
    }
    const bytes = Buffer.concat(chunks);
    if (validateJsonBytesV1(bytes, maxBytes).kind !== 'accepted')
      throw new Error('Invalid deployed JSON');
    return bytes;
  };
  const before = await read(url);
  const release: unknown = JSON.parse(before.toString('utf8'));
  if (
    !object(release) ||
    release.version !== 1 ||
    release.kind !== 'validated-staging' ||
    release.dateBasis !== 'collection' ||
    release.sourceDataAsOf !== null ||
    !Array.isArray(release.entries)
  )
    throw new Error('Invalid deployed release descriptor');
  const entries = release.entries.filter(
    (entry) => object(entry) && entry.name === 'baseline.json',
  );
  if (entries.length !== 1 || !object(entries[0]) || !sha256(entries[0].sha256))
    throw new Error('Missing deployed baseline binding');
  const baselineBytes = await read(new URL('baseline.json', url));
  if (
    baselineBytes.length !== entries[0].byteLength ||
    createHash('sha256').update(baselineBytes).digest('hex') !== entries[0].sha256
  )
    throw new Error('Deployed baseline hash mismatch');
  const after = await read(url);
  if (!before.equals(after)) throw new Error('Deployment changed during baseline read');
  const baseline: unknown = JSON.parse(baselineBytes.toString('utf8'));
  if (
    !object(baseline) ||
    baseline.dateBasis !== 'collection' ||
    baseline.archiveSha256 !== release.archiveSha256 ||
    baseline.policyRevision !== release.policyRevision
  )
    throw new Error('Deployed baseline metadata mismatch');
  // The staged validator subsequently checks the full baseline schema and metrics.
  return baseline as unknown as ValidationBaselineV1;
}
