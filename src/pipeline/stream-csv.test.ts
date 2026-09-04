import { describe, expect, test } from 'vitest';
import { parseCsvRows, type StreamCsvOptions } from './stream-csv.js';

const encoder = new TextEncoder();

const options: StreamCsvOptions = {
  encoding: 'utf-8',
  headers: ['name', 'address', 'status'],
  maxBytes: 1_000,
  maxRows: 10,
  maxRecordChars: 100,
};

async function* chunks(...parts: Uint8Array[]): AsyncGenerator<Uint8Array> {
  for (const part of parts) yield part;
}

async function rows(
  parts: Uint8Array[],
  overrides: Partial<StreamCsvOptions> = {},
): Promise<string[][]> {
  const parsed: string[][] = [];
  for await (const row of parseCsvRows(chunks(...parts), { ...options, ...overrides })) {
    parsed.push(row);
  }
  return parsed;
}

describe('parseCsvRows', () => {
  test('streams UTF-8 rows across empty chunks and split multibyte characters', async () => {
    const source = encoder.encode('\ufeffname,address,status\n카페,서울,01\n식당,부산,02');
    const cafe = source.indexOf(0xec);
    await expect(
      rows([source.subarray(0, cafe + 1), new Uint8Array(), source.subarray(cafe + 1)]),
    ).resolves.toEqual([
      ['카페', '서울', '01'],
      ['식당', '부산', '02'],
    ]);
  });

  test('parses quoted commas, doubled quotes, quoted LF and CRLF, trailing empty cells, and final EOF', async () => {
    await expect(
      rows([
        encoder.encode('name,address,status\r\n"A, Inc.","line one\r'),
        encoder.encode('\nline ""two""",\r\nlf,"one\ntwo",03\nplain,value,'),
      ]),
    ).resolves.toEqual([
      ['A, Inc.', 'line one\r\nline "two"', ''],
      ['lf', 'one\ntwo', '03'],
      ['plain', 'value', ''],
    ]);
  });

  test('parses strict EUC-KR bytes split within a multibyte character', async () => {
    await expect(
      rows([Uint8Array.from([0x6e, 0x61, 0x6d, 0x65, 0x0a, 0xb0]), Uint8Array.from([0xa1])], {
        encoding: 'euc-kr',
        headers: ['name'],
      }),
    ).resolves.toEqual([['가']]);
  });

  test.each(['\n', '\r\n'])(
    'bounds logical record content independently of its %j terminator',
    async (separator) => {
      await expect(
        rows([encoder.encode(`h${separator}abc${separator}`)], {
          headers: ['h'],
          maxRecordChars: 3,
        }),
      ).resolves.toEqual([['abc']]);
      await expect(
        rows([encoder.encode(`h${separator}abcd${separator}`)], {
          headers: ['h'],
          maxRecordChars: 3,
        }),
      ).rejects.toThrow('csv_record_char_limit_exceeded');
    },
  );

  test('accepts a header-only final record and yields zero data rows', async () => {
    await expect(rows([encoder.encode('name,address,status')])).resolves.toEqual([]);
  });

  test('rejects a missing header and an exact-header mismatch', async () => {
    await expect(rows([])).rejects.toThrow('csv_header_missing');
    await expect(rows([encoder.encode('name,status\n')])).rejects.toThrow('csv_header_mismatch');
  });

  test('rejects invalid UTF-8 and EUC-KR bytes', async () => {
    await expect(rows([Uint8Array.from([0xff])])).rejects.toThrow('csv_invalid_encoding');
    await expect(
      rows([Uint8Array.from([0xb0, 0x2c])], { encoding: 'euc-kr', headers: ['가'] }),
    ).rejects.toThrow('csv_invalid_encoding');
  });

  test('maps a failed source to a fixed error code without exposing its message', async () => {
    async function* failedSource(): AsyncGenerator<Uint8Array> {
      yield encoder.encode('name,address,status\n');
      throw new Error('source contained a private row value');
    }

    await expect(async () => {
      for await (const _row of parseCsvRows(failedSource(), options)) {
        // The source fails after the header and before a data row.
      }
    }).rejects.toThrow('csv_stream_failed');
  });

  test('rejects a bare CR separator and malformed quote placement', async () => {
    await expect(rows([encoder.encode('name,address,status\rone,two,03\n')])).rejects.toThrow(
      'csv_bare_cr',
    );
    await expect(rows([encoder.encode('name,address,status\na"b,c,03\n')])).rejects.toThrow(
      'csv_quote_in_unquoted_field',
    );
    await expect(rows([encoder.encode('name,address,status\n"a"b,c,03\n')])).rejects.toThrow(
      'csv_characters_after_quote',
    );
  });

  test('rejects an incomplete quoted field and a wrong data column width', async () => {
    await expect(rows([encoder.encode('name,address,status\n"a,b,03')])).rejects.toThrow(
      'csv_incomplete_quote',
    );
    await expect(rows([encoder.encode('name,address,status\na,b\n')])).rejects.toThrow(
      'csv_column_count_invalid',
    );
    await expect(rows([encoder.encode('name,address,status\na,b,c,d\n')])).rejects.toThrow(
      'csv_column_count_invalid',
    );
  });

  test('enforces the byte limit at equality and one byte beyond it', async () => {
    const source = encoder.encode('name,address,status\na,b,c\n');
    await expect(rows([source], { maxBytes: source.byteLength })).resolves.toEqual([
      ['a', 'b', 'c'],
    ]);
    await expect(rows([source], { maxBytes: source.byteLength - 1 })).rejects.toThrow(
      'csv_byte_limit_exceeded',
    );
  });

  test('enforces the row and record-character limits at equality and failure', async () => {
    await expect(
      rows([encoder.encode('name\nabcde\n')], { headers: ['name'], maxRecordChars: 5 }),
    ).resolves.toEqual([['abcde']]);
    await expect(
      rows([encoder.encode('name,address,status\na,b,c\nd,e,f\n')], { maxRows: 1 }),
    ).rejects.toThrow('csv_row_limit_exceeded');
    await expect(
      rows([encoder.encode('name\nabcdef\n')], { headers: ['name'], maxRecordChars: 5 }),
    ).rejects.toThrow('csv_record_char_limit_exceeded');
    await expect(
      rows([encoder.encode('names\nx\n')], { headers: ['names'], maxRecordChars: 4 }),
    ).rejects.toThrow('csv_record_char_limit_exceeded');
  });

  test.each([
    ['maxBytes', 0],
    ['maxRows', Number.NaN],
    ['maxRecordChars', Number.MAX_SAFE_INTEGER + 1],
  ] as const)('rejects malformed runtime limit %s', async (key, value) => {
    await expect(rows([encoder.encode('name,address,status\n')], { [key]: value })).rejects.toThrow(
      'csv_invalid_options',
    );
  });
});
