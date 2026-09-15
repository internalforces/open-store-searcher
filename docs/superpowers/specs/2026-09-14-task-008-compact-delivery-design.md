# TASK-008 compact delivery and Worker search design

Status: Accepted by the user on 2026-09-14; implementation authorized.
Date: 2026-09-14. Baseline: e8f8c92, identical tracked tree to merged PR #22 / 81a1441.
Requirements: FR-02/03/07/08/12/13/14; existing privacy, safety and performance constraints.

## Decision requested

Approve a coordinated versioned migration to lossless column blocks with local dictionaries and
selective shared evidence dictionaries, and a Worker-owned compact store. Do not ship the measured
optional exact-key postings in the first implementation. Keep complete scan fallback while proving
retrieval equivalence. This approval does not approve status mappings, production quality policy,
bootstrap baseline, deployment, security settings or TASK-009/010 completion.

The source was received from the user and hash-verified before and after profiling. Full-source
storage feasibility is established for the measured research package; browser performance feasibility
was not established at approval time. No production codec or Worker existed at that point. The research scripts are
throwaway measurement tools, not a public contract implementation.

## Measured alternatives

All numbers below are actual complete-source serialized UTF-8 bytes. Gzip columns use actual
per-block gzip output, not estimated ratios or observed Pages transfer.

| Candidate | Search | Evidence including shared dictionaries | Total data | Gzip total |
|---|---:|---:|---:|---:|
| Plain flattened tuples | 606,481,661 | 836,348,857 | 1,442,830,518 | 229,978,011 |
| Local dictionary tuples | 509,676,371 | 215,232,025 | 724,908,396 | 218,774,046 |
| Local dictionary columns | 503,814,379 | 209,489,305 | 713,303,684 | 202,945,621 |
| Selectively shared dictionary columns | 503,814,379 | 182,877,543 | 686,691,922 | 198,292,818 |

Recommend the fourth candidate. Compared with local-only columns it saves 26,611,762 deployed
bytes but adds a global dictionary dependency and a bounded producer pass. Keep local-only columns
as the simpler alternative if that complexity is not accepted. Plain tuples exceed the site limit.

Actual research-site size is 687,009,428 bytes across 727 files, including all selected blocks,
118,489 manifest bytes, the 143,806-byte observation receipt and the current 55,211-byte demo shell.
It is a size-accounting package, not a functioning compact-search application or validated release.
Final Worker assets and the approved baseline do not yet exist, so final production-site size is
unmeasured; the builder must check it again. No legacy 2.44 GB file is present in this package.

Exact-name postings add 67,586,541 bytes and exact-address-key postings 184,624,293 bytes
(252,210,834 combined). Including them gives a research-site footprint of 939,220,262 bytes.
They do not cover all valid candidates, so their download cost is unjustified without latency
and memory evidence. They are not included in the recommended initial delivery.

## Evidence fidelity and ordering

Preserve all 21 flattened fields, including full 64-character IDs, original names/addresses,
category names, ordered businessTypes objects, four raw-status fields, processedStatus, eight
lifecycle fields and original source labels/URLs. Null and empty string remain distinct.
Do not normalize evidence values, shorten IDs, remap statuses or infer collection coverage.

Retain original staged row order, using ordinal references only internally. The observed source
has 1,469,700 adjacent descending public-ID pairs; it is not sorted by the public digest string.
The ordered ID stream hash is ae6597150d357ab703df0358c22d9a1b63334ec6c8f2015551cd5b87138acf34.
Ranking ties must still use existing lexical public-ID comparison, independently of row order.
The current producer's identity sort and public ID digest must not be conflated.

The proposed block representation permits a raw values column, a local dictionary with integer
references, or references into a named shared dictionary. Decoders reject unknown shapes, extra
columns, wrong types, wrong lengths, non-integer/out-of-range references and invalid field values.
Choose representations by actual serialized total bytes, including dictionaries and references;
never choose based on a fabricated compression factor or a quality threshold.

The measured shared fields are businessTypes, raw operatingCode/operatingName, processedStatus,
licensedOn, licenseCancelledOn, closedOn and sourceLabel. Other evidence fields remain local/raw
because global reference overhead can exceed savings. sourceLastModifiedAt has 2,313,024 distinct
values; its global dictionary was not built in the research shared-field comparison. Permit a
producer to fall back to local/raw encoding if a shared dictionary would exceed a bounded memory
budget or fail to save bytes. Encoding choices never discard rows or affect validation policy.

