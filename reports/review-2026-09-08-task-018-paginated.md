<!--
Purpose:        Independent review of approved pagination and final result-page measurements
Owner:          Reviewer
Update Trigger: When pagination, measurement assertions, or verified evidence changes
Harness Version: 1.1
-->

# TASK-018 pagination and result-page performance review

Verdict: **Approved**. The approved bounded implementation and measured result-page targets
pass. No blocking review finding remains. Production performance and release readiness are
not certified by this verdict.

## Scope and acceptance

Reviewed the latest user-approved continuation in the reused `codex/task-018-performance`
checkout: SearchResults pagination, submission reset key, styling, component/browser/axe tests,
and the updated browser performance harness/driver. Earlier reviewed search optimization and
partition loading remain the baseline; their historical evidence is preserved.

The explicit design keeps primary/Top-3 results visible and pages similar candidates in groups
of 20, preserving the full calculated ranking, ambiguity/conflict behavior and candidate access.
Related requirements are FR-03/FR-07/FR-11/FR-16 and PRD 14.2. The approved timing contract is
complete search plus the first visible page, with next/last/previous/first page changes also
within 500 ms. It does not require simultaneous construction of every candidate card.

Reviewer did not access the human handbook, modify implementation/tests, or run heavy checks
during measurement. This review report is the only file written in this review phase.

## Findings

**P2 resolved: common-name page identities were not distinguishable in the initial oracle.**
The first version of `tests/performance/browser.tsx` compared only business-name headings.
Every common-name candidate shares that value, so stale or incorrect 20-card pages could
pass the claimed identity/order check. The corrected oracle retains full expected records
and compares article labels containing the name, distinguishing address and absolute position,
including Top-3 and page offsets. A wrong common-name slice now disagrees with the oracle.
The provisional run is excluded; final acceptance uses the complete rerun with this fix.

No remaining actionable correctness, regression, security or test-coverage defect was found.

## Implementation assessment

- Correctness: The full search result remains intact; slicing occurs only for visible similar
  cards. Page boundaries preserve order and absolute candidate positions, while list set
  positions describe the full similar-candidate set. All candidates remain reachable using
  the controls. Primary/Top-3 rendering and uncertainty copy remain unchanged.
- Reset and focus: The submission sequence key resets page state for new and repeated queries.
  Dataset replacement removes obsolete results. Page changes focus the similar-results
  heading; the live status provides total/range/page. Native buttons express boundary states.
- Accessibility and privacy: Controls have explicit labels, bounded layout and native keyboard
  behavior. Tests cover focused page changes, ordered traversal, small results, resets, first
  and final page axe scans, and no page-navigation requests. No query-dependent URL, source
  rule, dependency, storage or network operation was added.
- Measurement integrity: Every search is attempted, including the eight previously skipped
  large-count cells. Full counts and expected visible card identities/order are verified before
  timing ends. Applicable navigation exercises all four declared actions and checks focus.
  Single-page results have no navigation metric because controls do not apply, rather than
  receiving an invented zero or masking a skipped search.

## Independent verification

After the final benchmark completed, Reviewer independently ran:

`PATH=/tmp/open-store-task013-runtime:$PATH npm exec vitest run src/app/pagination.test.tsx`

Result: **4 tests passed**, exit 0. `git diff --check` passed.

An independent Node assertion pass recomputed the final JSON summaries without using the
implementation's metric helpers and checked:

- All **92** recorded source/config/tool hashes match current files.
- All **96** metric groups match raw counts, minima, nearest-rank median/p95, maxima and
  applicable budget verdicts.
- The six profile/scale workloads retain five samples each. All **24 search cells** and
  **120 search samples** pass. No search result is unavailable or omitted.
- All **16 applicable navigation groups**, containing **320 transitions**, pass. Each measured
  sequence has the declared next/last/previous/first labels and expected destination pages.
  Visible card counts and complete candidate totals match every destination, including tails.
- The other eight query/profile/scale groups have at most 20 similar candidates and no page
  controls. Their search timing still exists and passes.
- Fixture hashes/byte counts, profiles, network conditions, scales and repetitions match the
  preceding optimized evidence. HTML/CSS/JS assets sum to **49,377 bytes**.
- All startup metrics pass; `labTargetsMet` is **true**, while `productionVerified` remains
  **false**. The performance report's rounded table agrees with raw observations.

Final formatted measurement JSON SHA-256:
`64da2bbfa215d1706690bc7b660f400051a43ce6091685feba140e623748f4b8`.
Reviewer also confirmed the historical audit and optimized JSON hashes remain unchanged.

Reviewer inspected `/tmp/task018-pagination-full.log`: **598 Vitest tests**, **68 browser
checks**, and **20 accessibility tests** passed. The matrix contains **26 zero-violation axe
scans**. Coverage is 92.89% statements, 92.41% branches, 96.23% functions and 94.99% lines.
Existing quality gates remain unchanged. The full run preceded the oracle-only correction;
the implementer then passed typecheck/targeted lint and reran the entire benchmark successfully.
Product/test code remained unchanged after the full run. Reviewer did not duplicate the full
suite or benchmark. No new manual screen-reader observation is claimed.

## Verified outcome and limits

The worst mobile complete-search-plus-first-page sample is **182.8 ms** at 50,000 exact-query
records; the corresponding address result is **158.7 ms**. The worst mobile navigation sample
is **46.9 ms**. These observed maxima satisfy the inclusive 500 ms target without excluding
the former large-result cells. Mobile cold search readiness is **1,071.9 ms** and LCP maximum
is **660 ms**; initial code also remains below 300,000 bytes.

The former 1,410.8 ms address result instantiated every card. The new 43.5 ms 1,000-row address
result displays its first page. This is the explicitly approved behavior change, not evidence
of constructing the same full DOM faster. All candidates remain calculated and accessible.
The larger fixtures measure the four representative navigation actions, not the latency of
visiting every intermediate page individually. The smaller regression traverses all 47
candidates, while component checks cover order, positions and page boundaries.

Five samples and host-relative mobile CPU/network emulation establish only this bounded local
lab result. The two-frame/layout endpoint is a paint opportunity, not physical pixel timing
or INP. Startup uses actual synthetic asset requests; scale search mounts complete datasets
directly. Total data transfer, full-index preparation, real partition contracts, Pages/CDN,
physical mobile devices and production distributions remain outside this performance claim.

## Closure decision

The approved pagination acceptance and all declared local code/startup/result-page/navigation
budgets are satisfied. TASK-018 may be closed for this bounded continuation after the owner's
final documentation updates. Production/release evidence gates remain open, TASK-008 stays
on hold, and this review authorizes no subsequent task, merge or deployment.

Evidence: [final performance report](performance-2026-09-08-task-018-paginated.md),
[raw final measurements](performance-2026-09-08-task-018-paginated.json),
[preceding optimized review](review-2026-09-08-task-018-optimized.md), and
[original audit review](review-2026-09-08-task-018.md).
