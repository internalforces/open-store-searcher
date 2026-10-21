import type { ByteBinding, PublicationIdentityV1 } from './recovery-types.js';
import type {
  ReviewedUnverifiedPairsContractV1,
  ValidationBaselineV1,
  ValidationDiagnosticV1,
  ValidationPolicyV1,
} from './refresh-validation-types.js';

/** Approved retained input identity; downloaded data never supplies source authority. */
export const INITIAL_SOURCE = Object.freeze({
  id: 'seoul-2026-10-16-initial',
  purpose: 'initial-publication-recovery-verification',
  archive: Object.freeze({
    byteLength: 217307219,
    sha256: 'c90758c2d3922e78d636ab2c9967b80c690bdcd8aeca283cf9f6ecc2cc992352',
  }),
  observation: Object.freeze({
    byteLength: 356005,
    sha256: '3d23a3c770b24039a6690f2db8022eb610ffb5b56a9efee031f78b78918b4626',
  }),
  collectionCanonicalSha256: '3817b6e8d7621c12c7ce4a3b5ae8c581c28340284ec001737900a2744d6ac22b',
  collectedAt: '2026-10-16T01:52:52.043Z',
  sourceDataAsOf: null,
  recordCount: 2951024,
  categoryCount: 195,
  schemaManifestSha256: '6254a2b3d6626c41f625bb98d79399bdd40318632ce0d54561a997fdd039ceb6',
  policyRevision: 'task-008-calibration-2026-10-16-v1-proposed',
  policyCanonicalSha256: '090973f79398f45d52262958e2887497652cec13b4d95b608eb84c691070feff',
  baselineCanonicalSha256: '9234ed3297166a08b500356ac01f5bcd150276c04a2bdd129d399fa0bdc6b183',
  reviewedPairsCanonicalSha256: 'd698ac34c7485c9e09dfec425a0195bcc56d9644f25479aefc350c5969998cb2',
  tag: 'initial-source-seoul-2026-10-16',
  assetNames: Object.freeze({
    archive: 'seoul-source-2026-10-16.zip',
    observation: 'source-observation.json',
  }),
} as const);

export interface InitialImportConfigV1 {
  previousReleaseUrl: string;
  policy: ValidationPolicyV1;
  baseline: ValidationBaselineV1;
  reviewedUnverifiedPairs: ReviewedUnverifiedPairsContractV1;
  maxEntryBytes: number;
  maxTotalRows: number;
  entryTimeoutMs: number;
}
export interface InitialSourceAssetV1 extends ByteBinding {
  id: number;
  name: string;
}
export interface InitialSourceApprovalV1 {
  id: string;
  purpose: string;
  archive: ByteBinding;
  observation: ByteBinding;
  collectionCanonicalSha256: string;
  collectedAt: string;
  sourceDataAsOf: null;
  recordCount: number;
  categoryCount: number;
  schemaManifestSha256: string;
  policyRevision: string;
  policyCanonicalSha256: string;
  baselineCanonicalSha256: string;
  reviewedPairsCanonicalSha256: string;
  releaseId: number;
  tag: string;
  tagCommit: string;
  assets: { archive: InitialSourceAssetV1; observation: InitialSourceAssetV1 };
}
export interface InitialImportRegistryV1 {
  version: 1;
  kind: 'initial-source-approvals';
  repository: string;
  siteUrl: string;
  activeSourceId: string | null;
  sources: InitialSourceApprovalV1[];
}
export interface InitialReleaseTransportV1 {
  kind: 'github-release';
  releaseId: number;
  tag: string;
  tagCommit: string;
  assets: { archive: InitialSourceAssetV1; observation: InitialSourceAssetV1 };
  downloadedAt: string;
}
export interface InitialLocalTransportV1 {
  kind: 'local-proof';
}
export interface InitialSourceFilesV1 {
  archivePath: string;
  observationPath: string;
  transport: InitialReleaseTransportV1 | InitialLocalTransportV1;
}
export interface InitialOperatorV1 {
  commit: string;
  uncommitted: boolean;
  codeBindings: Record<string, ByteBinding>;
  runId: number | null;
}
export interface RetainedSourceImportReceiptV1 {
  version: 1;
  kind: 'retained-source-import-verified';
  sourceId: string;
  mode: 'hosted' | 'local-proof';
  archive: ByteBinding;
  observation: ByteBinding;
  collectedAt: string;
  sourceDataAsOf: null;
  schemaManifestSha256: string;
  categoryCount: 195;
  recordCount: 2951024;
  policyRevision: string;
  policyCanonicalSha256: string;
  baselineCanonicalSha256: string;
  reviewedPairsCanonicalSha256: string;
  validationNow: string;
  verifiedAt: string;
  operator: InitialOperatorV1;
  transport: InitialReleaseTransportV1 | InitialLocalTransportV1;
  warnings: ValidationDiagnosticV1[];
}
export interface InitialPreparationV1 {
  version: 1;
  kind: 'initial-publication-prepared';
  mode: 'hosted' | 'local-proof';
  sourceId: string;
  operator: InitialOperatorV1;
  sourceReceipt: ByteBinding;
  identity: PublicationIdentityV1;
  inventory: ByteBinding;
  tar: ByteBinding;
  preparedAt: string;
  expiresAt: string;
  precondition: { status: 404; releaseSha256: null } | null;
}
