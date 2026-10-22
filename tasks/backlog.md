<!--
Purpose:        Prioritized backlog of unstarted work derived from the PRD
Owner:          Planner
Update Trigger: When requirements, priorities, milestones, sizes, or task promotion change
Harness Version: 1.1
-->

# Backlog — open-store-searcher

_Last updated: 2026-10-22_

| ID | Task | Priority | Milestone | Size | Related requirement |
|---|---|---|---|---|---|
| TASK-010 | Configure daily change check, validation, and Pages publication in GitHub Actions | High | M1 | M | Section 12.3, success metrics |
| TASK-021 | Run full P0 traceability and v1.0 release-candidate verification | High | M3 | L | FR-01 through FR-14, Section 17 |
| TASK-022 | Design and implement identifier-based share URLs | Medium | M4 | M | FR-15 |
| TASK-023 | Improve candidate-list keyboard navigation | Medium | M4 | M | FR-16 |
| TASK-024 | Design static-file expansion outside Seoul | Low | M4 | L | FR-17 |
| TASK-026 | At each milestone close, update or review affected Korean handbook documents and obtain human language review | High | Recurring | S | Documentation NFR; all safety invariants |
| TASK-028 | Refine dashboard visual restraint and interaction feedback | Medium | M2 follow-up | L | FR-01 through FR-14, baseline FR-16, accessibility/performance NFRs |

## Recommended Start Order

1. TASK-008 is complete. TASK-009 is awaiting materials/action-time approval and does not
   occupy the active implementation slot; TASK-010 remains paused. Use the current
   [waiting register](../reports/status-2026-10-22-task-009-waiting.md), not historical calibration/active notes below.
2. TASK-027 becomes the sole active task on this handoff integration by explicit user request;
   start with detailed design confirmation and planning. See [active work](active.md).
3. Resume TASK-009 explicitly when applicable evidence and approvals are available and the slot
   is free; retain hosted AC-009-4/5 and II-10 acceptance before sequential TASK-010 completion.
4. Keep TASK-021 gated on performance/publication/recovery and remaining release criteria.

TASK-026 recurs after milestone implementation, testing, and review. TASK-020 public documentation
completed on 2026-09-18; TASK-021 retains release-candidate documentation verification.

## TASK-008 calibration waiting disposition — 2026-09-17

TASK-008 is awaiting its approved 30-Seoul-calendar-day evidence interval and does not occupy the
single active implementation slot between daily observations. TASK-009/010 remain dependent on
the reviewed policy and baseline and must not resume yet. Independent backlog work may proceed on
a separate branch. TASK-019 AC-019-8 and TASK-020 subsequently completed on 2026-09-18.
Deployment and release retain their explicit approval gates.

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


## TASK-019 Actions criterion closed — 2026-09-18

AC-019-8 is accepted; see [final review](../reports/security-2026-09-18-task-019-final.md).
TASK-020 subsequently completed with public documentation, full verification, and independent
review. TASK-008 observation continues; TASK-009/010 remain dependent on reviewed policy and baseline.


## TASK-008 final acceptance — 2026-10-18

The historical calibration-waiting disposition is superseded. The exact quality policy, 23-ID
empty list and initial baseline are approved and TASK-008 is complete; see
[completion](completed.md#task-008-final-quality-acceptance--2026-10-18).
TASK-009/010 may now be resumed sequentially, but are not activated here. Validation-only config
is separate from the still-absent workflow config; no deployment/publication is authorized.

## TASK-027: Prism Glass dashboard workspace

- Status: Complete for the approved presentation scope at `8ed3ddb`; see
  [final acceptance](completed.md#task-027-final-acceptance--2026-10-22). Human-assisted actual
  VoiceOver and canonical hosted full verification resolve the prior PG-10/15 gaps.
  PR #37 final evidence-head CI/review and authorized protected merge remain delivery checks.
- Owner: Implementer / Tester / Reviewer under the approved sequential execution method;
  GPT-6.1 Sol/high implementation and GPT-6.1 Sol/xhigh independent review.
- Authorization: Concept 01/design documentation, followed by the explicit commit/push/PR/merge
  and TASK-027 activation request on 2026-10-22.
- Milestone: M2 follow-up; size L; no release or milestone gate is waived.
- Dependencies: Current search, evidence, recovery, pagination and responsive contracts;
  concrete design review before implementation. Do not block design on unresolved calibration
  or resume TASK-009/010. Preserve the single-active-implementation-task rule.
- Specification: [Prism Glass design](../docs/superpowers/specs/2026-10-22-prism-glass-dashboard-design.md).
- Acceptance: PG-01 through PG-15 in the specification are the task's acceptance criteria.
  Preserve four statuses, raw evidence, explicit collection-date semantics, seven-day warnings,
  browser-only search, last-good recovery, complete pagination and safe external-map clicks.
- Verification: Focused component/Worker integration, four-browser search, axe, keyboard,
  responsive/zoom/motion/forced-color review, visual comparison, `npm run verify:full`,
  `npm run performance:check`, and independent final review on the approved runtime/runner.
- Exclusions: Business photos, favorites/history, share URLs, official-looking certificates,
  personal/registration fields, draggable windows, new dependencies/services and deployments.
- TASK-023 retains enhanced candidate keyboard navigation. This task uses native inspect/return
  buttons and baseline keyboard access; it does not close TASK-023 or FR-15.
- The [detailed implementation plan](../docs/superpowers/plans/2026-10-22-task-027-prism-glass.md)
  was executed after the user's approval. Task 4 and final whole-branch code quality are Approved.
  Final independent acceptance is Approved after current-source manual AT and canonical full CI;
  historical failed/unavailable results remain preserved in their dated reports.


## TASK-028: Dashboard visual restraint and interaction feedback

- Status: Proposed and unactivated; planning requested on 2026-10-22. TASK-027 is accepted;
  no follow-up implementation or active-slot handoff is inferred from that completion.
- Owner: Planner / Designer for design review; Implementer / Tester / Reviewer only after
  explicit execution and active-slot authority.
- Milestone: M2 follow-up; priority Medium; size L.
- Requirements: FR-01 through FR-14, baselineFR-16, accessibility/performance NFRs; QM01–08
  in the [design proposal](../docs/superpowers/specs/2026-10-22-dashboard-refinement-design.md).
- Intent: Reduce repeated generic visual decoration while preserving the bright Prism identity;
  use short animation to explain accepted search/page and inspected-record state.
- Plan: [four-stage proposed implementation plan](../docs/superpowers/plans/2026-10-22-dashboard-refinement.md).
- Dependencies: Accepted TASK-027 implementation, full follow-up design approval and explicit
  active-slot handoff; a human may explicitly change sequencing, but this
  plan does not. Exact palette/corners/timing are coordinator proposals, not accepted values.
- Acceptance: QM01–08 cover approved direction, hierarchy/evidence preservation, interruption-safe
  motion, media/AT, long content/responsive/actualzoom, unchanged budgets/default suite and review.
- Verification: Existing real component/Worker regressions, workspace browser/axe, actual AT,
  all-element2x and native200%zoom, pinned verify:full, performance:check and independent review;
  preserve failed/historical outcomes. No invented objective AI-style score.
- Exclusions: New dependencies/services/fonts, source/status/pipeline/Worker changes, analytics,
  history/favorites/share, enhanced TASK023navigation, deployment or silent acceptance waiver.
