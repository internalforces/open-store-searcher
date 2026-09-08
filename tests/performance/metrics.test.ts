import { describe, expect, it } from 'vitest';
import { createSearchIndex, searchCandidates } from '../../src/search/search-candidates.js';
import { assessBudget, makeDataset, queries, summarize, utf8Bytes } from './metrics.js';

describe('performance evidence', () => {
  it('keeps nearest-rank percentiles and the slowest sample without mutating input', () => {
    const samples = [100, 1, 2, 3, 4];
    expect(summarize(samples)).toEqual({ count: 5, min: 1, median: 3, p95: 100, max: 100 });
    expect(samples).toEqual([100, 1, 2, 3, 4]);
  });
  it.each([[], [Number.NaN], [Infinity], [-1]].map((samples) => ({ samples })))(
    'rejects unusable samples $samples',
    ({ samples }) => {
      expect(() => summarize(samples)).toThrow();
    },
  );
  it.each([300_000, 2_500, 500])('accepts the exact inclusive target %i', (limit) => {
    expect(assessBudget([limit - 1, limit], limit)).toBe('pass');
    expect(assessBudget([limit, limit + 1], limit)).toBe('exceeded');
  });
  it('does not turn absent measurements into a pass', () => {
    expect(assessBudget([], 500)).toBe('unavailable');
    expect(() => assessBudget([Number.NaN], 500)).toThrow();
  });
  it('counts UTF-8 bytes rather than characters', () => {
    expect(utf8Bytes('서울')).toBe(6);
  });
});

describe('bounded synthetic scale fixture', () => {
  it.each([0, 50_001, 1.5, Number.NaN])('rejects unsupported scale %s', (size) => {
    expect(() => makeDataset(size)).toThrow();
  });
  it('generates deterministic unique identities with explicit synthetic provenance', () => {
    const dataset = makeDataset(1_000);
    expect(dataset).toEqual(makeDataset(1_000));
    expect(dataset.records).toHaveLength(1_000);
    expect(new Set(dataset.records.map((record) => record.id)).size).toBe(1_000);
    expect(dataset.coverage.kind).toBe('synthetic');
    expect(dataset.records.every((record) => record.sourceUrl === null)).toBe(true);
  });
  it('exercises exact, common-name, address and absent outcomes through real search', () => {
    const index = createSearchIndex(makeDataset(1_000).records);
    const exact = searchCandidates(index, queries.exact);
    expect(exact.primaryMatch?.record.id).toBe('perf-1');
    expect(exact.similarCount).toBe(999);
    const common = searchCandidates(index, queries.common);
    expect(common.primaryMatch).toBeNull();
    expect(common.similarCount).toBe(10);
    const address = searchCandidates(index, queries.address);
    expect(address.eligibleCount).toBe(1);
    expect(address.similarCount).toBe(999);
    expect(address.topMatches[0]?.record.id).toBe('perf-1');
    const absent = searchCandidates(index, queries.absent);
    expect(absent.validation.ok).toBe(true);
    expect(absent.eligibleCount).toBe(0);
    expect(absent.similarCount).toBe(0);
  });
});
