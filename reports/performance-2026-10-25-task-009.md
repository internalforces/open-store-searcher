<!--
Purpose:        Record current-main verification and complete-data browser diagnostics
Owner:          Performance Engineer / Tester
Update Trigger: When measured inputs, results, or remaining acceptance gates change
Harness Version: 1.1
-->

# TASK-009 current-main performance continuation — 2026-10-25

TASK-009 remains the sole active task. TASK-028 stays paused, TASK-010 follows sequentially,
and TASK-021 remains gated. This continuation preserves the approved October16 source,
quality inputs, status rules, complete-search semantics and publication boundaries.

## Environment and verification

- Repository: `abe4b0a6ec89cd25b687c946186c5ebd6ad2f21e`, merged PR41.
- Exact-main hosted Verify [39943753135](https://github.com/internalforces/open-store-searcher/actions/runs/39943753135)
  completed successfully. Job120381232820 confirms pinned Node/npm, dependency installation,
  pinned browsers, `verify:full` and the packaging/operator suite. This is a readback of the
  existing successful run, not a newly dispatched workflow.
- Local Node24.19.0/npm11.9.0 on Debian; local npm is not the pinned11.17.0.
- Local lint, formatting and types passed before adding the diagnostic helper.
  Coverage execution ran1,436tests:1,434passed and two Info-ZIP integration tests failed.
  They explicitly execute Debian `/usr/bin/unzip`, which lacks the approved `-O UTF-8` option.
  No tests were skipped, rewritten or weakened. No successful local full-suite/coverage gate is claimed.
- All102Node packaging/operator tests passed. Production build and both existing search-quality
  checks passed. Search quality remains bounded-corpus evidence, not whole-population accuracy.
- System Chromium154.0.8037.57 passed all66desktop/mobile-emulated UI/accessibility tests through
  a temporary configuration with the original tests and two workers. This is supplementary
  Chromium evidence, not a local pinned-Chromium/Firefox/WebKit full-suite pass or actual spoken AT.
- The Playwright-pinned browser download was explicitly rejected with403`Domain forbidden`.
  The already-installed system Chromium was used for supplementary diagnostics; no network-policy
  workaround or browser-version substitution in the canonical configuration was made.

Old root-owned coverage/build/browser outputs were preserved under locally ignored
`.task009-preserved-*` directories after the initial coverage cleanup failed. Production code,
dependencies, test expectations and tracked configuration remain unchanged.

## Source and private replay

The exact approved Release source assets were downloaded into private scratch storage.
Both complete SHA-256 values match `publication/initial-import-approvals.json`:

| Input | Bytes | SHA-256 |
| --- | ---: | --- |
| Original ZIP |217,307,219|`c90758c2d3922e78d636ab2c9967b80c690bdcd8aeca283cf9f6ecc2cc992352`|
| Historical observation |356,005|`3d23a3c770b24039a6690f2db8022eb610ffb5b56a9efee031f78b78918b4626`|

Debian's Info-ZIP was rejected before staging. The Ubuntu package
`unzip_6.0-28ubuntu4.1_amd64.deb` was obtained from `archive.ubuntu.com`, extracted into private
scratch storage, and selected only through the replay command's PATH. `/usr/bin/unzip` was not
replaced. The unmodified production initial-import operator runs in explicit `local-proof` mode;
no hosted identity, remote source adoption, public deployment or recovery authority is created.
The existing read-only `node_modules` also produces nonfatal Vite dependency-cache EACCES diagnostics;
these are retained separately from the command's eventual exit status.

The unmodified local-proof operator completed successfully for all195categories and exactly
2,951,024records, using unchanged approved quality inputs. The compact manifest is still
`1f5ec4815d7412021ee9b7a6703ee8c3141ab853479413e5d7d1ea9f2f7f06c1`.
The complete691,824,640-byte tar passed packaging validation, was independently extracted,
and the current production inspector verified all730files. Extracted identity equals the prepared
identity, and the complete inventory binding matches:
`5a085336aab21b8d74f1d79066088e22e861c21115f48a465618e45fb68f4ca1`.
Tar SHA-256 is `7f635dabb582147f188403f1464065375043aaa44a15532946132de377d6d2c6`.
This private artifact is explicitly `local-proof`, with null hosted run/precondition; it is not
an authorized hosted deployment candidate. The new diagnostic helper was added after this
operator completed; no previously bound application/pipeline/configuration bytes were changed.

## Measurement method

`scripts/measure-full-data-browser.mjs` serves a complete privately verified built site over
loopback. It hashes every site file, records the exact release, observes complete Worker readiness
and its load/prepare timing, measures fixed fixture submissions through two frame opportunities
and result-region layout, and records instantaneous browser-process RSS/PSS plus main-page JS heap.
The helper does not modify shipped application bytes or collect real user searches or clicks.

Each profile uses a fresh browser context, a cleared cold cache, then a cache-enabled warm
navigation. Three observations are retained for each fixed district/address/name/negative-intent fixture.
Mobile emulation uses Pixel5viewport/device settings and page-CDP CPU throttling at4x; Worker
throttling is not independently verified. Networking is unthrottled loopback. Cold/warm behavior
and all24search observations were first exercised with the separate synthetic demo fixture;
fixture results are not accepted as full-data performance evidence.

RSS sums double-count shared pages. PSS apportions shared pages, when accessible; unavailable
metrics are null, never zero. Both are instantaneous snapshots, not peak memory. Main-page JS heap
excludes the search Worker. Two frames/layout are not physical-screen paint proof. Single cold
and warm loads are diagnostic samples, not percentiles, hosted network results or real-phone evidence.

## Results and remaining gates

The measurement completed without page errors or renderer crashes. All four loads independently
confirmed exactly2,951,024Worker records and the expected manifest hash. Every recorded search
has result-region layout, with candidate counts consistent across all repetitions and both profiles.
This environment does **not** pass the500ms complete-search target. No performance gate is closed.

The environment is system Chromium154 on an AMD EPYC7763virtualized host with5logical CPUs and
about17.6GiB reported RAM (the container memory limit is16GiB). The conservative sum of every
site HTML/CSS/JS file, including Worker code, is113,811bytes, below300KB. This does not excuse
the very large data transfer, preparation time or browser memory.

| Profile/cache | Shell LCP ms | Search-ready seconds | Worker load seconds | Worker prepare seconds | Browser PSS GiB |
| --- | ---: | ---: | ---: | ---: | ---: |
| Desktop/cold |152|106.165|15.451|90.529|3.253|
| Desktop/warm navigation |68|105.810|14.695|91.014|3.234|
| Mobile emulation/cold |360|107.679|14.751|92.468|3.331|
| Mobile emulation/warm navigation |168|108.408|15.347|92.806|3.139|

These LCP samples describe the initial shell before interaction, not full-data readiness or a
hosted/mobile LCP pass. Main-page JS heap is only about1.7–2.1MiB and excludes the large Worker;
using that heap alone would materially understate memory. Browser-process RSS is3.40–3.59GiB;
PSS is3.14–3.33GiB at the measured instants, with no unavailable PSS entries. Neither is peak memory.

The cache-enabled warm navigations still generated726server requests with a sum of response
Content-Length values of691,030,227bytes. Cold loads generated728requests/691,121,785bytes.
The helper did not intercept routing (which would disable HTTP caching); the synthetic control
produced zero server requests on warm navigation. Thus this full-data warm observation cannot
be presented as a successful all-data cache hit or a second-load speedup. It does not isolate
the reason for the full-data cache behavior or predict GitHub Pages caching/compression.

| Fixed fixture | Candidates | Desktop ms, all3samples | Mobile-emulated ms, all3samples |
| --- | ---: | --- | --- |
| District `"강남구"` |323,695|673.2 /659.9 /666.2|886.4 /942.3 /964.9|
| Address `"테헤란로"` |32,418|353.3 /320.9 /320.5|538.5 /426.7 /423.9|
| Name `"스타벅스"` |1,282|598.0 /586.7 /590.0|720.7 /686.4 /698.9|
| Negative intent `"존재하지않는고정검증상호XYZ"` |10|461.2 /475.4 /470.3|507.0 /510.0 /1,858.0|

The last fixture was originally labeled `absent` by the helper, but actually returned10candidates.
It is **not** an empty-result observation, and no zero-result performance acceptance is claimed.
The original raw labels, counts, timings and executed helper are retained unchanged. The current
helper changes that label to `absence-intent`; its query and measurement behavior are unchanged.
An actual zero-candidate fixture still needs source-bound verification. The mobile1,858ms sample
is retained without trimming or assigning an unverified cause. These are descriptive samples,
not percentiles or a causal comparison to the October23Mac measurements. The partial-address
fixture also differs from that earlier report and must not be treated as an identical-query comparison.

## Bottlenecks and next work

The measured `CompactSearch.prepare` phase consumes roughly85%of search-ready time, while
data load/validation consumes about15seconds. Preparation and instantaneous browser memory
therefore take priority over further cosmetic or code-bundle changes. Function-level CPU/heap
profiling is still needed before attributing that phase to a specific parser, map or allocation.
The scan/predicate/sort phases of district and name searches also need separate profiling.

Continue TASK-009 by profiling preparation and those searches on this exact immutable snapshot,
then implement a measured, lossless change with complete ranking/page parity, cancellation and
source/date/status evidence preserved. Reuse the verified private data when rebuilding app code;
do not repeat original collection or weaken validation. Check actual zero-result fixtures before
further negative-case claims. A change to data delivery or a public contract remains subject to
the existing constitution; this report approves no such change. Physical-device access remains
unconfirmed, and no response to the device-availability question is assumed.

Physical/mobile/hosted full-data acceptance, independent final acceptance, first publication,
complete public-byte equality, durable backup/redownload/adoption and expired-original-artifact
recovery remain open. The October23 hosted preparation expired October24 at02:35:18.721Z;
its skipped deployment cannot be resumed. A fresh current-main hosted candidate is still required
after the existing performance gate. Collection stays October16; source coverage remains
null/unverified, and the seven-Seoul-calendar-day delay warning remains mandatory.

No deployment, operational dispatch, schedule/permission change, source/status policy change,
task completion or milestone acceptance occurs in this continuation. TASK-010 retains its later
actual30-day reliability requirement.

Evidence: [hosted readback](task-009-2026-10-25/hosted-verification.json),
[local suite](task-009-2026-10-25/local-verification.log),
[Node suite](task-009-2026-10-25/node-tests.log),
[supplementary Chromium](task-009-2026-10-25/system-chromium-e2e.log),
[build](task-009-2026-10-25/build.log),
[quality](task-009-2026-10-25/search-quality.log).

Complete-data evidence: [browser measurements](task-009-2026-10-25/full-data-browser.json),
[measurement log](task-009-2026-10-25/full-data-browser.log),
[executed helper bytes](task-009-2026-10-25/executed-helper.mjs.raw),
[local preparation](task-009-2026-10-25/local-preparation.json.raw),
[source receipt](task-009-2026-10-25/source-import.json.raw),
[verified inventory](task-009-2026-10-25/verified-inventory.json.raw),
[verified identity](task-009-2026-10-25/verified-identity.json.raw),
[source replay log](task-009-2026-10-25/source-replay.log).
Raw receipt/inventory/helper files retain their exact bytes under `.raw` extensions.
Console `.log` files normalize trailing horizontal whitespace and extra terminal blank lines;
no observations, diagnostics or numeric values are removed by this presentation cleanup.
Final lint, formatting and whitespace checks pass; the five existing informational lint notices
remain nonblocking and unchanged. The [evidence consistency check](task-009-2026-10-25/evidence-check.json)
verifies all185original code/config bindings against current files, all730site bindings,
the exact archived helper hash, receipt/inventory/identity equality, four complete Worker loads
and24layout-verified samples. The current helper is byte-identical to the archived executed helper
apart from the disclosed fixture-label correction. These checks establish provenance consistency,
not acceptable performance or actual device/hosted behavior.
No new independent acceptance review is claimed by this diagnostic continuation.
