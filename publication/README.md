# Collection-date publication and durable recovery

## Initial-import local implementation — 2026-10-21

The approved initial-import path is implemented locally. The exact October 16 source is selected
only for first-publication/recovery verification; it does not change daily quality policy.
`initial-import-approvals.json` remains `{activeSourceId:null,sources:[]}` and recovery remains
`{activeBackupId:null,backups:[]}`. Empty source authority rejects hosted import before network
or source work. Earlier dated statements that the importer is unimplemented describe historical
states; this section supersedes them. TASK-009 remains active and TASK-010 remains paused.

Use the current pinned Node 24.19.0/npm 11.17.0 and a new private output outside Git:

```text
node scripts/verify-initial-import.mjs publication/config.json SELECTED-ZIP ORIGINAL-OBSERVATION NEW-PRIVATE-OUTPUT
node scripts/stage-initial-import.mjs publication/config.json publication/initial-import-approvals.json seoul-2026-10-16-initial NEW-PRIVATE-OUTPUT
```

The first command is local proof only. It accepts the exact 217,307,219-byte ZIP
`c90758c2d3922e78d636ab2c9967b80c690bdcd8aeca283cf9f6ecc2cc992352` and original
356,005-byte observation `3d23a3c770b24039a6690f2db8022eb610ffb5b56a9efee031f78b78918b4626`.
It records actual host base commit, dirty status and complete current code bindings, with
`runId:null`, `transport:{kind:'local-proof'}` and `precondition:null`. It cannot bind a hosted run.
The hosted command additionally requires clean current-main GitHub identity, a real run ID,
active reviewed source authority and stable approved Release metadata/tag/asset bytes. It
requires a direct descriptor 404 before work and immediately before final promotion.

Both commands use the full production parser, validator, compact builder and tar inspector.
All 195 categories/2,951,024 rows and complete baseline metrics must match; the approved policy,
baseline, reviewed pairs and resource limits are unchanged. The historical collection remains
`2026-10-16T01:52:52.043Z`, with `sourceDataAsOf:null`. Validation, verification, preparation and
transport clocks are distinct and never refresh that date. Age reaches seven Seoul calendar
days at `2026-10-22T15:00:00.000Z` (October 23 midnight); the delay warning starts then.

The exact private output is `artifact.tar`, `source-import.json`, `inventory.json`, `identity.json`
and `preparation.json`. Raw ZIP/observation, stage rows and private receipts never enter the tar.
The source receipt is `RetainedSourceImportReceiptV1`, binding original source/observation,
collection/null coverage, schema/quality hashes, actual validation/verification clocks, operator,
transport and warnings. Preparation is `InitialPreparationV1`, binding mode/source/operator,
source-receipt bytes, built identity, canonical inventory, original tar and `preparedAt` plus
exactly 24 hours `expiresAt`; hosted precondition is `{status:404,releaseSha256:null}`.
Stdout is `{outputDirectory,preparation}`, not deployment-success evidence.

The manual `.github/workflows/initial-import.yml` prepares on current main with read-only
permissions, uploads exactly one same-run `github-pages` candidate, then binds the actual
upload-step artifact ID and current run/SHA to `InitialImportRunV1`. Its fields are version,
kind, workflowPath, sourceId, operatorSha, runId, candidateArtifactId, artifactName,
preparationSha256, tarSha256, inventorySha256, preparedAt and expiresAt. A separate one-day
`initial-import-metadata` artifact exposes candidate evidence for human review. The protected
deploy job rechecks current main, the trusted prepare-job scalar binding and exact 404/absent
public state after approval. Local, expired, mismatched or uncertain evidence rejects.
`bind-initial-import-run.mjs PREPARED-DIR CANDIDATE-ARTIFACT-ID NEW-METADATA-DIR` and
`check-initial-import-run.mjs BOUND-RUN-JSON` require actual hosted context, not fixture IDs.

The initial-import workflow accepts only the first attempt of a manual run. Both preparation
and protected deployment reject any other `GITHUB_RUN_ATTEMPT` before checkout or artifact work.
Retry requires a new authorized `workflow_dispatch` on current main, with a new run ID and fresh
candidate review; do not rerun jobs or delete/overwrite artifacts to reuse an earlier run. Fixed
`github-pages` and `initial-import-metadata` names and the existing permissions are retained.
After the public descriptor probe, the final deployment guard reads current main again and then
checks the trusted binding against the actual clock. The next step is `deploy-pages`, so expiry
during either network probe cannot bypass the final validity check. Earlier guards remain for
fast rejection. No guard change enables publication or changes quality criteria.

