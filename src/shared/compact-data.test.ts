import { describe, expect, it } from 'vitest';
import { encodeColumns, flattenRecord, materializeRecord, validateBlock } from './compact-data.js';
const row = {
  id: 'a'.repeat(64),
  name: '<b>원본</b>',
  roadAddress: '',
  parcelAddress: '서울 강남구 1',
  categoryName: '원문.csv',
  businessTypes: [{ sourceField: '업태', value: ' ' }],
  rawStatus: {
    operatingCode: '05',
    operatingName: '제외/삭제/전출',
    detailedCode: '',
    detailedName: null,
  },
  processedStatus: '확인되지 않음',
  lifecycle: {
    licensedOn: '',
    licenseCancelledOn: null,
    suspendedFrom: '',
    suspendedThrough: null,
    reopenedOn: '',
    closedOn: null,
    sourceUpdatedAt: '날짜 원문',
    sourceLastModifiedAt: '',
  },
  sourceLabel: '행정안전부',
  sourceUrl: 'https://www.data.go.kr/',
};
describe('compact evidence', () => {
  it('round-trips exact evidence including null, empty, identifiers and unknown status', () => {
    const flat = flattenRecord(row);
    expect(materializeRecord(flat)).toEqual(row);
    const columns = encodeColumns([flat, flat]).slice(0, 4);
    const block = {
      version: 1,
      archiveSha256: 'b'.repeat(64),
      role: 'search',
      start: 0,
      count: 2,
      columns,
    };
    expect(
      validateBlock(block, { role: 'search', start: 0, count: 2 }, 'b'.repeat(64), []),
    ).toEqual(block);
  });
  it('rejects corrupt dictionary references instead of excluding records', () => {
    const columns = encodeColumns([flattenRecord(row)]).slice(0, 4);
    columns[0] = { dictionary: ['a'.repeat(64)], refs: [2] };
    expect(() =>
      validateBlock(
        { version: 1, archiveSha256: 'b'.repeat(64), role: 'search', start: 0, count: 1, columns },
        { role: 'search', start: 0, count: 1 },
        'b'.repeat(64),
        [],
      ),
    ).toThrow();
  });
});
