import { createHash } from 'node:crypto';
import { constants } from 'node:fs';
import { lstat, open, opendir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import {
  assertSnapshotName,
  RECOVERY_LIMITS,
  type SnapshotFile,
  type SnapshotInventoryV1,
  validateSnapshotInventory,
} from './recovery-types.js';

async function checkedDirectory(path: string): Promise<void> {
  const info = await lstat(path);
  if (!info.isDirectory() || info.isSymbolicLink()) throw new Error('Unsafe snapshot directory');
}

/** Opens only a checked regular file and never follows a final-component symlink. */
export async function openSnapshotFile(siteDir: string, name: string) {
  assertSnapshotName(name);
  const root = resolve(siteDir);
  await checkedDirectory(root);
  const parts = name.split('/');
  let parent = root;
  for (const part of parts.slice(0, -1)) {
    parent = join(parent, part);
    await checkedDirectory(parent);
  }
  const path = join(root, name);
  const before = await lstat(path);
  if (!before.isFile() || before.nlink !== 1 || before.size > RECOVERY_LIMITS.maxFileBytes)
    throw new Error('Unsafe snapshot file');
  const handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const actual = await handle.stat();
    if (
      !actual.isFile() ||
      actual.nlink !== 1 ||
      actual.dev !== before.dev ||
      actual.ino !== before.ino ||
      actual.size !== before.size
    )
      throw new Error('Snapshot file changed while opening');
    await checkedDirectory(dirname(path));
    return handle;
  } catch (error) {
    await handle.close();
    throw error;
  }
}

export async function scanPublicationDirectory(siteDir: string): Promise<SnapshotInventoryV1> {
  const root = resolve(siteDir);
  await checkedDirectory(root);
  const candidates: { name: string; size: number }[] = [];
  const identities = new Set<string>();
  let totalBytes = 0;
  let memberCount = 0;
  async function walk(prefix: string) {
    const directory = join(root, prefix);
    await checkedDirectory(directory);
    for await (const entry of await opendir(directory)) {
      const name = prefix ? `${prefix}/${entry.name}` : entry.name;
      assertSnapshotName(name);
      if (++memberCount > RECOVERY_LIMITS.maxTarMembers)
        throw new Error('Too many snapshot members');
      const info = await lstat(join(root, name));
      if (info.isDirectory()) await walk(name);
      else {
        if (
          !info.isFile() ||
          info.nlink !== 1 ||
          !Number.isSafeInteger(info.size) ||
          info.size > RECOVERY_LIMITS.maxFileBytes
        )
          throw new Error('Unsafe snapshot file');
        const identity = `${info.dev}:${info.ino}`;
        if (identities.has(identity)) throw new Error('Snapshot hardlink alias');
        identities.add(identity);
        totalBytes += info.size;
        if (totalBytes > RECOVERY_LIMITS.maxSiteBytes)
          throw new Error('Snapshot exceeds site limit');
        candidates.push({ name, size: info.size });
        if (candidates.length > RECOVERY_LIMITS.maxFiles)
          throw new Error('Too many snapshot files');
      }
    }
  }
  // Finish metadata preflight for the complete tree before reading a payload.
  await walk('');
  candidates.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  const files: SnapshotFile[] = [];
  let streamedBytes = 0;
  for (const candidate of candidates) {
    const handle = await openSnapshotFile(root, candidate.name);
    try {
      const before = await handle.stat();
      const hash = createHash('sha256');
      let byteLength = 0;
      for await (const chunk of handle.createReadStream({ autoClose: false })) {
        byteLength += chunk.length;
        streamedBytes += chunk.length;
        if (
          byteLength > candidate.size ||
          byteLength > RECOVERY_LIMITS.maxFileBytes ||
          streamedBytes > RECOVERY_LIMITS.maxSiteBytes
        )
          throw new Error('Snapshot grew while reading');
        hash.update(chunk);
      }
      const after = await handle.stat();
      if (
        byteLength !== candidate.size ||
        after.size !== before.size ||
        after.mtimeMs !== before.mtimeMs ||
        after.ctimeMs !== before.ctimeMs ||
        after.nlink !== 1
      )
        throw new Error('Snapshot changed while reading');
      files.push({ name: candidate.name, byteLength, sha256: hash.digest('hex') });
    } finally {
      await handle.close();
    }
  }
  return validateSnapshotInventory({
    version: 1,
    kind: 'publication-inventory',
    files,
    totalBytes,
  });
}
