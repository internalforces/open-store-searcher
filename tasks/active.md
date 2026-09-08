<!--
Purpose:        Track the single active implementation task and its acceptance criteria
Owner:          Implementer / Planner
Update Trigger: When a task starts, is blocked, completes, or changes owner
Harness Version: 1.1
-->

# Active Tasks — open-store-searcher

_Last updated: 2026-09-04_

## In Progress

### TASK-017: Responsive, keyboard and screen-reader search flow

- Owner: Implementer / Tester / Reviewer
- Priority: High
- Milestone: M2
- Size: L
- Related requirements: FR-11, FR-16 (baseline), PRD Section 14.3
- Status: Active; implementation and automated verification passed; manual screen-reader observation pending
- Authorization: User requested activation and execution on 2026-09-08. User approved the concrete design by requesting implementation.
- Workspace: Reuse `.worktrees/task013-quality`; inspected clean baseline 2ff1508; implementation branch `codex/task-017-accessibility`. No new worktree or branch switch during preparation.
- Dependencies: Completed TASK-014, TASK-015 and TASK-016.
- Scope: Existing search, candidate evidence, loading and recovery UI. Preserve native controls,
  safety copy, privacy, synthetic-data boundaries and source/status semantics.
- Audit: Named input, error alert, polite repeated-search summary, visible focus styles and
  320px tests already exist. Candidate groups lack list semantics; same-name articles have
  identical accessible names; zero-result live text reports counts without the safety guidance.
  Zoom/reflow, complete focus order and recovery focus continuity need dedicated evidence.
- Proposed design: Use named native candidate lists with address-aware article names; provide
  keyboard access to candidate evidence through native links and explicit results navigation;
  retain input focus after search and make invalid submissions/retries predictably recoverable.
  Extend concise status text for empty/ambiguous results without moving focus on async completion.
  Fix only demonstrated layout/focus defects. Keep custom arrow-key selection with TASK-023.
- Acceptance criteria:
  - [x] Inspect authoritative PRD, existing components, CSS and browser/accessibility checks.
  - [x] Activate TASK-017 as the only active task while preserving deferred TASK-008.
  - [x] Obtain approval of the concrete bounded design presented in chat.
  - [x] Implement named candidate-list semantics and distinguish same-name candidates by evidence.
  - [x] Verify keyboard search, error correction, candidate/source/map navigation and retry focus.
  - [x] Verify empty, ambiguous, repeated-search, loading, failure and recovery announcements.
  - [x] Verify mobile/desktop, 200% zoom and 320 CSS-pixel reflow, long content and focus visibility.
  - [ ] Record actual screen-reader observations separately from accessibility-tree/axe evidence;
        leave the manual screen-reader gate explicitly open if direct observation is unavailable.
  - [x] Pass relevant component regressions, browser/axe checks and pinned `npm run verify:full`.
  - [x] Obtain independent Reviewer approval and update traceability/session/task records.
- Verification: Existing pinned Node/npm toolchain; component tests, four-browser E2E,
  automated axe checks, manual layout/keyboard/assistive-technology observations, diff checks.
- Boundaries: No dependencies, external services, public identifiers, data delivery, status mapping,
  infrastructure or deployment changes. No handbook access or milestone closure.

- Implementation evidence: `reports/test-2026-09-08-task-017.md` and
  `reports/task017-verification-manifest.json` in the delivery checkout. Final pinned full
  verification: 561 Vitest tests, 56 browser checks, 18 accessibility tests / 22 zero-violation
  axe scans. Native Chrome 200% zoom inspected and restored; actual VoiceOver remains pending.
- Manual gate: User authorized VoiceOver execution and commit/push. Native System Settings
  confirmed VoiceOver on and then off after the bounded attempt. The tool could not expose
  VoiceOver speech/caption output, so direct AT observation remains open. No additional
  authorization is needed to retry the same bounded test with a supported observation path.
  Commit/push is explicitly authorized despite this recorded limitation.

## Deferred — incomplete

TASK-008 is deferred by the user’s M2 priority. Its baseline evidence below remains historical;
separate local continuation work is not part of this search PR.


### TASK-008: Validate staged refreshes and freshness evidence

- Owner: Planner / Researcher for remaining production evidence; staged implementation verified
- Priority: High
- Milestone: M1
- Size: L
- Related requirements: FR-08, FR-13, FR-14; data-quality and freshness NFRs
- Status: Staged implementation and full verification passed; production evidence gates remain open
- Authorization: User requested execution of TASK-008 on 2026-09-04.
- Description: Validate complete staged inputs, identity/schema integrity, count and missing-value
  changes, aggregate-status drift, coverage dates, and JSON syntax/UTF-8 size.
- Dependencies: Completed TASK-005, TASK-006, TASK-007; accepted ADR-009 through ADR-013.
- Risks: Source PRD unavailable on this host; production row parser, source-cut evidence,
  baseline/calibrated limits, and public JSON schema are not yet available.
- Acceptance criteria:
  - [x] Inspect accepted contracts and produce a concrete design with a requirements/test matrix.
  - [x] Separate sourced freshness facts from unsupported ZIP-date and row-timestamp inference.
  - [x] Obtain approval of ADR-014 and the date-only seven-day warning convention.
  - [x] Implement the staged validator and freshness/JSON helpers with offline test-first evidence.
  - [ ] Resolve production coverage evidence and reviewed thresholds/baseline without defaults.
  - [ ] Obtain source PRD or explicit direction to use current traceability as the design baseline.
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
