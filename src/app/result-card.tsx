import { mapLicenseStatusV1 } from '../domain/map-license-status.js';
import type { CandidateMatch } from '../search/search-candidates.js';
import type { Coverage, DisplayRecord } from './display-data.js';
import { EvidenceContext, SourceLink, statusDisclaimer } from './evidence-context.js';

import { MapLinks } from './map-links.js';

const confidenceLabels = { high: '높음', medium: '보통', low: '낮음' } as const;
const statusStyles = {
  '행정상 영업': 'operating',
  휴업: 'suspended',
  폐업: 'closed',
  '확인되지 않음': 'unverified',
} as const;
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

function EvidenceField({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value === null || value === '' ? '제공되지 않음' : value}</dd>
    </div>
  );
}

export function ResultCard({
  match,
  position,
  coverage,
  synthetic = false,
}: {
  match: CandidateMatch<DisplayRecord>;
  position?: number;
  coverage: Coverage;
  synthetic?: boolean;
}) {
  const { record } = match;
  const displayName = record.name.trim() ? record.name : '제공되지 않음';
  const address =
    record.roadAddress?.trim() || record.parcelAddress?.trim() || '주소 제공되지 않음';
  const status = mapLicenseStatusV1(record.rawStatus);
  return (
    <article
      className="result-card"
      // biome-ignore lint/a11y/noNoninteractiveTabindex: Bounded read-only candidates need focus to inspect evidence even without links.
      tabIndex={0}
      aria-label={`${displayName} 인허가 정보 · ${address}${position === undefined ? '' : ` · 후보 ${position}`}`}
      onFocus={(event) => {
        // Native focus can reveal the bottom of a tall card. Keep its identity visible.
        // Child links retain their own scroll position while navigating the evidence.
        if (event.target === event.currentTarget) {
          event.currentTarget.scrollIntoView({ block: 'start' });
        }
      }}
    >
      <header className="card-header">
        <h3>{displayName}</h3>
        <div className="badges">
          <span className="status-badge" data-status={statusStyles[status]}>
            {status}
          </span>
          <span className="confidence">일치 신뢰도 {confidenceLabels[match.confidence]}</span>
        </div>
      </header>
      {match.confidence === 'low' && (
        <p className="uncertainty">검색한 사업체와 같은 곳인지 주소와 원본 정보를 확인하세요.</p>
      )}
      <dl className="evidence-grid">
        <EvidenceField label="도로명 주소" value={record.roadAddress} />
        <EvidenceField label="지번 주소" value={record.parcelAddress} />
        <EvidenceField label="업종" value={record.categoryName} />
        {record.businessTypes.length === 0 ? (
          <EvidenceField label="업태" value={null} />
        ) : (
          record.businessTypes.map((type) => (
            <EvidenceField
              key={type.sourceField}
              label={`업태 (${type.sourceField})`}
              value={type.value}
            />
          ))
        )}
      </dl>
      <section className="raw-evidence" aria-label="원본 상태와 날짜">
        <h4>원본 근거</h4>
        <dl className="evidence-grid">
          <EvidenceField label="원본 영업상태 코드" value={record.rawStatus.operatingCode} />
          <EvidenceField label="원본 영업상태명" value={record.rawStatus.operatingName} />
          <EvidenceField label="원본 상세상태 코드" value={record.rawStatus.detailedCode} />
          <EvidenceField label="원본 상세상태명" value={record.rawStatus.detailedName} />
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
        <p>
          출처: <SourceLink label={record.sourceLabel} url={record.sourceUrl} />
        </p>
        <EvidenceContext coverage={coverage} />
        <p className="disclaimer">{statusDisclaimer}</p>
        <MapLinks record={record} synthetic={synthetic || coverage.kind === 'synthetic'} />
      </footer>
    </article>
  );
}
