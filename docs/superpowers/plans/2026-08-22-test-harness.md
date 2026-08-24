# TASK-003 Test Harness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved layered test harness, coverage policy, Pages-subpath browser checks,
fixture rules, and verification commands for the current static Preact application.

**Architecture:** One Vitest root configuration owns Node unit, Node pipeline, and jsdom component
projects with shared V8 coverage. One Playwright configuration owns desktop Chromium, Firefox,
WebKit, and mobile Chromium projects against a locally built `/open-store-searcher/` preview;
separate scripts select fast, full, and accessibility runs.

**Tech Stack:** Node.js 24.19.0, npm 11.17.0, TypeScript 7.0.2, Preact 10.29.8, Vite 8.2.1,
Vitest 4.1.11, Testing Library, jsdom 30.0.1, Playwright 1.62.1, axe 4.13.0, Biome 2.5.9

**Spec:** `docs/superpowers/specs/2026-08-20-test-harness-design.md`

## Global Constraints

- Work only on `codex/task-003-test-harness` in the existing isolated worktree.
- Use Node.js 24.19.0 and npm 11.17.0 for every install, script, and verification command.
- Add only the seven direct test dependencies and exact versions approved in the specification.
- Do not fetch or model source data and do not create a speculative administrative-data fixture.
- Do not implement pipeline, search, status-mapping, result-card, or failure-state product behavior.
- Do not add a workflow, deployment, runtime service, analytics, tracking, or production data.
- Do not read, search, cite, or modify `handbook/ko/**`.
- Keep Korean text in harness files limited to exact test or source literals whose spelling matters.
- Keep Playwright browser binaries, coverage output, reports, traces, and test results untracked.
- Preserve the relative production Vite base; use `/open-store-searcher/` only in E2E scripts.
- Enforce 80% statements, lines, and functions plus 75% branches globally.
- Record the future 100% status-mapping file threshold, but do not invent its TASK-007 path.
- Do not close TASK-003 until an independent Tester records PASS and an independent Reviewer records
  APPROVED.

Use this runtime prefix for npm commands in this worktree:

```bash
runtime_bin=/Users/sonmyeong-gwan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin
PATH="$runtime_bin:$PATH" npx --yes npm@11.17.0 <arguments>
```

Do not commit generated `coverage/`, `dist/`, `playwright-report/`, or `test-results/` content.

---

### Task 1: Install the approved test stack and refresh license evidence

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `scripts/report-dependency-licenses.mjs`
- Create: `reports/dependency-licenses-2026-08-24.md`

**Interfaces:**

- Consumes: the exact dependency approvals in the specification and the existing npm lockfile
- Produces: seven pinned direct development dependencies and a complete TASK-003 license report

- [ ] **Step 1: Install exactly the approved direct development dependencies**

Run:

```bash
runtime_bin=/Users/sonmyeong-gwan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin
PATH="$runtime_bin:$PATH" npx --yes npm@11.17.0 install --save-dev --save-exact \
  vitest@4.1.11 \
  @vitest/coverage-v8@4.1.11 \
  @testing-library/preact@3.2.4 \
  @testing-library/user-event@14.6.5 \
  jsdom@30.0.1 \
  @playwright/test@1.62.1 \
  @axe-core/playwright@4.13.0
```

Expected: npm updates only `package.json`, `package-lock.json`, and `node_modules`; the seven new
direct packages appear under `devDependencies` at exact versions without `^` or `~`.

- [ ] **Step 2: Audit the direct package set**

Run:

```bash
runtime_bin=/Users/sonmyeong-gwan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin
PATH="$runtime_bin:$PATH" npx --yes npm@11.17.0 ls --depth=0
```

Expected: the original five direct packages remain, the seven approved test packages appear once,
and npm reports no missing or invalid direct dependency.

- [ ] **Step 3: Point the license generator at a new TASK-003 evidence file**

In `scripts/report-dependency-licenses.mjs`, replace the report metadata and output target with:

