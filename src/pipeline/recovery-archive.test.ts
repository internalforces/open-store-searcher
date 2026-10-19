import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import * as fs from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { gunzipSync, gzipSync } from 'node:zlib';
import { afterEach, expect, test, vi } from 'vitest';
import { createRecoveryFixture } from '../../tests/fixtures/publication-recovery.js';
import { createRecoveryArchive, restoreRecoveryArchive } from './recovery-archive.js';
import { scanPublicationDirectory } from './recovery-inventory.js';
import { RECOVERY_LIMITS, type SnapshotInventoryV1 } from './recovery-types.js';

// Copy the native namespace so only explicit fault tests can wrap operations; real I/O stays intact.
vi.mock('node:fs/promises', async (original) => ({
  ...(await original<typeof import('node:fs/promises')>()),
}));

const fixtures: Awaited<ReturnType<typeof createRecoveryFixture>>[] = [];
const run = promisify(execFile);
const binding = (bytes: Buffer) => ({
  byteLength: bytes.length,
  sha256: createHash('sha256').update(bytes).digest('hex'),
});
async function fixture() {
  const f = await createRecoveryFixture();
  fixtures.push(f);
  return { ...f, inventory: await scanPublicationDirectory(f.siteDir) };
}
afterEach(async () => {
  vi.restoreAllMocks();
  await Promise.all(fixtures.splice(0).map((f) => f.cleanup()));
});

// An independent minimal POSIX ustar encoder; production never uses this helper.
function header(name: string, size = 0, type = '0'): Buffer {
  const h = Buffer.alloc(512);
  h.write(name, 0, 100);
  for (const [offset, width, value] of [
    [100, 8, 0o644],
    [108, 8, 0],
    [116, 8, 0],
    [124, 12, size],
    [136, 12, 1],
  ] as const)
    h.write(`${value.toString(8).padStart(width - 1, '0')}\0`, offset, width);
  h.fill(32, 148, 156);
  h.write(type, 156, 1);
  h.write('ustar\0', 257, 6);
  h.write('00', 263, 2);
  checksum(h);
  return h;
}
function checksum(h: Buffer) {
  h.fill(32, 148, 156);
  const sum = h.reduce((n, byte) => n + byte, 0);
  h.write(`${sum.toString(8).padStart(6, '0')}\0 `, 148, 8);
}
function member(name: string, bytes = Buffer.alloc(0), type = '0') {
  return Buffer.concat([
    header(name, bytes.length, type),
    bytes,
    Buffer.alloc((512 - (bytes.length % 512)) % 512),
  ]);
}
async function tarBytes(f: Awaited<ReturnType<typeof fixture>>) {
  const parts: Buffer[] = [
    member('./', Buffer.alloc(0), '5'),
    member('./assets/', Buffer.alloc(0), '5'),
  ];
  for (const entry of f.inventory.files) {
    parts.push(member(`./${entry.name}`, await fs.readFile(join(f.siteDir, entry.name))));
  }
  return Buffer.concat([...parts, Buffer.alloc(1024)]);
}
async function assertRejected(
  f: Awaited<ReturnType<typeof fixture>>,
  raw: Buffer,
  expected: SnapshotInventoryV1 = f.inventory,
  error?: string | RegExp,
) {
  const gzip = gzipSync(raw);
  const input = join(f.root, 'bad.gz');
  const output = join(f.root, 'restored');
  await fs.writeFile(input, gzip);
  await expect(
    restoreRecoveryArchive(input, { tar: binding(raw), gzip: binding(gzip) }, expected, output),
  ).rejects.toThrow(error);
  expect(await scanPublicationDirectory(f.siteDir)).toEqual(f.inventory);
  expect(existsSync(output)).toBe(false);
  expect((await fs.readdir(f.root)).filter((n) => n.includes('.recovery-'))).toEqual([]);
}

