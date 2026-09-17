// Local-only full-source mobile-emulation observation; never publishes or creates a baseline.

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { link, mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { cpus, platform, release, totalmem } from 'node:os';
import { basename, extname, join, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { createGzip } from 'node:zlib';
import { chromium, devices } from '@playwright/test';
import preact from '@preact/preset-vite';
import { build } from 'vite';

const [profileArg, siteName = 'mobile-site', outputArg = 'mobile-measurement.json'] =
  process.argv.slice(2);
if (!profileArg || basename(siteName) !== siteName) {
  throw new Error('Usage: node mobile-profile.mjs PROFILE-DIRECTORY NEW-SITE-NAME OUTPUT-JSON');
}
const repo = process.cwd();
const profileRoot = resolve(profileArg);
const site = join(profileRoot, siteName);
const output = resolve(outputArg);
const harnessPath = join(repo, '.testagent/static-delivery-research/mobile-profile.mjs');
const profile = JSON.parse(await readFile(join(profileRoot, 'measurement.json'), 'utf8'));
const manifestPath = join(profileRoot, profile.manifestEntry.name);
const sha256File = async (path) => {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest('hex');
};
const relevantTreeIsClean = () => {
  try {
    execFileSync(
      'git',
      [
        'diff',
        '--quiet',
        'HEAD',
        '--',
        'src',
        'scripts',
        'package.json',
        'package-lock.json',
        'vite.config.ts',
      ],
      { cwd: repo },
    );
    return true;
  } catch {
    return false;
  }
};
const harnessSha256Before = await sha256File(harnessPath);
const relevantTreeCleanBefore = relevantTreeIsClean();

// Fail before browser work if any approved compact artifact changed.
const manifestStat = await stat(manifestPath);
if (
  manifestStat.size !== profile.manifestEntry.byteLength ||
  (await sha256File(manifestPath)) !== profile.manifestEntry.sha256
) {
  throw new Error('Compact manifest hash/length mismatch');
}
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
let verifiedBytes = manifestStat.size;
for (const entry of manifest.entries) {
  const path = join(profileRoot, entry.name);
  const file = await stat(path);
  if (file.size !== entry.byteLength || (await sha256File(path)) !== entry.sha256) {
    throw new Error(`Compact asset hash/length mismatch: ${entry.name}`);
  }
  verifiedBytes += file.size;
}
const assetFiles = await readdir(join(profileRoot, 'assets'));
if (assetFiles.length !== manifest.entries.length + 1) {
  throw new Error('Unexpected compact asset inventory');
}

const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim();
await stat(site).then(
  () => Promise.reject(new Error(`Refusing to reuse site: ${site}`)),
  () => undefined,
);
await build({
  configFile: false,
  base: './',
  logLevel: 'error',
  plugins: [
    preact(),
    {
      name: 'local-research-input',
      enforce: 'pre',
      resolveId(source, importer) {
        if (source === './demo-loader.js' && importer?.endsWith('/src/app/main.tsx')) {
          return '\0local-research-input';
        }
      },
      load(id) {
        if (id !== '\0local-research-input') return;
        return `import {createCompactPublicationLoader} from '/src/app/compact-publication-loader.ts';export const demoLoader=createCompactPublicationLoader(new URL(${JSON.stringify(profile.manifestEntry.name)},window.location.href).href);`;
      },
    },
  ],
  build: { outDir: site, emptyOutDir: true },
});
await mkdir(join(site, 'assets'), { recursive: true });
for (const name of assetFiles) {
  await link(join(profileRoot, 'assets', name), join(site, 'assets', name));
}
const builtCode = [];
for (const path of [
  join(site, 'index.html'),
  ...(await readdir(join(site, 'assets')))
    .filter((name) => /\.(?:css|js)$/.test(name))
    .map((name) => join(site, 'assets', name)),
]) {
  builtCode.push({
    path: path.slice(site.length + 1),
    byteLength: (await stat(path)).size,
    sha256: await sha256File(path),
  });
}

const serverEvidence = [];
const servers = [];
function makeLimiter(bytesPerSecond) {
  let next = performance.now();
  return async (bytes) => {
    next = Math.max(next, performance.now()) + (bytes * 1000) / bytesPerSecond;
    const delay = next - performance.now();
    if (delay > 0) await new Promise((done) => setTimeout(done, delay));
  };
}
async function startServer(mode, bytesPerSecond = null) {
  const limiter = bytesPerSecond ? makeLimiter(bytesPerSecond) : null;
  const evidence = { mode, bytesPerSecond, bodyBytesReleased: 0, requests: 0, completed: 0 };
  serverEvidence.push(evidence);
  const server = createServer(async (request, response) => {
    evidence.requests++;
    try {
      const pathname = new URL(request.url, 'http://local').pathname;
      const path = join(site, pathname === '/' ? 'index.html' : decodeURIComponent(pathname));
      await stat(path);
      response.setHeader(
        'Content-Type',
        {
          '.html': 'text/html',
          '.js': 'text/javascript',
          '.css': 'text/css',
          '.json': 'application/json',
        }[extname(path)] ?? 'application/octet-stream',
      );
      response.setHeader(
        'Cache-Control',
        path.endsWith('.html') ? 'no-cache' : 'public,max-age=31536000,immutable',
      );
      const gzip = createReadStream(path).pipe(createGzip());
      response.setHeader('Content-Encoding', 'gzip');
      for await (const chunk of gzip) {
        if (limiter) await limiter(chunk.length);
        if (response.destroyed) break;
        evidence.bodyBytesReleased += chunk.length;
        if (!response.write(chunk)) await new Promise((done) => response.once('drain', done));
      }
      if (!response.destroyed) {
        response.end();
        evidence.completed++;
      }
    } catch {
      if (!response.destroyed) response.writeHead(404).end();
    }
  });
  await new Promise((done) => server.listen(0, '127.0.0.1', done));
  servers.push(server);
  return `http://127.0.0.1:${server.address().port}/`;
}

const fullUrl = await startServer('full-unthrottled');
const slowUrl = await startServer('slow-censored', 200_000);
const host = await chromium.launchServer({ headless: true });
const browser = await chromium.connect(host.wsEndpoint());
let phase = 'startup';
let peakRssBytes = 0;
const rssSamples = [];
const sampleRss = () => {
  try {
    const rows = execFileSync('/bin/ps', ['-axo', 'pid=,ppid=,rss='], { encoding: 'utf8' })
      .trim()
      .split('\n')
      .map((row) => row.trim().split(/\s+/).map(Number));
    const rootPid = host.process()?.pid;
    if (!rootPid) return;
    const ids = new Set([rootPid]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const [pid, ppid] of rows) {
        if (ids.has(ppid) && !ids.has(pid)) {
          ids.add(pid);
          changed = true;
        }
      }
    }
    const rssBytes = rows
      .filter(([pid]) => ids.has(pid))
      .reduce((sum, row) => sum + row[2] * 1024, 0);
    peakRssBytes = Math.max(peakRssBytes, rssBytes);
    rssSamples.push({ phase, rssBytes, at: new Date().toISOString() });
  } catch {}
};
const rssTimer = setInterval(sampleRss, 1_000);
sampleRss();

const errors = [];
const initPage = async (page) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await cdp.send('Performance.enable');
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('requestfailed', (request) => errors.push(`request failed: ${request.url()}`));
  await page.addInitScript(() => {
    window.mobileEvidence = { messages: [], lcp: [] };
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) window.mobileEvidence.lcp.push(entry.startTime);
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    const NativeWorker = window.Worker;
    window.Worker = class extends NativeWorker {
      constructor(...args) {
        super(...args);
        this.addEventListener('message', (event) => {
          if (['ready', 'page', 'error'].includes(event.data?.kind)) {
            window.mobileEvidence.messages.push({ at: performance.now(), ...event.data });
          }
        });
      }
    };
  });
  return cdp;
};
const shellEvidence = async (page) => {
  await page.locator('h1').waitFor();
  await page.getByRole('searchbox').waitFor();
  return page.evaluate(async () => {
    const frame = () => new Promise((done) => requestAnimationFrame(done));
    await frame();
    await frame();
    const heading = document.querySelector('h1');
    const input = document.querySelector('input');
    if (
      !heading ||
      !input ||
      heading.getBoundingClientRect().height <= 0 ||
      input.getBoundingClientRect().height <= 0
    ) {
      throw new Error('Shell not laid out');
    }
    const primaryMs = performance.now();
    await new Promise((done) => setTimeout(done, 1_000));
    return {
      primaryMs,
      firstPaintMs: performance.getEntriesByName('first-paint')[0]?.startTime ?? null,
      firstContentfulPaintMs:
        performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? null,
      shellWindowLcpMs: window.mobileEvidence.lcp.at(-1) ?? null,
    };
  });
};

