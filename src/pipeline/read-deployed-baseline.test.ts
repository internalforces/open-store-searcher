import { createHash } from 'node:crypto';
import { expect, test, vi } from 'vitest';
import { requireValue, type ValidationBaselineV1 } from './refresh-validation-types.js';
import { readDeployedBaseline } from './read-deployed-baseline.js';

function fixture() {
  const baseline = {
    dateBasis: 'collection',
    archiveSha256: 'a'.repeat(64),
    policyRevision: 'reviewed-v1',
  };
  const bytes = JSON.stringify(baseline);
  const release = {
    version: 1,
    kind: 'validated-staging',
    sourceDataAsOf: null,
    ...baseline,
    entries: [
      {
        name: 'baseline.json',
        byteLength: Buffer.byteLength(bytes),
        sha256: createHash('sha256').update(bytes).digest('hex'),
      },
      { name: 'dataset.json', byteLength: 1234, sha256: 'c'.repeat(64) },
    ],
  };
  const fetcher = vi
    .fn<typeof fetch>()
    .mockResolvedValueOnce(new Response(JSON.stringify(release)))
    .mockResolvedValueOnce(new Response(bytes))
    .mockResolvedValueOnce(new Response(JSON.stringify(release)));
  return { baseline, release, bytes, fetcher };
}
test('reads only a baseline bound to an unchanged deployed release without credentials or redirects', async () => {
  const { baseline, fetcher } = fixture();
  expect(
    await readDeployedBaseline('https://example.github.io/site/release.json', 10_000, fetcher),
  ).toEqual(baseline);
  expect(fetcher.mock.calls.map(([url]) => String(url))).toEqual([
    'https://example.github.io/site/release.json',
    'https://example.github.io/site/baseline.json',
    'https://example.github.io/site/release.json',
  ]);
  expect(fetcher).toHaveBeenCalledWith(
    expect.any(URL),
    expect.objectContaining({ redirect: 'error', credentials: 'omit', cache: 'no-store' }),
  );
});
test.each([
  'http://example.org/release.json',
  'https://user@example.org/release.json',
  'https://example.org/release.json?x=1',
  'https://example.org/other.json',
])('rejects invalid release URL %s without network access', async (url) => {
  const fetcher = vi.fn<typeof fetch>();
  await expect(readDeployedBaseline(url, 1000, fetcher)).rejects.toThrow();
  expect(fetcher).not.toHaveBeenCalled();
});
test.each(['missing', 'oversized', 'syntax', 'binding', 'changed', 'metadata'])(
  'rejects %s deployed state instead of bootstrapping',
  async (kind) => {
    const { baseline, release, bytes } = fixture();
    let first = JSON.stringify(release),
      second = bytes,
      third = first;
    if (kind === 'syntax') first = '{';
    if (kind === 'binding') second = '{}';
    if (kind === 'changed') third = JSON.stringify({ ...release, archiveSha256: 'b'.repeat(64) });
    if (kind === 'metadata') {
      second = JSON.stringify({ ...baseline, dateBasis: 'coverage' });
      release.entries[0] = {
        name: 'baseline.json',
        byteLength: Buffer.byteLength(second),
        sha256: createHash('sha256').update(second).digest('hex'),
      };
      first = JSON.stringify(release);
      third = first;
    }
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(first, { status: kind === 'missing' ? 404 : 200 }))
      .mockResolvedValueOnce(new Response(second))
      .mockResolvedValueOnce(new Response(third));
    await expect(
      readDeployedBaseline(
        'https://example.org/release.json',
        kind === 'oversized' ? 10 : 10_000,
        fetcher,
      ),
    ).rejects.toThrow();
  },
);

const releaseUrl = 'https://example.github.io/site/release.json';
const initialBaseline = {
  ...fixture().baseline,
  archiveSha256: 'b'.repeat(64),
} as ValidationBaselineV1;

test('rejects bootstrap when a deployed release exists', async () => {
  const { fetcher } = fixture();
  await expect(
    readDeployedBaseline(releaseUrl, 10_000, fetcher, { baseline: initialBaseline }),
  ).rejects.toThrow('Bootstrap requires an absent deployed release');
  expect(fetcher).toHaveBeenCalledTimes(1);
});

