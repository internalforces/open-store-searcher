import { execFileSync, spawnSync } from 'node:child_process';
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';
import { evaluateSearchQuality } from '../../tests/quality/evaluate-search-quality.js';
import { createSearchIndex, searchCandidates } from './search-candidates.js';

const corpus = JSON.parse(
  readFileSync(new URL('../../tests/fixtures/search/seoul-quality.json', import.meta.url), 'utf8'),
);
function at<T>(rows: T[], index: number): T {
  const row = rows[index];
  if (row === undefined) throw new Error('Missing test fixture row');
  return row;
}

const record = {
  id: 'target',
  name: '테스트상점',
  roadAddress: '강남구 테헤란로 12',
  parcelAddress: '',
};
function sample(count: number, hits: number) {
  return {
    id: 'metric-test',
    provenance: { kind: 'synthetic', description: 'Metric oracle', annotation: 'Explicit targets' },
    records: [{ ...record }],
    cases: Array.from({ length: count }, (_, i) => ({
      id: `case-${i}`,
      family: 'exact-road',
      targetId: 'target',
      exact: true,
      query: i < hits ? '테스트상점 강남구 테헤란로 12' : '다른이름 강남구 테헤란로 999',
      forbiddenTopIds: [] as string[],
      primary: 'any',
    })),
  };
}

