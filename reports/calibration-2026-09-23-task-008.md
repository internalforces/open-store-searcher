<!--
Purpose:        Record the seventh current TASK-008 calibration observation and its transition evidence
Owner:          Researcher / Planner
Update Trigger: When this observation is corrected, reviewed, or used in the final calibration proposal
Harness Version: 1.1
-->

# TASK-008 Calibration Observation — 2026-09-23

Status: complete non-publishing observation; calibration remains in progress; 23 category-level
status corrections are retained for review.

## Observation receipt

| Item | Value |
|---|---|
| Source commit | `0ad74d998dccdf84ae7a5729d363aba5bdf01579` |
| Runtime | Ubuntu 24.04; Node.js 24.19.0; npm 11.17.0; Debian InfoZIP 6.00 |
| Collection instant | `2026-09-23T12:16:36.418Z` |
| Provider modified date | `2026-09-23` |
| Archive SHA-256 | `09f4b26d7bdb67f140cfb2428bbf41833945276dc98988033aa2419306a9c784` |
| Archive bytes | 216,706,234 |
| Complete categories | 195 |
| Parsed rows | 2,943,368 |
| Validation result | `review_required` (the research observation omits operator policy and baseline configuration) |
| Dataset SHA-256 | `73efddc3996abfd8105e6af909ff2e826a7432e769ea00edbb9689a05cbb467f` |
| Dataset bytes | 2,442,301,629 |
| Elapsed time | 509,938 ms |
| Peak Node RSS | 2,295,008 KiB |
| Observation receipt SHA-256 | `4fa6ed4a638f47dbfae3d50d4cb40a49e690be6ade896c77acd1d44fcf03886d` |
| Committed JSON SHA-256 | `20fa72bb2192406a06f0278d4ab26ca5f9027e98bbea8f52c17b0319b011f01a` |

The full report is `reports/observation-2026-09-23-bounded-source.json`. The distinct source archive
is retained outside Git at
`/Users/sonmyeong-gwan/Documents/open-store-searcher-task008-calibration/archives/09f4b26d7bdb67f140cfb2428bbf41833945276dc98988033aa2419306a9c784.zip`.
The complete 279,686-byte execution log is retained at
`/Users/sonmyeong-gwan/Documents/open-store-searcher-task008-calibration/logs/2026-09-23-observation.log`
with SHA-256 `bdf56438b34ed50a2fad46236c716e89fd3254b6e3766fce41e17911a56d8b92`.

## Transition from 2026-09-22

The archive bytes and dataset bytes are distinct from the previous observation. Total rows
increased by 555. Fifty-three category metrics changed, no category total decreased, and the same
23 categories remain empty. Missing names remain 29 and missing-both-addresses remain zero. Total
display-status deltas are +217 administratively operating, -2 suspended, +267 closed, and +73
unverified.

Twenty-three categories contain a negative display-status transition that must remain visible
during calibration. Administratively operating counts decreased in categories `15044957`,
`15044977`, `15044978`, `15044981`, `15044983`, `15044984`, `15044996`, `15045018`,
`15045024`, `15045025`, `15045034`, `15045037`, `15045038`, `15045045`, `15045070`,
`15045073`, `15045101`, `15045104`, `15045109`, and `15101549`. Suspended counts decreased in
categories `15045035` and `15045060`; category `15006697` changed one closed row to
administratively operating. No limit, status rule, or baseline is selected from these corrections.

Unknown-pair rows increased by 70 to 187,568. All remain within the approved 68 exact
05/06 pair/category scopes; no new, missing, or out-of-scope reviewed pair appeared.

## Continuation

This is the seventh distinct complete daily observation in the approved interval beginning
2026-09-17. The status corrections require review as calibration evidence, but do not interrupt
later non-publishing observations. Policy, the exact allowed-empty list, and the initial baseline
remain unselected until the interval-completion approval packet.
