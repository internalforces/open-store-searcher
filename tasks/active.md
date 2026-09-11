<!--
Purpose:        Track the single active implementation task and its acceptance criteria
Owner:          Implementer / Planner
Update Trigger: When a task starts, is blocked, completes, or changes owner
Harness Version: 1.1
-->

# Active Tasks — open-store-searcher

_Last updated: 2026-09-04_

## In Progress

No implementation task is active. TASK-019's bounded security review completed on 2026-09-09.
See `reports/security-2026-09-09-task-019.md` in `.worktrees/task013-quality`.
No actionable vulnerability was confirmed in current code; production and Actions review gates
remain open for TASK-009/010/021. TASK-020 remains in backlog and is not activated.

## Deferred — incomplete

TASK-008 is explicitly on hold and incomplete at the user's request on 2026-09-08.
Resume only when the user requests it. Preserve its implementation, evidence, and remaining
acceptance gates; do not split or mark it complete. This supersedes earlier execution requests
and the previous M2-priority deferral. No next task is activated by this hold.


### TASK-008: Validate staged refreshes and freshness evidence

- Owner: Researcher for production source-cut, calibration and bootstrap evidence
- Priority: High
- Milestone: M1
- Size: L
- Related requirements: FR-08, FR-13, FR-14; data-quality and freshness NFRs
- Status: On hold, incomplete (user decision 2026-09-08); encoding correction and complete 195-category observation verified; production evidence gates remain open
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
  - [x] Distinguish source-byte corruption from runtime decoding failure for category 15045028.
  - [x] Integrate and verify the accepted ADR-016 strict decoder correction before complete calibration observations.
  - [x] Complete and independently review all 195 source files using bounded disk indexes.
  - [x] Review newly observed aggregate vocabulary without reclassifying uncertain records (accepted ADR-017, implemented and independently approved).
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

## Encoding Investigation Continuation

The current goal explicitly requests TASK-008 encoding investigation, completion evidence, then
TASK-009 sequentially. The reviewed bounded diagnostic identifies native Node decoder mismatch,
not corruption of the investigated source bytes. Both WHATWG and GNU CP949 comparators accept
the complete target body with identical decoded hashes; the native parser still rejects it.
Evidence: `reports/research-2026-09-04-task-008-encoding.md`,
`reports/encoding-2026-09-04-task-008.json`, and
`reports/encoding-2026-09-04-task-008-standard.json`.
The user accepted ADR-016; the exact direct development dependency and both CSV decoder imports
are integrated. Pinned full verification passed 433 tests, four browser smoke tests, and two
accessibility scans. Independent Reviewer approved the correction and one same-budget retry;
Linux clean install and 51 focused tests passed. TASK-009 is still in the backlog.


## Research capacity continuation

The accepted decoder retry passed encoding then hit the reviewed 100,000-row cap. A bounded disk
index implementation now passes 501 tests, four browser smoke tests and two accessibility scans.
Independent review corrected a retained-buffer cap bug; the corrected offline implementation and
reproducible benchmark script were approved. The approved live run completed all 195 files and
2,936,760 rows, with matching archive/code hashes and verified scratch/archive cleanup. Independent
review accepted the complete research evidence. The two newly observed status pairs remain
unregistered and unverified. See `reports/research-2026-09-04-task-008-first-complete-observation.md`
for measurements and remaining source-cut, vocabulary, calibration, public JSON and bootstrap gates.

## Vocabulary proposal continuation

The user accepted ADR-017 recognition of only the exact observed 05/06 pairs as known uncertain vocabulary.
The mapper and displayed unverified status remain unchanged. The proposal requires explicit V2
envelopes and vocabulary hashes while preserving V1 historical validation. Its offline impact
script binds the original report/audit and proves all 195 category counts are preserved; 68
categories account for 186,887 proposed unknown-count changes. The impact is an unapproved
proposal, not a second temporal observation or an accepted baseline. Independent review
approved the refined proposal for a human decision; the user then approved implementation.
V2 validation, bounded offline derivation and synthetic disk observation now pass 546 tests,
four browser tests and two accessibility scans. Final independent code review approved the
implementation; the reviewer reran 159 focused tests and reproduced the derived report exactly. The
separate V2 derived report preserves all original evidence and retains the missing production gates.
TASK-009 remains
in the backlog. See `docs/superpowers/specs/2026-09-04-task-008-vocabulary-review-design.md`.

## Official cutoff and repeat retrieval follow-up

The user requested authoritative cutoff/timezone and comparison evidence. The current Ministry
notice 4566 attachment PDF/workbook and legacy-to-new-service Q&A were inspected. Their semantics
do not establish a common cutoff or timezone for the approved file ZIP. An independently reviewed
one-download comparison returned the identical archive hash and 216,180,315 bytes; owned staging
was deleted and before/after source/driver/payload hashes match. No additional temporal row
observation, numeric policy or production baseline is claimed. The V1 and derived V2 reports
represent the same original observation. See
`reports/research-2026-09-04-task-008-cutoff-comparison.md` and the comparison audit. A concrete
provider inquiry was sent to the official portal support address after explicit user authorization;
Gmail confirmed SENT. Provider cutoff/timezone confirmation remains pending.
