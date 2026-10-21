import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import * as fs from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import type { ArchiveContractEntry } from './archive-contract.js';
import type { StagedLicenseRowV1 } from './transform-license-records.js';
import { afterEach, expect, it, vi } from 'vitest';
import { createInitialImportFixture } from '../../tests/fixtures/initial-import.js';
import { INITIAL_SOURCE, type InitialOperatorV1 } from './initial-import-types.js';
import type { BoundedInput, CategoryRows } from './stage-bounded-release.js';
import { validateMeasuredRefresh } from './validate-license-refresh.js';

const observationBytes = readFileSync(
  new URL('../../reports/observation-2026-10-16-bounded-source.json', import.meta.url),
);
const contract = JSON.parse(
  readFileSync(new URL('./contracts/seoul-archive-contract.json', import.meta.url), 'utf8'),
);
const permission = JSON.parse(
  readFileSync(
    new URL('../../reports/source-permission-manifest-2026-08-28.json', import.meta.url),
    'utf8',
  ),
);
const clock = '2026-10-23T15:00:00.000Z';
const operator: InitialOperatorV1 = {
  commit: 'a'.repeat(40),
  uncommitted: true,
  codeBindings: {
    'src/pipeline/stage-initial-source.ts': { byteLength: 12, sha256: 'b'.repeat(64) },
  },
  runId: null,
};
const roots: string[] = [];

afterEach(async () => {
  vi.restoreAllMocks();
  vi.resetModules();
  for (const name of [
    'node:crypto',
    'node:fs/promises',
    './inspect-archive.js',
    './unzip-archive.js',
    './parse-license-csv.js',
    './stage-bounded-release.js',
  ])
    vi.doUnmock(name);
  for (const root of roots.splice(0)) await fs.rm(root, { recursive: true, force: true });
});

it('admits only exact observation bytes and retains historical provider evidence with caller path', async () => {
  const { readInitialObservation } = await import('./stage-initial-source.js');
  const collection = readInitialObservation(observationBytes, '/relocated/source.zip');
  expect(collection).toEqual({
    ...JSON.parse(observationBytes.toString()).collection,
    archivePath: '/relocated/source.zip',
  });
  expect(collection.fetchedAt).toBe('2026-10-16T01:52:52.043Z');
});

it.each(['utf8', 'json', 'date', 'policy'] as const)(
  'rejects altered observation %s binding',
  async (change) => {
    const { readInitialObservation } = await import('./stage-initial-source.js');
    const value = JSON.parse(observationBytes.toString());
    let bytes: Uint8Array;
    if (change === 'utf8')
      bytes = Buffer.concat([observationBytes.subarray(0, -1), Buffer.from([255])]);
    else if (change === 'json') bytes = Buffer.from('{');
    else {
      if (change === 'date') value.collection.fetchedAt = clock;
      else value.validation.policyRevision = 'replacement-policy';
      bytes = Buffer.from(JSON.stringify(value));
    }
    expect(() => readInitialObservation(bytes, '/source.zip')).toThrow();
  },
);

