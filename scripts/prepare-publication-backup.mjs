import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import {
  identityOf,
  jsonBytes,
  main,
  newOutput,
  readConfig,
  readJson,
  trustedCode,
  writeJson,
} from './publication-operator-support.mjs';
await main(async () => {
  const [configPath, tarPath, inventoryPath, draftPath, output] = process.argv.slice(2);
  if (
    !configPath ||
    !tarPath ||
    !inventoryPath ||
    !draftPath ||
    !output ||
    process.argv.length !== 7
  )
    throw new Error(
      'Usage: node scripts/prepare-publication-backup.mjs CONFIG ARTIFACT-TAR INVENTORY PROVENANCE-DRAFT NEW-OUTPUT',
    );
  const config = await readConfig(configPath);
  const draft = await readJson(draftPath, 64 * 1024);
  const keys = [
    'version',
    'kind',
    'repository',
    'siteUrl',
    'sourceCommit',
    'workflowCommit',
    'workflowPath',
    'runId',
    'artifactId',
    'deploymentId',
    'deploymentOutcome',
  ];
  if (
    !draft ||
    typeof draft !== 'object' ||
    Object.keys(draft).sort().join(',') !== keys.sort().join(',') ||
    draft.version !== 1 ||
    draft.kind !== 'publication-backup-draft'
  )
    throw new Error('Explicit successful-run/deployment draft attestation required');
  const receipt = await trustedCode(async (load) => {
    const types = await load('recovery-types');
    const { createRecoveryArchive, restoreRecoveryArchive } = await load('recovery-archive');
    const { verifyPublicationDirectory } = await load('verify-publication-directory');
    const { validateRecoveryProvenance } = await load('recovery-approval');
    const { reconcilePublication } = await load('reconcile-publication');
    const inventory = types.validateSnapshotInventory(
      await readJson(inventoryPath, types.RECOVERY_LIMITS.maxInventoryBytes),
    );
    return newOutput(output, async (scratch) => {
      const gzipPath = join(scratch, 'snapshot.tar.gz');
      const archive = await createRecoveryArchive(tarPath, gzipPath, inventory);
      const restored = await restoreRecoveryArchive(
        gzipPath,
        archive,
        inventory,
        join(scratch, 'restored'),
      );
      const verified = await verifyPublicationDirectory(restored.siteDir, inventory);
      const publicState = await reconcilePublication(config.siteUrl, verified);
      if (publicState.kind !== 'verified') throw new Error(publicState.reason);
      const publicReceipt = publicState.receipt;
      const inventoryBytes = types.inventoryBytes(inventory);
      const publicBytes = jsonBytes(publicReceipt);
      const provenance = validateRecoveryProvenance(
        {
          ...draft,
          kind: 'verified-publication-backup',
          verifiedAt: publicReceipt.checkedAt,
          identity: identityOf(verified),
          inventory: {
            byteLength: inventoryBytes.length,
            sha256: types.sha256Bytes(inventoryBytes),
          },
          ...archive,
          publicVerification: {
            receipt: publicReceipt,
            binding: { byteLength: publicBytes.length, sha256: types.sha256Bytes(publicBytes) },
          },
        },
        config,
      );
      const verification = {
        version: 1,
        kind: 'publication-backup-proposed',
        approvalStatus: 'proposed',
        historyVerified: false,
        operatorAttestation: draft,
        publicVerification: publicReceipt,
      };
      await writeJson(join(scratch, 'inventory.json'), inventory);
      await writeJson(join(scratch, 'provenance.json'), provenance);
      await writeJson(join(scratch, 'verification.json'), verification);
      await rm(join(scratch, 'restored'), { recursive: true, force: true });
      return verification;
    });
  });
  console.log(JSON.stringify(receipt));
});