test('uses the reviewed initial baseline only after an explicit release 404', async () => {
  const response = new Response('Not found', { status: 404 });
  const cancel = vi.spyOn(requireValue(response.body), 'cancel');
  const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response);
  await expect(
    readDeployedBaseline(releaseUrl, 10_000, fetcher, { baseline: initialBaseline }),
  ).resolves.toBe(initialBaseline);
  expect(fetcher).toHaveBeenCalledExactlyOnceWith(
    new URL(releaseUrl),
    expect.objectContaining({ redirect: 'error', credentials: 'omit', cache: 'no-store' }),
  );
  expect(cancel).toHaveBeenCalledOnce();
});

test.each([200, 204, 301, 403, 410, 500])(
  'rejects bootstrap on HTTP %s instead of treating it as no deployment',
  async (status) => {
    const response = new Response(status === 204 ? null : 'unavailable', { status });
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response);
    await expect(
      readDeployedBaseline(releaseUrl, 10_000, fetcher, { baseline: initialBaseline }),
    ).rejects.toThrow('Bootstrap requires an absent deployed release');
    expect(fetcher).toHaveBeenCalledTimes(1);
    if (response.body) expect(response.bodyUsed).toBe(true);
  },
);

test('rejects bootstrap on a failed deployment probe', async () => {
  const fetcher = vi.fn<typeof fetch>().mockRejectedValue(new Error('network unavailable'));
  await expect(
    readDeployedBaseline(releaseUrl, 10_000, fetcher, { baseline: initialBaseline }),
  ).rejects.toThrow('network unavailable');
  expect(fetcher).toHaveBeenCalledTimes(1);
});

test('rejects bootstrap when the missing response cannot be cancelled', async () => {
  const response = new Response('Not found', { status: 404 });
  vi.spyOn(requireValue(response.body), 'cancel').mockRejectedValue(new Error('cancel failed'));
  const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response);
  await expect(
    readDeployedBaseline(releaseUrl, 10_000, fetcher, { baseline: initialBaseline }),
  ).rejects.toThrow('cancel failed');
});

test.each([
  'missing-dataset',
  'missing-baseline',
  'duplicate-dataset',
  'duplicate-baseline',
  'extra-entry',
  'unknown-entry',
  'null-entry',
  'invalid-hash',
  'zero-bytes',
  'negative-bytes',
  'fractional-bytes',
  'unsafe-bytes',
  'string-bytes',
])('rejects %s in the deployed descriptor before reading a baseline', async (kind) => {
  const { release } = fixture();
  const baseline = requireValue(release.entries[0]);
  const dataset = requireValue(release.entries[1]);
  let entries: unknown[] = [baseline, dataset];
  if (kind === 'missing-dataset') entries = [baseline];
  if (kind === 'missing-baseline') entries = [dataset];
  if (kind === 'duplicate-dataset') entries = [dataset, dataset];
  if (kind === 'duplicate-baseline') entries = [baseline, baseline];
  if (kind === 'extra-entry') entries.push({ ...dataset, name: 'other.json' });
  if (kind === 'unknown-entry') entries[1] = { ...dataset, name: 'other.json' };
  if (kind === 'null-entry') entries[1] = null;
  if (kind === 'invalid-hash') entries[1] = { ...dataset, sha256: 'invalid' };
  const sizes: Record<string, unknown> = {
    'zero-bytes': 0,
    'negative-bytes': -1,
    'fractional-bytes': 1.5,
    'unsafe-bytes': Number.MAX_SAFE_INTEGER + 1,
    'string-bytes': '1234',
  };
  if (kind in sizes) entries[1] = { ...dataset, byteLength: sizes[kind] };
  const fetcher = vi
    .fn<typeof fetch>()
    .mockResolvedValue(new Response(JSON.stringify({ ...release, entries })));
  await expect(readDeployedBaseline(releaseUrl, 10_000, fetcher)).rejects.toThrow(
    'Invalid deployed release entries',
  );
  expect(fetcher).toHaveBeenCalledTimes(1);
});

test('accepts the exact deployed entry set in either order', async () => {
  const { release, baseline, bytes } = fixture();
  release.entries.reverse();
  const fetcher = vi
    .fn<typeof fetch>()
    .mockResolvedValueOnce(new Response(JSON.stringify(release)))
    .mockResolvedValueOnce(new Response(bytes))
    .mockResolvedValueOnce(new Response(JSON.stringify(release)));
  await expect(readDeployedBaseline(releaseUrl, 10_000, fetcher)).resolves.toEqual(baseline);
  expect(fetcher).toHaveBeenCalledTimes(3);
});