test('round trips actual GNU Pages tar preserving all original bytes without executing app code', async () => {
  const f = await fixture();
  const tar = join(f.root, 'artifact.tar');
  await run('tar', [
    '--dereference',
    '--hard-dereference',
    '--directory',
    f.siteDir,
    '-cf',
    tar,
    '--exclude=.git',
    '--exclude=.github',
    '.',
  ]);
  const original = await fs.readFile(tar);
  const gzip = join(f.root, 'snapshot.tar.gz');
  const bindings = await createRecoveryArchive(tar, gzip, f.inventory);
  expect(bindings.tar).toEqual(binding(original));
  expect(gunzipSync(await fs.readFile(gzip))).toEqual(original);
  const restored = await restoreRecoveryArchive(
    gzip,
    bindings,
    f.inventory,
    join(f.root, 'restored'),
  );
  expect(await fs.readFile(restored.tarPath)).toEqual(original);
  expect(await scanPublicationDirectory(restored.siteDir)).toEqual(f.inventory);
  expect(existsSync(join(f.root, 'executed'))).toBe(false);
  for (const entry of f.inventory.files)
    expect(await fs.readFile(join(restored.siteDir, entry.name))).toEqual(
      await fs.readFile(join(f.siteDir, entry.name)),
    );
});

test('accepts POSIX prefix paths NUL regular type and root directory semantics', async () => {
  const f = await fixture();
  const parts: Buffer[] = [member('./', Buffer.alloc(0), '5')];
  for (const entry of f.inventory.files) {
    const bytes = await fs.readFile(join(f.siteDir, entry.name));
    const h = header(entry.name, bytes.length, '\0');
    if (entry.name.startsWith('assets/')) {
      h.fill(0, 0, 100);
      h.write(entry.name.slice(7), 0);
      h.write('assets', 345);
      checksum(h);
    }
    parts.push(h, bytes, Buffer.alloc((512 - (bytes.length % 512)) % 512));
  }
  const raw = Buffer.concat([...parts, Buffer.alloc(1024)]);
  const path = join(f.root, 'ustar.tar');
  await fs.writeFile(path, raw);
  const bindings = await createRecoveryArchive(path, join(f.root, 'ustar.gz'), f.inventory);
  const restored = await restoreRecoveryArchive(
    join(f.root, 'ustar.gz'),
    bindings,
    f.inventory,
    join(f.root, 'restored'),
  );
  expect(await scanPublicationDirectory(restored.siteDir)).toEqual(f.inventory);
});

test.each(['../x', '/x', 'a/../b', 'a\\b', '%2e%2e/x', '././index.html', 'a//b'])(
  'rejects unsafe tar name %s before materialization',
  async (name) => {
    const f = await fixture();
    await assertRejected(f, Buffer.concat([member(name), Buffer.alloc(1024)]));
  },
);
test.each(['1', '2', '3', '4', '6', 'L', 'K', 'x', 'g', 'S'])(
  'rejects unsupported link device or extension type %s',
  async (type) => {
    const f = await fixture();
    const raw = await tarBytes(f);
    const offset = raw.indexOf(Buffer.from('./index.html\0'));
    raw.write(type, offset + 156, 1);
    checksum(raw.subarray(offset, offset + 512));
    await assertRejected(f, raw, f.inventory, 'Unsupported tar member type');
  },
);
test.each([
  'duplicate-file',
  'duplicate-directory',
  'file-directory',
  'parent-file',
  'directory-body',
])('rejects %s conflicts', async (kind) => {
  const f = await fixture();
  const valid = (await tarBytes(f)).subarray(0, -1024);
  const extras: Record<string, Buffer> = {
    'duplicate-file': member('./index.html'),
    'duplicate-directory': member('assets/', Buffer.alloc(0), '5'),
    'file-directory': member('index.html/', Buffer.alloc(0), '5'),
    'parent-file': member('index.html/child'),
    'directory-body': member('empty/', Buffer.alloc(512), '5'),
  };
  await assertRejected(
    f,
    Buffer.concat([valid, extras[kind] ?? Buffer.alloc(0), Buffer.alloc(1024)]),
  );
});

