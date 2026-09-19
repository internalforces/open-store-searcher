# Collection-date publication

The user authorized collection-date operation on 2026-09-12 while retaining the real-data
criteria hold. The UI says "데이터 수집일" and explicitly states that source coverage is
unverified. The date is the completed archive collection instant converted to Asia/Seoul.
Source ZIP dates, row dates and build time never become a claimed source coverage date.

The user resumed quality review on 2026-09-12. Complete CP949-capable source observation and
compact conversion now pass; `config.json` remains absent pending reviewed quality policy and
bootstrap baseline. See the [compact evidence](../reports/test-2026-09-14-compact-delivery.md). Do not copy the
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
[run evidence](../reports/test-2026-09-12-publication-hosted.md). The
[2026-09-12 settings assessment](../reports/security-2026-09-12-publication-settings.md) is
historical: its missing protections and mutable action reference are superseded by the
[2026-09-18 final Actions review](../reports/security-2026-09-18-task-019-final.md) and the
security state below. No hosted refresh, deployment, public recovery exercise or thirty-day
reliability verification is established by those checks. TASK-009/010 remain incomplete for
production acceptance and hosted publication/recovery. Source coverage research remains
deferred; collection-date support does not claim its completion.

## Bounded staging and research replay

Staging processes source rows in batches and stores identity, collision and sort intermediates
in its owned temporary directory. All categories and global quality gates must finish before
publication output appears. Disk buckets have explicit ceilings and fail closed on skew/overflow.
The current builder verifies and copies manifest-bound compact assets. The earlier legacy
single-file browser observation remains historical evidence. Neither parser observation nor
browser measurements authorize a baseline.

`measure-bounded-source.mjs` is a local research adapter requiring the exact successful Ubuntu
observation hash; Python ZIP extraction there is diagnostic only. Production continues using
the approved Ubuntu Info-ZIP collector. `measure-source-browser.mjs` exercises the legacy single-file
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

The legacy 2,439,358,850-byte representation exceeds this gate. PR #23 implements the approved
compact format; the measured functional research site is 688,506,488 bytes. Final accepted-site
accounting, quality policy/baseline and mobile/hosted performance remain required before publication.
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


## Reviewed-unverified aggregate pairs

On 2026-09-17 the user approved exact category-bound acknowledgment of raw 05/06 pairs
while keeping all affected records displayed as "확인되지 않음". The optional
`reviewedUnverifiedPairs` config field must contain the complete approved artifact at
`src/pipeline/contracts/reviewed-unverified-pairs-v1.json`. Omitting it preserves the
previous pair-review gate; malformed, modified or incompatible contracts reject. This is
not a generic caller-defined allowlist. Copy the complete artifact only into a separately
reviewed operator configuration; do not fill numeric limits or bootstrap from test fixtures.

The exact code/name/category combinations are the maximum acknowledged scope. New spellings,
partial values and pairs outside that scope continue to require review. Counts and raw pairs
remain in metrics and undergo ordinary policy comparisons. This approval supplies neither
quality thresholds nor initial baseline/empty-category approval, and creates no production
config or deployment permission. See the
[approved contract](../docs/superpowers/specs/2026-09-17-task-008-reviewed-pairs.md).


## TASK-019 security state — verified 2026-09-18

This section supersedes the 2026-09-17 remediation status. The merged workflow uses audited
Linux tar packaging and a directly SHA-pinned upload-artifact action, retaining the github-pages
artifact contract. The [final Actions review](../reports/security-2026-09-18-task-019-final.md)
and its [settings receipt](../reports/security-2026-09-18-task-019-final-evidence.json) record:

- Main requires strict GitHub Actions `verify`, enforces administrators and conversation
  resolution, and prohibits force pushes and deletion. Required PR approvals are `0` and
  `require_last_push_approval=false` under the explicitly accepted solo-maintainer policy.
- The `github-pages` environment is configured with required reviewer `internalforces`,
  `prevent_self_review=false`, and `can_admins_bypass=false`. Its only custom deployment policy
  allows branch `main`; no tag rule exists.
- Self-review retains manual approval but does not provide independent human separation.
  The user explicitly accepted that operating risk; it is not approval for any deployment.
- `publication/config.json` and `PAGES_PUBLICATION_ENABLED` remain absent in the recorded
  evidence. Publication remains disabled and no deployment was dispatched or approved.

Re-read repository and environment settings before any approved operation; this dated receipt
is not a live settings guarantee. TASK-019's Actions criterion is accepted, while calibration,
quality policy, empty-category list, baseline, accepted candidate, hosted/mobile performance,
publication/recovery and release gates remain open. Follow the
[deployment and recovery runbook](../docs/deployment.md) for those prerequisites.
