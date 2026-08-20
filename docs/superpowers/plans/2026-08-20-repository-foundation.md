# Repository Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved MIT-licensed, single-package Preact/Vite repository foundation with exact runtime metadata, Biome quality checks, strict TypeScript, reproducible commands, and a reviewed dependency-license report.

**Architecture:** One private ESM npm package contains a minimal Preact entry and explicit `app`, `search`, `domain`, `pipeline`, and `shared` module directories. Vite emits portable relative static assets, TypeScript checks without emitting, and Biome independently enforces lint and format rules while excluding `handbook/ko/**` from implementation tooling. No test harness, data contract, deployment workflow, or product behavior is introduced.

**Tech Stack:** Node.js 24.19.0, npm 11.17.0, TypeScript 7.0.2, Preact 10.29.8, Vite 8.2.1, `@preact/preset-vite` 2.10.6, and `@biomejs/biome` 2.5.9 under its MIT option.

**Spec:** `docs/superpowers/specs/2026-08-20-repository-foundation-design.md`

## Global Constraints

- Project source code uses the human-approved MIT license; update the two Apache-2.0 statements in the source PRD to MIT.
- Use only the exact direct dependency versions listed in this plan; do not install TASK-003 test dependencies yet.
- Run install and verification with Node.js 24.19.0 and npm 11.17.0, not the shell-default Node.js 22/npm 10 pair.
- Keep the application static, browser-only, and free of servers, runtime databases, paid APIs, analytics, tracking, and production data.
- Do not implement search, data schemas, status mapping, deployment, or user-facing product copy beyond the project name.
- Never read, search, format, lint, cite, or modify `handbook/ko/**` during implementation.
- Keep Node-executed TypeScript compatible with native erasable syntax and do not add path aliases.
- Use two-space indentation, 100-column lines, LF endings, single-quoted TypeScript, double-quoted JSX attributes, semicolons, and trailing commas.
- Stop on an unapproved dependency, missing license, verification failure, source-PRD conflict, or product-safety regression.

---

### Task 1: Apply the Approved MIT Source Requirement

**Files:**
- Modify: `memory/session.md`
- Modify outside repository: `/Users/sonmyeong-gwan/Documents/Codex/2026-08-18/new-chat/outputs/zero-cost-open-business-dashboard-prd.md`

**Interfaces:**
- Consumes: The reviewed TASK-002 specification and user-approved MIT license change.
- Produces: One unambiguous MIT source requirement for all later tasks.

- [ ] **Step 1: Verify the source PRD still has exactly two project-license statements**

Run:

```bash
rg -n '코드 라이선스: Apache-2.0|소스코드 라이선스는 Apache-2.0을 사용한다' /Users/sonmyeong-gwan/Documents/Codex/2026-08-18/new-chat/outputs/zero-cost-open-business-dashboard-prd.md
```

Expected: exactly two matches, one in the document metadata and one in Section 20. If the count differs, stop and reconcile the current source requirement before editing.

- [ ] **Step 2: Apply the approved source-PRD license change**

Use `apply_patch` to make these exact replacements in the source PRD:

```diff
-- 코드 라이선스: Apache-2.0
+- 코드 라이선스: MIT
@@
-- 소스코드 라이선스는 Apache-2.0을 사용한다.
+- 소스코드 라이선스는 MIT를 사용한다.
```

- [ ] **Step 3: Record source-PRD synchronization in the session state**

Add this checked item under `memory/session.md` Current Work:

```markdown
- [x] Synchronize the source PRD's two project-license statements with the approved MIT decision.
```

- [ ] **Step 4: Verify the license requirement and context boundary**

Run:

```bash
rg -n '코드 라이선스: MIT|소스코드 라이선스는 MIT를 사용한다' /Users/sonmyeong-gwan/Documents/Codex/2026-08-18/new-chat/outputs/zero-cost-open-business-dashboard-prd.md
rg -n --glob '!handbook/ko/**' 'code license: Apache-2.0|Code license: Apache-2.0|Set up the Apache-2.0|Configure Apache-2.0' .
git diff --check
```

