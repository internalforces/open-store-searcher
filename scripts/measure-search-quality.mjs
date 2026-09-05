import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

let server;
try {
  const args = process.argv.slice(2);
  if (
    args.length > 2 ||
    new Set(args).size !== args.length ||
    args.some((arg) => !['--check', '--source'].includes(arg))
  ) {
    throw new Error('Usage: npm run quality:search -- [--source] [--check]');
  }
  const root = new URL('../', import.meta.url);
  const corpusPath = args.includes('--source')
    ? 'tests/fixtures/search/seoul-source-quality.json'
    : 'tests/fixtures/search/seoul-quality.json';
  const corpusBytes = await readFile(new URL(corpusPath, root));
  const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
  const corpusSha256 = hash(corpusBytes);
  let sourceAuditSha256 = null;
  if (args.includes('--source')) {
    const auditBytes = await readFile(
      new URL('tests/fixtures/search/seoul-source-audit.json', root),
    );
    const audit = JSON.parse(auditBytes.toString('utf8'));
    // Formatted bytes have their own binding; never fall back after a formatted mismatch.
    const expected = audit?.formattedFixtureSha256 ?? audit?.corpusSha256;
    if (
      typeof expected !== 'string' ||
      !/^[a-f0-9]{64}$/u.test(expected) ||
      expected !== corpusSha256
    ) {
      throw new Error('Source corpus digest does not match audit');
    }
    sourceAuditSha256 = hash(auditBytes);
  }
  const paths = [
    'src/search/prepare-search-query.ts',
    'src/search/interpret-search-query.ts',
    'src/search/compare-search-address.ts',
    'src/search/search-candidates.ts',
    'tests/quality/evaluate-search-quality.ts',
    'scripts/measure-search-quality.mjs',
    'package-lock.json',
  ];
  const implementationSha256 = Object.fromEntries(
    await Promise.all(paths.map(async (path) => [path, hash(await readFile(new URL(path, root)))])),
  );
  server = await createServer({
    root: fileURLToPath(root),
    configFile: false,
    appType: 'custom',
    optimizeDeps: { noDiscovery: true, include: [] },
    logLevel: 'silent',
    server: { middlewareMode: true, watch: null, ws: false },
  });
  const { evaluateSearchQuality } = await server.ssrLoadModule(
    '/tests/quality/evaluate-search-quality.ts',
  );
  const result = evaluateSearchQuality(JSON.parse(corpusBytes.toString('utf8')));
  const report = {
    schemaVersion: 1,
    runtime: { node: process.version, icu: process.versions.icu },
    corpusSha256,
    sourceAuditSha256,
    implementationSha256,
    result,
  };
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (args.includes('--check') && !result.checkPassed) process.exitCode = 1;
} catch (error) {
  process.stderr.write(
    `${error instanceof Error ? error.message : 'Quality measurement failed'}\n`,
  );
  process.exitCode = 2;
} finally {
  await server?.close();
}
