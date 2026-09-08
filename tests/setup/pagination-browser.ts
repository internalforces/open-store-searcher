import { expect, type Page } from '@playwright/test';
import { makeDataset, queries } from '../performance/metrics.js';

export async function mountPagination(page: Page) {
  const dataset = makeDataset(47);
  const records = dataset.records.map((record, index) => ({
    ...record,
    name: `${queries.common}${index}`,
  }));
  await page.route('**/assets/demo-*.json', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(route.request().url().includes('demo-1-') ? records : []),
    }),
  );
  await page.goto('./');
  await expect(page.getByRole('button', { name: '검색', exact: true })).toBeEnabled();
  await page.getByRole('searchbox').fill(queries.common);
  await page.getByRole('button', { name: '검색', exact: true }).click();
  await expect(page.getByRole('article')).toHaveCount(20);
}
