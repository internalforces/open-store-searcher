import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { dirname, isAbsolute } from 'node:path';
import {
  type AggregateVocabularyVersion,
  matchesVocabularyV2,
  VOCABULARY_V2,
  type VocabularyEnvelopeV2,
} from './aggregate-vocabulary.js';
import type { ArchiveContract } from './archive-contract.js';
import type { CollectionResult, PermissionManifest } from './collector-types.js';
import { validValidationMetricsForVocabulary } from './refresh-validation-metrics.js';
import type {
  IngestionCategoryV1,
  ValidationDiagnosticV1,
  ValidationMetricsV1,
} from './refresh-validation-types.js';
import { compareText, requireValue } from './refresh-validation-types.js';
import { RESEARCH_STORAGE_LIMITS, ResearchIndexStore } from './research-index-store.js';
import {
  isAccumulationCode,
  ObservationAccumulationError,
  ResearchMetricsAccumulator,
} from './research-metrics-accumulator.js';
import { researchObservationDiagnostics } from './research-observation-diagnostics.js';
import { CsvParseError, isCsvParseErrorCode, parseCsvRows } from './stream-csv.js';
import { streamProcessBytes } from './stream-process.js';
import {
  type StagedLicenseRowV1,
  TransformationRejected,
  transformLicenseRecordsV2,
} from './transform-license-records.js';
import { validateLicenseRefreshV1, validateLicenseRefreshV2 } from './validate-license-refresh.js';

export interface ObservationLimits {
  maxTotalBytes: number;
  maxRows: number;
  maxRecordChars: number;
  timeoutMs: number;
  maxRssBytes: number;
}
export interface ObservationInput {
  collection: CollectionResult;
  archiveContract: ArchiveContract;
  permissionManifest: PermissionManifest;
  now: string;
  limits: ObservationLimits;
}
export interface ObservationDependencies {
  hashArchive(path: string, signal: AbortSignal): Promise<string>;
  readEntry(
    path: string,
    name: string,
    maxBytes: number,
    timeoutMs: number,
    signal: AbortSignal,
  ): AsyncIterable<Uint8Array>;
  rss(): number;
  heap?(): number;
  createIndexStore?(archivePath: string, checkBudget: () => void): Promise<ResearchIndexStore>;
}
export interface ObservationReport {
  observationVersion: 1;
  kind: 'rejected' | 'review_required';
  complete: boolean;
  archiveSha256: string | null;
  dataAsOf: null;
  metrics: ValidationMetricsV1 | null;
  ingestion: IngestionCategoryV1[];
  diagnostics: ValidationDiagnosticV1[];
  bytesRead: number;
  resources?: {
    peakRssBytes: number;
    peakHeapBytes: number;
    storageLimits: typeof RESEARCH_STORAGE_LIMITS;
    storage?: ResearchIndexStore['statistics'];
  };
}

export interface ObservationInputV2 extends ObservationInput, VocabularyEnvelopeV2 {
  validationVersion: 2;
}
export interface ObservationReportV2
  extends Omit<ObservationReport, 'observationVersion'>,
    VocabularyEnvelopeV2 {
  observationVersion: 2;
  validationVersion: 2;
}
type ResearchReport = ObservationReport | ObservationReportV2;
function reportEnvelope(version: AggregateVocabularyVersion) {
  return version === 1
    ? { observationVersion: 1 as const }
    : { observationVersion: 2 as const, validationVersion: 2 as const, ...VOCABULARY_V2 };
}

export const nativeObservationDependencies: ObservationDependencies = {
  createIndexStore: (archivePath, check) =>
    ResearchIndexStore.create(dirname(archivePath), process.cwd(), check),
  heap: () => process.memoryUsage().heapUsed,
  async hashArchive(path, signal) {
    const hash = createHash('sha256');
    for await (const chunk of createReadStream(path, { signal })) hash.update(chunk);
    return hash.digest('hex');
  },
  readEntry(path, name, maxBytes, timeoutMs, signal) {
    if (
      !isAbsolute(path) ||
      path.includes('\0') ||
      !name ||
      name.startsWith('-') ||
      name.includes('\0')
    )
      throw new Error('unsafe_observation_path');
    return streamProcessBytes({
      executable: 'unzip',
      args: ['-p', path, name],
      maxBytes,
      timeoutMs,
      signal,
    });
  },
  rss: () => process.memoryUsage().rss,
};

