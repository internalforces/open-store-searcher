import { COMPACT_MAX_BYTES } from '../shared/compact-data.js';
import { isCanonicalUtc } from './collector-types.js';
import { readDeployedBaseline } from './read-deployed-baseline.js';
import { validateRecoveryApproval } from './recovery-approval.js';
import { readRecoveryResource } from './recovery-download.js';
import { object } from './refresh-validation-types.js';
import {
  inventoryBytes,
  sha256Bytes,
  validateSnapshotInventory,
  type PublicVerificationReceiptV1,
  type RecoveryApprovalV1,
  type VerifiedPublicationV1,
} from './recovery-types.js';

const SITE = 'https://internalforces.github.io/open-store-searcher/';
function siteBase(siteUrl: string): URL {
  if (siteUrl !== SITE) throw new Error('Invalid recovery public site');
  return new URL(siteUrl);
}
function publicUrl(base: URL, name: string) {
  const target = new URL(
    name
      .split('/')
      .map((part) => encodeURIComponent(part))
      .join('/'),
    base,
  );
  if (
    target.origin !== base.origin ||
    !target.pathname.startsWith(base.pathname) ||
    target.search ||
    target.hash
  )
    throw new Error('Unsafe public file URL');
  return target;
}

/** A public-byte receipt says nothing about the separate deployment API outcome. */
export async function reconcilePublication(
  siteUrl: string,
  expected: VerifiedPublicationV1,
  fetcher: typeof fetch = fetch,
): Promise<
  | { kind: 'verified'; receipt: PublicVerificationReceiptV1 }
  | { kind: 'unverified'; reason: string }
> {
  try {
    const base = siteBase(siteUrl);
    const inventory = validateSnapshotInventory(expected.inventory);
    if (sha256Bytes(inventoryBytes(inventory)) !== expected.inventorySha256)
      throw new Error('Stale public inventory binding');
    const release = inventory.files.find((file) => file.name === 'release.json');
    const baseline = inventory.files.find((file) => file.name === 'baseline.json');
    const manifest = inventory.files.find(
      (file) => file.name === `assets/compact-manifest-${expected.manifestSha256}.json`,
    );
    if (
      !release ||
      release.byteLength <= 0 ||
      release.byteLength > COMPACT_MAX_BYTES ||
      release.sha256 !== expected.releaseSha256 ||
      !baseline ||
      baseline.sha256 !== expected.baselineSha256 ||
      !manifest ||
      manifest.sha256 !== expected.manifestSha256
    )
      throw new Error('Invalid expected publication identity');
    const readFile = async (file: typeof release) => {
      const result = await readRecoveryResource(
        publicUrl(base, file.name),
        file.byteLength,
        fetcher,
      );
      if (result.binding.byteLength !== file.byteLength || result.binding.sha256 !== file.sha256)
        throw new Error('Public file byte mismatch');
      return result.bytes;
    };
    const before = await readFile(release);
    const remaining = inventory.files.filter((file) => file.name !== 'release.json');
    let cursor = 0;
    const workers = Array.from({ length: Math.min(4, remaining.length) }, async () => {
      while (cursor < remaining.length) {
        const file = remaining[cursor++];
        if (file) await readFile(file);
      }
    });
    const outcomes = await Promise.allSettled(workers);
    if (outcomes.some((outcome) => outcome.status === 'rejected'))
      throw new Error('Public inventory could not be verified');
    if (!before.equals(await readFile(release)))
      throw new Error('Public descriptor changed during verification');
    return {
      kind: 'verified',
      receipt: {
        version: 1,
        kind: 'public-bytes-verified',
        siteUrl,
        checkedAt: new Date().toISOString(),
        inventorySha256: expected.inventorySha256,
        releaseSha256: expected.releaseSha256,
      },
    };
  } catch {
    return {
      kind: 'unverified',
      reason: 'Complete public bytes could not be verified; deployment outcome remains separate',
    };
  }
}

/** Decode one bounded string candidate without inheriting surrounding malformed quote state. */
function jsonStringCandidate(
  text: string,
  start: number,
  maxDecodedLength: number,
): { value: string; end: number } | undefined {
  if (text[start] !== '"') return;
  // Each UTF-16 unit occupies at most six JSON characters (a Unicode escape), plus quotes.
  const end = Math.min(text.length, start + maxDecodedLength * 6 + 2);
  let escaped = false;
  for (let cursor = start + 1; cursor < end; cursor++) {
    const character = text[cursor];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (character === '\\') {
      escaped = true;
      continue;
    }
    if (character !== '"') continue;
    try {
      const value: unknown = JSON.parse(text.slice(start, cursor + 1));
      if (typeof value === 'string' && value.length <= maxDecodedLength)
        return { value, end: cursor + 1 };
    } catch {
      /* Invalid candidates cannot expose a canonical decoded timestamp. */
    }
    return;
  }
}

/** Consider every quote independently; key/value scans have fixed 68/146-character ceilings. */
function* exposedCollectionDates(text: string): Generator<string> {
  for (let start = text.indexOf('"'); start !== -1; start = text.indexOf('"', start + 1)) {
    const key = jsonStringCandidate(text, start, 'collectedAt'.length);
    if (key?.value !== 'collectedAt') continue;
    let cursor = key.end;
    while (/\s/.test(text[cursor] ?? '')) cursor++;
    if (text[cursor++] !== ':') continue;
    while (/\s/.test(text[cursor] ?? '')) cursor++;
    // isCanonicalUtc accepts exactly 24 decoded characters; larger values cannot match it.
    const value = jsonStringCandidate(text, cursor, 24);
    if (value) yield value.value;
  }
}