Recovery accepts successful provenance from exactly `.github/workflows/refresh.yml` or
`.github/workflows/initial-import.yml`. All previous successful-history/public-byte/inventory,
registry and date/hash guards remain; source assets or local proof are never recovery authority.
No source Release/asset IDs exist operationally yet. Both enable flags remain default-off,
scheduling stays paused and publication uses shared noncancelling `pages-publication` concurrency.
See [current evidence](../reports/test-2026-10-21-task-009-initial-import.md) and the
[remaining operational gates](../docs/deployment.md#initial-import-operational-gates--2026-10-21).

## Current operational state — 2026-10-19

The approved local implementation includes [`config.json`](config.json), the separate
`PAGES_SCHEDULE_ENABLED` gate, current-main restore workflow and bounded trusted operators.
The entire production configuration equals the approved proposal's `configuration`; `policy`,
`baseline` and `reviewedUnverifiedPairs` equal `validation-config.json` unchanged. Resources are
536870912 bytes per source entry, 3000000 total rows and 120000 ms per entry. Local existence
of configuration does not enable GitHub. Dated readbacks find no Pages site, either enable
variable, release or Actions artifact; protections remain a separately rechecked prerequisite.

TASK-009 stays active and TASK-010 paused. The October 19 source failed unchanged quality gates
for 195 categories / 2,952,086 rows. The October 16 retained package is only local proof; its
collection date and null source coverage remain unchanged. No retained-input import is implemented
or approved. [`recovery-approvals.json`](recovery-approvals.json) has `activeBackupId:null` and
`backups:[]`; production recovery refuses every ID until actual successful history and exact
archival assets have been reviewed into current main. See the
[verification report](../reports/test-2026-10-19-task-009-operational-recovery.md).

## Exact local operator contract

Run from current trusted code with pinned Node/npm and existing locked dependencies. Use new
private output directories outside source control. These commands never authorize remote writes.
Never import, execute, install or rebuild an archived application's code.

```text
node scripts/inspect-publication.mjs SITE-DIR NEW-METADATA-DIR
node scripts/prepare-publication-backup.mjs publication/config.json ARTIFACT-TAR INVENTORY-JSON PROVENANCE-DRAFT-JSON NEW-BACKUP-DIR
node scripts/restore-publication.mjs publication/config.json publication/recovery-approvals.json ACTIVE-BACKUP-ID NEW-RECOVERY-DIR
node scripts/check-publication-state.mjs https://internalforces.github.io/open-store-searcher/release.json EXPECTED-STATUS EXPECTED-SHA
```

Inspection emits exactly canonical `inventory.json` and `identity.json` (UTF-8
`JSON.stringify(value)+'\n'`). Inventory v1 has `kind:'publication-inventory'`, an ordinally
sorted full `files` list of `{name,byteLength,sha256}`, and `totalBytes`. Identity binds
`releaseSha256`, `manifestSha256`, `baselineSha256`, `archiveSha256`, `collectedAt`, `recordCount`,
`policyRevision`, `schemaVersion:2`, `identifierVersion:1`, `normalizationVersion:1`.
The inspector verifies current V2 semantics and every regular file without loading site code.

The backup draft must have exactly these fields, populated from real independently checked
successful GitHub run/artifact/deployment records, never invented example IDs:

```text
{version:1,kind:'publication-backup-draft',repository:'internalforces/open-store-searcher',
 siteUrl:'https://internalforces.github.io/open-store-searcher/',sourceCommit,workflowCommit,
 workflowPath:'.github/workflows/refresh.yml',runId,artifactId,deploymentId,deploymentOutcome:'success'}
```

Commits are lowercase 40-hex, run/artifact IDs positive safe integers and deployment ID nonempty.
The preparer validates/compresses the original tar, restores and semantically verifies all bytes,
and compares every public file with descriptor reads before/after. Output contains exactly
`snapshot.tar.gz`, `inventory.json`, `provenance.json`, `verification.json`. The latter and stdout
say `kind:'publication-backup-proposed'`, `approvalStatus:'proposed'`, `historyVerified:false`,
with `operatorAttestation` and `publicVerification`. It does not verify GitHub history or promote
a registry entry. Its public receipt is `{version:1,kind:'public-bytes-verified',siteUrl,checkedAt,
inventorySha256,releaseSha256}`. A public receipt and a separate successful deployment outcome
are both required; matching hashes alone never prove history.

Provenance v1 (`kind:'verified-publication-backup'`) binds repository/site, source/workflow commits,
workflow path, run/artifact/deployment IDs, successful outcome, `verifiedAt`, full `identity`,
`inventory`, `tar`, `gzip` byte bindings, and `publicVerification:{receipt,binding}`. Bindings are
`{byteLength,sha256}`; the receipt timestamp equals `verifiedAt`. JSON hashes bind exact canonical
bytes, including the newline. Compression can change gzip bytes: retain original raw tar and
record the actual compressed length/hash, never substitute an older gzip binding.

The restorer accepts only the active approved entry in current main, downloads exact immutable
Release asset IDs, validates same-repository metadata and tag/commit targets, compares all archive,
JSON and restored semantic identity/inventory bindings, and records the current public precondition.
Its output is exactly original `artifact.tar` and `preparation.json`. Receipt/stdout is
`{version:1,kind:'publication-recovery-prepared',backupId,siteUrl,identity,inventory,tar,
precondition:{kind:'same-snapshot'|'absent'|'corrupt',status:200|404,releaseSha256:string|null}}`.
Absent is explicit 404/null; corrupt is 200 with the actual descriptor hash. Neither receipt
asserts preservation or deployment success. Uncertain transport/HTTP status and a coherent newer
snapshot reject; a changed public snapshot requires a new explicit decision. Ordinary collection
regression remains rejected; no historical rollback override exists.

The postapproval guard accepts only the exact descriptor URL, status `200` plus lowercase 64-hex
SHA, or `404` plus literal `absent`. It rejects redirects, changed state, unexpected absence,
oversize and timeout. Its fixed success receipt is only
`{version:1,kind:'publication-state-unchanged',status,releaseSha256}`. All operators reject malformed
arguments, unsafe/bounded data and existing output; failures clean only their own private scratch.
The hard bounds remain 10000 files, 1000000000 site bytes, 536870912 bytes/file,
1020000000 bytes each tar/gzip, 4 MiB inventory, 64 KiB provenance and 1 MiB registry/API JSON.

## Durable authority and promotion sequence

After a separately approved successful deployment and complete public reconciliation:

1. Preserve the exact original tar, metadata, full inventory, successful run/deployment records
   and local complete backup. Prepare the proposed backup with the command above.
2. Obtain separate approval for exact tag/release/public asset publication and provenance.
   Only then upload the three files `snapshot.tar.gz`, `inventory.json`, `provenance.json`.
3. Download each actual asset by its numeric ID and revalidate full bytes and original tar/site
   equality with trusted current code. Record the real release ID, tag, asset IDs, lengths and
   SHA-256 values; names/tags alone can be replaced and are insufficient.
4. Review GitHub successful deployment history separately from public bytes/proposed metadata.
   Through separately authorized protected-main delivery adopt an entry
   `{id,repository,siteUrl,releaseId,tag,assets:{snapshot,inventory,provenance},expectedProvenance}`.
   Each asset is `{id,name,byteLength,sha256}` with the exact three fixed names. Registry envelope
   stays `{version:1,kind:'publication-recovery-approvals',repository,siteUrl,activeBackupId,backups}`.
   Set `activeBackupId` only to that reviewed successful entry. A proposed output cannot supply
   authority by itself; an empty registry must continue refusing recovery.
5. Register each successful publication's complete verified backup **before another publication**.
   Preserve its local copy and exact remote readback evidence. Never overwrite recovery authority
   with a failed or uncertain publication.

A durable recovery uses a new current-main run and the active registry ID after separate preparation
and action-time deployment approvals. It restores the unchanged raw tar and uploads one same-run
`github-pages` artifact. The original run's one-day artifact may expire; neither that artifact nor
an obsolete run can serve as indefinite recovery. Main advancement requires a new trusted run;
never bypass stale-SHA checks or execute historical scripts. Full public equality and a separate
successful deployment outcome must be established again after restoration. See the complete
[deployment approval sequence](../docs/deployment.md).

## Historical records

The dated sections below preserve earlier states; the current section above supersedes prior
claims that production configuration is absent. They do not imply remote enablement.


## PR 32 review corrections — 2026-10-18

Local replay now enforces the exact three positive integer ceilings from `validation-config.json`
directly. Historical observation resource limits are provenance, not runtime fallback values.
The preservation audit requires the same explicitly selected archive and verifies its receipt/
baseline hash and size before injection and unchanged bytes afterward:

```text
node .testagent/replay-adopted-policy.mjs SOURCE-ARCHIVE NEW-REPLAY-ROOT
node .testagent/audit-adopted-release.mjs REPLAY-ROOT SOURCE-ARCHIVE
```

Both commands are private, non-publishing operations. The audit records structured actual
validator severity and compares the staging rejection's codes before issuing a receipt; only
rejections enter `reasonCodes`, with `source_coverage_unverified` kept as a warning. The
[fresh review verification](../reports/test-2026-10-18-pr32-remediation.md) and
[corrected preservation receipt](../reports/preservation-2026-10-18-pr32-remediation.json)
supersede the prior audit's warning-as-reason classification. The old receipt remains historical.
The exact policy, baseline, 23-ID list and resource numbers are unchanged. PR31 has merged; PR32
review delivery does not enable publication or close ISS-003, source-freshness or release gates.

## PR 31 non-publishing readiness — 2026-10-17

[PR31](https://github.com/internalforces/open-store-searcher/pull/31) delivers the adopted local
configuration and bounded ISS-003 client repair. Actual full-data production build and exact
workflow packaging/unpacking pass locally with all726 accepted-file hashes preserved; hosted
implementation CI passes813/68/20/4 checks. See the
[current readiness matrix](../reports/readiness-2026-10-17-pr31.md) and
[independent full-diff review](../reports/review-2026-10-17-pr31-readiness.md).
This does not enable publication: `config.json` remains absent, ISS-003 is still Open upstream,
and production configuration, hosted recovery/performance and release gates remain separate.
The draft PR and local artifact are not a deployment or authority to change publication controls.

## Local quality adoption — 2026-10-16

The user delegated the decision to dot, which adopted the exact October 16 proposal in
`validation-config.json`: complete policy, 23 allowed-empty IDs, initial collection-date baseline,
and the already approved reviewed-pair contract. See the
[decision](../memory/decisions.md#task-008-delegated-policy-decision--2026-10-16).
This file supplies the local replay adapter; the workflow still requires the separate absent
`publication/config.json`. No deployed URL, production resource settings or publication enablement
is supplied by this change. The original proposal remains an immutable historical artifact.
The dated sections below describe earlier production holds, not the status of these adopted local
quality inputs. All deployment, hosted recovery, performance and release gates remain separate.

The complete retained-archive replay accepted 195 categories and 2,951,024 rows under every exact
policy gate; all 726 files remain unchanged after failure injection and a fresh recovery rehash.
See [verification](../reports/test-2026-10-17-task-008-policy-adoption.md) and
[scoped final review](../reports/review-2026-10-17-task-008-policy-adoption.md). A future production
operation still needs separate reviewed URL/resource configuration and deployment authorization.

## Historical publication context

The user authorized collection-date operation on 2026-09-12 while retaining the real-data
criteria hold. The UI says "데이터 수집일" and explicitly states that source coverage is
unverified. The date is the completed archive collection instant converted to Asia/Seoul.
Source ZIP dates, row dates and build time never become a claimed source coverage date.

The user resumed quality review on 2026-09-12. Complete CP949-capable source observation and
compact conversion now pass. On 2026-10-18 the user approved the exact calibrated policy,
23 allowed-empty IDs and 2026-10-16 initial baseline as conservative initial criteria. They are
installed in [`validation-config.json`](validation-config.json), which is used only for the
non-publishing TASK-008 acceptance replay. The workflow's `config.json` remains absent pending
TASK-009/010 operational/publication review. The immutable proposal and exact approval are
recorded in the [approval packet](../reports/calibration-2026-10-16-approval-packet.md) and
[decision record](../memory/decisions.md#task-008-conservative-initial-quality-policy-approved--2026-10-18).
See the [compact evidence](../reports/test-2026-09-14-compact-delivery.md). Do not copy the
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
is not a live settings guarantee. TASK-019's Actions criterion is accepted. The calibration
interval is complete and the policy, empty-category list and initial baseline were explicitly
approved on 2026-10-18. TASK-008 final validation/review is complete with independent Approved acceptance; see
[verification](../reports/test-2026-10-18-task-008-final.md).
hosted/mobile performance, publication/recovery and release gates remain open. Follow the
[deployment and recovery runbook](../docs/deployment.md) for those prerequisites.
