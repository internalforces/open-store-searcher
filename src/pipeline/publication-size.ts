import { lstat, readdir } from 'node:fs/promises';
import { join } from 'node:path';

// Conservative decimal interpretation of GitHub Pages' documented 1 GB site limit.
// https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
const PAGES_MAX_BYTES = 1_000_000_000;

export function requirePagesSize(bytes: number): void {
  if (!Number.isSafeInteger(bytes) || bytes < 0 || bytes > PAGES_MAX_BYTES)
    throw new Error(`GitHub Pages site size exceeds ${PAGES_MAX_BYTES} bytes: ${bytes}`);
}

/** Count logical deployed bytes, including nested assets and operator state files. */
export async function directoryBytes(directory: string): Promise<number> {
  let bytes = 0;
  for (const name of await readdir(directory)) {
    const path = join(directory, name);
    const entry = await lstat(path);
    if (entry.isDirectory()) bytes += await directoryBytes(path);
    else if (entry.isFile()) bytes += entry.size;
    else throw new Error('Unsupported publication filesystem entry');
  }
  return bytes;
}
