import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://127.0.0.1:4173/open-store-searcher/';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: true,
  retries: 1,
  failOnFlakyTests: true,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
    video: 'off',
  },
  webServer: {
    command: 'npm run build:e2e && npm run preview:e2e',
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 5'] },
    },
  ],
});
