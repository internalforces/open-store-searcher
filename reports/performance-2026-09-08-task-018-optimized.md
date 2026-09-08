<!--
Purpose:        Evidence for the approved TASK-018 search optimization and partition loading
Owner:          Implementer / Performance Engineer / Reviewer
Update Trigger: When implementation, comparative evidence, or reviewed acceptance changes
Harness Version: 1.1
-->

# TASK-018 optimized search and partition loading

Status: Approved bounded implementation; full verification and independent review complete. Rendering and production performance acceptance remains open.

## Approved change

The user explicitly requested search computation optimization and partitioned loading, then
approved the concrete query-independent, complete-snapshot design. No candidate pagination,
production source/publication contract, new dependency or public manifest interface was selected.
TASK-008 remains explicitly on hold.

Search now rejects substring-unrelated names before grapheme work, stops partial-match
segmentation once two graphemes are known, avoids duplicate literal-name comparison and caches
address tokens with the existing index. Query numeric-token flags are computed once per search.
The full scan, score rules, conflict handling, candidate order and uncertainty remain unchanged.
Cached token arrays increase retained index memory; no physical memory budget claim is made.

The browser entry uses three build-managed synthetic JSON assets rather than embedding its
record payload in initial application JavaScript. App receives an explicit dataset or loader;
existing synchronous component/benchmark fixtures explicitly provide the same demoDataset.
Only test/benchmark code imports the complete synchronous fixture. The initial metadata still
contains the fixed example query and source information; this is intentional product copy.

The partition loader waits two animation frames after shell mounting, requests fixed batches
of at most two parts, and assembles all arrays in declared order. It accepts no search input.
The existing full-dataset preparation performs cross-part duplicate checks and builds one
index before replacing the snapshot. A failed part aborts siblings and prevents later batches;
old data remains usable. Unmount/source replacement cancels outstanding work. Retrying uses
ordinary fetch requests, avoiding failed dynamic-module cache semantics. Requests use fixed
build URLs, no-referrer and omitted credentials. No storage or query-triggered I/O was added.

This improves separation of code and data and bounds concurrent loads, not total download
volume. A dense district still needs full data and all similar candidates remain available.
Real production partition sizing and publication remain blocked by the held data tasks.

## Verification and regression evidence

Pinned runtime: Node 24.19.0 / npm 11.17.0 through
`PATH=/tmp/open-store-task013-runtime:$PATH`.

- `npm run verify:full`: exit 0, 594 Vitest tests, 64 cross-browser checks, 18 accessibility
  tests / 22 zero-violation axe scans. Log: `/tmp/open-store-task018-optimized-final-verify.log`.
- Global coverage: 92.83% statements, 92.39% branches, 96.17% functions, 94.94% lines.
- Focused partition/search/PR16 tests: 17 passed. Existing full search-quality checks passed.
- Built partition scenarios: two new tests pass in all four browser projects.
- `git diff --check` passes.

Before optimization, the work-count test observed 402 grapheme calls rather than the required
2 for two unrelated searches over 100 records. After optimization it passes, with real
Unicode grapheme and numeric-token behavior assertions retained. Loader stubs produced seven
expected failures; real browser tests initially observed zero separate data requests and no
part-failure UI. Their passing implementations now exercise real loading and real search.

The first full run exposed obsolete bootstrap assumptions in existing E2E tests: some pressed
Enter before async data readiness or installed a fetch blocker before required JSON loading.
Those tests now wait for the enabled submit button before testing post-load search/privacy.
Their assertions were not removed or weakened. New tests deliberately hold parts pending and
retain editing/disabled-search/no-partial-results checks. The targeted 21-case browser rerun
passed, followed by the complete clean verification above. No new manual AT evidence is claimed.

