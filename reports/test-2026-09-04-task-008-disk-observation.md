<!--
Purpose:        Record bounded disk observation verification and remaining research gates
Owner:          Tester / Researcher
Update Trigger: When verification, review, or actual observation changes
Harness Version: 1.1
-->

# TASK-008 Disk Observation Verification

FR-13. TASK-008 remains active. The decoder-only retry passed category 15045028, then rejected
at the approved 100,000-row ceiling in category 15045032. No partial metrics were promoted.

## Verification

Pinned Node 24.19.0/npm 11.17.0 `npm run verify:full` exited successfully: lint, format, typecheck,
501 tests in 23 files, build, four browser smoke tests and two accessibility scans. Global coverage:
92.72% statements, 90.45% branches, 94.98% functions, 95.12% lines. Browser bundle remains 11.55 kB
and seven modules; scratch/index code is build-time research only.

Focused command: pinned Node `node_modules/vitest/vitest.mjs run
src/pipeline/research-index-store.test.ts src/pipeline/research-metrics-accumulator.test.ts
src/pipeline/observe-license-archive.test.ts` exited 0 with 80 passing tests. New required cases
were run failing before implementation. No production validator or status rule was changed.

| Requirement | Exact test evidence |
|---|---|
| Batch and partition independent exact metrics | `matches full transformation metrics across categories with batch size %i`; `matches the full oracle across reordered disk partitions and multi-field record unions` |
| Identity/digest collision rejection across batches | `rejects a cross-batch %s after disk replay`; `rejects a duplicate across the 1000-row batch boundary without partial aggregates` |
| Canonical escaped serialization and integrity | `round trips canonical escaped Unicode indexes with digest-only identity placement`; `rejects %s partition evidence`; `rejects invalid UTF-8 and malformed JSON while replaying a partition` |
| Explicit byte/key/pair boundaries | `accepts byte ceilings exactly and rejects the next reservation`; `enforces the resident partition key count even when input keys hash to one partition`; `reserves retained raw-pair bytes before adding a long value` |
| Disk space and I/O failures | `rejects unavailable or insufficient free space before buffering source indexes`; `rejects write failure and remains cleanup-safe` |
| Owned external scratch and cleanup | `refuses repository and symlink-resolved repository staging`; `refuses cleanup of a substituted symlink and never removes its target`; `requires scratch cleanup before reporting %s` |
| Heap/cancellation fail closed | `checks the budget during replay and still permits cleanup after cancellation`; `preserves the heap-stop reason during an awaited disk write and removes scratch` |
| Complete evidence binding | `rejects an index ordinal paired with the wrong completed category`; `refuses final metrics when generated disk indexes were not all stored`; `rejects inconsistent aggregate finalization evidence: %s` |

## Capacity evidence

- Prior in-memory synthetic index: 500,000 rows / 2,000,000 search keys, sampled RSS 1,334,763,520,
  heap 1,101,951,144 bytes, 16,382 ms. Insufficient headroom for a larger live row budget.
- Disk synthetic index: same row/key counts, RSS 377,438,208, heap 112,260,696 bytes, 44,568 ms.
- Long-key disk test: 5,000 rows / 60,008-character business names, RSS 384,892,928,
  heap 127,507,048 bytes, 9,448 ms. Both disk runs completed, then removed owned scratch;
  `/work/staging` was confirmed empty. No provider bytes were used.
- JSON evidence: `capacity-2026-09-04-task-008-disk.json` and `...-disk-long.json`. Benchmark
  implementation/script hashes are in `capacity-2026-09-04-task-008-disk.sha256`. Later aggregate
  storage-statistic instrumentation and formatting are not represented by that older snapshot.

## Remaining gates

Independent review found a cross-batch pending-byte cap defect; the regression reproduced it
and the corrected reservation flush passed the repeated full gate. Reviewer approved the offline
correction and reproducible benchmark script. Independent Reviewer approved one 3m-row / 2-GiB
live attempt after post-edit full verification. Those explicit CLI ceilings are now applied; the
approved single live run completed all 195 files and 2,936,760 rows.
Complete source-cut/timezone evidence, time-separated calibration, reviewed production thresholds,
public JSON-byte budget and bootstrap baseline remain separate unresolved TASK-008 gates.
TASK-009 is not activated, no production data changed, and no deployment was attempted.


## Reproducible capacity repeat

`scripts/benchmark-research-index.mjs` replaces the temporary-only benchmark for current capacity
review. It generates synthetic identities and exact unique normalized keys from eight-digit ordinals,
checks current source/script hashes before/after, and records storage bytes/limits and sampled memory.
The three-million-row short profile completed on the approved 6 GiB / 2 CPU Linux
container with Node 24.19.0 and a 2 GiB process heap. The long profile completed on the same
stable implementation. Historical 500k reports remain labeled historical, not current live authority.

The full repeat after pending-cap correction exited 0: 501 tests, four browser smoke tests, two
accessibility scans. `keeps all retained pending bytes within the cap across consecutive unflushed
batches` is the review regression (red 138 > 92; green after flush-before-reservation).


Current authority is `capacity-2026-09-04-task-008-disk-3m.json` and
`capacity-2026-09-04-task-008-disk-long-current.json`. Every embedded source/script hash matches
current workspace bytes. The 3m run completed in 273,905 ms, sampled RSS 413,048,832 / heap
151,173,512 bytes and serialized 1,890,444,450 bytes; largest partition 7,499,011 and peak buffered
15,014,266 bytes. Long profile: 9,324 ms, RSS 384,856,064 / heap 127,318,936, serialized 301,227,780,
largest partition 1,985,917 and peak buffers 9,030,384 bytes. Both report complete only after cleanup.
Exact reproducible commands are in the design. The former 5m proposal was withdrawn; the new
single live proposal is 3m rows / 2 GiB source, leaving 326 seconds within the retained 600-second
limit for extraction/CSV/source variance. Live review approved that single attempt; the post-ceiling-edit full gate passed 501 tests + four browser tests + two accessibility scans. Linux focused verification passed 101 tests, and all 30 implementation/contract/dependency file hashes match Mac. The live command started at 2026-09-04T13:04:43Z.

The running archive's read-only central-directory total (`unzip -Z -t`) is 195 files and
893,115,870 uncompressed source bytes. This is byte-size metadata only, not a validated row count
or complete observation. The reviewed source-byte ceiling remains unchanged for this one run.


## Completed live evidence

`observation-2026-09-04-task-008-complete.json` and its `-audit.json` bind all 195 completed
categories / 2,936,760 rows / 893,115,870 source bytes to the unchanged archive SHA-256. The command
returned exit 2 / complete:true / review_required. Peak RSS 465,375,232 and heap 151,790,672 bytes;
scratch 1,936,106,760 bytes, largest partition 36,800,148 and buffer peak 14,704,708. The complete
run stayed inside every reviewed limit. Archive and private indexes were removed; staging is empty.
Independent review verified row/status/pair/ingestion sums, resource limits, report hash and all 30
implementation hashes. The source-cut, 05/06 vocabulary, temporal calibration, public JSON budget
and bootstrap gates remain open; see the first-complete-observation assessment. No further live
attempt, production data write, publication or TASK-009 implementation occurred.
