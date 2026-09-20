<!--
Purpose:        Record the fourth current TASK-008 calibration observation and its transition evidence
Owner:          Researcher / Planner
Update Trigger: When this observation is corrected, reviewed, or used in the final calibration proposal
Harness Version: 1.1
-->

# TASK-008 Calibration Observation — 2026-09-20

Status: complete non-publishing observation; calibration remains in progress; 20 category-level
status corrections are retained for review.

## Observation receipt

| Item | Value |
|---|---|
| Source commit | `eda7ebd506d3db50178e30b3922d5ce4b99ee571` |
| Runtime | Ubuntu 24.04; Node.js 24.19.0; npm 11.17.0; Debian InfoZIP 6.00 |
| Collection instant | `2026-09-20T00:01:30.513Z` |
| Provider modified date | `2026-09-20` |
| Archive SHA-256 | `a516963f2b591b4eb09ade634ac8f4bd86336009ac31a5610a6d98ae32f28113` |
| Archive bytes | 216,671,171 |
| Complete categories | 195 |
| Parsed rows | 2,942,802 |
| Validation result | `review_required` (the research observation omits operator policy and baseline configuration) |
| Dataset SHA-256 | `ab742c2128387f2943573b8cfcdb3ace48249cfaeb9ebef604d0f07e13c1a9e1` |
| Dataset bytes | 2,441,813,622 |
| Elapsed time | 515,502 ms |
| Peak Node RSS | 2,363,016 KiB |
| Observation receipt SHA-256 | `3ceaefe7ce4bdb18c4a2031aa502e0019ea9b98cc53228015bce5671e807129e` |
| Committed JSON SHA-256 | `a48e6b891924c65f1b8dde7d1f1393edcad8cd44af5de87b78ac7b496dfcd947` |

The full report is `reports/observation-2026-09-20-bounded-source.json`. The distinct source archive
is retained outside Git at
`/Users/sonmyeong-gwan/Documents/open-store-searcher-task008-calibration/archives/a516963f2b591b4eb09ade634ac8f4bd86336009ac31a5610a6d98ae32f28113.zip`.
The complete 279,679-byte execution log is retained at
`/Users/sonmyeong-gwan/Documents/open-store-searcher-task008-calibration/logs/2026-09-20-observation.log`
with SHA-256 `15f68d7a7e1a1d05635fd868b525639347abbd4ac3328cf0876f5fe8e88aed5a`.

## Transition from 2026-09-19

The archive bytes and dataset bytes are distinct from the previous observation. Total rows
increased by 398. Fifty-three category metrics changed, no category total decreased, and the same
23 categories remain empty. Missing names remain 29 and missing-both-addresses remain zero. Total
display-status deltas are +122 administratively operating, +1 suspended, +225 closed, and +50
unverified.

Twenty categories contain a negative display-status transition that must remain visible during
calibration. Administratively operating counts decreased in these 19 categories:
`15006697`, `15006730`, `15044957`, `15044964`, `15044977`, `15044985`, `15045018`,
`15045032`, `15045038`, `15045061`, `15045071`, `15045072`, `15045101`, `15045104`,
`15045109`, `15101550`, `15101551`, `15101552`, and `15107032`. Suspended counts decreased by
one in categories `15045013` and `15101550`; the latter also appears in the operating-decrease
set. No limit, status rule, or baseline is selected from these corrections.

Unknown-pair rows increased by 44 to 187,498. All remain within the approved 68 exact
05/06 pair/category scopes; no new or out-of-scope reviewed pair appeared.

## Continuation

This is the fourth distinct complete daily observation in the approved interval beginning
2026-09-17. The status corrections require review as calibration evidence, but do not interrupt
later non-publishing observations. Policy, the exact allowed-empty list, and the initial baseline
remain unselected until the interval-completion approval packet.
