import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { afterEach, expect, test, vi } from 'vitest';
import { loadCompactSnapshot } from '../shared/load-compact-data.js';
import { readDeployedBaseline } from './read-deployed-baseline.js';
import type { ValidationBaselineV1 } from './refresh-validation-types.js';
import { writeCompactDataset } from './write-compact-dataset.js';

const roots: string[] = [];
const run = promisify(execFile);
const sha = (value: Uint8Array) => createHash('sha256').update(value).digest('hex');
const json = (value: unknown) => Buffer.from(`${JSON.stringify(value)}\n`);
const releaseUrl = 'https://example.github.io/open-store-searcher/release.json';

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'publication-transaction-'));
  roots.push(root);
  const staging = join(root, 'staging');
  const records = ['a', 'f'].map((id) => ({
    id: id.repeat(64),
    name: `원문 ${id}`,
    roadAddress: '서울 강남구 1',
    parcelAddress: '',
    categoryName: '원문.csv',
    businessTypes: [{ sourceField: '업태', value: ' ' }],
    rawStatus: {
      operatingCode: '05',
      operatingName: '제외/삭제/전출',
      detailedCode: '',
      detailedName: null,
    },
    processedStatus: '확인되지 않음',
    lifecycle: {
      licensedOn: '',
      licenseCancelledOn: null,
      suspendedFrom: '',
      suspendedThrough: null,
      reopenedOn: '',
      closedOn: null,
      sourceUpdatedAt: '날짜 원문',
      sourceLastModifiedAt: '',
    },
    sourceLabel: '행정안전부',
    sourceUrl: null,
  }));
  const compact = await writeCompactDataset(
    {
      archiveSha256: 'b'.repeat(64),
      policyRevision: 'synthetic-transaction-only',
      recordCount: 2,
      metadata: {
        sourceLabel: 'Synthetic transaction fixture',
        sourceUrl: null,
        exampleQuery: '',
        coverage: { kind: 'collected', date: '2026-09-15' },
      },
    },
    async function* () {
      yield* records;
    },
    staging,
  );
  const metric = {
    recordCount: 2,
    missingNameCount: 0,
    missingBothAddressCount: 0,
    unknownPairCount: 2,
    statusCounts: { '행정상 영업': 0, 휴업: 0, 폐업: 0, '확인되지 않음': 2 },
    rawMissing: {
      businessName: { null: 0, empty: 0, whitespace: 0 },
      roadAddress: { null: 0, empty: 0, whitespace: 0 },
      parcelAddress: { null: 0, empty: 2, whitespace: 0 },
      detailedCode: { null: 0, empty: 2, whitespace: 0 },
      detailedName: { null: 2, empty: 0, whitespace: 0 },
    },
    aggregatePairs: [{ code: '05', name: '제외/삭제/전출', count: 2 }],
    collisionGroupCount: 0,
    collisionRecordCount: 0,
  };
  const baseline: ValidationBaselineV1 = {
    validationVersion: 1,
    schemaVersion: 2,
    identifierContractVersion: 1,
    normalizationContractVersion: 1,
    dateBasis: 'collection',
    dataAsOf: '2026-09-15',
    archiveSha256: 'b'.repeat(64),
    policyRevision: 'synthetic-transaction-only',
    schemaManifestSha256: 'c'.repeat(64),
    evidenceReference: 'synthetic offline transaction; no provider data',
    metrics: { total: metric, categories: { synthetic: structuredClone(metric) } },
  };
  const baselineBytes = json(baseline);
  const release = {
    version: 2,
    kind: 'validated-staging',
    dateBasis: 'collection',
    sourceDataAsOf: null,
    // Cross the UTC/Seoul date boundary to exercise the actual date binding.
    collectedAt: '2026-09-14T15:00:00.000Z',
    archiveSha256: 'b'.repeat(64),
    policyRevision: 'synthetic-transaction-only',
    recordCount: 2,
    entries: [
      compact.manifestEntry,
      { name: 'baseline.json', byteLength: baselineBytes.length, sha256: sha(baselineBytes) },
    ],
  };
  await writeFile(join(staging, 'baseline.json'), baselineBytes);
  await writeFile(join(staging, 'release.json'), json(release));
  return { root, staging, records, baseline, release, ...compact };
}

async function inventory(root: string, prefix = ''): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  for (const entry of await readdir(join(root, prefix), { withFileTypes: true })) {
    const name = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) Object.assign(result, await inventory(root, name));
    else result[name] = sha(await readFile(join(root, name)));
  }
  return result;
}

