import { act, render, screen } from '@testing-library/preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CoverageClock } from './coverage-clock.js';
import { EvidenceContext } from './evidence-context.js';

const warning =
  '최근 데이터 갱신이 지연되고 있습니다. 아래 기준일을 확인하고 외부 지도 또는 사업체에 직접 확인하세요.';
afterEach(() => vi.useRealTimers());
describe('coverage warnings', () => {
  it.each([
    ['2026-09-07T14:59:59.999Z', false],
    ['2026-09-07T15:00:00.000Z', true],
    ['2026-09-08T15:00:00.000Z', true],
  ])('warns at Seoul age seven and beyond at %s', (now, stale) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(now));
    render(
      <CoverageClock>
        <EvidenceContext coverage={{ kind: 'verified', date: '2026-09-01' }} />
      </CoverageClock>,
    );
    expect(Boolean(screen.queryByText(warning))).toBe(stale);
  });
  it('labels stale synthetic coverage without implying a failed production refresh', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-09T00:00:00.000Z'));
    render(
      <CoverageClock>
        <EvidenceContext coverage={{ kind: 'synthetic', date: '2026-09-01' }} />
      </CoverageClock>,
    );
    expect(
      screen.getByText(
        '합성 예시 데이터의 기준일로부터 7일 이상 지났습니다. 실제 사업체 상태를 나타내지 않습니다.',
      ),
    ).toBeTruthy();
    expect(screen.queryByText(warning)).toBeNull();
  });
  it.each([null, '2026-02-30', '2026-09-20'])(
    'never presents unknown or rejected coverage %s as fresh',
    (date) => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-09-08T00:00:00.000Z'));
      render(
        <CoverageClock>
          <EvidenceContext
            coverage={date === null ? { kind: 'unavailable' } : { kind: 'verified', date }}
          />
        </CoverageClock>,
      );
      expect(screen.getByText('데이터 기준일: 확인되지 않음')).toBeTruthy();
      expect(screen.queryByText(warning)).toBeNull();
    },
  );
  it('refreshes an open page exactly at Seoul midnight and cleans up its timer', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-07T14:59:59.000Z'));
    const { unmount } = render(
      <CoverageClock>
        <EvidenceContext coverage={{ kind: 'verified', date: '2026-09-01' }} />
      </CoverageClock>,
    );
    expect(screen.queryByText(warning)).toBeNull();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText(warning)).toBeTruthy();
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
  it('refreshes on focus and visibility after clock or background changes', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-07T00:00:00.000Z'));
    render(
      <CoverageClock>
        <EvidenceContext coverage={{ kind: 'verified', date: '2026-09-01' }} />
      </CoverageClock>,
    );
    vi.setSystemTime(new Date('2026-09-09T00:00:00.000Z'));
    act(() => {
      window.dispatchEvent(new Event('focus'));
    });
    expect(screen.getByText(warning)).toBeTruthy();
    vi.setSystemTime(new Date('2026-09-07T00:00:00.000Z'));
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(screen.queryByText(warning)).toBeNull();
  });
});

it.each([
  ['2026-09-07T14:59:59.999Z', false],
  ['2026-09-07T15:00:00.000Z', true],
])('labels collection dates and warns without claiming source coverage at %s', (now, stale) => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(now));
  render(
    <CoverageClock>
      <EvidenceContext coverage={{ kind: 'collected', date: '2026-09-01' }} />
    </CoverageClock>,
  );
  expect(screen.getByText('데이터 수집일: 2026-09-01')).toBeTruthy();
  expect(
    screen.getByText(
      '원천 데이터 기준일은 확인되지 않았습니다. 수집일은 사업체 상태가 확인된 날짜가 아닙니다.',
    ),
  ).toBeTruthy();
  expect(screen.queryByText('데이터 기준일: 2026-09-01')).toBeNull();
  expect(
    Boolean(
      screen.queryByText(
        '데이터 수집일로부터 7일 이상 지났습니다. 외부 지도 또는 사업체에 직접 확인하세요.',
      ),
    ),
  ).toBe(stale);
});
