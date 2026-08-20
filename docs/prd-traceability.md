<!--
Purpose:        Connect PRD requirements to milestones, tasks, and verification evidence
Owner:          Planner / Reviewer
Update Trigger: When the PRD, task scope, tests, or release status changes
Harness Version: 1.1
-->

# PRD Traceability Matrix — open-store-searcher

_Last updated: 2026-08-20_

## Usage Rules

- When work starts, change the related row to In progress and add pull request or report links as evidence.
- Implementation alone is insufficient for Done. Related automated and manual verification plus Reviewer confirmation are required.
- Obtain human approval and update the PRD or ADR before implementing a change that alters PRD meaning.
- Do not use `handbook/ko/**` as implementation or release evidence. At each milestone close, track its update-or-review and human-language-review gate through TASK-026.

## P0 Functional Requirements

| Requirement | Summary | Tasks | Verification and evidence | Status |
|---|---|---|---|---|
| FR-01 | Business-name or address input | TASK-011, 014 | Input combinations, empty input, and one-character tests | Planned |
| FR-02 | In-browser search | TASK-011, 012 | Zero external API requests during search | Planned |
| FR-03 | Name and address candidate ranking | TASK-012, 013 | Ranking fixtures and Top-3 recall | Planned |
| FR-04 | Four display statuses | TASK-007, 014 | Exhaustive status-mapping tests | Planned |
| FR-05 | Raw status evidence | TASK-006, 014 | Result-card UI tests | Planned |
| FR-06 | Basic information and dates | TASK-006, 014 | Missing-value display tests | Planned |
| FR-07 | Fail-safe uncertainty handling | TASK-007, 012, 015 | Regression tests for missing results, conflicts, and new codes | Planned |
| FR-08 | Data as-of date | TASK-008, 014 | Page and card as-of-date tests | Planned |
| FR-09 | Always-accessible source and disclaimer | TASK-004, 014, 020 | UI and documentation review | Planned |
| FR-10 | Naver and Kakao search links | TASK-016 | URL encoding and new-window security tests | Planned |
| FR-11 | Responsive mobile and desktop UI | TASK-014, 017 | E2E tests at primary viewports | Planned |
| FR-12 | No collection of personal or usage data | TASK-019 | Network, storage, and script audit | Planned |
| FR-13 | Preserve previous data after refresh failure | TASK-008 through TASK-010, 015 | Failure injection and preservation tests | Planned |
| FR-14 | Warning for data older than seven days | TASK-008, 015 | Boundary-date fixtures and UI tests | Planned |

## P1 Functional Requirements

| Requirement | Summary | Tasks | Start condition | Status |
|---|---|---|---|---|
| FR-15 | Identifier-based share URL | TASK-022 | P0 stable and search terms excluded | Deferred |
| FR-16 | Candidate-list keyboard navigation | TASK-017, 023 | Improve after P0 accessibility completion | Planned |
| FR-17 | Regional expansion outside Seoul | TASK-024 | Seoul performance and quality verified | Deferred |

## Non-Functional and Release Gates

| Area | Criterion | Tasks | Evidence | Status |
|---|---|---|---|---|
| Cost | Zero mandatory monthly cost and no payment method | TASK-001, 010, 021 | Dependency and deployment audit | In progress |
| Search quality | Exact name-and-address Top-3 recall >= 90% | TASK-013, 021 | Benchmark report | Planned |
| Refresh reliability | Success rate >= 95% over the last 30 days | TASK-010, 021 | Actions run history | Planned |
| Freshness | As-of date within seven days during normal operation | TASK-008, 015 | Stale-data check | Planned |
| Performance | LCP target 2.5 s, search 500 ms, code 300 KB | TASK-018 | Performance report | Planned |
| Accessibility | Baseline WCAG 2.1 AA, zero critical automated errors | TASK-017, 021 | Automated and manual audit | Planned |
| Privacy | Zero collection of search terms or behavior | TASK-019, 021 | Network and code audit | Planned |
| Safety | Zero missing-result-to-closed or new-code auto-mappings | TASK-007, 013, 021 | Regression tests | Planned |
| Recovery | Preserve last known-good data after validation failure | TASK-009, 010, 021 | Failure-injection tests | Planned |
| Documentation | Public setup, deployment, source, disclaimer, and milestone handbook review | TASK-020, 021, 025, 026 | Public-documentation checklist plus milestone handbook review record | In progress |

## Human Handbook Governance

TASK-025 establishes the separate Korean human-facing handbook and its Pre-M0 explanatory baseline. It does not mark any product FR as implemented. TASK-026 recurs after each milestone's implementation, tests, and role reviews; it records affected handbook files as Updated or Reviewed without change and requires human Korean-language review before final milestone closure.

## Fixed-Copy Verification

The Reviewer verifies that the following meanings remain consistent throughout the product.

- `행정상 영업` (administratively operating) does not mean the business is open at the current moment.
- No matching data does not mean that a business is closed.
- When data refresh is delayed, show the as-of date and recommend additional verification.