```javascript
const reportDate = '2026-08-24';
const reportTask = 'TASK-003';

const report = [
  '<!--',
  `Purpose:        Record exact direct and transitive dependency licenses for ${reportTask}`,
  'Owner:          Implementer / Reviewer',
  'Update Trigger: When package-lock.json changes',
  'Harness Version: 1.1',
  '-->',
  '',
  `# ${reportTask} Dependency License Report`,
  '',
  `_Generated from \`package-lock.json\` and installed package manifests on ${reportDate}._`,
  '',
  '| Package | Version | Relationship | Declared license |',
  '|---|---|---|---|',
  ...rows,
  '',
].join('\n');

writeFileSync(join(root, `reports/dependency-licenses-${reportDate}.md`), report);
console.log(`Recorded ${rows.length} unique package versions.`);
```

Keep all existing manifest, name, version, optional-package, and missing-license validation logic
unchanged.

- [ ] **Step 4: Generate and validate the new license report**

Run:

```bash
runtime_bin=/Users/sonmyeong-gwan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin
PATH="$runtime_bin:$PATH" "$runtime_bin/node" scripts/report-dependency-licenses.mjs
rg -n '^\| (vitest|@vitest/coverage-v8|@testing-library/preact|@testing-library/user-event|jsdom|@playwright/test|@axe-core/playwright) \|' reports/dependency-licenses-2026-08-24.md
```

Expected: the generator exits zero, reports no incomplete metadata, and the search returns all
seven direct test dependencies with their approved versions and declared licenses.

- [ ] **Step 5: Verify no unapproved direct package was added**

Run:

```bash
git diff -- package.json package-lock.json
git diff --check
```

Expected: `package.json` adds exactly seven development dependencies and no runtime dependency;
the lockfile contains their required transitive packages; the whitespace check exits zero.

- [ ] **Step 6: Commit the dependency and license foundation**

```bash
git add package.json package-lock.json scripts/report-dependency-licenses.mjs \
  reports/dependency-licenses-2026-08-24.md
git commit -m "chore(test): install approved harness dependencies"
```

### Task 2: Add the Vitest projects through a red-green component test

**Files:**

- Create: `src/app/app.test.tsx`
- Create: `tests/setup/component.ts`
- Create: `vitest.config.ts`
- Modify: `package.json`
- Modify: `tsconfig.json`

**Interfaces:**

- Consumes: `App(): JSX.Element` from `src/app/app.tsx` and the seven installed test packages
- Produces: Vitest projects named `unit`, `pipeline`, and `component`; scripts `test`,
  `test:unit`, `test:pipeline`, `test:component`, `test:coverage`; global V8 thresholds

- [ ] **Step 1: Write the component test before configuring jsdom**

Create `src/app/app.test.tsx`:

```tsx
import { render, screen } from '@testing-library/preact';
import { describe, expect, it } from 'vitest';

import { App } from './app.js';

describe('App', () => {
  it('renders the application name as the page heading', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'open-store-searcher' }),
    ).toBeTruthy();
  });
});
```

The production change that would make this test fail later is removing or mislabeling the
application's level-one heading.

- [ ] **Step 2: Run the test and confirm the missing DOM environment failure**

Run:

```bash
runtime_bin=/Users/sonmyeong-gwan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin
PATH="$runtime_bin:$PATH" ./node_modules/.bin/vitest run src/app/app.test.tsx
```

Expected: FAIL with `document is not defined`, proving the component test needs the approved jsdom
project rather than passing in the default Node environment.

- [ ] **Step 3: Add deterministic component cleanup**

Create `tests/setup/component.ts`:

```typescript
import { cleanup } from '@testing-library/preact';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

- [ ] **Step 4: Configure the three Vitest projects and global coverage**

Create `vitest.config.ts`:

```typescript
import preact from '@preact/preset-vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [preact()],
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/app/main.tsx', 'src/**/*.test.{ts,tsx}', 'src/**/*.d.ts'],
      reporter: ['text', 'html'],
      thresholds: {
        statements: 80,
        lines: 80,
        functions: 80,
        branches: 75,
      },
    },
    projects: [
      {
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/{domain,search,shared}/**/*.test.ts'],
          passWithNoTests: true,
        },
      },
      {
        test: {
          name: 'pipeline',
          environment: 'node',
          include: ['src/pipeline/**/*.test.ts'],
          passWithNoTests: true,
        },
      },
      {
        test: {
          name: 'component',
          environment: 'jsdom',
          include: ['src/app/**/*.test.tsx'],
          setupFiles: ['./tests/setup/component.ts'],
        },
      },
    ],
  },
});
```

