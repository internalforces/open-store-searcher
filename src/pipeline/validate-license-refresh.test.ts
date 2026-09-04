import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
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
  test('warns at exactly seven Seoul calendar days without rejecting a valid refresh', () => {
    const input = acceptedFixture();
    input.now = '2026-09-08T14:59:59.999Z';
    expect(codes(validateLicenseRefreshV1(input))).not.toContain('data_stale');
    input.now = '2026-09-08T15:00:00.000Z';
    const result = validateLicenseRefreshV1(input);
    expect(result.kind).toBe('accepted');
    expect(result.dataAsOf).toBe('2026-09-02');
    expect(codes(result)).toContain('data_stale');
  });

  test('unchanged archive retains its coverage and becomes stale as the clock advances', () => {
    const input = acceptedFixture();
    if (input.collection.kind !== 'accepted') throw new Error('fixture');
    input.collection.change = 'unchanged';
    input.now = '2026-09-08T14:59:59.999Z';
    expect(codes(validateLicenseRefreshV1(input))).not.toContain('data_stale');
    input.now = '2026-09-08T15:00:00.000Z';
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
