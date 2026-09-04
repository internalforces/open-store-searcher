import { describe, expect, test } from 'vitest';
import { parseObservationLimits } from './observation-limits.js';

const boundary = {
  'max-bytes': '268435456',
  'max-rows': '100000',
  'max-record-chars': '65536',
  'timeout-ms': '600000',
  'max-rss-bytes': '3221225472',
};
describe('reviewed live observation budget', () => {
  test('accepts all reviewed ceilings at equality', () => {
    expect(parseObservationLimits(boundary)).toEqual({
      maxTotalBytes: 268435456,
      maxRows: 100000,
      maxRecordChars: 65536,
      timeoutMs: 600000,
      maxRssBytes: 3221225472,
    });
  });
  test.each(Object.entries(boundary))(
    'rejects %s one unit beyond its reviewed ceiling',
    (key, value) => {
      expect(() =>
        parseObservationLimits({ ...boundary, [key]: String(Number(value) + 1) }),
      ).toThrow('invalid_observation_limit');
    },
  );
  test.each(['0', '-1', '1.5', '1e3', '', undefined, 12])(
    'rejects malformed or absent limit %s',
    (value) => {
      expect(() => parseObservationLimits({ ...boundary, 'max-rows': value })).toThrow(
        'invalid_observation_limit',
      );
    },
  );
});
