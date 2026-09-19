<!--
Purpose:        Connect PRD requirements to milestones, tasks, and verification evidence
Owner:          Planner / Reviewer
Update Trigger: When the PRD, task scope, tests, or release status changes
Harness Version: 1.1
-->

# PRD Traceability Matrix — open-store-searcher

_Last updated: 2026-09-18_

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
| FR-09 | Always-accessible source and disclaimer | TASK-004, 014, 020 | ADR-009 approves a candidate; the source-contract report and `reports/source-permission-manifest-2026-08-28.json` verify permission and provenance across 195 categories; TASK-014 U04 verifies persistent page/card provenance and disclaimer; TASK-020 adds reviewed public source/safety documentation. Production publication remains pending. | In progress |
| FR-10 | Naver and Kakao search links | TASK-016 | [URL encoding, protected new-tab navigation and full verification](../reports/test-2026-09-07-task-016.md); [independent Approved review](../reports/review-2026-09-07-task-016.md) | Complete (Naver compatibility limitation accepted) |
| FR-11 | Responsive mobile and desktop UI | TASK-014, 017 | TASK-017: 320/768/1280px doubled-text reflow, long queries, visible candidate headings and native Chrome200% inspection; see [verification](../reports/test-2026-09-08-task-017.md) in the delivery revision. | Verified; TASK-017 complete |
| FR-12 | No collection of personal or usage data | TASK-019, 020 | Current-code and Actions security reviews are complete; see the [application review](../reports/security-2026-09-09-task-019.md) and [final Actions review](../reports/security-2026-09-18-task-019-final.md). TASK-020 independently reviewed documentation covers browser-only query handling and the external-map click boundary. | Verified (current application, Actions, and public documentation); release pending |
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
| Documentation | Public setup, deployment, source, disclaimer, and milestone handbook review | TASK-020, 021, 025, 026 | TASK-020 public README, development, data/safety, deployment/recovery, contribution, conduct, security, issue and PR documents pass [verification](../reports/test-2026-09-18-task-020.md) and [independent review](../reports/review-2026-09-18-task-020.md). Later milestone handbook and TASK-021 release checks remain open. | TASK-020 complete; release gates pending |

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

## TASK-009/010 design activation — 2026-09-12

FR-13 publication/recovery and Section 12.3 workflow work is in design. The
[publication specification](superpowers/specs/2026-09-12-task-009-010-publication-design.md)
links AC-009-1 through AC-010-5 to failure-injection, complete-artifact, privacy, hosted deployment
and reliability evidence. These are proposed acceptance checks, not passing results.
TASK-008 remains held, TASK-009 is the sole active task, and TASK-010 follows sequentially.
Production and release statuses remain open; no completion or Actions waiver is recorded.

## Collection-date implementation evidence — 2026-09-12

FR-08/13/14 now have an explicit user-approved collection-date branch with unverified source
coverage, date-basis-matching validation and >=7 Seoul-day collection warnings. FR-13 staging
and deployed-baseline byte binding are implemented, with injected partial-write/lock/corruption
failures preserving previous state. Section 12.3 has daily/manual trusted Actions preparation
and guarded same-run Pages publication; FR-12 has a read-only CI boundary and author security
review. Evidence: [test report](../reports/test-2026-09-12-task-009-010.md) and
[Actions self-review](../reports/security-2026-09-12-task-009-010.md).

Pinned verify passes 636 tests and a11y passes 20. Full verification fails two Windows WebKit
cases reproduced at the unchanged base; hosted runs and recovery, reviewed real-data config,
production performance and independent approval remain open. No requirement is marked Done
from this foundation, and TASK-019 AC-019-8 is not waived. TASK-008's real-data criteria remain held.

## TASK-009/010 approved-runner evidence — 2026-09-12

