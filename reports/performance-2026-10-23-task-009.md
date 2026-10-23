<!--
Purpose:        Record exact-source TASK-009 performance diagnostics and the bounded checkpoint optimization
Owner:          Implementer / Performance Engineer
Update Trigger: When the bound patch, measurements or remaining acceptance gates change
Harness Version: 1.1
-->

# TASK-009 full-source performance checkpoint — 2026-10-23

The exact 2,951,024-record source replay succeeds. The bounded cooperative-scheduling patch
reduces observed desktop search times, but the broad-district and partial-address samples still
exceed 500 ms. TASK-009 performance acceptance remains open. This report grants no publication,
backup, recovery, physical-mobile or hosted-performance acceptance.

Requirements: FR-02/03/07/08/12/13/14; search and loading performance NFRs; existing AC-009 release gates.
Only TASK-009 is active. TASK-028 remains paused and TASK-010 follows sequentially.

## Source and code identity

Remote main was freshly read as `5e656005f9dbe2bdd0346c4ddaa4868a0c1d20fc`.
The original preparation was built at `bc7c3d3a43580084e6a1c7f3684c48b84cf802ca`.
All 185 runtime/configuration bindings matched that preparation before modification.
The final proposal differs in precisely `src/search/compact-search.ts` and its test; the other
183 bindings remain equal.

| Binding | Value |
| --- | --- |
| Original source ZIP | 217,307,219 bytes; SHA-256 `c90758c2d3922e78d636ab2c9967b80c690bdcd8aeca283cf9f6ecc2cc992352` |
| Original observation | 356,005 bytes; SHA-256 `3d23a3c770b24039a6690f2db8022eb610ffb5b56a9efee031f78b78918b4626` |
| Categories / records | 195 / 2,951,024 |
| Collection / source coverage | `2026-10-16T01:52:52.043Z` / null, unverified |
| Compact manifest SHA-256 | `1f5ec4815d7412021ee9b7a6703ee8c3141ab853479413e5d7d1ea9f2f7f06c1` |
| Manifest / compact JSON bytes | 172,739 / 691,007,974 including manifest |
| Compact inventory | 361 search + 361 evidence + 1 dictionary assets |

The offline diagnostic rehashed the two original inputs, rechecked every complete extracted CSV's
bytes, SHA-256 and row count against the original successful Ubuntu observation, streamed all
195 categories through the production parser/stager/compact codec with unchanged approved
configuration, and required exact baseline metrics. The resulting manifest equals hosted preparation.
Python ZIP extraction is a diagnostic adapter following the existing local research pattern; it
does not replace or attest the production Linux Info-ZIP inspection. No raw source or generated
compact asset is committed.

The baseline and proposal App research builds use the real complete compact snapshot and the
existing Worker/UI. They replace only the example loader in the diagnostic build and append a
local visible timing panel. The measured proposal and the final rebuild have byte-identical
HTML, CSS, page JS and Worker JS; the final rebuild updates the binding of the strengthened test.
Their four files total 93,017 bytes including diagnostic instrumentation. The final code/build
bindings are in [performance-final-build.json](task-009-2026-10-23/performance-final-build.json).

## Observation method and limitations

Desktop Chrome loaded the research build through the user's already-running Vite server on
port 5199. No new listener, dependency, external service, source/status rule or deployment setting
was introduced. The example-data user tab is separate and is not measurement evidence.

The local wrapper observes Worker round trips and then two animation-frame opportunities,
checking that the result region has layout. Search fixtures were submitted using the actual
search form. Only fixed fixture IDs and timings/counts enter the evidence; no user behavior is
collected. This instrumentation is outside shipped product code. Two frames are a diagnostic
render opportunity, not physical-screen paint proof. No percentile is inferred.

All six proposal searches report visible state at start, reply and frames. Loading began hidden
and both loading samples were uncontrolled; browser-tab changes and automation delays mean they
cannot establish cold/warm loading, LCP, a network/device budget or improvement in initialization.
No browser memory measurement or complete request-level privacy trace was taken.

Current tools cannot access physical-device inventory: CoreDeviceService initialization timed
out. Local listener creation and the existing container connection return EPERM. These conditions
are retained as environment limits, not bypassed. No physical-mobile or hosted full-data
performance pass is claimed.

## Observed search results

Values are elapsed milliseconds from form submission through two frame opportunities.
The same complete data and fixed query order are used. The single-sample name/address/absent
rows and three broad samples are descriptive; JIT, temperature and background variation remain.

| Fixed fixture | Complete similar candidates | Baseline | Checkpoint proposal | 500 ms observation |
| --- | ---: | ---: | ---: | --- |
| Broad district, run 1 | 323,695 | 1,030.0 | 725.2 | Exceeds |
| Broad district, run 2 | 323,695 | 882.9 | 757.8 | Exceeds |
| Broad district, run 3 | 323,695 | 785.2 | 675.6 | Exceeds |
| Business name | 1,282 | 671.5 | 450.4 | Below in this sample |
| Partial address | 32,399 | 673.6 | 564.3 | Exceeds |
| Absent | 0 | 646.5 | 421.8 | Below in this sample |

