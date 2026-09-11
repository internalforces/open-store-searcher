<!--
Purpose:        Design bounded complete research observation after the measured raw-row capacity stop
Owner:          Architect / Reviewer
Update Trigger: When equivalence, capacity measurements, or operational review changes
Harness Version: 1.1
-->

# TASK-008 Batched Research Observation Design

Status: Proposed for independent review; operational ceilings remain unchanged until measured.
FR-13. The user's active goal requests complete observation after fixing the decoder. The accepted
ADR-016 retry passed the original encoding point, then rejected after the 100,000-row ceiling
at 27,334,833 source bytes (category 15045032). No complete metrics were emitted.

## Scope

Retain the source, exact decoder/schema/status/identity rules, archive hashes before/after,
resource checks, and aggregate-only research output. Replace retention of every raw and transformed
record in the research observer with small transformer batches and compact global indexes. The
existing production staged validator is unchanged and remains the reference oracle in tests.
This is not production ingestion, public serialization, atomic publishing, or a new dependency.

## Accumulation contract

- Transform at most 1,000 rows at a time through the existing V2 transformer. Batch boundaries
  cannot change source semantics. Flush at every category EOF; complete empty categories remain
  represented. Count records across batches against the explicit observation row bound.
- Merge non-collision metrics from the existing `measureValidationMetrics`, preserving raw null,
  empty and whitespace counts, normalized missing counts, exact status pairs and four statuses.
- Preserve exact identity duplicates across batches using a category-local set of exact framed
  tuples; discard that set only when the category is finished. Category order is exact contract
  order and categories may not be reopened. Retain a global set of full identifier digests;
  repeated digest after the exact-tuple check is a digest collision, including across categories.
- Track each normalized collision key exactly (field plus normalized value, including empty
  strings but excluding null) across all batches/categories. A singleton stores its record
  ordinal and category ordinal in one number. On the second record, mark both records in a
  bounded bitset and count one global group and each participating category once. Later members
  update distinct category participation and distinct collided-record counts. Composite key uses
  exactly the transformer's three-field JSON convention. Do not retain full business records or
  collision identities in memory/output. The normalized strings remain local ephemeral indexes.
- An accumulator result must be deeply equal to `measureValidationMetrics(transformLicenseRecordsV2(...))`
  for deterministic synthetic multi-category inputs under several batch sizes, including boundary
  duplicate identities, digest collisions, cross-category normalization groups, null and empty
  strings, three-or-more member groups, and records belonging to several groups.
- A rejected batch/global check/read/hash/resource limit discards all aggregates. Reports preserve
  complete:false, metrics:null and ingestion:[]. No partial count becomes a baseline.
- Completed output remains research-only: dataAsOf:null and review-required coverage, policy and
  baseline diagnostics. Unknown raw pairs add review diagnostics; zero total rejects. The observer
  must not pretend to have called production validation on an unretained complete row array.

## Capacity gate

First implement and test equivalence without changing existing live ceilings. Run a bounded
synthetic benchmark with distinct IDs and collision keys and report rows, source-independent
process peak RSS/heap, duration, and chosen batch/index bounds. Assess memory growth before
proposing a larger live row/byte ceiling. Retain the 6 GiB container, 2 GiB Node heap, 3 GiB RSS,
600-second runtime and 65,536-code-point record limits unless separately reviewed. Any larger
row/byte ceilings require a written measured assessment and independent review before live use;
no automatic retry loop or silent ceiling increase. Resource failure remains a valid incomplete
research result and may require a later separately reviewed disk-backed implementation.

## Verification and task boundary

Offline focused unit/pipeline tests prove batch-size-independent equality, all failure paths,
all category provenance and safe diagnostics. Then pinned full verification and independent review.
Record the new observer implementation hash and explicit limits in each live aggregate report.
Complete observations still cannot create official source-cut/timezone facts, time-separated
calibration snapshots, an approved public JSON budget, or a production baseline by themselves.
TASK-008 remains active and TASK-009 remains sequentially dependent.

