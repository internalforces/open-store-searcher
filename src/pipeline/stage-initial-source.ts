import { createHash } from 'node:crypto';
import { constants, type Stats } from 'node:fs';
import {
  lstat,
  mkdir,
  mkdtemp,
  open,
  readFile,
  rename,
  rm,
  rmdir,
  writeFile,
  type FileHandle,
} from 'node:fs/promises';
import { basename, dirname, join, parse, resolve, sep } from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { parseArchiveContract } from './archive-contract.js';
import {
  DEFAULT_COLLECTOR_LIMITS,
  isCanonicalUtc,
  type CollectionResult,
  type PermissionManifest,
} from './collector-types.js';
import {
  validateInitialImportConfig,
  validateInitialSourceApproval,
} from './initial-import-approval.js';
import {
  INITIAL_SOURCE,
  type InitialImportConfigV1,
  type InitialSourceFilesV1,
  type InitialOperatorV1,
  type RetainedSourceImportReceiptV1,
} from './initial-import-types.js';
import { inspectArchive } from './inspect-archive.js';
import { iterateLicenseCsv } from './parse-license-csv.js';
import type { ByteBinding } from './recovery-types.js';
import { stageBoundedRelease, type CategoryRows } from './stage-bounded-release.js';
import { UnzipArchiveAdapter, runProcess, UTF8_UNZIP_OPTIONS } from './unzip-archive.js';
import { validateMeasuredRefresh } from './validate-license-refresh.js';

