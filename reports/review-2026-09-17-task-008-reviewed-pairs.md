<!--
Purpose:        Record independent review of the approved reviewed-unverified pair extension
Owner:          Reviewer
Update Trigger: When the reviewed implementation or verification evidence changes
Harness Version: 1.1
-->

# TASK-008 Reviewed-Unverified Pair Review

Date: 2026-09-17. Verdict: **Approved** for this bounded implementation.
Base: `95c26a5`; reviewed local changes on `codex/task-008-operational-verification`.
Requirements: FR-04, FR-07, FR-13; TASK-008 V06; P01-P07 in `.testagent/plan.md`.

This verdict covers the explicitly approved exact 05/06 acknowledgment contract, validator
integration, staging configuration forwarding, and related regression tests. It does not
approve overall TASK-008, numeric policy, empty categories, an initial baseline, production
acceptance, publication, or release. Full Ubuntu verification is recorded separately by the
parent agent in the [verification report](test-2026-09-17-task-008-reviewed-pairs.md).

## Review basis

Read the project constitution, current memory/task context, `prompts/review.md`, `standards.md`,
ADR-014/016 and the latest human approval, traceability, and the
[approved specification](../docs/superpowers/specs/2026-09-17-task-008-reviewed-pairs.md).
Applied the engineering code-review skill. `handbook/ko/**` was excluded throughout.
The reviewer modified only this report and did not modify implementation or tests.

Reviewed the new contract/helper, validation types and shared measured validator, the actual
`scripts/stage-refresh.mjs` forwarding, both staging implementations, metrics validation,
and all added tests. Independently compared the contract with the retained
[decision inputs](decision-inputs-2026-09-16-task-008-quality.json), rather than deriving
expected scopes from the new implementation.

## Findings

No remaining actionable findings.

One low-severity exact-input validation defect was found and resolved during review:

- Location: `src/pipeline/reviewed-unverified-pairs.ts`, array branch of `semanticEqual`.
- Reproduction: add an own `extra` property to a cloned contract's `pairs` array. The initial
  implementation returned valid because it compared indexed values but ignored additional keys.
- Impact: this violated P03's explicit rejection of extended contract inputs. It did not widen
  accepted category scopes because those remained an internal checked-in lookup.
- Resolution: dense arrays now require exactly their indexed keys plus `length`; object keys
  also use an exact own-key check. The added validator regression and an independent rerun of
  the original reproduction both reject the extra property while accepting the exact contract.
- Requirement: FR-07/FR-13; P03. Status: resolved.

## Correctness and regression assessment

| Dimension | Assessment | Evidence |
|---|---|---|
| Correctness | Pass | Exact 66 category scopes for `05` / "제외/삭제/전출" and two scopes for `06` / "기타" match the independent decision inputs, with no additions or omissions. |
| Status safety | Pass | The mapper and metrics generator are unchanged. Accepted records retain raw pairs and "확인되지 않음"; unknown counts remain present. |
| Input boundaries | Pass | Missing acknowledgment preserves legacy review. Invalid versions, revision, schema/evidence, sparse or duplicate/extended scopes and malformed input reject. Key order is immaterial. |
| Mixed and future input | Pass | Partial/mismatched/new/unlisted actual pairs still require review. Same-category mixed counts subtract only exact approved occurrences. Subsets and zero occurrences are permitted. |
| Other quality gates | Pass | Policy/baseline checks, numeric comparisons and empty-category enforcement remain downstream and mandatory. Tests exercise missing policy/baseline and an actual status-share failure. |
| Publication preservation | Pass | Real bounded staging accepts approved synthetic rows; missing/invalid acknowledgment blocks promotion, removes temporary output and preserves every previous artifact byte. |
| Security/privacy | Pass for scope | Scope lookup stays internal and recursively frozen; caller and shared-module mutation checks pass. No dependency, network behavior, tracking, public identifier, infrastructure or permission change was introduced. |
| Performance | No material regression identified | Matching works over existing aggregate pairs, not individual source rows. This review makes no mobile or production performance claim. |
| Maintainability | Pass | The small helper keeps acknowledgment separate from status classification, metrics generation and ordinary quality policy. |

