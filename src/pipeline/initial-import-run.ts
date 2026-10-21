import { isCanonicalUtc } from './collector-types.js';
import { INITIAL_SOURCE, type InitialPreparationV1 } from './initial-import-types.js';
import { assertRecoveryBinding } from './recovery-approval.js';
import { RECOVERY_LIMITS, sha256Bytes } from './recovery-types.js';
import { object, sameKeys, sha256 } from './refresh-validation-types.js';

const WORKFLOW = '.github/workflows/initial-import.yml';
const DAY_MS = 24 * 60 * 60 * 1000;
export interface InitialImportRunV1 {
  version: 1;
  kind: 'initial-import-run-bound';
  workflowPath: '.github/workflows/initial-import.yml';
  sourceId: string;
  operatorSha: string;
  runId: number;
  candidateArtifactId: number;
  artifactName: 'github-pages';
  preparationSha256: string;
  tarSha256: string;
  inventorySha256: string;
  preparedAt: string;
  expiresAt: string;
}
function requireRun(value: unknown): asserts value {
  if (!value) throw new Error('Invalid initial import run binding');
}
function shape(value: unknown, keys: readonly string[]): asserts value is Record<string, unknown> {
  requireRun(object(value) && sameKeys(value, keys));
  requireRun(
    Object.getPrototypeOf(value) === Object.prototype &&
      Object.getOwnPropertySymbols(value).length === 0,
  );
  for (const descriptor of Object.values(Object.getOwnPropertyDescriptors(value)))
    requireRun('value' in descriptor && descriptor.enumerable);
}
function positive(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) > 0;
}
function commit(value: unknown): value is string {
  return typeof value === 'string' && /^[a-f0-9]{40}$/.test(value);
}
function times(preparedAt: unknown, expiresAt: unknown): void {
  requireRun(typeof preparedAt === 'string' && isCanonicalUtc(preparedAt));
  requireRun(typeof expiresAt === 'string' && isCanonicalUtc(expiresAt));
  requireRun(Date.parse(expiresAt) - Date.parse(preparedAt) === DAY_MS);
}
/** Strict hosted preparation admission; local proof can never acquire run authority. */
export function validateInitialImportPreparation(value: unknown): InitialPreparationV1 {
  shape(value, [
    'version',
    'kind',
    'mode',
    'sourceId',
    'operator',
    'sourceReceipt',
    'identity',
    'inventory',
    'tar',
    'preparedAt',
    'expiresAt',
    'precondition',
  ]);
  requireRun(
    value.version === 1 &&
      value.kind === 'initial-publication-prepared' &&
      value.mode === 'hosted' &&
      value.sourceId === INITIAL_SOURCE.id,
  );
  const operator = value.operator;
  shape(operator, ['commit', 'uncommitted', 'codeBindings', 'runId']);
  requireRun(commit(operator.commit) && operator.uncommitted === false && positive(operator.runId));
  const bindings = operator.codeBindings;
  requireRun(object(bindings) && Object.keys(bindings).length > 0);
  shape(bindings, Object.keys(bindings));
  for (const [name, binding] of Object.entries(bindings)) {
    requireRun(
      name.length > 0 &&
        !name.startsWith('/') &&
        !/[\\\p{Cc}]/u.test(name) &&
        name.split('/').every((part) => part && part !== '.' && part !== '..'),
    );
    shape(binding, ['byteLength', 'sha256']);
    // Tracked placeholder files may be empty; source and artifact bindings remain positive.
    requireRun(
      Number.isSafeInteger(binding.byteLength) &&
        (binding.byteLength as number) >= 0 &&
        sha256(binding.sha256),
    );
  }
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
  requireRun(
    ['releaseSha256', 'manifestSha256', 'baselineSha256'].every((key) => sha256(identity[key])) &&
      identity.archiveSha256 === INITIAL_SOURCE.archive.sha256 &&
      identity.collectedAt === INITIAL_SOURCE.collectedAt &&
      identity.recordCount === INITIAL_SOURCE.recordCount &&
      identity.policyRevision === INITIAL_SOURCE.policyRevision &&
      identity.schemaVersion === 2 &&
      identity.identifierVersion === 1 &&
      identity.normalizationVersion === 1,
  );
  for (const [key, max] of [
    ['sourceReceipt', RECOVERY_LIMITS.maxInventoryBytes],
    ['inventory', RECOVERY_LIMITS.maxInventoryBytes],
    ['tar', RECOVERY_LIMITS.maxTarBytes],
  ] as const) {
    shape(value[key], ['byteLength', 'sha256']);
    assertRecoveryBinding(value[key], max);
  }
  shape(value.precondition, ['status', 'releaseSha256']);
  requireRun(value.precondition.status === 404 && value.precondition.releaseSha256 === null);
  times(value.preparedAt, value.expiresAt);
  requireRun((value.preparedAt as string) >= INITIAL_SOURCE.collectedAt);
  return structuredClone(value) as unknown as InitialPreparationV1;
}
/** The upload step supplies the actual ID; preparation metadata never supplies an artifact ID. */
export function bindInitialImportRun(
  preparation: unknown,
  candidateArtifactId: number,
  context: { sha: string; runId: number },
): InitialImportRunV1 {
  const prepared = validateInitialImportPreparation(preparation);
  requireRun(commit(context.sha) && positive(context.runId) && positive(candidateArtifactId));
  requireRun(prepared.operator.commit === context.sha && prepared.operator.runId === context.runId);
  return {
    version: 1,
    kind: 'initial-import-run-bound',
    workflowPath: WORKFLOW,
    sourceId: INITIAL_SOURCE.id,
    operatorSha: context.sha,
    runId: context.runId,
    candidateArtifactId,
    artifactName: 'github-pages',
    preparationSha256: sha256Bytes(Buffer.from(`${JSON.stringify(prepared)}\n`)),
    tarSha256: prepared.tar.sha256,
    inventorySha256: prepared.inventory.sha256,
    preparedAt: prepared.preparedAt,
    expiresAt: prepared.expiresAt,
  };
}
/** Consume only a trusted same-job output; this validates claims without creating artifact authority. */
export function validateInitialImportRun(
  value: unknown,
  context: { sha: string; runId: number; now: string },
): InitialImportRunV1 {
  shape(value, [
    'version',
    'kind',
    'workflowPath',
    'sourceId',
    'operatorSha',
    'runId',
    'candidateArtifactId',
    'artifactName',
    'preparationSha256',
    'tarSha256',
    'inventorySha256',
    'preparedAt',
    'expiresAt',
  ]);
  requireRun(
    value.version === 1 &&
      value.kind === 'initial-import-run-bound' &&
      value.workflowPath === WORKFLOW &&
      value.sourceId === INITIAL_SOURCE.id &&
      commit(context.sha) &&
      positive(context.runId) &&
      value.operatorSha === context.sha &&
      value.runId === context.runId &&
      positive(value.candidateArtifactId) &&
      value.artifactName === 'github-pages' &&
      sha256(value.preparationSha256) &&
      sha256(value.tarSha256) &&
      sha256(value.inventorySha256),
  );
  times(value.preparedAt, value.expiresAt);
  requireRun(
    isCanonicalUtc(context.now) &&
      context.now >= (value.preparedAt as string) &&
      context.now < (value.expiresAt as string),
  );
  requireRun(Buffer.byteLength(JSON.stringify(value)) <= RECOVERY_LIMITS.maxProvenanceBytes);
  return structuredClone(value) as unknown as InitialImportRunV1;
}
