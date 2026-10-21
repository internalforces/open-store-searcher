import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { selectRecoveryApproval, validateRecoveryProvenance } from './recovery-approval.js';
import { sha256Bytes, type RecoveryApprovalV1 } from './recovery-types.js';
import registryFile from '../../publication/recovery-approvals.json' with { type: 'json' };
import { createInitialImportFixture } from '../../tests/fixtures/initial-import.js';
import { INITIAL_SOURCE } from './initial-import-types.js';

// All identities below are synthetic fixtures, never hosted-success evidence.
beforeEach(() => {
  vi.stubGlobal('fetch', () => {
    throw new Error('Real network is forbidden in recovery tests');
  });
});
afterEach(() => {
  vi.unstubAllGlobals();
});
const siteUrl = 'https://internalforces.github.io/open-store-searcher/';
const config = { siteUrl, policyRevision: 'fixture-policy' };
function fixture(): RecoveryApprovalV1 {
  const receipt = {
    version: 1 as const,
    kind: 'public-bytes-verified' as const,
    siteUrl,
    checkedAt: '2026-10-18T00:00:00.000Z',
    inventorySha256: 'a'.repeat(64),
    releaseSha256: 'b'.repeat(64),
  };
  const binding = { byteLength: 32, sha256: 'a'.repeat(64) };
  return {
    id: 'synthetic-backup',
    repository: 'internalforces/open-store-searcher',
    siteUrl,
    releaseId: 11,
    tag: 'fixture-tag',
    assets: {
      snapshot: { id: 12, name: 'snapshot.tar.gz', ...binding },
      inventory: { id: 13, name: 'inventory.json', ...binding },
      provenance: { id: 14, name: 'provenance.json', ...binding },
    },
    expectedProvenance: {
      version: 1,
      kind: 'verified-publication-backup',
      repository: 'internalforces/open-store-searcher',
      siteUrl,
      sourceCommit: 'c'.repeat(40),
      workflowCommit: 'd'.repeat(40),
      workflowPath: '.github/workflows/refresh.yml',
      runId: 15,
      artifactId: 16,
      deploymentId: 'synthetic-deployment',
      deploymentOutcome: 'success',
      verifiedAt: receipt.checkedAt,
      identity: {
        releaseSha256: 'b'.repeat(64),
        manifestSha256: 'e'.repeat(64),
        baselineSha256: 'f'.repeat(64),
        archiveSha256: '1'.repeat(64),
        collectedAt: '2026-10-17T00:00:00.000Z',
        recordCount: 2,
        policyRevision: 'fixture-policy',
        schemaVersion: 2,
        identifierVersion: 1,
        normalizationVersion: 1,
      },
      inventory: binding,
      tar: binding,
      gzip: binding,
      publicVerification: {
        receipt,
        binding: {
          byteLength: Buffer.byteLength(`${JSON.stringify(receipt)}\n`),
          sha256: sha256Bytes(Buffer.from(`${JSON.stringify(receipt)}\n`)),
        },
      },
    },
  };
}
function registry(backup = fixture()) {
  return {
    version: 1,
    kind: 'publication-recovery-approvals',
    repository: backup.repository,
    siteUrl,
    activeBackupId: backup.id,
    backups: [backup],
  };
}
describe('selectRecoveryApproval', () => {
  it('selects only the exact active reviewed approval and returns an isolated value', () => {
    const source = registry();
    const approval = selectRecoveryApproval(source, 'synthetic-backup', config);
    expect(approval.expectedProvenance.deploymentId).toBe('synthetic-deployment');
    approval.expectedProvenance.identity.recordCount = 9;
    expect(source.backups[0]?.expectedProvenance.identity.recordCount).toBe(2);
  });
  it('validates proposed provenance without inventing release or asset identities', () => {
    const proposal = fixture().expectedProvenance;
    const checked = validateRecoveryProvenance(proposal, config);
    expect(checked.workflowPath).toBe('.github/workflows/refresh.yml');
    expect(checked.publicVerification.receipt.kind).toBe('public-bytes-verified');
    expect(Object.hasOwn(checked, 'releaseId')).toBe(false);
    expect(() =>
      validateRecoveryProvenance({ ...proposal, deploymentOutcome: 'failed' }, config),
    ).toThrow();
  });
  it('keeps the real registry empty and rejects empty or nonactive selection', () => {
    expect(registryFile).toEqual({
      version: 1,
      kind: 'publication-recovery-approvals',
      repository: 'internalforces/open-store-searcher',
      siteUrl,
      activeBackupId: null,
      backups: [],
    });
    expect(() => selectRecoveryApproval(registryFile, 'local-proof', config)).toThrow();
    expect(() => selectRecoveryApproval(registry(), 'older-backup', config)).toThrow();
    expect(() =>
      selectRecoveryApproval({ ...registry(), activeBackupId: null }, 'synthetic-backup', config),
    ).toThrow();
  });
  it.each([
    [
      'provenance repository',
      (a: RecoveryApprovalV1) => {
        a.expectedProvenance.repository = 'attacker/repo';
      },
    ],
    [
      'provenance site',
      (a: RecoveryApprovalV1) => {
        a.expectedProvenance.siteUrl = 'https://example.com/';
      },
    ],
    [
      'provenance version',
      (a: RecoveryApprovalV1) => {
        Object.assign(a.expectedProvenance, { version: 2 });
      },
    ],
    [
      'artifact ID',
      (a: RecoveryApprovalV1) => {
        a.expectedProvenance.artifactId = -1;
      },
    ],
    [
      'release ID',
      (a: RecoveryApprovalV1) => {
        a.releaseId = 0;
      },
    ],
    [
      'duplicate asset IDs',
      (a: RecoveryApprovalV1) => {
        a.assets.inventory.id = a.assets.snapshot.id;
      },
    ],
    [
      'approval ID',
      (a: RecoveryApprovalV1) => {
        a.id = '../untrusted';
      },
    ],
    [
      'unsafe tag',
      (a: RecoveryApprovalV1) => {
        a.tag = '../other';
      },
    ],
    [
      'identity hash',
      (a: RecoveryApprovalV1) => {
        a.expectedProvenance.identity.manifestSha256 = 'A'.repeat(64);
      },
    ],
    [
      'record count',
      (a: RecoveryApprovalV1) => {
        a.expectedProvenance.identity.recordCount = -1;
      },
    ],
    [
      'future collection',
      (a: RecoveryApprovalV1) => {
        a.expectedProvenance.identity.collectedAt = '2026-10-19T00:00:00.000Z';
      },
    ],
    [
      'empty deployment ID',
      (a: RecoveryApprovalV1) => {
        a.expectedProvenance.deploymentId = ' ';
      },
    ],
    [
      'archive cap',
      (a: RecoveryApprovalV1) => {
        a.expectedProvenance.tar.byteLength = 1_020_000_001;
      },
    ],
    [
      'provenance cap',
      (a: RecoveryApprovalV1) => {
        a.assets.provenance.byteLength = 65_537;
      },
    ],
    [
      'missing provenance field',
      (a: RecoveryApprovalV1) => {
        Reflect.deleteProperty(a.expectedProvenance, 'deploymentId');
      },
    ],

    [
      'repository',
      (a: RecoveryApprovalV1) => {
        a.repository = 'attacker/repo';
      },
    ],
    [
      'site',
      (a: RecoveryApprovalV1) => {
        a.siteUrl = 'https://example.com/';
      },
    ],
    [
      'commit',
      (a: RecoveryApprovalV1) => {
        a.expectedProvenance.sourceCommit = 'c'.repeat(39);
      },
    ],
    [
      'workflow commit',
      (a: RecoveryApprovalV1) => {
        a.expectedProvenance.workflowCommit = 'D'.repeat(40);
      },
    ],
    [
      'workflow path',
      (a: RecoveryApprovalV1) => {
        a.expectedProvenance.workflowPath = '.github/workflows/restore.yml';
      },
    ],
    [
      'ID',
      (a: RecoveryApprovalV1) => {
        a.expectedProvenance.runId = Number.MAX_SAFE_INTEGER + 1;
      },
    ],
    [
      'asset ID',
      (a: RecoveryApprovalV1) => {
        a.assets.snapshot.id = 0;
      },
    ],
    [
      'asset name',
      (a: RecoveryApprovalV1) => {
        a.assets.inventory.name = 'renamed.json';
      },
    ],
    [
      'hash',
      (a: RecoveryApprovalV1) => {
        a.assets.snapshot.sha256 = '0'.repeat(64);
      },
    ],
    [
      'length',
      (a: RecoveryApprovalV1) => {
        a.assets.inventory.byteLength = 0;
      },
    ],
    [
      'policy',
      (a: RecoveryApprovalV1) => {
        a.expectedProvenance.identity.policyRevision = 'other';
      },
    ],
    [
      'version',
      (a: RecoveryApprovalV1) => {
        Object.assign(a.expectedProvenance.identity, { schemaVersion: 1 });
      },
    ],
    [
      'local-only receipt',
      (a: RecoveryApprovalV1) => {
        Object.assign(a.expectedProvenance.publicVerification.receipt, { kind: 'prepared-local' });
      },
    ],
    [
      'receipt digest',
      (a: RecoveryApprovalV1) => {
        a.expectedProvenance.publicVerification.binding.sha256 = '0'.repeat(64);
      },
    ],
    [
      'receipt identity',
      (a: RecoveryApprovalV1) => {
        a.expectedProvenance.publicVerification.receipt.releaseSha256 = '0'.repeat(64);
      },
    ],
    [
      'timestamp',
      (a: RecoveryApprovalV1) => {
        a.expectedProvenance.verifiedAt = '2026-10-18T00:00:00Z';
      },
    ],
    [
      'unknown field',
      (a: RecoveryApprovalV1) => {
        Object.assign(a.expectedProvenance, { localProof: true });
      },
    ],
  ])('rejects invalid %s authority', (_name, mutate) => {
    const approval = fixture();
    mutate(approval);
    expect(() => selectRecoveryApproval(registry(approval), approval.id, config)).toThrow();
  });
  it('rejects malformed registry versions, unknown keys, duplicate IDs and missing active entries', () => {
    const value = registry();
    for (const invalid of [
      { ...value, version: 2 },
      { ...value, extra: 1 },
      { ...value, backups: [...value.backups, ...value.backups] },
      { ...value, activeBackupId: 'missing' },
      { ...value, repository: 'other/repo' },
    ]) {
      expect(() => selectRecoveryApproval(invalid, 'synthetic-backup', config)).toThrow();
    }
  });
});

