import { render, screen, waitFor, within } from '@testing-library/preact';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from './app.js';
import { demoDataset } from './demo-data.js';
import { MapLinks } from './map-links.js';
import type { Coverage } from './display-data.js';

// TASK-016 invented records exercise source-mode UI only; no production evidence is asserted.
function dataset(coverage: Coverage = { kind: 'unavailable' }) {
  return { ...demoDataset, coverage };
}
async function search() {
  const user = userEvent.setup();
  await user.type(screen.getByRole('searchbox'), '가상별빛 카페 서울특별시 마포구 월드컵로 12-1');
  await user.click(screen.getByRole('button', { name: '검색', exact: true }));
}

describe('map link presentation', () => {
  it('links each candidate record rather than the submitted query and preserves uncertainty and evidence', async () => {
    render(<App dataset={dataset()} />);
    await search();
    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(2);
    for (const [index, address] of [
      '서울특별시 마포구 월드컵로 12-1',
      '서울특별시 강남구 테헤란로 12-1',
    ].entries()) {
      const card = within(cards[index] as HTMLElement);
      for (const label of ['네이버 지도에서 검색 (새 탭)', '카카오맵에서 검색 (새 탭)']) {
        const link = card.getByRole('link', { name: label });
        expect(
          decodeURIComponent(
            new URL(link.getAttribute('href') ?? '').pathname.split('/').at(-1) ?? '',
          ),
        ).toBe(`가상별빛 카페 ${address}`);
        expect(link.getAttribute('target')).toBe('_blank');
        expect(link.getAttribute('rel')).toBe('noopener noreferrer');
        expect(link.getAttribute('referrerpolicy')).toBe('no-referrer');
      }
      expect(card.getByText('데이터 기준일: 확인되지 않음')).toBeTruthy();
      expect(card.getByText(/출처:/)).toBeTruthy();
    }
    expect(
      within(cards[1] as HTMLElement).getByText(
        '검색한 사업체와 같은 곳인지 주소와 원본 정보를 확인하세요.',
      ),
    ).toBeTruthy();
    expect(cards[0]?.querySelector('.status-badge')?.textContent).toBe('행정상 영업');
    expect(cards[1]?.querySelector('.status-badge')?.textContent).toBe('휴업');
  });
  it('suppresses map actions for synthetic coverage with an explanation', async () => {
    render(<App dataset={demoDataset} />);
    await search();
    expect(screen.queryAllByRole('link', { name: /지도에서 검색|카카오맵에서 검색/ })).toHaveLength(
      0,
    );
    expect(
      screen.getAllByText('합성 예시 데이터에는 외부 지도 검색을 제공하지 않습니다.'),
    ).toHaveLength(2);
  });
  it('suppresses map actions for a synthetic loader even when coverage is unavailable', async () => {
    render(
      <App
        loader={{
          kind: 'synthetic',
          sourceLabel: 'Synthetic fixture',
          sourceUrl: null,
          load: async () => dataset(),
        }}
      />,
    );
    await waitFor(() =>
      expect(
        (screen.getByRole('button', { name: '검색', exact: true }) as HTMLButtonElement).disabled,
      ).toBe(false),
    );
    await search();
    expect(screen.queryAllByRole('link', { name: /지도에서 검색|카카오맵에서 검색/ })).toHaveLength(
      0,
    );
    expect(
      screen.getAllByText('합성 예시 데이터에는 외부 지도 검색을 제공하지 않습니다.'),
    ).toHaveLength(2);
  });
});

it.each(['', '\ud800'])('omits unusable record map actions with visible guidance: %j', (name) => {
  const record = demoDataset.records[0];
  if (!record) throw new Error('Missing fixture record');
  render(
    <MapLinks record={{ ...record, name, roadAddress: '', parcelAddress: '' }} synthetic={false} />,
  );
  expect(screen.queryByRole('link')).toBeNull();
  expect(screen.getByText('지도 검색에 사용할 상호명 또는 주소 정보가 없습니다.')).toBeTruthy();
});
