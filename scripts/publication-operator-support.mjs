// Current-code operator utilities. Historical publications are data only.
import { constants } from 'node:fs';
import { lstat, mkdir, mkdtemp, open, rename, rm, rmdir, writeFile } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
export const SITE_URL = 'https://internalforces.github.io/open-store-searcher/';
export const DESCRIPTOR_URL = `${SITE_URL}release.json`;
export const jsonBytes = (value) => Buffer.from(`${JSON.stringify(value)}\n`);
export function identityOf(verified) {
  const { inventory, inventorySha256, ...identity } = verified;
  return identity;
}
export async function readJson(path, maxBytes) {
  const before = await lstat(path);
  if (
    !before.isFile() ||
    before.isSymbolicLink() ||
    before.nlink !== 1 ||
    before.size <= 0 ||
    before.size > maxBytes
  )
    throw new Error('Unsafe or oversized operator JSON');
  const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const chunks = [];
    let length = 0;
    for await (const chunk of file.createReadStream({ autoClose: false })) {
      length += chunk.length;
      if (length > maxBytes) throw new Error('Operator JSON exceeds byte limit');
      chunks.push(chunk);
    }
    const after = await file.stat();
    if (
      before.dev !== after.dev ||
      before.ino !== after.ino ||
      before.size !== length ||
      before.size !== after.size ||
      before.mtimeMs !== after.mtimeMs ||
      before.ctimeMs !== after.ctimeMs
    )
      throw new Error('Operator JSON changed during read');
    return JSON.parse(new TextDecoder('utf8', { fatal: true }).decode(Buffer.concat(chunks)));
  } finally {
    await file.close();
  }
}
export async function readConfig(path) {
  const config = await readJson(path, 4 * 1024 * 1024);
  if (
    config?.previousReleaseUrl !== DESCRIPTOR_URL ||
    typeof config?.policy?.revision !== 'string' ||
    !config.policy.revision.trim()
  )
    throw new Error('Reviewed publication configuration required');
  return { siteUrl: SITE_URL, policyRevision: config.policy.revision };
}
export async function trustedCode(use) {
  const server = await createServer({
    root: fileURLToPath(new URL('../', import.meta.url)),
    configFile: false,
    appType: 'custom',
    logLevel: 'error',
    server: { middlewareMode: true, watch: null, ws: false },
  });
  try {
    return await use((name) => server.ssrLoadModule(`/src/pipeline/${name}.ts`));
  } finally {
    await server.close();
  }
}
async function absent(path) {
  try {
    await lstat(path);
  } catch (error) {
    if (error.code === 'ENOENT') return;
    throw error;
  }
  throw new Error('Operator output already exists');
}
// Reserve the final name exclusively after verification. Never recursively remove a final path.
export async function newOutput(path, prepare) {
  const output = resolve(path);
  await absent(output);
  const parent = await lstat(dirname(output));
  if (!parent.isDirectory() || parent.isSymbolicLink()) throw new Error('Unsafe output parent');
  const scratch = await mkdtemp(join(dirname(output), `.${basename(output)}.operator-`));
  let reservation;
  try {
    const result = await prepare(scratch);
    await mkdir(output, { mode: 0o700 });
    reservation = await lstat(output);
    await rename(scratch, output);
    reservation = undefined;
    return result;
  } finally {
    await rm(scratch, { recursive: true, force: true });
    if (reservation) {
      const current = await lstat(output).catch(() => undefined);
      if (current?.dev === reservation.dev && current.ino === reservation.ino)
        await rmdir(output).catch((error) => {
          if (!['ENOENT', 'ENOTEMPTY', 'EEXIST'].includes(error.code)) throw error;
        });
    }
  }
}
export async function writeJson(path, value) {
  await writeFile(path, jsonBytes(value), { flag: 'wx', mode: 0o600 });
}
export function assertApprovedPublication(verified, provenance, inventory, types) {
  const bytes = types.inventoryBytes(verified.inventory);
  if (
    !isDeepStrictEqual(identityOf(verified), provenance.identity) ||
    bytes.length !== provenance.inventory.byteLength ||
    types.sha256Bytes(bytes) !== provenance.inventory.sha256 ||
    verified.inventorySha256 !== provenance.inventory.sha256 ||
    !bytes.equals(types.inventoryBytes(inventory))
  )
    throw new Error('Restored publication approved identity or inventory binding mismatch');
}
export async function main(action) {
  try {
    await action();
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'Publication operator failed');
    process.exitCode = 1;
  }
}
