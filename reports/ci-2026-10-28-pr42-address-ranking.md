<!--
Purpose:        Record the PR42 address-ranking CI failure and bounded correction
Owner:          Implementer / Performance Engineer
Update Trigger: When the exact-head verification or hosted result changes
Harness Version: 1.1
-->

# PR42 address-ranking correction — 2026-10-28

Requirements: FR-02/03/07 and performance NFR within the sole active TASK-009.
No deployment, merge, dependency, source/status mapping or workflow policy changes.

## Actual failure

Run 40647644280 at head 4aa2830 passes the ordinary Ubuntu verification job.
The complete-source diagnostic fails address searches in both mobile cells:
cold 1290.4/508.7/494.3 ms and warm 1341.4/481.6/463 ms. All counts,
rendered results and zero query-time requests/browser errors remain correct.
The retained trace shows a Worker major collection during each first address search;
collection timing alone does not identify all causes of the observed latency.
The unchanged 500 ms budget and every failed observation remain authoritative.

## Bounded correction

Address-only queries without a literal name match depend on two address projections.
Compare each distinct field once per query and retain only a byte of comparison/rank
flags. Combine the two field ranks without allocating a full scored object, comparison
array, conflict Set or reason strings for every admitted source row. Keep the detailed
scorer for requested pages, literal-name fallback, mixed/name queries and all display
reasons. Preserve the complete ordinal scan, exact sorting, cancellation and state commit.
The flags are local to one search; they do not retain search terms across queries.
No result cutoff, cache warming, forced GC, fixture change, budget relaxation or
failure suppression is introduced. Address data and the delivery schema are unchanged.

## Verification

The new repeated-address regression fails before the fix (400 comparisons for 200
records) and passes afterward (at most two). An additional complete-page oracle matrix
covers exact/core/partial matches, number/district contradictions, malformed and empty
fields, blank names, literal-name fallback, mixed queries and query changes.
All 108 search tests, types, scoped Biome, build, source/synthetic quality checks and
8 diagnostic-admission tests pass on local Node 22.22.3/macOS compatibility execution.
The complete test run executes 1442 cases: 1438 pass and four pre-existing unsupported
platform/runtime failures remain: the pinned Node/Unicode boundary, GNU tar round-trip,
UTF-8 DOS-origin unzip and valid-local-archive unzip. No assertion or skip is changed.
An initially incomplete temporary snapshot lacked report/operator fixtures; those
snapshot-only failures were corrected by restoring exact tracked fixtures before the
final full run. This is not a supported-runtime pass.

Full-source local address samples are 233.9/221.9/235.4 ms; prior retained samples are
259.2/245.9/250.4 ms. Different execution sessions and profiling prevent attributing the
whole difference to this change. Local timing is not browser/mobile acceptance.
The final source parity result is recorded below before delivery. Exact-head hosted
verification and the unchanged browser diagnostic remain required; see the live PR42
checks and description for their eventual actual outcome. TASK-009, broader mixed-query
performance, public delivery/equality and backup/recovery acceptance remain open.

## First correction complete-source parity

All 56 fixed searches over all 2,951,024 records preserve every eligible/similar ordinal,
count and all fields of first/middle/last pages against the frozen original scorer.
The additional fixed address fixture is included. Manifest SHA-256:
`1f5ec4815d7412021ee9b7a6703ee8c3141ab853479413e5d7d1ea9f2f7f06c1`.
Source SHA-256: `bb460584570c7a97f4f69a291524605d80f7108ba8433f6cdac03b383be4f598`.
Full local parity receipt SHA-256: `5438c040e0f8d8681e3026de7bfd06c2600f18789e8d521c1aa7050139c0844a`.
The raw profiling artifacts remain local. Preparation observations are 41.40/35.02 seconds
(original first; order/JIT/GC are not isolated). No browser performance inference follows.

## Scratch-buffer follow-up and final local checkpoint

Run40651993497 at6fad420 passes supported Ubuntu verification:1442Vitest,92browser,
20accessibility and the operator/admission checks. The unchanged full-source diagnostic
still fails. Mobile cold address samples are324.5/819/282.6ms and warm samples are
275.9/838.9/261ms. All other observations pass500ms; counts/layout remain correct and
query-time requests/browser errors remain zero. The trace shows Worker major collections
of741.989/712.362ms. These retained failures show the first correction is insufficient;
it moves the slow repetition rather than proving the collection problem resolved.

The second correction leases a private scratch workspace per active search and keeps at
most one idle workspace. Reuse the name/address admission flags, address ranks, ordinal
conflict flags and lazily allocated score array instead of repeatedly allocating buffers
proportional to all2951024records. Clear every query-derived flag/score in finally before
retaining storage. Overlapping searches receive distinct leases; cancellation returns only
its own lease. Published state contains independent ordinal vectors, so clearing scratch
cannot modify an accepted result. No query text or result cache is added. Retained scratch
adds3bytes per record plus one byte per distinct name and two per distinct address; this
is a bounded memory trade-off, not a peak-memory or physical-performance claim.

A real-allocation regression first fails with20Uint8Arrayallocations across six queries,
then passes with at most4byte arrays and one score array. A concurrent-search/cancellation
regression checks that another accepted query survives and later queries retain full
oracle parity. All110search tests, types, Biome, build, both quality checks and8admission
tests pass. The final complete local run records1440pass/4existing unsupported runtime/tool
failures,1444total. Exact supported-runtime and browser results remain required after push.

Final complete-source parity again passes all56fixed searches over2951024records,
including complete ordinal vectors/counts and full-field boundary pages. Source SHA-256:
`8b2fd72457bbb44f97da3c4aea953687fceba934b5b38c87cf7f71644afcaba5`.
Final parity receipt SHA-256:
`046320e3cb2e832e12fd4d65f7d83b47ec1c627ab29bce7cf30fa0090611cf53`.
Single original/current preparation observations are35.16/35.79seconds and cannot identify
causal preparation cost. This follow-up removes demonstrated repeated allocations; whether
it prevents the observed hosted pauses must be established by the next actual diagnostic.
No retries, dropped samples, forced GC, warming or weakened acceptance are introduced.
