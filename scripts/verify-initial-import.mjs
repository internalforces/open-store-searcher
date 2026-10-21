import { main } from './publication-operator-support.mjs';
import { prepareInitialImport } from './initial-import-support.mjs';
await main(async () => {
  const [configPath, archivePath, observationPath, output] = process.argv.slice(2);
  if (process.argv.length !== 6 || !configPath || !archivePath || !observationPath || !output)
    throw new Error(
      'Usage: node scripts/verify-initial-import.mjs CONFIG ZIP OBSERVATION NEW-OUTPUT',
    );
  console.log(
    JSON.stringify(
      await prepareInitialImport({
        mode: 'local-proof',
        configPath,
        archivePath,
        observationPath,
        output,
      }),
    ),
  );
});
