<!--
Purpose:        Bind the next TASK-009 source transport preparation to exact evidence and remaining gates
Owner:          Researcher / Release Manager
Update Trigger: When the exact source assets, upload evidence, approval, or operational prerequisites change
Harness Version: 1.1
-->

# TASK-009 source transport preflight — 2026-10-22

## Result and scope

The concrete source transport request is prepared for review; upload is blocked on locating and
rehashing the approved original ZIP and on action-time source/resource approval. This completes
the immediate preparation identified in the October 22 assessment, not TASK-009 hosted acceptance.
The user's subsequent instruction authorizes performing the identified preparation, verification
and protected-main integration. It does not provide missing source bytes, actual asset IDs,
performance evidence or an exact protected-environment candidate approval. No operational action
is inferred from documentation merge. TASK-009 remains active; TASK-010 stays paused.

The machine-readable [request](source-transport-2026-10-22.json) is evidence only. It is not a
runtime registry, activation file, uploaded source receipt, product release or recovery authority.
No code consumes it. Use the already approved [initial-import design](../docs/superpowers/specs/2026-10-20-task-009-initial-import-design.md)
and [deployment sequence](../docs/deployment.md#initial-import-operational-gates--2026-10-21).

## Exact proposed public assets

Repository: `internalforces/open-store-searcher`. Source ID: `seoul-2026-10-16-initial`.
Source transport tag: `initial-source-seoul-2026-10-16`, targeting exactly
`cd16e7c4dd84d6c8520399f3a7ffb72cc88f167a`, the reviewed PR #34 merge. Later documentation
commits do not silently retarget this request. A tag's absence today is not an upload-time lease.

| Asset | Bytes | SHA-256 | Current verification |
| --- | ---: | --- | --- |
| `seoul-source-2026-10-16.zip` | 217,307,219 | `c90758c2d3922e78d636ab2c9967b80c690bdcd8aeca283cf9f6ecc2cc992352` | Historical accepted identity; original ZIP not located in this session. |
| `source-observation.json` | 356,005 | `3d23a3c770b24039a6690f2db8022eb610ffb5b56a9efee031f78b78918b4626` | Rehashed unchanged from the committed [observation](observation-2026-10-16-bounded-source.json). |

These two assets total 217,663,224 bytes and represent 195 categories / 2,951,024 rows. The original
collection instant stays `2026-10-16T01:52:52.043Z`; source coverage stays null/unverified. The
seven-Seoul-calendar-day warning starts October 23 at 00:00 Asia/Seoul. That is a warning boundary,
not a source import expiry. A prepared hosted candidate has its separate unchanged 24-hour expiry.

The current project and temporary directories were searched for the approved ZIP's exact length,
including files with other extensions. No matching local file was found. The Docker daemon is
unavailable; launching Docker failed because the application was not found. This does not prove
that the original archive or dated private proof has been lost elsewhere. Do not recollect the
mutable live URL and label those bytes as the selected October 16 source. No fresh raw replay,
archive rehash, full-site build or physical-device performance test is claimed here.

## Attribution and redistribution evidence

The [accepted full-category audit](review-2026-08-28-task-004-permission-gate.md) verified all 195
selected category pages on August 28. Its [manifest](source-permission-manifest-2026-08-28.json)
still contains 195 unique API IDs and 195 unique file-data IDs; the current observation's 195
file-data IDs match that exact set. Manifest SHA-256 is
`4b47b0296c34c0bd3b7c2ee88448ffe2cf5c40f90b99a8c8c8b46b3cf5c8f023`.

On October 22, fresh retrieval of the official portal policy and four file-data pages reconfirmed
free use and the exact unrestricted permission literal. This is a four-category spot check,
not a new 195-category audit. The official policy permits commercial/noncommercial use and
adaptation for Type 0 data; it also requires separate permission where third-party rights apply.
The historical category audit remains the bounded category evidence; no universal guarantee
about uninspected current rights, unrelated data or original source freshness is inferred.

| Official current spot check | File-data ID |
| --- | --- |
| [Hospital](https://www.data.go.kr/data/15045025/fileData.do) | `15045025` |
| [General restaurant](https://www.data.go.kr/data/15045016/fileData.do?recommendDataYn=Y) | `15045016` |
| [General-game provider](https://www.data.go.kr/data/15045071/fileData.do) | `15045071` |
| [Measuring-instrument manufacturer](https://www.data.go.kr/data/15045077/fileData.do) | `15045077` |

Retain provider and portal attribution regardless of the unrestricted label. The proposed Release
notes must identify the Ministry of the Interior and Safety / Public Data Portal local licensing
data, link to the [category manifest](source-permission-manifest-2026-08-28.json) and
[portal policy](https://www.data.go.kr/ugs/selectPortalPolicyView.do), identify the unchanged raw
archive and separately supplied observation, show the original collection date and unverified
coverage, and state that this is historical source transport for first-publication/recovery
verification. The project code's MIT license does not replace the data's source permissions.

## Resource and zero-cost assessment

Fresh repository metadata reports a public repository. GitHub's current
[Release documentation](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases)
allows up to 1,000 assets per release, requires each asset to be below 2 GiB, and states no total
release-size or bandwidth limit. Both proposed files fit those published limits; source assets
are separate from the site's static files and are not committed as large Git blobs.

Current [Actions billing documentation](https://docs.github.com/en/billing/concepts/product-billing/github-actions)
states public repositories using standard GitHub-hosted runners are free. The workflow uses
`ubuntu-24.04`, no larger runner, and one-day candidate/metadata artifact retention. No paid
service, payment method, custom runner or account billing setting is added or changed. Account
billing/capacity was not inspected; this is a documented public-service fit assessment, not an
account quota, policy exception or future upload success guarantee.

The historical complete site is 691,233,995 bytes, below the project's conservative
1,000,000,000-byte cap. GitHub's current
[Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
allow a published site up to 1 GB, impose a 10-minute deployment timeout and a 100 GB/month soft
bandwidth limit. A source transport Release does not remove those site limits or establish
usable full-data/mobile performance. Recheck current limits and account availability at the
operational action; do not infer production capacity from this arithmetic.

## Live integration and trust state

Fresh GitHub readback confirms [PR #34](https://github.com/internalforces/open-store-searcher/pull/34)
is merged as the exact tag target above. [Exact-main Verify](https://github.com/internalforces/open-store-searcher/actions/runs/39553203980)
is completed/success for that SHA. Its detailed test counts remain the dated integration evidence;
this preflight did not rerun them locally. The source tag returns 404 and the repository Release
list is empty at the current readback. These observations do not probe the public site descriptor.

The public branch API confirms protected main with required `verify`; the integration's detailed
protection API request returns 403. Do not claim a fresh detailed protection review or work around
that restriction. Normal PR merge protection still applies. Source and recovery registries remain
null/empty and unchanged. No source Release/asset/run/deployment IDs exist in this request.

Local documentary/invariant verification uses Node.js 22.22.3, not the pinned application runtime.
The observation file length/hash and canonical original collection length/hash match the accepted
bindings. Production and validation configurations retain equal policy, baseline and reviewed-pair
objects with the three approved canonical hashes; both configuration files and registries are
byte-unchanged. The request is not permission to populate a registry with synthetic IDs.

## Remaining acceptance sequence

1. Locate the exact original ZIP and verify both asset bytes against this request. Reconfirm
   source redistribution scope, actual resource/account availability and tag absence; obtain the
   concrete source transport action approval. Never overwrite a conflicting tag or asset.
2. After authorized upload, read back the real Release, tag and immutable asset IDs, redownload
   both assets, and verify exact lengths/hashes. Deliver the real source-registry entry through
   reviewed protected main. A successful source upload alone is not hosted publication evidence.
3. Satisfy full-data performance, physical/mobile and release prerequisites; freshly inspect full
   protections and the actual public descriptor. Obtain exact one-time Pages setup/flags/dispatch
   and protected candidate approval. Keep recurring operation disabled.
4. Verify all public bytes and successful deployment history, then separately publish, redownload,
   review and adopt the complete backup. Perform current-code durable hosted restoration and
   public equality verification without relying on the original one-day Actions artifact.

These remain II-10 / hosted AC-009-4/5 and the existing TASK-009/010/021 boundaries (FR-13,
supporting FR-02/08/09/12/14). No quality tolerance, baseline, status mapping, public URL,
permission, dependency, source contract or workflow is changed. No overall task, release,
milestone or handbook gate is closed by this preparation.
