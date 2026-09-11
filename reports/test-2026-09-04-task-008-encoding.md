<!--
Purpose:        Record accepted ADR-016 decoder regression and integration verification
Owner:          Tester
Update Trigger: When test, independent review, or live observation results change
Harness Version: 1.1
-->

# TASK-008 Decoder Correction Verification

Date: 2026-09-04. FR-13, related FR-08/14. The user explicitly approved ADR-016 after the
root-cause diagnostic and candidate experiments. TASK-008 remains active for complete observations
and production evidence. TASK-009 is not activated.

## Change and red/green evidence

Pinned `@exodus/bytes@1.15.1` is now a direct development dependency. The lockfile changes only
its root declaration: the same package version/integrity already existed transitively. Both
`csv-header.ts` and `stream-csv.ts` explicitly import its WHATWG TextDecoder. No global mutation,
encoding fallback addition, lossy replacement, source delivery change, or status mapping change.

Added eight tests before the production imports. The native decoder run failed seven and passed
23 existing/new tests: valid extension rejection, exact-header mismatch, unassigned-pair acceptance,
incomplete-lead acceptance and wrong malformed-trail error. The invalid-byte test already passed.
The initial header rejection fixture contained C9A1 alone, which is also valid UTF-8 and correctly
passes header auto-detection; corrected that test to prefix B0A1 so UTF-8 cannot accept the header.
This is a fixture correction, not a production acceptance restriction. Final focused result:
**2 files, 30 tests passed**, exit 0.

| Requirement | Exact test evidence |
|---|---|
| Correct source text across all chunk boundaries | `decodes WHATWG EUC-KR extension Hangul and euro at every chunk split` |
| Exact contract header comparison | `compares a WHATWG EUC-KR extension header without native misdecoding` |
| Correct discovery header decoding | `preserves WHATWG EUC-KR extension Hangul and euro in headers` |
| Strict malformed/incomplete input rejection | `rejects WHATWG EUC-KR %s at every chunk split`, cases `incomplete lead`, `invalid trail`, `invalid byte`, `unassigned pair` |
| No undefined mapping in EUC-KR headers | `rejects an unassigned WHATWG EUC-KR pair in the header` |
| Existing UTF-8/BOM/base Hangul/CSV behavior | Both complete existing CSV suites, 30 tests passed |

Each streaming case inserts an empty chunk at every split; expected decoded strings are literal
synthetic standard fixtures rather than computed by the decoder under test. Invalid fixtures
must throw `csv_invalid_encoding`, including at EOF; no returned replacement text is accepted.
The pre-integration exhaustive standard comparison is documented separately and remains research
evidence, not a network-dependent CI test.

## Pinned full verification

Command: Node 24.19.0 first on PATH, then pinned Node invoking
`/opt/homebrew/lib/node_modules/npm/bin/npx-cli.js --yes npm@11.17.0 run verify:full`.
Exited 0 on the actual integrated changes:

- Lint, formatting and TypeScript passed.
- 21 Vitest files, **433 tests passed**, no skips.
- Global statement/branch/function/line coverage: **91.52 / 89.75 / 94.77 / 94.16%**.
- `stream-csv.ts`: 97.70 / 96.62 / 100 / 100%; `csv-header.ts`: 94.20 / 93.22 / 100 / 95%.
- Required status mapper coverage gate passed.
- Four browser smoke tests and two accessibility tests passed, with zero axe violations.
- Browser build remains seven modules, 11.55 kB uncompressed JavaScript / 4.91 kB gzip.
- Existing NO_COLOR/FORCE_COLOR Playwright warnings were non-failing.

Only the approved package declarations and four CSV source/test files were copied to the existing
Linux research repository. `npm ci --ignore-scripts --no-audit --no-fund` succeeded there without
changing the lockfile. This avoids host node_modules and does not copy the handbook or secrets.
Linux focused checks and same-budget live results are appended when complete.

## Linux preflight

The exact four CSV files and package metadata passed Linux focused verification: four files,
**51 tests passed** (CSV parser/header plus CLI and reviewed-limit tests), exit 0, Node 24.19.0.
Mac and Linux SHA-256 values match for both production modules and both package files.
`reports/encoding-2026-09-04-implementation.sha256` records the updated implementation and
unchanged observer/limit/CLI hashes. A separate check of the original native header implementation
confirmed that the corrected B0A1-prefixed unassigned-pair fixture reproduces U+E000 acceptance;
the fixed module rejects it.
