# Collection-date publication

The user authorized collection-date operation on 2026-09-12 while retaining the real-data
criteria hold. The UI says "데이터 수집일" and explicitly states that source coverage is
unverified. The date is the completed archive collection instant converted to Asia/Seoul.
Source ZIP dates, row dates and build time never become a claimed source coverage date.

`config.json` is intentionally absent until quality review is authorized. Do not copy the
synthetic test policy/baseline into it, waive unknown-status review, or auto-bootstrap from
the same unreviewed candidate. Missing configuration fails the refresh before any publication.

The reviewed configuration contains `policy` (`ValidationPolicyV1`), `previousReleaseUrl`
(the deployed HTTPS `/release.json` URL), and explicit positive integer
`maxEntryBytes`, `maxTotalRows`, `entryTimeoutMs` resource limits. It contains no credentials.
Normal runs read the matching baseline from the deployed release, check its byte hash and metadata,
and reread the release descriptor to detect a concurrent replacement. Missing, oversized, malformed
or mismatched deployed state fails without bootstrapping. For the initial run only, an explicitly
reviewed `baseline` (`ValidationBaselineV1`, `dateBasis: collection`) may be supplied in config
and selected with `--bootstrap` or the manual workflow's bootstrap input. Scheduled runs never
auto-bootstrap. Failed deployments cannot advance the authoritative baseline because it is
served inside the same Pages release. Hosted reconciliation/recovery verification remains open.

Commands, using new directories outside the repository:

```text
node scripts/stage-refresh.mjs publication/config.json NEW-CANDIDATE-DIRECTORY
node scripts/build-publication.mjs NEW-CANDIDATE-DIRECTORY NEW-SITE-DIRECTORY
```

The collector checks source/archive contracts. Every category is strictly decoded and parsed;
the complete archive is hashed before and after ingestion. The staged validator keeps all
quality gates and uses an explicitly matching collection-date baseline. An accepted staging
directory contains the exact hashed dataset, next baseline and release descriptor. Existing
directories are never overwritten. The build consumes the descriptor-bound bytes and emits
a Vite-managed data asset with a relative URL. Baseline and release metadata accompany the
site for recovery; no source archive, full input rows or credentials enter the public artifact.

The daily attempt is 06:17 Asia/Seoul and may be delayed by GitHub. CI is read-only and cannot
publish. The refresh workflow uses only the default branch and one same-run artifact; Pages
write/OIDC privileges exist only in the deploy job. `PAGES_PUBLICATION_ENABLED` must remain
unset until independent review, production data/performance checks, baseline reconciliation,
protected `github-pages` environment approval and the existing release gates are satisfied.
Neither this flag nor YAML alone proves that repository/environment controls are configured.

Hosted PR CI passed the complete approved Ubuntu verification suite; see
[run evidence](../reports/test-2026-09-12-publication-hosted.md). No hosted refresh, Pages setting
change, deployment, public recovery exercise or thirty-day reliability verification has occurred.
The [settings assessment](../reports/security-2026-09-12-publication-settings.md) records missing
environment/branch protection and a transitive mutable action reference for review.
TASK-009/010 remain incomplete for those gates. Source coverage
research remains deferred; collection-date support does not claim its completion.
