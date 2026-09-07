import { act, fireEvent, render, screen, waitFor } from '@testing-library/preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as search from '../search/search-candidates.js';
import { App } from './app.js';
import { demoDataset } from './demo-data.js';
import type { DisplayLoader } from './use-display-data.js';

const loader = (load: DisplayLoader['load']): DisplayLoader => ({
  load,
  kind: 'synthetic',
  sourceLabel: '합성 로더 시험',
  sourceUrl: null,
});
afterEach(() => vi.restoreAllMocks());

describe('PR16 loader regressions', () => {
  it.each(['source change', 'unmount'])(
    'does not read an obsolete payload after %s',
    async (change) => {
      let resolve!: (value: unknown) => void;
      let reads = 0;
      let started = false;
      const pending = new Promise<unknown>((yes) => {
        resolve = yes;
      });
      const { rerender, unmount } = render(
        <App
          loader={loader(() => {
            started = true;
            return pending;
          })}
        />,
      );
      await waitFor(() => expect(started).toBe(true));
      if (change === 'unmount') unmount();
      else rerender(<App dataset={demoDataset} />);
      await act(async () =>
        resolve({
          ...demoDataset,
          get records() {
            reads++;
            return demoDataset.records;
          },
        }),
      );
      expect(reads).toBe(0);
      if (change === 'source change')
        expect(screen.getByText('예시 데이터 기준일: 2026-09-01')).toBeTruthy();
      else expect(screen.queryByRole('main')).toBeNull();
    },
  );

  it('builds one real index per load and reuses it for searches', async () => {
    const build = vi.spyOn(search, 'createSearchIndex');
    render(<App loader={loader(async () => demoDataset)} />);
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('불러왔습니다'));
    expect(build).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: /예시 입력/ }));
    fireEvent.click(screen.getByRole('button', { name: '검색', exact: true }));
    expect(screen.getAllByRole('article')).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: '검색', exact: true }));
    expect(build).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: '데이터 다시 불러오기' }));
    await waitFor(() => expect(screen.queryByRole('article')).toBeNull());
    expect(build).toHaveBeenCalledTimes(2);
    fireEvent.click(screen.getByRole('button', { name: '검색', exact: true }));
    expect(screen.getByRole('region', { name: '가장 잘 일치하는 결과' })).toBeTruthy();
    expect(build).toHaveBeenCalledTimes(2);
  });
});
