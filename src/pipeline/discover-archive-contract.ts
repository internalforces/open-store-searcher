import type { ArchiveAdapter } from './archive-adapter.js';
import type { ArchiveContract, ArchiveContractEntry } from './archive-contract.js';
import type { CollectorLimits, PermissionManifest } from './collector-types.js';
import { inspectCsvHeader } from './csv-header.js';

interface DiscoveryOptions {
  adapter: ArchiveAdapter;
  archivePath: string;
  permissionManifest: PermissionManifest;
  limits: CollectorLimits;
  entryAliases?: Readonly<Record<string, string>>;
  signal?: AbortSignal;
}

export async function discoverArchiveContract(options: DiscoveryOptions): Promise<ArchiveContract> {
  if (!(await options.adapter.testIntegrity(options.archivePath, options.signal)).ok) {
    throw new Error('archive integrity failed during contract discovery');
  }
  const entries = await options.adapter.listEntries(options.archivePath, options.signal);
  const files = entries.filter((entry) => !entry.name.endsWith('/'));
  if (files.length !== options.permissionManifest.categories.length) {
    throw new Error('archive category count does not match permission evidence');
  }
  const modifiedDates = new Set(files.map((entry) => entry.modifiedDate));
  if (modifiedDates.size !== 1) {
    throw new Error('archive timestamp evidence is inconsistent');
  }

  const byTitle = new Map<string, string[]>();
  for (const category of options.permissionManifest.categories) {
    const title = category.fileDataTitle.replace(/^행정안전부_/, '').normalize('NFC');
    const ids = byTitle.get(title) ?? [];
    ids.push(category.fileDataId);
    byTitle.set(title, ids);
  }
  const discovered: ArchiveContractEntry[] = [];
  const permittedIds = new Set(
    options.permissionManifest.categories.map((category) => category.fileDataId),
  );
  const usedIds = new Set<string>();
  for (const listed of files) {
    const entryName = listed.name.normalize('NFC');
    if (!entryName.endsWith('.csv') || entryName.includes('/') || entryName.includes('\\')) {
      throw new Error('archive contains an unsafe non-CSV entry');
    }
    const title = entryName.slice(0, -'.csv'.length);
    const candidates = byTitle.get(title) ?? [];
    const fileDataId = candidates.length === 1 ? candidates[0] : options.entryAliases?.[entryName];
    if (
      candidates.length > 1 ||
      !fileDataId ||
      !permittedIds.has(fileDataId) ||
      usedIds.has(fileDataId)
    ) {
      throw new Error(`archive entry lacks a unique permission mapping: ${entryName}`);
    }
    usedIds.add(fileDataId);
    try {
      const bytes = await options.adapter.readEntryPrefix(
        options.archivePath,
        listed.name,
        options.limits.maxHeaderBytes,
        options.signal,
      );
      const schema = inspectCsvHeader(bytes);
      discovered.push({ entryName, fileDataId, ...schema });
    } catch (error) {
      throw new Error(`archive header discovery failed for ${entryName}`, { cause: error });
    }
  }
  discovered.sort((left, right) => left.entryName.localeCompare(right.entryName));
  return {
    provider: options.permissionManifest.provider,
    permissionLabel: options.permissionManifest.permissionLabel,
    expectedEntryCount: discovered.length,
    entries: discovered,
  };
}
