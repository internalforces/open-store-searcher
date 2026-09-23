<!--
Purpose:        Current session state and handoff for the next agent
Owner:          Currently active agent
Update Trigger: Read at session start and update before session end
Harness Version: 1.1
-->

# Current Session — open-store-searcher

_Last updated: 2026-09-23_

## TASK-008 Daily Calibration — 2026-09-23

The seventh distinct current observation completed through the bounded Ubuntu 24.04 path at
`0ad74d9`. It parsed 2,943,368 rows across all 195 categories from archive
`09f4b26d7bdb67f140cfb2428bbf41833945276dc98988033aa2419306a9c784`; the verified archive and
complete execution log remain outside Git. Compared with 2026-09-22, total rows increased by 555,
no category total decreased, and 23 categories contain negative display-status transitions that
are retained for calibration review. All 187,568 unknown-pair rows remain inside the approved
exact 68-scope contract. No policy, allowed-empty list, baseline, publication, or deployment was
accepted. Continue the approved non-publishing interval from `codex/task-008-calibration`.

## TASK-008 Daily Calibration — 2026-09-22

The sixth distinct current observation completed through the bounded Ubuntu 24.04 path at
`a514790`. It parsed 2,942,813 rows across all 195 categories from archive
`4499866d702a449eef6478f2221d45f35ecaa36c23164e789a8a39eb1ea0d7d1`; the verified archive and
complete execution log remain outside Git. Compared with 2026-09-21, total rows increased by four,
no category total decreased, and three categories contain negative display-status transitions
that are retained for calibration review. All 187,498 unknown-pair rows remain inside the approved
exact 68-scope contract. No policy, allowed-empty list, baseline, publication, or deployment was
accepted. Continue the approved non-publishing interval from `codex/task-008-calibration`.

## TASK-008 Daily Calibration — 2026-09-21

The fifth distinct current observation completed through the bounded Ubuntu 24.04 path at
`1c652bb`. It parsed 2,942,809 rows across all 195 categories from archive
`b91012e54cd62a500fac6194f81ee25cfe8d98f5193515174207ce6d678170f5`; the verified archive and
complete execution log remain outside Git. Compared with 2026-09-20, total rows increased by
seven, no category total decreased, and three categories contain negative display-status
transitions that are retained for calibration review. All 187,498 unknown-pair rows remain inside
the approved exact 68-scope contract. No policy, allowed-empty list, baseline, publication, or
deployment was accepted. Continue the approved non-publishing interval from
`codex/task-008-calibration`.

## TASK-008 Daily Calibration — 2026-09-20

The fourth distinct current observation completed through the bounded Ubuntu 24.04 path at
`eda7ebd`. It parsed 2,942,802 rows across all 195 categories from archive
`a516963f2b591b4eb09ade634ac8f4bd86336009ac31a5610a6d98ae32f28113`; the verified archive and
complete execution log remain outside Git. Compared with 2026-09-19, total rows increased by 398,
no category total decreased, and 20 categories contain negative display-status transitions that
are retained for calibration review. All 187,498 unknown-pair rows remain inside the approved
exact 68-scope contract. No policy, allowed-empty list, baseline, publication, or deployment was
accepted. Continue the approved non-publishing interval from `codex/task-008-calibration`.

## TASK-008 Daily Calibration — 2026-09-19

The third distinct current observation completed through the bounded Ubuntu 24.04 path at
`22b6cb4`. It parsed 2,942,404 rows across all 195 categories from archive
`cfd7058f5b3fb1c752fabf94e8bc17e74ceb3c12bbbb5a3f2cfcda0ac881d16f`; the verified archive and
complete execution log remain outside Git. Compared with 2026-09-18, total rows increased by 463,
no category total decreased, and 30 categories contain negative display-status transitions that
are retained for calibration review. All 187,454 unknown-pair rows remain inside the approved
exact 68-scope contract. No policy, allowed-empty list, baseline, publication, or deployment was
accepted. Continue the approved non-publishing interval from `codex/task-008-calibration`.

## TASK-008 Daily Calibration — 2026-09-18

The second distinct current observation completed through the bounded Ubuntu 24.04 path at
`32c1809`. It parsed 2,941,941 rows across all 195 categories from archive
`b183ddd70db99508bd01c34bf00ab41612a9378ab8189b4bf2e2ca7ac8d1d729`; the verified archive and
complete execution log remain outside Git. Compared with 2026-09-17, total rows increased by 488,
category `15045026` decreased by one row, and nine categories contain administratively operating
decreases. All 187,396 unknown-pair rows remain inside the approved exact 68-scope contract.
No policy, allowed-empty list, baseline, publication, or deployment was accepted. Continue the
approved non-publishing interval from the isolated `codex/task-008-calibration` branch; retain the
decrease and status corrections for the final evidence-bound proposal and review.

## Current TASK-008 Session

### macOS continuation delivery

The user confirmed that the previous Ubuntu Docker environment was on their Mac and explicitly
requested committing, pushing, and opening a PR for continuation there. Deliver the current
verified implementation and investigation on `codex/task-008-planning`, with `main` as the PR
base. Keep the PR in draft while TASK-008 production evidence and PRD gates remain open.