Do not add an auto-update coverage option and do not add a guessed status-mapping glob.

- [ ] **Step 5: Add the Vitest scripts and integrate coverage into fast verification**

Add these `package.json` scripts, preserving the existing style and scripts:

```json
"test": "vitest run",
"test:unit": "vitest run --project=unit",
"test:pipeline": "vitest run --project=pipeline",
"test:component": "vitest run --project=component",
"test:coverage": "vitest run --coverage",
"verify": "npm run lint && npm run format:check && npm run typecheck && npm run test:coverage && npm run build"
```

- [ ] **Step 6: Typecheck all test and configuration sources**

Replace the `tsconfig.json` include list with:

```json
"include": [
  "src",
  "tests",
  "vite.config.ts",
  "vitest.config.ts",
  "playwright.config.ts"
]
```

This deliberately includes the Playwright config path before Task 4 creates the file; TypeScript
ignores a non-existent include entry.

- [ ] **Step 7: Run the green Vitest and coverage checks**

Run:

```bash
runtime_bin=/Users/sonmyeong-gwan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin
PATH="$runtime_bin:$PATH" npx --yes npm@11.17.0 run test:component
PATH="$runtime_bin:$PATH" npx --yes npm@11.17.0 run test:unit
PATH="$runtime_bin:$PATH" npx --yes npm@11.17.0 run test:pipeline
PATH="$runtime_bin:$PATH" npx --yes npm@11.17.0 run test:coverage
PATH="$runtime_bin:$PATH" npx --yes npm@11.17.0 run typecheck
```

Expected: the component project reports one passing test; unit and pipeline exit zero with their
explicit no-test allowance; coverage reports 100% for `src/app/app.tsx` and exceeds every approved
global threshold; TypeScript reports no error.

- [ ] **Step 8: Run style checks and commit the Vitest harness**

```bash
runtime_bin=/Users/sonmyeong-gwan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin
PATH="$runtime_bin:$PATH" npx --yes npm@11.17.0 run lint
PATH="$runtime_bin:$PATH" npx --yes npm@11.17.0 run format:check
git diff --check
git add src/app/app.test.tsx tests/setup/component.ts vitest.config.ts package.json tsconfig.json
git commit -m "test(unit): configure layered vitest projects"
```

### Task 3: Define the non-speculative fixture contract

**Files:**

- Create: `tests/fixtures/README.md`

**Interfaces:**

- Consumes: the fixture boundary in the TASK-003 design and the unresolved TASK-004 source contract
- Produces: a required metadata template and deterministic fixture rules for later feature tasks

- [ ] **Step 1: Write the fixture policy**

Create `tests/fixtures/README.md` with this content:

```markdown
# Test Fixture Rules

Shared fixtures live in a domain directory under `tests/fixtures/` only when a test consumes them.
Do not create empty fixture directories or infer the administrative-data schema before TASK-004
verifies the source contract.

Every fixture must be small, deterministic, and runnable without network access. Prefer synthetic
records and include only fields needed by the behavior under test. Exact Korean source values may
appear when their spelling is required by the assertion.

Document each fixture in its owning test or a sibling Markdown file with:

- Purpose
- Synthetic or approved source status
- Owning TASK ID
- Expected behavior
- Update trigger

Do not copy a full production export, include secrets or user-behavior data, or fetch external
content during a fixture test.
```

- [ ] **Step 2: Verify the fixture boundary is narrow and English-only**

Run:

```bash
rg -n 'Purpose|Synthetic or approved source status|Owning TASK ID|Expected behavior|Update trigger' tests/fixtures/README.md
find tests/fixtures -type f -not -name README.md -print
git diff --check
```

Expected: all five metadata fields are found; the second command prints nothing; the whitespace
check exits zero.

- [ ] **Step 3: Commit the fixture contract**

```bash
git add tests/fixtures/README.md
git commit -m "docs(test): define deterministic fixture rules"
```

