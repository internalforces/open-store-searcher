import type { ArchiveContractEntry } from './archive-contract.js';
import { decodeCsv } from './decode-csv.js';
import type { StagedLicenseRowV1 } from './transform-license-records.js';

/** Strict whole-entry parser. Caller bounds decompression before providing bytes. */
export function parseLicenseCsv(
  bytes: Uint8Array,
  entry: ArchiveContractEntry,
  maxRows: number,
): StagedLicenseRowV1[] {
  return [...iterateLicenseCsv(bytes, entry, maxRows)];
}

/** Holds decoded category text, but yields rows without retaining the whole row graph. */
export function* iterateLicenseCsv(
  bytes: Uint8Array,
  entry: ArchiveContractEntry,
  maxRows: number,
): Generator<StagedLicenseRowV1> {
  if (!Number.isSafeInteger(maxRows) || maxRows < 0) throw new Error('Invalid row limit');
  const text = decodeCsv(bytes, entry.encoding);
  let rowCount = 0;
  let fields: string[] = [],
    field = '',
    quoted = false,
    closed = false,
    header = false;
  const cell = () => {
    fields.push(field);
    field = '';
    closed = false;
  };
  const record = (): StagedLicenseRowV1 | undefined => {
    cell();
    let row: StagedLicenseRowV1 | undefined;
    if (!header) {
      if (
        fields.length !== entry.headers.length ||
        fields.some((value, i) => value.normalize('NFC').trim() !== entry.headers[i])
      )
        throw new Error('CSV header mismatch');
      header = true;
    } else {
      if (fields.length !== entry.headers.length) throw new Error('CSV field count mismatch');
      if (rowCount >= maxRows) throw new Error('CSV row limit exceeded');
      rowCount++;
      row = {
        categoryFileDataId: entry.fileDataId,
        sourceFileDataUrl: `https://www.data.go.kr/data/${entry.fileDataId}/fileData.do`,
        values: Object.fromEntries(entry.headers.map((name, index) => [name, fields[index] ?? ''])),
      };
    }
    fields = [];
    return row;
  };
  for (let i = 0; i < text.length; i++) {
    const character = text[i];
    if (quoted) {
      if (character === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
          closed = true;
        }
      } else field += character;
    } else if (character === ',') cell();
    else if (character === '\n' || character === '\r') {
      if (character === '\r') {
        if (text[i + 1] !== '\n') throw new Error('Unsupported CSV separator');
        i++;
      }
      const row = record();
      if (row) yield row;
    } else if (character === '"' && field === '' && !closed) quoted = true;
    else {
      if (closed || character === '"') throw new Error('Malformed CSV quoting');
      field += character;
    }
  }
  if (quoted) throw new Error('Unterminated CSV quote');
  if (field !== '' || fields.length > 0 || closed) {
    const row = record();
    if (row) yield row;
  }
  if (!header) throw new Error('Missing CSV header');
}
