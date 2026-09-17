# Pre-approval deployment preparation

Date: 2026-09-17. Related work: TASK-019 / AC-019-8, TASK-009/010/021 / FR-13.
The user's latest request is to create the PR and prepare deployment work up to approval.
It replaces the interrupted self-approval request. No PR approval, merge, deployment approval,
publication flag enablement, baseline adoption or production workflow dispatch is authorized.

## Deliverable and verification

PR: https://github.com/internalforces/open-store-searcher/pull/25
Branch: `codex/task-019-actions-review`. Base: `main`.
The immutable upload correction and actual main-protection evidence are delivered.
The ordinary pull-request Verify workflow runs on Ubuntu 24.04 with read-only permissions.
It cannot publish and does not invoke the provider collector or production refresh.

The added `scripts/check-pages-artifact.test.mjs` runs the actual packaging shell extracted
from the uniquely named refresh step. It checks archive root and nested bytes, hidden-file
preservation, Git metadata exclusion, symlink/hard-link materialization, missing site failure,
dangling-link failure and a temporary path containing spaces/shell metacharacters.
It requires GNU tar and fails explicitly on an incompatible host; no platform skip is added.
The test is wired after `npm run verify:full` in the read-only Verify job. This is a local
fixture artifact only; it is never uploaded or deployed.

## Gate status before a real candidate can be submitted for deployment approval

| Gate | State | Required evidence or action |
|---|---|---|
| Main branch protection | Applied/read back | Required GitHub Actions verify/App 15368, current base, one PR approval, last-push approval, administrator enforcement and no force push/deletion. |
| Upload action immutability | Implemented in PR | Merge reviewed PR after required checks and approval. Not yet the default-branch workflow. |
| Ubuntu full verification and actual tar fixture checks | Awaiting latest PR run | Record the exact successful head SHA, run and packaging cases; do not reuse an earlier-head result as final evidence. |
| PR approval/merge | Pending | No self-approval attempted. Main currently requires another eligible reviewer; only internalforces is listed as a collaborator. |
| Deployment environment | Pending reviewer identity | The proposed settings below must be completed and read back. |
| Source calibration | In progress, approved 30-Seoul-calendar-day interval from 2026-09-17 | Retain distinct observations and failures under TASK-008. This request does not shorten the interval. |
| Numeric quality policy and allowed-empty list | Unapproved | Derive from interval evidence; obtain explicit approval under ADR-014. |
| Initial baseline | Unapproved | Select and bind to the approved policy, hashes and all-category metrics; obtain explicit approval. |
| Production operator configuration | Absent, intentionally | Construct only from the approved policy/baseline/resource limits; no synthetic or placeholder config. |
| Accepted full-source candidate | Not available | Run complete staging/validation/build and preserve the output hashes, total bytes, bindings and previous-good-state failure evidence. |
| Mobile/hosted performance and release acceptance | Open | Retain the existing owner-task requirements; a passing security PR is not a waiver. |
| Hosted publication/recovery | Not executed | Requires a concrete accepted candidate and separate human action-time deployment approval. |

**This is a preparation checkpoint, not a claim that only the final approval click remains.**
There is no deployable production artifact or pending GitHub environment deployment to approve.
No source archive, quality threshold, empty-category acceptance or initial baseline was invented.

## Concrete environment configuration proposal

- Environment: `github-pages`.
- Required human reviewer: **pending user-specified GitHub identity**; no default is assigned.
- Prevent self-review: true under the previously approved security proposal. Any change to this
  operating policy needs explicit user direction; the interrupted request is not executed.
- Branch policy: custom branch-only rule for `main`, not a same-named tag.
- Administrator bypass: disabled where supported, with effective setting verified afterward.
- Repository variable `PAGES_PUBLICATION_ENABLED`: remains absent until all prerequisite gates
  and the explicit publication authorization are satisfied.
- Pages site: API currently returns 404; configure the Actions publishing source only as an
  approved setup action, without falling back to branch publication or triggering deployment.

## Execution order after prerequisites and approval

1. Complete the calibration-derived policy/empty-category and initial-baseline decisions.
2. Finish protected environment/Pages setup and independent PR/security/release review.
3. Stage and validate a complete candidate using the reviewed configuration; produce a concise
   approval packet containing source/archive hash, policy revision, baseline, collection date,
   complete record count, artifact digests/site size, current commit and recovery procedure.
4. Obtain explicit approval for that concrete deployment, including first-run bootstrap if used.
5. Only then enable the approved publication path and dispatch the default-branch workflow.
   `bootstrap=true` is for the explicitly reviewed initial baseline with a confirmed release 404;
   later refreshes use the deployed baseline and must not silently bootstrap.
6. At the protected environment gate, have the designated human review/approve the exact run.
   Recheck the source revision, publish the same-run artifact and validate deployed bindings.
7. Record success/failure and approved recovery evidence. Failed validation must never advance
   the deployed baseline or overwrite the last known-good data.

Approval is not requested now because the concrete production candidate and its policy evidence
are not ready. Existing TASK-008 calibration continues; TASK-019 remains the sole active task.
