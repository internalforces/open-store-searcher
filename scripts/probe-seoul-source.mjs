import { readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));

const server = await createServer({ configFile: false, appType: 'custom', logLevel: 'error' });
try {
  const [
    { DEFAULT_COLLECTOR_LIMITS },
    { probeSourceContract },
    { downloadArchiveToStaging },
    { parseManualProbeArguments, runManualProbe },
  ] = await Promise.all([
    server.ssrLoadModule('/src/pipeline/collector-types.ts'),
    server.ssrLoadModule('/src/pipeline/probe-source.ts'),
    server.ssrLoadModule('/src/pipeline/staged-download.ts'),
    server.ssrLoadModule('/src/pipeline/manual-probe.ts'),
  ]);
  const [
    { APPROVED_ARCHIVE_ENTRY_ALIASES, parsePermissionManifest },
    { UnzipArchiveAdapter },
    { discoverArchiveContract },
  ] = await Promise.all([
    server.ssrLoadModule('/src/pipeline/source-contract.ts'),
    server.ssrLoadModule('/src/pipeline/unzip-archive.ts'),
    server.ssrLoadModule('/src/pipeline/discover-archive-contract.ts'),
  ]);
  const { stagingRoot, outputPath, unzipExecutable } = parseManualProbeArguments(
    process.argv.slice(2),
  );
  const manifest = parsePermissionManifest(
    JSON.parse(await readFile('reports/source-permission-manifest-2026-08-28.json', 'utf8')),
  );
  const adapter = new UnzipArchiveAdapter(unzipExecutable, DEFAULT_COLLECTOR_LIMITS);
  const result = await runManualProbe({
    checkEnvironment: () => adapter.checkEnvironment(),
    probeSource: () => probeSourceContract({ fetchImpl: fetch, limits: DEFAULT_COLLECTOR_LIMITS }),
    downloadArchive: (sourceEvidence) =>
      downloadArchiveToStaging({
        fetchImpl: fetch,
        repositoryRoot,
        stagingRoot,
        sourceEvidence,
        fetchedAt: new Date().toISOString(),
        limits: DEFAULT_COLLECTOR_LIMITS,
      }),
    discoverArchive: (archivePath) =>
      discoverArchiveContract({
        adapter,
        archivePath,
        permissionManifest: manifest,
        limits: DEFAULT_COLLECTOR_LIMITS,
        entryAliases: APPROVED_ARCHIVE_ENTRY_ALIASES,
      }),
    cleanupArchive: (archivePath) => rm(archivePath, { force: true }),
  });
  if (result.kind === 'rejected') throw new Error(`${result.code}: ${result.message}`);
  await writeFile(outputPath, `${JSON.stringify(result.contract, null, 2)}\n`, { flag: 'wx' });
  console.log(
    JSON.stringify({
      kind: 'accepted',
      candidatePath: outputPath,
      archiveSha256: result.sha256,
      archiveBytes: result.byteLength,
      entryCount: result.contract.expectedEntryCount,
    }),
  );
} finally {
  await server.close();
}