it('uses the actual validator for the Seoul seven-day boundary and zero-change rejection', async () => {
  const { readInitialObservation } = await import('./stage-initial-source.js');
  const { config } = createInitialImportFixture();
  const input = {
    ...config,
    dateBasis: 'collection' as const,
    collection: readInitialObservation(observationBytes, '/source.zip'),
    archiveContract: contract,
    permissionManifest: permission,
    now: clock,
  };
  const warningsAt = (now: string) => {
    const result = validateMeasuredRefresh({ ...input, now }, () => ({
      candidate: true,
      metrics: structuredClone(config.baseline.metrics),
    }));
    expect(result.kind).toBe('accepted');
    return result.diagnostics.map((item) => item.code);
  };
  expect(warningsAt('2026-10-22T14:59:59.999Z')).not.toContain('collection_stale');
  expect(warningsAt('2026-10-22T15:00:00.000Z')).toContain('collection_stale');
  expect(warningsAt(clock)).toContain('source_coverage_unverified');
  const metrics = structuredClone(config.baseline.metrics);
  const categoryId = Object.keys(config.policy.categories).find(
    (id) =>
      config.policy.categories[id]?.maxAbsoluteCountChange === 0 &&
      (metrics.categories[id]?.recordCount ?? 0) > 0,
  );
  expect(categoryId).toBeDefined();
  const category = metrics.categories[categoryId ?? ''];
  if (!category) throw new Error('Missing zero-change fixture');
  category.recordCount++;
  category.statusCounts['행정상 영업']++;
  metrics.total.recordCount++;
  metrics.total.statusCounts['행정상 영업']++;
  const pair = category.aggregatePairs[0];
  if (!pair) throw new Error('Missing aggregate pair');
  pair.count++;
  const totalPair = metrics.total.aggregatePairs.find(
    (item) => item.code === pair.code && item.name === pair.name,
  );
  if (!totalPair) throw new Error('Missing total pair');
  totalPair.count++;
  const result = validateMeasuredRefresh(input, () => ({ candidate: true, metrics }));
  expect(result.kind).toBe('rejected');
  expect(result.diagnostics).toContainEqual(
    expect.objectContaining({ code: 'count_change_exceeded', categoryId }),
  );
});