const digest = (bytes: Uint8Array | string) => createHash('sha256').update(bytes).digest('hex');
function requireInitial(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Initial source ${message}`);
}
function exactBinding(actual: ByteBinding, expected: ByteBinding) {
  requireInitial(
    actual.byteLength === expected.byteLength && actual.sha256 === expected.sha256,
    'byte binding mismatch',
  );
}

/** Exact historical bytes are authority; only the caller's local archive path is added. */
export function readInitialObservation(
  bytes: Uint8Array,
  archivePath: string,
): Omit<Extract<CollectionResult, { kind: 'accepted' }>, 'archivePath'> & { archivePath: string } {
  exactBinding({ byteLength: bytes.byteLength, sha256: digest(bytes) }, INITIAL_SOURCE.observation);
  let observation: {
    collection: Omit<Extract<CollectionResult, { kind: 'accepted' }>, 'archivePath'>;
    sourceDataAsOf: unknown;
  };
  try {
    observation = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch {
    throw new Error('Initial source observation is not valid UTF-8 JSON');
  }
  const collection = observation.collection;
  requireInitial(
    digest(JSON.stringify(collection)) === INITIAL_SOURCE.collectionCanonicalSha256 &&
      collection.kind === 'accepted' &&
      collection.fetchedAt === INITIAL_SOURCE.collectedAt &&
      collection.sha256 === INITIAL_SOURCE.archive.sha256 &&
      collection.byteLength === INITIAL_SOURCE.archive.byteLength &&
      observation.sourceDataAsOf === null,
    'historical observation mismatch',
  );
  return { ...collection, archivePath };
}

async function existing(path: string) {
  try {
    return await lstat(path);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    return undefined;
  }
}
async function safeAncestors(path: string) {
  let current = parse(path).root;
  for (const part of path.slice(current.length).split(sep).filter(Boolean)) {
    current = join(current, part);
    const stat = await lstat(current);
    requireInitial(stat.isDirectory() && !stat.isSymbolicLink(), 'unsafe path ancestor');
  }
}
function sameFile(a: Stats, b: Stats) {
  return a.dev === b.dev && a.ino === b.ino;
}
function sameVersion(a: Stats, b: Stats) {
  return sameFile(a, b) && a.size === b.size && a.mtimeMs === b.mtimeMs && a.ctimeMs === b.ctimeMs;
}
async function openInput(path: string, expected: ByteBinding) {
  await safeAncestors(dirname(path));
  const initial = await lstat(path);
  requireInitial(
    initial.isFile() && !initial.isSymbolicLink() && initial.size === expected.byteLength,
    'input must be an exact regular file',
  );
  const handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const actual = await handle.stat();
    requireInitial(actual.isFile() && sameVersion(initial, actual), 'input identity changed');
    return { handle, path, initial, expected };
  } catch (error) {
    await handle.close();
    throw error;
  }
}
type Input = Awaited<ReturnType<typeof openInput>>;
async function hashInput(input: Input, copy?: FileHandle): Promise<ByteBinding> {
  const hash = createHash('sha256');
  let byteLength = 0;
  const stream = input.handle.createReadStream({ start: 0, autoClose: false });
  // The held FileHandle owns descriptor lifetime. Explicitly destroying even an ended
  // autoClose:false stream closes that handle on Node 24 and breaks later identity checks.
  for await (const chunk of stream) {
    byteLength += chunk.length;
    requireInitial(byteLength <= input.expected.byteLength, 'input byte limit exceeded');
    hash.update(chunk);
    if (copy) await copy.writeFile(chunk);
  }
  const binding = { byteLength, sha256: hash.digest('hex') };
  exactBinding(binding, input.expected);
  await unchanged(input);
  return binding;
}
async function unchanged(input: Input) {
  await safeAncestors(dirname(input.path));
  const current = await lstat(input.path);
  requireInitial(
    current.isFile() &&
      !current.isSymbolicLink() &&
      sameVersion(current, input.initial) &&
      sameVersion(await input.handle.stat(), input.initial),
    'input changed',
  );
}
async function readObservation(input: Input) {
  const bytes = Buffer.alloc(input.expected.byteLength);
  let offset = 0;
  while (offset < bytes.length) {
    const { bytesRead } = await input.handle.read(bytes, offset, bytes.length - offset, offset);
    requireInitial(bytesRead > 0, 'observation truncated');
    offset += bytesRead;
  }
  exactBinding({ byteLength: bytes.length, sha256: digest(bytes) }, input.expected);
  await unchanged(input);
  return bytes;
}
async function requireNewOutput(output: string) {
  await safeAncestors(dirname(output));
  requireInitial(!(await existing(output)), 'output already exists');
}
async function removeOwned(path: string, owner: Stats, directory = true) {
  const current = await existing(path);
  if (current && sameFile(current, owner)) await rm(path, { recursive: directory, force: true });
}
function admittedContext(files: InitialSourceFilesV1, operator: InitialOperatorV1, now: string) {
  requireInitial(isCanonicalUtc(now), 'validation clock is invalid');
  requireInitial(
    /^[a-f0-9]{40}$/.test(operator.commit) &&
      typeof operator.uncommitted === 'boolean' &&
      operator.codeBindings !== null &&
      typeof operator.codeBindings === 'object' &&
      !Array.isArray(operator.codeBindings),
    'operator is invalid',
  );
  for (const binding of Object.values(operator.codeBindings))
    requireInitial(
      Number.isSafeInteger(binding.byteLength) &&
        binding.byteLength >= 0 &&
        /^[a-f0-9]{64}$/.test(binding.sha256),
      'operator byte binding is invalid',
    );
  if (files.transport.kind === 'github-release') {
    requireInitial(
      !operator.uncommitted &&
        Number.isSafeInteger(operator.runId) &&
        (operator.runId ?? 0) > 0 &&
        isCanonicalUtc(files.transport.downloadedAt),
      'hosted context is invalid',
    );
    const { assetNames: _assetNames, ...source } = INITIAL_SOURCE;
    validateInitialSourceApproval({
      ...source,
      releaseId: files.transport.releaseId,
      tag: files.transport.tag,
      tagCommit: files.transport.tagCommit,
      assets: files.transport.assets,
    });
  } else
    requireInitial(
      files.transport.kind === 'local-proof' &&
        Object.keys(files.transport).length === 1 &&
        operator.runId === null &&
        (!operator.uncommitted || Object.keys(operator.codeBindings).length > 0),
      'local proof context is invalid',
    );
}

/** A private outer transaction prevents an inner acceptance from escaping later checks. */
export async function stageInitialSource(
  config: InitialImportConfigV1,
  files: InitialSourceFilesV1,
  newOutput: string,
  context: { now: string; operator: InitialOperatorV1 },
) {
  const approved = validateInitialImportConfig(config);
  // Freeze the caller's evidence at entry; later caller mutation cannot rewrite the receipt.
  const retainedFiles = structuredClone(files);
  const operator = structuredClone(context.operator);
  const now = context.now;
  admittedContext(retainedFiles, operator, now);
  const output = resolve(newOutput);
  await requireNewOutput(output);
  const work = await mkdtemp(join(dirname(output), `.${basename(output)}-initial-`));
  const owner = await lstat(work);
  let archive: Input | undefined;
  let observation: Input | undefined;
  try {
    archive = await openInput(resolve(retainedFiles.archivePath), INITIAL_SOURCE.archive);
    observation = await openInput(
      resolve(retainedFiles.observationPath),
      INITIAL_SOURCE.observation,
    );
    const snapshotPath = join(work, 'source.zip');
    const collection = readInitialObservation(await readObservation(observation), snapshotPath);
    const snapshot = await open(snapshotPath, 'wx', 0o600);
    try {
      await hashInput(archive, snapshot);
    } finally {
      await snapshot.close();
    }
    const snapshotInput = await openInput(snapshotPath, INITIAL_SOURCE.archive);
    try {
      await hashInput(snapshotInput);
    } finally {
      await snapshotInput.handle.close();
    }
    const archiveContract = parseArchiveContract(
      JSON.parse(
        await readFile(new URL('./contracts/seoul-archive-contract.json', import.meta.url), 'utf8'),
      ),
    );
    const permissionManifest = JSON.parse(
      await readFile(
        new URL('../../reports/source-permission-manifest-2026-08-28.json', import.meta.url),
        'utf8',
      ),
    ) as PermissionManifest;
    const limits = { ...DEFAULT_COLLECTOR_LIMITS };
    const adapter = new UnzipArchiveAdapter('unzip', limits);
    requireInitial(
      (await adapter.checkEnvironment()).ok,
      'approved Linux Info-ZIP environment required',
    );
    const inspected = await inspectArchive({
      adapter,
      archivePath: snapshotPath,
      permissionManifest,
      contract: archiveContract,
      limits,
    });
    requireInitial(
      inspected.kind === 'accepted' &&
        isDeepStrictEqual(inspected.evidence, collection.archiveEvidence),
      'fresh archive inspection mismatch',
    );
    requireInitial(
      archiveContract.entries.length === INITIAL_SOURCE.categoryCount &&
        new Set(archiveContract.entries.map((entry) => entry.fileDataId)).size ===
          INITIAL_SOURCE.categoryCount,
      'category inventory mismatch',
    );
    const input = {
      dateBasis: 'collection' as const,
      collection,
      archiveContract,
      permissionManifest,
      policy: approved.policy,
      baseline: approved.baseline,
      reviewedUnverifiedPairs: approved.reviewedUnverifiedPairs,
      now,
    };
    let totalRows = 0;
    let categoryCount = 0;
    const categories = async function* (): AsyncGenerator<CategoryRows> {
      for (const entry of archiveContract.entries) {
        const extracted = await runProcess({
          executable: 'unzip',
          args: [...UTF8_UNZIP_OPTIONS, '-p', snapshotPath, entry.entryName],
          maxOutputBytes: approved.maxEntryBytes,
          timeoutMs: approved.entryTimeoutMs,
        });
        requireInitial(
          extracted.exitCode === 0 &&
            !extracted.truncated &&
            extracted.stdout.byteLength <= approved.maxEntryBytes,
          'bounded extraction failed',
        );
        let consumed = false;
        function* rows() {
          for (const row of iterateLicenseCsv(
            extracted.stdout,
            entry,
            approved.maxTotalRows - totalRows,
          )) {
            requireInitial(totalRows < approved.maxTotalRows, 'total row limit exceeded');
            totalRows++;
            yield row;
          }
          consumed = true;
        }
        yield { entry, rows: rows() };
        requireInitial(consumed, 'category rows were not fully consumed');
        categoryCount++;
      }
    };
    const staged = await stageBoundedRelease(input, categories(), join(work, 'release'));
    requireInitial(categoryCount === INITIAL_SOURCE.categoryCount, 'category stream incomplete');
    requireInitial(
      isDeepStrictEqual(staged.metrics, approved.baseline.metrics),
      'final metrics mismatch',
    );
    requireInitial(totalRows === INITIAL_SOURCE.recordCount, 'record count mismatch');
    const validation = validateMeasuredRefresh(input, () => ({
      candidate: true,
      metrics: staged.metrics,
    }));
    requireInitial(validation.kind === 'accepted', 'final validation rejected');
    await hashInput(archive);
    await readObservation(observation);
    const finalSnapshot = await openInput(snapshotPath, INITIAL_SOURCE.archive);
    try {
      await hashInput(finalSnapshot);
    } finally {
      await finalSnapshot.handle.close();
    }
    await rm(snapshotPath);
    const receipt: RetainedSourceImportReceiptV1 = {
      version: 1,
      kind: 'retained-source-import-verified',
      sourceId: INITIAL_SOURCE.id,
      mode: retainedFiles.transport.kind === 'github-release' ? 'hosted' : 'local-proof',
      archive: { ...INITIAL_SOURCE.archive },
      observation: { ...INITIAL_SOURCE.observation },
      collectedAt: INITIAL_SOURCE.collectedAt,
      sourceDataAsOf: null,
      schemaManifestSha256: INITIAL_SOURCE.schemaManifestSha256,
      categoryCount: INITIAL_SOURCE.categoryCount,
      recordCount: INITIAL_SOURCE.recordCount,
      policyRevision: INITIAL_SOURCE.policyRevision,
      policyCanonicalSha256: INITIAL_SOURCE.policyCanonicalSha256,
      baselineCanonicalSha256: INITIAL_SOURCE.baselineCanonicalSha256,
      reviewedPairsCanonicalSha256: INITIAL_SOURCE.reviewedPairsCanonicalSha256,
      validationNow: now,
      verifiedAt: new Date().toISOString(),
      operator,
      transport: retainedFiles.transport,
      warnings: validation.diagnostics,
    };
    await writeFile(
      join(staged.outputDirectory, 'source-import-receipt.json'),
      `${JSON.stringify(receipt)}\n`,
      { flag: 'wx' },
    );
    const lock = `${output}.lock`;
    await mkdir(lock);
    const lockOwner = await lstat(lock);
    try {
      await requireNewOutput(output);
      requireInitial(sameFile(await lstat(work), owner), 'scratch ownership changed');
      await rename(staged.outputDirectory, output);
    } finally {
      const current = await existing(lock);
      if (current && sameFile(current, lockOwner)) await rmdir(lock);
    }
    return { stageDirectory: output, metrics: staged.metrics, receipt };
  } finally {
    try {
      await archive?.handle.close();
    } finally {
      try {
        await observation?.handle.close();
      } finally {
        await removeOwned(work, owner);
      }
    }
  }
}
