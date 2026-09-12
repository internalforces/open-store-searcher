<!--
Purpose:        Track the single active implementation task and its acceptance criteria
Owner:          Implementer / Planner
Update Trigger: When a task starts, is blocked, completes, or changes owner
Harness Version: 1.1
-->

# Active Tasks — open-store-searcher

_Last updated: 2026-09-12_

## In Progress

TASK-008 is the sole active task for production observation and quality/bootstrap review,
explicitly resumed by the user on 2026-09-12. Collection-date mode remains authoritative.
Use the existing approved Ubuntu collector/parser to obtain aggregate observations before
proposing thresholds; no synthetic bootstrap, automatic policy approval or deployment.
TASK-009/010 are paused while this prerequisite is resolved, then resume sequentially.

Actual collection exposed and resolved an Ubuntu ZIP filename-decoding bug. Full Ubuntu
verification now passes 639/68/20. Body observation then found a CP949 extension decoder gap;
the complete member is valid CP949, while native Node EUC-KR cannot preserve it. The concrete
build-only dependency/strict-decoding proposal is awaiting human approval, not yet installed.
See [resumption evidence and proposal](../reports/research-2026-09-12-quality-resumption.md).
No complete metrics, calibrated policy or baseline is available yet. Intermittent hosted
provider connection timeouts are also recorded; do not infer daily reliability from PR CI.

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
2026-09-09; overall TASK-019 remains deferred/incomplete for AC-019-8, the actual Actions review.
See its [acceptance checklist](completed.md#task-019-acceptance-criteria-and-evidence) and
[unfinished criterion](backlog.md#task-019-unfinished-actions-criterion).
See the [TASK-019 security report](../reports/security-2026-09-09-task-019.md).
No actionable vulnerability was confirmed in current code; production and Actions review gates
remain open for TASK-009/010/021. TASK-020 remains in backlog and is not activated.

## Active prerequisite — incomplete

The 2026-09-08 hold was lifted by the user's explicit resumption request on 2026-09-12.
Preserve the previous implementation and evidence. Production observation/review is active;
source coverage is still unverified under the approved collection-date interpretation.


### TASK-008: Validate staged refreshes and freshness evidence

- Owner: Planner / Researcher for remaining production evidence; staged implementation verified
- Priority: High
- Milestone: M1
- Size: L
- Related requirements: FR-08, FR-13, FR-14; data-quality and freshness NFRs
- Status: Staged implementation and full verification passed; production evidence gates remain open
- Authorization: User requested execution of TASK-008 on 2026-09-04.
- Description: Validate complete staged inputs, identity/schema integrity, count and missing-value
  changes, aggregate-status drift, coverage dates, and JSON syntax/UTF-8 size.
- Dependencies: Completed TASK-005, TASK-006, TASK-007; accepted ADR-009 through ADR-013.
- Risks: Source PRD unavailable on this host; production row parser, source-cut evidence,
  baseline/calibrated limits, and public JSON schema are not yet available.
- Acceptance criteria:
  - [x] Inspect accepted contracts and produce a concrete design with a requirements/test matrix.
  - [x] Separate sourced freshness facts from unsupported ZIP-date and row-timestamp inference.
  - [x] Obtain approval of ADR-014 and the date-only seven-day warning convention.
  - [x] Implement the staged validator and freshness/JSON helpers with offline test-first evidence.
  - [ ] Resolve production coverage evidence and reviewed thresholds/baseline without defaults.
  - [ ] Obtain source PRD or explicit direction to use current traceability as the design baseline.
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
