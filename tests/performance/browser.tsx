import type { DisplayRecord } from '../../src/app/display-data.js';
import { render } from 'preact';
import { App } from '../../src/app/app.js';
import { prepareDisplayData } from '../../src/app/prepare-display-data.js';
import { searchCandidates } from '../../src/search/search-candidates.js';
import { makeDataset, queries, utf8Bytes } from './metrics.js';

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
async function paintOpportunity() {
  await frame();
  await frame();
}

const outcomes = new Map<string, { top: DisplayRecord[]; similar: DisplayRecord[] }>();
function checkPage(query: string, page: number) {
  const expected = outcomes.get(query);
  const results = document.getElementById('search-results');
  if (!expected || !results) throw new Error('Missing complete result oracle.');
  const records = [...expected.top, ...expected.similar.slice(page * 20, (page + 1) * 20)];
  const labels = records.map((record, index) => {
    const position = index < expected.top.length ? index + 1 : page * 20 + index + 1;
    const address =
      record.roadAddress?.trim() || record.parcelAddress?.trim() || '주소 제공되지 않음';
    return `${record.name.trim() || '제공되지 않음'} 인허가 정보 · ${address} · 후보 ${position}`;
  });
  const actual = Array.from(results.querySelectorAll('article'), (node) =>
    node.getAttribute('aria-label'),
  );
  if (JSON.stringify(actual) !== JSON.stringify(labels))
    throw new Error('Incorrect page identities/order.');
  const total = expected.top.length + expected.similar.length;
  if (Number(results.dataset.totalCandidates) !== total)
    throw new Error('Incomplete candidate count.');
  if (results.getBoundingClientRect().height <= 0) throw new Error('Results not laid out.');
  return { cards: actual.length, totalCandidates: total };
}
const harness = {
  async mount(size: number) {
    const root = document.getElementById('app');
    if (!root) throw new Error('Missing app root.');
    const generationStart = performance.now();
    const dataset = makeDataset(size);
    const generationMs = performance.now() - generationStart;
    const json = JSON.stringify(dataset);
    const jsonBytes = utf8Bytes(json);
    const fixtureSha256 = Array.from(
      new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(json))),
      (value) => value.toString(16).padStart(2, '0'),
    ).join('');
    const parseStart = performance.now();
    const parsed: unknown = JSON.parse(json);
    const parseMs = performance.now() - parseStart;
    const prepareStart = performance.now();
    const prepared = prepareDisplayData(parsed);
    const prepareMs = performance.now() - prepareStart;
    outcomes.clear();
    const searchOnly: Record<
      string,
      { ms: number; expectedCards: number; topCount: number; similarCount: number }
    > = {};
    for (const [name, query] of Object.entries(queries)) {
      const start = performance.now();
      const result = searchCandidates(prepared.index, query);
      const ms = performance.now() - start;
      outcomes.set(query, {
        top: result.topMatches.map((match) => match.record),
        similar: result.similarCandidates.map((match) => match.record),
      });
      searchOnly[name] = {
        ms,
        expectedCards: result.topMatches.length + result.similarCount,
        topCount: result.topMatches.length,
        similarCount: result.similarCount,
      };
    }
    // App owns its real preparation path. The diagnostic above is separate, never substituted.
    const mountStart = performance.now();
    render(<App dataset={dataset} />, root);
    await paintOpportunity();
    if (!root.querySelector('form button[type=submit]:enabled'))
      throw new Error('App did not become searchable.');
    return {
      generationMs,
      jsonBytes,
      fixtureSha256,
      parseMs,
      prepareMs,
      searchOnly,
      mountMs: performance.now() - mountStart,
    };
  },
  async submit() {
    const form = document.querySelector('form');
    const input = document.querySelector<HTMLInputElement>('input');
    if (!form || !input || !form.querySelector('button[type=submit]:enabled'))
      throw new Error('Search is not ready.');
    const query = input.value;
    const start = performance.now();
    form.requestSubmit();
    await paintOpportunity();
    const results = document.getElementById('search-results');
    const submitted = results?.querySelector('.submitted-query');
    if (submitted?.textContent !== `검색 결과: ${query}`) throw new Error('Result did not update.');
    // Force layout before ending; two frames provide a paint opportunity, not pixel timing.
    if (!results || results.getBoundingClientRect().height <= 0)
      throw new Error('Results not laid out.');
    const outcome = checkPage(query, 0);
    return { ms: performance.now() - start, ...outcome };
  },
  async navigate(label: string, page: number) {
    const input = document.querySelector<HTMLInputElement>('input');
    const button = Array.from(
      document.querySelectorAll<HTMLButtonElement>('.candidate-pagination button'),
    ).find((node) => node.textContent === label);
    if (!input || !button || button.disabled) throw new Error('Missing enabled page control.');
    const start = performance.now();
    button.click();
    await paintOpportunity();
    const outcome = checkPage(input.value, page);
    if (document.activeElement?.id !== 'similar-heading') throw new Error('Page focus lost.');
    return { ms: performance.now() - start, ...outcome };
  },
};

declare global {
  interface Window {
    performanceHarness: typeof harness;
  }
}
window.performanceHarness = harness;
