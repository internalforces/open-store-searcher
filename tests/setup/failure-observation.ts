import type { Page, Request, Response, TestInfo } from '@playwright/test';

const loadTests = new Set([
  'loads built data parts after shell paint in bounded query-independent batches',
  'retries a failed built data part without exposing a partial searchable snapshot',
  'opens candidate-only map searches by keyboard without automatic provider I/O',
]);
const decorationTest =
  'decoration preserves immediate content, stable geometry and resource boundaries';
type Observation = {
  host: unknown[];
  dropped: number;
  cleanup: () => void;
  mode: 'load' | 'decoration';
};
const observations = new WeakMap<Page, Observation>();

function demoPath(url: string): string | undefined {
  const parsed = new URL(url);
  return parsed.origin === 'http://127.0.0.1:4173' &&
    /^\/open-store-searcher\/assets\/demo-[123]-[A-Za-z0-9_-]+\.json$/.test(parsed.pathname)
    ? parsed.pathname
    : undefined;
}

/** Diagnostic only: bounded state, no input values or remote URLs, no readiness waits. */
export async function beginFailureObservation(page: Page, info: TestInfo): Promise<void> {
  const mode =
    info.project.name === 'webkit' && loadTests.has(info.title)
      ? 'load'
      : info.project.name === 'chromium' && info.title === decorationTest
        ? 'decoration'
        : undefined;
  if (!mode) return;
  const observation: Observation = { host: [], dropped: 0, cleanup: () => {}, mode };
  observations.set(page, observation);
  const record = (kind: string, data: object = {}) => {
    if (observation.host.length === 64) {
      observation.host.splice(32, 1);
      observation.dropped++;
    }
    observation.host.push({ kind, clock: 'node-wall-ms', time: Date.now(), ...data });
  };
  if (mode === 'load') {
    const request = (value: Request) => {
      const path = demoPath(value.url());
      if (path) record('request', { path });
    };
    const finished = (value: Request) => {
      const path = demoPath(value.url());
      if (path) record('requestfinished', { path });
    };
    const failed = (value: Request) => {
      const path = demoPath(value.url());
      if (path) record('requestfailed', { path });
    };
    const response = (value: Response) => {
      const path = demoPath(value.url());
      if (path) record('response', { path, status: value.status() });
    };
    const popup = (value: Page) => {
      record('popup-open');
      value.once('close', () => record('popup-close'));
    };
    page.on('request', request);
    page.on('requestfinished', finished);
    page.on('requestfailed', failed);
    page.on('response', response);
    page.on('popup', popup);
    observation.cleanup = () => {
      page.off('request', request);
      page.off('requestfinished', finished);
      page.off('requestfailed', failed);
      page.off('response', response);
      page.off('popup', popup);
    };
  }
  record('begin');
  try {
    await page.addInitScript(
      ({ mode }) => {
        const events: unknown[] = [];
        let dropped = 0;
        const append = (kind: string, data: object = {}) => {
          if (events.length === 128) {
            events.splice(64, 1);
            dropped++;
          }
          events.push({
            kind,
            clock:
              mode === 'load'
                ? 'browser-native-performance-ms'
                : 'playwright-controlled-performance-ms',
            time: performance.now(),
            ...data,
          });
        };
        const nodes = new WeakMap<Node, number>();
        let nextNode = 0;
        const nodeInfo = (node: Node | null) => {
          if (!node) return null;
          if (!nodes.has(node)) nodes.set(node, ++nextNode);
          // Tags/classes only: no text, DOM IDs, attributes containing fixture data, or URLs.
          return {
            node: nodes.get(node),
            tag: node.nodeName,
            classes:
              node instanceof Element
                ? [...node.classList].slice(0, 8).map((part) => part.slice(0, 48))
                : [],
          };
        };
        const state = () => ({
          shell: !!document.querySelector('h1'),
          visibility: document.visibilityState,
          focus: document.hasFocus(),
          ready:
            !!document.querySelector<HTMLButtonElement>('button.search-button') &&
            !document.querySelector<HTMLButtonElement>('button.search-button')?.disabled,
          example: !!document.querySelector('button.example-button'),
          loadTime: !!document.querySelector('.load-time'),
          headerNotice: !!document.querySelector('.page-header > .synthetic-notice'),
          evidenceNotice: !!document.querySelector(
            '.page-header .evidence-context .synthetic-notice',
          ),
          intro: !!document.querySelector('.workspace-intro'),
          alert: !!document.querySelector('[role=alert]'),
        });
        const shifts: unknown[] = [];
        const animations: unknown[] = [];
        let shiftDrops = 0;
        let animationDrops = 0;
        let sequence = 0;
        const mark = (label: string) =>
          append('checkpoint', { label, order: ++sequence, ...state() });
        Reflect.set(window, '__failureObservation', {
          mark,
          layout: (entry: PerformanceEntry) => {
            if (shifts.length === 16) {
              shifts.splice(8, 1);
              shiftDrops++;
            }
            const rect = (value: DOMRectReadOnly) => ({
              x: value.x,
              y: value.y,
              width: value.width,
              height: value.height,
            });
            const sources = Reflect.get(entry, 'sources') as {
              node: Node | null;
              previousRect: DOMRectReadOnly;
              currentRect: DOMRectReadOnly;
            }[];
            shifts.push({
              order: ++sequence,
              clock: 'native-layout-shift-startTime-ms',
              startTime: entry.startTime,
              value: Reflect.get(entry, 'value'),
              hadRecentInput: Reflect.get(entry, 'hadRecentInput'),
              sources: sources.slice(0, 5).map((source) => ({
                target: nodeInfo(source.node),
                previous: rect(source.previousRect),
                current: rect(source.currentRect),
              })),
              sourceCount: sources.length,
              state: state(),
            });
          },
          snapshot: () => ({ events, dropped, shifts, shiftDrops, animations, animationDrops }),
        });
        let previous = '';
        const changed = () => {
          const value = state();
          const key = JSON.stringify(value);
          if (key !== previous) {
            previous = key;
            append('state', value);
          }
        };
        new MutationObserver(changed).observe(document, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['disabled', 'aria-busy', 'aria-disabled'],
        });
        changed();
        if (mode === 'decoration') {
          for (const kind of ['animationstart', 'animationend', 'animationcancel']) {
            document.addEventListener(kind, (event) => {
              const animation = event as AnimationEvent;
              if (animations.length === 64) {
                animations.splice(32, 1);
                animationDrops++;
              }
              animations.push({
                order: ++sequence,
                kind,
                clock: 'native-animation-elapsedTime-seconds',
                name: animation.animationName.slice(0, 80),
                pseudo: animation.pseudoElement.slice(0, 40),
                elapsedTime: animation.elapsedTime,
                target: nodeInfo(animation.target instanceof Node ? animation.target : null),
              });
            });
          }
          return; // This test keeps its original Playwright clock; no clock/frame wrappers.
        }
        const functions = new WeakMap<object, number>();
        let nextFunction = 0;
        const identity = (fn: object) => {
          if (!functions.has(fn)) functions.set(fn, ++nextFunction);
          return functions.get(fn);
        };
        const site = () =>
          (new Error().stack ?? '')
            .split('\n')
            .flatMap((line) => line.match(/https?:\/\/[^\s()]+:\d+:\d+/g) ?? [])
            .flatMap((candidate) => {
              const parts = /^(.*):(\d+):(\d+)$/.exec(candidate);
              if (!parts?.[1]?.startsWith('http://127.0.0.1:4173/open-store-searcher/assets/'))
                return [];
              try {
                const url = new URL(parts[1]);
                if (
                  url.origin !== 'http://127.0.0.1:4173' ||
                  url.username ||
                  url.password ||
                  url.search ||
                  url.hash ||
                  !/^\/open-store-searcher\/assets\/[A-Za-z0-9_.-]+\.js$/.test(url.pathname)
                )
                  return [];
                return [`${url.pathname}:${parts[2]}:${parts[3]}`];
              } catch {
                return [];
              }
            })
            .slice(0, 3);
        const raf = window.requestAnimationFrame;
        window.requestAnimationFrame = function (...args: Parameters<typeof raf>) {
          const callback = args[0];
          if (typeof callback !== 'function') return Reflect.apply(raf, this, args);
          let id: number;
          const fn = identity(callback);
          const caller = site();
          args[0] = function (...callbackArgs: Parameters<typeof callback>) {
            append('raf-fire', { id, fn });
            return Reflect.apply(callback, this, callbackArgs);
          };
          id = Reflect.apply(raf, this, args);
          append('raf-schedule', { id, fn, site: caller });
          return id;
        };
        const cancel = window.cancelAnimationFrame;
        window.cancelAnimationFrame = function (...args: Parameters<typeof cancel>) {
          append('raf-cancel', { id: args[0] });
          return Reflect.apply(cancel, this, args);
        };
        const timeout = window.setTimeout;
        Reflect.set(
          window,
          'setTimeout',
          function (this: Window, ...args: [TimerHandler, number?, ...unknown[]]) {
            const callback = args[0];
            if (typeof callback !== 'function') return Reflect.apply(timeout, this, args);
            let id: number;
            const fn = identity(callback);
            const caller = site();
            args[0] = function (...callbackArgs: unknown[]) {
              append('timer-fire', { id, fn });
              return Reflect.apply(callback, this, callbackArgs);
            };
            id = Reflect.apply(timeout, this, args) as unknown as number;
            append('timer-schedule', {
              id,
              fn,
              delay: typeof args[1] === 'number' ? args[1] : undefined,
              site: caller,
            });
            return id;
          },
        );
        const clear = window.clearTimeout;
        window.clearTimeout = function (...args: Parameters<typeof clear>) {
          append('timer-cancel', { id: args[0] });
          return Reflect.apply(clear, this, args);
        };
        const fetch = window.fetch;
        window.fetch = function (...args: Parameters<typeof fetch>) {
          try {
            const input = args[0];
            const parsed = new URL(
              typeof input === 'string' ? input : input instanceof URL ? input.href : input.url,
              location.href,
            );
            if (
              parsed.origin === location.origin &&
              /^\/open-store-searcher\/assets\/demo-[123]-[A-Za-z0-9_-]+\.json$/.test(
                parsed.pathname,
              )
            )
              append('fetch', { path: parsed.pathname });
          } catch {
            /* Preserve native fetch's validation and result. */
          }
          return Reflect.apply(fetch, this, args);
        };
        for (const kind of ['focus', 'blur'])
          window.addEventListener(kind, () => append(kind, state()));
        document.addEventListener('visibilitychange', () => append('visibilitychange', state()));
        document.addEventListener('DOMContentLoaded', () => append('dom-content-loaded', state()));
        document.addEventListener(
          'click',
          (event) => {
            if (event.target instanceof Element && event.target.closest('button.reload-button'))
              append('reload-click', state());
          },
          true,
        );
      },
      { mode },
    );
  } catch {
    record('observer-unavailable'); // Diagnostics must not replace the original test outcome.
  }
}

export async function reportFailureObservation(page: Page, info: TestInfo): Promise<void> {
  const observation = observations.get(page);
  if (!observation) return;
  try {
    if (info.status === info.expectedStatus) return;
    let browser: unknown = 'unavailable';
    try {
      browser = await page.evaluate(() => {
        const observer = Reflect.get(window, '__failureObservation') as
          | { snapshot: () => unknown }
          | undefined;
        return observer?.snapshot() ?? 'unavailable';
      });
    } catch {
      /* The failed page may already be closed. */
    }
    console.log(
      JSON.stringify({
        diagnostic: 'failure-observation-v1',
        test: info.title,
        project: info.project.name,
        retry: info.retry,
        worker: info.workerIndex,
        status: info.status,
        expectedStatus: info.expectedStatus,
        mode: observation.mode,
        host: observation.host,
        hostDropped: observation.dropped,
        browser,
      }),
    );
  } catch {
    /* Reporting must not replace assertion, timeout, or browser errors. */
  } finally {
    try {
      observation.cleanup();
    } catch {
      /* Cleanup is diagnostic too; preserve the test outcome. */
    }
    observations.delete(page);
  }
}
