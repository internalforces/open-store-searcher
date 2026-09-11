<!--
Purpose:        Independent review of TASK-008 disk-backed research observation
Owner:          Reviewer
Update Trigger: When the approved single observation or its verification evidence changes
Harness Version: 1.1
-->

# TASK-008 Disk Observation Independent Review

FR-13. This review covers the research-only disk index implementation and a single bounded
observation budget. It does not approve production ingestion, publication, baseline creation,
source-contract or status-mapping changes, or TASK-009.

## Executable review

**Approved for one bounded research observation.** The index store partitions identities by the
digest alone and collision groups by their complete canonical key. Tagged canonical JSONL records,
strict replay validation, per-file byte/count/hash binding, ordinal/category-range validation and
the global collision bitset preserve the accumulator's oracle semantics without reporting source
rows or scratch paths. The scratch directory is external, owned, private, inode-checked for
cleanup, and a cleanup failure prevents a complete result.

The review initially found a pending-buffer defect: a new batch was limited against its own
serialized bytes but could coexist with retained buffers from earlier batches, exceeding the
16 MiB cap. The regression reproduced a 138-byte peak against a 92-byte cap. The correction
flushes retained buffers before a queued/new line crosses the remaining reservation; the
multi-batch regression now proves that `peakBufferedBytes` does not exceed the configured cap.

I independently reran the pinned Node 24.19.0 focused suites after that correction:
`research-index-store`, `research-metrics-accumulator`, and `observe-license-archive` completed
with 80 passing tests. The post-correction full verification subsequently completed with 501 tests,
four browser smoke tests and two accessibility scans before the approved observation.

## Capacity evidence

The repository-visible, no-network synthetic benchmark is
`scripts/benchmark-research-index.mjs`. I verified that the implementation hashes embedded in
`reports/capacity-2026-09-04-task-008-disk-3m.json` and
`reports/capacity-2026-09-04-task-008-disk-long-current.json` exactly match the current script,
index store, accumulator, transformer, metrics module and archive contract.

The short profile completed 3,000,000 rows and 12,000,000 distinct collision keys in 273,905 ms,
with sampled peak RSS 413,048,832 bytes, heap 151,173,512 bytes, 1,890,444,450 serialized scratch
bytes, a 7,499,011-byte largest partition and a 15,014,266-byte buffer peak. The current long-key
profile completed 5,000 rows with 60,008-character names in 9,324 ms and stayed below the same
resource stops. Both reports record successful owned-scratch cleanup. Historical 500,000-row
reports remain historical evidence only.

## Approved single-run budget

After the post-edit full verification succeeded, the following exact budget was approved for one
research observation:

- maximum rows: 3,000,000;
- maximum decoded source bytes: 2,147,483,648;
- timeout: 600,000 ms;
- RSS stop: 3,221,225,472 bytes;
- Node old-space: 2 GiB and fixed observed heap stop: 1,610,612,736 bytes;
- maximum record characters: 65,536; and
- unchanged disk-store limits, including 4 GiB scratch, 16 MiB pending buffers, 64 MiB per
  partition and 512 MiB free-space headroom.

The exact 3,000,000-row synthetic run leaves 326,095 ms of the timeout for archive extraction,
decoding, CSV handling and normal source variability. That margin supports one fail-closed attempt;
it does not predict completion. A limit, validation or cleanup stop must discard aggregates and
must not trigger an automatic retry or an increased budget.

## Remaining gates

The observation must still produce complete aggregate evidence, source-date and threshold grounds,
time-separated calibration, an approved production JSON budget and a bootstrap baseline before
TASK-008 can close. No result from this approval may publish data or activate TASK-009.

## Completed observation review

**Approved as complete research observation evidence; still not production-ready.** I independently
checked `reports/observation-2026-09-04-task-008-complete.json` without reading source rows. It is
`complete:true` and `review_required`, has `dataAsOf:null`, binds 195 completed ingestion entries to
archive `9cbe96a9bdadb46b8e0bb8034b6b8b60ea133598f6125ba0cfc954bbc31c898c`, and reads 893,115,870
bytes. The 2,936,760 ingestion-row sum, category-row sum, total status-count sum and aggregate-pair
sum all equal the total record count. Twenty-three entries are header-only.

The 68 aggregate-pair review diagnostics sum exactly to the 186,887 total/category unknown-pair
count. The raw pairs `05` / `제외·삭제·전출` (186,864) and `06` / `기타` (23) remain unapproved and
are correctly represented as `확인되지 않음`; the existing status mapping was not changed. Missing
business names total 29. Resource evidence remains below every approved stop: peak RSS 465,375,232
bytes, observed heap 151,790,672 bytes, scratch 1,936,106,760 bytes and buffered bytes 14,704,708.

The companion audit binds this aggregate report by SHA-256
`1e218c054100dc8dbdccf387a383ab37e85e0797d82e72a7ba341755bc6edab6`. I independently recalculated
that report hash and all 30 recorded implementation hashes; every value matches the current file.
The audit records matching pre/post implementation snapshots, empty staging after cleanup, no
production publication and no confirmed source-cut. No additional observation-integrity blocker was
found. The production gates stated above, including source-cut/timezone evidence, time-separated
calibration, policy/status approval, public JSON budget and bootstrap baseline, remain blocking.
