<!--
Purpose:        Independent review of approved search optimization and partition loading
Owner:          Reviewer
Update Trigger: When implementation, verification, or comparative evidence changes
Harness Version: 1.1
-->

# TASK-018 optimization and partition loading review

Verdict: **Approved** for the user-approved implementation. No blocking correctness,
regression, security, or test-coverage finding remains. This verdict does not certify all
performance targets, production data delivery, physical-device performance, or release readiness.

## Scope

Reviewed the continuation in the reused `codex/task-018-performance` checkout against
`1b570a2`, including search/index changes, partition loader and cancellation lifecycle,
separate synthetic assets, App/browser entry wiring, tests and final evidence. The earlier
audit and its report remain historical evidence for the previous implementation.

The active approval covers equivalent search computation and fixed, query-independent
partition loading. Related requirements are FR-02/FR-03/FR-07/FR-12/FR-13, PRD 12.2/14.2,
and preservation of FR-11/FR-16. Pagination, production publication contracts and status
mapping remain outside scope. Reviewer followed the constitution and review standards and
did not access the human handbook. Only this report was written in this review phase.

## Findings and review assessment

- Search correctness: Approved. Substring rejection precedes expensive segmentation without
  changing the inclusion condition. Partial matches still require two graphemes; stopping
  at the second preserves that threshold. Redundant literal comparison is skipped only where
  it cannot activate fallback. Cached address tokens and per-query numeric flags preserve
  whole-number matching. Scores, reasons, conflict handling and ordering remain unchanged.
- Snapshot safety: Approved. Fixed batches preserve declared part order and return only after
  all parts finish. The existing validator/index operates on the entire assembly, preserving
  cross-part duplicate exclusion. Failed or obsolete loads abort active work, prevent later
  batches and cannot replace the previous usable snapshot. Empty and malformed parts have
  explicit distinct behavior and tests.
- Privacy and delivery: Approved within the synthetic scope. Build-managed asset URLs contain
  no input-dependent component. Requests omit credentials and referrers. Loading does not
  accept a query or expose partially loaded results as a complete search. No new dependency,
  workflow permission, production endpoint or source/status rule was added.
- Test quality: Approved. Deferred scheduling, global duplicates, failure/retry, cancellation,
  old-data retention, real built requests and Unicode/numeric boundaries are exercised.
  Existing browser changes add enabled-submit waits before post-load assertions; privacy,
  keyboard, statuses, layout and accessibility assertions are retained. Dedicated partition
  tests still deliberately hold data pending and require disabled search/no partial cards.
- Evidence accuracy: Approved. Reports distinguish CPU improvements from remaining DOM cost,
  preserve unavailable measurements, and disclose increased initial code bytes, JSON transfer
  and search-ready delay. They do not describe the scale benchmark as partition-download timing.

No actionable implementation defect was identified. The unresolved performance conditions
below are measured product limitations, not false passes hidden by the implementation.

## Independent verification

After performance measurement ended, Reviewer independently ran:

`PATH=/tmp/open-store-task013-runtime:$PATH npm exec vitest run src/app/partition-loader.test.tsx src/search/search-optimization.test.ts src/app/pr16-regressions.test.tsx`

Result: **17 tests passed**, three files, exit 0. `git diff --check` also passed.
Reviewer did not repeat the browser benchmark or full suite and launched no heavy verification
during the implementer's measurement runs.

An independent Node assertion pass verified the optimized raw JSON against current files and
raw samples without using the implementation's metric helpers:

- All **91** recorded implementation/config/tool hashes match current files.
- All **80** timing groups match recomputed counts, minima, nearest-rank median/p95, maxima
  and applicable budget verdicts. Each startup/workload group retains five observations.
- Every scale fixture hash and serialized byte count matches the baseline. Profiles, network
  conditions, scale sizes and repetition counts also match.
- Actual attempted candidate counts, search-only expected counts, and capped null measurements
  match the declared workload. There are **13 passing**, **3 exceeded**, and **8 unavailable**
  loaded-search cells. Both `labTargetsMet` and `productionVerified` remain false.
- The bundle asset sum is **48,118 HTML/CSS/JS bytes**, with **5,331 separate JSON bytes**.
  Each startup observation includes all three JSON resource URLs. Reported table values match
  the rounded raw observations.

Optimized measurement JSON SHA-256:
`ce0f7955b118f28cf9b49e3fd6145d1e4d355b97fb3dd2dc36dacc628f38f4f8`.

Reviewer checked the equivalence evidence's baseline engine hash against Git `1b570a2`,
the optimized engine hash against current source, and both corpus hashes/record counts.
Independently rebuilding the documented deduplicated query sets yields **77 synthetic** and
**4,407 source-fixture queries**. The implementer's replay reports all **4,484 complete
results equal**, including candidate fields/reasons/order/diagnostics. Its reproducible
procedure is documented in the performance report. Reviewer inspected that procedure and
the matching evidence bindings but did not rerun the entire equivalence replay.

Equivalence JSON SHA-256:
`eec9076b93af61c88cb79e2bfd9ad1b840a14642d0865f8fb06c938d29507ae3`.

Reviewed `/tmp/open-store-task018-optimized-final-verify.log`: **594 Vitest tests**,
**64 cross-browser checks**, and **18 accessibility tests** passed, with **22 zero-violation
axe scans**. Coverage is 92.83% statements, 92.39% branches, 96.17% functions and 94.94% lines.
Existing synthetic/source recall remains 28/30 and 98/100. The implementer reports full-command
exit 0 and benchmark `--check` exit 1; the independently validated budget verdicts explain
that expected nonzero benchmark exit.

## Performance and release limitations

The observed worst 50,000-row mobile search-only maximum improves from 1,817.6 to 146.6 ms.
Candidate counts remain unchanged. Display still exceeds 500 ms for mobile 1,000-row exact
(1,371.1 ms), 1,000-row address (1,410.8 ms), and 50,000-row common-name (690.2 ms).
Exact/address display at higher scales remains unavailable above the unchanged 1,000-card
harness cap. Mobile 50,000-row preparation still reaches 2,056.1 ms.

The tiny synthetic application now has 312 more initial code bytes and 5,331 separate JSON
bytes. Mobile cold search-ready maximum increases from 701.2 to 1,078.2 ms; LCP maximum
remains 668 ms. Both startup targets still pass. The delivered loading benefit is deferred
code/data separation with bounded, complete loading, not less total transfer or faster
readiness for this six-record demo. Cached address tokens also increase retained index memory.

Startup exercises actual fetching; scale queries continue to mount full datasets directly
for a comparable loaded-search test. They do not measure large partition download time.
Five local samples, host-relative CPU throttling, finite LCP observation and a paint-opportunity
endpoint do not establish field percentiles, INP, pixel presentation or physical mobile results.
Production dataset/partition contracts, Pages/CDN behavior and full-data rendering remain open.
No new manual assistive-technology observation is claimed.

## Acceptance

The approved search optimization and synthetic partition mechanism meet their bounded
implementation acceptance: semantic boundaries are preserved, loading is complete and safe,
real separate assets are verified, comparative evidence is retained, and applicable checks
pass. The implementation may be marked complete after the owner's documentation updates.
Performance/release acceptance must remain open for exceeded/unavailable results and missing
production evidence. TASK-008 stays on hold; this approval activates no further task and
authorizes no merge or deployment.

Evidence: [optimized performance report](performance-2026-09-08-task-018-optimized.md),
[optimized measurements](performance-2026-09-08-task-018-optimized.json),
[equivalence replay](equivalence-2026-09-08-task-018.json), and
[historical audit review](review-2026-09-08-task-018.md).
