import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/preact';
import { userEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createSearchIndex, searchCandidates } from '../search/search-candidates.js';
import { makeDataset, queries } from '../../tests/performance/metrics.js';
import { SearchResults } from './search-results.js';
import type { DisplayDataset } from './display-data.js';
import type { CompactPage, WorkerRequest } from './compact-worker-protocol.js';
import { App } from './app.js';
import { demoDataset } from './demo-data.js';
import type { DisplayLoader } from './use-display-data.js';

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

const tieQuery = '가상동률 식당 서울특별시 종로구 자하문로 20';
function submitWorkspace(query: string) {
  const input = screen.getByRole('searchbox');
  fireEvent.input(input, { target: { value: query } });
  fireEvent.submit(input.closest('form') as HTMLFormElement);
}
function detail() {
  return document.querySelector<HTMLElement>('.workspace-detail');
}
function summaries() {
  return Array.from(document.querySelectorAll<HTMLElement>('.candidate-summary'));
}
function inspectAt(index: number) {
  const summary = summaries()[index];
  if (!summary) throw new Error('Missing candidate summary');
  const button = within(summary).getByRole('button', { name: /상세 보기/ });
  fireEvent.click(button);
  return button;
}
function similarFixture(size: number): DisplayDataset {
  const fixture = makeDataset(Math.max(1, size));
  return {
    ...fixture,
    records: fixture.records.slice(0, size).map((record) => ({ ...record, name: queries.common })),
  };
}
function pageOf(dataset: DisplayDataset, query: string, page = 0): CompactPage {
  const result = searchCandidates(createSearchIndex(dataset.records), query);
  return {
    ...result,
    page,
    similarCandidates: result.similarCandidates.slice(page * 20, page * 20 + 20),
  };
}

describe('TASK-027 background refresh pagination', () => {
  it('keeps all applicable accepted-page controls usable during a pending refresh and after rejection', async () => {
    const dataset = similarFixture(47);
    let rejectRefresh!: (reason: Error) => void;
    const pending = new Promise<unknown>((_resolve, reject) => {
      rejectRefresh = reject;
    });
    const loader: DisplayLoader = {
      kind: 'synthetic',
      sourceLabel: dataset.sourceLabel,
      sourceUrl: null,
      load: vi.fn().mockResolvedValueOnce(dataset).mockReturnValueOnce(pending),
    };
    render(<App loader={loader} />);
    const submit = screen.getByRole('button', { name: '검색', exact: true }) as HTMLButtonElement;
    await waitFor(() => expect(submit.disabled).toBe(false));
    submitWorkspace(queries.common);
    const result = screen.getByRole('region', { name: '검색 결과' });
    const buttons = () =>
      within(screen.getByRole('navigation', { name: '유사 후보 페이지' })).getAllByRole(
        'button',
      ) as HTMLButtonElement[];
    const selected = inspectAt(2);
    const acceptedDetail = detail();
    fireEvent.click(screen.getByRole('button', { name: '데이터 다시 불러오기' }));
    await waitFor(() =>
      expect(acceptedAnnouncement()).toContain(
        '데이터를 다시 불러오는 중입니다. 이전 데이터로 검색할 수 있습니다.',
      ),
    );
    expect(buttons().map((button) => button.disabled)).toEqual([true, true, false, false]);
    expect(result.getAttribute('aria-busy')).toBe('false');
    expect(submit.disabled).toBe(false);
    expect(submit.closest('form')?.getAttribute('aria-busy')).toBe('true');
    expect(detail()).toBe(acceptedDetail);
    expect(selected.getAttribute('aria-pressed')).toBe('true');
    expect(result.getAttribute('data-total-candidates')).toBe('47');
    expect(acceptedAnnouncement()).toContain('검색 1회 완료 · 일치 후보 0개 · 유사 후보 47개');
    for (const [control, start, count, page, disabled] of [
      ['다음 페이지', 21, 20, 2, [false, false, false, false]],
      ['마지막 페이지', 41, 7, 3, [false, false, true, true]],
      ['이전 페이지', 21, 20, 2, [false, false, false, false]],
      ['처음 페이지', 1, 20, 1, [true, true, false, false]],
    ] as const) {
      inspectAt(0);
      fireEvent.click(screen.getByRole('button', { name: control }));
      const rows = summaries();
      expect(rows).toHaveLength(count);
      expect(rows.map((row) => row.parentElement?.getAttribute('aria-posinset'))).toEqual(
        Array.from({ length: count }, (_, index) => String(start + index)),
      );
      expect(rows.every((row) => row.parentElement?.getAttribute('aria-setsize') === '47')).toBe(
        true,
      );
      expect(within(result).getByRole('status').textContent).toBe(
        `유사 후보 47개 중 ${start}–${start + count - 1}개 · ${page}/3페이지`,
      );
      expect(buttons().map((button) => button.disabled)).toEqual(disabled);
      expect(detail()).toBeNull();
      expect(
        rows.every(
          (row) => within(row).getByRole('button').getAttribute('aria-pressed') === 'false',
        ),
      ).toBe(true);
      expect(document.activeElement).toBe(screen.getByRole('heading', { name: '유사 후보' }));
      expect(acceptedAnnouncement()).toContain('이전 데이터로 검색할 수 있습니다.');
    }
    const inspected = inspectAt(2);
    const beforeFailure = detail();
    await act(async () => rejectRefresh(new Error('private refresh failure')));
    expect((await screen.findByRole('alert')).textContent).toContain('이전 데이터로 계속 검색');
    expect(detail()).toBe(beforeFailure);
    expect(inspected.getAttribute('aria-pressed')).toBe('true');
    expect(buttons().map((button) => button.disabled)).toEqual([true, true, false, false]);
    expect(submit.disabled).toBe(false);
    expect(submit.closest('form')?.getAttribute('aria-busy')).toBe('false');
    fireEvent.click(screen.getByRole('button', { name: '다음 페이지' }));
    expect(summaries()).toHaveLength(20);
    expect(within(result).getByRole('status').textContent).toContain('21–40개 · 2/3페이지');
    expect(detail()).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('heading', { name: '유사 후보' }));
  });
});

