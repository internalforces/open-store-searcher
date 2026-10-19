import { createHash } from 'node:crypto';
import { constants, type Stats } from 'node:fs';
import {
  type FileHandle,
  link,
  lstat,
  mkdir,
  mkdtemp,
  open,
  rename,
  rm,
  rmdir,
} from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { createGunzip, createGzip } from 'node:zlib';
import {
  assertSnapshotName,
  type ByteBinding,
  RECOVERY_LIMITS,
  type SnapshotInventoryV1,
  validateSnapshotInventory,
} from './recovery-types.js';
import { verifyPublicationDirectory } from './verify-publication-directory.js';

const archiveMaxima = {
  maxTarBytes: RECOVERY_LIMITS.maxTarBytes,
  maxGzipBytes: RECOVERY_LIMITS.maxGzipBytes,
  maxFileBytes: RECOVERY_LIMITS.maxFileBytes,
  maxSiteBytes: RECOVERY_LIMITS.maxSiteBytes,
  maxFiles: RECOVERY_LIMITS.maxFiles,
  maxTarMembers: RECOVERY_LIMITS.maxTarMembers,
};
type ArchiveLimits = { [K in keyof typeof archiveMaxima]: number };
// Internal lowering-only seam for bounded fixtures. No CLI/environment override exists.
function limitsFor(lower: Partial<ArchiveLimits>): ArchiveLimits {
  const result: ArchiveLimits = { ...archiveMaxima };
  for (const [key, value] of Object.entries(lower)) {
    if (
      !Object.hasOwn(archiveMaxima, key) ||
      !Number.isSafeInteger(value) ||
      value < 0 ||
      value > archiveMaxima[key as keyof ArchiveLimits]
    )
      throw new Error('Invalid archive limit');
    result[key as keyof ArchiveLimits] = value;
  }
  return result;
}
function expectedFor(expected: SnapshotInventoryV1, limits: ArchiveLimits) {
  const inventory = validateSnapshotInventory(expected);
  if (
    inventory.files.length > limits.maxFiles ||
    inventory.totalBytes > limits.maxSiteBytes ||
    inventory.files.some((file) => file.byteLength > limits.maxFileBytes)
  )
    throw new Error('Inventory exceeds archive limits');
  return inventory;
}
function sameBinding(actual: ByteBinding, expected: ByteBinding) {
  if (actual.byteLength !== expected.byteLength || actual.sha256 !== expected.sha256)
    throw new Error('Archive byte binding mismatch');
}
function assertBinding(value: ByteBinding, max: number) {
  if (
    !value ||
    Object.keys(value).sort().join(',') !== 'byteLength,sha256' ||
    !Number.isSafeInteger(value.byteLength) ||
    value.byteLength <= 0 ||
    value.byteLength > max ||
    !/^[0-9a-f]{64}$/.test(value.sha256)
  )
    throw new Error('Invalid archive byte binding');
}
function unchanged(before: Stats, after: Stats) {
  if (
    !after.isFile() ||
    after.nlink !== 1 ||
    before.dev !== after.dev ||
    before.ino !== after.ino ||
    before.size !== after.size ||
    before.mtimeMs !== after.mtimeMs ||
    before.ctimeMs !== after.ctimeMs
  )
    throw new Error('Archive changed during read');
}
// Archive roles deliberately do not use openSnapshotFile's smaller site-file ceiling.
async function openArchive(path: string, max: number) {
  const before = await lstat(path);
  if (
    !before.isFile() ||
    before.nlink !== 1 ||
    !Number.isSafeInteger(before.size) ||
    before.size <= 0 ||
    before.size > max
  )
    throw new Error('Unsafe or oversized archive');
  const handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    unchanged(before, await handle.stat());
    return { handle, before };
  } catch (error) {
    await handle.close();
    throw error;
  }
}
async function* measuredRead(handle: FileHandle, max: number, hash: ReturnType<typeof createHash>) {
  let length = 0;
  for await (const chunk of handle.createReadStream({ autoClose: false, start: 0 })) {
    length += chunk.length;
    if (length > max) throw new Error('Archive stream exceeds byte limit');
    hash.update(chunk);
    yield chunk;
  }
}
async function hashArchive(path: string, max: number): Promise<ByteBinding> {
  const { handle, before } = await openArchive(path, max);
  try {
    const hash = createHash('sha256');
    let byteLength = 0;
    for await (const chunk of measuredRead(handle, max, hash)) byteLength += chunk.length;
    unchanged(before, await handle.stat());
    if (byteLength !== before.size) throw new Error('Truncated archive');
    return { byteLength, sha256: hash.digest('hex') };
  } finally {
    await handle.close();
  }
}
async function writeAll(handle: FileHandle, bytes: Buffer) {
  let offset = 0;
  while (offset < bytes.length) {
    const { bytesWritten } = await handle.write(bytes, offset, bytes.length - offset);
    if (bytesWritten <= 0) throw new Error('Archive write made no progress');
    offset += bytesWritten;
  }
}
async function transformArchive(
  input: string,
  output: string,
  inputMax: number,
  outputMax: number,
  compress: boolean,
): Promise<{ input: ByteBinding; output: ByteBinding }> {
  const { handle, before } = await openArchive(input, inputMax);
  let destination: FileHandle | undefined;
  try {
    destination = await open(
      output,
      constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW,
      0o600,
    );
    const inputHash = createHash('sha256');
    const outputHash = createHash('sha256');
    let byteLength = 0;
    await pipeline(
      measuredRead(handle, inputMax, inputHash),
      compress ? createGzip() : createGunzip(),
      async (source) => {
        for await (const chunk of source) {
          byteLength += chunk.length;
          if (byteLength > outputMax) throw new Error('Archive expansion exceeds byte limit');
          outputHash.update(chunk);
          await writeAll(destination as FileHandle, chunk);
        }
      },
    );
    unchanged(before, await handle.stat());
    return {
      input: { byteLength: before.size, sha256: inputHash.digest('hex') },
      output: { byteLength, sha256: outputHash.digest('hex') },
    };
  } finally {
    await destination?.close();
    await handle.close();
  }
}
function textField(header: Buffer, start: number, width: number): string {
  const bytes = header.subarray(start, start + width);
  const end = bytes.indexOf(0);
  if (end >= 0 && bytes.subarray(end).some((byte) => byte !== 0))
    throw new Error('Hidden tar field bytes');
  return new TextDecoder('utf8', { fatal: true }).decode(end < 0 ? bytes : bytes.subarray(0, end));
}
function octal(header: Buffer, start: number, width: number): number {
  const bytes = header.subarray(start, start + width);
  const value = bytes.toString('latin1');
  if (!/^(?: *[0-7]+[\0 ]*|[\0 ]+)$/.test(value)) throw new Error('Invalid tar octal');
  const digits = value.replace(/[\0 ]/g, '');
  const result = digits ? Number.parseInt(digits, 8) : 0;
  if (!Number.isSafeInteger(result)) throw new Error('Tar octal overflow');
  return result;
}
function parseHeader(header: Buffer) {
  let checksum = 0;
  for (let i = 0; i < 512; i++) checksum += i >= 148 && i < 156 ? 32 : header.readUInt8(i);
  if (checksum !== octal(header, 148, 8)) throw new Error('Bad tar checksum');
  const magic = header.subarray(257, 265).toString('latin1');
  const posix = magic === 'ustar\0' + '00';
  const gnu = magic === 'ustar  \0';
  if (!posix && !gnu) throw new Error('Unsupported tar format');
  const type = header.readUInt8(156);
  if (type !== 0 && type !== 48 && type !== 53) throw new Error('Unsupported tar member type');
  if (header.subarray(157, 257).some((byte) => byte !== 0))
    throw new Error('Tar link field present');
  for (const [start, width] of [
    [100, 8],
    [108, 8],
    [116, 8],
    [136, 12],
    [329, 8],
    [337, 8],
  ] as const)
    octal(header, start, width);
  // GNU sparse/extended metadata is never interpreted as a path prefix.
  if (gnu && header.subarray(345).some((byte) => byte !== 0))
    throw new Error('Unsupported GNU tar extension metadata');
  if (posix && header.subarray(500).some((byte) => byte !== 0))
    throw new Error('Unsupported ustar reserved bytes');
  const prefix = posix ? textField(header, 345, 155) : '';
  let name = `${prefix ? `${prefix}/` : ''}${textField(header, 0, 100)}`;
  const directory = type === 53;
  const root = directory && (name === './' || name === '.');
  if (root) name = '';
  else {
    if (name.startsWith('./')) name = name.slice(2);
    if (directory && name.endsWith('/')) name = name.slice(0, -1);
    assertSnapshotName(name);
  }
  const size = octal(header, 124, 12);
  if (directory && size !== 0) throw new Error('Tar directory has a body');
  return { name, size, directory };
}
async function inspectTar(
  path: string,
  expected: SnapshotInventoryV1,
  limits: ArchiveLimits,
  siteDir?: string,
): Promise<ByteBinding> {
  const { handle, before } = await openArchive(path, limits.maxTarBytes);
  try {
    if (before.size % 512 !== 0) throw new Error('Truncated tar block');
    const hash = createHash('sha256');
    let position = 0;
    async function read(length: number) {
      const bytes = Buffer.alloc(length);
      let offset = 0;
      while (offset < length) {
        const result = await handle.read(bytes, offset, length - offset, position + offset);
        if (result.bytesRead === 0) throw new Error('Truncated tar');
        offset += result.bytesRead;
      }
      position += length;
      hash.update(bytes);
      return bytes;
    }
    const files = new Map(expected.files.map((entry) => [entry.name, entry]));
    const seen = new Map<string, 'file' | 'directory'>();
    const directories = new Set<string>();
    let members = 0;
    let fileCount = 0;
    let siteBytes = 0;
    let zeros = 0;
    while (position < before.size) {
      const header = await read(512);
      if (header.every((byte) => byte === 0)) {
        zeros++;
        if (zeros === 2) {
          while (position < before.size) {
            if (
              (await read(Math.min(64 * 1024, before.size - position))).some((byte) => byte !== 0)
            )
              throw new Error('Nonzero tar data after end marker');
          }
        }
        continue;
      }
      if (zeros !== 0) throw new Error('Nonzero tar data after end marker');
      if (++members > limits.maxTarMembers) throw new Error('Too many tar members');
      const entry = parseHeader(header);
      if (seen.has(entry.name)) throw new Error('Duplicate tar name');
      const parts = entry.name.split('/');
      for (let i = 1; i < parts.length; i++) {
        const parent = parts.slice(0, i).join('/');
        if (seen.get(parent) === 'file') throw new Error('Tar parent is a file');
        directories.add(parent);
      }
      if (!entry.directory && directories.has(entry.name))
        throw new Error('Tar file conflicts with directory');
      seen.set(entry.name, entry.directory ? 'directory' : 'file');
      if (entry.directory) directories.add(entry.name);
      if (entry.directory) {
        if (siteDir && entry.name)
          await mkdir(join(siteDir, entry.name), { recursive: true, mode: 0o700 });
        continue;
      }
      const wanted = files.get(entry.name);
      fileCount++;
      siteBytes += entry.size;
      if (
        !wanted ||
        wanted.byteLength !== entry.size ||
        entry.size > limits.maxFileBytes ||
        fileCount > limits.maxFiles ||
        siteBytes > limits.maxSiteBytes
      )
        throw new Error('Unexpected or oversized tar file');
      if (position + Math.ceil(entry.size / 512) * 512 > before.size)
        throw new Error('Truncated tar body');
      let destination: FileHandle | undefined;
      try {
        if (siteDir) {
          await mkdir(dirname(join(siteDir, entry.name)), { recursive: true, mode: 0o700 });
          destination = await open(
            join(siteDir, entry.name),
            constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW,
            0o600,
          );
        }
        const fileHash = createHash('sha256');
        let remaining = entry.size;
        while (remaining > 0) {
          const chunk = await read(Math.min(remaining, 64 * 1024));
          fileHash.update(chunk);
          if (destination) await writeAll(destination, chunk);
          remaining -= chunk.length;
        }
        if (fileHash.digest('hex') !== wanted.sha256) throw new Error('Tar file hash mismatch');
        const padding = (512 - (entry.size % 512)) % 512;
        if (padding && (await read(padding)).some((byte) => byte !== 0))
          throw new Error('Nonzero tar padding');
        files.delete(entry.name);
      } finally {
        await destination?.close();
      }
    }
    if (zeros < 2 || files.size || siteBytes !== expected.totalBytes)
      throw new Error('Incomplete tar or inventory');
    unchanged(before, await handle.stat());
    return { byteLength: position, sha256: hash.digest('hex') };
  } finally {
    await handle.close();
  }
}
async function absent(path: string) {
  try {
    await lstat(path);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
    throw error;
  }
  throw new Error('Recovery output already exists');
}
async function scratchFor(output: string) {
  const parent = dirname(resolve(output));
  const info = await lstat(parent);
  if (!info.isDirectory() || info.isSymbolicLink())
    throw new Error('Unsafe recovery output parent');
  return mkdtemp(join(parent, `.${basename(output)}.recovery-`));
}

