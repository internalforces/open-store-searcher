import { fireEvent, render, screen } from '@testing-library/preact';
import { describe, expect, it, vi } from 'vitest';
import type { CandidateMatch } from '../search/search-candidates.js';
import { CandidateSummary } from './candidate-summary.js';
import type { DisplayRecord } from './display-data.js';
import { statusDisclaimer, syntheticNotice } from './evidence-context.js';

const record: DisplayRecord = {
  id: 'summary-fixture',
  name: '가상별빛 카페',
  roadAddress: '서울특별시 마포구 월드컵로 12-1',
  parcelAddress: '서울특별시 마포구 성산동 100-2',
  categoryName: '휴게음식점',
  businessTypes: [],
  rawStatus: {
    operatingCode: '01',
    operatingName: '영업/정상',
    detailedCode: 'D1',
    detailedName: '원본 상세값',
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
  sourceLabel: '테스트용 합성 원본',
  sourceUrl: 'https://www.data.go.kr/data/15045011/fileData.do',
};
const match: CandidateMatch<DisplayRecord> = {
  record,
  confidence: 'low',
  score: 10,
  nameMatch: 'exact',
  addressMatch: 'none',
  reasons: [],
};

function evidence(label: string) {
  return screen.getByText(label, { selector: 'dt' }).nextElementSibling?.textContent;
}

describe('CandidateSummary', () => {
  it.each([
    ['01', '영업/정상', '행정상 영업'],
    ['02', '휴업', '휴업'],
    ['03', '폐업', '폐업'],
    ['99', '새로운 상태', '확인되지 않음'],
  ])('keeps %s raw evidence visible before inspection', (operatingCode, operatingName, status) => {
    const onInspect = vi.fn();
    const { container } = render(
      <CandidateSummary
        match={{
          ...match,
          record: {
            ...record,
            rawStatus: { ...record.rawStatus, operatingCode, operatingName },
          },
        }}
        coverage={{ kind: 'synthetic', date: '2026-09-01' }}
        position={7}
        selected={false}
        onInspect={onInspect}
      />,
    );
    expect(screen.getByRole('article').classList.contains('candidate-summary')).toBe(true);
    expect(screen.getByText(status, { selector: '.status-badge' })).toBeTruthy();
    expect(container.querySelectorAll('.status-badge')).toHaveLength(1);
    expect(container.querySelector('.status-badge svg[aria-hidden="true"]')).toBeTruthy();
    expect(evidence('원본 영업상태 코드')).toBe(operatingCode);
    expect(evidence('원본 영업상태명')).toBe(operatingName);
    expect(evidence('원본 상세상태 코드')).toBe('D1');
    expect(evidence('원본 상세상태명')).toBe('원본 상세값');
    expect(evidence('주소')).toBe(record.roadAddress);
    expect(evidence('업종')).toBe(record.categoryName);
    expect(screen.getByText('일치 신뢰도 낮음')).toBeTruthy();
    expect(
      screen.getByText('검색한 사업체와 같은 곳인지 주소와 원본 정보를 확인하세요.'),
    ).toBeTruthy();
    expect(screen.getByText('예시 데이터 기준일: 2026-09-01')).toBeTruthy();
    expect(screen.getByText(syntheticNotice)).toBeTruthy();
    expect(screen.getByText(statusDisclaimer)).toBeTruthy();
    const inspectButton = screen.getByRole('button', {
      name: `가상별빛 카페 · ${record.roadAddress} · 후보 7 상세 보기`,
    });
    expect(inspectButton.getAttribute('aria-pressed')).toBe('false');
    expect(inspectButton.textContent).toContain('상세');
    const source = screen.getByRole('link', { name: record.sourceLabel });
    expect(source.closest('button')).toBeNull();
    source.addEventListener('click', (event) => event.preventDefault());
    fireEvent.click(source);
    fireEvent.click(screen.getByRole('article'));
    expect(onInspect).not.toHaveBeenCalled();
    fireEvent.click(inspectButton.querySelector('span') ?? inspectButton);
    expect(onInspect).toHaveBeenCalledExactlyOnceWith(inspectButton);
  });

  it('keeps selected and missing original identity explicit without adding map actions', () => {
    render(
      <CandidateSummary
        match={{
          ...match,
          record: {
            ...record,
            name: '',
            roadAddress: '',
            parcelAddress: '',
            categoryName: '',
          },
        }}
        coverage={{ kind: 'unavailable' }}
        synthetic
        position={2}
        selected
        onInspect={vi.fn()}
      />,
    );
    expect(screen.getByRole('heading', { name: '제공되지 않음' })).toBeTruthy();
    expect(evidence('주소')).toBe('제공되지 않음');
    expect(evidence('업종')).toBe('제공되지 않음');
    expect(screen.getByRole('button').getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText(syntheticNotice)).toBeTruthy();
    expect(screen.getByText('데이터 기준일: 확인되지 않음')).toBeTruthy();
    expect(screen.queryByRole('link', { name: /지도/ })).toBeNull();
  });

  it('uses the original parcel address when no road address exists and preserves long text', () => {
    const value = `  ${'원본'.repeat(400)}  `;
    render(
      <CandidateSummary
        match={{
          ...match,
          record: {
            ...record,
            name: value,
            roadAddress: '',
            parcelAddress: value,
            categoryName: value,
          },
        }}
        coverage={{ kind: 'unavailable' }}
        position={1}
        selected={false}
        onInspect={vi.fn()}
      />,
    );
    expect(screen.getByRole('heading', { level: 3 }).textContent).toBe(value);
    expect(evidence('주소')).toBe(value);
    expect(evidence('업종')).toBe(value);
    expect(screen.getByRole('button').getAttribute('aria-label')).toContain(value);
  });
});
