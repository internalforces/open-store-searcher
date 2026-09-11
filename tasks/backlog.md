<!--
Purpose:        Prioritized backlog of unstarted work derived from the PRD
Owner:          Planner
Update Trigger: When requirements, priorities, milestones, sizes, or task promotion change
Harness Version: 1.1
-->

# Backlog — open-store-searcher

_Last updated: 2026-09-04_

| ID | Task | Priority | Milestone | Size | Related requirement |
|---|---|---|---|---|---|
| TASK-009 | Design and implement atomic validated-artifact publication and last-known-good preservation | High | M1 | M | FR-13 |
| TASK-010 | Configure daily change check, validation, and Pages publication in GitHub Actions | High | M1 | M | Section 12.3, success metrics |
| TASK-019 | Complete deferred Actions security review (AC-019-8) after TASK-010 provides workflows | High | M3 | M | FR-12, Section 14.4 |
| TASK-020 | Write setup, deployment, source, disclaimer, contribution, code-of-conduct, and security-reporting docs | High | M3 | M | Section 17, Section 20 |
| TASK-021 | Run full P0 traceability and v1.0 release-candidate verification | High | M3 | L | FR-01 through FR-14, Section 17 |
| TASK-022 | Design and implement identifier-based share URLs | Medium | M4 | M | FR-15 |
| TASK-023 | Improve candidate-list keyboard navigation | Medium | M4 | M | FR-16 |
| TASK-024 | Design static-file expansion outside Seoul | Low | M4 | L | FR-17 |
| TASK-026 | At each milestone close, update or review affected Korean handbook documents and obtain human language review | High | Recurring | S | Documentation NFR; all safety invariants |

## Recommended Start Order

1. TASK-008 was activated on 2026-09-04 by the user's execution request; see tasks/active.md and proposed ADR-014.
2. Keep TASK-008 through TASK-010 sequential so each data contract is tested before its consumer.
3. Use M1's validated fixtures and schema to implement M2 search and UI in traceable units rather than parallel implementation.

TASK-026 recurs after milestone implementation, testing, and review. TASK-020 remains the separate M3 deliverable for public setup, deployment, contribution, policy, and release documentation.

## Size Guide

| Size | Expected effort |
|---|---|
| XS | Less than 1 hour |
| S | 1 to 4 hours |
| M | Half a day to 1 day |
| L | 1 to 3 days |
| XL | More than 3 days — must be split before activation |


## TASK-018 audit follow-up — 2026-09-08

TASK-018's approved bounded measurement is complete; this does not satisfy the performance
release gate. Performance Engineer / Implementer own follow-up search CPU, accessible candidate
rendering and real-data partitioning remediation recorded in memory/known-issues.md. TASK-021
must retain the gate until approved remediation and remeasurement pass. No follow-up task or
TASK-019 is activated here; TASK-008 remains explicitly on hold.


### TASK-018 continuation disposition — 2026-09-08

Approved computation optimization and current synthetic partition loading are complete.
Remaining performance work is broad candidate rendering, full-data download/index cost and
production measurement. Three display cells exceed 500 ms and eight are unavailable; do not
close TASK-021 acceptance. TASK-019 is not activated and TASK-008 remains on hold.


### TASK-018 result-page follow-up closed

User-approved pagination resolves the prior lab display misses and unavailable search cells.
All 24 search and 16 applicable page-navigation groups pass 500 ms. Earlier follow-up entries are
historical. Production measurements/data gates remain required for release; no next task activated.


## TASK-019 unfinished Actions criterion

The bounded current-application assessment is complete; overall TASK-019 is deferred/incomplete.
[Acceptance criterion AC-019-8](completed.md#task-019-acceptance-criteria-and-evidence) remains
unchecked because actual workflows and repository settings were unavailable, with no recorded
approval to waive this criterion. Security Reviewer / Release Manager must inspect permissions,
triggers, action pinning, credentials and artifact trust when TASK-010 provides the workflow,
record evidence, and retain TASK-021's release gate until review passes. This restores unfinished
scope rather than activating infrastructure work. TASK-008 remains explicitly on hold.
