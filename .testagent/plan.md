# TASK-014 Test Plan

1. Write failing ResultCard tests for U01–U04: status pairs, missing values,
   all lifecycle fields, literal HTML evidence, three coverage states and provenance.
2. Implement internal display model and evidence components; run component tests.
3. Write failing App interaction tests for U04/U05/U07: real engine primary,
   conflict, tie, low, no-result, example-fill and repeated/invalid transitions.
4. Implement form/results/demo and local state; run component tests.
5. Add real-browser form sentinel, keyboard, wrapping and populated axe cases
   for U06/U08. Inspect desktop/mobile screenshots. Run pinned verify:full.
6. Review exact assertions against each requirement; record findings in status.md.

## PR #15 regression plan

Write failing freshness component cases and App interaction/source/name regressions.
Reuse existing date helper's ageDays but apply the user's >=7 display boundary; preserve V1.
Use one shared app clock, refresh at Seoul midnight and on visibility/focus, clean listeners.
Add explicit dataset sourceLabel/sourceUrl, reuse SourceLink. Add submission sequence
for stable live region changes, and clear only invalid submissions during edits.
Run component RED/GREEN, browser regressions, full checks and independent review.

## TASK-015 test-first plan

1. Add App recovery interactions for T15-01/02/03/04/07/08/09; observe RED against existing App.
2. Add display preparation cases for T15-05/06 and preserve unknown raw statuses/missing names.
3. Implement internal loader/preparation and integrate existing App/form/evidence; focused GREEN.
4. Bundle a test-only App entry for real browser injected loading/error/recovery, keyboard,
   no-I/O and mobile checks (T15-10). Add axe scans of actual loading/error UI.
5. Run pinned verify:full, inspect screenshots and exact assertions; independent review.

## PR #16 regression plan

R1: parameterized blank attribution exclusion, nonblank exact preservation, all-invalid rejection.
R2: observe payload reads after source change/unmount and require zero obsolete processing.
R4: spy through real createSearchIndex, require one build per load and none per submission;
verify filtered results/diagnostics from the returned prepared index.
R3: document delivered commit/PR and current remediation; final review/full checks before push.


## TASK-016 test plan

1. M01/M02: shared builder tests for exact URLs and independently decoded path values, fallback
   table, all missing, lone surrogate and dot segments. Observe failure before implementation.
2. M03/M04/M05: real App/card tests for link attributes, source/status preservation, distinct
   candidate addresses, synthetic coverage and loader provenance.
3. M06: local-only bundled App fixture, intercepted provider navigation with no Referer/opener,
   native keyboard traversal, 320px layout and axe; keep existing production demo suppression.
4. Run focused tests, pinned verify:full, independent review and assertion-quality audit.


## TASK-017 test-first plan — 2026-09-08

1. Add component regressions for named lists, address/fallback article names, keyboard results
   access, invalid correction and empty/tie/low-result summaries; observe failure.
2. Add retry-focus browser coverage against controlled loading and guarded repeat activation.
3. Implement minimal native semantics, explicit local focus navigation and concise live copy.
4. Extend browser coverage for tab/reverse-tab order, visible focus, reflow/long text, text scaling,
   error/empty/tie axe states and retained-data recovery; inspect representative screenshots.
5. Run pinned focused checks and verify:full, review assertions and obtain independent review.
6. Record actual assistive-technology evidence or explicitly leave that manual gate open.


## PR #18 remediation — 2026-09-08

Add failing R1 parameterized exact/name-only searches and R2 mixed-state repeated-search regression in accessibility.test.tsx. Add display-order candidate positions and independent conditional warnings. Run focused components, pinned verify:full, and inspect assertions and diff.


## TASK-018 measurement plan

P01/P02: test inclusive limits, over-limit outcomes, missing/nonfinite metrics, nearest-rank
percentiles and UTF-8 accounting before helper implementation. P03: test deterministic
fixture shape, unique identities, scale bounds, and exact/common/address/no-match outcomes
through the real search engine. P04/P05: run production and separate test-only built pages,
assert ready content/LCP and correct submitted query/candidate counts before recording times;
record all samples, failures and host/profile settings. P06: measure JSON bytes, generation,
index construction, mounted App readiness and search-only time separately. Full verification
and independent review follow. Production distribution, publication and real-device results
remain explicitly unavailable.


## TASK-018 optimization/loading test-first plan

1. O1: add failing real search work-count regression; preserve real grapheme behavior and
address whole-number matches. Existing quality and search suites remain mandatory.
2. O2: add controlled part-promise tests before loader implementation for deferred start,
max-two batches, input-order assembly, failure, retry, aborted/stale work and empty/invalid
parts. Control only timing/network boundaries, use real assembled data and real preparation.
3. O3: component tests use real partition loader through App; cross-part duplicates,
retained data and no partial searchable snapshot are concrete outcomes.
4. O4: built browser test intercepts only actual data assets and checks disabled submit,
complete-data results, retry and invariant request paths across different drafts.
5. O5: run narrow checks, then full verification, a new comparable performance report and
independent review. Preserve audit JSON/report as historical evidence.


## TASK-018 approved pagination continuation

User approved 20-item similar-candidate pages. Scope: SearchResults/App, CSS, regression tests
and performance harness. Preserve complete ranking, uncertainty, primary/Top-3, absolute
positions and every candidate. Test all-page traversal, first/last/previous boundaries, focus,
announcements, <=20 boundary, new search reset and small-result compatibility. Measure first
page plus navigation under unchanged five-sample mobile/desktop profiles, with explicit
complete-count and bounded-card assertions. Run focused tests then verify:full and review.

## TASK-008 bounded processing test plan — 2026-09-12

1. Reuse acceptedFixture for exact parsed dataset/baseline/release parity at batch sizes 1 and 7.
2. Add distinct identities with normalization-equivalent names/addresses across category and batch
   boundaries; compare all metrics and pin positive collision participation.
3. Duplicate an identity after an intervening row; require global rejection and complete cleanup.
4. Throw from a late category iterator, exceed missing-name policy and JSON total limit separately;
   require absent candidate and unchanged pre-existing release bytes for each failure.
5. Require existing-output refusal and bounded disk-bucket rejection without leftover staging.
6. Exercise iterator yields before malformed tail/row-limit failures and exact multilingual CSV parity.
7. Run focused pipeline/parser tests, inspect concrete assertions, record results and outstanding gates.
