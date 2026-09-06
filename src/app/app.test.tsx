import { render, screen, within } from '@testing-library/preact';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from './app.js';
import type { DisplayDataset, DisplayRecord } from './display-data.js';

function record(id: string, name: string, roadAddress: string): DisplayRecord {
  return {
    id,
    name,
    roadAddress,
    parcelAddress: '',
    categoryName: '합성 업종',
    businessTypes: [],
    rawStatus: {
      operatingCode: '01',
      operatingName: '영업/정상',
      detailedCode: null,
      detailedName: null,
    },
    lifecycle: {
      licensedOn: null,
      licenseCancelledOn: null,
      suspendedFrom: null,
      suspendedThrough: null,
      reopenedOn: null,
      closedOn: null,
      sourceUpdatedAt: null,
      sourceLastModifiedAt: null,
    },
    sourceLabel: '합성 시험 데이터',
    sourceUrl: null,
  };
}
const dataset: DisplayDataset = {
  sourceLabel: '합성 시험 데이터',
  sourceUrl: null,
  coverage: { kind: 'synthetic', date: '2026-09-01' },
  exampleQuery: '가상별빛 카페 서울특별시 마포구 월드컵로 12-1',
  records: [
    record('exact', '가상별빛 카페', '서울특별시 마포구 월드컵로 12-1'),
    record('conflict', '가상별빛 카페', '서울특별시 강남구 테헤란로 12-1'),
    record('tie-a', '가상동률 식당', '서울특별시 종로구 자하문로 20'),
    record('tie-b', '가상동률 식당', '서울특별시 종로구 자하문로 20'),
  ],
};
async function search(query: string) {
  const user = userEvent.setup();
  const input = screen.getByRole('searchbox', { name: '상호명 또는 주소' });
  await user.clear(input);
  if (query) await user.type(input, query);
  await user.click(screen.getByRole('button', { name: '검색', exact: true }));
  return { user, input };
}

describe('App', () => {
  it('renders the application name as the page heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'open-store-searcher' })).toBeTruthy();
  });

  it('shows truthful demo context, source and disclaimer before searching', () => {
    render(<App />);
    expect(screen.getByText('합성 예시 데이터 · 실제 사업체 조회가 아닙니다')).toBeTruthy();
    expect(screen.getByText('예시 데이터 기준일: 2026-09-01')).toBeTruthy();
    expect(screen.getByText('현재 문이 열려 있는지는 확인할 수 없습니다')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: '향후 실제 데이터 출처: 행정안전부 공공데이터' }),
    ).toBeTruthy();
    expect(screen.queryByRole('article')).toBeNull();
  });

  it('fills the example without submitting and supports Enter submission', async () => {
    render(<App dataset={dataset} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /예시 입력/ }));
    const input = screen.getByRole('searchbox') as HTMLInputElement;
    expect(input.value).toBe('가상별빛 카페 서울특별시 마포구 월드컵로 12-1');
    expect(screen.queryByRole('article')).toBeNull();
    await user.click(input);
    await user.keyboard('{Enter}');
    expect(screen.getByRole('region', { name: '가장 잘 일치하는 결과' })).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain('일치 후보 1개');
  });

  it('renders the exact primary once and keeps the same-name address conflict in similar candidates', async () => {
    render(<App dataset={dataset} />);
    await search(dataset.exampleQuery);
    const primary = within(screen.getByRole('region', { name: '가장 잘 일치하는 결과' }));
    expect(primary.getAllByRole('article')).toHaveLength(1);
    expect(primary.getByText('서울특별시 마포구 월드컵로 12-1')).toBeTruthy();
    const similar = within(screen.getByRole('region', { name: '유사 후보' }));
    expect(similar.getByText('서울특별시 강남구 테헤란로 12-1')).toBeTruthy();
    expect(similar.getByText('일치 신뢰도 낮음')).toBeTruthy();
    expect(screen.getAllByRole('article')).toHaveLength(2);
    for (const card of screen.getAllByRole('article')) {
      expect(within(card).getByText('예시 데이터 기준일: 2026-09-01')).toBeTruthy();
      expect(within(card).getByText('합성 시험 데이터')).toBeTruthy();
    }
  });

  it('does not promote a licensing tie to a primary card', async () => {
    render(<App dataset={dataset} />);
    await search('가상동률 식당 서울특별시 종로구 자하문로 20');
    expect(screen.queryByRole('region', { name: '가장 잘 일치하는 결과' })).toBeNull();
    expect(
      screen.getByText('동일하게 일치하는 후보가 여러 개입니다. 원본 정보를 비교해 주세요.'),
    ).toBeTruthy();
    expect(
      within(screen.getByRole('region', { name: '일치 후보' })).getAllByRole('article'),
    ).toHaveLength(2);
  });

  it('keeps name-only matches in similar candidates without changing administrative status', async () => {
    render(<App dataset={dataset} />);
    await search('가상별빛 카페');
    expect(screen.queryByRole('region', { name: '가장 잘 일치하는 결과' })).toBeNull();
    const similar = within(screen.getByRole('region', { name: '유사 후보' }));
    expect(similar.getAllByText('일치 신뢰도 낮음')).toHaveLength(2);
    expect(similar.getAllByText('행정상 영업', { selector: '.status-badge' })).toHaveLength(2);
  });

  it('shows medium-confidence candidates without inventing a primary match', async () => {
    render(<App dataset={dataset} />);
    await search('서울특별시 마포구 월드컵로 12-1');
    expect(screen.queryByRole('region', { name: '가장 잘 일치하는 결과' })).toBeNull();
    expect(
      within(screen.getByRole('region', { name: '일치 후보' })).getByText('일치 신뢰도 보통'),
    ).toBeTruthy();
  });

  it('shows non-closure empty guidance and removes previous result cards', async () => {
    render(<App dataset={dataset} />);
    await search(dataset.exampleQuery);
    await search('존재하지않는시험사업체');
    expect(screen.queryByRole('article')).toBeNull();
    expect(
      screen.getByText(
        '일치하는 공개 인허가 데이터를 찾지 못했습니다. 데이터 미등재, 상호 변경 또는 검색어 차이일 수 있으며 폐업을 의미하지 않습니다.',
      ),
    ).toBeTruthy();
    expect(screen.getByText('예시 데이터 기준일: 2026-09-01')).toBeTruthy();
    expect(screen.getByRole('contentinfo')).toBeTruthy();
  });

  it.each(['', '가', '   '])(
    'clears obsolete results on invalid submission %j and associates the error with input',
    async (query) => {
      render(<App dataset={dataset} />);
      await search(dataset.exampleQuery);
      const { input } = await search(query);
      expect(screen.queryByRole('article')).toBeNull();
      expect(input.getAttribute('aria-invalid')).toBe('true');
      const error = screen.getByText(
        query.trim() ? '검색어를 두 글자 이상 입력해 주세요.' : '상호명 또는 주소를 입력해 주세요.',
      );
      expect(input.getAttribute('aria-describedby')?.split(' ')).toContain(error.id);
    },
  );

  it('keeps submitted context distinct from the draft and replaces results after another search', async () => {
    render(<App dataset={dataset} />);
    const { input, user } = await search(dataset.exampleQuery);
    await user.clear(input);
    await user.type(input, '가상동률 식당 서울특별시 종로구 자하문로 20');
    expect(screen.getByText(`검색 결과: ${dataset.exampleQuery}`)).toBeTruthy();
    expect(screen.getByRole('region', { name: '가장 잘 일치하는 결과' })).toBeTruthy();
    await user.keyboard('{Enter}');
    expect(screen.queryByRole('region', { name: '가장 잘 일치하는 결과' })).toBeNull();
    expect(screen.getByText('검색 결과: 가상동률 식당 서울특별시 종로구 자하문로 20')).toBeTruthy();
  });

  it('clears results when supplied dataset changes and displays unavailable coverage honestly', async () => {
    const { rerender } = render(<App dataset={dataset} />);
    await search(dataset.exampleQuery);
    rerender(<App dataset={{ ...dataset, records: [], coverage: { kind: 'unavailable' } }} />);
    expect(screen.queryByRole('article')).toBeNull();
    expect(screen.getByText('데이터 기준일: 확인되지 않음')).toBeTruthy();
    expect(screen.queryByText('합성 예시 데이터 · 실제 사업체 조회가 아닙니다')).toBeNull();
  });
});

