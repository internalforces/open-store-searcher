<!--
Purpose:        Prioritized backlog of unstarted work derived from the PRD
Owner:          Planner
Update Trigger: When requirements, priorities, milestones, sizes, or task promotion change
Harness Version: 1.1
-->

# Backlog — open-store-searcher

_Last updated: 2026-08-20_

| ID | Task | Priority | Milestone | Size | Related requirement |
|---|---|---|---|---|---|
| TASK-002 | Configure Apache-2.0 single/mono repository foundation, static build, lint, format, and typecheck | High | M0 | M | Open source, maintainability |
| TASK-003 | Configure unit, pipeline, E2E, and accessibility test harnesses and fixture rules | High | M0 | M | Section 16, release criteria |
| TASK-004 | Research local administrative licensing data download, schema, terms of use, and attribution | High | M1 | M | Section 12.1, Section 20 |
| TASK-005 | Implement a change-detecting Seoul data collector | High | M1 | M | FR-13, Section 12.3 |
| TASK-006 | Implement transformation schema and identifiers that separate original display values from normalized search values | High | M1 | L | FR-05 through FR-06, Section 12.2 |
| TASK-007 | Implement fail-safe four-status mapping and unknown-code handling | High | M1 | M | FR-04, FR-07 |
| TASK-008 | Implement validation for required columns, abrupt changes, duplicates, missing values, status changes, as-of dates, and JSON size | High | M1 | L | FR-08, FR-13 through FR-14 |
| TASK-009 | Design and implement atomic validated-artifact publication and last-known-good preservation | High | M1 | M | FR-13 |
| TASK-010 | Configure daily change check, validation, and Pages publication in GitHub Actions | High | M1 | M | Section 12.3, success metrics |
| TASK-011 | Implement business-name and address input validation and normalization | High | M2 | M | FR-01 through FR-02 |
| TASK-012 | Implement name/address candidate search, scoring, address conflicts, confidence, and Top-3 ranking | High | M2 | L | FR-03, FR-07 |
| TASK-013 | Build Seoul same-name, address-conflict, and exact-match quality fixtures and recall measurement | High | M2 | M | Top-3 90% |
| TASK-014 | Implement the initial page and result-card UI with status, evidence, as-of date, and source | High | M2 | L | FR-04 through FR-09, FR-11 |
| TASK-015 | Implement empty-result, low-confidence, data-loading-failure, and stale-data UX | High | M2 | M | FR-07, FR-13 through FR-14 |
| TASK-016 | Generate safe Naver and Kakao Map search links and test URL encoding | High | M2 | S | FR-10 |
| TASK-017 | Implement responsive, keyboard, and screen-reader search flow and accessible status announcements | High | M2 | L | FR-11, FR-16, Section 14.3 |
| TASK-018 | Verify bundle, primary-content, search-latency, and static-data partitioning budgets | High | M3 | M | Section 14.2, success metrics |
| TASK-019 | Review privacy, input rendering, external links, and Actions permissions | High | M3 | M | FR-12, Section 14.4 |
| TASK-020 | Write setup, deployment, source, disclaimer, contribution, code-of-conduct, and security-reporting docs | High | M3 | M | Section 17, Section 20 |
| TASK-021 | Run full P0 traceability and v1.0 release-candidate verification | High | M3 | L | FR-01 through FR-14, Section 17 |
| TASK-022 | Design and implement identifier-based share URLs | Medium | M4 | M | FR-15 |
| TASK-023 | Improve candidate-list keyboard navigation | Medium | M4 | M | FR-16 |
| TASK-024 | Design static-file expansion outside Seoul | Low | M4 | L | FR-17 |
| TASK-026 | At each milestone close, update or review affected Korean handbook documents and obtain human language review | High | Recurring | S | Documentation NFR; all safety invariants |

## Recommended Start Order

1. Complete TASK-001 written-spec review and decision-record verification.
2. Build a reproducible development foundation with TASK-002 and TASK-003 after TASK-001 closes.
3. Begin M1 implementation after TASK-004 verifies the source contract.
4. Use M1's validated fixtures and schema to implement M2 search and UI in traceable units rather than parallel implementation.

TASK-026 recurs after milestone implementation, testing, and review. TASK-020 remains the separate M3 deliverable for public setup, deployment, contribution, policy, and release documentation.

## Size Guide

| Size | Expected effort |
|---|---|
| XS | Less than 1 hour |
| S | 1 to 4 hours |
| M | Half a day to 1 day |
| L | 1 to 3 days |
| XL | More than 3 days — must be split before activation |