/** Trusted disk/hash/process seams exercise orchestration, never claim original ZIP acceptance. */
async function harness(realArchiveIo = false) {
  const root = await fs.realpath(await fs.mkdtemp(join(tmpdir(), 'initial-stage-')));
  roots.push(root);
  const archivePath = join(root, 'input.zip');
  const observationPath = join(root, 'observation.json');
  if (realArchiveIo) {
    const file = await fs.open(archivePath, 'wx');
    try {
      await file.truncate(INITIAL_SOURCE.archive.byteLength);
    } finally {
      await file.close();
    }
  } else await fs.writeFile(archivePath, 'test-owned virtual ZIP');
  await fs.writeFile(observationPath, observationBytes);
  await fs.mkdir(join(root, 'unrelated'));
  await fs.writeFile(join(root, 'unrelated', 'keep'), 'keep');
  const { config } = createInitialImportFixture();
  let changed = false;
  let snapshotChanged = false;
  let environment = true;
  let extractFailure = false;
  let consumed = 0;
  let rowLimit = false;
  const fetcher = vi
    .spyOn(globalThis, 'fetch')
    .mockRejectedValue(new Error('Unexpected live request'));
  const chunk = Buffer.alloc(1024 * 1024);
  const tail = Buffer.alloc(INITIAL_SOURCE.archive.byteLength % chunk.length);
  const isArchive = (path: string) => path.endsWith('.zip');
  const statProxy = (stat: Awaited<ReturnType<typeof fs.lstat>>) =>
    new Proxy(stat, {
      get(target, key) {
        return key === 'size' && target.isFile()
          ? INITIAL_SOURCE.archive.byteLength
          : Reflect.get(target, key);
      },
    });
  vi.doMock('node:crypto', () => ({
    createHash: (...args: Parameters<typeof createHash>) => {
      const real = createHash(...args);
      let archive = false;
      return {
        update(bytes: string | Uint8Array) {
          if (
            bytes === chunk ||
            bytes === tail ||
            (realArchiveIo && bytes instanceof Uint8Array && bytes[0] === 0)
          )
            archive = true;
          else real.update(bytes);
          return this;
        },
        digest(encoding: 'hex') {
          return archive ? INITIAL_SOURCE.archive.sha256 : real.digest(encoding);
        },
      };
    },
  }));
  vi.doMock('node:fs/promises', () => ({
    ...fs,
    lstat: async (path: string) =>
      isArchive(path) && !realArchiveIo ? statProxy(await fs.lstat(path)) : fs.lstat(path),
    open: async (
      path: string,
      ...args: Parameters<typeof fs.open> extends [unknown, ...infer R] ? R : never
    ) => {
      const handle = await fs.open(path, ...args);
      if (!isArchive(path) || realArchiveIo) return handle;
      return new Proxy(handle, {
        get(target, key) {
          if (key === 'stat') return async () => statProxy(await target.stat());
          if (key === 'writeFile') return async () => {};
          if (key === 'createReadStream')
            return () =>
              Readable.from(
                (async function* () {
                  if (
                    (changed && path === archivePath) ||
                    (snapshotChanged && path !== archivePath)
                  ) {
                    yield Buffer.from('changed');
                    return;
                  }
                  for (
                    let offset = 0;
                    offset + chunk.length <= INITIAL_SOURCE.archive.byteLength;
                    offset += chunk.length
                  )
                    yield chunk;
                  yield tail;
                })(),
              );
          const value = Reflect.get(target, key);
          return typeof value === 'function' ? value.bind(target) : value;
        },
      });
    },
  }));
  const inspect = vi.fn(async (_options: unknown) => ({
    kind: 'accepted' as const,
    evidence: JSON.parse(observationBytes.toString()).collection.archiveEvidence,
  }));
  const extract = vi.fn(async (_options: unknown) => ({
    exitCode: 0,
    truncated: extractFailure,
    stdout: new Uint8Array(),
    stderr: new Uint8Array(),
  }));
  const checkEnvironment = vi.fn(async () => ({ ok: environment }));
  vi.doMock('./inspect-archive.js', () => ({ inspectArchive: inspect }));
  vi.doMock('./unzip-archive.js', () => ({
    UTF8_UNZIP_OPTIONS: ['-O', 'UTF-8'],
    runProcess: extract,
    UnzipArchiveAdapter: class {
      checkEnvironment = checkEnvironment;
    },
  }));
  const row = {} as StagedLicenseRowV1;
  const parse = vi.fn(function* (
    _bytes: Uint8Array,
    entry: ArchiveContractEntry,
    remaining: number,
  ) {
    const count = rowLimit
      ? remaining + 1
      : (config.baseline.metrics.categories[entry.fileDataId]?.recordCount ?? 0);
    for (let index = 0; index < count; index++) yield row;
  });
  vi.doMock('./parse-license-csv.js', () => ({ iterateLicenseCsv: parse }));
  const stage = vi.fn(
    async (_input: BoundedInput, categories: AsyncIterable<CategoryRows>, output: string) => {
      for await (const category of categories) {
        consumed++;
        for (const _row of category.rows) {
          /* Consume every yielded row. */
        }
      }
      await fs.mkdir(output);
      return {
        outputDirectory: output,
        files: [],
        metrics: structuredClone(config.baseline.metrics),
      };
    },
  );
  vi.doMock('./stage-bounded-release.js', () => ({ stageBoundedRelease: stage }));
  const { stageInitialSource } = await import('./stage-initial-source.js');
  const output = join(root, 'accepted');
  const run = (paths: { archivePath?: string; observationPath?: string } = {}) =>
    stageInitialSource(
      config,
      { archivePath, observationPath, ...paths, transport: { kind: 'local-proof' } },
      output,
      { now: clock, operator },
    );
  const clean = async () => {
    expect(fetcher).not.toHaveBeenCalled();
    expect((await fs.readdir(root)).sort()).toEqual(['input.zip', 'observation.json', 'unrelated']);
    expect(await fs.readFile(join(root, 'unrelated', 'keep'), 'utf8')).toBe('keep');
  };
  return {
    root,
    output,
    fetcher,
    stageInitialSource,
    config,
    archivePath,
    observationPath,
    run,
    clean,
    stage,
    inspect,
    extract,
    parse,
    checkEnvironment,
    consumed: () => consumed,
    mutate: () => {
      changed = true;
    },
    mutateSnapshot: () => {
      snapshotChanged = true;
    },
    denyEnvironment: () => {
      environment = false;
    },
    truncate: () => {
      extractFailure = true;
    },
    overflowRows: () => {
      rowLimit = true;
    },
  };
}

