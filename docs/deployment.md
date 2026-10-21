# Deployment and recovery

## Initial-import operational gates — 2026-10-21

The user approved the exact retained October 16 source, complete initial-import design and local
implementation/verification. The importer and manual workflow are now implemented locally;
[the operator contract](../publication/README.md#initial-import-local-implementation--2026-10-21)
provides both exact CLI forms, private output schemas and run/clock bindings. Earlier dated
statements that bootstrap is unimplemented or source selection is unresolved are historical.
The [current local proof](../reports/test-2026-10-21-task-009-initial-import.md) is local readiness
only. TASK-009/II-10/AC-009-4/5 remain open; TASK-010 and routine operation stay paused.

These are separate future approval gates, not instructions to execute from local acceptance:

1. Authorize exact code delivery and protected-main integration; require actual current-main CI.
2. Confirm attribution/redistribution and account/resource evidence, then separately approve the
   exact source transport tag target and both public asset names, lengths, hashes and upload.
   The tag is `initial-source-seoul-2026-10-16`; assets are `seoul-source-2026-10-16.zip` and
   `source-observation.json`. Local synthetic metadata/IDs are never uploaded authority.
3. Redownload the approved actual asset IDs, re-read tag/metadata, then separately review/deliver
   the exact real source-registry entry to protected main. It remains null/empty until then.
4. Satisfy full-data performance, physical/mobile and release prerequisites; re-read protections
   and actual public state. Obtain exact Pages setup, one-time flag and dispatch authorization.
   Keep `PAGES_SCHEDULE_ENABLED` false/unset. Set publication enablement only for the approved run.
5. Before approving the protected environment, review actual same-run candidate/metadata IDs,
   exact main/config/operator/identity/tar/inventory hashes, collection date, warnings and URL.
   Recheck current main and descriptor absence; reset one-time publication enablement after the
   run or failure. Prepared evidence expires exactly 24 hours after preparation.
6. Verify every public file and successful deployment history separately. Then separately approve
   complete backup publication, redownload equality, registry adoption and durable recovery
   deployment/public verification. Only the exact two approved originating workflow paths are
   admitted; the source ZIP and local proof never provide recovery authority.
7. Keep routine operation paused pending its separate live-policy/operational decision.

Initial-import retries require a new authorized manual run. Both jobs reject any run attempt
other than the first before doing work; do not use GitHub's job-rerun controls or remove earlier
artifacts to reuse a run. Keep the fixed artifact names and review the new run's own IDs and
24-hour window. After the protected environment approval and public-404 probe, the final guard
reads current main again and rechecks expiry against the actual clock immediately before
`deploy-pages`. This preserves the approved manual/current-main/same-run contract without
additional permissions, source selection or quality changes.

The source remains collected `2026-10-16T01:52:52.043Z` with null/unverified source coverage.
It is five Seoul calendar days old on October 21 and warns from October 23 midnight Seoul.
Rebuild, import, upload and deployment clocks never refresh it. Configuration/quality/source
identity, protected deployment permissions and zero-cost constraints remain unchanged. No
upload, tag, settings change, dispatch, environment approval, deployment, recovery adoption,
commit/push/PR/merge or recurrence occurred during this local work.

## Current local state — 2026-10-19

The approved local operational configuration, default-off schedule hold, trusted durable restore
and public-byte verification are implemented. [`publication/config.json`](../publication/config.json)
equals the approved proposal and preserves all three approved quality objects. The registry is
empty; no hosted successful backup exists. Local proof and verification are in the
[October 19 report](../reports/test-2026-10-19-task-009-operational-recovery.md).
TASK-009 remains active; TASK-010, recurring operation and release remain paused.

Dated October 19 readbacks find remote main `9569ffbce4ce141e06f0883d90bc19305890972c`,
no Pages site, either enable variable, Release or Actions artifact, and a direct descriptor404.
Transport/tool failures before the direct probe are uncertain observations, never evidence of absence.
No remote setup, dispatch, approval, deployment or archive publication was performed. Readbacks
are dated evidence and must be repeated at operation time; configuration in a local branch
cannot enable remote workflows. No handbook or production data was changed.

## Preconditions and separate approvals

The October 19 source transfer accepted195 categories /2,952,086 rows but unchanged strict
count/count-change/status-share gates rejected it. No publishable candidate exists. Resolve the
source/quality decision with evidence and explicit approval; do not relax limits or silently
select retained October16 data. Retained-input bootstrap is not implemented and requires its own
trusted import design and candidate approval. Collection time remains explicitly labeled;
source coverage stays null/unverified, and age>=7 Seoul calendar days triggers the warning.

Before first preparation/deployment obtain accepted full-data performance, physical/mobile-device
and hosted evidence and the applicable release prerequisites (TASK-018/021). Local shell/browser
fixtures cannot satisfy those gates or30-day reliability. Complete exact protected-main CI after
separately authorized commit/push/PR/merge. Keep code delivery, remote Pages/variable setup,
source/quality selection, preparation dispatch, each candidate deployment, public tag/Release/assets,
recovery deployment and recurring operation as separate approval scopes. Placeholder IDs/URLs
in examples cannot approve a run or candidate.

Re-read actual strict main verification/admin enforcement and `github-pages` reviewer,
main-only policy/no bypass before any authorized operation. The accepted solo-review policy
remains manual human approval, not independent human separation. Do not weaken protections.
Approved target is `https://internalforces.github.io/open-store-searcher/`, descriptor
`https://internalforces.github.io/open-store-searcher/release.json`, Pages `build_type=workflow`;
no custom domain, service, paid dependency or new writer token is required.

## Local commands and immutable evidence

Use current trusted pinned Node24.19.0/npm11.17.0 and new private directories:

```text
node scripts/stage-refresh.mjs publication/config.json NEW-CANDIDATE-DIR --bootstrap
node scripts/build-publication.mjs NEW-CANDIDATE-DIR NEW-SITE-DIR
node scripts/inspect-publication.mjs NEW-SITE-DIR NEW-METADATA-DIR
node scripts/prepare-publication-backup.mjs publication/config.json ORIGINAL-ARTIFACT-TAR INVENTORY-JSON PROVENANCE-DRAFT-JSON NEW-BACKUP-DIR
node scripts/restore-publication.mjs publication/config.json publication/recovery-approvals.json ACTIVE-BACKUP-ID NEW-RECOVERY-DIR
node scripts/check-publication-state.mjs https://internalforces.github.io/open-store-searcher/release.json EXPECTED-STATUS EXPECTED-SHA
```

Bootstrap requires the explicitly approved initial baseline and a fresh direct404; existing,
redirected, unauthorized, uncertain or failed reads abort. Later refreshes omit `--bootstrap` and
read the deployed baseline. Scheduled runs never bootstrap. Capture archive/policy/date/count,
complete inventory, original tar, config/code fingerprints and verification evidence. Keep source
rows/private backups outside Git. Exact schemas, output files and the archival registry promotion
sequence are in the [operator contract](../publication/README.md#exact-local-operator-contract).
A backup proposal explicitly says `approvalStatus:'proposed'` and `historyVerified:false`;
it is an operator attestation, never successful GitHub history or approved authority.

## One-time protected publication sequence

1. Obtain explicit remote setup approval for the exact repository/URL/Pages mode/variable changes,
   apply only that scope, and re-read protections. Keep `PAGES_SCHEDULE_ENABLED=false` or unset.
2. After source/performance/release prerequisites, obtain a separate one-time preparation dispatch
   authorization. Set `PAGES_PUBLICATION_ENABLED=true` **before dispatch** so the dependent deploy
   job can wait for protected-environment approval. With a false flag the job is skipped;
   changing it afterward does not queue the prepared candidate. Never approve the environment
   during preparation. Select bootstrap only within the approved first-run scope.
3. Preserve the prepared run, exact main/config SHA, artifact ID, full candidate inventory/hashes,
   date/count/size/performance and destination. Verify the job is blocked pending environment
   approval. Failed preparation requires disabling the one-run flag, no publication attempt.
4. Present that concrete candidate and fresh main/public/protection readbacks for action-time
   deployment approval. Only after approval approve the exact pending job. Both preparation
   and postapproval deployment reject stale main; after main advances use a new trusted run.
5. Reset one-time publication enablement after the approved run, including failure. Keep scheduling
   off; a different pending job has no implicit authorization. No automated environment approval.
6. Independently reconcile the deployment outcome and public state: read descriptor, manifest,
   baseline and **every expected site file** and exact length/SHA, then read descriptor again.
   Verify subpath/Worker loading, search, attribution, collection date/uncertainty and age warning.
   A guard or HTTP200 alone is insufficient. Record failure/timeouts/mismatches as uncertain;
   do not infer that a failed deployment preserved the previous bytes or advance a separate baseline.
7. Following success obtain separate exact tag/Release/asset publication approval; prepare,
   upload, redownload and verify the complete backup, then approve its exact registry entry through
   protected main. Keep a verified local copy. **Register the successful complete backup before
   another publication.** Public equality and successful GitHub deployment history remain separate.

## Failure and durable recovery

Preserve failed run/logs, current public readback, original inputs and last verified authority;
keep publication disabled and diagnose source/policy/code/hosting/configuration without weakening
gates. Do not intentionally corrupt public data or publish invalid candidates for failure injection.
Uncertain deployment outcomes require complete public reconciliation before any next operation.

For recovery, select only the active current-main registry approval, never arbitrary URLs/old runs.
Empty registry refuses recovery. The actual preparation receipt explicitly records same-snapshot,
absent404/null or corrupt200/actual-descriptor-hash. Transport uncertainty or coherent newer state
rejects; no older-snapshot override is implemented. Missing/corrupt status is preparation evidence,
not permission. Fresh action-time approval must bind backup/release/asset IDs and hashes, current
operator/config SHA, run, URL and public precondition. Set the one-run publication flag before
separately authorized restoration dispatch, leave the environment blocked, and review the exact
prepared receipt before approving that deployment. Postapproval main and descriptor guard run again.

The current trusted workflow downloads/verifies the complete durable snapshot, preserves the
original raw tar, and uploads one same-run artifact in a **new run**. It never executes archive
code or rebuilds an old application. Original Actions artifacts expire after one day and old-SHA
reruns cannot bypass stale checks. Recovery therefore depends on already reviewed durable assets
and authority, not retention of the old run. Verify complete public equality plus the separate
successful deployment record afterward; reset flags and keep schedule off. Re-register the last
successful complete verified publication before permitting another publication.

Hosted successful/failed/uncertain promotion, environment enforcement, durable upload/redownload,
original-artifact-expired recovery, actual whole-site public equality and30-day reliability remain
unperformed. Offline tests and retained local proof do not close AC-009-4/5, TASK-010 or release.