test.each([
  'checksum',
  'octal-overflow',
  'base256',
  'invalid-octal',
  'unknown-magic',
  'truncated-header',
  'truncated-body',
  'truncated-end',
  'single-zero-block',
  'nonzero-tail',
  'nonzero-padding',
  'hidden-name',
  'link-field',
])('rejects malformed tar %s and removes all owned candidates', async (kind) => {
  const f = await fixture();
  let raw = await tarBytes(f);
  if (kind === 'checksum') raw[148] = 49;
  else if (kind === 'octal-overflow') {
    const oversized = header('index.html');
    oversized.fill(55, 124, 136);
    checksum(oversized);
    raw = Buffer.concat([oversized, Buffer.alloc(1024)]);
  } else if (kind === 'base256') {
    raw[124] = 128;
    checksum(raw.subarray(0, 512));
  } else if (kind === 'invalid-octal') {
    raw[136] = 56;
    checksum(raw.subarray(0, 512));
  } else if (kind === 'unknown-magic') {
    raw[257] = 120;
    checksum(raw.subarray(0, 512));
  } else if (kind === 'truncated-header') raw = raw.subarray(0, 511);
  else if (kind === 'truncated-body') {
    const bodyStart = raw.indexOf(Buffer.from('<script type="module"'));
    raw = raw.subarray(0, bodyStart);
  } else if (kind === 'truncated-end') raw = raw.subarray(0, -1);
  else if (kind === 'single-zero-block') raw = raw.subarray(0, -512);
  else if (kind === 'nonzero-tail') raw = Buffer.concat([raw, member('surprise')]);
  else if (kind === 'nonzero-padding') {
    const index = raw.indexOf(Buffer.from('<script type="module"'));
    const size = f.inventory.files.find((e) => e.name === 'index.html')?.byteLength ?? 0;
    raw[index + size] = 1;
  } else if (kind === 'hidden-name') {
    raw[4] = 120;
    checksum(raw.subarray(0, 512));
  } else {
    raw[157] = 120;
    checksum(raw.subarray(0, 512));
  }
  const errors: Record<string, string> = {
    checksum: 'Bad tar checksum',
    'octal-overflow': 'oversized tar file',
    base256: 'Invalid tar octal',
    'invalid-octal': 'Invalid tar octal',
    'unknown-magic': 'Unsupported tar format',
    'truncated-header': 'Truncated tar block',
    'truncated-body': 'Truncated tar body',
    'truncated-end': 'Truncated tar block',
    'single-zero-block': 'Incomplete tar or inventory',
    'nonzero-tail': 'after end marker',
    'nonzero-padding': 'Nonzero tar padding',
    'hidden-name': 'Hidden tar field bytes',
    'link-field': 'Tar link field present',
  };
  await assertRejected(f, raw, f.inventory, errors[kind]);
});

test.each([
  'gzip-hash',
  'gzip-length',
  'tar-hash',
  'tar-length',
  'file-hash',
  'missing-file',
  'extra-file',
])('rejects %s binding mismatch while preserving previous complete site', async (kind) => {
  const f = await fixture();
  let raw = await tarBytes(f);
  const expected = structuredClone(f.inventory);
  if (kind === 'missing-file') {
    expected.files.push({
      name: 'missing',
      byteLength: 0,
      sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    });
    expected.files.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  }
  if (kind === 'file-hash') {
    const e = expected.files.find((e) => e.name === 'index.html');
    if (e) e.sha256 = '0'.repeat(64);
  }
  if (kind === 'extra-file')
    raw = Buffer.concat([raw.subarray(0, -1024), member('extra'), Buffer.alloc(1024)]);
  const gzip = gzipSync(raw);
  const b = { tar: binding(raw), gzip: binding(gzip) };
  if (kind === 'gzip-hash') b.gzip.sha256 = '0'.repeat(64);
  if (kind === 'tar-hash') b.tar.sha256 = '0'.repeat(64);
  if (kind === 'gzip-length') b.gzip.byteLength++;
  if (kind === 'tar-length') b.tar.byteLength++;
  const input = join(f.root, 'input.gz');
  await fs.writeFile(input, gzip);
  await expect(
    restoreRecoveryArchive(input, b, expected, join(f.root, 'restored')),
  ).rejects.toThrow();
  expect(await scanPublicationDirectory(f.siteDir)).toEqual(f.inventory);
  expect(existsSync(join(f.root, 'restored'))).toBe(false);
  expect((await fs.readdir(f.root)).filter((n) => n.includes('.recovery-'))).toEqual([]);
});

