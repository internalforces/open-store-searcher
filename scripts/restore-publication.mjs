import { rename, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  assertApprovedPublication,
  DESCRIPTOR_URL,
  identityOf,
  main,
  newOutput,
  readConfig,
  readJson,
  trustedCode,
  writeJson,
} from './publication-operator-support.mjs';
await main(async () => {
  const [configPath, registryPath, backupId, output] = process.argv.slice(2);
  if (
    !configPath ||
    !registryPath ||
    !backupId ||
    !output ||
    process.argv.length !== 6 ||
    !/^[a-z0-9-]{1,64}$/.test(backupId)
  )
    throw new Error(
      'Usage: node scripts/restore-publication.mjs CONFIG REGISTRY BACKUP-ID NEW-OUTPUT',
    );
  const config = await readConfig(configPath);
  const receipt = await trustedCode(async (load) => {
    const types = await load('recovery-types');
    const { selectRecoveryApproval } = await load('recovery-approval');
    const { downloadApprovedRecovery } = await load('recovery-download');
    const { restoreRecoveryArchive } = await load('recovery-archive');
    const { verifyPublicationDirectory } = await load('verify-publication-directory');
    const { readRecoveryPrecondition } = await load('reconcile-publication');
    const approval = selectRecoveryApproval(
      await readJson(registryPath, types.RECOVERY_LIMITS.maxJsonBytes),
      backupId,
      config,
    );
    return newOutput(output, async (scratch) => {
      const downloaded = await downloadApprovedRecovery(approval, join(scratch, 'download'));
      const restored = await restoreRecoveryArchive(
        downloaded.gzipPath,
        downloaded.provenance,
        downloaded.inventory,
        join(scratch, 'restored'),
      );
      // Task2 proves semantic validity; only current-main approval supplies snapshot authority.
      const verified = await verifyPublicationDirectory(restored.siteDir, downloaded.inventory);
      assertApprovedPublication(verified, approval.expectedProvenance, downloaded.inventory, types);
      const precondition = await readRecoveryPrecondition(config.siteUrl, approval);
      const preparation = {
        version: 1,
        kind: 'publication-recovery-prepared',
        backupId,
        siteUrl: config.siteUrl,
        identity: identityOf(verified),
        inventory: approval.expectedProvenance.inventory,
        tar: approval.expectedProvenance.tar,
        precondition,
      };
      await rename(restored.tarPath, join(scratch, 'artifact.tar'));
      await writeJson(join(scratch, 'preparation.json'), preparation);
      await rm(join(scratch, 'restored'), { recursive: true, force: true });
      await rm(join(scratch, 'download'), { recursive: true, force: true });
      // Fixed trusted scalars only; no paths, draft text or backup input is interpolated.
      if (process.env.GITHUB_OUTPUT)
        await writeFile(
          process.env.GITHUB_OUTPUT,
          `descriptor_url=${DESCRIPTOR_URL}\ndescriptor_status=${precondition.status}\ndescriptor_sha=${precondition.releaseSha256 ?? 'absent'}\n`,
          { flag: 'a' },
        );
      return preparation;
    });
  });
  console.log(JSON.stringify(receipt));
});
