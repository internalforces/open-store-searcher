import { afterEach, expect, it, vi } from 'vitest';
import { createSearchIndex, searchCandidates } from './search-candidates.js';

afterEach(() => vi.restoreAllMocks());

it('rejects unrelated names without segmenting every candidate on repeated searches', () => {
  const index = createSearchIndex(
    Array.from({ length: 100 }, (_, id) => ({
      id: `${id}`,
      name: `합성상점${id}`,
      roadAddress: '',
      parcelAddress: '',
    })),
  );
  const segment = vi.spyOn(Intl.Segmenter.prototype, 'segment');
  for (const query of ['없는이름', '다른이름']) {
    const result = searchCandidates(index, query);
    expect(result.validation.ok).toBe(true);
    expect(result.similarCandidates).toEqual([]);
    expect(result.topMatches).toEqual([]);
  }
  // Only the two input-validity checks need grapheme segmentation, independent of row count.
  expect(segment).toHaveBeenCalledTimes(2);
});

it('preserves grapheme thresholds for partial names and whole address number tokens', () => {
  const records = [
    { id: 'single', name: '👨‍👩‍👦', roadAddress: '', parcelAddress: '' },
    { id: 'pair', name: '👨‍👩‍👦가', roadAddress: '', parcelAddress: '' },
    { id: 'twelve', name: '', roadAddress: '합성주소 12', parcelAddress: '' },
    { id: 'one-twenty', name: '', roadAddress: '합성주소 120', parcelAddress: '' },
  ];
  const index = createSearchIndex(records);
  const name = searchCandidates(index, '👨‍👩‍👦가게');
  expect(name.similarCandidates.map((match) => match.record.id)).toEqual(['pair']);
  expect(name.similarCandidates[0]?.reasons).toContain('name:partial');
  const address = searchCandidates(index, '합성주소 12');
  expect(address.similarCandidates.map((match) => match.record.id)).toEqual(['twelve']);
  expect(address.similarCandidates[0]?.reasons).toContain('literal_address_fallback');
  expect(searchCandidates(index, '합성주소 12')).toEqual(address);
});
