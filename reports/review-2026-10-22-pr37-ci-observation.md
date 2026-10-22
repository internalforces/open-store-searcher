# PR #37 hosted failure observation review

Date: 2026-10-22
Base HEAD: `5524090793ffcffcabc8d81dc2925ea0a42d7fe5`
Verdict: **Approved for intentional hosted failure observation only.**
Open code findings: **0 Critical, 0 Important, 0 Minor.**

Reviewed file SHA-256 values:

| File | SHA-256 |
|---|---|
| `tests/setup/failure-observation.ts` | `fa5bdc6dde61a44a30bd4a7fa7e08b9535eefa95a614d40c264051e4dcee8ab4` |
| `tests/e2e/search.spec.ts` | `32615857347df969d9fc4bf9ab264ce4ae6f7850920a469fcdf6be68457c05dc` |
| `tests/e2e/workspace.spec.ts` | `718699118bf89b69f23e47fbc85e34870c16a2c40701eac8a05ddf645eb98433` |

## Findings and independent checks

**P2 observation/oracle isolation: ADDRESSED.** The original LayoutShift filter/push now runs
first, outside a per-entry diagnostic catch. A diagnostic exception cannot suppress that entry
or later entries in the batch. All three checkpoint lookups/marks are contained separately;
original counter reads, focus dispatch and return values remain outside those catches.

**Minor stack-site allowlist: ADDRESSED.** The filter validates complete candidate URLs against
the exact local origin and asset prefix, flat JavaScript path, and absent credentials/query/hash.
It emits only the sanitized local path and line/column. It no longer accepts arbitrary origins
merely because their stack line contains `/assets/`.

Independently inspected the helper, complete spec diffs, corrected guards, inverse-audit proof,
validation/build records, private smoke sources, guard proof and replacement retry trace.
Computed the reviewed file hashes and verified the 152 current source bindings. The saved
original spec hashes and exact inverse audit support preservation of original assertions,
clock actions, timeouts, evaluation count, dispatch returns, helpers and shared hooks. Static
type/lint/format and collection evidence reports exactly 92 tests. No tests were run by this review.

The load wrappers forward original `this`, arguments, return values, timer/frame IDs and
cancellation; string timer handlers pass through, and fetch returns the native Promise directly.
Observation activates only for the three exact WebKit load/map titles and the one Chromium
decoration title. State selectors match actual App/SearchForm/EvidenceContext/WorkspaceIntro
markup and record booleans rather than input/text. Buffers retain bounded first/latest entries
with drop counts. Target identities and sequence order aid attribution while controlled clock,
native LayoutShift start time and native animation elapsed time remain explicitly distinct.
Reporting/closed-page/cleanup failures are contained and do not replace original outcomes.

## Runtime evidence and limits

Two private smoke commands were executed by the implementer, with the configured built-in
retry policy preserved. **Both commands exited 1; neither is a clean WebKit smoke pass.**

1. `docker exec --workdir /work/pr37-refresh-fix open-store-searcher-task008-research ./node_modules/.bin/playwright test --config .superpowers/sdd/2026-10-22-task-027-prism-glass/pr37-refresh-fix-ci-observation-smoke/playwright.config.ts`
   ran two cases with two workers. Chromium passed on its first attempt. WebKit failed its
   final synthetic Function/sourceURL positive-site assertion on both attempts because all
   recorded sites were empty.
2. The same command with `replacement.config.ts` ran only WebKit with one worker. Both
   attempts failed a later query-script negative-site assertion. The preceding real local
   script positive check and real mismatched-origin `localhost` negative check passed;
   the retained trace confirms execution continued to the third, query-bearing script.

The runtime evidence is adequate for this diagnostic output contract despite those probe
failures. WebKit exercised callback `this`/extra arguments, string timers, native IDs and
cancellation, rAF timestamp, fetch arguments/`this`/Promise identity, initialization/snapshot,
failed JSON output, passing-status silence and deliberate reporter failure preserving the
original error/status. Chromium verified that decoration installs no clock/frame/fetch wrappers.
Executing the actual guarded source blocks with deliberate layout-call and lookup throws
preserved both original shift entries `[0.1, 0.2]`, returns `[7, true, 7]`, and both focus events.
Passive animation/source records and serialization were exercised. Retained retry traces contain
no pageerror events; this is not a claim of a clean first-attempt WebKit pageerror assertion.

All first/retry failures and artifacts must remain preserved. The query-bearing script used
identical code to the prior positive script, and WebKit reported a query-free local location.
The available evidence does not distinguish browser URL omission/location reuse from other
source-attribution behavior. The parser rejects a query when the candidate actually contains
one, and emitted output contains no query, full URL, provider name, address or input value.
**Site records are advisory stack locations:** they do not prove the originating resource URL
had no query or uniquely identify which request supplied duplicate code. No additional raw-frame
probe or speculative parser/product fix is required for the approved output contract.

## Scope and remaining gates

The current PR37 refresh performance manifest remains **152/152** current; the new E2E/helper
files are outside that manifest. The older pre-correction TASK-027 manifest remains historical
at **150/152**. The recorded single build preserves all seven production assets byte for byte.
No application, dependency, workflow, timeout, worker, retry, `failOnFlakyTests`, zero-shift,
zero-replay or other acceptance policy changes are approved here. Instrumentation can perturb
scheduling and may yield incomplete/closed-page observations; lack of a failure record is not
evidence that the underlying boundary is reliable.

Approval permits the coordinator's planned diagnostic delivery and intentional hosted capture
after recording these limits. It does not fix the startup/layout/replay failures, make either
failed canonical attempt pass, satisfy PG-15, supply affected pending-refresh human AT evidence,
complete TASK-027, or approve merge/deployment. Those gates remain open. No source/public/remote
edit, browser execution, performance repeat or handbook access was performed by this reviewer;
this private report is the sole write for this handoff.
