<!--
Purpose:        Record the final GitHub review correction and source-bound verification
Owner:          Debugger / Tester / Coordinator
Update Trigger: When correction, AT, performance or exact-head integration evidence changes
Harness Version: 1.1
-->

# PR37 Retained-Data Refresh Correction

Date: 2026-10-22
Base: `3c6728036381b39e84f237f9ffedb05035da9ae2`
Status: Code/test correction independently Approved; new-source performance passes; affected actual AT pending.
Review thread: `PRRT_kwDOT-E1m86vLUCg`, comment `4348051256`.

## Cause and bounded change

Final GitHub review identifies a real P2 issue: App passes dataset-loading phase as result busy.
The local loader retains accepted data and search availability during refresh, but every page
control becomes disabled until that refresh settles. A hung refresh makes old candidates beyond
the displayed page unreachable despite the previous-data availability notice.

Change only the result prop to `busy={searchBusy}`. Actual search/page requests still set that
signal; SearchForm/loading notices, initial availability, duplicate-request and transport guards
are unchanged. Do not conflate terminal unavailability with pending work. The disclosed existing
enabled-but-inert controls after terminal Worker loss are not introduced or repaired here;
the existing handler still blocks transport requests in that state.

## Regression evidence

Existing pinned Node 24.19.0/npm 11.17.0/Biome 2.5.9 runner, clean metadata-free snapshot;
670 eligible tracked files match at staging time. Later coordinator Markdown is administrative
and checked separately. No dependency/configuration, timeout, retry, worker or budget changes.

| Requirement | Exact test / evidence |
|---|---|
| Keep all accepted pages usable during pending refresh and after rejection | `keeps all applicable accepted-page controls usable during a pending refresh and after rejection`: real App/loader, held refresh Promise, accepted detail/notice, all four controls, 20/7/20/20 counts, absolute ranges/positions, selection reset and heading focus; rejection retains usable accepted data. |
| Retain actual pending request suppression | Existing `keeps accepted inspection during deferred paging, blocks repeated page actions and clears only off-page selections` remains green, including duplicate request prevention. |
| Do not invent pending work after terminal Worker failure | `does not report pending work or send page requests after the accepted search Worker fails`: settled `aria-busy=false`, old rows retained, zero extra transport requests. |
| Prove the regression and narrow clean run | Unchanged production code fails the final refresh assertion: all four controls disabled instead of only boundary controls. After the one-line fix, `npm run test:component -- src/app/workspace.test.tsx` passes 32/32; typecheck, lint301 (five existing INFOs) and format299 all exit0. |

Only App and its workspace test change. Current App SHA-256:
`9f6f9b81c09c8417b6c703d3f70f66148a1373128b6716fe8c8503ea175df116`.
Current workspace-test SHA-256:
`29123aea111e3a8b95e41320b717ab7fea1470b348f4d9e6ec9a21e3c840896d`.
The old after-performance manifest is historical:150 of152 entries match; these two differ.

## Manual evidence bridge and affected scenario

The independent reviewer permits bounded carry-forward of
[prior human-assisted VoiceOver observations](manual-2026-10-22-task-027-voiceover-final.md):
normal idle search, inspection/return and page controls have the same false result-busy value;
SearchResults, its focus/live regions, CSS and Worker are unchanged. Actual result requests
retain true busy in both versions. This is a reviewed behavior bridge, not a relabeled hash or
new recording. Only the retained-data refresh state changes and needs affected observation.

The affected local fixture uses the freshly pinned current build, exact existing47-record
pagination logic and only three replaced demo JSON assets. HTML/JS/CSS/Worker bytes equal that
current build. The first demo loads succeed; subsequent refresh responses wait on a private
local gate, then return503 to exercise failure retention. The server binds loopback only;
no product/test fixture, public URL or loader contract changes. The human cannot directly restart VoiceOver now. No affected pending-refresh speech observation
was performed, and no AT pass is inferred from component tests or AX state. The previous actual
normal-flow observations remain valid only through the reviewed bridge above. The user explicitly
chose actual verification before merge, so this gate is retained without waiver. The prior off
baseline was restored before this attempt; no setting changed during this attempt. The owned QA
tab was closed, server58427 was stopped after matching its command, and fresh app inventory shows
VoiceOver and VoiceOver Utility not running. The private fixture/build/scripts remain available
for a future restart with reset first-load counters.

## New-source performance

One pinned `node scripts/measure-performance.mjs --check` run exits0, with all samples retained,
no retries and unchanged budgets/profiles/scales/five repetitions. Production HTML/CSS/JS is
93,372 bytes; worst primary1223.3ms, LCP1164ms, search256ms and page245.7ms meet their respective
300,000-byte/2500ms/2500ms/500ms/500ms limits. `labTargetsMet=true`, `productionVerified=false`.
See the [raw result](performance-2026-10-22-pr37-refresh.json.raw) and
[formatted reading view](performance-2026-10-22-pr37-refresh.json). Parsed values are equal.
Raw SHA256: `cc9e9f4ed2c448911722e7244b3420fd03c17d2b16c299ae48aba4d6cec223da`;
view SHA256: `ff28755b040669a7ed6c1245703097469aa944c00b1278a6185bcbeff7db306e`.
All152 bindings match current source; all7 measured build assets match the QA build. Historical
performance reports retain their exact bytes. The delivered-artifact format check exits0 on300
files. Lab/synthetic/mobile-emulation/loopback/paint-opportunity limitations remain unchanged.

Independent Sol/xhigh [scoped review](review-2026-10-22-pr37-refresh.md) approves the code/test
correction and new performance evidence with zero new findings; final acceptance remains pending
affected actual AT and final delivery checks.

## Remaining gates

Independent final review must consume affected actual AT evidence when available. The final
pushed fix/evidence head
then requires canonical full CI, completed GitHub review and verified original-thread resolution
before normal protected-main merge. Earlier source acceptance and CI remain point-in-time.
No deployment, TASK-028 activation, production/physical-mobile, hosted, milestone/handbook or
release acceptance is inferred. Original checkout and other worktree changes stay preserved.
