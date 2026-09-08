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
