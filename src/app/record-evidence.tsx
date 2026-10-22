import { mapLicenseStatusV1 } from '../domain/map-license-status.js';
import type { Coverage, DisplayRecord } from './display-data.js';
import {
  EvidenceContext,
  SourceLink,
  statusDisclaimer,
  syntheticNotice,
} from './evidence-context.js';

const statusStyles = {
  '행정상 영업': 'operating',
  휴업: 'suspended',
  폐업: 'closed',
  '확인되지 않음': 'unverified',
} as const;

/** The policy mapper owns the label; each status has a distinct, non-color SVG glyph. */
export function RecordStatus({ record }: { record: DisplayRecord }) {
  const status = mapLicenseStatusV1(record.rawStatus);
  return (
    <span className="status-badge" data-status={statusStyles[status]}>
      <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        {status === '행정상 영업' ? (
          <>
            <circle cx="10" cy="10" r="7" />
            <path d="m6.5 10 2.3 2.3 4.7-4.8" />
          </>
        ) : status === '휴업' ? (
          <>
            <rect x="4" y="3" width="12" height="14" rx="3" />
            <path d="M8 7v6m4-6v6" />
          </>
        ) : status === '폐업' ? (
          <>
            <path d="m7 3-4 4v6l4 4h6l4-4V7l-4-4Z" />
            <path d="m7.5 7.5 5 5m0-5-5 5" />
          </>
        ) : (
          <>
            <path d="m10 2 8 8-8 8-8-8Z" />
            <path d="M8 7.3a2.1 2.1 0 0 1 4 .8c0 1.4-2 1.5-2 3M10 14h.01" />
          </>
        )}
      </svg>
      {status}
    </span>
  );
}

export function EvidenceField({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value === null || value === '' ? '제공되지 않음' : value}</dd>
    </div>
  );
}

/** Read-only evidence is owned by the surrounding record view, never a separate selection. */
export function RecordEvidence({
  record,
  coverage,
  synthetic = false,
}: {
  record: DisplayRecord;
  coverage: Coverage;
  synthetic?: boolean;
}) {
  return (
    <section className="record-evidence" aria-label="원본 상태와 날짜">
      <h4>원본 근거</h4>
      <dl className="evidence-grid">
        <EvidenceField label="원본 영업상태 코드" value={record.rawStatus.operatingCode} />
        <EvidenceField label="원본 영업상태명" value={record.rawStatus.operatingName} />
        <EvidenceField label="원본 상세상태 코드" value={record.rawStatus.detailedCode} />
        <EvidenceField label="원본 상세상태명" value={record.rawStatus.detailedName} />
      </dl>
      <p className="record-source">
        출처: <SourceLink label={record.sourceLabel} url={record.sourceUrl} />
      </p>
      {synthetic && coverage.kind !== 'synthetic' && (
        <p className="synthetic-notice">{syntheticNotice}</p>
      )}
      <EvidenceContext coverage={coverage} />
      <p className="disclaimer">{statusDisclaimer}</p>
    </section>
  );
}
