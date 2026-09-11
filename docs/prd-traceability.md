<!--
Purpose:        Connect PRD requirements to milestones, tasks, and verification evidence
Owner:          Planner / Reviewer
Update Trigger: When the PRD, task scope, tests, or release status changes
Harness Version: 1.1
-->

# PRD Traceability Matrix — open-store-searcher

_Last updated: 2026-09-04_

## Usage Rules

- When work starts, change the related row to In progress and add pull request or report links as evidence.
- Implementation alone is insufficient for Done. Related automated and manual verification plus Reviewer confirmation are required.
- Obtain human approval and update the PRD or ADR before implementing a change that alters PRD meaning.
- Do not use `handbook/ko/**` as implementation or release evidence. At each milestone close, track its update-or-review and human-language-review gate through TASK-026.

## P0 Functional Requirements

| Requirement | Summary | Tasks | Verification and evidence | Status |
|---|---|---|---|---|
| FR-01 | Business-name or address input | TASK-011, 014 | TASK-011 pure input validation/projection and fixtures: reports/test-2026-09-05-task-011.md; actual input UI remains TASK-014 | In progress |
| FR-02 | In-browser search | TASK-011, 012 | TASK-011 input and TASK-012 pure search pass real-engine browser tests in four projects with no query I/O; reports/test-2026-09-05-task-012.md; product UI/data integration pending | In progress |
| FR-03 | Name and address candidate ranking | TASK-012, 013 | TASK-012 S01–S10 synthetic ranking/conflict/Top-3 evidence and independent approval: reports/test-2026-09-05-task-012.md; TASK-013 realistic recall pending | In progress |
| FR-04 | Four display statuses | TASK-007, 014 | Accepted ADR-013 and `reports/test-2026-09-04-task-007.md`: exact mapper, schema V2 integration, 86 unit tests and 100% mapper coverage; result-card UI remains pending | In progress |
| FR-05 | Raw status evidence | TASK-006, 014 | TASK-006 accepted: implementation and synthetic tests preserve raw operating/detailed code/name pairs without mapping; pinned verification and independent review passed; result-card UI remains pending | In progress |
| FR-06 | Basic information and dates | TASK-006, 014 | TASK-006 accepted: lossless display/lifecycle fields, search-only normalization, full-digest internal identifiers, representative schemas, and missing-value tests passed; UI remains pending | In progress |
| FR-07 | Fail-safe uncertainty handling | TASK-007, 012, 015 | `reports/test-2026-09-04-task-007.md`: unknown, partial, contradictory, whitespace, Unicode and empty-stage regressions pass; TASK-012 conflict/ambiguity/name-only separation passes S04–S08 in reports/test-2026-09-05-task-012.md; UX integration remains pending | In progress |
| FR-08 | Data as-of date | TASK-008, 014 | Accepted ADR-014; `reports/test-2026-09-04-task-008.md` V08–V09 verify archive-bound coverage and reject unsupported timestamps; production evidence and UI pending | In progress |
| FR-09 | Always-accessible source and disclaimer | TASK-004, 014, 020 | ADR-009 approves a candidate; the source-contract report and `reports/source-permission-manifest-2026-08-28.json` verify permission and provenance across 195 categories; UI and public documentation remain pending | In progress |
| FR-10 | Naver and Kakao search links | TASK-016 | URL encoding and new-window security tests | Complete; TASK-016 test/review reports in .worktrees/task013-quality (Naver compatibility limitation accepted) |
| FR-11 | Responsive mobile and desktop UI | TASK-014, 017 | TASK-017: 320/768/1280px doubled-text reflow, long queries, visible candidate headings and native Chrome200% inspection; see [verification](../.worktrees/task013-quality/reports/test-2026-09-08-task-017.md) in the delivery revision. | Verified; TASK-017 complete |
| FR-12 | No collection of personal or usage data | TASK-019 | Current-code security review complete; 598 Vitest, 68 browser and 20 accessibility tests pass. See reports/security-2026-09-09-task-019.md in .worktrees/task013-quality. Production/workflow release checks remain open. | Verified (current synthetic application) |
| FR-13 | Preserve previous data after refresh failure | TASK-005, 008 through TASK-010, 015 | TASK-005 independent final approval confirms the fail-closed staged collector, 195-entry schema contract, changed/unchanged outcomes, rejected-body cancellation including cleanup failures, early retrieval-evidence validation, and non-publication boundary; last-known-good replacement and workflow failure injection remain pending | In progress |
| FR-14 | Warning when data age reaches seven Seoul calendar days | TASK-008, 015 | ADR-015 supersedes the ADR-014 age boundary; V09–V10 and observation-report tests verify age >= 7, unknown coverage and unchanged-archive aging; shared helper 100% coverage, UI pending | In progress |

