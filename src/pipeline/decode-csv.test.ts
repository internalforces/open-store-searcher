import { expect, test } from 'vitest';
import { decodeCsv } from './decode-csv.js';
import { inspectCsvHeader } from './csv-header.js';

test('decodes CP949 extension and ordinary Hangul without consuming bytes outside the view', () => {
  const bytes = Uint8Array.of(0xff, 0x81, 0x41, 0xb0, 0xa1, 0x41, 0xff);
  expect(decodeCsv(bytes.subarray(1, 6), 'euc-kr')).toBe('갂가A');
});

test.each([[0x81], [0x81, 0x20], [0xff], [0xb0]])(
  'rejects malformed or truncated CP949 bytes %j',
  (...bytes) => expect(() => decodeCsv(Uint8Array.from(bytes), 'euc-kr')).toThrow('CP949'),
);

test('keeps strict UTF-8 decoding and BOM handling', () => {
  expect(decodeCsv(new TextEncoder().encode('\ufeff가갂A'), 'utf-8')).toBe('가갂A');
  expect(() => decodeCsv(Uint8Array.of(0xc3, 0x28), 'utf-8')).toThrow();
});

test('preserves the source encoding label and CP949 header evidence', () => {
  expect(inspectCsvHeader(Uint8Array.of(0x81, 0x41, 0x2c, 0xb0, 0xa1, 0x0a))).toEqual({
    encoding: 'euc-kr',
    delimiter: ',',
    headers: ['갂', '가'],
    timestampFields: [],
  });
});
