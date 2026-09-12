import { createHash } from 'node:crypto';
import { expect, test, vi } from 'vitest';
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
