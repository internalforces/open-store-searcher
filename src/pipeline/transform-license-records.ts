import { createHash } from 'node:crypto';
import type { ArchiveContract, ArchiveContractEntry } from './archive-contract.js';

export const TRANSFORMATION_SCHEMA_VERSION = 1 as const;
export const IDENTIFIER_CONTRACT_VERSION = 1 as const;
export const NORMALIZATION_CONTRACT_VERSION = 1 as const;

const IDENTIFIER_DOMAIN = 'open-store-searcher:public-license-id';
const COMMON_BUSINESS_TYPE_HEADER = '업태구분명';
const REQUIRED_IDENTITY_HEADERS = ['개방자치단체코드', '관리번호'] as const;
const SEARCH_FIELDS = ['businessName', 'roadAddress', 'parcelAddress'] as const;

const CATEGORY_BUSINESS_TYPE_REGISTRY: Readonly<Record<string, readonly string[]>> = Object.freeze({
  '15045011': Object.freeze(['업종구분명']),
  '15045025': Object.freeze(['의료기관종별명']),
  '15045030': Object.freeze(['의료기관종별명']),
  '15045026': Object.freeze(['의료기관종별명']),
  '15045024': Object.freeze(['의료기관종별명']),
});

export interface ExactSourceIdentityV1 {
  categoryFileDataId: string;
  licensingAuthorityCode: string;
  managementNumber: string;
}

export interface StagedLicenseRowV1 {
  categoryFileDataId: string;
  sourceFileDataUrl: string;
  values: Record<string, string | null>;
}

export interface TransformArchiveEvidenceV1 {
  fetchedAt: string;
  sha256: string;
}

export interface TransformLicenseInputV1 {
  archiveContract: ArchiveContract;
  archive: TransformArchiveEvidenceV1;
  rows: StagedLicenseRowV1[];
}

export interface TransformedLicenseRecordV1 {
  schemaVersion: 1;
  identity: {
    contractVersion: 1;
    digest: Uint8Array;
    source: ExactSourceIdentityV1 & {
      categoryEntryName: string;
      providerServiceId: null;
    };
  };
  display: {
    businessName: string | null;
    roadAddress: string | null;
    parcelAddress: string | null;
    categoryName: string;
    businessTypes: Array<{ sourceField: string; value: string }>;
  };
  search: {
    normalizationVersion: 1;
    businessName: string | null;
    roadAddress: string | null;
    parcelAddress: string | null;
  };
  rawStatus: {
    operatingCode: string | null;
    operatingName: string | null;
    detailedCode: string | null;
    detailedName: string | null;
  };
  lifecycle: {
    licensedOn: string | null;
    licenseCancelledOn: string | null;
    suspendedFrom: string | null;
    suspendedThrough: string | null;
    reopenedOn: string | null;
    closedOn: string | null;
    sourceUpdatedAt: string | null;
    sourceLastModifiedAt: string | null;
  };
  provenance: {
    provider: string;
    permissionLabel: string;
    sourceFileDataUrl: string;
    sourceFileDataId: string;
    sourceEntryName: string;
    sourceEncoding: 'utf-8' | 'euc-kr';
    fetchedAt: string;
    archiveSha256: string;
  };
}

export interface NormalizationCollisionDiagnosticV1 {
  code: 'normalization_collision';
  field: (typeof SEARCH_FIELDS)[number] | 'businessNameAndAddress';
  normalizedValue: string;
  identities: ExactSourceIdentityV1[];
}

export interface TransformationResultV1 {
  schemaVersion: 1;
  identifierContractVersion: 1;
  normalizationContractVersion: 1;
  records: TransformedLicenseRecordV1[];
  diagnostics: NormalizationCollisionDiagnosticV1[];
}

type HashFunction = (bytes: Uint8Array) => Uint8Array;

export interface TransformOptionsV1 {
  hash?: HashFunction;
}

export class TransformationRejected extends Error {
  readonly code: string;

