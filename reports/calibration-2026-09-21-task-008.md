<!--
Purpose:        Record the fifth current TASK-008 calibration observation and its transition evidence
Owner:          Researcher / Planner
Update Trigger: When this observation is corrected, reviewed, or used in the final calibration proposal
Harness Version: 1.1
-->

# TASK-008 Calibration Observation — 2026-09-21

Status: complete non-publishing observation; calibration remains in progress; three category-level
status corrections are retained for review.

## Observation receipt

| Item | Value |
|---|---|
| Source commit | `1c652bbc3eedd15f18e709700ca491df4eb13c6c` |
| Runtime | Ubuntu 24.04; Node.js 24.19.0; npm 11.17.0; Debian InfoZIP 6.00 |
| Collection instant | `2026-09-21T00:04:47.457Z` |
| Provider modified date | `2026-09-21` |
| Archive SHA-256 | `b91012e54cd62a500fac6194f81ee25cfe8d98f5193515174207ce6d678170f5` |
| Archive bytes | 216,674,694 |
| Complete categories | 195 |
| Parsed rows | 2,942,809 |
| Validation result | `review_required` (the research observation omits operator policy and baseline configuration) |
| Dataset SHA-256 | `7823fa93ab79cbffea2a9048930df7dd1633792d5e7d90f9493dbbd20e441ad8` |
| Dataset bytes | 2,441,819,666 |
| Elapsed time | 536,230 ms |
| Peak Node RSS | 2,354,868 KiB |
| Observation receipt SHA-256 | `177e37fbe1bd82a17ccdeafaea9740b1b02551b72583752e5203c74e54d39cb9` |
| Committed JSON SHA-256 | `60b92d6b9cbd164300478770771ea5b950899aa08592ff8b4b37983675431dfa` |

The full report is `reports/observation-2026-09-21-bounded-source.json`. The distinct source archive
is retained outside Git at
`/Users/sonmyeong-gwan/Documents/open-store-searcher-task008-calibration/archives/b91012e54cd62a500fac6194f81ee25cfe8d98f5193515174207ce6d678170f5.zip`.
The complete 279,681-byte execution log is retained at
`/Users/sonmyeong-gwan/Documents/open-store-searcher-task008-calibration/logs/2026-09-21-observation.log`
with SHA-256 `065e3c1c1091fbd0613465b77bccff7f2587b28fa789ca18f5107dd9ba27d3db`.

## Transition from 2026-09-20

The archive bytes and dataset bytes are distinct from the previous observation. Total rows
increased by seven. Seven category metrics changed, no category total decreased, and the same 23
categories remain empty. Missing names remain 29 and missing-both-addresses remain zero. Total
display-status deltas are -10 administratively operating, +1 suspended, +16 closed, and zero
unverified.

Three categories contain negative display-status transitions that must remain visible during
calibration. Category `15044960` changed one administratively operating row to suspended;
category `15044977` changed eight administratively operating rows to closed; and category
`15045016` changed six administratively operating rows to closed. Other additions offset five of
these decreases at the total level. No limit, status rule, or baseline is selected from the
corrections.

Unknown-pair rows remain 187,498. All remain within the approved 68 exact 05/06 pair/category
scopes; no new, missing, or out-of-scope reviewed pair appeared.

## Continuation

This is the fifth distinct complete daily observation in the approved interval beginning
2026-09-17. The status corrections require review as calibration evidence, but do not interrupt
later non-publishing observations. Policy, the exact allowed-empty list, and the initial baseline
remain unselected until the interval-completion approval packet.
