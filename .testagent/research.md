# TASK-013 bounded quality harness research

Target: new offline evaluator under tests/quality, consumed fixtures under tests/fixtures/search,
unit tests in src/search, and one scripts CLI. Existing Vitest unit project and Vite SSR loader
are available. No new dependency or browser entry import. Test discovery helper is unavailable;
target pairing is src/search/search-quality.test.ts -> tests/quality/evaluate-search-quality.ts.

Checklist: Q01 provenance and explicit labels; Q02 exact Top-3 denominator and misses;
Q03 family/low-only reporting; Q04 conflicts/ties/absence and original status preservation;
Q05 malformed/duplicate labels and invalid records; Q06 empty denominator and 90% boundary;
Q07 deterministic report and CLI; Q08 representative evidence remains unavailable.

## Completion scope

Add P01 explicit Seoul/name boundaries and no-primary confidence cap; P02 real detailed-address
components with numeric/mountain/conflict safety. Add Q08 100-source-target provenance/threshold
checks. Q03 report preview must preserve target membership beyond ten similar IDs. Independent
source extraction and comparator-closure replay supply annotation/evidence checks unavailable to
pure unit tests. Baseline engine remains isolated and hash-bound for before/after metrics.
