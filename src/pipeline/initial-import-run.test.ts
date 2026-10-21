import { describe, expect, it } from 'vitest';
import {
  bindInitialImportRun,
  validateInitialImportPreparation,
  validateInitialImportRun,
} from './initial-import-run.js';
import { INITIAL_SOURCE, type InitialPreparationV1 } from './initial-import-types.js';
import { sha256Bytes } from './recovery-types.js';

const context = { sha: 'c'.repeat(40), runId: 31 };
const preparedAt = '2026-10-21T01:00:00.000Z';
const expiresAt = '2026-10-22T01:00:00.000Z';
const binding = { byteLength: 100, sha256: 'a'.repeat(64) };
function preparation(): InitialPreparationV1 {
  return {
    version: 1,
    kind: 'initial-publication-prepared',
    mode: 'hosted',
    sourceId: INITIAL_SOURCE.id,
    operator: {
      commit: context.sha,
      uncommitted: false,
      codeBindings: { 'src/.gitkeep': { byteLength: 0, sha256: sha256Bytes(Buffer.alloc(0)) } },
      runId: context.runId,
    },
    sourceReceipt: { ...binding },
    identity: {
      releaseSha256: '1'.repeat(64),
      manifestSha256: '2'.repeat(64),
      baselineSha256: '3'.repeat(64),
      archiveSha256: INITIAL_SOURCE.archive.sha256,
      collectedAt: INITIAL_SOURCE.collectedAt,
      recordCount: INITIAL_SOURCE.recordCount,
      policyRevision: INITIAL_SOURCE.policyRevision,
      schemaVersion: 2,
      identifierVersion: 1,
      normalizationVersion: 1,
    },
    inventory: { ...binding },
    tar: { ...binding },
    preparedAt,
    expiresAt,
    precondition: { status: 404, releaseSha256: null },
  };
}
const validate = (value: unknown, now = preparedAt) =>
  validateInitialImportRun(value, { ...context, now });
