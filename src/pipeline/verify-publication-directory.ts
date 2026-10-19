import { createHash } from 'node:crypto';
import { COMPACT_MAX_BYTES, validateCompactReleaseBinding } from '../shared/compact-data.js';
import { parseArchiveContract } from './archive-contract.js';
import { isCanonicalUtc } from './collector-types.js';
import approvedContract from './contracts/seoul-archive-contract.json' with { type: 'json' };
import { openSnapshotFile, scanPublicationDirectory } from './recovery-inventory.js';
import {
  inventoryBytes,
  type SnapshotFile,
  type SnapshotInventoryV1,
  sha256Bytes,
  type VerifiedPublicationV1,
  validateSnapshotInventory,
} from './recovery-types.js';
import { count, object, sameKeys, sha256, text } from './refresh-validation-types.js';
import { validationBaselineState } from './validate-license-refresh.js';
import { verifyCompactDirectory } from './verify-compact-directory.js';

/** Validate a complete publication with current trusted code, without loading its application. */
export async function verifyPublicationDirectory(
  siteDir: string,
  expected?: SnapshotInventoryV1,
): Promise<VerifiedPublicationV1> {
  const expectedInventory =
    expected === undefined ? undefined : validateSnapshotInventory(expected);
  const inventory = await scanPublicationDirectory(siteDir);
  const encoded = inventoryBytes(inventory);
  if (expectedInventory && !encoded.equals(inventoryBytes(expectedInventory)))
    throw new Error('Publication inventory mismatch');
  const files = new Map(inventory.files.map((file) => [file.name, file]));
  async function readJson(entry: SnapshotFile): Promise<unknown> {
    if (entry.byteLength <= 0 || entry.byteLength > COMPACT_MAX_BYTES)
      throw new Error('Publication JSON exceeds byte limit');
    const file = await openSnapshotFile(siteDir, entry.name);
    try {
      // Bounded incremental reads, even if the file grows after inventory preflight.
      const chunks: Buffer[] = [];
      let size = 0;
      for await (const chunk of file.createReadStream({ autoClose: false })) {
        size += chunk.length;
        if (size > entry.byteLength) throw new Error('Publication JSON changed');
        chunks.push(chunk);
      }
      const bytes = Buffer.concat(chunks, size);
      if (size !== entry.byteLength || sha256Bytes(bytes) !== entry.sha256)
        throw new Error('Publication JSON binding mismatch');
      return JSON.parse(new TextDecoder('utf8', { fatal: true }).decode(bytes));
    } finally {
      await file.close();
    }
  }
  const releaseFile = required(files.get('release.json'));
  const release = await readJson(releaseFile);
  if (
    !object(release) ||
    !sameKeys(release, [
      'version',
      'kind',
      'dateBasis',
      'sourceDataAsOf',
      'collectedAt',
      'archiveSha256',
      'policyRevision',
      'recordCount',
      'entries',
      ...(Object.hasOwn(release, 'warnings') ? ['warnings'] : []),
    ]) ||
    (Object.hasOwn(release, 'warnings') && !validCollectionWarnings(release.warnings)) ||
    release.version !== 2 ||
    release.kind !== 'validated-staging' ||
    release.dateBasis !== 'collection' ||
    release.sourceDataAsOf !== null ||
    typeof release.collectedAt !== 'string' ||
    !isCanonicalUtc(release.collectedAt) ||
    !sha256(release.archiveSha256) ||
    !text(release.policyRevision) ||
    !Number.isSafeInteger(release.recordCount) ||
    (release.recordCount as number) < 0 ||
    !Array.isArray(release.entries) ||
    release.entries.length !== 2
  )
    throw new Error('Invalid V2 publication descriptor');
  let manifestEntry: SnapshotFile | undefined;
  let baselineEntry: SnapshotFile | undefined;
  for (const entry of release.entries) {
    if (
      !object(entry) ||
      !sameKeys(entry, ['name', 'byteLength', 'sha256']) ||
      !sha256(entry.sha256) ||
      !Number.isSafeInteger(entry.byteLength) ||
      (entry.byteLength as number) <= 0 ||
      (entry.byteLength as number) > COMPACT_MAX_BYTES
    )
      throw new Error('Invalid publication descriptor entry');
    const actual = typeof entry.name === 'string' ? files.get(entry.name) : undefined;
    if (!actual || actual.byteLength !== entry.byteLength || actual.sha256 !== entry.sha256)
      throw new Error('Publication descriptor binding mismatch');
    if (entry.name === 'baseline.json' && !baselineEntry) baselineEntry = actual;
    else if (entry.name === `assets/compact-manifest-${entry.sha256}.json` && !manifestEntry)
      manifestEntry = actual;
    else throw new Error('Invalid publication descriptor roles');
  }
  const manifestFile = required(manifestEntry);
  const baselineFile = required(baselineEntry);
  const baseline = await readJson(baselineFile);
  const manifest = await verifyCompactDirectory(siteDir, manifestFile);
  validateCompactReleaseBinding(manifest, release, baseline);
  const contract = parseArchiveContract(approvedContract);
  const ids = contract.entries.map((entry) => entry.fileDataId);
  const schemaHash = createHash('sha256')
    .update(
      JSON.stringify(
        [...contract.entries]
          .sort((a, b) => a.entryName.localeCompare(b.entryName))
          .map((entry) => ({ ...entry, entryName: entry.entryName.normalize('NFC') })),
      ),
    )
    .digest('hex');
  if (validationBaselineState(baseline, ids, null, schemaHash) !== 'valid')
    throw new Error('Invalid or incompatible publication baseline');
  if (!encoded.equals(inventoryBytes(await scanPublicationDirectory(siteDir))))
    throw new Error('Publication changed during verification');
  return {
    releaseSha256: releaseFile.sha256,
    manifestSha256: manifestFile.sha256,
    baselineSha256: baselineFile.sha256,
    archiveSha256: release.archiveSha256,
    collectedAt: release.collectedAt,
    recordCount: release.recordCount as number,
    policyRevision: release.policyRevision,
    schemaVersion: 2,
    identifierVersion: 1,
    normalizationVersion: 1,
    inventory,
    inventorySha256: sha256Bytes(encoded),
  };
}

/** Only inert warning shapes emitted by accepted collection-mode validation are supported. */
function validCollectionWarnings(value: unknown): boolean {
  if (!Array.isArray(value) || value.length > 2) return false;
  const seen = new Set<string>();
  for (const warning of value) {
    if (
      !object(warning) ||
      warning.severity !== 'warning' ||
      typeof warning.code !== 'string' ||
      seen.has(warning.code)
    )
      return false;
    seen.add(warning.code);
    if (warning.code === 'source_coverage_unverified') {
      if (!sameKeys(warning, ['code', 'severity'])) return false;
    } else if (warning.code === 'collection_stale') {
      if (
        !sameKeys(warning, ['code', 'severity', 'metric', 'actual', 'limit']) ||
        warning.metric !== 'ageDays' ||
        !count(warning.actual) ||
        warning.actual < 7 ||
        warning.limit !== 7
      )
        return false;
    } else return false;
  }
  return true;
}

function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error('Missing publication file');
  return value;
}
