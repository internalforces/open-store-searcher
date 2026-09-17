| Severity | Count |
|---|---:|
| Critical | 0 |
| High | 0 |
| Medium | 1 |
| Low | 1 |
| Info | 1 |

# TASK-019 Actions security review — AC-019-8

Date: 2026-09-17. Owner: Security Reviewer. Requirements: FR-12, PRD Section 14.4,
AC-019-8; publication acceptance remains with TASK-009/010/021.
Disposition: **Review performed; changes required before publication approval.**
This is a direct review, not an independent second-reviewer approval. No security remediation
or repository setting change was requested or applied.

## Scope and evidence identity

The user explicitly activated TASK-019 and requested the remaining Actions review. Reused the
clean existing checkout on a separate `codex/task-019-actions-review` branch based on
`dddc61a4b2521ddfbd3782916980efe8c1264bc5`. PR #24 is merged. Read-only API evidence identifies
remote main as `73edf04bb45a371e3a9fe7b4b38220e1a625d4ca`. All three workflow files, the three
called scripts and lockfile have identical SHA-256 digests at the two revisions. The remote tree
inventory is complete and contains no additional workflows.

The [evidence receipt](security-2026-09-17-task-019-actions-evidence.json) retains timestamped
API responses, local hashes, immutable upstream action metadata/source, deployed-action bundle
hash and selected executable contexts, workflow structure and main comparison. No secret
endpoint, secret value, environment file, dispatch or deployment was accessed. The authenticated
repository response grants admin visibility, allowing missing protection to be distinguished
from an ordinary unauthorized request. Pages HTTP 404 is an observation, not proof of all
account-level configuration.

## Medium — SEC-ACTIONS-01: required deployment protection is absent

Threat: an authorized writer, or a compromised writer account, can alter the default branch
without an enforced reviewed-PR/status-check boundary. If publication is later enabled, the YAML
alone does not enforce the promised human deployment approval. This is a conditional protection
gap, not a demonstrated external-PR exploit or a currently active deployment bypass.

Location: [refresh.yml lines 62–83](../.github/workflows/refresh.yml); especially lines 71–72:

```yaml
    environment:
      name: github-pages
```

Evidence: current authenticated API returns zero environments, no repository/parent rulesets,
and `404 Branch not protected` for main. The publication variable endpoint returns 404 and
`publication/config.json` is absent. These two existing controls currently block publication;
keep them in place. Naming an environment in YAML does not configure its required reviewers.
GitHub documents these as separate [deployment protection rules](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments).

Concrete proposed remedy, **not applied**:

- Create `github-pages` with an explicitly selected human required reviewer, prevent self-review,
  disable administrator bypass where supported, and allow deployments only from `main`.
- Protect `main` with reviewed pull requests and the exact successful Verify check context;
  resolve that context from actual check runs before configuring it. Restrict bypass and force
  pushes/deletion as appropriate to the approved repository policy.
- Inspect the resulting settings through the API and exercise an approved environment-waiting
  and rejection path before any publication. Keep `PAGES_PUBLICATION_ENABLED` unset until the
  independent quality, baseline, performance, recovery and release gates pass.

Impact: absent enforcement of the intended code-review and action-time publication boundaries.
Confidence: High. Owner: Security Reviewer / Release Manager. Explicit approval required for
settings changes and any security fix; a human reviewer identity must be supplied before applying
reviewer-specific settings. No identity or waiver is invented by this review.

## Low — SEC-ACTIONS-02: transitive first-party action remains mutable

Threat: a future change or compromise of a first-party action tag can change artifact upload
behavior despite the workflow's top-level SHA pin. The read-only prepare job can still influence
the artifact eventually published by deploy; its token scope does not protect artifact integrity.

Location: [refresh.yml line 59](../.github/workflows/refresh.yml):

```yaml
      - uses: actions/upload-pages-artifact@56afc609e74202658d3ffba0e8f6dda462b719fa # v3.0.1
```

