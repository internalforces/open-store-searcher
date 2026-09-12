import { afterEach, expect, it, vi } from 'vitest';
import { demoDataset } from './demo-data.js';
import { createPublicationLoader } from './publication-loader.js';

vi.mock('./partition-loader.js', () => ({
  afterShellPaint: async (signal: AbortSignal) => signal.throwIfAborted(),
}));
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
const collected = () => ({
  ...structuredClone(demoDataset),
  coverage: { kind: 'collected', date: '2026-09-12' },
});
it('loads the complete collection-date snapshot from a fixed credential-free asset URL', async () => {
  const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify(collected())));
  vi.stubGlobal('fetch', fetcher);
  const result = await createPublicationLoader('/assets/collected-hash.json').load();
  expect(result).toEqual(collected());
  expect(fetcher).toHaveBeenCalledWith(
    '/assets/collected-hash.json',
    expect.objectContaining({ credentials: 'omit', referrerPolicy: 'no-referrer' }),
  );
});
it.each(['synthetic', 'excluded', 'duplicate'])(
  'rejects an incomplete or incorrectly labeled %s snapshot',
  async (kind) => {
    const value = collected();
    if (kind === 'synthetic') value.coverage.kind = 'synthetic';
    if (kind === 'excluded') Object.assign(value.records[0] ?? {}, { categoryName: null });
    if (kind === 'duplicate') Object.assign(value.records[1] ?? {}, { id: value.records[0]?.id });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(value))));
    await expect(createPublicationLoader('/fixed.json').load()).rejects.toThrow();
  },
);
it('cancels a failed response and never requests data for an aborted load', async () => {
  const cancel = vi.fn().mockResolvedValue(undefined);
  const fetcher = vi.fn().mockResolvedValue({ ok: false, body: { cancel } });
  vi.stubGlobal('fetch', fetcher);
  const loader = createPublicationLoader('/fixed.json');
  await expect(loader.load()).rejects.toThrow('Unable');
  expect(cancel).toHaveBeenCalledOnce();
  const controller = new AbortController();
  controller.abort();
  await expect(loader.load(controller.signal)).rejects.toThrow();
  expect(fetcher).toHaveBeenCalledOnce();
});