  constructor(code: string) {
    super(code);
    this.name = 'TransformationRejected';
    this.code = code;
  }
}

function reject(code: string): never {
  throw new TransformationRejected(code);
}

function assertSafeText(value: string, code: string): void {
  for (let index = 0; index < value.length; index += 1) {
    const unit = value.charCodeAt(index);
    if (unit >= 0xd800 && unit <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) reject(code);
      index += 1;
    } else if (unit >= 0xdc00 && unit <= 0xdfff) {
      reject(code);
    } else if (
      (unit >= 0x00 && unit <= 0x08) ||
      unit === 0x0b ||
      unit === 0x0c ||
      (unit >= 0x0e && unit <= 0x1f) ||
      unit === 0x7f
    ) {
      reject(code);
    }
  }
}

function uint32(value: number): Uint8Array {
  if (!Number.isSafeInteger(value) || value < 0 || value > 0xffff_ffff) {
    reject('identity_input_too_long');
  }
  const result = new Uint8Array(4);
  new DataView(result.buffer).setUint32(0, value, false);
  return result;
}

function lengthPrefixed(value: string): Uint8Array[] {
  assertSafeText(value, 'unsafe_identity_text');
  const bytes = new TextEncoder().encode(value);
  return [uint32(bytes.byteLength), bytes];
}

function concatenate(parts: readonly Uint8Array[]): Uint8Array {
  const length = parts.reduce((total, part) => total + part.byteLength, 0);
  const result = new Uint8Array(length);
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.byteLength;
  }
  return result;
}

function identityTupleBytes(identity: ExactSourceIdentityV1): Uint8Array {
  return concatenate([
    ...lengthPrefixed(identity.categoryFileDataId),
    ...lengthPrefixed(identity.licensingAuthorityCode),
    ...lengthPrefixed(identity.managementNumber),
  ]);
}

export function frameExactIdentityV1(identity: ExactSourceIdentityV1): Uint8Array {
  return concatenate([
    ...lengthPrefixed(IDENTIFIER_DOMAIN),
    uint32(IDENTIFIER_CONTRACT_VERSION),
    identityTupleBytes(identity),
  ]);
}

function nativeSha256(bytes: Uint8Array): Uint8Array {
  return createHash('sha256').update(bytes).digest();
}

function equalBytes(left: Uint8Array, right: Uint8Array): boolean {
  if (left.byteLength !== right.byteLength) return false;
  return left.every((value, index) => value === right[index]);
}

export function createInternalIdentifierV1(
  identity: ExactSourceIdentityV1,
  hash: HashFunction = nativeSha256,
): Uint8Array {
  const framed = frameExactIdentityV1(identity);
  const first = Uint8Array.from(hash(framed));
  const second = Uint8Array.from(hash(framed));
  if (first.byteLength !== 32 || second.byteLength !== 32) reject('invalid_identifier_digest');
  if (!equalBytes(first, second)) reject('non_deterministic_identifier');
  return first;
}

function compareBytes(left: Uint8Array, right: Uint8Array): number {
  const sharedLength = Math.min(left.byteLength, right.byteLength);
  for (let index = 0; index < sharedLength; index += 1) {
    const difference = (left[index] ?? 0) - (right[index] ?? 0);
    if (difference !== 0) return difference;
  }
  return left.byteLength - right.byteLength;
}

export function compareExactIdentityV1(
  left: ExactSourceIdentityV1,
  right: ExactSourceIdentityV1,
): number {
  return compareBytes(identityTupleBytes(left), identityTupleBytes(right));
}

export function normalizeSearchValueV1(value: string | null): string | null {
  if (value === null) return null;
  assertSafeText(value, 'unsafe_source_text');
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/\p{White_Space}+/gu, ' ')
    .replace(/^ | $/g, '');
}

