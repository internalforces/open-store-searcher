import {
  type AddressMatch,
  type AddressParts,
  compareSearchAddress,
  parseSearchAddress,
} from './compare-search-address.js';
import { type InterpretedSearchQuery, interpretSearchQuery } from './interpret-search-query.js';
import {
  type PreparedSearchQuery,
  prepareSearchQuery,
  projectSearchText,
} from './prepare-search-query.js';

export interface SearchRecord {
  readonly id: string;
  readonly name: string;
  readonly roadAddress: string;
  readonly parcelAddress: string;
}
interface IndexedRecord<T extends SearchRecord = SearchRecord> {
  readonly record: T;
  readonly nameKey: string;
  readonly addresses: readonly AddressParts[];
}
export interface SearchDiagnostics {
  readonly invalidRecordCount: number;
  readonly duplicateIdRecordCount: number;
}
export interface SearchIndex<T extends SearchRecord = SearchRecord> {
  readonly entries: readonly IndexedRecord<T>[];
  readonly diagnostics: SearchDiagnostics;
}
export type NameMatch = 'exact' | 'partial' | 'none';
export interface CandidateMatch<T extends SearchRecord = SearchRecord> {
  record: T;
  score: number;
  confidence: 'high' | 'medium' | 'low';
  nameMatch: NameMatch;
  addressMatch: AddressMatch;
  reasons: string[];
}
export interface SearchResult<T extends SearchRecord = SearchRecord> {
  validation: PreparedSearchQuery;
  topMatches: CandidateMatch<T>[];
  similarCandidates: CandidateMatch<T>[];
  eligibleCount: number;
  similarCount: number;
  primaryMatch: CandidateMatch<T> | null;
  ambiguousTop: boolean;
  diagnostics: SearchDiagnostics;
}

function isRecord(value: unknown): value is SearchRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === 'string' &&
    row.id.trim().length > 0 &&
    typeof row.name === 'string' &&
    typeof row.roadAddress === 'string' &&
    typeof row.parcelAddress === 'string'
  );
}

/** Build once after loading data; callers must rebuild after changing records. No record is mutated. */
export function createSearchIndex<T extends SearchRecord>(records: readonly T[]): SearchIndex<T>;
export function createSearchIndex(records: readonly unknown[]): SearchIndex;
export function createSearchIndex(records: readonly unknown[]): SearchIndex {
  const ids = new Map<string, number>();
  for (const value of records) {
    if (value && typeof value === 'object' && 'id' in value && typeof value.id === 'string') {
      ids.set(value.id, (ids.get(value.id) ?? 0) + 1);
    }
  }
  let invalidRecordCount = 0;
  let duplicateIdRecordCount = 0;
  const entries: IndexedRecord[] = [];
  for (const record of records) {
    if (!isRecord(record)) {
      invalidRecordCount++;
      continue;
    }
    if ((ids.get(record.id) ?? 0) > 1) {
      duplicateIdRecordCount++;
      continue;
    }
    entries.push({
      record,
      nameKey: projectSearchText(record.name).nameKey,
      addresses: [parseSearchAddress(record.roadAddress), parseSearchAddress(record.parcelAddress)],
    });
  }
  return { entries, diagnostics: { invalidRecordCount, duplicateIdRecordCount } };
}

const segmenter = new Intl.Segmenter('ko', { granularity: 'grapheme' });
function matchName(query: string, candidate: string): NameMatch {
  if (!query || !candidate) return 'none';
  if (query === candidate) return 'exact';
  const shared = query.length <= candidate.length ? query : candidate;
  if ([...segmenter.segment(shared.replace(/ /g, ''))].length < 2) return 'none';
  return query.includes(candidate) || candidate.includes(query) ? 'partial' : 'none';
}
const MATCH_ORDER: Record<AddressMatch, number> = { none: 0, partial: 1, core: 2, exact: 3 };
const compareIds = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
const compareMatches = (a: CandidateMatch, b: CandidateMatch) =>
  b.score - a.score || compareIds(a.record.id, b.record.id);
const hasConflict = (match: CandidateMatch) =>
  match.reasons.some((reason) => reason.startsWith('address_conflict:'));

