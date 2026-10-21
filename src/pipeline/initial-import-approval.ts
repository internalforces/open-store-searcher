import {
  INITIAL_SOURCE,
  type InitialImportConfigV1,
  type InitialSourceApprovalV1,
} from './initial-import-types.js';
import { sha256Bytes, type ByteBinding } from './recovery-types.js';
import { object, sameKeys } from './refresh-validation-types.js';

const REPOSITORY = 'internalforces/open-store-searcher';
const SITE = 'https://internalforces.github.io/open-store-searcher/';
const { assetNames, ...selectedSource } = INITIAL_SOURCE;

function requireAuthority(condition: unknown): asserts condition {
  if (!condition) throw new Error('Invalid initial import authority');
}
function shape(value: unknown, keys: readonly string[]): asserts value is Record<string, unknown> {
  requireAuthority(object(value) && sameKeys(value, keys));
}
function positive(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) > 0;
}

/** Prevent ignored fields and custom serialization from masquerading as canonical JSON data. */
function assertJsonData(value: unknown, ancestors = new Set<object>()): void {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return;
  if (typeof value === 'number') {
    requireAuthority(Number.isFinite(value));
    return;
  }
  requireAuthority(typeof value === 'object' && value !== null && !ancestors.has(value));
  requireAuthority(Object.getOwnPropertySymbols(value).length === 0);
  const array = Array.isArray(value);
  requireAuthority(Object.getPrototypeOf(value) === (array ? Array.prototype : Object.prototype));
  const descriptors = Object.getOwnPropertyDescriptors(value);
  const keys = Object.keys(descriptors).filter((key) => !array || key !== 'length');
  if (array) requireAuthority(keys.length === value.length);
  ancestors.add(value);
  for (const [index, key] of keys.entries()) {
    if (array) requireAuthority(key === String(index));
    const descriptor = descriptors[key];
    requireAuthority(descriptor && 'value' in descriptor && descriptor.enumerable);
    assertJsonData(descriptor.value, ancestors);
  }
  ancestors.delete(value);
}
function canonicalSha256(value: unknown): string {
  assertJsonData(value);
  return sha256Bytes(Buffer.from(JSON.stringify(value)));
}
function exactBinding(value: unknown, expected: ByteBinding): void {
  shape(value, ['byteLength', 'sha256']);
  requireAuthority(value.byteLength === expected.byteLength && value.sha256 === expected.sha256);
}

/** Admit only the seven approved config fields and exact Node-canonical quality objects. */
export function validateInitialImportConfig(value: unknown): InitialImportConfigV1 {
  assertJsonData(value);
  shape(value, [
    'previousReleaseUrl',
    'policy',
    'baseline',
    'reviewedUnverifiedPairs',
    'maxEntryBytes',
    'maxTotalRows',
    'entryTimeoutMs',
  ]);
  requireAuthority(
    value.previousReleaseUrl === `${SITE}release.json` &&
      value.maxEntryBytes === 536870912 &&
      value.maxTotalRows === 3000000 &&
      value.entryTimeoutMs === 120000 &&
      canonicalSha256(value.policy) === INITIAL_SOURCE.policyCanonicalSha256 &&
      canonicalSha256(value.baseline) === INITIAL_SOURCE.baselineCanonicalSha256 &&
      canonicalSha256(value.reviewedUnverifiedPairs) ===
        INITIAL_SOURCE.reviewedPairsCanonicalSha256,
  );
  return structuredClone(value) as unknown as InitialImportConfigV1;
}

/** Validate reviewed transport metadata against immutable selected-source bytes and history. */
export function validateInitialSourceApproval(value: unknown): InitialSourceApprovalV1 {
  assertJsonData(value);
  shape(value, [...Object.keys(selectedSource), 'releaseId', 'tagCommit', 'assets']);
  for (const [key, expected] of Object.entries(selectedSource)) {
    if (key === 'archive' || key === 'observation')
      exactBinding(value[key], expected as ByteBinding);
    else requireAuthority(value[key] === expected);
  }
  requireAuthority(
    positive(value.releaseId) &&
      typeof value.tagCommit === 'string' &&
      /^[a-f0-9]{40}$/.test(value.tagCommit),
  );
  shape(value.assets, ['archive', 'observation']);
  const ids = new Set<number>();
  for (const role of ['archive', 'observation'] as const) {
    const asset = value.assets[role];
    shape(asset, ['id', 'name', 'byteLength', 'sha256']);
    requireAuthority(positive(asset.id) && !ids.has(asset.id) && asset.name === assetNames[role]);
    ids.add(asset.id);
    exactBinding({ byteLength: asset.byteLength, sha256: asset.sha256 }, INITIAL_SOURCE[role]);
  }
  return structuredClone(value) as unknown as InitialSourceApprovalV1;
}

/** Pure selection: null/inactive registries never authorize source reads or network operations. */
export function selectInitialSourceApproval(
  registry: unknown,
  sourceId: string,
  config: InitialImportConfigV1,
): InitialSourceApprovalV1 {
  validateInitialImportConfig(config);
  assertJsonData(registry);
  shape(registry, ['version', 'kind', 'repository', 'siteUrl', 'activeSourceId', 'sources']);
  requireAuthority(
    registry.version === 1 &&
      registry.kind === 'initial-source-approvals' &&
      registry.repository === REPOSITORY &&
      registry.siteUrl === SITE &&
      (registry.activeSourceId === null || registry.activeSourceId === INITIAL_SOURCE.id) &&
      Array.isArray(registry.sources) &&
      registry.sources.length <= 1,
  );
  requireAuthority(sourceId === INITIAL_SOURCE.id && registry.activeSourceId === sourceId);
  requireAuthority(registry.sources.length === 1);
  return validateInitialSourceApproval(registry.sources[0]);
}
