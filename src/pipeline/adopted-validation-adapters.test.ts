import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Readable } from 'node:stream';
import { afterEach, expect, it, vi } from 'vitest';

const originalArgv = [...process.argv];
const canonical = (value: unknown) =>
  createHash('sha256').update(JSON.stringify(value)).digest('hex');
const digest = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');
const fixture = (name: string) =>
  JSON.parse(readFileSync(new URL(`../../${name}`, import.meta.url), 'utf8'));

afterEach(() => {
  process.argv = [...originalArgv];
  vi.restoreAllMocks();
  vi.resetModules();
  for (const name of ['node:fs', 'node:fs/promises', 'vite']) vi.doUnmock(name);
});

function harness(mode: 'replay' | 'audit') {
  const root = resolve('/synthetic verification/run with spaces');
  const archive = resolve('/synthetic relocated archives/accepted source.zip');
  const archiveBytes = Buffer.from('synthetic archive bytes');
  const acceptedBytes = Buffer.from('accepted bytes');
  const config = fixture('publication/validation-config.json');
  config.baseline.archiveSha256 = digest(archiveBytes);
  Object.assign(config, { maxEntryBytes: 17, maxTotalRows: 3, entryTimeoutMs: 23 });
  const observation = fixture('reports/observation-2026-10-16-bounded-source.json');
  observation.collection.sha256 = digest(archiveBytes);
  observation.collection.byteLength = archiveBytes.length;
  observation.resourceLimits = { maxEntryBytes: 999, maxTotalRows: 999, entryTimeoutMs: 999 };
  const contract = fixture('src/pipeline/contracts/seoul-archive-contract.json');
  const inventory = Array.from({ length: 726 }, (_, index) => ({
    name: `item-${index}.json`,
    sha256: digest(acceptedBytes),
    byteLength: acceptedBytes.length,
  }));
  const receipt = {
    policySha256: canonical(config.policy),
    initialBaselineSha256: canonical(config.baseline),
    artifactInventorySha256: canonical(inventory),
    validationKind: 'accepted',
    publicationApproved: false,
    sourceDataAsOf: null,
    archive: { sha256: digest(archiveBytes), byteLength: archiveBytes.length },
    totalJsonBytes: inventory.length * acceptedBytes.length,
  };
  const diagnostics = [
    { code: 'count_below_minimum', severity: 'rejection' },
    { code: 'empty_refresh', severity: 'rejection' },
    { code: 'count_below_minimum', severity: 'rejection' },
    { code: 'source_coverage_unverified', severity: 'warning' },
  ];
  const captured = new Map<string, string>();
  let archiveReadBytes = archiveBytes;
  let acceptedReadBytes = acceptedBytes;
  let changeAfterStage: 'none' | 'archive' | 'accepted' = 'none';
  let leftover: 'none' | 'candidate' | 'scratch' = 'none';
  let truncated = false;
  let stageReason: string | undefined;
  const read = vi.fn(async (name: string) => {
    const data: Record<string, unknown> = {
      'publication/validation-config.json': config,
      'reports/task-008-validation-policy-proposal-2026-10-16.json': {
        policy: config.policy,
        qa: { policyCanonicalSha256: canonical(config.policy) },
        initialBaselineCandidate: {
          baseline: config.baseline,
          baselineCanonicalSha256: canonical(config.baseline),
        },
      },
      'reports/observation-2026-10-16-bounded-source.json': observation,
      'src/pipeline/contracts/seoul-archive-contract.json': contract,
      'src/pipeline/contracts/reviewed-unverified-pairs-v1.json': config.reviewedUnverifiedPairs,
      'reports/source-permission-manifest-2026-08-28.json': {},
      [`${root}/receipt.json`]: receipt,
      [`${root}/private-file-inventory.json`]: inventory,
      [`${root}/accepted/baseline.json`]: config.baseline,
      [`${root}/accepted/release.json`]: {
        policyRevision: config.policy.revision,
        recordCount: 2951024,
        collectedAt: observation.collection.fetchedAt,
        sourceDataAsOf: null,
        warnings: [{ code: 'source_coverage_unverified', severity: 'warning' }],
      },
    };
    if (!Object.hasOwn(data, name)) throw new Error(`Unexpected fixture read: ${name}`);
    return JSON.stringify(data[name]);
  });
  const stream = vi.fn((name: string) => {
    if (name === archive) return Readable.from([archiveReadBytes]);
    if (name.endsWith('.zip')) throw new Error('Unexpected archive location');
    return Readable.from([
      name.startsWith(`${root}/accepted/`) ? acceptedReadBytes : Buffer.from('implementation'),
    ]);
  });
  const runProcess = vi.fn(async (_options: { maxOutputBytes: number; timeoutMs: number }) => ({
    exitCode: 0,
    truncated,
    stdout: new Uint8Array(),
  }));
  const iterateLicenseCsv = vi.fn(function* (
    _bytes: Uint8Array,
    _entry: unknown,
    remaining: number,
  ) {
    if (remaining < 1) throw new Error('Adopted total row limit exceeded');
    yield { synthetic: true };
  });
  const stage = vi.fn(
    async (
      _input: { collection: { archivePath: string } },
      categories: AsyncIterable<{ rows: Iterable<unknown> }>,
      _output: string,
    ) => {
      let count = 0;
      for await (const category of categories) {
        const rows = [...category.rows];
        if (mode === 'audit') expect(rows).toEqual([]);
        if (mode === 'replay' && ++count === 2) throw new Error('Replay boundary reached');
      }
      if (changeAfterStage === 'archive') archiveReadBytes = Buffer.from('changed archive');
      if (changeAfterStage === 'accepted') acceptedReadBytes = Buffer.from('changed accepted');
      throw new Error(
        stageReason ?? `Publication blocked: ${diagnostics.map((item) => item.code).join(', ')}`,
      );
    },
  );
  const zeroCategory = Object.keys(config.policy.categories).find(
    (id) =>
      config.policy.categories[id].maxAbsoluteCountChange === 0 &&
      config.baseline.metrics.categories[id].recordCount > 0,
  );
  const validateMeasuredRefresh = vi
    .fn()
    .mockReturnValueOnce({ kind: 'accepted' })
    .mockReturnValueOnce({ kind: 'review_required' })
    .mockReturnValueOnce({
      kind: 'rejected',
      diagnostics: [{ code: 'count_change_exceeded', categoryId: zeroCategory }],
    });
  const validateLicenseRefreshV1 = vi.fn(() => ({ kind: 'rejected', diagnostics }));
  const close = vi.fn(async () => {});
  vi.doMock('node:fs', async () => ({
    ...(await vi.importActual('node:fs')),
    createReadStream: stream,
  }));
  vi.doMock('node:fs/promises', () => ({
    readFile: read,
    readdir: vi.fn(async () => [
      'accepted',
      'private-file-inventory.json',
      'receipt.json',
      ...(leftover === 'scratch' ? ['.quality-rejected-scratch'] : []),
    ]),
    writeFile: vi.fn(async (name: string, value: string) => captured.set(name, value)),
    access: vi.fn(async () => {
      if (leftover === 'candidate') return;
      throw Object.assign(new Error('Absent rejected output'), { code: 'ENOENT' });
    }),
  }));
  vi.doMock('vite', () => ({
    createServer: async () => ({
      close,
      ssrLoadModule: async (path: string) => {
        if (path.endsWith('unzip-archive.ts')) return { runProcess, UTF8_UNZIP_OPTIONS: [] };
        if (path.endsWith('parse-license-csv.ts')) return { iterateLicenseCsv };
        if (path.endsWith('stage-bounded-release.ts')) return { stageBoundedRelease: stage };
        if (path.endsWith('validate-license-refresh.ts'))
          return { validateMeasuredRefresh, validateLicenseRefreshV1 };
        throw new Error(`Unexpected module: ${path}`);
      },
    }),
  }));
  vi.spyOn(console, 'log').mockImplementation(() => {});
  const run = async (withArchive = true) => {
    const modulePath = new URL(
      `../../.testagent/${mode === 'replay' ? 'replay-adopted-policy' : 'audit-adopted-release'}.mjs`,
      import.meta.url,
    ).href;
    process.argv = [
      'node',
      modulePath,
      ...(mode === 'replay' ? [archive, root] : [root, ...(withArchive ? [archive] : [])]),
    ];
    await import(modulePath);
  };
  return {
    run,
    config,
    receipt,
    diagnostics,
    runProcess,
    iterateLicenseCsv,
    stage,
    close,
    stream,
    captured,
    validateLicenseRefreshV1,
    archive,
    root,
    truncate: () => {
      truncated = true;
    },
    changeArchive: () => {
      archiveReadBytes = Buffer.from('changed source');
    },
    changeStageReason: () => {
      stageReason = 'Publication blocked: unexpected_rejection';
    },
    changeDuringStage: (target: 'archive' | 'accepted') => {
      changeAfterStage = target;
    },
    leaveOutput: (target: 'candidate' | 'scratch') => {
      leftover = target;
    },
  };
}

