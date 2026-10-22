import type { JSX } from 'preact';
import type { Coverage } from './display-data.js';
import { SourceLink } from './evidence-context.js';

/** First-use guidance contains dataset context, never a simulated business record. */
export function WorkspaceIntro({
  coverage,
  sourceLabel,
  sourceUrl,
}: {
  coverage: Coverage;
  sourceLabel: string;
  sourceUrl: string | null;
}): JSX.Element {
  return (
    <section className="workspace-intro workspace-grid" aria-label="검색 시작 안내">
      <div className="workspace-panel intro-search">
        <h2 id="workspace-results" tabIndex={-1}>
          검색을 시작해 보세요
        </h2>
        <p>상호명과 주소를 함께 입력하면 후보를 더 정확하게 비교할 수 있습니다.</p>
        <ol className="intro-steps">
          <li>상호명 또는 주소를 두 글자 이상 입력하세요.</li>
          <li>검색 결과에서 이름과 주소를 비교하세요.</li>
          <li>원본 상태와 출처, 날짜를 함께 확인하세요.</li>
        </ol>
        <p className="section-help">검색어는 이 브라우저에서만 처리합니다.</p>
      </div>
      <div className="workspace-panel intro-prism">
        <h2>사업체 정보와 근거를 한곳에서</h2>
        <div className="prism-art" aria-hidden="true">
          <svg aria-hidden="true" viewBox="0 0 440 160" focusable="false">
            <defs>
              <linearGradient id="prism-face" x1="0" x2="1" y2="1">
                <stop stop-color="#55DDF6" />
                <stop offset=".55" stop-color="#B8A0FF" />
                <stop offset="1" stop-color="#F5B9E7" />
              </linearGradient>
              <linearGradient id="prism-side" x1="0" x2="1">
                <stop stop-color="#2456E8" />
                <stop offset="1" stop-color="#B8A0FF" />
              </linearGradient>
            </defs>
            <path d="m220 10 100 55-100 83-100-83Z" fill="url(#prism-face)" />
            <path d="m220 10 20 55-20 83-100-83Z" fill="white" fill-opacity=".45" />
            <path d="m220 10 100 55-100 83 20-83Z" fill="url(#prism-side)" fill-opacity=".6" />
            <path
              d="m120 65 200 0M220 10l20 55-20 83"
              fill="none"
              stroke="white"
              stroke-width="2"
            />
            <path
              d="m80 28 3 10 10 3-10 3-3 10-3-10-10-3 10-3ZM350 102l3 10 10 3-10 3-3 10-3-10-10-3 10-3Z"
              fill="white"
            />
          </svg>
        </div>
        <h3>검색한 뒤 원본 정보를 비교하세요</h3>
        <p>후보를 찾으면 행정 데이터에 기록된 정보와 확인이 필요한 내용을 함께 보여드립니다.</p>
        <p className="intro-note">현재 문이 열려 있는지와는 다를 수 있습니다.</p>
      </div>
      <div className="workspace-panel intro-evidence">
        <h2>데이터와 출처</h2>
        <p>
          {coverage.kind === 'synthetic'
            ? '합성 예시로 검색 흐름을 살펴보세요. 실제 사업체 정보가 아닙니다.'
            : coverage.kind === 'unavailable'
              ? '데이터 날짜가 확인되지 않았습니다. 출처와 위에 표시한 날짜 안내를 확인하세요.'
              : coverage.kind === 'collected'
                ? '수집일과 원천 데이터 기준일은 다릅니다. 위에 표시한 수집일 안내를 확인하세요.'
                : '위에 표시한 데이터 기준일과 원본 출처를 함께 확인하세요.'}
        </p>
        <div className="intro-source">
          <span>데이터 출처</span>
          <SourceLink label={sourceLabel} url={sourceUrl} />
        </div>
        <p className="section-help">검색 전에는 선택된 사업체나 검색 결과가 없습니다.</p>
      </div>
    </section>
  );
}
