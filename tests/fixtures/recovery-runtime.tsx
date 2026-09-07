// TASK-015 synthetic browser fixture: controlled loading/failure/partial/empty outcomes.
// Consumed by recovery-browser.ts to verify real App recovery without production hooks or I/O.
// Update when the internal loader contract or recovery acceptance criteria change.
// Never imported by the production entry.
import { render } from 'preact';
import { App } from '../../src/app/app.js';
import { demoDataset } from '../../src/app/demo-data.js';
import type { DisplayLoader } from '../../src/app/use-display-data.js';

let resolvePending: ((value: unknown) => void) | undefined;
let rejectPending: ((reason: unknown) => void) | undefined;
export function mount() {
  const root = document.createElement('div');
  document.body.replaceChildren(root);
  const loader: DisplayLoader = {
    sourceLabel: '합성 로딩 시험',
    sourceUrl: null,
    kind: 'synthetic',
    load: () =>
      new Promise((resolve, reject) => {
        resolvePending = resolve;
        rejectPending = reject;
      }),
  };
  render(<App loader={loader} />, root);
}
export function complete(outcome: 'error' | 'partial' | 'empty') {
  if (!resolvePending || !rejectPending) throw new Error('No load is pending');
  if (outcome === 'error') rejectPending(new Error('Synthetic offline failure'));
  else
    resolvePending({
      ...demoDataset,
      records: outcome === 'empty' ? [] : [demoDataset.records[0], null],
    });
  resolvePending = undefined;
  rejectPending = undefined;
}
export function isPending() {
  return Boolean(resolvePending && rejectPending);
}
