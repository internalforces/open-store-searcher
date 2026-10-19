import { isCanonicalUtc } from './collector-types.js';
import { object, sameKeys, sha256, text } from './refresh-validation-types.js';
import {
  RECOVERY_LIMITS,
  sha256Bytes,
  type RecoveryApprovalV1,
  type RecoveryProvenanceV1,
  type ByteBinding,
} from './recovery-types.js';

const REPOSITORY = 'internalforces/open-store-searcher';
const SITE = 'https://internalforces.github.io/open-store-searcher/';
type Config = { siteUrl: string; policyRevision: string };
function requireValue(condition: unknown): asserts condition {
  if (!condition) throw new Error('Invalid recovery authority');
}
function shape(value: unknown, keys: string[]): asserts value is Record<string, unknown> {
  requireValue(object(value) && sameKeys(value, keys));
}
function positive(value: unknown) {
  return Number.isSafeInteger(value) && (value as number) > 0;
}
function timestamp(value: unknown): value is string {
  return typeof value === 'string' && isCanonicalUtc(value);
}
export function assertRecoveryBinding(value: unknown, max: number): asserts value is ByteBinding {
  shape(value, ['byteLength', 'sha256']);
  requireValue(
    positive(value.byteLength) && (value.byteLength as number) <= max && sha256(value.sha256),
  );
}
function configValid(config: Config) {
  requireValue(config.siteUrl === SITE && text(config.policyRevision));
}

/** Shape/binding validation only: successful deployment history requires separate human evidence review. */
export function validateRecoveryProvenance(value: unknown, config: Config): RecoveryProvenanceV1 {
  configValid(config);
  shape(value, [
    'version',
    'kind',
    'repository',
    'siteUrl',
    'sourceCommit',
    'workflowCommit',
    'workflowPath',
    'runId',
    'artifactId',
    'deploymentId',
    'deploymentOutcome',
    'verifiedAt',
    'identity',
    'inventory',
    'tar',
    'gzip',
    'publicVerification',
  ]);
  requireValue(
    value.version === 1 &&
      value.kind === 'verified-publication-backup' &&
      value.repository === REPOSITORY &&
      value.siteUrl === config.siteUrl &&
      typeof value.sourceCommit === 'string' &&
      /^[a-f0-9]{40}$/.test(value.sourceCommit) &&
      typeof value.workflowCommit === 'string' &&
      /^[a-f0-9]{40}$/.test(value.workflowCommit) &&
      value.workflowPath === '.github/workflows/refresh.yml' &&
      positive(value.runId) &&
      positive(value.artifactId) &&
      text(value.deploymentId) &&
      value.deploymentOutcome === 'success' &&
      timestamp(value.verifiedAt),
  );
  const identity = value.identity;
  shape(identity, [
    'releaseSha256',
    'manifestSha256',
    'baselineSha256',
    'archiveSha256',
    'collectedAt',
    'recordCount',
    'policyRevision',
    'schemaVersion',
    'identifierVersion',
    'normalizationVersion',
  ]);
  requireValue(
    ['releaseSha256', 'manifestSha256', 'baselineSha256', 'archiveSha256'].every((key) =>
      sha256(identity[key]),
    ) &&
      timestamp(identity.collectedAt) &&
      identity.collectedAt <= value.verifiedAt &&
      Number.isSafeInteger(identity.recordCount) &&
      (identity.recordCount as number) >= 0 &&
      identity.policyRevision === config.policyRevision &&
      identity.schemaVersion === 2 &&
      identity.identifierVersion === 1 &&
      identity.normalizationVersion === 1,
  );
  assertRecoveryBinding(value.inventory, RECOVERY_LIMITS.maxInventoryBytes);
  assertRecoveryBinding(value.tar, RECOVERY_LIMITS.maxTarBytes);
  assertRecoveryBinding(value.gzip, RECOVERY_LIMITS.maxGzipBytes);
  const verification = value.publicVerification;
  shape(verification, ['receipt', 'binding']);
  const receipt = verification.receipt;
  shape(receipt, ['version', 'kind', 'siteUrl', 'checkedAt', 'inventorySha256', 'releaseSha256']);
  requireValue(
    receipt.version === 1 &&
      receipt.kind === 'public-bytes-verified' &&
      receipt.siteUrl === config.siteUrl &&
      receipt.checkedAt === value.verifiedAt &&
      receipt.inventorySha256 === value.inventory.sha256 &&
      receipt.releaseSha256 === identity.releaseSha256,
  );
  assertRecoveryBinding(verification.binding, RECOVERY_LIMITS.maxProvenanceBytes);
  const bytes = Buffer.from(
    `${JSON.stringify({ version: receipt.version, kind: receipt.kind, siteUrl: receipt.siteUrl, checkedAt: receipt.checkedAt, inventorySha256: receipt.inventorySha256, releaseSha256: receipt.releaseSha256 })}\n`,
  );
  requireValue(
    bytes.length === verification.binding.byteLength &&
      sha256Bytes(bytes) === verification.binding.sha256,
  );
  requireValue(Buffer.byteLength(JSON.stringify(value)) <= RECOVERY_LIMITS.maxProvenanceBytes);
  return structuredClone(value) as unknown as RecoveryProvenanceV1;
}

