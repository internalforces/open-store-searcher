import { readFile, realpath, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

// Research command: explicit operational limits, aggregate output, no policy or publication flags.
let server;
let archivePath;
try {
  const names = [
    'staging',
    'output',
    'max-bytes',
    'max-rows',
    'max-record-chars',
    'timeout-ms',
    'max-rss-bytes',
  ];
  const { values, tokens } = parseArgs({
    options: Object.fromEntries(names.map((n) => [n, { type: 'string' }])),
    tokens: true,
  });
  if (tokens.length !== names.length || new Set(tokens.map((t) => t.name)).size !== names.length)
    throw new Error('invalid arguments');
  const repositoryRoot = await realpath(fileURLToPath(new URL('../', import.meta.url)));
  const external = (path) => {
    const rel = relative(repositoryRoot, path);
    return rel === '..' || rel.startsWith('../') || isAbsolute(rel);
  };
  const stagingRoot = values.staging;
  const outputPath = values.output;
  if (
    !isAbsolute(stagingRoot) ||
    resolve(stagingRoot) !== stagingRoot ||
    !isAbsolute(outputPath) ||
    resolve(outputPath) !== outputPath ||
    !external(await realpath(stagingRoot)) ||
    !external(await realpath(dirname(outputPath)))
  )
    throw new Error('invalid paths');
  try {
    await stat(outputPath);
    throw new Error('output exists');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const { createServer } = await import('vite');
  server = await createServer({
    root: repositoryRoot,
    configFile: false,
    appType: 'custom',
    logLevel: 'silent',
  });
  const { parseObservationLimits } = await server.ssrLoadModule(
    '/src/pipeline/observation-limits.ts',
  );
  const limits = parseObservationLimits(values);
  const [
    { collectSeoulArchive },
    { DEFAULT_COLLECTOR_LIMITS },
    { parseArchiveContract },
    { parsePermissionManifest },
    { observeLicenseArchive },
  ] = await Promise.all([
    server.ssrLoadModule('/src/pipeline/collect-seoul-archive.ts'),
    server.ssrLoadModule('/src/pipeline/collector-types.ts'),
    server.ssrLoadModule('/src/pipeline/archive-contract.ts'),
    server.ssrLoadModule('/src/pipeline/source-contract.ts'),
    server.ssrLoadModule('/src/pipeline/observe-license-archive.ts'),
  ]);
  const collection = await collectSeoulArchive({
    stagingRoot,
    fetchedAt: new Date().toISOString(),
    limits: DEFAULT_COLLECTOR_LIMITS,
  });
  if (collection.kind === 'accepted') archivePath = collection.archivePath;
  const archiveContract = parseArchiveContract(
    JSON.parse(
      await readFile(
        new URL('../src/pipeline/contracts/seoul-archive-contract.json', import.meta.url),
        'utf8',
      ),
    ),
  );
  const permissionManifest = parsePermissionManifest(
    JSON.parse(
      await readFile(
        new URL('../reports/source-permission-manifest-2026-08-28.json', import.meta.url),
        'utf8',
      ),
    ),
  );
  const report = await observeLicenseArchive({
    collection,
    archiveContract,
    permissionManifest,
    now: new Date().toISOString(),
    limits,
  });
  if (archivePath) {
    await rm(archivePath);
    archivePath = undefined;
  }
  await writeFile(outputPath, `${JSON.stringify({ ...report, limits }, null, 2)}\n`, {
    flag: 'wx',
  });
  console.log(JSON.stringify({ kind: report.kind, complete: report.complete, outputPath }));
  process.exitCode = report.kind === 'rejected' ? 1 : 2;
} catch {
  console.error(JSON.stringify({ kind: 'rejected', code: 'observation_command_failed' }));
  process.exitCode = 1;
} finally {
  try {
    if (archivePath) await rm(archivePath);
  } catch {
    console.error(JSON.stringify({ kind: 'rejected', code: 'observation_cleanup_failed' }));
    process.exitCode = 1;
  }
  await server?.close();
}
