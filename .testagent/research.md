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
