import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { build } from 'vite';
import { mountMapSearch } from '../setup/map-browser.js';
import { completeLoad, mountRecovery } from '../setup/recovery-browser.js';

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

test('searches the real form with keyboard and wraps results at 320 CSS pixels', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('./');
  await page.keyboard.press('Tab');
  const input = page.getByRole('searchbox', { name: '상호명 또는 주소' });
  await expect(input).toBeFocused();
  expect(await input.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe(
    'none',
  );
  await input.fill('가상별빛 카페 서울특별시 마포구 월드컵로 12-1');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('region', { name: '가장 잘 일치하는 결과' })).toBeVisible();
  await expect(page.getByRole('region', { name: '유사 후보' })).toBeVisible();
  const buttonBox = await page.getByRole('button', { name: '검색', exact: true }).boundingBox();
  expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await input.fill('아주긴검색어'.repeat(40));
  await page.keyboard.press('Enter');
  await expect(page.getByText(/폐업을 의미하지 않습니다/)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('renders all four demo statuses through actual search submissions', async ({ page }) => {
  await page.goto('./');
  for (const [query, expected] of [
    ['가상별빛 카페 서울특별시 마포구 월드컵로 12-1', '행정상 영업'],
    ['가상별빛 카페 서울특별시 강남구 테헤란로 12-1', '휴업'],
    ['가상노을 식당 서울특별시 송파구 올림픽로 10', '폐업'],
    ['가상달빛 가게 서울특별시 중구 세종대로 30', '확인되지 않음'],
  ] as const) {
    await page.getByRole('searchbox').fill(query);
    await page.getByRole('button', { name: '검색', exact: true }).click();
    const primary = page.getByRole('region', { name: '가장 잘 일치하는 결과' });
    await expect(primary.locator('.status-badge')).toHaveText(expected);
    await expect(primary.getByText('합성 예시 데이터 · 실제 사업체 조회가 아닙니다')).toBeVisible();
    await expect(primary.getByText('예시 데이터 기준일: 2026-09-01')).toBeVisible();
  }
});

test('keeps real form queries out of browser network, storage, logs and URL', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('searchbox').waitFor();
  const url = page.url();
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.evaluate(() => {
    const effects: string[] = [];
    Object.defineProperty(window, '__formEffects', { value: effects });
    const replace = (target: object, key: string, value: unknown) => {
      Object.defineProperty(target, key, { configurable: true, writable: true, value });
    };
    replace(window, 'fetch', () => {
      effects.push('fetch');
      return Promise.reject(new Error('Blocked query request'));
    });
    for (const key of ['XMLHttpRequest', 'WebSocket', 'EventSource']) {
      replace(window, key, function blocked() {
        effects.push(key);
        throw new Error('Blocked query connection');
      });
    }
    replace(navigator, 'sendBeacon', () => {
      effects.push('beacon');
      return false;
    });
    for (const key of ['getItem', 'setItem', 'removeItem', 'clear', 'key']) {
      replace(Storage.prototype, key, () => {
        effects.push(`storage:${key}`);
        return null;
      });
    }
    for (const key of ['debug', 'error', 'info', 'log', 'trace', 'warn']) {
      replace(console, key, () => {
        effects.push(`console:${key}`);
      });
    }
    // Prove every category intercepts, then reset before the user interaction.
    void fetch('/sentinel').catch(() => {});
    navigator.sendBeacon('/sentinel');
    for (const Constructor of [XMLHttpRequest, WebSocket, EventSource]) {
      try {
        new Constructor('https://example.invalid');
      } catch {
        /* Expected block. */
      }
    }
    localStorage.getItem('sentinel');
    sessionStorage.setItem('sentinel', 'value');
    console.info('sentinel');
    if (effects.length !== 8) throw new Error(`Incomplete sentinel self-check: ${effects.length}`);
    effects.length = 0;
  });
  await page.getByRole('button', { name: /예시 입력/ }).click();
  await page.getByRole('button', { name: '검색', exact: true }).click();
  await expect(page.getByRole('region', { name: '가장 잘 일치하는 결과' })).toBeVisible();
  await page.getByRole('searchbox').fill('<img src=x onerror=alert(1)>');
  await page.getByRole('searchbox').press('Enter');
  await expect(page.getByText(/폐업을 의미하지 않습니다/)).toBeVisible();
  expect(await page.locator('img').count()).toBe(0);
  expect(await page.evaluate(() => Reflect.get(window, '__formEffects'))).toEqual([]);
  expect(requests).toEqual([]);
  expect(page.url()).toBe(url);
  const stored = await page.evaluate(() => ({
    local: Object.keys(localStorage),
    session: Object.keys(sessionStorage),
    cookie: document.cookie,
  }));
  expect(stored).toEqual({ local: [], session: [], cookie: '' });
});

test('updates stale demo evidence at Seoul midnight and announces equal-count repeated searches', async ({
  page,
}) => {
  await page.clock.install({ time: new Date('2026-09-07T14:59:59.000Z') });
  await page.goto('./');
  const warning =
    '합성 예시 데이터의 기준일로부터 7일 이상 지났습니다. 실제 사업체 상태를 나타내지 않습니다.';
  await expect(page.getByRole('searchbox')).toBeVisible();
  await expect(page.getByText(warning)).toHaveCount(0);
  await page.clock.fastForward(1000);
  await expect(page.getByText(warning)).toHaveCount(1);
  let previous = '';
  for (const query of [
    '가상노을 식당 서울특별시 송파구 올림픽로 10',
    '가상달빛 가게 서울특별시 중구 세종대로 30',
    '가상달빛 가게 서울특별시 중구 세종대로 30',
  ]) {
    await page.getByRole('searchbox').fill(query);
    await page.getByRole('searchbox').press('Enter');
    await expect(page.getByRole('status')).toContainText('일치 후보 1개 · 유사 후보 0개');
    const announcement = await page.getByRole('status').innerText();
    expect(announcement).not.toBe(previous);
    previous = announcement;
    await expect(page.getByRole('article').getByText(warning)).toBeVisible();
  }
  await page.getByRole('searchbox').fill('');
  await page.getByRole('searchbox').press('Enter');
  await expect(page.getByRole('searchbox')).toHaveAttribute('aria-invalid', 'true');
  await page.getByRole('button', { name: /예시 입력/ }).click();
  await expect(page.getByRole('searchbox')).toHaveAttribute('aria-invalid', 'false');
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('recovers loading failures with keyboard and preserves usable data without query I/O', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await mountRecovery(page);
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.evaluate(() => {
    const effects: string[] = [];
    Reflect.set(window, '__recoveryEffects', effects);
    window.fetch = () => {
      effects.push('fetch');
      return Promise.reject(new Error('Unexpected I/O'));
    };
    Storage.prototype.setItem = () => {
      effects.push('storage');
    };
    console.log = () => {
      effects.push('log');
    };
    console.error = () => {
      effects.push('error');
    };
  });
  const input = page.getByRole('searchbox');
  await input.fill('가상별빛 카페 서울특별시 마포구 월드컵로 12-1');
  await input.press('Enter');
  await expect(page.getByRole('article')).toHaveCount(0);
  await expect(page.getByRole('button', { name: '검색', exact: true })).toBeDisabled();
  await page.screenshot({ path: testInfo.outputPath('loading.png'), fullPage: true });
  await completeLoad(page, 'error');
  await expect(page.getByRole('alert')).toContainText('새로고침');
  await expect(page.getByRole('link', { name: '저장소에 오류 신고' })).toHaveAttribute(
    'href',
    'https://github.com/internalforces/open-store-searcher/issues',
  );
  await page.screenshot({ path: testInfo.outputPath('error.png'), fullPage: true });
  await input.focus();
  const tabKey =
    testInfo.project.name === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab';
  await page.keyboard.press(tabKey);
  // macOS Safari uses Option-Tab to include links; controls follow Keyboard Navigation settings.
  // In either mode, the recovery button must be reachable within two keyboard steps.
  if (
    await page
      .getByRole('link', { name: '저장소에 오류 신고' })
      .evaluate((element) => element === document.activeElement)
  ) {
    await page.keyboard.press(tabKey);
  }
  const reload = page.getByRole('button', { name: '데이터 다시 불러오기' });
  await expect(reload).toBeFocused();
  await page.keyboard.press('Enter');
  await completeLoad(page, 'partial');
  await expect(page.getByRole('status')).toContainText('불러왔습니다');
  await expect(page.getByText(/레코드 1개를 제외/)).toBeVisible();
  await input.press('Enter');
  await expect(page.getByRole('article')).toHaveCount(1);
  await reload.click();
  await completeLoad(page, 'error');
  await expect(page.getByRole('alert')).toContainText('이전 데이터');
  await expect(page.getByRole('article')).toHaveCount(1);
  await expect(page.getByRole('article').getByText('예시 데이터 기준일: 2026-09-01')).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('retained.png'), fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await reload.click();
  await completeLoad(page, 'empty');
  await expect(page.getByRole('article')).toHaveCount(0);
  await input.press('Enter');
  await expect(page.getByText(/폐업을 의미하지 않습니다/)).toBeVisible();
  expect(await page.evaluate(() => Reflect.get(window, '__recoveryEffects'))).toEqual([]);
  expect(requests).toEqual([]);
  expect(page.url()).toMatch(/\/recovery-harness$/);
});

test('opens candidate-only map searches by keyboard without automatic provider I/O', async ({
  page,
  context,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 740 });
  const outbound: { url: string; referer: string | undefined }[] = [];
  // Intercept at context level, including new tabs, so no provider receives test traffic.
  await context.route(/^https:\/\/(?:map\.naver\.com|map\.kakao\.com)\//, async (route) => {
    outbound.push({ url: route.request().url(), referer: route.request().headers().referer });
    await route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><title>Intercepted locally</title>',
    });
  });
  await mountMapSearch(page);
  const localUrl = page.url();
  const automaticRequests: string[] = [];
  page.on('request', (request) => automaticRequests.push(request.url()));
  const input = page.getByRole('searchbox');
  const query = '가상별빛 카페 서울특별시 마포구 월드컵로 12-1';
  await input.fill(query);
  await input.press('Enter');
  const similar = page.getByRole('region', { name: '유사 후보' });
  await expect(similar).toBeVisible();
  // Edit the input after submission to distinguish both draft and submitted terms from the record.
  await input.fill('PRIVATE-DRAFT-DO-NOT-SEND');
  await expect(similar.getByText('데이터 기준일: 확인되지 않음')).toBeVisible();
  expect(outbound).toEqual([]);
  expect(automaticRequests).toEqual([]);
  expect(
    await page
      .locator('[ping], link[rel=prefetch], link[rel=preconnect], link[rel=dns-prefetch]')
      .count(),
  ).toBe(0);
  const tabKey =
    testInfo.project.name === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab';
  for (const [label, origin] of [
    ['네이버 지도에서 검색 (새 탭)', 'https://map.naver.com'],
    ['카카오맵에서 검색 (새 탭)', 'https://map.kakao.com'],
  ] as const) {
    const link = similar.getByRole('link', { name: label });
    await input.focus();
    for (
      let step = 0;
      step < 15 && !(await link.evaluate((element) => element === document.activeElement));
      step++
    ) {
      await page.keyboard.press(tabKey);
    }
    await expect(link).toBeFocused();
    expect(await link.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe(
      'none',
    );
    expect((await link.boundingBox())?.height).toBeGreaterThanOrEqual(44);
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    const opened = context.waitForEvent('page');
    await page.keyboard.press('Enter');
    const popup = await opened;
    await popup.waitForLoadState();
    expect(new URL(popup.url()).origin).toBe(origin);
    expect(decodeURIComponent(new URL(popup.url()).pathname.split('/').at(-1) ?? '')).toBe(
      '가상별빛 카페 서울특별시 강남구 테헤란로 12-1',
    );
    expect(await popup.evaluate(() => window.opener === null)).toBe(true);
    expect(outbound.at(-1)?.referer).toBeUndefined();
    expect(page.url()).toBe(localUrl);
    await popup.close();
  }
  expect(outbound).toHaveLength(2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('map-links-320.png'), fullPage: true });
});