The exact pinned [upstream action.yml line 77](https://github.com/actions/upload-pages-artifact/blob/56afc609e74202658d3ffba0e8f6dda462b719fa/action.yml#L77)
contains:

```yaml
      uses: actions/upload-artifact@v4
```

All eight direct action uses are full 40-character pins. This finding concerns the nested
first-party action, not a mutable third-party action or an unpinned direct dependency. It confirms
the earlier 2026-09-12 observation with fresh immutable upstream evidence. Full-SHA pinning is
GitHub's [recommended immutable reference](https://docs.github.com/en/actions/reference/security/secure-use).

Proposed replacement for the existing upload step, **not applied**:

```yaml
      - name: Package accepted Pages artifact
        shell: bash
        run: |
          tar --dereference --hard-dereference \
            --directory "$RUNNER_TEMP/site" \
            -cf "$RUNNER_TEMP/artifact.tar" \
            --exclude=.git --exclude=.github .
      - uses: actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02 # reviewed v4 resolution
        with:
          name: github-pages
          path: ${{ runner.temp }}/artifact.tar
          retention-days: 1
          if-no-files-found: error
```

The suggested SHA was resolved through the official action repository during this review and
is recorded in the receipt. This is a concrete proposed diff, not approval of a new action:
review its executable bundle and validate tar layout, hidden files, no-links output, same-run
selection and failure behavior before adoption. Retention stays unchanged in this proposal;
recovery retention needs its own approved operational decision.

Impact: the artifact-production chain is not fully immutable. Confidence: High.
Owner: Security Reviewer / Implementer. Explicit approval required for the workflow/security
change. No action was added or executed during this review.

## Info — SEC-ACTIONS-03: recovery and hosted acceptance remain separate

The upload composite defaults to one-day retention. No hosted publication/recovery experiment
was performed here, and the Pages endpoint returned 404. Passing CI, same-run provenance and
content digests do not demonstrate rollback availability, uncertain-deployment reconciliation,
physical-device performance or thirty-day refresh reliability. Keep these gates with
TASK-009/010/021; do not manufacture a policy or baseline to exercise them.

The existing SHA checks reduce stale-code publication but do not lock the branch between the
final check and the deployment API call. No stronger race-free guarantee is claimed. No shared
build cache or cross-run artifact consumer appears in the current workflow set.

## Trust-boundary review

| Area | Actual evidence | Assessment |
|---|---|---|
| Verify triggers | `pull_request`; push to main; `contents: read`; hosted Ubuntu | Untrusted PR code can run install/tests but receives no workflow-declared secrets or write/OIDC scopes. No privileged PR trigger. |
| Observation | Push only to `codex/task-009-010-publication`, filtered paths; read-only token | Separate non-publishing research job. It is not the daily calibration heartbeat and does not grant deployment rights. |
| Refresh triggers | Schedule/manual; prepare requires the current default branch | No `pull_request_target`, `workflow_run`, comment-trigger or fork checkout in a privileged job. |
| Injection | 16 direct shell blocks, no `${{ }}` interpolation inside them | Bootstrap Boolean and GitHub metadata cross through env; shell uses quoted values. No github-script or custom action shell sink. |
| Permissions | Top-level `{}` in all three workflows; read-only preparation and verification | Only deploy has `pages: write` / `id-token: write`; its `contents: read` supports the branch-ref API check. |
| Credentials | All three checkouts set `persist-credentials: false`; no `secrets.*`, tracing or secret output in reviewed workflows | Deploy exposes its short-lived token only to its API step/action. No checkout, npm install or project scripts in the privileged deploy job. |
| Output handling | `stage-refresh.mjs:121–124` appends `source_change` | Collector constructs the exact literals `changed`/`unchanged` at `collect-seoul-archive.ts:122`; no raw provider/user multiline value enters this output. |
| Action dependencies | Four unique direct first-party actions, eight full-SHA occurrences | Official pinned metadata fetched; composite nested tag yields SEC-ACTIONS-02. No guarantee of full vendored dependency/CVE audit. |
| Runners/cache | All jobs use hosted `ubuntu-24.04`; no cache action or configured setup-node cache | No persistent self-hosted PR runner or cross-trust build cache. Node/npm versions are explicit; package install uses the lockfile. |
| Artifact producer | Prepare requires config, passes full verification, stages validated data and builds only the new site directory | No PR artifact input, caller-selected path or cross-run download. Archive/manifest/baseline digests, bounds and collection-date bindings remain enforced by the called code. |
| Artifact consumer | Deploy needs successful prepare and the enable flag; separate fresh runner | Pinned deploy-pages bundle lists artifacts in the current run and rejects zero/multiple matching `github-pages` names; it sends that ID to Pages rather than executing artifact contents. |
| Deployment freshness | Ref checks before upload and after the environment boundary | Failure stops publication; human approval itself is still missing in actual settings (SEC-ACTIONS-01). |
| Actual repository defaults | Public; Actions enabled/all allowed; SHA policy false; default token read; Actions cannot approve PRs | Local pins/scopes still apply. Broad allowlist/SHA policy is context, not an additional demonstrated exploit. Fork approval is `first_time_contributors`. |

The pinned deploy-pages source logs its deployment payload, including an OIDC field. The actual
5,587,460-byte executable bundle calls `core.getIDToken()` and its bundled OIDC client registers
`setSecret(id_token)` before returning it. This is not evidence of an unmasked token leak; bundle
contexts and SHA-256 are retained. No live token or deployment log was retrieved to test masking.

## Verification and limits

- Fresh authenticated read-only settings requests and pinned upstream reads are preserved in the
  receipt. Remote main workflow inventory and seven remote file digests match the review base.
- All three YAML documents parse with duplicate-key rejection and aliases disabled. The local
  Psych 3.1.0 parser uses YAML 1.1; its Boolean interpretation of the key `on` is normalized for
  structural inspection. This check is not GitHub's complete workflow-schema validator.
- Structural assertions check deny-all defaults, full-SHA direct references and absence of
  expressions inside all 16 shell blocks. Manual review covers env/action inputs and callee code.
- Pinned Node 24.19.0/npm 11.17.0 `npm run format:check` and `npm run lint` pass; lint retains
  five pre-existing informational suggestions. Git whitespace and report links pass. All 12
  local hashes and six retained upstream content hashes match. Application, workflow, dependency
  and configuration files remain unchanged.
- No new application test run or dependency advisory audit is claimed for this review-only pass.
  Historical 797/68/20 verification belongs to TASK-008, not a fresh result here. The remaining
  release dependency scan and hosted execution/recovery tests are not waived.

To reproduce settings reads, run `gh api` against each exact `settings.*.endpoint` in the receipt.
For upstream sources, query each exact `upstream[].endpoint`, base64-decode `content`, and compare
SHA-256. For the large executable use `gh api ENDPOINT -H 'Accept: application/vnd.github.raw+json'`
with `deployBundle.endpoint`; do not execute the bundle. Compare local file bytes to `sha256` and
fetch the seven `mainComparison` paths at the recorded main revision. Do not use secret endpoints.

## Acceptance disposition

AC-019-8's **review and evidence collection are performed**. Its security acceptance remains
open for SEC-ACTIONS-01/02 remediation or explicitly reviewed disposition; no clean approval is
claimed and the acceptance checkbox remains unchecked. TASK-019 stays the sole active task,
awaiting the user's decision on the documented security changes. TASK-008 continues its approved
observation interval; TASK-009/010 and release acceptance remain paused on their existing gates.
The bounded review is recorded as completed work without moving overall TASK-019 to completed.

Review each proposed change before committing. No workflow or account setting has been modified.
