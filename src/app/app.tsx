import { useMemo, useState } from 'preact/hooks';
import {
  createSearchIndex,
  type SearchResult,
  searchCandidates,
} from '../search/search-candidates.js';
import { CoverageClock } from './coverage-clock.js';
import { demoDataset } from './demo-data.js';
import type { DisplayDataset, DisplayRecord } from './display-data.js';
import { EvidenceContext, SourceLink, statusDisclaimer } from './evidence-context.js';
import { SearchForm } from './search-form.js';
import { SearchResults } from './search-results.js';
import './app.css';

export function App({ dataset = demoDataset }: { dataset?: DisplayDataset }) {
  const [draft, setDraft] = useState('');
  const [submission, setSubmission] = useState<{
    sequence: number;
    dataset: DisplayDataset;
    result: SearchResult<DisplayRecord>;
  } | null>(null);
  const index = useMemo(() => createSearchIndex(dataset.records), [dataset]);
  // A new supplied dataset must never inherit results or coverage from the old one.
  const result = submission?.dataset === dataset ? submission.result : null;
  const error = result && !result.validation.ok ? result.validation.message : null;
  return (
    <CoverageClock>
      <main className="page-shell">
        <header className="page-header">
          <p className="eyebrow">서울 사업체 · 공개 인허가 정보</p>
          <h1>open-store-searcher</h1>
          <p className="purpose">
            상호명이나 주소로 공개 행정 데이터상의 사업체 상태를 확인하세요.
          </p>
          <EvidenceContext coverage={dataset.coverage} />
        </header>
        <div className="search-panel">
          <SearchForm
            value={draft}
            onChange={(value) => {
              setDraft(value);
              setSubmission((previous) =>
                previous && !previous.result.validation.ok ? null : previous,
              );
            }}
            error={error}
            exampleQuery={dataset.exampleQuery}
            onSubmit={() =>
              setSubmission((previous) => ({
                sequence: (previous?.sequence ?? 0) + 1,
                dataset,
                result: searchCandidates(index, draft),
              }))
            }
          />
          <p className="open-now-warning">현재 문이 열려 있는지는 확인할 수 없습니다</p>
        </div>
        <p role="status" aria-live="polite" aria-atomic="true" className="result-summary">
          {result?.validation.ok
            ? `검색 ${submission?.sequence}회 완료 · 일치 후보 ${result.eligibleCount}개 · 유사 후보 ${result.similarCount}개`
            : ''}
        </p>
        {result?.validation.ok && <SearchResults result={result} coverage={dataset.coverage} />}
      </main>
      <footer className="page-footer">
        <div className="footer-content">
          <h2>출처와 이용 안내</h2>
          {dataset.coverage.kind === 'synthetic' ? (
            <p>
              현재 화면은 프로젝트에서 만든 합성 예시로 작동합니다. 실제 사업체 상태를 확인하는 데
              사용할 수 없습니다.
            </p>
          ) : (
            <p>각 결과 카드의 원본 출처와 데이터 기준일을 함께 확인하세요.</p>
          )}
          <p>
            데이터 출처: <SourceLink label={dataset.sourceLabel} url={dataset.sourceUrl} />
          </p>
          {dataset.coverage.kind === 'synthetic' && (
            <p>
              <a href="https://www.data.go.kr/" referrerPolicy="no-referrer">
                향후 실제 데이터 출처: 행정안전부 공공데이터
              </a>
            </p>
          )}
          <p>{statusDisclaimer}</p>
          <p>검색어는 이 브라우저에서만 처리하며 저장하거나 전송하지 않습니다.</p>
        </div>
      </footer>
    </CoverageClock>
  );
}
