<!--
Purpose:        Track the single active implementation task and its acceptance criteria
Owner:          Implementer / Planner
Update Trigger: When a task starts, is blocked, completes, or changes owner
Harness Version: 1.1
-->

# Active Tasks — open-store-searcher

_Last updated: 2026-09-20_

## In Progress

No implementation task is active. TASK-020 delivered its original documentation on 2026-09-18
with pinned Ubuntu full verification and an independent Approved review of the scope listed in
[the documentation review](../reports/review-2026-09-18-task-020.md). That review excludes the
Korean handbook and predates the follow-up README correction and minimal security-contact issue
form. Those PR follow-ups and subsequent documentation corrections received local verification
only; no independent final-head approval is claimed. See
[completion and follow-up evidence](completed.md#pr-27-review-follow-up-round-4--2026-09-19).
TASK-008 remains between scheduled daily observations; TASK-009/010 production publication and
TASK-021 release gates remain open.
TASK-021 is not eligible until its production and release prerequisites are satisfied.

## Awaiting time-bound evidence

TASK-008 remains between scheduled daily observations under
the single-active-task rule; its delivered observation branch was merged through PR #24.
TASK-008 completion remains authorized by the user's 2026-09-17 request.
The user explicitly approved
the exact category-bound reviewed-unverified 05/06 contract after the completion investigation.
The bounded implementation is verified with unchanged display mapping and raw/unknown metrics,
strict evidence/scope validation, 797/68/20 full checks and independent Reviewer approval. The approval does not
select numeric quality limits, empty-category policy, an initial baseline, or publication.
The user then instructed execution of the recorded completion plan, selecting its recommended
original TASK-008 ownership and activating the 30-Seoul-calendar-day calibration from 2026-09-17.
Four distinct current observations are complete. The 2026-09-20 observation contains 2,942,802
rows across all 195 categories; its archive is retained outside Git. Its transition has no
category-count decrease and retains 20 category-level status corrections for calibration review. Daily
non-publishing observation remains scheduled. Derived numeric
policy, the empty-category list, and the initial baseline still require explicit approval after
the interval. The previous operational verification began on the user's 2026-09-16 request, with
parallel subagents for quality evidence, hosted evidence and mobile-emulated measurement.
PR #23 merged as `bac6dce`; local implementation `da9e63c` has the same tracked tree.
Its hosted Verify check passed. Compact delivery design and implementation are already approved;
earlier design-pending notes are historical. Scheduled calibration evidence uses the isolated
`.worktrees/task008-calibration` checkout on `codex/task-008-calibration`; preserve all other
checkouts and untracked files.

This continuation measured the existing complete-source implementation and prepared remaining
quality decisions. The historical evidence pass did not authorize policy adoption, status changes, repository protection,
workflow dispatch, publication, commit, push, merge or release. TASK-009/010 remain paused.

Acceptance for this bounded continuation (FR-02/03/08/12/13/14; performance NFR):

- [x] Reconcile merged implementation, hosted CI and active-task state.
- [x] Verify source/asset provenance and measure the actual compact application under explicit
      mobile-emulated conditions, preserving failed/censored outcomes and physical-device limits.
- [x] Assess actual hosted prerequisites separately from ordinary CI; identify unresolved gates.
- [x] Produce an evidence-bound quality/status/empty-category and bootstrap decision packet.
- [x] Independently review reports and update remaining acceptance gates without claiming release.

The user resumed TASK-008 on 2026-09-12 and approved compact delivery on 2026-09-14.
Collection-date mode remains authoritative; source coverage is unverified. Complete-source
processing and lossless compact conversion cover 2,939,947 records. The functional research
site is 688,506,488 bytes; the old 2.44 GB single-file loader crash is historical and has been
replaced by compact loading. Prior desktop observations show 48–49 s readiness and 241–494 ms
post-load searches, with sampled browser-tree RSS up to 4.56 GB. These are not mobile guarantees.
See [compact verification](../reports/test-2026-09-14-compact-delivery.md).

Overall TASK-008 remains incomplete for the approved calibration interval, quality
policy/bootstrap, empty-category review, accepted validation, and final review. Exact
reviewed-unverified pair acceptance is implemented and verified. Mobile/hosted performance and
release gates remain open under their existing owner tasks and no longer block TASK-008 under the
approved ownership decision. Original PRD access is resolved; collection-date mode
retains source coverage as an explicit warning rather than a fabricated coverage assertion. No production
policy, source freshness, deployment approval or performance waiver has been inferred.

## Paused publication work

TASK-010 was in verification and release-gate resolution. TASK-009's
collection-date staging foundation is implemented; both overall tasks remain incomplete.
Pinned Ubuntu hosted verification passes 638 tests, 68 browser tests and 20 accessibility tests.
The two Windows WebKit failures reproduce in application-free HTML; approved-runner evidence
now satisfies the full-verification gate without changing or skipping keyboard assertions.
Production calibration, hosted publication/recovery and independent review remain pending.
The user authorized collection-date operation and has now resumed real-data quality review.
See the [publication design](../docs/superpowers/specs/2026-09-12-task-009-010-publication-design.md)
for AC-009-1 through AC-010-5, implementation boundaries and failure-injection requirements.
The collection date replaces source coverage only as the explicitly labeled display date.
Reviewed quality policy and baseline remain required; no synthetic production defaults are allowed.

- [x] Inspect collection, validation, transformation, browser loading and workflow boundaries.
- [x] Prepare a concrete publication transaction and Actions trust/verification design.
- [x] Resolve the date-basis direction: collection-date operation; real-data criteria held.
- [x] Implement the bounded staged serialization and same-release deployed-baseline binding.
- [ ] Implement and verify TASK-009, including failure injection and independent review.
- [x] Activate TASK-010 after the bounded TASK-009 staging contract is tested.
- [x] Add trusted daily/manual refresh, read-only CI and guarded Pages publication workflows.
- [x] Run checks and record failures and remaining hosted/release evidence gates.
- [x] Obtain passing approved Ubuntu-runner evidence; retain Windows WebKit diagnosis separately.
- [x] Resume quality config/bootstrap/resource calibration on explicit user request.
- [ ] Complete independent review, GitHub settings review and approved hosted publication/recovery.

Evidence: [verification](../reports/test-2026-09-12-task-009-010.md),
[Actions self-review](../reports/security-2026-09-12-task-009-010.md),
[operator contract](../publication/README.md). No deployment or task-completion claim is made.

Continuation: [hosted verification and acceptance state](../reports/test-2026-09-12-publication-hosted.md),
[actual repository settings assessment](../reports/security-2026-09-12-publication-settings.md).
Draft PR #21 exists and its Ubuntu CI passed. Actual settings inspection found no environment,
main protection or ruleset, no publication variable, and no retrievable Pages site. Independent
review is still absent. The user explicitly resumed calibration; deployment and security-setting
approval remain separate. No overall task was moved to completed.

TASK-019's bounded application assessment completed on
2026-09-09; overall TASK-019 is complete after AC-019-8 acceptance on 2026-09-18.
See its [acceptance checklist](completed.md#task-019-acceptance-criteria-and-evidence) and the
[closed Actions criterion](backlog.md#task-019-actions-criterion-closed--2026-09-18).
See the [TASK-019 security report](../reports/security-2026-09-09-task-019.md).
No actionable vulnerability was confirmed in current code; production and Actions review gates
remain open for TASK-009/010/021. The earlier TASK-020 backlog state is superseded by its
[completion record](completed.md#task-020-public-documentation--2026-09-18).
No implementation task is active; the review-scope limits in the In Progress section still apply.

## Awaiting prerequisite evidence — incomplete

The 2026-09-08 hold was lifted by the user's explicit resumption request on 2026-09-12.
Preserve the previous implementation and evidence. Scheduled production observation/review
continues without an active implementation slot;
source coverage is still unverified under the approved collection-date interpretation.


### TASK-008: Validate staged refreshes and freshness evidence

- Owner: Planner / Researcher for remaining production evidence; staged implementation verified
- Priority: High
- Milestone: M1
- Size: L
- Related requirements: FR-08, FR-13, FR-14; data-quality and freshness NFRs
- Status: Staged implementation and full verification passed; awaiting the approved calibration interval
- Authorization: User requested execution of TASK-008 on 2026-09-04.
- Description: Validate complete staged inputs, identity/schema integrity, count and missing-value
  changes, aggregate-status drift, coverage dates, and JSON syntax/UTF-8 size.
- Dependencies: Completed TASK-005, TASK-006, TASK-007; accepted ADR-009 through ADR-013.
- Risks: Production quality limits, allowed-empty policy and initial baseline remain unapproved.
  Source coverage is unverified under accepted collection-date operation.
  Original PRD access, complete parsing and the compact delivery contract are resolved.
- Acceptance criteria:
  - [x] Inspect accepted contracts and produce a concrete design with a requirements/test matrix.
  - [x] Separate sourced freshness facts from unsupported ZIP-date and row-timestamp inference.
  - [x] Obtain approval of ADR-014 and the date-only seven-day warning convention.
  - [x] Implement the staged validator and freshness/JSON helpers with offline test-first evidence.
  - [ ] Resolve production coverage evidence and reviewed thresholds/baseline without defaults.
  ADR-016 resolves the operational date basis using collection dates with unverified source
  coverage; reviewed thresholds/baseline remain open and exact-pair acceptance is complete.
  - [x] Obtain source PRD or explicit direction to use current traceability as the design baseline.
  The original PRD is accessible and compared on 2026-09-16; see the quality decision packet.
  - [x] Approve and activate a distinct-archive 30-Seoul-calendar-day calibration protocol.
  - [ ] Complete the interval, derive and explicitly approve the policy/empty list/baseline,
        obtain an accepted complete validation, and complete independent final review.
  - [x] Pass focused tests, coverage, and pinned full verification.
  - [x] Obtain independent Reviewer approval of the staged implementation.
- Verification commands: Focused Vitest unit/pipeline runs, `npm run test:coverage`,
  `npm run verify:full`, `git diff --check`.
- Results and evidence:
  - `docs/superpowers/specs/2026-09-04-task-008-validation-design.md` (Accepted 2026-09-04).
  - `reports/design-2026-09-04-task-008.md` (design assessment, not final approval).
  - `reports/test-2026-09-04-task-008.md`: 144 new tests; full run 362 passed, two existing
    Windows skips, four browser smoke tests, and two accessibility scans passed.
  - `reports/review-2026-09-04-task-008.md`: Approved for the bounded synthetic implementation;
    independent rerun passed all 144 TASK-008 tests.
  - No production policy, source-cut assertion, or baseline has been fabricated. TASK-009 remains
    in the backlog; TASK-008 is not complete.
  - Remaining-work investigation: `reports/research-2026-09-04-task-008-completion-gates.md`.
    Local/history PRD searches did not locate the original; the actual collector environment gate
    returned `{ "ok": false }`; GitHub has no retained run/artifact evidence. Source/runtime access
    and the explicitly identified row-observation dependency remain required.

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

## Historical compact delivery continuation — bounded implementation complete

- [x] Reuse the existing worktree and verify its relationship to merged PR #22.
- [x] Obtain and hash-verify the complete original source.
- [x] Measure all-source fields, cardinalities, candidate data/index and research-site sizes.
- [x] Verify exact research round-trip, complete IDs, original order and row-count parity.
- [x] Prepare a concrete delivery/Worker migration design with measured limitations.
- [x] Obtain approval of the proposed delivery/public-interface contract (user: 2026-09-14).
- [x] Implement the coordinated production codec, reader/builder and Worker store.
- [x] Verify local production-code failure preservation and full search-result equivalence.
- [x] Measure real-source desktop readiness, memory, refresh overlap, latency and pagination.
- [x] Run applicable local checks and record platform limits without closing production or release gates.

Design: [compact delivery proposal](../docs/superpowers/specs/2026-09-14-task-008-compact-delivery-design.md).


Compact-delivery implementation and local verification are documented in
[verification](../reports/test-2026-09-14-compact-delivery.md) and the independent review. The
production-codec exact round-trip covers 2,939,947 records; the functional research site is 688.5 MB.
Two desktop observations show 241–494 ms searches after 48–49 s readiness; mobile/hosted readiness
and memory are unverified. The previously pending ordinary hosted Verify check passed for PR #23. Actual hosted delivery,
reviewed policy/baseline, 05/06 review and overall TASK-008/009/010/release acceptance remain open. No completed-task entry added.

Local Ubuntu 24.04 verification passes 754 tests and the browser 68/accessibility 20 suites with
one worker. The initial default-parallel WebKit flakes remain a documented limitation; no flaky
policy or assertion was weakened. These local results do not close any production release gate.


## Operational evidence disposition — 2026-09-17

See the [operational report](../reports/verification-2026-09-16-task-008-operations.md).
The bounded observations and review inputs are complete and independently Approved; see
[review](../reports/review-2026-09-16-task-008-operations.md). Under the later approved ownership
decision, the 566.4 ms broad search, slow complete loading, physical-device/hosted readiness, and
final LCP remain open with their performance/release owner tasks rather than TASK-008. The exact
05/06 category-bound
reviewed-unverified proposal was approved on 2026-09-17 and its bounded implementation is verified. Numeric
policy calibration, empty-category approval and initial baseline remain separate gates.
No TASK-009/010 activation or deployment is implied. The prior source-PRD access blocker is closed.


## Approved reviewed-unverified continuation — 2026-09-17

Design: [reviewed-pair contract](../docs/superpowers/specs/2026-09-17-task-008-reviewed-pairs.md).

- [x] Obtain explicit approval of the exact 05/06/category acceptance contract.
- [x] Prepare bounded test research/plan and observe expected failing regressions.
- [x] Implement strict evidence-bound acknowledgment and configuration forwarding.
- [x] Verify unchanged metrics, unverified display, other quality gates and staging preservation.
- [x] Run pinned full verification and obtain independent Reviewer approval.

This continuation does not approve numerical quality policy, the empty-category list,
initial baseline, production acceptance, performance waiver or publication. TASK-008
remains incomplete until its remaining accepted gates are met.

Evidence: [verification](../reports/test-2026-09-17-task-008-reviewed-pairs.md),
[independent review](../reports/review-2026-09-17-task-008-reviewed-pairs.md).
All 161 focused tests and pinned full 797/68/20 checks pass. Aggregate-only replay removes
68 pair diagnostics while preserving all metrics and policy/baseline review requirements.

Remaining work and its ownership decision are recorded in the
[TASK-008 completion plan](../reports/plan-2026-09-17-task-008-completion.md).
