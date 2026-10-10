<!--
Purpose:        Record the seventeenth current TASK-008 calibration observation and its transition evidence
Owner:          Researcher / Planner
Update Trigger: When this observation is corrected, reviewed, or used in the final calibration proposal
Harness Version: 1.1
-->

# TASK-008 Calibration Observation — 2026-10-10

Status: complete non-publishing observation after the 2026-10-09 failed attempt; calibration
remains in progress; 19 category/status decreases and three collision-group decreases are retained
for review.

## Observation receipt

| Item                           | Value                                                                                         |
| ------------------------------ | --------------------------------------------------------------------------------------------- |
| Source commit                  | `902ec3db4e5a97d16a90067de17b81cbedac676d`                                                    |
| Retained implementation anchor | `a51479097c910862e0e63b3ed6d1e7e7fa477a85`                                                    |
| Runtime                        | Ubuntu 24.04; Node.js 24.19.0; npm 11.17.0; Debian InfoZIP 6.00                               |
| Collection instant             | `2026-10-10T02:40:30.816Z`                                                                    |
| Provider modified date         | `2026-10-10`                                                                                  |
| Archive SHA-256                | `7658ac7c27aa5a35698a946f4f4deafdea31f86f949277ab75a351030f5f77a6`                            |
| Archive bytes                  | 217,160,112                                                                                   |
| Complete categories            | 195                                                                                           |
| Parsed rows                    | 2,949,032                                                                                     |
| Validation result              | `review_required` (the research observation omits operator policy and baseline configuration) |
| Dataset SHA-256                | `6518b2b7006ee5ae65494a9228158afb5e650fac91ca3d27bba3590102320fc1`                            |
| Dataset bytes                  | 2,447,178,290                                                                                 |
| Elapsed time                   | 501,897 ms                                                                                    |
| Peak Node RSS                  | 2,361,412 KiB                                                                                 |
| Observation receipt SHA-256    | `5d5fe24cc24d56a5cb6eb6f0c4aa024a17464453fca6c1ffce65a4941832de57`                            |
| Committed JSON SHA-256         | `e5c5b013bfd700a9a5fdf08b6200a65ca660ab13d6314ef4c6bc1a2cb9837992`                            |

Implementation provenance: [retained implementation binding](calibration-2026-10-04-implementation-binding.md).

The full report is `reports/observation-2026-10-10-bounded-source.json`. The distinct source
archive is retained outside Git at
`/Users/sonmyeong-gwan/Documents/open-store-searcher-task008-calibration/archives/7658ac7c27aa5a35698a946f4f4deafdea31f86f949277ab75a351030f5f77a6.zip`.
The complete 279,678-byte execution log is retained at
`/Users/sonmyeong-gwan/Documents/open-store-searcher-task008-calibration/logs/2026-10-10-observation.log`
with SHA-256 `66dfd009d843728489042c22b187d2e47b1a6b3596324e5aa9a8903898627689`.

## Transition from 2026-10-08

The 2026-10-09 attempt was rejected before archive acceptance, so this comparison spans two
Seoul calendar days. The archive bytes and dataset bytes are distinct from the previous complete
observation. Total rows increased by 1,158. Sixty-six categories changed record or status counts,
and 76 changed across all recorded metrics. No category total decreased, and the same 23
categories remain empty. Missing names remain 29 and missing-both-addresses remain zero. Total
display-status deltas are +687 administratively operating, +1 suspended, +351 closed, and +119
unverified.

Nineteen category/status counts have a negative transition. Administratively operating counts
decreased in categories `15006697`, `15044960`, `15044964`, `15044972`, `15044976`,
`15044979`, `15045009`, `15045017`, `15045020`, `15045028`, `15045032`, `15045038`,
`15045047`, `15045048`, `15045059`, `15045092`, and `15107032`. Suspended decreased by one
in `15045032`; unverified decreased by four in `15045109`. Collision-group counts decreased by
one in `15045018` and `15045025`, and by two in `15045024`. No collision-record count
decreased. All decreases remain review evidence; no limit, status rule, or baseline is selected
from them.

Unknown-pair rows increased by 114 to 188,096. All remain within the approved 68 exact 05/06
pair/category scopes. Sixteen existing 05 scopes increased; no reviewed scope was added, removed,
or decreased.

An independent reviewer recomputed the archive, receipt, JSON, and log hashes; decoded the
framed log back to the committed JSON; and confirmed the completeness, distinct-archive count,
decreases, empty-category set, and exact reviewed scopes without discrepancy.

## Continuation

This is the seventeenth distinct complete daily observation in the approved interval beginning
2026-09-17. It demonstrates successful collection after the recurring transfer mismatch without
establishing that failure's historical cause. The decreases require review but do not interrupt
later non-publishing observations. Policy, the exact allowed-empty list, and the initial baseline
remain unselected until the interval-completion approval packet.