### Task 4: Add the Pages-subpath Playwright smoke matrix through red-green

**Files:**

- Create: `tests/e2e/smoke.spec.ts`
- Create: `playwright.config.ts`
- Modify: `package.json`

**Interfaces:**

- Consumes: the static Vite build and `App` level-one heading
- Produces: Playwright projects `chromium`, `firefox`, `webkit`, `mobile-chromium`; scripts
  `build:e2e`, `preview:e2e`, `test:e2e`, and `test:e2e:full`

- [ ] **Step 1: Install the approved Playwright browser binaries outside Git**

Run:

```bash
runtime_bin=/Users/sonmyeong-gwan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin
PATH="$runtime_bin:$PATH" ./node_modules/.bin/playwright install chromium firefox webkit
```

Expected: the three browser engines are available in the user cache; `git status --short` shows no
browser binary or generated report.

- [ ] **Step 2: Write the subpath smoke test before adding Playwright configuration**

Create `tests/e2e/smoke.spec.ts`:

```typescript
import { expect, test } from '@playwright/test';

test('loads the built application from the GitHub Pages subpath', async ({ page }) => {
  const failedRequests: string[] = [];
  page.on('requestfailed', (request) => {
    failedRequests.push(request.url());
  });

  await page.goto('./');

  await expect(
    page.getByRole('heading', { level: 1, name: 'open-store-searcher' }),
  ).toBeVisible();
  expect(failedRequests).toEqual([]);
});
```

The production change that would make this test fail later is breaking the Pages base path,
application bootstrap, asset loading, or visible page heading.

- [ ] **Step 3: Run the smoke test and confirm the missing base URL failure**

Run:

```bash
runtime_bin=/Users/sonmyeong-gwan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin
PATH="$runtime_bin:$PATH" ./node_modules/.bin/playwright test tests/e2e/smoke.spec.ts
```

Expected: FAIL because `./` cannot resolve without the approved Playwright `baseURL` and local
preview configuration.

- [ ] **Step 4: Configure the local preview and browser projects**

Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://127.0.0.1:4173/open-store-searcher/';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: true,
  retries: 1,
  failOnFlakyTests: true,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
    video: 'off',
  },
  webServer: {
    command: 'npm run build:e2e && npm run preview:e2e',
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 5'] },
    },
  ],
});
```

The `failOnFlakyTests` setting ensures a retry does not conceal an unstable test.

- [ ] **Step 5: Add the E2E build, preview, and smoke scripts**

Add these `package.json` scripts:

```json
"build:e2e": "vite build --base=/open-store-searcher/",
"preview:e2e": "vite preview --host 127.0.0.1 --port 4173 --strictPort --base=/open-store-searcher/",
"test:e2e": "playwright test tests/e2e/smoke.spec.ts --project=chromium --project=mobile-chromium",
"test:e2e:full": "playwright test tests/e2e/smoke.spec.ts --project=chromium --project=firefox --project=webkit --project=mobile-chromium"
```

- [ ] **Step 6: Run the green fast and full smoke matrices**

Run:

```bash
runtime_bin=/Users/sonmyeong-gwan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin
PATH="$runtime_bin:$PATH" npx --yes npm@11.17.0 run test:e2e
PATH="$runtime_bin:$PATH" npx --yes npm@11.17.0 run test:e2e:full
```

Expected: the fast command passes two projects and the full command passes four projects; every
project loads the `/open-store-searcher/` page with no failed asset request.

- [ ] **Step 7: Verify the built asset base and static-runtime boundary**

Run:

```bash
rg -n '/open-store-searcher/assets/' dist/index.html
if rg -n 'https?://|fetch\(|XMLHttpRequest|WebSocket' src tests/e2e/smoke.spec.ts; then
  exit 1
