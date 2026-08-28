import { createHash } from 'node:crypto';
import type { ArchiveAdapter, ArchiveEntry } from './archive-adapter.js';
import type { ArchiveContract } from './archive-contract.js';
import type {
  ArchiveEvidence,
  CollectorLimits,
  CollectorRejectionCode,
  PermissionManifest,
} from './collector-types.js';
import { inspectCsvHeader } from './csv-header.js';

export type ArchiveInspectionResult =
  | { kind: 'accepted'; evidence: ArchiveEvidence }
  | { kind: 'rejected'; code: CollectorRejectionCode; message: string };

interface InspectionOptions {
  adapter: ArchiveAdapter;
  archivePath: string;
  permissionManifest: PermissionManifest;
  contract: ArchiveContract;
  limits: CollectorLimits;
  signal?: AbortSignal;
}

function reject(code: CollectorRejectionCode, message: string): ArchiveInspectionResult {
  return { kind: 'rejected', code, message };
}

function safeName(name: string): boolean {
  if (!name || name.startsWith('/') || name.startsWith('-') || name.includes('\\')) return false;
  const parts = name.split('/');
  return !parts.some(
    (part, index) => (part === '' && index !== parts.length - 1) || part === '.' || part === '..',
  );
}

function sameArray(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function normalizeEntries(entries: ArchiveEntry[]): ArchiveEntry[] | undefined {
  const normalized = entries.map((entry) => ({
    name: entry.name.normalize('NFC'),
    modifiedDate: entry.modifiedDate,
  }));
  if (normalized.some((entry) => !safeName(entry.name))) return undefined;
  if (new Set(normalized.map((entry) => entry.name)).size !== normalized.length) return undefined;
  return normalized;
}

export async function inspectArchive(options: InspectionOptions): Promise<ArchiveInspectionResult> {
  if (!(await options.adapter.testIntegrity(options.archivePath, options.signal)).ok) {
    return reject('archive_corrupt', 'ZIP integrity check failed.');
  }
  let listed: ArchiveEntry[];
  try {
    listed = await options.adapter.listEntries(options.archivePath, options.signal);
  } catch {
    return reject('archive_corrupt', 'ZIP inventory could not be read.');
  }
  const normalized = normalizeEntries(listed);
  if (!normalized)
    return reject('archive_entry_unsafe', 'ZIP contains an unsafe or duplicate entry.');
  const files = normalized.filter((entry) => !entry.name.endsWith('/'));
  if (files.length !== options.contract.expectedEntryCount) {
    return reject('category_manifest_changed', 'Archive category count changed.');
  }
  if (
    options.contract.provider !== options.permissionManifest.provider ||
    options.contract.permissionLabel !== options.permissionManifest.permissionLabel ||
    options.contract.entries.length !== options.permissionManifest.categories.length
  ) {
    return reject('permission_manifest_changed', 'Archive and permission contracts disagree.');
  }

  const permissions = new Set(
    options.permissionManifest.categories.map((entry) => entry.fileDataId),
  );
  const contractNames = new Set<string>();
  const mappedIds = new Set<string>();
  for (const entry of options.contract.entries) {
    const name = entry.entryName.normalize('NFC');
    if (
      !safeName(name) ||
      contractNames.has(name) ||
      mappedIds.has(entry.fileDataId) ||
      !permissions.has(entry.fileDataId)
    ) {
      return reject('permission_manifest_changed', 'Archive entry permission mapping changed.');
    }
    contractNames.add(name);
    mappedIds.add(entry.fileDataId);
  }
  const listedNames = [...files.map((entry) => entry.name)].sort();
  if (!sameArray(listedNames, [...contractNames].sort())) {
    return reject('category_manifest_changed', 'Archive entry manifest changed.');
  }

  const dates = new Set(files.map((entry) => entry.modifiedDate));
  const providerModifiedDate = dates.size === 1 ? [...dates][0] : undefined;
  if (!providerModifiedDate || !/^\d{4}-\d{2}-\d{2}$/.test(providerModifiedDate)) {
    return reject('timestamp_evidence_inconsistent', 'Archive entry timestamps are inconsistent.');
  }

  const schemaEntries = [];
  for (const expected of [...options.contract.entries].sort((a, b) =>
    a.entryName.localeCompare(b.entryName),
  )) {
    try {
      const bytes = await options.adapter.readEntryPrefix(
        options.archivePath,
        expected.entryName,
        options.limits.maxHeaderBytes,
        options.signal,
      );
      const actual = inspectCsvHeader(bytes);
      if (
        actual.encoding !== expected.encoding ||
        actual.delimiter !== expected.delimiter ||
        !sameArray(actual.headers, expected.headers) ||
        !sameArray(actual.timestampFields, expected.timestampFields)
      ) {
        return reject('csv_contract_changed', `CSV contract changed for ${expected.entryName}.`);
      }
      schemaEntries.push({ ...expected, entryName: expected.entryName.normalize('NFC') });
    } catch {
      return reject(
        'csv_contract_changed',
        `CSV header could not be inspected for ${expected.entryName}.`,
      );
    }
  }
  const schemaManifestSha256 = createHash('sha256')
    .update(JSON.stringify(schemaEntries))
    .digest('hex');
  return {
    kind: 'accepted',
    evidence: { entryCount: files.length, schemaManifestSha256, providerModifiedDate },
  };
}
