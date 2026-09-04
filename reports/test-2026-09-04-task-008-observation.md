<!--
Purpose:        Record verification of the approved TASK-008 Mac continuation
Owner:          Tester
Update Trigger: When tests, independent review, or live observation evidence changes
Harness Version: 1.1
-->

# TASK-008 Observation Verification

Date: 2026-09-04. FR-13/14; accepted ADR-015. TASK-008 remains open for production evidence.

## Verified implementation

The age-seven regression first failed in three shared boundary cases and one staged-validator
case; changing the helper from > 7 to >= 7 and moving the unchanged-archive boundary expectation
produced 118 passing focused tests. New streaming parser, process reader, observer, and CLI tests
first failed for missing modules/scripts, then passed after implementation.

Pinned Mac `npm run verify:full` exited 0: 21 Vitest files, 425 tests passed; four browser smoke
tests and two zero-violation accessibility scans passed. Global coverage: 91.52% statements,
89.75% branches, 94.77% functions, 94.16% lines; mapper's 100% required threshold passed.
No tests were skipped on this Mac. The browser bundle remains seven modules / 11.55 kB JS.
Only existing non-failing Playwright NO_COLOR/FORCE_COLOR warnings appeared.

Runtime: `/Users/sonmyeong-gwan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`
reports v24.19.0. npm 11.17.0 was invoked through the existing npx CLI with that Node first in PATH.
The exact command was `pinned-node /opt/homebrew/lib/node_modules/npm/bin/npx-cli.js --yes npm@11.17.0 run verify:full`.

## Requirement evidence

| Requirement | Exact test evidence |
|---|---|
| FR-14 age >= 7, including midnight | `evaluates the seven-day Seoul boundary at %s`; `warns at exactly seven Seoul calendar days without rejecting a valid refresh` |
| Unchanged source aging | `unchanged archive retains its coverage and becomes stale as the clock advances` |
| Strict encoding and chunk boundaries | `streams UTF-8 rows across empty chunks and split multibyte characters`; `parses strict EUC-KR bytes split within a multibyte character`; `rejects invalid UTF-8 and EUC-KR bytes` |
| Lossless CSV and complete EOF | `parses quoted commas, doubled quotes, quoted LF and CRLF, trailing empty cells, and final EOF`; `rejects an incomplete quoted field and a wrong data column width` |
| Header and empty-category distinction | `rejects a missing header and an exact-header mismatch`; `distinguishes a completed header-only category from a failed read` |
| Provenance and complete category set | `binds all 195 completed categories and returns aggregates without publication evidence`; `rejects malformed limits and mismatched schema before any I/O` |
| Archive integrity | `rejects changed archive bytes before entry reads and after complete ingestion` |
| Identity safety | `preserves transformer rejection of duplicate identities` |
| Process completion and cancellation | `requires successful exit after complete stdout`; `rejects a stalled child and waits for termination`; `aborts a running child`; `cancels a child when the consumer stops early` |
| Explicit operational bounds | `enforces the byte limit at equality and one byte beyond it`; `enforces the row and record-character limits at equality and failure`; `rejects exhausted %s without partial metrics` |
| Sanitized failure and aggregate-only report | `rejects incomplete child output without leaking rows or trusting partial counts`; `rejects stderr without exposing its text`; `maps a failed source to a fixed error code without exposing its message` |
| Reviewed live budget | `accepts all reviewed ceilings at equality`; `rejects %s one unit beyond its reviewed ceiling`; `refuses a live %s override above the reviewed ceiling` |
| Observation deadline | `aborts an in-flight archive hash at the observation deadline` |
| CLI boundary | `rejects invalid CLI arguments before collector work: %j` |

## Reconstructed environment

Created only `open-store-searcher-task008-research`, preserving the old broken container and
unrelated state. Anonymous public image retrieval used a task-local empty Docker configuration
after the original credential helper stalled; no user's credential settings were read or changed.

