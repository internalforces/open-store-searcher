import {
  type CompactBlock,
  type CompactManifest,
  type Dictionaries,
  COMPACT_MAX_BYTES,
  columnValue,
  requireCompact,
  validateBlock,
  validateDictionaries,
  validateManifest,
} from './compact-data.js';
export interface CompactSnapshot {
  manifest: CompactManifest;
  blocks: CompactBlock[];
  dictionaries: Dictionaries;
}
export const hashBytes = async (bytes: Uint8Array) =>
  Array.from(
    new Uint8Array(await crypto.subtle.digest('SHA-256', bytes as Uint8Array<ArrayBuffer>)),
    (b) => b.toString(16).padStart(2, '0'),
  ).join('');
const parse = (b: Uint8Array) => JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(b));
/** All requested files depend only on the manifest; no query/click inputs enter this function. */
export async function loadCompactSnapshot(
  manifestBytes: Uint8Array,
  expectedHash: string,
  read: (name: string, maxBytes: number) => Promise<Uint8Array>,
  signal?: AbortSignal,
): Promise<CompactSnapshot> {
  requireCompact(
    manifestBytes.length <= COMPACT_MAX_BYTES && (await hashBytes(manifestBytes)) === expectedHash,
  );
  const manifest = validateManifest(parse(manifestBytes));
  signal?.throwIfAborted();
  const dictionary = required(manifest.entries.find((e) => e.role === 'dictionaries'));
  const fetchEntry = async (e: typeof dictionary) => {
    signal?.throwIfAborted();
    const b = await read(e.name, e.byteLength);
    requireCompact(b.length === e.byteLength && (await hashBytes(b)) === e.sha256);
    signal?.throwIfAborted();
    return parse(b);
  };
  const dictionaries = validateDictionaries(await fetchEntry(dictionary), manifest.archiveSha256);
  const entries = manifest.entries.filter((e) => e.role !== 'dictionaries'),
    blocks: CompactBlock[] = [];
  for (let i = 0; i < entries.length; i += 2) {
    const batch = entries.slice(i, i + 2);
    blocks.push(
      ...(await Promise.all(
        batch.map(async (e) =>
          validateBlock(await fetchEntry(e), e, manifest.archiveSha256, dictionaries),
        ),
      )),
    );
  }
  const ids = new Set<string>();
  const ordered = new Uint8Array(manifest.recordCount * 65);
  let offset = 0;
  for (const b of blocks.filter((b) => b.role === 'search')) {
    for (let i = 0; i < b.count; i++) {
      const id = columnValue(required(b.columns[0]), i, dictionaries) as string;
      requireCompact(!ids.has(id));
      ids.add(id);
      for (let j = 0; j < 64; j++) ordered[offset++] = id.charCodeAt(j);
      ordered[offset++] = 10;
    }
    signal?.throwIfAborted();
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  requireCompact(
    ids.size === manifest.recordCount &&
      offset === ordered.length &&
      (await hashBytes(ordered)) === manifest.orderedIdsSha256,
  );
  signal?.throwIfAborted();
  return { manifest, blocks, dictionaries };
}
const READ_INACTIVITY_MS = 30_000;
export async function readCompactResponse(
  url: string,
  maxBytes: number,
  signal: AbortSignal,
): Promise<Uint8Array> {
  let inactivityTimer: ReturnType<typeof setTimeout> | undefined;
  const inactivityController = new AbortController();
  const resetInactivityTimer = () => {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => inactivityController.abort(), READ_INACTIVITY_MS);
  };
  const combinedSignal = AbortSignal.any([signal, inactivityController.signal]);
  try {
    resetInactivityTimer();
    const response = await fetch(url, {
      signal: combinedSignal,
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      redirect: 'error',
    });
    if (!response.ok || !response.body) {
      await response.body?.cancel();
      throw new Error('Unable to load compact data');
    }
    const reader = response.body.getReader(),
      chunks: Uint8Array[] = [];
    let length = 0;
    try {
      while (true) {
        resetInactivityTimer();
        const next = await reader.read();
        if (next.done) break;
        length += next.value.length;
        requireCompact(length <= maxBytes);
        chunks.push(next.value);
      }
      const bytes = new Uint8Array(length);
      let offset = 0;
      for (const b of chunks) {
        bytes.set(b, offset);
        offset += b.length;
      }
      return bytes;
    } catch (error) {
      await reader.cancel();
      throw error;
    } finally {
      reader.releaseLock();
    }
  } finally {
    clearTimeout(inactivityTimer);
  }
}

function required<T>(value: T | null | undefined): T {
  if (value === undefined || value === null) throw new Error('Missing required compact value');
  return value;
}
