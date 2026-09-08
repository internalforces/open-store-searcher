import { useState } from 'preact/hooks';
import { type SearchResult, searchCandidates } from '../search/search-candidates.js';
import { CoverageClock } from './coverage-clock.js';
import { demoDataset } from './demo-data.js';
import type { DisplayDataset, DisplayRecord } from './display-data.js';
import {
  EvidenceContext,
  SourceLink,
  statusDisclaimer,
  syntheticNotice,
} from './evidence-context.js';
import { SearchForm } from './search-form.js';
import { SearchResults } from './search-results.js';
import { type DisplayLoader, useDisplayData } from './use-display-data.js';
import './app.css';

type AppProps =
  | { dataset?: DisplayDataset; loader?: never }
  | { dataset?: never; loader: DisplayLoader };

export function App({ dataset: suppliedDataset, loader }: AppProps) {
  const loading = useDisplayData(loader ?? suppliedDataset ?? demoDataset);
  const dataset = loading.prepared?.dataset ?? null;
  const source = dataset ?? loader ?? suppliedDataset ?? demoDataset;
  const isSynthetic = loader?.kind === 'synthetic' || dataset?.coverage.kind === 'synthetic';
  const [draft, setDraft] = useState('');
  const [submission, setSubmission] = useState<{
    sequence: number;
    dataset: DisplayDataset;
    result: SearchResult<DisplayRecord>;
  } | null>(null);
  const index = loading.prepared?.index;
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
          {dataset?.coverage.kind !== 'synthetic' && isSynthetic && (
            <p className="synthetic-notice">{syntheticNotice}</p>
          )}
          <EvidenceContext coverage={dataset?.coverage ?? { kind: 'unavailable' }} />
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
            exampleQuery={dataset?.exampleQuery ?? ''}
            disabled={!dataset}
            onSubmit={() => {
              if (!dataset || !index) return;
              setSubmission((previous) => ({
                sequence: (previous?.sequence ?? 0) + 1,
                dataset,
                result: searchCandidates(index, draft),
              }));
            }}
          />
          {result?.validation.ok && (
            <button
              type="button"
              className="results-button"
              onClick={() => {
                document.getElementById('search-results')?.focus();
              }}
            >
              검색 결과로 이동
            </button>
          )}
          <p className="open-now-warning">현재 문이 열려 있는지는 확인할 수 없습니다</p>
        </div>
        <section className="data-state" aria-label="데이터 불러오기">
          {loading.phase === 'error' && (
            <div role="alert" className="uncertainty">
              <p>
                {dataset
                  ? '데이터를 다시 불러오지 못했습니다. 이전 데이터로 계속 검색할 수 있습니다.'
                  : '데이터를 불러오지 못했습니다. 아직 사업체 상태를 확인할 수 없습니다.'}
              </p>
              <p>
                다시 시도하거나 브라우저를 새로고침해 주세요. 문제가 계속되면{' '}
                <a
                  href="https://github.com/internalforces/open-store-searcher/issues"
                  referrerPolicy="no-referrer"
                >
                  저장소에 오류 신고
                </a>
                를 이용하세요. 검색어는 자동으로 첨부되지 않습니다.
              </p>
            </div>
          )}
          {loading.prepared && loading.prepared.excludedCount > 0 && (
            <p className="uncertainty">
              형식이 잘못되었거나 식별자가 중복된 레코드 {loading.prepared.excludedCount}개를
              제외했습니다. 나머지 데이터로 검색합니다. 검색 결과가 일부 누락될 수 있습니다.
            </p>
          )}
          {loading.loadedAt && (
            <p className="load-time">
              이 브라우저에서 마지막으로 불러온 시각:{' '}
              <time dateTime={loading.loadedAt}>{loading.loadedAt}</time>
            </p>
          )}
          {loader && (
            <>
              <p className="input-help">
                다시 불러오기는 원본 데이터가 갱신되었다는 뜻은 아닙니다. 데이터 기준일과 원본
                출처를 확인하세요.
              </p>
              <button
                type="button"
                className="reload-button"
                aria-disabled={loading.phase === 'loading'}
                onClick={() => {
                  if (loading.phase !== 'loading') loading.reload();
                }}
              >
                데이터 다시 불러오기
              </button>
            </>
          )}
        </section>
        <p role="status" aria-live="polite" aria-atomic="true" className="result-summary">
          {loading.phase === 'loading'
            ? dataset
              ? '데이터를 다시 불러오는 중입니다. 이전 데이터로 검색할 수 있습니다. '
              : '데이터를 불러오는 중입니다. 잠시 기다려 주세요. '
            : loading.phase === 'ready' && loader
              ? `데이터를 불러왔습니다. ${loading.prepared?.excludedCount ?? 0}개 레코드 제외. `
              : ''}
          {result?.validation.ok
            ? `검색 ${submission?.sequence}회 완료 · 일치 후보 ${result.eligibleCount}개 · 유사 후보 ${result.similarCount}개`
            : ''}
          {result?.validation.ok &&
            result.eligibleCount === 0 &&
            result.similarCount === 0 &&
            ' · 일치하는 데이터를 찾지 못했습니다. 폐업을 의미하지 않습니다. 검색어를 바꾸거나 원본 출처를 확인하세요.'}
          {result?.validation.ok &&
            result.ambiguousTop &&
            ' · 동일하게 일치하는 후보가 여러 개입니다. 원본 정보를 비교해 주세요.'}
          {result?.validation.ok &&
            result.similarCount > 0 &&
            ' · 유사 후보는 같은 사업체인지 주소와 원본 정보를 확인하세요.'}
        </p>
        {dataset && result?.validation.ok && (
          <SearchResults result={result} coverage={dataset.coverage} synthetic={isSynthetic} />
        )}
      </main>
      <footer className="page-footer">
        <div className="footer-content">
          <h2>출처와 이용 안내</h2>
          {isSynthetic ? (
            <p>
              현재 화면은 프로젝트에서 만든 합성 예시로 작동합니다. 실제 사업체 상태를 확인하는 데
              사용할 수 없습니다.
            </p>
          ) : (
            <p>각 결과 카드의 원본 출처와 데이터 기준일을 함께 확인하세요.</p>
          )}
          <p>
            데이터 출처: <SourceLink label={source.sourceLabel} url={source.sourceUrl} />
          </p>
          {isSynthetic && (
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
