<!--
Purpose:        Record ADR-017 implementation verification and the unresolved full-goal boundary
Owner:          Tester / Implementer
Update Trigger: When implementation, test results, review or evidence bindings change
Harness Version: 1.1
-->

# TASK-008 ADR-017 Verification

The user accepted ADR-017 and requested goal resumption. This implements exact V2 vocabulary
recognition while preserving the unverified status and the explicit historical V1 path. Related:
FR-04, FR-07, FR-08, FR-13, FR-14. Production coverage/policy/bootstrap remain unapproved.

## Requirement evidence

| Accepted requirement | Exact behavioral evidence |
|---|---|
| Preserve V1 semantics and raw uncertain status | `recognizes approved uncertain pairs under V2 while retaining V1 review and raw statuses` |
| Six exact pairs; variants and future pairs remain unknown | `V2 preserves exact raw pair %s/%s and its processed status` (14 explicit pair cases) |
| Compatible V2 policy/baseline; unchanged numeric and uncertainty rules | `accepts a compatible V2 baseline while preserving uncertain candidates and numeric gates` |
| Missing/mixed input/policy/baseline cannot fall back | `rejects missing or mixed %s vocabulary without fallback`; `rejects V1 through V2 and V2 through V1 with typed revision mismatch`; `V1 rejects an isolated vocabulary hash in %s instead of ignoring a partial V2 envelope` |
| Complete V2 research and unchanged ingestion | `V2 observation preserves complete V1 evidence except vocabulary diagnostics and unknown counts` |
| No I/O before revision validation; disk cleanup and future diagnostics | `V2 observation rejects unbound vocabulary before source I/O`; `V2 disk observation retains future-pair review and cleans owned scratch on success and limit failure` |
| All 195 historical categories, 68 diagnostic changes, immutable source evidence and missing gates | `derives all 195 categories from bound V1 bytes while preserving historical evidence and missing gates` |
| Reject corrupted source/audit/ingestion/revision evidence | `rejects %s without derived evidence`; `rejects inconsistent %s even with a matching audit digest`; `rejects a V2 report with missing %s` |
| Future unknown pairs remain review-required after derivation | `retains an unregistered future pair diagnostic during derivation` |
| Deterministic offline output and current implementation hashes | `offline derivation command binds current implementation and emits deterministic research JSON` |
| Bound report/audit bytes before parsing | `bounds %s bytes before parsing and accepts the exact offline ceiling` |

V2 staged, observation and derivation tests first failed for missing entry points. An additional
V1 partial-envelope regression failed because an isolated V2 hash was ignored and the refresh was
accepted; the guard now produces `vocabulary_revision_mismatch` before metrics/candidate work.
The pre-existing malformed-policy test now uses unsupported version 999, because actual V2 input
has the newly approved typed revision-mismatch outcome rather than the generic invalid-policy code.

## Successful commands

Pinned Node 24.19.0 and npm 11.17.0 `npm run verify:full`, final coverage started 22:52:09 JST on 2026-09-04,
exited 0: lint, formatting, typecheck, 546 Vitest tests in 24 files, production build, four browser
smoke tests and two zero-violation accessibility scans. Global coverage: 92.70% statements,
90.41% branches, 94.78% functions, 95.04% lines. The mapper's required 100% gate passed. One earlier
full attempt stopped on a test-only optional-type error; the corrected final command above passed.
The browser emits existing NO_COLOR/FORCE_COLOR warnings; no test failure resulted.

Focused validation/observation tests passed 140 tests after the partial-envelope regression fix.
The preceding combined validation/observation/accumulator/derivation/CLI run passed 185 tests.
The reviewer requested pre-parse bounds: 16 MiB for report bytes and 256 KiB for audit bytes.
Both valid next-byte cases reproduced acceptance before the fix and now reject; exact limits
remain accepted. The 19-test derivation suite passed after correction. The above full gate is
after that correction. Independent final review approved, reran 159 focused tests and verified
all bindings; see the final addendum in `reports/review-2026-09-04-task-008-vocabulary-proposal.md`.
A whole-envelope preservation assertion was added to the existing derivation test after the full
gate; the 19-test derivation suite and typecheck passed with it. No runtime source changed.

The new `reports/observation-2026-09-04-task-008-v2-derived.json` is 514,170 bytes and records
2,936,760 rows, zero unknown pairs, unchanged 380,285 unverified rows, and all 195 ingestion proofs.
Only baseline/source-as-of/policy review diagnostics remain. Its source report hash is
`1e218c054100dc8dbdccf387a383ab37e85e0797d82e72a7ba341755bc6edab6`; its audit and derivation
implementation hashes are embedded. Deterministic re-execution is required when checking those
bindings; the historical proposal JSON is not rewritten to use current implementation hashes.
Final derived report SHA-256: `f1b5f59176c150e9766224dd5ddc1e85d7f2ab6429893defb3f59be8a916e9e7`.
Both implementer and reviewer independently reproduced the exact artifact; all 13 current
implementation hashes match and the original report/audit remain unchanged.

## Boundaries

No provider retrieval, public representation, dependency addition, status-map modification,
deployment, baseline promotion or TASK-009 activation occurs. The original complete V1 report and
its audit remain immutable; their implementation hashes describe that historical run, not the
current ADR-017 code. New offline evidence separately records current derivation hashes and is
explicitly not a new temporal observation. A structurally valid research report is not proof of a
production baseline or provider cutoff. Existing source-cut, policy and bootstrap diagnostics stay.
