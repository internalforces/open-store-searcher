import { createHash } from 'node:crypto';
import { readFile, access, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { build } from 'vite';
import preact from '@preact/preset-vite';

const [stagingPath, outputPath] = process.argv.slice(2);
if (!stagingPath || !outputPath || process.argv.length !== 4)
  throw new Error('Usage: node scripts/build-publication.mjs STAGED-release NEW-site-directory');
const output = resolve(outputPath);
try {
  await access(output);
  throw new Error('Build output already exists');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const releaseBytes = await readFile(join(stagingPath, 'release.json'));
const release = JSON.parse(releaseBytes.toString('utf8'));
if (
  release.version !== 1 ||
  release.kind !== 'validated-staging' ||
  release.dateBasis !== 'collection' ||
  release.sourceDataAsOf !== null
)
  throw new Error('Unsupported staged release');
const files = new Map();
if (!Array.isArray(release.entries) || release.entries.length !== 2)
  throw new Error('Incomplete release entries');
for (const entry of release.entries) {
  if (!['dataset.json', 'baseline.json'].includes(entry.name) || files.has(entry.name))
    throw new Error('Invalid release entry');
  const bytes = await readFile(join(stagingPath, entry.name));
  if (
    bytes.length !== entry.byteLength ||
    createHash('sha256').update(bytes).digest('hex') !== entry.sha256
  )
    throw new Error('Staged release hash mismatch');
  files.set(entry.name, bytes);
}
await build({
  configFile: false,
  base: './',
  plugins: [
    preact(),
    {
      name: 'validated-publication',
      enforce: 'pre',
      resolveId(source, importer) {
        if (
          source === './demo-loader.js' &&
          importer?.replaceAll('\\', '/').endsWith('/src/app/main.tsx')
        )
          return '\0validated-publication';
      },
      load(id) {
        if (id !== '\0validated-publication') return;
        const asset = this.emitFile({
          type: 'asset',
          name: 'collected-dataset.json',
          source: files.get('dataset.json'),
        });
        return `import { createPublicationLoader } from '/src/app/publication-loader.ts'; export const demoLoader = createPublicationLoader(import.meta.ROLLUP_FILE_URL_${asset});`;
      },
    },
  ],
  build: { outDir: output, emptyOutDir: false },
});
// Same deployment carries the baseline corresponding to its data, for operator recovery.
await writeFile(join(output, 'baseline.json'), files.get('baseline.json'), { flag: 'wx' });
await writeFile(join(output, 'release.json'), releaseBytes, { flag: 'wx' });
