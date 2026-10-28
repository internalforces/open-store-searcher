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

## Complete-source parity before delivery

All 56 fixed searches over all 2,951,024 records preserve every eligible/similar ordinal,
count and all fields of first/middle/last pages against the frozen original scorer.
The additional fixed address fixture is included. Manifest SHA-256:
`1f5ec4815d7412021ee9b7a6703ee8c3141ab853479413e5d7d1ea9f2f7f06c1`.
Source SHA-256: `bb460584570c7a97f4f69a291524605d80f7108ba8433f6cdac03b383be4f598`.
Full local parity receipt SHA-256: `5438c040e0f8d8681e3026de7bfd06c2600f18789e8d521c1aa7050139c0844a`.
The raw profiling artifacts remain local. Preparation observations are 41.40/35.02 seconds
(original first; order/JIT/GC are not isolated). No browser performance inference follows.
