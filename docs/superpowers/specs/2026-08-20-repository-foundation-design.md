<!--
Purpose:        Record the approved TASK-002 repository-foundation design
Owner:          Architect
Update Trigger: When the repository foundation, code license, or quality-tool baseline changes
Harness Version: 1.1
-->

# Repository Foundation Design

_Date: 2026-08-20_

_Status: Approved, including written-spec review_

_Related task: TASK-002_

_Decision record: ADR-007_

## Objective

Create the smallest reproducible repository foundation for the approved Preact and Vite application without implementing search, source-data processing, status mapping, deployment, or product UI. The foundation must pin the approved runtime and direct build dependencies, enforce consistent TypeScript and formatting rules, produce a static build that is safe under a GitHub Pages subpath, and preserve every existing product-safety boundary.

## Human Approvals

On 2026-08-20, the user approved:

- activating TASK-002 after TASK-001 was merged to `main`;
- changing the project source-code license from Apache-2.0 to MIT;
- using `@biomejs/biome` 2.5.9 under its MIT license option as the only new direct development dependency beyond the TASK-001 baseline;
- the formatting, naming, repository, build, command, verification, and acceptance-criteria choices in this design.

The MIT decision is an explicit human-approved product-scope change and supersedes the Apache-2.0 choice in the source PRD and existing harness placeholders. Implementation must update both occurrences in the source PRD as well as every affected authoritative repository document.

## Scope

TASK-002 includes:

- an MIT `LICENSE` file and matching package metadata;
- one private ESM npm package with an exact lockfile;
- repository metadata that pins Node.js 24.19.0 and npm 11.17.0;
- Preact 10.29.8, TypeScript 7.0.2, Vite 8.2.1, and `@preact/preset-vite` 2.10.6;
- Biome 2.5.9 for linting and formatting;
- strict TypeScript configuration and a minimal Vite/Preact build entry;
- the approved `app`, `search`, `domain`, `pipeline`, and `shared` source directories without speculative business interfaces;
- reproducible development, checking, build, and preview commands;
- a transitive dependency-license report generated from the installed lockfile;
- updates to task, decision, architecture, command, standard, dependency, and session records that are directly affected by the foundation.

TASK-002 excludes test-runner configuration, coverage thresholds, search behavior, data schemas, status mapping, public-data access, GitHub Actions, Pages deployment, analytics, runtime services, and production data. TASK-003 owns the test harness and coverage decisions.

## Repository Layout

```text
open-store-searcher/
├── .gitignore
├── .node-version
├── .npmrc
├── LICENSE
├── biome.json
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── app/
│   │   ├── app.tsx
│   │   └── main.tsx
│   ├── domain/.gitkeep
│   ├── pipeline/.gitkeep
│   ├── search/.gitkeep
│   └── shared/.gitkeep
└── reports/
    └── dependency-licenses-2026-08-20.md
```

Only `src/app` receives executable code. Empty module directories use `.gitkeep` so TASK-002 does not invent APIs or data contracts assigned to later tasks.

## Runtime and Package Metadata

- `.node-version` contains exactly `24.19.0`.
- `package.json` declares `private: true`, `type: "module"`, `license: "MIT"`, `packageManager: "npm@11.17.0"`, and exact Node and npm engine versions.
- `.npmrc` enables exact saves, the package lock, and strict engine validation.
- Direct dependency versions use exact numbers. `package-lock.json` is committed and `npm ci` is the clean-install contract.
- The package is not published to npm, and no install-time scripts are introduced.

## TypeScript and Vite Configuration

TypeScript uses strict checking with no emit, Preact's automatic JSX runtime, explicit type-only imports, isolated-module compatibility, unused-code checks, unchecked-index protection, exact optional-property types, and the erasable-syntax restriction required by native Node.js TypeScript execution. Path aliases, enums, runtime namespaces, parameter properties, decorators, and extensionless Node-facing relative imports are not permitted.

Vite uses `@preact/preset-vite` and `base: './'`. The relative base keeps generated asset references portable under a GitHub Pages project subpath without deciding a production URL or deployment workflow. The application entry renders only the project name inside a semantic `main` and `h1`; product search copy and behavior remain TASK-014 scope.

## Linting, Formatting, and Naming

Biome 2.5.9 is configured with its recommended rules and the React-domain rules that apply to Preact's compatible Hooks model. Unsafe automatic fixes are never part of an npm command. The configuration integrates with Git and respects `.gitignore`.

The approved style is:

- two-space indentation and LF line endings;
- 100-column line width;
- single quotes in TypeScript and double quotes in JSX attributes;
- semicolons always and trailing commas wherever supported;
- `PascalCase` for types and components;
- `camelCase` for functions, variables, and Hooks;
- `kebab-case` filenames;
- `*.test.ts` and `*.test.tsx` test filenames when TASK-003 adds tests.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run lint` | Run Biome lint and fail on warnings |
| `npm run format` | Apply formatter changes only |
| `npm run format:check` | Check formatting without modifying files |
| `npm run typecheck` | Run `tsc --noEmit` |
| `npm run build` | Produce the Vite static build |
| `npm run preview` | Serve the built output locally |
| `npm run verify` | Run lint, format check, typecheck, and build in order |

TASK-003 will add test and coverage commands. No publish, deploy, data-fetch, or workflow-dispatch command is introduced.

## Dependency and License Control

The install contains only the TASK-001-approved runtime/build packages plus the newly approved Biome package. Biome is consumed under the MIT option in its `MIT OR Apache-2.0` license expression. After `npm ci`, the implementation records every installed package name, exact version, and declared license in `reports/dependency-licenses-2026-08-20.md`. Missing, unclear, prohibited, or incompatible licenses block TASK-002 completion rather than being guessed.

## Failure Boundaries

- A runtime or package-manager version mismatch must fail installation rather than silently generating a different lockfile.
- Lint warnings, formatting drift, type errors, build errors, absolute asset-path regressions, or license-audit gaps block completion.
- No failed build authorizes deployment or publication.
- No source-data assumption, status mapping, missing-result interpretation, network search, tracking, or production mutation is introduced.
- The current empty source-data boundary remains unchanged until TASK-004 and later pipeline tasks are approved.

## Acceptance Criteria

1. TASK-002 is the only active task and TASK-001 remains recorded as completed.
2. The source PRD and affected authoritative repository documents consistently identify MIT as the project code license, with ADR-007 recording the approval.
3. Node.js 24.19.0 and npm 11.17.0 can reproduce `npm ci` from the committed lockfile.
4. Only approved direct dependencies are installed at their exact versions.
5. Every transitive dependency has an identified compatible license and the audit report contains no prohibited package.
6. The approved module directories exist without speculative product interfaces.
7. `npm run lint`, `npm run format:check`, `npm run typecheck`, `npm run build`, and `npm run verify` pass.
8. A build using `/open-store-searcher/` as a smoke-test base emits subpath-safe asset references.
9. The implementation does not add tests, coverage policy, deployment, Actions, data collection, analytics, a server, a database, a paid API, or product search behavior.
10. Reviewer verification confirms the task scope, license records, static architecture, privacy boundary, and product-safety invariants before merge approval is requested.

## Verification Evidence Required

- exact Node.js and npm version output;
- clean `npm ci` output from the pinned environment;
- passing npm command output for every acceptance command;
- a subpath-build artifact inspection;
- direct and transitive dependency/license comparison against `package.json`, `package-lock.json`, package metadata, and `dependencies.md`;
- `git diff --check` and a changed-file review that excludes secrets, environment files, production data, and `handbook/ko/**`.
