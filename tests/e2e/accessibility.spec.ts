import { expect, test } from '@playwright/test';

import { scanPageForWcag21Violations } from '../setup/accessibility.js';

test('has no automatically detectable WCAG 2.1 A or AA violations', async ({ page }) => {
  await page.goto('./');

  const results = await scanPageForWcag21Violations(page);

  expect(results.violations).toEqual([]);
});
