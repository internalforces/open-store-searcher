<!--
Purpose:        Bounded full-source mobile-emulation evidence for TASK-008 compact delivery
Owner:          Performance Engineer
Update Trigger: When the measured source, implementation, device method, or budgets change
Harness Version: 1.1
-->

# TASK-008 full-source mobile-emulation evidence

Status: **Bounded observation complete; practical mobile readiness is not established.** The
initial shell primary meets the unchanged 2,500 ms lab target in this one local run; the fixed
one-second LCP window is within the target but does not establish final standards-style LCP.
Complete readiness takes 49.24 seconds on unthrottled loopback, one broad search exceeds 500 ms,
and the 200,000 B/s observation is still not ready when censored at 60 seconds. This is one
emulated observation, not a percentile, physical-device, hosted or production certification.

Raw evidence: [mobile measurement JSON](performance-2026-09-16-task-008-mobile.json).

## Environment and provenance

The completed run used Node 24.19.0, npm 11.17.0 and Chromium 151.0.7922.34 on macOS 26.6.2,
Apple M3, eight logical CPUs and 16 GiB host memory. The browser context used Playwright's Pixel 5
viewport/device emulation. CDP applied a fourfold host-relative slowdown to the **page target**.
The run did not apply or prove that slowdown on the dedicated search Worker, so Worker preparation
and search timings are not mobile-CPU measurements. The server-side slow phase applied one shared
200,000 compressed-body-byte/s limiter across page and Worker requests; it did not add CDP latency.

The run bound current `da9e63c864a45e2073f75f27aa32ef8370258e85`. A scoped
`git diff --quiet HEAD -- src scripts package.json package-lock.json vite.config.ts` passed before
and after measurement. Documentation and task-state edits made by other agents were outside that
scope. The executed harness SHA-256 was unchanged before and after:
`3388b582ae3813d0c4250cf3de1854d3b4f47d2404319e45e523d81adfd1e9bb`.
After measurement, Biome applied formatting/import ordering and an unused-parameter cleanup without
changing the measurement algorithm. Review also renamed the post-search LCP field in the
harness and delivered JSON from `preInteractionLcpMs` to `postSearchLatestObservedLcpMs`,
without changing its value or taking another measurement. The delivered harness SHA-256 is
`ab48707e5ce9791c93481db075d4352bec00430f49cade6e96ff50aa73908ccf`; the JSON retains the exact
executed hash in its provenance.

The original received source was separately rechecked with
`shasum -a 256 /Users/sonmyeong-gwan/Downloads/dataset.json`: 2,439,358,850 bytes and SHA-256
`34ac368f16a578b3af96cd083d73efe698d7b3ec01f400b5162e37a42f6b85cc`. The measurement did not
replay or transform that 2.44 GB source. Before building or launching Chromium, the harness
streamed and verified the byte length and SHA-256 of the 171,764-byte manifest and every one of
its 719 entries. The verified 720-file compact set totals 688,433,397 raw bytes. Its manifest is
`compact-manifest-62268597c93c053feaa728dcb43e77d6bb1ff395ef815d51aef9eeac63a88943.json`.

The harness built the actual current App and Worker into a new local research site. Built code was
73,244 uncompressed bytes: 405 HTML, 5,505 CSS, 46,158 page JavaScript and 21,176 Worker JavaScript.
The JSON records exact SHA-256 values for all four outputs. No product source, dependency, public
interface, policy, baseline, workflow, setting or deployment changed.

## Current measurements

The initial-content budget is applied to the shell, separately from full search readiness. Primary
timing ends after the heading and input have nonzero layout and two animation frames. Shell LCP is
the latest buffered entry after a fixed additional one-second, noninteractive window. Search and
paging end after the real Worker reply, nonzero result layout and two animation frames; this is a
paint opportunity, not proof that pixels reached a physical screen. Typing time is excluded.

| Metric | Observation | Unchanged target | Verdict |
|---|---:|---:|---|
| Full-run shell primary | 154.1 ms | <= 2,500 ms | Pass, one local sample |
| Full-run FCP / shell-window LCP | 108.0 / 108.0 ms | <= 2,500 ms LCP | Within target in fixed window; final LCP unverified |
| Complete search readiness | 49,238.4 ms | Report separately | Long preparation; no readiness pass claimed |
| Compact fetch/parse/integrity | 15,503.6 ms | Report separately | Observed |
| Worker projection preparation | 33,604.2 ms | Report separately | Observed; Worker CPU was not throttled |
| Broad district search, `강남구` | 566.4 ms | <= 500 ms | **Exceeded by 66.4 ms** |
| Name search, `스타벅스` | 383.5 ms | <= 500 ms | Pass, one sample |
| Address search, `테헤란로 123` | 349.5 ms | <= 500 ms | Pass, one sample |
| District next page | 69.1 ms | <= 500 ms | Pass, one sample |
| Peak Chromium process-tree RSS | 2,955,870,208 bytes | No accepted limit | Observed estimate |

The readiness message reports all 2,939,947 records and the expected manifest hash. The district,
name and address searches returned respectively 322,339, 1,275 and 32,248 similar candidates.
Every search and the page transition caused **zero data requests**. The full local load served
198,460,975 gzip body bytes across 724 completed requests.