## Review corrections before implementation

Every retained index has an explicit safe-arithmetic cap derived from `maxRows`: global digests
and category-local tuples <= rows, collision keys and distinct group/category participation <=
4 * rows, collided-record bits <= rows. Check category count <= 256 and ordinal packing cannot
exceed Number.MAX_SAFE_INTEGER. Allocate collision-bit pages lazily so a large declared row limit
does not cause eager memory allocation. Any index/counter violation poisons the accumulator and
rejects all later operations; no partial metrics can be retrieved after a failure.

The accumulator consumes transformed batches with their actual digest bytes. Tests invoke the
existing transformer's test-only `hash` option on separate single-record batches to inject the
same digest across categories; no hash override is exposed by the live observer or CLI. Test
cross-batch exact duplicates independently. Only records and their search fields feed global
collision accounting; per-batch collision diagnostics must be ignored. Explicit assertions cover
three-member cross-category groups, a record in multiple groups, distinct per-category/global
participants, total/category missing/status/unknown metrics, raw missing-cell counts, and exact
pair key/count aggregation in `compareText` ordering, alongside full-oracle deep equality.

An aggregate-only finalizer will explicitly guard `validValidationMetrics`, all expected completed
category/header/hash evidence, per-category row-count equality and total sums. It reuses existing
validator metadata preflight without calling that preflight proof of row ingestion. For structurally
complete aggregates it emits the exact existing no-policy/no-baseline/no-coverage diagnostics,
zero-total rejection and per-category unknown-pair review diagnostics, sorted by the existing
code/category/metric `compareText` convention. Compare its kind/metrics/diagnostics against the
normal validator on full synthetic arrays for nonempty, empty and unknown-pair cases. Invalid
aggregate/ingestion evidence returns complete:false, metrics:null and ingestion:[]. File hashes
and EOF are proved by the observer before finalization; the finalizer cannot publish.

## Measured capacity and disk partition revision

The 500,000-row distinct-key synthetic benchmark completed in 16,382 ms, with sampled peak
RSS 1,334,763,520 bytes and heap 1,101,951,144 bytes. Evidence:
`reports/capacity-2026-09-04-task-008-batched.json`. Linear extrapolation is not a memory guarantee,
but this is insufficient headroom for a multi-million-row experiment under the retained 2 GiB
heap. Do not increase the live row ceiling on the in-memory global-index implementation.

Use build-time temporary JSONL index partitions through existing Node filesystem/crypto APIs,
not a database or new external service/tool. The raw/transformed batch stays at 1,000 rows.
For each transformed record, write one identity index (digest plus exact framed tuple) and up
to four collision indexes (exact normalized key plus ordinal/category). Partition by the first
SHA-256 byte of the complete index key into 256 files; hash partitioning is only placement, and
comparison within each file retains exact keys/tuples. Equal keys always share a partition.
Buffer at most 64 KiB per partition plus one bounded record, flush through awaited filesystem
writes, count UTF-8 bytes before writing, and reject an explicit scratch-byte limit. No content
from these private staging files may enter reports or the repository.

At EOF, validate each partition independently. A repeated digest must reject exact duplicate
versus digest collision according to the retained exact tuple. Collision groups update the same
shared exact group/category and global participant-bitset logic as the in-memory oracle. Clear
only partition-local key maps between files; retain the global participant bitset and accumulated
counts, so one record colliding in several partitions is counted once. Enforce <= 250,000 distinct
identity keys and <= 250,000 distinct collision keys per partition, plus the row-derived bounds;
imbalanced or hostile partitioning must fail safely. Verify parsed index counts equal written
counts and every index ordinal/category is valid. Retain bounded raw-pair maps with at most
100,000 distinct pairs total and per category, checked before inserting; materialize sorted pairs
only at finalization. These are operational limits, not permitted source status mappings.

