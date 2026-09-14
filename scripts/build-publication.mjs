import { requirePagesSize, directoryBytes } from '../src/pipeline/publication-size.ts';
import { createHash } from 'node:crypto';
import { readFile, lstat, writeFile, mkdtemp, mkdir, rename, rm } from 'node:fs/promises';
import { createReadStream, createWriteStream } from 'node:fs';
import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { resolve, join, dirname, basename } from 'node:path';
import { build, createServer } from 'vite';
import preact from '@preact/preset-vite';

const [stagingPath, outputPath] = process.argv.slice(2);
if (!stagingPath || !outputPath || process.argv.length !== 4)
  throw new Error('Usage: node scripts/build-publication.mjs STAGED-release NEW-site-directory');
const output = resolve(outputPath);
try {
  await lstat(output);
  throw new Error('Build output already exists');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const releaseBytes = await readFile(join(stagingPath, 'release.json'));
const release = JSON.parse(releaseBytes.toString('utf8'));
if (
  ![1, 2].includes(release.version) ||
  release.kind !== 'validated-staging' ||
  release.dateBasis !== 'collection' ||
  release.sourceDataAsOf !== null
)
  throw new Error('Unsupported staged release');
// Dataset bytes stay on disk throughout the build; Vite only sees an asset placeholder.
const files = new Map();
async function verifyOrCopy(entry, destination) {
  const digest = createHash('sha256');
  let size = 0;
  const meter = new Transform({
    transform(chunk, _encoding, callback) {
      size += chunk.length;
      if (size > entry.byteLength) return callback(new Error('Staged release hash mismatch'));
      digest.update(chunk);
      callback(null, chunk);
    },
  });
  if (destination)
    await pipeline(
      createReadStream(join(stagingPath, entry.name)),
      meter,
      createWriteStream(destination, { flags: 'w' }),
    );
  else {
    for await (const chunk of createReadStream(join(stagingPath, entry.name))) {
      size += chunk.length;
      if (size > entry.byteLength) throw new Error('Staged release hash mismatch');
      digest.update(chunk);
    }
  }
  if (size !== entry.byteLength || digest.digest('hex') !== entry.sha256)
    throw new Error('Staged release hash mismatch');
  if (destination) {
    const copied = createHash('sha256');
    let copiedBytes = 0;
    for await (const chunk of createReadStream(destination)) {
      copied.update(chunk);
      copiedBytes += chunk.length;
    }
    if (copiedBytes !== entry.byteLength || copied.digest('hex') !== entry.sha256)
      throw new Error('Copied release hash mismatch');
  }
}
if (!Array.isArray(release.entries) || release.entries.length !== 2)
  throw new Error('Incomplete release entries');
for (const entry of release.entries) {
  if (
    !(
      entry.name === 'baseline.json' ||
      (release.version === 1
        ? entry.name === 'dataset.json'
        : entry.name === `assets/compact-manifest-${entry.sha256}.json`)
    ) ||
    files.has(entry.name) ||
    !Number.isSafeInteger(entry.byteLength) ||
    entry.byteLength <= 0 ||
    typeof entry.sha256 !== 'string' ||
    !/^[a-f0-9]{64}$/.test(entry.sha256)
  )
    throw new Error('Invalid release entry');
  files.set(entry.name, entry);
}
const datasetEntry = [...files.values()].find((e) => e.name !== 'baseline.json');
if (!datasetEntry || !files.has('baseline.json')) throw new Error('Incomplete release entries');
const datasetAsset =
  release.version === 1
    ? `assets/collected-dataset-${datasetEntry.sha256}.json`
    : datasetEntry.name;
let compactEntries = [];
if (release.version === 2) {
  const verifier = await createServer({
    configFile: false,
    appType: 'custom',
    logLevel: 'error',
    server: { middlewareMode: true, watch: null, ws: false },
  });
  try {
    const { verifyCompactDirectory } = await verifier.ssrLoadModule(
      '/src/pipeline/verify-compact-directory.ts',
    );
    const manifest = await verifyCompactDirectory(stagingPath, datasetEntry);
    const { validateCompactReleaseBinding } = await verifier.ssrLoadModule(
      '/src/shared/compact-data.ts',
    );
    validateCompactReleaseBinding(
      manifest,
      release,
      JSON.parse(await readFile(join(stagingPath, 'baseline.json'), 'utf8')),
    );
    if (
      manifest.archiveSha256 !== release.archiveSha256 ||
      manifest.policyRevision !== release.policyRevision ||
      manifest.recordCount !== release.recordCount
    )
      throw new Error('Compact release metadata mismatch');
    compactEntries = manifest.entries;
  } finally {
    await verifier.close();
  }
}
// Staging names are local inputs; deployed names must resolve to the actual published files.
const deployedRelease = {
  ...release,
  entries: release.entries.map((entry) => ({
    ...entry,
    name: entry.name === 'dataset.json' ? datasetAsset : entry.name,
  })),
};
const deployedReleaseBytes = Buffer.from(`${JSON.stringify(deployedRelease)}\n`);
const stagedBytes = [...release.entries, ...compactEntries].reduce(
  (sum, entry) => sum + entry.byteLength,
  deployedReleaseBytes.length,
);
// Reject an impossible site before hashing/copying multi-gigabyte assets.
requirePagesSize(stagedBytes);
for (const entry of files.values()) await verifyOrCopy(entry);
await mkdir(dirname(output), { recursive: true });
const candidate = await mkdtemp(join(dirname(output), `.${basename(output)}-`));
try {
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
            fileName: datasetAsset,
            source: '',
          });
          return release.version === 1
            ? `import { createPublicationLoader } from '/src/app/publication-loader.ts'; export const demoLoader = createPublicationLoader(import.meta.ROLLUP_FILE_URL_${asset});`
            : `import { createCompactPublicationLoader } from '/src/app/compact-publication-loader.ts'; export const demoLoader = createCompactPublicationLoader(import.meta.ROLLUP_FILE_URL_${asset});`;
        },
      },
    ],
    build: { outDir: candidate, emptyOutDir: false },
  });
  // Vite has emitted a zero-byte dataset placeholder. Account for every remaining file
  // before copying data; an over-budget candidate never becomes the requested site.
  requirePagesSize((await directoryBytes(candidate)) + stagedBytes);
  // Same deployment carries the baseline corresponding to its data, for operator recovery.
  await verifyOrCopy(datasetEntry, join(candidate, datasetAsset));
  for (const entry of compactEntries) await verifyOrCopy(entry, join(candidate, entry.name));
  await verifyOrCopy(files.get('baseline.json'), join(candidate, 'baseline.json'));
  await writeFile(join(candidate, 'release.json'), deployedReleaseBytes, { flag: 'wx' });

  requirePagesSize(await directoryBytes(candidate));
  // Preserve an output that appeared while the candidate was being built.
  try {
    await lstat(output);
    throw new Error('Build output already exists');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  await rename(candidate, output);
} finally {
  await rm(candidate, { recursive: true, force: true });
}
