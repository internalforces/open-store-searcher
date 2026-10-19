# TASK-009 operational preparation — 2026-10-19

Status: Non-publishing evidence and proposed decisions; TASK-009 remains active.

The user asked to continue remaining operational setup and actual publication/recovery
verification, with approval-required items made concrete. Existing changes are preserved in the
same `codex/task-009-publication-acceptance` checkout at merged-main base
`9569ffbce4ce141e06f0883d90bc19305890972c`. TASK-010 remains paused. No remote state was changed.

## Read-only remote findings

On October 19, GitHub API inspection found the repository public, main unchanged, `has_pages=false`,
the Pages API and `PAGES_PUBLICATION_ENABLED` variable absent (404), zero Actions artifacts and
no releases. Account plan/storage allowance was unavailable. The existing protections remain:
strict required Actions verification, administrator enforcement, conversation resolution, and
main-only `github-pages` environment with human reviewer and no administrator bypass. Previously
accepted solo-review settings were not changed.

At `2026-10-19T02:45:55Z`, the proposed
`https://internalforces.github.io/open-store-searcher/release.json` returned direct HTTP 404,
without redirect. This is neither public-URL selection approval nor a future bootstrap probe.
The deployment operation must recheck the exact approved URL and all protections at action time.

## New complete source collection

The existing pinned Ubuntu 24.04 / Node 24.19.0 / npm 11.17.0 private environment completed one
new live collection in 13,757 ms at `2026-10-19T02:46:06.133Z`. It returned `accepted`, `changed`,
with no reported transfer-length mismatch. Archive SHA-256:
`4a0122435f1a3c998c6293f25eeb4338dcef1c36901fee268014b8d50ea787ff`.

This establishes source transfer/integrity acceptance for this attempt only. It does not close
ISS-003 or establish quality acceptance, source coverage, reliability, or deployment readiness.
The subsequent strict complete-source validation used the unchanged approved quality objects
and positive resource ceilings. It completed all 195 categories / 2,952,086 rows in 402,875 ms
and **blocked publication**. The archive hash remained identical; no candidate output exists.
The stager error contains nine `count_above_maximum`, eighteen `count_change_exceeded` and
twenty-four `status_share_change_exceeded` diagnostics. The separate
`source_coverage_unverified` warning is not a rejection. These counts are derived from the
stager's mixed-severity error string; severity is checked against production validator code,
not presented as a new structured diagnostic audit. No policy or baseline was changed.

The total is within the global maximum of 2,952,182, but category/count-change/status gates are
also mandatory. Transfer success and total row count alone do not make it publishable. The
current live-only workflow would remain blocked; using retained October 16 data would require
a separate approved initial-candidate import contract. See the [aggregate receipt](operations-2026-10-19-task-009.json).

## Fresh retained-candidate proof

The approved October 16 retained input was rebuilt using current production code. All 726 source
files match their prior private inventory and the fresh built site. GNU tar packaging and unpacking
produce identical complete inventories; gzip decompression reproduces the exact tar bytes.
This is local recovery-package evidence, not a hosted backup or publication.

| Item | Fresh result |
| --- | --- |
| Source categories / records | 195 / 2,951,024 |
| Collection instant / source coverage | `2026-10-16T01:52:52.043Z` / null (unverified) |
| Complete built site | 730 files / 691,233,947 bytes |
| Inventory SHA-256 | `ce7a93a0916e8450f1e5b99b8945eb14a1b9d61eeb5a497a191a8ce823acbf55` |
| Tar bytes / SHA-256 | 691,804,160 / `a171ea86858cbed0455b999579bd6d22d5ac97986728dad2df4f7475136cde7e` |
| Gzip bytes / SHA-256 | 207,515,860 / `059da4d80123e5c2bb2bfcaf86f5dfc0b42304bb32e19b169d4e2a1ea984248f` |
| Release SHA-256 | `a85001ee0bca4be2fef7d667d3fe0e78e4ac2334a318353168a9f80655652190` |
| Baseline SHA-256 | `e44f4733f7d9551c92f5114a75b7d1377aa2800484c4128656d11e511b3aa399` |

The 24-byte difference from the historical PR31 site total is in rebuilt application output;
all 726 accepted data/descriptor/baseline files are byte-identical. A fresh build/package is its
own candidate identity, not the old tar identity. Data retains its original collection instant.
The full per-file inventory, raw archives, site and packaged bytes remain outside Git.

## Operational blockers and concrete next approval

The current workflow has no retained-candidate input or historical restore interface. Its
one-day same-run artifact and main-SHA guards support only bounded same-SHA deploy-job reruns,
not durable cross-revision restoration. Do not bypass the guard or relabel a full recollection
as rollback. Public descriptor/baseline alone cannot recover the app shell and all data.

Adding operational config also activates daily preparation in the current YAML even if its
deploy flag is unset. A separate schedule hold is therefore proposed before activating config.

The [operational/recovery design](../docs/superpowers/specs/2026-10-19-task-009-operational-recovery-design.md)
and [exact configuration proposal](proposed-2026-10-19-task-009-operational-config.json) give the
destination, resource values, unchanged quality objects, backup choices, verification sequence
and separate design/setup/archive/deployment/recovery/recurrence gates. No config entry point,
schedule flag, Pages site, release, tag, workflow dispatch or deployment was created.

The prior [849/68/20 verification](test-2026-10-19-task-009.md) remains dated evidence for unchanged
product/workflow/test code. This operational preparation adds documentation/proposals and private
diagnostics only. Local packaging does not close hosted AC-009-4/5 or performance/release gates.

## Evidence custody

Private diagnostics and receipts are retained in the October 19 operations directory outside
Git, alongside the original ten-file preservation snapshot. The running Docker environment
retains the complete source collection and generated packages. Aggregate proof is safe to record;
no source rows, secrets, tracking, paid service, dependency or global configuration was added.

The independent builder check identified the then-missing current-validation result (now
recorded above), and two owner decisions: the proposed destination/resources and the backup
storage choice. Other internal details are delegated in the design. These decisions remain
pending; the builder check is not implementation, security, deployment or design approval.
The older local-acceptance review applies only to its explicitly recorded scope.

The subsequent [independent operations review](review-2026-10-19-task-009-operations.md) found
one preparation/deployment sequencing issue, corrected in the design before handoff. It reports
no remaining actionable findings within preparation/proposal scope. It verifies receipt/digest
consistency and approval boundaries; it does not independently repeat the 691 MB build/rehash or
approve implementation, remote changes, design or deployment.

Final preparation checks: both JSON files pass pinned Biome checks, the complete approved config
objects remain deeply equal, all 155 existing product/test/tooling fingerprints still match
the prior full-suite evidence, and whitespace/local-link checks pass. Original root HEAD and
all 73 untracked-file hashes are unchanged; the six prior immutable local-acceptance files are
also unchanged. No full-suite rerun was needed for proposal/prose/private diagnostics alone.

A local copy of the complete gzip backup, full inventory and private receipts/helpers is retained
in ignored `.superpowers/sdd/2026-10-19-task-009-operations/`. Its host SHA-256 matches the
207,515,860-byte package above. This preserves the diagnostic package beyond the container;
it does not establish a public known-good snapshot or implement the proposed recovery interface.
