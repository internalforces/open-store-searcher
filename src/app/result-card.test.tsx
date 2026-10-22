import { fireEvent, render, screen, within } from '@testing-library/preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CandidateMatch } from '../search/search-candidates.js';
import { CoverageClock } from './coverage-clock.js';
import type { Coverage, DisplayRecord } from './display-data.js';
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

afterEach(() => vi.useRealTimers());

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

describe('ResultCard workspace', () => {
  it('focuses the programmatic heading and invokes return once while preserving evidence order', () => {
    const headingRef = { current: null as HTMLHeadingElement | null };
    const onReturn = vi.fn();
    const { container } = render(
      <ResultCard
        match={match}
        position={7}
        coverage={{ kind: 'unavailable' }}
        layout="workspace"
        headingRef={headingRef}
        onReturn={onReturn}
      />,
    );
    const article = screen.getByRole('article');
    expect(article.classList.contains('workspace-detail')).toBe(true);
    expect(article.hasAttribute('tabindex')).toBe(false);
    expect(headingRef.current?.getAttribute('tabindex')).toBe('-1');
    headingRef.current?.focus();
    expect(document.activeElement).toBe(headingRef.current);
    const children = Array.from(article.children).map((child) => child.className);
    expect(children.indexOf('record-evidence')).toBeLessThan(children.indexOf('record-basics'));
    expect(children.indexOf('record-basics')).toBeLessThan(children.indexOf('record-lifecycle'));
    expect(children.indexOf('record-lifecycle')).toBeLessThan(children.indexOf('card-footer'));
    expect(container.querySelectorAll('.status-badge')).toHaveLength(1);
    expect(container.querySelector('.status-badge svg[aria-hidden="true"]')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '후보 목록으로 돌아가기' }));
    expect(onReturn).toHaveBeenCalledTimes(1);
  });

  it('retains default keyboard card semantics and all repeated business-type occurrences on rerender', () => {
    const repeated = {
      ...record,
      businessTypes: [
        { sourceField: '업태구분명', value: '첫 번째' },
        { sourceField: '업태구분명', value: '두 번째' },
        { sourceField: '다른 필드', value: '' },
      ],
    };
    const { rerender } = render(
      <ResultCard match={{ ...match, record: repeated }} coverage={{ kind: 'unavailable' }} />,
    );
    expect(screen.getByRole('article').getAttribute('tabindex')).toBe('0');
    expect(
      screen
        .getAllByText('업태 (업태구분명)', { selector: 'dt' })
        .map((label) => label.nextElementSibling?.textContent),
    ).toEqual(['첫 번째', '두 번째']);
    expect(evidence('업태 (다른 필드)')).toBe('제공되지 않음');
    rerender(
      <ResultCard
        match={{
          ...match,
          record: {
            ...repeated,
            businessTypes: [
              { sourceField: '업태구분명', value: '바뀐 첫 번째' },
              { sourceField: '업태구분명', value: '바뀐 두 번째' },
            ],
          },
        }}
        coverage={{ kind: 'unavailable' }}
      />,
    );
    expect(
      screen
        .getAllByText('업태 (업태구분명)', { selector: 'dt' })
        .map((label) => label.nextElementSibling?.textContent),
    ).toEqual(['바뀐 첫 번째', '바뀐 두 번째']);
    expect(screen.queryByText('업태 (다른 필드)')).toBeNull();
  });

  it('marks explicit synthetic unavailable details without a false date or map action', () => {
    render(
      <ResultCard match={match} coverage={{ kind: 'unavailable' }} synthetic layout="workspace" />,
    );
    expect(screen.getAllByText('합성 예시 데이터 · 실제 사업체 조회가 아닙니다')).toHaveLength(1);
    expect(screen.getByText('데이터 기준일: 확인되지 않음')).toBeTruthy();
    expect(
      screen.getByText('합성 예시 데이터에는 외부 지도 검색을 제공하지 않습니다.'),
    ).toBeTruthy();
    expect(screen.queryByRole('link', { name: /지도/ })).toBeNull();
  });
});

describe('ResultCard complete evidence boundaries', () => {
  it('retains all eight absent lifecycle fields and complete long original addresses', () => {
    const value = '긴원본주소'.repeat(400);
    render(
      <ResultCard
        match={{
          ...match,
          record: {
            ...record,
            roadAddress: value,
            parcelAddress: value,
            lifecycle: {
              licensedOn: null,
              licenseCancelledOn: '',
              suspendedFrom: null,
              suspendedThrough: '',
              reopenedOn: null,
              closedOn: '',
              sourceUpdatedAt: null,
              sourceLastModifiedAt: '',
            },
          },
        }}
        coverage={{ kind: 'unavailable' }}
        layout="workspace"
      />,
    );
    expect(evidence('도로명 주소')).toBe(value);
    expect(evidence('지번 주소')).toBe(value);
    for (const label of [
      '인허가일',
      '인허가 취소일',
      '휴업 시작일',
      '휴업 종료일',
      '재개업일',
      '폐업일',
      '원본 데이터 갱신일',
      '원본 최종 수정일',
    ]) {
      expect(evidence(label)).toBe('제공되지 않음');
    }
  });

  it.each([
    [
      'verified',
      '데이터 기준일',
      '최근 데이터 갱신이 지연되고 있습니다. 아래 기준일을 확인하고 외부 지도 또는 사업체에 직접 확인하세요.',
    ],
    [
      'collected',
      '데이터 수집일',
      '데이터 수집일로부터 7일 이상 지났습니다. 외부 지도 또는 사업체에 직접 확인하세요.',
    ],
    [
      'synthetic',
      '예시 데이터 기준일',
      '합성 예시 데이터의 기준일로부터 7일 이상 지났습니다. 실제 사업체 상태를 나타내지 않습니다.',
    ],
  ] as const)('keeps complete %s evidence truthful at Seoul ages 6/7/8', (kind, label, warning) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-07T00:00:00.000Z'));
    const { rerender } = render(
      <CoverageClock>
        <ResultCard match={match} coverage={{ kind, date: '2026-09-01' }} layout="workspace" />
      </CoverageClock>,
    );
    expect(screen.getByText(`${label}: 2026-09-01`)).toBeTruthy();
    expect(screen.queryByText(warning)).toBeNull();
    for (const now of ['2026-09-07T15:00:00.000Z', '2026-09-08T15:00:00.000Z']) {
      vi.setSystemTime(new Date(now));
      rerender(
        <CoverageClock key={now}>
          <ResultCard match={match} coverage={{ kind, date: '2026-09-01' }} layout="workspace" />
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
    }
    if (kind === 'synthetic') {
      expect(screen.getAllByText('합성 예시 데이터 · 실제 사업체 조회가 아닙니다')).toHaveLength(1);
    }
  });

  it.each<Coverage>([
    { kind: 'unavailable' },
    { kind: 'verified', date: '2026-02-30' },
    { kind: 'verified', date: '2026-09-20' },
  ])('keeps complete rejected or unavailable coverage unknown for $kind/$date', (coverage) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-08T00:00:00.000Z'));
    render(<ResultCard match={match} coverage={coverage} layout="workspace" />);
    expect(screen.getByText('데이터 기준일: 확인되지 않음')).toBeTruthy();
    expect(evidence('원본 최종 수정일')).toBe('2025-08-09 10:11:12');
    expect(screen.queryByText(/최근 데이터 갱신이 지연/)).toBeNull();
  });
});
