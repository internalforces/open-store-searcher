export type DataFreshnessV1 =
  | { kind: 'fresh' | 'stale'; ageDays: number }
  | { kind: 'unknown'; ageDays: null }
  | { kind: 'rejected'; code: 'invalid_now' | 'invalid_data_as_of' | 'data_as_of_in_future' };

const seoulDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  era: 'short',
});

function dateOrdinal(value: unknown): number | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(date.valueOf()) || date.toISOString().slice(0, 10) !== value) return null;
  return date.valueOf() / 86_400_000;
}

/** Convert a canonical UTC instant to its calendar date in Asia/Seoul. */
export function seoulCalendarDate(utc: string): string | null {
  if (typeof utc !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(utc)) {
    return null;
  }
  const instant = new Date(utc);
  if (!Number.isFinite(instant.valueOf()) || instant.toISOString() !== utc) return null;
  const parts = seoulDateFormatter.formatToParts(instant);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((value) => value.type === type)?.value;
  const year = part('era') === 'BC' ? 1 - Number(part('year')) : Number(part('year'));
  const result = `${String(year).padStart(4, '0')}-${part('month')}-${part('day')}`;
  return dateOrdinal(result) === null ? null : result;
}

/** ADR-014: unknown is distinct; only more than seven Seoul calendar days is stale. */
export function evaluateDataFreshnessV1(dataAsOf: string | null, now: string): DataFreshnessV1 {
  const today = seoulCalendarDate(now);
  if (today === null) return { kind: 'rejected', code: 'invalid_now' };
  if (dataAsOf === null) return { kind: 'unknown', ageDays: null };
  const coverageOrdinal = dateOrdinal(dataAsOf);
  if (coverageOrdinal === null) return { kind: 'rejected', code: 'invalid_data_as_of' };
  // seoulCalendarDate returns only a validated date.
  const ageDays = (dateOrdinal(today) as number) - coverageOrdinal;
  if (ageDays < 0) return { kind: 'rejected', code: 'data_as_of_in_future' };
  return { kind: ageDays > 7 ? 'stale' : 'fresh', ageDays };
}
