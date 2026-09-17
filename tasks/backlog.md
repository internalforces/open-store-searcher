<!--
Purpose:        Prioritized backlog of unstarted work derived from the PRD
Owner:          Planner
Update Trigger: When requirements, priorities, milestones, sizes, or task promotion change
Harness Version: 1.1
-->

# Backlog — open-store-searcher

_Last updated: 2026-09-17_

| ID | Task | Priority | Milestone | Size | Related requirement |
|---|---|---|---|---|---|
| TASK-009 | Design and implement atomic validated-artifact publication and last-known-good preservation | High | M1 | M | FR-13 |
| TASK-010 | Configure daily change check, validation, and Pages publication in GitHub Actions | High | M1 | M | Section 12.3, success metrics |
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

## TASK-008 calibration waiting disposition — 2026-09-17

TASK-008 is awaiting its approved 30-Seoul-calendar-day evidence interval and does not occupy the
single active implementation slot between daily observations. TASK-009/010 remain dependent on
the reviewed policy and baseline and must not resume yet. Independent backlog work may proceed on
a separate branch. TASK-019 AC-019-8 was the next eligible bounded task and is now active because
the Actions workflows exist for read-only review; any security fix, settings change, deployment, or release
still requires its existing explicit approval.

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

TASK-019 was activated by explicit user request on 2026-09-17; see [active task](active.md).
The actual workflow/settings review is performed and documented in the
[Actions report](../reports/security-2026-09-17-task-019-actions.md), superseding the historical
missing-workflow evidence. The user subsequently authorized remediation: main protection is configured and the upload
pin is fixed in the branch. AC-019-8 remains open for deployment reviewer/environment setup,
Ubuntu verification and final review. See [remediation](../reports/security-2026-09-17-task-019-remediation.md).
TASK-008 continues its approved calibration interval. TASK-020 remains unactivated.
