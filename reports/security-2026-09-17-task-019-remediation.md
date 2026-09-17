| Remaining severity | Count |
|---|---:|
| Critical | 0 |
| High | 0 |
| Medium | 1 (deployment environment pending reviewer identity) |
| Low | 0 in the corrected branch; merge remains pending |
| Info | 1 (hosted recovery evidence remains separate) |

# TASK-019 approved security remediation

The user explicitly authorized the reported security fixes, settings changes, commit and push
on 2026-09-17. This supersedes the earlier review-only authorization. The
[original review](security-2026-09-17-task-019-actions.md) and its receipt remain historical
pre-change evidence; they must not be read as the current remediation state.

## SEC-ACTIONS-02 — corrected in this branch

The refresh workflow now packages the accepted site using the audited Linux tar command and
calls `actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02` directly (official v4.6.2).
It removes the pinned composite's nested mutable `@v4` action reference. The official action
metadata, upload entry point, input parser, helper and executable bundle were fetched at that
exact SHA. The JS action declares no nested composite action; its bundle hash and relevant
executable contexts are retained. This is a bounded action review, not a new comprehensive
CVE audit of every bundled dependency.

Preserved behavior: artifact name `github-pages`, `artifact.tar` at the artifact root, one-day
retention, missing-file failure, successful-prepare dependency, enabled-variable guard,
read-only preparation, and Pages/OIDC permissions only in deploy. The tar command is shell-token
equivalent to the previous pinned Linux composite: the fixed builder path replaces INPUT_PATH
and verbose filename logging is omitted. It retains `.git`/`.github` exclusions and link
dereferencing. No application, dependency-lockfile, data/status contract or deployment was changed.

## SEC-ACTIONS-01 — main protection applied; environment remains pending

Fresh `verify` check evidence identifies GitHub Actions App ID 15368. Applied and read back
classic protection for `main`:

- Required `verify` check bound to GitHub Actions App 15368 and an up-to-date base branch.
- Required pull request with one approving review, dismissal of stale reviews and approval
  of the latest reviewable push by someone other than the pusher.
- Enforcement for administrators; conversation resolution required.
- Force pushes and branch deletion disabled; no locked branch or invented bypass identity.

The initial API request supplied both `contexts` and `checks`, which the current API rejected
with HTTP 422. The corrected request uses only `checks` and succeeded. Both responses and the
fresh readback are recorded in the [remediation receipt](security-2026-09-17-task-019-remediation-evidence.json).
No pre-existing protection was overwritten: the immediately preceding read returned
`Branch not protected` and the preceding ruleset inspection returned none.

The authenticated account and sole listed collaborator are `internalforces` (ID 81242244).
The pending user question requests the deployment reviewer identity and explains that preventing
self-review/admin bypass requires another approver for that user's own deployment and PRs.
No reviewer identity is inferred. The approved strict main policy now blocks self-authored PR
merges until another eligible reviewer approves; it does not block feature-branch pushes.

No `github-pages` environment has been created while its required reviewer is unresolved.
After the identity is provided, configure the reviewer, prevent self-review, restrict deployments
to the `main` branch (not tags), disable administrator bypass where supported, and read back all
settings. Do not enable publication or initiate an approval/deployment experiment without its
separate authorization. The publication flag and `publication/config.json` remain absent.

## Verification

- The pre-change check fails as expected on the composite's mutable nested action reference;
  the corrected workflow passes the direct SHA and artifact-interface assertions.
- Exact shell-token comparison passes against the old immutable Linux tar implementation,
  accounting only for the fixed path and omitted verbose logging. This is static equivalence,
  not a claim that GNU tar ran on macOS or that a hosted upload/deployment succeeded.
- YAML parses, direct references are immutable, and no shell expressions or privilege expansion
  were introduced. Same-run dependency and publication guard assertions pass.
- Pinned Node 24.19.0/npm 11.17.0 `npm run verify:full` reaches 795 passing tests and two failing
  Linux Info-ZIP integration tests on macOS. The source/tests are unchanged. The failures are
  `preserves UTF-8 Korean DOS-origin filenames and exact entry bytes` and
  `lists and streams entries from a valid local archive` in `unzip-archive.test.ts`.
  The command exits 1; no full-verification, coverage-completion or browser-suite pass is claimed.
- The existing Ubuntu Docker environment could not start: Docker Desktop reports a stopped
  engine and startup/restart attempts time out. No container was started, deleted or rebuilt.
  The host's BSD tar also does not support `--hard-dereference`; the Linux packaging fixture
  run remains pending. No test was weakened, skipped or changed to hide these limitations.
- Separate `npm run build` and `npm run quality:search:check` exit 0. The synthetic/source checks
  pass with no safety failures. Formatting, lint (five existing informational suggestions),
  Git whitespace and evidence digest/link checks pass before delivery.

A successful Ubuntu full suite and actual Linux artifact-layout/failure checks remain necessary
before final acceptance. This pass does not claim independent final Reviewer approval. TASK-019
stays active/incomplete; TASK-008 calibration and TASK-009/010/021 publication/recovery gates remain.

## Delivery and follow-up

Deliver the previous review plus this authorized workflow fix and settings evidence on
`codex/task-019-actions-review`. Commit and push are authorized; main merge, new publication,
workflow dispatch and risk waiver are not included. The pushed branch still needs review and
merge before its upload-action correction applies to default-branch refreshes.

Next required input: the GitHub user/team to require for deployment approval. This identity is a
material operating choice, not a request to repeat approval of the security changes already granted.
