import { join } from 'node:path';
import {
  identityOf,
  main,
  newOutput,
  trustedCode,
  writeJson,
} from './publication-operator-support.mjs';
await main(async () => {
  const [site, output] = process.argv.slice(2);
  if (!site || !output || process.argv.length !== 4)
    throw new Error('Usage: node scripts/inspect-publication.mjs SITE-DIR NEW-OUTPUT');
  const receipt = await trustedCode(async (load) => {
    const { verifyPublicationDirectory } = await load('verify-publication-directory');
    return newOutput(output, async (scratch) => {
      const verified = await verifyPublicationDirectory(site);
      const identity = identityOf(verified);
      await writeJson(join(scratch, 'inventory.json'), verified.inventory);
      await writeJson(join(scratch, 'identity.json'), identity);
      return {
        version: 1,
        kind: 'publication-inspected',
        identity,
        inventorySha256: verified.inventorySha256,
      };
    });
  });
  console.log(JSON.stringify(receipt));
});
