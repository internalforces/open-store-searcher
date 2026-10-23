import { beginFailureObservation, reportFailureObservation } from '../setup/failure-observation.js';
import { expect, type Page, test } from '@playwright/test';
import { scanPageForWcag21Violations } from '../setup/accessibility.js';
import { mountMapSearch } from '../setup/map-browser.js';
import { mountPagination } from '../setup/pagination-browser.js';

async function search(page: Page, query = '가상별빛 카페') {
  await page.getByRole('searchbox').fill(query);
  await page.getByRole('searchbox').press('Enter');
  await expect(page.locator('.candidate-summary')).toHaveCount(2);
}
async function evidenceIsUsable(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.getByRole('button', { name: '검색', exact: true })).toBeVisible();
  await expect(page.locator('.workspace-detail .record-evidence')).toBeVisible();
  await expect(page.getByRole('button', { name: '후보 목록으로 돌아가기' })).toBeVisible();
  expect((await scanPageForWcag21Violations(page)).violations).toEqual([]);
  expect(
    await page.locator('.workspace-detail').evaluate((detail) => {
      return [...detail.querySelectorAll('p, dd, a, button, h3')].every((node) => {
        const style = getComputedStyle(node);
        return (
          style.visibility === 'visible' &&
          Number(style.opacity) === 1 &&
          node.getBoundingClientRect().height > 0 &&
          !['hidden', 'clip'].includes(style.overflow)
        );
      });
    }),
  ).toBe(true);
}

test('inspection and return preserve keyboard focus', async ({ page }, testInfo) => {
  await mountMapSearch(page);
  await search(page);
  const tab =
    testInfo.project.name === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab';
  const back = tab === 'Alt+Tab' ? 'Alt+Shift+Tab' : 'Shift+Tab';
  const summaries = page.locator('.candidate-summary');
  await expect(page.locator('.workspace-detail')).toHaveCount(0);
  const identities = await summaries.evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('aria-label')),
  );
  for (const index of [0, 1, 0]) {
    const inspect = summaries.nth(index).getByRole('button');
    await inspect.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.workspace-detail h3')).toBeFocused();
    await expect(page.locator('.workspace-detail')).toHaveAttribute(
      'aria-label',
      identities[index] ?? '',
    );
    await expect(inspect).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press(tab);
    await expect(
      page.locator('.workspace-detail').getByRole('link', { name: '시험 원본 출처' }),
    ).toBeFocused();
    await page.keyboard.press(back);
    await expect(summaries.last().getByRole('button')).toBeFocused();
    await inspect.focus();
    await page.keyboard.press('Enter');
    const returnButton = page.getByRole('button', { name: '후보 목록으로 돌아가기' });
    await returnButton.focus();
    await page.keyboard.press('Enter');
    await expect(inspect).toBeFocused();
    await expect(inspect).toBeInViewport();
    expect(await inspect.evaluate((node) => getComputedStyle(node).outlineStyle)).toBe('solid');
  }
  const announcement = await page.locator('.result-summary').textContent();
  await page.getByRole('searchbox').press('Enter');
  await expect(page.locator('.workspace-detail')).toHaveCount(0);
  await expect(page.locator('.result-summary')).not.toHaveText(announcement ?? '');
  expect(
    await summaries.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('aria-label'))),
  ).toEqual(identities);
});

test('all pagination controls preserve complete identity order and invalidate off-page inspection', async ({
  page,
}) => {
  await mountPagination(page);
  const list = page.getByRole('list', { name: '유사 후보' });
  const first = await list
    .locator('.candidate-summary')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('aria-label')));
  await list.getByRole('button').first().click();
  await expect(page.locator('.workspace-detail')).toHaveAttribute('aria-label', first[0] ?? '');
  const all = [...first];
  for (const [label, range, count] of [
    ['다음 페이지', '21–40', 20],
    ['마지막 페이지', '41–47', 7],
  ] as const) {
    await page.getByRole('button', { name: label }).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#similar-heading')).toBeFocused();
    await expect(page.locator('.candidate-pagination [role=status]')).toContainText(range);
    await expect(list.locator('.candidate-summary')).toHaveCount(count);
    await expect(page.locator('.workspace-detail')).toHaveCount(0);
    all.push(
      ...(await list
        .locator('.candidate-summary')
        .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('aria-label')))),
    );
  }
  expect(all).toHaveLength(47);
  expect(new Set(all).size).toBe(47);
  for (const [index, identity] of all.entries()) expect(identity).toContain(`후보 ${index + 1}`);
  expect(await page.locator('#search-results').getAttribute('data-total-candidates')).toBe('47');
  await page.getByRole('button', { name: '이전 페이지' }).click();
  expect(
    await list
      .locator('.candidate-summary')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('aria-label'))),
  ).toEqual(all.slice(20, 40));
  await page.getByRole('button', { name: '처음 페이지' }).click();
  expect(
    await list
      .locator('.candidate-summary')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('aria-label'))),
  ).toEqual(first);
});

