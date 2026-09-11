// ADR-017: deterministic offline derivation; stdout is research evidence, never publication data.
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('../', import.meta.url));
const sourceReport = 'reports/observation-2026-09-04-task-008-complete.json';
const sourceAudit = 'reports/observation-2026-09-04-task-008-complete-audit.json';
const files = [
  'scripts/derive-task008-observation.mjs',
  'src/pipeline/derive-research-observation.ts',
  'src/pipeline/aggregate-vocabulary.ts',
  'src/pipeline/refresh-validation-metrics.ts',
  'src/pipeline/refresh-validation-types.ts',
  'src/pipeline/research-observation-diagnostics.ts',
  'src/pipeline/archive-contract.ts',
  'src/pipeline/source-contract.ts',
  'src/pipeline/collector-types.ts',
  'src/pipeline/contracts/seoul-archive-contract.json',
  'src/domain/map-license-status.ts',
  'package.json',
  'package-lock.json',
].sort();
const read = (path) => readFile(new URL(`../${path}`, import.meta.url));
const hashes = () =>
  Promise.all(
    files.map(async (path) => ({
      path,
      sha256: createHash('sha256')
        .update(await read(path))
        .digest('hex'),
    })),
  );
const before = await hashes();
const server = await createServer({
  root,
  configFile: false,
  appType: 'custom',
  logLevel: 'silent',
});
try {
  const { deriveResearchObservationV2 } = await server.ssrLoadModule(
    '/src/pipeline/derive-research-observation.ts',
  );
  const { parseArchiveContract } = await server.ssrLoadModule('/src/pipeline/archive-contract.ts');
  const result = deriveResearchObservationV2({
    sourceReportBytes: await read(sourceReport),
    sourceAuditBytes: await read(sourceAudit),
    archiveContract: parseArchiveContract(
      JSON.parse(await read('src/pipeline/contracts/seoul-archive-contract.json')),
    ),
    derivationImplementation: before,
  });
  if (JSON.stringify(before) !== JSON.stringify(await hashes()))
    throw new Error('derivation_implementation_changed');
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} finally {
  await server.close();
}
