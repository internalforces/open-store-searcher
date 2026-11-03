import { describe, expect, test } from 'vitest';
import { columnValue, validateBlock } from './compact-data.js';
import { PackedStringValues } from './packed-string-values.js';

describe('owned native string columns (FR-07, FR-13)', () => {
  test('preserves exact UTF-16, empty values and input independence', () => {
    const values = ['', '0'.repeat(64), '서울', 'é', '🌱', '\ud800', '\udfff', 'a\0b'];
    const expected = values.slice();
    const packed = new PackedStringValues(values);
    values[1] = 'changed';
    expect(packed.length).toBe(expected.length);
    for (const [index, value] of expected.entries()) {
      expect(packed.at(index)).toBe(value);
      expect(columnValue({ values: packed }, index, [])).toBe(value);
    }
    expect(packed.at(-1)).toBeUndefined();
    expect(packed.at(0.5)).toBeUndefined();
    expect(packed.at(expected.length)).toBeUndefined();
  });

  test('uses one byte per Latin-1 unit without losing long or wide strings', () => {
    const latin = ['a'.repeat(100_000), 'é'];
    const packed = new PackedStringValues(latin);
    expect(packed.byteLength).toBe(100_001 + 3 * 4);
    expect(packed.at(0)).toBe(latin[0]);
    expect(packed.at(1)).toBe(latin[1]);
    const wide = new PackedStringValues(['a', '서울']);
    expect(wide.byteLength).toBe(3 * 2 + 3 * 4);
    expect(wide.at(1)).toBe('서울');
  });

  test('keeps native storage outside the accepted JSON wire contract', () => {
    const columns = Array.from({ length: 4 }, () => ({ values: new PackedStringValues(['']) }));
    expect(() =>
      validateBlock(
        { version: 1, archiveSha256: 'b'.repeat(64), role: 'search', start: 0, count: 1, columns },
        { role: 'search', start: 0, count: 1 },
        'b'.repeat(64),
        [],
      ),
    ).toThrow('Invalid compact dataset');
  });
});