fi
git status --short
```

Expected: `dist/index.html` contains subpath-prefixed assets; the boundary scan finds no external
runtime request code; generated `dist/` and Playwright outputs do not appear in Git status.

- [ ] **Step 8: Run style and type checks, then commit the smoke harness**

```bash
runtime_bin=/Users/sonmyeong-gwan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin
PATH="$runtime_bin:$PATH" npx --yes npm@11.17.0 run lint
PATH="$runtime_bin:$PATH" npx --yes npm@11.17.0 run format:check
PATH="$runtime_bin:$PATH" npx --yes npm@11.17.0 run typecheck
git diff --check
git add tests/e2e/smoke.spec.ts playwright.config.ts package.json
git commit -m "test(e2e): verify pages subpath matrix"
```

### Task 5: Add automated WCAG 2.1 checks through a missing-helper failure

**Files:**

- Create: `tests/e2e/accessibility.spec.ts`
- Create: `tests/setup/accessibility.ts`
- Modify: `package.json`

**Interfaces:**

- Consumes: Playwright `Page` and `@axe-core/playwright`
- Produces: `scanPageForWcag21Violations(page: Page)` and the `test:a11y` script

- [ ] **Step 1: Write the accessibility test against the intended helper**

Create `tests/e2e/accessibility.spec.ts`:

```typescript
import { expect, test } from '@playwright/test';

import { scanPageForWcag21Violations } from '../setup/accessibility.js';

test('has no automatically detectable WCAG 2.1 A or AA violations', async ({ page }) => {
  await page.goto('./');

  const results = await scanPageForWcag21Violations(page);

  expect(results.violations).toEqual([]);
});
```

The page change that would make this test fail later is introducing an automatically detectable
WCAG 2.1 A or AA violation anywhere in the rendered document.

- [ ] **Step 2: Run the test and confirm the missing helper failure**

Run:

```bash
runtime_bin=/Users/sonmyeong-gwan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin
PATH="$runtime_bin:$PATH" ./node_modules/.bin/playwright test \
  tests/e2e/accessibility.spec.ts --project=chromium
```

Expected: FAIL during module resolution because `tests/setup/accessibility.ts` does not exist.

- [ ] **Step 3: Implement the minimum axe helper**

Create `tests/setup/accessibility.ts`:

```typescript
import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

