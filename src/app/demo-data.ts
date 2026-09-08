import { demoMetadata } from './demo-metadata.js';
import first from './demo-parts/demo-1.json' with { type: 'json' };
import second from './demo-parts/demo-2.json' with { type: 'json' };
import third from './demo-parts/demo-3.json' with { type: 'json' };
import type { DisplayDataset } from './display-data.js';

// Synchronous test/benchmark fixture only. The browser entry loads separate JSON assets.
export const demoDataset: DisplayDataset = {
  ...demoMetadata,
  records: [...first, ...second, ...third],
};
