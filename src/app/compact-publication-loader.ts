import type { DisplayLoader } from './use-display-data.js';
/** The URL identifies immutable complete data, never a query or result click. */
export function createCompactPublicationLoader(compactUrl: string): DisplayLoader {
  return {
    kind: 'source',
    dateBasis: 'collection',
    sourceLabel: '행정안전부',
    sourceUrl: 'https://www.localdata.go.kr/',
    compactUrl,
    async load() {
      throw new Error('Compact data must be loaded by its Worker owner');
    },
  };
}
