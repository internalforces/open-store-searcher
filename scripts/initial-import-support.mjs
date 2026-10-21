// Initial-publication composition always executes the adapter repository's current code.
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { lstat, readFile, readdir, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual, promisify } from 'node:util';
import {
  identityOf,
  newOutput,
  readJson,
  trustedCode as loadCurrentCode,
  writeJson,
} from './publication-operator-support.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const run = promisify(execFile);
const binding = (bytes) => ({
  byteLength: bytes.length,
  sha256: createHash('sha256').update(bytes).digest('hex'),
});
const fixedCodeFiles = [
  'package.json',
  'package-lock.json',
  'index.html',
  'tsconfig.json',
  'vite.config.ts',
  'vitest.config.ts',
  'playwright.config.ts',
  'publication/config.json',
  'publication/validation-config.json',
  'publication/initial-import-approvals.json',
  'publication/recovery-approvals.json',
  'reports/source-permission-manifest-2026-08-28.json',
];
async function statOrAbsent(path) {
  try {
    return await lstat(path);
  } catch (error) {
    if (error.code === 'ENOENT') return undefined;
    throw error;
  }
}
async function codeBindings() {
  const names = [];
  async function walk(name) {
    const stat = await lstat(join(root, name));
    if (stat.isSymbolicLink()) throw new Error('Unsafe initial operator code path');
    if (stat.isDirectory()) {
      for (const child of await readdir(join(root, name))) {
        if (child.startsWith('.env')) throw new Error('Secret-like initial operator code path');
        await walk(`${name}/${child}`);
      }
    } else if (stat.isFile()) names.push(name);
    else throw new Error('Unsafe initial operator code entry');
  }
  for (const directory of ['src', 'scripts', 'public', '.github/workflows'])
    if (await statOrAbsent(join(root, directory))) await walk(directory);
  for (const name of fixedCodeFiles) if (await statOrAbsent(join(root, name))) await walk(name);
  const bindings = {};
  for (const name of names.sort()) {
    const path = join(root, name),
      before = await lstat(path);
    const bytes = await readFile(path),
      after = await lstat(path);
    if (
      !before.isFile() ||
      before.isSymbolicLink() ||
      before.dev !== after.dev ||
      before.ino !== after.ino ||
      before.size !== bytes.length ||
      before.size !== after.size ||
      before.mtimeMs !== after.mtimeMs ||
      before.ctimeMs !== after.ctimeMs
    )
      throw new Error('Initial operator code changed during read');
    bindings[name] = binding(bytes);
  }
  return bindings;
}
async function operatorIdentity(mode) {
  const bindings = await codeBindings();
  if (!(await statOrAbsent(join(root, '.git')))) {
    if (mode !== 'local-proof')
      throw new Error('Hosted initial import requires actual clean Git identity');
    const manifest = await readJson(
      join(root, '.initial-import-local-code.json'),
      16 * 1024 * 1024,
    );
    if (
      !isDeepStrictEqual(Object.keys(manifest).sort(), [
        'codeBindings',
        'commit',
        'kind',
        'uncommitted',
        'version',
      ]) ||
      manifest.version !== 1 ||
      manifest.kind !== 'initial-import-local-code' ||
      !/^[a-f0-9]{40}$/.test(manifest.commit) ||
      typeof manifest.uncommitted !== 'boolean' ||
      !isDeepStrictEqual(manifest.codeBindings, bindings)
    )
      throw new Error('Local initial operator manifest does not match current snapshot bytes');
    return {
      commit: manifest.commit,
      uncommitted: manifest.uncommitted,
      codeBindings: bindings,
      runId: null,
    };
  }
  const git = async (...args) =>
    (
      await run('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 })
    ).stdout.trim();
  const commit = await git('rev-parse', 'HEAD');
  const uncommitted = (await git('status', '--porcelain', '--untracked-files=all')) !== '';
  if (!/^[a-f0-9]{40}$/.test(commit)) throw new Error('Invalid initial operator Git identity');
  let runId = null;
  if (mode === 'hosted') {
    runId = Number(process.env.GITHUB_RUN_ID);
    if (
      uncommitted ||
      process.env.GITHUB_ACTIONS !== 'true' ||
      process.env.GITHUB_REF !== 'refs/heads/main' ||
      process.env.GITHUB_REPOSITORY !== 'internalforces/open-store-searcher' ||
      process.env.GITHUB_SHA !== commit ||
      !/^[1-9][0-9]*$/.test(process.env.GITHUB_RUN_ID ?? '') ||
      !Number.isSafeInteger(runId)
    )
      throw new Error(
        'Hosted initial import requires clean current-main GitHub SHA and actual run ID',
      );
  }
  return { commit, uncommitted, codeBindings: bindings, runId };
}
function requireRequest(request) {
  if (!request || !['local-proof', 'hosted'].includes(request.mode))
    throw new Error('Invalid initial import mode');
  const keys =
    request.mode === 'hosted'
      ? ['mode', 'configPath', 'registryPath', 'sourceId', 'output']
      : ['mode', 'configPath', 'archivePath', 'observationPath', 'output'];
  if (
    !isDeepStrictEqual(Object.keys(request).sort(), keys.sort()) ||
    keys.some(
      (key) => typeof request[key] !== 'string' || !request[key] || request[key].startsWith('--'),
    ) ||
    resolve(request.configPath) !== join(root, 'publication/config.json') ||
    (request.mode === 'hosted' &&
      resolve(request.registryPath) !== join(root, 'publication/initial-import-approvals.json'))
  )
    throw new Error(
      'Current repository initial-import configuration and strict arguments required',
    );
}
/** Prepare a complete private artifact transaction; this function never deploys it. */
export async function prepareInitialImport(request) {
  requireRequest(request);
  const outputDirectory = resolve(request.output);
  return loadCurrentCode(async (load) => {
    const { validateInitialImportConfig, selectInitialSourceApproval } =
      await load('initial-import-approval');
    const { INITIAL_SOURCE } = await load('initial-import-types');
    const { stageInitialSource } = await load('stage-initial-source');
    const { verifyPublicationDirectory } = await load('verify-publication-directory');
    const { createRecoveryArchive } = await load('recovery-archive');
    const { inventoryBytes } = await load('recovery-types');
    const { readDeployedBaseline } = await load('read-deployed-baseline');
    const config = validateInitialImportConfig(await readJson(request.configPath, 4 * 1024 * 1024));
    // Inactive authority is rejected before network or source work.
    const approval =
      request.mode === 'hosted'
        ? selectInitialSourceApproval(
            await readJson(request.registryPath, 4 * 1024 * 1024),
            request.sourceId,
            config,
          )
        : null;
    const operator = await operatorIdentity(request.mode);
    const absent = () =>
      readDeployedBaseline(config.previousReleaseUrl, 8 * 1024 * 1024, fetch, {
        baseline: config.baseline,
      });
    const preparation = await newOutput(outputDirectory, async (scratch) => {
      if (request.mode === 'hosted') await absent();
      const files =
        request.mode === 'hosted'
          ? await (await load('initial-source-download')).downloadInitialSource(
              approval,
              join(scratch, 'download'),
            )
          : {
              archivePath: resolve(request.archivePath),
              observationPath: resolve(request.observationPath),
              transport: { kind: 'local-proof' },
            };
      const staged = await stageInitialSource(config, files, join(scratch, 'stage'), {
        now: new Date().toISOString(),
        operator,
      });
      const stageDirectory = staged.stageDirectory;
      if (stageDirectory !== join(scratch, 'stage'))
        throw new Error('Unexpected initial staging directory');
      const receipt = staged.receipt;
      if (
        receipt.mode !== request.mode ||
        receipt.sourceId !== INITIAL_SOURCE.id ||
        !isDeepStrictEqual(receipt.operator, operator) ||
        !isDeepStrictEqual(receipt.transport, files.transport)
      )
        throw new Error('Initial source receipt context mismatch');
      const site = join(scratch, 'site');
      await run(
        process.execPath,
        [join(root, 'scripts/build-publication.mjs'), stageDirectory, site],
        { cwd: root, maxBuffer: 4 * 1024 * 1024 },
      );
      const verified = await verifyPublicationDirectory(site);
      if (
        verified.archiveSha256 !== receipt.archive.sha256 ||
        verified.collectedAt !== receipt.collectedAt ||
        verified.recordCount !== receipt.recordCount ||
        verified.policyRevision !== receipt.policyRevision
      )
        throw new Error('Initial site and source receipt identity mismatch');
      const tar = join(scratch, 'artifact.tar');
      await run(
        'tar',
        [
          '--dereference',
          '--hard-dereference',
          '--directory',
          site,
          '-cf',
          tar,
          '--exclude=.git',
          '--exclude=.github',
          '.',
        ],
        { cwd: root, maxBuffer: 4 * 1024 * 1024 },
      );
      const temporaryGzip = join(scratch, 'packaging-check.tar.gz');
      const packaged = await createRecoveryArchive(tar, temporaryGzip, verified.inventory);
      await rm(temporaryGzip);
      await writeJson(join(scratch, 'source-import.json'), receipt);
      const inventory = inventoryBytes(verified.inventory);
      await writeJson(join(scratch, 'inventory.json'), verified.inventory);
      await writeJson(join(scratch, 'identity.json'), identityOf(verified));
      const preparedAt = new Date().toISOString();
      const prepared = {
        version: 1,
        kind: 'initial-publication-prepared',
        mode: request.mode,
        sourceId: INITIAL_SOURCE.id,
        operator,
        sourceReceipt: binding(await readFile(join(scratch, 'source-import.json'))),
        identity: identityOf(verified),
        inventory: binding(inventory),
        tar: packaged.tar,
        preparedAt,
        expiresAt: new Date(Date.parse(preparedAt) + 24 * 60 * 60 * 1000).toISOString(),
        precondition: request.mode === 'hosted' ? { status: 404, releaseSha256: null } : null,
      };
      await writeJson(join(scratch, 'preparation.json'), prepared);
      await rm(stageDirectory, { recursive: true, force: true });
      await rm(site, { recursive: true, force: true });
      if (request.mode === 'hosted')
        await rm(join(scratch, 'download'), { recursive: true, force: true });
      if (!isDeepStrictEqual(await operatorIdentity(request.mode), operator))
        throw new Error('Initial operator identity changed during preparation');
      // This last public-state read occurs after all owned cleanup, immediately before promotion.
      if (request.mode === 'hosted') await absent();
      return prepared;
    });
    return { outputDirectory, preparation };
  });
}