Use a unique scratch directory under the already-approved external staging root. Reject repository
or symlink-resolved repository placement. Remove the owned directory recursively on success and
all normal failure/abort paths; a cleanup failure must prevent complete evidence output. Periodic
budget checks during write and read preserve abort/RSS/time guards. Add a 1.5 GiB observed heap
stop below the existing 2 GiB process heap to leave batch/GC headroom. Unexpected process death
cannot emit complete evidence; command-level cleanup must own the scratch path as well as archive.

Tests must compare both index strategies to the existing full-array oracle, exercise cross-partition
participant union, cross-batch/global duplicates, injected digest collisions, scratch-byte and
partition-key limits, malformed/truncated index input, write/read/cleanup failures, cancellation,
and external staging isolation. Review executable storage cleanup and limits before live use.
A bounded disk-index synthetic benchmark will inform the next proposed row/byte/scratch ceilings;
no production threshold, source-cut, baseline, or TASK-009 activation is implied.

## Disk review corrections (implementation proposal)

- Identity placement uses SHA-256 of the digest string **alone**, never the tuple payload.
  Identity JSONL is exactly `["i", digestBase64, framedTupleBase64, ordinal, categoryOrdinal]`.
  Collision JSONL is exactly `["c", key, ordinal, categoryOrdinal]`; `key` is the JSON encoding
  of `[field, normalizedValue]` (the composite value is the existing transformer's exact JSON
  three-field value). Collision placement hashes that entire key alone. Both kinds share 256
  files; their disjoint type tags keep namespaces distinct. Hashes only select partitions.
- Serialize each index with JSON.stringify plus one LF, encode UTF-8, and reject before buffering
  if its encoded line exceeds 2 MiB. Read bounded chunks with strict UTF-8, require a final LF,
  reject blank/malformed/noncanonical JSON, wrong array lengths/types/tags, unsafe or out-of-range
  ordinal/category, invalid digest (32 bytes) or noncanonical tuple Base64, wrong partition,
  and mismatched recorded byte/count/SHA-256 evidence. Embedded newline/quotes use JSON escaping.
  Verify read evidence against write evidence even for missing/empty partitions. Do not log data.
- Initial conservative internal ceilings: scratch serialized bytes 4 GiB; each partition file
  64 MiB; 250,000 distinct keys per partition; retained partition key/tuple UTF-8 payload 32 MiB;
  combined retained total/category raw-pair key/value payload 32 MiB; 100,000 distinct raw pairs.
  Each insertion reserves its bytes first. These are rejection limits, not proven operating
  capacity. Buffers account against the same scratch/file totals before allocation; replay
  reuses those files and reads one 64 KiB chunk at a time. No second disk copy is made.
  Runtime object overhead is additionally guarded by the 1.5 GiB heap and 3 GiB RSS stops.
  Benchmarks must cover distinct short keys and near-limit long keys before any live change.
- Use no more than 64 transformed records per disk batch (within the prior at-most-1,000 rule),
  bounding the pending asynchronous index write list by source-record and index-line limits.
  Retain synchronous in-memory accumulation only as an offline test oracle; live research uses
  the disk strategy. Share metric merging and group/bitset logic, not a second collision algorithm.
- Scratch is a mkdtemp-owned mode-0700 child of the canonical external staging root; files are
  exclusive mode-0600 creations. Track the created root's inode/device and canonical parent.
  Before recursive removal, lstat must show the original directory, not a symlink/replacement,
  and realpath must retain the approved parent. Refuse unsafe removal. Observer returns complete
  only after successful cleanup; command retains the owned storage object and calls its idempotent
  cleanup again in finally. Process-kill leftovers cannot produce complete evidence and require
  the same bounded cleanup ownership check on next inspection. No scratch path enters reports.
- maxHeapBytes=1,610,612,736 is a fixed internal research ceiling, independent of CLI input;
  check before/after CSV chunk parse, transformed batches, each bounded storage append/read,
  map insert/replay and finalization. Existing timeout/RSS limits remain operative. The CLI report
  envelope includes fixed storage/heap limits and sampled peak RSS/heap, without source content.
  Native memory sampling cannot be overridden from command arguments; unit dependency seams are
  only for deterministic fault testing. A heap stop rejects all partial metrics.
