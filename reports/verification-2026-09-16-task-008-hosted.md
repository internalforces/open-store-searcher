# TASK-008 hosted operational verification

Date: 2026-09-16. Role: Release Manager. Scope: read-only inspection of PR #23, current
GitHub Actions evidence, repository Pages/settings state, and the exact relationship between
the local TASK-008 head and merged `main`.

No ref was fetched or mutated. No workflow was dispatched or rerun. No repository setting,
environment, variable, workflow, deployment, GitHub message, source-data policy, or security
control was changed. Existing edits owned by the parent task were not modified.

## Result

PR #23 is merged and the exact merged code tree passed the repository's normal hosted Ubuntu
verification. That is valid code-correctness evidence for the committed compact-delivery tree.
It is not a hosted full-source refresh, a full-source mobile observation, a Pages publication,
or a hosted recovery exercise. The latest scheduled refresh stopped at the intentional missing
quality-configuration gate before installing the runtime or touching source data. TASK-008's
hosted operational gates therefore remain open.

## Exact revision relationship

- [PR #23](https://github.com/internalforces/open-store-searcher/pull/23), `Deliver compact
  Seoul snapshots with Worker-owned search`, merged at `2026-09-15T12:54:57Z`.
- The local implementation head is
  [`da9e63c864a45e2073f75f27aa32ef8370258e85`](https://github.com/internalforces/open-store-searcher/commit/da9e63c864a45e2073f75f27aa32ef8370258e85).
  GitHub reports this exact object as PR #23's head.
- Current GitHub `main` is merge commit
  [`bac6dcef84c9a9fbd2ecf9fb0734114ca4a7d975`](https://github.com/internalforces/open-store-searcher/commit/bac6dcef84c9a9fbd2ecf9fb0734114ca4a7d975).
  Its parents are prior `main` `81a14418ede4158ffc2306dc862a01ca761c3f85` and the exact
  local head `da9e63c864a45e2073f75f27aa32ef8370258e85`.
- Local object inspection shows that `da9e63c` is an ancestor and the second parent of `bac6dce`.
  Both commits have tree `08b57bd6093e309fef85b352cb191b95ca2fd96e`, and `git diff
  --quiet da9e63c bac6dce` exits 0. The merge introduced no content change.
- The local `main` branch still points to older `ec6bb6f`; it is not used as evidence. The
  already-present `origin/main` and the GitHub repository API both identify `bac6dce` as current
  `main`. No fetch was needed or performed.

## Hosted CI evidence

Two relevant hosted runs passed:

| Revision | Event | Evidence |
| --- | --- | --- |
| `da9e63c` | PR #23 | [Run 34838626023](https://github.com/internalforces/open-store-searcher/actions/runs/34838626023), `verify` succeeded |
| `bac6dce` | `main` push after merge | [Run 34971716730](https://github.com/internalforces/open-store-searcher/actions/runs/34971716730), `verify` succeeded |

The current `main` run used `.github/workflows/verify.yml` on `ubuntu-24.04`, Node 24.19.0,
npm 11.17.0, a clean `npm ci`, and installed the locked Playwright browsers before running
`npm run verify:full`. The run completed from `2026-09-15T12:55:00Z` through
`2026-09-15T12:58:18Z` and recorded:

- lint, format check, TypeScript, and Vite build: passed;
- Vitest coverage: 44 files and 755 tests passed;
- aggregate coverage: 92.63% statements, 90.99% branches, 95.06% functions, and 94.36% lines;
- synthetic search-quality recall: 0.933333; source-sample recall: 0.98;
- Playwright smoke/search matrix: 68 passed across Chromium, Firefox, WebKit, and Pixel 5
  mobile-Chromium emulation;
- accessibility matrix: 20 passed across desktop and mobile Chromium, including the tests that
  assert zero automatically detected WCAG 2.1 A/AA violations in the exercised fixture states.

Both the PR run and merged-main run retained zero Actions artifacts. The checks prove that the
normal test/build/quality/browser/accessibility suite passed on GitHub-hosted Ubuntu for the
exact merged tree. They also exercise compact codec, Worker protocol, loader failure, candidate
preservation, and UI recovery behavior through the repository's automated fixtures and module
tests.

They do not prove the following:

- `verify:full` does not invoke `scripts/stage-refresh.mjs`, collect the complete official
  archive, emit a production compact snapshot, or run `scripts/build-publication.mjs` against
  one. The 2,939,947-record full-source round-trip and desktop observations remain local evidence
  in [the compact-delivery report](test-2026-09-14-compact-delivery.md), not hosted evidence.
- The Playwright mobile project uses Pixel 5 emulation against the normal fixture/demo build. It
  does not download or prepare the approximately 198.4 MB compressed / 688.4 MB uncompressed
  complete compact data, and it does not establish physical-device readiness, memory, network,
  search-to-page latency, or Pages CDN behavior.
- Automated recovery checks use controlled module and browser fixtures. They do not demonstrate
  preservation of a previously deployed Pages release after a real refresh, failed publication,
  uncertain deployment outcome, CDN transition, or rollback.

## Current refresh and hosting state

The latest default-branch schedule was
[run 35036118418](https://github.com/internalforces/open-store-searcher/actions/runs/35036118418)
at merge commit `bac6dce`. Its Ubuntu `prepare` job failed as designed at `Require reviewed
quality configuration` because tracked `publication/config.json` does not exist. Runtime setup,
`npm ci`, Playwright installation, `verify:full`, complete collection/staging, publication build,
source-revision check, and Pages artifact upload were all skipped. The dependent `deploy` job was
also skipped. The run retained zero artifacts. Earlier scheduled runs show the same blocked
state; none supplies a hosted full-source or recovery result.

Read-only repository inspection on 2026-09-16 found:

| Control or surface | Current state |
| --- | --- |
| Pages API | HTTP 404; no retrievable Pages site configuration |
| Expected public URL | `https://internalforces.github.io/open-store-searcher/` returns HTTP 404 |
| Environments | Zero; no `github-pages` environment or required reviewer |
| Actions variables | Zero; `PAGES_PUBLICATION_ENABLED` is unset |
| `main` protection | No classic branch protection |
| Repository rulesets | Zero |
| Actions | Enabled; all actions allowed; repository-wide SHA enforcement disabled |
| Default workflow token | Read-only; Actions cannot approve pull-request reviews |
| Workflows | `Verify`, `Validated Pages refresh`, and `Observe Seoul quality` are active |

The workflow file itself denies permissions by default, grants the preparation job only
`contents: read`, and grants Pages/OIDC permissions only to the dependent deploy job. Those YAML
boundaries remain useful, but they do not create the absent environment review, branch protection,
Pages source, publication variable, or deployed baseline.

## Feasible next verification and approval gates

1. **Review and accept the production quality inputs.** Resolve the 05/06 status-pair review,
   calibrated validation policy, initial collection-date baseline, resource bounds, and remaining
   source/design-baseline direction. Only then can a real `publication/config.json` be proposed.
   The configuration must not reuse synthetic defaults or auto-approve its own candidate.
2. **Obtain human approval for any security or infrastructure change.** Creating a protected
   `github-pages` environment, selecting its named required reviewer, preventing self-review,
   restricting deployment to `main`, adding branch/ruleset requirements, changing workflow
   behavior, or configuring Pages are security/infrastructure actions covered by the project
   approval gate. The current inspection does not grant that approval.
3. **Run a hosted prepare-only bootstrap after configuration review.** With
   `PAGES_PUBLICATION_ENABLED` still unset, an explicitly authorized manual run with the reviewed
   initial baseline and `bootstrap: true` can exercise the GitHub-hosted complete collection,
   validation, compact encoding, complete-site build, obsolete-ref guard, and artifact upload
   without deploying. Inspect the produced hashes, row counts, validation report, total site size,
   runtime, peak resource behavior available from the runner, and retained artifact. The current
   workflow has not yet supplied any of this evidence.
4. **Add or approve a full-source browser observation path.** Even a successful prepare-only run
   would execute `verify:full` before collection and would not open the newly built complete site.
   Closing hosted mobile readiness requires an approved workflow/test change that serves
   `$RUNNER_TEMP/site` and measures the complete snapshot under declared mobile conditions, or a
   post-deployment Pages check. A physical-device result remains separate from emulation. Workflow
   and deployment changes require the applicable human approvals.
5. **Obtain explicit deployment approval.** Project policy requires human approval for every
   deployment. Keep `PAGES_PUBLICATION_ENABLED` unset until the reviewed quality configuration,
   full-source hosted evidence, independent review, environment protection, and release criteria
   are accepted. Then configure Pages and perform the approved initial publication.
6. **Exercise hosted recovery against an actual known-good release.** After a successful approved
   bootstrap, record the public `release.json`, manifest, baseline, and content hashes. Execute an
   approved controlled refresh rejection and confirm the public release and hashes remain
   unchanged, then verify a subsequent valid refresh and the documented rollback/reconciliation
   procedure. Current one-day Pages artifact retention and absence of release history must be
   addressed in that runbook. A deliberate failure or rollback affecting the public site needs a
   concrete reviewed plan and deployment approval.
7. **Retain the time-dependent release gate.** Thirty-day scheduled reliability cannot be inferred
   from PR CI, one prepare-only run, or one deployment/recovery exercise.

No TASK-008, TASK-009, TASK-010, milestone, production-readiness, or release gate is closed by
this report. The bounded implementation and exact merged CI result are sound evidence to carry
forward; hosted full-source, mobile, publication, recovery, protection, policy/baseline, and
release approvals remain explicit.
