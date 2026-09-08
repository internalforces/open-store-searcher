import { render, screen, within } from '@testing-library/preact';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from './app.js';
import { demoDataset } from './demo-data.js';

async function submit(query: string) {
  const user = userEvent.setup();
  const input = screen.getByRole('searchbox');
  await user.clear(input);
  if (query) await user.type(input, query);
  await user.click(screen.getByRole('button', { name: '검색', exact: true }));
  return { user, input };
}

describe('TASK-017 accessible search', () => {
  it('names candidate lists and distinguishes same-name addresses without changing evidence', async () => {
    render(<App />);
    await submit('가상별빛 카페');
    const list = screen.getByRole('list', { name: '유사 후보' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    const cards = within(list).getAllByRole('article');
    expect(cards[0]?.getAttribute('aria-label')).toContain('서울특별시');
    expect(cards[0]?.getAttribute('aria-label')).not.toBe(cards[1]?.getAttribute('aria-label'));
    for (const card of cards) {
      expect(card.tabIndex).toBe(0);
      expect(within(card).getByText('원본 근거')).toBeTruthy();
      expect(within(card).getByText('예시 데이터 기준일: 2026-09-01')).toBeTruthy();
    }
  });

  it('offers explicit results focus while returning valid and invalid submissions to input', async () => {
    render(<App />);
    expect(screen.queryByRole('button', { name: '검색 결과로 이동' })).toBeNull();
    const { user, input } = await submit(demoDataset.exampleQuery);
    expect(document.activeElement).toBe(input);
    await user.click(screen.getByRole('button', { name: '검색 결과로 이동' }));
    expect(document.activeElement).toBe(screen.getByRole('region', { name: '검색 결과' }));
    await submit('');
    expect(document.activeElement).toBe(input);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(screen.queryByRole('button', { name: '검색 결과로 이동' })).toBeNull();
    await user.click(screen.getByRole('button', { name: '검색', exact: true }));
    expect(document.activeElement).toBe(input);
    await user.type(input, '가상별빛');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it.each([
    ['존재하지않는시험상호', '폐업을 의미하지 않습니다'],
    ['가상동률 식당 서울특별시 종로구 자하문로 20', '동일하게 일치하는 후보가 여러 개'],
    ['가상별빛 카페', '같은 사업체인지 주소와 원본 정보를 확인'],
  ])('announces safe guidance for %s in the persistent status region', async (query, guidance) => {
    render(<App />);
    const status = screen.getByRole('status');
    await submit(query);
    expect(status.textContent).toContain(guidance);
    const first = status.textContent;
    await submit(query);
    expect(screen.getByRole('status')).toBe(status);
    expect(status.textContent).not.toBe(first);
  });

  it.each([
    ['   ', '서울특별시 마포구 성산동 100-2', '서울특별시 마포구 성산동 100-2'],
    ['', '', '주소 제공되지 않음'],
  ])(
    'uses parcel and missing-address labels for candidate evidence (%s)',
    async (road, parcel, label) => {
      const record = demoDataset.records[0];
      if (!record) throw new Error('Missing demo fixture');
      render(
        <App
          dataset={{
            ...demoDataset,
            records: [{ ...record, roadAddress: road, parcelAddress: parcel }],
          }}
        />,
      );
      await submit('가상별빛 카페');
      expect(screen.getByRole('article').getAttribute('aria-label')).toContain(label);
    },
  );
});
