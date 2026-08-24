import { expect, test } from '@playwright/test';

test('loads the built application from the GitHub Pages subpath', async ({ page }) => {
  const failedRequests: string[] = [];
  page.on('requestfailed', (request) => {
    failedRequests.push(request.url());
  });

  await page.goto('./');

  await expect(page.getByRole('heading', { level: 1, name: 'open-store-searcher' })).toBeVisible();
  expect(failedRequests).toEqual([]);
});