it('uses adopted extraction and timeout limits plus the cumulative adopted row budget', async () => {
  const h = harness('replay');
  await expect(h.run()).rejects.toThrow('Replay boundary reached');
  expect(h.runProcess.mock.calls).toHaveLength(2);
  for (const [options] of h.runProcess.mock.calls)
    expect(options).toMatchObject({ maxOutputBytes: 17, timeoutMs: 23 });
  expect(h.iterateLicenseCsv.mock.calls.map((call) => call[2])).toEqual([3, 2]);
  expect(h.captured.size).toBe(0);
  expect(h.close).toHaveBeenCalledOnce();
});

it('rejects a truncated extraction before parsing or accepting replay output', async () => {
  const h = harness('replay');
  h.truncate();
  await expect(h.run()).rejects.toThrow();
  expect(h.runProcess).toHaveBeenCalledOnce();
  expect(h.iterateLicenseCsv).not.toHaveBeenCalled();
  expect(h.captured.size).toBe(0);
  expect(h.close).toHaveBeenCalledOnce();
});

it('rejects cumulative rows crossing the adopted ceiling without historical fallback', async () => {
  const h = harness('replay');
  h.config.maxTotalRows = 1;
  await expect(h.run()).rejects.toThrow('Adopted total row limit exceeded');
  expect(h.iterateLicenseCsv.mock.calls.map((call) => call[2])).toEqual([1, 0]);
  expect(h.captured.size).toBe(0);
});