function deployedFetch(site: string) {
  return vi.fn<typeof fetch>(async (url) => {
    const target = new URL(String(url));
    const name = target.pathname.slice('/open-store-searcher/'.length);
    try {
      return new Response(await readFile(join(site, name)));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      return new Response(null, { status: 404 });
    }
  });
}

async function build(staging: string, site: string, hook?: string) {
  return run(process.execPath, [
    ...(hook ? ['--import', hook] : []),
    'scripts/build-publication.mjs',
    staging,
    site,
  ]);
}

async function childHook(root: string, specifier: string, source: string) {
  const hook = join(root, 'child-hook.mjs');
  await writeFile(
    hook,
    `import { registerHooks } from 'node:module';
    registerHooks({ resolve(specifier, context, nextResolve) {
      if (specifier === ${JSON.stringify(specifier)} &&
          context.parentURL?.endsWith('/scripts/build-publication.mjs'))
        return { url: 'data:text/javascript,' + encodeURIComponent(${JSON.stringify(source)}), shortCircuit: true };
      return nextResolve(specifier, context);
    } });`,
  );
  return hook;
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

test('reconciles a complete V2 site baseline through the deployed descriptor', async () => {
  const f = await fixture();
  const sourceBefore = await inventory(f.staging);
  const site = join(f.root, 'site');
  await build(f.staging, site);
  const fetcher = deployedFetch(site);
  await expect(readDeployedBaseline(releaseUrl, 1_000_000, fetcher)).resolves.toEqual(f.baseline);
  expect(fetcher.mock.calls.map(([url]) => String(url))).toEqual([
    releaseUrl,
    new URL(f.manifestEntry.name, releaseUrl).href,
    new URL('baseline.json', releaseUrl).href,
    releaseUrl,
  ]);
  for (const [, options] of fetcher.mock.calls)
    expect(options).toMatchObject({
      redirect: 'error',
      credentials: 'omit',
      cache: 'no-store',
      referrerPolicy: 'no-referrer',
    });
  const releaseBytes = await readFile(join(site, 'release.json'));
  expect(releaseBytes).toEqual(json(f.release));
  const descriptor = JSON.parse(releaseBytes.toString('utf8'));
  expect(descriptor).toMatchObject({
    dateBasis: 'collection',
    sourceDataAsOf: null,
    collectedAt: '2026-09-14T15:00:00.000Z',
    archiveSha256: 'b'.repeat(64),
    policyRevision: 'synthetic-transaction-only',
    recordCount: 2,
  });
  expect(f.manifest.metadata.coverage).toEqual({ kind: 'collected', date: '2026-09-15' });
  expect(f.baseline.dataAsOf).toBe('2026-09-15');
  for (const entry of [...descriptor.entries, ...f.entries]) {
    const bytes = await readFile(join(site, entry.name));
    expect(bytes.length).toBe(entry.byteLength);
    expect(sha(bytes)).toBe(entry.sha256);
  }
  const snapshot = await loadCompactSnapshot(
    await readFile(join(site, f.manifestEntry.name)),
    f.manifestEntry.sha256,
    (name) => readFile(join(site, name)),
  );
  expect(snapshot.manifest.recordCount).toBe(2);
  expect(snapshot.manifest.archiveSha256).toBe('b'.repeat(64));
  expect(snapshot.manifest.policyRevision).toBe('synthetic-transaction-only');
  const siteFiles = Object.keys(await inventory(site));
  expect(siteFiles.filter((name) => name.endsWith('.json')).sort()).toEqual(
    [
      'release.json',
      ...f.release.entries.map((entry) => entry.name),
      ...f.entries.map((e) => e.name),
    ].sort(),
  );
  expect(siteFiles).toContain('index.html');
  expect(siteFiles.some((name) => name.endsWith('.js'))).toBe(true);
  expect(await inventory(f.staging)).toEqual(sourceBefore);
}, 30_000);

test('rejects a replacement during V2 baseline reconciliation without bootstrapping', async () => {
  const f = await fixture();
  const fetcher = deployedFetch(f.staging);
  let descriptors = 0;
  const changingFetch = vi.fn<typeof fetch>(async (url, options) => {
    if (String(url) === releaseUrl && ++descriptors === 2)
      return new Response(json({ ...f.release, collectedAt: '2026-09-15T15:00:00.000Z' }));
    return fetcher(url, options);
  });
  await expect(readDeployedBaseline(releaseUrl, 1_000_000, changingFetch)).rejects.toThrow(
    'Deployment changed during baseline read',
  );
  expect(changingFetch.mock.calls.map(([url]) => String(url))).toEqual([
    releaseUrl,
    new URL(f.manifestEntry.name, releaseUrl).href,
    new URL('baseline.json', releaseUrl).href,
    releaseUrl,
  ]);
  expect(descriptors).toBe(2);
});

test.each([
  ['manifest', 'missing', 'Deployed baseline unavailable'],
  ['baseline', 'missing', 'Deployed baseline unavailable'],
  ['manifest', 'tampered', 'Deployed manifest hash mismatch'],
  ['baseline', 'tampered', 'Deployed baseline hash mismatch'],
  ['manifest', 'byte-length', 'Deployed manifest hash mismatch'],
  ['baseline', 'byte-length', 'Deployed baseline hash mismatch'],
  ['manifest', 'date', 'Invalid compact dataset'],
  ['baseline', 'date', 'Invalid compact dataset'],
  ['manifest', 'archive', 'Deployed manifest metadata mismatch'],
  ['baseline', 'archive', 'Deployed baseline metadata mismatch'],
  ['manifest', 'policy', 'Deployed manifest metadata mismatch'],
  ['baseline', 'policy', 'Deployed baseline metadata mismatch'],
  ['manifest', 'count', 'Deployed manifest metadata mismatch'],
  ['baseline', 'count', 'Invalid compact dataset'],
] as const)(
  'rejects %s %s during V2 baseline reconciliation',
  async (component, failure, error) => {
    const f = await fixture();
    const entry = component === 'manifest' ? f.release.entries[0] : f.release.entries[1];
    if (!entry) throw new Error('Missing fixture entry');
    const target = join(f.staging, entry.name);
    if (failure === 'missing') await rm(target);
    else if (failure === 'tampered') {
      const original = await readFile(target);
      // Valid JSON with unchanged length: only the digest distinguishes this replacement.
      original[original.length - 1] = 32;
      await writeFile(target, original);
    } else if (failure === 'byte-length') entry.byteLength++;
    else {
      const value = component === 'manifest' ? f.manifest : f.baseline;
      if (failure === 'date') {
        if (component === 'manifest')
          f.manifest.metadata = {
            ...f.manifest.metadata,
            coverage: { kind: 'collected', date: '2026-09-14' },
          };
        else f.baseline.dataAsOf = '2026-09-14';
      }
      if (failure === 'archive') value.archiveSha256 = 'd'.repeat(64);
      if (failure === 'policy') value.policyRevision = 'different-synthetic-policy';
      if (failure === 'count') {
        if (component === 'manifest') {
          // Keep manifest ranges coherent so this reaches release metadata reconciliation.
          f.manifest.recordCount = 3;
          for (const block of f.manifest.entries)
            if (block.role !== 'dictionaries') block.count = 3;
        } else f.baseline.metrics.total.recordCount = 3;
      }
      const bytes = json(value);
      entry.sha256 = sha(bytes);
      entry.byteLength = bytes.length;
      if (component === 'manifest') entry.name = `assets/compact-manifest-${entry.sha256}.json`;
      await writeFile(join(f.staging, entry.name), bytes);
      expect(sha(await readFile(join(f.staging, entry.name)))).toBe(entry.sha256);
      expect((await readFile(join(f.staging, entry.name))).length).toBe(entry.byteLength);
    }
    await writeFile(join(f.staging, 'release.json'), json(f.release));
    const fetcher = deployedFetch(f.staging);
    await expect(readDeployedBaseline(releaseUrl, 1_000_000, fetcher)).rejects.toThrow(error);
    expect(fetcher.mock.calls[0]?.[0].toString()).toBe(releaseUrl);
    expect(
      fetcher.mock.calls.some(([url]) => !String(url).startsWith(new URL('.', releaseUrl).href)),
    ).toBe(false);
  },
);

test('preserves the previous site and source inventory after a partial build copy failure', async () => {
  const f = await fixture();
  const previous = join(f.root, 'previous-site');
  await build(f.staging, previous);
  const previousBefore = await inventory(previous);
  const sourceBefore = await inventory(f.staging);
  const site = join(f.root, 'next-site');
  const marker = join(f.root, 'partial-copy.json');
  const target = f.entries.find((entry) => entry.role === 'evidence');
  if (!target) throw new Error('Missing fixture evidence');
  // This child alone fails a real file write after 16 bytes. Vite, hashing and copies stay real.
  const hook = await childHook(
    f.root,
    'node:fs',
    `export { createReadStream } from 'node:fs';
    import { createWriteStream as original, readFileSync, readdirSync, writeFileSync } from 'node:fs';
    import { createHash } from 'node:crypto';
    import { dirname, join } from 'node:path';
    export function createWriteStream(path, options) {
      const stream = original(path, options);
      if (String(path).endsWith('/' + ${JSON.stringify(target.name)})) {
        const write = stream._write;
        stream._write = function(chunk, encoding, callback) {
          write.call(this, chunk.subarray(0, 16), encoding, (error) => {
            if (error) return callback(error);
            const copied = Object.fromEntries(readdirSync(dirname(path)).map(name => {
              const bytes = readFileSync(join(dirname(path), name));
              return ['assets/' + name, { byteLength: bytes.length,
                sha256: createHash('sha256').update(bytes).digest('hex') }];
            }));
            writeFileSync(${JSON.stringify(marker)}, JSON.stringify({ path, copied }));
            callback(new Error('Injected partial compact copy failure'));
          });
        };
      }
      return stream;
    }`,
  );
  await expect(build(f.staging, site, hook)).rejects.toThrow(
    'Injected partial compact copy failure',
  );
  const injected = JSON.parse(await readFile(marker, 'utf8'));
  expect(injected.path).toMatch(/\/\.next-site-[^/]+\/assets\/compact-[a-f0-9]{64}\.json$/);
  expect(injected.copied[target.name]).toEqual({
    byteLength: 16,
    sha256: sha((await readFile(join(f.staging, target.name))).subarray(0, 16)),
  });
  for (const entry of [f.manifestEntry, ...f.entries.filter((e) => e.role !== 'evidence')])
    expect(injected.copied[entry.name]).toEqual({
      byteLength: entry.byteLength,
      sha256: entry.sha256,
    });
  expect(await inventory(previous)).toEqual(previousBefore);
  expect(await inventory(f.staging)).toEqual(sourceBefore);
  expect((await readdir(f.root)).sort()).toEqual([
    'child-hook.mjs',
    'partial-copy.json',
    'previous-site',
    'staging',
  ]);
}, 30_000);

test('preserves an output that appears before final build promotion', async () => {
  const f = await fixture();
  const sourceBefore = await inventory(f.staging);
  const site = join(f.root, 'site');
  const marker = join(f.root, 'promotion.json');
  const hook = await childHook(
    f.root,
    'node:fs/promises',
    `export { readFile, writeFile, mkdtemp, mkdir, rename, rm } from 'node:fs/promises';
    import { lstat as original, mkdir, writeFile, readdir, readFile } from 'node:fs/promises';
    import { join } from 'node:path';
    let checks = 0;
    export async function lstat(path) {
      if (path === ${JSON.stringify(site)} && ++checks === 2) {
        const candidate = (await readdir(${JSON.stringify(f.root)})).find(name => name.startsWith('.site-'));
        const release = JSON.parse(await readFile(join(${JSON.stringify(f.root)}, candidate, 'release.json'), 'utf8'));
        await mkdir(join(path, 'assets'), { recursive: true });
        await writeFile(join(path, 'index.html'), 'competing complete site');
        await writeFile(join(path, 'assets', 'accepted.json'), 'competing data');
        await writeFile(${JSON.stringify(marker)}, JSON.stringify({ checks, candidate, release }));
      }
      return original(path);
    }`,
  );
  await expect(build(f.staging, site, hook)).rejects.toThrow('Build output already exists');
  const injected = JSON.parse(await readFile(marker, 'utf8'));
  expect(injected.checks).toBe(2);
  expect(injected.candidate).toMatch(/^\.site-/);
  expect(injected.release).toEqual(f.release);
  expect(await inventory(site)).toEqual({
    'index.html': sha(Buffer.from('competing complete site')),
    'assets/accepted.json': sha(Buffer.from('competing data')),
  });
  expect(await inventory(f.staging)).toEqual(sourceBefore);
  expect((await readdir(f.root)).sort()).toEqual([
    'child-hook.mjs',
    'promotion.json',
    'site',
    'staging',
  ]);
}, 30_000);
