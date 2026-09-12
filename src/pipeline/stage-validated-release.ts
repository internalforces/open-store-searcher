import { createHash } from 'node:crypto';
import { lstat, mkdir, mkdtemp, readFile, rename, rm, rmdir, writeFile } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import type { DisplayDataset, DisplayRecord } from '../app/display-data.js';
import { prepareDisplayData } from '../app/prepare-display-data.js';
import type { ValidationBaselineV1, ValidationInputV1 } from './refresh-validation-types.js';
import { validateJsonBytesV1 } from './validate-json-bytes.js';
import { validateLicenseRefreshV1 } from './validate-license-refresh.js';
import type { TransformedLicenseRecordV2 } from './transform-license-records.js';

const digest = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');

export function toDisplayRecord(record: TransformedLicenseRecordV2): DisplayRecord & {
  processedStatus: TransformedLicenseRecordV2['processedStatus'];
} {
  return {
    id: Buffer.from(record.identity.digest).toString('hex'),
    name: record.display.businessName ?? '',
    roadAddress: record.display.roadAddress ?? '',
    parcelAddress: record.display.parcelAddress ?? '',
    categoryName: record.display.categoryName,
    businessTypes: record.display.businessTypes,
    rawStatus: record.rawStatus,
    processedStatus: record.processedStatus,
    lifecycle: record.lifecycle,
    sourceLabel: record.provenance.provider,
    sourceUrl: record.provenance.sourceFileDataUrl,
  };
}

/** Internal staging package, not a public URL/share-identifier contract. */
export function prepareValidatedRelease(input: ValidationInputV1) {
  const validation = validateLicenseRefreshV1(input);
  if (validation.kind !== 'accepted')
    throw new Error(
      `Publication blocked: ${validation.diagnostics.map((item) => item.code).join(', ')}`,
    );
  if (!input.policy || input.collection.kind !== 'accepted' || !validation.metrics)
    throw new Error('Missing accepted publication evidence');
  const records = validation.candidate.records.map(toDisplayRecord);
  const dataset: DisplayDataset = {
    sourceLabel: input.archiveContract.provider,
    sourceUrl: input.collection.sourceEvidence.providerFreshness.sourceUrl,
    coverage: {
      kind: validation.dateBasis === 'collection' ? 'collected' : 'verified',
      date: validation.dataAsOf,
    },
    exampleQuery: '',
    records,
  };
  const baseline: ValidationBaselineV1 = {
    validationVersion: 1,
    schemaVersion: 2,
    identifierContractVersion: 1,
    normalizationContractVersion: 1,
    dateBasis: validation.dateBasis,
    policyRevision: input.policy.revision,
    archiveSha256: input.collection.sha256,
    schemaManifestSha256: input.collection.archiveEvidence.schemaManifestSha256,
    dataAsOf: validation.dataAsOf,
    evidenceReference: input.policy.evidenceReference,
    metrics: validation.metrics,
  };
  const files: Record<string, Uint8Array> = {};
  const serialize = (name: string, value: unknown) => {
    const bytes = new TextEncoder().encode(`${JSON.stringify(value)}\n`);
    const checked = validateJsonBytesV1(bytes, input.policy?.maxJsonBytes ?? 0);
    if (checked.kind !== 'accepted') throw new Error(`Publication blocked: ${checked.code}`);
    files[name] = bytes;
    return { name, sha256: digest(bytes), byteLength: bytes.length };
  };
  const entries = [serialize('dataset.json', dataset), serialize('baseline.json', baseline)];
  // Check the actual serialized representation through the consumer, not just typed objects.
  const parsed = prepareDisplayData(JSON.parse(new TextDecoder().decode(files['dataset.json'])));
  if (parsed.excludedCount !== 0 || parsed.dataset.records.length !== records.length)
    throw new Error('Publication lost records during serialization');
  serialize('release.json', {
    version: 1,
    kind: 'validated-staging',
    dateBasis: validation.dateBasis,
    collectedAt: input.collection.fetchedAt,
    sourceDataAsOf: validation.dateBasis === 'coverage' ? validation.dataAsOf : null,
    archiveSha256: input.collection.sha256,
    policyRevision: input.policy.revision,
    recordCount: records.length,
    warnings: validation.diagnostics,
    entries,
  });
  if (
    Object.values(files).reduce((sum, bytes) => sum + bytes.length, 0) > input.policy.maxJsonBytes
  )
    throw new Error('Publication blocked: total_json_size_exceeded');
  return files;
}

/** Create a new complete staging directory. Never replace a live directory or baseline. */
export async function stageValidatedRelease(input: ValidationInputV1, outputDirectory: string) {
  const files = prepareValidatedRelease(input);
  const output = resolve(outputDirectory);
  try {
    await lstat(output);
    throw new Error('Publication output already exists');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
  await mkdir(dirname(output), { recursive: true });
  const staging = await mkdtemp(join(dirname(output), `.${basename(output)}-`));
  try {
    for (const [name, bytes] of Object.entries(files)) {
      await writeFile(join(staging, name), bytes, { flag: 'wx' });
      if (digest(await readFile(join(staging, name))) !== digest(bytes))
        throw new Error('Staged publication bytes changed');
    }
    // A per-output lock prevents cooperating publishers racing on the same destination.
    const lock = `${output}.lock`;
    await mkdir(lock);
    try {
      try {
        await lstat(output);
        throw new Error('Publication output already exists');
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      }
      await rename(staging, output);
    } finally {
      await rmdir(lock);
    }
  } finally {
    await rm(staging, { recursive: true, force: true });
  }
  return { outputDirectory: output, files: Object.keys(files) };
}
