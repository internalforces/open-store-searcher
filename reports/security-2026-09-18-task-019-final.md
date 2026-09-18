| Severity | Unresolved | Disposition |
|---|---:|---|
| Critical | 0 | None identified in the bounded Actions review |
| High | 0 | None identified in the bounded Actions review |
| Medium | 0 | SEC-ACTIONS-01 remediated with explicit solo-maintainer risk acceptance |
| Low | 0 | SEC-ACTIONS-02 fixed and merged |
| Info | 1 | Hosted publication/recovery remains a separate release gate |

# TASK-019 final Actions security review — 2026-09-18

Disposition: **AC-019-8 accepted; TASK-019 complete within its recorded review scope.**
This closes the remaining Actions criterion, not production readiness or release approval.
Historical AC-019-1 through AC-019-7 retain their dated application/evidence boundaries;
this is not a new whole-application or dependency-advisory audit.

## Reviewed identity and verification

[PR #25](https://github.com/internalforces/open-store-searcher/pull/25) merged on 2026-09-17
as `32c1809d68d4227541cee46596d834e72072de61`. Its final head is
`d4591106b96ccbd996f2c6f52a28e9ac023c0462`. Fresh GitHub tree comparison confirms all three
workflow files, staging/build/packaging scripts and package lock match current remote main.
Exact file hashes, API responses and CI steps are in the
[receipt](security-2026-09-18-task-019-final-evidence.json).

[Ubuntu Verify run 35222990361](https://github.com/internalforces/open-store-searcher/actions/runs/35222990361)
succeeded on the final PR head, including `npm run verify:full`, 68 browser checks,
20 accessibility tests and all four actual GNU tar packaging fixtures (zero failures).
This supersedes the earlier pending final-head packaging check. No full local rerun is claimed:
source/test/workflow bytes were not changed in this closure pass.
Fresh local structural checks pass for three YAML documents, eight full-SHA action references,
18 expression-free shell blocks, job permissions, checkout credentials and deployment guards.
The one-off check used existing Node 22.22.3/YAML 2.6.1; it is an inspection tool, not the pinned
application test runtime. Hosted verification uses the workflow's Node 24.19.0/npm 11.17.0.

Closure-document validation also passes: repository `format:check` (198 files), Git whitespace,
86 local Markdown link targets, final settings assertions and unchanged reviewed-source hashes.
No package was installed and no application test result was substituted for the hosted run.

## SEC-ACTIONS-01 — protection and explicit operating-policy acceptance

Threat: one maintainer can introduce and approve a publication without a second person's review.
Severity: Medium residual operating risk, explicitly accepted by the user on 2026-09-18.
Confidence: High. Evidence: fresh authenticated main/environment API readback in the receipt.

Main already had required PR approvals `0` and `require_last_push_approval=false`, contrary to
the 2026-09-17 record. The user explicitly chose to retain this solo-maintainer policy and record
risk acceptance. No main setting was changed in this pass. Strict `verify` bound to GitHub
Actions App 15368, administrator enforcement, conversation resolution and force-push/deletion
prohibitions remain enabled. There are no additional repository rulesets.

The user also explicitly authorized deployment self-review. Created `github-pages` with required
reviewer `internalforces` (authenticated sole collaborator, ID 81242244),
`prevent_self_review=false`, and exactly one custom deployment policy: branch `main` (no tag rule).
Disabled administrator bypass (`can_admins_bypass=false`) and verified it by a fresh GET.
The first environment creation defaulted administrator bypass to true; a second authorized PUT
corrected it before final readback. The receipt preserves both states, not just the desired state.

Self-review permission preserves a manual approval step but removes independent human separation.
The owner accepts that limitation; future collaborators or changes to privilege boundaries require
reassessment. Approval required: obtained in this conversation for this exact policy.
No deployment was dispatched or approved, and publication remains disabled.

## SEC-ACTIONS-02 — immutable upload chain resolved

`.github/workflows/refresh.yml` now calls
`actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02` directly after GNU tar packaging.
The old composite's nested mutable action no longer executes. The merged workflow retains
`github-pages`/`artifact.tar`, one-day retention and missing-artifact failure. Historical immutable
upstream review is preserved in the [remediation report](security-2026-09-17-task-019-remediation.md).
The four hosted fixtures verify ordinary/hidden bytes, excluded Git metadata, link materialization,
missing-site failure and dangling-link failure against the actual workflow shell.
No additional fix or approval is needed for this finding.

## Final trust-boundary review

- `Verify`: PR and main-push triggers; ephemeral Ubuntu runner; contents-read token; no persisted
  checkout credentials, secret references, cache reuse or publication artifact consumption.
- `Observe Seoul quality`: constrained branch-push trigger, read-only token and no publishing job.
- `Validated Pages refresh`: schedule/manual trigger and default-branch preparation guard. No
  `pull_request_target`, `workflow_run`, issue/comment trigger or fork-code execution with write scope.
- Each workflow denies permissions by default. Only deploy receives Pages/OIDC write permissions;
  deploy runs no package install or checked-out application code. Runtime token use is confined to
  the authenticated revision check; no shell tracing or token output is present.
- Shell expressions are assigned through environment variables and quoted. `source_change` output
  is a collector-controlled enum, not provider text. Staging validates reviewed configuration,
  bounded archive extraction and hashes; building binds validated entries and copies verified bytes.
- Artifact production depends on successful verification/staging/build and an up-to-date revision.
  Deploy depends on prepare, uses the same run's Pages artifact and rechecks main after approval.
  No untrusted PR artifact or cross-run cache is promoted. Publication configuration is absent on
  main and the publication-enable repository variable is absent.

The final review was performed in this task by the same reviewing agent; no independent second
review is asserted. The original acceptance criterion requires actual Actions review, which is
now evidenced with fixes, final-head verification and accepted setting policy.

## Release limitations and references

TASK-008's approved 30-day interval and policy/empty-list/baseline decisions remain open.
TASK-009/010/021 retain accepted production candidate, mobile/hosted performance, real publication,
recovery and release verification. A settings GET and tar fixture are not a live deployment-gate
experiment or recovery test. No current CVE clearance is inferred from historic dependency checks.

The environment setup follows GitHub's [environment API](https://docs.github.com/en/rest/deployments/environments)
and [branch-policy API](https://docs.github.com/en/rest/deployments/branch-policies); the saved API
readback, rather than undocumented defaults, is authoritative for applied settings.

Review each change before committing. Only authorized GitHub environment settings and local
review/task records were changed; no workflow/product source, commit, push, merge or deployment
was performed by this closure pass.