test.each([
  'maxTarBytes',
  'maxGzipBytes',
  'maxFileBytes',
  'maxSiteBytes',
  'maxFiles',
  'maxTarMembers',
])('enforces lowering-only %s bounds during real archive processing', async (limit) => {
  const f = await fixture();
  const raw = await tarBytes(f);
  const gzip = gzipSync(raw);
  const input = join(f.root, 'input.gz');
  await fs.writeFile(input, gzip);
  const maxima: Record<string, number> = {
    maxTarBytes: raw.length - 1,
    maxGzipBytes: gzip.length - 1,
    maxFileBytes: 1,
    maxSiteBytes: f.inventory.totalBytes - 1,
    maxFiles: f.inventory.files.length - 1,
    maxTarMembers: f.inventory.files.length + 1,
  };
  await expect(
    restoreRecoveryArchive(
      input,
      { tar: binding(raw), gzip: binding(gzip) },
      f.inventory,
      join(f.root, 'restored'),
      { [limit]: maxima[limit] },
    ),
  ).rejects.toThrow();
  expect(existsSync(join(f.root, 'restored'))).toBe(false);
  expect((await fs.readdir(f.root)).filter((n) => n.includes('.recovery-'))).toEqual([]);
});

test('bounds gzip expansion independently of a forged small tar binding', async () => {
  const f = await fixture();
  const raw = Buffer.alloc(100_000);
  const gzip = gzipSync(raw);
  const input = join(f.root, 'bomb.gz');
  await fs.writeFile(input, gzip);
  await expect(
    restoreRecoveryArchive(
      input,
      { tar: { ...binding(raw), byteLength: 512 }, gzip: binding(gzip) },
      f.inventory,
      join(f.root, 'restored'),
      { maxTarBytes: 1024 },
    ),
  ).rejects.toThrow();
  expect(await scanPublicationDirectory(f.siteDir)).toEqual(f.inventory);
  expect(existsSync(join(f.root, 'restored'))).toBe(false);
  expect((await fs.readdir(f.root)).filter((n) => n.includes('.recovery-'))).toEqual([]);
});

test('rejects raised unsafe or unknown injected limits', async () => {
  const f = await fixture();
  const path = join(f.root, 'input.tar');
  await fs.writeFile(path, await tarBytes(f));
  for (const limits of [
    { maxTarBytes: RECOVERY_LIMITS.maxTarBytes + 1 },
    { maxFiles: NaN },
    { maxFiles: -1 },
    { unknown: 1 },
  ]) {
    await expect(
      createRecoveryArchive(path, join(f.root, 'out.gz'), f.inventory, limits),
    ).rejects.toThrow();
  }
});

test.each(['symlink', 'hardlink', 'directory'])(
  'rejects %s archive inputs with role-specific no-follow reads',
  async (kind) => {
    const f = await fixture();
    const original = join(f.root, 'real.tar');
    await fs.writeFile(original, await tarBytes(f));
    const input = join(f.root, 'input.tar');
    if (kind === 'symlink') await fs.symlink(original, input);
    else if (kind === 'hardlink') await fs.link(original, input);
    else await fs.mkdir(input);
    await expect(
      createRecoveryArchive(input, join(f.root, 'out.gz'), f.inventory),
    ).rejects.toThrow();
    expect(existsSync(join(f.root, 'out.gz'))).toBe(false);
  },
);