The official cutoff/comparison follow-up is recorded in
`reports/research-2026-09-04-task-008-cutoff-comparison.md` and independently approved in
`reports/review-2026-09-04-task-008-cutoff-comparison.md`. Current official API date definitions do
not establish the file ZIP's cutoff/timezone (FR-08). A repeated identical archive does not advance
coverage or calibrate drift (FR-13/14). These gates remain open; no production baseline was created.

TASK-008's FR-13 validation contract is recorded in
`docs/superpowers/specs/2026-09-04-task-008-validation-design.md` and
`reports/test-2026-09-04-task-008.md`. Synthetic V01–V13 verification and full gates passed;
production source-cut/policy evidence and TASK-009 last-known-good publication/recovery remain open.

Accepted ADR-017 adds exact six-pair vocabulary recognition with unchanged FR-04/07 unverified
status, explicit historical V1 compatibility and V2 policy/baseline/report hashes. Verification is
in `reports/test-2026-09-04-task-008-vocabulary.md`; the offline derivation retains FR-08/13/14
source-cut/policy/bootstrap review diagnostics and is not another temporal observation.

The original PRD was recovered on the Mac on 2026-09-04; its hash and requirement comparison
are recorded in `reports/research-2026-09-04-task-008-macos-continuation.md`. The user accepted
ADR-015 to reconcile FR-14 with the original age >= 7 requirement. Constitution, helper, and
Seoul-midnight integration tests now use that boundary. Research observation is implemented
under `docs/superpowers/specs/2026-09-04-task-008-observation-design.md`; it cannot publish or
supply missing source-cut/policy evidence. Its same-budget live retry rejected strict body decoding
for category 15045028 (DEBT-010); no production baseline exists. See
`reports/test-2026-09-04-task-008-observation.md`.

## P1 Functional Requirements

| Requirement | Summary | Tasks | Start condition | Status |
|---|---|---|---|---|
| FR-15 | Identifier-based share URL | TASK-022 | P0 stable and search terms excluded | Deferred |
| FR-16 | Candidate-list keyboard navigation | TASK-017, 023 | TASK-017 named lists, explicit result focus, forward/reverse evidence and source/map links verified in four browser projects; [verification](../.worktrees/task013-quality/reports/test-2026-09-08-task-017.md). Enhanced selection remains TASK-023. | Baseline verified including assisted AT; TASK-023 pending |
| FR-17 | Regional expansion outside Seoul | TASK-024 | Seoul performance and quality verified | Deferred |

## Non-Functional and Release Gates

| Area | Criterion | Tasks | Evidence | Status |
|---|---|---|---|---|
| Cost | Zero mandatory monthly cost and no payment method | TASK-001, 002, 003, 010, 021 | Dependency, license, static-build, and deployment audit; TASK-002 reports plus TASK-003 dependency-license report and independent Tester PASS / Reviewer APPROVED reports | In progress |
| Search quality | Exact name-and-address Top-3 recall >= 90% | TASK-013, 021 | Benchmark report | Planned |
| Refresh reliability | Success rate >= 95% over the last 30 days | TASK-010, 021 | Actions run history | Planned |
| Freshness | As-of date within seven days during normal operation | TASK-008, 015 | TASK-008 helper and staged validator tests pass for reviewed coverage, unknown/stale distinction, and regression checks; production evidence remains unresolved | In progress |
| Performance | Primary/LCP 2.5 s, complete search plus visible page 500 ms, code 300 KB | TASK-018; TASK-021 release gate | [Paginated measurement](../.worktrees/task013-quality/reports/performance-2026-09-08-task-018-paginated.md) and [review](../.worktrees/task013-quality/reports/review-2026-09-08-task-018-paginated.md) | All lab budgets pass; production/release gates remain open |
| Accessibility | Baseline WCAG 2.1 AA, zero critical automated errors | TASK-003, 017, 021 | TASK-003 Vitest/Playwright configuration, `reports/test-2026-08-24-task-003.md` PASS, and `reports/review-2026-08-24-task-003.md` APPROVED establish the automated foundation; product-level automated and manual audit remains pending | In progress |
| Privacy | Zero collection of search terms or behavior | TASK-019, 021 | TASK-019 static/runtime review complete; production and Actions checks retained for release. | Verified (current application); release pending |
| Safety | Zero missing-result-to-closed or new-code auto-mappings | TASK-007, 013, 021 | TASK-007 exact-pair and empty-stage regressions pass; search and release gates remain pending | In progress |
| Recovery | Preserve last known-good data after validation failure | TASK-009, 010, 021 | Failure-injection tests | Planned |
| Documentation | Public setup, deployment, source, disclaimer, and milestone handbook review | TASK-020, 021, 025, 026 | M0 TASK-026 handbook review record and human approval complete; public-documentation checklist remains pending TASK-020 and TASK-021 | In progress |