it.each(
  ['maxEntryBytes', 'maxTotalRows', 'entryTimeoutMs'].flatMap((field) =>
    [0, 1.5].map((value) => ({ field, value })),
  ),
)(
  'rejects invalid adopted $field=$value before extraction instead of using observation defaults',
  async ({ field, value }) => {
    const h = harness('replay');
    h.config[field] = value;
    await expect(h.run()).rejects.toThrow();
    expect(h.runProcess).not.toHaveBeenCalled();
    expect(h.captured.size).toBe(0);
  },
);

it('requires an explicit audit archive before any artifact reads or failure injection', async () => {
  const h = harness('audit');
  await expect(h.run(false)).rejects.toThrow('Usage:');
  expect(h.stream).not.toHaveBeenCalled();
  expect(h.stage).not.toHaveBeenCalled();
  expect(h.captured.size).toBe(0);
});

it('audits a relocated archive and separates rejection reasons from retained warnings', async () => {
  const h = harness('audit');
  await h.run();
  expect(h.stage.mock.calls[0]?.[0].collection.archivePath).toBe(h.archive);
  expect(h.stream.mock.calls.filter(([path]) => path === h.archive)).toHaveLength(2);
  const result = JSON.parse(h.captured.get(`${h.root}/quality-preservation.json`) ?? 'null');
  expect(result.sourceArchive).toEqual(h.receipt.archive);
  expect(result.reasonCodes).toEqual(['count_below_minimum', 'empty_refresh']);
  expect(result.warnings).toEqual([{ code: 'source_coverage_unverified', severity: 'warning' }]);
  expect(result.diagnostics).toEqual(h.diagnostics);
  expect(result.acceptedFilesRehashed).toBe(726);
  expect(result.beforeInventorySha256).toBe(h.receipt.artifactInventorySha256);
  expect(result.afterInventorySha256).toBe(h.receipt.artifactInventorySha256);
  expect(result.rejectedOutputAbsent).toBe(true);
  expect(result.temporaryCandidatesAbsent).toBe(true);
  expect(
    h.stream.mock.calls.filter(([path]) => path.startsWith(`${h.root}/accepted/`)),
  ).toHaveLength(1452);
  expect(h.validateLicenseRefreshV1.mock.calls).toHaveLength(1);
  expect(h.close).toHaveBeenCalledOnce();
});

it.each(['hash', 'size'])(
  'rejects an audit archive %s mismatch before failure injection',
  async (kind) => {
    const h = harness('audit');
    if (kind === 'hash') h.changeArchive();
    else h.receipt.archive.byteLength++;
    await expect(h.run()).rejects.toThrow();
    expect(h.stage).not.toHaveBeenCalled();
    expect(h.captured.size).toBe(0);
  },
);

it('rejects inconsistent stage diagnostics instead of recording a false preservation receipt', async () => {
  const h = harness('audit');
  h.changeStageReason();
  await expect(h.run()).rejects.toThrow();
  expect(h.stage).toHaveBeenCalledOnce();
  expect(h.captured.size).toBe(0);
  expect(h.close).toHaveBeenCalledOnce();
});

it.each(['archive', 'accepted'] as const)(
  'detects %s mutation during failure injection and refuses a preservation receipt',
  async (target) => {
    const h = harness('audit');
    h.changeDuringStage(target);
    await expect(h.run()).rejects.toThrow();
    expect(h.stage).toHaveBeenCalledOnce();
    if (target === 'archive')
      expect(h.stream.mock.calls.filter(([path]) => path === h.archive)).toHaveLength(2);
    expect(h.captured.size).toBe(0);
    expect(h.close).toHaveBeenCalledOnce();
  },
);

it.each(['candidate', 'scratch'] as const)(
  'rejects leftover %s output instead of claiming preservation cleanup',
  async (target) => {
    const h = harness('audit');
    h.leaveOutput(target);
    await expect(h.run()).rejects.toThrow();
    expect(h.stage).toHaveBeenCalledOnce();
    expect(h.captured.size).toBe(0);
    expect(h.close).toHaveBeenCalledOnce();
  },
);