export function scanPageForWcag21Violations(page: Page) {
  return new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
}
```

- [ ] **Step 4: Add the desktop and mobile Chromium accessibility command**

Add this `package.json` script:

```json
"test:a11y": "playwright test tests/e2e/accessibility.spec.ts --project=chromium --project=mobile-chromium"
```

- [ ] **Step 5: Run the green accessibility matrix**

Run:

```bash
runtime_bin=/Users/sonmyeong-gwan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin
PATH="$runtime_bin:$PATH" npx --yes npm@11.17.0 run test:a11y
```

Expected: two projects pass and both return an empty axe violations array.

- [ ] **Step 6: Verify type, style, and dependency boundaries, then commit**

```bash
runtime_bin=/Users/sonmyeong-gwan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin
PATH="$runtime_bin:$PATH" npx --yes npm@11.17.0 run lint
PATH="$runtime_bin:$PATH" npx --yes npm@11.17.0 run format:check
PATH="$runtime_bin:$PATH" npx --yes npm@11.17.0 run typecheck
git diff --check
git add tests/e2e/accessibility.spec.ts tests/setup/accessibility.ts package.json
git commit -m "test(a11y): add automated wcag checks"
```

### Task 6: Integrate full verification and authoritative documentation

**Files:**

- Modify: `package.json`
- Modify: `commands.md`
- Modify: `standards.md`
- Modify: `dependencies.md`
- Modify: `tech-stack.md`
- Modify: `docs/open-questions.md`
- Modify: `docs/prd-traceability.md`
- Modify: `memory/architecture.md`
- Modify: `memory/project.md`
- Modify: `memory/session.md`
- Modify: `tasks/active.md`

**Interfaces:**

- Consumes: every implemented TASK-003 script and the generated license report
- Produces: `verify:full`, resolved TASK-003 placeholders, implementation evidence, and an active
  task ready for independent verification

- [ ] **Step 1: Add the mandatory full-verification script**

Add this `package.json` script:

```json
"verify:full": "npm run verify && npm run test:e2e:full && npm run test:a11y"
```

- [ ] **Step 2: Replace only the TASK-003 command placeholders**

In `commands.md`, replace the Test block with:

````markdown
## Test

```bash
npm run test
npm run test:unit
npm run test:pipeline
npm run test:component
npm run test:coverage
npm run test:e2e
npm run test:e2e:full
npm run test:a11y
npm run verify:full
```
````

Leave every data-pipeline, deployment, performance, recall, and freshness placeholder unchanged.

- [ ] **Step 3: Record the approved quality and fixture rules**

In `standards.md`:

- replace the current minimum-coverage placeholder with statements 80%, lines 80%, functions
  80%, and branches 75%;
- state that the status-mapping file requires 100% after TASK-007 defines its exact path;
- link shared fixture rules to `tests/fixtures/README.md`;
- require later feature tasks to add tests to their owning Vitest project; and
- require `npm run verify:full` for task completion and release-oriented verification.

- [ ] **Step 4: Record dependency and command resolution evidence**

In `dependencies.md`, add a TASK-003 installation audit that names the seven new direct test
packages, confirms development-only use, and links
`reports/dependency-licenses-2026-08-24.md`.

In `tech-stack.md`, check the TASK-003 coverage-and-command item.

In `docs/open-questions.md`, remove the resolved minimum-coverage question and change the command
question so only data pipeline, deployment, performance, recall, freshness, and publication
commands remain open. Add the approved coverage numbers and test command set under Confirmed
Answers.

- [ ] **Step 5: Update architecture and traceability without overstating product completion**

In `memory/architecture.md`, record the three Vitest projects, four Playwright projects, local
Pages-subpath preview, and fast/full verification split.

In `docs/prd-traceability.md`, add TASK-003 to the accessibility foundation's task list and cite
the test configuration as foundation evidence, while leaving the product-level accessibility
criterion incomplete until TASK-017 and TASK-021.

Do not mark search, pipeline, status, privacy, performance, recovery, deployment, or release rows
Done.

- [ ] **Step 6: Record implementation status without closing TASK-003**

In `tasks/active.md`, check the implementation and local-verification criteria that have passed,
but leave independent Tester and Reviewer criteria unchecked.

In `memory/project.md` and `memory/session.md`, record implementation completion, exact commands,
coverage outcome, browser matrix, accessibility result, and pending independent gates. Keep M0
open and TASK-003 active.

- [ ] **Step 7: Run the complete implementation verification**

Run:

```bash
runtime_bin=/Users/sonmyeong-gwan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin
PATH="$runtime_bin:$PATH" npx --yes npm@11.17.0 run verify
PATH="$runtime_bin:$PATH" npx --yes npm@11.17.0 run verify:full
PATH="$runtime_bin:$PATH" "$runtime_bin/node" scripts/report-dependency-licenses.mjs
git diff --check
git status --short
```

Expected: Vitest, thresholds, normal build, all four Playwright smoke projects, two axe projects,
license validation, formatting, lint, typecheck, and whitespace checks pass. Git status contains
only intended source, configuration, harness-document, and evidence changes.

- [ ] **Step 8: Audit the changed-path scope**

Run:

```bash
git diff --name-only 8ed4461...HEAD
git diff --name-only
if { git diff --name-only 8ed4461...HEAD; git diff --name-only; } | \
  rg '^(handbook/ko/|\.env|\.github/workflows/|public/|src/(domain|search|pipeline)/[^.]|src/app/(app|main)\.tsx$)'; then
  exit 1
fi
```

Expected: no handbook, environment, workflow, production-data, feature-production-code, or
deployment path is present.

- [ ] **Step 9: Commit the integrated command and documentation state**

```bash
git add package.json commands.md standards.md dependencies.md tech-stack.md \
  docs/open-questions.md docs/prd-traceability.md memory/architecture.md memory/project.md \
  memory/session.md tasks/active.md