it('wires unchanged approved inputs, fresh inspection, bounded all-category extraction and historical dates before receipt promotion', async () => {
  const h = await harness();
  const before = JSON.stringify(h.config);
  const result = await h.run();
  const input = h.stage.mock.calls[0]?.[0];
  expect(input?.baseline).toEqual(h.config.baseline);
  expect(input?.policy).toEqual(h.config.policy);
  expect(input?.reviewedUnverifiedPairs).toEqual(h.config.reviewedUnverifiedPairs);
  expect(input?.now).toBe(clock);
  expect(input?.collection.fetchedAt).toBe('2026-10-16T01:52:52.043Z');
  expect(h.checkEnvironment).toHaveBeenCalledOnce();
  expect(h.inspect).toHaveBeenCalledWith(
    expect.objectContaining({
      archivePath: input?.collection.kind === 'accepted' ? input.collection.archivePath : '',
      contract,
      permissionManifest: permission,
    }),
  );
  expect(h.consumed()).toBe(195);
  expect(h.extract).toHaveBeenCalledTimes(195);
  expect(h.extract.mock.calls[0]).toEqual([
    expect.objectContaining({
      executable: 'unzip',
      args: ['-O', 'UTF-8', '-p', expect.stringContaining('.zip'), contract.entries[0].entryName],
      maxOutputBytes: 536870912,
      timeoutMs: 120000,
    }),
  ]);
  expect(h.parse.mock.calls.slice(0, 2).map((call) => call[2])).toEqual([3000000, 2999070]);
  expect(h.parse.mock.calls.at(-1)?.[2]).toBe(
    3000000 -
      2951024 +
      (h.config.baseline.metrics.categories[contract.entries.at(-1).fileDataId]?.recordCount ?? 0),
  );
  expect(result.metrics).toEqual(h.config.baseline.metrics);
  expect(result.stageDirectory).toBe(h.output);
  expect(result.receipt).toMatchObject({
    mode: 'local-proof',
    collectedAt: '2026-10-16T01:52:52.043Z',
    sourceDataAsOf: null,
    validationNow: clock,
    operator,
    transport: { kind: 'local-proof' },
  });
  expect(result.receipt.warnings.map((item) => item.code)).toEqual(
    expect.arrayContaining(['source_coverage_unverified', 'collection_stale']),
  );
  expect(
    JSON.parse(await fs.readFile(join(h.output, 'source-import-receipt.json'), 'utf8')),
  ).toEqual(result.receipt);
  expect(await fs.readdir(h.output)).toEqual(['source-import-receipt.json']);
  expect((await fs.readdir(h.root)).sort()).toEqual([
    'accepted',
    'input.zip',
    'observation.json',
    'unrelated',
  ]);
  expect(JSON.stringify(h.config)).toBe(before);
  expect(h.fetcher).not.toHaveBeenCalled();
});

it.each(['archive', 'observation', 'ancestor'] as const)(
  'rejects %s symlinks without consuming or deleting inputs',
  async (target) => {
    const h = await harness();
    if (target === 'ancestor') {
      const directory = join(h.root, 'linked');
      await fs.mkdir(join(h.root, 'real'));
      await fs.rename(h.archivePath, join(h.root, 'real', 'input.zip'));
      await fs.symlink(join(h.root, 'real'), directory);
      await expect(h.run({ archivePath: join(directory, 'input.zip') })).rejects.toThrow(
        'unsafe path ancestor',
      );
      expect(h.stage).not.toHaveBeenCalled();
      expect(await fs.readFile(join(h.root, 'real', 'input.zip'), 'utf8')).toBe(
        'test-owned virtual ZIP',
      );
      return;
    } else {
      const path = target === 'archive' ? h.archivePath : h.observationPath;
      await fs.rename(path, `${path}.original`);
      await fs.symlink(`${path}.original`, path);
    }
    await expect(h.run()).rejects.toThrow('exact regular file');
    expect(h.stage).not.toHaveBeenCalled();
    expect(await fs.readFile(join(h.root, 'unrelated', 'keep'), 'utf8')).toBe('keep');
  },
);

