// Local-only real source UI/Worker measurements; never creates a release/baseline.
import { build } from 'vite';
import preact from '@preact/preset-vite';
import { chromium } from '@playwright/test';
import { readFile, readdir, link, writeFile, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { createServer } from 'node:http';
import { join, extname } from 'node:path';
import { createGzip } from 'node:zlib';
import { execFileSync } from 'node:child_process';
const root = process.argv[2];
const site = join(root, process.argv[3] ?? 'site');
const report = JSON.parse(await readFile(join(root, 'measurement.json'), 'utf8'));
const asset = report.manifestEntry.name;
await build({
  configFile: false,
  base: './',
  logLevel: 'error',
  plugins: [
    preact(),
    {
      name: 'local-research-input',
      enforce: 'pre',
      resolveId(s, i) {
        if (s === './demo-loader.js' && i?.endsWith('/src/app/main.tsx'))
          return '\0local-research-input';
      },
      load(id) {
        if (id !== '\0local-research-input') return;
        return `import {createCompactPublicationLoader} from '/src/app/compact-publication-loader.ts';export const demoLoader=createCompactPublicationLoader(new URL(${JSON.stringify(asset)},window.location.href).href);`;
      },
    },
  ],
  build: { outDir: site, emptyOutDir: false },
});
for (const name of await readdir(join(root, 'assets')))
  await link(join(root, 'assets', name), join(site, 'assets', name));
const requests = [];
let transferred = 0;
const server = createServer(async (req, res) => {
  try {
    const path = join(
      site,
      new URL(req.url, 'http://local').pathname === '/'
        ? 'index.html'
        : decodeURIComponent(new URL(req.url, 'http://local').pathname),
    );
    const size = (await stat(path)).size;
    requests.push(req.url);
    const type =
      {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
      }[extname(path)] ?? 'application/octet-stream';
    res.setHeader('Content-Type', type);
    res.setHeader(
      'Cache-Control',
      path.endsWith('.html') ? 'no-cache' : 'public,max-age=31536000,immutable',
    );
    if (/gzip/.test(req.headers['accept-encoding'] ?? '')) {
      res.setHeader('Content-Encoding', 'gzip');
      const stream = createReadStream(path).pipe(createGzip());
      stream.on('data', (b) => {
        transferred += b.length;
      });
      stream.pipe(res);
    } else {
      transferred += size;
      createReadStream(path).pipe(res);
    }
  } catch {
    res.statusCode = 404;
    res.end();
  }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/`;
const host = await chromium.launchServer({ headless: true });
const browser = await chromium.connect(host.wsEndpoint());
let peakRss = 0,
  phase = 'cold',
  samples = [];
const sample = () => {
  try {
    const rows = execFileSync('/bin/ps', ['-axo', 'pid=,ppid=,rss='], { encoding: 'utf8' })
      .trim()
      .split('\n')
      .map((r) => r.trim().split(/\s+/).map(Number));
    const ids = new Set([host.process().pid]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const [pid, ppid] of rows)
        if (ids.has(ppid) && !ids.has(pid)) {
          ids.add(pid);
          changed = true;
        }
    }
    const rss = rows.filter((r) => ids.has(r[0])).reduce((s, r) => s + r[2] * 1024, 0);
    peakRss = Math.max(peakRss, rss);
    samples.push({ phase, rss, at: Date.now() });
  } catch {}
};
const timer = setInterval(sample, 1000);
sample();
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.addInitScript(() => {
    window.measurements = [];
    window.researchWorkers = [];
    window.failNextLoad = false;
    const NativeWorker = window.Worker;
    window.Worker = class extends NativeWorker {
      postMessage(message) {
        if (message.kind === 'load' && window.failNextLoad) {
          window.failNextLoad = false;
          message = {
            ...message,
            url: message.url.replace(
              /compact-manifest-[a-f0-9]+/,
              'compact-manifest-' + '0'.repeat(64),
            ),
          };
        }
        super.postMessage(message);
      }
      constructor(...args) {
        super(...args);
        window.researchWorkers.push(this);
        this.addEventListener('message', (event) => {
          const m = event.data;
          if (m.kind === 'ready')
            window.measurements.push({
              kind: 'ready',
              at: performance.now(),
              timings: m.timings,
              count: m.recordCount,
            });
          if (m.kind === 'page')
            window.measurements.push({
              kind: 'page',
              at: performance.now(),
              page: m.result.page,
              eligibleCount: m.result.eligibleCount,
              similarCount: m.result.similarCount,
            });
        });
      }
    };
  });
  const results = [];
  for (const mode of ['cold', 'warm']) {
    phase = mode;
    const start = performance.now(),
      before = transferred;
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    const shellMs = performance.now() - start;
    await page.waitForFunction(
      () => window.measurements.some((m) => m.kind === 'ready'),
      {},
      { timeout: 600000 },
    );
    const readyMs = performance.now() - start;
    const ready = await page.evaluate(() => window.measurements.find((m) => m.kind === 'ready'));
    console.log(JSON.stringify({ mode, shellMs, readyMs, ready }));
    const search = [];
    for (const query of ['강남구', '스타벅스', '테헤란로 123', 'zzzzzznonexistentzzzzzz']) {
      phase = `${mode}:search`;
      const count = await page.evaluate(() => window.measurements.length);
      const req = requests.length;
      await page.getByRole('searchbox').fill(query);
      const t = performance.now();
      await page.getByRole('button', { name: '검색', exact: true }).click();
      await page.waitForFunction((n) => window.measurements.length > n, count, { timeout: 120000 });
      await page.locator('#search-results').waitFor();
      search.push({
        query,
        searchToVisibleMs: performance.now() - t,
        ...(await page.evaluate(() => window.measurements.at(-1))),
        networkRequests: requests.length - req,
      });
      if (query === '강남구') {
        const beforePage = await page.evaluate(() => window.measurements.length);
        const requestCount = requests.length;
        const pageStart = performance.now();
        await page.getByRole('button', { name: '다음 페이지' }).click();
        await page.waitForFunction((n) => window.measurements.length > n, beforePage, {
          timeout: 120000,
        });
        search.at(-1).paginationMs = performance.now() - pageStart;
        search.at(-1).paginationRequests = requests.length - requestCount;
      }
      console.log(JSON.stringify({ mode, search: search.at(-1) }));
    }
    results.push({ mode, shellMs, readyMs, ready, transferredBytes: transferred - before, search });
    console.log(JSON.stringify(results.at(-1)));
    if (mode === 'cold') {
      phase = 'failed-refresh';
      await page.evaluate(() => {
        window.failNextLoad = true;
      });
      await page.getByRole('button', { name: '데이터 다시 불러오기' }).click();
      await page
        .getByText('데이터를 다시 불러오지 못했습니다. 이전 데이터로 계속 검색할 수 있습니다.')
        .waitFor();
      if (await page.getByRole('searchbox').isDisabled())
        throw new Error('Lost accepted search after candidate failure');
      results.at(-1).failedRefreshRetained = true;
      phase = 'refresh-overlap';
      const count = await page.evaluate(
        () => window.measurements.filter((m) => m.kind === 'ready').length,
      );
      const t = performance.now();
      await page.getByRole('button', { name: '데이터 다시 불러오기' }).click();
      await page.waitForFunction(
        (n) => window.measurements.filter((m) => m.kind === 'ready').length > n,
        count,
        { timeout: 600000 },
      );
      results.at(-1).refreshMs = performance.now() - t;
    }
  }
  const output = {
    kind: 'full-source-local-browser',
    publicationApproved: false,
    network: 'loopback gzip; unthrottled desktop; warm HTTP cache',
    browser: browser.version(),
    completeSourceCount: report.recordCount,
    results,
    peakBrowserTreeRssBytes: peakRss,
    samples,
    siteBytes:
      report.rawBytes +
      (
        await Promise.all(
          (
            await readdir(join(site, 'assets'))
          )
            .filter((n) => !n.startsWith('compact-') || n.endsWith('.js'))
            .map(async (n) => (await stat(join(site, 'assets', n))).size),
        )
      ).reduce((a, b) => a + b, 0) +
      (await stat(join(site, 'index.html'))).size,
  };
  await writeFile(
    join(root, `browser-measurement-${process.argv[3] ?? 'site'}.json`),
    `${JSON.stringify(output, null, 2)}\n`,
  );
} finally {
  clearInterval(timer);
  await browser.close();
  await host.close();
  server.closeAllConnections();
  await new Promise((r) => server.close(r));
}
