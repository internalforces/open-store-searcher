import { readFile, rm, writeFile } from 'node:fs/promises';
import { isAbsolute, resolve } from 'node:path';
import { createServer } from 'vite';

function argument(name) {
  const prefix = `--${name}=`;
  return process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length);
}

const stagingRoot = argument('staging');
const outputPath = argument('output');
const unzipExecutable = argument('unzip') ?? 'unzip';
const dockerContainer = argument('docker-container');

if (
  !stagingRoot ||
  !outputPath ||
  !isAbsolute(stagingRoot) ||
  !isAbsolute(outputPath) ||
  resolve(stagingRoot) !== stagingRoot ||
  resolve(outputPath) !== outputPath
) {
  throw new Error(
    'Usage: node scripts/probe-seoul-source.mjs --staging=<absolute-temp-directory> --output=<absolute-candidate-json> [--unzip=<executable>] [--docker-container=<name>]',
  );
}

const server = await createServer({ configFile: false, appType: 'custom', logLevel: 'error' });
let archivePath;
try {
  const [{ DEFAULT_COLLECTOR_LIMITS }, { probeSourceContract }, { downloadArchiveToStaging }] =
    await Promise.all([
      server.ssrLoadModule('/src/pipeline/collector-types.ts'),
      server.ssrLoadModule('/src/pipeline/probe-source.ts'),
      server.ssrLoadModule('/src/pipeline/staged-download.ts'),
    ]);
  const [
    { parsePermissionManifest },
    { runProcess, UnzipArchiveAdapter },
    { discoverArchiveContract },
  ] = await Promise.all([
    server.ssrLoadModule('/src/pipeline/source-contract.ts'),
    server.ssrLoadModule('/src/pipeline/unzip-archive.ts'),
    server.ssrLoadModule('/src/pipeline/discover-archive-contract.ts'),
  ]);
  const manifest = parsePermissionManifest(
    JSON.parse(await readFile('reports/source-permission-manifest-2026-08-28.json', 'utf8')),
  );
  const probe = await probeSourceContract({ fetchImpl: fetch, limits: DEFAULT_COLLECTOR_LIMITS });
  if (probe.kind === 'rejected') throw new Error(`${probe.code}: ${probe.message}`);
  const download = await downloadArchiveToStaging({
    fetchImpl: fetch,
    stagingRoot,
    sourceEvidence: probe.evidence,
    fetchedAt: new Date().toISOString(),
    limits: DEFAULT_COLLECTOR_LIMITS,
  });
  if (download.kind === 'rejected') throw new Error(`${download.code}: ${download.message}`);
  archivePath = download.archivePath;
  const dockerRunner = dockerContainer
    ? (request) =>
        runProcess({
          ...request,
          executable: 'docker',
          args: ['exec', dockerContainer, request.executable, ...request.args],
        })
    : undefined;
  const adapter = new UnzipArchiveAdapter(unzipExecutable, DEFAULT_COLLECTOR_LIMITS, dockerRunner);
  if (!(await adapter.checkEnvironment()).ok) throw new Error('environment_unavailable: Info-ZIP');
  const contract = await discoverArchiveContract({
    adapter,
    archivePath,
    permissionManifest: manifest,
    limits: DEFAULT_COLLECTOR_LIMITS,
  });
  await writeFile(outputPath, `${JSON.stringify(contract, null, 2)}\n`, { flag: 'wx' });
  console.log(
    JSON.stringify({
      kind: 'accepted',
      candidatePath: outputPath,
      archiveSha256: download.sha256,
      archiveBytes: download.byteLength,
      entryCount: contract.expectedEntryCount,
    }),
  );
} finally {
  if (archivePath) await rm(archivePath, { force: true });
  await server.close();
}