/** Preparation evidence only. Missing/corrupt state is never bootstrap or rollback permission. */
export async function readRecoveryPrecondition(
  siteUrl: string,
  approval: RecoveryApprovalV1,
  fetcher: typeof fetch = fetch,
): Promise<{
  kind: 'same-snapshot' | 'absent' | 'corrupt';
  status: 200 | 404;
  releaseSha256: string | null;
}> {
  const base = siteBase(siteUrl);
  const trusted = validateRecoveryApproval(approval, {
    siteUrl,
    policyRevision: approval.expectedProvenance.identity.policyRevision,
  });
  const identity = trusted.expectedProvenance.identity;
  const descriptorUrl = publicUrl(base, 'release.json');
  const before = await readRecoveryResource(descriptorUrl, COMPACT_MAX_BYTES, fetcher, {
    allow404: true,
  });
  if (before.status === 404) return { kind: 'absent', status: 404, releaseSha256: null };
  const releaseSha256 = before.binding.sha256;
  let descriptor: unknown = null;
  let text: string | undefined;
  try {
    text = new TextDecoder('utf8', { fatal: true }).decode(before.bytes);
  } catch {
    /* Invalid UTF-8 cannot participate in coherent semantic parsing. */
  }
  const rejectLaterCollection = (date: unknown) => {
    if (typeof date === 'string' && isCanonicalUtc(date) && date > identity.collectedAt)
      throw new Error(
        'Public descriptor exposes later collection; separate rollback decision required',
      );
  };
  if (text !== undefined) {
    try {
      descriptor = JSON.parse(text);
    } catch {
      /* Preserve malformed JSON for the decoded-string evidence scan below. */
    }
    // Decoded field values take precedence over every coherence/corruption classification.
    if (object(descriptor)) rejectLaterCollection(descriptor.collectedAt);
  }
  // Replacement decoding preserves visible evidence only; it never supplies semantic JSON.
  // Unrelated invalid bytes or malformed strings must not hide a later decoded pair.
  const evidenceText = text ?? new TextDecoder('utf8').decode(before.bytes);
  for (const date of exposedCollectionDates(evidenceText)) rejectLaterCollection(date);
  let finalDescriptorRead = false;
  let uncertain = false;
  let first = true;
  const confirmDescriptor = async () => {
    const after = await readRecoveryResource(descriptorUrl, COMPACT_MAX_BYTES, fetcher);
    if (!before.bytes.equals(after.bytes))
      throw new Error('Public descriptor changed during recovery preparation');
    finalDescriptorRead = true;
    return after.bytes;
  };
  const guardedFetcher = (async (input: string | URL | Request) => {
    const target = new URL(String(input));
    if (
      target.origin !== base.origin ||
      !target.pathname.startsWith(base.pathname) ||
      target.search ||
      target.hash
    ) {
      uncertain = true;
      throw new Error('Unsafe public recovery dependency');
    }
    try {
      if (target.href === descriptorUrl.href) {
        if (first) {
          first = false;
          return new Response(new Uint8Array(before.bytes));
        }
        return new Response(new Uint8Array(await confirmDescriptor()));
      }
      const result = await readRecoveryResource(target, COMPACT_MAX_BYTES, fetcher, {
        allow404: true,
      });
      return new Response(result.status === 404 ? null : new Uint8Array(result.bytes), {
        status: result.status,
      });
    } catch {
      uncertain = true;
      throw new Error('Uncertain public recovery state');
    }
  }) as typeof fetch;
  let coherent = false;
  try {
    if (
      !object(descriptor) ||
      typeof descriptor.collectedAt !== 'string' ||
      !isCanonicalUtc(descriptor.collectedAt)
    )
      throw new Error('Invalid public descriptor');
    const baseline = await readDeployedBaseline(
      descriptorUrl.href,
      COMPACT_MAX_BYTES,
      guardedFetcher,
    );
    if (
      descriptor.policyRevision !== baseline.policyRevision ||
      descriptor.archiveSha256 !== baseline.archiveSha256
    )
      throw new Error('Public baseline identity mismatch');
    coherent = true;
  } catch {
    if (uncertain) throw new Error('Uncertain public recovery state');
  }
  if (!finalDescriptorRead) await confirmDescriptor();
  if (!coherent) return { kind: 'corrupt', status: 200, releaseSha256 };
  if (releaseSha256 !== identity.releaseSha256)
    throw new Error('Coherent different public snapshot requires a separate decision');
  if (
    !object(descriptor) ||
    descriptor.collectedAt !== identity.collectedAt ||
    descriptor.archiveSha256 !== identity.archiveSha256 ||
    descriptor.policyRevision !== identity.policyRevision ||
    descriptor.recordCount !== identity.recordCount ||
    !Array.isArray(descriptor.entries) ||
    !descriptor.entries.some(
      (entry) =>
        object(entry) && entry.name === 'baseline.json' && entry.sha256 === identity.baselineSha256,
    ) ||
    !descriptor.entries.some(
      (entry) =>
        object(entry) &&
        entry.name === `assets/compact-manifest-${identity.manifestSha256}.json` &&
        entry.sha256 === identity.manifestSha256,
    )
  )
    throw new Error('Approved public identity mismatch');
  return { kind: 'same-snapshot', status: 200, releaseSha256 };
}
