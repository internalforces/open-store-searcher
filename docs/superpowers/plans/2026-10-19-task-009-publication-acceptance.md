# TASK-009 Atomic Publication Acceptance Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development; the user approved this plan and selected subagent implementation followed by independent review on 2026-10-19. Preserve unrelated work; commits and remote mutations are not authorized.

**Goal:** Complete local acceptance evidence for the existing validated publication transaction and prepare the remaining hosted decision gates.

**Architecture:** Retain the approved compact V2 producer, transactional site builder and release-bound baseline reader. One focused offline transaction suite exercises the actual builder and injected deployment reads. Separate local preservation evidence from actual hosted promotion and recovery.

**Tech Stack:** Existing TypeScript, Preact/Vite, Node.js 24.19.0, npm 11.17.0, Ubuntu 24.04, Vitest and Playwright; no added dependency.

**Spec:** [Publication design](../specs/2026-09-12-task-009-010-publication-design.md), AC-009-1 through AC-009-6, and [approved compact continuation](../specs/2026-09-14-task-008-compact-delivery-design.md). Historical held-quality notes are superseded by completed TASK-008.

## Global Constraints

- TASK-009 only; TASK-010 and release acceptance stay separate.
- Base: `9569ffbce4ce141e06f0883d90bc19305890972c`, merged PR #32.
- Preserve prior branches/checkouts and all unrelated files; never access `handbook/ko/**`.
- Keep the exact approved policy, 23 allowed-empty IDs, baseline and reviewed-pair mapping.
- Preserve explicit collection dates and null/unverified source coverage.
- No new dependencies, status rules, public interfaces, delivery methods or workflow permissions.
- Do not create production `publication/config.json`, enable publication or dispatch/deploy before
  reviewed operational inputs and concrete action-time approval.
- No commit/push/PR/merge, recurring collection, tag or security-setting changes.
- Offline simulations do not pass hosted recovery, reliability or physical/mobile performance.

## Review Focus

- Valid hashes alone must not permit mismatched V2 manifest/baseline date, archive, count or policy.
- A deployment switching between descriptor reads must reject mixed state without bootstrap.
- Failure after partial site copying must preserve the complete old site and source inventory.
- A competing output appearing during build must survive final promotion unchanged.
- Old manifests must load exact matching blocks or reject while accepted browser data survives.

## Task 1: Preserve and verify the starting point

**Files:** `tasks/active.md`, `tasks/backlog.md`, `memory/project.md`, `memory/session.md`, this plan.
**Interfaces:** Existing `npm run verify:full`, original file fingerprints and Git refs.

- [x] Reuse the clean calibration checkout; retain its branch; create `codex/task-009-publication-acceptance` from current remote main.
- [x] Fingerprint the original checkout's 73 untracked files outside Git.
- [x] Audit existing AC-009 tests without altering approved contracts or behavior.
- [x] Pinned baseline `npm run verify:full` passed in a new Ubuntu directory: 831 Vitest, 68 browser and 20 accessibility tests.
- [x] Human plan review approved on 2026-10-19; the user selected subagent implementation followed by independent review. Parallel implementation is unnecessary for this bounded scope.

## Task 2: Focused transaction and preservation evidence

**Files:** Create `src/pipeline/publication-transaction.test.ts`. Modify the smallest relevant
implementation location only after a reproducing test identifies a contract violation.
**Consumes:** `writeCompactDataset`, `readDeployedBaseline`, `loadCompactSnapshot`, actual
`scripts/build-publication.mjs`; deterministic small synthetic fixtures and no provider requests.
**Produces:** Local AC-009-2/3/4/5 evidence through the actual transaction entry points.

- [x] Add `reconciles a complete V2 site baseline through the deployed descriptor`: assert exact
  request paths, date/archive/policy/count/byte bindings and unchanged descriptor reads.
- [x] Add `rejects a replacement during V2 baseline reconciliation without bootstrapping`, plus
  parameterized missing, tampered and internally rehashed mismatched manifest/baseline components.
- [x] Add `preserves the previous site and source inventory after a partial build copy failure`:
  inject only inside a child process; assert every previous path/hash and candidate cleanup.
- [x] Add `preserves an output that appears before final build promotion`: assert the competing
  output remains unchanged, following existing child-process hook conventions.
- [x] Map old-manifest/missing-block, cancellation, accepted-Worker retention and no-query-I/O
  requirements to existing codec/Worker/component tests; extend only genuinely missing cases.
- [x] Run `npx --no-install vitest run --project=pipeline src/pipeline/publication-transaction.test.ts`.
  For any exposed bug, record the expected failure, make the minimal correction and rerun.

## Task 3: Operational handoff and final review

**Files:** Create `reports/test-2026-10-19-task-009.md`; update active/session/project and FR-13
traceability. Update issues/architecture/decisions only where the evidence requires it.
**Consumes:** Exact approved validation inputs, read-only settings evidence and current test logs.

- [x] Record AC-009-1 through AC-009-6 evidence, exact quality/resource identities and prior/new
  inventory checks. Keep hosted requirements explicitly pending.
- [x] Read actual Pages/environment/protection state without mutation. A Pages API 404 neither
  selects nor approves a public destination; do not invent an executable operational config.
- [x] Run focused tests, pinned `npm run verify:full`, Markdown targets and `git diff --check`.
- [x] Obtain independent whole-diff review and address findings within approved scope; bind
  verification receipts to current product/test/tooling fingerprints.
- [x] Recompute original file hashes and deliver the local result plus exact remaining gates.
  TASK-009 stays active if hosted acceptance is incomplete; do not activate TASK-010.

## Acceptance Scope

This continuation verifies staging, complete-byte binding, candidate preservation and baseline
reconciliation locally. Actual Pages promotion, uncertain deployment reconciliation, hosted
recovery and durable artifact retention still require their reviewed procedure and authorized
operation. ISS-003 remains open upstream. Existing slow full-data readiness and conservative
quality limits are not waived. No milestone or release closes through local evidence alone.
