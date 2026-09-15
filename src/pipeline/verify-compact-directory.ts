import { createHash } from 'node:crypto';
import { appendFile, lstat, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  COMPACT_MAX_BYTES,
  columnValue,
  requireCompact,
  validateBlock,
  validateDictionaries,
  validateManifest,
} from '../shared/compact-data.js';
export async function verifyCompactDirectory(
  directory: string,
  entry: { name: string; byteLength: number; sha256: string },
) {
  const scratch = await mkdtemp(join(tmpdir(), 'compact-check-'));
  const buckets = new Map<string, string[]>();
  const sizes = new Map<string, number>();
  let pending = 0;
  const flush = async () => {
    for (const [k, v] of buckets) await appendFile(join(scratch, k), `${v.join('\n')}\n`);
    buckets.clear();
    pending = 0;
  };
  async function read(e: typeof entry) {
    requireCompact(e.byteLength > 0 && e.byteLength <= COMPACT_MAX_BYTES);
    const stat = await lstat(join(directory, e.name));
    requireCompact(stat.isFile() && stat.size === e.byteLength);
    const b = await readFile(join(directory, e.name));
    if (createHash('sha256').update(b).digest('hex') !== e.sha256)
      throw new Error('Compact hash mismatch');
    return JSON.parse(new TextDecoder('utf8', { fatal: true }).decode(b));
  }
  try {
    requireCompact(entry.name === `assets/compact-manifest-${entry.sha256}.json`);
    const manifest = validateManifest(await read(entry));
    const dictionaries = validateDictionaries(
      await read(required(manifest.entries.find((e) => e.role === 'dictionaries'))),
      manifest.archiveSha256,
    );
    const ordered = createHash('sha256');
    let count = 0;
    for (const e of manifest.entries) {
      if (e.role === 'dictionaries') continue;
      const block = validateBlock(await read(e), e, manifest.archiveSha256, dictionaries);
      if (e.role === 'search')
        for (let i = 0; i < block.count; i++) {
          const id = columnValue(required(block.columns[0]), i, dictionaries) as string;
          ordered.update(`${id}\n`);
          count++;
          const key = id.slice(0, 2);
          const size = (sizes.get(key) ?? 0) + 65;
          requireCompact(size <= 64 * 1024 * 1024);
          sizes.set(key, size);
          const a = buckets.get(key) ?? [];
          a.push(id);
          buckets.set(key, a);
          pending += 65;
          if (pending >= 1024 * 1024) await flush();
        }
    }
    await flush();
    for (const key of sizes.keys()) {
      const ids = (await readFile(join(scratch, key), 'utf8')).trimEnd().split('\n');
      requireCompact(new Set(ids).size === ids.length);
    }
    requireCompact(
      count === manifest.recordCount && ordered.digest('hex') === manifest.orderedIdsSha256,
    );
    return manifest;
  } finally {
    await rm(scratch, { recursive: true, force: true });
  }
}

function required<T>(value: T | null | undefined): T {
  if (value === undefined || value === null) throw new Error('Missing required compact value');
  return value;
}
