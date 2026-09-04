import { describe, expect, test } from 'vitest';
import { validateJsonBytesV1 } from './validate-json-bytes.js';

const encode = (text: string) => new TextEncoder().encode(text);

describe('TASK-008 V12 FR-13 JSON boundary', () => {
  test('accepts exact UTF-8 byte limit for Korean text and escapes without changing bytes', () => {
    const bytes = encode('{"name":"서울","escape":"\\n\\u0041"}');
    const before = bytes.slice();
    expect(bytes.byteLength).toBeGreaterThan(new TextDecoder().decode(bytes).length);
    expect(validateJsonBytesV1(bytes, bytes.byteLength)).toEqual({
      kind: 'accepted',
      byteLength: bytes.byteLength,
    });
    expect(bytes).toEqual(before);
    expect(validateJsonBytesV1(bytes, bytes.byteLength + 1)).toEqual({
      kind: 'accepted',
      byteLength: bytes.byteLength,
    });
    expect(validateJsonBytesV1(bytes, bytes.byteLength - 1)).toEqual({
      kind: 'rejected',
      code: 'json_size_exceeded',
    });
  });

  test('checks size before decoding malformed oversized bytes', () => {
    expect(validateJsonBytesV1(new Uint8Array([0xff, 0xff]), 1)).toEqual({
      kind: 'rejected',
      code: 'json_size_exceeded',
    });
  });

  test.each([0, -1, 1.1, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, null, '12'])(
    'rejects invalid byte limit %s',
    (limit) => {
      expect(validateJsonBytesV1(encode('{}'), limit as number)).toEqual({
        kind: 'rejected',
        code: 'invalid_json_byte_limit',
      });
    },
  );

  test.each([null, '{}', [123, 125], new Uint16Array([123, 125]), {}].map((bytes) => ({ bytes })))(
    'rejects malformed byte buffer %s',
    ({ bytes }) => {
      expect(validateJsonBytesV1(bytes as Uint8Array, 100)).toEqual({
        kind: 'rejected',
        code: 'invalid_json_bytes',
      });
    },
  );

  test('rejects an empty byte buffer', () => {
    expect(validateJsonBytesV1(new Uint8Array(), 100)).toEqual({
      kind: 'rejected',
      code: 'json_empty',
    });
  });

  test.each([[0xff], [0x22, 0xe3, 0x81], [0x22, 0xc0, 0xaf, 0x22]].map((bytes) => ({ bytes })))(
    'rejects malformed or truncated UTF-8 %s',
    ({ bytes }) => {
      expect(validateJsonBytesV1(new Uint8Array(bytes), 100)).toEqual({
        kind: 'rejected',
        code: 'json_invalid_utf8',
      });
    },
  );

  test.each([' ', '{"name":', '{"x":1,}', '"\\x"', '{}{}'])(
    'rejects malformed or truncated JSON %s',
    (json) => {
      expect(validateJsonBytesV1(encode(json), 100)).toEqual({
        kind: 'rejected',
        code: 'json_invalid_syntax',
      });
    },
  );

  test.each(['null', '42', '"서울"', 'true', '[]', '{}'])(
    'checks syntax only without claiming a public schema for %s',
    (json) => {
      const bytes = encode(json);
      expect(validateJsonBytesV1(bytes, 100)).toEqual({
        kind: 'accepted',
        byteLength: bytes.byteLength,
      });
    },
  );
});
