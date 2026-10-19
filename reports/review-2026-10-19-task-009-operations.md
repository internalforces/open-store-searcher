# TASK-009 operational preparation review

Date: 2026-10-19. Scope: preparation/proposal only, not implementation, design acceptance, security approval, remote-setting approval or deployment authorization. Reviewed the two operations reports, exact operational configuration proposal and proposed operational/recovery design in the calibration worktree. Reused the existing recovery-path assessment rather than re-auditing the workflow. No repository file or remote state was modified.

Verdict: **No remaining actionable findings in this preparation/proposal scope after the sequence correction.** The evidence/classification and high-level recovery boundaries are consistent. This is a scoped review result, not approval of the design or any operation.

## Resolved finding

### [P2 — resolved] Make the exact-candidate preparation-to-deployment transition explicit

The first draft prepared with publication disabled and then enabled deployment as though that alone would create a pending protected-environment job. The current workflow skips deployment when its variable condition is false (`.github/workflows/refresh.yml:73-74`); a later variable change does not itself queue that candidate.

The corrected `docs/superpowers/specs/2026-10-19-task-009-operational-recovery-design.md:146-156` now requires separate one-run enable/dispatch authorization, verification that the environment blocks unapproved deployment and scheduling stays disabled, flag enablement before dispatch, no automatic environment approval, preservation of the exact run/candidate inventory, and action-time approval of that specific pending job. It explicitly explains the skipped-job behavior and resets the flag on preparation failure/completion. This resolves the sequence gap without substituting a new collection or importing a local candidate implicitly.

## Evidence checks passed

- The configuration proposal's entire `configuration` object, excluding only `previousReleaseUrl`, deeply equals `publication/validation-config.json`. The approved policy, initial baseline, reviewed-pair contract and all three resource ceilings are unchanged. The source config SHA-256 matches `f3feafd8d37d30e859b7797fe753277d2091cb7383009e035dff60edb76987f1`. `publication/config.json` remains absent.
- All eight current `privateEvidenceDigests` match the named private evidence files, including the added dated remote-state receipt. The formatted proposal SHA-256 also matches `49d4efb380ec39a07b438533ee414ea8f32037e59620e5b7bbca06996651c044`. Every private current-validation receipt field is reproduced in the aggregate; the additional aggregate fields are explicit derived classification. The retained-package aggregate exactly equals its private receipt.
- Recounting the current validator error yields nine `count_above_maximum`, eighteen `count_change_exceeded`, twenty-four `status_share_change_exceeded`, and one `source_coverage_unverified`. Production `compareMetric` emits the first three with rejection severity (`src/pipeline/validate-license-refresh.ts:308-319,339-364`); coverage uncertainty is a warning (`src/pipeline/validate-license-refresh.ts:565`). The reports correctly separate warning and rejection and disclose their string-derived counts rather than claiming structured per-category diagnostics.
- The elapsed strict-validation interval equals 402,875 ms. The complete-source result is correctly described as transfer accepted but quality/publication blocked: 195 categories / 2,952,086 rows, unchanged archive digest, no candidate output and no accepted new baseline (`reports/operations-2026-10-19-task-009.md:24-45`; aggregate `:11-43`). Passing the global total maximum alone does not pass category/delta/status gates.
- Retained proof consistently identifies 730 files / 691,233,947 site bytes, 691,804,160 tar bytes, 207,515,860 gzip bytes, the matching inventory/package/release/baseline hashes, original October 16 collection instant and unverified source coverage (`reports/operations-2026-10-19-task-009.md:47-68`; aggregate `:45-82`). It is accurately marked local, non-publishing and not hosted-verified. I verified receipt/digest consistency; I did not independently rehash the container's 691 MB site or rerun extraction/build.
- Relative Markdown file links in both reviewed Markdown documents resolve. Repository/remote facts are attributed to the parent's dated readbacks; I did not repeat live API inspections.

## Recovery design assessment

The proposal addresses the previously identified gaps at the right boundaries:

- A schedule gate defaults off before operational config activation; one-time operations do not implicitly authorize daily collection (`design:60-65`).
- Same-SHA/unexpired job rerun is clearly distinguished from durable cross-revision restoration and recollection (`design:30-36`).
- A durable complete snapshot includes the application shell/Worker, inventory and provenance, not only descriptor/baseline. Public Release archival versus operator custody is an explicit decision, not assumed zero-cost hosted storage (`design:67-94,184-193`).
- Proposed recovery uses trusted current-main code, same-repository exact asset identity and hashes, bounded validation before extraction, complete V2 checks and same-run re-upload. It retains the main-SHA/environment/concurrency controls and confines Pages/OIDC writes to deployment (`design:96-126`). Historical code is not executed and normal refresh permissions are not broadened to archive content.
- A local validated candidate cannot masquerade as a previously successful public release. The fresh quality rejection remains unresolved, and retained initial import requires a separate design/source/candidate approval (`design:40-44,87-89,137-140`).
- Old collection timestamps, quality limits and source uncertainty remain intact. Older-than-current-baseline rollback needs a separate reviewed decision; it is not a generic recovery bypass (`design:118-121`).
- Public full-byte reconciliation, descriptor re-read, archive download equality and independent recovery action approval are explicit. Failed/timeout status is not mistaken for public preservation. Hosted destructive failure injection is not implicitly authorized (`design:157-173`).

These are adequate high-level preparation contracts. Their implementation still needs exact trust-root/provenance acceptance rules, numeric compressed/expanded/per-file limits, safe extraction tests, public reconciliation behavior and independent security/quality review. They are not established by this proposal or this review.

## Approval boundaries

The pending ledger and report do not authorize source-policy relaxation, initial retained import, config activation, remote Pages/variable changes, branch delivery/merge, tag/asset publication, dispatch, environment approval, deployment, recovery or recurrence. Existing 849/68/20 evidence remains dated to its unchanged local-code scope. The current fresh rejection prevents selecting the live source as a publication candidate; implementation approval of the recovery design alone would not remove that blocker.

The final aggregate includes a parent-supplied `2026-10-19T02:58:47.033204+00:00` remote readback and its matching private evidence digest. Its main/no-Pages/no-flags/no-artifacts/no-releases/protection facts are consistent with the proposal; this reviewer did not repeat the remote API readback. No new test suite, source acquisition, hosted operation or deployment was performed for this review. Existing work, private raw inputs and handbook boundaries were preserved.
