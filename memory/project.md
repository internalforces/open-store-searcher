<!--
Purpose:        Current project-state snapshot that every agent reads first
Owner:          All agents (read), Planner / Release Manager (write)
Update Trigger: When the version, milestone, status, or key constraints change
Harness Version: 1.1
-->

# Project: open-store-searcher

_Last updated: 2026-09-04_

## Summary

A free, open-source dashboard that regularly transforms Seoul local administrative licensing open data into static JSON and lets users search by business name or address in the browser, showing administrative status and supporting evidence.

## Current Status

- Version: v0.1.0-dev
- Phase: TASK-009/010 collection-date publication foundation implemented; TASK-010 active in verification; overall task and production/release gates remain open
- Next milestone: M1 — resolve TASK-008 production coverage, policy/baseline, and PRD evidence gates
- Overall health: 🟡 Caution — staged collection-date publication is implemented; real-data quality configuration, hosted execution/recovery and independent review remain unverified
- PRD: `/Users/sonmyeong-gwan/Documents/Codex/2026-08-18/new-chat/outputs/zero-cost-open-business-dashboard-prd.md`

## Technical Summary

| Item | Value |
|---|---|
| Language | TypeScript 7.0.2 on Node.js 24.19.0 LTS |
| Framework | Preact 10.29.8 + Vite 8.2.1 |
| Data storage | No runtime database; static JSON |
| Infrastructure | GitHub Pages + GitHub Actions |
| Package manager | npm 11.17.0 |
| Repository structure | Single repository and single npm package with module directories |

## Key Paths

```text
open-store-searcher/
├── AGENTS.md
├── ORCHESTRATOR.md
├── memory/
├── tasks/
├── prompts/
├── reports/
├── docs/
└── handbook/ko/    # Human-facing Korean explanations; excluded from implementation context
```

Approved source boundaries are `src/app`, `src/search`, `src/domain`, `src/pipeline`, and `src/shared`; TASK-002 created them.

## Recent Changes

| Date | Change |
|---|---|
| 2026-09-04 | User accepted ADR-014; implemented evidence-gated validation with 144 new offline tests and pinned full verification; production coverage/calibration and PRD gates remain open |
| 2026-09-04 | Activated TASK-008 on user request; prepared proposed ADR-014 and validation/test matrix, retaining explicit source-cut, threshold, baseline, and PRD evidence gates |
| 2026-09-04 | User accepted ADR-013; completed TASK-007 through test-first exact mapping, schema V2 integration, 100% mapper coverage, pinned full verification, and independent Approved review |
| 2026-09-02 | User accepted TASK-006 and requested completion; TASK-007 became the only active task, with exact status-mapping research and approval required before implementation |
| 2026-09-02 | Completed TASK-005 after independent final re-review approved `a1a018d..19a6522`, pinned full verification passed, and TASK-006 design was activated sequentially |
| 2026-08-31 | Reopened TASK-005 after PR #7 found swallowed response-cancellation failures; added typed fail-closed handling and three TDD regressions |
| 2026-08-31 | Completed TASK-005 after pinned verification and independent Reviewer APPROVED; activated TASK-006 design sequentially |
| 2026-08-31 | Remediated the fifth PR #6 review cycle and first follow-up review: awaited all unconsumed probe-body cancellations and moved `fetchedAt` validation before all collector work |
| 2026-08-30 | Remediated the fourth PR #6 review cycle by cancelling every unconsumed full-download response rejected before streaming |
| 2026-08-30 | Remediated the third PR #6 review cycle: exact staging ancestry, pre-header inactivity cancellation, fail-early manual probing, removal of the broken Docker option, and complete short-write handling |
| 2026-08-29 | Remediated the second PR #6 review cycle: shared discovery-date validation, fail-early approved Info-ZIP environment gating, malformed redirect rejection, and bounded one-byte range streaming |
| 2026-08-29 | Reproduced and fixed all five PR #6 findings: inactivity cancellation, pre-aborted processes, repository-root staging isolation, calendar-valid ZIP dates, and structured provider freshness evidence |
| 2026-08-29 | User approved one literal source filename alias; generated and revalidated the schema-only 195-entry contract against the latest official archive on Ubuntu 24.04 |
| 2026-08-28 | Implemented and fully tested the TASK-005 fail-closed staged collector; Ubuntu verified 195 preserved filenames, with 194 exact permission-title matches and one explicit alias awaiting approval before schema-contract review |
| 2026-08-28 | Completed TASK-004 after the 195-category live permission audit and Reviewer APPROVED; activated TASK-005 design |
| 2026-08-28 | Audited 195 distinct official file-data pages and verified that every selected category names the Ministry as provider and displays unrestricted permission; TASK-004 review remains before TASK-005 activation |
| 2026-08-28 | User approved ADR-009's bounded Seoul all-category ZIP candidate; PR review kept TASK-004 open until permission and attribution evidence covers every selected category |
| 2026-08-28 | Completed TASK-004 official-source research and recommended the Seoul all-category ZIP as the bounded zero-key candidate; Architect and human approval remain required before collector implementation |
| 2026-08-24 | Completed the M0 TASK-026 handbook gate after all eight documents were updated or reviewed and the user approved Korean clarity, safety terminology, and accuracy; M0 is closed and TASK-004 is next |
| 2026-08-24 | Activated TASK-026 for the M0 handbook update-or-review and human Korean-language-review gate |
| 2026-08-24 | Completed TASK-003 after independent Tester PASS and Reviewer APPROVED: the required clean install, 100% Vitest coverage, four-browser Pages-subpath smoke matrix, two zero-violation axe scans, and 302 dependency-license rows passed; TASK-026 is now the required M0 close gate |
| 2026-08-24 | Implemented and locally verified TASK-003: the fast and full command sets pass with 100% Vitest coverage, four browser smoke projects, two zero-violation axe projects, and a 302-version dependency-license report; independent gates remain pending |
| 2026-08-20 | Activated TASK-003 after user approval and approved its test-harness design |
| 2026-08-20 | Completed TASK-002 after independent Tester PASS and Reviewer APPROVED; TASK-003 and the M0 milestone handbook gate remain outstanding |
| 2026-08-20 | Approved TASK-002 and changed the project code license from Apache-2.0 to MIT through ADR-007 |
| 2026-08-20 | Approved the TypeScript, Node.js, Preact, Vite, npm, and test-stack baseline through ADR-004 |
| 2026-08-18 | Established a separate Korean human handbook, implementation-context boundary, and recurring milestone review gate |
| 2026-08-18 | Established English as the required language for all harness documentation |
| 2026-08-18 | Created the PRD-based AI Development Harness v1.1 Standard |