Expected: two MIT matches in the source PRD, zero stale project-license matches in the repository, and no whitespace errors. Dependency-license rows for TypeScript or Playwright and historical ADR explanations may still contain Apache-2.0 because those describe package licenses or the superseded decision.

- [ ] **Step 5: Commit the written-review state**

```bash
git add memory/session.md
git commit -m "docs(license): record MIT source requirement"
```

The external source PRD is intentionally not part of the repository commit; ADR-007 and the verification evidence record the human-approved change.

---

### Task 2: Add MIT and Exact Package/Runtime Metadata

**Files:**
- Create: `.node-version`
- Create: `.npmrc`
- Create: `LICENSE`
- Create: `package.json`
- Create: `package-lock.json` through npm 11.17.0

**Interfaces:**
- Consumes: Exact versions and MIT choice from ADR-007 and the approved specification.
- Produces: `npm ci` contract and installed binaries consumed by Tasks 3–5.

- [ ] **Step 1: Confirm the approved Node binary and npm launcher path**

Run:

```bash
TASK_NODE=/Users/sonmyeong-gwan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node
TASK_NODE_DIR=/Users/sonmyeong-gwan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin
TASK_NPX=/opt/homebrew/lib/node_modules/npm/bin/npx-cli.js
"$TASK_NODE" --version
PATH="$TASK_NODE_DIR:$PATH" "$TASK_NODE" "$TASK_NPX" --yes npm@11.17.0 --version
```

Expected: `v24.19.0` and `11.17.0`. Stop if either value differs.

- [ ] **Step 2: Create runtime, npm, package, and license files**

Create `.node-version`:

```text
24.19.0
```

Create `.npmrc`:

```ini
engine-strict=true
package-lock=true
save-exact=true
```

Create `package.json`:

```json
{
  "name": "open-store-searcher",
  "version": "0.1.0-dev",
  "private": true,
  "type": "module",
  "license": "MIT",
  "packageManager": "npm@11.17.0",
  "engines": {
    "node": "24.19.0",
    "npm": "11.17.0"
  },
  "dependencies": {
    "preact": "10.29.8"
  },
  "devDependencies": {
    "@biomejs/biome": "2.5.9",
    "@preact/preset-vite": "2.10.6",
    "typescript": "7.0.2",
    "vite": "8.2.1"
  }
}
```

Create `LICENSE`:

