import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/preact';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from './app.js';
import { demoDataset } from './demo-data.js';

function deferred() {
  let resolve!: (value: unknown) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<unknown>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
function source(load: () => Promise<unknown>) {
  return { load, sourceLabel: '합성 로딩 시험', sourceUrl: null, kind: 'synthetic' as const };
}
async function submit(query = demoDataset.exampleQuery) {
  fireEvent.input(screen.getByRole('searchbox'), { target: { value: query } });
  const form = screen.getByRole('searchbox').closest('form');
  if (!form) throw new Error('Search form missing');
  fireEvent.submit(form);
}

describe('TASK-015 recovery', () => {
  it('allows draft editing but blocks search until loading succeeds', async () => {
    const pending = deferred();
    render(<App loader={source(() => pending.promise)} />);
    expect(screen.getByRole('status').textContent).toContain('불러오는 중');
    expect(
      (screen.getByRole('button', { name: '검색', exact: true }) as HTMLButtonElement).disabled,
    ).toBe(true);
    await submit();
    expect(screen.queryByRole('article')).toBeNull();
    expect(screen.getByRole('contentinfo').textContent).toContain('합성 로딩 시험');
    await act(async () => pending.resolve(demoDataset));
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('불러왔습니다'));
    expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe(
      demoDataset.exampleQuery,
    );
    await submit();
    expect(screen.getByRole('region', { name: '가장 잘 일치하는 결과' })).toBeTruthy();
  });

  it('recovers initial failure with keyboard retry and a query-free issue link', async () => {
    let calls = 0;
    render(
      <App
        loader={source(async () => {
          if (++calls === 1) throw new Error('private failure');
          return demoDataset;
        })}
      />,
    );
    await screen.findByRole('alert');
    expect(screen.getByRole('alert').textContent).toContain('새로고침');
    expect(screen.getByRole('alert').textContent).not.toContain('private failure');
    const link = screen.getByRole('link', { name: '저장소에 오류 신고' });
    expect(link.getAttribute('href')).toBe(
      'https://github.com/internalforces/open-store-searcher/issues',
    );
    expect(link.getAttribute('referrerpolicy')).toBe('no-referrer');
    await submit('<img src=x onerror=alert(1)>');
    expect(screen.queryByText(/검색 결과:/)).toBeNull();
    const user = userEvent.setup();
    screen.getByRole('button', { name: '데이터 다시 불러오기' }).focus();
    await user.keyboard('{Enter}');
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('불러왔습니다'));
    expect(screen.queryByRole('alert')).toBeNull();
    await submit();
    expect(screen.getAllByRole('article')).toHaveLength(2);
  });

  it('keeps prior results, coverage and load time after a failed reload', async () => {
    const pending = deferred();
    let calls = 0;
    render(
      <App
        loader={source(() => (++calls === 1 ? Promise.resolve(demoDataset) : pending.promise))}
      />,
    );
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('불러왔습니다'));
    await submit();
    const loadTime = screen.getByText(/이 브라우저에서 마지막으로 불러온 시각:/).textContent;
    fireEvent.click(screen.getByRole('button', { name: '데이터 다시 불러오기' }));
    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(
      (screen.getByRole('button', { name: '검색', exact: true }) as HTMLButtonElement).disabled,
    ).toBe(false);
    await act(async () => pending.reject(new Error('offline')));
    expect((await screen.findByRole('alert')).textContent).toContain('이전 데이터');
    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(screen.getByText(/이 브라우저에서 마지막으로 불러온 시각:/).textContent).toBe(loadTime);
    expect(
      within(screen.getByRole('region', { name: '가장 잘 일치하는 결과' })).getByText(
        '예시 데이터 기준일: 2026-09-01',
      ),
    ).toBeTruthy();
    await submit('가상달빛 가게 서울특별시 중구 세종대로 30');
    expect(screen.getByText('확인되지 않음', { selector: '.status-badge' })).toBeTruthy();
  });

  it('clears obsolete results after successful replacement without claiming fresh coverage', async () => {
    let calls = 0;
    render(
      <App
        loader={source(async () =>
          ++calls === 1
            ? demoDataset
            : { ...demoDataset, records: [], coverage: { kind: 'unavailable' } },
        )}
      />,
    );
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('불러왔습니다'));
    await submit();
    fireEvent.click(screen.getByRole('button', { name: '데이터 다시 불러오기' }));
    await waitFor(() => expect(screen.queryByRole('article')).toBeNull());
    expect(screen.getByText('데이터 기준일: 확인되지 않음')).toBeTruthy();
    expect(screen.getByText(/원본 데이터가 갱신되었다는 뜻은 아닙니다/)).toBeTruthy();
    await submit();
    expect(screen.getByText(/폐업을 의미하지 않습니다/)).toBeTruthy();
  });

  it('keeps the synthetic disclaimer when a synthetic loader returns unavailable coverage', async () => {
    render(
      <App loader={source(async () => ({ ...demoDataset, coverage: { kind: 'unavailable' } }))} />,
    );
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('불러왔습니다'));
    expect(screen.getByText('합성 예시 데이터 · 실제 사업체 조회가 아닙니다')).toBeTruthy();
    expect(screen.getByRole('contentinfo').textContent).toContain(
      '실제 사업체 상태를 확인하는 데 사용할 수 없습니다.',
    );
    expect(screen.getByText('데이터 기준일: 확인되지 않음')).toBeTruthy();
  });

  it('ignores obsolete loader completions after source change and unmount', async () => {
    const old = deferred();
    const next = deferred();
    const { rerender, unmount } = render(<App loader={source(() => old.promise)} />);
    rerender(<App loader={source(() => next.promise)} />);
    await act(async () => old.resolve(demoDataset));
    expect(
      (screen.getByRole('button', { name: '검색', exact: true }) as HTMLButtonElement).disabled,
    ).toBe(true);
    expect(screen.queryByText(/불러왔습니다/)).toBeNull();
    unmount();
    await act(async () => next.reject(new Error('late')));
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('excludes malformed display records while keeping valid search and diagnostics', async () => {
    render(
      <App
        loader={source(async () => ({
          ...demoDataset,
          records: [demoDataset.records[0], { ...demoDataset.records[1], lifecycle: null }],
        }))}
      />,
    );
    await screen.findByText(/레코드 1개를 제외/);
    await submit();
    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(screen.getByText('행정상 영업', { selector: '.status-badge' })).toBeTruthy();
  });

  it.each([null, { ...demoDataset, records: [null] }])(
    'retains usable data after unusable replacement %j',
    async (replacement) => {
      let calls = 0;
      render(<App loader={source(async () => (++calls === 1 ? demoDataset : replacement))} />);
      await waitFor(() => expect(screen.getByRole('status').textContent).toContain('불러왔습니다'));
      fireEvent.click(screen.getByRole('button', { name: '데이터 다시 불러오기' }));
      await screen.findByRole('alert');
      await submit();
      expect(screen.getAllByRole('article')).toHaveLength(2);
    },
  );

  it('adds actionable empty and low-confidence guidance without changing statuses', async () => {
    render(<App dataset={demoDataset} />);
    await submit('찾을수없는상호');
    expect(screen.getByText(/도로명 주소 또는 지번 주소로 다시 검색/)).toBeTruthy();
    await submit('가상별빛 카페');
    expect(screen.getByText(/상호명과 시·군·구, 도로명과 건물번호를 함께 입력/)).toBeTruthy();
    expect(screen.getByText('행정상 영업', { selector: '.status-badge' })).toBeTruthy();
    expect(screen.getByText('휴업', { selector: '.status-badge' })).toBeTruthy();
  });
});
