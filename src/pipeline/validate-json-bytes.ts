export type JsonBytesValidationV1 =
  | { kind: 'accepted'; byteLength: number }
  | {
      kind: 'rejected';
      code:
        | 'invalid_json_bytes'
        | 'invalid_json_byte_limit'
        | 'json_empty'
        | 'json_size_exceeded'
        | 'json_invalid_utf8'
        | 'json_invalid_syntax';
    };

/** Validate only UTF-8 encoding, JSON syntax and an explicit byte limit, not an artifact schema. */
export function validateJsonBytesV1(bytes: Uint8Array, maxBytes: number): JsonBytesValidationV1 {
  if (!(bytes instanceof Uint8Array)) return { kind: 'rejected', code: 'invalid_json_bytes' };
  if (!Number.isSafeInteger(maxBytes) || maxBytes <= 0) {
    return { kind: 'rejected', code: 'invalid_json_byte_limit' };
  }
  if (bytes.byteLength === 0) return { kind: 'rejected', code: 'json_empty' };
  if (bytes.byteLength > maxBytes) return { kind: 'rejected', code: 'json_size_exceeded' };
  let text: string;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    return { kind: 'rejected', code: 'json_invalid_utf8' };
  }
  try {
    JSON.parse(text);
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
    return { kind: 'rejected', code: 'json_invalid_syntax' };
  }
  return { kind: 'accepted', byteLength: bytes.byteLength };
}
