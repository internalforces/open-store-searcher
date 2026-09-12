// Local actual-data laboratory. No publication and no search/click collection.
import { createReadStream } from 'node:fs';
import { readFile, stat, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { performance } from 'node:perf_hooks';
import { chromium } from '@playwright/test';
import { createServer } from 'vite';
const [researchPath, reportPath] = process.argv.slice(2);
if (!researchPath || !reportPath || process.argv.length !== 4)
  throw new Error(
    'Usage: node scripts/measure-source-browser.mjs RESEARCH-directory NEW-report.json',
  );
const observation = JSON.parse(await readFile(join(researchPath, 'observation.json'), 'utf8'));
if (observation.kind !== 'bounded-source-observation' || observation.publicationApproved !== false)
  throw new Error('Research dataset required');
const datasetPath = resolve(researchPath, 'dataset.json');
const size = (await stat(datasetPath)).size;
let transferred = 0;
const vite = await createServer({
  configFile: false,
  appType: 'custom',
  logLevel: 'error',
  server: { host: '127.0.0.1', port: 0, watch: null, ws: false },
  plugins: [
    {
      name: 'source-browser-lab',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/observed-dataset.json') {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Length', String(size));
            const stream = createReadStream(datasetPath);
            stream.on('data', (bytes) => {
              transferred += bytes.length;
            });
            stream.on('error', (error) => res.destroy(error));
            res.on('close', () => stream.destroy());
            stream.pipe(res);
            return;
          }
          if (req.url === '/source-lab') {
            res.setHeader('Content-Type', 'text/html');
            res.end(`<!doctype html><html><body><p>Actual data loading laboratory</p><script type="module">
          import {createPublicationLoader} from '/src/app/publication-loader.ts';
          import {prepareDisplayData} from '/src/app/prepare-display-data.ts';
          window.lab = {phase:'loading'};
          const started = performance.now();
          try {
            const value = await createPublicationLoader('/observed-dataset.json').load();
            const loadedMs = performance.now()-started;
            // The real useDisplayData hook prepares the loader result a second time.
            const prepared = prepareDisplayData(value);
            window.lab = {phase:'ready',loadedMs,totalMs:performance.now()-started,records:prepared.dataset.records.length};
          } catch(error) { window.lab = {phase:'error',message:error.message,totalMs:performance.now()-started}; }
        </script></body></html>`);
            return;
          }
          next();
        });
      },
    },
  ],
});
let browser;
const started = performance.now();
let result = { phase: 'not-started' };
try {
  await vite.listen();
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on('crash', () => {
    result = { phase: 'renderer-crashed' };
  });
  await page.goto(`${vite.resolvedUrls.local[0]}source-lab`);
  try {
    await page.waitForFunction(() => window.lab && window.lab.phase !== 'loading', null, {
      timeout: 180000,
    });
    result = await page.evaluate(() => window.lab);
  } catch (error) {
    if (result.phase !== 'renderer-crashed')
      result = { phase: 'timeout-or-error', message: error.message };
  }
  const report = {
    version: 1,
    kind: 'actual-source-browser-lab',
    publicationApproved: false,
    platform: process.platform,
    node: process.version,
    browser: browser.version(),
    profile: 'desktop-loopback-unthrottled',
    archiveSha256: observation.archiveSha256,
    recordCount: observation.recordCount,
    datasetBytes: size,
    transferredBytes: transferred,
    elapsedMs: Math.round(performance.now() - started),
    result,
  };
  await writeFile(resolve(reportPath), `${JSON.stringify(report, null, 2)}\n`, { flag: 'wx' });
  console.log(JSON.stringify(report));
} finally {
  await browser?.close();
  await vite.close();
}
