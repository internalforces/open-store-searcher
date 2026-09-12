# TASK-014 Test Research

Scope: Broad, limited to new app components and browser interaction (U01–U08).
Use existing Vitest component project, jsdom, Testing Library and cleanup setup.
Existing App test asserts the h1; preserve it. Existing engine tests and source quality
fixtures remain unchanged. Existing browser sentinels cover the standalone engine;
add actual form interaction coverage. No code-testing-generator, find-untested-sources,
test-gap-analysis or assertion-quality tool is available; perform the pipeline inline.

Inventory: App/App test exist. Planned SearchForm, SearchResults, ResultCard,
EvidenceContext, display-data and demo-data have no existing paired tests.
Checklist: U01 four statuses/raw/inert HTML; U02 original fields/missing values;
U03 synthetic/verified/missing date; U04 persistent provenance/disclaimer;
U05 primary/conflict/tie/low/empty; U06 keyboard/mobile/wrapping;
U07 repeated/invalid submissions; U08 actual form query I/O sentinels.

## PR #15 remediation inventory

R1 EvidenceContext/shared clock: boundary 6/7/8 days, unavailable/rejected dates, rollover.
R2 App: repeated identical/count-equal submissions update stable live region.
R3 App: typing/example clears invalid state while valid results persist.
R4 ResultCard: missing name remains accessible for address-only matches.
R5 DisplayDataset/App: provenance survives initial/empty/invalid states.

## TASK-015 bounded module inventory — 2026-09-07

Broad test scope across App, internal display preparation/loading and uncertainty components.
The code-testing-generator/find-untested-sources/test-gap-analysis/assertion-quality tools are
unavailable in this session; execute the research/plan/implementation/review workflow inline.
Existing component tests use jsdom, Testing Library and real search/status functions; browser
checks use Vite-built test runtimes for injected boundaries. No external data is needed.
Acceptance matrix: T15-01 initial loading/search guard; 02 failure/retry and fixed issue link;
03 usable data and results retained on failed reload; 04 successful replacement clears results;
05 malformed/duplicate exclusion with diagnostics; 06 unusable envelope/replacement rejection;
07 empty/low guidance and unchanged classifications; 08 stale/unknown coverage and truthful
browser load time; 09 source change/unmount obsolete completion; 10 keyboard/live region,
mobile wrapping and no query I/O. Existing freshness tests own the 6/7/8-day clock boundary.

## PR #16 remediation research

R1: record sourceLabel accepts whitespace while dataset sourceLabel rejects it.
R2: cancelled promise fulfillment still enters prepareDisplayData before its cancellation guard.
R4: preparation and App both build a full address/name index. Reuse filtered prepared entries,
retaining duplicate checks across the entire input and cumulative diagnostics.
R3: current memory/project.md and tasks/active.md incorrectly call delivered 8dc6de4 uncommitted.
Scope spans existing modules; execute broad test workflow inline as before.


## TASK-016 test research

Broad bounded module set: new shared map URL builder, ResultCard integration and App synthetic
provenance propagation, browser fixture/navigation. Existing Vitest unit/component and Playwright
fixtures are authoritative; tests run offline. Specialized generator/find-untested-sources tools
are unavailable (tool discovery checked); pairing is recorded here. New shared builder pairs with
src/shared/map-search-links.test.ts; card/App behavior with src/app/map-links.test.tsx;
navigation with tests/e2e/search.spec.ts; axe with tests/e2e/accessibility.spec.ts.
Checklist: M01 record name/road preference/parcel fallback/partial fields; M02 Unicode, reserved
characters, hostile terms, missing or unencodable terms and path-dot safety; M03 fixed HTTPS
origins and new-tab protection; M04 synthetic coverage/loader suppression; M05 raw-query privacy,
no automatic I/O and candidate-specific uncertainty/evidence; M06 keyboard/320px/axe and full checks.


## TASK-017 research — 2026-09-08

Broad scope: App, SearchForm, SearchResults, ResultCard and CSS. Existing Vitest component
tests and Playwright fixtures provide deterministic synthetic inputs and controlled loader
promises. The find-untested-sources tool is unavailable; source/test pairs were inspected
directly. No network mocks beyond existing offline fixture routes are needed.
Requirements: named candidate lists and distinguishable identity; keyboard results access;
input/error focus; zero/tie/low-result live guidance; retry focus and duplicate-load guard;
mobile/desktop, 200% text scaling and 320px reflow; screen-reader observations separate from axe.


## PR #18 remediation — 2026-09-08

Broad bounded PR #18 scope: ResultCard/SearchResults identity and App live guidance. Existing accessibility.test.tsx exercises real search with synthetic data. Specialized discovery/generator/gap tools are unavailable; use inline workflow. R1: identical name/address/status records must have distinct accessible names in both candidate groups. R2: a single result with two eligible ties and a conflicting similar candidate must announce both warnings.


## TASK-018 measurement research

Scope: new offline measurement helpers, deterministic fixtures and local browser harness.
Use existing Vitest unit project, Vite production builds and Playwright Chromium. No new
dependency or production seam. Optional generator/discovery/gap tools are unavailable;
research, planning and assertion review run inline. P01 bundle bytes and exact limits;
P02 nonempty finite percentile samples; P03 deterministic bounded fixtures and adversarial
query outcomes; P04 production-only mobile primary/LCP cache runs; P05 real App submission
through paint opportunity; P06 JSON/preparation scale diagnostics and limitations.


## TASK-018 approved optimization/loading research

Scope is broad across search and loader integration. Existing conventions: Vitest unit for
search, component for app/loaders, Playwright built Pages-subpath checks. Specialized test
generator/discovery tools remain unavailable; execute research/plan/quality review inline.
O1: avoid irrelevant grapheme work and repeated address splitting while preserving Unicode,
numeric boundaries, candidates/reasons/rank and quality. O2: partition reads after shell paint,
fixed batches of at most two, complete ordered assembly, cancellation, failure/retry and no
partial data. O3: full-snapshot duplicate checks, one index/load, retained state and obsolete
load suppression. O4: real deferred JSON assets, no query-dependent requests, Pages routing,
initial error/retry and all existing browser/a11y flows. O5: preserve baseline and repeat
scale measurements plus startup/code budgets with actual JSON requests.


## TASK-018 approved pagination continuation

User approved 20-item similar-candidate pages. Scope: SearchResults/App, CSS, regression tests
and performance harness. Preserve complete ranking, uncertainty, primary/Top-3, absolute
positions and every candidate. Test all-page traversal, first/last/previous boundaries, focus,
announcements, <=20 boundary, new search reset and small-result compatibility. Measure first
page plus navigation under unchanged five-sample mobile/desktop profiles, with explicit
complete-count and bounded-card assertions. Run focused tests then verify:full and review.

## TASK-008 bounded processing test research — 2026-09-12

Broad scope is limited to stageBoundedRelease and iterateLicenseCsv. Existing Vitest pipeline
fixtures cover all 195 contractual categories with synthetic-only quality policy/baseline.
Reuse those fixtures in validate-license-refresh.test.ts and parser fixtures in parse-license-csv.test.ts.
Specialized generator, find-untested-sources, gap-analysis and assertion-quality tools are unavailable
(tool inventory searched); execute research, planning and final assertion review inline.
Checklist: complete artifact/metric parity; cross-batch identity rejection; global normalization
collision parity; late ingestion and quality rejection preserving known-good bytes; existing-output
protection; bucket cap cleanup; iterator incremental yield, multiline parity and late-error visibility.
This verifies FR-08/FR-13/FR-14 mechanics, not production thresholds, deployment or 30-day reliability.
