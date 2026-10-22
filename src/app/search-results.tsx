import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import type { CandidateMatch, SearchResult } from '../search/search-candidates.js';
import { CandidateSummary } from './candidate-summary.js';
import type { Coverage, DisplayRecord } from './display-data.js';
import { ResultCard } from './result-card.js';

export function SearchResults({
  result,
  coverage,
  synthetic = false,
  onPage,
  busy = false,
}: {
  result: SearchResult<DisplayRecord> & { page?: number };
  onPage?: (page: number) => void;
  busy?: boolean;
  coverage: Coverage;
  synthetic?: boolean;
}) {
  const [localPage, setLocalPage] = useState(0);
  const [inspectedId, setInspectedId] = useState<string | null>(() =>
    result.ambiguousTop ? null : (result.primaryMatch?.record.id ?? null),
  );
  const page = result.page ?? localPage;
  const primaryHeading = useRef<HTMLHeadingElement>(null);
  const matchesHeading = useRef<HTMLHeadingElement>(null);
  const similarHeading = useRef<HTMLHeadingElement>(null);
  const detailHeading = useRef<HTMLHeadingElement>(null);
  const origin = useRef<{
    button: HTMLButtonElement;
    group: 'primary' | 'matches' | 'similar';
  } | null>(null);
  const focusInspection = useRef(false);
  const previousPage = useRef(page);
  const pageSize = 20;
  const total = result.similarCount;
  const lastPage = Math.max(0, Math.ceil(total / pageSize) - 1);
  const start = page * pageSize;
  const primary = result.primaryMatch;
  const remaining = result.topMatches.filter((match) => match.record.id !== primary?.record.id);
  const similar = onPage
    ? result.similarCandidates
    : result.similarCandidates.slice(start, start + pageSize);
  // Resolve from this accepted page before rendering. No previous record/evidence can paint.
  const visible = [...result.topMatches, ...similar];
  const selected = visible.find((match) => match.record.id === inspectedId) ?? null;
  const selectedPosition = selected
    ? visible.indexOf(selected) + 1 + (result.topMatches.includes(selected) ? 0 : start)
    : 0;
  useLayoutEffect(() => {
    if (inspectedId !== null && !selected) {
      setInspectedId(null);
      origin.current = null;
    }
    if (previousPage.current !== page) {
      similarHeading.current?.focus();
      focusInspection.current = false;
    } else if (focusInspection.current) {
      detailHeading.current?.focus();
      focusInspection.current = false;
    }
    previousPage.current = page;
  });
  const setPage = (next: number) => {
    if (busy || next === page || next < 0 || next > lastPage) return;
    if (onPage) onPage(next);
    else setLocalPage(next);
  };
  const summary = (
    match: CandidateMatch<DisplayRecord>,
    position: number,
    group: 'primary' | 'matches' | 'similar',
  ) => (
    <CandidateSummary
      match={match}
      position={position}
      coverage={coverage}
      synthetic={synthetic}
      selected={match.record.id === selected?.record.id}
      onInspect={(button) => {
        origin.current = { button, group };
        if (match.record.id === inspectedId) detailHeading.current?.focus();
        else {
          focusInspection.current = true;
          setInspectedId(match.record.id);
        }
      }}
    />
  );
  return (
    <section
      id="search-results"
      className="search-results"
      data-total-candidates={result.topMatches.length + total}
      tabIndex={-1}
      aria-label="검색 결과"
      aria-busy={busy}
    >
      <p className="submitted-query">
        검색 결과: {result.validation.original}
        <span key={page} className="result-glint" aria-hidden="true" />
      </p>
      {busy && (
        <p className="workspace-busy">
          검색 결과를 불러오는 중입니다. 이전 후보와 상세 정보를 표시합니다.
        </p>
      )}
      {result.ambiguousTop && (
        <p className="uncertainty">
          동일하게 일치하는 후보가 여러 개입니다. 원본 정보를 비교해 주세요.
        </p>
      )}
      <div className="workspace-grid workspace-results-grid">
        <div className="workspace-candidates">
          {primary && (
            <section aria-labelledby="primary-heading">
              <h2 id="primary-heading" ref={primaryHeading} tabIndex={-1}>
                가장 잘 일치하는 결과
              </h2>
              {summary(primary, 1, 'primary')}
            </section>
          )}
          {remaining.length > 0 && (
            <section aria-labelledby="matches-heading">
              <h2 id="matches-heading" ref={matchesHeading} tabIndex={-1}>
                일치 후보
              </h2>
              <ul className="candidate-list" aria-labelledby="matches-heading">
                {remaining.map((match, index) => (
                  <li key={match.record.id}>
                    {summary(match, index + (primary ? 1 : 0) + 1, 'matches')}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {similar.length > 0 && (
            <section aria-labelledby="similar-heading">
              <h2 id="similar-heading" ref={similarHeading} tabIndex={-1}>
                유사 후보
              </h2>
              <p className="section-help">
                이름이 같아도 다른 사업체일 수 있습니다. 주소와 원본 정보를 직접 비교해 주세요.
                상호명과 시·군·구, 도로명과 건물번호를 함께 입력해 다시 검색해 보세요.
              </p>
              {total > pageSize && (
                <div className="candidate-pagination">
                  <p role="status" aria-live="polite" aria-atomic="true">
                    유사 후보 {total}개 중 {start + 1}–{Math.min(start + pageSize, total)}개 ·{' '}
                    {page + 1}/{lastPage + 1}페이지
                  </p>
                  <nav aria-label="유사 후보 페이지">
                    <button type="button" disabled={busy || page === 0} onClick={() => setPage(0)}>
                      처음 페이지
                    </button>
                    <button
                      type="button"
                      disabled={busy || page === 0}
                      onClick={() => setPage(page - 1)}
                    >
                      이전 페이지
                    </button>
                    <button
                      type="button"
                      disabled={busy || page === lastPage}
                      onClick={() => setPage(page + 1)}
                    >
                      다음 페이지
                    </button>
                    <button
                      type="button"
                      disabled={busy || page === lastPage}
                      onClick={() => setPage(lastPage)}
                    >
                      마지막 페이지
                    </button>
                  </nav>
                </div>
              )}
              <ul className="candidate-list" aria-labelledby="similar-heading">
                {similar.map((match, index) => (
                  <li key={match.record.id} aria-posinset={start + index + 1} aria-setsize={total}>
                    {summary(match, start + index + result.topMatches.length + 1, 'similar')}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
        {selected ? (
          <ResultCard
            key={selected.record.id}
            match={selected}
            position={selectedPosition}
            coverage={coverage}
            synthetic={synthetic}
            layout="workspace"
            headingRef={detailHeading}
            onReturn={() => {
              const source = origin.current;
              const group = source?.group ?? 'primary';
              const fallback =
                group === 'primary'
                  ? primaryHeading
                  : group === 'matches'
                    ? matchesHeading
                    : similarHeading;
              (source?.button.isConnected ? source.button : fallback.current)?.focus();
            }}
          />
        ) : visible.length > 0 ? (
          <div className="workspace-panel workspace-inspection-prompt">
            <h2>후보 상세 정보</h2>
            <p>후보를 선택해 상세 정보를 확인하세요.</p>
            <p>
              상세 보기는 같은 사업체임을 확정하지 않습니다. 주소와 원본 정보를 함께 비교해 주세요.
            </p>
          </div>
        ) : null}
      </div>
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