const origins = ['.github/workflows/refresh.yml', '.github/workflows/initial-import.yml'];
const initialImport = createInitialImportFixture();
// Recovery consumes only the fixed site and approved policy revision, not the import config.
const initialConfig = { siteUrl, policyRevision: initialImport.config.policy.revision };
function originFixture(workflowPath: string) {
  const approval = fixture();
  approval.expectedProvenance.workflowPath = workflowPath;
  approval.expectedProvenance.identity.policyRevision = initialConfig.policyRevision;
  approval.expectedProvenance.identity.archiveSha256 = INITIAL_SOURCE.archive.sha256;
  approval.expectedProvenance.identity.collectedAt = INITIAL_SOURCE.collectedAt;
  return approval;
}
describe.each(origins)('successful publication origin %s', (workflowPath) => {
  it('admits verified provenance and active backup while retaining historical source dates and publication commits', () => {
    const approval = originFixture(workflowPath);
    const checked = validateRecoveryProvenance(approval.expectedProvenance, initialConfig);
    expect(checked.workflowPath).toBe(workflowPath);
    expect(checked.identity.collectedAt).toBe('2026-10-16T01:52:52.043Z');
    expect(checked.identity.archiveSha256).toBe(INITIAL_SOURCE.archive.sha256);
    expect(checked.sourceCommit).toBe('c'.repeat(40));
    expect(checked.workflowCommit).toBe('d'.repeat(40));
    expect(checked.sourceCommit).not.toBe(initialImport.approval.tagCommit);
    expect(checked.workflowCommit).not.toBe(initialImport.approval.tagCommit);
    expect(selectRecoveryApproval(registry(approval), approval.id, initialConfig)).toEqual(
      approval,
    );
  });
  it.each([
    [
      'failed deployment',
      (a: RecoveryApprovalV1) =>
        Object.assign(a.expectedProvenance, { deploymentOutcome: 'failure' }),
    ],
    [
      'missing deployment outcome',
      (a: RecoveryApprovalV1) => Reflect.deleteProperty(a.expectedProvenance, 'deploymentOutcome'),
    ],
    [
      'missing deployment history',
      (a: RecoveryApprovalV1) => Reflect.deleteProperty(a.expectedProvenance, 'deploymentId'),
    ],
    [
      'absent public verification',
      (a: RecoveryApprovalV1) => Reflect.deleteProperty(a.expectedProvenance, 'publicVerification'),
    ],
    [
      'public release mismatch',
      (a: RecoveryApprovalV1) => {
        a.expectedProvenance.publicVerification.receipt.releaseSha256 = '0'.repeat(64);
      },
    ],
    [
      'public inventory mismatch',
      (a: RecoveryApprovalV1) => {
        a.expectedProvenance.publicVerification.receipt.inventorySha256 = '0'.repeat(64);
      },
    ],
    [
      'public date mismatch',
      (a: RecoveryApprovalV1) => {
        a.expectedProvenance.publicVerification.receipt.checkedAt = '2026-10-17T00:00:00.000Z';
      },
    ],
    [
      'future collection date',
      (a: RecoveryApprovalV1) => {
        a.expectedProvenance.identity.collectedAt = '2026-10-19T00:00:00.000Z';
      },
    ],
    [
      'public receipt hash mismatch',
      (a: RecoveryApprovalV1) => {
        a.expectedProvenance.publicVerification.binding.sha256 = '0'.repeat(64);
      },
    ],
    [
      'public receipt length mismatch',
      (a: RecoveryApprovalV1) => {
        a.expectedProvenance.publicVerification.binding.byteLength += 1;
      },
    ],
    [
      'backup asset hash mismatch',
      (a: RecoveryApprovalV1) => {
        a.assets.snapshot.sha256 = '0'.repeat(64);
      },
    ],
    [
      'source archive as backup asset',
      (a: RecoveryApprovalV1) => {
        Object.assign(a.assets.snapshot, initialImport.approval.assets.archive);
      },
    ],
  ])('rejects %s before backup selection', (_label, mutate) => {
    const approval = originFixture(workflowPath);
    mutate(approval);
    if (
      ['public release mismatch', 'public inventory mismatch', 'public date mismatch'].includes(
        _label,
      )
    ) {
      const bytes = Buffer.from(
        `${JSON.stringify(approval.expectedProvenance.publicVerification.receipt)}\n`,
      );
      approval.expectedProvenance.publicVerification.binding = {
        byteLength: bytes.length,
        sha256: sha256Bytes(bytes),
      };
    }
    expect(() => selectRecoveryApproval(registry(approval), approval.id, initialConfig)).toThrow();
  });
});
describe('closed publication origin authority', () => {
  it.each([
    '.github/workflows/restore.yml',
    '.github/workflows/pull-request.yml',
    '.github/workflows/arbitrary.yml',
    '.github/workflows/initial-import.yml/extra',
  ])('rejects non-publication workflow %s', (workflowPath) => {
    const approval = originFixture(workflowPath);
    expect(() => validateRecoveryProvenance(approval.expectedProvenance, initialConfig)).toThrow();
    expect(() => selectRecoveryApproval(registry(approval), approval.id, initialConfig)).toThrow();
  });
  it('rejects initial-source transport and source registry records as recovery authority', () => {
    const sourceTransportRecord = {
      kind: 'github-release',
      releaseId: initialImport.approval.releaseId,
      tag: initialImport.approval.tag,
      tagCommit: initialImport.approval.tagCommit,
      assets: initialImport.approval.assets,
      downloadedAt: '2026-10-18T00:00:00.000Z',
    };
    expect(() => validateRecoveryProvenance(sourceTransportRecord, initialConfig)).toThrow();
    expect(() => validateRecoveryProvenance(initialImport.approval, initialConfig)).toThrow();
    expect(() =>
      selectRecoveryApproval(initialImport.registry, INITIAL_SOURCE.id, initialConfig),
    ).toThrow();
    expect(() =>
      selectRecoveryApproval(
        { ...registry(), activeBackupId: INITIAL_SOURCE.id, backups: [initialImport.approval] },
        INITIAL_SOURCE.id,
        initialConfig,
      ),
    ).toThrow();
    expect(() => selectRecoveryApproval(registryFile, INITIAL_SOURCE.id, initialConfig)).toThrow();
  });
});