- Ubuntu 24.04 ARM64 image: `sha256:33ceb71981b602c1a7443a53469e4dba065f7503eab3078a2d7a57a2ab987517`.
- Installed exact available Info-ZIP package 6.0-28ubuntu4.1 and Linux Node 24.19.0/npm 11.17.0.
- Verified Node archive SHA-256 against official distribution checksums:
  `01443c1e1a29e531ccad5a46fefa6df490d2189c49f7955904aecdbb0fe86fdc`.
- The lockfile-only Linux `npm ci --no-audit --no-fund` succeeded without a lockfile change.
- Existing `UnzipArchiveAdapter.checkEnvironment()` returned `ok:true` with the Info-ZIP version.
- Source snapshot excludes Git metadata, handbook, secrets, and host dependencies; repository,
  staging, and evidence occupy separate paths in the same container namespace.

## Review and live evidence

Independent Reviewer Approved in `reports/review-2026-09-04-task-008-observation.md` after
142 independently rerun tests, typecheck, Biome, and whitespace checks. The live-budget bypass
finding was fixed by enforcing ceilings in the CLI; boundary tests pass. The reviewed logical-record
budget excludes unquoted record terminators, with explicit LF/CRLF equality and overflow tests.

Linux narrow validation passed 68 parser/process/observer/CLI/freshness tests before the ceiling
review fix, then all 21 final budget/CLI tests passed on the final snapshot. The source snapshot
SHA-256 used for the live run is
`e25fad98747e4a9b483570420d8ace675c5d114dc37d152a3c95f246af85e447`.
Both bounded live results are recorded below.
The existing source-cut, comparable-observation, production-limit, and bootstrap gates cannot be
satisfied by synthetic tests or environment compatibility alone. No deployment is authorized.

### First bounded live attempt

The reconstructed Linux collector accepted the official archive with SHA-256
`9cbe96a9bdadb46b8e0bb8034b6b8b60ea133598f6125ba0cfc954bbc31c898c`.
Observation stopped after 737,444 source bytes with `observation_read_failed`; exit 1,
complete:false, metrics:null, and no completed ingestion report. The command removed the archive;
`find /work/staging -type f` returned no files. Aggregate-only result:
`reports/observation-2026-09-04-task-008-attempt-1.json`.

The generic diagnostic did not identify the exact CSV failure. Added test-first typed CSV code
preservation and category ID context without source values. Independent follow-up review required
both a closed code union and runtime allowlist; a forged private error-code regression reproduced
the leak before the allowlist fix. Fixed parser codes can now explain the rejection while arbitrary
messages remain `observation_read_failed`. No parser acceptance rule or resource ceiling changed.

The diagnostic change passed refreshed full verification (425 tests) and independent follow-up
approval (57 focused tests), then 28 focused tests on Linux. Retry code hashes are recorded in
`reports/observation-2026-09-04-implementation.sha256` and verified against the container files.

### Same-budget diagnostic retry

The repeat accepted the same archive hash and failed after 737,444 source bytes with
`csv_invalid_encoding`, category `15045028` (contract entry `건강_안경업.csv`, encoding `euc-kr`).
The retry used unchanged ceilings. Exit 1, complete:false, metrics:null, and ingestion:[] are
recorded in `reports/observation-2026-09-04-task-008-attempt-2.json`. The staging file inventory
was again empty after cleanup. No record-count baseline or source coverage assertion was created.

This proves that strict decoding under the committed category encoding failed; it does not prove
whether the full source file has another encoding, mixed encodings, or an isolated invalid byte
sequence. The schema-only header check cannot prove full-body encoding validity. No replacement
decoding, row dropping, encoding fallback, or status change was introduced. Track investigation
as DEBT-010 before altering the approved data contract. Repeated bytes are one source snapshot,
not two independent calibration observations.

Next evidence work: a bounded, separately reviewed byte-level diagnostic should report only
encoding validity, counts/offsets, and category/hash provenance; do not expose source rows or
raw byte context. Produce a synthetic regression and a concrete decoding proposal if evidence
justifies a contract amendment. Production coverage, inter-refresh distributions, JSON budget,
and explicit baseline/policy review remain unresolved. TASK-009 stays inactive.
