<!--
Purpose:        Record actual source publication, full hosted source-byte proof and reviewed registry adoption
Owner:          Implementer / Tester / Release Manager
Update Trigger: When source authority, integration or later publication acceptance changes
Harness Version: 1.1
-->

# TASK-009 source adoption — 2026-10-23

The user authorized TASK-009/010 completion, prerequisite resolution and real-data connection,
then explicitly approved Chrome ChatGPT's local-file access. The exact extension setting was
changed off→on through native Chrome UI; no other permission was changed. The selected original
ZIP and observation rehashed to the fixed approved identities. No mutable source was substituted.

## Actual published source

[Release421355167](https://github.com/internalforces/open-store-searcher/releases/tag/initial-source-seoul-2026-10-16)
was published2026-10-23T01:26:39Z as historical source transport, with provider attribution and
unverified-coverage/original-date warnings. It is not a product release or recovery backup.
The public tag resolves directly to `cd16e7c4dd84d6c8520399f3a7ffb72cc88f167a`. A dedicated
source-target branch preserves that exact previously approved target; it was not silently retargeted
to newer main. Release/tag/asset metadata was re-read independently by the reviewer.

| Asset | Actual ID | Bytes | SHA-256 |
| --- | ---: | ---: | --- |
| `seoul-source-2026-10-16.zip` | 667614415 | 217,307,219 | `c90758c2d3922e78d636ab2c9967b80c690bdcd8aeca283cf9f6ecc2cc992352` |
| `source-observation.json` | 667616298 | 356,005 | `3d23a3c770b24039a6690f2db8022eb610ffb5b56a9efee031f78b78918b4626` |

The original collection is `2026-10-16T01:52:52.043Z`; source coverage remains null/unverified.
Counts remain195categories /2,951,024rows. Collection-date age7warning applies from October23
Seoul midnight. Upload, import and build clocks never refresh the data date.

## Complete downloaded-byte verification

The local browser download encountered `ERR_BLOCKED_BY_CLIENT` on GitHub's asset host and the
helper timed out. No complete local redownload is claimed; no client protection or sandbox
restriction was disabled or bypassed. Source verification instead ran independently in the existing
approved Ubuntu processing environment, using the existing production downloader. It is not a
proxy transferring blocked raw bytes into the local session.

[Source run39884746237](https://github.com/internalforces/open-store-searcher/actions/runs/39884746237)
completed/success on attempt1 at exact commit `1e92b7dc1e2a4423f61e30988af3550766a58677`.
Job120190175226 passed137offline admission/download tests, then downloaded **both complete
assets** through `downloadInitialSource`: streamed lengths/SHA-256 plus exact Release/tag and
before/after metadata checks. Success was logged2026-10-23T01:34:41.3294719Z. The independent
reviewer separately read the run, job and decoded logs and matched actual remote helper/workflow
contents to the reviewed files.

The receipt-only artifact12471503434 is1099ZIP bytes, wrapper SHA-256
`94e4c379e16e92277094337c298a78590a2688297f1403bb379909c6b37b4a85`,
expiring2026-10-24T01:34:41Z. The download connector returned a temporary file reference; no
extracted local receipt or invented payload digest is claimed. Raw source, signed download URLs
and credentials are excluded from the artifact. The remote job/step/code bindings establish the
executed verification scope; service upload digests alone were not used as full-download proof.

## Reviewed adoption and validation

`publication/initial-import-approvals.json` now selects only the actual verified source object.
No quality/configuration, source/status/date rule or downloader implementation changed. The
read-only verifier uses pinned actions/runtime and contents:read, exact branch/manual-main
admission, and no deployment environment, write/OIDC privilege, schedule or registry mutation.
[PR39](https://github.com/internalforces/open-store-searcher/pull/39) delivers this through normal
protected review/CI; canonical final-head verification remains an integration prerequisite.

- Source-adoption test first failed against inactive authority:80pass /1fail.
- With the exact real registry entry, four focused pipeline suites passed210/210.
- Exact actual Release/tag/asset IDs and complete content bindings are pinned by the production
  selection regression; inactive/empty/malformed rejection cases remain.
- Typecheck, lint and format pass on Node24.19.0/npm11.17.0; five existing lint infos remain.
- Embedded workflow JavaScript syntax, receipt-only artifact path and no-publication-privilege
  checks pass. No new dependency/service or paid resource was introduced.
- [Independent source-verifier and adoption reviews](review-2026-10-23-source-transport-verification.md)
  are Approved, each with zero findings. Scoped review does not replace final-head canonical CI.
- The earlier local macOS operator failures remain disclosed: BSD tar lacks the approved GNU
  option, and a subset also rejects the non-GNU host explicitly. No platform assertion was weakened.

Authenticated environment UI confirms existing required reviewer `internalforces`, accepted
self-review allowed, administrator bypass disabled, and main-only/zero-tag deployment policy.
Those rules were read without mutation. Fresh authenticated branch-rule83311729 UI also confirms
required PR, required GitHub Actions `verify`, strict up-to-date branches, conversation resolution,
administrator enforcement, force-push/deletion disabled. Required human PR approvals are disabled
under the existing solo-maintainer policy; independent agent review is separately recorded.
Detailed branch-protection API remains integration403. Pages UI confirms currently disabled,
with branch source None. No settings were saved.

## Task and safety boundaries

FR-13 / II-10 / hosted AC-009-4/5 advance only for source transport and actual authority adoption.
TASK-009 remains active for guarded candidate/publication/public-byte/recovery acceptance;
TASK-010 follows sequentially. TASK-028 is paused with its residual evidence retained.
No Pages/schedule variable, deployment setting, operational import/refresh/restore dispatch,
deployment, backup authority or routine collection was enabled in this checkpoint.

Full-data/mobile/performance, public search/subpath/date smoke checks, complete app/data/baseline
public equality, successful deployment history, durable backup/redownload/adoption/restoration,
original-artifact-expired recovery and independent final task acceptance remain. Actual30-day
refresh reliability cannot be fabricated or completed instantly. No TASK-009/010, full FR-13,
milestone/handbook or release gate is marked complete. No handbook or secrets were read.

## Canonical CI follow-up

Run39885314734 at `f2ec3ca7e28431df8f92ff6e5f8bc7cb9da3ab9d` passed the complete
`npm run verify:full` step, including92cross-browser E2E and20accessibility tests. The separate
operator step passed100/101: its old inactive-authority case implicitly depended on the live
production registry remaining inactive. With approved authority now active it reached synthetic
staging, rather than rejection. This is a test-fixture assumption, not a production safety failure.
The case was reproduced locally, then changed to feed an explicit null/empty registry fixture to
the unchanged real selector. It still asserts rejection before all network and input work.
The targeted case and Biome check pass; production guard code and all CI gates are unchanged.
Canonical complete verification is required again on the final head; this failed run is retained.

## Active-authority review correction

Automated PR review identified stale operator state, an unlinked evidence reference and future
verifier/proposal drift. Current task/session checkpoints and explicit operator/deployment updates
resolve the state discrepancy; the review links this delivered evidence. The verifier now consumes
`selectInitialSourceApproval` from the actual runtime registry and triggers on registry edits,
leaving the historical proposal immutable. A regression executes the actual embedded workflow
script with synthetic download only and real selection: it first reproduced false success for an
inactive registry, then passed with the current registry consumed exactly and inactive authority
rejected before download. All16workflow tests and scoped Biome pass. No permission, deployment
or product validation rule changed. Final-head source-byte verification and full canonical CI must
pass before protected integration.
