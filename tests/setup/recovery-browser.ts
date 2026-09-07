import { fileURLToPath } from 'node:url';
import type { Page } from '@playwright/test';
import preact from '@preact/preset-vite';
import { build } from 'vite';

let bundle: Promise<{ script: string; css: string }> | undefined;
function buildRuntime() {
  return build({
    configFile: false,
    logLevel: 'silent',
    plugins: [preact()],
    build: {
      write: false,
      minify: false,
      target: 'es2023',
      lib: {
        entry: fileURLToPath(new URL('../fixtures/recovery-runtime.tsx', import.meta.url)),
        formats: ['iife'],
        name: 'RecoveryTestRuntime',
      },
    },
  }).then((result) => {
    const output = (Array.isArray(result) ? result : [result]).flatMap((item) => {
      if (!('output' in item)) throw new Error('Unexpected build watcher');
      return item.output;
    });
    return {
      script: output
        .filter((item) => item.type === 'chunk')
        .map((item) => item.code)
        .join('\n'),
      css: output
        .filter((item) => item.type === 'asset' && item.fileName.endsWith('.css'))
        .map((item) => (item.type === 'asset' ? String(item.source) : ''))
        .join('\n'),
    };
  });
}
export async function mountRecovery(page: Page) {
  bundle ??= buildRuntime();
  const { script, css } = await bundle;
  await page.route('**/recovery-harness', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Recovery fixture</title></head><body></body></html>',
    }),
  );
  await page.goto('./recovery-harness');
  await page.addStyleTag({ content: css });
  await page.addScriptTag({ content: script });
  await page.evaluate(() => {
    const runtime = Reflect.get(window, 'RecoveryTestRuntime') as { mount(): void };
    runtime.mount();
  });
  await page.getByRole('status').filter({ hasText: '불러오는 중' }).waitFor();
}
export async function completeLoad(page: Page, outcome: 'error' | 'partial' | 'empty') {
  // Wait for the injected loader to receive the request, rather than guessing effect timing.
  await page.getByRole('button', { name: '데이터 다시 불러오기', disabled: true }).waitFor();
  await page.waitForFunction(() => {
    const runtime = Reflect.get(window, 'RecoveryTestRuntime') as { isPending(): boolean };
    return runtime.isPending();
  });
  await page.evaluate((outcome) => {
    const runtime = Reflect.get(window, 'RecoveryTestRuntime') as { complete(value: string): void };
    runtime.complete(outcome);
  }, outcome);
}