test('long evidence reflows across workspace breakpoints', async ({ page }) => {
  test.setTimeout(120_000);
  await mountMapSearch(page, true);
  await search(page);
  await page.locator('.candidate-summary').first().getByRole('button').click();
  await expect(page.locator('.workspace-detail')).toContainText('긴원본상태'.repeat(40));
  await expect(page.locator('.workspace-detail')).toContainText('긴업태'.repeat(40));
  await expect(page.locator('.workspace-detail')).toContainText('반복업태'.repeat(40));
  for (const enlarged of [false, true]) {
    if (enlarged) {
      await page.evaluate(() => {
        // Snapshot first: every fixed-pixel label and inherited font doubles exactly once.
        const fonts = [...document.querySelectorAll<HTMLElement>('html, body, body *')].map(
          (node) => ({ node, pixels: Number.parseFloat(getComputedStyle(node).fontSize) }),
        );
        for (const { node, pixels } of fonts) node.style.fontSize = `${pixels * 2}px`;
      });
      expect(
        await page
          .locator('.candidate-summary dd')
          .first()
          .evaluate((node) => getComputedStyle(node).fontSize),
      ).toBe('28px');
    }
    for (const width of [320, 390, 768, 1023, 1024, 1279, 1280, 1586]) {
      await page.setViewportSize({ width, height: 992 });
      await evidenceIsUsable(page);
    }
  }
});

test('fallback media never hides evidence or controls', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1280, height: 992 });
  await mountMapSearch(page, true);
  await search(page);
  await page.locator('.candidate-summary').first().getByRole('button').click();
  await evidenceIsUsable(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await evidenceIsUsable(page);
  expect(
    await page
      .locator('.search-glint')
      .evaluate((node) => getComputedStyle(node, '::after').animationName),
  ).toBe('none');
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'no-preference' });
  await evidenceIsUsable(page);
  await expect(page.locator('.search-glint')).toBeHidden();
  await page.locator('.workspace-detail h3').focus();
  expect(
    await page
      .locator('.workspace-detail h3')
      .evaluate((node) => getComputedStyle(node).outlineStyle),
  ).toBe('solid');
  await page.emulateMedia({ forcedColors: 'none' });
  // Explicit no-blur simulation: same opaque fallback material, no support claim.
  await page.addStyleTag({
    content: '.search-panel, .intro-prism { backdrop-filter: none; background: #fff; }',
  });
  await evidenceIsUsable(page);
  expect(
    await page.locator('.search-panel').evaluate((node) => getComputedStyle(node).backdropFilter),
  ).toBe('none');
});

test.beforeEach(async ({ page }, info) => {
  await beginFailureObservation(page, info);
});
test.afterEach(async ({ page }, info) => {
  await reportFailureObservation(page, info);
});

