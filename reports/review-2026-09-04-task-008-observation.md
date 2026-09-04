<!--
Purpose:        Record independent review of the ADR-015 research-only observation design
Owner:          Reviewer
Update Trigger: When the reviewed observation implementation or live evidence changes
Harness Version: 1.1
-->

# TASK-008 Research Observation Review

Date: 2026-09-04. Verdict: **Approved** for one same-budget diagnostic retry of the bounded,
research-only observation described in
`docs/superpowers/specs/2026-09-04-task-008-observation-design.md`.

## Scope

Reviewed all uncommitted work against `095683a`, concentrating on the streamed CSV parser,
subprocess reader, archive observer, research CLI, first-run limits, freshness amendment, and
their tests. The implementer performed the first approved observation after the original review;
this follow-up review did not download an archive or inspect provider rows.

## Findings

No open findings.

The review first identified that the CLI accepted arbitrary positive limits although the approved
first-run budget was bounded. The final implementation resolves that issue in
`src/pipeline/observation-limits.ts`: it rejects values above 256 MiB source bytes measured before
decoding, 100,000 rows, 65,536 logical-record code points, 600,000 ms, and 3 GiB RSS before
collector loading. The parser
also explicitly defines logical-record counting to include CSV syntax and quoted newlines while
excluding its terminating unquoted LF/CRLF, with equality and overflow tests for both separators.

The first observation downloaded archive
`9cbe96a9bdadb46b8e0bb8034b6b8b60ea133598f6125ba0cfc954bbc31c898c`, then failed closed after
737,444 source bytes measured before decoding with `observation_read_failed`. It emitted no
metrics, ingestion counts, or rows, and staging was empty after cleanup. The diagnostic amendment forwards only a
closed allowlist of parser-generated CSV codes, retains budget/timeout precedence, and otherwise
keeps the generic failure code. It may add only the current public contract `fileDataId` to the
rejection diagnostic; it does not add an entry name, header, cell, identifier, or source text.
The forged-error regression confirms arbitrary text cannot enter a report.

The approved retry read the same archive hash under identical ceilings and failed closed at the
same 737,444 source bytes with `csv_invalid_encoding` for public contract category `15045028`.
It again emitted `complete:false`, `metrics:null`, and `ingestion:[]`, and staging was empty after
cleanup. This identifies a strict decoding failure under the committed EUC-KR contract; it does
not justify a fallback encoding, replacement decoding, row dropping, policy, baseline, or source
coverage assertion.

## Assessment

| Dimension | Result |
|---|---|
| Correctness | Complete categories require parser and child EOF; pre/post hashes bind results to one staged archive; failed reads, hash drift, limits, and transformer rejection return incomplete/rejected reports. |
| Resource safety | The CLI enforces the reviewed live ceilings. Streaming byte, row, record, process-time, observation-time, RSS, and container safeguards are present. |
| Privacy and safety | Reports contain aggregates, diagnostics, public contract category IDs, provenance counts, and hashes only. Raw rows, names, addresses, management identifiers, normalized search text, coverage, policy, and candidate output are excluded. Unknown status behavior remains the existing fail-safe mapping. |
| CLI and cleanup | Arguments and paths are explicit and external to the repository; duplicate/unknown/invalid arguments and existing output fail before collection. The staged archive is removed before report output and again in final cleanup if necessary. Exit 2 remains review-required, and no success/publication path exists. |
| Requirements | ADR-015 correctly changes FR-14 to stale at age >= 7 Seoul calendar days. FR-13 recovery, source-cut evidence, production policy, baseline promotion, and publication remain outside this scope. |

## Verification

- Independent initial focused run with the pinned Node 24.19.0 runtime: 6 pipeline files, 142 tests passed.
- Independent diagnostic follow-up run with the same runtime: 5 pipeline files, 57 tests passed.
- Independent TypeScript and Biome checks on both reviewed revisions passed.
- `git diff --check 095683a` passed.
- The implementer’s final pinned full verification passed on the diagnostic code: 21 Vitest files,
  425 tests, four browser smoke tests, two accessibility scans, and coverage of 91.52% statements,
  89.75% branches, 94.77% functions, and 94.16% lines.

The authorized retry is complete. Its rejected outcome cannot establish production coverage,
calibrated thresholds, a baseline, a publishable artifact, or a deployment.