test('creation rejects invalid tar and never clobbers an existing gzip', async () => {
  const f = await fixture();
  const tar = join(f.root, 'input.tar');
  const out = join(f.root, 'out.gz');
  await fs.writeFile(tar, Buffer.from('invalid'));
  await expect(createRecoveryArchive(tar, out, f.inventory)).rejects.toThrow();
  expect(existsSync(out)).toBe(false);
  await fs.writeFile(tar, await tarBytes(f));
  await fs.writeFile(out, 'existing');
  await expect(createRecoveryArchive(tar, out, f.inventory)).rejects.toThrow();
  expect(await fs.readFile(out, 'utf8')).toBe('existing');
});

test('restoration refuses an existing output and preserves its complete inventory', async () => {
  const f = await fixture();
  const raw = await tarBytes(f);
  const gzip = gzipSync(raw);
  const input = join(f.root, 'input.gz');
  await fs.writeFile(input, gzip);
  await expect(
    restoreRecoveryArchive(
      input,
      { tar: binding(raw), gzip: binding(gzip) },
      f.inventory,
      f.siteDir,
    ),
  ).rejects.toThrow();
  expect(await scanPublicationDirectory(f.siteDir)).toEqual(f.inventory);
});

test('a byte-valid inventory with invalid V2 content cannot be promoted', async () => {
  const f = await fixture();
  await fs.writeFile(join(f.siteDir, 'release.json'), '{}');
  f.inventory = await scanPublicationDirectory(f.siteDir);
  await assertRejected(f, await tarBytes(f));
});

test.each(['/', '', '././'])(
  'rejects directory alias %s instead of treating it as root',
  async (name) => {
    const f = await fixture();
    await assertRejected(
      f,
      Buffer.concat([member(name, Buffer.alloc(0), '5'), Buffer.alloc(1024)]),
    );
  },
);

test.each(['truncated', 'corrupt'])(
  'rejects %s gzip and removes partial decompression',
  async (kind) => {
    const f = await fixture();
    const raw = await tarBytes(f);
    let gzip = gzipSync(raw);
    if (kind === 'truncated') gzip = gzip.subarray(0, -4);
    else gzip.writeUInt8(gzip.readUInt8(gzip.length - 8) ^ 1, gzip.length - 8);
    const input = join(f.root, 'input.gz');
    await fs.writeFile(input, gzip);
    await expect(
      restoreRecoveryArchive(
        input,
        { tar: binding(raw), gzip: binding(gzip) },
        f.inventory,
        join(f.root, 'restored'),
      ),
    ).rejects.toThrow();
    expect(await scanPublicationDirectory(f.siteDir)).toEqual(f.inventory);
    expect(existsSync(join(f.root, 'restored'))).toBe(false);
    expect((await fs.readdir(f.root)).filter((n) => n.includes('.recovery-'))).toEqual([]);
  },
);

test('a partial extraction write failure removes candidate and preserves previous inventory', async () => {
  const f = await fixture();
  const raw = await tarBytes(f);
  const gzip = gzipSync(raw);
  const input = join(f.root, 'input.gz');
  await fs.writeFile(input, gzip);
  const actualOpen = fs.open;
  const spy = vi.spyOn(fs, 'open').mockImplementation(async (...args) => {
    const handle = await actualOpen(...args);
    if (String(args[0]).includes('.recovery-') && String(args[0]).endsWith('/site/index.html')) {
      const write = handle.write.bind(handle);
      handle.write = (async (...writeArgs: Parameters<typeof handle.write>) => {
        await write(...writeArgs);
        throw new Error('Injected disk failure after partial write');
      }) as typeof handle.write;
    }
    return handle;
  });
  await expect(
    restoreRecoveryArchive(
      input,
      { tar: binding(raw), gzip: binding(gzip) },
      f.inventory,
      join(f.root, 'restored'),
    ),
  ).rejects.toThrow('Injected disk failure');
  spy.mockRestore();
  expect(await scanPublicationDirectory(f.siteDir)).toEqual(f.inventory);
  expect(existsSync(join(f.root, 'restored'))).toBe(false);
  expect((await fs.readdir(f.root)).filter((n) => n.includes('.recovery-'))).toEqual([]);
});

