import { act, render, screen, within } from '@testing-library/preact';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from './app.js';
import { demoDataset } from './demo-data.js';

// PG-01/02/04/10/13: the initial workspace must not imply a selected business.
describe('TASK-027 workspace shell', () => {
  it('shows a truthful empty workspace and navigates without changing the URL', async () => {
    const originalUrl = window.location.href;
    render(<App dataset={demoDataset} />);
    expect(screen.queryByRole('article')).toBeNull();
    const navigation = screen.getByRole('navigation', { name: '작업 공간' });
    const user = userEvent.setup();
    await user.click(within(navigation).getByRole('button', { name: '검색으로 이동' }));
    expect(screen.getByRole('searchbox')).toBe(document.activeElement);
    expect(window.location.href).toBe(originalUrl);
    await user.click(within(navigation).getByRole('button', { name: '결과로 이동' }));
    expect(screen.getByRole('heading', { name: '검색을 시작해 보세요' })).toBe(
      document.activeElement,
    );
    expect(window.location.href).toBe(originalUrl);
    await user.click(within(navigation).getByRole('button', { name: '안내로 이동' }));
    expect(screen.getByRole('heading', { name: '출처와 이용 안내' })).toBe(document.activeElement);
    expect(window.location.href).toBe(originalUrl);
    await user.click(screen.getByRole('button', { name: /예시 입력/ }));
    await user.click(screen.getByRole('button', { name: '검색', exact: true }));
    await user.click(within(navigation).getByRole('button', { name: '결과로 이동' }));
    expect(screen.getByRole('region', { name: '검색 결과' })).toBe(document.activeElement);
    expect(window.location.href).toBe(originalUrl);
  });

  it('shows real dataset context without invented candidates, totals or status badges', () => {
    render(<App dataset={demoDataset} />);
    const workspace = within(screen.getByRole('region', { name: '검색 시작 안내' }));
    expect(workspace.getByText(demoDataset.sourceLabel)).toBeTruthy();
    expect(screen.getByText('예시 데이터 기준일: 2026-09-01')).toBeTruthy();
    expect(screen.getByText('합성 예시 데이터 · 실제 사업체 조회가 아닙니다')).toBeTruthy();
    expect(workspace.queryByRole('article')).toBeNull();
    expect(workspace.queryByText(/후보 \d+개|행정상 영업|휴업|폐업/)).toBeNull();
    expect(document.querySelector('.status-badge')).toBeNull();
  });

  it('fills the example without submitting or creating business facts', async () => {
    render(<App dataset={demoDataset} />);
    await userEvent.setup().click(screen.getByRole('button', { name: /예시 입력/ }));
    expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe(
      demoDataset.exampleQuery,
    );
    expect(screen.queryByRole('article')).toBeNull();
    expect(screen.getByRole('region', { name: '검색 시작 안내' })).toBeTruthy();
    expect(screen.getByRole('status').textContent).not.toContain('완료');
  });

  it('blocks initial submit and preserves synthetic and unavailable notices while loading', () => {
    render(
      <App
        loader={{
          kind: 'synthetic',
          sourceLabel: '합성 로딩 시험',
          sourceUrl: null,
          load: () => new Promise(() => {}),
        }}
      />,
    );
    expect(
      (screen.getByRole('button', { name: '검색', exact: true }) as HTMLButtonElement).disabled,
    ).toBe(true);
    expect(screen.getByText('합성 예시 데이터 · 실제 사업체 조회가 아닙니다')).toBeTruthy();
    expect(screen.getByText('데이터 기준일: 확인되지 않음')).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain('불러오는 중');
    expect(
      within(screen.getByRole('region', { name: '검색 시작 안내' })).getByText('합성 로딩 시험'),
    ).toBeTruthy();
    expect(screen.queryByRole('article')).toBeNull();
  });

  it('settles form busy state after a rejected initial load while keeping submit unavailable', async () => {
    let rejectLoad!: (reason: Error) => void;
    const pending = new Promise<unknown>((_resolve, reject) => {
      rejectLoad = reject;
    });
    render(
      <App
        loader={{
          kind: 'synthetic',
          sourceLabel: '합성 로딩 시험',
          sourceUrl: null,
          load: () => pending,
        }}
      />,
    );
    const form = screen.getByRole('searchbox').closest('form');
    const submit = screen.getByRole('button', { name: '검색', exact: true }) as HTMLButtonElement;
    expect(form?.getAttribute('aria-busy')).toBe('true');
    expect(submit.disabled).toBe(true);
    await act(async () => rejectLoad(new Error('offline')));
    expect((await screen.findByRole('alert')).textContent).toContain(
      '데이터를 불러오지 못했습니다.',
    );
    expect(form?.getAttribute('aria-busy')).toBe('false');
    expect(submit.disabled).toBe(true);
    expect(screen.getByRole('status').textContent).not.toContain('불러오는 중');
  });
});