## Test-gap and assertion-quality review

The final suite covers P01-P06 with concrete outcome assertions, including full and sparse
scope acceptance, zero occurrences, exact spelling/code/name/null/unlisted cases, mixed pairs
within and across categories, malformed contracts, caller mutation and frozen shared JSON.
The main accepted case asserts totals and a real transformed record's raw/processed values.
The same-category case checks raw unknown count 2 while the review diagnostic reports 1.

Both real staging paths are exercised. The bounded path serializes and reloads the actual
compact dataset and checks preserved raw/status fields. Failure cases compare all known-good
artifact bytes and require the candidate and temporary directories to be absent. The executable
CLI test launches the real script with a temporary JSON configuration and substitutes external
tool boundaries, then asserts the exact object delivered to `stageBoundedRelease`. That test
establishes forwarding; separate real bounded-staging tests establish validation and promotion.
Synthetic test policy/baseline values are not production approvals.

The reviewer requested the same-category, no-occurrence, mutation, malformed-input and actual
bounded-staging coverage during the review; these gaps are closed in the final 161-test suite.

## Independent verification

- `PATH=/private/tmp/open-store-pr21-runtime.gmFKJN:$PATH node node_modules/vitest/vitest.mjs run src/pipeline/validate-license-refresh.test.ts`
  passed **161/161** tests in **13.33 seconds** on the stable final source/test state.
- `git diff --check` passed.
- A separate Node/Vite assertion script compared all 68 scopes, both archive hashes, schema
  hash and observation receipt binding against the retained decision inputs. The actual raw
  receipt SHA-256 also matched. All assertions passed.
- Separate direct-helper checks passed: seven approved and three new rows in one category
  leave three rows requiring review; an unlisted category or absent acknowledgment leaves all
  ten requiring review; the complete input metric object remains unchanged; malformed primitive
  inputs reject; the shared JSON and nested category arrays are frozen.
- `PATH=/private/tmp/open-store-pr21-runtime.gmFKJN:$PATH node .testagent/replay-reviewed-pairs.mjs`
  passed independently. The retained aggregate observation contains **2,940,404** rows and
  **187,222** unknown pairs across 68 categories. Exactly 68 pair-review diagnostics disappear.
  Both runs remain `review_required`, preserving policy/baseline review and the source-coverage
  warning. Every metric is byte-equivalent before and after acknowledgment.

The aggregate replay is not a raw archive replay or successful production refresh. It supplies
a documented non-file archive-path placeholder because the retained receipt omits the transient
path; no source file is read or publication artifact produced. Full-suite/browser/accessibility
results belong to the separately recorded parent verification; no broader success is inferred.

Reviewed SHA-256 fingerprints:

| File | SHA-256 |
|---|---|
| `src/pipeline/contracts/reviewed-unverified-pairs-v1.json` | `84a16b491eefd39aa8e2b78390ec64ddc1796ceb21ebf73d85745c7b55a5282c` |
| `src/pipeline/reviewed-unverified-pairs.ts` | `d2c4a13dffa4a164332a3f672dc70902e45606e2962edcecee6038098f1d87f9` |
| `src/pipeline/refresh-validation-types.ts` | `3e6b08a4a5c2bc4b8b36003457ddbda0fcc17523b2fb99378e176e97ab4195e0` |
| `src/pipeline/validate-license-refresh.ts` | `919bbd5392c62ee97f91e88e1af892af165baa67c6871ac47347e206867a01bf` |
| `src/pipeline/validate-license-refresh.test.ts` | `ed7b38e40a3d4c78e02d6ef1a3a96118fca13ce5fb3ee968b6b98ea7311d184a` |
| `scripts/stage-refresh.mjs` | `34a4da4e756688fcb685ba5583e04a839c584e7949dc7d83b246fef33ca3464e` |

The independently verified retained receipt hash is
`f05984f434ff5553d65e5c22b50bf657e8ec65238be9d7c57c3b144cdd8d3b60`;
the unchanged aggregate-metrics hash is
`ba4fb5bcf1f440df6e94a77362d4d202d14052d751da741ad7f02d9566afb1bf`.
