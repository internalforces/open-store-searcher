export interface CsvHeaderEvidence {
  encoding: 'utf-8' | 'euc-kr';
  delimiter: ',';
  headers: string[];
  timestampFields: string[];
}

function decode(bytes: Uint8Array): { text: string; encoding: 'utf-8' | 'euc-kr' } {
  for (const encoding of ['utf-8', 'euc-kr'] as const) {
    try {
      return { text: new TextDecoder(encoding, { fatal: true }).decode(bytes), encoding };
    } catch {
      // Continue to the only approved fallback.
    }
  }
  throw new Error('CSV encoding is neither strict UTF-8 nor EUC-KR');
}

function firstRecord(text: string): string {
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"') {
      if (quoted && text[index + 1] === '"') {
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (!quoted && (character === '\n' || character === '\r')) {
      if (character === '\r' && text[index + 1] !== '\n') {
        throw new Error('CSV header uses an unsupported record separator');
      }
      return text.slice(0, index);
    }
  }
  throw new Error('bytes do not contain a complete CSV header record');
}

function parseRecord(record: string): string[] {
  const fields: string[] = [];
  let field = '';
  let quoted = false;
  let afterQuote = false;
  for (let index = 0; index < record.length; index += 1) {
    const character = record[index];
    if (quoted) {
      if (character === '"') {
        if (record[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          quoted = false;
          afterQuote = true;
        }
      } else {
        field += character;
      }
    } else if (character === ',' && !quoted) {
      fields.push(field);
      field = '';
      afterQuote = false;
    } else if (character === '"' && field.length === 0 && !afterQuote) {
      quoted = true;
    } else if (afterQuote) {
      throw new Error('CSV header contains characters after a closing quote');
    } else {
      field += character;
    }
  }
  if (quoted) throw new Error('bytes do not contain a complete CSV header record');
  fields.push(field);
  return fields;
}

export function inspectCsvHeader(bytes: Uint8Array): CsvHeaderEvidence {
  const decoded = decode(bytes);
  const text = decoded.text.startsWith('\ufeff') ? decoded.text.slice(1) : decoded.text;
  const headers = parseRecord(firstRecord(text)).map((header) => header.normalize('NFC').trim());
  if (headers.some((header) => header.length === 0)) throw new Error('empty CSV header');
  if (new Set(headers).size !== headers.length) throw new Error('duplicate CSV header');
  const timestampFields = headers.filter(
    (header) =>
      header.includes('수정시점') ||
      header.includes('데이터갱신시점') ||
      header === 'LAST_MDFCN_PNT' ||
      header === 'DAT_UPDT_PNT',
  );
  return { encoding: decoded.encoding, delimiter: ',', headers, timestampFields };
}
