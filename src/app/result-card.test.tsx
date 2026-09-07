import { render, screen, within } from '@testing-library/preact';
import { describe, expect, it } from 'vitest';
import type { CandidateMatch } from '../search/search-candidates.js';
import type { DisplayRecord } from './display-data.js';
import { ResultCard } from './result-card.js';

const record: DisplayRecord = {
  id: 'fixture-one',
  name: '가상별빛 카페',
  roadAddress: '서울특별시 마포구 월드컵로 12-1',
  parcelAddress: '서울특별시 마포구 성산동 100-2',
  categoryName: '휴게음식점',
  businessTypes: [{ sourceField: '업태구분명', value: '커피숍' }],
  rawStatus: {
    operatingCode: '01',
    operatingName: '영업/정상',
    detailedCode: 'D1',
    detailedName: '원본 상세값',
  },
  lifecycle: {
    licensedOn: '2020-01-02',
    licenseCancelledOn: '2021-02-03',
    suspendedFrom: '2022-03-04',
    suspendedThrough: '2022-04-05',
    reopenedOn: '2022-05-06',
    closedOn: '2023-06-07',
    sourceUpdatedAt: '2024-07-08 09:10:11',
    sourceLastModifiedAt: '2025-08-09 10:11:12',
  },
  sourceLabel: '테스트용 합성 원본',
  sourceUrl: null,
};
const match: CandidateMatch<DisplayRecord> = {
  record,
  confidence: 'high',
  score: 500,
  nameMatch: 'exact',
  addressMatch: 'exact',
  reasons: [],
};

function evidence(label: string) {
  return screen.getByText(label, { selector: 'dt' }).nextElementSibling?.textContent;
}

describe('ResultCard evidence', () => {
  it.each([
    ['01', '영업/정상', '행정상 영업'],
    ['02', '휴업', '휴업'],
    ['03', '폐업', '폐업'],
    ['99', '새로운 상태', '확인되지 않음'],
  ])(
    'renders raw pair %s/%s with the approved status %s',
    (operatingCode, operatingName, status) => {
      render(
        <ResultCard
          match={{
            ...match,
            record: { ...record, rawStatus: { ...record.rawStatus, operatingCode, operatingName } },
          }}
          coverage={{ kind: 'synthetic', date: '2026-09-01' }}
        />,
      );
      const card = within(screen.getByRole('article'));
      expect(card.getByText(status, { selector: '.status-badge' })).toBeTruthy();
      expect(evidence('원본 영업상태 코드')).toBe(operatingCode);
      expect(evidence('원본 영업상태명')).toBe(operatingName);
      expect(evidence('원본 상세상태 코드')).toBe('D1');
      expect(evidence('원본 상세상태명')).toBe('원본 상세값');
      expect(card.getByText('일치 신뢰도 높음')).toBeTruthy();
      expect(card.getByText('합성 예시 데이터 · 실제 사업체 조회가 아닙니다')).toBeTruthy();
      expect(card.getByText('테스트용 합성 원본')).toBeTruthy();
    },
  );

  it('preserves both addresses, business types and every lifecycle field separately from coverage', () => {
    render(<ResultCard match={match} coverage={{ kind: 'verified', date: '2026-08-01' }} />);
    expect(evidence('도로명 주소')).toBe('서울특별시 마포구 월드컵로 12-1');
    expect(evidence('지번 주소')).toBe('서울특별시 마포구 성산동 100-2');
    expect(evidence('업종')).toBe('휴게음식점');
    expect(evidence('업태 (업태구분명)')).toBe('커피숍');
    for (const [label, value] of [
      ['인허가일', '2020-01-02'],
      ['인허가 취소일', '2021-02-03'],
      ['휴업 시작일', '2022-03-04'],
      ['휴업 종료일', '2022-04-05'],
      ['재개업일', '2022-05-06'],
      ['폐업일', '2023-06-07'],
      ['원본 데이터 갱신일', '2024-07-08 09:10:11'],
      ['원본 최종 수정일', '2025-08-09 10:11:12'],
    ])
      expect(evidence(label as string)).toBe(value);
    expect(screen.getByText('데이터 기준일: 2026-08-01')).toBeTruthy();
    expect(screen.queryByText('합성 예시 데이터 · 실제 사업체 조회가 아닙니다')).toBeNull();
  });

  it('keeps unavailable coverage unknown despite a recent row timestamp and marks missing fields', () => {
    render(
      <ResultCard
        match={{
          ...match,
          record: {
            ...record,
            roadAddress: '',
            parcelAddress: '',
            businessTypes: [],
            rawStatus: {
              operatingCode: null,
              operatingName: null,
              detailedCode: null,
              detailedName: null,
            },
            lifecycle: { ...record.lifecycle, closedOn: null },
          },
        }}
        coverage={{ kind: 'unavailable' }}
      />,
    );
    expect(screen.getByText('데이터 기준일: 확인되지 않음')).toBeTruthy();
    expect(evidence('폐업일')).toBe('제공되지 않음');
    expect(evidence('도로명 주소')).toBe('제공되지 않음');
    expect(evidence('지번 주소')).toBe('제공되지 않음');
    expect(evidence('업태')).toBe('제공되지 않음');
    expect(evidence('원본 영업상태 코드')).toBe('제공되지 않음');
    expect(screen.queryByText('데이터 기준일: 2025-08-09 10:11:12')).toBeNull();
  });

  it('renders HTML-shaped evidence as inert literal text', () => {
    const text = '<img src=x onerror=alert(1)>';
    const { container } = render(
      <ResultCard
        match={{
          ...match,
          record: { ...record, name: text, rawStatus: { ...record.rawStatus, detailedName: text } },
        }}
        coverage={{ kind: 'synthetic', date: '2026-09-01' }}
      />,
    );
    expect(screen.getByRole('heading', { name: text })).toBeTruthy();
    expect(evidence('원본 상세상태명')).toBe(text);
    expect(container.querySelector('img')).toBeNull();
  });

  it.each(['javascript:alert(1)', 'https://user:password@example.com/', 'http://example.com/'])(
    'does not turn unsafe source URL %s into a link',
    (sourceUrl) => {
      render(
        <ResultCard
          match={{ ...match, record: { ...record, sourceUrl } }}
          coverage={{ kind: 'unavailable' }}
        />,
      );
      expect(screen.queryByRole('link', { name: '테스트용 합성 원본' })).toBeNull();
      expect(screen.getByText('테스트용 합성 원본')).toBeTruthy();
    },
  );

  it('links an HTTPS source without rewriting it and keeps confidence separate from status', () => {
    render(
      <ResultCard
        match={{
          ...match,
          confidence: 'low',
          record: { ...record, sourceUrl: 'https://www.data.go.kr/data/15045011/fileData.do' },
        }}
        coverage={{ kind: 'verified', date: '2026-09-01' }}
      />,
    );
    const link = screen.getByRole('link', { name: '테스트용 합성 원본' });
    expect(link.getAttribute('href')).toBe('https://www.data.go.kr/data/15045011/fileData.do');
    expect(screen.getByText('행정상 영업', { selector: '.status-badge' })).toBeTruthy();
    expect(screen.getByText('일치 신뢰도 낮음')).toBeTruthy();
    expect(
      screen.getByText('검색한 사업체와 같은 곳인지 주소와 원본 정보를 확인하세요.'),
    ).toBeTruthy();
  });
});
