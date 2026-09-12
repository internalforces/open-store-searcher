import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFileSync } from 'node:fs';
import { promises as filesystem } from 'node:fs';
import { syncBuiltinESMExports } from 'node:module';
import { mkdtemp, readFile, readdir, rm, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { prepareValidatedRelease, stageValidatedRelease } from './stage-validated-release.js';
import { observeBoundedRelease, stageBoundedRelease } from './stage-bounded-release.js';
import { describe, expect, test, vi } from 'vitest';
import { parseArchiveContract } from './archive-contract.js';
import {
  SOURCE_ARCHIVE_URL,
  SOURCE_PROVIDER_FRESHNESS,
  parsePermissionManifest,
} from './source-contract.js';
import * as transformer from './transform-license-records.js';
import { serializeTransformationForInternalTest } from './transform-license-records.js';
import { validateJsonBytesV1 } from './validate-json-bytes.js';
import {
  validateLicenseRefreshV1,
  type ValidationInputV1,
  type ValidationPolicyV1,
  type ValidationBaselineV1,
} from './validate-license-refresh.js';

// TASK-008 synthetic rows and test-only limits. Update only with reviewed contract changes.
const contract = parseArchiveContract(
  JSON.parse(
    readFileSync(new URL('./contracts/seoul-archive-contract.json', import.meta.url), 'utf8'),
  ),
);
const permission = parsePermissionManifest(
  JSON.parse(
    readFileSync(
      new URL('../../reports/source-permission-manifest-2026-08-28.json', import.meta.url),
      'utf8',
    ),
  ),
);
const schemaHash = createHash('sha256')
  .update(
    JSON.stringify(
      [...contract.entries]
        .sort((a, b) => a.entryName.localeCompare(b.entryName))
        .map((entry) => ({
          ...entry,
          entryName: entry.entryName.normalize('NFC'),
        })),
    ),
  )
  .digest('hex');
const firstId = requireValue(contract.entries[0]).fileDataId;
function requireValue<T>(value: T | null | undefined): T {
  if (value === undefined || value === null) throw new Error('Missing synthetic fixture value');
  return value;
}
function fixture(): ValidationInputV1 {
  const hash = 'a'.repeat(64);
  const limits = {
    evidenceReference: 'synthetic:test-only',
    minCount: 0,
    maxCount: 1000,
    maxAbsoluteCountChange: 1000,
    maxRelativeCountChange: 1,
    maxMissingNameRate: 1,
    maxMissingBothAddressRate: 1,
    maxStatusShareChange: {
      '행정상 영업': 1,
      휴업: 1,
      폐업: 1,
      '확인되지 않음': 1,
    },
  };
  return {
    archiveContract: structuredClone(contract),
    permissionManifest: structuredClone(permission),
    collection: {
      kind: 'accepted',
      change: 'changed',
      archivePath: 'synthetic.zip',
      sha256: hash,
      byteLength: 100,
      fetchedAt: '2026-09-04T00:00:00.000Z',
      sourceEvidence: {
        expectedBytes: 100,
        finalUrl: SOURCE_ARCHIVE_URL,
        providerFreshness: {
          ...SOURCE_PROVIDER_FRESHNESS,
        },
      },
      archiveEvidence: {
        entryCount: 195,
        schemaManifestSha256: schemaHash,
        providerModifiedDate: '2026-09-04',
      },
    },
    rows: contract.entries.map((entry) => ({
      categoryFileDataId: entry.fileDataId,
      sourceFileDataUrl: `https://www.data.go.kr/data/${entry.fileDataId}/fileData.do`,
      values: {
        ...Object.fromEntries(entry.headers.map((h) => [h, null])),
        개방자치단체코드: '6110000',
        관리번호: 'synthetic-1',
        사업장명: '합성 상점',
        도로명주소: '합성 주소',
        영업상태코드: '01',
        영업상태명: '영업/정상',
      },
    })),
    ingestion: contract.entries.map((entry) => ({
      fileDataId: entry.fileDataId,
      entryName: entry.entryName,
      headers: [...entry.headers],
      completed: true,
      rowCount: 1,
      archiveSha256: hash,
    })),
    policy: {
      version: 1,
      revision: 'synthetic-v1',
      evidenceReference: 'synthetic:test-only',
      maxJsonBytes: 10_000_000,
      total: {
        ...structuredClone(limits),
        minCount: 1,
      },
      categories: Object.fromEntries(
        contract.entries.map((entry) => [entry.fileDataId, structuredClone(limits)]),
      ),
      allowedEmptyCategories: [],
    } as ValidationPolicyV1,
    coverage: {
      archiveSha256: hash,
      evidenceReference: 'synthetic:reviewed-coverage',
      timezone: 'Asia/Seoul',
      categories: contract.entries.map((entry) => ({
        fileDataId: entry.fileDataId,
        dataAsOf: '2026-09-02',
      })),
    },
    now: '2026-09-04T01:00:00.000Z',
  };
}
function bootstrap(input: ValidationInputV1): ValidationBaselineV1 {
  const result = validateLicenseRefreshV1(input);
  expect(result.metrics).not.toBeNull();
  return {
    validationVersion: 1,
    schemaVersion: 2,
    identifierContractVersion: 1,
    normalizationContractVersion: 1,
    policyRevision: 'synthetic-v1',
    archiveSha256: 'a'.repeat(64),
    schemaManifestSha256: schemaHash,
    dataAsOf: '2026-09-02',
    evidenceReference: 'synthetic:explicit-bootstrap-review',
    metrics: structuredClone(requireValue(result.metrics)),
  };
}
function acceptedFixture() {
  const input = fixture();
  input.baseline = bootstrap(input);
  return input;
}
function codes(result: ReturnType<typeof validateLicenseRefreshV1>) {
  return result.diagnostics.map((d) => d.code);
}
function syncCounts(input: ValidationInputV1) {
  for (const entry of input.ingestion)
    entry.rowCount = input.rows.filter((row) => row.categoryFileDataId === entry.fileDataId).length;
}
describe('TASK-008 staged validation', () => {
  test('requires explicit bootstrap review before accepting a complete synthetic candidate', () => {
    const input = fixture();
    const first = validateLicenseRefreshV1(input);
    expect(first.kind).toBe('review_required');
    expect(codes(first)).toEqual(['baseline_review_required']);
    expect(first).not.toHaveProperty('candidate');
    input.baseline = bootstrap(input);
    const result = validateLicenseRefreshV1(input);
    expect(result.kind).toBe('accepted');
    expect(result.dataAsOf).toBe('2026-09-02');
    expect(result.metrics?.total.recordCount).toBe(195);
    if (result.kind !== 'accepted') throw new Error('expected acceptance');
    expect(result.candidate.records).toHaveLength(195);
    const bytes = new TextEncoder().encode(
      serializeTransformationForInternalTest(result.candidate),
    );
    expect(validateJsonBytesV1(bytes, requireValue(input.policy).maxJsonBytes)).toEqual({
      kind: 'accepted',
      byteLength: bytes.byteLength,
    });
  });
  test('rejects a collector failure before reading staged rows', () => {
    const input = fixture();
    input.collection = {
      kind: 'rejected',
      code: 'archive_corrupt',
      message: 'no rows',
      fetchedAt: '2026-09-04T00:00:00.000Z',
    };
    Object.defineProperty(input, 'rows', {
      get: () => {
        throw new Error('must not read');
      },
    });
    const result = validateLicenseRefreshV1(input);
    expect(result.kind).toBe('rejected');
    expect(codes(result)).toEqual(['archive_corrupt']);
    expect(result.metrics).toBeNull();
  });
  test.each([
    null,
    [],
    {},
    {
      collection: {
        kind: 'other',
      },
    },
  ])('rejects malformed input %j without untyped exceptions', (input) => {
    expect(validateLicenseRefreshV1(input).kind).toBe('rejected');
  });
  test.each([
    'schema',
    'hash',
    'permission',
    'url',
    'header',
    'count',
    'missing',
    'duplicate',
    'incomplete',
  ] as const)('rejects %s provenance or ingestion mismatch', (mode) => {
    const input = acceptedFixture();
    if (input.collection.kind !== 'accepted') throw new Error('fixture');
    if (mode === 'schema') input.collection.archiveEvidence.schemaManifestSha256 = 'b'.repeat(64);
    if (mode === 'hash') requireValue(input.ingestion[0]).archiveSha256 = 'b'.repeat(64);
    if (mode === 'permission')
      requireValue(input.permissionManifest.categories[0]).fileDataId = 'unknown';
    if (mode === 'url') requireValue(input.rows[0]).sourceFileDataUrl = 'https://example.org/wrong';
    if (mode === 'header') requireValue(input.ingestion[0]).headers.reverse();
    if (mode === 'count') requireValue(input.ingestion[0]).rowCount = 2;
    if (mode === 'missing') input.ingestion.pop();
    if (mode === 'duplicate')
      input.ingestion[1] = structuredClone(requireValue(input.ingestion[0]));
    if (mode === 'incomplete') requireValue(input.ingestion[0]).completed = false;
    const result = validateLicenseRefreshV1(input);
    expect(result.kind).toBe('rejected');
    expect(result).not.toHaveProperty('candidate');
  });
  test.each([
    'missing_management_number',
    'duplicate_exact_source_tuple',
    'missing_header_mapping',
    'unsafe_source_text',
  ])('retains transformer rejection %s', (code) => {
    const input = acceptedFixture();
    if (code === 'missing_management_number') requireValue(input.rows[0]).values.관리번호 = ' ';
    if (code === 'duplicate_exact_source_tuple')
      input.rows.push(structuredClone(requireValue(input.rows[0])));
    if (code === 'missing_header_mapping') delete requireValue(input.rows[0]).values.사업장명;
    if (code === 'unsafe_source_text') requireValue(input.rows[0]).values.사업장명 = 'bad\0text';
    syncCounts(input);
    const result = validateLicenseRefreshV1(input);
    expect(result.kind).toBe('rejected');
    expect(codes(result)).toContain(code);
  });
  test('preserves distinct same-name identities and deterministic metrics without mutating input', () => {
    const input = acceptedFixture();
    const before = structuredClone(input);
    const result = validateLicenseRefreshV1(input);
    expect(input).toEqual(before);
    expect(result.metrics?.total.collisionRecordCount).toBe(195);
    expect(result.metrics?.total.collisionGroupCount).toBe(3);
    input.rows.reverse();
    input.ingestion.reverse();
    requireValue(input.coverage).categories.reverse();
    expect(validateLicenseRefreshV1(input)).toEqual(result);
    expect(JSON.stringify(result.diagnostics)).not.toContain('합성 상점');
  });
  test('distinguishes explicitly empty categories from an empty refresh', () => {
    const input = acceptedFixture();
    input.rows.shift();
    syncCounts(input);
    expect(codes(validateLicenseRefreshV1(input))).toContain('empty_category_not_approved');
    requireValue(input.policy).allowedEmptyCategories = [firstId];
    expect(validateLicenseRefreshV1(input).kind).toBe('accepted');
    input.rows = [];
    syncCounts(input);
    requireValue(input.policy).allowedEmptyCategories = contract.entries.map((e) => e.fileDataId);
    expect(codes(validateLicenseRefreshV1(input))).toContain('empty_refresh');
  });
  test.each([0, 1, 2])(
    'checks absolute and relative category count-change boundary %i',
    (extra) => {
      const input = acceptedFixture();
      const limits = requireValue(requireValue(input.policy).categories[firstId]);
      limits.maxAbsoluteCountChange = 1;
      limits.maxRelativeCountChange = 1;
      for (let i = 0; i < extra; i++) {
        const row = structuredClone(requireValue(input.rows[0]));
        row.values.관리번호 = `synthetic-${i + 2}`;
        input.rows.push(row);
      }
      syncCounts(input);
      expect(validateLicenseRefreshV1(input).kind).toBe(extra > 1 ? 'rejected' : 'accepted');
    },
  );
  test('detects category loss even when the total count is unchanged', () => {
    const input = acceptedFixture();
    requireValue(requireValue(input.policy).categories[firstId]).maxAbsoluteCountChange = 0;
    requireValue(input.policy).allowedEmptyCategories = [firstId];
    input.rows.shift();
    const extra = structuredClone(requireValue(input.rows[0]));
    extra.values.관리번호 = 'extra';
    input.rows.push(extra);
    syncCounts(input);
    const result = validateLicenseRefreshV1(input);
    expect(result.metrics?.total.recordCount).toBe(195);
    expect(codes(result)).toContain('count_change_exceeded');
  });
  test('requires review for zero-to-positive baseline counts without division by zero', () => {
    const input = fixture();
    input.rows.shift();
    syncCounts(input);
    requireValue(input.policy).allowedEmptyCategories = [firstId];
    input.baseline = bootstrap(input);
    input.rows.unshift(requireValue(fixture().rows[0]));
    syncCounts(input);
    expect(codes(validateLicenseRefreshV1(input))).toContain(
      'zero_baseline_growth_review_required',
    );
  });
  test.each([null, '', ' \t\u3000'])(
    'counts missing name %j and missing-both-address separately from one valid address',
    (value) => {
      const input = acceptedFixture();
      requireValue(input.rows[0]).values.사업장명 = value;
      requireValue(input.rows[0]).values.도로명주소 = value;
      requireValue(input.rows[0]).values.지번주소 = 'valid parcel';
      let result = validateLicenseRefreshV1(input);
      expect(result.metrics?.total.missingNameCount).toBe(1);
      expect(result.metrics?.total.missingBothAddressCount).toBe(0);
      requireValue(input.rows[0]).values.지번주소 = value;
      result = validateLicenseRefreshV1(input);
      expect(result.metrics?.total.missingBothAddressCount).toBe(1);
      requireValue(requireValue(input.policy).categories[firstId]).maxMissingNameRate = 0;
      expect(codes(validateLicenseRefreshV1(input))).toContain('missing_name_rate_exceeded');
    },
  );
  test.each([
    ['01', '영업/정상', 'accepted'],
    ['02', '휴업', 'accepted'],
    ['03', '폐업', 'accepted'],
    ['04', '취소/말소/만료/정지/중지', 'accepted'],
    ['99', 'new', 'review_required'],
    [null, null, 'review_required'],
    ['01', '폐업', 'review_required'],
    ['01', null, 'review_required'],
  ])('validates aggregate pair %j / %j without detailed inference', (code, name, kind) => {
    const input = acceptedFixture();
    Object.assign(requireValue(input.rows[0]).values, {
      영업상태코드: code,
      영업상태명: name,
      상세영업상태코드: '99',
      상세영업상태명: 'conflicting detail',
    });
    const result = validateLicenseRefreshV1(input);
    expect(result.kind).toBe(kind);
    expect(result.metrics?.total.unknownPairCount).toBe(kind === 'review_required' ? 1 : 0);
    if (kind === 'review_required') {
      expect(codes(result)).toContain('aggregate_pair_review_required');
      expect(result.metrics?.total.statusCounts['확인되지 않음']).toBe(1);
    }
  });
  test.each([0.99, 1])('checks status share in percentage points at limit %f', (limit) => {
    const input = acceptedFixture();
    Object.assign(requireValue(input.rows[0]).values, {
      영업상태코드: '03',
      영업상태명: '폐업',
    });
    requireValue(requireValue(input.policy).categories[firstId]).maxStatusShareChange.폐업 = limit;
    expect(validateLicenseRefreshV1(input).kind).toBe(limit === 1 ? 'accepted' : 'rejected');
  });
  test('requires coverage evidence rather than inventing a date from retrieval or D-2 metadata', () => {
    const input = acceptedFixture();
    delete input.coverage;
    const result = validateLicenseRefreshV1(input);
    expect(result.kind).toBe('review_required');
    expect(result.dataAsOf).toBeNull();
    expect(codes(result)).toContain('data_as_of_unverified');
  });
  test.each(['hash', 'missing', 'mixed', 'future', 'invalid', 'timezone', 'reference'] as const)(
    'rejects invalid coverage %s',
    (mode) => {
      const input = acceptedFixture();
      const coverage = requireValue(input.coverage);
      if (mode === 'hash') coverage.archiveSha256 = 'b'.repeat(64);
      if (mode === 'missing') coverage.categories.pop();
      if (mode === 'mixed') requireValue(coverage.categories[0]).dataAsOf = '2026-09-01';
      if (mode === 'future')
        coverage.categories.forEach((e) => {
          e.dataAsOf = '2026-09-05';
        });
      if (mode === 'invalid')
        coverage.categories.forEach((e) => {
          e.dataAsOf = '2026-02-30';
        });
      if (mode === 'timezone')
        Object.assign(coverage, {
          timezone: 'UTC',
        });
      if (mode === 'reference') coverage.evidenceReference = '';
      expect(validateLicenseRefreshV1(input).kind).toBe('rejected');
    },
  );
  test('rejects future retrieval and regressed or changed same-hash coverage', () => {
    const input = acceptedFixture();
    input.now = '2026-09-03T00:00:00.000Z';
    expect(codes(validateLicenseRefreshV1(input))).toContain('retrieval_in_future');
    input.now = fixture().now;
    requireValue(input.coverage).categories.forEach((e) => {
      e.dataAsOf = '2026-09-01';
    });
    expect(codes(validateLicenseRefreshV1(input))).toContain('data_as_of_regressed');
    requireValue(input.coverage).categories.forEach((e) => {
      e.dataAsOf = '2026-09-03';
    });
    expect(codes(validateLicenseRefreshV1(input))).toContain('same_archive_coverage_changed');
  });
  test('unchanged archive retains its coverage and becomes stale as the clock advances', () => {
    const input = acceptedFixture();
    if (input.collection.kind !== 'accepted') throw new Error('fixture');
    input.collection.change = 'unchanged';
    input.now = '2026-09-09T14:59:59.999Z';
    expect(codes(validateLicenseRefreshV1(input))).not.toContain('data_stale');
    input.now = '2026-09-09T15:00:00.000Z';
    const result = validateLicenseRefreshV1(input);
    expect(result.kind).toBe('accepted');
    expect(result.dataAsOf).toBe('2026-09-02');
    expect(codes(result)).toContain('data_stale');
  });
  test.each(['missing', 'invalid', 'partial'] as const)(
    'handles %s policy without defaults',
    (mode) => {
      const input = acceptedFixture();
      if (mode === 'missing') delete input.policy;
      if (mode === 'invalid') requireValue(input.policy).maxJsonBytes = Number.NaN;
      if (mode === 'partial') delete requireValue(input.policy).categories[firstId];
      const result = validateLicenseRefreshV1(input);
      expect(result.kind).toBe(mode === 'invalid' ? 'rejected' : 'review_required');
      expect(result).not.toHaveProperty('candidate');
    },
  );
  test.each(['version', 'revision', 'category', 'count', 'date'] as const)(
    'rejects or reviews incompatible baseline %s',
    (mode) => {
      const input = acceptedFixture();
      const baseline = requireValue(input.baseline);
      if (mode === 'version')
        Object.assign(baseline, {
          schemaVersion: 1,
        });
      if (mode === 'revision') baseline.policyRevision = 'other';
      if (mode === 'category') delete baseline.metrics.categories[firstId];
      if (mode === 'count') baseline.metrics.total.recordCount = -1;
      if (mode === 'date') baseline.dataAsOf = 'invalid';
      expect(validateLicenseRefreshV1(input).kind).not.toBe('accepted');
    },
  );
  test('structural rejection outranks missing review evidence', () => {
    const input = fixture();
    delete input.policy;
    delete input.coverage;
    requireValue(input.rows[0]).values.관리번호 = '';
    const result = validateLicenseRefreshV1(input);
    expect(result.kind).toBe('rejected');
    expect(codes(result)).toContain('missing_management_number');
  });
  test('retains digest-collision rejection and propagates unexpected transformer errors', () => {
    const input = acceptedFixture();
    const spy = vi.spyOn(transformer, 'transformLicenseRecordsV2').mockImplementationOnce(() => {
      throw new transformer.TransformationRejected('identifier_digest_collision');
    });
    expect(codes(validateLicenseRefreshV1(input))).toContain('identifier_digest_collision');
    const failure = new Error('unexpected transform failure');
    spy.mockImplementationOnce(() => {
      throw failure;
    });
    expect(() => validateLicenseRefreshV1(input)).toThrow(failure);
    spy.mockRestore();
  });
  test.each(['missingName', 'missingAddress'] as const)(
    'checks nonzero %s rate before at and after its exact limit',
    (metric) => {
      const input = acceptedFixture();
      const extra = structuredClone(requireValue(input.rows[0]));
      extra.values.관리번호 = 'second';
      input.rows.push(extra);
      syncCounts(input);
      if (metric === 'missingName') requireValue(input.rows[0]).values.사업장명 = null;
      else {
        requireValue(input.rows[0]).values.도로명주소 = '';
        requireValue(input.rows[0]).values.지번주소 = null;
      }
      const key = metric === 'missingName' ? 'maxMissingNameRate' : 'maxMissingBothAddressRate';
      for (const limit of [0.49, 0.5, 0.51]) {
        requireValue(requireValue(input.policy).categories[firstId])[key] = limit;
        expect(validateLicenseRefreshV1(input).kind).toBe(limit < 0.5 ? 'rejected' : 'accepted');
      }
    },
  );
  test('checks total and category count bounds and relative decrease independently', () => {
    const input = acceptedFixture();
    requireValue(input.policy).total.maxCount = 194;
    expect(codes(validateLicenseRefreshV1(input))).toContain('count_above_maximum');
    requireValue(input.policy).total.maxCount = 195;
    expect(validateLicenseRefreshV1(input).kind).toBe('accepted');
    requireValue(requireValue(input.policy).categories[firstId]).minCount = 2;
    expect(codes(validateLicenseRefreshV1(input))).toContain('count_below_minimum');
    requireValue(requireValue(input.policy).categories[firstId]).minCount = 0;
    input.rows.shift();
    syncCounts(input);
    requireValue(input.policy).allowedEmptyCategories = [firstId];
    requireValue(requireValue(input.policy).categories[firstId]).maxRelativeCountChange = 0.99;
    expect(codes(validateLicenseRefreshV1(input))).toContain('count_change_exceeded');
    requireValue(requireValue(input.policy).categories[firstId]).maxRelativeCountChange = 1;
    expect(validateLicenseRefreshV1(input).kind).toBe('accepted');
  });
  test('keeps zero-to-zero categories rate-free and reports exact raw missing cell distinctions', () => {
    const input = fixture();
    input.rows.shift();
    syncCounts(input);
    requireValue(input.policy).allowedEmptyCategories = [firstId];
    const row = requireValue(input.rows[0]);
    row.values.사업장명 = null;
    row.values.도로명주소 = '';
    row.values.지번주소 = '\u3000';
    row.values.상세영업상태코드 = '';
    row.values.상세영업상태명 = null;
    input.baseline = bootstrap(input);
    const result = validateLicenseRefreshV1(input);
    expect(result.kind).toBe('accepted');
    expect(result.metrics?.categories[firstId]?.recordCount).toBe(0);
    expect(result.metrics?.total.rawMissing.businessName).toEqual({
      null: 1,
      empty: 0,
      whitespace: 0,
    });
    expect(result.metrics?.total.rawMissing.roadAddress).toEqual({
      null: 0,
      empty: 1,
      whitespace: 0,
    });
    expect(result.metrics?.total.rawMissing.parcelAddress).toEqual({
      null: 193,
      empty: 0,
      whitespace: 1,
    });
  });
  test.each([
    'total-record',
    'status',
    'pairs',
    'raw-cells',
    'unknown-count',
    'collision-records',
  ] as const)('rejects corrupted baseline metric %s', (kind) => {
    const input = acceptedFixture();
    const total = requireValue(input.baseline).metrics.total;
    if (kind === 'total-record') total.recordCount++;
    if (kind === 'status') {
      total.statusCounts['행정상 영업']--;
      total.statusCounts.폐업++;
    }
    if (kind === 'pairs')
      total.aggregatePairs.push({
        ...requireValue(total.aggregatePairs[0]),
      });
    if (kind === 'raw-cells') total.rawMissing.businessName.null = 196;
    if (kind === 'unknown-count') total.unknownPairCount = 1;
    if (kind === 'collision-records') total.collisionRecordCount = 196;
    expect(codes(validateLicenseRefreshV1(input))).toContain('invalid_baseline');
  });
  test.each([
    'negative',
    'infinite',
    'range',
    'inverse',
    'empty-reference',
    'duplicate-empty',
    'extra-category',
  ] as const)('rejects invalid policy %s', (kind) => {
    const input = acceptedFixture();
    const policy = requireValue(input.policy);
    if (kind === 'negative') policy.total.maxAbsoluteCountChange = -1;
    if (kind === 'infinite') policy.total.maxRelativeCountChange = Infinity;
    if (kind === 'range') policy.total.maxStatusShareChange.폐업 = 1.01;
    if (kind === 'inverse') policy.total.minCount = policy.total.maxCount + 1;
    if (kind === 'empty-reference')
      requireValue(policy.categories[firstId]).evidenceReference = ' ';
    if (kind === 'duplicate-empty') policy.allowedEmptyCategories = [firstId, firstId];
    if (kind === 'extra-category') policy.categories.other = structuredClone(policy.total);
    expect(codes(validateLicenseRefreshV1(input))).toContain('invalid_validation_policy');
  });
  test('does not permit coverage after retrieval even when before now', () => {
    const input = acceptedFixture();
    input.now = '2026-09-06T00:00:00.000Z';
    requireValue(input.coverage).categories.forEach((e) => {
      e.dataAsOf = '2026-09-05';
    });
    expect(codes(validateLicenseRefreshV1(input))).toContain('coverage_after_retrieval');
  });
  test.each([
    'headers',
    'allowed-empty',
    'archive-entries',
    'permission-categories',
    'archive-headers',
  ] as const)('rejects sparse %s evidence with a typed result', (kind) => {
    const input = acceptedFixture();
    if (kind === 'headers')
      requireValue(input.ingestion[0]).headers = new Array(
        requireValue(input.ingestion[0]).headers.length,
      );
    if (kind === 'allowed-empty') requireValue(input.policy).allowedEmptyCategories = new Array(1);
    if (kind === 'archive-entries') input.archiveContract.entries = new Array(195);
    if (kind === 'permission-categories') input.permissionManifest.categories = new Array(195);
    if (kind === 'archive-headers')
      requireValue(input.archiveContract.entries[0]).headers = new Array(
        requireValue(input.archiveContract.entries[0]).headers.length,
      );
    expect(validateLicenseRefreshV1(input).kind).toBe('rejected');
  });
  test('rejects impossible baseline collision participation', () => {
    const input = acceptedFixture();
    requireValue(input.baseline).metrics.total.collisionGroupCount = 0;
    expect(codes(validateLicenseRefreshV1(input))).toContain('invalid_baseline');
  });
  test.each(['root', 'limits', 'status'] as const)(
    'rejects malformed %s policy even when another field is missing',
    (scope) => {
      const input = acceptedFixture();
      const policy = requireValue(input.policy);
      if (scope === 'root') {
        Object.assign(policy, { version: 2 });
        Reflect.deleteProperty(policy, 'maxJsonBytes');
      }
      if (scope === 'limits') {
        policy.total.maxCount = -1;
        Reflect.deleteProperty(policy.total, 'minCount');
      }
      if (scope === 'status') {
        policy.total.maxStatusShareChange.폐업 = 2;
        Reflect.deleteProperty(policy.total.maxStatusShareChange, '휴업');
      }
      expect(codes(validateLicenseRefreshV1(input))).toContain('invalid_validation_policy');
    },
  );
});

describe('TASK-009 collection-date publication', () => {
  function collectedFixture() {
    const input = acceptedFixture();
    input.dateBasis = 'collection';
    delete input.coverage;
    if (!input.baseline) throw new Error('missing fixture baseline');
    input.baseline.dateBasis = 'collection';
    input.baseline.dataAsOf = '2026-09-03';
    return input;
  }
  test('uses Seoul collection date while retaining unverified source coverage', () => {
    const input = collectedFixture();
    if (input.collection.kind !== 'accepted') throw new Error('missing fixture collection');
    input.collection.fetchedAt = '2026-09-04T15:00:00.000Z';
    input.now = '2026-09-04T16:00:00.000Z';
    const result = validateLicenseRefreshV1(input);
    expect(result.kind).toBe('accepted');
    expect(result.dateBasis).toBe('collection');
    expect(result.dataAsOf).toBe('2026-09-05');
    expect(codes(result)).toEqual(['source_coverage_unverified']);
    expect(input).not.toHaveProperty('coverage');
  });
  test.each([
    ['2026-09-10T14:59:59.999Z', false],
    ['2026-09-10T15:00:00.000Z', true],
  ])('warns after seven Seoul collection days at %s', (now, stale) => {
    const input = collectedFixture();
    input.now = now;
    const result = validateLicenseRefreshV1(input);
    expect(result.kind).toBe('accepted');
    expect(codes(result).includes('collection_stale')).toBe(stale);
  });
  test('does not waive quality policy or initial baseline review for collection dates', () => {
    const input = collectedFixture();
    delete input.policy;
    delete input.baseline;
    const result = validateLicenseRefreshV1(input);
    expect(result.kind).toBe('review_required');
    expect(codes(result)).toEqual([
      'baseline_review_required',
      'policy_review_required',
      'source_coverage_unverified',
    ]);
    expect(() => prepareValidatedRelease(input)).toThrow('Publication blocked');
  });
  test('rejects mixing coverage and collection baselines', () => {
    const input = collectedFixture();
    delete requireValue(input.baseline).dateBasis;
    expect(codes(validateLicenseRefreshV1(input))).toContain('baseline_date_basis_mismatch');
  });
  test('rejects asserted coverage in collection mode and regressing collection dates', () => {
    const input = collectedFixture();
    input.coverage = requireValue(fixture().coverage);
    expect(codes(validateLicenseRefreshV1(input))).toContain('collection_mode_with_coverage');
    delete input.coverage;
    requireValue(input.baseline).dataAsOf = '2026-09-05';
    expect(codes(validateLicenseRefreshV1(input))).toContain('collection_date_regressed');
  });
  test('binds exact dataset bytes and matching baseline without asserting source data date', () => {
    const input = collectedFixture();
    const files = prepareValidatedRelease(input);
    const parse = (name: string) => JSON.parse(new TextDecoder().decode(requireValue(files[name])));
    const dataset = parse('dataset.json'),
      baseline = parse('baseline.json'),
      release = parse('release.json');
    expect(dataset.coverage).toEqual({ kind: 'collected', date: '2026-09-04' });
    expect(dataset.records).toHaveLength(195);
    expect(dataset.records[0].rawStatus).toEqual(
      expect.objectContaining({ operatingCode: '01', operatingName: '영업/정상' }),
    );
    expect(dataset.records[0].processedStatus).toBe('행정상 영업');
    expect(new Set(dataset.records.map((r: { id: string }) => r.id)).size).toBe(195);
    expect(baseline.dateBasis).toBe('collection');
    expect(baseline.dataAsOf).toBe('2026-09-04');
    expect(release.sourceDataAsOf).toBeNull();
    for (const entry of release.entries) {
      expect(createHash('sha256').update(requireValue(files[entry.name])).digest('hex')).toBe(
        entry.sha256,
      );
      expect(requireValue(files[entry.name]).length).toBe(entry.byteLength);
    }
  });
  test('refuses a total artifact larger than the explicit JSON budget', () => {
    const input = collectedFixture();
    const files = prepareValidatedRelease(input);
    requireValue(input.policy).maxJsonBytes = Math.max(
      ...Object.values(files).map((v) => v.length),
    );
    expect(() => prepareValidatedRelease(input)).toThrow('total_json_size_exceeded');
  });
  test('promotes a complete staged directory and preserves an existing release on retry or rejection', async () => {
    const root = await mkdtemp(join(tmpdir(), 'task009-test-'));
    try {
      const output = join(root, 'release');
      const input = collectedFixture();
      await stageValidatedRelease(input, output);
      expect((await readdir(output)).sort()).toEqual([
        'baseline.json',
        'dataset.json',
        'release.json',
      ]);
      const before = await readFile(join(output, 'dataset.json'));
      await expect(stageValidatedRelease(input, output)).rejects.toThrow('already exists');
      delete input.policy;
      await expect(stageValidatedRelease(input, output)).rejects.toThrow('Publication blocked');
      expect(await readFile(join(output, 'dataset.json'))).toEqual(before);
      expect(await readdir(root)).toEqual(['release']);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
  test('a competing publication lock prevents promotion and removes incomplete staging', async () => {
    const root = await mkdtemp(join(tmpdir(), 'task009-lock-'));
    try {
      const output = join(root, 'release');
      await mkdir(`${output}.lock`);
      await writeFile(join(root, 'known-good.json'), 'old release');
      await expect(stageValidatedRelease(collectedFixture(), output)).rejects.toThrow();
      expect((await readdir(root)).sort()).toEqual(['known-good.json', 'release.lock']);
      expect(await readFile(join(root, 'known-good.json'), 'utf8')).toBe('old release');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
  test('builds real collection-date assets and rejects tampered staging before building', async () => {
    const root = await mkdtemp(join(tmpdir(), 'task009-build-'));
    try {
      const output = join(root, 'release');
      const site = join(root, 'site');
      await stageValidatedRelease(collectedFixture(), output);
      await promisify(execFile)(process.execPath, ['scripts/build-publication.mjs', output, site]);
      const assets = await readdir(join(site, 'assets'));
      const assetName = assets.find(
        (name) => name.startsWith('collected-dataset-') && name.endsWith('.json'),
      );
      expect(assetName).toBeDefined();
      expect(
        JSON.parse(await readFile(join(site, 'assets', requireValue(assetName)), 'utf8')).coverage
          .kind,
      ).toBe('collected');
      expect(assets.some((name) => name.startsWith('demo-'))).toBe(false);
      expect(await readFile(join(site, 'baseline.json'))).toEqual(
        await readFile(join(output, 'baseline.json')),
      );
      await writeFile(join(output, 'dataset.json'), '{}');
      await expect(
        promisify(execFile)(process.execPath, [
          'scripts/build-publication.mjs',
          output,
          join(root, 'tampered-site'),
        ]),
      ).rejects.toThrow('hash mismatch');
      expect(await readdir(root)).not.toContain('tampered-site');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  }, 30_000);
  test('a partial staging write failure preserves known-good bytes and cleans the candidate', async () => {
    const root = await mkdtemp(join(tmpdir(), 'task009-io-'));
    try {
      const previous = join(root, 'known-good.json');
      await writeFile(previous, 'known good');
      const original = filesystem.writeFile;
      const writer = vi.spyOn(filesystem, 'writeFile');
      writer
        .mockImplementationOnce(original)
        .mockRejectedValueOnce(new Error('simulated disk full'));
      syncBuiltinESMExports();
      await expect(
        stageValidatedRelease(collectedFixture(), join(root, 'candidate')),
      ).rejects.toThrow('simulated disk full');
      writer.mockRestore();
      syncBuiltinESMExports();
      expect(await readdir(root)).toEqual(['known-good.json']);
      expect(await readFile(previous, 'utf8')).toBe('known good');
    } finally {
      vi.restoreAllMocks();
      syncBuiltinESMExports();
      await rm(root, { recursive: true, force: true });
    }
  });
});

describe('TASK-008 bounded staged processing', () => {
  function collectedInput() {
    const input = acceptedFixture();
    input.dateBasis = 'collection';
    delete input.coverage;
    requireValue(input.baseline).dateBasis = 'collection';
    return input;
  }
  async function* categories(input: ValidationInputV1) {
    for (const entry of input.archiveContract.entries)
      yield {
        entry,
        rows: input.rows.filter((row) => row.categoryFileDataId === entry.fileDataId),
      };
  }
  async function isolated(run: (root: string) => Promise<void>) {
    const root = await mkdtemp(join(tmpdir(), 'task008-bounded-'));
    try {
      await run(root);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  }
  test.each([1, 7])(
    'matches complete legacy release and metrics with batch size %i',
    async (batchRows) => {
      await isolated(async (root) => {
        const input = collectedInput();
        const extraRows = ['zz', 'a', 'AAA'].map((managementNumber, index) => {
          const row = structuredClone(requireValue(input.rows[0]));
          row.values.관리번호 = managementNumber;
          row.values.사업장명 = [null, '', ' \t '][index] ?? null;
          row.values.도로명주소 = null;
          row.values.지번주소 = index === 2 ? '합성 지번' : '';
          return row;
        });
        input.rows.splice(0, 0, ...extraRows);
        syncCounts(input);
        requireValue(input.baseline).metrics = requireValue(
          validateLicenseRefreshV1(input).metrics,
        );
        const expected = prepareValidatedRelease(input);
        const result = await stageBoundedRelease(
          input,
          categories(input),
          join(root, 'candidate'),
          { batchRows },
        );
        expect(result.files.sort()).toEqual(Object.keys(expected).sort());
        expect(result.metrics).toEqual(validateLicenseRefreshV1(input).metrics);
        for (const name of result.files) {
          const actual = await readFile(join(result.outputDirectory, name), 'utf8');
          expect(JSON.parse(actual)).toEqual(
            JSON.parse(new TextDecoder().decode(requireValue(expected[name]))),
          );
        }
        expect(await readdir(root)).toEqual(['candidate']);
        expect((await readdir(result.outputDirectory)).sort()).toEqual([
          'baseline.json',
          'dataset.json',
          'release.json',
        ]);
      });
    },
    30_000,
  );
  test('preserves global normalization collision metrics across batches and categories', async () => {
    await isolated(async (root) => {
      const input = collectedInput();
      const first = requireValue(input.rows[0]);
      first.values.사업장명 = 'Ａ shop';
      first.values.도로명주소 = 'Road  1';
      const second = structuredClone(first);
      second.values.관리번호 = 'synthetic-2';
      second.values.사업장명 = 'A shop';
      second.values.도로명주소 = 'Road 1';
      input.rows.splice(1, 0, second);
      const crossCategory = requireValue(input.rows[2]);
      crossCategory.values.사업장명 = 'A shop';
      crossCategory.values.도로명주소 = 'Road 1';
      syncCounts(input);
      const expected = validateLicenseRefreshV1(input);
      expect(expected.kind).toBe('accepted');
      expect(requireValue(expected.metrics).total.collisionGroupCount).toBeGreaterThan(0);
      expect(
        requireValue(expected.metrics).categories[first.categoryFileDataId]?.collisionRecordCount,
      ).toBe(2);
      expect(
        requireValue(expected.metrics).categories[crossCategory.categoryFileDataId]
          ?.collisionRecordCount,
      ).toBe(1);
      const result = await stageBoundedRelease(input, categories(input), join(root, 'candidate'), {
        batchRows: 1,
      });
      expect(result.metrics).toEqual(expected.metrics);
      const baseline = JSON.parse(
        await readFile(join(result.outputDirectory, 'baseline.json'), 'utf8'),
      );
      expect(baseline.metrics).toEqual(expected.metrics);
    });
  }, 30_000);
  test('preserves exact release bytes across multiple merge and dataset write flushes', async () => {
    await isolated(async (root) => {
      const input = collectedInput();
      const longSourceText = 'synthetic-inert-source-text-'.repeat(650);
      for (const row of input.rows) row.values.데이터갱신시점 = longSourceText;
      const expected = prepareValidatedRelease(input);
      expect(requireValue(expected['dataset.json']).byteLength).toBeGreaterThan(2 * 1024 * 1024);
      const result = await stageBoundedRelease(input, categories(input), join(root, 'candidate'), {
        batchRows: 7,
      });
      expect(result.files.sort()).toEqual(Object.keys(expected).sort());
      for (const name of result.files) {
        const actual = await readFile(join(result.outputDirectory, name));
        expect(actual.equals(Buffer.from(requireValue(expected[name])))).toBe(true);
      }
      const dataset = JSON.parse(
        await readFile(join(result.outputDirectory, 'dataset.json'), 'utf8'),
      );
      expect(dataset.records).toHaveLength(195);
      expect(
        dataset.records.every(
          (record: { lifecycle: { sourceUpdatedAt: string } }) =>
            record.lifecycle.sourceUpdatedAt === longSourceText,
        ),
      ).toBe(true);
      expect(result.metrics.total.recordCount).toBe(195);
      expect(await readdir(root)).toEqual(['candidate']);
    });
  }, 30_000);
  test('rejects repeated identities separated by batches and removes staged output', async () => {
    await isolated(async (root) => {
      const input = collectedInput();
      const first = requireValue(input.rows[0]);
      const intervening = structuredClone(first);
      intervening.values.관리번호 = 'different-id';
      input.rows.splice(1, 0, intervening, structuredClone(first));
      syncCounts(input);
      await expect(
        stageBoundedRelease(input, categories(input), join(root, 'candidate'), { batchRows: 1 }),
      ).rejects.toThrow(/duplicate/i);
      expect(await readdir(root)).toEqual([]);
    });
  }, 30_000);
  test.each(['late ingestion', 'missing-name quality', 'total JSON budget'] as const)(
    'preserves known-good release and leaves no candidate after %s failure',
    async (failure) => {
      await isolated(async (root) => {
        const input = collectedInput();
        const knownGood = join(root, 'known-good');
        await stageValidatedRelease(input, knownGood);
        const before = await Promise.all(
          ['dataset.json', 'baseline.json', 'release.json'].map((name) =>
            readFile(join(knownGood, name)),
          ),
        );
        if (failure === 'missing-name quality') {
          requireValue(input.rows.at(-1)).values.사업장명 = null;
          requireValue(input.policy).total.maxMissingNameRate = 0;
        }
        if (failure === 'total JSON budget') {
          requireValue(input.policy).maxJsonBytes = Math.max(
            ...Object.values(prepareValidatedRelease(input)).map((bytes) => bytes.length),
          );
        }
        async function* source() {
          let count = 0;
          for await (const category of categories(input)) {
            if (failure === 'late ingestion' && ++count === 195)
              throw new Error('late category read failed');
            yield category;
          }
        }
        await expect(
          stageBoundedRelease(input, source(), join(root, 'candidate'), { batchRows: 7 }),
        ).rejects.toThrow(
          failure === 'late ingestion' ? 'late category read failed' : /Publication blocked/,
        );
        expect(await readdir(root)).toEqual(['known-good']);
        const after = await Promise.all(
          ['dataset.json', 'baseline.json', 'release.json'].map((name) =>
            readFile(join(knownGood, name)),
          ),
        );
        expect(after).toEqual(before);
      });
    },
    30_000,
  );
  test('refuses to replace an existing release directory', async () => {
    await isolated(async (root) => {
      const input = collectedInput();
      const output = join(root, 'known-good');
      await stageValidatedRelease(input, output);
      const before = await readFile(join(output, 'dataset.json'));
      await expect(
        stageBoundedRelease(input, categories(input), output, { batchRows: 7 }),
      ).rejects.toThrow('already exists');
      expect(await readFile(join(output, 'dataset.json'))).toEqual(before);
      expect(await readdir(root)).toEqual(['known-good']);
    });
  });
  test('rejects an incomplete category stream instead of publishing a partial snapshot', async () => {
    await isolated(async (root) => {
      const input = collectedInput();
      async function* incomplete() {
        let count = 0;
        for await (const category of categories(input)) {
          if (++count === 195) return;
          yield category;
        }
      }
      await expect(
        stageBoundedRelease(input, incomplete(), join(root, 'candidate'), { batchRows: 7 }),
      ).rejects.toThrow('ingestion_evidence_mismatch');
      expect(await readdir(root)).toEqual([]);
    });
  }, 30_000);
  test('rejects a disk bucket above the explicit memory bound and removes all candidate files', async () => {
    await isolated(async (root) => {
      const input = collectedInput();
      await expect(
        stageBoundedRelease(input, categories(input), join(root, 'candidate'), {
          batchRows: 1,
          maxBucketBytes: 1,
        }),
      ).rejects.toThrow(/bucket/i);
      expect(await readdir(root)).toEqual([]);
    });
  });
  test('records unapproved observation without publishing a baseline or release descriptor', async () => {
    await isolated(async (root) => {
      const input = collectedInput();
      delete input.policy;
      delete input.baseline;
      const result = await observeBoundedRelease(
        input,
        categories(input),
        join(root, 'observation'),
        { batchRows: 7 },
      );
      expect(result.files.sort()).toEqual(['dataset.json', 'observation.json']);
      expect((await readdir(result.outputDirectory)).sort()).toEqual([
        'dataset.json',
        'observation.json',
      ]);
      const datasetBytes = await readFile(join(result.outputDirectory, 'dataset.json'));
      const dataset = JSON.parse(datasetBytes.toString('utf8'));
      const report = JSON.parse(
        await readFile(join(result.outputDirectory, 'observation.json'), 'utf8'),
      );
      expect(dataset.records).toHaveLength(195);
      expect(dataset.coverage).toEqual({ kind: 'collected', date: '2026-09-04' });
      expect(report).toMatchObject({
        kind: 'bounded-source-observation',
        publicationApproved: false,
        recordCount: 195,
        dataset: {
          byteLength: datasetBytes.length,
          sha256: createHash('sha256').update(datasetBytes).digest('hex'),
        },
        validation: { kind: 'review_required' },
      });
      expect(report.validation.diagnostics.map((item: { code: string }) => item.code)).toEqual([
        'baseline_review_required',
        'policy_review_required',
        'source_coverage_unverified',
      ]);
      expect(report.validation.metrics).toEqual(validateLicenseRefreshV1(input).metrics);
      expect(result.metrics).toEqual(report.validation.metrics);
      expect(await readdir(root)).toEqual(['observation']);
    });
  }, 30_000);
  test.each(['release.json', 'observation.json'] as const)(
    'preserves known-good artifacts and cleans candidate after late %s write failure',
    async (descriptor) => {
      await isolated(async (root) => {
        const input = collectedInput();
        const previous = join(root, 'known-good');
        await stageValidatedRelease(input, previous);
        const names = ['dataset.json', 'baseline.json', 'release.json'];
        const before = await Promise.all(names.map((name) => readFile(join(previous, name))));
        const original = filesystem.writeFile;
        const writer = vi
          .spyOn(filesystem, 'writeFile')
          .mockImplementation(async (path, data, options) => {
            if (String(path).endsWith(descriptor)) throw new Error('simulated late disk full');
            return original(path, data, options);
          });
        syncBuiltinESMExports();
        try {
          const process =
            descriptor === 'release.json' ? stageBoundedRelease : observeBoundedRelease;
          await expect(
            process(input, categories(input), join(root, 'candidate'), { batchRows: 7 }),
          ).rejects.toThrow('simulated late disk full');
        } finally {
          writer.mockRestore();
          syncBuiltinESMExports();
        }
        expect(await readdir(root)).toEqual(['known-good']);
        expect(await Promise.all(names.map((name) => readFile(join(previous, name))))).toEqual(
          before,
        );
      });
    },
    30_000,
  );
  test.each(['run', 'identity bucket'] as const)(
    'rejects %s corruption before promotion and preserves known-good bytes',
    async (target) => {
      await isolated(async (root) => {
        const input = collectedInput();
        const previous = join(root, 'known-good');
        await stageValidatedRelease(input, previous);
        const names = ['dataset.json', 'baseline.json', 'release.json'];
        const before = await Promise.all(names.map((name) => readFile(join(previous, name))));
        const originalWrite = filesystem.writeFile;
        const originalAppend = filesystem.appendFile;
        let corrupted = false;
        const writer = vi
          .spyOn(filesystem, 'writeFile')
          .mockImplementation(async (path, data, options) => {
            await originalWrite(path, data, options);
            if (target === 'run' && !corrupted && /[\\/]run-0$/.test(String(path))) {
              corrupted = true;
              await originalWrite(path, String(data).replace('합성 상점', '변조 상점'));
            }
          });
        const appender = vi
          .spyOn(filesystem, 'appendFile')
          .mockImplementation(async (path, data, options) => {
            await originalAppend(path, data, options);
            if (
              target === 'identity bucket' &&
              !corrupted &&
              /[\\/]identity-[a-f0-9]+$/.test(String(path))
            ) {
              corrupted = true;
              const records = (await readFile(path, 'utf8')).trimEnd().split('\n');
              const first = JSON.parse(requireValue(records[0])) as [string, string];
              first[1] += '00';
              records[0] = JSON.stringify(first);
              await originalWrite(path, `${records.join('\n')}\n`);
            }
          });
        syncBuiltinESMExports();
        try {
          await expect(
            stageBoundedRelease(input, categories(input), join(root, 'candidate'), {
              batchRows: 7,
            }),
          ).rejects.toThrow('Intermediate file hash mismatch');
          expect(corrupted).toBe(true);
        } finally {
          writer.mockRestore();
          appender.mockRestore();
          syncBuiltinESMExports();
        }
        expect(await readdir(root)).toEqual(['known-good']);
        expect(await Promise.all(names.map((name) => readFile(join(previous, name))))).toEqual(
          before,
        );
      });
    },
    30_000,
  );
  test.each(['baseline.json', 'release.json', 'observation.json'] as const)(
    'rejects same-size valid JSON corruption of %s and preserves known-good artifacts',
    async (descriptor) => {
      await isolated(async (root) => {
        const input = collectedInput();
        const previous = join(root, 'known-good');
        await stageValidatedRelease(input, previous);
        const names = ['dataset.json', 'baseline.json', 'release.json'];
        const before = await Promise.all(names.map((name) => readFile(join(previous, name))));
        const original = filesystem.writeFile;
        let corrupted = false;
        const writer = vi
          .spyOn(filesystem, 'writeFile')
          .mockImplementation(async (path, data, options) => {
            await original(path, data, options);
            if (!corrupted && String(path).endsWith(descriptor)) {
              const bytes =
                typeof data === 'string' ? data : new TextDecoder().decode(data as Uint8Array);
              const changed = bytes.replace('a'.repeat(64), 'b'.repeat(64));
              expect(changed).not.toBe(bytes);
              expect(Buffer.byteLength(changed)).toBe(Buffer.byteLength(bytes));
              expect(JSON.parse(changed).archiveSha256).toBe('b'.repeat(64));
              corrupted = true;
              await original(path, changed);
            }
          });
        syncBuiltinESMExports();
        try {
          const process =
            descriptor === 'observation.json' ? observeBoundedRelease : stageBoundedRelease;
          await expect(
            process(input, categories(input), join(root, 'candidate'), { batchRows: 7 }),
          ).rejects.toThrow('Staged publication bytes changed');
          expect(corrupted).toBe(true);
        } finally {
          writer.mockRestore();
          syncBuiltinESMExports();
        }
        expect(await readdir(root)).toEqual(['known-good']);
        expect(await Promise.all(names.map((name) => readFile(join(previous, name))))).toEqual(
          before,
        );
      });
    },
    30_000,
  );
});
