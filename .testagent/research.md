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
