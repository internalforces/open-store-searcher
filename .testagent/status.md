# TASK-008 Continuation Test Status

Approved ADR-015 implementation verified; TASK-008 production evidence remains incomplete.

- TDD: freshness regression failed four cases; new parser/process/observer/CLI/limit tests first
  failed for missing implementations. Typed CSV diagnostics and forged-code privacy regressions
  failed before their corresponding changes. Final assertions were reviewed against behavior.
- Final pinned full verification: 21 files, 425 tests; four browser smoke tests, two zero-violation
  accessibility scans; all exited 0. Global coverage 91.52% statements,89.75% branches,
  94.77% functions,94.16% lines; status mapper required 100% passed.
- Independent Reviewer approved bounded observation and then the diagnostic follow-up. Fixed
  live-limit bypass, clarified logical-record boundary, and enforced a closed runtime diagnostic
  allowlist. Exact test names and commands are in reports/test-2026-09-04-task-008-observation.md.
- Linux recreated environment passed the actual collector gate. Focused tests passed there,
  including final 28 CSV/observer tests and 21 live-budget/CLI tests. Implemented modules were
  hashed and verified against the container before the diagnostic retry.
- Two bounded live attempts used the same source hash. Retry rejected csv_invalid_encoding in
  category15045028 under its committed euc-kr encoding. Both cleanups left no staged files.
  No full metrics, baseline, policy, dataAsOf assertion, or publication candidate was produced.
- Remaining blockers: DEBT-010 full-body encoding evidence; production source-cut evidence;
  comparable complete observations and measured/reviewed production limits/bootstrap.
- No available find-untested-sources, test-gap-analysis, or assertion-quality tool; bounded pairing
  and assertion review were performed inline and by the independent reviewer. No optional broad
  test expansion remains necessary for the approved implementation scope.


## TASK-008 disk observation continuation

Scope: broad pipeline research modules; research/plan artifacts precede implementation. The named
specialized gap/quality tools are not callable in this environment; reviewed exact assertions inline
and obtained independent Reviewer reruns. First full gate: 500 tests + four browser tests + two axe
scans passed. Reviewer then identified cross-batch pending-buffer accounting; reproduced before
fixing it and added `keeps all retained pending bytes within the cap across consecutive unflushed
batches`. Final repeated verification exited 0: 501 tests, four browser tests and two axe scans. Generated tests cover exact oracle equality,
identity and digest collisions, index corruption, byte/key/pair limits, category range checks, disk
I/O/space failures, memory stops, external scratch ownership and cleanup failure. The approved live observation completed all 195 files / 2,936,760 rows and passed independent
aggregate/audit review. Linux 101 focused tests and final post-ceiling-edit full verification
(501 + four browser + two axe) passed. TASK-008 production source-cut/vocabulary/calibration/JSON
budget/bootstrap inputs remain outstanding; TASK-009 is not activated.
# ADR-017 current continuation

User approval recorded. Final implementation passes pinned full verification: 546 tests in 24
files, four browser smoke tests, two accessibility scans, lint/format/typecheck/build. Coverage:
92.70% statements, 90.41% branches, 94.78% functions, 95.04% lines; mapper 100% gate passes.
Reviewed assertions against the checklist; red/green V1 partial-hash regression prevents silent
V2-to-V1 fallback. Independent code review approved after adding pre-parse byte bounds; both
exact-bound and next-byte tests were red/green. Reviewer reran 159 focused tests and verified
deterministic report/audit/implementation bindings. A final whole-envelope preservation assertion
was added to the existing derivation case; its 19-test suite and typecheck passed. Exact test names and remaining
whole-goal boundaries are in `reports/test-2026-09-04-task-008-vocabulary.md`.

## TASK-012 — 2026-09-05

In progress. No TASK-012 verification result claimed yet.

### TASK-012 completion

All S01–S10 requirements have concrete passing assertions; see reports/test-2026-09-05-task-012.md.
Final pinned verify:full passed 581 tests, eight browser tests and two accessibility scans;
independent Reviewer Approved after checking assertion quality and gaps. Status/source reference
types, invalid-query no-scan, numeric fallback and inherited browser sentinels were verified.
No existing TASK-008 artifact was overwritten or restored.