describe('initial import same-run binding', () => {
  it('binds the hosted preparation to the actual positive upload ID and canonical preparation bytes', () => {
    const p = preparation(),
      bound = bindInitialImportRun(p, 12, context);
    expect(bound).toEqual({
      version: 1,
      kind: 'initial-import-run-bound',
      workflowPath: '.github/workflows/initial-import.yml',
      sourceId: INITIAL_SOURCE.id,
      operatorSha: context.sha,
      runId: context.runId,
      candidateArtifactId: 12,
      artifactName: 'github-pages',
      preparationSha256: sha256Bytes(Buffer.from(`${JSON.stringify(p)}\n`)),
      tarSha256: p.tar.sha256,
      inventorySha256: p.inventory.sha256,
      preparedAt,
      expiresAt,
    });
    expect(validate(bound)).toEqual(bound);
    expect(validateInitialImportPreparation(p)).toEqual(p);
  });
  it('admits zero-byte operator code bindings without admitting empty source or artifact records', () => {
    expect(() => bindInitialImportRun(preparation(), 12, context)).not.toThrow();
    for (const field of ['sourceReceipt', 'inventory', 'tar'] as const) {
      const p = preparation();
      p[field].byteLength = 0;
      expect(() => bindInitialImportRun(p, 12, context)).toThrow();
    }
    const p = preparation();
    p.operator.codeBindings['src/.gitkeep'] = { byteLength: -1, sha256: 'a'.repeat(64) };
    expect(() => bindInitialImportRun(p, 12, context)).toThrow();
  });
  it('refuses local preparations even when their tar identity is otherwise valid', () => {
    const p = preparation();
    p.mode = 'local-proof';
    p.operator.runId = null;
    p.precondition = null;
    expect(() => bindInitialImportRun(p, 12, context)).toThrow();
  });
  it('refuses another preparation run or SHA and dirty hosted operator', () => {
    for (const patch of [{ runId: 32 }, { commit: 'd'.repeat(40) }, { uncommitted: true }]) {
      const p = preparation();
      Object.assign(p.operator, patch);
      expect(() => bindInitialImportRun(p, 12, context)).toThrow();
    }
  });
  for (const id of [undefined, null, 0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, '12', NaN])
    it(`refuses missing or nonpositive/noninteger upload ID ${String(id)}`, () => {
      expect(() => bindInitialImportRun(preparation(), id as number, context)).toThrow();
    });
  for (const [label, patch] of [
    ['another run', { runId: 32 }],
    ['another SHA', { operatorSha: 'd'.repeat(40) }],
    ['another source', { sourceId: 'other' }],
    ['another artifact name', { artifactName: 'source-data' }],
    ['another workflow', { workflowPath: '.github/workflows/refresh.yml' }],
    ['local claim', { mode: 'local-proof' }],
    ['unknown field', { unreviewed: true }],
    ['invalid artifact ID', { candidateArtifactId: 0 }],
    ['missing preparation binding', { preparationSha256: undefined }],
    ['service digest masquerading as field', { artifactDigest: 'f'.repeat(64) }],
    ['noncanonical clock', { preparedAt: '2026-10-21T01:00:00Z' }],
    ['forged longer expiry', { expiresAt: '2026-10-23T01:00:00.000Z' }],
    ['forged shorter expiry', { expiresAt: '2026-10-21T02:00:00.000Z' }],
  ] as const)
    it(`rejects bound ${label}`, () =>
      expect(() =>
        validate({ ...bindInitialImportRun(preparation(), 12, context), ...patch }),
      ).toThrow());
  it('accepts actual before-expiry time and refuses at and after expiry and before preparation', () => {
    const bound = bindInitialImportRun(preparation(), 12, context);
    expect(validate(bound, '2026-10-22T00:59:59.999Z')).toEqual(bound);
    for (const now of [
      expiresAt,
      '2026-10-22T01:00:00.001Z',
      '2026-10-21T00:59:59.999Z',
      '2026-10-21T01:00:00Z',
    ])
      expect(() => validate(bound, now)).toThrow();
  });
  it('refuses main advancement and malformed current GitHub context', () => {
    const bound = bindInitialImportRun(preparation(), 12, context);
    for (const changed of [
      { sha: 'd'.repeat(40), runId: 31 },
      { sha: context.sha, runId: 32 },
      { sha: '', runId: 31 },
      { sha: context.sha, runId: 0 },
    ])
      expect(() => validateInitialImportRun(bound, { ...changed, now: preparedAt })).toThrow();
  });
  it('rejects nonexact preparation shapes, source identity, expiry and operator bindings', () => {
    for (const mutate of [
      (p: InitialPreparationV1) => Object.assign(p, { extra: true }),
      (p: InitialPreparationV1) => {
        p.sourceId = 'other';
      },
      (p: InitialPreparationV1) => {
        p.expiresAt = '2026-10-23T01:00:00.000Z';
      },
      (p: InitialPreparationV1) => {
        p.identity.archiveSha256 = 'b'.repeat(64);
      },
      (p: InitialPreparationV1) => Object.assign(p.operator, { extra: true }),
      (p: InitialPreparationV1) => Object.assign(p.tar, { artifactId: 12 }),
      (p: InitialPreparationV1) => {
        p.precondition = { status: 200, releaseSha256: null } as never;
      },
      (p: InitialPreparationV1) => {
        p.operator.codeBindings = {};
      },
    ]) {
      const p = preparation();
      mutate(p);
      expect(() => bindInitialImportRun(p, 12, context)).toThrow();
    }
  });
  it('caps bound JSON at the existing provenance limit and rejects custom serialization', () => {
    const bound = bindInitialImportRun(preparation(), 12, context);
    expect(() => validate({ ...bound, extra: 'x'.repeat(65536) })).toThrow();
    expect(() => validate(Object.assign(Object.create({ toJSON: () => bound }), bound))).toThrow();
  });
});
