import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { parseArchiveContract, type ArchiveContractEntry } from './archive-contract.js';
import {
  TransformationRejected,
  compareExactIdentityV1,
  createInternalIdentifierV1,
  frameExactIdentityV1,
  normalizeSearchValueV1,
  serializeTransformationForInternalTest,
  transformLicenseRecordsV1,
  type ExactSourceIdentityV1,
  type StagedLicenseRowV1,
} from './transform-license-records.js';

const archiveContract = parseArchiveContract(
  JSON.parse(
    readFileSync(new URL('./contracts/seoul-archive-contract.json', import.meta.url), 'utf8'),
  ),
);

const representativeIds = {
  rich: '15101548',
  withoutCommonBusinessTypeAndMinimumHeaders: '15045118',
  categorySpecificBusinessType: '15045025',
  literalAlias: '15045011',
  maximumHeaders: '15044998',
} as const;

function category(fileDataId: string): ArchiveContractEntry {
  const found = archiveContract.entries.find((entry) => entry.fileDataId === fileDataId);
  if (!found) throw new Error(`test category ${fileDataId} is missing`);
  return found;
}

function row(
  fileDataId: string,
  overrides: Record<string, string | null> = {},
): StagedLicenseRowV1 {
  const entry = category(fileDataId);
  const values = Object.fromEntries(entry.headers.map((header) => [header, null]));
  Object.assign(values, {
    개방자치단체코드: '00123',
    관리번호: '000045',
    사업장명: '  ＡＢＣ\t상점  ',
    도로명주소: '서울시 A-1, 101호',
    지번주소: '서울시 1-2',
    영업상태코드: '01',
    영업상태명: 'raw operating',
    상세영업상태코드: '13',
    상세영업상태명: 'raw detailed',
    인허가일자: '20200101',
    데이터갱신시점: '2026-09-01 01:02:03.000',
    최종수정시점: '2026-08-31 09:08:07.000',
    ...overrides,
  });
  return {
    categoryFileDataId: fileDataId,
    sourceFileDataUrl: `https://www.data.go.kr/data/${fileDataId}/fileData.do`,
    values,
  };
}

const archive = {
  fetchedAt: '2026-09-02T00:00:00.000Z',
  sha256: 'a'.repeat(64),
};

function transform(rows: StagedLicenseRowV1[]) {
  return transformLicenseRecordsV1({ archiveContract, archive, rows });
}

describe('representative TASK-005 schema selection', () => {
  test('pins computed minimum, maximum, rich, alias, and category-specific categories', () => {
    const counts = archiveContract.entries.map((entry) => entry.headers.length);
    expect(category(representativeIds.rich).headers).toEqual(
      expect.arrayContaining([
        '업태구분명',
        '인허가취소일자',
        '휴업시작일자',
        '휴업종료일자',
        '재개업일자',
        '폐업일자',
      ]),
    );
    expect(
      category(representativeIds.withoutCommonBusinessTypeAndMinimumHeaders).headers,
    ).not.toContain('업태구분명');
    expect(
      category(representativeIds.withoutCommonBusinessTypeAndMinimumHeaders).headers,
    ).not.toContain('휴업시작일자');
    expect(
      category(representativeIds.withoutCommonBusinessTypeAndMinimumHeaders).headers,
    ).toHaveLength(Math.min(...counts));
    expect(category(representativeIds.maximumHeaders).headers).toHaveLength(Math.max(...counts));
    expect(category(representativeIds.categorySpecificBusinessType).headers).toContain(
      '의료기관종별명',
    );
    expect(category(representativeIds.literalAlias).entryName).toBe(
      '자원환경_단독정화조-오수처리시설설계시공업.csv',
    );
  });
});

