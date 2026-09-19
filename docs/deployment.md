# Deployment and recovery

This runbook describes the reviewed GitHub Pages path. It does not authorize a deployment. Every
deployment still requires human approval under the project constitution.

## Current state

The production path is intentionally disabled. `publication/config.json` and the repository
variable `PAGES_PUBLICATION_ENABLED` are absent. The `github-pages` environment is protected and
limited to `main`, but no production candidate has been accepted or deployed.

The 30-Seoul-calendar-day calibration begun on 2026-09-17, its derived quality policy,
allowed-empty category list, initial baseline, accepted full-source candidate, hosted/mobile
performance, recovery exercise, and release verification remain open gates.

## Architecture

The `Validated Pages refresh` workflow runs daily at 06:17 Asia/Seoul and can also be dispatched
manually. Its preparation job has read-only repository permission. It installs pinned tooling,
runs the full verification suite, collects and validates the complete source archive, builds a
content-addressed site, rejects an obsolete source revision, and uploads a one-day same-run
artifact. Only the dependent deployment job receives Pages and OIDC write permission.

Deployment runs only when `PAGES_PUBLICATION_ENABLED` equals `true`. The protected environment adds
a human review step, and the deploy job rechecks the current `main` revision after that approval.

## Prerequisites for the first publication

Do not create production configuration from test fixtures or provisional measurements. Before a
first run, all of these must exist:

1. Completed calibration evidence and explicitly approved numeric quality policy.
2. An explicitly approved allowed-empty category list and initial collection-date baseline.
3. Reviewed positive resource limits and the exact approved reviewed-unverified-pair contract.
4. A `publication/config.json` that binds those decisions and the deployed HTTPS `release.json`
   URL, with no credentials.
5. Passing pull-request and `main` verification for the exact workflow and code revision.
6. An accepted complete staging/build candidate with hashes, record count, site size, and
   performance evidence.
7. An approved recovery procedure and a concrete action-time deployment approval.

The environment and branch protections must be read back before use; YAML alone does not prove
repository settings.

## Local candidate preparation

Use fresh output directories outside the repository. Neither command overwrites an existing
output directory.

```sh
node scripts/stage-refresh.mjs publication/config.json /absolute/new/candidate --bootstrap
node scripts/build-publication.mjs /absolute/new/candidate /absolute/new/site
```

Use `--bootstrap` only for the first explicitly reviewed baseline and only when the configured
deployed release URL returns a direct HTTP 404. A redirect, existing release, authentication error,
or network failure aborts. Later runs omit `--bootstrap` and must read the deployed baseline.

Before proposing publication, record the archive and policy bindings, collection date, complete
row count, excluded/unknown metrics, descriptor and asset hashes, total site bytes, commit SHA, and
verification results. Keep raw archives and intermediate files outside Git.

## Approved publication sequence

1. Review and merge the exact configuration and code through the protected `main` branch.
2. Confirm Pages uses GitHub Actions and re-read branch and `github-pages` environment settings.
3. Obtain approval for the concrete candidate and first-run bootstrap, if applicable.
4. Set `PAGES_PUBLICATION_ENABLED=true` only within that approved operation.
5. Dispatch `Validated Pages refresh`; select `bootstrap=true` only for the approved first run.
6. Review the exact pending environment deployment, then approve it.
7. Verify the public `release.json`, manifest, baseline, asset hashes, collection-date display,
   search behavior, and source/disclaimer links against the recorded candidate.
8. Record the run URL, deployment URL, deployed commit, release hashes, checks, and any incident.

Scheduled runs must never bootstrap. If preparation fails, no deploy job should publish a new
artifact.

## Failure and recovery

When collection, validation, build, revision, approval, or deployment checks fail:

1. Leave the last known-good Pages release in place and do not weaken a gate to make the run pass.
2. Set or keep `PAGES_PUBLICATION_ENABLED` disabled while the cause is investigated.
3. Preserve the failed run, candidate metadata, logs, and the currently deployed release bindings.
4. Classify whether the failure is source, policy, code, GitHub configuration, or hosting related.
5. Fix and verify through a new pull request. Re-stage from reviewed inputs; do not edit a staged
   artifact in place.
6. Obtain fresh approval for any recovery deployment and verify the resulting public bindings.

A hosted rollback/recovery exercise has not yet been accepted. Do not claim that historical
artifacts can be redeployed indefinitely: the workflow retains its Pages artifact for one day.
Until the recovery gate passes, preserve the public last-known-good site and escalate through the
release process rather than replacing it with an unvalidated build.

The detailed staging format and migration notes remain in the internal
[publication operator contract](../publication/README.md).
