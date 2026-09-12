import { expect, test } from 'vitest';
import type { ArchiveContractEntry } from './archive-contract.js';
import { parseLicenseCsv } from './parse-license-csv.js';

const entry: ArchiveContractEntry = {
  entryName: 'sample.csv',
  fileDataId: '15045016',
  encoding: 'utf-8',
  delimiter: ',',
  headers: ['name', 'address'],
  timestampFields: [],
};
const parse = (text: string, max = 10) =>
  parseLicenseCsv(new TextEncoder().encode(text), entry, max);
test('preserves multiline quoted fields, escaped quotes, Korean and final empty cells', () => {
  const rows = parse('\ufeffname,address\r\n"가게, 하나","서울\n""주소"""\r\n둘,');
  expect(rows.map((r) => r.values)).toEqual([
    { name: '가게, 하나', address: '서울\n"주소"' },
    { name: '둘', address: '' },
  ]);
  expect(rows[0]?.sourceFileDataUrl).toBe('https://www.data.go.kr/data/15045016/fileData.do');
});
test.each([
  '',
  'wrong,address\na,b',
  'name,address\na,b,c',
  'name,address\n"a,b',
  'name,address\n"a"x,b',
  'name,address\na"b,c',
  'name,address\ra,b',
])('rejects malformed or incomplete CSV %j', (text) => {
  expect(() => parse(text)).toThrow();
});
test('enforces complete-row bounds without silently truncating and permits explicit empty categories', () => {
  expect(parse('name,address\n', 0)).toEqual([]);
  expect(() => parse('name,address\na,b\nc,d', 1)).toThrow('row limit');
  expect(() => parse('name,address\n', -1)).toThrow('row limit');
});
test('rejects invalid bytes in the declared encoding', () => {
  expect(() => parseLicenseCsv(new Uint8Array([0xff]), entry, 10)).toThrow();
});