describe('PR15 regressions', () => {
  it('announces every submission even when counts and query repeat', async () => {
    render(<App dataset={dataset} />);
    await search('서울특별시 마포구 월드컵로 12-1');
    const region = screen.getByRole('status');
    const first = region.textContent;
    await search('가상별빛 카페 서울특별시 마포구 월드컵로 12-1');
    const second = region.textContent;
    expect(second).not.toBe(first);
    await search('가상별빛 카페 서울특별시 마포구 월드컵로 12-1');
    expect(region.textContent).not.toBe(second);
    expect(screen.getByRole('status')).toBe(region);
  });
  it.each(['typing', 'example'])(
    'clears an obsolete invalid error on %s without submitting',
    async (mode) => {
      render(<App dataset={dataset} />);
      const { user, input } = await search('');
      expect(input.getAttribute('aria-invalid')).toBe('true');
      if (mode === 'typing') await user.type(input, '가상별빛');
      else await user.click(screen.getByRole('button', { name: /예시 입력/ }));
      expect(input.getAttribute('aria-invalid')).toBe('false');
      expect(screen.queryByRole('alert')).toBeNull();
      expect(screen.queryByRole('article')).toBeNull();
    },
  );
  it('gives missing-name address matches a visible and accessible fallback', async () => {
    render(
      <App
        dataset={{
          ...dataset,
          records: [record('missing', '', '서울특별시 마포구 월드컵로 12-1')],
        }}
      />,
    );
    await search('서울특별시 마포구 월드컵로 12-1');
    expect(screen.getByRole('heading', { level: 3, name: '제공되지 않음' })).toBeTruthy();
    expect(screen.getByRole('article', { name: '제공되지 않음 인허가 정보' })).toBeTruthy();
    expect(screen.getByText('일치 신뢰도 보통')).toBeTruthy();
  });
  it('keeps exact dataset provenance accessible before search and with no matches or invalid input', async () => {
    render(
      <App
        dataset={{
          ...dataset,
          coverage: { kind: 'verified', date: '2026-09-01' },
          sourceLabel: '시험 데이터셋 원본',
          sourceUrl: 'https://www.data.go.kr/data/15045011/fileData.do',
        }}
      />,
    );
    const footer = within(screen.getByRole('contentinfo'));
    const check = () =>
      expect(footer.getByRole('link', { name: '시험 데이터셋 원본' }).getAttribute('href')).toBe(
        'https://www.data.go.kr/data/15045011/fileData.do',
      );
    check();
    await search('없는상호이름');
    check();
    await search('');
    check();
  });
});
