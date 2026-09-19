<!--
Purpose:        Record the third current TASK-008 calibration observation and its transition evidence
Owner:          Researcher / Planner
Update Trigger: When this observation is corrected, reviewed, or used in the final calibration proposal
Harness Version: 1.1
-->

# TASK-008 Calibration Observation — 2026-09-19

Status: complete non-publishing observation; calibration remains in progress; 30 category-level
status corrections are retained for review.

## Observation receipt

| Item | Value |
|---|---|
| Source commit | `22b6cb4ed8399409c2c4320dce2a56ec06a5b12e` |
| Runtime | Ubuntu 24.04; Node.js 24.19.0; npm 11.17.0; Debian InfoZIP 6.00 |
| Collection instant | `2026-09-19T05:15:25.266Z` |
| Provider modified date | `2026-09-19` |
| Archive SHA-256 | `cfd7058f5b3fb1c752fabf94e8bc17e74ceb3c12bbbb5a3f2cfcda0ac881d16f` |
| Archive bytes | 216,625,612 |
| Complete categories | 195 |
| Parsed rows | 2,942,404 |
| Validation result | `review_required` (the research observation omits operator policy and baseline configuration) |
| Dataset SHA-256 | `1bc950745af257f8b0053475ae7feed4575bd39443fcb378be980d0e1ba5a251` |
| Dataset bytes | 2,441,471,767 |
| Elapsed time | 629,765 ms |
| Peak Node RSS | 2,329,228 KiB |
| Observation receipt SHA-256 | `18212a73c74e977155b730708fd21d9d7328d6c454e86972d18236c394e8673e` |
| Committed JSON SHA-256 | `5c3acb31feb547770a610ef815f25be4dbcb51b00d0838c9e96d621c2f0b8f64` |

The full report is `reports/observation-2026-09-19-bounded-source.json`. The distinct source archive
is retained outside Git at
`/Users/sonmyeong-gwan/Documents/open-store-searcher-task008-calibration/archives/cfd7058f5b3fb1c752fabf94e8bc17e74ceb3c12bbbb5a3f2cfcda0ac881d16f.zip`.
The complete 279,700-byte execution log is retained at
`/Users/sonmyeong-gwan/Documents/open-store-searcher-task008-calibration/logs/2026-09-19-observation.log`
with SHA-256 `723f765fdd374a6e358d04b2609e4a154df2562f5e672d9a977d4fc08c299c96`.

## Transition from 2026-09-18

The archive bytes and dataset bytes are distinct from the previous observation. Total rows
increased by 463. Sixty-four category metrics changed, no category total decreased, and the same
23 categories remain empty. Missing names remain 29 and missing-both-addresses remain zero. Total
display-status deltas are +186 administratively operating, +4 suspended, +215 closed, and +58
unverified.

Thirty categories contain a negative display-status transition that must remain visible during
calibration. Administratively operating counts decreased in these 28 categories:
`15044975`, `15044977`, `15044998`, `15045002`, `15045005`, `15045006`, `15045007`,
`15045009`, `15045017`, `15045020`, `15045021`, `15045023`, `15045032`, `15045034`,
`15045057`, `15045066`, `15045073`, `15045079`, `15045081`, `15045089`, `15045103`,
`15045104`, `15045107`, `15045116`, `15101549`, `15101550`, `15107029`, and `15107032`.
Category `15045072` changed one closed row to administratively operating, and category `15045109`
changed one unverified row to administratively operating. No limit, status rule, or baseline is
selected from these corrections.

Unknown-pair rows increased by 58 to 187,454. All remain within the approved 68 exact
05/06 pair/category scopes; no new, missing, or out-of-scope reviewed pair appeared.

## Continuation

This is the third distinct complete daily observation in the approved interval beginning
2026-09-17. The status corrections require review as calibration evidence, but do not interrupt
later non-publishing observations. Policy, the exact allowed-empty list, and the initial baseline
remain unselected until the interval-completion approval packet.