## Key Constraints

- Zero mandatory monthly cost and no payment method required for the default deployment
- Static hosting with no runtime server, database, or paid API
- No collection of search terms or usage behavior and no analytics, advertising, or tracking
- No automated map-page collection and no AI status determination
- Missing results, conflicts, and new status codes map to `확인되지 않음` (unverified)
- Preserve the last known-good data after validation failure
- Initial region: Seoul; code license: MIT
- Korean human explanations live under `handbook/ko/**` and are not implementation input

## Current task priority — 2026-09-05

TASK-013 completed after independent approval and source replay. Its isolated worktree is
`.worktrees/task013-quality` (`codex/task-013-search-quality`). Synthetic 28/30 and source 98/100
meet the bounded >=90% criterion with zero safety failures; full verification passed 443 tests,
8 browser tests and 2 a11y scans. No task is active; TASK-014 is next in backlog. Original dirty
TASK-008 work remains preserved/deferred/incomplete. M1/M2 and overall release gates remain open.


## TASK-014 completion — 2026-09-06

TASK-014 is complete in `.worktrees/task013-quality` on `codex/task-014-search-ui`.
Synthetic UI and browser search integration passed 478 tests, 20 browser checks and six
zero-violation accessibility scans; independent Reviewer Approved. TASK-015 is next.
Original TASK-008 work is preserved and incomplete; production and milestone gates remain open.


## Current task priority — 2026-09-07

TASK-015 initial delivery was committed as 8dc6de4 and pushed to codex/task-015-recovery-ux
for PR #16 against main. The four review findings are resolved in this branch and independently
Approved; pinned verify:full passed 530 tests, 28 browser checks and 14 zero-violation axe scans.
No task is active; TASK-016 is next. The local review checkout is .worktrees/task013-quality.
Original TASK-008 changes remain preserved/deferred/incomplete; production, milestone and
release gates stay open. See reports/review-2026-09-07-pr16.md for current evidence.


## Current task priority — TASK-016 activation, 2026-09-07

TASK-016 is active in bounded design; human design approval is pending. TASK-015 is complete.
TASK-008 remains deferred/incomplete. No production or milestone gates closed.


## Current task priority — TASK-016 completed, 2026-09-07

TASK-016 is complete with independent Approved review and pinned verification (553 tests,
32 browser checks, 16 zero-violation axe scans). Implementation lives in the reused
.worktrees/task013-quality checkout on codex/task-016-map-links; delivery is user-authorized. No task is active; TASK-017
is next. TASK-008 remains deferred/incomplete; production, milestone and release gates remain open.


## TASK-018 activation — 2026-09-08

