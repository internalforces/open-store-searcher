import type { TransformedLicenseRecordV2 } from '../pipeline/transform-license-records.js';
import type { SearchRecord } from '../search/search-candidates.js';

/** Internal presentation input, not a published JSON or identifier contract. */
export interface DisplayRecord extends SearchRecord {
  readonly categoryName: string;
  readonly businessTypes: TransformedLicenseRecordV2['display']['businessTypes'];
  readonly rawStatus: TransformedLicenseRecordV2['rawStatus'];
  readonly lifecycle: TransformedLicenseRecordV2['lifecycle'];
  readonly sourceLabel: string;
  readonly sourceUrl: string | null;
}

/** Verified dates must come from reviewed coverage evidence, never row or fetch timestamps. */
export type Coverage =
  | { readonly kind: 'synthetic'; readonly date: string }
  | { readonly kind: 'verified'; readonly date: string }
  | { readonly kind: 'collected'; readonly date: string }
  | { readonly kind: 'unavailable' };

export interface DisplayDataset {
  readonly sourceLabel: string;
  readonly sourceUrl: string | null;
  readonly records: readonly DisplayRecord[];
  readonly coverage: Coverage;
  readonly exampleQuery: string;
}
