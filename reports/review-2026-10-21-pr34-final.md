# PR #34 final review and guarded-main integration — 2026-10-21

## Findings summary

| Severity | Initial unresolved | After scoped correction |
| --- | ---: | ---: |
| Critical / High | 0 | 0 |
| P2 workflow correctness | 3 | 0 (final independent Approved) |
| New Minor | 0 | 0 (final independent Approved) |

The user authorized final review and conditional protected-main integration while retaining
all quality criteria and withholding source-data upload/deployment. The independent frozen-head
review of `b586e72..09c20e5` confirmed the same three remote P2 findings and no additional defect.
The author of the correction and the independent reviewer are separate agents.

## Corrected findings and concrete triggers

1. **Stale main after environment approval.** The old main guard preceded checkout, Node setup
   and network validation. A concurrent merge could advance main before publication. Keep that
   fast rejection and repeat the main API check in the final deployment step.
2. **Expiry during validation.** A valid preparation could expire while a later public-state
   request was in flight. The final step now runs the real public descriptor404 check, reads
   current main, then runs the existing real binding/clock checker; deployment is the next step.
   At/after expiry rejects. No later network probe precedes that action.
3. **Same-run retry artifact ambiguity.** Reruns reuse a run ID and can leave more than one fixed-name
   candidate, which the pinned deploy action rejects. Both jobs now reject any actual
   `GITHUB_RUN_ATTEMPT` other than exact1 as their first executable step. Retry means a new
   separately authorized workflow_dispatch and fresh IDs/review. Fixed names, no overwrite and
   minimal permissions remain. The runtime variable is consumed directly, without redefining a
   reserved GitHub default. This behavior follows the existing fresh-run/single-candidate contract.

