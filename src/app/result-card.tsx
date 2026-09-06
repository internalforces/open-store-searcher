import { mapLicenseStatusV1 } from '../domain/map-license-status.js';
import type { CandidateMatch } from '../search/search-candidates.js';
import type { Coverage, DisplayRecord } from './display-data.js';
import { EvidenceContext, SourceLink, statusDisclaimer } from './evidence-context.js';

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
  coverage,
}: {
  match: CandidateMatch<DisplayRecord>;
  coverage: Coverage;
}) {
  const { record } = match;
  const status = mapLicenseStatusV1(record.rawStatus);
  return (
    <article className="result-card" aria-label={`${record.name} 인허가 정보`}>
      <header className="card-header">
        <h3>{record.name}</h3>
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
      </footer>
    </article>
  );
}
