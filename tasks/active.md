<!--
Purpose:        Track the single active implementation task and its acceptance criteria
Owner:          Implementer / Planner
Update Trigger: When a task starts, is blocked, completes, or changes owner
Harness Version: 1.1
-->

# Active Tasks — open-store-searcher

_Last updated: 2026-09-04_

## In Progress

### TASK-008: Validate staged refreshes and freshness evidence

- Owner: Researcher for source-body encoding and remaining production evidence; bounded implementation verified
- Priority: High
- Milestone: M1
- Size: L
- Related requirements: FR-08, FR-13, FR-14; data-quality and freshness NFRs
- Status: Staged implementation and full verification passed; production evidence gates remain open
- Authorization: User requested execution of TASK-008 on 2026-09-04 and explicitly approved ADR-015 continuation (Ubuntu recreation, research observation, and FR-14 amendment).
- Description: Validate complete staged inputs, identity/schema integrity, count and missing-value
  changes, aggregate-status drift, coverage dates, and JSON syntax/UTF-8 size.
- Dependencies: Completed TASK-005, TASK-006, TASK-007; accepted ADR-009 through ADR-013.
- Risks: Production source-cut evidence, calibrated limits/bootstrap baseline, and public JSON
  schema remain unavailable. Research ingestion is explicitly resource-bounded; a limit stop cannot
  establish production counts. Production ingestion wiring remains TASK-009.
- Acceptance criteria:
  - [x] Inspect accepted contracts and produce a concrete design with a requirements/test matrix.
  - [x] Separate sourced freshness facts from unsupported ZIP-date and row-timestamp inference.
  - [x] Obtain approval of ADR-014 and the date-only seven-day warning convention.
  - [x] Implement the staged validator and freshness/JSON helpers with offline test-first evidence.
  - [ ] Resolve production coverage evidence and reviewed thresholds/baseline without defaults.
  - [x] Obtain source PRD or explicit direction to use current traceability as the design baseline.
  - [x] Reconcile original FR-14 age >= 7 with accepted ADR-014/AGENTS.md age > 7 through explicit approval (ADR-015).
  - [x] Implement and verify the approved research-only row-observation prerequisite and reconstructed Ubuntu environment.
  - [ ] Resolve strict source-body encoding failure for category 15045028 before complete calibration observations.
  - [x] Pass focused tests, coverage, and pinned full verification.
  - [x] Obtain independent Reviewer approval of the staged implementation.
- Verification commands: Focused Vitest unit/pipeline runs, `npm run test:coverage`,
  `npm run verify:full`, `git diff --check`.
- Results and evidence:
  - `docs/superpowers/specs/2026-09-04-task-008-validation-design.md` (Accepted 2026-09-04).
  - `reports/design-2026-09-04-task-008.md` (design assessment, not final approval).
  - `reports/test-2026-09-04-task-008.md`: 144 new tests; full run 362 passed, two existing
    Windows skips, four browser smoke tests, and two accessibility scans passed.
  - `reports/review-2026-09-04-task-008.md`: Approved for the bounded synthetic implementation;
    independent rerun passed all 144 TASK-008 tests.
  - No production policy, source-cut assertion, or baseline has been fabricated. TASK-009 remains
    in the backlog; TASK-008 is not complete.
  - Remaining-work investigation: `reports/research-2026-09-04-task-008-completion-gates.md`.
    Local/history PRD searches did not locate the original; the actual collector environment gate
    returned `{ "ok": false }`; GitHub has no retained run/artifact evidence. Source/runtime access
    and the explicitly identified row-observation dependency remain required.
  - Mac follow-up: `reports/research-2026-09-04-task-008-macos-continuation.md` recovers the original
    PRD and records the boundary discrepancy. Docker Desktop runs, but the historical project
    container has a missing snapshot and image. Separate environment recreation and research-only
    observation proposals are ready for scope decisions; no production gate is marked passed.

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

## ADR-015 Continuation Evidence

User-approved environment recreation, research reader, and FR-14 amendment are implemented.
`reports/test-2026-09-04-task-008-observation.md` records pinned full verification (425 tests,
four browser tests, two accessibility scans), independent review, actual Linux gate, and two
bounded observations. The repeat identifies `csv_invalid_encoding` for category 15045028;
archives were cleaned and no partial metrics promoted. Source-cut, policy/bootstrap and body
encoding evidence remain open; TASK-008 is not complete and TASK-009 is not activated.
