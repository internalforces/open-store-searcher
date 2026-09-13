import { act, fireEvent, render, screen, waitFor } from '@testing-library/preact';
import { App } from './app.js';
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

it('labels collection dates before initial load, after failure, during retry and after success', async () => {
  let reject!: (error: Error) => void;
  let resolve!: (response: Response) => void;
  const first = new Promise<Response>((_resolve, fail) => {
    reject = fail;
  });
  const retry = new Promise<Response>((done) => {
    resolve = done;
  });
  const fetcher = vi.fn().mockReturnValueOnce(first).mockReturnValueOnce(retry);
  vi.stubGlobal('fetch', fetcher);
  const loader = createPublicationLoader('/fixed.json');
  render(<App loader={loader} />);
  const check = () => {
    expect(screen.getByText(/다시 불러오기는 원본 데이터가/).textContent).toContain(
      '수집일과 원본 출처',
    );
    expect(screen.getByText('각 결과 카드의 원본 출처와 수집일을 함께 확인하세요.')).toBeTruthy();
    expect(screen.queryByText('데이터 기준일: 확인되지 않음')).toBeNull();
    expect(screen.getByText(/원천 데이터 기준일은 확인되지 않았습니다/)).toBeTruthy();
  };
  check();
  expect(screen.getByText('데이터 수집일: 확인되지 않음')).toBeTruthy();
  await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
  await act(async () => reject(new Error('offline')));
  await screen.findByRole('alert');
  check();
  expect(screen.getByText('데이터 수집일: 확인되지 않음')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: '데이터 다시 불러오기' }));
  await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
  check();
  expect(screen.getByText('데이터 수집일: 확인되지 않음')).toBeTruthy();
  await act(async () => resolve(new Response(JSON.stringify(collected()))));
  await screen.findByText('데이터 수집일: 2026-09-12');
  check();
  expect(screen.queryByRole('alert')).toBeNull();
});

it('drops collection-date hints when switching to a loader with unknown date basis', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => new Promise(() => {})),
  );
  const { rerender } = render(<App loader={createPublicationLoader('/fixed.json')} />);
  expect(screen.getByText('데이터 수집일: 확인되지 않음')).toBeTruthy();
  rerender(
    <App
      loader={{
        kind: 'source',
        sourceLabel: 'test source',
        sourceUrl: null,
        load: () => new Promise(() => {}),
      }}
    />,
  );
  expect(screen.getByText('데이터 기준일: 확인되지 않음')).toBeTruthy();
  expect(screen.getByText(/다시 불러오기는 원본 데이터가/).textContent).toContain(
    '데이터 기준일과 원본 출처',
  );
  expect(
    screen.getByText('각 결과 카드의 원본 출처와 데이터 기준일을 함께 확인하세요.'),
  ).toBeTruthy();
  expect(screen.queryByText(/원천 데이터 기준일은 확인되지 않았습니다/)).toBeNull();
});
