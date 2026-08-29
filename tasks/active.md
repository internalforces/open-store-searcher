<!--
Purpose:        Track the single active implementation task and its acceptance criteria
Owner:          Implementer / Planner
Update Trigger: When a task starts, is blocked, completes, or changes owner
Harness Version: 1.1
-->

# Active Tasks — open-store-searcher

_Last updated: 2026-08-29_

## In Progress

### TASK-005: Implement a change-detecting Seoul data collector

- Owner: Architect / Implementer
- Priority: High
- Milestone: M1
- Related requirements: FR-13, Section 12.3
- Description: Design and implement a build-time, change-detecting collector for the approved Seoul
  all-category ZIP candidate. Begin with a non-production contract probe, stage complete transfers,
  fail closed on provider or archive drift, and expose validated evidence to later transformation
  and publication tasks without collecting or publishing production data in this task.
- Dependencies: TASK-004 is complete; ADR-009 and the audited 195-category permission manifest
  define the bounded source contract.
- Risks:
  - The current redirect, referrer, range, or pre-download behavior may not be a supported automation
    contract and may change without notice.
  - A complete archive is large, may be corrupt or partial, and may contain mixed encodings, schemas,
    permissions, or data vintages.
  - Treating retrieval time or one transfer as a common source as-of date could mislead users.
  - Silently bypassing a provider denial could violate the bounded contract.
- Acceptance criteria:
  - [x] Write and obtain approval for an English collector design before implementation.
  - [x] Probe redirect behavior, required request headers, the lightweight download-limit check,
        range behavior, and provider denials without silently bypassing an access refusal.
  - [x] Download only to temporary staging, require a complete successful transfer, and keep
        incomplete data outside every publication path.
  - [x] Validate ZIP integrity, the approved 195-category entry manifest, encodings, delimiters,
        required headers, and permission metadata before accepting a staged archive.
  - [x] Detect changes with a SHA-256 content digest plus normalized entry and schema manifests;
        report unchanged inputs without rewriting downstream artifacts.
  - [x] Keep retrieval time, provider-stated freshness, per-entry timestamps, and future `dataAsOf`
        derivation inputs separate; never present retrieval time as data as-of.
  - [x] Cover success, unchanged, denial, redirect drift, partial transfer, corrupt archive, missing
        category, schema drift, permission drift, and mixed-vintage evidence with pipeline tests.
  - [x] Add no external dependency, production dataset, workflow, publication, or deployment change
        without its separate approval and owning task.
- Verification commands:
  - `npm run test:pipeline`
  - `npm run verify:full`
  - `git diff --check`
- Results and evidence: The user approved the English collector design and ADR-010 on 2026-08-28.
  The native streaming collector, shell-free archive adapter, schema inspection, deterministic
  discovery, 62 pipeline tests, and manual probe are implemented. The user approved the one literal
  archive-name alias to audited file-data ID `15045011` on 2026-08-29. The latest 216,022,556-byte
  archive, its 195-entry EUC-KR schema contract, and the committed contract all passed exact Ubuntu
  inspection. `reports/probe-2026-08-29-seoul-archive-contract.md` records the hashes and structural
  audit. All five PR #6 review findings were reproduced, fixed through TDD, and recorded in
  `reports/review-2026-08-29-task-005-pr-6-feedback.md`; the pinned verification is in
  `reports/test-2026-08-29-task-005.md`. TASK-005 stays active for independent re-review.

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
