<!--
Purpose:        Track the single active implementation task and its acceptance criteria
Owner:          Implementer / Planner
Update Trigger: When a task starts, is blocked, completes, or changes owner
Harness Version: 1.1
-->

# Active Tasks — open-store-searcher

_Last updated: 2026-10-19_

## In Progress

### TASK-009: Atomic validated publication and last-known-good preservation

- Owner: Implementer / Tester / Reviewer; priority High; milestone M1; size M.
- Requirements: FR-13; supporting FR-02/08/12/14.
- Authorization: On 2026-10-19 the user requested preservation of existing work, activation on
  latest main and execution. TASK-010 remains paused.
- Base: merged PR #32, `9569ffbce4ce141e06f0883d90bc19305890972c`.
- Workspace: reuse the clean calibration checkout on `codex/task-009-publication-acceptance`;
  retain its prior branch and all other checkouts. The original checkout's 73 untracked files
  are fingerprinted outside Git and remain untouched.
- Status: Active; focused local acceptance verified (18/18), with independent Task 2 spec and
  quality review Approved. Final current-tree full verification passes 849/68/20; whole-diff verdict is recorded
  separately in `reports/review-2026-10-19-task-009.md`. The user approved the plan and subagent implementation on 2026-10-19.
- Design: retain the approved collection-date publication design and compact V2 contract.
- Plan: [acceptance continuation](../docs/superpowers/plans/2026-10-19-task-009-publication-acceptance.md).

Operational continuation requested on October 19: fresh collection succeeded, but strict
validation of all 195 categories / 2,952,086 rows rejected count/count-change/status-share
limits; no candidate was promoted. The retained October 16 candidate was rebuilt and packaged
with complete 730-file equality after unpacking. Neither result is hosted acceptance.
See [operations evidence](../reports/operations-2026-10-19-task-009.md) and the approved
[operational/recovery design](../docs/superpowers/specs/2026-10-19-task-009-operational-recovery-design.md).
The user approved destination/resources, default-off scheduling and GitHub Release backup/
trusted restoration on October 19. The [detailed execution plan](../docs/superpowers/plans/2026-10-19-task-009-operational-recovery.md)
was approved by the user on October19. Tasks1–4 local implementation and independent reviews
are Approved; Task5 accumulated verification/documentation and final review are recorded in
[the operational recovery report](../reports/test-2026-10-19-task-009-operational-recovery.md). Concrete remote
setup, archive/tag publication and each deployment retain separate action-time gates.

Current operational recovery verification passes52 files/1,125 tests,68 browser and20 accessibility
checks, plus45 Node tests. The730-file real package round trip and full preservation/fingerprints
pass after the independently Approved producer-warning correction. Task5 scoped review is
Approved. Initial whole-branch review requested I1/M1/M2/M3 corrections; those corrections now
pass fresh local checks and the final scoped independent re-review is Approved (all four
findings addressed; zero new breakage); the empty registry and actual hosted/source/performance/release gates remain open.

Acceptance checklist:

- [x] Preserve existing changes and branch from current remote main.
- [x] Reconcile AC-009-1 through AC-009-6 against existing implementation and tests.
- [x] Pinned baseline verification passes 831/68/20; the user approved the plan and subagent implementation.
- [x] Verify compact V2 deployed-state reconciliation and replacement failures locally.
- [x] Verify builder copy/write/promotion failures preserve the complete prior site/source inventory locally.
- [x] Separate approved quality inputs from unverified operational URL/resource decisions; see
      [October 19 acceptance evidence](../reports/test-2026-10-19-task-009.md).
- [x] Focused18 and pinned849/68/20 checks pass; [final whole-diff review](../reports/review-2026-10-19-task-009.md) is Approved with no findings.
- [ ] Resolve hosted publication/reconciliation/recovery acceptance with concrete action-time
      approval. Local evidence cannot close hosted AC-009-4/5.

This local continuation does not authorize push, PR, merge, workflow dispatch, remote operational
configuration activation, publication/deployment, recurring collection, new dependencies,
status mapping or security-setting changes. TASK-009 stays incomplete while hosted acceptance
is outstanding.

## Completed prerequisite — TASK-008