function metadataPreflight(input: ObservationInput, version: AggregateVocabularyVersion) {
  return (version === 1 ? validateLicenseRefreshV1 : validateLicenseRefreshV2)({
    ...input,
    collection: input.collection,
    archiveContract: input.archiveContract,
    permissionManifest: input.permissionManifest,
    now: input.now,
    rows: [],
    ingestion: input.archiveContract.entries.map((e) => ({
      fileDataId: e.fileDataId,
      entryName: e.entryName,
      headers: e.headers,
      completed: true,
      rowCount: 0,
      archiveSha256: input.collection.kind === 'accepted' ? input.collection.sha256 : '',
    })),
  });
}

/** Aggregate-only research finalization; cannot create an accepted candidate or publication. */
function finalizeObservation(
  input: ObservationInput,
  metrics: ValidationMetricsV1,
  ingestion: IngestionCategoryV1[],
  bytesRead: number,
  version: AggregateVocabularyVersion,
): ResearchReport {
  const archiveSha256 = input.collection.kind === 'accepted' ? input.collection.sha256 : null;
  const reject = (code: string): ResearchReport => ({
    ...reportEnvelope(version),
    kind: 'rejected',
    complete: false,
    archiveSha256,
    dataAsOf: null,
    metrics: null,
    ingestion: [],
    diagnostics: [{ code, severity: 'rejection' }],
    bytesRead,
  });
  const invalid = metadataPreflight(input, version).diagnostics.find(
    (d) =>
      d.code === 'vocabulary_revision_mismatch' ||
      (d.severity === 'rejection' && d.code !== 'empty_refresh'),
  );
  if (invalid) return reject(invalid.code);
  const ids = input.archiveContract.entries.map((e) => e.fileDataId).sort(compareText);
  if (
    !validValidationMetricsForVocabulary(metrics, ids, version) ||
    !Number.isSafeInteger(bytesRead) ||
    bytesRead < 0 ||
    bytesRead > input.limits.maxTotalBytes ||
    metrics.total.recordCount > input.limits.maxRows
  )
    return reject('observation_metrics_invalid');
  if (!Array.isArray(ingestion) || ingestion.length !== input.archiveContract.entries.length)
    return reject('ingestion_evidence_mismatch');
  for (let i = 0; i < input.archiveContract.entries.length; i++) {
    const expected = requireValue(input.archiveContract.entries[i]);
    const actual = ingestion[i];
    if (
      actual?.completed !== true ||
      actual.fileDataId !== expected.fileDataId ||
      actual.entryName !== expected.entryName ||
      actual.archiveSha256 !== archiveSha256 ||
      actual.rowCount !== requireValue(metrics.categories[expected.fileDataId]).recordCount ||
      !Array.isArray(actual.headers) ||
      actual.headers.length !== expected.headers.length ||
      Array.from(actual.headers).some((h, j) => h !== expected.headers[j])
    )
      return reject('ingestion_evidence_mismatch');
  }
  const diagnostics = researchObservationDiagnostics(metrics);
  return {
    ...reportEnvelope(version),
    kind: metrics.total.recordCount === 0 ? 'rejected' : 'review_required',
    complete: true,
    archiveSha256,
    dataAsOf: null,
    metrics,
    ingestion,
    diagnostics,
    bytesRead,
  };
}