describe('search-only normalization v1', () => {
  test.each([
    [null, null],
    ['', ''],
    [' \t\r\n\u00a0\u3000 ', ''],
    ['  ＡＢＣ\tStraße\u00a0상점  ', 'abc straße 상점'],
    ['Ａ-１, １０１호', 'a-1, 101호'],
    ['가각힣', '가각힣'],
    ['😀 E\u0301', '😀 é'],
    ['é', 'é'],
  ])('normalizes %j without punctuation or address-unit removal', (input, expected) => {
    expect(normalizeSearchValueV1(input)).toBe(expected);
  });

  test('pins the supported runtime Unicode version boundary', () => {
    expect(process.versions.node).toBe('24.19.0');
    expect(process.versions.unicode).toBe('17.0');
  });
});

describe('exact identifier contract v1', () => {
  const identity: ExactSourceIdentityV1 = {
    categoryFileDataId: '15045016',
    licensingAuthorityCode: '00123',
    managementNumber: '000045',
  };

  test('matches golden framing and full SHA-256 vectors', () => {
    expect(Buffer.from(frameExactIdentityV1(identity)).toString('hex')).toBe(
      '000000256f70656e2d73746f72652d73656172636865723a7075626c69632d6c6963656e73652d69640000000100000008313530343530313600000005303031323300000006303030303435',
    );
    expect(Buffer.from(createInternalIdentifierV1(identity)).toString('hex')).toBe(
      'faf47ec2609d3567877b6b50555fbddf405d4d7e4362b3b58d3814dc01abbb50',
    );
    expect(createInternalIdentifierV1(identity)).toHaveLength(32);
  });

  test('counts UTF-8 bytes for multibyte and supplementary identity code points', () => {
    const unicodeIdentity: ExactSourceIdentityV1 = {
      categoryFileDataId: '분류😀',
      licensingAuthorityCode: '00123',
      managementNumber: '관리-é',
    };
    expect(Buffer.from(frameExactIdentityV1(unicodeIdentity)).toString('hex')).toBe(
      '000000256f70656e2d73746f72652d73656172636865723a7075626c69632d6c6963656e73652d6964000000010000000aebb684eba598f09f988000000005303031323300000009eab480eba6ac2dc3a9',
    );
    expect(Buffer.from(createInternalIdentifierV1(unicodeIdentity)).toString('hex')).toBe(
      '8762a54f1b895cec0ef13ffad1485434c3157f5c1f1f31459014eafa9056fefe',
    );
  });

  test('preserves exact code points, field order, leading zeros, and long values', () => {
    const variants = [
      { ...identity, licensingAuthorityCode: ' 00123' },
      { ...identity, licensingAuthorityCode: '００１２３' },
      { ...identity, managementNumber: 'é' },
      { ...identity, managementNumber: 'é'.normalize('NFD') },
      { ...identity, managementNumber: '0'.repeat(70_000) },
    ];
    for (const variant of variants) {
      expect(createInternalIdentifierV1(variant)).not.toEqual(createInternalIdentifierV1(identity));
    }
    expect(
      compareExactIdentityV1(identity, { ...identity, managementNumber: '000046' }),
    ).toBeLessThan(0);
  });
});

