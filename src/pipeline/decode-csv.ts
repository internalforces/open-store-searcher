import iconv from 'iconv-lite';

/** Preserve the source contract label while accepting its CP949 extension repertoire. */
export function decodeCsv(bytes: Uint8Array, encoding: 'utf-8' | 'euc-kr'): string {
  if (encoding === 'utf-8') return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  const input = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const text = iconv.decode(input, 'cp949', { stripBOM: false });
  if (!iconv.encode(text, 'cp949').equals(input)) {
    throw new Error('CSV contains invalid or non-round-trippable CP949 bytes');
  }
  return text;
}
