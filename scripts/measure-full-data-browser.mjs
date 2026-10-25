// Private loopback diagnostics only; never publishes or records user searches.
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { cpus, totalmem } from 'node:os';
import { extname, join, resolve, sep } from 'node:path';
import { chromium, devices } from '@playwright/test';

const [siteArgument, reportArgument] = process.argv.slice(2);
assert(
  siteArgument && reportArgument && process.argv.length === 4,
  'Usage: node scripts/measure-full-data-browser.mjs VERIFIED-SITE NEW-REPORT.json',
);
const site = resolve(siteArgument);
const reportPath = resolve(reportArgument);
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
const inputs = {};
async function inventory(directory, prefix = '') {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const name = prefix + entry.name;
    if (entry.isDirectory()) await inventory(join(directory, entry.name), `${name}/`);
    else {
      assert(entry.isFile() && !entry.isSymbolicLink(), 'Regular site files required');
      const hash = createHash('sha256');
      let byteLength = 0;
      for await (const chunk of createReadStream(join(site, name))) {
        byteLength += chunk.length;
        hash.update(chunk);
      }
      inputs[name] = { byteLength, sha256: hash.digest('hex') };
    }
  }
}
await inventory(site);
const release = JSON.parse(await readFile(join(site, 'release.json'), 'utf8'));
const rootPrefix = '/open-store-searcher/';
const requests = [];
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    const relative = decodeURIComponent(url.pathname).slice(rootPrefix.length) || 'index.html';
    const path = resolve(site, relative);
    if (!url.pathname.startsWith(rootPrefix) || !path.startsWith(site + sep) || !inputs[relative]) {
      response.writeHead(404).end();
      return;
    }
    requests.push({ path: relative, bytes: inputs[relative].byteLength });
    response.writeHead(200, {
      'Content-Type':
        {
          '.html': 'text/html',
          '.js': 'text/javascript',
          '.css': 'text/css',
          '.json': 'application/json',
        }[extname(path)] ?? 'application/octet-stream',
      'Content-Length': (await stat(path)).size,
      'Cache-Control': 'public, max-age=3600',
    });
    createReadStream(path)
      .on('error', () => response.destroy())
      .pipe(response);
  } catch {
    response.writeHead(500).end();
  }
});
await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolve);
});
const origin = `http://127.0.0.1:${server.address().port}`;
const report = {
  version: 1,
  kind: 'full-data-browser-loopback-diagnostic',
  recordedAt: new Date().toISOString(),
  publicationApproved: false,
  physicalDevice: false,
  environment: {
    platform: process.platform,
    node: process.version,
    cpu: cpus()[0].model,
    logicalCpus: cpus().length,
    memoryBytes: totalmem(),
  },
  helperSha256: digest(await readFile(new URL(import.meta.url))),
  release,
  siteBindings: inputs,
  initialCodeBytes: Object.entries(inputs)
    .filter(([name]) => /\.(html|css|js)$/.test(name))
    .reduce((sum, [, binding]) => sum + binding.byteLength, 0),
  profiles: [],
  errors: [],
  limitations: [
    'Local static HTTP and desktop emulation do not establish hosted or physical-mobile acceptance.',
    'CPU throttling applies to the page CDP session; Worker throttling is not independently verified.',
    'Two animation frames and layout are diagnostic paint opportunities, not physical paint proof.',
    'Main-page JS heap excludes the search Worker and is not total browser memory.',
    'One cold load and one warm reload per profile are diagnostic samples, not percentiles.',
  ],
};
async function browserProcessMemory() {
  const processes = [];
  const unavailable = [];
  try {
    const { stdout } = await promisify(execFile)('ps', ['-e', '-o', 'pid=,ppid=,rss=,comm=']);
    const rows = stdout
      .trim()
      .split('\n')
      .map((line) => {
        const [pid, parent, rss, command] = line.trim().split(/\s+/);
        return [Number(pid), Number(parent), Number(rss), command];
      });
    const descendants = new Set([process.pid]);
    for (let pass = 0; pass < rows.length; pass++) {
      const before = descendants.size;
      for (const [pid, parent] of rows) if (descendants.has(parent)) descendants.add(pid);
      if (descendants.size === before) break;
    }
    for (const [pid, , rssKiB, command] of rows) {
      if (pid === process.pid || !descendants.has(pid) || command === 'ps') continue;
      let pssBytes = null;
      try {
        const memory = await readFile(`/proc/${pid}/smaps_rollup`, 'utf8');
        const value = memory.match(/^Pss:\s+(\d+)/m)?.[1];
        if (value !== undefined) pssBytes = Number(value) * 1024;
      } catch (error) {
        unavailable.push({ pid, metric: 'PSS', code: error.code });
      }
      processes.push({ pid, rssBytes: rssKiB * 1024, pssBytes });
    }
  } catch (error) {
    unavailable.push({ metric: 'process inventory', code: error.code });
  }
  return {
    scope:
      'descendants of the diagnostic Node process; instantaneous, not peak; excludes ps sampler',
    processes,
    unavailable,
    totalRssBytes: processes.length ? processes.reduce((sum, p) => sum + p.rssBytes, 0) : null,
    totalPssBytes:
      processes.length && processes.every((p) => p.pssBytes !== null)
        ? processes.reduce((sum, p) => sum + p.pssBytes, 0)
        : null,
    caveat:
      'RSS double-counts shared pages; PSS apportions them. Processes may exit during sampling.',
  };
}