describe('lossless deterministic transformation', () => {
  test('transforms every computed representative category with only synthetic rows', () => {
    const rows = Object.values(representativeIds).map((fileDataId, index) =>
      row(fileDataId, { 관리번호: `synthetic-${index}` }),
    );
    const result = transform(rows);
    expect(result.records).toHaveLength(5);
    expect(
      result.records.find(
        (record) =>
          record.identity.source.categoryFileDataId ===
          representativeIds.withoutCommonBusinessTypeAndMinimumHeaders,
      )?.display.businessTypes,
    ).toEqual([]);
    expect(result.records.every((record) => record.identity.digest.byteLength === 32)).toBe(true);
  });

  test('preserves display, raw status, lifecycle, provenance, and separate normalized values', () => {
    const source = row(representativeIds.rich, {
      사업장명: ' \t<script>alert("x")</script>\\=1+1 😀 E\u0301 ',
      도로명주소: '',
      지번주소: '　서울시 １-２, １０１호　',
      업태구분명: '  원본 업태  ',
      인허가취소일자: '',
      휴업시작일자: ' ',
      휴업종료일자: null,
      재개업일자: '20210101',
      폐업일자: '',
    });
    const result = transform([source]);
    const record = result.records[0];
    expect(record?.display).toEqual({
      businessName: ' \t<script>alert("x")</script>\\=1+1 😀 E\u0301 ',
      roadAddress: '',
      parcelAddress: '　서울시 １-２, １０１호　',
      categoryName: category(representativeIds.rich).entryName,
      businessTypes: [{ sourceField: '업태구분명', value: '  원본 업태  ' }],
    });
    expect(record?.search).toEqual({
      normalizationVersion: 1,
      businessName: '<script>alert("x")</script>\\=1+1 😀 é',
      roadAddress: '',
      parcelAddress: '서울시 1-2, 101호',
    });
    expect(record?.rawStatus).toEqual({
      operatingCode: '01',
      operatingName: 'raw operating',
      detailedCode: '13',
      detailedName: 'raw detailed',
    });
    expect(record?.lifecycle).toMatchObject({
      licensedOn: '20200101',
      licenseCancelledOn: '',
      suspendedFrom: ' ',
      suspendedThrough: null,
      reopenedOn: '20210101',
      closedOn: '',
      sourceUpdatedAt: '2026-09-01 01:02:03.000',
      sourceLastModifiedAt: '2026-08-31 09:08:07.000',
    });
    expect(record?.provenance).toMatchObject({
      provider: '행정안전부',
      permissionLabel: '이용허락범위 제한 없음',
      sourceFileDataId: representativeIds.rich,
      sourceEncoding: 'euc-kr',
      fetchedAt: archive.fetchedAt,
      archiveSha256: archive.sha256,
    });
    expect(record).not.toHaveProperty('processedStatus');
    expect(record).not.toHaveProperty('dataAsOf');
    expect(serializeTransformationForInternalTest(result)).toContain('<script');
  });

  test('uses only the reviewed category-specific business-type registry', () => {
    const hospital = transform([
      row(representativeIds.categorySpecificBusinessType, {
        의료기관종별명: '종합병원',
      }),
    ]).records[0];
    const alias = transform([
      row(representativeIds.literalAlias, {
        관리번호: 'alias-record',
        업태구분명: 'common',
        업종구분명: 'specific',
        종별명: 'not-reviewed-as-business-type',
      }),
    ]).records[0];
    expect(hospital?.display.businessTypes).toEqual([
      { sourceField: '의료기관종별명', value: '종합병원' },
    ]);
    expect(alias?.display.businessTypes).toEqual([
      { sourceField: '업태구분명', value: 'common' },
      { sourceField: '업종구분명', value: 'specific' },
    ]);
    expect(alias?.identity.source.categoryEntryName).toBe(
      '자원환경_단독정화조-오수처리시설설계시공업.csv',
    );

    for (const fileDataId of ['15045025', '15045030', '15045026', '15045024']) {
      expect(
        transform([row(fileDataId, { 관리번호: `medical-${fileDataId}`, 의료기관종별명: 'exact' })])
          .records[0]?.display.businessTypes,
      ).toEqual([{ sourceField: '의료기관종별명', value: 'exact' }]);
    }
  });

  test('preserves distinct identities after normalization collisions and emits stable diagnostics', () => {
    const first = row(representativeIds.rich, { 관리번호: '2', 사업장명: 'Ａ 상점' });
    const second = row(representativeIds.rich, { 관리번호: '1', 사업장명: 'a\t상점' });
    const ordered = transform([first, second]);
    const shuffled = transform([second, first]);
    expect(ordered.records).toHaveLength(2);
    expect(ordered.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'normalization_collision', field: 'businessName' }),
      ]),
    );
    expect(serializeTransformationForInternalTest(ordered)).toBe(
      serializeTransformationForInternalTest(shuffled),
    );
  });
});

