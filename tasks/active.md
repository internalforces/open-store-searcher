<!--
Purpose:        Track the single active implementation task and its acceptance criteria
Owner:          Implementer / Planner
Update Trigger: When a task starts, is blocked, completes, or changes owner
Harness Version: 1.1
-->

# Active Tasks — open-store-searcher

_Last updated: 2026-08-20_

## In Progress

| ID | Task | Owner | Started | Status |
|---|---|---|---|---|
| TASK-002 | Configure the MIT-licensed single-package repository foundation, static build, lint, format, and typecheck | Architect / Implementer | 2026-08-20 | Implementation verified; Reviewer approval pending |

## TASK-002: Configure Repository Foundation and Static Build

- Owner: Architect / Implementer
- Priority: High
- Milestone: M0
- Related requirements: PRD Sections 12.3, 14, 16.3, 17, and 20; Cost, maintainability, portability, and open-source NFRs
- Description: Create the approved single-package Preact/Vite foundation, apply the user-approved MIT license change, configure Biome and strict TypeScript, and establish reproducible development and static-build commands.
- Dependencies: TASK-001; approved repository-foundation design; explicit approval for MIT and `@biomejs/biome` 2.5.9
- Risks: Tool-version drift, unapproved dependency expansion, license incompatibility, speculative product interfaces, and broken GitHub Pages subpaths
- Acceptance criteria:
  - [x] MIT is recorded consistently in the source PRD, repository license, package metadata, ADR, and affected authoritative harness documents.
  - [x] Node.js 24.19.0 and npm 11.17.0 reproduce the exact lockfile and clean install.
  - [x] Only approved exact direct dependencies are installed, and every transitive license is recorded and compatible.
  - [x] The approved source directories and minimal Preact/Vite entry build without implementing later product scope.
  - [x] Biome lint and format checks, strict TypeScript checking, the static build, and the combined verification command pass.
  - [x] A GitHub Pages-style subpath build emits safe asset references.
  - [ ] Reviewer verification confirms scope, licensing, privacy, static architecture, and product-safety compliance.
- Verification commands: `npm ci`; `npm run lint`; `npm run format:check`; `npm run typecheck`; `npm run build`; `npm run verify`; subpath build smoke check; dependency-license audit; `git diff --check`
- Results and evidence: Author verification is recorded in `memory/session.md`, including command, subpath-build, and dependency-license evidence. Independent review remains pending.

## Task Detail Template

### TASK-XXX: Title

- Owner: Agent Role
- Priority: High | Medium | Low
- Milestone: M[N]
- Related requirements: FR-XX / NFR
- Description:
- Dependencies:
- Risks:
- Acceptance criteria:
  - [ ] Criterion 1
  - [ ] Criterion 2
- Verification commands:
- Results and evidence:
