import { describe, expect, test } from 'vitest';
import { evaluateDataFreshnessV1, seoulCalendarDate } from './data-freshness.js';

describe('TASK-008 V09/V10 FR-08/FR-14 freshness', () => {
  test.each([
    ['2026-09-04T14:59:59.999Z', 'fresh', 7],
    ['2026-09-04T15:00:00.000Z', 'stale', 8],
    ['2026-09-04T15:00:00.001Z', 'stale', 8],
  ])('evaluates the seven-day Seoul boundary at %s', (now, kind, ageDays) => {
    expect(evaluateDataFreshnessV1('2026-08-28', now)).toEqual({ kind, ageDays });
  });

  test.each([
    ['2026-09-04', '2026-09-04T01:00:00.000Z', 0],
    ['2024-02-28', '2024-02-29T15:00:00.000Z', 2],
    ['2025-12-31', '2026-01-01T15:00:00.000Z', 2],
    ['2026-08-31', '2026-09-01T15:00:00.000Z', 2],
  ])('uses calendar arithmetic from %s through %s', (date, now, ageDays) => {
    expect(evaluateDataFreshnessV1(date, now)).toEqual({ kind: 'fresh', ageDays });
  });

  test('keeps unknown coverage distinct from fresh coverage', () => {
    expect(evaluateDataFreshnessV1(null, '2026-09-04T00:00:00.000Z')).toEqual({
      kind: 'unknown',
      ageDays: null,
    });
  });

  test.each([
    '2026-02-29',
    '2024-02-30',
    '2026-13-01',
    '2026-01-00',
    '2026-9-04',
    '',
    42,
    undefined,
    {},
  ])('rejects invalid coverage date %s without rollover or coercion', (date) => {
    expect(evaluateDataFreshnessV1(date as string, '2026-09-04T00:00:00.000Z')).toEqual({
      kind: 'rejected',
      code: 'invalid_data_as_of',
    });
  });

  test.each([
    '2026-02-30T00:00:00.000Z',
    '2026-09-04T00:00:00Z',
    '2026-09-04T09:00:00.000+09:00',
    '2026-09-04',
    'invalid',
    null,
    42,
    {},
  ])('rejects noncanonical now %s even for unknown coverage', (now) => {
    expect(evaluateDataFreshnessV1(null, now as string)).toEqual({
      kind: 'rejected',
      code: 'invalid_now',
    });
    expect(seoulCalendarDate(now as string)).toBeNull();
  });

  test('rejects coverage after the current Seoul date', () => {
    expect(evaluateDataFreshnessV1('2026-09-05', '2026-09-04T14:59:59.999Z')).toEqual({
      kind: 'rejected',
      code: 'data_as_of_in_future',
    });
  });

  test('returns the Seoul date on both sides of UTC afternoon midnight', () => {
    expect(seoulCalendarDate('2026-09-04T14:59:59.999Z')).toBe('2026-09-04');
    expect(seoulCalendarDate('2026-09-04T15:00:00.000Z')).toBe('2026-09-05');
  });

  test('handles four-digit calendar extremes without rollover', () => {
    expect(evaluateDataFreshnessV1('0000-01-01', '0000-01-01T00:00:00.000Z')).toEqual({
      kind: 'fresh',
      ageDays: 0,
    });
    expect(seoulCalendarDate('9999-12-31T23:59:59.999Z')).toBeNull();
  });
});
