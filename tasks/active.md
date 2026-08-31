<!--
Purpose:        Track the single active implementation task and its acceptance criteria
Owner:          Implementer / Planner
Update Trigger: When a task starts, is blocked, completes, or changes owner
Harness Version: 1.1
-->

# Active Tasks — open-store-searcher

_Last updated: 2026-08-31_

## In Progress

### TASK-005: Implement a change-detecting Seoul data collector

- Owner: Implementer / Reviewer
- Priority: High
- Milestone: M1
- Related requirements: FR-13, Section 12.3
- Description: Reopened after PR #7 found that probe response cancellation errors were swallowed.
  Fail closed with a typed rejection before any subsequent provider request or result, then obtain
  independent re-review before restoring TASK-005 completion.
- Dependencies: The merged PR #6 collector, follow-up PR #7, and the accepted 195-entry source and
  schema contracts.
- Risks:
  - Continuing after cancellation failure can overlap provider transfers or issue another request
    without confirming that the previous response stopped.
  - Treating cleanup failure as the original response result hides a broken resource boundary.
- Acceptance criteria:
  - [x] Evaluate the PR #7 P2 finding against the current cancellation and request flow.
  - [x] Reproduce rejected cancellation promises at limit, redirect, and rejected-range boundaries
        with focused tests before changing production code.
  - [x] Return typed `http_contract_changed` and issue no subsequent request or normal result when
        cancellation fails.
  - [x] Pass pinned pipeline, full browser, accessibility, formatting, type, and whitespace gates.
  - [ ] Obtain independent re-review of the updated PR with no blocking findings.
- Verification commands:
  - `npm run test:pipeline`
  - `npm run verify:full`
  - `git diff --check`
- Results and evidence: The finding is valid and remediated through TDD. The pinned suite passes 90
  pipeline and 91 coverage tests. `reports/review-2026-08-31-task-005-pr-7-feedback.md` records the
  disposition. TASK-006 remains unauthorized until re-review restores TASK-005 completion.

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
