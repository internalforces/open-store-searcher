import type { DisplayDataset, DisplayRecord } from './display-data.js';
import type { SearchResult } from '../search/search-candidates.js';
export type CompactPage = SearchResult<DisplayRecord> & { page: number };
export type WorkerRequest = { version: 1; generation: number; request: number } & (
  | { kind: 'load'; url: string }
  | { kind: 'search'; query: string }
  | { kind: 'page'; page: number }
  | { kind: 'cancel' }
);
export type WorkerReply = { version: 1; generation: number; request: number } & (
  | {
      kind: 'ready';
      metadata: Omit<DisplayDataset, 'records'>;
      recordCount: number;
      manifestHash: string;
      timings: { loadMs: number; prepareMs: number };
    }
  | { kind: 'page'; result: CompactPage }
  | { kind: 'error'; message: string }
);