FR-08/12/13/14: reports/test-2026-09-12-publication-hosted.md records successful actual Ubuntu
PR verification (638 Vitest, 68 browser, 20 accessibility). This closes the local/approved-runner
full-verification gap, not production integration or publication/recovery/reliability gates.
Actual account review and pending remedies are in reports/security-2026-09-12-publication-settings.md;
independent review and TASK-019 AC-019-8 approval remain open.

## TASK-008 resumed source observation — 2026-09-12

FR-08/13/14: the user resumed real-data quality review. Ubuntu filename regression is resolved
and full verification passes 639/68/20 (run 34692123385). Complete archive metrics remain blocked
by CP949 decoder support and intermittent hosted connection failures. See
reports/research-2026-09-12-quality-resumption.md; it includes actual source receipts and the
pending dependency proposal. No production threshold/baseline, source freshness, task completion
or release reliability criterion is inferred from these observations.

### FR-08 / FR-13 decoding and resource evidence — 2026-09-12

Strict CP949 preservation is verified by the exact regression matrix in
reports/test-2026-09-12-cp949.md and Ubuntu 647/68/20. Actual observation decoded 127 categories
without parser errors before heap exhaustion. No complete transformation, quality baseline or
publication acceptance follows from those partial observations. Bounded research inventory
is explicit about validation not running; provider connection failures prevent full replay.

## TASK-008 full-source and bounded processing evidence — 2026-09-12

FR-08/13/14: the approved Ubuntu parser inventory completed all 195 categories (2,939,947 rows;
zero parser errors). The final bounded local producer retains global identity/collision and
quality/date/baseline gates and reproduces all measured metrics and exact bytes. Regression
coverage includes iterator boundaries, multi-flush byte parity, duplicates, incomplete input,
policy/size failures, intermediate/metadata corruption and previous-release preservation.
See reports/test-2026-09-12-bounded-source.md and its linked aggregate/resource/browser evidence.

The actual browser load crashes on the 2.44 GB single asset. Reviewed policy/baseline, 05/06
source-pair treatment, independent release review, protection, deployment,
recovery and thirty-day reliability remain open. No requirement is marked Done from this pass.

Ubuntu source run 34695738766 at fbb2d65 completes all 195 categories and 2,939,947 rows in
910,348 ms at 2,265,876 KiB peak Node RSS with unchanged runner settings and exact local
dataset/validation parity. Full CI 34695740858 passes 668 unit, 68 browser and 20 accessibility
checks. This closes the bounded producer's hosted measurement gap, not the release gates above.


## PR #21 review remediation — 2026-09-13

