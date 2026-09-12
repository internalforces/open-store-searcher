import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import {
  appendFile,
  lstat,
  mkdir,
  mkdtemp,
  open,
  rename,
  rm,
  rmdir,
  writeFile,
} from 'node:fs/promises';
import { dirname, basename, join, resolve } from 'node:path';
import { createInterface } from 'node:readline';
import { prepareDisplayData } from '../app/prepare-display-data.js';
import { seoulCalendarDate } from '../shared/data-freshness.js';
import type { ArchiveContractEntry } from './archive-contract.js';
import { emptyMetric, measure } from './refresh-validation-metrics.js';
import {
  RAW_COMPLETENESS_FIELDS,
  VALIDATION_STATUSES,
  compareText,
  requireValue,
  type ValidationInputV1,
  type ValidationMetricV1,
  type ValidationMetricsV1,
  type ValidationBaselineV1,
} from './refresh-validation-types.js';
import { toDisplayRecord } from './stage-validated-release.js';
import {
  frameExactIdentityV1,
  transformLicenseRecordsV2,
  type StagedLicenseRowV1,
} from './transform-license-records.js';
import { validateMeasuredRefresh } from './validate-license-refresh.js';

export type BoundedInput = Omit<ValidationInputV1, 'rows' | 'ingestion'>;
export interface CategoryRows {
  entry: ArchiveContractEntry;
  rows: Iterable<StagedLicenseRowV1>;
}

const hash = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex');
async function fileHash(path: string) {
  const digest = createHash('sha256');
  let byteLength = 0;
  for await (const bytes of createReadStream(path)) {
    digest.update(bytes);
    byteLength += bytes.length;
  }
  return { sha256: digest.digest('hex'), byteLength };
}
async function* lines(path: string, expected?: string) {
  const digest = createHash('sha256');
  const stream = createReadStream(path);
  stream.on('data', (bytes) => digest.update(bytes));
  const reader = createInterface({ input: stream, crlfDelay: Infinity });
  try {
    for await (const line of reader) yield line;
    if (expected !== undefined && digest.digest('hex') !== expected)
      throw new Error('Intermediate file hash mismatch');
  } finally {
    reader.close();
    stream.destroy();
  }
}

/** Fixed disk buckets cap skew explicitly. Buffers are globally bounded, not one full source set. */
class Buckets {
  private buffers = new Map<string, string[]>();
  private sizes = new Map<string, number>();
  private hashes = new Map<string, ReturnType<typeof createHash>>();
  private pending = 0;
  private root: string;
  private prefix: string;
  private maxBytes: number;
  constructor(root: string, prefix: string, maxBytes: number) {
    this.root = root;
    this.prefix = prefix;
    this.maxBytes = maxBytes;
  }
  async add(key: string, value: unknown) {
    const bucket = hash(key).slice(0, 2);
    const line = `${JSON.stringify(value)}\n`;
    const bytes = Buffer.byteLength(line);
    const size = (this.sizes.get(bucket) ?? 0) + bytes;
    if (size > this.maxBytes) throw new Error('Disk bucket byte limit exceeded');
    this.sizes.set(bucket, size);
    const digest = this.hashes.get(bucket) ?? createHash('sha256');
    digest.update(line);
    this.hashes.set(bucket, digest);
    const buffer = this.buffers.get(bucket) ?? [];
    buffer.push(line);
    this.buffers.set(bucket, buffer);
    this.pending += bytes;
    if (this.pending >= 4 * 1024 * 1024) await this.flush();
  }
  async flush() {
    for (const [bucket, buffer] of this.buffers)
      await appendFile(join(this.root, `${this.prefix}-${bucket}`), buffer.join(''));
    this.buffers.clear();
    this.pending = 0;
  }
  async *paths() {
    await this.flush();
    for (const bucket of [...this.sizes.keys()].sort())
      yield {
        path: join(this.root, `${this.prefix}-${bucket}`),
        sha256: requireValue(this.hashes.get(bucket)).digest('hex'),
      };
  }
}

