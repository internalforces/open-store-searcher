import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const lock = JSON.parse(readFileSync(join(root, 'package-lock.json'), 'utf8'));
const rootPackage = lock.packages?.[''];

if (!rootPackage || !lock.packages) {
  throw new Error('package-lock.json does not contain npm package metadata.');
}

const directNames = new Set([
  ...Object.keys(rootPackage.dependencies ?? {}),
  ...Object.keys(rootPackage.devDependencies ?? {}),
]);

function packageNameFromPath(packagePath) {
  const marker = 'node_modules/';
  const tail = packagePath.slice(packagePath.lastIndexOf(marker) + marker.length);
  const parts = tail.split('/');
  return tail.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
}

function normalizeLicense(value) {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(normalizeLicense).filter(Boolean).join(' OR ');
  }

  if (value && typeof value === 'object' && typeof value.type === 'string') {
    return value.type;
  }

  return '';
}

const records = new Map();
const missing = [];

for (const [packagePath, lockPackage] of Object.entries(lock.packages)) {
  if (packagePath === '') {
    continue;
  }

  let manifest = {};
  try {
    manifest = JSON.parse(readFileSync(join(root, packagePath, 'package.json'), 'utf8'));
  } catch {
    // Platform-specific optional packages can be present only in the lockfile.
  }

  const name = manifest.name ?? packageNameFromPath(packagePath);
  const version = manifest.version ?? lockPackage.version;
  const license = normalizeLicense(manifest.license ?? lockPackage.license);

  if (!name || !version || !license) {
    missing.push(
      `${packagePath}: name=${name || 'missing'}, version=${version || 'missing'}, license=${license || 'missing'}`,
    );
    continue;
  }

  const relationship = directNames.has(name) ? 'Direct' : 'Transitive';
  const key = `${name}@${version}`;
  const existing = records.get(key);

  if (!existing || relationship === 'Direct') {
    records.set(key, { name, version, relationship, license });
  }
}

if (missing.length > 0) {
  throw new Error(`Packages with incomplete license metadata:\n${missing.join('\n')}`);
}

const rows = [...records.values()]
  .sort(
    (left, right) =>
      left.name.localeCompare(right.name) || left.version.localeCompare(right.version),
  )
  .map(
    ({ name, version, relationship, license }) =>
      `| ${name} | ${version} | ${relationship} | ${license} |`,
  );

const report = [
  '<!--',
  'Purpose:        Record exact direct and transitive dependency licenses for TASK-002',
  'Owner:          Implementer / Reviewer',
  'Update Trigger: When package-lock.json changes',
  'Harness Version: 1.1',
  '-->',
  '',
  '# TASK-002 Dependency License Report',
  '',
  '_Generated from `package-lock.json` and installed package manifests on 2026-08-20._',
  '',
  '| Package | Version | Relationship | Declared license |',
  '|---|---|---|---|',
  ...rows,
  '',
].join('\n');

writeFileSync(join(root, 'reports/dependency-licenses-2026-08-20.md'), report);
console.log(`Recorded ${rows.length} unique package versions.`);
