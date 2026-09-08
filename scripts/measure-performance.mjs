import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { createServer as createHttpServer } from 'node:http';
import { cpus, platform, release, tmpdir, totalmem } from 'node:os';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, devices } from '@playwright/test';
import { build, createServer } from 'vite';

const root = fileURLToPath(new URL('../', import.meta.url));
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const repetitions = 5;
const scales = [1_000, 10_000, 50_000];
const profiles = [
  { name: 'desktop', cpuRate: 1, mobile: false },
  { name: 'mobile-lab', cpuRate: 4, mobile: true },
];
const network = {
  offline: false,
  latency: 150,
  downloadThroughput: 200_000,
  uploadThroughput: 93_750,
};
let scratch;
let vite;
let server;
let browser;

async function files(directory, prefix = '') {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const name = `${prefix}${entry.name}`;
    if (entry.isDirectory()) result.push(...(await files(join(directory, entry.name), `${name}/`)));
    else if (entry.isFile()) result.push(name);
  }
  return result.sort();
}

async function sourceManifest() {
  const paths = [
    'package.json',
    'package-lock.json',
    'vite.config.ts',
    'vitest.config.ts',
    'index.html',
    'scripts/measure-performance.mjs',
    ...(await files(join(root, 'src'))).map((path) => `src/${path}`),
    ...(await files(join(root, 'tests/performance'))).map((path) => `tests/performance/${path}`),
  ];
  return Object.fromEntries(
    await Promise.all(paths.map(async (path) => [path, sha256(await readFile(join(root, path)))])),
  );
}

async function profileContext(profile) {
  const context = await browser.newContext(profile.mobile ? { ...devices['Pixel 5'] } : {});
  return context;
}

async function configure(page, profile) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: profile.cpuRate });
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', network);
  return cdp;
}

