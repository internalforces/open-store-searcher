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
| FR-01 | Business-name or address input | TASK-011, 014 | TASK-011 pure input validation/projection and fixtures: reports/test-2026-09-05-task-011.md; actual input UI is verified in TASK-014 TASK-014 evidence: TASK-014 actual form/example/Enter and invalid-input integration passed U07; reports/test-2026-09-06-task-014.md. Production integration remains separate. | In progress |
| FR-02 | In-browser search | TASK-011, 012 | TASK-011 input and TASK-012 pure search pass real-engine browser tests in four projects with no query I/O; reports/test-2026-09-05-task-012.md; production data integration pending TASK-014 evidence: TASK-014 U08 actual form privacy sentinels passed across four browser projects; production data integration remains pending. | In progress |
| FR-03 | Name and address candidate ranking | TASK-012, 013 | TASK-012 S01–S10 synthetic ranking/conflict/Top-3 evidence and independent approval: reports/test-2026-09-05-task-012.md; TASK-013 synthetic 28/30 and reviewed 100-target source 98/100 with zero safety failures: reports/test-2026-09-05-task-013.md; UI and production integration remain separate TASK-014 evidence: TASK-014 U05 renders engine ordering and ambiguity without rescoring; production data integration remains pending. | In progress |
| FR-04 | Four display statuses | TASK-007, 014 | Accepted ADR-013 and `reports/test-2026-09-04-task-007.md`: exact mapper, schema V2 integration, 86 unit tests and 100% mapper coverage; TASK-014 result-card UI is verified TASK-014 evidence: TASK-014 U01 four-status card and real-browser submissions passed; production data integration remains pending. | In progress |
| FR-05 | Raw status evidence | TASK-006, 014 | TASK-006 accepted: implementation and synthetic tests preserve raw operating/detailed code/name pairs without mapping; pinned verification and independent review passed; TASK-014 result-card UI is verified TASK-014 evidence: TASK-014 U01 literal raw aggregate/detail evidence and inert HTML component tests passed; production integration remains pending. | In progress |
| FR-06 | Basic information and dates | TASK-006, 014 | TASK-006 accepted: lossless display/lifecycle fields, search-only normalization, full-digest internal identifiers, representative schemas, and missing-value tests passed; TASK-014 UI is verified; production integration remains pending TASK-014 evidence: TASK-014 U02 both original addresses, categories, all eight lifecycle fields and missing-value rendering passed. PR #15 R2–R5 regressions: reports/review-2026-09-06-pr15.md. | In progress |
| FR-07 | Fail-safe uncertainty handling | TASK-007, 012, 015 | `reports/test-2026-09-04-task-007.md`: unknown, partial, contradictory, whitespace, Unicode and empty-stage regressions pass; TASK-012 conflict/ambiguity/name-only separation passes S04–S08 in reports/test-2026-09-05-task-012.md; TASK-014 basic UX is verified; TASK-015 recovery remains pending TASK-014 evidence: TASK-014 U05 conflict/tie/low/medium/empty separation passed; TASK-015 recovery UX remains pending. TASK-015 recovery and actionable empty/low-confidence UI: reports/test-2026-09-07-task-015.md (T15-02/05/06/07). No missing-result or conflict status reclassification. | In progress |
| FR-08 | Data as-of date | TASK-008, 014 | Accepted ADR-014; `reports/test-2026-09-04-task-008.md` V08–V09 verify archive-bound coverage and reject unsupported timestamps; production evidence pending; TASK-014 UI is verified TASK-014 evidence: TASK-014 U03 synthetic/verified/unavailable page/card coverage rendering passed; production source-cut evidence remains pending. | In progress |
| FR-09 | Always-accessible source and disclaimer | TASK-004, 014, 020 | ADR-009 approves a candidate; the source-contract report and `reports/source-permission-manifest-2026-08-28.json` verify permission and provenance across 195 categories; TASK-014 UI is verified; public documentation remains pending TASK-014 evidence: TASK-014 U04 persistent page/card provenance and disclaimer passed; production/public documentation remains pending. PR #15 R2–R5 regressions: reports/review-2026-09-06-pr15.md. | In progress |
| FR-10 | Naver and Kakao search links | TASK-016 | [URL encoding, protected new-tab navigation and full verification](../reports/test-2026-09-07-task-016.md); [independent Approved review](../reports/review-2026-09-07-task-016.md) | Complete (Naver compatibility limitation accepted) |
| FR-11 | Responsive mobile and desktop UI | TASK-014, 017 | TASK-017: 320/768/1280px doubled-text reflow, long queries, visible candidate headings and native Chrome200% inspection; see [verification](../reports/test-2026-09-08-task-017.md) in the delivery revision. | Verified; TASK-017 complete |
| FR-12 | No collection of personal or usage data | TASK-019 | Current-code security review complete; 598 Vitest, 68 browser and 20 accessibility tests pass. See the [TASK-019 security report](../reports/security-2026-09-09-task-019.md). Production/workflow release checks remain open. | Verified (current synthetic application) |
| FR-13 | Preserve previous data after refresh failure | TASK-005, 008 through TASK-010, 015 | TASK-005 independent final approval confirms the fail-closed staged collector, 195-entry schema contract, changed/unchanged outcomes, rejected-body cancellation including cleanup failures, early retrieval-evidence validation, and non-publication boundary; last-known-good replacement and workflow failure injection remain pending TASK-015 internal UI preserves the accepted dataset/results after loader or presentation-validation failure (T15-03/06); reports/test-2026-09-07-task-015.md. TASK-008 production evidence and TASK-009/010 atomic publication/workflow gates remain open. | In progress |
| FR-14 | Warn at seven Seoul calendar days or older | TASK-008, 014, 015 | Current user-approved ADR-015 boundary is age >= 7. PR #15 R1 UI tests cover days 6/7/8, Seoul midnight, focus/visibility and unavailable/rejected dates; reports/review-2026-09-06-pr15.md. V1 historical pipeline semantics remain unchanged; full recovery and production evidence stay gated. TASK-015 preserves >=7 Seoul-day warnings and separates actual browser load time from coverage (T15-03/04/08); reports/test-2026-09-07-task-015.md. Existing PR15 6/7/8-day and clock regressions remain. Production coverage is still gated. | In progress |

