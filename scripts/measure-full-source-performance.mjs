// Isolated hosted diagnostic only. Never attach to a user's browser or phone.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, resolve } from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { chromium, devices } from '@playwright/test';
import {
  assessFullSourceSamples,
  fullSourceFixtures,
  measureFixture,
  requirePreparedInventory,
  resolveMeasuredAsset,
} from './full-source-performance-support.mjs';
import { identityOf, readJson, trustedCode } from './publication-operator-support.mjs';

const [preparedPath, siteArgument, outputArgument] = process.argv.slice(2);
if (!preparedPath || !siteArgument || !outputArgument || process.argv.length !== 5)
  throw new Error(
    'Usage: node scripts/measure-full-source-performance.mjs PREPARED SITE NEW-OUTPUT',
  );
assert.equal(
  process.env.GITHUB_ACTIONS,
  'true',
  'This runner requires the approved hosted test environment',
);
assert.equal(process.platform, 'linux');
assert.equal(process.version, 'v24.19.0');
const site = resolve(siteArgument),
  output = resolve(outputArgument);
await mkdir(output, { recursive: false });
const report = {
  version: 1,
  kind: 'full-retained-source-hosted-performance-diagnostic',
  recordedAt: new Date().toISOString(),
  node: process.version,
  githubRunId: process.env.GITHUB_RUN_ID,
  githubSha: process.env.GITHUB_SHA,
  samples: [],
  browserErrors: [],
  memorySamples: [],
  limitations: [
    'Hosted loopback delivery is not GitHub Pages delivery or physical-device evidence.',
    'Mobile viewport and main-thread CPU rate are explicit; Worker throttle coverage is unverified.',
    'One cold/warm observation per profile; ranges are descriptive, not percentiles.',
    'Primary means visible heading/input; full searchable readiness is recorded separately.',
    'Two animation frames and layout checks are paint opportunities, not physical-screen paint proof.',
    'Memory is sampled RSS of CDP-reported browser processes, not a continuous whole-system maximum.',
    'Diagnostic tracing adds overhead; event durations may overlap and are not additive CPU time.',
  ],
  physicalDeviceVerified: false,
  publicationApproved: false,
};
let server;
try {
  const prepared = await readJson(join(preparedPath, 'preparation.json'), 16 * 1024 * 1024);
  assert.equal(prepared.kind, 'initial-publication-prepared');
  assert.equal(prepared.mode, 'local-proof');
  assert.equal(prepared.operator.commit, process.env.GITHUB_SHA);
  assert.equal(prepared.operator.uncommitted, false);
  for (const [name, expected] of Object.entries(prepared.operator.codeBindings)) {
    const bytes = await readFile(name);
    assert.deepEqual(
      { byteLength: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') },
      expected,
      name,
    );
  }
  const verified = await trustedCode(async (load) =>
    (await load('verify-publication-directory')).verifyPublicationDirectory(site),
  );
  assert.deepEqual(identityOf(verified), prepared.identity);
  requirePreparedInventory(verified.inventory, prepared.inventory);
  assert.equal(verified.recordCount, 2951024);
  assert.equal(
    verified.archiveSha256,
    'c90758c2d3922e78d636ab2c9967b80c690bdcd8aeca283cf9f6ecc2cc992352',
  );
  report.identity = prepared.identity;
  report.operator = prepared.operator;
  report.inventorySha256 = verified.inventorySha256;
  const assets = new Map(verified.inventory.files.map((file) => [file.name, file]));
  report.codeBytes = verified.inventory.files
    .filter((file) => /\.(html|css|js)$/.test(file.name))
    .reduce((sum, file) => sum + file.byteLength, 0);
  server = createServer((request, response) => {
    const name = resolveMeasuredAsset(request.url, assets);
    if (!name || !['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(404).end();
      return;
    }
    const entry = assets.get(name);
    response.writeHead(200, {
      'Content-Type':
        {
          '.html': 'text/html',
          '.js': 'text/javascript',
          '.css': 'text/css',
          '.json': 'application/json',
        }[extname(name)] ?? 'application/octet-stream',
      'Content-Length': entry.byteLength,
      'Cache-Control': 'public, max-age=3600',
    });
    if (request.method === 'HEAD') {
      response.end();
      return;
    }
    const stream = createReadStream(join(site, name));
    stream.on('error', () => response.destroy());
    response.on('close', () => stream.destroy());
    stream.pipe(response);
  });
  await new Promise((accept, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', accept);
  });
  const origin = `http://127.0.0.1:${server.address().port}`;
  for (const profile of ['desktop', 'mobile-main-thread-4x']) {
    const browser = await chromium.launch();
    const context = await browser.newContext(profile === 'desktop' ? {} : devices['Pixel 5']);
    try {
      const page = await context.newPage();
      let requestCount = 0;
      context.on('request', (request) => {
        requestCount++;
        if (new URL(request.url()).origin !== origin)
          report.browserErrors.push('Unexpected nonlocal request');
      });
      page.on('pageerror', () => report.browserErrors.push('Browser application error'));
      const cdp = await context.newCDPSession(page);
      await cdp.send('Network.enable');
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: profile === 'desktop' ? 1 : 4 });
      await page.addInitScript(() => {
        const evidence = {
          primaryMs: null,
          lcpMs: null,
          ready: null,
          replies: [],
          submittedAt: null,
        };
        window.fullSourceDiagnostic = evidence;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) evidence.lcpMs = entry.startTime;
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        const primary = () => {
          if (evidence.primaryMs !== null) return;
          const heading = document.querySelector('h1'),
            input = document.querySelector('#business-query');
          if (
            heading?.getBoundingClientRect().height > 0 &&
            input?.getBoundingClientRect().height > 0
          )
            evidence.primaryMs = performance.now();
          else requestAnimationFrame(primary);
        };
        requestAnimationFrame(primary);
        document.addEventListener(
          'submit',
          () => {
            evidence.submittedAt = performance.now();
          },
          true,
        );
        const OriginalWorker = window.Worker;
        window.Worker = class extends OriginalWorker {
          constructor(...args) {
            super(...args);
            this.addEventListener('message', (event) => {
              const reply = event.data;
              if (reply.kind === 'ready')
                evidence.ready = {
                  at: performance.now(),
                  recordCount: reply.recordCount,
                  manifestSha256: reply.manifestHash,
                  visible: document.visibilityState === 'visible',
                  timings: reply.timings,
                };
              if (reply.kind !== 'page') return;
              const submittedAt = evidence.submittedAt;
              const repliedAt = performance.now();
              const visible = document.visibilityState === 'visible';
              requestAnimationFrame(() =>
                requestAnimationFrame(() => {
                  const box = document.getElementById('search-results')?.getBoundingClientRect();
                  evidence.replies.push({
                    elapsedMs: performance.now() - submittedAt,
                    workerReplyMs: repliedAt - submittedAt,
                    renderOpportunityMs: performance.now() - repliedAt,
                    visible: visible && document.visibilityState === 'visible',
                    resultRegionHasLayout: Boolean(box && box.width > 0 && box.height > 0),
                    eligibleCount: reply.result.eligibleCount,
                    similarCount: reply.result.similarCount,
                  });
                }),
              );
            });
          }
        };
      });
      for (const cache of ['cold', 'warm']) {
        const row = { profile, cache, iteration: 0, searches: [] };
        report.samples.push(row);
        if (cache === 'cold') await cdp.send('Network.clearBrowserCache');
        await page.goto(`${origin}/open-store-searcher/`, {
          waitUntil: 'domcontentloaded',
          timeout: 30000,
        });
        const trace = [];
        let tracing = false;
        const collectTrace = ({ value }) => {
          for (const event of value) {
            if (
              (event.ph === 'X' && event.dur >= 1000) ||
              event.name?.startsWith('task009-') ||
              (event.ph === 'M' && event.name === 'thread_name')
            )
              trace.push({
                name: event.name,
                ph: event.ph,
                ts: event.ts,
                dur: event.dur,
                pid: event.pid,
                tid: event.tid,
                threadName: event.name === 'thread_name' ? event.args?.name : undefined,
              });
          }
        };
        try {
          await page.waitForFunction(() => Boolean(window.fullSourceDiagnostic?.ready), undefined, {
            timeout: 120000,
          });
          await page.locator('button[type=submit]').waitFor({ state: 'visible' });
          await page.waitForTimeout(1000);
          const initial = await page.evaluate(() => ({
            ...window.fullSourceDiagnostic.ready,
            primaryMs: window.fullSourceDiagnostic.primaryMs,
            preInteractionLcpMs: window.fullSourceDiagnostic.lcpMs,
          }));
          Object.assign(row, initial, { readyMs: initial.at });
          cdp.on('Tracing.dataCollected', collectTrace);
          await cdp.send('Tracing.start', {
            categories: 'devtools.timeline,v8,blink.user_timing',
            transferMode: 'ReportEvents',
          });
          tracing = true;
          for (const fixture of fullSourceFixtures) {
            await measureFixture(row.searches, fixture.id, async (repetition) => {
              const count = await page.evaluate(() => window.fullSourceDiagnostic.replies.length);
              await page.locator('#business-query').fill(fixture.value);
              const before = requestCount;
              const marker = `task009-${fixture.id}-${repetition}`;
              await page.evaluate((marker) => performance.mark(`${marker}-start`), marker);
              await page.locator('button[type=submit]').click();
              await page.waitForFunction(
                (count) => window.fullSourceDiagnostic.replies.length === count + 1,
                count,
                { timeout: 30000 },
              );
              const measured = await page.evaluate(() =>
                window.fullSourceDiagnostic.replies.at(-1),
              );
              await page.evaluate((marker) => performance.mark(`${marker}-end`), marker);
              return { ...measured, requestDelta: requestCount - before };
            });
          }
          const processCdp = await browser.newBrowserCDPSession();
          try {
            const { processInfo } = await processCdp.send('SystemInfo.getProcessInfo');
            const rss = [];
            for (const process of processInfo) {
              const text = await readFile(`/proc/${process.id}/status`, 'utf8').catch(() => '');
              const match = text.match(/^VmRSS:\s+(\d+) kB$/m);
              if (match) rss.push(Number(match[1]) * 1024);
            }
            assert.ok(rss.length > 0, 'Browser RSS evidence unavailable');
            report.memorySamples.push({
              profile,
              cache,
              reportedProcessCount: processInfo.length,
              readableProcessCount: rss.length,
              rssBytes: rss.reduce((sum, value) => sum + value, 0),
            });
          } finally {
            await processCdp.detach();
          }
        } catch (error) {
          row.error = error.name;
          row.readyMs ??= null;
        } finally {
          if (tracing) {
            const complete = new Promise((accept) => cdp.once('Tracing.tracingComplete', accept));
            await cdp.send('Tracing.end');
            const { dataLossOccurred } = await complete;
            row.trace = {
              dataLossOccurred,
              threads: trace.filter((event) => event.threadName),
              markers: trace.filter((event) => event.name.startsWith('task009-')),
              longestEvents: trace
                .filter((event) => event.ph === 'X')
                .sort((left, right) => right.dur - left.dur)
                .slice(0, 40),
            };
          }
          cdp.off('Tracing.dataCollected', collectTrace);
        }
      }
    } finally {
      try {
        await context.close();
      } finally {
        await browser.close();
      }
    }
  }
  const after = await trustedCode(async (load) =>
    (await load('verify-publication-directory')).verifyPublicationDirectory(site),
  );
  assert.ok(isDeepStrictEqual(verified, after), 'Measured site bytes changed');
  report.assessment = assessFullSourceSamples(report.samples, verified, 1);
  if (report.codeBytes > 300000 || report.browserErrors.length || !report.assessment.budgetsMet)
    process.exitCode = 1;
} catch (error) {
  report.error = { name: error.name, message: error.message };
  process.exitCode = 1;
} finally {
  if (server) {
    server.closeAllConnections();
    await new Promise((accept) => server.close(accept));
  }
  report.diagnosticPassed =
    !report.error &&
    report.assessment?.budgetsMet === true &&
    report.codeBytes <= 300000 &&
    report.browserErrors.length === 0;
  if (!report.diagnosticPassed) process.exitCode = 1;
  await writeFile(join(output, 'measurement.json'), `${JSON.stringify(report, null, 2)}\n`, {
    flag: 'wx',
  });
  // Keep fixed-fixture diagnostics readable when binary artifact transfer is unavailable.
  console.log(`TASK009_DIAGNOSTIC_REPORT ${JSON.stringify(report)}`);
  console.log(
    JSON.stringify({
      output,
      diagnosticPassed: report.diagnosticPassed,
      physicalDeviceVerified: false,
      publicationApproved: false,
    }),
  );
}
