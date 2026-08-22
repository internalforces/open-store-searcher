<!--
Purpose:        Track the single active implementation task and its acceptance criteria
Owner:          Implementer / Planner
Update Trigger: When a task starts, is blocked, completes, or changes owner
Harness Version: 1.1
-->

# Active Tasks — open-store-searcher

_Last updated: 2026-08-20_

## In Progress

### TASK-003: Configure unit, pipeline, E2E, and accessibility test harnesses and fixture rules

- Owner: Architect / Implementer
- Priority: High
- Milestone: M0
- Related requirements: Source PRD Section 16, Section 17, and accessibility release criteria
- Description: Configure the approved test stack, exact commands, deterministic fixture rules,
  coverage policy, Pages-subpath smoke coverage, and automated accessibility foundation without
  implementing later data, search, status, or dashboard behavior.
- Dependencies: TASK-001 and TASK-002 complete; exact test dependencies approved; design approved
  by the user on 2026-08-20.
- Risks: Browser-test runtime cost, accidental source-schema assumptions, coverage exclusions that
  hide untested code, and configuration drift between fast and full verification.
- Acceptance criteria:
  - [ ] Install only the seven exact approved test dependencies.
  - [ ] Configure distinct Vitest unit, pipeline, and component projects.
  - [ ] Enforce 80% statements, lines, and functions plus 75% branches globally.
  - [ ] Define offline deterministic fixture rules without assuming the TASK-004 source contract.
  - [ ] Add a real component smoke test for the current app.
  - [ ] Verify the built app at `/open-store-searcher/` in Chromium, Firefox, WebKit, and mobile
        Chromium.
  - [ ] Run WCAG 2.1 A/AA axe checks in desktop and mobile Chromium with zero violations.
  - [ ] Implement the approved fast and full verification command sets.
  - [ ] Pass a clean install, dependency-license audit, `npm run verify`, and
        `npm run verify:full`.
  - [ ] Preserve product-safety, privacy, static-hosting, scope, and handbook boundaries.
  - [ ] Receive independent Tester PASS and Reviewer APPROVED evidence.
- Verification commands: `npm ci`, `npm run verify`, `npm run verify:full`, and
  `node scripts/report-dependency-licenses.mjs` under Node.js 24.19.0 and npm 11.17.0.
- Results and evidence: Implementation pending. Approved design:
  `docs/superpowers/specs/2026-08-20-test-harness-design.md`. Reviewed implementation plan:
  `docs/superpowers/plans/2026-08-22-test-harness.md`.

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
