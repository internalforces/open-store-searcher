# TASK-009 operational configuration and recoverable publication

Date: 2026-10-19  
Status: Design and execution plan approved on 2026-10-19; local Tasks1–4 implemented and independently Approved; Task5 final verification/review handoff; remote actions/deployments remain gated  
Requirements: FR-13, supporting FR-02/08/12/14; AC-009-4/5  
Owner: Architect / Release Manager

## Intent and existing authority

The user requested continuation through the remaining operational settings and actual
publication/recovery verification, with separate approvals identified. The earlier approved
[acceptance plan](../plans/2026-10-19-task-009-publication-acceptance.md) and its 849/68/20
verification remain valid for the unchanged product code and local transaction tests.
TASK-009 remains the single active task; TASK-010 and recurring operation remain paused.

The user explicitly approved this design with the recommended GitHub Release backup choice on
2026-10-19. Approval covers the destination/resources, default-off schedule gate and trusted
restoration design. The earlier proposal JSON/report retain their dated pending-state metadata;
their exact configuration values are the approved inputs. The local production config now exists;
remote configuration/enablement remains gated. The detailed plan is approved and Tasks1–4 are
implemented with independent Approved reviews. Task5 records final proof/verification and the
whole-diff review handoff, preserving the selected execution/review method.

This design addresses the missing production destination/resource choices and recovery
interface. Its approval does not waive a quality/performance/release gate, authorize
push/merge, or authorize any remote change. Existing policy, initial baseline, reviewed status
pairs, source delivery and display-date rules remain binding. No handbook was consulted.

## Verified starting point

- Current remote main is `9569ffbce4ce141e06f0883d90bc19305890972c`.
- Read-only October 19 inspection finds no Pages site, publication-enable variable, Actions
  artifact or release. The proposed public release URL returns a direct HTTP 404. These are
  observations, not approval of the URL or bootstrap.
- Main still requires strict Actions verification and administrator enforcement. The protected
  `github-pages` environment allows only main, requires the existing human reviewer and prohibits
  administrator bypass. The previously accepted solo-review policy is retained.
- The current refresh workflow always recollects source and uploads one same-run Pages artifact
  with one-day retention. Both packaging and deployment reject obsolete main SHAs.
- A deploy-job-only rerun can conditionally republish an available same-run artifact while its
  SHA remains current main. It cannot recover after expiry or after main advances. A full rerun
  recollects source and is not exact snapshot recovery.
- A failed or timed-out deployment does not establish which bytes are publicly served. Public
  state and the deployment record must be reconciled before another operation.

The [operations evidence](../../../reports/operations-2026-10-19-task-009.md) records fresh
collection/validation and complete retained-candidate packaging separately from hosted acceptance.
The fresh October 19 source completed 195 categories / 2,952,086 rows but failed the exact
approved count/count-change/status-share gates. No candidate output or new baseline was accepted.
The current live-only bootstrap cannot publish that source. This design does not adopt different
quality limits or authorize an initial import of October 16 bytes; either route needs its own
evidence and explicit approval before a first-publication candidate can be selected.

## Proposed operational configuration

Use the existing repository Pages URL:
`https://internalforces.github.io/open-store-searcher/`, with
`previousReleaseUrl=https://internalforces.github.io/open-store-searcher/release.json`.
Configure Pages with `build_type=workflow`; add no custom domain or external service.

The non-executable [configuration proposal](../../../reports/proposed-2026-10-19-task-009-operational-config.json)
copies the complete approved policy, baseline and reviewed-pair objects from
`publication/validation-config.json` unchanged. Proposed production resources equal the measured
local limits: `maxEntryBytes=536870912`, `maxTotalRows=3000000`, `entryTimeoutMs=120000`.
They are resource ceilings, not new quality tolerances. Create `publication/config.json` only
after this destination/resource decision is approved and reviewed.

Adding that file to main currently makes scheduled preparation collect data even while the
deployment flag is unset. Therefore add a separate `PAGES_SCHEDULE_ENABLED` variable gate,
defaulting to false, to the schedule path before configuration activation. Manual preparation
remains possible on main. Keep the existing deployment flag and protected environment.
Enabling daily collection/publication is a separate future operation, not part of a one-time
acceptance exercise. The new gate is a proposed workflow change requiring approval and review.

