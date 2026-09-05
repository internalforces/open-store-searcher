import { expect, test } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const searchEntry = fileURLToPath(
  new URL('../../src/search/search-candidates.ts', import.meta.url),
);

let browserRuntime = '';

test.beforeAll(async () => {
  const result = await build({
    configFile: false,
    logLevel: 'silent',
    build: {
      emptyOutDir: false,
      minify: false,
      sourcemap: false,
      target: 'es2023',
      write: false,
      lib: {
        entry: searchEntry,
        formats: ['iife'],
        name: 'SearchTestRuntime',
      },
      rollupOptions: {
        output: {
          format: 'iife',
        },
      },
    },
  });
  const outputs = (Array.isArray(result) ? result : [result]).flatMap((output) => {
    if (!('output' in output))
      throw new Error('The candidate search bundle unexpectedly started a watcher.');
    return output.output;
  });
  const chunks = outputs.filter((output) => output.type === 'chunk');

  expect(chunks).toHaveLength(1);
  const [chunk] = chunks;
  if (!chunk) throw new Error('The candidate search bundle did not produce a browser chunk.');

  expect(chunk.imports).toEqual([]);
  expect(Object.keys(chunk.modules)).not.toContainEqual(expect.stringMatching(/(^|[/\\])node:/u));
  browserRuntime = chunk.code;
});