function requiredIdentityValue(
  values: Readonly<Record<string, string | null>>,
  header: (typeof REQUIRED_IDENTITY_HEADERS)[number],
): string {
  const value = values[header];
  if (typeof value !== 'string' || /^\p{White_Space}*$/u.test(value)) {
    reject(
      header === '개방자치단체코드'
        ? 'missing_licensing_authority_code'
        : 'missing_management_number',
    );
  }
  assertSafeText(value, 'unsafe_identity_text');
  return value;
}

function validateRowHeaders(entry: ArchiveContractEntry, row: StagedLicenseRowV1): void {
  const expected = new Set(entry.headers);
  const actual = Object.keys(row.values);
  if (actual.some((header) => !expected.has(header))) reject('unknown_header_mapping');
  if (entry.headers.some((header) => !Object.hasOwn(row.values, header))) {
    reject('missing_header_mapping');
  }
}

function validateAllSourceText(row: StagedLicenseRowV1): void {
  assertSafeText(row.categoryFileDataId, 'unsafe_source_text');
  assertSafeText(row.sourceFileDataUrl, 'unsafe_source_text');
  for (const [header, value] of Object.entries(row.values)) {
    assertSafeText(header, 'unsafe_source_text');
    if (value !== null && typeof value !== 'string') reject('malformed_source_cell');
    if (value !== null) assertSafeText(value, 'unsafe_source_text');
  }
}

function validateArchiveContractForTransformation(
  contract: ArchiveContract,
): Map<string, ArchiveContractEntry> {
  assertSafeText(contract.provider, 'unsafe_archive_contract_text');
  assertSafeText(contract.permissionLabel, 'unsafe_archive_contract_text');
  const entries = new Map<string, ArchiveContractEntry>();
  const entryNames = new Set<string>();
  for (const entry of contract.entries) {
    assertSafeText(entry.fileDataId, 'unsafe_archive_contract_text');
    assertSafeText(entry.entryName, 'unsafe_archive_contract_text');
    if (
      /^\p{White_Space}*$/u.test(entry.fileDataId) ||
      /^\p{White_Space}*$/u.test(entry.entryName)
    ) {
      reject('missing_archive_category_identity');
    }
    if (entries.has(entry.fileDataId) || entryNames.has(entry.entryName)) {
      reject('archive_category_map_overwrite');
    }
    const headers = new Set<string>();
    for (const header of entry.headers) {
      assertSafeText(header, 'unsafe_archive_contract_text');
      if (headers.has(header)) reject('duplicate_archive_header');
      headers.add(header);
    }
    for (const header of REQUIRED_IDENTITY_HEADERS) {
      if (!headers.has(header)) reject('missing_identity_header_mapping');
    }
    entries.set(entry.fileDataId, entry);
    entryNames.add(entry.entryName);
  }
  for (const [fileDataId, headers] of Object.entries(CATEGORY_BUSINESS_TYPE_REGISTRY)) {
    const entry = entries.get(fileDataId);
    if (!entry || headers.some((header) => !entry.headers.includes(header))) {
      reject('invalid_business_type_registry');
    }
  }
  return entries;
}

function cell(row: StagedLicenseRowV1, header: string): string | null {
  return row.values[header] ?? null;
}

function businessTypes(
  entry: ArchiveContractEntry,
  row: StagedLicenseRowV1,
): Array<{ sourceField: string; value: string }> {
  const headers = [
    ...(entry.headers.includes(COMMON_BUSINESS_TYPE_HEADER) ? [COMMON_BUSINESS_TYPE_HEADER] : []),
    ...(CATEGORY_BUSINESS_TYPE_REGISTRY[entry.fileDataId] ?? []),
  ];
  for (const header of headers) {
    if (!entry.headers.includes(header)) reject('invalid_business_type_registry');
  }
  return headers.flatMap((sourceField) => {
    const value = cell(row, sourceField);
    return value === null ? [] : [{ sourceField, value }];
  });
}

