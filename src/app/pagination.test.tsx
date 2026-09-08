import { fireEvent, render, screen, within } from '@testing-library/preact';
import { describe, expect, it } from 'vitest';
import { searchCandidates, createSearchIndex } from '../search/search-candidates.js';
import { makeDataset, queries } from '../../tests/performance/metrics.js';
import { App } from './app.js';
import { SearchResults } from './search-results.js';

describe('TASK-018 candidate pagination', () => {
  it('reaches every candidate in order with bounded pages, absolute positions and focused announcements', () => {
    const dataset = makeDataset(47);
    const result = searchCandidates(createSearchIndex(dataset.records), queries.address);
    render(<SearchResults result={result} coverage={dataset.coverage} />);
    const list = screen.getByRole('list', { name: '유사 후보' });
    const check = (start: number) => {
      const items = within(list).getAllByRole('listitem');
      expect(items).toHaveLength(Math.min(20, result.similarCount - start));
      items.forEach((item, i) => {
        expect(item.textContent).toContain(result.similarCandidates[start + i]?.record.name);
        expect(item.getAttribute('aria-posinset')).toBe(String(start + i + 1));
        expect(item.getAttribute('aria-setsize')).toBe(String(result.similarCount));
      });
    };
    check(0);
    expect(screen.getByRole('button', { name: '이전 페이지' }).hasAttribute('disabled')).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: '다음 페이지' }));
    check(20);
    expect(document.activeElement).toBe(screen.getByRole('heading', { name: '유사 후보' }));
    expect(screen.getByRole('status').textContent).toContain('21–40');
    fireEvent.click(screen.getByRole('button', { name: '마지막 페이지' }));
    check(40);
    expect(screen.getByRole('button', { name: '다음 페이지' }).hasAttribute('disabled')).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: '이전 페이지' }));
    check(20);
    fireEvent.click(screen.getByRole('button', { name: '처음 페이지' }));
    check(0);
  });

  it.each([1, 20])(
    'keeps all %s small-result candidates visible without pagination controls',
    (size) => {
      const fixture = makeDataset(size);
      const dataset = {
        ...fixture,
        records: fixture.records.map((record) => ({ ...record, name: queries.common })),
      };
      const result = searchCandidates(createSearchIndex(dataset.records), queries.common);
      render(<SearchResults result={result} coverage={dataset.coverage} />);
      expect(screen.queryByRole('navigation', { name: '유사 후보 페이지' })).toBeNull();
      expect(screen.getAllByRole('article')).toHaveLength(
        result.topMatches.length + result.similarCount,
      );
    },
  );

  it('resets to the first page on repeated submission and dataset replacement', () => {
    const dataset = makeDataset(47);
    const view = render(<App dataset={dataset} />);
    const input = screen.getByRole('searchbox');
    fireEvent.input(input, { target: { value: queries.address } });
    fireEvent.submit(input.closest('form') as HTMLFormElement);
    fireEvent.click(screen.getByRole('button', { name: '마지막 페이지' }));
    fireEvent.submit(input.closest('form') as HTMLFormElement);
    expect(screen.getByRole('button', { name: '이전 페이지' }).hasAttribute('disabled')).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: '마지막 페이지' }));
    view.rerender(<App dataset={makeDataset(46)} />);
    expect(screen.queryByRole('navigation', { name: '유사 후보 페이지' })).toBeNull();
    fireEvent.submit(input.closest('form') as HTMLFormElement);
    expect(screen.getByRole('button', { name: '이전 페이지' }).hasAttribute('disabled')).toBe(true);
  });
});
