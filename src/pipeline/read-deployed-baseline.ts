import {
  validateManifest,
  validateCompactReleaseBinding,
  type CompactManifest,
} from '../shared/compact-data.js';
import { createHash } from 'node:crypto';
import type { ValidationBaselineV1 } from './refresh-validation-types.js';
import { object, sha256 } from './refresh-validation-types.js';
import { validateJsonBytesV1 } from './validate-json-bytes.js';

/** Read deployed state; explicit initial bootstrap requires a release-descriptor 404. */
export async function readDeployedBaseline(
  releaseUrl: string,
  maxBytes: number,
  fetcher: typeof fetch = fetch,
  bootstrap?: { baseline: ValidationBaselineV1 },
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
  const request = (target: URL) =>
    fetcher(target, {
      redirect: 'error',
      credentials: 'omit',
      cache: 'no-store',
      referrerPolicy: 'no-referrer',
      signal: AbortSignal.timeout(30_000),
    });
  // Do not infer first deployment from authentication, server, redirect or network errors.
  if (bootstrap) {
    const response = await request(url);
    await response.body?.cancel();
    if (response.status !== 404)
      throw new Error('Bootstrap requires an absent deployed release (HTTP 404)');
    return bootstrap.baseline;
  }
  const read = async (target: URL) => {
    const response = await request(target);
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
    (release.version !== 1 && release.version !== 2) ||
    release.kind !== 'validated-staging' ||
    release.dateBasis !== 'collection' ||
    release.sourceDataAsOf !== null ||
    !Array.isArray(release.entries)
  )
    throw new Error('Invalid deployed release descriptor');
  const entries = new Map<string, { byteLength: number; sha256: string }>();
  for (const entry of release.entries) {
    if (
      !object(entry) ||
      !sha256(entry.sha256) ||
      (entry.name !== 'baseline.json' &&
        entry.name !==
          (release.version === 1
            ? `assets/collected-dataset-${entry.sha256}.json`
            : `assets/compact-manifest-${entry.sha256}.json`)) ||
      typeof entry.byteLength !== 'number' ||
      !Number.isSafeInteger(entry.byteLength) ||
      entry.byteLength <= 0
    )
      throw new Error('Invalid deployed release entries');
    const key = entry.name === 'baseline.json' ? 'baseline.json' : 'dataset.json';
    if (entries.has(key)) throw new Error('Invalid deployed release entries');
    entries.set(key, { byteLength: entry.byteLength, sha256: entry.sha256 });
  }
  const baselineEntry = entries.get('baseline.json');
  if (entries.size !== 2 || !entries.has('dataset.json') || !baselineEntry)
    throw new Error('Invalid deployed release entries');
  let compactManifest: CompactManifest | null = null;
  if (release.version === 2) {
    const binding = required(entries.get('dataset.json'));
    const bytes = await read(new URL(`assets/compact-manifest-${binding.sha256}.json`, url));
    if (
      bytes.length !== binding.byteLength ||
      createHash('sha256').update(bytes).digest('hex') !== binding.sha256
    )
      throw new Error('Deployed manifest hash mismatch');
    const manifest = validateManifest(JSON.parse(bytes.toString('utf8')));
    compactManifest = manifest;
    if (
      manifest.archiveSha256 !== release.archiveSha256 ||
      manifest.policyRevision !== release.policyRevision ||
      manifest.recordCount !== release.recordCount
    )
      throw new Error('Deployed manifest metadata mismatch');
  }
  const baselineBytes = await read(new URL('baseline.json', url));
  if (
    baselineBytes.length !== baselineEntry.byteLength ||
    createHash('sha256').update(baselineBytes).digest('hex') !== baselineEntry.sha256
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
  if (compactManifest) validateCompactReleaseBinding(compactManifest, release, baseline);
  // The staged validator subsequently checks the full baseline schema and metrics.
  return baseline as unknown as ValidationBaselineV1;
}

function required<T>(v: T | null | undefined): T {
  if (v === null || v === undefined) throw new Error('Missing required compact value');
  return v;
}
