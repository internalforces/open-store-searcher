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
  const parts = packagePath.split('/');
  let index = 0;
  let name = '';

  while (index < parts.length) {
    if (parts[index] !== 'node_modules') {
      throw new Error(`Invalid npm lock package path: ${packagePath}`);
    }

    index += 1;
    const firstNamePart = parts[index];

    if (!firstNamePart) {
      throw new Error(`Invalid npm lock package path: ${packagePath}`);
    }

    if (firstNamePart.startsWith('@')) {
      const secondNamePart = parts[index + 1];
      if (
        !/^@[a-z0-9][a-z0-9._-]*$/i.test(firstNamePart) ||
        !/^[a-z0-9][a-z0-9._-]*$/i.test(secondNamePart ?? '')
      ) {
        throw new Error(`Invalid npm lock package path: ${packagePath}`);
      }

      name = `${firstNamePart}/${secondNamePart}`;
      index += 2;
    } else {
      if (!/^[a-z0-9][a-z0-9._-]*$/i.test(firstNamePart)) {
        throw new Error(`Invalid npm lock package path: ${packagePath}`);
      }

      name = firstNamePart;
      index += 1;
    }
  }

  return name;
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

  const name = packageNameFromPath(packagePath);
  const version = lockPackage.version;
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(join(root, packagePath, 'package.json'), 'utf8'));
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      throw error;
    }

    if (lockPackage.optional !== true) {
      throw new Error(`Missing installed manifest for non-optional lock package: ${packagePath}`);
    }
  }

  if (manifest && (manifest.name !== name || manifest.version !== version)) {
    throw new Error(
      `Manifest does not match lock package: ${packagePath}: expected ${name}@${version}, found ${manifest.name}@${manifest.version}`,
    );
  }

  const license = normalizeLicense(manifest?.license ?? lockPackage.license);

  if (!name || !version || !license) {
    missing.push(
      `${packagePath}: name=${name || 'missing'}, version=${version || 'missing'}, license=${license || 'missing'}`,
    );
    continue;
  }

  const relationship =
    packagePath === `node_modules/${name}` && directNames.has(name) ? 'Direct' : 'Transitive';
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