function transformOne(
  input: TransformLicenseInputV1,
  entry: ArchiveContractEntry,
  row: StagedLicenseRowV1,
  identity: ExactSourceIdentityV1,
  digest: Uint8Array,
): TransformedLicenseRecordV1 {
  const businessName = cell(row, '사업장명');
  const roadAddress = cell(row, '도로명주소');
  const parcelAddress = cell(row, '지번주소');
  return {
    schemaVersion: TRANSFORMATION_SCHEMA_VERSION,
    identity: {
      contractVersion: IDENTIFIER_CONTRACT_VERSION,
      digest,
      source: {
        categoryFileDataId: identity.categoryFileDataId,
        licensingAuthorityCode: identity.licensingAuthorityCode,
        managementNumber: identity.managementNumber,
        categoryEntryName: entry.entryName,
        providerServiceId: null,
      },
    },
    display: {
      businessName,
      roadAddress,
      parcelAddress,
      categoryName: entry.entryName,
      businessTypes: businessTypes(entry, row),
    },
    search: {
      normalizationVersion: NORMALIZATION_CONTRACT_VERSION,
      businessName: normalizeSearchValueV1(businessName),
      roadAddress: normalizeSearchValueV1(roadAddress),
      parcelAddress: normalizeSearchValueV1(parcelAddress),
    },
    rawStatus: {
      operatingCode: cell(row, '영업상태코드'),
      operatingName: cell(row, '영업상태명'),
      detailedCode: cell(row, '상세영업상태코드'),
      detailedName: cell(row, '상세영업상태명'),
    },
    lifecycle: {
      licensedOn: cell(row, '인허가일자'),
      licenseCancelledOn: cell(row, '인허가취소일자'),
      suspendedFrom: cell(row, '휴업시작일자'),
      suspendedThrough: cell(row, '휴업종료일자'),
      reopenedOn: cell(row, '재개업일자'),
      closedOn: cell(row, '폐업일자'),
      sourceUpdatedAt: cell(row, '데이터갱신시점'),
      sourceLastModifiedAt: cell(row, '최종수정시점'),
    },
    provenance: {
      provider: input.archiveContract.provider,
      permissionLabel: input.archiveContract.permissionLabel,
      sourceFileDataUrl: row.sourceFileDataUrl,
      sourceFileDataId: entry.fileDataId,
      sourceEntryName: entry.entryName,
      sourceEncoding: entry.encoding,
      fetchedAt: input.archive.fetchedAt,
      archiveSha256: input.archive.sha256,
    },
  };
}

function bytesKey(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('hex');
}

function collisionDiagnostics(
  records: readonly TransformedLicenseRecordV1[],
): NormalizationCollisionDiagnosticV1[] {
  const groups = new Map<
    string,
    {
      field: NormalizationCollisionDiagnosticV1['field'];
      value: string;
      records: TransformedLicenseRecordV1[];
    }
  >();
  const add = (
    field: NormalizationCollisionDiagnosticV1['field'],
    value: string | null,
    record: TransformedLicenseRecordV1,
  ) => {
    if (value === null) return;
    const key = `${field}\0${value}`;
    const group = groups.get(key) ?? { field, value, records: [] };
    group.records.push(record);
    groups.set(key, group);
  };
  for (const record of records) {
    for (const field of SEARCH_FIELDS) add(field, record.search[field], record);
    add(
      'businessNameAndAddress',
      record.search.businessName === null ||
        (record.search.roadAddress === null && record.search.parcelAddress === null)
        ? null
        : JSON.stringify([
            record.search.businessName,
            record.search.roadAddress,
            record.search.parcelAddress,
          ]),
      record,
    );
  }
  return [...groups.values()]
    .filter((group) => group.records.length > 1)
    .map((group) => ({
      code: 'normalization_collision' as const,
      field: group.field,
      normalizedValue: group.value,
      identities: group.records
        .map((record) => ({
          categoryFileDataId: record.identity.source.categoryFileDataId,
          licensingAuthorityCode: record.identity.source.licensingAuthorityCode,
          managementNumber: record.identity.source.managementNumber,
        }))
        .sort(compareExactIdentityV1),
    }))
    .sort((left, right) => {
      const code = compareBytes(
        new TextEncoder().encode(left.code),
        new TextEncoder().encode(right.code),
      );
      if (code !== 0) return code;
      const leftIdentity = left.identities[0];
      const rightIdentity = right.identities[0];
      if (!leftIdentity || !rightIdentity) reject('invalid_normalization_collision_diagnostic');
      const identity = compareExactIdentityV1(leftIdentity, rightIdentity);
      if (identity !== 0) return identity;
      const field = compareBytes(
        new TextEncoder().encode(left.field),
        new TextEncoder().encode(right.field),
      );
      if (field !== 0) return field;
      return compareBytes(
        new TextEncoder().encode(left.normalizedValue),
        new TextEncoder().encode(right.normalizedValue),
      );
    });
}

