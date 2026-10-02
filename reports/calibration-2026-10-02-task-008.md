<!--
Purpose:        Record the thirteenth current TASK-008 calibration observation and its transition evidence
Owner:          Researcher / Planner
Update Trigger: When this observation is corrected, reviewed, or used in the final calibration proposal
Harness Version: 1.1
-->

# TASK-008 Calibration Observation — 2026-10-02

Status: complete non-publishing observation; calibration remains in progress; 31 category/status
decreases and four collision-group decreases are retained for review.

## Observation receipt

| Item                        | Value                                                                                         |
| --------------------------- | --------------------------------------------------------------------------------------------- |
| Source commit               | `2a28952`                                                                                     |
| Runtime                     | Ubuntu 24.04; Node.js 24.19.0; npm 11.17.0; Debian InfoZIP 6.00                               |
| Collection instant          | `2026-10-02T12:57:09.778Z`                                                                    |
| Provider modified date      | `2026-10-02`                                                                                  |
| Archive SHA-256             | `c0793ce2ad9a894c98b667a7e1ab91649ec76e8fcca536fce4440999386f202a`                            |
| Archive bytes               | 216,931,511                                                                                   |
| Complete categories         | 195                                                                                           |
| Parsed rows                 | 2,946,138                                                                                     |
| Validation result           | `review_required` (the research observation omits operator policy and baseline configuration) |
| Dataset SHA-256             | `c1e1e281cbdd750c0a7897a5c52c5ccc91de6046321f824a37244096c5f8030a`                            |
| Dataset bytes               | 2,444,691,970                                                                                 |
| Elapsed time                | 508,969 ms                                                                                    |
| Peak Node RSS               | 2,364,176 KiB                                                                                 |
| Observation receipt SHA-256 | `75fdfdc60616053d36a261684154b92d4832d7cd3831a5d6a3f6c4ac7c1b0e86`                            |
| Committed JSON SHA-256      | `637db8e4b481b119afd68f486d232bba3292884bc7ba09f9f053ff69846838f2`                            |

The full report is `reports/observation-2026-10-02-bounded-source.json`. The distinct source archive
is retained outside Git at
`/Users/sonmyeong-gwan/Documents/open-store-searcher-task008-calibration/archives/c0793ce2ad9a894c98b667a7e1ab91649ec76e8fcca536fce4440999386f202a.zip`.
The complete 279,687-byte execution log is retained at
`/Users/sonmyeong-gwan/Documents/open-store-searcher-task008-calibration/logs/2026-10-02-observation.log`
with SHA-256 `fdb6867da7b10218e69ecacd8edc1cebbfe66da43af37f25298ac8c02d945428`.

## Transition from 2026-09-30

No observation was completed on 2026-10-01 because that scheduled turn ended before collection
began; no provider or connectivity failure was observed. This comparison therefore spans two
Seoul calendar days.

The archive bytes and dataset bytes are distinct from the previous observation. Total rows
increased by 1,045. Sixty-nine categories changed record or status counts. No category total
decreased, and the same 23 categories remain empty. Missing names remain 29 and
missing-both-addresses remain zero. Total display-status deltas are +370 administratively
operating, +2 suspended, +552 closed, and +121 unverified.

Thirty-one category/status counts have a negative transition. Administratively operating counts
decreased in categories `15044957`, `15044964`, `15044972`, `15044975`, `15044979`,
`15044981`, `15044983`, `15044987`, `15045002`, `15045006`, `15045008`,
`15045016`, `15045017`, `15045024`, `15045029`, `15045032`, `15045034`,
`15045036`, `15045038`, `15045045`, `15045050`, `15045081`, `15045104`,
`15045109`, `15045112`, `15096257`, `15101549`, `15101551`, and `15107032`.
Category `15006697` has one fewer closed row, and category `15107028` has one fewer suspended
row. Collision-group counts decreased in categories `15006697`, `15045024`, `15045048`,
and `15045057`. No collision-record count decreased. All decreases remain review evidence; no
limit, status rule, or baseline is selected from them.

Unknown-pair rows increased by 111 to 187,825. All remain within the approved 68 exact 05/06
pair/category scopes; no new, missing, or out-of-scope reviewed pair appeared.

## Continuation

This is the thirteenth distinct complete daily observation in the approved interval beginning
2026-09-17. The 2026-09-25, 2026-09-29, and 2026-10-01 gaps remain explicit. The decreases and
corrections require review as calibration evidence, but do not interrupt later non-publishing
observations. Policy, the exact allowed-empty list, and the initial baseline remain unselected
until the interval-completion approval packet.
