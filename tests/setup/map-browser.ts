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
        entry: fileURLToPath(new URL('../fixtures/map-runtime.tsx', import.meta.url)),
        formats: ['iife'],
        name: 'MapTestRuntime',
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
export async function mountMapSearch(page: Page) {
  bundle ??= buildRuntime();
  const { script, css } = await bundle;
  await page.route('**/map-harness', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Map search fixture</title></head><body></body></html>',
    }),
  );
  await page.goto('./map-harness');
  await page.addStyleTag({ content: css });
  await page.addScriptTag({ content: script });
  await page.evaluate(() => {
    const runtime = Reflect.get(window, 'MapTestRuntime') as { mount(): void };
    runtime.mount();
  });
  await page.getByRole('searchbox').waitFor();
}
