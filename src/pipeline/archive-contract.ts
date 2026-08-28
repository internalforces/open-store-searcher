export interface ArchiveContractEntry {
  entryName: string;
  fileDataId: string;
  encoding: 'utf-8' | 'euc-kr';
  delimiter: ',';
  headers: string[];
  timestampFields: string[];
}

export interface ArchiveContract {
  provider: string;
  permissionLabel: string;
  expectedEntryCount: number;
  entries: ArchiveContractEntry[];
}

export function parseArchiveContract(value: unknown): ArchiveContract {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('archive contract must be an object');
  }
  const input = value as Record<string, unknown>;
  if (
    typeof input.provider !== 'string' ||
    typeof input.permissionLabel !== 'string' ||
    !Number.isSafeInteger(input.expectedEntryCount) ||
    !Array.isArray(input.entries)
  ) {
    throw new Error('archive contract metadata is invalid');
  }
  const entries: ArchiveContractEntry[] = input.entries.map((value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new Error('archive contract entry is invalid');
    }
    const entry = value as Record<string, unknown>;
    if (
      typeof entry.entryName !== 'string' ||
      typeof entry.fileDataId !== 'string' ||
      (entry.encoding !== 'utf-8' && entry.encoding !== 'euc-kr') ||
      entry.delimiter !== ',' ||
      !Array.isArray(entry.headers) ||
      !entry.headers.every((header) => typeof header === 'string') ||
      !Array.isArray(entry.timestampFields) ||
      !entry.timestampFields.every((field) => typeof field === 'string')
    ) {
      throw new Error('archive contract entry fields are invalid');
    }
    return {
      entryName: entry.entryName,
      fileDataId: entry.fileDataId,
      encoding: entry.encoding as 'utf-8' | 'euc-kr',
      delimiter: ',',
      headers: entry.headers as string[],
      timestampFields: entry.timestampFields as string[],
    };
  });
  if (input.expectedEntryCount !== entries.length) {
    throw new Error('archive contract entry count is invalid');
  }
  return {
    provider: input.provider,
    permissionLabel: input.permissionLabel,
    expectedEntryCount: input.expectedEntryCount,
    entries,
  };
}
