<!--
Purpose:        Record user-assisted actual VoiceOver acceptance on the final TASK-027 source
Owner:          Tester / Human observer
Update Trigger: When source binding, observations or restoration evidence changes
Harness Version: 1.1
-->

# TASK-027 Final VoiceOver Observation

Date: 2026-10-22
Application checkpoint: `8ed3ddb156f12cd83d4037b0026b0ca28b5b5dbf`
Delivery head tested: `d4f9b9e348eb8baed501983ae0ee5902681b82e0`
Result: Human-assisted manual PG-10 scenarios pass; independent acceptance review follows.

## Method and source binding

The human unlocked macOS, explicitly chose actual verification before merge, started VoiceOver
directly, and confirmed audible speech or captions. The coordinator operated the local Chrome
test tab through CUA and observed browser/native AX focus. The human listened to the actual
screen-reader output and answered the scenario-specific questions in this task. The coordinator
does not claim direct audio recording, a caption transcript or a running-app inventory proof.
Earlier failed/locked attempts remain historical evidence in the
[original AT report](manual-2026-10-22-task-027-assistive-technology.json).

All 152 `implementationSha256` entries in the
[final performance report](performance-2026-10-22-task-027-after.json) match current source.
Search/inspection used the unchanged application at `http://127.0.0.1:5197/`.
Paging used a separate loopback static copy at `http://127.0.0.1:5198/open-store-searcher/`:
the existing [47-record fixture](../tests/setup/pagination-browser.ts) executes
`makeDataset(47)` from [metrics](../tests/performance/metrics.ts), followed by its existing
common-name override. Only the three demo JSON responses change, exactly as that fixture does.
No product/test source, loader metadata, search policy, HTML, JS, CSS or Worker changes.

The base build is the same pinned Node 24.19.0/npm 11.17.0 build bound by the final performance
report. Original and copied JS/CSS/Worker hashes match, as do all 152 runner/current-source hashes.
Fixture helper SHA-256: `aa551495693ecedbdd479363a0691361e5754bcdfe9d2b7b20777de72805e2b9`.
Application JS SHA-256: `acd067ca8f6cbafbc13da9e5b4bfae5b9b1516f3fdb69158376df8cdcba5b61f`.
CSS SHA-256: `241f94d2ab24c1da036d3e0de3f7bd6847a3bf3705fb14d8b253343a7d2ce13b`.
All seven local HTTP asset responses match the prepared static files byte for byte.

## Actual observations

| Scenario | Coordinator-observed state | Human's actual speech observation |
|---|---|---|
| First and repeated identical search | Enter submission updates accepted completion count from 1 to 2; input keeps focus; unique primary and one similar candidate remain. A later human interaction advances the count to 3 before inspection. | Human confirms the repeated-search announcement works normally. The reply is a functional confirmation, not a verbatim count/word transcript. |
| Explicit similar inspection | Native Tab reaches the Gangnam similar candidate button; Enter focuses the selected detail's level-three heading. Its suspended status and conflicting address remain intact. | Human explicitly confirms the detail title is read. |
| Return to invoking candidate | From the detail heading, native Tab reaches the return button; Enter restores the exact Gangnam candidate detail button. | Human explicitly confirms the restored original candidate button is read. |
| Next page | Native Tab reaches the next-page button; Enter changes the visible range from 1-20 to 21-40 of 47, page 2/3, and focuses `similar-heading`. | Human confirms page/range announcement and similar-candidates title reading are normal. |
| Last page and decorative noise | Native Tab reaches the last-page button; Enter shows 41-47 of 47, page 3/3, focuses `similar-heading`, and disables next/last controls. | Human explicitly confirms both changed pages announce/read normally and no unnecessary decorative reading occurs. |

The paging query is the exact invented fixture literal `합성공통상점`. Inspection uses the
existing invented demo; no real business or personal search input is collected or transmitted.
The paired human observations supply actual AT evidence; AX/DOM/axe alone are not treated as
speech evidence. This scope is current-source macOS Chrome, with the existing four-browser
automated coverage recorded separately. No claim of all-screen-reader compatibility follows.

## Restoration and boundaries

The complete temporary test's original baseline is VoiceOver off and caption preference checked.
During the unlocked retry the switch is already on, and the human subsequently starts VoiceOver
for this test. After all observations, Settings is explicitly returned to VoiceOver off with a
fresh AX observation, restored to General, and quit. Caption-panel and cursor preferences remain
checked; AppleScript control remains unchecked. Utility is restored to General and quit.
No security/control permission, global runtime or unrelated setting is expanded.

No acceptance criterion is deferred or waived. Production/full-source, physical-mobile,
publication/recovery, milestone/handbook and release gates remain separate. TASK-028 remains a
proposed, unactivated plan. The independent Reviewer must disposition PG-10 and the already
passing canonical CI before task completion and normal protected-main integration.
