<!--
Purpose:        Track the single active implementation task and its acceptance criteria
Owner:          Implementer / Planner
Update Trigger: When a task starts, is blocked, completes, or changes owner
Harness Version: 1.1
-->

# Active Tasks — open-store-searcher

_Last updated: 2026-08-28_

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
  - [ ] Validate ZIP integrity, the approved 195-category entry manifest, encodings, delimiters,
        required headers, and permission metadata before accepting a staged archive.
  - [ ] Detect changes with a SHA-256 content digest plus normalized entry and schema manifests;
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
  discovery, 53 pipeline tests, and manual probe are implemented. The fixed Node 24.19.0 / npm
  11.17.0 `verify:full` gate passes. `reports/probe-2026-08-28-seoul-archive-contract.md` records
  HTTP 200/206, a complete 215,968,197-byte ZIP, SHA-256, integrity, and 195 entries. Ubuntu 24.04
  Info-ZIP preserves all filenames, but one official archive filename differs from its audited
  portal title while the other 194 match exactly. TASK-005 stays active until the user approves or
  rejects that explicit alias; the schema-only contract and independent final review follow.

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
