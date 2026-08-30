import { describe, expect, test } from 'vitest';
import { inspectCsvHeader } from './csv-header.js';

describe('inspectCsvHeader', () => {
  test('parses a quoted UTF-8 header with CRLF', () => {
    const bytes = new TextEncoder().encode('사업장명,"주소,전체",최종수정시점\r\n');
    expect(inspectCsvHeader(bytes)).toEqual({
      encoding: 'utf-8',
      delimiter: ',',
      headers: ['사업장명', '주소,전체', '최종수정시점'],
      timestampFields: ['최종수정시점'],
    });
  });

  test('falls back to strict EUC-KR decoding', () => {
    const bytes = Uint8Array.from(
      Buffer.from('bbe7bef7c0e5b8ed2cc3d6c1bebcf6c1a4bdc3c1a10d0a', 'hex'),
    );
    expect(inspectCsvHeader(bytes)).toMatchObject({
      encoding: 'euc-kr',
      headers: ['사업장명', '최종수정시점'],
    });
  });

  test('supports doubled quotes and removes one leading BOM', () => {
    const bytes = new TextEncoder().encode('\ufeff"사업""장명",LAST_MDFCN_PNT\n');
    expect(inspectCsvHeader(bytes)).toMatchObject({
      headers: ['사업"장명', 'LAST_MDFCN_PNT'],
      timestampFields: ['LAST_MDFCN_PNT'],
    });
  });

  test('does not decode record bytes beyond the complete header', () => {
    const headerBytes = new TextEncoder().encode('사업장명,주소\n');
    const bytes = new Uint8Array([...headerBytes, 0xff, 0xff]);
    expect(inspectCsvHeader(bytes)).toMatchObject({ headers: ['사업장명', '주소'] });
  });

  test('rejects duplicate normalized headers', () => {
    const bytes = new TextEncoder().encode('사업장명, 사업장명 \n');
    expect(() => inspectCsvHeader(bytes)).toThrow('duplicate CSV header');
  });

  test('rejects incomplete, empty, and malformed header records', () => {
    expect(() => inspectCsvHeader(new TextEncoder().encode('"unterminated'))).toThrow(
      'complete CSV header record',
    );
    expect(() => inspectCsvHeader(new TextEncoder().encode(',name\n'))).toThrow('empty CSV header');
    expect(() => inspectCsvHeader(new Uint8Array([0xff, 0xff, 0x0a]))).toThrow('CSV encoding');
  });
});