/** Validate all original tar members, then stream gzip without regenerating the tar. */
export async function createRecoveryArchive(
  tarPath: string,
  gzipPath: string,
  expected: SnapshotInventoryV1,
  lowerLimits: Partial<ArchiveLimits> = {},
): Promise<{ tar: ByteBinding; gzip: ByteBinding }> {
  const limits = limitsFor(lowerLimits);
  const inventory = expectedFor(expected, limits);
  await absent(gzipPath);
  const tar = await inspectTar(tarPath, inventory, limits);
  const scratch = await scratchFor(gzipPath);
  try {
    const candidate = join(scratch, 'snapshot.tar.gz');
    const result = await transformArchive(
      tarPath,
      candidate,
      limits.maxTarBytes,
      limits.maxGzipBytes,
      true,
    );
    sameBinding(result.input, tar);
    sameBinding(await hashArchive(tarPath, limits.maxTarBytes), tar);
    sameBinding(await hashArchive(candidate, limits.maxGzipBytes), result.output);
    // link is exclusive: an output created meanwhile is never overwritten.
    await link(candidate, gzipPath);
    return { tar, gzip: result.output };
  } finally {
    await rm(scratch, { recursive: true, force: true });
  }
}

/** Restore only a complete, byte-bound, current-code-verified publication into a new private output. */
export async function restoreRecoveryArchive(
  gzipPath: string,
  binding: { tar: ByteBinding; gzip: ByteBinding },
  expected: SnapshotInventoryV1,
  newOutputDir: string,
  lowerLimits: Partial<ArchiveLimits> = {},
): Promise<{ siteDir: string; tarPath: string }> {
  const limits = limitsFor(lowerLimits);
  const inventory = expectedFor(expected, limits);
  assertBinding(binding.tar, limits.maxTarBytes);
  assertBinding(binding.gzip, limits.maxGzipBytes);
  await absent(newOutputDir);
  sameBinding(await hashArchive(gzipPath, limits.maxGzipBytes), binding.gzip);
  const scratch = await scratchFor(newOutputDir);
  let reservation: Stats | undefined;
  try {
    const tarPath = join(scratch, 'artifact.tar');
    const siteDir = join(scratch, 'site');
    const result = await transformArchive(
      gzipPath,
      tarPath,
      limits.maxGzipBytes,
      Math.min(limits.maxTarBytes, binding.tar.byteLength),
      false,
    );
    sameBinding(result.input, binding.gzip);
    sameBinding(result.output, binding.tar);
    sameBinding(await inspectTar(tarPath, inventory, limits), binding.tar);
    await mkdir(siteDir, { mode: 0o700 });
    sameBinding(await inspectTar(tarPath, inventory, limits, siteDir), binding.tar);
    await verifyPublicationDirectory(siteDir, inventory);
    sameBinding(await hashArchive(tarPath, limits.maxTarBytes), binding.tar);
    sameBinding(await hashArchive(gzipPath, limits.maxGzipBytes), binding.gzip);
    // Reserve only after full verification. This private empty directory is never a serving path.
    // Renaming over our empty reservation publishes both the site and original tar atomically.
    await mkdir(newOutputDir, { mode: 0o700 });
    reservation = await lstat(newOutputDir);
    await rename(scratch, newOutputDir);
    reservation = undefined;
    return { siteDir: join(newOutputDir, 'site'), tarPath: join(newOutputDir, 'artifact.tar') };
  } finally {
    await rm(scratch, { recursive: true, force: true });
    if (reservation) {
      const current = await lstat(newOutputDir).catch(() => undefined);
      if (current?.dev === reservation.dev && current.ino === reservation.ino) {
        // Empty-only cleanup preserves any competing content; never recursively delete a final path.
        await rmdir(newOutputDir).catch((error: NodeJS.ErrnoException) => {
          if (!['ENOENT', 'ENOTEMPTY', 'EEXIST'].includes(error.code ?? '')) throw error;
        });
      }
    }
  }
}
