import { createHash } from 'node:crypto';
import { object } from './refresh-validation-types.js';

export type AggregateVocabularyVersion = 1 | 2;
const pairs = Object.freeze([
  Object.freeze({ code: '01', name: '영업/정상' }),
  Object.freeze({ code: '02', name: '휴업' }),
  Object.freeze({ code: '03', name: '폐업' }),
  Object.freeze({ code: '04', name: '취소/말소/만료/정지/중지' }),
  Object.freeze({ code: '05', name: '제외/삭제/전출' }),
  Object.freeze({ code: '06', name: '기타' }),
]);

/** ADR-017 canonical JSON: sorted object keys, ordered arrays, compact UTF-8, no newline. */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(value, (_key, entry: unknown) =>
    object(entry)
      ? Object.fromEntries(
          Object.keys(entry)
            .sort()
            .map((key) => [key, entry[key]]),
        )
      : entry,
  );
}
export const AGGREGATE_VOCABULARY_V2 = Object.freeze({
  aggregateVocabularyVersion: 2 as const,
  pairs,
});
export const VOCABULARY_V2 = Object.freeze({
  aggregateVocabularyVersion: 2 as const,
  aggregateVocabularySha256: createHash('sha256')
    .update(canonicalJson(AGGREGATE_VOCABULARY_V2))
    .digest('hex'),
});
export interface VocabularyEnvelopeV2 {
  aggregateVocabularyVersion: 2;
  aggregateVocabularySha256: string;
}
export function matchesVocabularyV2(value: unknown): value is VocabularyEnvelopeV2 {
  return (
    object(value) &&
    value.aggregateVocabularyVersion === 2 &&
    value.aggregateVocabularySha256 === VOCABULARY_V2.aggregateVocabularySha256
  );
}
export function knownPairForVocabulary(
  code: string | null,
  name: string | null,
  version: AggregateVocabularyVersion,
): boolean {
  if (version !== 1 && version !== 2) throw new Error('vocabulary_revision_mismatch');
  return pairs.some(
    (pair, index) => (version === 2 || index < 4) && pair.code === code && pair.name === name,
  );
}