```text
MIT License

Copyright (c) 2026 open-store-searcher contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 3: Generate the exact lockfile and install approved packages**

Run:

```bash
TASK_NODE=/Users/sonmyeong-gwan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node
TASK_NODE_DIR=/Users/sonmyeong-gwan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin
TASK_NPX=/opt/homebrew/lib/node_modules/npm/bin/npx-cli.js
PATH="$TASK_NODE_DIR:$PATH" "$TASK_NODE" "$TASK_NPX" --yes npm@11.17.0 install
```

Expected: `package-lock.json` and `node_modules/` are created without engine errors, audit-critical failures, or additions to direct dependencies.

- [ ] **Step 4: Verify exact direct dependencies and package metadata**

Run:

```bash
TASK_NODE=/Users/sonmyeong-gwan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node
TASK_NODE_DIR=/Users/sonmyeong-gwan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin
TASK_NPX=/opt/homebrew/lib/node_modules/npm/bin/npx-cli.js
PATH="$TASK_NODE_DIR:$PATH" "$TASK_NODE" "$TASK_NPX" --yes npm@11.17.0 ls --depth=0
rg -n '"(preact|@biomejs/biome|@preact/preset-vite|typescript|vite)"' package.json
git diff --check
```

Expected direct package list: `preact@10.29.8`, `@biomejs/biome@2.5.9`, `@preact/preset-vite@2.10.6`, `typescript@7.0.2`, and `vite@8.2.1`, with no test package or additional direct dependency.

- [ ] **Step 5: Commit package metadata and lockfile**

```bash
git add .node-version .npmrc LICENSE package.json package-lock.json
git commit -m "chore(repo): add MIT package foundation"
```

---

### Task 3: Configure Git Exclusions and Biome Commands

**Files:**
- Modify: `.gitignore`
- Create: `biome.json`
- Modify: `package.json`

**Interfaces:**
- Consumes: Biome binary installed by Task 2 and style rules in ADR-007.
- Produces: `lint`, `format`, and `format:check` commands used by the combined verification gate.

- [ ] **Step 1: Demonstrate that quality commands are not configured yet**

Run:

```bash
TASK_NODE=/Users/sonmyeong-gwan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node
TASK_NODE_DIR=/Users/sonmyeong-gwan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin
TASK_NPX=/opt/homebrew/lib/node_modules/npm/bin/npx-cli.js
PATH="$TASK_NODE_DIR:$PATH" "$TASK_NODE" "$TASK_NPX" --yes npm@11.17.0 run lint
```

Expected: failure because `lint` is not yet a package script.

- [ ] **Step 2: Expand `.gitignore` without removing the worktree guard**

Replace `.gitignore` with:

```gitignore
.DS_Store
.env
.env.*
!.env.example
.worktrees/
.vite/
coverage/
dist/
node_modules/
playwright-report/
test-results/
*.log
```

- [ ] **Step 3: Create the approved Biome configuration**

Create `biome.json`:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.5.9/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true,
    "defaultBranch": "main"
  },
  "files": {
    "includes": ["**", "!handbook/ko"]
  },
  "formatter": {
    "enabled": true,
    "formatWithErrors": false,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100,
    "lineEnding": "lf"
  },
  "linter": {
    "enabled": true,
    "domains": {
      "react": "recommended"
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "jsxQuoteStyle": "double",
      "semicolons": "always",
      "trailingCommas": "all"
    }
  },
  "json": {
    "formatter": {
      "trailingCommas": "none"
    }
  }
}
```

- [ ] **Step 4: Add the quality scripts to `package.json`**

Insert this `scripts` object before `dependencies`:

```json
"scripts": {
  "lint": "biome lint --error-on-warnings .",
  "format": "biome format --write .",
  "format:check": "biome format ."
},
```

- [ ] **Step 5: Format and verify the configuration**

Run:

```bash
TASK_NODE=/Users/sonmyeong-gwan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node
TASK_NODE_DIR=/Users/sonmyeong-gwan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin
TASK_NPX=/opt/homebrew/lib/node_modules/npm/bin/npx-cli.js
PATH="$TASK_NODE_DIR:$PATH" "$TASK_NODE" "$TASK_NPX" --yes npm@11.17.0 run format
PATH="$TASK_NODE_DIR:$PATH" "$TASK_NODE" "$TASK_NPX" --yes npm@11.17.0 run lint
PATH="$TASK_NODE_DIR:$PATH" "$TASK_NODE" "$TASK_NPX" --yes npm@11.17.0 run format:check
git diff --check
```

Expected: every command passes, `handbook/ko/**` remains untouched, and `git status --short` shows no handbook path.

- [ ] **Step 6: Commit quality tooling**

```bash
git add .gitignore biome.json package.json
git commit -m "chore(quality): configure Biome checks"
```

---

### Task 4: Add Strict TypeScript and the Minimal Static App

