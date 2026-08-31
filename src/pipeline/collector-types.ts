export type CollectorRejectionCode =
  | 'environment_unavailable'
  | 'download_limit_denied'
  | 'http_contract_changed'
  | 'redirect_not_allowed'
  | 'range_contract_changed'
  | 'archive_size_out_of_bounds'
  | 'transfer_incomplete'
  | 'archive_corrupt'
  | 'archive_entry_unsafe'
  | 'category_manifest_changed'
  | 'permission_manifest_changed'
  | 'csv_contract_changed'
  | 'timestamp_evidence_inconsistent';

export interface CollectorLimits {
  minArchiveBytes: number;
  maxArchiveBytes: number;
  maxProcessOutputBytes: number;
  maxHeaderBytes: number;
  httpProbeTimeoutMs: number;
  downloadInactivityTimeoutMs: number;
  downloadDeadlineMs: number;
  maxRedirects: number;
}

export const DEFAULT_COLLECTOR_LIMITS: CollectorLimits = {
  minArchiveBytes: 1024 * 1024,
  maxArchiveBytes: 512 * 1024 * 1024,
  maxProcessOutputBytes: 8 * 1024 * 1024,
  maxHeaderBytes: 256 * 1024,
  httpProbeTimeoutMs: 30_000,
  downloadInactivityTimeoutMs: 120_000,
  downloadDeadlineMs: 1_200_000,
  maxRedirects: 3,
};

export interface ProviderFreshnessEvidence {
  updateCadence: 'daily';
  coverageLagDays: 2;
  sourceUrl: string;
}

export interface SourceEvidence {
  expectedBytes: number;
  finalUrl: string;
  limitStatus?: number;
  rangeStatus?: number;
  providerFreshness: ProviderFreshnessEvidence;
}

export interface ArchiveEvidence {
  entryCount: number;
  schemaManifestSha256: string;
  providerModifiedDate: string;
}

export interface PermissionCategory {
  apiId: string;
  apiTitle: string;
  fileDataId: string;
  fileDataTitle: string;
  fileDataUrl: string;
}

export interface PermissionManifest {
  provider: '행정안전부';
  expectedCategoryCount: 195;
  verifiedCategoryCount: 195;
  permissionLabel: '이용허락범위 제한 없음';
  categories: PermissionCategory[];
}

export interface CollectorOptions {
  stagingRoot: string;
  previousAcceptedSha256?: string;
  fetchedAt: string;
  signal?: AbortSignal;
  limits: CollectorLimits;
}

export type RejectedResult = {
  kind: 'rejected';
  code: CollectorRejectionCode;
  message: string;
  fetchedAt: string;
};

export type CollectionResult =
  | {
      kind: 'accepted';
      change: 'changed' | 'unchanged';
      archivePath: string;
      sha256: string;
      byteLength: number;
      fetchedAt: string;
      sourceEvidence: SourceEvidence;
      archiveEvidence: ArchiveEvidence;
    }
  | RejectedResult;

export type FetchLike = (input: string | URL, init?: RequestInit) => Promise<Response>;

export function isCanonicalUtc(value: string): boolean {
  const parsed = new Date(value);
  return (
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) &&
    !Number.isNaN(parsed.valueOf()) &&
    parsed.toISOString() === value
  );
}