function addMetric(target: ValidationMetricV1, part: ValidationMetricV1) {
  for (const key of [
    'recordCount',
    'missingNameCount',
    'missingBothAddressCount',
    'unknownPairCount',
  ] as const)
    target[key] += part[key];
  for (const status of VALIDATION_STATUSES)
    target.statusCounts[status] += part.statusCounts[status];
  for (const field of RAW_COMPLETENESS_FIELDS)
    for (const state of ['null', 'empty', 'whitespace'] as const)
      target.rawMissing[field][state] += part.rawMissing[field][state];
  const pairs = new Map(
    target.aggregatePairs.map((pair) => [JSON.stringify([pair.code, pair.name]), pair]),
  );
  for (const pair of part.aggregatePairs) {
    const key = JSON.stringify([pair.code, pair.name]);
    const current = pairs.get(key);
    if (current) current.count += pair.count;
    else pairs.set(key, { ...pair });
  }
  target.aggregatePairs = [...pairs.entries()]
    .sort(([a], [b]) => compareText(a, b))
    .map(([, pair]) => pair);
}

/** Bounded fan-in external merge preserves the existing exact-identity dataset order. */
async function mergeRuns(root: string, original: string[], hashes: Map<string, string>) {
  let runs = original;
  let pass = 0;
  while (runs.length > 1) {
    const next: string[] = [];
    for (let offset = 0; offset < runs.length; offset += 16) {
      const group = runs.slice(offset, offset + 16);
      const output = join(root, `merge-${pass}-${offset}`);
      const readers = group.map((path) =>
        lines(path, requireValue(hashes.get(path)))[Symbol.asyncIterator](),
      );
      const file = await open(output, 'wx');
      const digest = createHash('sha256');
      const write = async (text: string) => {
        digest.update(text);
        await file.writeFile(text);
      };
      try {
        const heads = await Promise.all(readers.map((reader) => reader.next()));
        let buffer = '';
        while (true) {
          let smallest = -1;
          for (let i = 0; i < heads.length; i++) {
            const head = heads[i];
            if (
              head &&
              !head.done &&
              (smallest < 0 || head.value < requireValue(requireValue(heads[smallest]).value))
            )
              smallest = i;
          }
          if (smallest < 0) break;
          buffer += `${requireValue(requireValue(heads[smallest]).value)}\n`;
          if (buffer.length >= 1024 * 1024) {
            await write(buffer);
            buffer = '';
          }
          heads[smallest] = await requireValue(readers[smallest]).next();
        }
        if (buffer) await write(buffer);
      } finally {
        await file.close();
        for (const reader of readers) await reader.return?.();
      }
      hashes.set(output, digest.digest('hex'));
      for (const path of group) {
        await rm(path);
        hashes.delete(path);
      }
      next.push(output);
    }
    runs = next;
    pass++;
  }
  return runs[0];
}

async function writeVerified(path: string, bytes: string) {
  await writeFile(path, bytes, { flag: 'wx' });
  if ((await fileHash(path)).sha256 !== hash(bytes))
    throw new Error('Staged publication bytes changed');
}

