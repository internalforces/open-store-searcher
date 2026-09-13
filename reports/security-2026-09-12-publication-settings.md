| Severity | Count |
|---|---:|
| Critical | 0 |
| High | 0 |
| Medium | 1 |
| Low | 1 |
| Info | 1 |

# TASK-009/010 repository and Actions follow-up

Date: 2026-09-12. Reviewed revision: `3745940f215a5e4d295539ff31fe3c4e040820b2`.
Author assessment using the github-actions-hardening skill; not independent approval.
Requirements: FR-12/13, AC-010-3, TASK-019 AC-019-8.

## Medium: required deployment protection does not exist

Location: `.github/workflows/refresh.yml`, deploy job, `environment: github-pages`.
Authenticated read-only GitHub API inspection found no environments, no repository rulesets,
and no classic protection for `main`. The Pages endpoint returned 404. The account has
repository admin permission, so the environment/protection results are not inferred from a
failed authorization request. Pages 404 is recorded as observed, not proof of every possible
account configuration.

The YAML association alone does not require a human approval. Enabling publication before
creating the approved environment would not establish the promised approval boundary.
Confidence: high. Publication is currently disabled: the repository has zero Actions variables
and `publication/config.json` is absent. No active deployment bypass is claimed.

Proposed remedy for human review: create `github-pages` with a named human required reviewer,
prevent self-review, restrict deployment to `main`, and require passing `verify` plus reviewed
pull requests on `main`. Keep `PAGES_PUBLICATION_ENABLED` unset until reviewed quality config,
bootstrap evidence, independent review and deployment approval are complete. A reviewer identity
must be selected explicitly; none was invented. No account setting was modified.

## Low: a pinned composite delegates to a mutable action tag

Location: `.github/workflows/refresh.yml`, upload-pages-artifact step; upstream pinned
[action.yml](https://github.com/actions/upload-pages-artifact/blob/56afc609e74202658d3ffba0e8f6dda462b719fa/action.yml).
The pinned composite contains `uses: actions/upload-artifact@v4`. Top-level SHA checks pass,
but the complete action dependency chain is not immutable. This first-party action executes
in the read-only preparation job, not the Pages/OIDC deployment job. Confidence: high.

Proposed remedy for review: replace the composite with its equivalent audited Linux tar
packaging and an explicitly verified full-SHA upload-artifact reference. Preserve the Pages
artifact name and tar format. This is a security-related workflow change requiring approval;
no unverified SHA, dependency, vendored action or workflow change was introduced here.

## Info: recovery retention and history remain unproven

The same upstream action defaults to one-day artifact retention. The current deployed baseline
is durable within its release, but this does not retain an earlier complete release indefinitely.
No previous publication exists in the observed run history. Hosted rollback, uncertain-deploy
reconciliation and the thirty-day reliability criterion therefore remain open. The PR verification
run is CI evidence only; it is not a scheduled refresh or publication success.

## Verified boundaries and reproducible inspection

Both YAML files parsed without duplicate keys. Top-level permissions deny all; jobs grant only
the needed read or Pages/OIDC scopes. All top-level action references are full SHA pins. No
workflow expression occurs inside a shell run block. Fork PR verification uses a read-only job
and checkout disables credential persistence. Refresh accepts only daily/manual default-branch
runs, uses one same-run artifact and rechecks the source revision after environment approval.
No privileged fork trigger, shared build cache, secret output or self-hosted runner is present.

Read-only commands (no secret endpoints):

```text
gh api repos/internalforces/open-store-searcher/environments
gh api repos/internalforces/open-store-searcher/rulesets
gh api repos/internalforces/open-store-searcher/branches/main/protection
gh api repos/internalforces/open-store-searcher/pages
gh api repos/internalforces/open-store-searcher/actions/permissions
gh api repos/internalforces/open-store-searcher/actions/permissions/workflow
gh api repos/internalforces/open-store-searcher/actions/variables
```

Observed additional settings: public repository; Actions enabled, all actions allowed,
repository-wide SHA enforcement false; default workflow token read; Actions PR approval false.
Workflow-local pins and permissions remain effective despite the broader repository allowlist.

Review each proposed change before committing. No workflow or account setting has been modified.