function scoreCandidate<T extends SearchRecord>(
  entry: IndexedRecord<T>,
  query: InterpretedSearchQuery,
  validation: Extract<PreparedSearchQuery, { ok: true }>,
): CandidateMatch<T> | null {
  let nameMatch = matchName(query.nameKey, entry.nameKey);
  const literalName = matchName(validation.nameKey, entry.nameKey);
  const fallbackName = nameMatch === 'none' && literalName !== 'none';
  if (fallbackName) nameMatch = literalName;
  const comparisons = query.address
    ? entry.addresses.map((address) => compareSearchAddress(query.address as AddressParts, address))
    : [];
  let addressMatch: AddressMatch = 'none';
  for (const comparison of comparisons) {
    if (MATCH_ORDER[comparison.match] > MATCH_ORDER[addressMatch]) addressMatch = comparison.match;
  }
  const conflicts = [...new Set(comparisons.flatMap((comparison) => comparison.conflicts))];
  // Unclassified text may partially match address words; numbers remain whole tokens.
  const literalAddress =
    !query.address &&
    entry.addresses.some((address) => {
      const tokens = address.key.split(' ');
      return validation.addressTokens.every((token) =>
        tokens.some((candidate) =>
          /\d/u.test(token) ? candidate === token : candidate.includes(token),
        ),
      );
    });
  if (literalAddress) addressMatch = 'partial';
  const relevantAddress = comparisons.some((comparison) => comparison.relevant);
  if (nameMatch === 'none' && addressMatch === 'none' && !literalAddress && !relevantAddress)
    return null;
  const reasons = [`name:${nameMatch}`, `address:${addressMatch}`];
  for (const conflict of conflicts) reasons.push(`address_conflict:${conflict}`);
  const ambiguousAddress = entry.addresses.some((address) => address.ambiguous);
  if (query.ambiguous) reasons.push('ambiguous_query');
  if (ambiguousAddress) reasons.push('ambiguous_record_address');
  if (fallbackName) reasons.push('literal_name_fallback');
  if (literalAddress) reasons.push('literal_address_fallback');
  let score = 0;
  let confidence: CandidateMatch['confidence'] = 'low';
  const exact = addressMatch === 'exact' && query.address?.strong;
  const core = addressMatch === 'core' || (addressMatch === 'exact' && query.address?.core);
  if (nameMatch === 'exact' && exact) {
    score = 500;
    confidence = 'high';
  } else if (nameMatch === 'exact' && core) {
    score = 400;
    confidence = 'medium';
  } else if (nameMatch === 'partial' && core) {
    score = 300;
    confidence = 'medium';
  } else if (exact && (!query.nameKey || !entry.nameKey)) {
    score = 100;
    confidence = 'medium';
  }
  if (query.inferredNameBoundary && confidence === 'high') {
    confidence = 'medium';
    reasons.push('inferred_name_boundary');
  }
  if (conflicts.length || query.ambiguous || ambiguousAddress || fallbackName) confidence = 'low';
  if (confidence === 'low' && !query.address) reasons.push('name_only_or_literal_evidence');
  return { record: entry.record, score, confidence, nameMatch, addressMatch, reasons };
}

/** Search transient loaded data only. Confidence describes a match, never administrative status. */
export function searchCandidates<T extends SearchRecord>(
  index: SearchIndex<T>,
  original: string,
): SearchResult<T> {
  const validation = prepareSearchQuery(original);
  const result: SearchResult<T> = {
    validation,
    topMatches: [],
    similarCandidates: [],
    eligibleCount: 0,
    similarCount: 0,
    primaryMatch: null,
    ambiguousTop: false,
    diagnostics: index.diagnostics,
  };
  if (!validation.ok) return result;
  const query = interpretSearchQuery(validation);
  for (const entry of index.entries) {
    const match = scoreCandidate(entry, query, validation);
    if (!match) continue;
    if (match.confidence === 'low') result.similarCandidates.push(match);
    else {
      result.eligibleCount++;
      result.topMatches.push(match);
      result.topMatches.sort(compareMatches);
      if (result.topMatches.length > 3) result.topMatches.pop();
    }
  }
  result.similarCandidates.sort(
    (a, b) => Number(hasConflict(a)) - Number(hasConflict(b)) || compareMatches(a, b),
  );
  result.similarCount = result.similarCandidates.length;
  const [first, second] = result.topMatches;
  result.ambiguousTop = Boolean(first && second && first.score === second.score);
  if (first?.confidence === 'high' && !result.ambiguousTop) result.primaryMatch = first;
  return result;
}