**Files:**
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/app/app.tsx`
- Create: `src/app/main.tsx`
- Create: `src/domain/.gitkeep`
- Create: `src/pipeline/.gitkeep`
- Create: `src/search/.gitkeep`
- Create: `src/shared/.gitkeep`
- Modify: `package.json`

**Interfaces:**
- Consumes: Exact build dependencies and quality configuration from Tasks 2–3.
- Produces: A strict typed Preact entry and portable Vite build consumed by verification and later feature tasks.

- [ ] **Step 1: Add build scripts before their configuration exists**

Extend `package.json` scripts to exactly:

```json
"scripts": {
  "dev": "vite",
  "lint": "biome lint --error-on-warnings .",
  "format": "biome format --write .",
  "format:check": "biome format .",
  "typecheck": "tsc --noEmit",
  "build": "vite build",
  "preview": "vite preview",
  "verify": "biome lint --error-on-warnings . && biome format . && tsc --noEmit && vite build"
},
```

Run the following with the pinned environment. Expected: failure because no TypeScript input or configuration exists yet.

```bash
TASK_NODE=/Users/sonmyeong-gwan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node
TASK_NODE_DIR=/Users/sonmyeong-gwan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin
TASK_NPX=/opt/homebrew/lib/node_modules/npm/bin/npx-cli.js
PATH="$TASK_NODE_DIR:$PATH" "$TASK_NODE" "$TASK_NPX" --yes npm@11.17.0 run typecheck
```

- [ ] **Step 2: Create strict TypeScript configuration**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2023",
    "useDefineForClassFields": true,
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "forceConsistentCasingInFileNames": true,
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "jsxImportSource": "preact",
    "verbatimModuleSyntax": true,
    "erasableSyntaxOnly": true
  },
  "include": ["src", "vite.config.ts"]
}
```

- [ ] **Step 3: Create Vite and HTML entries**

Create `vite.config.ts`:

```ts
import preact from '@preact/preset-vite';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  plugins: [preact()],
});
```

Create `index.html`:

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>open-store-searcher</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/app/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Create the minimal Preact entry**

Create `src/app/app.tsx`:

```tsx
export function App() {
  return (
    <main>
      <h1>open-store-searcher</h1>
    </main>
  );
}
```

Create `src/app/main.tsx`:

```tsx
import { render } from 'preact';

import { App } from './app.js';

const root = document.getElementById('app');

if (!root) {
  throw new Error('Application root not found.');
}

render(<App />, root);
```

Add empty `.gitkeep` files under `src/domain`, `src/pipeline`, `src/search`, and `src/shared`. Do not add barrel exports, schemas, types, or placeholder business functions.

- [ ] **Step 5: Run focused checks and the default build**

Run with the pinned Node/npm environment:

```bash
TASK_NODE=/Users/sonmyeong-gwan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node
TASK_NODE_DIR=/Users/sonmyeong-gwan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin
TASK_NPX=/opt/homebrew/lib/node_modules/npm/bin/npx-cli.js
PATH="$TASK_NODE_DIR:$PATH" "$TASK_NODE" "$TASK_NPX" --yes npm@11.17.0 run format
PATH="$TASK_NODE_DIR:$PATH" "$TASK_NODE" "$TASK_NPX" --yes npm@11.17.0 run lint
PATH="$TASK_NODE_DIR:$PATH" "$TASK_NODE" "$TASK_NPX" --yes npm@11.17.0 run format:check
PATH="$TASK_NODE_DIR:$PATH" "$TASK_NODE" "$TASK_NPX" --yes npm@11.17.0 run typecheck
PATH="$TASK_NODE_DIR:$PATH" "$TASK_NODE" "$TASK_NPX" --yes npm@11.17.0 run build
```

Expected: every command passes; `dist/index.html` exists; the built JavaScript contains only the minimal Preact entry and no data, tracking, network-search, or deployment code.

- [ ] **Step 6: Verify GitHub Pages-style subpath assets**

Run:

```bash
PATH="$TASK_NODE_DIR:$PATH" "$TASK_NODE" "$TASK_NPX" --yes npm@11.17.0 run build -- --base=/open-store-searcher/
rg -n '/open-store-searcher/assets/' dist/index.html
rg -n 'src="/assets/|href="/assets/' dist/index.html
PATH="$TASK_NODE_DIR:$PATH" "$TASK_NODE" "$TASK_NPX" --yes npm@11.17.0 run build
```

Expected: the first search finds subpath-prefixed assets, the second search returns no matches, and the final default build restores relative production output.

- [ ] **Step 7: Commit the static foundation**