// PG-03/08/10: inspection is ephemeral presentation, never a new identity decision.
describe('TASK-027 candidate inspection', () => {
  it('auto-inspects only a unique primary without stealing submission focus', async () => {
    render(<App dataset={demoDataset} />);
    const submit = screen.getByRole('button', { name: '검색', exact: true });
    submit.focus();
    submitWorkspace(demoDataset.exampleQuery);
    expect(detail()?.querySelector('h3')?.textContent).toBe('가상별빛 카페');
    expect(document.activeElement).toBe(screen.getByRole('searchbox'));
    expect(summaries()).toHaveLength(2);
    expect(
      within(summaries()[0] as HTMLElement)
        .getByRole('button')
        .getAttribute('aria-pressed'),
    ).toBe('true');
    expect(detail()?.querySelector('.status-badge')?.textContent).toBe('행정상 영업');
  });

  it('inspects a tied candidate without confirming identity and returns focus', async () => {
    render(<App dataset={demoDataset} />);
    submitWorkspace(tieQuery);
    expect(detail()).toBeNull();
    const before = summaries().map((row) => row.textContent);
    const button = inspectAt(1);
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(detail()?.querySelector('h3')).toBe(document.activeElement);
    expect(detail()?.querySelector('.status-badge')?.textContent).toBe('폐업');
    expect(detail()?.textContent).toContain('일치 신뢰도 높음');
    expect(
      screen.getByText('동일하게 일치하는 후보가 여러 개입니다. 원본 정보를 비교해 주세요.'),
    ).toBeTruthy();
    expect(summaries().map((row) => row.textContent?.replace('상세 보는 중', '상세 보기'))).toEqual(
      before,
    );
    await userEvent.setup().click(screen.getByRole('button', { name: '후보 목록으로 돌아가기' }));
    expect(button).toBe(document.activeElement);
  });

  it.each(['{Enter}', ' '])(
    'inspects a similar candidate with %j and keeps its uncertainty',
    async (key) => {
      render(<App dataset={demoDataset} />);
      submitWorkspace('가상별빛 카페');
      expect(detail()).toBeNull();
      const button = screen.getByRole('button', { name: /강남구 테헤란로 12-1.*상세 보기/ });
      button.focus();
      await userEvent.setup().keyboard(key);
      expect(detail()?.querySelector('h3')).toBe(document.activeElement);
      expect(detail()?.textContent).toContain('일치 신뢰도 낮음');
      expect(detail()?.textContent).toContain(
        '검색한 사업체와 같은 곳인지 주소와 원본 정보를 확인하세요.',
      );
      expect(detail()?.querySelector('.status-badge')?.textContent).toBe('휴업');
      fireEvent.click(screen.getByRole('button', { name: '후보 목록으로 돌아가기' }));
      expect(document.activeElement).toBe(button);
    },
  );

  it('preserves accepted inspection while editing and resets on an identical submission', () => {
    render(<App dataset={demoDataset} />);
    submitWorkspace(tieQuery);
    inspectAt(1);
    const accepted = detail();
    fireEvent.input(screen.getByRole('searchbox'), {
      target: { value: '아직 제출하지 않은 검색어' },
    });
    expect(detail()).toBe(accepted);
    expect(screen.getByText(`검색 결과: ${tieQuery}`)).toBeTruthy();
    submitWorkspace(tieQuery);
    expect(detail()).toBeNull();
    expect(
      summaries().every(
        (row) => within(row).getByRole('button').getAttribute('aria-pressed') === 'false',
      ),
    ).toBe(true);
    submitWorkspace(demoDataset.exampleQuery);
    inspectAt(1);
    submitWorkspace(demoDataset.exampleQuery);
    expect(detail()?.querySelector('.status-badge')?.textContent).toBe('행정상 영업');
    submitWorkspace('없는합성사업체');
    expect(detail()).toBeNull();
    expect(summaries()).toHaveLength(0);
    expect(screen.getByText(/일치하는 공개 인허가 데이터를 찾지 못했습니다/)).toBeTruthy();
  });

  it('clears off-page inspection while retaining persistent top matches', () => {
    const dataset = makeDataset(47);
    const result = searchCandidates(createSearchIndex(dataset.records), queries.address);
    render(<SearchResults result={result} coverage={dataset.coverage} />);
    expect(result.topMatches.length).toBeGreaterThan(0);
    inspectAt(result.topMatches.length);
    fireEvent.click(screen.getByRole('button', { name: '다음 페이지' }));
    expect(detail()).toBeNull();
    expect(screen.getByRole('heading', { name: '유사 후보' })).toBe(document.activeElement);
    expect(screen.getByRole('status').textContent).toContain('21–40');
    const button = inspectAt(0);
    const name = detail()?.querySelector('h3')?.textContent;
    fireEvent.click(screen.getByRole('button', { name: '마지막 페이지' }));
    expect(detail()?.querySelector('h3')?.textContent).toBe(name);
    fireEvent.click(screen.getByRole('button', { name: '후보 목록으로 돌아가기' }));
    expect(document.activeElement).toBe(button);
  });

  it('returns to the originating list heading when the invoking button was disconnected', () => {
    render(<App dataset={demoDataset} />);
    submitWorkspace('가상별빛 카페');
    const button = inspectAt(1);
    button.remove();
    fireEvent.click(screen.getByRole('button', { name: '후보 목록으로 돌아가기' }));
    expect(document.activeElement).toBe(screen.getByRole('heading', { name: '유사 후보' }));
  });

  it.each([
    [demoDataset.exampleQuery, '가장 잘 일치하는 결과'],
    [tieQuery, '일치 후보'],
  ])('returns to the originating %s group when its inspect button disappears', (query, heading) => {
    render(<App dataset={demoDataset} />);
    submitWorkspace(query);
    const button = inspectAt(0);
    button.remove();
    fireEvent.click(screen.getByRole('button', { name: '후보 목록으로 돌아가기' }));
    expect(document.activeElement).toBe(screen.getByRole('heading', { name: heading }));
  });

  it('clears results and inspection when a replacement dataset reuses record IDs', () => {
    const view = render(<App dataset={demoDataset} />);
    submitWorkspace(demoDataset.exampleQuery);
    inspectAt(1);
    view.rerender(
      <App
        dataset={{
          ...demoDataset,
          records: demoDataset.records.map((record) => ({
            ...record,
            name: `새 자료 ${record.name}`,
          })),
          coverage: { kind: 'unavailable' },
        }}
      />,
    );
    expect(detail()).toBeNull();
    expect(summaries()).toHaveLength(0);
    expect(screen.queryByText(/검색 결과:/)).toBeNull();
    submitWorkspace('새 자료 가상별빛 카페');
    expect(detail()).toBeNull();
    inspectAt(0);
    expect(detail()?.querySelector('h3')?.textContent).toBe('새 자료 가상별빛 카페');
    expect(detail()?.textContent).toContain('데이터 기준일: 확인되지 않음');
  });
});

