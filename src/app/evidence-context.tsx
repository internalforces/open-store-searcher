import { useContext } from 'preact/hooks';
import { evaluateDataFreshnessV1 } from '../shared/data-freshness.js';
import { CoverageNow } from './coverage-clock.js';
import type { Coverage } from './display-data.js';

export const syntheticNotice = '합성 예시 데이터 · 실제 사업체 조회가 아닙니다';
export const statusDisclaimer =
  '행정상 영업은 공개 인허가 데이터에 기록된 상태이며, 현재 문이 열려 있음을 의미하지 않습니다.';

export function EvidenceContext({ coverage }: { coverage: Coverage }) {
  const now = useContext(CoverageNow) ?? new Date().toISOString();
  const freshness = evaluateDataFreshnessV1(
    coverage.kind === 'unavailable' ? null : coverage.date,
    now,
  );
  const known = freshness.kind === 'fresh' || freshness.kind === 'stale';
  // Current user-approved ADR-015 display boundary; preserve the historical V1 helper contract.
  const stale = known && freshness.ageDays >= 7;
  return (
    <div className="evidence-context">
      {coverage.kind === 'synthetic' && <p className="synthetic-notice">{syntheticNotice}</p>}
      <p className="coverage-date">
        {coverage.kind === 'synthetic'
          ? '예시 데이터 기준일'
          : coverage.kind === 'collected'
            ? '데이터 수집일'
            : '데이터 기준일'}
        : {coverage.kind === 'unavailable' || !known ? '확인되지 않음' : coverage.date}
      </p>
      {coverage.kind === 'collected' && (
        <p className="uncertainty">
          원천 데이터 기준일은 확인되지 않았습니다. 수집일은 사업체 상태가 확인된 날짜가 아닙니다.
        </p>
      )}
      {stale && (
        <p className="uncertainty">
          {coverage.kind === 'synthetic'
            ? '합성 예시 데이터의 기준일로부터 7일 이상 지났습니다. 실제 사업체 상태를 나타내지 않습니다.'
            : coverage.kind === 'collected'
              ? '데이터 수집일로부터 7일 이상 지났습니다. 외부 지도 또는 사업체에 직접 확인하세요.'
              : '최근 데이터 갱신이 지연되고 있습니다. 아래 기준일을 확인하고 외부 지도 또는 사업체에 직접 확인하세요.'}
        </p>
      )}
    </div>
  );
}

/** Source metadata is never derived from a query. New-window navigation is unnecessary. */
export function SourceLink({ label, url }: { label: string; url: string | null }) {
  let href: string | null = null;
  if (url) {
    try {
      const parsed = new URL(url);
      if (parsed.protocol === 'https:' && !parsed.username && !parsed.password) href = url;
    } catch {
      // Preserve the source label even when its supplied URL cannot be used.
    }
  }
  return href ? (
    <a href={href} referrerPolicy="no-referrer">
      {label}
    </a>
  ) : (
    <span>{label}</span>
  );
}
