<!--
Purpose:        Record the tenth current TASK-008 calibration observation and its transition evidence
Owner:          Researcher / Planner
Update Trigger: When this observation is corrected, reviewed, or used in the final calibration proposal
Harness Version: 1.1
-->

# TASK-008 Calibration Observation — 2026-09-27

Status: complete non-publishing observation; calibration remains in progress; four category-level
status corrections are retained for review.

## Observation receipt

| Item                        | Value                                                                                         |
| --------------------------- | --------------------------------------------------------------------------------------------- |
| Source commit               | `16b0f4d6cfb191128653288eb86edfeffe1941c2`                                                    |
| Runtime                     | Ubuntu 24.04; Node.js 24.19.0; npm 11.17.0; Debian InfoZIP 6.00                               |
| Collection instant          | `2026-09-27T00:01:48.074Z`                                                                    |
| Provider modified date      | `2026-09-27`                                                                                  |
| Archive SHA-256             | `33401d00c2c86a1e8624fc3eada1bc9345a01e9a816b260ded528a5eee81fc8f`                            |
| Archive bytes               | 216,779,950                                                                                   |
| Complete categories         | 195                                                                                           |
| Parsed rows                 | 2,944,349                                                                                     |
| Validation result           | `review_required` (the research observation omits operator policy and baseline configuration) |
| Dataset SHA-256             | `915952b548b99c4c563c19b9efe9785faf98a52e467a1de81c2d81c6c1bb7cc5`                            |
| Dataset bytes               | 2,443,145,669                                                                                 |
| Elapsed time                | 499,870 ms                                                                                    |
| Peak Node RSS               | 2,358,916 KiB                                                                                 |
| Observation receipt SHA-256 | `137982cb272edfc99db63174e5f84b4e49ea2f53f212120363ee8d3d029d9e75`                            |
| Committed JSON SHA-256      | `4c77708846cd48f156ca0e1b5774526365291cfcaf0596cbcd9ec18dded2a894`                            |

The full report is `reports/observation-2026-09-27-bounded-source.json`. The distinct source archive
is retained outside Git at
`/Users/sonmyeong-gwan/Documents/open-store-searcher-task008-calibration/archives/33401d00c2c86a1e8624fc3eada1bc9345a01e9a816b260ded528a5eee81fc8f.zip`.
The complete 279,684-byte execution log is retained at
`/Users/sonmyeong-gwan/Documents/open-store-searcher-task008-calibration/logs/2026-09-27-observation.log`
with SHA-256 `0c614c1415e514cee34322f1853068b51ea6c2ff185ae51de43aacc3f375878e`.

## Transition from 2026-09-26

The archive bytes and dataset bytes are distinct from the previous observation. Total rows
increased by six. Five categories changed record or status counts, while category `15045037` also
increased its collision-group count by one. No category total decreased, and the same 23
categories remain empty. Missing names remain 29 and missing-both-addresses remain zero. Total
display-status deltas are -44 administratively operating, no suspended change, +50 closed, and no
unverified change.

Four categories contain a negative display-status transition that must remain visible during
calibration. Administratively operating counts decreased by eight in category `15006730`, by 30
in `15044977`, by six in `15044985`, and by six in `15045016`. No limit, status rule, or
baseline is selected from these corrections.

Unknown-pair rows remain 187,653. All remain within the approved 68 exact 05/06 pair/category
scopes; no new, missing, or out-of-scope reviewed pair appeared.

## Continuation

This is the tenth distinct complete daily observation in the approved interval beginning
2026-09-17, with the 2026-09-25 gap retained explicitly. The status corrections require review as
calibration evidence, but do not interrupt later non-publishing observations. Policy, the exact
allowed-empty list, and the initial baseline remain unselected until the interval-completion
approval packet.
