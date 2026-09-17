import approvedJson from './contracts/reviewed-unverified-pairs-v1.json' with { type: 'json' };
import type { ValidationMetricV1 } from './refresh-validation-types.js';

function freeze(value: unknown): void {
  if (value === null || typeof value !== 'object' || Object.isFrozen(value)) return;
  Object.freeze(value);
  for (const child of Object.values(value)) freeze(child);
}

// Freeze the JSON module object as soon as it is loaded so another importer cannot broaden it.
freeze(approvedJson);

function semanticEqual(left: unknown, right: unknown): boolean {
  if (left === right) return true;
  if (left === null || right === null || typeof left !== 'object' || typeof right !== 'object')
    return false;
  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return false;
    if (Reflect.ownKeys(left).length !== left.length + 1) return false;
    for (let index = 0; index < left.length; index++) {
      if (!Object.hasOwn(left, index) || !Object.hasOwn(right, index)) return false;
      if (!semanticEqual(left[index], right[index])) return false;
    }
    return true;
  }
  const leftRecord = left as Record<string, unknown>;
  const rightRecord = right as Record<string, unknown>;
  const leftOwnKeys = Reflect.ownKeys(leftRecord);
  const rightOwnKeys = Reflect.ownKeys(rightRecord);
  if (
    leftOwnKeys.some((key) => typeof key !== 'string') ||
    rightOwnKeys.some((key) => typeof key !== 'string')
  )
    return false;
  const leftKeys = (leftOwnKeys as string[]).sort();
  const rightKeys = (rightOwnKeys as string[]).sort();
  if (
    leftKeys.length !== rightKeys.length ||
    leftKeys.some((key, index) => key !== rightKeys[index])
  )
    return false;
  return leftKeys.every((key) => semanticEqual(leftRecord[key], rightRecord[key]));
}

export function validReviewedUnverifiedPairsContract(
  value: unknown,
  schemaManifestSha256: string,
): boolean {
  return (
    approvedJson.schemaManifestSha256 === schemaManifestSha256 && semanticEqual(value, approvedJson)
  );
}

const approvedScopes = new Set(
  approvedJson.pairs.flatMap((pair) =>
    pair.categoryIds.map((categoryId) => JSON.stringify([categoryId, pair.code, pair.name])),
  ),
);

export function unreviewedUnknownPairCount(
  categoryId: string,
  metric: ValidationMetricV1,
  approvedContractActive: boolean,
): number {
  if (!approvedContractActive) return metric.unknownPairCount;
  return metric.aggregatePairs.reduce((count, pair) => {
    const scope = JSON.stringify([categoryId, pair.code, pair.name]);
    return count - (approvedScopes.has(scope) ? pair.count : 0);
  }, metric.unknownPairCount);
}