/** Research only: complete reads produce review-required metrics, never a publishable candidate. */
async function observeArchive(
  input: ObservationInput,
  dependencies: ObservationDependencies,
  version: AggregateVocabularyVersion,
): Promise<ResearchReport> {
  const ingestion: IngestionCategoryV1[] = [];
  let bytesRead = 0;
  let currentCategory: string | undefined;
  const rejected = (code: string): ResearchReport => ({
    ...reportEnvelope(version),
    kind: 'rejected',
    complete: false,
    archiveSha256: input.collection.kind === 'accepted' ? input.collection.sha256 : null,
    dataAsOf: null,
    metrics: null,
    ingestion: [],
    diagnostics: [
      { code, severity: 'rejection', ...(currentCategory ? { categoryId: currentCategory } : {}) },
    ],
    bytesRead,
  });
  if (
    version === 2 &&
    (!matchesVocabularyV2(input) ||
      !('validationVersion' in input) ||
      input.validationVersion !== 2)
  )
    return rejected('vocabulary_revision_mismatch');
  const { limits } = input;
  if (
    !limits ||
    !['maxTotalBytes', 'maxRows', 'maxRecordChars', 'timeoutMs', 'maxRssBytes'].every((key) => {
      const value = limits[key as keyof ObservationLimits];
      return Number.isSafeInteger(value) && value > 0;
    })
  )
    return rejected('invalid_observation_limits');
  // Exercise the existing evidence guards before I/O, with an explicitly empty synthetic stage.
  const preflight = metadataPreflight(input, version);
  const error = preflight.diagnostics.find(
    (d) =>
      d.code === 'vocabulary_revision_mismatch' ||
      (d.severity === 'rejection' && d.code !== 'empty_refresh'),
  );
  if (error) return rejected(error.code);
  if (input.collection.kind !== 'accepted') return rejected('collection_rejected');
  const collection = input.collection;
  const controller = new AbortController();
  const started = performance.now();
  const timer = setTimeout(() => controller.abort(), limits.timeoutMs);
  let rows: StagedLicenseRowV1[] = [];
  let totalRows = 0;
  let failure = 'observation_read_failed';
  let store: ResearchIndexStore | undefined;
  const resources = { peakRssBytes: 0, peakHeapBytes: 0, storageLimits: RESEARCH_STORAGE_LIMITS };
  const checkBudget = () => {
    if (controller.signal.aborted || performance.now() - started >= limits.timeoutMs) {
      failure = 'observation_timeout';
      throw new Error(failure);
    }
    const rss = dependencies.rss();
    const heap = dependencies.heap?.() ?? process.memoryUsage().heapUsed;
    resources.peakRssBytes = Math.max(resources.peakRssBytes, rss);
    resources.peakHeapBytes = Math.max(resources.peakHeapBytes, heap);
    if (!Number.isFinite(heap) || heap < 0 || heap > RESEARCH_STORAGE_LIMITS.maxHeapBytes) {
      failure = 'observation_heap_exceeded';
      throw new Error(failure);
    }
    if (!Number.isFinite(rss) || rss < 0 || rss > limits.maxRssBytes) {
      failure = 'observation_memory_exceeded';
      throw new Error(failure);
    }
  };
  const run = async (): Promise<ResearchReport> => {
    try {
      checkBudget();
      store = await dependencies.createIndexStore?.(collection.archivePath, checkBudget);
      const accumulator = new ResearchMetricsAccumulator(
        input.archiveContract.entries.map((e) => e.fileDataId),
        limits.maxRows,
        { deferIndexes: store !== undefined, vocabularyVersion: version },
      );
      const flush = async () => {
        if (rows.length === 0) return;
        checkBudget();
        const indexes = accumulator.addBatch(
          transformLicenseRecordsV2({
            archiveContract: input.archiveContract,
            archive: { fetchedAt: collection.fetchedAt, sha256: collection.sha256 },
            rows,
          }),
        );
        rows = [];
        if (store) await store.appendBatch(indexes);
        checkBudget();
      };
      currentCategory = undefined;
      checkBudget();
      if (
        (await dependencies.hashArchive(collection.archivePath, controller.signal)) !==
        collection.sha256
      )
        return rejected('archive_changed');
      const urls = new Map(
        input.permissionManifest.categories.map((c) => [c.fileDataId, c.fileDataUrl]),
      );
      for (const entry of input.archiveContract.entries) {
        currentCategory = entry.fileDataId;
        accumulator.beginCategory(entry.fileDataId);
        checkBudget();
        const source = dependencies.readEntry(
          collection.archivePath,
          entry.entryName,
          limits.maxTotalBytes,
          Math.max(1, Math.ceil(limits.timeoutMs - (performance.now() - started))),
          controller.signal,
        );
        async function* bounded() {
          for await (const chunk of source) {
            checkBudget();
            bytesRead += chunk.byteLength;
            if (bytesRead > limits.maxTotalBytes) {
              failure = 'observation_bytes_exceeded';
              throw new Error(failure);
            }
            yield chunk;
          }
        }
        let rowCount = 0;
        for await (const cells of parseCsvRows(bounded(), {
          encoding: entry.encoding,
          headers: entry.headers,
          maxBytes: limits.maxTotalBytes,
          maxRows: limits.maxRows,
          maxRecordChars: limits.maxRecordChars,
        })) {
          checkBudget();
          if (totalRows >= limits.maxRows) {
            failure = 'observation_rows_exceeded';
            throw new Error(failure);
          }
          rows.push({
            categoryFileDataId: entry.fileDataId,
            sourceFileDataUrl: urls.get(entry.fileDataId) as string,
            values: Object.fromEntries(entry.headers.map((h, i) => [h, cells[i] as string])),
          });
          rowCount++;
          totalRows++;
          if (rows.length === (store ? 64 : 1000)) await flush();
        }
        await flush();
        accumulator.endCategory();
        ingestion.push({
          fileDataId: entry.fileDataId,
          entryName: entry.entryName,
          headers: [...entry.headers],
          completed: true,
          rowCount,
          archiveSha256: collection.sha256,
        });
      }
      currentCategory = undefined;
      checkBudget();
      if (
        (await dependencies.hashArchive(collection.archivePath, controller.signal)) !==
        collection.sha256
      )
        return rejected('archive_changed');
      checkBudget();
      const metrics = store ? await accumulator.finishFromStore(store) : accumulator.finish();
      checkBudget();
      const report = finalizeObservation(input, metrics, ingestion, bytesRead, version);
      checkBudget();
      return report;
    } catch (error) {
      if (failure !== 'observation_read_failed')
        return rejected(controller.signal.aborted ? 'observation_timeout' : failure);
      if (error instanceof ObservationAccumulationError && isAccumulationCode(error.code))
        return rejected(error.code);
      if (error instanceof TransformationRejected)
        return rejected(
          isAccumulationCode(error.code) ? error.code : 'observation_transform_failed',
        );
      const code =
        failure === 'observation_read_failed' &&
        error instanceof CsvParseError &&
        isCsvParseErrorCode(error.code)
          ? error.code
          : failure;
      return rejected(controller.signal.aborted ? 'observation_timeout' : code);
    }
  };
  try {
    const report = await run();
    const storage = store?.statistics;
    await store?.cleanup();
    if (storage) Object.assign(resources, { storage });
    try {
      checkBudget();
    } catch {
      return { ...rejected(failure), resources };
    }
    return { ...report, resources };
  } catch {
    return { ...rejected('observation_cleanup_failed'), resources };
  } finally {
    clearTimeout(timer);
    controller.abort();
  }
}

/** Explicit legacy research path. */
export function finalizeResearchObservation(
  input: ObservationInput,
  metrics: ValidationMetricsV1,
  ingestion: IngestionCategoryV1[],
  bytesRead: number,
): ObservationReport {
  return finalizeObservation(input, metrics, ingestion, bytesRead, 1) as ObservationReport;
}
export function finalizeResearchObservationV2(
  input: ObservationInputV2,
  metrics: ValidationMetricsV1,
  ingestion: IngestionCategoryV1[],
  bytesRead: number,
): ObservationReportV2 {
  return finalizeObservation(input, metrics, ingestion, bytesRead, 2) as ObservationReportV2;
}
export function observeLicenseArchive(
  input: ObservationInput,
  dependencies: ObservationDependencies = nativeObservationDependencies,
): Promise<ObservationReport> {
  return observeArchive(input, dependencies, 1) as Promise<ObservationReport>;
}
/** V2 envelope checked before any source I/O; output remains research-only. */
export function observeLicenseArchiveV2(
  input: ObservationInput | ObservationInputV2,
  dependencies: ObservationDependencies = nativeObservationDependencies,
): Promise<ObservationReportV2> {
  return observeArchive(input, dependencies, 2) as Promise<ObservationReportV2>;
}
