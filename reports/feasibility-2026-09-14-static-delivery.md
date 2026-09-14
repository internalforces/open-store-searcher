# TASK-008 static delivery feasibility prerequisite

Date: 2026-09-14. Current status: source access resolved; full-source size measurements complete; compact delivery design proposed and awaiting approval. Earlier blocker notes below are historical.
Requirements: FR-02/03/07/08/12/13/14; existing privacy, completeness and performance budgets.

## Checkout and preservation evidence

Reused `.worktrees/task013-quality` on `codex/pr21-release-descriptor-followup` at
`e8f8c92dd2e10299f2a5daf38f8ebcc7445bd2d6`. GitHub reports
[PR #22](https://github.com/internalforces/open-store-searcher/pull/22) merged at
2026-09-14T06:33:32Z as `81a14418ede4158ffc2306dc862a01ca761c3f85`.
After fetching main, `git merge-base --is-ancestor HEAD origin/main` succeeds and
`git diff HEAD origin/main` is empty. The checkout therefore contains the merged implementation;
no checkout, reset, stash or merge was necessary.

The pre-existing modified `memory/session.md` analysis entry and untracked
`reports/analysis-2026-09-14-static-delivery.md` are preserved. The original checkout's unrelated
untracked files are untouched. This preparation adds only this report and task/session records.

## Available evidence and missing input

The recorded complete snapshot is 2,939,947 records, 2,439,358,850 dataset bytes, SHA-256
`34ac368f16a578b3af96cd083d73efe698d7b3ec01f400b5162e37a42f6b85cc`.
The source ZIP is 216,440,796 bytes, SHA-256
`e2eeb1a868a2bfb94dbc9d193dae74707c0e27e38230376d5ad105e174a69faa`.
These are recorded values, **not newly verified local file hashes**. See
[the observation receipt](observation-2026-09-12-bounded-source.json) and
[bounded-source evidence](test-2026-09-12-bounded-source.md). Keep the later
2,940,404-row snapshot separate.

Filename searches, including ignored files, covered the repository/worktrees, Documents,
Downloads, `/private/tmp` and Codex work folders, excluding the Korean handbook. No matching
complete Seoul dataset or source archive was located. Unrelated projects' dataset files were
not used. The GitHub repository Actions artifacts API returns `total_count: 0`.
`observe-quality.yml` executes observation but has no artifact-upload step. Historical receipts
and logs cannot recover record-level evidence. The historical full-source local run was on Windows;
its filesystem is not accessible through the current Mac checkout.

Required input: an accessible existing `dataset.json` and its `observation.json`, or the exact
recorded source ZIP for the already documented bounded research replay. The user has been asked
for its location. No fresh collection, workflow modification or substitute snapshot was attempted.
Absence on this host does not establish that the original has been lost.

## Git follow-up requested by the user

Fetched all configured origin branches and inspected all reachable Git history. There is no
committed `dataset.json` or `observation.json`; the only committed ZIP paths are three small
collector test fixtures. The largest reachable blob is 835,016 bytes, the bounded
`tests/fixtures/search/seoul-source-quality.json` fixture. It is not the complete source and
cannot replace it for production feasibility. No `.gitattributes` or `.gitmodules` path appears
in the reachable object inventory. GitHub releases are empty as well as Actions artifacts.
The optional git-lfs executable is unavailable; no LFS retrieval was claimed or installed.

Thus the requested complete snapshot is not recoverable from the inspected Git branches/history
or GitHub releases/artifacts. An external retained copy is still required. A fresh provider
collection would be a distinct snapshot requiring new observation bindings, not verification of
the recorded snapshot; request direction before substituting it for this prerequisite.

## Authorized next measurement, before format selection

1. Stream hash and byte length of input; reject mismatch before profiling. Validate metadata,
   exact row count, full IDs, strict existing ID ordering and all nested evidence fields.
2. Stream records through a bounded research profiler. Attribute UTF-8 value bytes, field-key
   bytes and punctuation separately so totals reconcile to the original. Measure null/empty
   frequencies, repeated values, per-field distinct counts and dictionary reference overhead.
   Include raw statuses, processed statuses, ordered businessTypes, lifecycle timestamps and
   source URLs; preserve null versus empty strings and literal source spelling.
3. Serialize and independently decode three actual complete-source candidates: block tuples;
   shared low-cardinality dictionaries plus tuples; dictionaries plus column blocks. Compare
   every decoded field and ordered ID against the input. Include dictionary and block metadata
   in totals. Choose high-cardinality dictionary use only from actual measured net savings.
4. Measure search columns (full ID, name, both addresses), evidence columns, shared dictionaries,
   optional retrieval indexes and manifest separately, then sum each complete candidate site
   including shell assets, baseline and release metadata. No accepted production baseline exists;
   any research site must explicitly identify missing production bytes and cannot claim a complete
   publishable-site measurement. Do not use a fabricated baseline to pass the gate.
5. Compare optional exact-name/address postings and lossless substring structures with scan-only
   storage using the real corpus. Measure transport representations if evaluated, without assuming
   the host's Content-Encoding. Uncompressed deployed size and transferred size are different.

No field cardinalities, candidate sizes, compression ratios, readiness, preparation, memory,
search latency or pagination results were measured in this pass. Feasibility is unknown, not failed.
The known legacy dataset alone exceeds the existing 1,000,000,000-byte builder limit; that fact
comes from historical evidence, not a new complete-site build.

## Migration boundaries for the measured design

This is a design checklist, not an accepted contract or implementation specification.

- `stage-bounded-release.ts`: retain row iteration, bounded transformation, disk-backed global
  identity/collision checks, external ordered merge and validation. Replace only final delivery
  serialization after approval; do not retain both the legacy file and replacement in deployment.
- `stage-validated-release.ts`: keep `toDisplayRecord` as the evidence-equivalence oracle. Preserve
  all fields it emits, including processedStatus that is not declared on the base DisplayRecord
  interface. Preserve collection-date metadata and source-coverage uncertainty.
- Proposed manifest must bind format/codec/identifier/normalization versions, archive and policy,
  exact record count, collection timestamp, null sourceDataAsOf, dictionary and block roles,
  contiguous half-open row ranges, hashes, byte lengths and the matching baseline. Dataset identity
  must bind all ordered component hashes through a manifest hash, avoiding circular self-hashes.
  Reject gaps, overlaps, duplicate files/IDs, wrong references and unsupported/mixed versions.
- `build-publication.mjs` and `read-deployed-baseline.ts` both currently require exactly two entries.
  Migrate them together with the producer and browser using explicit version dispatch. Preserve
  legacy deployed-baseline reading for transition, baseline hash checks and the before/after
  descriptor comparison. New sites contain only the new data assets. Preserve complete-site
  counting, staged-byte rechecks, atomic promotion and existing-output protection. Any new asset
  URL contract requires approval; existing public identifiers and their lexical ordering stay exact.
- `publication-loader.ts` currently prepares an index that `use-display-data.ts` prepares again.
  A proposed Worker owns validation, compact storage and preparation once. UI state contains only
  dataset generation, search generation, counts, uncertainty, Top-3 and the requested 20-card page.
  Complete ranked references stay local to the Worker. Materialize evidence only for visible cards.
- Fetch all required blocks in deterministic, bounded, query/click-independent order. Publish
  readiness only after full validation. Retain the accepted Worker while a candidate Worker loads;
  atomically swap after acceptance. Cancel obsolete loads and queries using generations and
  cooperative yielding; discard stale replies. Refresh failure leaves the old Worker searchable.
  An accepted Worker's own crash loses its volatile store: retain the visible page, explicitly mark
  search unavailable, and retry the same accepted version; do not claim crash-surviving storage.
  Measure old/new Worker overlap and discard a failed candidate without terminating the old one.
- `search-candidates.ts`: reuse scoring, reasons, confidence, Top-3 tie logic and sorting. Retrieve
  a union of name containment in both directions, literal fallbacks and broad address relevance.
  Exact dictionaries alone are insufficient. Numeric tokens retain exact matching; address conflicts
  remain candidates. Retain a complete local scan wherever indexed completeness is unproven.

## Verification and decision gates

After source access and design approval, verify exact round-trip/count/ID parity, missing/corrupt/
mixed/incomplete blocks, bad references, global identities and prior-output preservation. Compare
complete results against the existing engine, including all scores, reasons, confidence, ordering,
ties and counts for district, substring, conflict, unknown-status and absent-result queries.
Measure real-source cold/warm readiness, transfer/site bytes, preparation, peak memory, refresh
overlap, search-to-visible-page and page transitions. Distinguish shell paint from readiness.
Retain the 2.5 s, 500 ms and 300 KB budgets without treating synthetic performance as production.

Default shell runtime is Node 22.22.3 / npm 10.9.8, not approved. An existing task-local runtime
is available under `/private/tmp/open-store-pr21-runtime.gmFKJN` (Node 24.19.0 confirmed); use its pinned binaries for
future checks. No application tests or browser benchmarks were run for this documentation-only
preparation. Historical Ubuntu 718/68/20 evidence remains historical, not a new verification run.

TASK-008 remains active and incomplete. TASK-009/010 and release gates remain open. Status pairs
05/06, quality policy, initial baseline and daily drift review are separate. No implementation,
dependency, contract, mapping, security setting, commit, push, merge or deployment changed.

## Source transfer follow-up

The user supplied a Gmail message with Drive links to the original dataset and observation.
Downloaded `/Users/sonmyeong-gwan/Downloads/observation.json`: 143,806 bytes, SHA-256
`aea7b04eaa936be4b8eb08144bb92ef7f3875a780a278f517903927ccdbea302`.
Its complete validation object and dataset hash/byte binding equal the checked-in observation.
This verifies the receipt, not the dataset bytes. No mailbox or sharing settings were changed.

The user explicitly approved proceeding past Drive's large-file virus-scan notice. Clicking its
download button produced Chrome `ERR_BLOCKED_BY_CLIENT`. No dataset or partial download was
found in Downloads at the check. Browser-tool policy separately rejected opening Chrome's
download-status page. No alternate download endpoint, browser-policy bypass or setting change
was attempted. A user-completed download of dataset.json is needed to resume the source hash
check and profiling. No candidate codec or performance measurements are claimed.

## Full-source feasibility completed after user download

The user completed the download. `/Users/sonmyeong-gwan/Downloads/dataset.json` has exactly
2,439,358,850 bytes and SHA-256
`34ac368f16a578b3af96cd083d73efe698d7b3ec01f400b5162e37a42f6b85cc`, matching the received and
recorded observations. Rechecked the source hash after profiling. No fresh source snapshot was used.

Used Node 24.19.0 on this 16 GiB Mac for full-source research serialization and index profiling.
No product code, dependency, delivery contract or status mapping changed. The research profiler
retains an 8,192-row block plus cardinality sets; it is not the bounded production producer.

| Actual representation | Search bytes | Evidence bytes | Total bytes | Actual gzip bytes |
|---|---:|---:|---:|---:|
| Flat tuples | 606,481,661 | 836,348,857 | 1,442,830,518 | 229,978,011 |
| Local dictionary tuples | 509,676,371 | 215,232,025 | 724,908,396 | 218,774,046 |
| Local dictionary columns | 503,814,379 | 209,489,305 | 713,303,684 | 202,945,621 |
| Shared/local dictionary columns | 503,814,379 | 182,877,543 | 686,691,922 | 198,292,818 |

Field keys/structure account for 1,070,140,887 original bytes. Top-level contributions including
keys are lifecycle 673,490,811; rawStatus 325,884,339; roadAddress 215,704,677; id 208,736,237;
parcelAddress 207,770,920; businessTypes 191,867,807; sourceUrl 182,276,714; categoryName
133,047,629; processedStatus 91,170,531; sourceLabel 91,138,357; name 80,051,338 bytes.
Record braces/commas and dataset framing are counted separately and reconcile exactly.

Distinct raw values: names 1,723,142; road addresses 1,178,822; parcel addresses 1,135,021;
category/source URL 172 each; businessTypes arrays 8,217; sourceLabel 1; processedStatus 4.
The four raw status columns have 6/6/56/61 distinct values. sourceLastModifiedAt has 2,313,024
distinct values versus sourceUpdatedAt 54,731. Complete field-level bytes/cardinality/null/empty
counts are in the profile JSON. The 172 row-bearing categories do not erase the 23 empty categories
from the original 195-category observation or production coverage validation.

All 2,939,947 original records reconstruct exactly from each of three serialized/read-back
candidates: 8,819,841 JSON-equality comparisons. Shared dictionaries additionally pass 49,979,099
evidence-value comparisons. Full IDs are unique and unchanged. Ordered IDs are hashed separately.
**Correction to the earlier preparation checklist:** preserve original row order; it is not lexical
public-ID order. The source contains 1,469,700 descending adjacent public-ID pairs. Ranking still
uses lexical public IDs. Do not sort the delivery rows merely to make IDs ascending.

The complete research site is 687,009,428 bytes / 727 files (686,691,922 data; 118,489 manifest;
143,806 observation; 55,211 current demo shell). Every listed data file's hash/length was rechecked.
No legacy dataset or gzip duplicate is included. It leaves 312,990,572 bytes under the existing
1,000,000,000-byte check. This is a concrete size-accounting package, **not** a production site: the
Worker-enabled application and accepted baseline remain unimplemented/unapproved. Their final
bytes must be measured and enforced; no production publication-size gate is closed.

Optional exact-name postings: 1,691,936 keys, 2,938,742 postings, 67,586,541 bytes. Optional
exact-address-key postings: 2,028,222 keys, 5,050,106 postings, 184,624,293 bytes. Combined they add
252,210,834 bytes; a site with them would total 939,220,262 measured accounting bytes. They do
not prove retrieval completeness. Recommend not shipping them initially; preserve a complete
local fallback for substring, reverse-containment, literal/numeric and broad/conflicting-address
paths. No n-gram/posting performance improvement is claimed.

Research serialization/round-trip: 136,487 ms, peak Node RSS 1,450,384 KiB. Exact-key profile:
39,711 ms, peak 1,520,464 KiB. Shared evidence comparison: 15,172 ms, peak 284,032 KiB. These are
Mac Node research operations, not production producer or browser preparation benchmarks. Gzip
was actually computed per block using Node zlib; Pages transport behavior remains unverified.
At the existing 200,000-byte/s mobile-lab throughput, 198,292,818 bytes require at least 991.46
seconds of transfer alone. This arithmetic bound is not measured browser readiness. Initial
shell paint must remain separate; site fit does not establish practical mobile startup.

Review [the proposed coordinated design](../docs/superpowers/specs/2026-09-14-task-008-compact-delivery-design.md)
before production implementation. It includes block/manifests/baseline binding, bounded producer
migration, Worker ownership/cancellation/refresh failures, full-result retention and parity tests.
Cold/warm browser readiness, real transfer, preparation, peak browser/refresh memory, full search
latency and pagination remain pending implementation approval. No performance budget is waived.

Reproduction scripts: `.testagent/static-delivery-research/`. Raw generated research data and
site: `/private/tmp/seoul-static-profile-20260914/`. Input stays in Downloads. Checked-in aggregate
evidence: `measurements-2026-09-14-static-delivery.json` plus `-profile`, `-shared-profile` and
`-index-profile` JSONs. They include component hashes and exact byte counts. Research script
formatting/import order/local variable names were cleaned after the run without changing the
serialization algorithm; current script hashes are included in the summary.

Current-state preparation checks pass with the pinned runtime: repository lint (two pre-existing
informational suggestions), format check, typecheck, isolated Vite shell build and git diff --check.
No production implementation/full browser suite was run at this pre-approval boundary. Research
round-trip/hash assertions above are fresh complete-source evidence. Shared-profile labels now
distinguish actual source cardinality from dictionary entries built, with no encoded-byte change.
