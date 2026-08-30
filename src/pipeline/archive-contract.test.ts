import { expect, test } from 'vitest';
import { parseArchiveContract } from './archive-contract.js';

const valid = {
  provider: '행정안전부',
  permissionLabel: '이용허락범위 제한 없음',
  expectedEntryCount: 1,
  entries: [
    {
      entryName: 'category.csv',
      fileDataId: '15000000',
      encoding: 'utf-8',
      delimiter: ',',
      headers: ['사업장명'],
      timestampFields: ['최종수정시점'],
    },
  ],
};

test('parses a schema-only archive contract', () => {
  expect(parseArchiveContract(valid)).toEqual(valid);
});

test.each([
  null,
  [],
  {},
  { ...valid, expectedEntryCount: 2 },
  { ...valid, entries: [null] },
  { ...valid, entries: [{ ...valid.entries[0], encoding: 'unknown' }] },
  { ...valid, entries: [{ ...valid.entries[0], delimiter: ';' }] },
  { ...valid, entries: [{ ...valid.entries[0], headers: [1] }] },
  { ...valid, entries: [{ ...valid.entries[0], timestampFields: [1] }] },
])('rejects malformed archive contract input %#', (value) => {
  expect(() => parseArchiveContract(value)).toThrow('archive contract');
});
