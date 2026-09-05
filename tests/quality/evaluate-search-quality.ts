import {
  createSearchIndex,
  type SearchRecord,
  searchCandidates,
} from '../../src/search/search-candidates.js';

interface QualityCase {
  id: string;
  family: string;
  query: string;
  targetId: string | null;
  exact: boolean;
  forbiddenTopIds: string[];
  primary: 'none' | 'any';
}
interface QualityCorpus {
  id: string;
  provenance: { kind: 'synthetic' | 'source-sample'; description: string; annotation: string };
  records: SearchRecord[];
  cases: QualityCase[];
}
const isObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const nonempty = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

/** Reject invalid inputs before measuring: dropped records/labels would bias the denominator. */
function parseCorpus(value: unknown): QualityCorpus {
  const invalid = () => {
    throw new Error('Invalid quality corpus');
  };
  if (!isObject(value)) return invalid();
  const { provenance, records, cases } = value;
  if (
    !nonempty(value.id) ||
    !isObject(provenance) ||
    (provenance.kind !== 'synthetic' && provenance.kind !== 'source-sample') ||
    !nonempty(provenance.description) ||
    !nonempty(provenance.annotation) ||
    !Array.isArray(records) ||
    !Array.isArray(cases)
  )
    return invalid();
  const recordIds = new Set<string>();
  for (const record of records) {
    if (
      !isObject(record) ||
      !nonempty(record.id) ||
      recordIds.has(record.id) ||
      typeof record.name !== 'string' ||
      typeof record.roadAddress !== 'string' ||
      typeof record.parcelAddress !== 'string'
    )
      return invalid();
    recordIds.add(record.id);
  }
  const caseIds = new Set<string>();
  for (const row of cases) {
    if (
      !isObject(row) ||
      !nonempty(row.id) ||
      caseIds.has(row.id) ||
      !nonempty(row.family) ||
      typeof row.query !== 'string' ||
      typeof row.exact !== 'boolean' ||
      (row.targetId !== null &&
        (typeof row.targetId !== 'string' || !recordIds.has(row.targetId))) ||
      (row.exact && row.targetId === null) ||
      !Array.isArray(row.forbiddenTopIds) ||
      !row.forbiddenTopIds.every((id: unknown) => typeof id === 'string' && recordIds.has(id)) ||
      (row.primary !== 'none' && row.primary !== 'any')
    )
      return invalid();
    caseIds.add(row.id);
  }
  return value as unknown as QualityCorpus;
}

function metric(hits: number, total: number) {
  return {
    hits,
    total,
    recall: total ? hits / total : null,
    thresholdMet: total ? hits * 10 >= total * 9 : null,
  };
}

/** Offline test-only metric. Never interprets match confidence as administrative status. */
export function evaluateSearchQuality(input: unknown) {
  const corpus = parseCorpus(input);
  const index = createSearchIndex(corpus.records);
  const safetyFailures: { caseId: string; reason: string }[] = [];
  const cases = corpus.cases.map((row) => {
    const result = searchCandidates(index, row.query);
    const topIds = result.topMatches.slice(0, 3).map((match) => match.record.id);
    const similarIds = result.similarCandidates.map((match) => match.record.id);
    const rankIndex = row.targetId === null ? -1 : topIds.indexOf(row.targetId);
    const primaryId = result.primaryMatch?.record.id ?? null;
    for (const id of row.forbiddenTopIds) {
      if (topIds.includes(id))
        safetyFailures.push({ caseId: row.id, reason: `forbidden-top:${id}` });
    }
    if (row.primary === 'none' && primaryId !== null) {
      safetyFailures.push({ caseId: row.id, reason: `unexpected-primary:${primaryId}` });
    }
    return {
      id: row.id,
      family: row.family,
      exact: row.exact,
      targetId: row.targetId,
      topIds,
      similarIds: similarIds.slice(0, 10),
      similarCount: similarIds.length,
      similarIdsTruncated: similarIds.length > 10,
      primaryId,
      targetRank: rankIndex < 0 ? null : rankIndex + 1,
      hit: rankIndex >= 0,
      similarOnly: rankIndex < 0 && row.targetId !== null && similarIds.includes(row.targetId),
      eligibleCount: result.eligibleCount,
      ambiguousTop: result.ambiguousTop,
    };
  });
  const exactCases = cases.filter((row) => row.exact);
  const exact = metric(exactCases.filter((row) => row.hit).length, exactCases.length);
  const byFamily = Object.fromEntries(
    [...new Set(cases.map((row) => row.family))].sort().map((family) => {
      const rows = cases.filter((row) => row.family === family);
      const exactRows = rows.filter((row) => row.exact);
      return [
        family,
        {
          total: rows.length,
          similarOnly: rows.filter((row) => row.similarOnly).length,
          exact: metric(exactRows.filter((row) => row.hit).length, exactRows.length),
        },
      ];
    }),
  );
  return {
    corpusId: corpus.id,
    provenance: corpus.provenance,
    recordCount: corpus.records.length,
    caseCount: cases.length,
    exact,
    byFamily,
    cases,
    misses: exactCases.filter((row) => !row.hit).map((row) => row.id),
    safetyFailures,
    checkPassed: exact.thresholdMet === true && safetyFailures.length === 0,
    // A measured number cannot establish sampling/annotation validity or release approval.
    releaseCriterion: 'not-assessed' as const,
  };
}
