import { afterShellPaint } from './partition-loader.js';
import { prepareDisplayData } from './prepare-display-data.js';
import type { DisplayLoader } from './use-display-data.js';

/** Build-managed immutable asset URL. No search-dependent request parameters. */
export function createPublicationLoader(url: string): DisplayLoader {
  return {
    kind: 'source',
    sourceLabel: '행정안전부',
    sourceUrl: 'https://www.localdata.go.kr/',
    async load(parentSignal) {
      const signal = parentSignal ?? new AbortController().signal;
      await afterShellPaint(signal);
      const response = await fetch(url, {
        signal,
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
      });
      if (!response.ok) {
        await response.body?.cancel();
        throw new Error('Unable to load published data');
      }
      const value: unknown = await response.json();
      signal.throwIfAborted();
      const prepared = prepareDisplayData(value);
      if (prepared.excludedCount !== 0 || prepared.dataset.coverage.kind !== 'collected')
        throw new Error('Incomplete collection-date publication');
      return prepared.dataset;
    },
  };
}