## Recovery source decision

Approved choice: keep complete, hash-bound site backups as GitHub Release assets, created by an
operator only after explicit archive/tag/publication approval. Also retain a verified local copy.
This uses the existing GitHub service and requires no new package, runtime server or payment
method. It creates public assets and tags, so it is a distinct publication decision.

The unselected alternative is operator-held backups only, with a manual authenticated import interface.
That avoids hosted archival assets but makes recovery depend on that operator's storage and
availability. Increasing Actions retention alone is insufficient for durable recovery.

For each approved snapshot, retain the complete Pages tar compressed with gzip, an inventory
of every regular file (relative path, byte length, SHA-256), and a provenance receipt binding:

- repository, trusted source/workflow commit and build run/artifact identifiers;
- tar and compressed-file digests/lengths, complete inventory digest and total site bytes;
- release/manifest/baseline digests, source archive digest, original collection timestamp,
  policy and schema/identifier/normalization versions;
- the separately recorded successful public verification and deployment identifiers, when any.

A local validated candidate has no successful-deployment provenance. Never label it a hosted
last-known-good snapshot. A first-publication import, if needed, is separately approved as an
initial candidate, not disguised as recovery. Do not automatically add it to a recovery allowlist.

The fresh retained-candidate proof contains 730 files / 691,233,947 bytes. Its tar is
691,804,160 bytes and gzip is 207,515,860 bytes. Its original collection is October 16;
rebuilding the app does not make that data newly collected. These local bytes are available for
review but are not implicitly selected for publication.

## Proposed trusted restoration path

Add a manual, current-main restoration workflow and a read-only verification adapter. Select
only a same-repository approved release tag plus immutable asset IDs and expected hashes from
an approved provenance receipt. Do not accept arbitrary URLs, PR artifacts, shell expressions
or untrusted workflow code. Release assets can be replaced; tag/name alone is not identity.

Preparation uses `contents: read` only. Retrieve exact metadata and bytes, enforce compressed,
expanded and per-file bounds, and validate paths before materialization. Reject traversal,
absolute paths, duplicate paths, symlinks, hardlinks, devices and extra/missing files. Never run
historical scripts or app code during verification. Validate the inventory and complete current
V2 release/manifest/baseline/data bindings using trusted current code. Preserve all application
shell/Worker files as part of the snapshot. Re-upload one verified `github-pages` artifact into
the current restoration run; the existing deploy action selects that same-run artifact.

Use the existing publication concurrency group, protected environment, deploy-only Pages/OIDC
permissions and post-approval current-main SHA check. Keep historical content provenance separate
from the current operator-code SHA. Do not reset main, remove its stale-SHA guard or broaden
permissions to make an old run publish. Operator archival upload avoids adding `contents: write`
to the normal refresh or restoration workflow. Exact archive/tag creation remains a separate
authorized operator operation.

Default recovery restores the exact last publicly verified snapshot. Restoring an older
collection than the current public baseline requires a separate reviewed rollback decision and
action-time approval. Ordinary refresh still rejects collection-date regression. Recovery never
rewrites collection time, status mapping, source uncertainty or quality limits.

The builder may settle internal module names, inventory encoding and bounded implementation
details using existing tooling. It must present any required dependency, permission expansion or
public interface change for approval before implementing it. New workflow/security code needs
independent review. The architecture design is accepted; implementation and actual operations
remain subject to the plan and action-time gates below.

## Publication and recovery verification sequence

1. Approve this design and destination/resource/backup choices. Then prepare the detailed
   implementation plan for approval, using the user's selected subagent implementation and
   independent-review method. Retain all existing changes and local evidence.
2. Implement and independently verify the configuration, schedule hold, bounded restoration and
   public reconciliation. Use meaningful failure tests with existing tooling. Verify rejection
   of wrong/expired provenance, corrupt/partial archives, path escapes, stale operator code,
   incompatible bindings and failed extraction/promotion without altering the complete prior site.
3. Resolve any current-source quality rejection through a separate evidence/approval decision.
   Do not relax the approved policy, adopt a new baseline, substitute retained data or change
   the source path merely to obtain a publication candidate. Retained-candidate bootstrap would
   need an explicitly designed trusted import and its own source/candidate approval.