test.each(['before-reservation', 'populated-reservation'])(
  'preserves competing final output %s and removes only owned scratch',
  async (when) => {
    const f = await fixture();
    const raw = await tarBytes(f);
    const gzip = gzipSync(raw);
    const input = join(f.root, 'input.gz');
    const output = join(f.root, 'restored');
    await fs.writeFile(input, gzip);
    const actualMkdir = fs.mkdir;
    const actualRename = fs.rename;
    if (when === 'before-reservation') {
      vi.spyOn(fs, 'mkdir').mockImplementation((async (...args: Parameters<typeof fs.mkdir>) => {
        if (String(args[0]) === output) {
          await actualMkdir(output);
          await fs.writeFile(join(output, 'competitor'), 'keep');
        }
        return actualMkdir(...args);
      }) as typeof fs.mkdir);
    } else {
      vi.spyOn(fs, 'rename').mockImplementation(async (...args) => {
        if (String(args[1]) === output) await fs.writeFile(join(output, 'competitor'), 'keep');
        return actualRename(...args);
      });
    }
    await expect(
      restoreRecoveryArchive(
        input,
        { tar: binding(raw), gzip: binding(gzip) },
        f.inventory,
        output,
      ),
    ).rejects.toThrow();
    vi.restoreAllMocks();
    expect(await fs.readFile(join(output, 'competitor'), 'utf8')).toBe('keep');
    expect(await fs.readdir(output)).toEqual(['competitor']);
    expect(await scanPublicationDirectory(f.siteDir)).toEqual(f.inventory);
    expect((await fs.readdir(f.root)).filter((n) => n.includes('.recovery-'))).toEqual([]);
  },
);

test('failed atomic rename removes its own still-empty reservation', async () => {
  const f = await fixture();
  const raw = await tarBytes(f);
  const gzip = gzipSync(raw);
  const input = join(f.root, 'input.gz');
  const output = join(f.root, 'restored');
  await fs.writeFile(input, gzip);
  vi.spyOn(fs, 'rename').mockRejectedValue(new Error('Injected rename failure'));
  await expect(
    restoreRecoveryArchive(input, { tar: binding(raw), gzip: binding(gzip) }, f.inventory, output),
  ).rejects.toThrow('Injected rename failure');
  expect(existsSync(output)).toBe(false);
  expect(await scanPublicationDirectory(f.siteDir)).toEqual(f.inventory);
  expect((await fs.readdir(f.root)).filter((n) => n.includes('.recovery-'))).toEqual([]);
});

test('rehashes original tar after compression and rejects same-size input mutation', async () => {
  const f = await fixture();
  const raw = await tarBytes(f);
  const input = join(f.root, 'input.tar');
  const output = join(f.root, 'snapshot.gz');
  await fs.writeFile(input, raw);
  const actualOpen = fs.open;
  let reads = 0;
  vi.spyOn(fs, 'open').mockImplementation(async (...args) => {
    if (String(args[0]) === input && ++reads === 3) {
      const changed = Buffer.from(raw);
      changed.writeUInt8(changed.readUInt8(0) ^ 1, 0);
      await fs.writeFile(input, changed);
    }
    return actualOpen(...args);
  });
  await expect(createRecoveryArchive(input, output, f.inventory)).rejects.toThrow(
    /changed|binding mismatch/,
  );
  expect(existsSync(output)).toBe(false);
  expect((await fs.readdir(f.root)).filter((n) => n.includes('.recovery-'))).toEqual([]);
});

