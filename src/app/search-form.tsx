interface SearchFormProps {
  value: string;
  error: string | null;
  exampleQuery: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export function SearchForm({ value, error, exampleQuery, onChange, onSubmit }: SearchFormProps) {
  return (
    <search>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <label htmlFor="business-query">상호명 또는 주소</label>
        <p id="search-help" className="input-help">
          두 글자 이상 입력하세요. 상호명과 주소를 함께 입력하면 더 정확하게 비교할 수 있습니다.
        </p>
        <div className="search-controls">
          <input
            id="business-query"
            type="search"
            value={value}
            autoComplete="off"
            placeholder="예: 상호명 + 서울특별시 마포구 월드컵로 12-1"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'search-help search-error' : 'search-help'}
            onInput={(event) => onChange(event.currentTarget.value)}
          />
          <button type="submit" className="search-button">
            검색
          </button>
        </div>
        {error && (
          <p id="search-error" className="input-error" role="alert">
            {error}
          </p>
        )}
        <button type="button" className="example-button" onClick={() => onChange(exampleQuery)}>
          <span>예시 입력</span> {exampleQuery}
        </button>
      </form>
    </search>
  );
}
