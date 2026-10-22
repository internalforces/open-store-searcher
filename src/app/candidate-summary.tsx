import type { CandidateMatch } from '../search/search-candidates.js';
import type { Coverage, DisplayRecord } from './display-data.js';
import { EvidenceField, RecordEvidence, RecordStatus } from './record-evidence.js';

const confidenceLabels = { high: '높음', medium: '보통', low: '낮음' } as const;

export function CandidateSummary({
  match,
  coverage,
  synthetic = false,
  position,
  selected,
  onInspect,
}: {
  match: CandidateMatch<DisplayRecord>;
  coverage: Coverage;
  synthetic?: boolean;
  position: number;
  selected: boolean;
  onInspect: (button: HTMLButtonElement) => void;
}) {
  const { record } = match;
  const displayName = record.name.trim() ? record.name : '제공되지 않음';
  const address = record.roadAddress.trim()
    ? record.roadAddress
    : record.parcelAddress.trim()
      ? record.parcelAddress
      : null;
  const identity = `${displayName} · ${address ?? '주소 제공되지 않음'} · 후보 ${position}`;
  return (
    <article
      className="candidate-summary"
      data-selected={selected}
      aria-label={`${displayName} 인허가 정보 · ${address ?? '주소 제공되지 않음'} · 후보 ${position}`}
    >
      <header className="candidate-header">
        <h3>{displayName}</h3>
        <div className="badges">
          <RecordStatus record={record} />
          <span className="confidence">일치 신뢰도 {confidenceLabels[match.confidence]}</span>
        </div>
      </header>
      <dl className="candidate-identity">
        <EvidenceField label="주소" value={address} />
        <EvidenceField label="업종" value={record.categoryName} />
      </dl>
      {match.confidence === 'low' && (
        <p className="uncertainty">검색한 사업체와 같은 곳인지 주소와 원본 정보를 확인하세요.</p>
      )}
      <RecordEvidence record={record} coverage={coverage} synthetic={synthetic} />
      <button
        type="button"
        className="inspect-button"
        aria-label={`${identity} 상세 보기`}
        aria-pressed={selected}
        onClick={(event) => onInspect(event.currentTarget)}
      >
        <span>{selected ? '상세 보는 중' : '상세 보기'}</span>
        <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
          <path d="M4 10h12m-5-5 5 5-5 5" />
        </svg>
      </button>
    </article>
  );
}