test('decoration preserves immediate content, stable geometry and resource boundaries', async ({
  page,
}) => {
  await page.clock.install({ time: new Date('2026-09-07T14:59:00Z') });
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('./');
  await expect(page.getByRole('button', { name: '검색', exact: true })).toBeEnabled();
  const originalUrl = page.url();
  // Let the accepted loading state receive its first paint before isolating decoration.
  await page.clock.runFor(34);
  const supportsLayoutShift = await page.evaluate(() => {
    const shifts: number[] = [];
    Reflect.set(window, '__workspaceLayoutShifts', shifts);
    if (!PerformanceObserver.supportedEntryTypes.includes('layout-shift')) return false;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!Reflect.get(entry, 'hadRecentInput')) shifts.push(Number(Reflect.get(entry, 'value')));
        try {
          const observation = Reflect.get(window, '__failureObservation') as
            | { layout: (entry: PerformanceEntry) => void }
            | undefined;
          observation?.layout(entry);
        } catch {
          // Diagnostic failures must not suppress this or later shift entries.
        }
      }
    });
    observer.observe({ type: 'layout-shift' });
    return true;
  });
  expect(
    await page
      .locator('.search-glint')
      .evaluate((node) => getComputedStyle(node, '::after').animationName),
  ).toBe('none');
  const initial = await page.locator('.search-panel').boundingBox();
  await expect(page.getByRole('searchbox')).toBeVisible();
  await page.clock.fastForward(700);
  expect(await page.locator('.search-panel').boundingBox()).toEqual(initial);
  if (supportsLayoutShift) {
    expect(await page.evaluate(() => Reflect.get(window, '__workspaceLayoutShifts'))).toEqual([]);
  }
  const beforeRequests = [...requests];
  await page.evaluate(() => {
    const writes: string[] = [];
    Reflect.set(window, '__workspaceStorageWrites', writes);
    for (const key of ['setItem', 'removeItem', 'clear'] as const) {
      Object.defineProperty(Storage.prototype, key, {
        configurable: true,
        value: () => writes.push(key),
      });
    }
    const relatedStarts: { name: string; target: EventTarget | null }[] = [];
    Reflect.set(window, '__workspaceRelatedAnimationStarts', relatedStarts);
    document.addEventListener('animationstart', (event) => {
      const animation = event as AnimationEvent;
      if (
        animation.animationName === 'accepted-underline' ||
        animation.animationName === 'detail-rim'
      )
        relatedStarts.push({ name: animation.animationName, target: animation.target });
    });
    Reflect.set(window, '__workspaceAnimationStarts', 0);
    document.addEventListener('animationstart', () =>
      Reflect.set(
        window,
        '__workspaceAnimationStarts',
        Number(Reflect.get(window, '__workspaceAnimationStarts')) + 1,
      ),
    );
  });
  await expect(page.locator('span.result-glint')).toHaveCount(0);
  await expect(page.locator('span.detail-glint')).toHaveCount(0);
  await search(page);
  await page.locator('.candidate-summary').first().getByRole('button').click();
  await expect(page.locator('.workspace-detail .record-evidence')).toBeVisible();
  await expect(page.locator('span.result-glint')).toHaveCount(1);
  await expect(page.locator('span.detail-glint')).toHaveCount(1);
  await page.evaluate(() => {
    const result = document.querySelector('span.result-glint');
    const detail = document.querySelector('span.detail-glint');
    if (!result || !detail) throw new Error('The accepted result and detail glints must exist.');
    Reflect.set(window, '__workspaceSavedAnimationNodes', { result, detail });
  });
  await page.evaluate(() => {
    const shifts = Reflect.get(window, '__workspaceLayoutShifts') as number[];
    shifts.length = 0;
  });
  const detail = await page.locator('.workspace-detail').boundingBox();
  await page.clock.fastForward(250);
  expect(await page.locator('.workspace-detail').boundingBox()).toEqual(detail);
  if (supportsLayoutShift) {
    expect(await page.evaluate(() => Reflect.get(window, '__workspaceLayoutShifts'))).toEqual([]);
  }
  await expect
    .poll(() =>
      page.evaluate(() => {
        const starts = Reflect.get(window, '__workspaceRelatedAnimationStarts') as {
          name: string;
          target: EventTarget | null;
        }[];
        const saved = Reflect.get(window, '__workspaceSavedAnimationNodes') as {
          result: Element;
          detail: Element;
        };
        const accepted = (entry: (typeof starts)[number]) =>
          entry.name === 'accepted-underline' && entry.target === saved.result;
        const inspected = (entry: (typeof starts)[number]) =>
          entry.name === 'detail-rim' && entry.target === saved.detail;
        return {
          accepted: starts.filter(accepted).length,
          detail: starts.filter(inspected).length,
          other: starts.filter((entry) => !accepted(entry) && !inspected(entry)).length,
          sameNodes:
            saved.result === document.querySelector('span.result-glint') &&
            saved.detail === document.querySelector('span.detail-glint'),
        };
      }),
    )
    .toEqual({ accepted: 1, detail: 1, other: 0, sameNodes: true });
  expect(await page.locator('.workspace-detail').boundingBox()).toEqual(detail);
  if (supportsLayoutShift) {
    expect(await page.evaluate(() => Reflect.get(window, '__workspaceLayoutShifts'))).toEqual([]);
  }
  const animationBaseline = await page.evaluate(() => {
    try {
      const observation = Reflect.get(window, '__failureObservation') as
        | { mark: (label: string) => void }
        | undefined;
      observation?.mark('animation-baseline-after-250ms');
    } catch {
      // Diagnostic failures must not change the original read or focus dispatch.
    }
    const starts = Reflect.get(window, '__workspaceRelatedAnimationStarts') as {
      name: string;
      target: EventTarget | null;
    }[];
    const saved = Reflect.get(window, '__workspaceSavedAnimationNodes') as {
      result: Element;
      detail: Element;
    };
    const accepted = (entry: (typeof starts)[number]) =>
      entry.name === 'accepted-underline' && entry.target === saved.result;
    const inspected = (entry: (typeof starts)[number]) =>
      entry.name === 'detail-rim' && entry.target === saved.detail;
    return {
      counter: Reflect.get(window, '__workspaceAnimationStarts'),
      related: {
        accepted: starts.filter(accepted).length,
        detail: starts.filter(inspected).length,
        other: starts.filter((entry) => !accepted(entry) && !inspected(entry)).length,
        sameNodes:
          saved.result === document.querySelector('span.result-glint') &&
          saved.detail === document.querySelector('span.detail-glint'),
      },
    };
  });
  expect(animationBaseline.related).toEqual({ accepted: 1, detail: 1, other: 0, sameNodes: true });
  const animationStarts = animationBaseline.counter;
  await page.clock.fastForward(61_000);
  await page.evaluate(() => {
    try {
      const observation = Reflect.get(window, '__failureObservation') as
        | { mark: (label: string) => void }
        | undefined;
      observation?.mark('after-61000ms-before-focus');
    } catch {
      // Diagnostic failures must not change the original read or focus dispatch.
    }
    return window.dispatchEvent(new Event('focus'));
  });
  expect(
    await page.evaluate(() => {
      try {
        const observation = Reflect.get(window, '__failureObservation') as
          | { mark: (label: string) => void }
          | undefined;
        observation?.mark('animation-final-after-focus');
      } catch {
        // Diagnostic failures must not change the original read or focus dispatch.
      }
      return Reflect.get(window, '__workspaceAnimationStarts');
    }),
  ).toBe(animationStarts);
  expect(
    await page.evaluate(() => {
      const saved = Reflect.get(window, '__workspaceSavedAnimationNodes') as {
        result: Element;
        detail: Element;
      };
      return (
        saved.result === document.querySelector('span.result-glint') &&
        saved.detail === document.querySelector('span.detail-glint')
      );
    }),
  ).toBe(true);
  expect(requests).toEqual(beforeRequests);
  expect(requests.every((url) => new URL(url).origin === new URL(originalUrl).origin)).toBe(true);
  expect(page.url()).toBe(originalUrl);
  expect(
    await page.evaluate(() => ({
      writes: Reflect.get(window, '__workspaceStorageWrites'),
      local: Object.keys(localStorage),
      session: Object.keys(sessionStorage),
      cookies: document.cookie,
    })),
  ).toEqual({ writes: [], local: [], session: [], cookies: '' });
  expect(
    await page
      .locator('img, link[rel=preconnect], link[rel=prefetch], link[rel=dns-prefetch]')
      .count(),
  ).toBe(0);
});

