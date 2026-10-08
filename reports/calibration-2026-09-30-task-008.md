<!--
Purpose:        Record the twelfth current TASK-008 calibration observation and its transition evidence
Owner:          Researcher / Planner
Update Trigger: When this observation is corrected, reviewed, or used in the final calibration proposal
Harness Version: 1.1
-->

# TASK-008 Calibration Observation — 2026-09-30

Status: complete non-publishing observation; calibration remains in progress; 19 category/status
decreases and eight collision-metric decreases across five categories are retained for review.

## Observation receipt

| Item                        | Value                                                                                         |
| --------------------------- | --------------------------------------------------------------------------------------------- |
| Source commit               | `af35de1fa92f7af4b3d19109107ba877402b0cbc`                                                    |
| Retained implementation anchor | `a51479097c910862e0e63b3ed6d1e7e7fa477a85` |
| Runtime                     | Ubuntu 24.04; Node.js 24.19.0; npm 11.17.0; Debian InfoZIP 6.00                               |
| Collection instant          | `2026-09-30T05:51:46.372Z`                                                                    |
| Provider modified date      | `2026-09-30`                                                                                  |
| Archive SHA-256             | `99353e0184580da5b5ce0da9338b12116c16ecf4488cc6c72be8de574d27d9b6`                            |
| Archive bytes               | 216,838,489                                                                                   |
| Complete categories         | 195                                                                                           |
| Parsed rows                 | 2,945,093                                                                                     |
| Validation result           | `review_required` (the research observation omits operator policy and baseline configuration) |
| Dataset SHA-256             | `43f755a68d41eb33570f08f18187622dd1cc8712377ee8b7c7953db905855912`                            |
| Dataset bytes               | 2,443,790,682                                                                                 |
| Elapsed time                | 642,144 ms                                                                                    |
| Peak Node RSS               | 2,354,460 KiB                                                                                 |
| Observation receipt SHA-256 | `f5296adab4c479d6d13251b8ab8adab02f8177948882afa45b80c6260b1df88e`                            |
| Committed JSON SHA-256      | `9cadb5141f0dd2b8d8c907af87fe83c4894ebeaf69560b52707ff078b005cd18`                            |

Implementation provenance: [retained implementation binding](calibration-2026-10-04-implementation-binding.md).

The full report is `reports/observation-2026-09-30-bounded-source.json`. The distinct source archive
is retained outside Git at
`/Users/sonmyeong-gwan/Documents/open-store-searcher-task008-calibration/archives/99353e0184580da5b5ce0da9338b12116c16ecf4488cc6c72be8de574d27d9b6.zip`.
The complete 279,686-byte execution log is retained at
`/Users/sonmyeong-gwan/Documents/open-store-searcher-task008-calibration/logs/2026-09-30-observation.log`
with SHA-256 `455d5fc8fd4f8b901e8f4e6e9b8e8e34f583c5051e469a7f1bc7a55ca1534298`.

## Transition from 2026-09-28

No observation was completed on 2026-09-29 because that scheduled turn ended before collection
began; no provider or connectivity failure was observed. This comparison therefore spans two
Seoul calendar days.

The archive bytes and dataset bytes are distinct from the previous observation. Total rows
increased by 738. Fifty categories changed record or status counts, and 57 categories changed at
least one retained metric. No category total decreased, and the same 23 categories remain empty.
Missing names remain 29 and missing-both-addresses remain zero. Total display-status deltas are
+158 administratively operating, +2 suspended, +455 closed, and +123 unverified.

Nineteen category/status counts have a negative transition. Administratively operating counts
decreased in categories `15044952`, `15044954`, `15044957`, `15044961`, `15044964`,
`15044972`, `15044977`, `15045016`, `15045032`, `15045034`, `15045036`,
`15045038`, `15045073`, `15045101`, `15045104`, `15045109`, `15101549`, and
`15101551`. Category `15044967` has one fewer suspended row.

Collision-group counts decreased in categories `15044957`, `15044976`, `15045073`,
`15045109`, and `15045116`; collision-record counts also decreased in `15045038`,
`15045073`, and `15045109`. All decreases remain review evidence. No limit, status rule, or
baseline is selected from them.

Unknown-pair rows increased by 61 to 187,714. All remain within the approved 68 exact 05/06
pair/category scopes; no new, missing, or out-of-scope reviewed pair appeared.

## Continuation

This is the twelfth distinct complete daily observation in the approved interval beginning
2026-09-17, with the 2026-09-25 and 2026-09-29 gaps retained explicitly. The decreases and
corrections require review as calibration evidence, but do not interrupt later non-publishing
observations. Policy, the exact allowed-empty list, and the initial baseline remain unselected
until the interval-completion approval packet.