The latest buffered LCP entry read after all searches was 50,348 ms. That entry occurred during the
search sequence, so it is interaction-driven and cannot be attributed to readiness or used as
pre-interaction LCP. The raw field is named `postSearchLatestObservedLcpMs`. The fixed shell window
therefore remains a bounded observation rather than a final LCP pass.

Process-tree RSS was sampled once per second from the launched Chromium root through descendants.
The value includes browser, renderer, Worker and utility processes, may double-count shared pages,
and is neither a JavaScript heap peak nor a physical-device memory requirement. The page-target CDP
snapshot showed only 4,424,424 bytes of page JS heap after the searches; it excludes the Worker-owned
compact store and must not replace the process-tree observation.

## Bounded slow-network observation

The slow phase used a fresh Pixel 5-emulated context and the same fourfold page-target CPU rate.
Its server shared one aggregate compressed-body token schedule across all concurrent responses.
At 60,003.3 ms it had released 11,900,204 gzip body bytes, started 48 requests and completed 47.
The Worker was not ready, so the run was deliberately closed and recorded as
`censored-not-ready`; no search was attempted. The shell remained available: primary 243.7 ms,
FCP 200.0 ms and shell-window LCP 200.0 ms.

At 200,000 B/s, the measured 198,433,476-byte compact gzip dataset has a payload-only lower bound
of 992.2 seconds (16.5 minutes), before protocol, latency, parsing, integrity checks or preparation.
The 60-second browser observation delivered about 6.0% of the unthrottled run's gzip body bytes and
confirms the expected direction without spending roughly 17 minutes on a full load. It does not
measure complete slow-network readiness.

## Bottlenecks and decisions

| Environment | Current metric | Bottleneck | Recommendation | Expected effect | Trade-offs |
|---|---|---|---|---|---|
| Emulated mobile shell, page CPU 4x | 108 ms shell LCP | None observed for code shell | Retain the small shell and keep shell paint separate from data readiness | Preserves prompt feedback while data loads | Does not make search usable |
| Unthrottled loopback, complete data | 49.24 s readiness; 15.50 s load and 33.60 s preparation | Full download, integrity work and Worker projection preparation | Keep mobile readiness and physical-device verification open; measure a real target device or verified Worker-target throttle before release signoff | Replaces the current unknown with relevant device evidence | Additional test time; may expose worse results |
| 200,000 B/s aggregate gzip | Not ready at 60 s; payload lower bound 992.2 s | Query-independent complete-source transfer | Do not approve practical mobile readiness for this delivery. Any regional package, installed/offline package or query-dependent remote delivery requires a separately approved product/privacy/architecture decision | Could reduce time to searchable data | May change completeness, privacy, offline behavior or public delivery interfaces |
| Page CPU 4x with unverified Worker CPU | District search 566.4 ms | Broad candidate scan/sort plus page update | Profile and reduce broad-query Worker/UI cost while preserving complete ordering, evidence and zero-query-I/O behavior; then repeat on the target device | May bring the observed broad query under 500 ms | Indexes cost bytes/memory; result pruning is not acceptable |
| Chromium process tree | 2.96 GB sampled peak | Complete decoded columns and search projections remain resident | Establish a target-device memory limit and measure Worker/process memory there before publication | Provides an actionable release boundary | Process RSS and device termination behavior vary by platform |

No budget was relaxed. The bounded local outcome is one shell pass, two search passes, one paging
pass, one broad-search failure, and one censored slow-load result. `productionVerified` and any
general mobile-performance verdict therefore remain false.

## Reproduction, attempts and cleanup

From the reused TASK-008 worktree with the pinned runtime:

```text
PATH=/private/tmp/open-store-pr21-runtime.gmFKJN:$PATH node \
  .testagent/static-delivery-research/mobile-profile.mjs \
  /private/tmp/seoul-compact-production-20260914 \
  mobile-site-da9e63c-final \
  reports/performance-2026-09-16-task-008-mobile.json
```

The completed command exited 0. The delivered JSON (formatting and field-label correction only) SHA-256 is
`caafa8f7b712c1dcc4fa01d023fcd79822f6bb07e3db1c19986ea9c43bba25f9`.
`node --check`, scoped Biome check and `git diff --check` passed for the harness; scoped Biome and
`git diff --check` also passed for the JSON, and `git diff --check` passed for this report.

Two pre-output setup attempts were excluded. The first was interrupted with exit 130 after about
31 seconds when a concurrent 12.90-second validator run was disclosed; it cannot support timing
claims. The second was interrupted with exit 130 after about 31 seconds when review found that its
primary timestamp included the intentional one-second LCP window. Neither attempt wrote JSON, and
the then-current harness had no phase checkpoint, so exact partial byte counts are unavailable.
The completed attempt used the corrected primary timestamp and ran without concurrent validation.
Completed repetitions: one. Censored slow-network repetitions retained in JSON: one. No retry,
outlier removal or percentile calculation was used.

The completed harness closed both contexts, Chromium and both loopback servers in `finally`.
Post-run process inspection found no owned browser, server or harness process. The three local
research-site directories are immutable hard-link/build artifacts only and were not hosted or
published; they contain no new production baseline or release state.