describe('TASK-013 quality measurement', () => {
  test('Q02 counts rank three as a hit and rank four as a miss without relabeling ties', () => {
    const report = evaluateSearchQuality(corpus);
    const cases = report.cases.filter((row) => row.family === 'exact-tie');
    expect(cases.map((row) => row.targetRank)).toEqual([1, 2, 3, null, null]);
    expect(cases.map((row) => row.hit)).toEqual([true, true, true, false, false]);
    expect(report.byFamily['exact-tie']).toMatchObject({
      exact: { hits: 3, total: 5, recall: 0.6 },
    });
    expect(report.misses).toContain('tie-d');
    expect(report.misses).toContain('tie-e');
  });

  test('Q03 keeps low-only targets out of recall and reports family denominators', () => {
    const fixture = sample(2, 1);
    at(fixture.cases, 1).query = '테스트상점';
    const report = evaluateSearchQuality(fixture);
    expect(report.exact).toEqual({ hits: 1, total: 2, recall: 0.5, thresholdMet: false });
    expect(report.cases[1]).toMatchObject({ hit: false, targetRank: null, similarOnly: true });
    expect(report.byFamily['exact-road']).toMatchObject({ similarOnly: 1, total: 2 });
    expect(report.misses).toEqual(['case-1']);
  });

  test.each([
    [8, false],
    [9, true],
    [10, true],
  ] as const)(
    'Q06 applies the unrounded 90 percent boundary to %i of ten hits',
    (hits, thresholdMet) => {
      expect(evaluateSearchQuality(sample(10, hits)).exact).toEqual({
        hits,
        total: 10,
        recall: hits / 10,
        thresholdMet,
      });
    },
  );

  test('Q06 reports an empty denominator as unassessed rather than perfect recall', () => {
    const report = evaluateSearchQuality(sample(0, 0));
    expect(report.exact).toEqual({ hits: 0, total: 0, recall: null, thresholdMet: null });
    expect(report.checkPassed).toBe(false);
  });

  test('Q01 never promotes synthetic threshold success to release evidence', () => {
    const report = evaluateSearchQuality(sample(10, 10));
    expect(report.checkPassed).toBe(true);
    expect(report.provenance.kind).toBe('synthetic');
    expect(report.releaseCriterion).toBe('not-assessed');
  });

  test('Q04 preserves records and separates safety checks from observed recall misses', () => {
    const before = JSON.stringify(corpus);
    const report = evaluateSearchQuality(corpus);
    expect(report.safetyFailures).toEqual([]);
    expect(report.cases.find((row) => row.id === 'name-only')).toMatchObject({
      topIds: [],
      primaryId: null,
      similarOnly: true,
    });
    expect(report.cases.find((row) => row.id === 'absent')).toMatchObject({
      topIds: [],
      similarIds: [],
      primaryId: null,
    });
    expect(JSON.stringify(corpus)).toBe(before);
    expect(
      new Set(corpus.records.map((row: { processedStatus: string }) => row.processedStatus)),
    ).toEqual(new Set(['행정상 영업', '휴업', '폐업', '확인되지 않음']));
  });

  test('Q04 fails the check for forbidden Top-3 and forbidden primary even at perfect recall', () => {
    const fixture = sample(1, 1);
    at(fixture.cases, 0).forbiddenTopIds = ['target'];
    at(fixture.cases, 0).primary = 'none';
    const report = evaluateSearchQuality(fixture);
    expect(report.exact.thresholdMet).toBe(true);
    expect(report.safetyFailures).toEqual([
      { caseId: 'case-0', reason: 'forbidden-top:target' },
      { caseId: 'case-0', reason: 'unexpected-primary:target' },
    ]);
    expect(report.checkPassed).toBe(false);
  });

  test.each([
    [
      'duplicate case IDs',
      (f: ReturnType<typeof sample>) => {
        f.cases.push({ ...at(f.cases, 0) });
      },
    ],
    [
      'duplicate record IDs',
      (f: ReturnType<typeof sample>) => {
        f.records.push({ ...record });
      },
    ],
    [
      'unknown target',
      (f: ReturnType<typeof sample>) => {
        at(f.cases, 0).targetId = 'missing';
      },
    ],
    [
      'unknown forbidden ID',
      (f: ReturnType<typeof sample>) => {
        at(f.cases, 0).forbiddenTopIds = ['missing'];
      },
    ],
    [
      'invalid record',
      (f: ReturnType<typeof sample>) => {
        at(f.records, 0).name = null as unknown as string;
      },
    ],
    [
      'exact without target',
      (f: ReturnType<typeof sample>) => {
        at(f.cases, 0).targetId = null as unknown as string;
      },
    ],
    [
      'invalid exact flag',
      (f: ReturnType<typeof sample>) => {
        at(f.cases, 0).exact = 'yes' as unknown as boolean;
      },
    ],
    [
      'invalid primary rule',
      (f: ReturnType<typeof sample>) => {
        at(f.cases, 0).primary = 'guess';
      },
    ],
    [
      'empty provenance',
      (f: ReturnType<typeof sample>) => {
        f.provenance.description = '';
      },
    ],
  ])('Q05 rejects %s instead of silently shrinking the benchmark', (_, mutate) => {
    const fixture = sample(1, 1);
    mutate(fixture);
    expect(() => evaluateSearchQuality(fixture)).toThrow('Invalid quality corpus');
  });

  test.each([null, [], {}, { ...sample(1, 1), cases: null }, { ...sample(1, 1), records: null }])(
    'Q05 rejects malformed envelopes %#',
    (value) => {
      expect(() => evaluateSearchQuality(value)).toThrow('Invalid quality corpus');
    },
  );

  test('Q05 requires a literal provenance discriminator', () => {
    const fixture = sample(1, 1);
    const provenance = { ...fixture.provenance, kind: { toString: () => 'synthetic' } };
    expect(() => evaluateSearchQuality({ ...fixture, provenance })).toThrow(
      'Invalid quality corpus',
    );
  });

  test('Q02 retains the complete labeled corpus and its measured baseline misses', () => {
    const report = evaluateSearchQuality(corpus);
    expect(report.recordCount).toBe(24);
    expect(report.caseCount).toBe(42);
    expect(report.exact).toEqual({ hits: 28, total: 30, recall: 28 / 30, thresholdMet: true });
    expect(report.misses).toEqual(['tie-d', 'tie-e']);
    expect(report.byFamily['exact-road']?.exact).toMatchObject({ hits: 12, total: 12 });
    expect(report.byFamily['exact-parcel']?.exact).toMatchObject({ hits: 12, total: 12 });
  });

  test.each([
    ['alias', 'gangnam'],
    ['notation', 'gangnam'],
    ['partial', 'jongno'],
    ['number-12', 'gangnam'],
    ['number-hyphen', 'num-12-1'],
  ])('Q04 retrieves the annotated target for %s', (id, targetId) => {
    const row = evaluateSearchQuality(corpus).cases.find((row) => row.id === id);
    expect(row).toMatchObject({ targetId, targetRank: 1, hit: true });
  });

  test('Q08 evaluates 100 unique source targets across all 25 districts at or above 90 percent', () => {
    const source = JSON.parse(
      readFileSync(
        new URL('../../tests/fixtures/search/seoul-source-quality.json', import.meta.url),
        'utf8',
      ),
    );
    const report = evaluateSearchQuality(source);
    expect(report.provenance.kind).toBe('source-sample');
    expect(report.exact.total).toBe(100);
    expect(new Set(source.cases.map((row: { targetId: string }) => row.targetId)).size).toBe(100);
    expect(report.exact.thresholdMet).toBe(true);
    expect(report.checkPassed).toBe(true);
    expect(report.releaseCriterion).toBe('not-assessed');
    const audit = JSON.parse(
      readFileSync(
        new URL('../../tests/fixtures/search/seoul-source-audit.json', import.meta.url),
        'utf8',
      ),
    );
    const districts = new Map<string, number>();
    for (const target of audit.targets)
      districts.set(target.district, (districts.get(target.district) ?? 0) + 1);
    expect(districts.size).toBe(25);
    expect([...districts.values()]).toEqual(Array(25).fill(4));
    expect(audit.targetCount).toBe(100);
    expect(audit.recordCount).toBe(source.records.length);
  });

  test('Q08 measures the source corpus through the same checked CLI path', () => {
    const cli = new URL('../../scripts/measure-search-quality.mjs', import.meta.url);
    const run = spawnSync(process.execPath, [cli.pathname, '--source', '--check'], {
      encoding: 'utf8',
    });
    expect(run.status).toBe(0);
    const report = JSON.parse(run.stdout);
    expect(report.result.provenance.kind).toBe('source-sample');
    expect(report.result.exact).toMatchObject({ total: 100, thresholdMet: true });
  }, 30_000);

  test('Q07 reproduces the report after reversing candidate input order', () => {
    const first = evaluateSearchQuality(corpus);
    const reversed = evaluateSearchQuality({ ...corpus, records: [...corpus.records].reverse() });
    expect(reversed).toEqual(first);
  });

  test('Q07 executes the offline CLI deterministically with auditable hashes and honest exit codes', () => {
    const cli = new URL('../../scripts/measure-search-quality.mjs', import.meta.url);
    const run = () => execFileSync(process.execPath, [cli.pathname], { encoding: 'utf8' });
    const first = run();
    expect(run()).toBe(first);
    const report = JSON.parse(first);
    expect(report.runtime).toEqual({ node: process.version, icu: process.versions.icu });
    expect(report.corpusSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(report.implementationSha256['src/search/search-candidates.ts']).toMatch(
      /^[a-f0-9]{64}$/,
    );
    expect(report.result).toEqual(evaluateSearchQuality(corpus));
    const checked = spawnSync(process.execPath, [cli.pathname, '--check'], { encoding: 'utf8' });
    expect(checked.status).toBe(report.result.checkPassed ? 0 : 1);
    expect(JSON.parse(checked.stdout)).toEqual(report);
    const invalid = spawnSync(process.execPath, [cli.pathname, '--unknown'], { encoding: 'utf8' });
    expect(invalid.status).toBe(2);
    expect(invalid.stdout).toBe('');
  }, 30_000);
});

test('Q03 reports low-only targets beyond the bounded similar-ID preview without counting a hit', () => {
  const fixture = sample(1, 1);
  at(fixture.cases, 0).query = '테스트상점';
  for (let i = 0; i < 12; i++) fixture.records.push({ ...record, id: `distractor-${i}` });
  const row = evaluateSearchQuality(fixture).cases[0];
  expect(row).toMatchObject({
    hit: false,
    similarOnly: true,
    similarCount: 13,
    similarIdsTruncated: true,
  });
  expect(row?.similarIds).toHaveLength(10);
  expect(row?.similarIds).not.toContain('target');
});

test('R1/R3 retrieves the reviewed source records with medium confidence', () => {
  const source = JSON.parse(
    readFileSync(
      new URL('../../tests/fixtures/search/seoul-source-quality.json', import.meta.url),
      'utf8',
    ),
  );
  const index = createSearchIndex(source.records);
  for (const [input, road] of [
    ['서울특별시 영등포구 신길로34길 14 (신길동)', '서울특별시 영등포구 신길로34길 14 (신길동)'],
    [
      '서울특별시 양천구 화곡로3길 3, 1층 1호 (신월동)',
      '서울특별시 양천구 화곡로3길 3, 1층 1호 (신월동)',
    ],
    [
      '김밥천국 서울특별시 강남구 삼성로 238',
      '서울특별시 강남구 삼성로 238 (대치동,지상1층104,105호)',
    ],
  ] as const) {
    const target = source.records.find((row: { roadAddress: string }) => row.roadAddress === road);
    expect(target).toBeDefined();
    const result = searchCandidates(index, input);
    expect(result.topMatches.find((match) => match.record.id === target.id)).toMatchObject({
      confidence: 'medium',
    });
    expect(result.primaryMatch).toBeNull();
  }
});

test.each([
  'corpus',
  'formatted-digest',
  'raw-digest',
  'missing-digest',
  'raw-only-valid',
  'formatted-valid',
])(
  'R2 checks the source audit binding before reporting success: %s',
  (change) => {
    const root = fileURLToPath(new URL('../../', import.meta.url));
    const sandbox = mkdtempSync(join(tmpdir(), 'search-quality-audit-'));
    try {
      for (const path of [
        'scripts/measure-search-quality.mjs',
        'src/search',
        'tests/quality',
        'tests/fixtures/search',
        'package-lock.json',
      ]) {
        const destination = join(sandbox, path);
        mkdirSync(join(destination, '..'), { recursive: true });
        cpSync(join(root, path), destination, { recursive: true });
      }
      symlinkSync(join(root, 'node_modules'), join(sandbox, 'node_modules'), 'dir');
      const auditPath = join(sandbox, 'tests/fixtures/search/seoul-source-audit.json');
      const audit = JSON.parse(readFileSync(auditPath, 'utf8'));
      if (change === 'corpus') {
        const path = join(sandbox, 'tests/fixtures/search/seoul-source-quality.json');
        const source = JSON.parse(readFileSync(path, 'utf8'));
        source.provenance.description += ' Unreviewed change';
        expect(evaluateSearchQuality(source).checkPassed).toBe(true);
        writeFileSync(path, JSON.stringify(source));
      } else if (change === 'formatted-digest') audit.formattedFixtureSha256 = '0'.repeat(64);
      else if (change === 'formatted-valid') audit.corpusSha256 = '0'.repeat(64);
      else {
        delete audit.formattedFixtureSha256;
        if (change === 'raw-digest') audit.corpusSha256 = '0'.repeat(64);
        else if (change !== 'raw-only-valid') delete audit.corpusSha256;
      }
      writeFileSync(auditPath, JSON.stringify(audit));
      const run = spawnSync(
        process.execPath,
        [join(sandbox, 'scripts/measure-search-quality.mjs'), '--source', '--check'],
        { encoding: 'utf8' },
      );
      if (change.endsWith('valid')) {
        expect(run.status).toBe(0);
        expect(JSON.parse(run.stdout).result.checkPassed).toBe(true);
      } else {
        expect(run.status).toBe(2);
        expect(run.stdout).toBe('');
        expect(run.stderr).toContain('Source corpus digest does not match audit');
      }
    } finally {
      rmSync(sandbox, { recursive: true, force: true });
    }
  },
  30_000,
);