Worker reply times alone remain 651.6–733.7 ms for the broad query and 530.7 ms for the
partial address, independently demonstrating those observed misses before render completion.
All eligible counts are zero for these deliberately partial fixtures. Candidate counts are
unchanged, and no posting cutoff, sampling, data pruning or result cap was introduced.

Baseline ready round trip was 69,584.7 ms (load 25,315.5; prepare 44,197.5).
Proposal ready round trip was 71,960.9 ms (load 33,112.4; prepare 38,795.9).
These are uncontrolled observations, not comparable acceptance measurements. The delayed
baseline two-frame endpoint was 111,907.3 ms and is retained in the raw evidence.

Direct DOM/AX checks confirmed real candidates, the explicitly labeled October 16 collection
date, unverified source coverage, the age-seven warning, and raw/processed status with source/date.
The final absent result explicitly states that absence does not imply closure.

## Diagnosis and bounded change

The original implementation queues a task at every 512 prepared rows, 2,048 searched rows and
8,192 merge comparisons, even when little time has elapsed. A Node CPU/event-loop probe found
substantial scheduling idle time. Its second, JIT-warmed diagnostic run substitutes setImmediate
inside that Node process only; it cannot establish a browser speedup or exact causal effect.
Identifiers are not globally sorted, so a sorted-identity shortcut was rejected.

The patch preserves the first asynchronous cancellation boundary in each phase and checks
cancellation at every original batch boundary. Subsequent boundaries queue a task after actual
work consumes an eight-millisecond slice. The timer resets after resumption so suspension time
does not count as work. Existing scheduler.yield/setTimeout fallback, complete scan/ranking,
atomic accepted-result replacement, Top-3 and every 20-item page retain their semantics.
The slice is a scheduling target checked at existing batches, not a hard per-row latency promise.

This is a useful bounded optimization, not sufficient evidence that the performance task is
complete. Further profiling of broad/address scoring and ranking must precede a larger change.

## Verification

- Test-first scheduling regression failed against baseline for the intended reason:
  26 scheduled tasks exceeded the bound of four with a frozen work clock. Six existing tests passed.
- Final compact search/ranking/compact loading/freshness run: 48 tests passed in four files.
  Complete 4,500-row reverse-ID oracle parity checks every field across all 225 pages.
- A progressing-clock test cancels only at the second scheduled task of a subsequent absent
  scan and verifies that the last accepted result is unchanged. Existing cancellation cases pass.
- Scoped Biome checks, TypeScript no-emit and whitespace checks pass.
- Full Vitest comparison: baseline 1,429 passed / 3 failed; proposal 1,431 passed / the same
  3 failed. Local macOS tar lacks GNU --hard-dereference; two existing Info-ZIP adapter cases
  also fail on this platform. Tests were neither skipped nor altered to manufacture a pass.
  This full-suite run preceded the final test-strengthening edit; the final four-file run covers it.
- Unchanged search-quality checks pass: synthetic exact Top-3 28/30 (93.33%); source-sample
  98/100 (98%); no safety failures. These are the existing corpora, not full-population accuracy.
- Canonical supported Ubuntu verification and final-head remote checks remain separate from
  this local evidence.

Diagnostic helpers and raw logs remain local under the dated research directory and /tmp.
Some helpers were formatted after baseline execution; recorded execution hashes identify the
executed versions. Do not equate those hashes with later formatted helper text.

## Remaining sequence

1. Keep TASK-009 active. Resolve the observed broad/address misses; obtain controlled physical/
   mobile/hosted full-data performance and final-head supported verification/review.
2. Only after the existing gates pass, prepare a fresh current-main candidate and perform
   protected first publication. The old successful preparation cannot acquire its skipped
   deployment later; it expires at 2026-10-24T02:35:18.721Z.
3. Verify every public file and successful deployment history. Complete durable backup,
   redownload/adoption and recovery independent of the expired original artifact.
4. Continue TASK-010 and collect the real 30-day refresh success history (>=95%).
   Thirty-day history is not a prerequisite for first publication.

No deployment, schedule activation, recovery authority or task completion is recorded here.

Evidence: [Node replay](task-009-2026-10-23/performance-node.json),
[baseline build](task-009-2026-10-23/performance-lab-build.json),
[baseline browser](task-009-2026-10-23/performance-browser.json),
[proposal browser](task-009-2026-10-23/performance-browser-after.json),
[scheduling probe](task-009-2026-10-23/performance-scheduling-profile.json),
[verification bindings](task-009-2026-10-23/performance-verification.json).