it.each(['archive', 'observation'] as const)(
  'rejects %s mutation after staging and removes only owned scratch',
  async (target) => {
    const h = await harness();
    const original = h.stage.getMockImplementation();
    h.stage.mockImplementation(async (...args) => {
      const result = await original?.(...args);
      if (target === 'archive') h.mutate();
      else await fs.writeFile(h.observationPath, '{}');
      if (!result) throw new Error('Missing stage result');
      return result;
    });
    await expect(h.run()).rejects.toThrow(
      target === 'archive' ? 'byte binding' : 'observation truncated',
    );
    expect(h.stage).toHaveBeenCalledOnce();
    await h.clean();
  },
);

it.each([
  'environment',
  'inspection',
  'schema',
  'date',
  'duplicate',
  'missing',
  'truncated',
] as const)('rejects %s before any accepted output escapes', async (failure) => {
  const h = await harness();
  if (failure === 'environment') h.denyEnvironment();
  if (failure === 'inspection') h.inspect.mockRejectedValue(new Error('inspection failed'));
  if (failure === 'schema' || failure === 'date') {
    const evidence = { ...JSON.parse(observationBytes.toString()).collection.archiveEvidence };
    if (failure === 'schema') evidence.schemaManifestSha256 = '0'.repeat(64);
    else evidence.providerModifiedDate = '2026-10-21';
    h.inspect.mockResolvedValue({ kind: 'accepted', evidence });
  }
  if (failure === 'duplicate' || failure === 'missing') {
    h.inspect.mockImplementation(async (options?: unknown) => {
      const input = options as { contract: typeof contract };
      if (failure === 'duplicate') input.contract.entries[1] = input.contract.entries[0];
      else input.contract.entries.pop();
      return {
        kind: 'accepted',
        evidence: JSON.parse(observationBytes.toString()).collection.archiveEvidence,
      };
    });
  }
  if (failure === 'truncated') h.truncate();
  const expected =
    failure === 'environment'
      ? 'environment'
      : failure === 'inspection'
        ? 'inspection failed'
        : failure === 'duplicate' || failure === 'missing'
          ? 'category inventory'
          : failure === 'truncated'
            ? 'extraction'
            : 'inspection mismatch';
  await expect(h.run()).rejects.toThrow(expected);
  if (failure !== 'truncated') expect(h.stage).not.toHaveBeenCalled();
  await h.clean();
});

it('refuses wrong final metrics even after the inner stager has accepted its private output', async () => {
  const h = await harness();
  const original = h.stage.getMockImplementation();
  h.stage.mockImplementation(async (...args) => {
    const result = await original?.(...args);
    if (!result) throw new Error('Missing stage result');
    result.metrics.total.collisionRecordCount++;
    return result;
  });
  await expect(h.run()).rejects.toThrow('metrics');
  await h.clean();
});

it('removes only its scratch on interrupted staging and preserves an existing output', async () => {
  const h = await harness();
  h.stage.mockRejectedValue(new Error('interrupted'));
  await expect(h.run()).rejects.toThrow('interrupted');
  await h.clean();
  await fs.mkdir(h.output);
  await fs.writeFile(join(h.output, 'keep'), 'existing');
  h.stage.mockClear();
  await expect(h.run()).rejects.toThrow();
  expect(h.stage).not.toHaveBeenCalled();
  expect(await fs.readFile(join(h.output, 'keep'), 'utf8')).toBe('existing');
});

it('rejects changed policy authority before source staging', async () => {
  const h = await harness();
  h.config.policy.maxJsonBytes++;
  await expect(h.run()).rejects.toThrow();
  expect(h.stage).not.toHaveBeenCalled();
  await h.clean();
});

it.each(['original', 'snapshot'] as const)(
  'binds the %s ZIP independently before fresh inspection',
  async (target) => {
    const h = await harness();
    if (target === 'original') h.mutate();
    else h.mutateSnapshot();
    await expect(h.run()).rejects.toThrow('byte binding');
    expect(h.inspect).not.toHaveBeenCalled();
    expect(h.stage).not.toHaveBeenCalled();
    await h.clean();
  },
);

