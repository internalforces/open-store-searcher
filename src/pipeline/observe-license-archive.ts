import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { isAbsolute } from 'node:path';
import type { ArchiveContract } from './archive-contract.js';
import type { CollectionResult, PermissionManifest } from './collector-types.js';
import type {
  IngestionCategoryV1,
  ValidationDiagnosticV1,
  ValidationMetricsV1,
} from './refresh-validation-types.js';
import { CsvParseError, isCsvParseErrorCode, parseCsvRows } from './stream-csv.js';
import { streamProcessBytes } from './stream-process.js';
import type { StagedLicenseRowV1 } from './transform-license-records.js';
import { validateLicenseRefreshV1 } from './validate-license-refresh.js';

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
}

const nativeDependencies: ObservationDependencies = {
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

/** Research only: complete reads produce review-required metrics, never a publishable candidate. */
export async function observeLicenseArchive(
  input: ObservationInput,
  dependencies: ObservationDependencies = nativeDependencies,
): Promise<ObservationReport> {
  const ingestion: IngestionCategoryV1[] = [];
  let bytesRead = 0;
  let currentCategory: string | undefined;
  const rejected = (code: string): ObservationReport => ({
    observationVersion: 1,
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
  const preflight = validateLicenseRefreshV1({
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
  const error = preflight.diagnostics.find(
    (d) => d.severity === 'rejection' && d.code !== 'empty_refresh',
  );
  if (error) return rejected(error.code);
  if (input.collection.kind !== 'accepted') return rejected('collection_rejected');
  const collection = input.collection;
  const controller = new AbortController();
  const started = performance.now();
  const timer = setTimeout(() => controller.abort(), limits.timeoutMs);
  const rows: StagedLicenseRowV1[] = [];
  let failure = 'observation_read_failed';
  const checkBudget = () => {
    if (controller.signal.aborted || performance.now() - started >= limits.timeoutMs) {
      failure = 'observation_timeout';
      throw new Error(failure);
    }
    if (dependencies.rss() > limits.maxRssBytes) {
      failure = 'observation_memory_exceeded';
      throw new Error(failure);
    }
  };
  try {
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
        if (rows.length >= limits.maxRows) {
          failure = 'observation_rows_exceeded';
          throw new Error(failure);
        }
        rows.push({
          categoryFileDataId: entry.fileDataId,
          sourceFileDataUrl: urls.get(entry.fileDataId) as string,
          values: Object.fromEntries(entry.headers.map((h, i) => [h, cells[i] as string])),
        });
        rowCount++;
      }
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
    const validation = validateLicenseRefreshV1({
      collection,
      archiveContract: input.archiveContract,
      permissionManifest: input.permissionManifest,
      now: input.now,
      rows,
      ingestion,
    });
    checkBudget();
    return {
      observationVersion: 1,
      kind: validation.kind === 'rejected' ? 'rejected' : 'review_required',
      complete: true,
      archiveSha256: collection.sha256,
      dataAsOf: null,
      metrics: validation.metrics,
      ingestion,
      diagnostics: validation.diagnostics,
      bytesRead,
    };
  } catch (error) {
    const code =
      failure === 'observation_read_failed' &&
      error instanceof CsvParseError &&
      isCsvParseErrorCode(error.code)
        ? error.code
        : failure;
    return rejected(controller.signal.aborted ? 'observation_timeout' : code);
  } finally {
    clearTimeout(timer);
    controller.abort();
  }
}