User requested activation and execution. TASK-018 is the sole active task, in bounded design
pending the brainstorming skill's explicit human approval gate. Audited PRD 14.2, performance,
implementation/testing/review prompts and the existing synthetic loader and linear candidate
search. Reuse .worktrees/task013-quality at 1b570a2; preserve original dirty TASK-008 work.
Proposed existing-tool local bundle/mobile display/search-to-render and synthetic scale
measurements, with preparation/data-size diagnostics and explicit production limitations.
No production dataset/partition contract is available; do not infer production performance
from demo or synthetic measurements. TASK-008 remains explicitly on hold until a new user
request. No code, tests, dependencies, public contracts, commit, push or deployment changed.


## TASK-018 bounded performance audit complete — 2026-09-08

User activated TASK-018 and approved its bounded measurement design. Implemented local
performance/performance:check commands using existing Vite/Playwright, a separate real-App
benchmark entry, deterministic 1,000/10,000/50,000-record synthetic fixtures and 16 helper/
fixture unit tests. No product source, dependency, delivery/interface/status contract or
workflow changed. Implementation is uncommitted on codex/task-018-performance in the reused
.worktrees/task013-quality checkout; original dirty TASK-008 work is preserved.

All approved audit acceptance criteria are satisfied: code assets and <=300,000-byte budget;
primary/LCP cold/warm measurements under explicit mobile CPU/network conditions; loaded-search
submission/display and separate preparation/search diagnostics; fixture/code hashes and raw
sample summaries; UTF-8 data sizes and partitioning implications; complete verification and
independent review. End-to-end rendering above 1,000 candidates is explicitly unavailable,
not passed. This resource limit affects only the audit harness, not product results.

Bundle: 47,806 bytes. Mobile primary max: 701.2 ms; LCP max: 668 ms. Search targets are NOT met:
mobile 1,000-candidate address display reaches 1,478.4 ms and mobile 50,000-record common-name
display reaches 2,488.4 ms. Five search cells exceed targets, eight are unavailable and eleven
pass. `labTargetsMet=false` and `productionVerified=false`. The --check command correctly
exits 1; production/rendering/partitioning release gaps stay open in memory/known-issues.md
for Performance Engineer / Implementer remediation and TASK-021 acceptance.

Pinned verify:full exits 0: 580 Vitest tests, 56 browser checks, 18 accessibility tests / 22
zero-violation axe scans. Independent Reviewer Approved; reran 16 focused tests and verified
82 source hashes plus 80 metric groups. All measured hashes still match after full verification.
Reports: reports/performance-2026-09-08-task-018.md, matching JSON, and
reports/review-2026-09-08-task-018.md. No performance-success, production, milestone or release
gate is closed. No task is active; TASK-019 remains next in backlog. TASK-008 remains explicitly
on hold until a new user request. No handbook access, commit, push, merge or deployment occurred.


## TASK-018 optimization continuation — 2026-09-08

User requested search computation optimization and partitioned loading after the audit.
Reopened only TASK-018; its prior bounded audit remains completed historical evidence.
Inspected actual search loops, index projection/filtering, App default demo imports, loader
lifecycle and PRD 12.2/14.2. Prepared bounded same-semantics computation changes and a
query-independent, fixed-order partition loader integrated with current synthetic assets.
The existing loader allows atomic full-snapshot preparation and retained-data failure behavior.
Proposed chunking reduces initial code work but not total data download; all required parts
remain necessary before a new snapshot becomes searchable. Query-dependent region requests
and partial search would require different privacy/completeness decisions and are not assumed.
Concrete design awaits the brainstorming skill's explicit approval. No source/test/config
changed in this preparation pass. Preserve audit outputs, uncommitted work and TASK-008 hold.
No candidate pagination, production publication schema, dependency, commit, push or deployment
was added. Performance and release acceptance remain open; TASK-019 is not activated.


## TASK-018 optimization continuation complete — 2026-09-08

The user approved and requested execution of the bounded continuation. Search now avoids
unnecessary grapheme/fallback work and caches address tokens without changing full results.
The current browser loads three synthetic JSON assets after shell paint in fixed batches of
at most two, independent of input. Complete validation precedes atomic replacement; failed
and obsolete loads are cancelled and accepted data is retained. All approved implementation
acceptance criteria are complete. No implementation task is active; TASK-019 is not activated
and TASK-008 remains explicitly on hold.

Pinned verify:full passed 594 Vitest, 64 browser and 18 accessibility tests, with 22 zero-violation
axe scans. Full-field baseline equivalence passed 4,484 queries. Independent review approved
and reran 17 focused cases; all 91 measured source hashes and 80 raw metric groups match.
Mobile 50,000-row maximum search computation improves from 1817.6 to 146.6 ms. Common-name
display improves from 2488.4 to 690.2 ms and absent-result display from 1535.5 to 69.8 ms.

Performance acceptance remains open: three display cells exceed 500 ms and eight are unavailable
above the unchanged 1,000-card harness cap; thirteen pass. Mobile 1,000-row address display is
1410.8 ms. Initial code increases from 47,806 to 48,118 bytes, plus 5,331 deferred JSON bytes;
mobile cold search readiness increases from 701.2 to 1078.2 ms, still under 2.5 s. All data is
still downloaded. labTargetsMet=false and productionVerified=false; performance:check correctly
exits 1. Production delivery and release gates remain open, and the prior audit stays immutable.