try {
  const args = process.argv.slice(2);
  if (args.length > 1 || (args.length === 1 && args[0] !== '--check')) {
    throw new Error('Usage: npm run performance -- [--check]');
  }
  const implementationSha256 = await sourceManifest();
  scratch = await mkdtemp(join(tmpdir(), 'open-store-performance-'));
  const appDir = join(scratch, 'app');
  const fixtureDir = join(scratch, 'fixture');
  await build({
    root,
    base: '/open-store-searcher/',
    logLevel: 'silent',
    build: { outDir: appDir, emptyOutDir: true },
  });
  await build({
    root,
    base: '/benchmark/',
    logLevel: 'silent',
    build: {
      outDir: fixtureDir,
      emptyOutDir: true,
      rolldownOptions: { input: join(root, 'tests/performance/index.html') },
    },
  });
  vite = await createServer({
    root,
    configFile: false,
    appType: 'custom',
    logLevel: 'silent',
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true, watch: null, ws: false },
  });
  const { summarize, assessBudget, queries } = await vite.ssrLoadModule(
    '/tests/performance/metrics.ts',
  );
  await vite.close();
  vite = null;
  const routes = new Map();
  const bundle = [];
  for (const [directory, prefix] of [
    [appDir, '/open-store-searcher/'],
    [fixtureDir, '/benchmark/'],
  ]) {
    for (const name of await files(directory)) {
      const bytes = await readFile(join(directory, name));
      routes.set(`${prefix}${name}`, bytes);
      if (directory === appDir)
        bundle.push({ path: name, bytes: bytes.length, sha256: sha256(bytes) });
    }
  }
  const initialBytes = bundle
    .filter((asset) => /\.(html|css|js)$/.test(asset.path))
    .reduce((sum, asset) => sum + asset.bytes, 0);
  assert(
    bundle.some((asset) => asset.path === 'index.html'),
    'Missing production HTML',
  );
  assert(
    bundle.some((asset) => asset.path.endsWith('.js')),
    'Missing production JavaScript',
  );
  const mime = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
  };
  server = createHttpServer((request, response) => {
    const path = request.url?.endsWith('/') ? `${request.url}index.html` : request.url;
    const bytes = routes.get(path);
    if (!bytes) {
      response.writeHead(404).end();
      return;
    }
    response.writeHead(200, {
      'Content-Type': mime[extname(path)] ?? 'application/octet-stream',
      'Content-Length': bytes.length,
      'Cache-Control': 'public, max-age=3600',
    });
    response.end(bytes);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch();
  const errors = [];
  const watchPage = (page) => {
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => {
      if (new URL(request.url()).origin !== origin) errors.push('Unexpected nonlocal request');
    });
    page.on('response', (response) => {
      if (response.status() >= 400) errors.push(`HTTP ${response.status()}`);
    });
    page.on('requestfailed', () => errors.push('Failed resource request'));
  };
  const metric = (samples, target) => ({
    samples,
    ...(samples.length ? summarize(samples) : { count: 0 }),
    ...(target === undefined ? {} : { target, verdict: assessBudget(samples, target) }),
  });
  const startup = [];
  const workloads = [];
  for (const profile of profiles) {
    process.stderr.write(`Measuring ${profile.name}: production cold/warm startup\n`);
    const cacheSamples = { cold: [], warm: [] };
    for (let iteration = 0; iteration < repetitions; iteration++) {
      const context = await profileContext(profile);
      try {
        const page = await context.newPage();
        watchPage(page);
        const cdp = await configure(page, profile);
        await page.addInitScript(() => {
          window.startupEvidence = { primaryMs: null, lcpMs: null };
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) window.startupEvidence.lcpMs = entry.startTime;
          }).observe({ type: 'largest-contentful-paint', buffered: true });
          let scheduled = false;
          const observer = new MutationObserver(() => {
            const input = document.querySelector('input');
            const submit = document.querySelector('form button[type=submit]:enabled');
            const title = document.querySelector('h1');
            if (scheduled || !input || !title || !submit) return;
            scheduled = true;
            requestAnimationFrame(() =>
              requestAnimationFrame(() => {
                if (
                  title.getBoundingClientRect().height > 0 &&
                  input.getBoundingClientRect().height > 0 &&
                  submit.getBoundingClientRect().height > 0
                ) {
                  window.startupEvidence.primaryMs = performance.now();
                }
                observer.disconnect();
              }),
            );
          });
          observer.observe(document, { childList: true, subtree: true, attributes: true });
        });
        for (const cache of ['cold', 'warm']) {
          if (cache === 'cold') await cdp.send('Network.clearBrowserCache');
          await page.goto(`${origin}/open-store-searcher/`);
          await page.waitForFunction(
            () =>
              window.startupEvidence.primaryMs !== null && window.startupEvidence.lcpMs !== null,
          );
          // Fixed noninteractive observation window; no synthetic interaction truncates LCP.
          await page.waitForTimeout(1_000);
          cacheSamples[cache].push(
            await page.evaluate(() => ({
              ...window.startupEvidence,
              resources: performance.getEntriesByType('resource').map((entry) => ({
                path: new URL(entry.name).pathname,
                transferSize: entry.transferSize,
                decodedBodySize: entry.decodedBodySize,
              })),
            })),
          );
        }
      } finally {
        await context.close();
      }
    }
    for (const cache of ['cold', 'warm'])
      startup.push({
        profile: profile.name,
        cache,
        primary: metric(
          cacheSamples[cache].map((sample) => sample.primaryMs),
          2_500,
        ),
        lcp: metric(
          cacheSamples[cache].map((sample) => sample.lcpMs),
          2_500,
        ),
        observations: cacheSamples[cache],
      });

    for (const size of scales) {
      process.stderr.write(`Measuring ${profile.name}: ${size} synthetic records\n`);
      const samples = [];
      for (let iteration = 0; iteration < repetitions; iteration++) {
        const context = await profileContext(profile);
        try {
          const page = await context.newPage();
          watchPage(page);
          await configure(page, profile);
          await page.goto(`${origin}/benchmark/tests/performance/index.html`);
          await page.waitForFunction(() => Boolean(window.performanceHarness));
          const preparation = await page.evaluate(
            (count) => window.performanceHarness.mount(count),
            size,
          );
          const submissions = {};
          for (const [name, query] of Object.entries(queries)) {
            const expectedCards = name === 'common' ? size / 100 : name === 'absent' ? 0 : size;
            assert.equal(
              preparation.searchOnly[name].expectedCards,
              expectedCards,
              `Incorrect search-only outcome: ${name}`,
            );
            await page.locator('input').fill(query);
            const result = await page.evaluate(() => window.performanceHarness.submit());
            const { topCount, similarCount } = preparation.searchOnly[name];
            assert.equal(result.totalCandidates, expectedCards, `Incomplete results: ${name}`);
            assert.equal(
              result.cards,
              topCount + Math.min(20, similarCount),
              `Incorrect first page: ${name}`,
            );
            result.navigation = [];
            if (similarCount > 20) {
              const last = Math.ceil(similarCount / 20) - 1;
              for (const [label, target] of [
                ['다음 페이지', 1],
                ['마지막 페이지', last],
                ['이전 페이지', last - 1],
                ['처음 페이지', 0],
              ]) {
                // The next action can already be on the last page for two-page results.
                if (label === '마지막 페이지' && last === 1) continue;
                const navigation = await page.evaluate(
                  ([label, target]) => window.performanceHarness.navigate(label, target),
                  [label, target],
                );
                assert.equal(navigation.totalCandidates, expectedCards);
                assert.equal(navigation.cards, topCount + Math.min(20, similarCount - target * 20));
                result.navigation.push({ label, page: target + 1, ...navigation });
                // Previous reaches the first page in two-page results.
                if (label === '이전 페이지' && last === 1) break;
              }
            }
            submissions[name] = result;
          }
          samples.push({ preparation, submissions });
        } finally {
          await context.close();
        }
      }
      assert(
        samples.every(
          (sample) => sample.preparation.fixtureSha256 === samples[0].preparation.fixtureSha256,
        ),
        'Fixture changed between iterations',
      );
      workloads.push({
        profile: profile.name,
        size,
        samples,
        preparation: Object.fromEntries(
          ['generationMs', 'parseMs', 'prepareMs', 'mountMs'].map((key) => [
            key,
            metric(samples.map((sample) => sample.preparation[key])),
          ]),
        ),
        queries: Object.fromEntries(
          Object.keys(queries).map((name) => [
            name,
            {
              pageNavigation: samples[0].submissions[name].navigation.length
                ? metric(
                    samples.flatMap((sample) =>
                      sample.submissions[name].navigation.map((step) => step.ms),
                    ),
                    500,
                  )
                : null,
              searchOnly: metric(samples.map((sample) => sample.preparation.searchOnly[name].ms)),
              submitToPaintOpportunity: metric(
                samples
                  .map((sample) => sample.submissions[name].ms)
                  .filter((value) => value !== null),
                500,
              ),
            },
          ]),
        ),
      });
    }
  }
  assert.deepEqual(errors, [], 'Browser evidence is invalid');
  assert.deepEqual(
    await sourceManifest(),
    implementationSha256,
    'Measured files changed during the run',
  );
  const report = {
    schemaVersion: 1,
    recordedAt: new Date().toISOString(),
    environment: {
      node: process.version,
      browser: browser.version(),
      platform: platform(),
      release: release(),
      cpu: cpus()[0]?.model,
      logicalCpus: cpus().length,
      memoryBytes: totalmem(),
      profiles,
      network,
      repetitions,
      scales,
      mobileDevice: 'Pixel 5 emulation; CPU multiplier is host-relative, not a physical device',
      serving:
        'loopback HTTP, uncompressed bodies, max-age=3600; cold cache cleared, warm same-page navigation',
    },
    methodology: {
      budgetRule:
        'Inclusive PRD targets, conservative all-samples gate; nearest-rank median/p95 with no removed outliers or retries.',
      codeSize:
        'Conservative sum of every production HTML/CSS/JS output; separately lists deferred JSON assets; excludes separately built benchmark.',
      primary:
        'Navigation to laid-out heading/input and enabled submit button plus two animation frames.',
      lcp: 'Latest buffered LCP after readiness plus 1000 ms without interaction; fixed lab observation window.',
      search:
        'Loaded real App: complete search and first page (Top-3 plus up to 20 similar cards), verified identities/order/full count, layout and two animation frames. Page navigation uses the same endpoint. Excludes typing, automation transport, and input scheduling delay; paint opportunity is not pixel presentation.',
      preparation:
        'Five fresh pages: generation, JSON parse and diagnostic prepare measured separately; App rebuilds its own index. Diagnostic preparation/search precedes mounting and can warm code caches.',
      queryOrder: Object.keys(queries),
    },
    implementationSha256,
    bundle: {
      assets: bundle,
      initialBytes,
      target: 300_000,
      verdict: assessBudget([initialBytes], 300_000),
    },
    startup,
    workloads,
    limitations: [
      'Synthetic distribution only: one district, 1% common name, 100 invented roads, distinct building numbers; no claim about production distribution or maximum supported rows.',
      'Approved pagination: complete result calculation plus Top-3 and first 20 similar cards; all candidates remain reachable. First/next/last/previous page display measured; no full simultaneous DOM claim.',
      'Production JSON schema, data partition contract, source-cut and publication remain unavailable. No production data budget was invented.',
      'Local lab only: no physical mobile device, Pages CDN, compression, field percentiles or production-scale signoff.',
    ],
  };
  const passed =
    report.bundle.verdict === 'pass' &&
    startup.every((row) => row.primary.verdict === 'pass' && row.lcp.verdict === 'pass') &&
    workloads.every((row) =>
      Object.values(row.queries).every(
        (query) =>
          query.submitToPaintOpportunity.verdict === 'pass' &&
          (!query.pageNavigation || query.pageNavigation.verdict === 'pass'),
      ),
    );
  report.labTargetsMet = passed;
  report.productionVerified = false;
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (args.includes('--check') && !passed) process.exitCode = 1;
} catch (error) {
  process.stderr.write(
    `${error instanceof Error ? error.stack : 'Performance measurement failed'}\n`,
  );
  process.exitCode = 2;
} finally {
  await browser?.close();
  if (server)
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  await vite?.close();
  if (scratch) await rm(scratch, { recursive: true, force: true });
}