## Manifest and baseline binding

Retain release.json as the release entry point; add explicit release version 2 and compact encoding
version 1. Bind schema version 2, identifier version 1 and normalization version 1, together with
archive hash, policy revision, collection timestamp, dateBasis=collection, sourceDataAsOf=null,
record count and original-order ID digest. Metadata retains the exact source and date labels.

The release references a content-hashed dataset manifest and the matching baseline with exact
SHA-256 and byte length. The manifest binds ordered search/evidence blocks and dictionaries by
role, encoding version, relative asset path, SHA-256, byte length and contiguous half-open row
ranges. Per-block headers bind the source/archive and encoding version; the manifest hash defines
the dataset generation. Avoid circular self-hashes. Builder-generated immutable paths must match
the deployed descriptor exactly, retaining the PR #22 correction.

Require both roles to cover precisely [0, recordCount), no gaps/overlaps/duplicate files, matching
row counts, all required columns and all referenced dictionaries. Validate global ID uniqueness
across blocks before accepting a snapshot. Validate complete counts and baseline archive/policy/date
bindings. Unknown or mixed versions fail closed. Reject malformed manifests before loading data.

The research block size is 8,192 rows; maximum measured local-column block is 1,888,265 bytes.
Use 8,192 as an initial row bound and an explicit 8 MiB encoded block working bound, splitting
blocks earlier as needed. These are operational encoding parameters, not quality policy changes.
If one record cannot fit the operational resource bounds, fail the candidate explicitly and keep
last-good data; never exclude it or claim a partial dataset is complete. Measure and revisit the
working bound before acceptance if complete-source browser memory requires it.

## Coordinated producer and publication migration

1. Preserve collection, strict row iteration, 1,000-row transformation batches, global disk-backed
   identity/collision validation and external merging. Stream the same validated merge into blocks.
   Build shared dictionaries in bounded passes, spilling to existing scratch infrastructure where
   needed. Do not replace the producer with whole-dataset arrays or the research cardinality sets.
2. Update both bounded and in-memory reference producers together. Use the existing display record
   output as the evidence oracle. Observation mode still emits no accepted release/baseline.
3. Update build-publication.mjs to verify/copy only manifest-listed compact assets and the same-release
   baseline. Preserve total JSON policy enforcement, complete-site size checks, post-copy hashes,
   output-absence checks, atomic rename and cleanup of only owned candidate state. Never copy the
   legacy dataset into a new compact site.
4. Update read-deployed-baseline.ts with explicit legacy-v1 and compact-v2 readers so an existing
   deployed v1 baseline remains readable during migration. Retain descriptor-before/after equality,
   hash checks and bootstrap-only-on-404 behavior. No fabricated baseline or policy default.
5. Update the browser loader, hook, App and results interface in the same change. Preserve synthetic
   test/demo injection through an adapter, but assign production preparation to the Worker alone.
   All new asset URL contracts and descriptor versions are covered by the requested approval.

## Worker-owned storage and request protocol

The Worker loads and validates all blocks in a fixed manifest order with bounded concurrency of
two. Requests use no search/click input, credentials or referrer. No persistent browser database.
Keep raw columns/dictionaries in compact form. Build normalized search projections once per distinct
value where that preserves semantics; represent per-row links and ranked candidates using ordinals
and numeric arrays. The UI never receives the entire dataset/index/result set.

Messages include protocol version, dataset manifest hash, load generation, query generation and
page request sequence. Ready is emitted only after every required block, global identity and count
check passes. A query returns Top-3, complete eligible/similar counts, validation/uncertainty/tie
state and only the requested 20-item similar page, with absolute ranks and materialized evidence.
Keep the entire ranked reference set in the Worker for previous/next/first/last navigation.
Page navigation performs no network request.

Use cooperative scan/preparation batches so cancellation messages can run. Superseded work stops;
the UI ignores all stale generations. Sorting must likewise yield or use bounded passes without
changing order. Clear query results on dataset replacement, matching existing submission reset.
Reject page requests for another dataset/query generation.