Implementation commit `d3e1825` was pushed to origin. Draft
[PR #12](https://github.com/internalforces/open-store-searcher/pull/12) is the continuation PR.

On the Mac, fetch this branch and preserve any existing local edits before switching. Read the
normal context-loading sequence, then inspect the existing Docker context, containers, images,
and mounts to identify the Ubuntu 24.04 environment. Container identity and current health are
still unverified. The removed `--docker-container` probe option is not supported: use the normal
probe within a compatible Linux environment with correct repository/staging visibility and pass
the existing environment gate before provider requests. Check the original PRD path recorded in
`memory/project.md`, then resolve the observation-path and production-evidence gates documented
in `reports/research-2026-09-04-task-008-completion-gates.md`. TASK-009 remains inactive.

### Remaining-work follow-up

The user requested completion of the remaining gates. Read-only investigation is recorded in
`reports/research-2026-09-04-task-008-completion-gates.md`. Local document directories and Git
history did not provide the original PRD. The existing collector adapter returned `{ "ok": false }`;
WSL is not installed, and the configured Ubuntu VM is powered off and not the verified 24.04
baseline. GitHub returned no workflow runs or artifacts. Current official metadata still does
not prove an archive-bound shared source cut. No production facts or approvals were invented.

The schema-only probe deletes its archive and cannot produce calibration metrics. A reviewed
row-observation path is required to resolve the TASK-008/TASK-009 dependency explicitly. The user
was asked for the original PRD location and previous Ubuntu access. In the follow-up, the user
recalled local Docker. History confirms a Docker probe option added on August 28 and removed
on August 30 because its host/container staging paths were not supported. The current Windows
host has no discovered Docker CLI, Desktop installation/configuration, process, service, or
configured Docker environment variables. Historical records identify macOS development and
successful Ubuntu 24.04 checks but no actual container name. The user subsequently confirmed
that the Docker host was their Mac; no environment was started or installed on Windows.
TASK-008 remains active and incomplete. No source code, runtime, dependency,
workflow, production data, or previously verified result changed in this follow-up.

### Verified implementation handoff

- Date: 2026-09-04; roles: Implementer / Tester, with independent helper and Reviewer agents.
- Request: Execute TASK-008; user explicitly approved ADR-014 after the design was presented.
- Branch: `codex/task-008-planning`; preserved pre-existing planning notes and design edits.
- Implemented: staged refresh validator, metrics and runtime guards, shared Seoul calendar
  freshness helper, and separate UTF-8 JSON syntax/byte-limit helper. All are offline and do not
  publish, mutate a baseline, infer unsupported source-cut dates, or change status mappings.
- Test-first evidence: missing-module red runs; review regressions reproduced sparse-array and
  corrupted-collision acceptance plus malformed-policy precedence before fixes.
- Verification: pinned Node.js 24.19.0/npm 11.17.0 `npm run verify:full` exited 0: 362 Vitest
  tests passed, two existing Windows Info-ZIP skips, four browser tests, two zero-violation
  accessibility scans. 144 tests are new. Mapper and shared freshness coverage remain 100%.
- Independent Reviewer: Approved bounded implementation, independently reran all 144 TASK-008
  tests. Three review findings resolved. No new known code issue remains.
- Evidence: `reports/test-2026-09-04-task-008.md`,
  `reports/review-2026-09-04-task-008.md`, accepted validation design, and .testagent records.
- TASK-008 is still the only active task. Remaining gates: production source-cut evidence across
  all 195 categories, measured/approved policy and bootstrap baseline, and original PRD access
  or explicit authoritative-baseline direction. The previous request for the PRD path is unanswered.
- No completed-ledger entry was added because TASK-008 is not complete. TASK-009 is not activated;
  it owns production parser integration, exact public artifact-byte binding and atomic recovery.
- No dependencies, workflows, public identifiers, production data, deployment, or handbook
  changes were made. Commit/push/PR delivery was subsequently authorized above. M1 closure is
  not reached.
- Final `git diff --check` and scoped new-file whitespace checks passed; status was inspected.

## Previous TASK-007 Session Information

- Date: 2026-09-04
- Roles: Implementer / Tester, with an independent Reviewer
- Goal: Implement accepted ADR-013 using tests first, reach 100% mapper file coverage, and pass full verification.
- Branch: `codex/task-007-status-mapping`, created from `codex/task-006-implementation` while preserving pre-existing TASK-006 acceptance and TASK-007 design edits.

## Completed This Session

- [x] Recorded the user's explicit `accept` as ADR-013 approval before implementation.
- [x] Added failing domain and transformer tests before production changes.
- [x] Implemented exact aggregate-pair mapping in a pure domain module, retaining all raw evidence.
- [x] Added processed status to transformation schema V2; identity and normalization stay V1.
- [x] Passed 86 unit tests and 131 pipeline tests; two existing Windows Info-ZIP tests remain skipped.
- [x] Passed pinned Node.js 24.19.0/npm 11.17.0 full verification: lint, format, typecheck, 218 passing Vitest tests, build, four browser smoke tests, and two accessibility scans.
- [x] Confirmed mapper statement, branch, function, and line coverage of 100% and enforced the exact-file threshold.
- [x] Obtained independent Reviewer Approved with no material findings.
- [x] Moved TASK-007 to the completed ledger and updated architecture, traceability, decisions, and issue notes.

## Evidence

- `reports/test-2026-09-04-task-007.md`
- `reports/review-2026-09-04-task-007.md`
- `.testagent/research.md`, `.testagent/plan.md`, `.testagent/status.md`
- `coverage/domain/index.html` (local generated coverage)

## Previous TASK-007 Handoff (Superseded by Current TASK-008 Session)

TASK-008 validation design is next in the backlog; no implementation task is active.
Define conservative freshness and validation policies before implementation and obtain human
approval for any newly gated choice. Status-distribution validation, `dataAsOf`, publication,
public identifier text and share URLs remain outside TASK-007.

## Historical Post-Merge Planning Assessment (Before Activation)

The user reported PR #11 merged and requested identification of the next task. GitHub confirmed
merge commit `72a8eab` on 2026-09-04. Planning notes are on `codex/task-008-planning`, based on
the merged main branch. TASK-008 remains unactivated; no implementation started.

- Next: TASK-008 validation design, M1, High priority, size L; FR-08, FR-13, FR-14.
- Define validation input/output and rejection diagnostics using the accepted collector evidence
  and transformation schema V2. Reuse existing header, identity, and exact-status checks.
- Resolve conservative `dataAsOf` derivation, source-date/timezone semantics, and the boundary
  before/at/after seven days. Retrieval time alone must not become the data as-of date.
- Define total/category count changes, required-value/missing-value rules, duplicate identity
  handling, unknown status diagnostics, JSON validity/byte limits, and first-run baseline behavior.
- Distinguish an unverified record from an invalid refresh; ADR-013 mapping must remain unchanged.
- Do not invent numerical thresholds. Record evidence, proposed policy, and any approval gates
  before implementation. Publication and last-known-good replacement remain TASK-009; Actions
  integration remains TASK-010.
- Resolve the unimplemented upstream CSV row-parser boundary and the TASK-009-owned collision
  and malformed-input policies before expanding TASK-008 scope.
- The source PRD path recorded in memory/project.md is unavailable on this Windows host, and no
  source PRD copy was found among repository PRD-named files. Use current traceability for this
  assessment; locate the authoritative PRD before claiming exact design acceptance against it.
- Next deliverable: an English validation design with a requirements/test matrix, then test-first
  implementation and full verification after gated decisions are resolved.

## Important Context

TASK-006 had already been accepted; remote inspection confirmed PR #9 and PR #10 were merged
into main on 2026-09-02. After TASK-007 verification, the user explicitly requested commit,
push, and PR creation. Delivery uses `codex/task-007-status-mapping` with main as its PR base.
No TASK-007 merge, deployment, dependency/workflow change, production-record operation, or
Korean handbook access is authorized by that delivery request.
The approved V1 mapper deliberately ignores detailed status fields, even when they differ from
aggregate evidence; later refinements require official evidence and new human approval.
M1 remains open and its Korean handbook review gate has not been reached.

## TASK-012 isolated PR delivery — 2026-09-05

The user authorized commit, push and PR creation after TASK-012 approval. Created a dedicated
worktree and branch codex/task-012-candidate-search from origin/main (095683a). Copied only the
reviewed TASK-011 normalization prerequisite and TASK-012 engine/tests/design, with search-owned
harness updates. Unrelated TASK-008 code, decoder dependency, reports and local state remain in
the original checkout, untouched. Historical 557/581 test counts in the imported reports describe
that original integration worktree, not this baseline. The delivery report records isolated checks.
No implementation task is active; TASK-013 is next, TASK-008 stays deferred/incomplete. No deployment,
merge, new dependency, public schema, production data or handbook changes are included.

Isolated delivery verification passed on the actual PR contents: unchanged-lockfile clean install,
399 tests, eight browser tests and two accessibility scans. Search implementation/test bytes match
the independently approved original; see reports/delivery-2026-09-05-task-012.md. The user authorized
pushing this branch and creating the PR against main. No merge or deployment is authorized here.

## TASK-013 activation — 2026-09-05

Activated on explicit user instruction in the isolated task013-quality worktree from merged main.
Original dirty TASK-008/TASK-011/TASK-012 work is preserved. The offline fixture/evaluator design
uses the accepted engine unchanged; provenance and realistic recall evidence remain explicit gates.

## TASK-013 implementation checkpoint — 2026-09-05

User requested activation and implementation. Worktree `.worktrees/task013-quality`, branch
`codex/task-013-search-quality`, starts from merged PR #13 (`ea75673`) and preserves all original
uncommitted integration changes. Added 24 synthetic records / 42 cases, strict offline evaluator,
deterministic hash/runtime-bound CLI and 32 unit/CLI tests. Pinned verify:full exited 0: 431 tests,
eight browser tests and two zero-violation accessibility scans. Independent Reviewer Approved
for the bounded harness; reports/test-2026-09-05-task-013.md and review-2026-09-05-task-013.md
in that worktree contain exact evidence.

Exact Top-3 recall is 25/30 (83.3333%), safety failures zero; --check correctly exits 1. Misses:
two address-like business-name suffix cases, two excluded identical licensing ties, one address-like
name. Every miss remains labeled. The user was asked for the earlier source test list; none arrived.
TASK-013 stays active for reviewed source-sample/annotation evidence and >=90% acceptance; it has
not moved to completed.md. TASK-008 stays deferred/incomplete, TASK-014 is not activated, and no
milestone closes. No production engine, source/status contract, dependency, public interface,
workflow, deployment, commit, push or handbook change occurred.

## TASK-013 completion verification — 2026-09-05

The user explicitly requested completion. Preserved all synthetic labels and acquired a reviewed
100-target, 25-district source restaurant sample with 2,803 candidates. Independent replay confirmed
source identity/projection, targets/backgrounds, hashes and final comparator closure. Address
interpretation fixes improve synthetic 25/30 -> 28/30 and source 39/100 -> 98/100, safety zero.
Source parser diagnostics and before reports remain bound, not overwritten with favorable numbers.
Pinned verify:full passed 443 tests, eight browser tests and two zero-violation a11y scans; both
numeric quality checks are now included. Final Reviewer verdict/completion transition is in progress.
TASK-008 remains deferred/incomplete; no milestone, deployment, status/public interface or dependency
change occurred. Work remains isolated in `.worktrees/task013-quality`; original dirty work is preserved.

## TASK-013 completed — 2026-09-05

Final independent Reviewer Approved and all requirements for bounded TASK-013 are satisfied.
Moved TASK-013 to tasks/completed.md; no implementation task remains active. Work is in
`.worktrees/task013-quality` on `codex/task-013-search-quality`, preserving original dirty work.
The reviewed fixed corpora score synthetic28/30 (93.3333%) and source98/100 (98%), safety zero.
Pinned verify:full passed 443 tests, eight browser tests and two zero-violation a11y scans.
The accepted 216,223,358-byte research ZIP and its owned staging root were removed after
independent source replay; cleanup evidence is in reports/source-2026-09-05-task-013-collection.json.
TASK-014 is next, not activated. TASK-008 and all production freshness/publication, UI, performance
and release gates remain separate. No dependency, workflow permission, deployment, commit, push,
status mapping/public identifier or Korean handbook changes occurred. No milestone closed.

## TASK-013 PR delivery authorization — 2026-09-05

The user authorized committing, pushing, and creating a PR for the completed TASK-013 work.
Delivery uses the isolated `codex/task-013-search-quality` branch from `ea75673`, which still
matches `origin/main` at delivery preparation. The final reviewed implementation and fixed
quality evidence are unchanged since the successful pinned verify:full run. Original integration
checkout changes remain outside this commit. The PR targets main; merge and deployment are
separate actions.


## PR #14 review remediation — 2026-09-05

User authorized implementation, commit and push on the existing PR branch. All three findings
were reproduced and fixed in the isolated task013-quality worktree. Original dirty integration
work remains untouched. Address-only locality annotations and adjacent floor/unit notation now
preserve medium Top-3 eligibility; source measurement rejects mismatched audit bindings before
reporting any result. Fixed fixture/audit bytes and labels remain unchanged.
Pinned verify:full passed 455 tests, eight browser tests and two accessibility scans; synthetic
28/30 and source98/100 with zero safety failures. Evidence: reports/review-2026-09-05-pr14.md and
its two hash-bound quality reports. Independent Reviewer Approved after resolving the floor-before-locality interaction; TASK-014
is not activated. Commit/push delivery is authorized to `codex/task-013-search-quality` for PR #14;
no merge or deployment is included.


## TASK-014 completed — 2026-09-06

The user approved the written design and requested implementation. Reused the clean
.worktrees/task013-quality worktree on new branch codex/task-014-search-ui from fetched
merged main 9160d5 (tree-identical to reviewed TASK-013 head 5b9b2d5). Original dirty
TASK-008 work remains preserved. Implemented a local Preact search form, engine-driven
primary/top/similar groups, four-status evidence cards, all original lifecycle fields,
explicit synthetic coverage/provenance, basic responsive CSS and accessible announcements.

Pinned Node 24.19.0/npm 11.17.0 verify:full exited 0: 478 tests, 20 browser tests, 6 axe scans
with zero violations. Independent Reviewer Approved after focused reruns. Desktop/mobile
screenshots were inspected. Evidence: reports/test-2026-09-06-task-014.md and
reports/review-2026-09-06-task-014.md in the TASK-014 worktree.

TASK-014 is complete; no task is active. TASK-015 is next under the accepted M2 priority.
TASK-008 remains deferred/incomplete; TASK-009/010 production gates, TASK-016 map links,
TASK-017 fuller accessibility, and M1/M2/release closure remain open. Demo data is wholly
synthetic and must not be used to determine an actual business status. No dependencies,
source/status contract, public serialization, workflow, commit, push, deployment or handbook
change occurred. Keep the uncommitted TASK-014 implementation in the reused worktree.


## TASK-014 delivery authorization — 2026-09-06

User explicitly authorized commit, push and PR creation. Rechecked fetched origin/main
at 9160d5, reviewed source/test/runtime manifest equality, and reran pinned verify:full
successfully: 478 Vitest tests, 20 browser tests and 6 zero-violation axe scans.
Log: /tmp/task014-pr-verify-full.log. Delivery scope is only TASK-014 in the reused
worktree on codex/task-014-search-ui; original dirty TASK-008 work remains untouched.
Create the PR against main. Merge, release tags and deployment remain unauthorized.


## PR #15 review remediation — 2026-09-06

User authorized review fixes, commit and push. Resolved five findings: >=7 Seoul-day warnings,
shared midnight/focus/visibility clock, repeat live-region announcements, obsolete invalid
state clearing, missing-name fallback, and dataset-level provenance visible without cards.
The current user-provided ADR-015 boundary supersedes the older merged AGENTS wording;
aligned the invariant but preserved V1 pipeline helper behavior. No dependency/public schema,
source mapping, workflow, production deployment or handbook change.
Pinned verify:full passed 492 tests, 24 browser tests and 8 zero-violation axe scans.
Independent re-review Approved after 38 component tests and typecheck. Evidence:
reports/review-2026-09-06-pr15.md and reports/pr15-verification-manifest.json.
TASK-014 is complete again; TASK-015 is next and TASK-008 remains deferred/incomplete.


## TASK-015 activated — 2026-09-07

User requested activation and execution. TASK-015 is the only active task; TASK-008 remains
preserved/deferred/incomplete. Reused the clean `.worktrees/task013-quality` checkout on
`codex/task-015-recovery-ux` from merged main `d594ccc`, whose tree matches reviewed `497c86b`.
Inspected existing UI, task contracts and original PRD sections 11.3/11.4. Existing UI already
covers basic empty/uncertain results, persistent provenance and >=7 Seoul-day warnings.
The remaining work is internal loader/retry state, usable-data preservation, malformed-record
exclusion and actionable guidance. A bounded design is presented in chat for the brainstorming
skill's explicit pre-implementation approval gate. Activation and investigation are complete;
implementation and verification remain pending. No source code, dependency, public schema,
status mapping, workflow, production data, handbook, commit, push or deployment changed.


## TASK-015 completed — 2026-09-07

The user approved the bounded recovery design and requested implementation. Completed in
`.worktrees/task013-quality`, branch `codex/task-015-recovery-ux`, from merged PR #15 d594ccc.
Implemented injected internal synthetic loading, failure/retry guidance, query-free issue link,
in-memory usable-data preservation, malformed/duplicate exclusion and diagnostics, and actionable
empty/low-confidence guidance. Actual browser load time is distinct from verified coverage;
synthetic provenance and >=7 Seoul-day warnings remain intact. No public delivery schema exists.

Pinned Node 24.19.0/npm 11.17.0 `npm run verify:full` exited 0: 522 tests, 28 cross-browser
checks, 10 accessibility tests / 14 axe scans with zero violations. Independent Reviewer Approved
and final delta approval; corrected its nonblocking keyboard-comment finding. Inspected 320px
loading, initial failure and retained-data screenshots. See reports/test-2026-09-07-task-015.md,
reports/review-2026-09-07-task-015.md and reports/task015-verification-manifest.json in the worktree.

TASK-015 is complete; no task is active. TASK-016 is next. TASK-008 remains deferred/incomplete;
production freshness/publication and TASK-017 comprehensive accessibility remain separate gates.
No milestone closed; no manual screen-reader signoff is claimed. Original dirty work is preserved.
No dependency, status mapping, public identifier, workflow, commit, push, deployment or handbook
change occurred. All TASK-015 implementation is uncommitted in the reused worktree.


## TASK-015 PR delivery authorization — 2026-09-07

User explicitly authorized committing, pushing and creating the TASK-015 PR against main.
Delivery uses the existing codex/task-015-recovery-ux branch in .worktrees/task013-quality.
The independent Approved source/test/runtime manifest matches. Fresh pinned verify:full exited 0: 522 tests, 28 browser checks and 14 zero-violation axe
scans. Log: /tmp/task015-pr-verify-full.log. Preserve original dirty integration work and this worktree.
Merge and deployment are outside this authorization.

## PR #16 remediation authorization — 2026-09-07

Initial TASK-015 delivery was committed and pushed as 8dc6de4, with PR #16 open against main.
The user authorized review fixes, commit and push. Reopened only TASK-015 for the four findings:
blank record attribution, obsolete cancelled preparation, duplicate index work, and stale delivery
records. Original dirty integration work remains untouched; TASK-016 is not activated.
Focused RED/GREEN confirms blank labels are excluded, cancelled payloads are not read, and the
single prepared index supports real search with unchanged exclusion diagnostics. The focused
component suite passes 76 tests and typecheck passes. Full verification and independent re-review
are in progress. No dependencies, source/status rules, public interfaces or workflow changes.

## PR #16 remediation completed — 2026-09-07

Resolved all four findings with reproduced regressions and independent Approved re-review.
Fresh pinned verify:full exited 0: 530 tests, 28 browser checks, 14 zero-violation axe scans;
reviewer independently passed 38 focused tests. Report: reports/review-2026-09-07-pr16.md.
The initial delivery is committed/pushed as 8dc6de4, PR #16; these review corrections are ready
for the user-authorized commit/push on the same branch. This checkpoint supersedes historical
uncommitted-work wording. TASK-015 is complete again; no task is active, TASK-016 is next.
Original dirty work is preserved. No merge/deployment or production contract change occurred.


## TASK-016 activated — 2026-09-07

The user requested activation and execution. TASK-016 is the sole active task, in bounded
pre-implementation design. Inspected FR-10 and the existing ResultCard/SearchResults/display
contracts. The existing delivery checkout was clean; origin/main c29e405 is tree-identical to
reviewed TASK-015 head 4428d81. No branch switch or new worktree was needed for preparation.
Original dirty TASK-008 work remains preserved.

Prepared the record-only name/address search design, missing-field fallback, explicit new-tab
labels/protection, synthetic suppression and test boundaries in tasks/active.md and chat.
Official Kakao documentation confirms its HTTPS search route. Official Naver documentation
confirms the app-only scheme, but does not establish the proposed HTTPS web search route;
recorded that compatibility limitation for explicit resolution/acceptance. No headless map
inspection occurred. The brainstorming skill requires human approval of the concrete design
before implementation; approval is pending. Only task/session/project/traceability documents
changed. No implementation, test run, commit, push, deployment or milestone closure occurred.


## TASK-016 implementation handoff — 2026-09-07

Implemented approved record-derived Naver/Kakao HTTPS search links, road/parcel fallback,
strict encoding and unusable-term omission, protected native new tabs, candidate-specific
uncertainty/evidence and synthetic coverage/loader suppression (FR-10; FR-07/09/12).
User explicitly approved the Naver web-route compatibility limitation. No official Naver HTTPS
route guarantee or live provider search verification is claimed.

Pinned verify:full passed 553 tests, 32 browser checks and 16 zero-violation axe scans.
Focused map unit/component suite passed 34 tests. Independent Reviewer Approved; all findings
resolved. Reviewed 320px screenshot. Reports: reports/test-2026-09-07-task-016.md and
reports/review-2026-09-07-task-016.md in .worktrees/task013-quality.

TASK-016 acceptance is complete: provider research/accepted limitation, human design approval,
implementation, encoding/missing fields/protected tabs, synthetic suppression, privacy/evidence,
keyboard/layout/a11y/full checks and independent review. No task is active; TASK-017 is next.
TASK-008 remains deferred/incomplete; no production, milestone or release gate closed.
Implementation is uncommitted in .worktrees/task013-quality on codex/task-016-map-links.
No dependencies, source/status/public identifier/workflow, commit, push, deployment or handbook
change occurred. Original dirty TASK-008 work is preserved.


## TASK-016 delivery authorization — 2026-09-07

The user authorized commit, push and PR creation. The reviewed source/test/config manifest
still matches every current file; final pinned verification remains 553 tests, 32 browser
checks and 16 zero-violation axe scans with independent Approved review. Freshly fetched
origin/main and the branch baseline both remain c29e405, with no existing branch PR.
Deliver TASK-016 only on codex/task-016-map-links against main. Earlier uncommitted-state
notes describe the implementation handoff before this delivery authorization. No merge or
deployment is authorized by this step; original dirty TASK-008 work remains preserved.


## PR #17 evidence-link correction — 2026-09-07

User authorized review remediation, commit and push. Reviewed comment 3949635920 on
f863439 and confirmed the P2 finding: FR-10 directed fresh-checkout reviewers to an
untracked local worktree instead of committed reports. Updated the evidence column to
relative Markdown links to reports/test-2026-09-07-task-016.md and
reports/review-2026-09-07-task-016.md. The accepted Naver compatibility limitation remains.

Verified both destinations resolve from docs/prd-traceability.md and exist in Git HEAD,
independently of any worktree directory. Reviewed the documentation diff and checked
whitespace. Source/test/config files still match the approved verification manifest;
no runtime behavior changed and no new tests or full-suite rerun were necessary for
this link-only correction. The prior 553/32/16 verification remains applicable.
TASK-016 remains complete; TASK-017 is next and TASK-008 remains deferred/incomplete.
Original dirty work is preserved. No merge, deployment or handbook change occurred.


## PR #17 committed-state correction — 2026-09-07

Resolved review comment 3949700670 on user request. TASK-016's completion ledger now
records delivered implementation f863439 and evidence-link correction 6992eaf, both
pushed to PR #17. Its former uncommitted state is explicitly pre-delivery history;
report references identify committed repository paths. Existing review-remediation
commit/push authorization remains applicable. No source, test or configuration changed.
Checked commit ancestry, the documentation diff and whitespace; the approved verification
manifest still matches. Prior 553/32/16 evidence remains valid without a new test run.
No merge or deployment; TASK-008 remains deferred/incomplete and TASK-017 is next.


## TASK-017 activated and audited — 2026-09-08

User requested activation and execution. TASK-017 is the sole active task. Read authoritative
PRD FR-11/FR-16/14.3, role prompts, standards, current components/styles and existing E2E/axe
coverage. Reused delivery checkout was clean at 2ff1508; no branch switch or worktree creation.
Original dirty TASK-008 work is preserved. Identified missing candidate-list semantics,
indistinguishable same-name article labels, limited zero-result live guidance and missing
zoom/full keyboard/recovery-focus evidence. Existing basic search and repeated announcements
remain the baseline. Concrete bounded design is presented in chat for the brainstorming skill's
explicit human approval gate. Only activation/project/session/traceability records changed;
no code, tests, dependencies, commits, pushes, deployment or handbook work occurred.
TASK-017 is not complete; actual screen-reader observation and independent review remain gates.


## TASK-017 implementation and verification — 2026-09-08

User approved the bounded design by requesting implementation. Reused `.worktrees/task013-quality`
on `codex/task-017-accessibility` from 2ff1508; original dirty TASK-008 work preserved.
Added named native candidate lists, address-aware focusable evidence cards, explicit result
navigation without URL mutation, input focus after submission, safe empty/tie/similar live copy,
and focus-preserving guarded retry. Manual native Chrome200% revealed tall-card bottom scrolling;
reproduced and fixed with guarded self-focus scrolling while preserving child-link visibility.
Native 200% recheck passed and zoom restored. Source/map keyboard order and deliberately
activated source navigation verified with local interception and no Referer.

Final pinned verify:full exited 0: 561 Vitest tests, 56 browser checks, 18 a11y tests / 22 axe
scans with zero violations. Focused 89 component tests passed. Test report and source/test/config
manifest are in the delivery checkout. Independent Reviewer Approved; no open code/test findings. Actual VoiceOver
observation remains pending user authorization; native AX inspection is not speech evidence.
TASK-017 stays active; tasks/completed.md is intentionally unchanged. No milestone closed.
No dependencies, production data/status mappings, public URL contracts, workflow, handbook,
commit, push or deployment changed. All TASK-017 changes remain uncommitted.


## TASK-017 authorized delivery preparation — 2026-09-08

User explicitly authorized commit/push and temporary VoiceOver execution. Verified native
System Settings VoiceOver on, attempted native navigation and documented speech-output
commands, and verified off during cleanup. CUA VoiceOver window access timed out twice;
no readable caption or saved speech was obtained. Actual screen-reader acceptance remains
open due to observation-tool limitations, not missing user approval. No code/test/config
changed after approved full verification; all manifest hashes match. Proceeding with the
expressly authorized delivery of reviewed TASK-017 implementation and accurate limitations.


## TASK-017 assisted VoiceOver verification in progress — 2026-09-08

User requested completion of screen-reader verification, confirmed VoiceOver is audible,
and agreed to report actual speech while the assistant operates the test. Native System
Settings was off initially, then enabled under persistent authorization. First staged query
is the synthetic same-name case: eligible 0, similar 2, address/source guidance, input focused.
The user has not yet reported whether that specific label/summary/guidance was heard.
Do not mark any observation passed from general audibility. Remaining matrix is recorded in
reports/voiceover-2026-09-08-task-017.md in the delivery checkout. No product code changed.
The local test tab and loopback preview/recovery servers are retained for the pending assisted
session; VoiceOver remains on for the user's listening step and must be restored off at cleanup.
TASK-017 remains active. No new commit or push occurred during this partial verification.


## TASK-017 assisted verification complete — 2026-09-08

All seven user-assisted VoiceOver cases passed; exact confirmations and limitations are in
reports/voiceover-2026-09-08-task-017.md. This supersedes the earlier pending manual-gate
notes. VoiceOver is off and local test tabs/servers are cleaned up. Source/test/config
hashes match approved implementation 1acf77f; existing 561/56/18 verification remains valid.
TASK-017 moved to completed; no next task activated. Deferred TASK-008 and production gates
remain open. Independent closure review Approved with no unresolved findings. Evidence delivery uses the
existing user authorization on codex/task-017-accessibility; no merge or deployment.


## PR #18 review remediation — 2026-09-08

User requested PR #18 review remediation plus commit/push. Reused clean .worktrees/task013-quality on codex/task-017-accessibility at 633fbfa; original dirty checkout preserved. Accepted both P2 comments and added displayed candidate positions and independent tie/similar live warnings. Three regressions reproduced then passed; focused 92 component tests and pinned verify:full 564/56/18 passed (22 axe scans, zero violations). Inline review found no remaining supplied issue. No new manual VoiceOver observation, independent approval, merge or deployment claimed. Evidence: reports/review-2026-09-08-pr18.md. Authorized commit/push follows this record.


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


## TASK-018 rendering-target continuation — design pending

The user requested achievement of the large-card 500 ms target. Reopened only TASK-018 and
inspected SearchResults, App submission lifecycle, authoritative performance/implementation
prompts, source PRD and benchmark card-count cap. Prepared bounded 20-card similar-candidate
pagination with complete ranked results and accessible page navigation. Explain that the new
measurement is complete search plus visible page, not all cards instantiated simultaneously.
The brainstorming explicit design-approval gate is pending; no product/test code changed.
Prior optimization reports remain immutable and TASK-008 stays on hold.


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


## TASK-018 authorized PR delivery — 2026-09-08

The user explicitly requested commit, push and PR creation, with a performance summary.
Deliver the complete reviewed TASK-018 audit, computation optimization, partition loading
and approved pagination on codex/task-018-performance against main. Final implementation
is bound by the paginated report's 92 matching hashes; verify:full passed598/68/20 and
performance:check passed all120 search and320 navigation samples. Independent review approved.
Earlier uncommitted/no-push notes are historical. No merge or deployment is authorized.
Preserve original dirty TASK-008 work; commit only the reused working checkout's TASK-018 changes.


## TASK-019 completed — 2026-09-09

User authorized activation and execution. Completed current-code privacy/input/external-link,
build exposure, dependency and Actions-applicability review against b614838 in the reused
.worktrees/task013-quality checkout. No actionable vulnerability confirmed. Pinned verify:full
passed 598 unit/component/pipeline tests, 68 browser tests and 20 accessibility tests; npm audit
reported zero advisories and 304 unique package-version license declarations were recorded.
Evidence: reports/security-2026-09-09-task-019.md and companion audit/hash/verification files.
No security fix was needed or applied. Actions files do not exist; production publication,
workflow/account settings and release security gates stay open for TASK-009/010/021.
No active task; TASK-020 is next, unactivated. TASK-008 remains on hold. No source/test changes,
dependency change, commit, push, merge, deployment or handbook access occurred.


## PR #20 review remediation — 2026-09-10

Resolved all three P2 review comments: portable FR-12/active-task report links, anonymous
public-log checkout path, and reproducible artifact scan definition/command. The exact command
reproduces six artifact hashes and zero hits; 53 source hashes remain unchanged. Pinned
verify:full passes 598 Vitest, 68 browser and 20 accessibility tests. See
[review remediation](../reports/review-2026-09-10-pr20.md). TASK-019 remains complete; TASK-008
stays on hold. User-authorized PR delivery continues on codex/task-019-security-review.
No application code, security policy, dependency, workflow or deployment changed.


## PR #20 second review correction — 2026-09-10

Resolved comment 3979191617: the remaining TASK-019 security-evidence reference in
memory/known-issues.md now links to the committed report using a repository-relative path.
Verified the known-issues, active-task and FR-12 links against Git's tracked file list and
confirmed all 53 source hashes remain unchanged. Markdown-only correction; prior full
verification remains applicable. TASK-019 stays complete; TASK-008 remains on hold.


## PR #20 third review correction — 2026-09-11

Reviewed both unresolved comments on 550901f in the existing clean PR checkout. Added a
criterion/evidence matrix for TASK-019 and corrected three FR-10 source citations to immutable
links containing the actual protection statements. The committed history does not establish
an approved Actions waiver; AC-019-8 remains unchecked and overall TASK-019 is now explicitly
deferred/incomplete in backlog/current status. Its bounded application assessment remains
completed. Earlier unqualified completion statements are historical, superseded by this record.

All 53 reviewed source hashes remain unchanged; local evidence links/anchors and exact source
citation ranges pass validation, as do pinned format and Git whitespace checks. This is a
Markdown-only correction; the historical 598/68/20 full verification was not rerun. Details:
[PR #20 remediation](../reports/review-2026-09-10-pr20.md#third-review-follow-up--2026-09-11).
No new architectural decision, application/security-policy change or independent approval.
TASK-008 remains on hold, no implementation task is active, and no workflow work is activated.
Changes are local and uncommitted; no push, GitHub messages, thread resolution, merge or deployment.


## PR #20 authorized correction delivery — 2026-09-11

The user explicitly requested commit and push of the eight reviewed Markdown corrections
on codex/task-019-security-review. The preceding local-only notes describe the preparation
pass. Deliver only these files to the existing PR #20; no merge, deployment, GitHub comment
or review-thread resolution is requested. TASK-019's Actions criterion remains deferred
and TASK-008 remains on hold.

## Git synchronization and orientation — 2026-09-12

User requested synchronization with Git and a review of current work. The original
codex/task-008-planning checkout was clean at ea8f4da and fully contained in origin/main.
Fetched origin with pruning, switched to main, and fast-forwarded local main from d9dba5f
to ec6bb6f (merged PR #20). Existing local branches were preserved.

Reviewed project/current-session/task records, planning instructions, backlog, traceability,
roadmap, package scripts and the application/demo loader. No implementation task is active.
TASK-008 remains explicitly on hold; TASK-019 remains deferred/incomplete for AC-019-8.
TASK-020 is the next recorded documentation candidate, not activated. The current application
uses synthetic partitioned data; production ingestion/publication, Actions and release gates
remain open. Historical passing verification is recorded as 598 Vitest, 68 browser and
20 accessibility tests; no tests were rerun for this synchronization-only session.

Only this session note was added locally. No application change, new decision, task activation,
commit, push or deployment occurred. No handbook content was accessed.

## TASK-009/010 execution request — 2026-09-12

User requested deployment pipeline work. Created codex/task-009-010-publication from ec6bb6f,
preserving the existing uncommitted synchronization note. Activated TASK-009 alone in design;
TASK-010 follows its tested contract. Inspected collector, staged validator, internal transformer,
synthetic browser loader, acceptance records and official Pages/schedule documentation.

Prepared docs/superpowers/specs/2026-09-12-task-009-010-publication-design.md with the complete
publication transaction, same-release baseline promotion, Actions trust/permission boundaries,
bootstrap/recovery concerns and AC-009-1 through AC-010-5 failure-injection/hosted evidence matrix.
The proposal is not an accepted architecture decision or implementation-completion claim.

TASK-008 remains explicitly held. Asked whether the user authorizes its resumption or wants only
the bounded testable publication foundation. No answer or approval is inferred from elapsed time.
Production ingestion/coverage/policy and serialization/baseline storage contracts remain unresolved.
No code/workflow/dependency/settings changes, commit, push, deployment or handbook access occurred.
No implementation tests were rerun for this documentation-only preparation. TASK-009/010 and
TASK-019 AC-019-8 remain incomplete; no milestone or release gates closed.

## Collection-date continuation outcome — 2026-09-12

The user explicitly kept real-data criteria on hold and requested collection-date operation.
Implemented the date-basis validator/UI, strict full-category CSV parser, exact-byte candidate
staging, whole-directory promotion, matching deployed-baseline verification, Vite data build,
read-only CI and daily/manual guarded Pages workflow. Recorded ADR-016 and aligned AGENTS.md
with the approved date interpretation. TASK-009's bounded staging contract was tested before
activating TASK-010; both overall tasks remain incomplete for production/hosted/review gates.

Pinned Node 24.19.0 / npm 11.17.0 npm run verify passes 636 tests with two existing Windows
skips, all coverage gates, build and quality checks. npm run test:a11y passes 20 tests.
Full four-browser verification passes 66/68; two Windows WebKit link-focus tests fail, also on
a separate unchanged ec6bb6f checkout. The temporary baseline checkout was removed after
verification without changing the shared dependencies. Experimental E2E key changes were
reverted. Fixed eight existing Windows quality-test path/junction failures without weakening
assertions or changing product search behavior. The initial ambient-runtime failure is superseded
by the pinned run; no full-suite success is claimed.

Reports: reports/test-2026-09-12-task-009-010.md, reports/security-2026-09-12-task-009-010.md
and reports/task-009-010-2026-09-12-hashes.json. The security assessment is an author self-review,
not independent approval. YAML syntax, default permissions and top-level pins passed checks.
Quality config remains intentionally absent; publication enablement remains unset/unverified.
No official archive ingestion, account-setting change, hosted Actions execution, commit, push,
merge, deployment or handbook access occurred. No task was moved to completed because full
verification, independent review and production/hosted acceptance gates remain open.

## Authorized branch delivery — 2026-09-12

The user explicitly requested commit and push of the prepared TASK-009/010 changes on
codex/task-009-010-publication. Earlier no-commit/no-push statements describe the preparation
pass. Deliver the collection-date foundation, workflows, verification reports and harness
updates together; retain all documented quality, WebKit, independent-review and hosted gates.
The prior synchronization note is preserved. No PR creation, merge or deployment is requested.
Before delivery, verify the 19 implementation/workflow hashes and Git whitespace checks.

## TASK-009/010 hosted verification continuation — 2026-09-12

User requested completion of TASK-009/010. Continued TASK-010 verification without resuming
held production calibration. Reproduced both Windows WebKit failures and isolated native
anchor skipping in application-free HTML; preserved all product and E2E assertions.
Created draft PR #21 from already pushed 3745940. Approved Ubuntu 24.04 CI run 34691119664
passed pinned verify:full: 638 Vitest, 68 browser and 20 accessibility tests. This resolves
the approved-runner verification gate; the Windows limitation remains separately documented.

Read-only account inspection found no environment, main protection or ruleset, zero publication
variables and a Pages 404. Actions uses read-only default tokens and cannot approve PRs.
The pinned upload-pages composite delegates to mutable actions/upload-artifact@v4 and defaults
to one-day retention. Recorded concrete review proposals without applying security/settings
changes. Independent review is absent. Asked whether the previously held real-data policy and
bootstrap review may resume; no answer was received during this pass and silence is not approval.

Evidence: reports/test-2026-09-12-publication-hosted.md and
reports/security-2026-09-12-publication-settings.md. TASK-009/010 remain incomplete for held
production work, independent review, deployment protection/approval, hosted recovery and actual
thirty-day reliability. No task was falsely moved to completed. No application/dependency,
architecture, status mapping, workflow, secret, handbook, merge or deployment change occurred.

## TASK-008 explicitly resumed; decoder prerequisites — 2026-09-12

The user explicitly resumed actual data quality/baseline review. TASK-008 is the sole active
prerequisite; TASK-009/010 are paused pending it. Implemented a read-only approved Ubuntu
observation job and script using the existing strict collector, parser and validator.
Real collection first exposed incorrect ZIP filename recoding. A 191-byte synthetic DOS-origin
UTF-8/data-descriptor ZIP reproduced it in a red hosted regression. Explicit UTF-8 filename
options fix the adapter and full-entry reads. Hosted full verification at 6069283 passes
639 Vitest, 68 browser and 20 accessibility tests (run 34692123385).

Actual archive collection subsequently passed inventory/schema and parsed three categories,
then encountered CP949 extension bytes unsupported by Node's native EUC-KR decoder. Bounded
local member diagnostics verified the member CRC and complete strict Python CP949 decoding;
no raw row was printed or retained. ZIP suffix metadata reports 195 exact matching names,
216440796 archive bytes and 894143343 advertised uncompressed bytes, not complete row metrics.
Several hosted attempts also failed with UND_ERR_CONNECT_TIMEOUT; one explicit retry failed.

Prepared a concrete build-only iconv-lite@0.7.3 plus locked safer-buffer@2.1.2 proposal with
strict decode/re-encode byte preservation. Human dependency approval is pending; no dependency,
source/status contract, permissive decoding or production config was added. No synthetic or
partial baseline was invented. Evidence and proposed tests are in
reports/research-2026-09-12-quality-resumption.md. The branch/PR #21 contains the diagnostic
and fixed-filename implementation; no merge, deployment, security-settings or handbook change.

## CP949 approval and implementation — 2026-09-12

User explicitly approved the concrete dependency proposal. Added pinned build-only iconv-lite
0.7.3, locked safer-buffer 2.1.2, and shared strict CP949 byte-round-trip decoding. A focused
regression reproduced silent extension corruption before the fix. Local verification passes
644 tests with three Windows native-tool skips; browser module inspection excludes the decoder
and its dependencies. Audit reports zero vulnerabilities. Hosted runs 34692671364 (full CI)
and 34692668848 (actual observation) started at 909bb9b. Evidence: reports/test-2026-09-12-cp949.md.
TASK-008 remains active; no publication policy, baseline, deployment or completion claim.

### Hosted outcome and continuation boundary

Ubuntu run 34692671364 passed 647 tests, 68 browser tests and 20 accessibility tests. Actual
run 34692668848 decoded 127 categories / 1,723,957 rows without parser errors, then exhausted
the 6144 MiB heap. Research follow-up c3c474a retains only per-category counts/hashes and
explicitly reports validation null. Run 34692888618 and its single retry both failed with
provider connect timeout before collection. Full inventory and production memory/quality gates
remain open; do not create a partial baseline. Next: successful approved-runner inventory, then
bounded production transformation/serialization and reviewed baseline/policy. Deployment and
independent release gates remain separate. No merge or deployment occurred.

## TASK-008 bounded production processing — 2026-09-12

User requested full parser re-observation and memory remediation first, with quality-policy,
protection and deployment decisions kept separate. The successful Ubuntu parser inventory
(run 34692888618, attempt 3, c3c474a) covers all 195 categories: 2,939,947 rows,
894,143,343 CSV bytes, zero parser errors; archive SHA-256 is
`e2eeb1a868a2bfb94dbc9d193dae74707c0e27e38230376d5ad105e174a69faa`.
It is aggregate evidence, not a policy or baseline.

The production staging script now consumes the strict CSV iterator in bounded row batches.
Intermediate disk buckets retain global identity and normalization-collision checks; external
merge runs preserve exact identity ordering. One shared validator still owns quality, baseline,
source-contract and date gates. Exact-byte hashes cover intermediate and staged files. Only a
complete accepted new directory can become a publication candidate; the research entry emits
no release descriptor or baseline. The site builder streams descriptor-bound data instead of
retaining the whole JSON asset in Vite's heap. The single build-managed relative asset contract
remains; no stable public endpoint, share identifier, source delivery or status mapping changed.

Final-code local full replay passed global checks and serialization with a 2,048 MiB heap:
1,822,576 KiB peak Node RSS and 1,349,416 ms. It reproduced every quality metric and dataset
hash from the preliminary run. The actual 2,439,358,850-byte dataset crashes Chromium's current
whole-file loader. Exact source pairs 05/06 remain unverified and require review for 187,173
rows across 68 categories. No policy/baseline was adopted. See the bounded-source report.
The existing read-only Ubuntu observation script now shares the bounded production path;
branch delivery and hosted source/CI evidence follow local verification. Do not infer production
readiness from parser success, fixture parity or producer memory improvements.
No config, dependency, workflow, account protection, deployment or handbook change is authorized
by these measurements. TASK-008 remains the sole active task and is not complete.

Local final verification: pinned npm run verify passes 665 tests with three existing Windows
native-tool skips, all coverage gates, build and both search-quality checks. Chromium/mobile
E2E passes 34 tests and accessibility passes 20. The existing read-only observation script now
uses the bounded path so branch delivery can obtain actual Ubuntu memory and full-suite evidence.
No merge, protected-setting change or deployment is part of this branch verification.

Final hosted evidence at implementation commit fbb2d65: full CI 34695740858 passes 668 unit,
68 four-browser and 20 accessibility checks. Complete-source run 34695738766 succeeds with
195 categories, 2,939,947 rows and zero parsing errors in 910,348 ms at 2,265,876 KiB peak
Node RSS. Existing runner memory configuration is unchanged. Archive, dataset and entire
validation object match the final local replay; validation remains review_required. Aggregate
receipt hash verified before formatting and retained in the bounded-source report. Browser,
reviewed quality/baseline, independent release review, protection, deployment/recovery and
thirty-day reliability remain open. TASK-008 is not complete; no task is moved to completed.


## PR #21 review corrections — 2026-09-13

User requested assessment and correction of PR #21 reviews plus commit/push. Reused the clean
.worktrees/task013-quality checkout and checked out codex/task-009-010-publication at 759db3a;
the main checkout's untracked duplicate files remain untouched. Corrected whole-archive source
attribution in both serializers and collection-date instructions in App. Added a complete-site
Pages size guard and temporary-candidate promotion. Hosting-format feasibility remains unresolved:
the measured 2.44 GB dataset is rejected, not made deployable. No architecture change is adopted.

Regression RED reproduced all three comments. Focused GREEN passed 140 tests; pinned local
full verification passed lint/format/types and 678 tests, but two unchanged Linux unzip fixtures
fail on Apple's unsupported -O option. Build, search-quality checks, 68 browser checks and 20
accessibility checks passed separately. Current Ubuntu CI follows the user-authorized commit/push.
See reports/review-2026-09-13-pr21.md. TASK-008 remains active and incomplete; publication and
independent release gates remain open. No comment/thread resolution, merge or deployment.


## Hosted verification — 2026-09-13

Current implementation `392b52823c3e15d6945925c323c8fb0c631a4d01` passed the approved Ubuntu
`npm run verify:full` in [run 34740089608](https://github.com/internalforces/open-store-searcher/actions/runs/34740089608):
680 tests across 37 files, 68 browser tests and 20 accessibility tests. Global coverage:
93.53% statements, 92.09% branches, 96.51% functions and 95.24% lines; all configured thresholds
passed. This supersedes the pending-hosted-verification state recorded during preparation.
The two native fixture failures are macOS-specific and pass on the approved runner. No test
was skipped or weakened. This follow-up changes only documentation; implementation stays at 392b528.
Production hosting-format/browser feasibility and independent release approval remain open.


## PR #21 second review correction — 2026-09-13

User again requested review correction and commit/push. Reproduced comment 3998845544 with two
failing tests against 96b0838. Publication loader now exposes internal collection date-basis
metadata, which App uses before initial data arrives; header/reload/footer preserve collection
wording through initial failure and retry. Accepted dataset coverage remains authoritative and
switching loaders removes obsolete hints. Missing dates remain unknown; no date is fabricated.
119 component tests pass. Pinned local verify:full reaches 680 passing tests and two unchanged
Apple unzip failures. See the second-review section of reports/review-2026-09-13-pr21.md.
Current Ubuntu verification follows user-authorized delivery. TASK-008 remains active and
incomplete; the earlier production-size/browser gate is unchanged. No GitHub comments, review
resolution, merge, deployment or public contract change is part of this correction.

Second-review local follow-up: build, both search-quality checks, all 68 browser checks and
20 accessibility checks passed. Final formatting and Git whitespace checks passed.


### Second-review Ubuntu verification

Second-review implementation `75356552a53bdf0652c992cd41fb745a7bb55775` passed Ubuntu
`npm run verify:full` in [run 34741144392](https://github.com/internalforces/open-store-searcher/actions/runs/34741144392):
682 tests, 68 browser checks and 20 accessibility checks. Coverage is 93.54% statements,
92.12% branches, 96.51% functions and 95.25% lines; all configured gates passed. This resolves
the second-review verification pending above. Both native unzip fixtures pass on Ubuntu.
The documentation-only follow-up does not change the verified implementation. TASK-008 and
production hosting/browser/release gates remain incomplete.


## PR #21 third review correction — 2026-09-13

User requested review assessment and correction. Reused the clean PR worktree at 99e4f94.
Comment 3998893054 is valid: bootstrap unconditionally bypassed the deployed baseline.
The CLI now always resolves deployed state before collection. Explicit bootstrap requires
reviewed collection-date baseline configuration and HTTP 404 at the configured release URL;
existing releases, redirects, errors and failed cleanup abort. Normal refresh binding is unchanged.

Focused regression: eight RED failures, then 21 tests passed. Pinned local verify:full passes
lint/format/types and 690 tests, failing the two unchanged Apple unzip fixtures (692 total).
Separate build, search-quality, full browser and 20 accessibility checks pass. An offline actual
CLI invocation confirms rejection before collection with no output directory. See the third-review
section of reports/review-2026-09-13-pr21.md. Current Ubuntu evidence is still required.
TASK-008 remains the sole active task and incomplete; TASK-009/010 and actual hosting/browser,
quality/protection/release gates remain open. No new architectural decision or public interface.
Changes are local and uncommitted; no push, GitHub comment, thread resolution, merge or deployment.


### Third-review authorized delivery

The user explicitly requested commit and push of the nine reviewed correction files to the
existing PR #21 branch. Earlier local-only statements record preparation, not the current
delivery authorization. Push the bootstrap correction on codex/task-009-010-publication;
current Ubuntu verification remains pending. No merge, deployment or GitHub message is authorized.


## PR #21 fourth review correction — 2026-09-13

User requested review assessment and fixes. Reused clean a54a499 on the existing PR worktree.
Comments 3998971153/3998971154 are valid. Require the exact dataset/baseline descriptor set
with valid entry bindings before fetching baseline bytes. Verify research dataset SHA-256 and
length by streaming before laboratory startup, and include the verified digest in new reports.
Historical performance reports remain unchanged; no actual-data measurement was rerun.

Focused 43 tests pass (20 RED failures before fixes). Pinned verify:full reaches 712 passes
and the two unchanged Apple unzip failures; current Ubuntu proof remains required. Prior
commit a54a499 passed Ubuntu 692/68/20 in run 34743021815. See fourth-review evidence in
reports/review-2026-09-13-pr21.md. TASK-008 remains active/incomplete; TASK-009/010, production
size/browser/quality and release gates remain open. No new architecture decision or public
application contract. Changes are local; no commit, push, GitHub message, merge or deployment.

Fourth-review follow-up: separate build, both search-quality checks, 68 browser checks and
20 accessibility checks passed. Final formatter and Git whitespace checks passed. Current
Ubuntu verification remains pending; there is no full-verification or release-completion claim.


### Fourth-review authorized delivery

The user explicitly requested commit and push of the thirteen reviewed correction files to
PR #21 on codex/task-009-010-publication. Earlier local-only notes describe preparation.
Deliver the descriptor and observed-dataset binding fixes with their tests and evidence;
current Ubuntu verification remains pending. No merge, deployment or GitHub message is authorized.


## Fourth-review CI diagnosis — 2026-09-13

At 7a1dd37, Ubuntu [Verify run 34746030961](https://github.com/internalforces/open-store-searcher/actions/runs/34746030961)
passed npm run verify:full: 714 tests, 68 browser checks and 20 accessibility checks. This
supersedes the fourth-review pending Ubuntu verification notes, including the two local Apple
unzip failures; those tests passed on the approved runner. Independent release gates stay open.

[Observe Seoul quality run 34746029824](https://github.com/internalforces/open-store-searcher/actions/runs/34746029824)
failed before source collection in both attempt 1 and the diagnostic rerun (attempt 2).
Both logged UND_ERR_CONNECT_TIMEOUT for file.localdata.go.kr:443 after 10000 ms, followed by
observation-rejected / http_contract_changed / Provider probe request failed. The observation
script, workflow and source probe are unchanged from successful a54a499. This demonstrates a
runner-to-provider connection failure, not a descriptor/hash regression or proof of changed
provider schema. It does not establish a provider-wide outage. No candidate or production policy
was produced. No timeout, workflow, acceptance gate or implementation was changed. Further
observation requires restored connectivity; do not retry indefinitely or waive evidence gates.

Diagnosis records are local and uncommitted. No push or deployment occurred.


## CI observation recovery — 2026-09-13

On the user's explicit request to resolve the failed CI, one further diagnostic rerun used the
unchanged 7a1dd37 commit and existing Ubuntu workflow. Attempt 3 of
[run 34746029824](https://github.com/internalforces/open-store-searcher/actions/runs/34746029824/attempts/3)
passed in 14m37s. PR #21 now reports both observe and verify as pass. No code, timeout,
provider URL, workflow, retry loop, validation threshold or deployment setting was changed.

The local approved probe returned limit 200 and range 206 with a 216,485,056-byte archive;
the third hosted attempt then collected and processed all 195 categories, 2,940,404 rows and
894,291,644 CSV bytes with zero parsing errors. The decoded final report matched its logged
SHA-256 f05984f434ff5553d65e5c22b50bf657e8ec65238be9d7c57c3b144cdd8d3b60.
All 195 entries are complete and their row sum matches the reported total. Archive SHA-256:
edb4be5b859ef0a8eaca0cd2a96f58ac82911d3db59775ecf9417d9beabf87ce.
Dataset: 2,439,752,287 bytes, SHA-256
c66d90193e6045852b50e1555a00255a65c01cffb5384d314d0057e07b48fe19.
Processing took 861,234 ms at 2,257,176 KiB peak Node RSS.

This resolves this failed observation run, not all future provider-network reliability.
Attempts 1/2 remain valid connection-timeout evidence; no permanent outage or code regression
was established. Validation remains review_required and publicationApproved remains false.
Production browser/hosting size, reviewed policy/baseline, independent review and release gates
remain open. No new production data policy, publication or automatic retry behavior was introduced.


## Authorized PR #21 merge and follow-up — 2026-09-13

User explicitly requested merging PR #21 and creating a new PR before performing current review
remediation. PR #21 merged at a33600f after both checks passed on 7a1dd37. The user directed the
remaining finding to follow-up; this merge is not independent release approval or deployment.
Reused this worktree on codex/pr21-release-descriptor-followup from origin/main, preserving local
CI recovery documentation. Create a draft follow-up first, then address comment 3999130863.
The descriptor must name the existing hash-addressed dataset file without introducing a duplicate
multi-GB copy or changing the existing application data URL. All production/release gates remain.


## PR #22 implementation — 2026-09-13

Created draft PR #22 before implementation as requested. The builder now writes the actual
hash-addressed dataset path in the deployed descriptor, and the deployed reader validates
that exact digest-derived path. Public dataset URLs, staging format and data/baseline bytes
are unchanged; no duplicate dataset is emitted. Real-build binding and unsafe-path regressions
pass with all 158 focused pipeline tests. Pinned local verify:full passes lint/format/types and
716 tests but fails the same two unchanged Apple unzip fixtures (718 total). Current Ubuntu
proof follows delivery. See reports/review-2026-09-13-pr22.md. TASK-008 remains active/incomplete;
no new production policy, workflow, deployment, independent approval or overall task closure.

Separate local build, both search-quality checks, 68 browser checks and 20 accessibility checks
passed. Final format and Git whitespace checks passed. Deliver implementation to PR #22 under
the user's explicit follow-up authorization; no follow-up merge or deployment is authorized.


## Ubuntu verification — 2026-09-13

Implementation a192e737471e78619b5d0cf002b5bcf5ce36b6f2 passed Ubuntu npm run verify:full
in [run 34747253199](https://github.com/internalforces/open-store-searcher/actions/runs/34747253199):
718 tests, 68 browser checks and 20 accessibility checks. All configured coverage gates passed.
This supersedes the pending Ubuntu state above; both native unzip tests pass on the approved
runner. The evidence follow-up changes documentation only. No independent release approval,
production policy, merge of PR #22 or deployment is implied.

## Static delivery analysis — 2026-09-14

User requested current-structure and remediation analysis only. Inspected producer, publication
builder/descriptor, loader/preparation, candidate engine and pagination at e8f8c92. Confirmed
whole-file JSON loading, duplicate publication index preparation, full scans and whole similar
result retention. Proposed measured lossless compact JSON blocks, Worker-owned local search
and complete retrieval semantics; no design or public contract was adopted. Details and
acceptance sequence: reports/analysis-2026-09-14-static-delivery.md. Production compaction and
performance remain unmeasured; quality/baseline gates remain independent. No tests, source,
dependency, workflow or deployment changed. PR #22 was observed merged with successful CI
in the preceding GitHub status assessment; earlier draft wording is superseded. TASK-008
remains active; no task was completed, commit made or push performed by this analysis.


## TASK-008 static delivery preparation — 2026-09-14

User requested implementation after complete-source feasibility measurements and delivery-design
approval. Reused task013-quality; verified PR #22 merged as 81a1441 and HEAD e8f8c92 is an
ancestor with identical tracked contents. Preserved existing analysis/session changes and the
original checkout. Inspected producer, builder, baseline reader, browser preparation and scoring.
No complete Seoul dataset/archive was located in searched local paths; GitHub artifacts total
is zero and the observation workflow does not upload the dataset. Asked for an accessible
existing snapshot location. Recorded hashes remain historical, not locally verified.

See reports/feasibility-2026-09-14-static-delivery.md for evidence, measurement protocol and
coordinated migration boundaries. Format selection, actual profiling, Worker implementation and
performance verification await source access and subsequent required design approval. No source
or contract changes; no tests, commit, push or deployment. TASK-008 remains active/incomplete;
TASK-009/010, status-pair review and all production/release gates remain open.

User then directed a Git check. Fetched origin and inspected all reachable branches/history:
no dataset.json/observation.json; only three fixture ZIPs; largest blob 835,016 bytes. GitHub
releases are empty. The complete-source search fixture is not a complete Seoul dataset and
was not substituted. Source access remains blocked; format selection remains unapproved.

## Original snapshot transfer follow-up

User supplied Gmail/Drive source links and approved the large-file download notice. Retrieved
Downloads/observation.json (143806 bytes; SHA-256
aea7b04eaa936be4b8eb08144bb92ef7f3875a780a278f517903927ccdbea302); its validation and
dataset binding exactly match recorded evidence. Dataset download returned ERR_BLOCKED_BY_CLIENT;
Browser policy also denied the download-status page. Requested user-completed download; no
workaround or security setting change. Dataset hash and full-source measurements remain pending.
TASK-008 stays active; implementation/design approval and TASK-009/010/release gates remain open.

## TASK-008 full-source feasibility and proposed delivery design

The user completed the dataset download. Verified the original 2,439,358,850-byte source SHA-256
34ac368f16a578b3af96cd083d73efe698d7b3ec01f400b5162e37a42f6b85cc before and after profiling.
Full-source Node 24.19.0 research measurements compare tuples, local dictionary tuples/columns
and selectively shared evidence dictionaries. Recommended candidate data: 686,691,922 bytes;
actual gzip output: 198,292,818 bytes. Research site with current shell/manifest/observation:
687,009,428 bytes. Optional exact postings add 252,210,834 bytes and do not prove completeness.

Passed 8,819,841 exact record reconstructions, 49,979,099 shared evidence comparisons, unique
full-ID/count checks, component hashes and original-order ID hashing. Original row order is not
lexical public-ID order; preserve both original order and independent lexical ranking ties.
Research memory/timings are not browser benchmarks. Mobile download remains a material constraint.

Proposed design: docs/superpowers/specs/2026-09-14-task-008-compact-delivery-design.md. Evidence:
reports/feasibility-2026-09-14-static-delivery.md and measurements-2026-09-14-static-delivery*.json.
Only research scripts and English documentation added/updated; no production codec/Worker implemented.
Required delivery/public-interface design approval is pending. TASK-008 remains active; TASK-009/010,
05/06 review, baseline/quality and all release gates remain open. No commit/push/deployment.


## TASK-008 authorized compact implementation — 2026-09-14

The user explicitly approved continuation of the measured compact-delivery design. Implementation stays in
`.worktrees/task013-quality` on `codex/pr21-release-descriptor-followup`; HEAD e8f8c92 has the same
tracked tree as merged PR #22 / 81a1441. Existing edits remain intact. No commits, pushes, merges,
deployments, dependency additions or repository-setting changes are authorized in this continuation.

Implemented the bounded three-pass lossless codec, strict manifest/block validation, compact-v 2
accepted staging and builder, matching deployed-baseline reader, Worker-owned search preparation,
compact ranked references and visible-page UI protocol. Legacy observation bytes remain an oracle;
new accepted sites contain only compact replacement assets. Dataset replacement keeps the accepted
Worker until the entire new candidate validates and prepares. The release descriptor retains the
exact collection timestamp; its validated Seoul date must equal manifest coverage and baseline date,
and baseline/archive/policy/count bindings are checked together.

Production codec research on the hash-verified original reconstructed all 2,939,947 records exactly,
including raw evidence, full IDs and original order. Data plus manifest: 688,433,397 bytes, actual
per-file gzip 198,433,476 bytes; conversion+readback/round-trip 168,269 ms; Node max RSS 750,764,032
bytes. This is research with policyRevision=null, not a publication-approved baseline or release.
Artifacts remain outside the repository at `/private/tmp/seoul-compact-production-20260914`.

First complete-source browser experiment exposed timer-clamping and repeated scoring costs. It is
superseded for final latency claims by the ongoing optimized rerun. Initial cold readiness 77.6 s,
search 8–12 s, pagination 59 ms, and refresh-overlap browser-process-tree RSS 4.51 GB did not establish
performance feasibility. No budget was relaxed. Worker scheduler yielding and a completeness-proven
projection filter now reuse the oracle predicates and retain a full ordinal scan and complete ranks.

Pinned Node 24.19.0/npm 11.17.0 unit+component 371 pass; standard browser 68 and accessibility 20 pass.
The first full coverage run found two known native macOS InfoZIP failures and an application search
announcement-count regression; the latter was fixed and focused tests pass. Final coverage and real
browser measurements are ongoing. `.testagent/compact-review.md` records independent code review,
source-corpus 100-query/695-page parity and additional conflicting/literal adversarial parity.

TASK-008 remains active. TASK-009/010, 05/06 status-pair review, real quality policy/bootstrap baseline,
Ubuntu verification of this uncommitted tree and all release gates remain incomplete. The earlier
session's commit/push approvals concern historical work, not this continuation.


### Final compact-delivery evidence

Implementation and review are complete for the approved bounded scope. Full-source exact codec
round-trip covers 2,939,947 rows. Complete-source district/name/address/absent search ranks match
the old engine on every result and page. The optimized functional site is 688,506,488 bytes;
observed desktop searches 241–494ms, initial readiness 48–49s, next page 52–57ms, and sampled
browser-tree RSS maximum 4,555,177,984 bytes. Failed candidate refresh retained accepted search.

Final macOS tests:752/754 pass, with two unchanged native InfoZIP failures; coverage excluding
that seven-test file passes 747. Standard e2e 68, a11y 20, quality and performance budgets pass.
The existing Ubuntu 24.04 ARM64 research container was recovered and an isolated source copy
verified against 150 source/test/configuration hashes. Ubuntu lint/format/types/coverage/build/
quality and all 754 tests pass. Default-parallel browser execution had two WebKit startup flakes;
baseline 10 repetitions did not reproduce them. Same unchanged assertions with one worker pass
all 68 browser and 20 accessibility tests. Strict flaky handling remains enabled, and the initial
parallel failure is not erased or called a clean full-command pass. Hosted GitHub verification
remains distinct. The container was returned to stopped state; its new test directory is retained.

See reports/test-2026-09-14-compact-delivery.md and reports/review-2026-09-14-compact-delivery.md.
No need to re-measure from synthetic fixtures or re-request design approval. TASK-008 remains
active only for its separate production/mobile/hosted and policy/baseline/05/06/release gates;
TASK-009/010 are not complete. No commit/push/merge/deploy/security-setting change occurred.


### Compact-delivery PR preparation

The user explicitly authorized commit, push and PR creation on 2026-09-14. The existing
`.worktrees/task013-quality` worktree and all implementation changes are preserved on
`codex/task-008-compact-delivery`. Fresh origin inspection confirms main is merged PR #22
(`81a14418ede4158ffc2306dc862a01ca761c3f85`) and its tracked tree equals the prior branch HEAD.
Before committing, all 150 source/test/configuration hashes matched the verified Ubuntu copy;
`npm test` passed all 754 tests across 43 files again on pinned Node 24.19.0/npm 11.17.0.
Prepare a draft PR against main with the measured readiness/memory and platform limitations.
This delivery authorization does not close TASK-008/009/010 or authorize merge or deployment.

Implementation commit `3779200` is pushed on `codex/task-008-compact-delivery`. Draft
[PR #23](https://github.com/internalforces/open-store-searcher/pull/23) targets main and records
the verification evidence and remaining limits. Hosted CI is pending at this handoff. The Ubuntu
research container has been returned to its prior stopped state; the worktree is retained.


## TASK-008 operational verification activation — 2026-09-16

User requested activation/execution of the next task and use of subagents. Reused the existing
worktree; fetched origin and confirmed `da9e63c` has the same tracked tree as merged main
`bac6dce` (PR #23). Created local branch `codex/task-008-operational-verification` without
creating another worktree. The working checkout was clean; the original checkout's untracked
files were preserved. Hosted Verify succeeded for PR #23; prior pending notes are historical.

TASK-008 remains the only active task. Delegated independent quality and hosted evidence
reviews plus bounded actual-source mobile emulation. Existing delivery approval is reused;
no redesign, policy/mapping adoption, hosted publication or security changes are included.
Parent owns shared task/memory/traceability updates. No commit/push/merge/deployment authorized.


## TASK-008 operational evidence finalization — 2026-09-17

User requested continuation. Three delegated evidence streams completed: merged-main hosted
CI/settings inspection, actual-source mobile-emulated measurements, and exact quality/bootstrap
review inputs. Original PRD access is resolved. The unmodified raw Sep-13 observation is retained
as `.json.raw` so formatting cannot change its source SHA-256; decision inputs remain unapproved.
The reviewer independently checked source hashes/category arithmetic and identified the mislabeled
post-search LCP field. The delivered harness/JSON now use postSearchLatestObservedLcpMs without
changing the measured value; finite shell-window LCP is not a final LCP pass.

Measured Sep-16 results: 154.1 ms shell primary, 49.24 s full readiness, 566.4 ms broad district
search (target exceeded), 383.5/349.5 ms name/address searches, 69.1 ms next page, zero query/page
requests and 2.956 GB sampled browser-tree RSS. Slow 200,000 B/s loading is censored not-ready at
60 s. Worker CPU throttle coverage, physical-device performance and Pages delivery are unverified.
The measurement ran after the parent's 119-test validator suite passed and exited. Two setup
attempts were interrupted and excluded; their limitations are retained in the performance report.

Exact merged code passed hosted 755/68/20. Scoped harness/JSON Biome checks, Node syntax, 25 local
report-link targets, three JSON payload parses, receipt hash preservation and Git whitespace
checks pass. Application/dependency/workflow files match HEAD. No new policy, mapping, publication
config, architecture decision, commit, push, merge or deployment occurred. TASK-008 remains active
for unresolved performance/quality acceptance; TASK-009/010 remain paused. Independent final
review is being finalized separately; no release approval follows from this evidence pass.


Final independent review Approved the bounded evidence packet on 2026-09-17 with no remaining
actionable findings; see reports/review-2026-09-16-task-008-operations.md. Repository lint and
format checks exit 0 (five existing lint infos only). This closes this evidence-gathering
continuation, not overall TASK-008. The exact reviewed-unverified pair proposal, calibrated
policy/baseline and practical mobile/hosted acceptance remain pending. Work is local/uncommitted.


## TASK-008 operational evidence delivery authorization — 2026-09-17

The user explicitly requested commit and push of the completed operational evidence packet.
Deliver only the reviewed research harness, reports, exact raw observation, decision inputs and
related task/memory/operator/traceability records on `codex/task-008-operational-verification`.
Earlier no-commit/no-push statements describe preparation. This authorization does not approve
policy adoption, TASK-008 completion, PR creation, merge, repository settings or deployment.


## TASK-008 completion resumption — 2026-09-17

The user requested completion of TASK-008 and explicitly requested subagents. Reused the
clean existing `codex/task-008-operational-verification` worktree at `95c26a5`; preserved
the original checkout and its untracked duplicate files. Independent read-only agents
reviewed quality gates and acceptance ownership. The current exact category-bound 05/06
reviewed-unverified proposal was presented for explicit human approval. No response,
policy adoption, bootstrap approval, performance waiver or deployment permission is inferred.

Fresh pinned Node 24.19.0/npm 11.17.0 verification:
`node node_modules/vitest/vitest.mjs run src/pipeline/validate-license-refresh.test.ts`
passed all 119 tests in 10.56 seconds. The retained Sep-13 receipt parses and its SHA-256
remains `f05984f434ff5553d65e5c22b50bf657e8ec65238be9d7c57c3b144cdd8d3b60`.
The decision input still explicitly says unapproved: 05 has 66 category scopes, 06 has two,
and the proposed empty-category set has 23 IDs. `publication/config.json` remains absent.
No product code or test changed; historical full-suite results are not presented as fresh runs.

TASK-008 remains active/incomplete. ADR-014 requires reviewed policy and explicit initial
baseline approval. The two retained daily observations do not establish calibrated normal
variation. A subagent also located a Sep-04 historical observation on git ref `3c8f20b`;
its compatibility and additional evidence are documented in
`reports/research-2026-09-17-task-008-completion-gates.md`. This does not approve a baseline
or establish safe production thresholds.
The pending pair decision does not approve numeric limits, empty categories, bootstrap,
mobile performance or publication. Preserve the prepared quality packet rather than
regenerating observations as fabricated production limits. No new architectural decision,
bug fix, dependency, commit, push, merge, workflow dispatch or deployment occurred.


## TASK-008 approved reviewed-unverified implementation — 2026-09-17

The user explicitly approved the exact 05/06/category contract presented in the previous
turn. Implemented optional evidence-bound acknowledgment and strict immutable scope
validation, without changing the mapper or raw metrics. Missing input retains legacy
review; malformed contracts reject; new/mismatched/partial/unlisted pairs still require
review. Ordinary policy, empty-category and baseline gates remain mandatory.

Delegated implementation, aggregate-only replay and independent review. Test-first RED
showed 16 expected failures; executable CLI forwarding had its own RED. Final focused
161/161 passes, including real bounded staging and known-good preservation. The Reviewer
Approved after its independent 161-test run; the discovered array-extra-key strictness
defect was fixed and regression-tested. Aggregate replay removes 68 review diagnostics
from retained 2,940,404-row metrics while preserving 187,222 unknown pairs, every metric,
policy/baseline review and source-coverage uncertainty. No raw archive is read by replay.

Started the local Docker app and reused the stopped Ubuntu research container with pinned
Node 24.19.0/npm 11.17.0. Copied the unchanged-lockfile dependency tree and isolated source
into `/work/task008-reviewed-pairs-20260917`. The first full attempt stopped at research
helper formatting; corrected it and reran the entire default command. Final verify:full
exited 0:797 Vitest,68 browser,20 accessibility tests, all required checks and coverage.
155 transferred hashes plus the final helper match host/container; review/replay hashes
still match. The container is returned to stopped state and evidence directories retained.

See reports/test-2026-09-17-task-008-reviewed-pairs.md and independent review, replay and
verification receipts. Only this approved continuation is complete; overall TASK-008 stays
active for numerical calibration, empty-category/baseline approval and operational gates.
No numeric policy, initial baseline, deployment configuration, public format, dependency,
workflow, commit, push, merge, deployment or handbook change occurred.


## TASK-008 reviewed-pair delivery authorization — 2026-09-17

The user explicitly requested commit and push of the verified reviewed-unverified pair
implementation and asked for the remaining TASK-008 completion work to be identified. Deliver
the bounded implementation, tests, decision/specification, replay, verification/review evidence,
task/memory/traceability updates, and completion plan on
`codex/task-008-operational-verification`. No PR creation, merge, deployment, workflow dispatch,
policy adoption, baseline selection, security-setting change or publication is authorized.

The completion plan separates the original quality gates from later accumulated mobile/hosted
gates. The shortest quality path is an approved calibration protocol, distinct daily complete
observations, derived total/all-195 policy and empty-list review, policy-bound initial baseline,
an accepted complete validation, and independent final review. An explicit scope decision is
still needed before mobile/hosted release gates can be removed from TASK-008 or retained there.


## TASK-008 calibration activated — 2026-09-17

The user instructed execution of the recorded completion plan. This selects the recommended
original TASK-008 ownership and activates the proposed 30-Seoul-calendar-day calibration from
2026-09-17; it does not approve unseen policy values, empty categories, or a baseline.

Recovered the existing Ubuntu 24.04 research container with Node 24.19.0/npm 11.17.0 and ran the
clean pushed commit `e5ba5c6`. The complete non-publishing observation processed 195 categories
and 2,941,453 rows in 518,641 ms at 2,352,400 KiB peak Node RSS. Archive
`98e4a29352a4a6e39ddf58e50730ba1d2294dd402a88e96c2de34c32f388bf02` is distinct and retained
outside Git. Against 2026-09-13, rows increased by 1,049 across 58 categories with no category
decrease; the same 23 are empty. A one-row suspended-status decrease is retained as a correction
signal. Missing-name and missing-both-address counts remain 29 and zero.

Committed evidence is `reports/observation-2026-09-17-bounded-source.json` plus the calibration
report. The daily 09:00 local heartbeat `task-008-30-day-quality-calibration` preserves archives,
metrics and failures without publication, stays quiet on routine success, and prepares the
policy/empty/baseline proposal after the interval before pausing for explicit approval.


## TASK-008 calibration waiting and PR authorization — 2026-09-17

The user approved moving TASK-008 out of the active implementation slot while the 30-day
observation automation continues, and explicitly requested a pull request. `tasks/active.md` now
records TASK-008 as awaiting time-bound evidence. TASK-009/010 remain blocked on the reviewed
policy and baseline. TASK-019 AC-019-8 is recorded as the next eligible independent bounded task,
but is not activated or mixed into this delivery branch. Commit, push, and PR creation for this
state transition and the already verified TASK-008 branch are authorized; merge and deployment
remain outside this request.

Fresh PR-gate verification copied the current working tree into the retained Ubuntu 24.04
container and ran `npm test` with Node.js 24.19.0/npm 11.17.0: 44 test files and 797 tests passed.
The first transfer also copied macOS AppleDouble `._*` metadata, causing 44 non-product parse
errors while all 797 real tests passed; removing only those transfer artifacts from the isolated
container copy produced the clean passing run. Repository format, lint, and whitespace checks
also pass; lint retains five existing informational suggestions.

Committed and pushed the calibration-waiting transition as `49a5c99`, then created PR #24,
`Validate reviewed status pairs and begin TASK-008 calibration`, against `main`:
https://github.com/internalforces/open-store-searcher/pull/24. The PR contains the operational
evidence, reviewed-unverified contract and tests, first current calibration observation, approved
completion protocol, and waiting-state records. The worktree remains available for review fixes.
No merge, deployment, repository setting, policy, baseline, or publication action occurred.


## TASK-019 Actions review activated and performed — 2026-09-17

The user explicitly activated TASK-019 and requested AC-019-8 review. Reused the clean existing
worktree on a new local codex/task-019-actions-review branch from dddc61a. Fresh read-only API
inspection confirms PR #24 merged and remote main at 73edf04; all three workflows, three called
scripts and lockfile match the review base. No other workflow exists in the complete remote tree.

Reviewed triggers, shell/env inputs, least privilege, all action pins including the nested
composite, credentials/OIDC masking and same-run artifact selection. Retained authenticated
settings, immutable upstream code, executable bundle contexts and SHA-256 evidence. One Medium
finding confirms absent deployment environment/main protection; one Low finding confirms the
nested upload-artifact@v4 reference. Recovery evidence is an informational limitation. Publication
config/enable flag remain absent; no active deployment bypass or external-PR escalation claimed.

Evidence: reports/security-2026-09-17-task-019-actions.md and its companion evidence JSON.
Review performed, but AC-019-8 security acceptance remains unchecked and overall TASK-019 stays
active awaiting approved remediation/disposition. TASK-008 observation continues; TASK-009/010
and release gates remain unchanged. No independent second review was delegated or claimed.
No workflow, product code, dependency, security setting, secret, publication policy or baseline
was changed. No dispatch, commit, push, merge or deployment occurred in this pass.

Verification covers all three parsed YAML documents (duplicate keys/aliases rejected), eight
direct full-SHA uses, 16 expression-free shell blocks, local/upstream hashes, report links,
formatting and Git whitespace. No fresh application suite or dependency CVE audit is claimed.


## TASK-019 authorized remediation and delivery — 2026-09-17

The user explicitly authorized security fixes, settings changes, commit and push. Replaced the
Pages composite with equivalent Linux tar packaging and the reviewed upload-artifact v4.6.2 SHA.
Applied main protection: GitHub Actions verify/App 15368, strict current-base checks, one PR
approval, stale-review dismissal, last-push approval, administrator enforcement, resolved threads,
no force push/deletion. The first API payload was rejected with 422; corrected checks-only input
succeeded and fresh API readback verifies the state. Original read-only evidence stays immutable.

The only listed collaborator is internalforces. Requested the required deployment reviewer
identity asynchronously, explaining the self-review/sole-maintainer restrictions; no answer has
been received in this preparation pass. No deployment environment/reviewer was invented.
Main protection deliberately requires another eligible approver before self-authored PR merges.

Pinned macOS verify:full passes 795 tests and fails the two unchanged Linux Info-ZIP integrations;
Ubuntu Docker startup/restart timeouts prevent the required runner rerun and actual GNU tar fixture
execution. Static shell-token equivalence and workflow trust-boundary checks pass. Separate build
and search-quality checks pass. No full-suite, hosted upload or independent approval is claimed.
Reports: security-2026-09-17-task-019-remediation.md and companion evidence JSON.

Commit/push of review records, the one workflow patch and updated evidence is authorized on
codex/task-019-actions-review. TASK-019 remains active for reviewer identity/environment,
Ubuntu verification and final review. No merge, workflow dispatch, publication or policy/baseline
change is authorized. Other worktrees and TASK-008 calibration are preserved.


## TASK-019 PR and pre-approval preparation — 2026-09-17

The user replaced the interrupted self-approval request with PR creation and deployment work
up to approval. Created PR #25 against main at f66315d, triggering ordinary read-only Ubuntu CI.
No self-approval, merge or deployment was attempted. Added four offline actual-shell Pages
packaging cases to the Verify job, covering root/nested/hidden bytes, metadata exclusion,
materialized links, missing input and dangling-link rejection. The GNU tar requirement is explicit;
no assertion or platform skip was weakened. No token, hosted upload or real provider data is used.

Prepared reports/deployment-2026-09-17-preflight.md with precise settings and the prerequisite
sequence. Deployment reviewer identity, approved 30-day calibration, reviewed numeric policy/
empty-list/baseline, accepted production candidate and release/recovery evidence remain open.
This is not represented as a ready-to-approve deployment. Publication config/flag remain absent.
New test/workflow/evidence changes are within the authorized security preparation and delivery.


## TASK-019 hosted preparation verification — 2026-09-17

PR #25 is open and main was merged into the task branch solely to satisfy the up-to-date-base
check; no task branch was merged into main. Hosted run 35222256576 caught two regex lint warnings
in the added packaging test; corrected them and verified local lint/format. Hosted Ubuntu run
35222505500 at 9b13b08 passes the full application suite. Three packaging cases pass; dangling-link
packaging correctly fails but the diagnostic assertion did not include GNU tar's observed
"File removed before we read it". Corrected only that oracle while retaining nonzero exit.
The final run is required before claiming full packaging verification; PR #25 records its result.
Deployment remains blocked on the protected reviewer, quality policy/baseline and release evidence.


## TASK-019 final Actions acceptance — 2026-09-18

AC-019-8 is accepted and TASK-019 is complete within its recorded review scope. PR #25 merged
as 32c1809; its final head d459110 passed Ubuntu full verification and all four actual packaging
fixtures. Reviewed workflows/scripts/lockfile match remote main. The user explicitly retained
main required approvals=0 and last-push approval=false, and authorized deployment self-review.
Created github-pages with internalforces as required reviewer, main branch-only policy and
administrator bypass disabled; fresh API readback verifies all settings. Risk acceptance and
exact evidence are in the [final review](../reports/security-2026-09-18-task-019-final.md).
Earlier active/pending-environment/final-head notes are superseded. Historical application/CVE
assessments remain dated; no new whole-application or independent second review is claimed.
No implementation task is active; TASK-020 remains unactivated. TASK-008 calibration and
TASK-009/010/021 production, publication/recovery and release gates remain open. Only authorized
environment settings and local documentation changed; no source change, commit, push, merge,
workflow dispatch, deployment, publication enablement or handbook access occurred in this pass.


## TASK-019 authorized delivery and deployment prerequisite check — 2026-09-18

The user explicitly requested commit, push and deployment after final Actions acceptance.
Commit and push the eleven TASK-019 closure/evidence documents on the existing
codex/task-019-actions-review branch. Prior local-only statements describe the preparation pass.
Formatting (198 files) and Git whitespace checks pass; application/workflow bytes remain unchanged
from the verified reviewed head, so no additional application test rerun is required.

The deployment request is recorded, but execution is blocked by missing prerequisite evidence,
not missing general deployment permission. Fresh remote-main tree inspection confirms that
publication/config.json remains absent, and repository variable names are empty. The approved
30-Seoul-calendar-day calibration beginning 2026-09-17, derived quality/empty-category policy,
initial baseline and accepted production candidate are still unavailable. The request does not
supply or approve invented numerical policy/baseline values or waive failed validation. Do not
enable publication or dispatch the workflow merely to reproduce its known missing-config failure.
No merge, tag, workflow dispatch or deployment occurs in this delivery pass. TASK-019 stays
complete; production gates remain open under TASK-008/009/010/021.


## TASK-020 activation and completion — 2026-09-18

The user activated and requested execution of the next eligible public-documentation task. Created
`codex/task-020-public-docs` from the clean TASK-019 review checkout and added the root README;
development, data/safety/privacy and deployment/recovery guides; contribution, conduct and
security policies; two issue forms/configuration; and the pull-request template. Updated the
documentation index, FR-09/12 traceability and task records. No handbook content was accessed.

Fresh authenticated readback confirmed GitHub private vulnerability reporting is disabled, so the
security guide uses a minimal public contact request without vulnerability details. Independent
Reviewer Approved after correcting Ubuntu/Info-ZIP and unconditional `verify:full` guidance.
Ubuntu 24.04 pinned full verification passes 797 Vitest, 68 browser and 20 accessibility tests;
links, YAML, formatting, lint, typecheck, build and whitespace checks pass. Evidence is in
reports/test-2026-09-18-task-020.md and reports/review-2026-09-18-task-020.md.

TASK-020 is complete. No application/test/dependency/workflow/configuration, production data,
remote setting, deployment, commit, push, merge or release changed. TASK-008 calibration and
TASK-009/010/021 production/recovery/release gates remain open; no next task is activated.


## TASK-020 authorized delivery — 2026-09-19

The user requested delivery of the completed TASK-020 public documentation through commit,
push, and PR creation. Reused `codex/task-020-public-docs` in `.worktrees/task013-quality`;
its pre-documentation tracked tree matches fetched `origin/main`, despite equivalent commits
having different IDs. No other checkout or untracked work was altered.

Fresh pinned Ubuntu `npm run verify:full` exited 0 with 797 Vitest tests, 68 browser checks,
and 20 accessibility tests. Inline local links, all three issue YAML files, and whitespace
checks passed. The independent 2026-09-18 documentation approval remains recorded; no new
independent review is claimed. Deliver only the twenty TASK-020 documentation/template files
and task/evidence updates. TASK-008 calibration and TASK-009/010/021 gates remain open.
No merge, deployment, publication enablement, workflow dispatch, or release is part of this delivery.


## PR 27 review follow-up — 2026-09-19

Automated PR review raised three P1 findings on `codex/task-020-public-docs`. Fixed all three in
this worktree: `tasks/completed.md` previously claimed no handbook file changed even though the
same task's second commit rewrote `handbook/ko/README.md` (42 additions, 35 deletions) as an
authorized Korean counterpart to the root README — corrected the record to state the change and
note it fell outside the 2026-09-18 review's scope, which excluded `handbook/ko/**`. Translated
the root README's Korean handbook-link sentence to English per the harness language policy. Added
`.github/ISSUE_TEMPLATE/security_contact.yml`, a minimal dropdown-based form, so a reporter can
follow SECURITY.md's minimal-issue instruction while blank issues stay disabled; the issue chooser
now offers three forms plus the SECURITY.md contact link.

Ran `npm run lint`, `npm run format:check`, `npm run typecheck`, and `npm run build` locally on
macOS (not the pinned Ubuntu container) with the locally available Node.js 22.22.3/npm 10.9.8, not
the project's pinned Node.js 24.19.0/npm 11.17.0; all passed. No independent re-review is claimed
for this follow-up. No dependency, workflow, production configuration, deployment, merge, or
release changed.


## PR 27 review follow-up round 2 — 2026-09-19

Automated PR review raised two more findings against the round-1 fix commit. `roadmap.md:47`
still left the M3 documentation checkbox unchecked although TASK-020 already delivered that exact
deliverable, so checked it. `docs/prd-traceability.md`'s Documentation row claimed the 2026-09-18
independent review covered all TASK-020 issue documents, but that review's recorded scope
(`reports/review-2026-09-18-task-020.md`) covers only the two issue forms that existed at the
time, not the round-1 `security_contact.yml` addition or README correction — narrowed the row to
say the follow-up README correction and the security-contact form passed local verification only,
consistent with this file's existing "no independent re-review is claimed" statement above.

Ran `npm run lint`, `npm run format:check`, and `npm run typecheck` locally on macOS with the
locally available Node.js 22.22.3/npm 10.9.8, not the project's pinned Node.js 24.19.0/npm
11.17.0; all passed. No application source, test, dependency, workflow, or production
configuration changed.


## PR 27 review follow-up round 3 — 2026-09-19

Automated PR review raised one more finding against the round-2 fix commit. `memory/project.md`'s
TASK-020 entry — the current-state snapshot every agent loads second, right after `AGENTS.md` —
still said the public documentation was "added and independently reviewed" as one claim spanning
security-reporting and issue documentation. That overstates the 2026-09-18 review's recorded scope,
which predates the round-1 `security_contact.yml` form and README correction. Narrowed the entry
to say the review covered everything except those two follow-up items, which pass local
verification only, matching the wording already corrected in `docs/prd-traceability.md` and this
file's round-2 entry above.

Ran `npm run lint`, `npm run format:check`, and `npm run typecheck` locally on macOS with the
locally available Node.js 22.22.3/npm 10.9.8, not the project's pinned Node.js 24.19.0/npm
11.17.0. Typecheck initially reported errors from untracked duplicate `" 2"`-suffixed files and
a pending `iconv-lite` module gap already present in the working tree; both are unrelated to this
documentation-only change. Confirmed by temporarily relocating the untracked files and rerunning
typecheck, which then showed only the pre-existing `iconv-lite` gap; the files were restored to
their original paths afterward. Lint and format:check passed outright. No application source,
test, dependency, workflow, or production configuration changed.

## PR 27 review follow-up round 4 — 2026-09-19

Reviewed the latest findings against `2e807b6` and corrected both:

- Comment `4052415496`: narrowed `tasks/active.md` to the dated original independent review
  scope. It explicitly excludes the handbook, the later README correction, security-contact
  form, and subsequent documentation corrections from any independent final-head approval claim.
- Comment `4052415499`: reconciled `publication/README.md` with the final TASK-019 review and
  saved settings receipt from 2026-09-18. Both the earlier settings paragraph and the final
  status section now distinguish historical missing protections from the configured reviewer,
  main-only environment policy, disabled administrator bypass, and accepted self-review policy.
  The operator contract links back to the deployment runbook and requires settings readback
  before use. Production configuration, publication and release gates remain open.

This is documentation-only remediation under the user's explicit review/fix/commit/push request.
No application, test, dependency, workflow, repository setting or deployment changed. No new
architecture or policy decision was made, and no independent re-review is asserted. Earlier
full-suite evidence remains historical; application tests were not rerun for these prose changes.
Validation: local Markdown target and changed-anchor checks, review-scope/settings assertions,
`npm run lint`, `npm run format:check`, and `git diff --check` passed. Local inspection used
Node.js 22.22.3/npm 10.9.8, not the pinned application runtime. The previously recorded local
`iconv-lite` typecheck gap is outside this documentation correction; no new typecheck result is
claimed. Only these four documentation/task-record files are included in the delivery.

## PR 27 review follow-up round 5 — 2026-09-19

Reviewed both findings against `c157617` under the user's review/fix/commit/push request:

- `4052445931`: replaced the stale TASK-020 "active task above" reference in `tasks/active.md`
  with its completed-task record. Explicitly retained the absence of an active implementation
  task and the existing independent-review scope limits.
- `4052445932`: added the `handbook/ko/**` Korean-language exception to `CONTRIBUTING.md`,
  with a link to the constitution's language/access boundaries and the handbook's explanatory,
  non-authoritative role. No handbook content was accessed or changed.

Validation: Markdown file targets and the completion anchor, assertions for both requested
corrections, repository lint/format checks and Git whitespace checks passed. Local tooling:
Node.js 22.22.3/npm 10.9.8. This four-file prose-only correction does not change application,
test, dependency, workflow, security policy or deployment settings; no application tests or
independent re-review were run. Prior full-suite evidence remains dated and scoped as recorded.
No new decision or unresolved implementation issue was introduced; existing production and
release gates remain open.


## Calibration status check and authorized delivery — 2026-09-20

The user requested a current-work assessment, calibration status check, completion assessment,
and then a written summary with commit/push. Reused the clean isolated calibration checkout on
`codex/task-008-calibration` at `fe81399`; the GitHub branch matched the local head.

The bounded status check is complete. All four daily observations from September 17 through 20
exist, cover 195 categories, and retain distinct archives. Recomputed archive/report/log hashes
passed all 12 comparisons. September 19 collection occurred at 14:15 KST; its delay cause was
not investigated. Existing receipts retain count/status decreases and no new out-of-scope
reviewed raw-status pairs. The daily automation remains ACTIVE at 09:00.

The scheduled Pages refresh failed at the reviewed-quality-configuration prerequisite and
skipped deployment; daily non-publishing observation nevertheless completed. Overall TASK-008
remains incomplete. October 16 is day 30, followed by evidence assessment, explicit policy/empty
list/baseline approval, accepted validation and independent final review. No task was moved to
completed and no architecture, source/status rule, application code or automation changed.

See [the status-check report](../reports/review-2026-09-20-calibration-status.md). Delivery scope
is only this report and session entry, under the user's explicit commit/push instruction.
No merge or deployment is included. Application tests were not rerun for this prose-only change.

Delivery checks passed: local report-link resolution, repository lint (five pre-existing
informational suggestions), formatting, and Git whitespace validation.