- Global collided-row bitset uses stable ordinal and category from each index. Validate ordinal
  membership against the per-category contiguous row ranges. Only a first-set bit increments the
  global and corresponding category record counts. Group category sets stay partition-local;
  first participation in a group increments that category's group count. Reset partition maps
  after their counts are applied; never reset global bitset/counts. Test keys in different
  partitions, replay order differing from input order, and several fields hitting one ordinal.
- Conservative caps may be tested offline now; they do not raise existing live row/byte ceilings.
  Approval of executable implementation, long-key benchmark evidence and next operational limits
  remains required before any live retry.

### Final offline prerequisites

Pending index serialization has a fixed 16 MiB total-byte cap. Check/reserve before adding each
serialized line to the pending batch; reject before crossing it. Await batch storage/flush before
accepting another transformed batch and release the pending reservation. A batch reservation uses
native statfs before accepting its complete serialized byte count; every filesystem flush rechecks
statfs before writing. Preserve at least 512 MiB of available external filesystem space after the
reservation/write; absent or unsafe space evidence rejects the run. Bytes still buffered across
partitions remain reserved in this calculation. A 4 GiB scratch ceiling is not allocated space.
Index tuple numeric fields are globalRowOrdinal and categoryIndex; category row ranges validate
that pair without altering the stable global ordinal.

## Offline measurements and proposed next live experiment

The disk implementation's Linux Node 24.19.0 synthetic run processed 500,000 unique identities
and 2,000,000 distinct collision keys in 44,568 ms, sampling peak RSS 377,438,208 bytes and heap
112,260,696 bytes. A separate 5,000-row run with 60,008-character business names completed in
9,448 ms, sampling peak RSS 384,892,928 and heap 127,507,048 bytes. Both cleaned their owned
scratch directories. Evidence: `reports/capacity-2026-09-04-task-008-disk{,-long}.json`.
Neither is a production row count or a guarantee that a larger archive fits.

The initial 5m extrapolation was not approved and is withdrawn. The corrected, repository-visible
benchmark script ran exactly 3,000,000 rows / 12,000,000 distinct collision keys in 273,905 ms,
sampling peak RSS 413,048,832 and heap 151,173,512 bytes. Serialized indexes: 1,890,444,450 bytes;
maximum partition 7,499,011 bytes; peak retained buffers 15,014,266 bytes (below 16 MiB). Complete
metrics matched the generated record/key counts and zero collision groups; owned scratch was
removed before success. `reports/capacity-2026-09-04-task-008-disk-3m.json` includes current script,
source and contract hashes, verified before/after. The long-key repeat uses the same snapshot.

Exact Linux command, working directory `/work/repository`, approved 6 GiB / 2 CPU container:
`node --max-old-space-size=2048 scripts/benchmark-research-index.mjs --staging=/work/staging
--output=/work/evidence/task008-disk-capacity-3m.json --rows=3000000 --profile=short`.
Long repeat changes output to `task008-disk-capacity-long-current.json`, rows to 5000 and profile
to long. The synthetic generator is preserved in that script and never contacts the provider.

Propose one full research attempt: maximum source bytes 2 GiB (2,147,483,648), maximum rows
3,000,000; retain timeout 600,000 ms, RSS 3 GiB, process heap 2 GiB, observed heap 1.5 GiB,
record 65,536 characters and every conservative scratch/index bound above. The measured exact
row ceiling leaves 326 seconds (54% of the retained deadline) for extraction, CSV decoding and
source variability. It does not guarantee completion; slower I/O, long/skewed keys and absolute
byte/key limits remain rejection conditions. No automatic retry or cap escalation. A stop discards
all aggregates. Existing CLI ceilings stay unchanged until independent live-budget approval.
