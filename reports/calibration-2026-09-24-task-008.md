<!--
Purpose:        Record the eighth current TASK-008 calibration observation and its transition evidence
Owner:          Researcher / Planner
Update Trigger: When this observation is corrected, reviewed, or used in the final calibration proposal
Harness Version: 1.1
-->

# TASK-008 Calibration Observation — 2026-09-24

Status: complete non-publishing observation; calibration remains in progress; 13 category-level
status corrections are retained for review.

## Observation receipt

| Item | Value |
|---|---|
| Source commit | `1482b495adaec6afe969a641696644cbd63c6a35` |
| Runtime | Ubuntu 24.04; Node.js 24.19.0; npm 11.17.0; Debian InfoZIP 6.00 |
| Collection instant | `2026-09-24T00:02:58.271Z` |
| Provider modified date | `2026-09-24` |
| Archive SHA-256 | `0d32f2d718525a7b5bc27b9737b36b226601c1adfe83a4e38a9f2aa2ed91e49f` |
| Archive bytes | 216,753,472 |
| Complete categories | 195 |
| Parsed rows | 2,943,885 |
| Validation result | `review_required` (the research observation omits operator policy and baseline configuration) |
| Dataset SHA-256 | `ab701893379037fefd2c61337bada6f3f2fadd44a6e291cb98c143422e35838f` |
| Dataset bytes | 2,442,746,706 |
| Elapsed time | 506,295 ms |
| Peak Node RSS | 2,353,584 KiB |
| Observation receipt SHA-256 | `bdc736acd09040b35112234064f800aab828d0e739881aaa0e994f6f711d2b3c` |
| Committed JSON SHA-256 | `e3aff3d85d8eb353f39825a7b555899340e59a268238808f697a40fb354f678e` |

The full report is `reports/observation-2026-09-24-bounded-source.json`. The distinct source archive
is retained outside Git at
`/Users/sonmyeong-gwan/Documents/open-store-searcher-task008-calibration/archives/0d32f2d718525a7b5bc27b9737b36b226601c1adfe83a4e38a9f2aa2ed91e49f.zip`.
The complete 279,693-byte execution log is retained at
`/Users/sonmyeong-gwan/Documents/open-store-searcher-task008-calibration/logs/2026-09-24-observation.log`
with SHA-256 `8541ef880ed883a4c9c5ebfac6a31d4d8c813ae62c197ff22ad5413ba6ee8bae`.

## Transition from 2026-09-23

The archive bytes and dataset bytes are distinct from the previous observation. Total rows
increased by 517. Fifty-two category metrics changed, no category total decreased, and the same
23 categories remain empty. Missing names remain 29 and missing-both-addresses remain zero. Total
display-status deltas are +272 administratively operating, +3 suspended, +192 closed, and +50
unverified.

Thirteen categories contain a negative display-status transition that must remain visible during
calibration. Administratively operating counts decreased in categories `15044952`, `15044972`,
`15044976`, `15044979`, `15045006`, `15045007`, `15045009`, `15045035`, `15045037`,
`15045107`, `15045109`, and `15101549`. Category `15006697` has one fewer suspended row while
adding one administratively operating and one closed row. No limit, status rule, or baseline is
selected from these corrections.

Unknown-pair rows increased by 49 to 187,617. All remain within the approved 68 exact
05/06 pair/category scopes; no new, missing, or out-of-scope reviewed pair appeared.

## Continuation

This is the eighth distinct complete daily observation in the approved interval beginning
2026-09-17. The status corrections require review as calibration evidence, but do not interrupt
later non-publishing observations. Policy, the exact allowed-empty list, and the initial baseline
remain unselected until the interval-completion approval packet.