export function transformLicenseRecordsV1(
  input: TransformLicenseInputV1,
  options: TransformOptionsV1 = {},
): TransformationResultV1 {
  if (typeof input.archive.fetchedAt !== 'string' || typeof input.archive.sha256 !== 'string') {
    reject('malformed_archive_provenance');
  }
  assertSafeText(input.archive.fetchedAt, 'unsafe_provenance_text');
  assertSafeText(input.archive.sha256, 'unsafe_provenance_text');
  const entries = validateArchiveContractForTransformation(input.archiveContract);
  const exactTuples = new Set<string>();
  const digestToTuple = new Map<string, string>();
  const records: TransformedLicenseRecordV1[] = [];

  for (const row of input.rows) {
    if (
      typeof row.categoryFileDataId !== 'string' ||
      row.categoryFileDataId.length === 0 ||
      /^\p{White_Space}*$/u.test(row.categoryFileDataId)
    ) {
      reject('missing_category_namespace');
    }
    validateAllSourceText(row);
    const entry = entries.get(row.categoryFileDataId);
    if (!entry) reject('unknown_category_mapping');
    validateRowHeaders(entry, row);
    const identity: ExactSourceIdentityV1 = {
      categoryFileDataId: row.categoryFileDataId,
      licensingAuthorityCode: requiredIdentityValue(row.values, '개방자치단체코드'),
      managementNumber: requiredIdentityValue(row.values, '관리번호'),
    };
    const tupleKey = bytesKey(identityTupleBytes(identity));
    if (exactTuples.has(tupleKey)) reject('duplicate_exact_source_tuple');
    exactTuples.add(tupleKey);
    const digest = createInternalIdentifierV1(identity, options.hash);
    const digestKey = bytesKey(digest);
    const existingTuple = digestToTuple.get(digestKey);
    if (existingTuple !== undefined && existingTuple !== tupleKey) {
      reject('identifier_digest_collision');
    }
    if (digestToTuple.has(digestKey)) reject('identifier_map_overwrite');
    digestToTuple.set(digestKey, tupleKey);
    records.push(transformOne(input, entry, row, identity, digest));
  }

  records.sort((left, right) =>
    compareExactIdentityV1(left.identity.source, right.identity.source),
  );
  const diagnostics = collisionDiagnostics(records);
  return {
    schemaVersion: TRANSFORMATION_SCHEMA_VERSION,
    identifierContractVersion: IDENTIFIER_CONTRACT_VERSION,
    normalizationContractVersion: NORMALIZATION_CONTRACT_VERSION,
    records,
    diagnostics,
  };
}

export function serializeTransformationForInternalTest(result: TransformationResultV1): string {
  const internal = {
    schemaVersion: result.schemaVersion,
    identifierContractVersion: result.identifierContractVersion,
    normalizationContractVersion: result.normalizationContractVersion,
    records: result.records.map((record) => ({
      ...record,
      identity: {
        contractVersion: record.identity.contractVersion,
        digestBytes: Array.from(record.identity.digest),
        source: record.identity.source,
      },
    })),
    diagnostics: result.diagnostics,
  };
  return JSON.stringify(internal);
}
