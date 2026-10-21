import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createInitialImportFixture } from '../../tests/fixtures/initial-import.js';
import {
  selectInitialSourceApproval,
  validateInitialImportConfig,
  validateInitialSourceApproval,
} from './initial-import-approval.js';
import {
  INITIAL_SOURCE,
  type InitialImportConfigV1,
  type InitialImportRegistryV1,
  type InitialSourceApprovalV1,
} from './initial-import-types.js';
import { sha256Bytes } from './recovery-types.js';

// TASK-009 II-01: real approved quality/observation, synthetic transport IDs only.
// Update only after an explicitly approved source/quality contract change.
const canonicalSha = (value: unknown) => sha256Bytes(Buffer.from(JSON.stringify(value)));
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error('Missing approved fixture value');
  return value;
}
beforeEach(() => {
  vi.stubGlobal('fetch', () => {
    throw new Error('Real network is forbidden in initial-import authority tests');
  });
});
afterEach(() => vi.unstubAllGlobals());

describe('initial import authority', () => {
  it('pins the complete selected source and freezes nested authority constants', () => {
    const { approval, observation } = createInitialImportFixture();
    expect(INITIAL_SOURCE).toMatchObject({
      id: 'seoul-2026-10-16-initial',
      purpose: 'initial-publication-recovery-verification',
      archive: {
        byteLength: 217307219,
        sha256: 'c90758c2d3922e78d636ab2c9967b80c690bdcd8aeca283cf9f6ecc2cc992352',
      },
      observation: {
        byteLength: 356005,
        sha256: '3d23a3c770b24039a6690f2db8022eb610ffb5b56a9efee031f78b78918b4626',
      },
      collectionCanonicalSha256: '3817b6e8d7621c12c7ce4a3b5ae8c581c28340284ec001737900a2744d6ac22b',
      collectedAt: '2026-10-16T01:52:52.043Z',
      sourceDataAsOf: null,
      categoryCount: 195,
      recordCount: 2951024,
      schemaManifestSha256: '6254a2b3d6626c41f625bb98d79399bdd40318632ce0d54561a997fdd039ceb6',
      policyRevision: 'task-008-calibration-2026-10-16-v1-proposed',
      policyCanonicalSha256: '090973f79398f45d52262958e2887497652cec13b4d95b608eb84c691070feff',
      baselineCanonicalSha256: '9234ed3297166a08b500356ac01f5bcd150276c04a2bdd129d399fa0bdc6b183',
      reviewedPairsCanonicalSha256:
        'd698ac34c7485c9e09dfec425a0195bcc56d9644f25479aefc350c5969998cb2',
      tag: 'initial-source-seoul-2026-10-16',
      assetNames: {
        archive: 'seoul-source-2026-10-16.zip',
        observation: 'source-observation.json',
      },
    });
    for (const value of [
      INITIAL_SOURCE,
      INITIAL_SOURCE.archive,
      INITIAL_SOURCE.observation,
      INITIAL_SOURCE.assetNames,
    ]) {
      expect(Object.isFrozen(value)).toBe(true);
    }
    expect(canonicalSha((observation as { collection: unknown }).collection)).toBe(
      approval.collectionCanonicalSha256,
    );
    const observationBytes = readFileSync(
      new URL('../../reports/observation-2026-10-16-bounded-source.json', import.meta.url),
    );
    expect(observationBytes.length).toBe(approval.observation.byteLength);
    expect(sha256Bytes(observationBytes)).toBe(approval.observation.sha256);
  });

  it('accepts the exact approved config and returns an isolated copy with all zero-change limits', () => {
    const { config } = createInitialImportFixture();
    const checked = validateInitialImportConfig(config);
    expect(checked).toEqual(config);
    expect(checked).not.toBe(config);
    expect(checked.policy.allowedEmptyCategories).toHaveLength(23);
    expect(canonicalSha(checked.policy)).toBe(INITIAL_SOURCE.policyCanonicalSha256);
    expect(canonicalSha(checked.baseline)).toBe(INITIAL_SOURCE.baselineCanonicalSha256);
    expect(canonicalSha(checked.reviewedUnverifiedPairs)).toBe(
      INITIAL_SOURCE.reviewedPairsCanonicalSha256,
    );
    expect(checked.policy.categories['15045103']?.maxAbsoluteCountChange).toBe(0);
    required(checked.policy.categories['15045103']).maxAbsoluteCountChange = 1;
    expect(config.policy.categories['15045103']?.maxAbsoluteCountChange).toBe(0);
  });

  it('uses Node numeric serialization identity for approved object hashes', () => {
    const { config } = createInitialImportFixture();
    const serialized = JSON.stringify(config).replace(
      '"maxAbsoluteCountChange":0',
      '"maxAbsoluteCountChange":0.0',
    );
    expect(serialized).not.toBe(JSON.stringify(config));
    expect(validateInitialImportConfig(JSON.parse(serialized))).toEqual(config);
  });

  it.each([
    [
      'policy limit',
      (c: InitialImportConfigV1) => {
        required(c.policy.categories['15045103']).maxAbsoluteCountChange = 1;
      },
    ],
    [
      'policy revision',
      (c: InitialImportConfigV1) => {
        c.policy.revision += '-changed';
      },
    ],
    [
      'empty-category IDs',
      (c: InitialImportConfigV1) => {
        c.policy.allowedEmptyCategories.pop();
      },
    ],
    [
      'baseline',
      (c: InitialImportConfigV1) => {
        c.baseline.metrics.total.recordCount++;
      },
    ],
    [
      'baseline date',
      (c: InitialImportConfigV1) => {
        c.baseline.dataAsOf = '2026-10-21';
      },
    ],
    [
      'reviewed pair',
      (c: InitialImportConfigV1) => {
        required(c.reviewedUnverifiedPairs.pairs[0]).name += 'changed';
      },
    ],
    [
      'JSON byte cap',
      (c: InitialImportConfigV1) => {
        c.policy.maxJsonBytes++;
      },
    ],
    [
      'entry byte cap',
      (c: InitialImportConfigV1) => {
        c.maxEntryBytes++;
      },
    ],
    [
      'row cap',
      (c: InitialImportConfigV1) => {
        c.maxTotalRows++;
      },
    ],
    [
      'entry timeout',
      (c: InitialImportConfigV1) => {
        c.entryTimeoutMs++;
      },
    ],
    [
      'descriptor URL',
      (c: InitialImportConfigV1) => {
        c.previousReleaseUrl += '?other';
      },
    ],
    [
      'extra config field',
      (c: InitialImportConfigV1) => {
        Object.assign(c, { extra: true });
      },
    ],
    [
      'missing config field',
      (c: InitialImportConfigV1) => {
        Reflect.deleteProperty(c, 'entryTimeoutMs');
      },
    ],
    [
      'nested extra undefined',
      (c: InitialImportConfigV1) => {
        Object.assign(c.policy, { extra: undefined });
      },
    ],
    [
      'array custom JSON serialization',
      (c: InitialImportConfigV1) => {
        const original = [...c.policy.allowedEmptyCategories];
        c.policy.allowedEmptyCategories.pop();
        Object.setPrototypeOf(c.policy.allowedEmptyCategories, { toJSON: () => original });
      },
    ],
    [
      'custom JSON serialization',
      (c: InitialImportConfigV1) => {
        const original = structuredClone(c.policy);
        Object.assign(c.policy, { toJSON: () => original });
      },
    ],
  ])('rejects altered %s without accepting revision-only authority', (_name, mutate) => {
    const config = createInitialImportFixture().config;
    mutate(config);
    expect(() => validateInitialImportConfig(config)).toThrow();
  });

  it('selects only the exact active source and isolates the validated approval', () => {
    const { config, registry, approval } = createInitialImportFixture();
    expect(validateInitialSourceApproval(approval)).toEqual(approval);
    const selected = selectInitialSourceApproval(registry, INITIAL_SOURCE.id, config);
    expect(selected).toEqual(approval);
    selected.assets.archive.id = 999;
    expect(registry.sources[0]?.assets.archive.id).toBe(102);
  });

  it('accepts positive safe integer transport boundaries without inventing identities', () => {
    const { approval } = createInitialImportFixture();
    approval.releaseId = Number.MAX_SAFE_INTEGER;
    approval.assets.archive.id = 1;
    approval.assets.observation.id = Number.MAX_SAFE_INTEGER;
    expect(validateInitialSourceApproval(approval)).toEqual(approval);
  });

  it.each([
    ['null', null],
    ['array', []],
    ['string', 'source'],
    ['number', 1],
    ['undefined', undefined],
  ])('rejects non-record authority input %s', (_name, value) => {
    expect(() => validateInitialImportConfig(value)).toThrow();
    expect(() => validateInitialSourceApproval(value)).toThrow();
    expect(() =>
      selectInitialSourceApproval(value, INITIAL_SOURCE.id, createInitialImportFixture().config),
    ).toThrow();
  });

  it('keeps production authority inactive and both approved files byte-for-byte unchanged', () => {
    const root = new URL('../../publication/', import.meta.url);
    const registry = JSON.parse(
      readFileSync(new URL('initial-import-approvals.json', root), 'utf8'),
    );
    expect(registry).toEqual({
      version: 1,
      kind: 'initial-source-approvals',
      repository: 'internalforces/open-store-searcher',
      siteUrl: 'https://internalforces.github.io/open-store-searcher/',
      activeSourceId: null,
      sources: [],
    });
    expect(() =>
      selectInitialSourceApproval(registry, INITIAL_SOURCE.id, createInitialImportFixture().config),
    ).toThrow();
    expect(sha256Bytes(readFileSync(new URL('config.json', root)))).toBe(
      'b7a64b46c49ad6d3ab10ba268becb6e62bb666d342bc4aa158898a37ac1e20ba',
    );
    expect(sha256Bytes(readFileSync(new URL('validation-config.json', root)))).toBe(
      'f3feafd8d37d30e859b7797fe753277d2091cb7383009e035dff60edb76987f1',
    );
  });

  it.each([
    [
      'inactive source',
      (r: InitialImportRegistryV1) => {
        r.activeSourceId = null;
      },
    ],
    [
      'unknown active source',
      (r: InitialImportRegistryV1) => {
        r.activeSourceId = 'other';
      },
    ],
    [
      'unsafe active source',
      (r: InitialImportRegistryV1) => {
        r.activeSourceId = '../source';
      },
    ],
    [
      'duplicate sources',
      (r: InitialImportRegistryV1) => {
        r.sources.push(structuredClone(required(r.sources[0])));
      },
    ],
    [
      'empty sources',
      (r: InitialImportRegistryV1) => {
        r.sources = [];
      },
    ],
    [
      'wrong repository',
      (r: InitialImportRegistryV1) => {
        r.repository = 'other/repo';
      },
    ],
    [
      'wrong site',
      (r: InitialImportRegistryV1) => {
        r.siteUrl = 'https://example.com/';
      },
    ],
    [
      'wrong kind',
      (r: InitialImportRegistryV1) => {
        Object.assign(r, { kind: 'publication-recovery-approvals' });
      },
    ],
    [
      'wrong version',
      (r: InitialImportRegistryV1) => {
        Object.assign(r, { version: 2 });
      },
    ],
    [
      'extra registry field',
      (r: InitialImportRegistryV1) => {
        Object.assign(r, { extra: null });
      },
    ],
    [
      'missing registry field',
      (r: InitialImportRegistryV1) => {
        Reflect.deleteProperty(r, 'activeSourceId');
      },
    ],
  ])('rejects %s before source selection', (_name, mutate) => {
    const { config, registry } = createInitialImportFixture();
    mutate(registry);
    expect(() => selectInitialSourceApproval(registry, INITIAL_SOURCE.id, config)).toThrow();
  });

  it('rejects an unknown requested source and a changed config even with valid registry authority', () => {
    const { config, registry } = createInitialImportFixture();
    expect(() => selectInitialSourceApproval(registry, '../source', config)).toThrow();
    config.policy.total.maxCount++;
    expect(() => selectInitialSourceApproval(registry, INITIAL_SOURCE.id, config)).toThrow();
  });

  it.each([
    [
      'source ID',
      (a: InitialSourceApprovalV1) => {
        a.id = 'other';
      },
    ],
    [
      'unsafe source ID',
      (a: InitialSourceApprovalV1) => {
        a.id = '../source';
      },
    ],
    [
      'purpose',
      (a: InitialSourceApprovalV1) => {
        a.purpose = 'daily';
      },
    ],
    [
      'collection date',
      (a: InitialSourceApprovalV1) => {
        a.collectedAt = '2026-10-21T00:00:00.000Z';
      },
    ],
    [
      'source coverage',
      (a: InitialSourceApprovalV1) => {
        Object.assign(a, { sourceDataAsOf: '2026-10-16' });
      },
    ],
    [
      'record count',
      (a: InitialSourceApprovalV1) => {
        a.recordCount++;
      },
    ],
    [
      'category count',
      (a: InitialSourceApprovalV1) => {
        a.categoryCount--;
      },
    ],
    [
      'archive hash',
      (a: InitialSourceApprovalV1) => {
        a.archive.sha256 = 'a'.repeat(64);
      },
    ],
    [
      'archive length',
      (a: InitialSourceApprovalV1) => {
        a.archive.byteLength++;
      },
    ],
    [
      'observation hash',
      (a: InitialSourceApprovalV1) => {
        a.observation.sha256 = 'a'.repeat(64);
      },
    ],
    [
      'observation length',
      (a: InitialSourceApprovalV1) => {
        a.observation.byteLength++;
      },
    ],
    [
      'collection hash',
      (a: InitialSourceApprovalV1) => {
        a.collectionCanonicalSha256 = 'a'.repeat(64);
      },
    ],
    [
      'schema hash',
      (a: InitialSourceApprovalV1) => {
        a.schemaManifestSha256 = 'a'.repeat(64);
      },
    ],
    [
      'policy revision',
      (a: InitialSourceApprovalV1) => {
        a.policyRevision += '-changed';
      },
    ],
    [
      'policy hash',
      (a: InitialSourceApprovalV1) => {
        a.policyCanonicalSha256 = 'a'.repeat(64);
      },
    ],
    [
      'baseline hash',
      (a: InitialSourceApprovalV1) => {
        a.baselineCanonicalSha256 = 'a'.repeat(64);
      },
    ],
    [
      'reviewed-pairs hash',
      (a: InitialSourceApprovalV1) => {
        a.reviewedPairsCanonicalSha256 = 'a'.repeat(64);
      },
    ],
    [
      'tag',
      (a: InitialSourceApprovalV1) => {
        a.tag += '-other';
      },
    ],
    [
      'tag target',
      (a: InitialSourceApprovalV1) => {
        a.tagCommit = 'A'.repeat(40);
      },
    ],
    [
      'short tag target',
      (a: InitialSourceApprovalV1) => {
        a.tagCommit = 'a'.repeat(39);
      },
    ],
    [
      'negative release ID',
      (a: InitialSourceApprovalV1) => {
        a.releaseId = -1;
      },
    ],
    [
      'string release ID',
      (a: InitialSourceApprovalV1) => {
        Object.assign(a, { releaseId: '101' });
      },
    ],
    [
      'nonfinite release ID',
      (a: InitialSourceApprovalV1) => {
        a.releaseId = Infinity;
      },
    ],
    [
      'zero release ID',
      (a: InitialSourceApprovalV1) => {
        a.releaseId = 0;
      },
    ],
    [
      'unsafe release ID',
      (a: InitialSourceApprovalV1) => {
        a.releaseId = Number.MAX_SAFE_INTEGER + 1;
      },
    ],
    [
      'fractional release ID',
      (a: InitialSourceApprovalV1) => {
        a.releaseId = 1.5;
      },
    ],
    [
      'duplicate asset IDs',
      (a: InitialSourceApprovalV1) => {
        a.assets.observation.id = a.assets.archive.id;
      },
    ],
    [
      'negative asset ID',
      (a: InitialSourceApprovalV1) => {
        a.assets.observation.id = -1;
      },
    ],
    [
      'string asset ID',
      (a: InitialSourceApprovalV1) => {
        Object.assign(a.assets.observation, { id: '103' });
      },
    ],
    [
      'nonfinite asset ID',
      (a: InitialSourceApprovalV1) => {
        a.assets.observation.id = NaN;
      },
    ],
    [
      'zero asset ID',
      (a: InitialSourceApprovalV1) => {
        a.assets.archive.id = 0;
      },
    ],
    [
      'unsafe asset ID',
      (a: InitialSourceApprovalV1) => {
        a.assets.observation.id = Number.MAX_SAFE_INTEGER + 1;
      },
    ],
    [
      'fractional asset ID',
      (a: InitialSourceApprovalV1) => {
        a.assets.archive.id = 1.5;
      },
    ],
    [
      'archive asset name',
      (a: InitialSourceApprovalV1) => {
        a.assets.archive.name = 'source-observation.json';
      },
    ],
    [
      'observation asset name',
      (a: InitialSourceApprovalV1) => {
        a.assets.observation.name = '../source-observation.json';
      },
    ],
    [
      'asset hash',
      (a: InitialSourceApprovalV1) => {
        a.assets.archive.sha256 = 'f'.repeat(64);
      },
    ],
    [
      'asset length',
      (a: InitialSourceApprovalV1) => {
        a.assets.observation.byteLength++;
      },
    ],
    [
      'extra approval field',
      (a: InitialSourceApprovalV1) => {
        Object.assign(a, { extra: true });
      },
    ],
    [
      'extra binding field',
      (a: InitialSourceApprovalV1) => {
        Object.assign(a.archive, { extra: true });
      },
    ],
    [
      'extra asset field',
      (a: InitialSourceApprovalV1) => {
        Object.assign(a.assets.observation, { extra: true });
      },
    ],
    [
      'extra asset role',
      (a: InitialSourceApprovalV1) => {
        Object.assign(a.assets, { extra: a.assets.archive });
      },
    ],
    [
      'missing approval field',
      (a: InitialSourceApprovalV1) => {
        Reflect.deleteProperty(a, 'purpose');
      },
    ],
  ])('rejects altered approval %s', (_name, mutate) => {
    const { config, registry, approval } = createInitialImportFixture();
    mutate(approval);
    registry.sources = [approval];
    expect(() => validateInitialSourceApproval(approval)).toThrow();
    expect(() => selectInitialSourceApproval(registry, INITIAL_SOURCE.id, config)).toThrow();
  });
});