4. Complete required full-data pre-publication performance and release prerequisites. Obtain
   authorization for branch delivery/PR/merge separately; exact protected-main CI must pass.
   No v1.0 or milestone completion is implied by this acceptance exercise.
5. Before remote setup, present the exact repository, public URL, Pages workflow mode and
   variable changes for approval. Re-read repository/environment protection state afterward.
6. After separate authorization to enable and dispatch one preparation run, confirm that the
   unapproved protected environment blocks deployment and scheduling is disabled. Set the
   publication flag before dispatch so the deploy job can wait for environment approval.
   A false flag skips that job; changing it later does not itself queue the prepared candidate.
   Never auto-approve the environment as part of preparation. For initial bootstrap, use only
   the approved initial baseline and require a fresh direct release-URL 404. Preserve the run,
   exact candidate and whole-site inventory before asking for its deployment. If preparation
   fails, reset the one-time flag without attempting publication.
7. Obtain action-time approval for the exact candidate, code/config SHA and destination, then
   approve that specific pending protected-environment job. Reset the one-time publication
   flag after the approved run; do not authorize another pending deployment implicitly.
8. Reconcile the host by reading descriptor, manifest, baseline and every declared asset and
   the complete expected site inventory, then re-read descriptor to detect replacement. Verify
   subpath/Worker loading, search, attribution, collection-date/uncertainty and age warning.
   Record errors/timeouts as uncertain until public bytes and deployment state agree. Do not
   advance an independent baseline file or assume a failed status preserved the former release.
9. After successful public verification, obtain approval to archive the exact complete snapshot
   and record the actual release tag/asset IDs/hashes. Re-read downloaded archival bytes and
   prove equality before relying on the backup.
10. Obtain a separate action-time recovery-deployment approval, restore those exact approved
    bytes via current main and verify complete public equality. A restoration from durable
    storage must not depend on the original one-day Actions artifact. Do not deliberately
    corrupt the public site or publish an invalid candidate to inject a failure.
11. Test preparation rejection in an approved non-deploying hosted run while the accepted site
    stays unchanged. Use offline/simulated uncertainty tests plus actual public reconciliation;
    a destructive host failure or intentional timeout needs a separately reviewed scenario.
    Record which hosted scenarios remain unperformed. Reset one-time publication enablement;
    keep scheduling disabled until explicitly authorized.

## Approval ledger

| Decision / action | Concrete scope | Present state |
| --- | --- | --- |
| Design | Destination/resources, separate schedule hold, GitHub Release backup and trusted restore/reconciliation above | Design and execution plan approved by the user on 2026-10-19; Tasks1–4 independently Approved; final local verification/review handoff |
| Quality | Exact existing quality objects remain approved; changing tolerance/baseline or choosing a different source snapshot requires its own evidence | No new quality approval requested implicitly |
| Code delivery | Exact reviewed commit, PR destination and protected-main integration | Not authorized by this proposal |
| Remote setup | Repository Pages `build_type=workflow`, URL and named variables; no protection changes | Pending; none applied |
| Archive publication | Exact approved complete bytes, public asset names, tag and provenance | Pending; no tag/release created |
| First deployment | Exact main/config/run/candidate hashes and URL, fresh bootstrap probe and prerequisites | Pending; no dispatch or deployment |
| Recovery deployment | Exact approved backup/asset identities, current operator SHA, URL and current public state | Pending; no recovery deployment |
| Recurring operation | Daily 06:17 Seoul attempts and ongoing collection/publication/resource consequences | Remains paused |

## Official references and limits

References checked 2026-10-19. GitHub documents the
[Pages 1 GB site limit and ten-minute deployment timeout](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits),
[workflow-mode Pages API](https://docs.github.com/en/rest/pages/pages),
[same-SHA/ref job reruns](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/re-run-workflows-and-jobs),
[finite Actions retention](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository),
and [release assets below 2 GiB each](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases).
The measured gzip fits that per-asset bound; no upload or service availability was tested.
[Standard public-repository Actions runners are free](https://docs.github.com/en/billing/concepts/product-billing/github-actions),
but the account plan/storage allowance was unavailable in readback. Do not infer artifact
billing from uncompressed tar size or enable a paid runner/storage purchase.