describe.each(['local', 'worker'] as const)('TASK-027 %s pagination boundaries', (mode) => {
  it.each([0, 1, 20, 21, 47])(
    'reaches exactly %s similar candidates in engine order and absolute positions',
    (size) => {
      const dataset = similarFixture(size);
      const full = searchCandidates(createSearchIndex(dataset.records), queries.common);
      let page = 0;
      const onPage = (next: number) => {
        page = next;
        view.rerender(
          <SearchResults
            result={pageOf(dataset, queries.common, next)}
            coverage={dataset.coverage}
            onPage={onPage}
          />,
        );
      };
      const view = render(
        <SearchResults
          result={mode === 'local' ? full : pageOf(dataset, queries.common)}
          coverage={dataset.coverage}
          {...(mode === 'worker' ? { onPage } : {})}
        />,
      );
      expect(
        screen.getByRole('region', { name: '검색 결과' }).getAttribute('data-total-candidates'),
      ).toBe(String(size));
      expect(detail()).toBeNull();
      const seen: string[] = [];
      for (let start = 0; start < size; start += 20) {
        const rows = summaries();
        expect(rows).toHaveLength(Math.min(20, size - start));
        rows.forEach((row, index) => {
          const match = full.similarCandidates[start + index];
          expect(row.getAttribute('aria-label')).toContain(`후보 ${start + index + 1}`);
          expect(row.getAttribute('aria-label')).toContain(match?.record.roadAddress);
          expect(row.parentElement?.getAttribute('aria-posinset')).toBe(String(start + index + 1));
          expect(row.parentElement?.getAttribute('aria-setsize')).toBe(String(size));
          seen.push(row.getAttribute('aria-label') ?? '');
        });
        if (start + 20 < size) {
          inspectAt(0);
          fireEvent.click(screen.getByRole('button', { name: '다음 페이지' }));
          expect(detail()).toBeNull();
          expect(document.activeElement).toBe(screen.getByRole('heading', { name: '유사 후보' }));
        }
      }
      expect(new Set(seen).size).toBe(size);
      if (size <= 20)
        expect(screen.queryByRole('navigation', { name: '유사 후보 페이지' })).toBeNull();
      else {
        expect(
          (screen.getByRole('button', { name: '다음 페이지' }) as HTMLButtonElement).disabled,
        ).toBe(true);
        fireEvent.click(screen.getByRole('button', { name: '이전 페이지' }));
        fireEvent.click(screen.getByRole('button', { name: '처음 페이지' }));
        expect(summaries()[0]?.getAttribute('aria-label')).toContain('후보 1');
        expect(page).toBe(0);
      }
    },
  );
});

