import { render, screen } from '@testing-library/preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CoverageClock } from './coverage-clock.js';
import type { Coverage, DisplayRecord } from './display-data.js';
import { statusDisclaimer, syntheticNotice } from './evidence-context.js';
import { EvidenceField, RecordEvidence } from './record-evidence.js';

const record: DisplayRecord = {
  id: 'evidence-fixture',
  name: '원본 상호',
  roadAddress: '',
  parcelAddress: '',
  categoryName: '',
  businessTypes: [],
  rawStatus: { operatingCode: null, operatingName: '', detailedCode: null, detailedName: '' },
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
  sourceLabel: '원본 출처',
  sourceUrl: 'https://www.data.go.kr/data/15045011/fileData.do',
};
const sourceWarning =
  '최근 데이터 갱신이 지연되고 있습니다. 아래 기준일을 확인하고 외부 지도 또는 사업체에 직접 확인하세요.';
const collectedWarning =
  '데이터 수집일로부터 7일 이상 지났습니다. 외부 지도 또는 사업체에 직접 확인하세요.';
const syntheticWarning =
  '합성 예시 데이터의 기준일로부터 7일 이상 지났습니다. 실제 사업체 상태를 나타내지 않습니다.';
afterEach(() => vi.useRealTimers());

describe('RecordEvidence', () => {
  it('preserves null and empty fallbacks for the raw quartet without lifecycle or map actions', () => {
    render(<RecordEvidence record={record} coverage={{ kind: 'unavailable' }} />);
    for (const label of [
      '원본 영업상태 코드',
      '원본 영업상태명',
      '원본 상세상태 코드',
      '원본 상세상태명',
    ]) {
      expect(screen.getByText(label, { selector: 'dt' }).nextElementSibling?.textContent).toBe(
        '제공되지 않음',
      );
    }
    expect(
      screen.getByRole('link', { name: record.sourceLabel }).getAttribute('referrerpolicy'),
    ).toBe('no-referrer');
    expect(screen.getByText(statusDisclaimer)).toBeTruthy();
    expect(screen.queryByText('인허가일')).toBeNull();
    expect(screen.queryByRole('link', { name: /지도/ })).toBeNull();
  });

  it.each([null, ''])('keeps EvidenceField fallback for %s', (value) => {
    render(
      <dl>
        <EvidenceField label="필드" value={value} />
      </dl>,
    );
    expect(screen.getByText('필드').nextElementSibling?.textContent).toBe('제공되지 않음');
  });

  it('keeps long unbroken raw values and source labels as complete inert text', () => {
    const value = '<img src=x onerror=alert(1)>'.repeat(100);
    const { container } = render(
      <RecordEvidence
        record={{
          ...record,
          sourceLabel: value,
          rawStatus: { ...record.rawStatus, detailedName: value },
        }}
        coverage={{ kind: 'unavailable' }}
      />,
    );
    expect(screen.getByText('원본 상세상태명').nextElementSibling?.textContent).toBe(value);
    expect(screen.getByRole('link', { name: value }).textContent).toBe(value);
    expect(container.querySelector('img')).toBeNull();
  });

  it.each([
    ['verified', '데이터 기준일', sourceWarning],
    ['collected', '데이터 수집일', collectedWarning],
    ['synthetic', '예시 데이터 기준일', syntheticWarning],
  ] as const)('keeps %s date meaning and Seoul age 6/7/8 boundaries', (kind, label, warning) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-07T00:00:00.000Z'));
    const { rerender } = render(
      <CoverageClock>
        <RecordEvidence record={record} coverage={{ kind, date: '2026-09-01' }} />
      </CoverageClock>,
    );
    expect(screen.getByText(`${label}: 2026-09-01`)).toBeTruthy();
    expect(screen.queryByText(warning)).toBeNull();
    for (const now of ['2026-09-07T15:00:00.000Z', '2026-09-08T15:00:00.000Z']) {
      vi.setSystemTime(new Date(now));
      rerender(
        <CoverageClock key={now}>
          <RecordEvidence record={record} coverage={{ kind, date: '2026-09-01' }} />
        </CoverageClock>,
      );
      expect(screen.getByText(warning)).toBeTruthy();
    }
    if (kind === 'collected') {
      expect(
        screen.getByText(
          '원천 데이터 기준일은 확인되지 않았습니다. 수집일은 사업체 상태가 확인된 날짜가 아닙니다.',
        ),
      ).toBeTruthy();
      expect(screen.queryByText('데이터 기준일: 2026-09-01')).toBeNull();
    }
    if (kind === 'synthetic') expect(screen.getAllByText(syntheticNotice)).toHaveLength(1);
  });

  it.each<Coverage>([
    { kind: 'unavailable' },
    { kind: 'verified', date: '2026-02-30' },
    { kind: 'verified', date: '2026-09-20' },
  ])('does not invent a date for rejected or unavailable coverage $kind/$date', (coverage) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-08T00:00:00.000Z'));
    render(<RecordEvidence record={record} coverage={coverage} />);
    expect(screen.getByText('데이터 기준일: 확인되지 않음')).toBeTruthy();
    expect(screen.queryByText(sourceWarning)).toBeNull();
  });

  it('marks explicit synthetic unavailable evidence once without a false date', () => {
    render(<RecordEvidence record={record} coverage={{ kind: 'unavailable' }} synthetic />);
    expect(screen.getAllByText(syntheticNotice)).toHaveLength(1);
    expect(screen.getByText('데이터 기준일: 확인되지 않음')).toBeTruthy();
    expect(screen.queryByText(/예시 데이터 기준일:/)).toBeNull();
  });
});