let browser;
try {
  browser = await chromium.launch(
    process.env.FULL_DATA_BROWSER_EXECUTABLE
      ? { executablePath: process.env.FULL_DATA_BROWSER_EXECUTABLE }
      : {},
  );
  report.environment.browser = browser.version();
  report.environment.executable = process.env.FULL_DATA_BROWSER_EXECUTABLE ?? 'playwright-pinned';
  for (const profile of [
    { name: 'desktop', cpuRate: 1, mobile: false },
    { name: 'mobile-emulated', cpuRate: 4, mobile: true },
  ]) {
    const context = await browser.newContext(profile.mobile ? devices['Pixel 5'] : {});
    const page = await context.newPage();
    page.on('pageerror', (error) => report.errors.push(error.message));
    page.on('crash', () => report.errors.push(`${profile.name}: renderer crashed`));
    page.on('request', (request) => {
      if (new URL(request.url()).origin !== origin)
        report.errors.push('Unexpected nonlocal request');
    });
    const cdp = await context.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: profile.cpuRate });
    await cdp.send('Network.enable');
    await cdp.send('Performance.enable');
    await page.addInitScript(() => {
      window.__fullDataLab = { lcp: null, submissions: [], ready: [] };
      const OriginalWorker = window.Worker;
      window.Worker = class extends OriginalWorker {
        constructor(...args) {
          super(...args);
          this.addEventListener('message', ({ data }) => {
            if (data?.kind === 'ready') {
              window.__fullDataLab.ready.push({
                recordCount: data.recordCount,
                manifestHash: data.manifestHash,
                timings: data.timings,
              });
            }
          });
        }
      };
      new PerformanceObserver((list) => {
        window.__fullDataLab.lcp = list.getEntries().at(-1).startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });
      document.addEventListener(
        'submit',
        () => {
          const started = performance.now();
          const current = document.querySelector('#business-query').value;
          const observer = new MutationObserver(() => {
            const region = document.querySelector('#search-results');
            if (
              region?.getAttribute('aria-busy') !== 'false' ||
              !region.querySelector('.submitted-query')?.textContent.includes(current)
            )
              return;
            observer.disconnect();
            requestAnimationFrame(() =>
              requestAnimationFrame(() => {
                const box = region.getBoundingClientRect();
                window.__fullDataLab.submissions.push({
                  elapsedMs: performance.now() - started,
                  candidateCount: Number(region.dataset.totalCandidates),
                  articles: region.querySelectorAll('article').length,
                  hasLayout: box.width > 0 && box.height > 0,
                });
              }),
            );
          });
          observer.observe(document.body, { subtree: true, childList: true, attributes: true });
        },
        true,
      );
    });
    const result = { ...profile, network: 'loopback-unthrottled', loads: [], searches: [] };
    report.profiles.push(result);
    try {
      for (const cache of ['cold', 'warm']) {
        process.stderr.write(`${profile.name}: ${cache} full-data load\n`);
        await cdp.send('Network.setCacheDisabled', { cacheDisabled: false });
        if (cache === 'cold') await cdp.send('Network.clearBrowserCache');
        const firstRequest = requests.length;
        await page.goto(origin + rootPrefix, { waitUntil: 'domcontentloaded', timeout: 60_000 });
        await page.waitForFunction(
          () => {
            const button = document.querySelector('.search-button');
            return button && !button.disabled;
          },
          null,
          { timeout: 300_000 },
        );
        const load = await page.evaluate(() => ({
          readyMs: performance.now(),
          lcpMs: window.__fullDataLab.lcp,
          workerReadiness: window.__fullDataLab.ready,
          resources: performance.getEntriesByType('resource').map((r) => ({
            path: new URL(r.name).pathname,
            transferSize: r.transferSize,
            duration: r.duration,
          })),
          warnings: document.querySelector('.data-state')?.textContent,
        }));
        const metrics = await cdp.send('Performance.getMetrics');
        if (release.kind === 'validated-staging') {
          assert.equal(
            load.workerReadiness.length,
            1,
            'Exactly one complete Worker snapshot required',
          );
          assert.equal(
            load.workerReadiness[0].recordCount,
            release.recordCount,
            'Worker row count must match the verified release',
          );
          assert(
            release.entries.some((entry) =>
              entry.name.includes(load.workerReadiness[0].manifestHash),
            ),
            'Worker manifest must match the verified release',
          );
        }
        result.loads.push({
          cache,
          ...load,
          mainPageJsHeapBytes: metrics.metrics.find((m) => m.name === 'JSHeapUsedSize')?.value,
          serverRequests: requests.slice(firstRequest),
          browserProcesses: await browserProcessMemory(),
        });
      }
      for (const fixture of [
        { id: 'broad-district', query: '강남구' },
        { id: 'partial-address', query: '테헤란로' },
        { id: 'business-name', query: '스타벅스' },
        { id: 'absence-intent', query: '존재하지않는고정검증상호XYZ' },
      ]) {
        for (let repetition = 0; repetition < 3; repetition++) {
          const index = result.searches.length;
          await page.getByRole('searchbox').fill(fixture.query);
          await page.getByRole('searchbox').press('Enter');
          await page.waitForFunction(
            (index) => window.__fullDataLab.submissions.length > index,
            index,
            { timeout: 60_000 },
          );
          const sample = await page.evaluate(
            (index) => window.__fullDataLab.submissions[index],
            index,
          );
          result.searches.push({ fixtureId: fixture.id, repetition, ...sample });
          process.stderr.write(`${profile.name}: ${fixture.id} ${sample.elapsedMs.toFixed(1)}ms\n`);
        }
      }
    } catch (error) {
      result.error = error.message;
      result.failureMemory = await browserProcessMemory();
    } finally {
      await context.close();
    }
  }
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, { flag: 'wx' });
}
