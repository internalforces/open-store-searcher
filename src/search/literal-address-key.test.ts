import { describe, expect, test } from 'vitest';
import { matchesLiteralAddress, matchesLiteralAddressKey } from './search-candidates.js';

describe('TASK-009 allocation-free literal admission (FR-02/03/07)', () => {
  test('matches the unchanged token-array oracle for every numeric boundary and literal fallback', () => {
    const keys = [
      '',
      '서울특별시 강남구 테헤란로 112 12 12-3',
      '112 121 12',
      'abc123 abc 123',
      '서초구 서초동 12-30',
      'a bc',
      '봄😀상점 1-12',
    ];
    const values = [
      '',
      '12',
      '112',
      '1',
      '12-3',
      '12-30',
      'abc123',
      '123',
      'a bc',
      '서울특별시',
      '강남',
      '초동',
      '龘靐齉爩',
      '😀',
      'bc',
    ];
    for (const key of keys) {
      const tokens = key ? key.split(' ') : [];
      for (const first of values)
        for (const second of ['', ...values]) {
          const literal = [first, second]
            .filter((v) => v !== '')
            .map((value) => ({
              value,
              numeric: /\d/u.test(value),
            }));
          expect(matchesLiteralAddressKey(key, literal), JSON.stringify({ key, literal })).toBe(
            matchesLiteralAddress(tokens, literal),
          );
        }
    }
    expect(matchesLiteralAddressKey('112 12', [{ value: '12', numeric: true }])).toBe(true);
    expect(matchesLiteralAddressKey('112 121', [{ value: '12', numeric: true }])).toBe(false);
    expect(matchesLiteralAddressKey('a bc', [{ value: 'a bc', numeric: false }])).toBe(false);
  });
});
