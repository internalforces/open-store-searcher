import {
  normalizeSearchText,
  projectSearchText,
  type SearchTextProjection,
} from './prepare-search-query.js';

type Component = 'province' | 'district' | 'locality' | 'road' | 'number';
export type AddressConflict = 'district' | 'road' | 'locality' | 'number';
export type AddressMatch = 'exact' | 'core' | 'partial' | 'none';
export interface AddressParts {
  province: string;
  district: string;
  locality: string;
  road: string;
  number: string;
  family: 'road' | 'parcel' | 'unspecified';
  strong: boolean;
  core: boolean;
  ambiguous: boolean;
  key: string;
}

const NUMBER = /^\d+(?:-\d+)?$/u;
const SEOUL = new Set(['서울', '서울시', '서울특별시']);

/** Keep embedded road digits intact until components have been identified. */
export function addressWords(projection: SearchTextProjection): string[] {
  const text = normalizeSearchText(
    projection.normalized
      .replace(/\p{Pd}/gu, '-')
      .replace(/\p{P}/gu, (value) => (value === '-' ? value : ' ')),
  );
  return text ? text.split(' ') : [];
}

export function addressWord(
  word: string,
): { kind: Component; value: string; number: string } | null {
  if (SEOUL.has(word)) return { kind: 'province', value: '서울특별시', number: '' };
  if (NUMBER.test(word)) return { kind: 'number', value: word, number: '' };
  const match = /^(.+(?:대로|로|길|구|동|읍|면|리|\d+가))(\d+(?:-\d+)?)?$/u.exec(word);
  if (!match?.[1]) return null;
  const value = match[1];
  const kind = /(?:대로|로|길)$/u.test(value)
    ? 'road'
    : value.endsWith('구')
      ? 'district'
      : 'locality';
  return { kind, value, number: match[2] ?? '' };
}

/** Remove floor/unit detail only from component parsing, preserving original address keys. */
export function withoutFloorUnitDetails(value: string): string {
  // A comma after the primary building/lot number is an address separator, not a floor list.
  const primary = /(?:대로|로|길|동|가|읍|면|리)\s*(?:산\s*)?\d+(?:-\d+)?(?=$|[\s,()])/u.exec(
    value,
  );
  const boundary = primary ? primary.index + primary[0].length : 0;
  return (
    value.slice(0, boundary) +
    value
      .slice(boundary)
      .replace(
        /(?<![\p{L}\p{N}])(?:(?:지상|지하)?\d+(?:-\d+)?(?:,\s*\d+(?:-\d+)?)*(?:층|호)+)+(?:\d+(?:-\d+)?(?:,\s*\d+(?:-\d+)?)*)?(?![\p{L}\p{N}])/gu,
        ' ',
      )
  );
}

/** Parse a single address field, never combining evidence from different fields. */
export function parseSearchAddress(value: string): AddressParts {
  const projection = projectSearchText(value);
  const parts: AddressParts = {
    province: '',
    district: '',
    locality: '',
    road: '',
    number: '',
    family: 'unspecified',
    strong: false,
    core: false,
    ambiguous: false,
    key: projection.addressTokens
      .map((token) => (SEOUL.has(token) ? '서울특별시' : token))
      .join(' '),
  };
  let previous: Component | null = null;
  const assign = (kind: Component, text: string) => {
    if (parts[kind]) parts.ambiguous = true;
    else parts[kind] = text;
  };
  const componentsText = withoutFloorUnitDetails(projection.normalized);
  let depth = 0;
  let mountain = false;
  const componentWords: { word: string; annotation: boolean }[] = [];
  for (const token of componentsText.match(/[()]|[^\s()]+/gu) ?? []) {
    if (token === '(') {
      depth++;
      continue;
    }
    if (token === ')') {
      depth = Math.max(0, depth - 1);
      continue;
    }
    for (const word of addressWords(projectSearchText(token)))
      componentWords.push({ word, annotation: depth > 0 });
  }
  for (const { word, annotation } of componentWords) {
    if (parts.number && /^(?:\d+|[a-z]\d*-?|상가)동$/u.test(word)) {
      previous = null;
      continue;
    }
    if (word === '산' && previous === 'locality') {
      mountain = true;
      continue;
    }
    const component = addressWord(word);
    if (!component) {
      previous = null;
      mountain = false;
      continue;
    }
    if (component.kind === 'number') {
      if (annotation && parts.road && parts.number && previous === 'locality') {
        // Parenthesized parcel evidence cannot replace a road's primary building number.
      } else if (previous === 'road' || previous === 'locality') {
        assign('number', mountain ? `산 ${component.value}` : component.value);
      }
      // Additional standalone numbers cannot overwrite the building/lot number.
      else parts.ambiguous = true;
    } else {
      assign(component.kind, component.value);
      if (component.number) {
        if (component.kind === 'road' || component.kind === 'locality')
          assign('number', component.number);
        else parts.ambiguous = true;
      }
    }
    mountain = false;
    previous = component.kind;
  }
  parts.family = parts.road ? 'road' : parts.locality ? 'parcel' : 'unspecified';
  parts.strong = Boolean((parts.road || parts.locality) && parts.number);
  parts.core = parts.strong || Boolean(parts.district && parts.locality);
  return parts;
}

export interface AddressComparison {
  match: AddressMatch;
  conflicts: AddressConflict[];
  relevant: boolean;
}

/** Missing or cross-family evidence is unknown; only comparable contradictions are conflicts. */
export function compareSearchAddress(
  query: AddressParts,
  candidate: AddressParts,
): AddressComparison {
  const conflicts: AddressConflict[] = [];
  const sameFamily = query.family !== 'unspecified' && query.family === candidate.family;
  const contradicts = (key: AddressConflict) =>
    query[key] && candidate[key] && query[key] !== candidate[key];
  if (contradicts('district')) conflicts.push('district');
  if (sameFamily && query.family === 'road' && contradicts('road')) conflicts.push('road');
  if (sameFamily && query.family === 'parcel' && contradicts('locality'))
    conflicts.push('locality');
  const anchor = query.family === 'road' ? 'road' : 'locality';
  if (sameFamily && query[anchor] === candidate[anchor] && contradicts('number'))
    conflicts.push('number');
  const relevant = Boolean(
    (query.district && query.district === candidate.district) ||
      (sameFamily && query[anchor] && query[anchor] === candidate[anchor]),
  );
  if (!query.key || !candidate.key || conflicts.length || query.ambiguous || candidate.ambiguous) {
    return { match: 'none', conflicts, relevant };
  }
  const exact =
    query.key === candidate.key && Boolean(query.district || query.road || query.locality);
  if (exact) return { match: 'exact', conflicts, relevant: true };
  const supplied: Component[] = ['province', 'district', 'locality', 'road', 'number'];
  const allAgree = supplied.every(
    (key) =>
      !query[key] ||
      (query[key] === candidate[key] && (key === 'district' || key === 'province' || sameFamily)),
  );
  const match = allAgree && relevant ? (query.core ? 'core' : 'partial') : 'none';
  return { match, conflicts, relevant };
}
