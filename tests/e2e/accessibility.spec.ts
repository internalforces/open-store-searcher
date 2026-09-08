import { mountPagination } from '../setup/pagination-browser.js';
import { expect, test } from '@playwright/test';
import { scanPageForWcag21Violations } from '../setup/accessibility.js';
import { mountMapSearch } from '../setup/map-browser.js';
import { completeLoad, mountRecovery } from '../setup/recovery-browser.js';

test('has no automatically detectable WCAG 2.1 A or AA violations', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('button', { name: '검색', exact: true })).toBeEnabled();

  const results = await scanPageForWcag21Violations(page);

  expect(results.violations).toEqual([]);
});

for (const [state, query] of [
  ['primary and conflict', '가상별빛 카페 서울특별시 마포구 월드컵로 12-1'],
  ['ambiguous licensing tie', '가상동률 식당 서울특별시 종로구 자하문로 20'],
] as const) {
  test(`has no WCAG violations with ${state} results`, async ({ page }) => {
    await page.goto('./');
    await expect(page.getByRole('button', { name: '검색', exact: true })).toBeEnabled();
    await page.getByRole('searchbox').fill(query);
    await page.getByRole('button', { name: '검색', exact: true }).click();
    await expect(page.getByRole('article')).toHaveCount(2);
    const results = await scanPageForWcag21Violations(page);
    expect(results.violations).toEqual([]);
  });
}

test('has no WCAG violations with stale coverage warnings', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-09-08T00:00:00.000Z') });
  await page.goto('./');
  await expect(page.getByRole('button', { name: '검색', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: /예시 입력/ }).click();
  await page.getByRole('button', { name: '검색', exact: true }).click();
  await expect(
    page.getByText(
      '합성 예시 데이터의 기준일로부터 7일 이상 지났습니다. 실제 사업체 상태를 나타내지 않습니다.',
    ),
  ).toHaveCount(3);
  expect((await scanPageForWcag21Violations(page)).violations).toEqual([]);
});

test('has no WCAG violations during loading, initial failure and retained-data failure', async ({
  page,
}) => {
  await mountRecovery(page);
  expect((await scanPageForWcag21Violations(page)).violations).toEqual([]);
  await completeLoad(page, 'error');
  await expect(page.getByRole('alert')).toBeVisible();
  expect((await scanPageForWcag21Violations(page)).violations).toEqual([]);
  await page.getByRole('button', { name: '데이터 다시 불러오기' }).click();
  await completeLoad(page, 'partial');
  await expect(page.getByRole('status')).toContainText('불러왔습니다');
  await page.getByRole('button', { name: /예시 입력/ }).click();
  await page.getByRole('button', { name: '검색', exact: true }).click();
  await page.getByRole('button', { name: '데이터 다시 불러오기' }).click();
  await completeLoad(page, 'error');
  await expect(page.getByRole('article')).toHaveCount(1);
  expect((await scanPageForWcag21Violations(page)).violations).toEqual([]);
});

test('has no WCAG violations with candidate map links and unavailable coverage', async ({
  page,
}) => {
  await mountMapSearch(page);
  await page.getByRole('searchbox').fill('가상별빛 카페 서울특별시 마포구 월드컵로 12-1');
  await page.getByRole('searchbox').press('Enter');
  await expect(page.getByRole('link', { name: '네이버 지도에서 검색 (새 탭)' })).toHaveCount(2);
  expect((await scanPageForWcag21Violations(page)).violations).toEqual([]);
});

for (const [state, query] of [
  ['invalid', ''],
  ['empty', '존재하지않는시험상호'],
  ['similar', '가상별빛 카페'],
] as const) {
  test(`TASK-017 has no WCAG violations in ${state} state with enlarged text`, async ({ page }) => {
    await page.goto('./');
    await expect(page.getByRole('button', { name: '검색', exact: true })).toBeEnabled();
    await page.addStyleTag({ content: 'html { font-size: 200%; }' });
    await page.getByRole('searchbox').fill(query);
    await page.getByRole('searchbox').press('Enter');
    if (state === 'invalid') await expect(page.getByRole('alert')).toBeVisible();
    else await expect(page.getByRole('region', { name: '검색 결과', exact: true })).toBeVisible();
    expect((await scanPageForWcag21Violations(page)).violations).toEqual([]);
  });
}

test('TASK-018 pagination remains accessible on first and final pages', async ({ page }) => {
  await mountPagination(page);
  expect((await scanPageForWcag21Violations(page)).violations).toEqual([]);
  await page.getByRole('button', { name: '마지막 페이지' }).click();
  await expect(page.getByRole('heading', { name: '유사 후보', exact: true })).toBeFocused();
  expect((await scanPageForWcag21Violations(page)).violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