git commit -m "docs(test): integrate task-003 verification"
```

### Task 7: Run independent gates and close TASK-003

**Files:**

- Create: `reports/test-2026-08-24-task-003.md`
- Create: `reports/review-2026-08-24-task-003.md`
- Modify after both approvals: `tasks/active.md`
- Modify after both approvals: `tasks/completed.md`
- Modify after both approvals: `roadmap.md`
- Modify after both approvals: `memory/project.md`
- Modify after both approvals: `memory/session.md`
- Modify after both approvals: `docs/prd-traceability.md`

**Interfaces:**

- Consumes: the complete `origin/main...HEAD` TASK-003 implementation and all acceptance criteria
- Produces: independent PASS and APPROVED evidence, then a closed TASK-003 with M0 still open for
  TASK-026

- [ ] **Step 1: Have an independent Tester verify a clean installation**

The Tester must read the authoritative task and design, exclude `handbook/ko/**`, and run:

```bash
runtime_bin=/Users/sonmyeong-gwan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin
PATH="$runtime_bin:$PATH" npx --yes npm@11.17.0 ci
PATH="$runtime_bin:$PATH" ./node_modules/.bin/playwright install chromium firefox webkit
PATH="$runtime_bin:$PATH" npx --yes npm@11.17.0 run test:unit
PATH="$runtime_bin:$PATH" npx --yes npm@11.17.0 run test:pipeline
PATH="$runtime_bin:$PATH" npx --yes npm@11.17.0 run test:component
PATH="$runtime_bin:$PATH" npx --yes npm@11.17.0 run test:coverage
PATH="$runtime_bin:$PATH" npx --yes npm@11.17.0 run verify
PATH="$runtime_bin:$PATH" npx --yes npm@11.17.0 run verify:full
PATH="$runtime_bin:$PATH" "$runtime_bin/node" scripts/report-dependency-licenses.mjs
```

The Tester records commands, exact versions, counts, coverage, browser projects, accessibility
results, license results, scope audit, and PASS/FAIL in
`reports/test-2026-08-24-task-003.md`. Any failure returns to the Implementer with a reproducing
test or exact command output; the author cannot issue the independent PASS.

- [ ] **Step 2: Have an independent Reviewer assess the implementation and Tester evidence**

The Reviewer inspects `origin/main...HEAD`, the design, active-task criteria, dependency diff,
license report, command separation, coverage exclusions, no-test allowances, fixture boundary,
Pages subpath, browser matrix, accessibility tags, privacy/static-hosting boundaries, and Tester
report. The Reviewer records findings and APPROVED/CHANGES REQUESTED in
`reports/review-2026-08-24-task-003.md`. Any finding is fixed and sent through both independent
gates again; the author cannot self-approve.

- [ ] **Step 3: Close TASK-003 only after both independent gates pass**

After PASS and APPROVED:

- replace the active task with “No active task”; identify TASK-026 as the required M0 close gate;
- add TASK-003 and its evidence links to `tasks/completed.md`;
- check the M0 testing/static-build foundation and Pages-subpath/accessibility-foundation items in
  `roadmap.md`, but leave the M0 handbook item unchecked;
- update `memory/project.md` and `memory/session.md` to record TASK-003 completion and TASK-026 next;
- update `docs/prd-traceability.md` with the independent reports without marking later product
  requirements complete; and
- keep TASK-004 unstarted until the M0 handbook gate is handled.

- [ ] **Step 4: Verify closure records and commit them**

Run:

```bash
git diff --check
rg -n 'TASK-003|test-2026-08-24-task-003|review-2026-08-24-task-003' \
  tasks/completed.md memory/project.md memory/session.md docs/prd-traceability.md
rg -n 'TASK-026' tasks/active.md memory/project.md memory/session.md
```

Expected: completion and both evidence reports are linked consistently; TASK-026 is explicitly
next; no document claims M0 or product accessibility is complete.

Commit:

```bash
git add reports/test-2026-08-24-task-003.md reports/review-2026-08-24-task-003.md \
  tasks/active.md tasks/completed.md roadmap.md memory/project.md memory/session.md \
  docs/prd-traceability.md
git commit -m "docs(tasks): complete task-003"
```

## Plan Self-Review Results

- Spec coverage: dependency, Vitest, Playwright, coverage, fixture, command, documentation,
  safety, independent-test, and independent-review requirements each map to a task above.
- Scope: every production behavior owned by TASK-004 or later remains excluded.
- Type consistency: Vitest project names and Playwright project names match every package command.
- Coverage consistency: global 80/80/80/75 values match the accepted ADR and specification.
- Evidence consistency: the TASK-003 license, test, and review reports use the 2026-08-24 date.
