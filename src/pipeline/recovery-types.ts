import { createHash } from 'node:crypto';
import { object, sameKeys, sha256 } from './refresh-validation-types.js';

export const RECOVERY_LIMITS = {
  maxFiles: 10_000,
  maxTarMembers: 20_001,
  maxSiteBytes: 1_000_000_000,
  maxFileBytes: 536_870_912,
  maxTarBytes: 1_020_000_000,
  maxGzipBytes: 1_020_000_000,
  maxInventoryBytes: 4 * 1024 * 1024,
  maxProvenanceBytes: 64 * 1024,
  maxJsonBytes: 1024 * 1024,
  maxPathBytes: 255,
  inactivityTimeoutMs: 30_000,
  archiveTimeoutMs: 15 * 60 * 1000,
  maxRedirects: 5,
} as const;

export interface ByteBinding {
  byteLength: number;
  sha256: string;
}
export interface SnapshotFile extends ByteBinding {
  name: string;
}
export interface SnapshotInventoryV1 {
  version: 1;
  kind: 'publication-inventory';
  files: SnapshotFile[];
  totalBytes: number;
}
export interface PublicationIdentityV1 {
  releaseSha256: string;
  manifestSha256: string;
  baselineSha256: string;
  archiveSha256: string;
  collectedAt: string;
  recordCount: number;
  policyRevision: string;
  schemaVersion: 2;
  identifierVersion: 1;
  normalizationVersion: 1;
}
export interface VerifiedPublicationV1 extends PublicationIdentityV1 {
  inventory: SnapshotInventoryV1;
  inventorySha256: string;
}
export interface PublicVerificationReceiptV1 {
  version: 1;
  kind: 'public-bytes-verified';
  siteUrl: string;
  checkedAt: string;
  inventorySha256: string;
  releaseSha256: string;
}
export interface RecoveryProvenanceV1 {
  version: 1;
  kind: 'verified-publication-backup';
  repository: string;
  siteUrl: string;
  sourceCommit: string;
  workflowCommit: string;
  workflowPath: string;
  runId: number;
  artifactId: number;
  deploymentId: string;
  deploymentOutcome: 'success';
  verifiedAt: string;
  identity: PublicationIdentityV1;
  inventory: ByteBinding;
  tar: ByteBinding;
  gzip: ByteBinding;
  publicVerification: { receipt: PublicVerificationReceiptV1; binding: ByteBinding };
}
export interface RecoveryAssetBinding extends ByteBinding {
  id: number;
  name: string;
}
export interface RecoveryApprovalV1 {
  id: string;
  repository: string;
  siteUrl: string;
  releaseId: number;
  tag: string;
  assets: {
    snapshot: RecoveryAssetBinding;
    inventory: RecoveryAssetBinding;
    provenance: RecoveryAssetBinding;
  };
  expectedProvenance: RecoveryProvenanceV1;
}

export function sha256Bytes(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}

/** Relative URL-safe paths only; reject sensitive metadata before opening any file. */
export function assertSnapshotName(name: unknown): asserts name is string {
  if (
    typeof name !== 'string' ||
    name.length === 0 ||
    name.normalize('NFC') !== name ||
    Buffer.byteLength(name) > RECOVERY_LIMITS.maxPathBytes ||
    /[\\:%?#\p{Cc}]/u.test(name)
  )
    throw new Error('Unsafe snapshot path');
  const parts = name.split('/');
  for (const part of parts) {
    const lower = part.toLowerCase();
    if (
      !part ||
      part === '.' ||
      part === '..' ||
      part.trim() !== part ||
      [
        '.git',
        '.github',
        '.hg',
        '.svn',
        '.gitignore',
        '.gitattributes',
        '.gitmodules',
        'agents.md',
        'package.json',
        'package-lock.json',
        '.npmrc',
        '.netrc',
        'id_rsa',
        'id_ed25519',
        'credentials',
      ].includes(lower) ||
      lower === '.env' ||
      lower.startsWith('.env.') ||
      /\.(pem|key|p12|pfx)$/i.test(part)
    ) {
      throw new Error('Unsafe or forbidden snapshot path');
    }
  }
}

/** Validate and rebuild the exact canonical field order used for the inventory binding. */
export function validateSnapshotInventory(value: unknown): SnapshotInventoryV1 {
  if (
    !object(value) ||
    !sameKeys(value, ['version', 'kind', 'files', 'totalBytes']) ||
    value.version !== 1 ||
    value.kind !== 'publication-inventory' ||
    !Array.isArray(value.files) ||
    value.files.length > RECOVERY_LIMITS.maxFiles ||
    !Number.isSafeInteger(value.totalBytes) ||
    (value.totalBytes as number) < 0 ||
    (value.totalBytes as number) > RECOVERY_LIMITS.maxSiteBytes
  ) {
    throw new Error('Invalid snapshot inventory');
  }
  let previous = '';
  let totalBytes = 0;
  let encodedFileBytes = 0;
  const files: SnapshotFile[] = [];
  for (const file of value.files) {
    if (!object(file) || !sameKeys(file, ['name', 'byteLength', 'sha256']))
      throw new Error('Invalid snapshot file');
    assertSnapshotName(file.name);
    if (
      file.name <= previous ||
      !Number.isSafeInteger(file.byteLength) ||
      (file.byteLength as number) < 0 ||
      (file.byteLength as number) > RECOVERY_LIMITS.maxFileBytes ||
      !sha256(file.sha256)
    )
      throw new Error('Invalid snapshot file binding');
    previous = file.name;
    totalBytes += file.byteLength as number;
    if (totalBytes > RECOVERY_LIMITS.maxSiteBytes) throw new Error('Snapshot exceeds site limit');
    const binding = { name: file.name, byteLength: file.byteLength as number, sha256: file.sha256 };
    encodedFileBytes += Buffer.byteLength(JSON.stringify(binding)) + (files.length ? 1 : 0);
    if (encodedFileBytes > RECOVERY_LIMITS.maxInventoryBytes)
      throw new Error('Snapshot inventory exceeds byte limit');
    files.push(binding);
  }
  if (totalBytes !== value.totalBytes) throw new Error('Snapshot byte total mismatch');
  const result: SnapshotInventoryV1 = {
    version: 1,
    kind: 'publication-inventory',
    files,
    totalBytes,
  };
  const envelopeBytes = Buffer.byteLength(JSON.stringify({ ...result, files: [] })) + 1;
  if (encodedFileBytes + envelopeBytes > RECOVERY_LIMITS.maxInventoryBytes)
    throw new Error('Snapshot inventory exceeds byte limit');
  return result;
}

export function inventoryBytes(inventory: SnapshotInventoryV1): Buffer {
  return Buffer.from(`${JSON.stringify(inventory)}\n`);
}
