import type { ObservationLimits } from './observe-license-archive.js';

/** ADR-015 reviewed experiment stop conditions, never production validation thresholds. */
export function parseObservationLimits(values: Record<string, unknown>): ObservationLimits {
  const bounded = (key: string, ceiling: number) => {
    const value = values[key];
    if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value))
      throw new Error('invalid_observation_limit');
    const number = Number(value);
    if (!Number.isSafeInteger(number) || number > ceiling)
      throw new Error('invalid_observation_limit');
    return number;
  };
  return {
    maxTotalBytes: bounded('max-bytes', 268_435_456),
    maxRows: bounded('max-rows', 100_000),
    maxRecordChars: bounded('max-record-chars', 65_536),
    timeoutMs: bounded('timeout-ms', 600_000),
    maxRssBytes: bounded('max-rss-bytes', 3_221_225_472),
  };
}