/** Validate an already-selected authority without adopting claims supplied by downloaded bytes. */
export function validateRecoveryApproval(value: unknown, config: Config): RecoveryApprovalV1 {
  shape(value, ['id', 'repository', 'siteUrl', 'releaseId', 'tag', 'assets', 'expectedProvenance']);
  requireValue(
    typeof value.id === 'string' &&
      /^[a-z0-9-]{1,64}$/.test(value.id) &&
      value.repository === REPOSITORY &&
      value.siteUrl === config.siteUrl &&
      positive(value.releaseId) &&
      typeof value.tag === 'string' &&
      /^[A-Za-z0-9][A-Za-z0-9._/-]{0,254}$/.test(value.tag) &&
      !value.tag.includes('..') &&
      !value.tag.endsWith('/') &&
      !value.tag.includes('//'),
  );
  const provenance = validateRecoveryProvenance(value.expectedProvenance, config);
  shape(value.assets, ['snapshot', 'inventory', 'provenance']);
  const ids = new Set<number>();
  for (const [role, name, max] of [
    ['snapshot', 'snapshot.tar.gz', RECOVERY_LIMITS.maxGzipBytes],
    ['inventory', 'inventory.json', RECOVERY_LIMITS.maxInventoryBytes],
    ['provenance', 'provenance.json', RECOVERY_LIMITS.maxProvenanceBytes],
  ] as const) {
    const asset = value.assets[role];
    shape(asset, ['id', 'name', 'byteLength', 'sha256']);
    requireValue(positive(asset.id) && !ids.has(asset.id as number) && asset.name === name);
    ids.add(asset.id as number);
    assertRecoveryBinding({ byteLength: asset.byteLength, sha256: asset.sha256 }, max);
    const binding =
      role === 'snapshot' ? provenance.gzip : role === 'inventory' ? provenance.inventory : null;
    if (binding)
      requireValue(binding.byteLength === asset.byteLength && binding.sha256 === asset.sha256);
  }
  return structuredClone(value) as unknown as RecoveryApprovalV1;
}

/** Only current trusted main's active reviewed entry can authorize recovery selection. */
export function selectRecoveryApproval(
  registry: unknown,
  id: string,
  config: Config,
): RecoveryApprovalV1 {
  configValid(config);
  shape(registry, ['version', 'kind', 'repository', 'siteUrl', 'activeBackupId', 'backups']);
  requireValue(
    Buffer.byteLength(JSON.stringify(registry)) <= RECOVERY_LIMITS.maxJsonBytes &&
      registry.version === 1 &&
      registry.kind === 'publication-recovery-approvals' &&
      registry.repository === REPOSITORY &&
      registry.siteUrl === config.siteUrl &&
      Array.isArray(registry.backups) &&
      (registry.activeBackupId === null || typeof registry.activeBackupId === 'string'),
  );
  const backups = (registry.backups as unknown[]).map((value) =>
    validateRecoveryApproval(value, config),
  );
  requireValue(new Set(backups.map((value) => value.id)).size === backups.length);
  requireValue(registry.activeBackupId === id);
  const selected = backups.find((value) => value.id === id);
  requireValue(selected);
  return selected;
}