## Human Handbook Governance

TASK-025 establishes the separate Korean human-facing handbook and its Pre-M0 explanatory baseline. It does not mark any product FR as implemented. TASK-026 recurs after each milestone's implementation, tests, and role reviews; it records affected handbook files as Updated or Reviewed without change and requires human Korean-language review before final milestone closure.

## Fixed-Copy Verification

The Reviewer verifies that the following meanings remain consistent throughout the product.

- `행정상 영업` (administratively operating) does not mean the business is open at the current moment.
- No matching data does not mean that a business is closed.
- When data refresh is delayed, show the as-of date and recommend additional verification.

TASK-008 encoding follow-up: `reports/research-2026-09-04-task-008-encoding.md` establishes the
FR-13 ingestion blocker as native decoder mismatch using hash-bound complete target-file
comparisons and exhaustive synthetic standard mappings. The user accepted ADR-016; eight new regression tests and pinned full verification (433 tests)
plus independent review verify the correction. The subsequently verified disk observer completed
all 195 files / 2,936,760 rows; see `reports/research-2026-09-04-task-008-first-complete-observation.md`
and its aggregate/audit evidence. Pinned full verification passes 501 tests plus four browser and
two accessibility tests. FR-08 source-cut evidence, exact new-vocabulary review, calibrated limits,
public JSON budget and bootstrap acceptance remain open; TASK-008 is not closed and TASK-009
is not activated.


## TASK-015 completion evidence — 2026-09-07

Bounded internal synthetic UI recovery completed and independently Approved in
`.worktrees/task013-quality`. See its `reports/test-2026-09-07-task-015.md` and
`reports/review-2026-09-07-task-015.md` for FR-07/13/14 evidence: 522 tests, 28 browser checks,
14 zero-violation axe scans. Production source-cut/atomic publication gates remain open.


### TASK-017 activation — 2026-09-08

FR-11, baseline FR-16 and PRD Section 14.3 are active in TASK-017. Static gap audit is complete;
concrete bounded design approval precedes implementation. Existing TASK-014/015/016 verification
is historical evidence, not TASK-017 acceptance. Candidate-list semantics, accessible identity,
status/error/recovery flow, complete keyboard navigation and zoom/reflow verification are pending.
Actual screen-reader observation must be reported separately from automated accessibility checks.
TASK-023 retains later enhanced candidate navigation. No milestone or release gate is closed.

### TASK-017 implementation evidence — 2026-09-08

The activation note above is historical. User approved design; implementation and pinned full
verification now pass 561/56/18 (22 axe scans). Native Chrome200% inspection passes after the
reproduced tall-card focus correction. Actual VoiceOver observation remains pending; do not
mark Section 14.3 fully accepted or close TASK-017 solely from automated tests.


### TASK-017 assisted AT closure — 2026-09-08

The pending manual gate above is historical. [User-assisted VoiceOver evidence](../.worktrees/task013-quality/reports/voiceover-2026-09-08-task-017.md)
records seven passing cases for labels/lists/evidence, repeated and safe result announcements,
errors, retry/recovery, retained data and source/map keyboard navigation. Together with the
reviewed implementation and existing full verification this closes TASK-017 for FR-11,
baseline FR-16 and its Section 14.3 scope. TASK-023 enhancements and production/milestone
gates remain separate. No universal WCAG conformance or untested AT combination is claimed.


### TASK-018 optimization verification — 2026-09-08

FR-02/03/07/12/13 and PRD 12.2/14.2 continuation is implemented with FR-11/16 preserved.
[Optimized evidence](../.worktrees/task013-quality/reports/performance-2026-09-08-task-018-optimized.md) and
[independent approval](../.worktrees/task013-quality/reports/review-2026-09-08-task-018-optimized.md) record 594/64/18 passing checks
and 4,484 equivalent results. This closes the bounded implementation, not the 500 ms search,
production-data or release acceptance gates. TASK-008 remains on hold.

### TASK-018 result-page acceptance

User-approved 20-item pages preserve FR-03/07/11/16 while satisfying measured PRD 14.2 budgets.
All 24 first-result search cells and 16 applicable navigation groups pass 500 ms; no large-search
cells remain skipped. Correctness 598/68/20 and independent approval support bounded completion.
Earlier rendering-gap notes are historical; full-DOM and production certification are not claimed.