TASK-008 was already complete in merged PR #31; its quality
acceptance was independently reconfirmed on 2026-10-18 after explicit approval of
its exact conservative policy, 23 allowed-empty IDs and initial baseline; fresh complete-source
validation; local failure-preservation checks; pinned full verification; and independent
**Approved** final review. See the [completed task](completed.md#task-008-final-quality-acceptance--2026-10-18),
[verification report](../reports/test-2026-10-18-task-008-final.md) and
[final review](../reports/review-2026-10-18-task-008-final.md).

PR #32 merged as `9569ffbce4ce141e06f0883d90bc19305890972c`, including the four review
corrections and their verification. Its [delivery record](../reports/delivery-2026-10-18-task-008.md),
[review verification](../reports/test-2026-10-18-pr32-remediation.md),
[corrected preservation receipt](../reports/preservation-2026-10-18-pr32-remediation.json), and
[independent review](../reports/review-2026-10-18-pr32-remediation.md) remain dated evidence.
The October 19 TASK-009 continuation starts from that merged base and preserves other work.

## Sequential publication gates — TASK-009, then TASK-010

TASK-009 is now the sole active task under the October 19 request; TASK-010 remains paused.
The quality-policy/bootstrap approval dependency is now resolved. The collection-date staging
and workflow foundations remain implemented, with their dated verification and security evidence.
The following operational/publication gates remain:

- [ ] Complete TASK-009 atomic-publication/failure-injection and independent acceptance.
- [x] Prepare local operational `publication/config.json` with the approved destination and
      the exact approved quality objects.
- [ ] Validate actual hosted deployed-baseline/bootstrap reconciliation with separately approved evidence.
- [x] Implement the approved local separate schedule hold and durable trusted restoration/reconciliation
      under the approved execution plan;
      existing one-day same-run retries do not establish cross-revision recovery.
- [ ] Resolve current-source quality rejection or separately approve an initial retained-input
      contract. Do not weaken limits or substitute retained data implicitly.
- [ ] Re-read actual repository/environment protections before any approved operation.
- [ ] Complete TASK-010 actual hosted ingestion/publication/recovery and independent review.
- [ ] Obtain concrete action-time approval before any publication/deployment.

The validation-only [`publication/validation-config.json`](../publication/validation-config.json)
contains approved inputs and no destination. The local workflow entry point now exists from the
approved proposal with all quality objects unchanged; remote publication has not been enabled. TASK-008's offline accepted replay is not a hosted bootstrap,
public recovery exercise or operational reliability measurement.

Design and historical foundation evidence:
[publication design](../docs/superpowers/specs/2026-09-12-task-009-010-publication-design.md),
[foundation verification](../reports/test-2026-09-12-task-009-010.md),
[hosted CI](../reports/test-2026-09-12-publication-hosted.md),
[final Actions review](../reports/security-2026-09-18-task-019-final.md), and
[operator contract](../publication/README.md).

## Remaining release boundaries

Collection-date operation is approved; source coverage is still explicitly unverified. The
79 nonempty zero-change categories and narrow JSON budget may reject normal future updates;
new tolerance requires evidence and explicit approval. Retained calibration gaps, duplicate
receipt and all three transfer failures remain evidence; ISS-003 remains unresolved.

TASK-018/021 retain mobile/physical-device/hosted performance gates. TASK-021 is ineligible until
production/publication/recovery and other release prerequisites pass. No whole FR or milestone
is closed by TASK-008 alone. M1/M2/M3 and their TASK-026 handbook/human-language gates remain open;
no handbook was accessed or changed during this work.

TASK-019 and TASK-020 remain complete within their recorded review scope. The original TASK-020
review excludes the Korean handbook and predates README/security-contact follow-ups; those
later follow-ups have local verification only, not independent final-head approval.


## Retained merged-main collector state

PR #31 merged as `c521467` before this delivery. Its bounded ISS-003 client recovery and numeric
diagnostics remain intact. The provider inconsistency is reproduced and remains open upstream;
strict equality/size/hash/ZIP/schema gates remain unchanged. See the
[issue review](../reports/review-2026-10-17-iss-003.md) and
[PR #31 readiness](../reports/readiness-2026-10-17-pr31.md). This continuation adds fresh local
quality evidence and does not undo the prior adoption, client mitigation or independent reviews.
