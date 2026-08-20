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
| TASK-001 | Compare language, framework, package manager, and test stack; approve ADR | Architect | 2026-08-20 | In progress |

## Task Detail

### TASK-001: Select and approve the implementation technology stack

- Owner: Architect
- Priority: High
- Milestone: M0
- Related requirements: Cost, performance, accessibility, privacy, maintainability, and testability NFRs
- Description: Compare viable language, web framework, state-management, package-manager, repository-structure, and test-stack choices; recommend one coherent stack; obtain human approval; and record the accepted decision in ADR-004 and linked harness documents.
- Dependencies: Approved PRD; ADR-002 static runtime; ADR-003 fail-safe status determination
- Risks: Bundle-size regression, unnecessary framework complexity, split frontend/pipeline tooling, weak accessibility coverage, GitHub Pages subpath incompatibility, or a dependency footprint that conflicts with zero-cost operation.
- Acceptance criteria:
  - [x] Two or three coherent stack approaches are compared against the PRD constraints.
  - [x] The recommendation explicitly covers language and version policy, framework, state management, package manager, repository structure, and unit/pipeline/E2E/accessibility test tools.
  - [x] Static GitHub Pages deployment, the 300 KB initial code budget, browser-only search, GitHub Actions ETL, accessibility, licensing, and zero mandatory monthly cost are addressed.
  - [x] The human explicitly approves the selected stack and external development dependencies.
  - [x] ADR-004 and all directly linked placeholders are updated without introducing implementation assumptions beyond the approval.
- Verification commands: Documentation placeholder scan, linked-document consistency scan, license/source verification, and diff review.
- Results and evidence: Approved design recorded in `docs/superpowers/specs/2026-08-20-technology-stack-design.md`; written-spec review is pending before task closure.
