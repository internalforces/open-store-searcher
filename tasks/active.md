<!--
Purpose:        Track the single active implementation task and its acceptance criteria
Owner:          Implementer / Planner
Update Trigger: When a task starts, is blocked, completes, or changes owner
Harness Version: 1.1
-->

# Active Tasks — open-store-searcher

_Last updated: 2026-10-22_

## In Progress

### TASK-027: PR37 retained-data refresh correction

- Status: Reopened after final-head GitHub review identifies a P2 pagination regression in
  `src/app/app.tsx`: background refresh marks retained results busy and blocks all page controls.
- Scope: Correct the result busy boundary and add a real-App pending-refresh regression;
  retain actual search/page request guards, all acceptance assertions and runner policy.
- Authority: The user's existing CI-repair, review and protected-main merge request covers this
  review correction. No deployment, source policy or follow-up activation is authorized.
- Prior acceptance on source8ed3ddb and manual VoiceOver observations remain point-in-time
  evidence. Changed source requires new bindings and explicit reviewed carry-forward or affected
  verification; do not relabel the earlier152 hashes or CI as current after the correction.
- Delivery checkpoint: PR37 is ready/open; review thread PRRT_kwDOT-E1m86vLUCg remains unresolved.
  Implementer Sol/high owns App and its focused workspace regression; independent Sol/xhigh
  review and final current-head CI/review still precede merge.
- Verification: Focused workspace32, type/style/build and new-source performance pass; code/test
  correction independently Approved. Affected actual VoiceOver remains pending because the human
  cannot restart it now. Prior normal flows have a reviewed carry-forward bridge. Preserve the
  explicit actual-verification-before-merge condition; no waiver or completion is inferred. See
  [correction evidence](../reports/test-2026-10-22-pr37-refresh.md).
- TASK-009 remains waiting, TASK-010 paused, TASK-021 gated and TASK-028 proposed/unactivated.
  Original and TASK-009 worktree changes remain protected. No task is completed by this reopening.

## TASK-009 waiting disposition — 2026-10-22

TASK-009 is **awaiting materials and action-time approval**,
incomplete, and does not occupy the single active implementation slot. The user explicitly
authorized this waiting-state clarification. TASK-008 is complete under October 18 acceptance;
TASK-010 stays paused and TASK-021 gated. The later TASK-027 activation is recorded above.

Missing materials: exact October 16 original ZIP and fresh byte verification. Missing approvals
and later evidence: concrete source transport, real asset/registry adoption, performance/release
readiness, one-time hosted publication and durable recovery acceptance. Existing source/design/
quality approvals remain valid within their original scope. Owners, exact identities and separate
resumption/completion conditions are in the [waiting register](../reports/status-2026-10-22-task-009-waiting.md).
Explicitly reactivate TASK-009 with an available slot before execution; time or material arrival
alone does not resume it. Earlier active/calibration-pending statements below are historical
and are superseded for current start decisions. Retain all implementation and dated evidence.

## Historical execution and checkout snapshots

### TASK-009: Atomic validated publication and last-known-good preservation

- Owner: Implementer / Tester / Reviewer; priority High; milestone M1; size M.
- Requirements: FR-13; supporting FR-02/08/12/14.
- Authorization: On 2026-10-19 the user requested preservation of existing work, activation on
  latest main and execution. TASK-010 remains paused.
- Base: merged PR #33, `b586e72e88cb41b9988a62d70f9cd5b5503b53bc`; prior local acceptance
  and recovery evidence retains its original PR #32 base.
- Workspace: reuse the calibration checkout on `codex/task-009-first-publication-analysis`;
  retain its prior branch and all other checkouts. The original checkout's 73 untracked files
  are fingerprinted outside Git and remain untouched.
- Status at October 19 activation (superseded by the current waiting disposition): Active. Historical October 19 local acceptance verified (18/18), with independent Task 2 spec and
  quality review Approved. That dated current-tree full verification passed 849/68/20; whole-diff verdict is recorded
  separately in `reports/review-2026-10-19-task-009.md`. The user approved the plan and subagent implementation on 2026-10-19.
- Design: retain the approved collection-date publication design and compact V2 contract.
- Plan: [acceptance continuation](../docs/superpowers/plans/2026-10-19-task-009-publication-acceptance.md).

Current October 22 continuation: PR #34 is merged as
`cd16e7c4dd84d6c8520399f3a7ffb72cc88f167a`, with exact-main Verify completed/success.
The user's next-work execution and merge request covers the concrete source transport
preparation and delivery. The [preflight](../reports/research-2026-10-22-task-009-source-transport.md)
and [request](../reports/source-transport-2026-10-22.json) bind the approved assets and unchanged
quality with explicit current/historical evidence. Source upload remains blocked on locating and
rehashing the original ZIP and concrete action-time source/resource approval. Runtime trust
registries remain inactive. Full-data/mobile, hosted/publication/backup/recovery and release
prerequisites remain open; TASK-009 stays active and TASK-010 paused. Older premerge notes below
are dated history, not instructions to repeat PR #34 integration.