describe('fail-closed validation', () => {
  test.each([
    ['missing category', { ...row(representativeIds.rich), categoryFileDataId: '' }],
    ['empty authority', row(representativeIds.rich, { 개방자치단체코드: '' })],
    ['whitespace authority', row(representativeIds.rich, { 개방자치단체코드: '\t ' })],
    ['empty management number', row(representativeIds.rich, { 관리번호: '' })],
    ['unsafe NUL', row(representativeIds.rich, { 사업장명: 'unsafe\0text' })],
    ['unpaired surrogate', row(representativeIds.rich, { 사업장명: '\ud800' })],
  ])('rejects the complete stage for %s', (_name, invalidRow) => {
    expect(() => transform([invalidRow])).toThrow(TransformationRejected);
  });

  test('rejects duplicate exact tuples without first/last-wins behavior', () => {
    const duplicate = row(representativeIds.rich);
    expect(() => transform([duplicate, duplicate])).toThrow('duplicate_exact_source_tuple');
  });

  test('rejects an injected digest collision and map overwrite', () => {
    const collisionHash = (_bytes: Uint8Array) => new Uint8Array(32).fill(7);
    expect(() =>
      transformLicenseRecordsV1(
        {
          archiveContract,
          archive,
          rows: [
            row(representativeIds.rich, { 관리번호: 'one' }),
            row(representativeIds.rich, { 관리번호: 'two' }),
          ],
        },
        { hash: collisionHash },
      ),
    ).toThrow('identifier_digest_collision');
  });

  test('rejects unknown category and any header drift', () => {
    expect(() =>
      transform([{ ...row(representativeIds.rich), categoryFileDataId: 'unknown' }]),
    ).toThrow('unknown_category_mapping');
    const changed = row(representativeIds.rich);
    changed.values.알수없는헤더 = 'value';
    expect(() => transform([changed])).toThrow('unknown_header_mapping');
    const missing = row(representativeIds.rich);
    delete missing.values.사업장명;
    expect(() => transform([missing])).toThrow('missing_header_mapping');

    const malformed = row(representativeIds.rich);
    (malformed.values as Record<string, unknown>).사업장명 = undefined;
    expect(() => transform([malformed])).toThrow('malformed_source_cell');
  });

  test('rejects unsafe or overwriting archive-contract evidence', () => {
    expect(() =>
      transformLicenseRecordsV1({
        archiveContract: { ...archiveContract, provider: 'unsafe\0provider' },
        archive,
        rows: [row(representativeIds.rich)],
      }),
    ).toThrow('unsafe_archive_contract_text');

    const first = category(representativeIds.rich);
    expect(() =>
      transformLicenseRecordsV1({
        archiveContract: {
          ...archiveContract,
          expectedEntryCount: 2,
          entries: [first, { ...first, entryName: 'duplicate-map.csv' }],
        },
        archive,
        rows: [],
      }),
    ).toThrow('archive_category_map_overwrite');
  });

  test('rejects non-deterministic hash output and non-32-byte digests', () => {
    let calls = 0;
    const driftingHash = (bytes: Uint8Array) => {
      calls += 1;
      return createHash('sha256').update(bytes).update(String(calls)).digest();
    };
    expect(() =>
      transformLicenseRecordsV1(
        { archiveContract, archive, rows: [row(representativeIds.rich)] },
        { hash: driftingHash },
      ),
    ).toThrow('non_deterministic_identifier');
    expect(() =>
      transformLicenseRecordsV1(
        { archiveContract, archive, rows: [row(representativeIds.rich)] },
        { hash: () => new Uint8Array(31) },
      ),
    ).toThrow('invalid_identifier_digest');
  });
});
