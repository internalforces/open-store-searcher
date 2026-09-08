import { demoDataset } from '../../src/app/demo-data.js';
import type { DisplayDataset } from '../../src/app/display-data.js';

/** Nearest-rank percentiles; retain every sample, including cold and slow runs. */
export function summarize(samples: readonly number[]) {
  if (!samples.length || samples.some((value) => !Number.isFinite(value) || value < 0)) {
    throw new Error('Expected nonempty, finite, nonnegative measurements.');
  }
  const ordered = [...samples].sort((a, b) => a - b);
  const rank = (fraction: number) => ordered[Math.ceil(ordered.length * fraction) - 1] as number;
  return {
    count: ordered.length,
    min: ordered[0] as number,
    median: rank(0.5),
    p95: rank(0.95),
    max: rank(1),
  };
}

/** Conservative lab gate: every observed sample must meet the inclusive PRD target. */
export function assessBudget(samples: readonly number[], limit: number) {
  if (!samples.length) return 'unavailable';
  return summarize(samples).max <= limit ? 'pass' : 'exceeded';
}

export function utf8Bytes(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}

export const queries = {
  exact: '합성개별1호 서울특별시 마포구 월드컵1로 2',
  common: '합성공통상점',
  address: '서울특별시 마포구 월드컵1로 2',
  absent: '존재하지않는측정대상',
};

/** Invented, resource-bounded scale fixture; never a Seoul distribution estimate. */
export function makeDataset(size: number): DisplayDataset {
  if (!Number.isInteger(size) || size < 1 || size > 50_000) {
    throw new Error('Synthetic scale must be an integer from 1 to 50000.');
  }
  const template = demoDataset.records[0];
  if (!template) throw new Error('Synthetic display template missing.');
  return {
    ...demoDataset,
    exampleQuery: queries.exact,
    records: Array.from({ length: size }, (_, index) => ({
      ...template,
      id: `perf-${index}`,
      name: index % 100 === 0 ? queries.common : `합성개별${index}호`,
      roadAddress: `서울특별시 마포구 월드컵${index % 100}로 ${index + 1}`,
    })),
  };
}
