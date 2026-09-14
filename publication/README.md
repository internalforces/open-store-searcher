# Collection-date publication

The user authorized collection-date operation on 2026-09-12 while retaining the real-data
criteria hold. The UI says "데이터 수집일" and explicitly states that source coverage is
unverified. The date is the completed archive collection instant converted to Asia/Seoul.
Source ZIP dates, row dates and build time never become a claimed source coverage date.

The user resumed quality review on 2026-09-12. `config.json` remains absent until complete
CP949-capable source observation and baseline/policy review pass; see the
[decoder prerequisite](../reports/research-2026-09-12-quality-resumption.md). Do not copy the
synthetic test policy/baseline into it, waive unknown-status review, or auto-bootstrap from
the same unreviewed candidate. Missing configuration fails the refresh before any publication.

The reviewed configuration contains `policy` (`ValidationPolicyV1`), `previousReleaseUrl`
(the deployed HTTPS `/release.json` URL), and explicit positive integer
`maxEntryBytes`, `maxTotalRows`, `entryTimeoutMs` resource limits. It contains no credentials.
New accepted staging uses release descriptor version2 with exactly one
`assets/compact-manifest-<sha256>.json` and one `baseline.json` entry. The manifest declares
schema 2/identifier 1/normalization 1, archive and policy bindings, total count, ordered-ID digest,
collection-date metadata, one shared-dictionary asset and contiguous paired search/evidence
blocks. Every entry binds its role, row start/count, byte length and content-addressed SHA-256.
Blocks contain at most8192 rows and8MiB; a dictionary cap selects a lossless local fallback.
Exact raw values, null/empty distinctions, full IDs and original row order survive encoding.

The builder verifies all staged and copied bytes, dictionary references, statuses, complete row
ranges and global identities. It binds the descriptor's exact collection timestamp (Seoul date),
manifest coverage and baseline date/count/contract versions/archive/policy before promotion.
Research manifests may use policyRevision:null, but the publication binding rejects them.
The manifest's public URL remains digest-addressed in both staging and deployment. The reader
fetches release→manifest→baseline→release, checking hashes and bindings and rejecting concurrent
replacement. Legacy version1 deployed descriptors remain readable for migration/recovery; new
version2 output never includes the legacy dataset asset. Missing, oversized, malformed
or mismatched deployed state fails without bootstrapping. For the initial run only, an explicitly
reviewed `baseline` (`ValidationBaselineV1`, `dateBasis: collection`) may be supplied in config
and selected with `--bootstrap` or the manual workflow's bootstrap input. Bootstrap probes
`previousReleaseUrl` before collection and requires an explicit HTTP 404; an existing release,
redirect, server/authentication error, or failed request aborts without using the configured
initial baseline. Later refreshes must omit bootstrap and use the deployed baseline. Scheduled runs never
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
directory contains the compact assets, next baseline and release descriptor. Existing
directories are never overwritten. The build consumes the descriptor-bound bytes and emits
digest-addressed data assets and a Worker loader with relative URLs. Baseline and release metadata accompany the
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

## Bounded staging and research replay

Staging processes source rows in batches and stores identity, collision and sort intermediates
in its owned temporary directory. All categories and global quality gates must finish before
publication output appears. Disk buckets have explicit ceilings and fail closed on skew/overflow.
The builder streams the hashed single dataset asset; this does not prove whole-file browser
loading is practical. Parser observation and browser measurements cannot authorize a baseline.

`measure-bounded-source.mjs` is a local research adapter requiring the exact successful Ubuntu
observation hash; Python ZIP extraction there is diagnostic only. Production continues using
the approved Ubuntu Info-ZIP collector. `measure-source-browser.mjs` exercises the current
publication loader and the hook's second preparation pass on a local real-data research file.
The browser laboratory verifies the dataset byte length and SHA-256 against observation.json
before starting its server/browser, and includes that digest in its report. Keep research inputs
unchanged throughout measurement. Neither command deploys or creates a publication policy.
Keep raw/intermediate files outside Git.


## Pages size gate — PR #21

The builder enforces a conservative 1,000,000,000-byte total site budget against GitHub's
[1 GB published-site limit](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits).
It checks the descriptor total before reading assets, then includes all Vite output, the dataset,
baseline and release metadata before copying and promotion. Only a complete checked temporary
site becomes the requested new output; failures remove its temporary candidate. This is a hosting
constraint independent of reviewed data-quality budgets.

The measured 2,439,358,850-byte snapshot is rejected. This guard does **not** make the real
snapshot deployable or repair whole-file browser loading. A reviewed compact/static delivery
design, measured complete-site size and browser evidence remain required before publication.
Dataset-level attribution uses the whole licensing portal; records retain category-specific sources.


## Compact browser behavior and remaining gates

A dedicated Worker fetches the full manifest-defined snapshot independently of search terms and
clicks. It validates everything before readiness, owns search projections and complete ranked
ordinal arrays, and materializes Top-3 plus the requested 20-record page only. Dictionary-level
candidate flags reuse the existing bidirectional name, literal/numeric and address-relevance
predicates. The entire ordinal space is visited; no candidate or result cap is introduced.
The UI keeps the accepted Worker while a replacement loads; failure retains its data/search.
No persistent browser database, backend, telemetry or query-dependent network request is added.

Full-source desktop measurements and exact-round-trip evidence are in
[compact verification](../reports/test-2026-09-14-compact-delivery.md). The functional research
site fits the existing 1 GB limit, but the original production policy and baseline remain unapproved.
Full-source initial readiness, memory requirements and physical/mobile performance are separate
from the small shell-paint budget. Do not enable publication from these local measurements.
