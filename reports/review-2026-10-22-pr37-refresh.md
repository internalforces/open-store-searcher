# PR #37 retained-data refresh fix review

Date: 2026-10-22
Base HEAD: `3c6728036381b39e84f237f9ffedb05035da9ae2`
Verdict: **Approved for the bounded code/test correction.**
Findings: **0 Critical, 0 Important, 0 Minor new findings.**
Final task acceptance: **Pending new-source performance and affected manual AT evidence.**

## Code and regression assessment

The one-line `src/app/app.tsx:258` change to `busy={searchBusy}` correctly separates a retained
dataset refresh from an actual result request. The local loader preserves its accepted prepared
dataset during reload, so its existing local pagination remains usable. SearchResults now exposes
the correct `aria-busy=false` and enabled applicable paging controls in that state.

Initial availability and SearchForm/loading notices are unchanged. Actual asynchronous search
and page requests still set `searchBusy`, and the existing page handler retains its duplicate-
request, `!loading.searchAvailable` and page-function guards. New accepted datasets still invalidate
stale submissions through the existing dataset/request identity logic. A terminal Worker error
is not relabeled as pending work; the unchanged availability guard still prevents page requests.
The disclosed pre-existing enabled-but-inert terminal-error paging state is not introduced here.

The new real-App pending-refresh regression in `src/app/workspace.test.tsx:148` is substantive:
it holds the reload Promise pending, preserves the accepted inspection and truthful announcement,
and activates Next/Last/Previous/First with literal native disabled boundaries, 20/7/20/20 row
counts, absolute ranges/positions, cleared off-page selection and heading focus. After rejection,
the accepted detail survives and old-data paging still works. The additional terminal-Worker
test at `:620` checks settled busy state, retained rows and no extra transport requests. Existing
actual-Worker pending/supersession/replacement tests remain intact. This covers FR-13 and
PG-07/08/10 without changing search policy or inventing a new availability-as-busy rule.

Inspected authoritative RED/GREEN logs: the unchanged production code fails the final refresh
assertion (`[true,true,true,true]` instead of `[true,true,false,false]`), while the terminal guard
passes. The final workspace run passes 32/32; typecheck, canonical lint (301 files, five existing
infos) and format (299 files) exit 0. All eight listed evidence hashes match. The retained runner
preservation record confirms 670 matched files. Scoped `git diff --check` exits 0. No tests or
performance run were repeated by this reviewer.

## Source binding and manual carry-forward

Independently verified all 152 entries in `pr37-refresh-fix-final-source.json` against current
files. Exactly two differ from the historical after-performance manifest:

- `src/app/app.tsx`: `9f6f9b81c09c8417b6c703d3f70f66148a1373128b6716fe8c8503ea175df116`.
- `src/app/workspace.test.tsx`: `29123aea111e3a8b95e41320b717ab7fea1470b348f4d9e6ec9a21e3c840896d`.

The old 152-file manifest is therefore historical, with 150 matching entries; it is not current
new-source performance or full-suite evidence. Reviewed fix-report SHA-256 at this checkpoint:
`da4718d45e7780878af144d6eb8bdbeb4ae3e0140a720a4b3436af24c5269734`.

Prior human AT observations may carry forward narrowly for repeated normal searches, ordinary
page announcements, detail inspection and exact-button return. Their SearchResults, controls,
focus/live-region implementation, CSS and Worker are unchanged; with no load/request pending,
the old and new busy expressions both yield false. Actual result requests still yield true in
both versions. Initial loading renders no accepted SearchResults, and terminal settled errors
are unchanged. This is a reviewed behavioral bridge, not a claim that historical recordings or
source hashes changed.

Only `loading.phase === 'loading' && !searchBusy` changes result behavior. The planned actual
human-assisted page/range announcement and heading-focus observation while refresh remains
pending must cover that affected state before final PG-10 acceptance. New-build performance
must supply fresh complete bindings and unchanged-budget results. No repetition of unaffected
manual scenarios is requested if the frozen source and those implementation hashes remain intact.

## Remaining gates

Obtain and review the new-source performance/bundle evidence and affected pending-refresh AT
observation, then reconcile task/evidence records. After the fix/evidence are committed and pushed,
require canonical full CI and a completed GitHub review on that exact new head, address/resolve
the original P2 review thread with evidence, and check normal protected-main/base/conversation
conditions before the already authorized merge. Prior acceptance and CI remain point-in-time
records; neither closes these new-source gates. No deployment, TASK-028 activation, production,
physical-mobile, milestone/handbook or release acceptance follows from this scoped approval.

Only this private report was written; no product/test/public-document, Git or remote mutation,
handbook access or broad suite/performance repeat occurred.

## New-source performance supplement — 2026-10-22

Verdict: **Approved for the new scoped performance evidence; no new findings.**

Independently verified `reports/performance-2026-10-22-pr37-refresh.json.raw` and its readable
JSON have deeply equal parsed values. Raw SHA-256 is
`cc9e9f4ed2c448911722e7244b3420fd03c17d2b16c299ae48aba4d6cec223da` (220,067 bytes);
view SHA-256 is `ff28755b040669a7ed6c1245703097469aa944c00b1278a6185bcbeff7db306e`
(212,017 bytes). The recorded single `node scripts/measure-performance.mjs --check` run exits 0;
the delivered-artifact format check exits 0 on 300 files. No measurement was rerun for this review.

All 152 new performance source hashes equal the frozen correction manifest, the new fixture
manifest and current local files. The environment, methodology, limitations, profiles, scales,
five repetitions and targets equal the retained previous report. Independently traced raw
observations into every aggregate and recomputed all 96 statistical summaries and all 49 budget
gates. All pass: initial code 93,372 bytes; maximum primary readiness 1,223.3ms, LCP 1,164ms,
search 256ms and page navigation 245.7ms. `productionVerified=false` remains explicit.

All seven bundle entries match the new base-build archive and fixture base assets. All seven
QA files match their manifest; only the three demo JSON assets differ. Their 47 records deeply
equal the exact existing dataset/name-override fixture, and the helper hash matches. The four
retained non-demo loopback HTTP responses match their files and return 200. Demo responses were
reserved for the proposed human observation and are not claimed as observed AT behavior. All
four historical before/after performance raw/view reports retain their original hashes, and all
16 evidence hashes listed in the updated worker report match.

The new-source performance prerequisite is now satisfied within these synthetic lab limits.
**Final TASK-027 acceptance and merge remain withheld:** the human cannot start VoiceOver now,
so actual page/range/heading behavior during a pending refresh has not been observed. Earlier
AT evidence carries forward only within the unchanged-flow bridge above; no unavailable
observation, exception or deferral is inferred. New exact-head canonical CI, GitHub review and
the normal protected integration checks remain required after delivery. The coordinator reports
the unused QA tab closed and owned fixture server stopped, with no settings changed this attempt.