test('accepted actions show quiet feedback without replay or stale identity', async ({ page }) => {
  test.setTimeout(120_000);
  await page.clock.install({ time: new Date('2026-09-07T14:59:00Z') });
  await mountPagination(page);
  const resultGlint = page.locator('.result-glint');
  await expect(resultGlint).toHaveCount(1);
  expect(
    await resultGlint.evaluate((node) => getComputedStyle(node, '::after').animationDuration),
  ).toBe('0.16s');
  await page.locator('.candidate-summary').first().getByRole('button').click();
  const detailGlint = page.locator('.detail-glint');
  await expect(detailGlint).toHaveCount(1);
  expect(
    await detailGlint.evaluate((node) => getComputedStyle(node, '::after').animationDuration),
  ).toBe('0.18s');
  const before = await page.locator('.workspace-detail').boundingBox();
  for (const progress of [0, 0.5, 1]) {
    await page.evaluate((progress) => {
      for (const node of document.querySelectorAll('.result-glint, .detail-glint')) {
        for (const animation of node.getAnimations({ subtree: true })) {
          animation.pause();
          animation.currentTime = Number(animation.effect?.getComputedTiming().duration) * progress;
        }
      }
    }, progress);
    await expect(page.locator('.workspace-detail .record-evidence')).toBeVisible();
    expect(
      await page.locator('.workspace-detail h3').evaluate((node) => getComputedStyle(node).opacity),
    ).toBe('1');
    expect(await page.locator('.workspace-detail').boundingBox()).toEqual(before);
  }
  await page.evaluate(() => {
    Reflect.set(window, '__acceptedGlint', document.querySelector('.result-glint'));
    Reflect.set(window, '__detailGlint', document.querySelector('.detail-glint'));
    const starts: string[] = [];
    Reflect.set(window, '__motionReplays', starts);
    document.addEventListener('animationstart', (event) => starts.push(event.animationName));
  });
  await page.clock.fastForward(61_000);
  await page.evaluate(() => {
    window.dispatchEvent(new Event('focus'));
    document.dispatchEvent(new Event('visibilitychange'));
  });
  expect(
    await page.evaluate(() => ({
      sameAccepted:
        Reflect.get(window, '__acceptedGlint') === document.querySelector('.result-glint'),
      sameDetail: Reflect.get(window, '__detailGlint') === document.querySelector('.detail-glint'),
      starts: Reflect.get(window, '__motionReplays'),
    })),
  ).toEqual({ sameAccepted: true, sameDetail: true, starts: [] });
  await page.locator('.candidate-summary').first().getByRole('button').click();
  expect(
    await page.evaluate(
      () => Reflect.get(window, '__detailGlint') === document.querySelector('.detail-glint'),
    ),
  ).toBe(true);
  await page.locator('.candidate-summary').nth(1).getByRole('button').click();
  expect(
    await page.evaluate(
      () => Reflect.get(window, '__detailGlint') !== document.querySelector('.detail-glint'),
    ),
  ).toBe(true);
  await page.getByRole('button', { name: '다음 페이지' }).click();
  expect(
    await page.evaluate(
      () => Reflect.get(window, '__acceptedGlint') !== document.querySelector('.result-glint'),
    ),
  ).toBe(true);
  await expect(page.locator('.workspace-detail')).toHaveCount(0);
  await page.locator('.candidate-summary').first().getByRole('button').click();
  await page.evaluate(() =>
    Reflect.set(window, '__beforeRepeatGlint', document.querySelector('.result-glint')),
  );
  const previousAnnouncement = await page.locator('.result-summary').textContent();
  await page.getByRole('searchbox').press('Enter');
  await expect(page.locator('.result-summary')).not.toHaveText(previousAnnouncement ?? '');
  expect(
    await page.evaluate(
      () => Reflect.get(window, '__beforeRepeatGlint') !== document.querySelector('.result-glint'),
    ),
  ).toBe(true);
  await expect(page.locator('.workspace-detail')).toHaveCount(0);
  await page.locator('.candidate-summary').first().getByRole('button').click();
  for (const [index, media] of (
    [
      { reducedMotion: 'reduce', forcedColors: 'none' },
      { forcedColors: 'active', reducedMotion: 'no-preference' },
    ] as const
  ).entries()) {
    await page.emulateMedia({ reducedMotion: 'no-preference', forcedColors: 'none' });
    // Mount a different record and hold its decoration mid-effect before changing media.
    const inspect = page
      .locator('.candidate-summary')
      .nth(index + 1)
      .getByRole('button');
    await inspect.click();
    const heading = page.locator('.workspace-detail h3');
    await expect(heading).toBeFocused();
    const identity = await page.locator('.workspace-detail').getAttribute('aria-label');
    const evidence = await page.locator('.workspace-detail .record-evidence').textContent();
    expect(
      await detailGlint.evaluate((node) => {
        const animations = node.getAnimations({ subtree: true });
        for (const animation of animations) {
          animation.pause();
          animation.currentTime = 90;
        }
        return animations.map((animation) => {
          const timing = animation.effect?.getComputedTiming();
          return {
            time: animation.currentTime,
            state: animation.playState,
            duration: timing?.duration,
            inProgress: timing?.progress != null && timing.progress > 0 && timing.progress < 1,
          };
        });
      }),
    ).toEqual([{ time: 90, state: 'paused', duration: 180, inProgress: true }]);
    await page.emulateMedia(media);
    await expect(heading).toBeFocused();
    await expect(page.locator('.workspace-detail')).toHaveAttribute('aria-label', identity ?? '');
    await expect(inspect).toHaveAttribute('aria-pressed', 'true');
    expect(await page.locator('.workspace-detail .record-evidence').textContent()).toBe(evidence);
    expect(
      await page.locator('.workspace-detail').evaluate((node) => {
        const style = getComputedStyle(node);
        return (
          Number.parseFloat(style.borderInlineStartWidth) >= 2 &&
          style.borderInlineStartStyle === 'solid'
        );
      }),
    ).toBe(true);
    for (const glint of [resultGlint, detailGlint]) {
      await expect(glint).toBeHidden();
      expect(await glint.evaluate((node) => getComputedStyle(node, '::after').animationName)).toBe(
        'none',
      );
    }
    await evidenceIsUsable(page);
  }
});