```bash
git add index.html package.json src tsconfig.json vite.config.ts
git commit -m "feat(app): scaffold static Preact foundation"
```

---

### Task 5: Generate and Review the Dependency-License Report

**Files:**
- Create: `scripts/report-dependency-licenses.mjs`
- Create: `reports/dependency-licenses-2026-08-20.md`
- Modify: `dependencies.md`

**Interfaces:**
- Consumes: `package-lock.json`, installed package manifests, and the direct dependency list from Task 2.
- Produces: Deterministic package/version/relationship/license evidence for the Reviewer and later dependency audits.

- [ ] **Step 1: Demonstrate the report generator is absent**

Run:

```bash
/Users/sonmyeong-gwan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/report-dependency-licenses.mjs
```

Expected: failure because the script does not exist.

- [ ] **Step 2: Create the deterministic report generator**

Create `scripts/report-dependency-licenses.mjs`:

```js
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
    missing.push(`${packagePath}: name=${name || 'missing'}, version=${version || 'missing'}, license=${license || 'missing'}`);
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
  .sort((left, right) => left.name.localeCompare(right.name) || left.version.localeCompare(right.version))
  .map(({ name, version, relationship, license }) => `| ${name} | ${version} | ${relationship} | ${license} |`);

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
```

- [ ] **Step 3: Generate the report and fail on missing metadata**

Run with Node.js 24.19.0:

```bash
/Users/sonmyeong-gwan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/report-dependency-licenses.mjs
rg -n '\|  \|| missing | UNKNOWN | UNLICENSED' reports/dependency-licenses-2026-08-20.md
```

Expected: the script reports a positive package count and the search returns no matches. If a package lacks a declared license, stop and record the issue instead of inferring one.

- [ ] **Step 4: Review license compatibility**

Compare every distinct license expression in the report with the package manifest and its authoritative license file. If any package has an incompatible or unclear license, stop and do not complete TASK-002. Record the positive conclusion in `dependencies.md` during the next step rather than editing the generated report.

- [ ] **Step 5: Link and record the audit conclusion in `dependencies.md`**

Add this section to `dependencies.md`:

```markdown
## TASK-002 Installation Audit

- The repository foundation installs only Preact, TypeScript, Vite, `@preact/preset-vite`, and Biome as direct packages.
- Every locked package version has a declared license.
- The recorded licenses are compatible with distribution of this MIT-licensed project.
- No paid service, runtime server, database, analytics, advertising, tracking, scraper, or AI-status dependency is present.
- `@biomejs/biome` is consumed under the MIT option in its `MIT OR Apache-2.0` expression.

`reports/dependency-licenses-2026-08-20.md` records the exact direct and transitive package versions and declared licenses from the TASK-002 lockfile.
```

- [ ] **Step 6: Verify determinism and commit**

Run the generator again and confirm it produces the same report. Compare `shasum reports/dependency-licenses-2026-08-20.md` before and after the second run, then run `git diff --check`.

```bash
git add dependencies.md reports/dependency-licenses-2026-08-20.md scripts/report-dependency-licenses.mjs
git commit -m "docs(deps): record foundation licenses"
```

---

### Task 6: Replace Foundation Placeholders and Record Verification Commands

**Files:**
- Modify: `commands.md`
- Modify: `docs/open-questions.md`
- Modify: `docs/prd-traceability.md`
- Modify: `memory/architecture.md`
- Modify: `memory/project.md`
- Modify: `memory/session.md`
- Modify: `tasks/active.md`
- Modify: `tech-stack.md`

**Interfaces:**
- Consumes: Passing commands, module layout, license report, and subpath evidence from Tasks 2–5.
- Produces: Authoritative implementation state and exact commands for Tester and Reviewer use.

- [ ] **Step 1: Replace TASK-002 command placeholders**

In `commands.md`, replace the Develop block with:

```bash
npm run dev
npm run typecheck
npm run lint
npm run format
npm run format:check
npm run verify
```