Latest final-review authorization: the user requested review of PR #34 and protected-main
merge if sound while keeping quality unchanged and source-data upload/deployment withheld.
Three P2 workflow findings are corrected locally; independent core rereview is Approved.
The [final-review evidence](../reports/review-2026-10-21-pr34-final.md) retains exact regression,
full verification, final independent assessment and action-time CI/integration boundaries.
Final current-head Verify and conversation closure remain mandatory before normal merge.
TASK-009/II-10/hosted AC-009-4/5 remains active; TASK-010, registries and operational gates stay
paused/inactive. The historical base below identifies the pre-PR34 integration starting point.

Latest October 21 code-delivery authorization: the user requested commit, push, PR creation
and subsequent verification. Implementation `fd8872dfb6703737731bde68e8688b73c28f9361` is in
[draft PR #34](https://github.com/internalforces/open-store-searcher/pull/34); exact43-file remote
readback and all178 historical-proof code bindings match. Fresh local and implementation-head
GitHub Verify pass1,366/68/20 plus96 Node tests. See the
[delivery record](../reports/delivery-2026-10-21-task-009-initial-import.md). Current-head checks
are read back after documentation bookkeeping. This authorization covers code delivery;
source assets/registry activation, main merge, settings/dispatch and all deployment/hosted
acceptance gates remain separate and unperformed. Earlier no-remote authorization statements
below describe the prior local-only phase. TASK-009 stays active and TASK-010 paused.

Current October 21 implementation: Tasks 1–6 have Approved independent spec/quality reviews,
with Task 5 Actions/security and Task 6 provenance-security reviews Approved and zero open
findings. Task 7 actual-source proof passes 195 categories/2,951,024 rows, complete baseline
metrics and 730-file package equality. Full checks pass 1,366 / 68 / 20 plus 96 Node tests; actual
failure/metric/midnight/preservation controls pass. Its independent scoped spec/quality review
is Approved; final independent whole-diff review is Approved for local technical delivery. See [current test evidence](../reports/test-2026-10-21-task-009-initial-import.md).
Source and recovery registries remain inactive, default-off controls remain unchanged and no
remote action occurred. This supersedes earlier implementation-pending statements below.

Current October 21 execution authorization: the user approved the detailed initial-import plan
and authorized local implementation, verification and independent task review. Execution is in
progress; upload/deployment and all other remote operations remain withheld. Keep every quality
criterion unchanged and preserve prior work. TASK-009 remains active and TASK-010 paused.

Earlier October 21 planning handoff: the user approved the full initial-import design and requested the
[detailed implementation plan](../docs/superpowers/plans/2026-10-21-task-009-initial-import.md),
with quality unchanged and upload/deployment explicitly withheld. The self-reviewed plan fixes
seven sequential ownership/interface/test/review units, maps II-01 through II-10, and separates
local readiness from future actual source-asset/registry/hosted operations. It is not executed or
human-approved as an execution plan. No code, config, workflow, runtime registry, dependency or
remote state changed; source authority stays unimplemented and recovery authority empty.
Preserve prior uncommitted analysis/design. TASK-009 remains active and TASK-010 paused.

Historical October 20 continuation: the user approved the exact October 16 retained source for
the first-publication/recovery exercise, with quality inputs unchanged, and requested an initial
import design. The [source decision](../memory/decisions.md#task-009-initial-source-selected--2026-10-20)
resolves selection only. The [design](../docs/superpowers/specs/2026-10-20-task-009-initial-import-design.md)
proposes a separate manual current-main import with hash-bound Release source assets, full
production validation/build, strict first-publication 404 checks and existing protected deployment.
It includes the narrow backup-origin admission needed for later recovery. Fresh builder check
found no material planning questions; this is not human design approval or a code/security review.
No importer, workflow, runtime registry, policy or remote action is implemented or activated.
Full-design approval precedes the detailed implementation plan; TASK-010 remains paused.

Pre-selection October 20 analysis: PR #33 merged and exact-main Verify passed. The user requested
rejection analysis and a first-source proposal. Fresh retained-source replay reproduces 51
rejections in 18 categories; complete source comparison finds 1,065 added identities, three
absent prior identities and 1,766 changed matched rows. Independent arithmetic reproduces all
rejection values. The [source decision report](../reports/research-2026-10-20-task-009-first-publication.md)
proposes the exact already validated October 16 source for bounded first-publication/recovery
acceptance, subject to explicit source selection and separately approved initial-import design.
No source or policy is adopted, no import is implemented, and no hosted/release gate closes.
Daily operation still needs a separate evidence-bound policy decision; TASK-010 remains paused.

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
