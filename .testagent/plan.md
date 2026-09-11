# TASK-008 Continuation Test Plan

1. Capture failing day-7 tests before changing the freshness comparison and approval documents.
2. Add missing-module red tests for streamed CSV: delimiters, quoting/newlines, empty values,
   split encoded characters, invalid bytes/quoting/width, EOF, and explicit resource bounds.
3. Implement parser and narrow-run it. Then test/implement observation using exact accepted
   collector evidence and real validator/transformer with injected bounded entry/hash seams.
4. Test the actual streaming child boundary for EOF, error, timeout, byte limits, and cleanup.
5. Review exact design and operational research limits before any live row ingestion.
6. Run pinned full verification and independent review; only then perform bounded live observation
   in the approved reconstructed Ubuntu environment. Never turn missing evidence into acceptance.
7. Record exact test names, commands, live outcome, and unresolved external evidence in reports.

## Batched observation follow-up

1. Add accumulator tests against the existing transformer + metrics oracle at batch sizes 1, 2,
   and larger, using deterministic mixed null/empty/whitespace/status/collision fixtures across
   three nonempty and one empty category. Assert concrete expected collision counts as well.
2. Add exact duplicate, injected digest collision, category order/reopen, incomplete-finish and
   row equality/overflow tests; verify missing-module red before compact-index implementation.
3. Extend the existing observer suite with >1,000 rows and a boundary duplicate, while retaining
   every existing provenance, byte/row/RSS/hash/read/timeout/privacy test. Implement batch flushing
   only inside the research observer, retaining the existing production validator unchanged.
4. Run narrow tests and compare the research report with the reference validator on full synthetic
   fixtures. Then benchmark bounded synthetic index growth before proposing any live-limit edit.
5. Update exact ceiling and CLI boundary tests only after measured assessment and independent
   operational review. Run pinned full verification and review the final executable before live.
6. Record full versus incomplete source result honestly; retain external evidence gates and do
   not activate TASK-009 until TASK-008 is actually complete.

## TASK-008 disk-index verification plan

1. Add failing storage tests for exact escaped JSON round trip, digest-only placement, file/scratch
   ceilings, tampered/truncated/missing records, read/write errors and guarded owned cleanup.
2. Add failing accumulator disk oracle tests for multi-category collision union, reordered
   partitions, duplicates/digest collisions, key/payload caps and cancellation. Share algorithms.
3. Integrate observer disk lifecycle and private command-owned cleanup; verify metadata/EOF/hash
   proofs remain necessary, complete output requires cleanup and heap limits cannot be disabled.
4. Run narrow pinned tests during edits. Benchmark distinct short and near-limit long keys offline.
   Then pinned full verification and independent review. Do not raise live caps until reviewed.
5. Record exact test names and remaining production evidence gates in status/evidence reports.
# ADR-017 accepted implementation plan

1. Regression tests for V2 staged acceptance/review and V1 preservation, exact/variant pairs,
   malformed/missing/mixed envelopes and baseline/policy compatibility.
2. Shared immutable vocabulary descriptor and explicit-context metrics/validator implementation.
3. Offline V2 research tests through complete CSV observation and malformed/rejected paths;
   preserve the existing V1 wrappers and resource limits.
4. Deterministic derivation tests for source/audit/hash/ingestion corruption, original historical
   report preservation, all-category metrics and exact remaining diagnostics; produce separate V2
   evidence with implementation hashes, no provider calls or baseline promotion.
5. Focused tests, pinned full verification, independent final review; record exact evidence names.

## TASK-012 — 2026-09-05

Research → plan → implement: add engine fixtures against the declared API; capture RED; implement pure parser/comparator/ranking; run focused GREEN; add browser sentinels; full verification and independent assertion-gap review. S01–S09 map to search and address suites, S10 to browser search suite.

### TASK-012 completion

All S01–S10 requirements have concrete passing assertions; see reports/test-2026-09-05-task-012.md.
Final pinned verify:full passed 581 tests, eight browser tests and two accessibility scans;
independent Reviewer Approved after checking assertion quality and gaps. Status/source reference
types, invalid-query no-scan, numeric fallback and inherited browser sentinels were verified.
No existing TASK-008 artifact was overwritten or restored.