test('runs the bundled candidate engine without browser query I/O', async ({ page }) => {
  await page.goto('./');
  await page.addScriptTag({ content: browserRuntime });

  const requestsAfterInjection: string[] = [];
  const recordRequest = (request: { url(): string }) => {
    requestsAfterInjection.push(request.url());
  };
  page.on('request', recordRequest);

  try {
    const result = await page.evaluate(() => {
      type SearchMatch = {
        confidence: 'high' | 'medium' | 'low';
        record: { id: string };
        score: number;
      };
      type SearchResult = {
        ambiguousTop: boolean;
        eligibleCount: number;
        primaryMatch: SearchMatch | null;
        similarCandidates: SearchMatch[];
        topMatches: SearchMatch[];
        validation: { ok: boolean };
      };
      type SearchRuntime = {
        createSearchIndex(records: readonly unknown[]): unknown;
        searchCandidates(index: unknown, original: string): SearchResult;
      };

      const runtime = (window as typeof window & { SearchTestRuntime?: SearchRuntime })
        .SearchTestRuntime;
      if (!runtime) throw new Error('The bundled candidate search runtime was not installed.');

      const sideEffects = {
        console: [] as string[],
        network: [] as string[],
        sessionStorage: [] as string[],
        localStorage: [] as string[],
      };
      const restores: Array<() => void> = [];
      const replace = (target: object, key: PropertyKey, value: unknown) => {
        const ownDescriptor = Object.getOwnPropertyDescriptor(target, key);
        let inheritedDescriptor: PropertyDescriptor | undefined;
        if (!ownDescriptor) {
          let prototype = Object.getPrototypeOf(target) as object | null;
          while (prototype && !inheritedDescriptor) {
            inheritedDescriptor = Object.getOwnPropertyDescriptor(prototype, key);
            prototype = Object.getPrototypeOf(prototype) as object | null;
          }
        }
        const descriptor = ownDescriptor ?? inheritedDescriptor;
        if (!descriptor)
          throw new Error(`Unable to install the ${String(key)} query-I/O sentinel.`);

        try {
          Object.defineProperty(
            target,
            key,
            ownDescriptor && 'value' in ownDescriptor
              ? { ...ownDescriptor, value }
              : {
                  configurable: true,
                  enumerable: descriptor.enumerable ?? false,
                  value,
                  writable: true,
                },
          );
        } catch (error) {
          throw new Error(
            `Unable to install the ${String(key)} query-I/O sentinel: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
        restores.push(() => {
          if (ownDescriptor) Object.defineProperty(target, key, ownDescriptor);
          else Reflect.deleteProperty(target, key);
        });
      };
      const blockConstructor = (name: 'XMLHttpRequest' | 'WebSocket' | 'EventSource') => {
        const blocked = function blockedNetworkConstructor(): never {
          sideEffects.network.push(name);
          throw new Error(`Unexpected browser query I/O through ${name}`);
        };
        replace(window, name, blocked);
      };
      const snapshot = (search: SearchResult) => ({
        ambiguousTop: search.ambiguousTop,
        eligibleCount: search.eligibleCount,
        primaryMatch: search.primaryMatch?.record.id ?? null,
        similarCandidates: search.similarCandidates.map((match) => ({
          confidence: match.confidence,
          id: match.record.id,
          score: match.score,
        })),
        topMatches: search.topMatches.map((match) => ({
          confidence: match.confidence,
          id: match.record.id,
          score: match.score,
        })),
        validationOk: search.validation.ok,
      });

      let invocationError: string | null = null;
      let normalized: ReturnType<typeof snapshot> | null = null;
      let nameOnly: ReturnType<typeof snapshot> | null = null;
      let ties: ReturnType<typeof snapshot> | null = null;
      let empty: ReturnType<typeof snapshot> | null = null;

      try {
        replace(window, 'fetch', () => {
          sideEffects.network.push('fetch');
          throw new Error('Unexpected browser query I/O through fetch');
        });
        blockConstructor('XMLHttpRequest');
        blockConstructor('WebSocket');
        blockConstructor('EventSource');
        replace(navigator, 'sendBeacon', () => {
          sideEffects.network.push('sendBeacon');
          return false;
        });

        const localStorage = window.localStorage;
        const sessionStorage = window.sessionStorage;
        const storagePrototype = Object.getPrototypeOf(localStorage) as Storage;
        if (storagePrototype !== Object.getPrototypeOf(sessionStorage)) {
          throw new Error('The local and session storage sentinels do not share a prototype.');
        }
        for (const method of ['getItem', 'setItem', 'removeItem', 'clear', 'key'] as const) {
          replace(storagePrototype, method, function storageSentinel(this: Storage): null {
            if (this === localStorage) sideEffects.localStorage.push(method);
            else if (this === sessionStorage) sideEffects.sessionStorage.push(method);
            else throw new Error(`Unexpected Storage receiver for ${method}.`);
            return null;
          });
        }

        for (const method of ['debug', 'error', 'info', 'log', 'trace', 'warn'] as const) {
          replace(console, method, () => {
            sideEffects.console.push(method);
          });
        }

        try {
          void window.fetch('/s10-fetch-sentinel');
        } catch {
          // The sentinel intentionally rejects an attempted request without emitting one.
        }
        navigator.sendBeacon('/s10-send-beacon-sentinel', '');
        localStorage.getItem('s10-storage-sentinel');
        sessionStorage.getItem('s10-storage-sentinel');
        console.info('s10-console-sentinel');
        if (
          !sideEffects.network.includes('fetch') ||
          !sideEffects.network.includes('sendBeacon') ||
          !sideEffects.localStorage.includes('getItem') ||
          !sideEffects.sessionStorage.includes('getItem') ||
          !sideEffects.console.includes('info')
        ) {
          throw new Error('One or more query-I/O sentinels did not intercept their self-check.');
        }
        sideEffects.network.length = 0;
        sideEffects.localStorage.length = 0;
        sideEffects.sessionStorage.length = 0;
        sideEffects.console.length = 0;

        const index = runtime.createSearchIndex([
          {
            id: 'exact',
            name: '봄 카페 & 빵',
            parcelAddress: '서울특별시 마포구 성산동 100-2',
            roadAddress: '서울특별시 마포구 월드컵로 12-1',
          },
          {
            id: 'conflict',
            name: '봄 카페 & 빵',
            parcelAddress: '서울특별시 강남구 역삼동 12-1',
            roadAddress: '서울특별시 강남구 테헤란로 12-1',
          },
          {
            id: 'name-only',
            name: '이름만 카페',
            parcelAddress: '서울특별시 송파구 잠실동 10',
            roadAddress: '서울특별시 송파구 올림픽로 10',
          },
          {
            id: 'tie-a',
            name: '동률 카페',
            parcelAddress: '서울특별시 종로구 청운동 20',
            roadAddress: '서울특별시 종로구 자하문로 20',
          },
          {
            id: 'tie-b',
            name: '동률 카페',
            parcelAddress: '서울특별시 종로구 청운동 20',
            roadAddress: '서울특별시 종로구 자하문로 20',
          },
        ]);

        normalized = snapshot(
          runtime.searchCandidates(
            index,
            '  봄&nbsp;카페 &#38; 빵 서울시 마포구 월드컵로 １２‑１  ',
          ),
        );
        nameOnly = snapshot(runtime.searchCandidates(index, '이름만 카페'));
        ties = snapshot(runtime.searchCandidates(index, '동률 카페 서울특별시 종로구 자하문로 20'));
        empty = snapshot(runtime.searchCandidates(index, ' \t\n\u00a0 '));
      } catch (error) {
        invocationError = error instanceof Error ? error.message : String(error);
      } finally {
        for (const restore of restores.reverse()) restore();
      }

      return { empty, invocationError, nameOnly, normalized, sideEffects, ties };
    });

    expect(result.invocationError).toBeNull();
    expect(result.sideEffects).toEqual({
      console: [],
      network: [],
      sessionStorage: [],
      localStorage: [],
    });
    expect(requestsAfterInjection).toEqual([]);
    expect(result.normalized).toMatchObject({
      ambiguousTop: false,
      primaryMatch: 'exact',
      topMatches: [{ confidence: 'high', id: 'exact' }],
      similarCandidates: [{ confidence: 'low', id: 'conflict' }],
      validationOk: true,
    });
    expect(result.nameOnly).toMatchObject({
      primaryMatch: null,
      similarCandidates: [{ confidence: 'low', id: 'name-only' }],
      topMatches: [],
      validationOk: true,
    });
    expect(result.ties).toMatchObject({
      ambiguousTop: true,
      primaryMatch: null,
      topMatches: [
        { confidence: 'high', id: 'tie-a' },
        { confidence: 'high', id: 'tie-b' },
      ],
      validationOk: true,
    });
    expect(result.empty).toMatchObject({
      primaryMatch: null,
      similarCandidates: [],
      topMatches: [],
      validationOk: false,
    });
  } finally {
    page.off('request', recordRequest);
  }
});