FR-08/14: collection-mode reload/footer instructions now name the collection date while
retaining unknown source coverage; verified-date instructions retain their existing wording.
FR-13: oversized descriptor and combined-site failures cannot promote a site or replace prior
output. Dataset-level source attribution covers the complete archive and category links remain
unchanged. See [PR #21 review remediation](../reports/review-2026-09-13-pr21.md).
Production size/browser feasibility and TASK-008/009/010 remain incomplete.


## PR #22 bounded FR-13 follow-up

The deployed descriptor now points to the actual digest-addressed dataset file. Real-build
regression verifies each file/hash/length and baseline-reader consumption; path mismatch,
absolute URL and traversal are rejected. Evidence: reports/review-2026-09-13-pr22.md.
This advances AC-009-5 evidence without claiming hosted recovery or overall release completion.


## TASK-008 compact delivery evidence — 2026-09-14

FR-02/03/07/12: Worker-owned projections, unchanged scoring and complete ranked references return
Top-3/full counts/uncertainty and requested pages. Full-source district/name/address/absent oracle
parity, source-corpus 100-query parity and lifecycle tests are linked in
[compact verification](../reports/test-2026-09-14-compact-delivery.md).
FR-08/14: exact raw status/date evidence, collection uncertainty and matching baseline dates persist.
FR-13: manifest/block hashes, versions, references, complete ranges and global IDs fail closed;
staging/build failures preserve prior-good output and copied-site size remains enforced.
Privacy: query/page actions generate no data requests; no persistent database or service is added.
Local source feasibility improves; TASK-008/009/010 and production/release acceptance remain open.


## TASK-008 operational verification — 2026-09-16

FR-02/03/08/12/13/14 and performance NFR: the user activated a bounded continuation covering
actual-source mobile emulation, read-only hosted prerequisites and a quality/bootstrap decision
packet. [Operational evidence](../reports/verification-2026-09-16-task-008-operations.md) links
the separate streams. PR #23 is merged; ordinary hosted `verify:full` passes on its identical
merged tree (755 Vitest, 68 browser, 20 accessibility checks). This supersedes ordinary hosted
CI-pending notes for compact implementation; it does not certify a hosted full-source release.
No requirement or milestone is marked Done. Production performance, quality policy/baseline,
status-pair review, source evidence disposition and TASK-009/010 publication/recovery remain open.


### Operational evidence result — 2026-09-17

The linked actual-source run records 49.24 s readiness, 566.4 ms broad search (target exceeded),
2.956 GB sampled browser-tree RSS and a censored not-ready slow-network observation at 60 s.
Worker CPU throttle coverage and physical/hosted performance remain unverified; shell-window
LCP is not a final-page LCP pass. The original PRD is now accessible and compared. The exact
quality decision packet retains all unknown states and adopts no policy or baseline. Overall
FR and release statuses remain open; these results do not authorize publication.


## TASK-008 reviewed-unverified pair acceptance — 2026-09-17

FR-04/07/13 and V06: the user-approved exact 05/06/category contract permits reviewed
unverified literals without changing any display classification or raw/unknown metrics.
Unlisted, partial or mismatched pairs still require review; malformed contracts reject.
The actual staging/configuration path preserves other validation gates and prior good bytes.
See [design](../docs/superpowers/specs/2026-09-17-task-008-reviewed-pairs.md) and
[verification](../reports/test-2026-09-17-task-008-reviewed-pairs.md).
This bounded change does not mark a whole FR, TASK-008 or release complete. Numerical
policy, allowed empties, baseline and overall operational acceptance remain open.

## TASK-008 quality calibration activated — 2026-09-17

FR-08/13/14: the user selected the completion plan's recommended ownership and activated its
30-Seoul-calendar-day distinct-archive calibration protocol. The first current complete
observation covers all 195 categories and 2,941,453 rows. It retains the same 23 empty categories,
no category-count decrease, and a one-row suspended-status correction from 2026-09-13. See the
[calibration receipt](../reports/calibration-2026-09-17-task-008.md) and
[complete observation](../reports/observation-2026-09-17-bounded-source.json).

This evidence does not select numeric limits, approve empty categories, establish a baseline,
publish data, or close an FR. Those review gates remain open until the interval and independent
final review complete.


## TASK-019 actual Actions review — 2026-09-17

FR-12 / Section 14.4 / AC-019-8 now have actual workflow, upstream dependency and authenticated
repository-setting evidence in the [Actions review](../reports/security-2026-09-17-task-019-actions.md)
and [receipt](../reports/security-2026-09-17-task-019-actions-evidence.json). This supersedes the
historical missing-workflow limitation. Review is performed, but security acceptance remains
open for SEC-ACTIONS-01/02. No deployment/environment approval, risk waiver, current dependency
advisory clearance or overall TASK-019 completion is asserted. FR-13 and TASK-009/010/021 retain
quality policy/baseline, protected publication, hosted recovery and release gates.


## TASK-019 authorized remediation — 2026-09-17

FR-12 / Section 14.4 / AC-019-8: the direct upload-action pin is corrected in the task branch and
actual main protection is configured/read back. [Remediation evidence](../reports/security-2026-09-17-task-019-remediation.md)
retains the pending deployment reviewer/environment, unsuccessful full local verification due to
Linux Info-ZIP tests on macOS, and unavailable Ubuntu Docker rerun. Acceptance remains open;
no successful hosted artifact publication/recovery or independent approval is inferred.


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
