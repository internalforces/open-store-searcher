export interface StreamCsvOptions {
  encoding: 'utf-8' | 'euc-kr';
  headers: readonly string[];
  maxBytes: number;
  maxRows: number;
  maxRecordChars: number;
}

type CsvState = 'unquoted' | 'quoted' | 'after_quote';

const CSV_ERROR_CODES = [
  'csv_invalid_options',
  'csv_record_char_limit_exceeded',
  'csv_header_mismatch',
  'csv_column_count_invalid',
  'csv_row_limit_exceeded',
  'csv_bare_cr',
  'csv_characters_after_quote',
  'csv_quote_in_unquoted_field',
  'csv_invalid_encoding',
  'csv_invalid_chunk',
  'csv_byte_limit_exceeded',
  'csv_stream_failed',
  'csv_incomplete_quote',
  'csv_header_missing',
] as const;
export type CsvParseErrorCode = (typeof CSV_ERROR_CODES)[number];
export function isCsvParseErrorCode(value: unknown): value is CsvParseErrorCode {
  return typeof value === 'string' && CSV_ERROR_CODES.some((code) => code === value);
}
export class CsvParseError extends Error {
  readonly code: CsvParseErrorCode;
  constructor(code: CsvParseErrorCode) {
    super(code);
    this.code = code;
  }
}
function fail(code: CsvParseErrorCode): never {
  throw new CsvParseError(code);
}

function isPositiveSafeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}

function validateOptions(options: StreamCsvOptions): void {
  if (
    typeof options !== 'object' ||
    options === null ||
    (options.encoding !== 'utf-8' && options.encoding !== 'euc-kr') ||
    !Array.isArray(options.headers) ||
    options.headers.length === 0 ||
    !options.headers.every((header) => typeof header === 'string') ||
    !isPositiveSafeInteger(options.maxBytes) ||
    !isPositiveSafeInteger(options.maxRows) ||
    !isPositiveSafeInteger(options.maxRecordChars)
  ) {
    fail('csv_invalid_options');
  }
}

/**
 * Parses one contract-bound CSV stream without retaining the input or completed rows.
 * The caller must consume the source to EOF and await its producing process separately.
 */
export async function* parseCsvRows(
  chunks: AsyncIterable<Uint8Array>,
  options: StreamCsvOptions,
): AsyncGenerator<string[]> {
  validateOptions(options);

  const decoder = new TextDecoder(options.encoding, { fatal: true, ignoreBOM: true });
  let bytesRead = 0;
  let rowsRead = 0;
  let headerRead = false;
  let atStart = true;
  let pendingCarriageReturn = false;
  let state: CsvState = 'unquoted';
  let recordChars = 0;
  let recordStarted = false;
  let field = '';
  let fields: string[] = [];

  const resetRecord = () => {
    state = 'unquoted';
    recordChars = 0;
    recordStarted = false;
    field = '';
    fields = [];
  };

  const addRecordCharacter = () => {
    recordStarted = true;
    recordChars += 1;
    if (recordChars > options.maxRecordChars) fail('csv_record_char_limit_exceeded');
  };

  const completeField = () => {
    if (fields.length >= options.headers.length) {
      fail(headerRead ? 'csv_column_count_invalid' : 'csv_header_mismatch');
    }
    fields.push(field);
    field = '';
  };

  const completeRecord = (): string[] | undefined => {
    completeField();
    const completed = fields;
    resetRecord();

    if (!headerRead) {
      if (
        completed.length !== options.headers.length ||
        completed.some((header, index) => header !== options.headers[index])
      ) {
        fail('csv_header_mismatch');
      }
      headerRead = true;
      return undefined;
    }

    if (completed.length !== options.headers.length) fail('csv_column_count_invalid');
    if (rowsRead >= options.maxRows) fail('csv_row_limit_exceeded');
    rowsRead += 1;
    return completed;
  };

  const consumeCharacter = (character: string): string[] | undefined => {
    if (pendingCarriageReturn) {
      if (character !== '\n') fail('csv_bare_cr');
      pendingCarriageReturn = false;
      if (state === 'quoted') {
        addRecordCharacter();
        field += '\n';
        return undefined;
      }
      return completeRecord();
    }

    if (character === '\r') {
      if (state === 'quoted') {
        addRecordCharacter();
        field += '\r';
      }
      pendingCarriageReturn = true;
      return undefined;
    }

    if (character === '\n' && state !== 'quoted') return completeRecord();

    addRecordCharacter();
    if (state === 'quoted') {
      if (character === '"') state = 'after_quote';
      else field += character;
      return undefined;
    }

    if (state === 'after_quote') {
      if (character === '"') {
        field += '"';
        state = 'quoted';
      } else if (character === ',') {
        completeField();
        state = 'unquoted';
      } else {
        fail('csv_characters_after_quote');
      }
      return undefined;
    }

    if (character === ',') {
      completeField();
    } else if (character === '"') {
      if (field.length !== 0) fail('csv_quote_in_unquoted_field');
      state = 'quoted';
    } else {
      field += character;
    }
    return undefined;
  };

  const consumeText = function* (text: string): Generator<string[]> {
    const initial = atStart && text.startsWith('\ufeff') ? text.slice(1) : text;
    if (text.length > 0) atStart = false;
    for (const character of initial) {
      const completed = consumeCharacter(character);
      if (completed) yield completed;
    }
  };

  const decode = (chunk?: Uint8Array): string => {
    try {
      return chunk ? decoder.decode(chunk, { stream: true }) : decoder.decode();
    } catch {
      return fail('csv_invalid_encoding');
    }
  };

  try {
    for await (const chunk of chunks) {
      if (!(chunk instanceof Uint8Array)) fail('csv_invalid_chunk');
      bytesRead += chunk.byteLength;
      if (bytesRead > options.maxBytes) fail('csv_byte_limit_exceeded');
      for (const completed of consumeText(decode(chunk))) yield completed;
    }
    for (const completed of consumeText(decode())) yield completed;
  } catch (error) {
    if (error instanceof CsvParseError) throw error;
    fail('csv_stream_failed');
  }

  if (pendingCarriageReturn) fail('csv_bare_cr');
  if (isQuoted(state)) fail('csv_incomplete_quote');
  if (recordStarted) {
    const completed = completeRecord();
    if (completed) yield completed;
  }
  if (!headerRead) fail('csv_header_missing');
}

function isQuoted(state: CsvState): boolean {
  return state === 'quoted';
}