let fullLoad;
let slowNetwork;
try {
  phase = 'full-load';
  const context = await browser.newContext({ ...devices['Pixel 5'] });
  const page = await context.newPage();
  const cdp = await initPage(page);
  await page.goto(fullUrl, { waitUntil: 'domcontentloaded' });
  const shell = await shellEvidence(page);
  let ready = null;
  try {
    await page.waitForFunction(
      () => window.mobileEvidence.messages.some((item) => item.kind === 'ready'),
      null,
      { timeout: 180_000 },
    );
    ready = await page.evaluate(() =>
      window.mobileEvidence.messages.find((item) => item.kind === 'ready'),
    );
  } catch (error) {
    errors.push(`full-load timeout/error: ${error.message}`);
  }
  const searches = [];
  if (ready) {
    for (const query of ['강남구', '스타벅스', '테헤란로 123']) {
      phase = `search:${query}`;
      await page.getByRole('searchbox').fill(query);
      const beforeRequests = serverEvidence[0].requests;
      const result = await page.evaluate(async () => {
        const previous = window.mobileEvidence.messages.filter(
          (item) => item.kind === 'page',
        ).length;
        const start = performance.now();
        document.querySelector('form button[type=submit]')?.click();
        while (
          window.mobileEvidence.messages.filter((item) => item.kind === 'page').length <= previous
        ) {
          if (performance.now() - start > 120_000) throw new Error('Search timeout');
          await new Promise((done) => requestAnimationFrame(done));
        }
        await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
        const results = document.querySelector('#search-results');
        if (!results || results.getBoundingClientRect().height <= 0)
          throw new Error('Results not laid out');
        return {
          searchToPaintOpportunityMs: performance.now() - start,
          message: window.mobileEvidence.messages.filter((item) => item.kind === 'page').at(-1),
        };
      });
      result.query = query;
      result.networkRequests = serverEvidence[0].requests - beforeRequests;
      if (query === '강남구') {
        const beforePage = await page.evaluate(
          () => window.mobileEvidence.messages.filter((item) => item.kind === 'page').length,
        );
        const pageRequests = serverEvidence[0].requests;
        result.pagination = await page.evaluate(
          async ({ beforePage }) => {
            const button = [...document.querySelectorAll('button')].find(
              (item) => item.textContent === '다음 페이지',
            );
            if (!button) throw new Error('Next page button missing');
            const start = performance.now();
            button.click();
            while (
              window.mobileEvidence.messages.filter((item) => item.kind === 'page').length <=
              beforePage
            ) {
              if (performance.now() - start > 120_000) throw new Error('Pagination timeout');
              await new Promise((done) => requestAnimationFrame(done));
            }
            await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
            return { pageToPaintOpportunityMs: performance.now() - start };
          },
          { beforePage },
        );
        result.pagination.networkRequests = serverEvidence[0].requests - pageRequests;
      }
      searches.push(result);
    }
  }
  const metrics = await cdp.send('Performance.getMetrics');
  fullLoad = {
    status: ready ? 'ready' : 'timed-out-or-error',
    shell,
    ready,
    postSearchLatestObservedLcpMs: await page.evaluate(
      () => window.mobileEvidence.lcp.at(-1) ?? null,
    ),
    searches,
    pageTargetMetrics: Object.fromEntries(
      metrics.metrics.map((metric) => [metric.name, metric.value]),
    ),
  };
  await context.close();

  phase = 'slow-network';
  const slowContext = await browser.newContext({ ...devices['Pixel 5'] });
  const slowPage = await slowContext.newPage();
  await initPage(slowPage);
  const started = performance.now();
  await slowPage.goto(slowUrl, { waitUntil: 'domcontentloaded' });
  const slowShell = await shellEvidence(slowPage);
  const remaining = Math.max(0, 60_000 - (performance.now() - started));
  await slowPage.waitForTimeout(remaining);
  slowNetwork = {
    status: (await slowPage.evaluate(() =>
      window.mobileEvidence.messages.some((item) => item.kind === 'ready'),
    ))
      ? 'ready'
      : 'censored-not-ready',
    censoredAtMs: performance.now() - started,
    shell: slowShell,
    releasedGzipBodyBytes: serverEvidence[1].bodyBytesReleased,
    requestsStarted: serverEvidence[1].requests,
    requestsCompleted: serverEvidence[1].completed,
  };
  await slowContext.close();
} finally {
  clearInterval(rssTimer);
  sampleRss();
  await browser.close();
  await host.close();
  for (const server of servers) {
    server.closeAllConnections();
    await new Promise((done) => server.close(done));
  }
}

