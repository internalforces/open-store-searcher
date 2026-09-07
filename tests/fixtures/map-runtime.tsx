// TASK-016 invented browser fixture for source-mode links and offline navigation interception.
// Coverage is deliberately unavailable; this fixture establishes no production source evidence.
// Consumed only by map-browser.ts; update when App's internal display contract changes.
import { render } from 'preact';
import { App } from '../../src/app/app.js';
import { demoDataset } from '../../src/app/demo-data.js';

export function mount() {
  const root = document.createElement('div');
  document.body.replaceChildren(root);
  render(<App dataset={{ ...demoDataset, coverage: { kind: 'unavailable' } }} />, root);
}
