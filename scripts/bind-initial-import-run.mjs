import { createHash } from 'node:crypto';
import { constants } from 'node:fs';
import { appendFile, lstat, open } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import {
  jsonBytes,
  main,
  newOutput,
  readJson,
  trustedCode,
  writeJson,
} from './publication-operator-support.mjs';

// Called only after the candidate upload. The raw tar digest is not the service ZIP digest.
await main(async () => {
  const [preparedPath, artifactId, metadataPath] = process.argv.slice(2);
  if (
    process.argv.length !== 5 ||
    !preparedPath ||
    !metadataPath ||
    preparedPath.startsWith('--') ||
    metadataPath.startsWith('--') ||
    !/^[1-9][0-9]*$/.test(artifactId ?? '') ||
    !Number.isSafeInteger(Number(artifactId))
  )
    throw new Error(
      'Usage: node scripts/bind-initial-import-run.mjs PREPARED-DIR CANDIDATE-ARTIFACT-ID NEW-METADATA-DIR',
    );
  const runId = Number(process.env.GITHUB_RUN_ID);
  if (
    process.env.GITHUB_ACTIONS !== 'true' ||
    process.env.GITHUB_REPOSITORY !== 'internalforces/open-store-searcher' ||
    process.env.GITHUB_REF !== 'refs/heads/main' ||
    !/^[a-f0-9]{40}$/.test(process.env.GITHUB_SHA ?? '') ||
    !/^[1-9][0-9]*$/.test(process.env.GITHUB_RUN_ID ?? '') ||
    !Number.isSafeInteger(runId)
  )
    throw new Error('Hosted initial import GitHub context required');
  const prepared = resolve(preparedPath),
    metadata = resolve(metadataPath);
  const directory = await lstat(prepared);
  if (!directory.isDirectory() || directory.isSymbolicLink())
    throw new Error('Unsafe prepared directory');
  await trustedCode(async (load) => {
    const { bindInitialImportRun, validateInitialImportRun, validateInitialImportPreparation } =
      await load('initial-import-run');
    const { RECOVERY_LIMITS, inventoryBytes, validateSnapshotInventory, sha256Bytes } =
      await load('recovery-types');
    const preparation = validateInitialImportPreparation(
      await readJson(join(prepared, 'preparation.json'), 16 * 1024 * 1024),
    );
    const source = await readJson(
      join(prepared, 'source-import.json'),
      RECOVERY_LIMITS.maxInventoryBytes,
    );
    const identity = await readJson(
      join(prepared, 'identity.json'),
      RECOVERY_LIMITS.maxProvenanceBytes,
    );
    const inventory = validateSnapshotInventory(
      await readJson(join(prepared, 'inventory.json'), RECOVERY_LIMITS.maxInventoryBytes),
    );
    const bound = bindInitialImportRun(preparation, Number(artifactId), {
      sha: process.env.GITHUB_SHA,
      runId,
    });
    validateInitialImportRun(bound, {
      sha: process.env.GITHUB_SHA,
      runId,
      now: new Date().toISOString(),
    });
    const matches = (bytes, binding) =>
      bytes.length === binding.byteLength && sha256Bytes(bytes) === binding.sha256;
    if (
      !isDeepStrictEqual(identity, preparation.identity) ||
      !matches(jsonBytes(source), preparation.sourceReceipt) ||
      !matches(inventoryBytes(inventory), preparation.inventory)
    )
      throw new Error('Initial preparation metadata binding mismatch');
    const path = join(prepared, 'artifact.tar'),
      before = await lstat(path);
    if (
      !before.isFile() ||
      before.isSymbolicLink() ||
      before.nlink !== 1 ||
      before.size !== preparation.tar.byteLength ||
      before.size > RECOVERY_LIMITS.maxTarBytes
    )
      throw new Error('Unsafe initial raw tar');
    const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    try {
      const hash = createHash('sha256');
      let length = 0;
      for await (const bytes of file.createReadStream({ autoClose: false })) {
        length += bytes.length;
        if (length > preparation.tar.byteLength)
          throw new Error('Initial raw tar exceeds preparation');
        hash.update(bytes);
      }
      const after = await file.stat(),
        current = await lstat(path);
      if (
        length !== before.size ||
        hash.digest('hex') !== preparation.tar.sha256 ||
        [after, current].some(
          (stat) =>
            stat.dev !== before.dev ||
            stat.ino !== before.ino ||
            stat.size !== before.size ||
            stat.mtimeMs !== before.mtimeMs ||
            stat.ctimeMs !== before.ctimeMs,
        )
      )
        throw new Error('Initial raw tar changed after upload');
    } finally {
      await file.close();
    }
    await newOutput(metadata, async (scratch) => {
      for (const [name, value] of Object.entries({
        'source-import.json': source,
        'preparation.json': preparation,
        'identity.json': identity,
        'inventory.json': inventory,
        'run.json': bound,
      }))
        await writeJson(join(scratch, name), value);
    });
    // The strict scalar is a single JSON line; no user-supplied output name or delimiter exists.
    if (process.env.GITHUB_OUTPUT)
      await appendFile(
        process.env.GITHUB_OUTPUT,
        `run_binding=${JSON.stringify(bound)}\ntar_sha256=${bound.tarSha256}\ninventory_sha256=${bound.inventorySha256}\n`,
      );
    console.log(JSON.stringify(bound));
  });
});
