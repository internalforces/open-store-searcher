import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import type { SearchResult } from '../search/search-candidates.js';
import type { Coverage, DisplayRecord } from './display-data.js';
import { ResultCard } from './result-card.js';

export function SearchResults({
  result,
  coverage,
  synthetic = false,
}: {
  result: SearchResult<DisplayRecord>;
  coverage: Coverage;
  synthetic?: boolean;
}) {
  const [page, setPage] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const previousPage = useRef(0);
  const pageSize = 20;
  const total = result.similarCandidates.length;
  const lastPage = Math.max(0, Math.ceil(total / pageSize) - 1);
  const start = page * pageSize;
  useLayoutEffect(() => {
    if (previousPage.current !== page) heading.current?.focus();
    previousPage.current = page;
  }, [page]);
  const primary = result.primaryMatch;
  const remaining = result.topMatches.filter((match) => match.record.id !== primary?.record.id);
  return (
    <section
      id="search-results"
      className="search-results"
      data-total-candidates={result.topMatches.length + total}
      tabIndex={-1}
      aria-label="검색 결과"
    >
      <p className="submitted-query">검색 결과: {result.validation.original}</p>
      {result.ambiguousTop && (
        <p className="uncertainty">
          동일하게 일치하는 후보가 여러 개입니다. 원본 정보를 비교해 주세요.
        </p>
      )}
      {primary && (
        <section aria-labelledby="primary-heading">
          <h2 id="primary-heading">가장 잘 일치하는 결과</h2>
          <ResultCard match={primary} position={1} coverage={coverage} synthetic={synthetic} />
        </section>
      )}
      {remaining.length > 0 && (
        <section aria-labelledby="matches-heading">
          <h2 id="matches-heading">일치 후보</h2>
          <ul className="candidate-list" aria-labelledby="matches-heading">
            {remaining.map((match, index) => (
              <li key={match.record.id}>
                <ResultCard
                  key={match.record.id}
                  match={match}
                  position={index + (primary ? 1 : 0) + 1}
                  coverage={coverage}
                  synthetic={synthetic}
                />
              </li>
            ))}
          </ul>
        </section>
      )}
      {result.similarCandidates.length > 0 && (
        <section aria-labelledby="similar-heading">
          <h2 id="similar-heading" ref={heading} tabIndex={-1}>
            유사 후보
          </h2>
          <p className="section-help">
            이름이 같아도 다른 사업체일 수 있습니다. 주소와 원본 정보를 직접 비교해 주세요. 상호명과
            시·군·구, 도로명과 건물번호를 함께 입력해 다시 검색해 보세요.
          </p>
          {total > pageSize && (
            <div className="candidate-pagination">
              <p role="status" aria-live="polite" aria-atomic="true">
                유사 후보 {total}개 중 {start + 1}–{Math.min(start + pageSize, total)}개 ·{' '}
                {page + 1}/{lastPage + 1}페이지
              </p>
              <nav aria-label="유사 후보 페이지">
                <button type="button" disabled={page === 0} onClick={() => setPage(0)}>
                  처음 페이지
                </button>
                <button type="button" disabled={page === 0} onClick={() => setPage(page - 1)}>
                  이전 페이지
                </button>
                <button
                  type="button"
                  disabled={page === lastPage}
                  onClick={() => setPage(page + 1)}
                >
                  다음 페이지
                </button>
                <button
                  type="button"
                  disabled={page === lastPage}
                  onClick={() => setPage(lastPage)}
                >
                  마지막 페이지
                </button>
              </nav>
            </div>
          )}
          <ul className="candidate-list" aria-labelledby="similar-heading">
            {result.similarCandidates.slice(start, start + pageSize).map((match, index) => (
              <li key={match.record.id} aria-posinset={start + index + 1} aria-setsize={total}>
                <ResultCard
                  key={match.record.id}
                  match={match}
                  position={start + index + remaining.length + (primary ? 1 : 0) + 1}
                  coverage={coverage}
                  synthetic={synthetic}
                />
              </li>
            ))}
          </ul>
        </section>
      )}
      {result.topMatches.length === 0 && result.similarCandidates.length === 0 && (
        <div className="empty-result">
          <p>
            일치하는 공개 인허가 데이터를 찾지 못했습니다. 데이터 미등재, 상호 변경 또는 검색어
            차이일 수 있으며 폐업을 의미하지 않습니다.
          </p>
          <p>
            상호명 철자와 띄어쓰기를 확인하거나 도로명 주소 또는 지번 주소로 다시 검색해 보세요.
            그래도 찾지 못하면 원본 출처나 사업체에 직접 확인해 주세요.
          </p>
        </div>
      )}
    </section>
  );
}
