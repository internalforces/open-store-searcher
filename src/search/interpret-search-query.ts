import {
  addressWord,
  addressWords,
  type AddressParts,
  parseSearchAddress,
} from './compare-search-address.js';
import {
  normalizeSearchText,
  projectSearchText,
  type PreparedSearchQuery,
} from './prepare-search-query.js';

export interface InterpretedSearchQuery {
  nameKey: string;
  address: AddressParts | null;
  ambiguous: boolean;
  inferredNameBoundary?: boolean;
}

const SEOUL_DISTRICTS = new Set([
  '종로구',
  '중구',
  '용산구',
  '성동구',
  '광진구',
  '동대문구',
  '중랑구',
  '성북구',
  '강북구',
  '도봉구',
  '노원구',
  '은평구',
  '서대문구',
  '마포구',
  '양천구',
  '강서구',
  '구로구',
  '금천구',
  '영등포구',
  '동작구',
  '관악구',
  '서초구',
  '강남구',
  '송파구',
  '강동구',
]);

/** Interpret once per query, independently of records, without discarding conflicting tokens. */
export function interpretSearchQuery(
  query: Extract<PreparedSearchQuery, { ok: true }>,
): InterpretedSearchQuery {
  // An explicit province + district provides a field boundary for full name-first addresses.
  // Keep the entire suffix, including source detail, so exact matching never discards input.
  const boundaries = [
    ...query.normalized.matchAll(/(?:^|\s)(서울특별시|서울시|서울)\s+([^\s]+)/gu),
  ].filter((match) => SEOUL_DISTRICTS.has(match[2] ?? ''));
  const boundary = boundaries[0];
  if (boundaries.length === 1 && boundary && boundary.index > 0) {
    const name = projectSearchText(query.normalized.slice(0, boundary.index));
    const address = parseSearchAddress(query.normalized.slice(boundary.index).trim());
    const prefixParts = parseSearchAddress(name.normalized);
    const prefixSignals = addressWords(name).map(addressWord);
    return {
      nameKey: name.nameKey,
      address,
      inferredNameBoundary: prefixSignals.some((part) => part !== null),
      ambiguous:
        address.ambiguous ||
        !address.core ||
        prefixParts.strong ||
        prefixSignals.some(
          (part) =>
            part?.kind === 'province' ||
            (part?.kind === 'district' && SEOUL_DISTRICTS.has(part.value)),
        ),
    };
  }
  const words = addressWords(query);
  const signals = words.map(addressWord);
  const explicit = signals.findIndex(
    (part, index) =>
      part &&
      ((part.kind === 'province' &&
        signals[index + 1]?.kind === 'district' &&
        SEOUL_DISTRICTS.has(signals[index + 1]?.value ?? '')) ||
        (part.kind === 'district' && SEOUL_DISTRICTS.has(part.value))),
  );
  const first =
    explicit >= 0 ? explicit : signals.findIndex((part) => part && part.kind !== 'number');
  if (first < 0) return { nameKey: query.nameKey, address: null, ambiguous: false };
  let end = first;
  while (end < words.length && signals[end]) {
    const part = signals[end];
    // A trailing address-shaped name follows the complete building/lot number. Real district
    // contradictions are retained instead of being reinterpreted as a business name.
    const previous = signals[end - 1];
    if (
      explicit >= 0 &&
      end > first &&
      (previous?.kind === 'number' || previous?.number) &&
      part &&
      part.kind !== 'number' &&
      part.kind !== 'province' &&
      !(part.kind === 'district' && SEOUL_DISTRICTS.has(part.value))
    )
      break;
    end++;
  }
  const address = parseSearchAddress(words.slice(first, end).join(' '));
  const before = words.slice(0, first);
  const after = words.slice(end);
  const multipleSpans = signals
    .slice(end)
    .some(
      (part) =>
        part &&
        part.kind !== 'number' &&
        (explicit < 0 ||
          part.kind === 'province' ||
          (part.kind === 'district' && SEOUL_DISTRICTS.has(part.value))),
    );
  const unsupportedNumber = after.some((word) => /^\d/u.test(word));
  const nameKey = normalizeSearchText([...before, ...after].join(' ').replace(/\p{P}+/gu, ' '));
  return {
    nameKey,
    address,
    inferredNameBoundary:
      explicit >= 0 && [...before, ...after].some((word) => addressWord(word) !== null),
    ambiguous:
      address.ambiguous ||
      (Boolean(address.province) && !SEOUL_DISTRICTS.has(address.district)) ||
      !address.core ||
      multipleSpans ||
      unsupportedNumber ||
      (before.length > 0 && after.length > 0),
  };
}
