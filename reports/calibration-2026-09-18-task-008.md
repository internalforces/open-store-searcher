<!--
Purpose:        Record the second current TASK-008 calibration observation and its transition evidence
Owner:          Researcher / Planner
Update Trigger: When this observation is corrected, reviewed, or used in the final calibration proposal
Harness Version: 1.1
-->

# TASK-008 Calibration Observation — 2026-09-18

Status: complete non-publishing observation; calibration remains in progress; one category-count
decrease and nine category-level status corrections are retained for review.

## Observation receipt

| Item | Value |
|---|---|
| Source commit | `32c1809d68d4227541cee46596d834e72072de61` |
| Runtime | Ubuntu 24.04; Node.js 24.19.0; npm 11.17.0; Debian InfoZIP 6.00 |
| Collection instant | `2026-09-18T00:02:00.274Z` |
| Provider modified date | `2026-09-18` |
| Archive SHA-256 | `b183ddd70db99508bd01c34bf00ab41612a9378ab8189b4bf2e2ca7ac8d1d729` |
| Archive bytes | 216,600,173 |
| Complete categories | 195 |
| Parsed rows | 2,941,941 |
| Validation result | `review_required` (the research observation omits operator policy and baseline configuration) |
| Dataset SHA-256 | `84dbca5ac40b12106305db4633dc28a8bf6041527e7f1d0bbcd3ebe1be7f4bd4` |
| Dataset bytes | 2,441,071,810 |
| Elapsed time | 503,974 ms |
| Peak Node RSS | 2,339,812 KiB |
| Observation receipt SHA-256 | `bcb34c50098a4814ae32815cb67a51f06dcec91c0a37454f37f575188e8dd185` |
| Committed JSON SHA-256 | `5c9c97c3c1018d044e5edd5fc157336457c45e4fd3508e5dec3a6a4031233efe` |

The full report is `reports/observation-2026-09-18-bounded-source.json`. The distinct source archive
is retained outside Git at
`/Users/sonmyeong-gwan/Documents/open-store-searcher-task008-calibration/archives/b183ddd70db99508bd01c34bf00ab41612a9378ab8189b4bf2e2ca7ac8d1d729.zip`.
The complete 279,681-byte execution log is retained at
`/Users/sonmyeong-gwan/Documents/open-store-searcher-task008-calibration/logs/2026-09-18-observation.log`
with SHA-256 `ac109e938d0512ad1bf3fdae25b111a0107b66677c362d3cc4da6d1839d6792f`.

## Transition from 2026-09-17

The archive bytes and dataset bytes are distinct from the previous observation. Total rows
increased by 488. Forty category metrics changed and the same 23 categories remain empty.
Missing names remain 29 and missing-both-addresses remain zero. Total display-status deltas are
+268 administratively operating, +2 suspended, +170 closed, and +48 unverified.

Category `15045026` decreased from 95 to 94 rows, entirely from one fewer administratively
operating row. Nine other categories have administratively operating decreases offset by closed
or net-new rows: `15044972`, `15044979`, `15044997`, `15045024`, `15045038`, `15045049`,
`15045112`, `15101543`, and `15107028`. These source changes are evidence for policy calibration;
they are retained without selecting a limit, changing a status rule, or accepting a baseline.

Unknown-pair rows increased by 48 to 187,396. All remain within the approved 68 exact
05/06 pair/category scopes; no new, missing, or out-of-scope reviewed pair appeared.

## Continuation

This is the second distinct complete daily observation in the approved interval beginning
2026-09-17. The observed decrease and status corrections require review as calibration evidence,
but do not interrupt later non-publishing observations. Policy, the exact allowed-empty list, and
the initial baseline remain unselected until the interval-completion approval packet.