it('rejects original inode replacement even when the trusted byte seam reports unchanged content', async () => {
  const h = await harness();
  const original = h.stage.getMockImplementation();
  h.stage.mockImplementation(async (...args) => {
    const result = await original?.(...args);
    await fs.rename(h.archivePath, join(h.root, 'replaced.zip'));
    await fs.writeFile(h.archivePath, 'replacement');
    if (!result) throw new Error('Missing stage result');
    return result;
  });
  await expect(h.run()).rejects.toThrow('input changed');
  expect(await fs.readFile(h.archivePath, 'utf8')).toBe('replacement');
  expect(await fs.readFile(join(h.root, 'replaced.zip'), 'utf8')).toBe('test-owned virtual ZIP');
  expect((await fs.readdir(h.root)).some((name) => name.includes('-initial-'))).toBe(false);
});

it('rejects overflow of the cumulative row budget even if the parser seam ignores its limit', async () => {
  const h = await harness();
  h.overflowRows();
  await expect(h.run()).rejects.toThrow('total row limit');
  expect(h.parse.mock.calls[0]?.[2]).toBe(3000000);
  await h.clean();
});

it('rejects a parser exception and extraction nonzero exit without a receipt', async () => {
  const h = await harness();
  h.parse.mockImplementation(() => {
    throw new Error('invalid csv');
  });
  await expect(h.run()).rejects.toThrow('invalid csv');
  await h.clean();
  h.extract.mockResolvedValue({
    exitCode: 9,
    truncated: false,
    stdout: new Uint8Array(),
    stderr: new Uint8Array(),
  });
  h.parse.mockClear();
  await expect(h.run()).rejects.toThrow('bounded extraction');
  expect(h.parse).not.toHaveBeenCalled();
  await h.clean();
});

it('rejects an inner stager that stops consuming categories or rows', async () => {
  const h = await harness();
  h.stage.mockImplementation(async (_input, _categories, output) => ({
    outputDirectory: output,
    files: [],
    metrics: h.config.baseline.metrics,
  }));
  await expect(h.run()).rejects.toThrow('category stream incomplete');
  await h.clean();
  h.stage.mockImplementation(async (_input, categories, output) => {
    for await (const _category of categories) {
      /* Deliberately do not consume rows. */
    }
    return { outputDirectory: output, files: [], metrics: h.config.baseline.metrics };
  });
  await expect(h.run()).rejects.toThrow('not fully consumed');
  await h.clean();
});

it('refuses a late conflicting output and preserves its content', async () => {
  const h = await harness();
  const original = h.stage.getMockImplementation();
  h.stage.mockImplementation(async (...args) => {
    const result = await original?.(...args);
    await fs.mkdir(h.output);
    await fs.writeFile(join(h.output, 'keep'), 'another operation');
    if (!result) throw new Error('Missing stage result');
    return result;
  });
  await expect(h.run()).rejects.toThrow('output already exists');
  expect(await fs.readFile(join(h.output, 'keep'), 'utf8')).toBe('another operation');
  expect((await fs.readdir(h.root)).sort()).toEqual([
    'accepted',
    'input.zip',
    'observation.json',
    'unrelated',
  ]);
});

it('rejects a final row-count mismatch even when measured metrics claim exact equality', async () => {
  const h = await harness();
  h.parse.mockImplementation(function* () {
    yield* [];
  });
  await expect(h.run()).rejects.toThrow('record count mismatch');
  await h.clean();
});

