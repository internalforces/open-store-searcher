# TASK-013 quality test plan

1. Write consumed synthetic corpus and independent expected IDs, README and evaluator tests first.
2. Q02/Q03/Q06: assert hand-calculated metric outcomes, rank 3 vs 4, low-only misses and empty set.
3. Q05: reject duplicate cases/records, malformed data and labels referencing missing records.
4. Q01/Q04: corpus safety assertions and status/reference preservation, no inferred closure.
5. Q07: deterministic reversed-record rerun and actual CLI output/exit check.
6. Implement evaluator and offline CLI, preserve every observed miss without changing scores.
7. Run focused/full verification, independent review, report Q08 as open if no source sample arrives.

## Completion execution

1. Fix source selection before scoring; independently review policy and replay extraction.
2. Observe synthetic and source failures, write P01/P02 regressions, implement targeted parser fixes.
3. Preserve all targets/labels and monotonic competitor closure; verify unchanged source corpus.
4. Add Q08 checked source path and Q03 preview regression; include both quality gates in verify:full.
5. Final focused/full verification, independently reviewed source/code/report evidence, completion records.