During refresh retain the accepted Worker while a candidate Worker loads and prepares. Switch
atomically only after full acceptance; on candidate failure or cancellation terminate only that
candidate, preserve accepted search, and expose retry. Measure both Workers' aggregate memory.
A crash of the accepted Worker itself loses its volatile store: keep the current visible page,
announce search unavailable and retry the pinned accepted manifest. Do not claim process-crash
recovery can retain all volatile data. Candidate-only failure is distinct from accepted-worker
failure; neither should display partial data as ready.

## Candidate retrieval without semantic changes

Extract/reuse current scoring logic, confidence downgrade rules, ordered reasons, tie handling and
comparison functions. Adapt inputs to compact projections and outputs to row/score/reason flags;
materialize CandidateMatch/DisplayRecord only for visible cards. Do not reimplement heuristics.

Exact-name/address maps are optional internal accelerators, not complete filters. Bidirectional
name containment must include both candidate.includes(query) and query.includes(candidate), with
the existing two-grapheme and literal fallback rules. A distinct-normalized-name dictionary scan
is lossless for name tests; expand every matching posting and union with address candidates.

Address candidates include literal nonnumeric substrings, exact numeric tokens, same-district and
same-family anchors even when other components conflict. Retain complete row scanning for any
path without a proof of complete indexed retrieval. Do not cap results or silently intersect away
relevant candidates. Use original public IDs for sorting, not ordinals. Measure broad queries even
when they approach the full dataset. More elaborate substring postings need separate size/latency
evidence; no benefit is claimed from unbuilt n-gram indexes.

## Verification and honest performance gates

Storage research already proves 8,819,841 exact record reconstructions across three candidates,
49,979,099 exact evidence-value comparisons for shared dictionaries, 2,939,947 unique full IDs,
count parity, and exact original ordering. These are research-code checks, not production-code tests.

Implementation must add missing/corrupt/oversized/mixed/incomplete block, bad reference, global
identity, stale/cancelled request, candidate/accepted Worker failure and retry tests. Assert old
output/accepted snapshot preservation. Compare all identities, scores, ordered reasons, confidence,
ordering, ties and counts against the existing engine, including source-quality queries, broad
district queries, substrings, literal/numeric cases, conflicting addresses, unknown statuses and
absent results. No synthetic result is production performance evidence.

Run pinned Node 24.19.0/npm 11.17.0 project checks and approved Ubuntu full-runner checks where
required. Record Mac/native-unzip limitations separately. No commit/push/workflow dispatch or
security changes are implied by this design approval. If hosted verification requires additional
authorization, complete local verification and preserve the gate as pending.

Measure real-source cold/warm readiness, actual transfer bytes, final deployed bytes, preparation,
peak memory, old/new overlap, search-to-visible-page latency and pagination with existing budgets.
Keep 2.5-second primary-content and 500 ms post-load search targets and 300 KB initial code budget;
report readiness separately. If a 2.5-second complete-readiness target is required, the measured
format cannot satisfy it at the existing 200,000-byte/s mobile-lab throughput: even measured gzip
bytes alone need at least 991.46 seconds of transmission. This is a mathematical lower bound,
not a browser benchmark or synthetic extrapolation. Actual Pages compression is unverified.

The current constraints can preserve full Seoul completeness and privacy with a small initial shell
and a long explicit first-load preparation phase. If that is not acceptable, the concrete options
are a user-installed/offline full package (delivery-scope change), user-selected regional scope
(completeness/product change), or query-dependent delivery/remote search (privacy/architecture change).
None is silently adopted. Do not weaken budgets or claim practical mobile readiness from site fit.

## Approval and remaining work

Human approval is required by AGENTS.md for source-data delivery/public-interface changes and by
the requested execution sequence before implementation. Approving this design authorizes the
coordinated implementation and measurement work only; it does not waive acceptance failures.
Production quality review (including 05/06), initial baseline and all release gates remain separate.
Evidence: reports/measurements-2026-09-14-static-delivery*.json and the feasibility report.


## Implementation evidence

The accepted implementation and final local checks are recorded in
`reports/test-2026-09-14-compact-delivery.md`. The release retains the exact collection timestamp;
manifest coverage and baseline date bind to its validated Seoul calendar date. Research manifests
may have a null policy, but publication rejects that state. The candidate filter uses a proven
superset of the original scoring predicate while scanning every ordinal; precomputed exact-key
postings remain excluded. No approval of mobile/hosted readiness or release gates is inferred.