Primary upstream references: [deploy-pages issue338](https://github.com/actions/deploy-pages/issues/338)
and [pinned artifact selector](https://github.com/actions/deploy-pages/blob/d6db90164ac5ed86f2b6aed7e0febac5b3c0c03e/src/internal/api-client.js)
confirm the multiple-same-name rejection. [GitHub variable rules](https://docs.github.com/en/actions/reference/workflows-and-actions/variables)
identify default runtime variables and reserved names. These are local executable fixture tests,
not an operational rerun or deployment exercise.

## Requirement and executable evidence

| Requirement | Exact evidence |
| --- | --- |
| Final current-main check after public probing | `initial final guard probes public 404, rechecks main, then validates the same-run binding immediately before deploy` — actual YAML shell, real public/binding CLI, controlled external gh/fetch; current, obsolete and both transport failures. |
| Before/at/after 24-hour expiry | `initial final guard accepts a binding before expiry and rejects it at or after expiry after both network probes` — real native binding checker and controlled clock. |
| Expiry reached during either network boundary | `initial final guard rejects expiry reached during either network probe before publishing` — probe/main advance clock to expiry, action never reached. |
| Early expiry remains a fast rejection | `initial import keeps the early trusted-run expiry fast-fail before public probing`. |
| First executable step rejects same-run retries | `initial import rejects rerun attempts as the first executable step in both jobs` — exact1 passes;2/7/missing/empty/0/01/1x/malformed reject before checkout. |
| Unchanged existing quality objects | `production configuration equals exactly the approved configuration with unchanged quality objects`; protected byte hashes unchanged. |

## Actual verification

The retained initial RED receipt `check-20261021-144108-311196.log` ran13 tests:10 passed and3
failed on the missing first-attempt/final-boundary guards. The final focused file runs15/15
(`check-20261021-144746-997181.log`), with separate lint and format exits0
(`check-20261021-144752-300717.log`, `check-20261021-144754-639598.log`). An earlier full attempt
`check-20261021-144535-778318.log` stopped on8 new test-only lint warnings. Equivalent regex
quantifiers and unused-parameter cleanup corrected them without changing cases or suppressing rules.

Fresh exact pinned `npm run verify:full` exits0:56 Vitest files/1,366 tests,68 four-browser
checks and20 accessibility tests. Coverage is93.30% statements/91.72% branches/95.65% functions/
95.01% lines. Primary log `check-20261021-144830-992097.log`, SHA-256
`ee56745dae760ae865a452373b76c9fe8fbe9c1a8f8ad0fccadd87f68f7e1396`.

The exact five-file Node operator/workflow command exits0 with101 passed and no failures,
skips, cancellations or todos. The increase from96 is five workflow-boundary regressions.
Primary log `check-20261021-145140-727578.log`, SHA-256
`ac045ef342362783e3b67ca4f9a97a0ea59759f472c50018dd2a16eba833631c`.

Commands run sequentially in the existing pinned Ubuntu24.04.4/Node24.19.0/npm11.17.0 container,
with existing caches and no global/dependency changes. Final full lint has zero new warnings and
only the five previously disclosed informational notices. Logs/receipts and exact snapshots are
retained outside Git under the existing ignored proof workspace. Current-head remote CI is a
separate action-time gate; these local results never stand in for an unknown remote outcome.

## Historical proof and preservation

The exact October16 raw proof remains historical. Of its178 complete code bindings,176 remain
byte-identical. The only two differences are `.github/workflows/initial-import.yml` and
`scripts/check-publication-workflows.test.mjs`, the guard and regression correction reviewed
here. Producer/parser/quality-validator/builder/archive modules, original observation/ZIP,
195 categories/2,951,024 rows, all730 proof files, dates, tar and inventory are not changed or
relabeled. A heavy raw replay was not repeated for these guard-only changes.

Configuration/validation/source and recovery registry hashes remain unchanged, both registries
inactive. Original checkout73 files/exact status and four earlier frozen report/spec hashes remain
preserved. A fresh preservation-only rehash independently confirms all5 accepted proof files,
all730 unpacked site files and6 original inputs still match the historical inventory. No proof
receipt was rewritten. No dependency, action pin, permission, infrastructure, status mapping, public URL,
quality threshold, baseline, concurrency, skip/retry/flaky policy or source selection changed.

## Independent review

The original complete44-path review found the three P2s above and no additional issue. The
independent scoped rereview is **Approved** for the frozen four-path correction
`correction-core-review.diff`, SHA-256
`c6d8193d419e3a930c8d344f7f4710d0377d6bbf438c891ba0825e975d06b206`.
All four exact byte bindings remain current. It confirms the three findings are addressed,
existing trust/permission boundaries retained and no new findings. The reviewer is read-only
and distinct from the implementer. The final accumulated-evidence/handoff assessment is also **Approved** in private
`final-premerge-assessment.md` for the exact12-path package SHA-256
`242e8deb1fa500d1aeff3190ce3a162c3d20590ec95b6f012b8394c57c030bd9`. The reviewer
independently reconciled both primary log hashes and all12 path bindings. Verdict: Ready to merge
after exact corrected-head Verify and required conversation resolution pass through normal
protection. Critical/High0, P2 open0, new Minor0; no additional actionable finding. Only this
external-verdict/status note was added administratively after review; core bytes are unchanged.

| Dimension | Current assessment |
| --- | --- |
| Correctness/design | Three defects corrected; exact contract reviewed. |
| Security/privacy | Manual/main/default-off/protected deployment retained; safe runtime inputs, pinned actions, narrow permissions, no new secret or data execution. |
| Performance/preservation | Producer/build/resource limits unchanged; rejection remains fail-closed, raw proof preserved. |
| Test/maintenance quality | Actual shell/CLI boundary regressions and full checks pass; retry and final-guard contracts documented. |

## Main integration and operational boundaries

Read-only preflight confirms strict required Verify, enforced administrators, required conversation
resolution and zero mandatory approving reviews. The repository reports has_pages=false;
publication/schedule variables are absent/defaultoff. The only main-push workflow is read-only
Verify; initial import/restore are manual and publication remains disabled. No setting was
changed. Addressed conversations are resolved only after independent confirmation and fresh CI;
merge uses the exact reviewed head through normal protection without an admin override.

Actual corrected-head CI and merge/exact-main CI outcomes are read back at action time and
retained privately, with their live URLs in the PR. This report does not infer future success.
Source Release/assets/attribution/resource adoption, actual protected-environment setup,
publication/public equality, durable backup/recovery and full-data/mobile/physical/release gates
remain unperformed and open. The five pre-existing informational lint notices remain nonblocking.
TASK-009/II-10/hosted AC-009-4/5 stays active; TASK-010 remains paused. No source upload, registry
activation, operational dispatch, environment approval, deployment, recurrence, branch deletion,
worktree cleanup or handbook/milestone closure is authorized or performed.