const result = {
  schemaVersion: 1,
  kind: 'task-008-full-source-mobile-emulation',
  recordedAt: new Date().toISOString(),
  publicationApproved: false,
  gitHead: head,
  source: profile.source,
  compactAssets: {
    manifest: profile.manifestEntry,
    entryCount: manifest.entries.length,
    fileCount: assetFiles.length,
    verifiedBytes,
    verification:
      'Every manifest and entry byte length and SHA-256 verified before build/browser launch.',
  },
  provenance: {
    harnessSha256Before,
    harnessSha256After: await sha256File(harnessPath),
    relevantTreeCleanBefore,
    relevantTreeCleanAfter: relevantTreeIsClean(),
    builtCode,
  },
  environment: {
    node: process.version,
    browser: browser.version(),
    platform: platform(),
    release: release(),
    cpu: cpus()[0]?.model ?? null,
    logicalCpus: cpus().length,
    memoryBytes: totalmem(),
    device: 'Playwright Pixel 5 viewport/device emulation',
    pageCpuThrottlingRate: 4,
    workerCpuThrottleCoverage: 'not established; CDP rate was attached to the page target',
  },
  budgets: { shellPrimaryAndLcpMs: 2_500, postLoadSearchAndPagingMs: 500 },
  methodology: {
    serving: 'loopback HTTP with dynamic gzip; fresh contexts',
    shell:
      'laid-out heading and input plus two animation frames; LCP has a fixed 1,000 ms noninteractive shell window',
    search:
      'submit/page message, laid-out results and two animation frames; excludes typing and pixel presentation',
    memory:
      'one-second browser process-tree RSS sum; may double-count shared pages and is not JS heap or device memory',
    slowNetwork:
      'server-side aggregate compressed-body throttle at 200,000 B/s; observation censored at 60 seconds',
  },
  fullLoad,
  slowNetwork,
  serverEvidence,
  processMemory: { peakBrowserTreeRssBytes: peakRssBytes, samples: rssSamples },
  errors,
};
await writeFile(output, `${JSON.stringify(result, null, 2)}\n`);
console.log(
  JSON.stringify({
    output,
    fullLoad: fullLoad.status,
    slowNetwork: slowNetwork.status,
    peakRssBytes,
  }),
);
