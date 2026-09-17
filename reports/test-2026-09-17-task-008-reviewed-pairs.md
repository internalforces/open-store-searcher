<!--
Purpose:        Record verification of the approved reviewed-unverified pair extension
Owner:          Tester / Implementer
Update Trigger: When implementation, verification evidence, or review changes
Harness Version: 1.1
-->

# TASK-008 Reviewed-Unverified Pair Verification

Date: 2026-09-17. Status: bounded implementation verified; independent Reviewer Approved.
Baseline: `95c26a5`; local existing `codex/task-008-operational-verification` worktree.
Requirements: FR-04/07/13; TASK-008 V06; P01-P07 in `.testagent/plan.md`.

## Authorization and boundaries

The user explicitly approved the presented exact category-bound 05/06 acknowledgment.
See [approved design](../docs/superpowers/specs/2026-09-17-task-008-reviewed-pairs.md).
No numerical quality limits, empty-category policy, baseline, publication configuration,
performance waiver, workflow dispatch or deployment was authorized by that approval.
The mapper, raw metrics and public delivery contract remain unchanged.

## Test-first evidence

Before implementation, the new focused pipeline suite exited 1 with 16 expected feature
failures and 129 passes (145 total). Exact/sparse/object-key-order approved contracts still
returned review_required, malformed contracts failed to reject, and a mixed candidate
retained diagnostics for reviewed as well as unreviewed categories. These were behavioral
failures rather than missing-import/compilation errors. The pre-change 119-test baseline
had passed on pinned Node 24.19.0/npm 11.17.0.

Command: `npm run test:pipeline -- src/pipeline/validate-license-refresh.test.ts`.
Local pinned runtime: `PATH=/private/tmp/open-store-pr21-runtime.gmFKJN:$PATH`.

## Verification environment

The existing Ubuntu research container was restarted after starting the local Docker app.
An isolated `/work/task008-reviewed-pairs-20260917` directory reuses a copied dependency tree
from the previous verified Ubuntu checkout. Both package-lock files have SHA-256
`5720ad6f550d240f06fa1d4741ce7faff1193ee03962c36735d1a759389b9f89`.
Node 24.19.0/npm 11.17.0 and the pinned browser executables are already available.
No project dependency, global runtime version or workflow is changed. The final source transfer and before/after hashes match; full verification passes. Native macOS InfoZIP limitations remain
historical platform evidence, not a reason to weaken or skip project tests.

## Outstanding acceptance

This bounded contract implementation does not complete TASK-008. Production numeric
policy and initial baseline approval, accepted complete production validation, practical
mobile/hosted acceptance and separate publication/release gates remain open.


## Focused completion and requirement evidence

Final focused pipeline run: **161/161 passed**. Typecheck and scoped Biome lint/format pass.
The executable CLI forwarding test also had a separate RED run: the field was undefined
before the single forwarding change. Independent Reviewer reran 161/161 in 13.33 seconds
and Approved the bounded implementation with no remaining finding.

| Requirement | Exact passing test evidence |
|---|---|
| P01 exact approved scope, unverified records | `accepts the exact reviewed 05/06 category scopes without changing unverified metrics`; `accepts sparse occurrences inside the reviewed pair permission ceiling`; `accepts the reviewed contract when no approved pair occurs` |
| P02 new/partial/mismatched/unlisted pairs | `keeps %s under explicit aggregate-pair review`; `counts only unreviewed rows when reviewed and new pairs share a category` |
| P03 missing/malformed/incompatible/modified contract | `preserves legacy review when the approved contract is absent`; `rejects a %s reviewed-unverified contract`; `rejects non-contract reviewed-unverified input %j even without unknown rows`; `does not let caller mutation broaden the immutable approved scope`; `freezes the shared checked-in contract against module mutation`; `accepts semantically identical contract objects with different key order` |
| P04 unchanged raw metrics and mixed candidates | `keeps mixed reviewed and unreviewed rows in review while preserving raw metrics`; exact-scope test asserts raw/processed record and total/category unknown metrics |
| P05 other quality gates remain | `reviewed pairs do not waive missing policy or baseline and ordinary quality failures` |
| P06 actual CLI and staging preservation | `forwards the reviewed-unverified contract through the executable refresh command`; `stages an exact reviewed pair and preserves prior bytes when a bad pair blocks promotion`; `stages reviewed pairs through the bounded production path with raw metrics intact`; `bounded staging preserves known-good bytes when the reviewed contract is %s` |

See [independent review](review-2026-09-17-task-008-reviewed-pairs.md) for assertion-quality
and gap assessment. No behavior test uses production numerical policy.

## Retained observation replay

[Replay result](replay-2026-09-17-reviewed-pairs.json) binds the final implementation hashes,
contract hash and unchanged Sep-13 receipt. Run
`node .testagent/replay-reviewed-pairs.mjs` with the pinned runtime.

The actual measured validator reuses retained metrics for 2,940,404 rows. Before acknowledgment,
68 categories emit pair-review diagnostics. Afterward, exactly those 68 disappear, while both
runs remain review_required with policy and baseline review plus source-coverage warning.
The unknown-pair count is 187,222 and all metrics are unchanged, bound by SHA-256
`ba4fb5bcf1f440df6e94a77362d4d202d14052d751da741ad7f02d9566afb1bf`.

This is aggregate-only replay, not source-row/archive replay. The retained receipt omits
the transient archive path; the helper supplies an explicit non-file placeholder to the
input shape while the trusted measurement callback reads no archive. It produces no
production policy, baseline or publication input.

The first full-verification attempt stopped at a replay-helper formatting difference.
The helper was formatted, its final replay passed, and the full command was restarted.
The unsuccessful attempt is retained locally as
`/private/tmp/task008-reviewed-pairs-20260917-format-attempt.log`; it is not a test pass.


## Final full verification

`npm run verify:full` exited **0** in the isolated Ubuntu directory with the unchanged
default browser concurrency and strict flaky policy. No test or assertion was skipped
or weakened. Results: **797 Vitest tests in 44 files**, **68 browser checks**, and
**20 accessibility tests** passed. Lint, format, types, build and both search-quality
checks pass. Lint retains five pre-existing informational suggestions, not errors/warnings.

Coverage: statements **92.72%**, branches **91.09%**, functions **95.36%**, lines **94.44%**.
The status mapper remains **100%** on every metric. The new reviewed-pair helper has
95.65% statements, 95.45% branches, 100% functions and 97.14% lines.

[Verification receipt](verification-2026-09-17-reviewed-pairs.json) records the command,
runtime, log hash and 156 source/test/configuration/helper fingerprints. All 155 transferred
product/test/configuration hashes matched on the host and container before and after the
full run; the final formatted replay-helper hash also matches both environments. This is
local Ubuntu evidence, not hosted GitHub CI or real-source mobile performance evidence.

The existing research container is returned to its previously stopped state after verification.
Its isolated verification directory and local logs are retained. Application/status-mapping/
metric generation and dependency/workflow paths outside the bounded validator change remain
unchanged. No production policy, baseline, publication, commit, push or deployment occurred.