// This transport double controls only message timing. App, loader, request guards,
// ranking fixtures, summaries and evidence all remain real.
class WorkspaceWorker {
  static instances: WorkspaceWorker[] = [];
  onmessage: ((event: { data: unknown }) => void) | null = null;
  onerror: (() => void) | null = null;
  onmessageerror: (() => void) | null = null;
  messages: WorkerRequest[] = [];
  constructor() {
    WorkspaceWorker.instances.push(this);
  }
  terminate() {}
  postMessage(message: WorkerRequest) {
    this.messages.push(message);
  }
  reply(payload: Record<string, unknown>, request = this.messages.at(-1)?.request) {
    this.onmessage?.({
      data: { version: 1, generation: this.messages[0]?.generation, request, ...payload },
    });
  }
  ready(dataset: DisplayDataset) {
    const { records, ...metadata } = dataset;
    this.reply({
      kind: 'ready',
      metadata,
      recordCount: records.length,
      manifestHash: 'a'.repeat(64),
      timings: { loadMs: 1, prepareMs: 1 },
    });
  }
}
const compactLoader = {
  kind: 'synthetic' as const,
  sourceLabel: '합성 Worker 시험',
  sourceUrl: null,
  compactUrl: `https://example.test/assets/compact-manifest-${'a'.repeat(64)}.json`,
  load: async () => {
    throw new Error('Compact path must use its Worker');
  },
};
async function readyWorkspace(dataset = demoDataset) {
  render(<App loader={compactLoader} />);
  await waitFor(() => expect(WorkspaceWorker.instances.length).toBe(1));
  const worker = WorkspaceWorker.instances[0] as WorkspaceWorker;
  act(() => worker.ready(dataset));
  await waitFor(() =>
    expect(
      (screen.getByRole('button', { name: '검색', exact: true }) as HTMLButtonElement).disabled,
    ).toBe(false),
  );
  return worker;
}
async function acceptSearch(worker: WorkspaceWorker, dataset: DisplayDataset, query: string) {
  submitWorkspace(query);
  await act(async () => worker.reply({ kind: 'page', result: pageOf(dataset, query) }));
}
function acceptedAnnouncement() {
  return document.querySelector('.result-summary')?.textContent;
}