test('rehashes original gzip after verification and rejects replacement before promotion', async () => {
  const f = await fixture();
  const raw = await tarBytes(f);
  const gzip = gzipSync(raw);
  const input = join(f.root, 'input.gz');
  const output = join(f.root, 'restored');
  await fs.writeFile(input, gzip);
  const actualOpen = fs.open;
  let reads = 0;
  vi.spyOn(fs, 'open').mockImplementation(async (...args) => {
    if (String(args[0]) === input && ++reads === 3) {
      const changed = Buffer.from(gzip);
      changed.writeUInt8(changed.readUInt8(0) ^ 1, 0);
      await fs.writeFile(input, changed);
    }
    return actualOpen(...args);
  });
  await expect(
    restoreRecoveryArchive(input, { tar: binding(raw), gzip: binding(gzip) }, f.inventory, output),
  ).rejects.toThrow(/changed|binding mismatch/);
  expect(existsSync(output)).toBe(false);
  expect(await scanPublicationDirectory(f.siteDir)).toEqual(f.inventory);
  expect((await fs.readdir(f.root)).filter((n) => n.includes('.recovery-'))).toEqual([]);
});

test('accepts exact lowered bounds with raw tar larger than the per-site-file ceiling', async () => {
  const f = await fixture();
  const raw = await tarBytes(f);
  const tar = join(f.root, 'input.tar');
  await fs.writeFile(tar, raw);
  const gzip = join(f.root, 'snapshot.gz');
  const limits = {
    maxTarBytes: raw.length,
    maxFileBytes: Math.max(...f.inventory.files.map((e) => e.byteLength)),
    maxSiteBytes: f.inventory.totalBytes,
    maxFiles: f.inventory.files.length,
    maxTarMembers: f.inventory.files.length + 2,
  };
  expect(raw.length).toBeGreaterThan(limits.maxFileBytes);
  const b = await createRecoveryArchive(tar, gzip, f.inventory, limits);
  const restored = await restoreRecoveryArchive(gzip, b, f.inventory, join(f.root, 'restored'), {
    ...limits,
    maxGzipBytes: b.gzip.byteLength,
  });
  expect(await fs.readFile(restored.tarPath)).toEqual(raw);
  expect(await scanPublicationDirectory(restored.siteDir)).toEqual(f.inventory);
});

test('creation enforces the gzip output ceiling while streaming and cleans partial bytes', async () => {
  const f = await fixture();
  const raw = await tarBytes(f);
  const input = join(f.root, 'input.tar');
  const output = join(f.root, 'snapshot.gz');
  await fs.writeFile(input, raw);
  await expect(
    createRecoveryArchive(input, output, f.inventory, { maxGzipBytes: 1 }),
  ).rejects.toThrow('byte limit');
  expect(existsSync(output)).toBe(false);
  expect((await fs.readdir(f.root)).filter((n) => n.includes('.recovery-'))).toEqual([]);
});

test.each(['symlink', 'hardlink', 'directory'])(
  'restoration rejects %s gzip input before creating output',
  async (kind) => {
    const f = await fixture();
    const raw = await tarBytes(f);
    const gzip = gzipSync(raw);
    const original = join(f.root, 'real.gz');
    const input = join(f.root, 'input.gz');
    await fs.writeFile(original, gzip);
    if (kind === 'symlink') await fs.symlink(original, input);
    else if (kind === 'hardlink') await fs.link(original, input);
    else await fs.mkdir(input);
    await expect(
      restoreRecoveryArchive(
        input,
        { tar: binding(raw), gzip: binding(gzip) },
        f.inventory,
        join(f.root, 'restored'),
      ),
    ).rejects.toThrow('Unsafe or oversized archive');
    expect(existsSync(join(f.root, 'restored'))).toBe(false);
    expect(await scanPublicationDirectory(f.siteDir)).toEqual(f.inventory);
  },
);