async function requireAbsent(path: string) {
  try {
    await lstat(path);
    throw new Error('Publication output already exists');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
}

/**
 * Internal staged publication. All categories, global identities/collisions and quality gates
 * finish before the new output can appear. Existing output and baseline are never replaced.
 */
async function processBoundedRelease(
  input: BoundedInput,
  categories: AsyncIterable<CategoryRows>,
  outputDirectory: string,
  options: { batchRows?: number; maxBucketBytes?: number },
  observation: boolean,
) {
  const batchRows = options.batchRows ?? 1000;
  const maxBucketBytes = options.maxBucketBytes ?? 512 * 1024 * 1024;
  if (
    !Number.isSafeInteger(batchRows) ||
    batchRows < 1 ||
    batchRows > 10000 ||
    !Number.isSafeInteger(maxBucketBytes) ||
    maxBucketBytes < 1
  )
    throw new Error('Invalid bounded staging limits');
  if (input.dateBasis !== 'collection' || input.collection.kind !== 'accepted')
    throw new Error('Accepted collection-date input required');
  const collection = input.collection;
  const date = seoulCalendarDate(collection.fetchedAt);
  const output = resolve(outputDirectory);
  await requireAbsent(output);
  await mkdir(dirname(output), { recursive: true });
  const work = await mkdtemp(join(dirname(output), `.${basename(output)}-work-`));
  try {
    const staging = join(work, 'release');
    const metrics: ValidationMetricsV1 = {
      total: emptyMetric(),
      categories: Object.fromEntries(
        [...input.archiveContract.entries]
          .sort((a, b) => compareText(a.fileDataId, b.fileDataId))
          .map((entry) => [entry.fileDataId, emptyMetric()]),
      ),
    };
    const ids = new Buckets(work, 'identity', maxBucketBytes);
    const collisions = new Buckets(work, 'collision', maxBucketBytes);
    const participants = new Buckets(work, 'participant', maxBucketBytes);
    const runs: string[] = [];
    const runHashes = new Map<string, string>();
    const seen = new Set<string>();
    const urls = new Map(
      input.permissionManifest.categories.map((category) => [
        category.fileDataId,
        category.fileDataUrl,
      ]),
    );
    const metadata = {
      sourceLabel: input.archiveContract.provider,
      sourceUrl: collection.sourceEvidence.providerFreshness.sourceUrl,
      coverage: { kind: 'collected' as const, date: date ?? '' },
      exampleQuery: '',
    };
    let recordBytes = 0;
    await mkdir(staging);
    for await (const category of categories) {
      const entry = input.archiveContract.entries.find(
        (item) => item.fileDataId === category.entry.fileDataId,
      );
      if (
        !entry ||
        seen.has(entry.fileDataId) ||
        JSON.stringify(entry) !== JSON.stringify(category.entry)
      )
        throw new Error('ingestion_evidence_mismatch');
      seen.add(entry.fileDataId);
      let batch: StagedLicenseRowV1[] = [];
      const flush = async () => {
        if (!batch.length) return;
        const transformed = transformLicenseRecordsV2({
          archiveContract: input.archiveContract,
          archive: { fetchedAt: collection.fetchedAt, sha256: collection.sha256 },
          rows: batch,
        });
        batch = [];
        const measured = measure(transformed.records);
        addMetric(metrics.total, measured);
        addMetric(requireValue(metrics.categories[entry.fileDataId]), measured);
        const display = transformed.records.map(toDisplayRecord);
        const serialized = JSON.stringify({ ...metadata, records: display });
        const checked = prepareDisplayData(JSON.parse(serialized));
        if (checked.excludedCount !== 0 || checked.dataset.records.length !== display.length)
          throw new Error('Publication lost records during serialization');
        const run: string[] = [];
        for (let i = 0; i < transformed.records.length; i++) {
          const record = requireValue(transformed.records[i]);
          const id = Buffer.from(record.identity.digest).toString('hex');
          const tuple = Buffer.from(frameExactIdentityV1(record.identity.source)).toString('hex');
          await ids.add(id, [id, tuple]);
          const values = [
            record.search.businessName,
            record.search.roadAddress,
            record.search.parcelAddress,
            record.search.businessName === null ||
            (record.search.roadAddress === null && record.search.parcelAddress === null)
              ? null
              : JSON.stringify([
                  record.search.businessName,
                  record.search.roadAddress,
                  record.search.parcelAddress,
                ]),
          ];
          for (let field = 0; field < values.length; field++) {
            if (values[field] === null) continue;
            const key = JSON.stringify([field, values[field]]);
            await collisions.add(key, [key, id, entry.fileDataId]);
          }
          const json = JSON.stringify(display[i]);
          recordBytes += Buffer.byteLength(json) + 1;
          if (input.policy && recordBytes > input.policy.maxJsonBytes)
            throw new Error('Publication blocked: total_json_size_exceeded');
          run.push(`${tuple}\t${json}`);
        }
        const path = join(work, `run-${runs.length}`);
        const bytes = `${run.join('\n')}\n`;
        await writeFile(path, bytes, { flag: 'wx' });
        runHashes.set(path, hash(bytes));
        runs.push(path);
      };
      for (const row of category.rows) {
        if (
          row.categoryFileDataId !== entry.fileDataId ||
          row.sourceFileDataUrl !== urls.get(entry.fileDataId)
        )
          throw new Error('ingestion_evidence_mismatch');
        batch.push(row);
        if (batch.length === batchRows) await flush();
      }
      await flush();
    }
    if (seen.size !== input.archiveContract.entries.length)
      throw new Error('ingestion_evidence_mismatch');
    for await (const { path, sha256 } of ids.paths()) {
      const tuples = new Map<string, string>();
      for await (const line of lines(path, sha256)) {
        const [id, tuple] = JSON.parse(line) as [string, string];
        const prior = tuples.get(id);
        if (prior !== undefined)
          throw new Error(
            prior === tuple ? 'duplicate_exact_source_tuple' : 'identifier_digest_collision',
          );
        tuples.set(id, tuple);
      }
      await rm(path);
    }
    for await (const { path, sha256 } of collisions.paths()) {
      // Two passes avoid retaining participants of a very common value (including empty strings).
      const groups = new Map<string, { count: number; categories: Set<string> }>();
      for await (const line of lines(path, sha256)) {
        const [key, , category] = JSON.parse(line) as [string, string, string];
        const group = groups.get(key) ?? { count: 0, categories: new Set<string>() };
        group.count++;
        group.categories.add(category);
        groups.set(key, group);
      }
      for (const group of groups.values())
        if (group.count > 1) {
          metrics.total.collisionGroupCount++;
          for (const id of group.categories)
            requireValue(metrics.categories[id]).collisionGroupCount++;
        }
      for await (const line of lines(path, sha256)) {
        const [key, id, category] = JSON.parse(line) as [string, string, string];
        if (requireValue(groups.get(key)).count > 1) await participants.add(id, [id, category]);
      }
      await rm(path);
    }
    for await (const { path, sha256 } of participants.paths()) {
      const unique = new Map<string, string>();
      for await (const line of lines(path, sha256)) {
        const [id, category] = JSON.parse(line) as [string, string];
        unique.set(id, category);
      }
      metrics.total.collisionRecordCount += unique.size;
      for (const id of unique.values()) requireValue(metrics.categories[id]).collisionRecordCount++;
      await rm(path);
    }
    const validation = validateMeasuredRefresh(input, () => ({ candidate: true, metrics }));
    if (
      validation.kind === 'rejected' ||
      (!observation && (validation.kind !== 'accepted' || !input.policy))
    )
      throw new Error(
        `Publication blocked: ${validation.diagnostics.map((item) => item.code).join(', ')}`,
      );
    const merged = await mergeRuns(work, runs, runHashes);
    const datasetPath = join(staging, 'dataset.json');
    const dataset = await open(datasetPath, 'wx');
    const datasetDigest = createHash('sha256');
    const writeDataset = async (text: string) => {
      datasetDigest.update(text);
      await dataset.writeFile(text);
    };
    try {
      await writeDataset(`${JSON.stringify(metadata).slice(0, -1)},"records":[`);
      let first = true;
      let buffer = '';
      if (merged)
        for await (const line of lines(merged, requireValue(runHashes.get(merged)))) {
          const json = line.slice(line.indexOf('\t') + 1);
          buffer += `${first ? '' : ','}${json}`;
          first = false;
          if (buffer.length >= 1024 * 1024) {
            await writeDataset(buffer);
            buffer = '';
          }
        }
      await writeDataset(`${buffer}]}\n`);
    } finally {
      await dataset.close();
    }
    if ((await fileHash(datasetPath)).sha256 !== datasetDigest.digest('hex'))
      throw new Error('Staged publication bytes changed');
    if (observation) {
      await writeVerified(
        join(staging, 'observation.json'),
        `${JSON.stringify({
          version: 1,
          kind: 'bounded-source-observation',
          publicationApproved: false,
          archiveSha256: collection.sha256,
          recordCount: metrics.total.recordCount,
          validation,
          dataset: await fileHash(datasetPath),
        })}\n`,
      );
      await requireAbsent(output);
      await rename(staging, output);
      return { outputDirectory: output, files: ['dataset.json', 'observation.json'], metrics };
    }
    if (validation.kind !== 'accepted' || !input.policy)
      throw new Error('Missing publication evidence');
    const baseline: ValidationBaselineV1 = {
      validationVersion: 1,
      schemaVersion: 2,
      identifierContractVersion: 1,
      normalizationContractVersion: 1,
      dateBasis: validation.dateBasis,
      policyRevision: input.policy.revision,
      archiveSha256: collection.sha256,
      schemaManifestSha256: collection.archiveEvidence.schemaManifestSha256,
      dataAsOf: validation.dataAsOf,
      evidenceReference: input.policy.evidenceReference,
      metrics,
    };
    await writeVerified(join(staging, 'baseline.json'), `${JSON.stringify(baseline)}\n`);
    const entries = [];
    for (const name of ['dataset.json', 'baseline.json'])
      entries.push({ name, ...(await fileHash(join(staging, name))) });
    await writeVerified(
      join(staging, 'release.json'),
      `${JSON.stringify({
        version: 1,
        kind: 'validated-staging',
        dateBasis: validation.dateBasis,
        collectedAt: collection.fetchedAt,
        sourceDataAsOf: null,
        archiveSha256: collection.sha256,
        policyRevision: input.policy.revision,
        recordCount: metrics.total.recordCount,
        warnings: validation.diagnostics,
        entries,
      })}\n`,
    );
    const releaseInfo = await fileHash(join(staging, 'release.json'));
    if (
      entries.reduce((sum, entry) => sum + entry.byteLength, releaseInfo.byteLength) >
      input.policy.maxJsonBytes
    )
      throw new Error('Publication blocked: total_json_size_exceeded');
    // Recheck exact staged bytes before promotion, independently of the write path.
    for (const entry of entries)
      if ((await fileHash(join(staging, entry.name))).sha256 !== entry.sha256)
        throw new Error('Staged publication bytes changed');
    const lock = `${output}.lock`;
    await mkdir(lock);
    try {
      await requireAbsent(output);
      await rename(staging, output);
    } finally {
      await rmdir(lock);
    }
    return {
      outputDirectory: output,
      files: ['dataset.json', 'baseline.json', 'release.json'],
      metrics,
    };
  } finally {
    await rm(work, { recursive: true, force: true });
  }
}

/** Publication entry: review-required results can never produce a release descriptor. */
export function stageBoundedRelease(
  input: BoundedInput,
  categories: AsyncIterable<CategoryRows>,
  outputDirectory: string,
  options: { batchRows?: number; maxBucketBytes?: number } = {},
) {
  return processBoundedRelease(input, categories, outputDirectory, options, false);
}

/** Research entry: produces no release descriptor or baseline and cannot be built for publication. */
export function observeBoundedRelease(
  input: BoundedInput,
  categories: AsyncIterable<CategoryRows>,
  outputDirectory: string,
  options: { batchRows?: number; maxBucketBytes?: number } = {},
) {
  return processBoundedRelease(input, categories, outputDirectory, options, true);
}
