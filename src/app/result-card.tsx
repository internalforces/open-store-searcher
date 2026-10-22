import type { Ref } from 'preact';
import type { CandidateMatch } from '../search/search-candidates.js';
import type { Coverage, DisplayRecord } from './display-data.js';
import { EvidenceField, RecordEvidence, RecordStatus } from './record-evidence.js';

import { MapLinks } from './map-links.js';

const confidenceLabels = { high: '높음', medium: '보통', low: '낮음' } as const;
const lifecycleLabels = {
  licensedOn: '인허가일',
  licenseCancelledOn: '인허가 취소일',
  suspendedFrom: '휴업 시작일',
  suspendedThrough: '휴업 종료일',
  reopenedOn: '재개업일',
  closedOn: '폐업일',
  sourceUpdatedAt: '원본 데이터 갱신일',
  sourceLastModifiedAt: '원본 최종 수정일',
} as const;

export function ResultCard({
  match,
  position,
  coverage,
  synthetic = false,
  layout = 'card',
  headingRef,
  onReturn,
}: {
  match: CandidateMatch<DisplayRecord>;
  position?: number;
  coverage: Coverage;
  synthetic?: boolean;
  layout?: 'card' | 'workspace';
  headingRef?: Ref<HTMLHeadingElement>;
  onReturn?: () => void;
}) {
  const { record } = match;
  const displayName = record.name.trim() ? record.name : '제공되지 않음';
  const address =
    record.roadAddress?.trim() || record.parcelAddress?.trim() || '주소 제공되지 않음';
  const workspace = layout === 'workspace';
  const businessTypeOccurrences = new Map<string, number>();
  return (
    <article
      className={`result-card${workspace ? ' workspace-detail' : ''}`}
      // Default full cards remain keyboard focusable; workspace details focus their heading.
      tabIndex={workspace ? undefined : 0}
      aria-label={`${displayName} 인허가 정보 · ${address}${position === undefined ? '' : ` · 후보 ${position}`}`}
      onFocus={(event) => {
        // Native focus can reveal the bottom of a tall card. Keep its identity visible.
        // Child links retain their own scroll position while navigating the evidence.
        if (event.target === event.currentTarget) {
          event.currentTarget.scrollIntoView({ block: 'start' });
        }
      }}
    >
      {workspace && <span className="detail-glint" aria-hidden="true" />}
      <header className="card-header">
        <h3 ref={headingRef ?? null} tabIndex={workspace ? -1 : undefined}>
          {displayName}
        </h3>
        <div className="badges">
          <RecordStatus record={record} />
          <span className="confidence">일치 신뢰도 {confidenceLabels[match.confidence]}</span>
        </div>
      </header>
      {match.confidence === 'low' && (
        <p className="uncertainty">검색한 사업체와 같은 곳인지 주소와 원본 정보를 확인하세요.</p>
      )}
      <RecordEvidence record={record} coverage={coverage} synthetic={synthetic} />
      <section className="record-basics" aria-label="사업체 기본 정보">
        <h4>사업체 정보</h4>
        <dl className="evidence-grid">
          <EvidenceField label="도로명 주소" value={record.roadAddress} />
          <EvidenceField label="지번 주소" value={record.parcelAddress} />
          <EvidenceField label="업종" value={record.categoryName} />
          {record.businessTypes.length === 0 ? (
            <EvidenceField label="업태" value={null} />
          ) : (
            record.businessTypes.map((type) => {
              const occurrence = businessTypeOccurrences.get(type.sourceField) ?? 0;
              businessTypeOccurrences.set(type.sourceField, occurrence + 1);
              return (
                <EvidenceField
                  key={`${type.sourceField}:${occurrence}`}
                  label={`업태 (${type.sourceField})`}
                  value={type.value}
                />
              );
            })
          )}
        </dl>
      </section>
      <section className="record-lifecycle" aria-label="인허가와 원본 날짜">
        <h4>인허가와 원본 날짜</h4>
        <dl className="evidence-grid">
          {Object.entries(lifecycleLabels).map(([key, label]) => (
            <EvidenceField
              key={key}
              label={label}
              value={record.lifecycle[key as keyof typeof lifecycleLabels]}
            />
          ))}
        </dl>
      </section>
      <footer className="card-footer">
        <MapLinks record={record} synthetic={synthetic || coverage.kind === 'synthetic'} />
        {workspace && onReturn && (
          <button type="button" className="return-button" onClick={() => onReturn()}>
            후보 목록으로 돌아가기
          </button>
        )}
      </footer>
    </article>
  );
}