it.each(['clock', 'local-run', 'dirty-hosted', 'asset-binding'] as const)(
  'rejects invalid %s provenance before I/O staging',
  async (failure) => {
    const h = await harness();
    const { approval } = createInitialImportFixture();
    const transport =
      failure === 'clock' || failure === 'local-run'
        ? { kind: 'local-proof' as const }
        : {
            kind: 'github-release' as const,
            releaseId: approval.releaseId,
            tag: approval.tag,
            tagCommit: approval.tagCommit,
            assets: approval.assets,
            downloadedAt: clock,
          };
    const execution = { now: clock, operator: structuredClone(operator) };
    if (failure === 'clock') execution.now = '2026-10-21';
    if (failure === 'local-run') execution.operator.runId = 100;
    if (failure === 'asset-binding' && transport.kind === 'github-release') {
      execution.operator.uncommitted = false;
      execution.operator.runId = 100;
      transport.assets.archive.id = transport.assets.observation.id;
    }
    await expect(
      h.stageInitialSource(
        h.config,
        { archivePath: h.archivePath, observationPath: h.observationPath, transport },
        h.output,
        execution,
      ),
    ).rejects.toThrow();
    expect(h.stage).not.toHaveBeenCalled();
    expect(h.inspect).not.toHaveBeenCalled();
    await h.clean();
  },
);

it('retains real FileHandle ownership across full reads, snapshot copy and post-stage rereads', async () => {
  // Sparse bytes and a test-owned hash substitute exercise actual Node I/O lifetime only.
  const h = await harness(true);
  const result = await h.run();
  expect(result.stageDirectory).toBe(h.output);
  expect(h.consumed()).toBe(195);
  expect((await fs.stat(h.archivePath)).size).toBe(217307219);
  expect((await fs.readdir(h.root)).sort()).toEqual([
    'accepted',
    'input.zip',
    'observation.json',
    'unrelated',
  ]);
  expect(await fs.readdir(h.output)).toEqual(['source-import-receipt.json']);
}, 30000);

it('accepts an operator fingerprint containing an accurately bound empty file', async () => {
  const h = await harness();
  const execution = { now: clock, operator: structuredClone(operator) };
  execution.operator.codeBindings['src/app/.gitkeep'] = {
    byteLength: 0,
    sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  };
  const result = await h.stageInitialSource(
    h.config,
    {
      archivePath: h.archivePath,
      observationPath: h.observationPath,
      transport: { kind: 'local-proof' },
    },
    h.output,
    execution,
  );
  expect(result.receipt.operator.codeBindings['src/app/.gitkeep']).toEqual({
    byteLength: 0,
    sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  });
  expect(result.stageDirectory).toBe(h.output);
  expect(h.stage).toHaveBeenCalledOnce();
  expect(h.fetcher).not.toHaveBeenCalled();
});

it.each([-1, 0.5, Number.MAX_SAFE_INTEGER + 1, Infinity, NaN])(
  'rejects an operator code byte length of %s',
  async (byteLength) => {
    const h = await harness();
    const execution = { now: clock, operator: structuredClone(operator) };
    execution.operator.codeBindings['src/app/.gitkeep'] = {
      byteLength,
      sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    };
    await expect(
      h.stageInitialSource(
        h.config,
        {
          archivePath: h.archivePath,
          observationPath: h.observationPath,
          transport: { kind: 'local-proof' },
        },
        h.output,
        execution,
      ),
    ).rejects.toThrow('operator byte binding is invalid');
    expect(h.stage).not.toHaveBeenCalled();
    expect(h.inspect).not.toHaveBeenCalled();
    await h.clean();
  },
);

it.each([
  'x'.repeat(64),
  '0'.repeat(63),
  'E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855',
])('rejects an empty-file operator binding with invalid SHA %s', async (sha256) => {
  const h = await harness();
  const execution = { now: clock, operator: structuredClone(operator) };
  execution.operator.codeBindings['src/app/.gitkeep'] = { byteLength: 0, sha256 };
  await expect(
    h.stageInitialSource(
      h.config,
      {
        archivePath: h.archivePath,
        observationPath: h.observationPath,
        transport: { kind: 'local-proof' },
      },
      h.output,
      execution,
    ),
  ).rejects.toThrow('operator byte binding is invalid');
  expect(h.stage).not.toHaveBeenCalled();
  await h.clean();
});
