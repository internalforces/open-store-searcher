import { render } from 'preact';

import { App } from './app.js';
import { demoDataset } from './demo-data.js';
import type { DisplayLoader } from './use-display-data.js';

// Local synthetic data exercises the loader boundary; production delivery remains gated.
const loader: DisplayLoader = {
  sourceLabel: demoDataset.sourceLabel,
  sourceUrl: demoDataset.sourceUrl,
  kind: 'synthetic',
  load: async () => demoDataset,
};

const root = document.getElementById('app');

if (!root) {
  throw new Error('Application root not found.');
}

render(<App loader={loader} />, root);
