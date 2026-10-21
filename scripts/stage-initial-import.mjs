import { main } from './publication-operator-support.mjs';
import { prepareInitialImport } from './initial-import-support.mjs';
await main(async () => {
  const [configPath, registryPath, sourceId, output] = process.argv.slice(2);
  if (process.argv.length !== 6 || !configPath || !registryPath || !sourceId || !output)
    throw new Error(
      'Usage: node scripts/stage-initial-import.mjs CONFIG REGISTRY SOURCE-ID NEW-OUTPUT',
    );
  console.log(
    JSON.stringify(
      await prepareInitialImport({ mode: 'hosted', configPath, registryPath, sourceId, output }),
    ),
  );
});