| Requirement | Exact test evidence |
|---|---|
| Search computation optimization | `rejects unrelated names without segmenting every candidate on repeated searches` |
| Unicode and address behavior | `preserves grapheme thresholds for partial names and whole address number tokens`; unchanged full search/quality suites |
| Deferred, bounded, ordered loading | `defers requests and assembles complete parts in fixed two-request batches`; `waits for two animation frames and cancels deferred work on abort` |
| Failed/invalid parts and retry | `aborts the batch on failure, starts no later part, and retries a complete snapshot`; `rejects a malformed part %j`; `rejects an absent part list rather than publishing an accidental empty snapshot` |
| Global identity and explicit empty data | `keeps duplicate identity checks global across parts`; `accepts explicitly empty parts without inventing records` |
| Obsolete load cancellation | `starts no part for a pre-aborted load or cancellation while waiting for paint`; `aborts obsolete parts and schedules no later batch on %s`; retained PR16 obsolete payload tests |
| No partial search; old-data retention | `never searches a partial snapshot and keeps previous results after a part fails` |
| Real separate assets and input-independent requests | `loads built data parts after shell paint in bounded query-independent batches`; unchanged post-load I/O sentinels |
| Actual HTTP failure/recovery | `retries a failed built data part without exposing a partial searchable snapshot` |

## Full-result equivalence replay

[Equivalence evidence](equivalence-2026-09-08-task-018.json) binds the pre-change engine at
commit `1b570a2`, the optimized engine and both fixture hashes. All result fields agree for
77 queries over 24 synthetic records and 4,407 queries over 2,803 source-derived records:
**4,484 complete-result comparisons**. This is stronger than checking only recall percentages.

Replay uses the pinned Node runtime and existing Vite SSR transformer, with no external data:

1. Read `git show 1b570a2:src/search/search-candidates.ts` into an owned temporary `.ts` file.
   Rewrite only its relative module imports to absolute current `src/search/*.ts` paths.
   Those imported normalization/address/interpretation modules were not modified by this task.
2. Create Vite in middleware mode with configFile false, appType custom, no dependency discovery,
   watcher or WebSocket. Load the temporary baseline using `/@fs` and load the current engine
   using `/src/search/search-candidates.ts`.
3. For each of `tests/fixtures/search/seoul-quality.json` and `seoul-source-quality.json`, build
   both indexes and execute the following comparison. Close Vite and delete the owned temporary
   directory in finally. SHA-256 the original engine, optimized engine and original corpus bytes.

```js
const queries = [...new Set([
  ...corpus.cases.map(item => item.query),
  ...corpus.records.flatMap(row => [row.name, row.roadAddress, row.parcelAddress]),
])];
for (const query of queries) {
  assert.deepEqual(
    optimized.searchCandidates(optimizedIndex, query),
    baseline.searchCandidates(baselineIndex, query),
  );
}
```

This replay is an audit of complete fixture outcomes, not a claim that every possible input
has been exhaustively proven equivalent. The separate Unicode/number regressions and unchanged
quality suite cover the named safety boundaries.

## Comparable performance

Final `node scripts/measure-performance.mjs --check` returned **1**, correctly retaining
over-budget rendering and unavailable cells. Full correctness verification exited 0 before
measurement started. Both aggregate flags remain false: labTargetsMet and productionVerified.

Raw evidence: [optimized JSON](performance-2026-09-08-task-018-optimized.json). All scale fixture
hashes match the baseline exactly. All measured implementation hashes match before/after and
current files. This is a same-host, same-profile lab comparison, not universal speed certification.

