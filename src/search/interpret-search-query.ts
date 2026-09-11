import {
  addressWord,
  addressWords,
  type AddressParts,
  parseSearchAddress,
} from './compare-search-address.js';
import { normalizeSearchText, type PreparedSearchQuery } from './prepare-search-query.js';

export interface InterpretedSearchQuery {
  nameKey: string;
  address: AddressParts | null;
  ambiguous: boolean;
}

/** Interpret once per query, independently of records, without discarding conflicting tokens. */
export function interpretSearchQuery(
  query: Extract<PreparedSearchQuery, { ok: true }>,
): InterpretedSearchQuery {
  const words = addressWords(query);
  const signals = words.map(addressWord);
  const first = signals.findIndex((part) => part && part.kind !== 'number');
  if (first < 0) return { nameKey: query.nameKey, address: null, ambiguous: false };
  let end = first;
  while (end < words.length && signals[end]) end++;
  const address = parseSearchAddress(words.slice(first, end).join(' '));
  const before = words.slice(0, first);
  const after = words.slice(end);
  const multipleSpans = signals.slice(end).some((part) => part && part.kind !== 'number');
  const unsupportedNumber = after.some((word) => /^\d/u.test(word));
  const nameKey = normalizeSearchText([...before, ...after].join(' ').replace(/\p{P}+/gu, ' '));
  return {
    nameKey,
    address,
    ambiguous:
      address.ambiguous ||
      !address.core ||
      multipleSpans ||
      unsupportedNumber ||
      (before.length > 0 && after.length > 0),
  };
}
