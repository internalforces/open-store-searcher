import type { Coverage } from './display-data.js';

export const syntheticNotice = '합성 예시 데이터 · 실제 사업체 조회가 아닙니다';
export const statusDisclaimer =
  '행정상 영업은 공개 인허가 데이터에 기록된 상태이며, 현재 문이 열려 있음을 의미하지 않습니다.';

export function EvidenceContext({ coverage }: { coverage: Coverage }) {
  return (
    <div className="evidence-context">
      {coverage.kind === 'synthetic' && <p className="synthetic-notice">{syntheticNotice}</p>}
      <p className="coverage-date">
        {coverage.kind === 'synthetic' ? '예시 데이터 기준일' : '데이터 기준일'}:{' '}
        {coverage.kind === 'unavailable' ? '확인되지 않음' : coverage.date}
      </p>
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
