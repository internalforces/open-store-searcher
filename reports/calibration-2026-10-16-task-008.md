<!--
Purpose:        Record the twenty-second distinct current TASK-008 calibration observation and its transition evidence
Owner:          Researcher / Planner
Update Trigger: When this observation is corrected, reviewed, or used in the final calibration proposal
Harness Version: 1.1
-->

# TASK-008 Calibration Observation — 2026-10-16

Status: complete distinct-archive non-publishing observation; the approved interval is complete;
23 category/status and seven collision-metric decreases are retained for review.

## Observation receipt

| Item                           | Value                                                                                         |
| ------------------------------ | --------------------------------------------------------------------------------------------- |
| Source commit                  | `49a1b9b0013bbf50add61b084d5600ee08e64ac4`                                                    |
| Retained implementation anchor | `a51479097c910862e0e63b3ed6d1e7e7fa477a85`                                                    |
| Runtime                        | Ubuntu 24.04; Node.js 24.19.0; npm 11.17.0; Debian InfoZIP 6.00                               |
| Collection instant             | `2026-10-16T01:52:52.043Z`                                                                    |
| Provider modified date         | `2026-10-16`                                                                                  |
| Archive SHA-256                | `c90758c2d3922e78d636ab2c9967b80c690bdcd8aeca283cf9f6ecc2cc992352`                            |
| Archive bytes                  | 217,307,219                                                                                   |
| Complete categories            | 195                                                                                           |
| Parsed rows                    | 2,951,024                                                                                     |
| Validation result              | `review_required` (the research observation omits operator policy and baseline configuration) |
| Dataset SHA-256                | `31ff03d0b769f3ed87df3805306f12755271b2b3d60af1eb2a4a06f108123ea0`                            |
| Dataset bytes                  | 2,448,894,336                                                                                 |
| Elapsed time                   | 739,649 ms                                                                                    |
| Peak Node RSS                  | 2,368,560 KiB                                                                                 |
| Observation receipt SHA-256    | `6f0903860438d22ef10839e77121c300919cbe1aac802ac2f06a67aca068f91d`                            |
| Committed JSON SHA-256         | `3d23a3c770b24039a6690f2db8022eb610ffb5b56a9efee031f78b78918b4626`                            |

Implementation provenance: [retained implementation binding](calibration-2026-10-04-implementation-binding.md).

The full report is `reports/observation-2026-10-16-bounded-source.json`. The distinct source
archive is retained outside Git at
`<local-calibration-root>/archives/c90758c2d3922e78d636ab2c9967b80c690bdcd8aeca283cf9f6ecc2cc992352.zip`.
The complete 279,782-byte execution log is retained at
`<local-calibration-root>/logs/2026-10-16-observation.log`
with SHA-256 `5c2ab23b615a3d19f60f227af1f25d7af3cf4f64d8b89c30470cf495583d7386`.

## Transition from 2026-10-15

The archive bytes and dataset bytes are distinct from the preceding complete receipt. Total rows
increased by 621 across 58 categories with changed metrics. No category total decreased. Missing
names remain 29, missing-both-addresses remain zero, and unknown-pair rows increased by 76 to
188,307. The same 23 categories remain empty. Total display-status deltas are +311
administratively operating, -2 suspended, +225 closed, and +87 unverified.

Twenty-three category/status counts have a negative transition. Administratively operating counts
decreased in `15044952` (-3), `15044957` (-1), `15044960` (-4), `15044961` (-1),
`15044978` (-2), `15044983` (-1), `15044985` (-2), `15045000` (-1), `15045003` (-1),
`15045032` (-1), `15045035` (-3), `15045037` (-1), `15045038` (-1), `15045048` (-2),
`15045069` (-1), `15045073` (-1), `15045079` (-2), `15045104` (-10), `15045116` (-2), and
`15096257` (-1). Suspended counts decreased in `15006697` (-1), `15044961` (-1), and
`15045060` (-1).

Collision-group counts decreased in `15044957` (-3), `15044960` (-2), `15044987` (-1),
`15045020` (-1), and `15045116` (-1). Collision-record counts decreased in `15044957` (-1) and
`15045109` (-1). All decreases remain review evidence; no limit, status rule, or baseline is
adopted from them.

All unknown-pair rows remain within the approved exact 68 reviewed 05/06 scopes. The scope set
did not change. Counts increased in nine existing 05 scopes: `15044960` (+2), `15044996` (+1),
`15044997` (+1), `15045000` (+2), `15045032` (+2), `15045058` (+3), `15045059` (+1),
`15045060` (+63), and `15045101` (+1). No reviewed scope count decreased.

An independent reviewer recomputed the archive, receipt, JSON, and log hashes; decoded the
framed log back to the committed JSON; and confirmed completeness, the distinct-archive count,
all transition counts and decreases, the reviewed scopes, and the empty-category set without
discrepancy.

## Interval completion

This is the twenty-second distinct complete daily observation and the twenty-third complete
receipt in the approved 30-Seoul-calendar-day interval beginning 2026-09-17. The evidence-bound
proposal and approval gates are in the
[interval-completion approval packet](calibration-2026-10-16-approval-packet.md). Policy, the
exact allowed-empty list, and the initial baseline remain unapproved. No publication, deployment,
source/status rule, or known-good replacement was accepted.