Replace `[BUILD_COMMAND]` with `npm run build` and `[PREVIEW_COMMAND]` with `npm run preview`. Leave TASK-003 test placeholders, data-pipeline placeholders, deployment, and later performance/quality commands unchanged.

- [ ] **Step 2: Resolve only the implemented open questions**

In `docs/open-questions.md`, replace the development-command question with:

```markdown
| What are the test, coverage, pipeline, deployment, and later verification commands? | Remaining `[*_COMMAND]` values in `commands.md` | TASK-003 and later assigned tasks | commands |
```

In `tech-stack.md`, add this accepted stack row:

```markdown
| Code license | MIT | — | Approved through ADR-007 |
```

Replace the combined lint/format/coverage open decision with:

```markdown
- [ ] Define minimum coverage and complete test commands in TASK-003.
```

- [ ] **Step 3: Record architecture and traceability evidence**

In `memory/architecture.md`, add this decision-summary row:

```markdown
| Repository foundation | MIT-licensed single npm package; strict TypeScript; Biome; relative Vite base | 2026-08-20 |
```

Add these architecture constraints:

```markdown
- Use the committed Node.js, npm, package-lock, TypeScript, Biome, and Vite configuration as the reproducible foundation.
- Keep `handbook/ko/**` outside linting, formatting, and all implementation context.
```

In `docs/prd-traceability.md`, keep the Cost row `In progress` and extend its evidence cell to include `TASK-002 dependency-license report and static-build verification`; do not claim deployment completion.

- [ ] **Step 4: Update active session evidence without closing the task**

In `memory/project.md`, mark TASK-002 implementation complete and independent review pending. In `memory/session.md`, record exact successful command names and the subpath/license evidence. In `tasks/active.md`, check implementation criteria that have objective evidence, leave the Reviewer criterion unchecked, and set status to `Implementation verified; Reviewer approval pending`.

- [ ] **Step 5: Verify documentation boundaries and commit**

Run:

```bash
rg -n '\[DEV_COMMAND\]|\[TYPE_CHECK_COMMAND\]|\[LINT_COMMAND\]|\[FORMAT_COMMAND\]|\[BUILD_COMMAND\]|\[PREVIEW_COMMAND\]' commands.md
rg -n --glob '!handbook/ko/**' 'code license: Apache-2.0|Code license: Apache-2.0|Set up the Apache-2.0|Configure Apache-2.0' .
git diff --check
git status --short
```

Expected: no TASK-002 command placeholders, no stale project-license statement, no whitespace error, and no changed handbook, secret, environment, key, token, production-data, Actions, or deployment file.

```bash
git add commands.md docs/open-questions.md docs/prd-traceability.md memory/architecture.md memory/project.md memory/session.md tasks/active.md tech-stack.md
git commit -m "docs(repo): record foundation commands"
```

---

### Task 7: Run Clean Verification, Independent Gates, and Task Closure

**Files:**
- Create by Tester: `reports/test-2026-08-20-task-002.md`
- Create by Reviewer: `reports/review-2026-08-20-task-002.md`
- Modify after approval: `memory/project.md`
- Modify after approval: `memory/session.md`
- Modify after approval: `tasks/active.md`
- Modify after approval: `tasks/completed.md`
- Modify if evidence changed: `docs/prd-traceability.md`

**Interfaces:**
- Consumes: All implementation commits and acceptance criteria.
- Produces: Independent evidence, a closed TASK-002 record, and a merge-ready branch for human approval.

- [ ] **Step 1: Run a clean install with the exact toolchain**

Run:

```bash
TASK_NODE=/Users/sonmyeong-gwan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node
TASK_NODE_DIR=/Users/sonmyeong-gwan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin
TASK_NPX=/opt/homebrew/lib/node_modules/npm/bin/npx-cli.js
"$TASK_NODE" --version
PATH="$TASK_NODE_DIR:$PATH" "$TASK_NODE" "$TASK_NPX" --yes npm@11.17.0 --version
PATH="$TASK_NODE_DIR:$PATH" "$TASK_NODE" "$TASK_NPX" --yes npm@11.17.0 ci
```

Expected: `v24.19.0`, `11.17.0`, and a successful lockfile-only clean install with no direct dependency change.

- [ ] **Step 2: Run every acceptance command**

Run with the pinned environment:

```bash
PATH="$TASK_NODE_DIR:$PATH" "$TASK_NODE" "$TASK_NPX" --yes npm@11.17.0 run lint
PATH="$TASK_NODE_DIR:$PATH" "$TASK_NODE" "$TASK_NPX" --yes npm@11.17.0 run format:check
PATH="$TASK_NODE_DIR:$PATH" "$TASK_NODE" "$TASK_NPX" --yes npm@11.17.0 run typecheck
PATH="$TASK_NODE_DIR:$PATH" "$TASK_NODE" "$TASK_NPX" --yes npm@11.17.0 run build
PATH="$TASK_NODE_DIR:$PATH" "$TASK_NODE" "$TASK_NPX" --yes npm@11.17.0 run verify
"$TASK_NODE" scripts/report-dependency-licenses.mjs
```

Expected: all commands pass with zero warning treated as success and no generated report drift.

- [ ] **Step 3: Repeat the subpath and scope audits**

Run:

```bash
PATH="$TASK_NODE_DIR:$PATH" "$TASK_NODE" "$TASK_NPX" --yes npm@11.17.0 run build -- --base=/open-store-searcher/
rg -n '/open-store-searcher/assets/' dist/index.html
rg -n 'src="/assets/|href="/assets/' dist/index.html
PATH="$TASK_NODE_DIR:$PATH" "$TASK_NODE" "$TASK_NPX" --yes npm@11.17.0 run build
git diff --check
git status --short
git diff --name-only origin/main...HEAD
```

Expected: subpath assets are present, root-absolute asset matches are absent, the worktree is clean except any deliberate verification-report update, and changed paths contain no handbook, environment, secret, token, key, production-data, Actions, or deployment file.

- [ ] **Step 4: Obtain independent Tester evidence**

Have a Tester read the active task, approved specification, implementation plan, and changed implementation files while excluding `handbook/ko/**`. The Tester reruns the exact toolchain, clean install, command suite, subpath check, dependency/version comparison, and scope audit. Record commands, outputs, failures, and pass/fail conclusion in `reports/test-2026-08-20-task-002.md`. Any failure returns to the Implementer and restarts the affected verification steps.

- [ ] **Step 5: Obtain independent Reviewer approval**

Have a Reviewer inspect `origin/main...HEAD`, the Tester report, license report, task criteria, PRD/ADR consistency, static architecture, dependency scope, privacy boundary, accessibility semantics of the minimal entry, and product-safety invariants. The author must not provide their own final approval. Record findings and the approval decision in `reports/review-2026-08-20-task-002.md`. Any finding is fixed and sent through Tester and Reviewer again.

- [ ] **Step 6: Close TASK-002 only after Reviewer approval**

After both independent gates pass:

- set `tasks/active.md` back to no active task;
- add TASK-002 and concise verification evidence to `tasks/completed.md`;
- mark TASK-002 complete and TASK-003 next in `memory/project.md` and `memory/session.md`;
- keep M0 open because TASK-003 and the milestone handbook gate remain outstanding;
- update `docs/prd-traceability.md` only with evidence actually present.

- [ ] **Step 7: Commit closure evidence and verify merge readiness**

```bash
git add reports/test-2026-08-20-task-002.md reports/review-2026-08-20-task-002.md memory/project.md memory/session.md tasks/active.md tasks/completed.md docs/prd-traceability.md
git commit -m "docs(tasks): complete task-002"
git status --short --branch
git log --oneline --decorate origin/main..HEAD
```

Expected: clean `codex/task-002-foundation` branch containing only reviewed TASK-002 commits. Stop before push, pull request creation, merge, tag, deployment, or handbook modification unless the user separately authorizes that action.
