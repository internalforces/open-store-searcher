import { expect, test } from '@playwright/test';

import { scanPageForWcag21Violations } from '../setup/accessibility.js';

test('has no automatically detectable WCAG 2.1 A or AA violations', async ({ page }) => {
  await page.goto('./');

  const results = await scanPageForWcag21Violations(page);

  expect(results.violations).toEqual([]);
});

for (const [state, query] of [
  ['primary and conflict', '가상별빛 카페 서울특별시 마포구 월드컵로 12-1'],
  ['ambiguous licensing tie', '가상동률 식당 서울특별시 종로구 자하문로 20'],
] as const) {
  test(`has no WCAG violations with ${state} results`, async ({ page }) => {
    await page.goto('./');
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
  await page.getByRole('button', { name: /예시 입력/ }).click();
  await page.getByRole('button', { name: '검색', exact: true }).click();
  await expect(
    page.getByText(
      '합성 예시 데이터의 기준일로부터 7일 이상 지났습니다. 실제 사업체 상태를 나타내지 않습니다.',
    ),
  ).toHaveCount(3);
  expect((await scanPageForWcag21Violations(page)).violations).toEqual([]);
});