describe('TASK-027 real App deferred compact inspection', () => {
  beforeEach(() => {
    WorkspaceWorker.instances = [];
    vi.stubGlobal('Worker', WorkspaceWorker);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('resets explicit compact inspection on every accepted identical search while draft edits preserve it', async () => {
    const worker = await readyWorkspace();
    await acceptSearch(worker, demoDataset, demoDataset.exampleQuery);
    const button = screen.getByRole('button', { name: /강남구 테헤란로 12-1.*상세 보기/ });
    fireEvent.click(button);
    expect(detail()?.querySelector('.status-badge')?.textContent).toBe('휴업');
    fireEvent.input(screen.getByRole('searchbox'), { target: { value: '제출 전 편집' } });
    expect(detail()?.querySelector('.status-badge')?.textContent).toBe('휴업');
    expect(screen.getByText(`검색 결과: ${demoDataset.exampleQuery}`)).toBeTruthy();
    submitWorkspace(demoDataset.exampleQuery);
    expect(detail()?.querySelector('.status-badge')?.textContent).toBe('휴업');
    await act(async () =>
      worker.reply({ kind: 'page', result: pageOf(demoDataset, demoDataset.exampleQuery) }),
    );
    expect(detail()?.querySelector('.status-badge')?.textContent).toBe('행정상 영업');
    expect(document.activeElement).toBe(screen.getByRole('searchbox'));
    await acceptSearch(worker, demoDataset, tieQuery);
    expect(detail()).toBeNull();
    inspectAt(1);
    await acceptSearch(worker, demoDataset, tieQuery);
    expect(detail()).toBeNull();
    expect(summaries()).toHaveLength(2);
    expect(acceptedAnnouncement()).toContain('검색 4회 완료');
  });

  it('keeps accepted inspection during deferred paging, blocks repeated page actions and clears only off-page selections', async () => {
    const dataset = makeDataset(47);
    const worker = await readyWorkspace(dataset);
    await acceptSearch(worker, dataset, queries.address);
    inspectAt(1);
    const oldDetail = detail();
    const oldRows = summaries().map((row) => row.getAttribute('aria-label'));
    const next = screen.getByRole('button', { name: '다음 페이지' });
    fireEvent.click(next);
    const requestCount = worker.messages.length;
    expect(screen.getByRole('region', { name: '검색 결과' }).getAttribute('aria-busy')).toBe(
      'true',
    );
    expect(detail()).toBe(oldDetail);
    expect(summaries().map((row) => row.getAttribute('aria-label'))).toEqual(oldRows);
    for (const button of within(
      screen.getByRole('navigation', { name: '유사 후보 페이지' }),
    ).getAllByRole('button')) {
      expect((button as HTMLButtonElement).disabled).toBe(true);
      fireEvent.click(button);
    }
    expect(worker.messages.length).toBe(requestCount);
    expect(worker.messages.at(-1)).toMatchObject({ kind: 'page', page: 1 });
    await act(async () =>
      worker.reply({ kind: 'page', result: pageOf(dataset, queries.address, 1) }),
    );
    expect(detail()).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('heading', { name: '유사 후보' }));
    expect(screen.getByText(/유사 후보 46개 중 21–40개/)).toBeTruthy();
    inspectAt(0);
    const top = detail()?.querySelector('h3')?.textContent;
    fireEvent.click(screen.getByRole('button', { name: '마지막 페이지' }));
    await act(async () =>
      worker.reply({ kind: 'page', result: pageOf(dataset, queries.address, 2) }),
    );
    expect(detail()?.querySelector('h3')?.textContent).toBe(top);
    expect(screen.getByText(/유사 후보 46개 중 41–46개/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '이전 페이지' }));
    await act(async () =>
      worker.reply({ kind: 'page', result: pageOf(dataset, queries.address, 1) }),
    );
    fireEvent.click(screen.getByRole('button', { name: '처음 페이지' }));
    await act(async () =>
      worker.reply({ kind: 'page', result: pageOf(dataset, queries.address, 0) }),
    );
    expect(detail()?.querySelector('h3')?.textContent).toBe(top);
  });

  it('retains accepted page, query and inspection after page and search rejection', async () => {
    const dataset = similarFixture(47);
    const worker = await readyWorkspace(dataset);
    await acceptSearch(worker, dataset, queries.common);
    fireEvent.click(screen.getByRole('button', { name: '다음 페이지' }));
    await act(async () =>
      worker.reply({ kind: 'page', result: pageOf(dataset, queries.common, 1) }),
    );
    inspectAt(4);
    const selected = detail();
    const selectedName = selected?.getAttribute('aria-label');
    fireEvent.click(screen.getByRole('button', { name: '다음 페이지' }));
    await act(async () => worker.reply({ kind: 'error', message: 'private paging failure' }));
    expect((await screen.findByRole('alert')).textContent).toContain('검색을 완료하지 못했습니다');
    expect(detail()).toBe(selected);
    expect(screen.getByText(/유사 후보 47개 중 21–40개/)).toBeTruthy();
    expect(screen.getByText(`검색 결과: ${queries.common}`)).toBeTruthy();
    expect(screen.getByRole('region', { name: '검색 결과' }).getAttribute('aria-busy')).toBe(
      'false',
    );
    submitWorkspace('새로 요청한 검색어');
    expect(detail()?.getAttribute('aria-label')).toBe(selectedName);
    expect(screen.getByText(`검색 결과: ${queries.common}`)).toBeTruthy();
    await act(async () => worker.reply({ kind: 'error', message: 'private search failure' }));
    expect((await screen.findByRole('alert')).textContent).not.toContain('private');
    expect(detail()?.getAttribute('aria-label')).toBe(selectedName);
    expect(screen.getByText(/유사 후보 47개 중 21–40개/)).toBeTruthy();
    expect(acceptedAnnouncement()).toContain('검색 1회 완료');
    await acceptSearch(worker, dataset, queries.common);
    expect(detail()).toBeNull();
    expect(screen.getByText(/유사 후보 47개 중 1–20개/)).toBeTruthy();
    expect(acceptedAnnouncement()).toContain('검색 3회 완료');
  });

  it('does not report pending work or send page requests after the accepted search Worker fails', async () => {
    const dataset = similarFixture(47);
    const worker = await readyWorkspace(dataset);
    await acceptSearch(worker, dataset, queries.common);
    const acceptedRows = summaries().map((row) => row.getAttribute('aria-label'));
    await act(async () => worker.onerror?.());
    expect((await screen.findByRole('alert')).textContent).toContain(
      '데이터를 불러오지 못했습니다',
    );
    expect(
      (screen.getByRole('button', { name: '검색', exact: true }) as HTMLButtonElement).disabled,
    ).toBe(true);
    expect(screen.getByRole('region', { name: '검색 결과' }).getAttribute('aria-busy')).toBe(
      'false',
    );
    expect(
      screen.queryByText('검색 결과를 불러오는 중입니다. 이전 후보와 상세 정보를 표시합니다.'),
    ).toBeNull();
    const requests = worker.messages.length;
    for (const button of within(
      screen.getByRole('navigation', { name: '유사 후보 페이지' }),
    ).getAllByRole('button')) {
      fireEvent.click(button);
    }
    expect(worker.messages.length).toBe(requests);
    expect(summaries().map((row) => row.getAttribute('aria-label'))).toEqual(acceptedRows);
  });

  it('ignores superseded search and page replies while preserving accepted inspection until success', async () => {
    const dataset = makeDataset(47);
    const worker = await readyWorkspace(dataset);
    await acceptSearch(worker, dataset, queries.address);
    inspectAt(2);
    const oldDetail = detail();
    fireEvent.click(screen.getByRole('button', { name: '다음 페이지' }));
    const oldPageRequest = worker.messages.at(-1)?.request;
    submitWorkspace(queries.exact);
    const exactRequest = worker.messages.at(-1)?.request;
    await act(async () =>
      worker.reply({ kind: 'page', result: pageOf(dataset, queries.address, 1) }, oldPageRequest),
    );
    expect(detail()).toBe(oldDetail);
    expect(screen.getByText(`검색 결과: ${queries.address}`)).toBeTruthy();
    await act(async () =>
      worker.reply({ kind: 'page', result: pageOf(dataset, queries.exact) }, exactRequest),
    );
    expect(detail()?.querySelector('h3')?.textContent).toBe('합성개별1호');
    expect(screen.getByText(`검색 결과: ${queries.exact}`)).toBeTruthy();
    submitWorkspace(queries.common);
    const oldSearchRequest = worker.messages.at(-1)?.request;
    submitWorkspace(queries.absent);
    await act(async () => worker.reply({ kind: 'page', result: pageOf(dataset, queries.absent) }));
    expect(detail()).toBeNull();
    expect(summaries()).toHaveLength(0);
    await act(async () =>
      worker.reply({ kind: 'page', result: pageOf(dataset, queries.common) }, oldSearchRequest),
    );
    expect(summaries()).toHaveLength(0);
    expect(screen.getByText(`검색 결과: ${queries.absent}`)).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('retains inspection on failed refresh and discards old-dataset replies after replacement reuses IDs', async () => {
    const worker = await readyWorkspace();
    await acceptSearch(worker, demoDataset, tieQuery);
    inspectAt(1);
    const oldDetail = detail();
    fireEvent.click(screen.getByRole('button', { name: '데이터 다시 불러오기' }));
    await waitFor(() => expect(WorkspaceWorker.instances.length).toBe(2));
    expect(detail()).toBe(oldDetail);
    await act(async () =>
      (WorkspaceWorker.instances[1] as WorkspaceWorker).reply({
        kind: 'error',
        message: 'bad candidate',
      }),
    );
    expect((await screen.findByRole('alert')).textContent).toContain('이전 데이터');
    expect(detail()).toBe(oldDetail);
    expect(
      within(detail() as HTMLElement).getByText('예시 데이터 기준일: 2026-09-01'),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '데이터 다시 불러오기' }));
    await waitFor(() => expect(WorkspaceWorker.instances.length).toBe(3));
    submitWorkspace(tieQuery);
    const obsolete = worker.messages.at(-1)?.request;
    const replacement = {
      ...demoDataset,
      records: demoDataset.records.map((record) => ({ ...record, name: `새 자료 ${record.name}` })),
      coverage: { kind: 'unavailable' as const },
    };
    const fresh = WorkspaceWorker.instances[2] as WorkspaceWorker;
    await act(async () => fresh.ready(replacement));
    await waitFor(() => expect(detail()).toBeNull());
    expect(summaries()).toHaveLength(0);
    expect(screen.queryByText(/검색 결과:/)).toBeNull();
    await act(async () =>
      worker.reply({ kind: 'page', result: pageOf(demoDataset, tieQuery) }, obsolete),
    );
    expect(detail()).toBeNull();
    expect(summaries()).toHaveLength(0);
    expect(screen.queryByRole('alert')).toBeNull();
    await acceptSearch(fresh, replacement, '새 자료 가상별빛 카페');
    expect(detail()).toBeNull();
    inspectAt(0);
    expect(detail()?.querySelector('h3')?.textContent).toBe('새 자료 가상별빛 카페');
    expect(detail()?.textContent).toContain('데이터 기준일: 확인되지 않음');
  });
});