| Mobile workload | Baseline compute max (ms) | Optimized compute max (ms) | Baseline display max (ms) | Optimized display max (ms) |
|---|---:|---:|---:|---:|
| 1,000 / exact | 24.5 | 10.8 | 1433.9 | 1371.1 |
| 1,000 / common | 19.0 | 2.3 | 130.2 | 108.6 |
| 1,000 / address | 18.4 | 5.0 | 1478.4 | 1410.8 |
| 1,000 / absent | 19.4 | 1.3 | 119.7 | 102.6 |
| 10,000 / exact | 216.2 | 38.9 | Unavailable | Unavailable |
| 10,000 / common | 184.9 | 10.9 | 364.9 | 175.4 |
| 10,000 / address | 149.5 | 28.8 | Unavailable | Unavailable |
| 10,000 / absent | 234.8 | 5.8 | 227.0 | 27.2 |
| 50,000 / exact | 1817.6 | 146.6 | Unavailable | Unavailable |
| 50,000 / common | 1711.7 | 33.0 | 2488.4 | 690.2 |
| 50,000 / address | 1242.9 | 133.1 | Unavailable | Unavailable |
| 50,000 / absent | 1475.7 | 22.8 | 1535.5 | 69.8 |

The worst 50,000-row mobile diagnostic compute time falls from 1,817.6 to 146.6 ms
(approximately 91.9% lower observed maximum). Common-name display improves from 2,488.4 to
690.2 ms, and no-match display from 1,535.5 to 69.8 ms. All measured search-only cells are
below 500 ms, but the product target includes display: three display cells still exceed it
(mobile 1,000-row exact/address and 50,000-row common), eight are unavailable, thirteen pass.
No candidate count was reduced to obtain the improvement. Desktop 50,000-row common-name
display is now 167.9 ms versus 623.4 ms. Mobile 50,000-row preparation still reaches 2,056.1 ms.

| Initial loading | Baseline | Optimized | Interpretation |
|---|---:|---:|---|
| HTML/CSS/JS bytes | 47,806 | 48,118 | +312 bytes of net loader/index code overhead; both under 300,000 |
| Separate demo JSON bytes | 0 | 5,331 | Three real deferred requests; not a total-transfer saving |
| Mobile cold search-ready max | 701.2 ms | 1,078.2 ms | Extra fixed-latency batches; still under 2,500 ms |
| Mobile cold LCP max | 668 ms | 668 ms | Main visible content remains within target |
| Mobile warm search-ready max | 74.5 ms | 94.1 ms | Still within target |

The tiny old demo encoded repeated fields through a compact constructor; separating it into
complete JSON rows adds transfer overhead, rather than shrinking this six-record demo.
The benefit delivered here is deferred data/code separation and bounded, safe loading.
Do not claim initial code bytes, total bytes or search-ready latency improved. The primary
metric waits for the enabled search button after all parts, while LCP measures visible content.
Actual startup resource entries include all three JSON URLs and cold/warm transfer evidence.
The original [audit JSON](performance-2026-09-08-task-018.json) and
[review](review-2026-09-08-task-018.md) are preserved as historical evidence; their source
manifests describe the pre-optimization state and are not claims about the new implementation.

Use the same fixture bytes, five samples, desktop/mobile profiles, fourfold mobile CPU,
150 ms latency, 200,000 download bytes/s and cold/warm cache conditions as the original audit.
The runner checks current source/config/tool hashes before and after the run. No tests/builds
run concurrently with measurement. The latest code-size wording distinguishes separate JSON
assets from HTML/CSS/JS.

Startup exercises actual JSON fetching through the production browser entry. Scale queries
still mount the full synthetic dataset directly, exactly as in the baseline: they isolate
loaded-data search/rendering and do not measure large partition download time. Their two-frame
endpoint is a paint opportunity rather than pixel presentation or INP. Rendering more than
1,000 candidates remains explicitly unavailable under the unchanged audit resource cap.

## Remaining boundaries

Total download size, full-index preparation and unbounded candidate DOM work are not solved
by these changes. No production-size, physical-mobile or Pages/CDN performance certification
is made. Any remaining misses/unavailable cells retain the release gate. No source-data,
status mapping, dependencies, Actions permission, handbook, commit, push or deployment changes
are included. No next task is activated by this continuation.


[Independent review](review-2026-09-08-task-018-optimized.md) approved the continuation, reran
17 focused tests and checked 91 source hashes and 80 raw metric groups. This approval does not
close performance, production, milestone or release gates.