Evidence in .worktrees/task013-quality: reports/performance-2026-09-08-task-018-optimized.md,
matching JSON, reports/equivalence-2026-09-08-task-018.json and
reports/review-2026-09-08-task-018-optimized.md. Implementation remains uncommitted on
codex/task-018-performance in the reused worktree. Original TASK-008 changes were preserved.
No dependency, source/status contract, handbook, commit, push, merge or deployment was added.


## TASK-018 result-page target achieved — 2026-09-08

User explicitly approved 20-item similar-candidate pagination to achieve the remaining 500 ms
large-result display target. Implemented bounded pages, full-count/range, first/previous/next/last
navigation, preserved ranking/uncertainty/absolute positions, keyboard focus/status and reset
on each submission. No candidate is discarded and page changes make no network requests.

Pinned verify:full exited 0:598 Vitest,68 browser and 20 accessibility tests;26 zero-violation
axe scans. Independent Reviewer approved, reran 4 focused cases, and verified 92 source hashes
and 96 raw metric groups. A names-only measurement oracle was corrected to include distinct
addresses and absolute positions; provisional results were excluded and final measurement rerun.

Final performance:check exited 0: all 24 search cells/120 samples and 16 applicable navigation
groups/320 samples pass 500 ms. Mobile maximum full-search-to-first-page 182.8 ms; page transition
46.9 ms. Formerly skipped large-result searches now run with full-result-count and ordered
card identity assertions. labTargetsMet=true; productionVerified=false. Initial code 49377 bytes
and mobile cold readiness 1071.9 ms pass existing budgets. Historical reports remain immutable.
This is complete search plus a visible page, not simultaneous full-result DOM construction.

Evidence in the reused .worktrees/task013-quality checkout:
reports/performance-2026-09-08-task-018-paginated.md, matching JSON and
reports/review-2026-09-08-task-018-paginated.md. All approved continuation criteria are complete.
No implementation task is active; TASK-019 remains unactivated and TASK-008 remains on hold.
Production data/download/index and release gates remain separate. Work is uncommitted on
codex/task-018-performance; no push, merge, deployment, dependency or handbook change occurred.

## TASK-009/010 current priority — 2026-09-12

User requested publication pipeline work. TASK-009 is active in design/prerequisite resolution
on codex/task-009-010-publication; TASK-010 follows sequentially. The concrete design is in
[the publication specification](../docs/superpowers/specs/2026-09-12-task-009-010-publication-design.md).
TASK-008 remains held pending an explicit answer to the resumption question. No production,
Actions-security, milestone or release gate is closed by this preparation.

## Collection-date publication state — 2026-09-12

The user authorized collection-date operation while keeping real-data criteria deferred.
The local publication foundation and Actions files are implemented; TASK-010 is active in
verification. Pinned checks pass 636 tests and 20 accessibility tests. Full verification retains
two Windows WebKit failures reproduced on unchanged ec6bb6f (66/68 browser checks pass).
Quality config, actual hosted ingestion/deployment/recovery and independent review remain open.
See reports/test-2026-09-12-task-009-010.md. TASK-009/010/019 and release gates are not complete.

## TASK-009/010 current verification — 2026-09-12

Draft PR #21 and approved Ubuntu CI run 34691119664 establish passing pinned full verification:
638 Vitest, 68 browser and 20 accessibility tests. The previous full-suite blocker is superseded
by this runner evidence; Windows WebKit native-link skipping remains diagnosed separately.
TASK-010 stays the sole active task. Both overall tasks remain incomplete for held quality/bootstrap
work, independent review, deployment protection and actual publication/recovery/history.
See reports/test-2026-09-12-publication-hosted.md and the companion settings assessment.

## Current priority: quality review resumed — 2026-09-12

User explicitly resumed TASK-008 production quality/bootstrap review. It is the sole active
task; TASK-009/010 are paused sequentially. Ubuntu ZIP filename corruption is fixed and hosted
full verification passes 639/68/20. Actual CP949 source data exposed a native Node decoding
gap; the build-only iconv-lite proposal is awaiting approval. Complete metrics/baseline and
production/independent/hosted-recovery gates remain open. See
reports/research-2026-09-12-quality-resumption.md. Earlier hold statements are historical.

CP949 update (2026-09-12): user-approved strict decoder is implemented and Ubuntu 647/68/20
verification passes. Actual 127-category observation hit the 6144 MiB heap; complete bounded
inventory attempts then failed at provider connection. Production quality/bootstrap and
TASK-009/010 remain incomplete. See reports/test-2026-09-12-cp949.md.