TASK-008's FR-13 validation contract is recorded in
`docs/superpowers/specs/2026-09-04-task-008-validation-design.md` and
`reports/test-2026-09-04-task-008.md`. Synthetic V01–V13 verification and full gates passed;
production source-cut/policy evidence and TASK-009 last-known-good publication/recovery remain open.

## P1 Functional Requirements

| Requirement | Summary | Tasks | Start condition | Status |
|---|---|---|---|---|
| FR-15 | Identifier-based share URL | TASK-022 | P0 stable and search terms excluded | Deferred |
| FR-16 | Candidate-list keyboard navigation | TASK-017, 023 | TASK-017 named lists, explicit result focus, forward/reverse evidence and source/map links verified in four browser projects; [verification](../reports/test-2026-09-08-task-017.md). Enhanced selection remains TASK-023. | Baseline verified including assisted AT; TASK-023 pending |
| FR-17 | Regional expansion outside Seoul | TASK-024 | Seoul performance and quality verified | Deferred |

## Non-Functional and Release Gates

| Area | Criterion | Tasks | Evidence | Status |
|---|---|---|---|---|
| Cost | Zero mandatory monthly cost and no payment method | TASK-001, 002, 003, 010, 021 | Dependency, license, static-build, and deployment audit; TASK-002 reports plus TASK-003 dependency-license report and independent Tester PASS / Reviewer APPROVED reports | In progress |
| Search quality | Exact name-and-address Top-3 recall >= 90% | TASK-013, 021 | reports/test-2026-09-05-task-013.md; source 98/100, synthetic 28/30, independent source replay; snapshot scope only | Verified for TASK-013 |
| Refresh reliability | Success rate >= 95% over the last 30 days | TASK-010, 021 | Actions run history | Planned |
| Freshness | As-of date within seven days during normal operation | TASK-008, 015 | TASK-008 helper and staged validator tests pass for reviewed coverage, unknown/stale distinction, and regression checks; production evidence remains unresolved | In progress |
| Performance | Primary/LCP 2.5 s, complete search plus visible page 500 ms, code 300 KB | TASK-018; TASK-021 release gate | [Paginated measurement](../reports/performance-2026-09-08-task-018-paginated.md) and [review](../reports/review-2026-09-08-task-018-paginated.md) | All lab budgets pass; production/release gates remain open |
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


## PR #14 regression evidence — 2026-09-05

FR-03/07 and TASK-013 Q07/Q08: reports/review-2026-09-05-pr14.md maps the three review findings
to parser, actual-source candidate and CLI audit-binding regressions. Pinned full verification
passes 455 tests, eight browser tests and two accessibility scans; unchanged corpora retain
28/30 synthetic and 98/100 source Top-3 recall with zero safety failures. No release gate expands.


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

The pending manual gate above is historical. [User-assisted VoiceOver evidence](../reports/voiceover-2026-09-08-task-017.md)
records seven passing cases for labels/lists/evidence, repeated and safe result announcements,
errors, retry/recovery, retained data and source/map keyboard navigation. Together with the
reviewed implementation and existing full verification this closes TASK-017 for FR-11,
baseline FR-16 and its Section 14.3 scope. TASK-023 enhancements and production/milestone
gates remain separate. No universal WCAG conformance or untested AT combination is claimed.


## PR #18 review remediation — 2026-09-08

FR-16 / PRD Section 14.3 follow-up: PR #18 duplicate-identity and overlapping-announcement regressions resolved with displayed positions and independent warnings. Pinned full checks 564/56/18 passed; exact tests and manual-evidence limit in [PR #18 review](../reports/review-2026-09-08-pr18.md).


### TASK-018 optimization verification — 2026-09-08

FR-02/03/07/12/13 and PRD 12.2/14.2 continuation is implemented with FR-11/16 preserved.
[Optimized evidence](../reports/performance-2026-09-08-task-018-optimized.md) and
[independent approval](../reports/review-2026-09-08-task-018-optimized.md) record 594/64/18 passing checks
and 4,484 equivalent results. This closes the bounded implementation, not the 500 ms search,
production-data or release acceptance gates. TASK-008 remains on hold.

### TASK-018 result-page acceptance

User-approved 20-item pages preserve FR-03/07/11/16 while satisfying measured PRD 14.2 budgets.
All 24 first-result search cells and 16 applicable navigation groups pass 500 ms; no large-search
cells remain skipped. Correctness 598/68/20 and independent approval support bounded completion.
Earlier rendering-gap notes are historical; full-DOM and production certification are not claimed.
