<!--
Purpose:        Record the sixteenth current TASK-008 calibration observation and its transition evidence
Owner:          Researcher / Planner
Update Trigger: When this observation is corrected, reviewed, or used in the final calibration proposal
Harness Version: 1.1
-->

# TASK-008 Calibration Observation — 2026-10-08

Status: complete non-publishing observation; calibration remains in progress; 21 category/status
decreases, four collision-group decreases, and two collision-record decreases are retained for
review.

## Observation receipt

| Item                           | Value                                                                                         |
| ------------------------------ | --------------------------------------------------------------------------------------------- |
| Source commit                  | `e74e65debcd6aff8718e9b9ddedc74b307de5954`                                                    |
| Retained implementation anchor | `a51479097c910862e0e63b3ed6d1e7e7fa477a85`                                                    |
| Runtime                        | Ubuntu 24.04; Node.js 24.19.0; npm 11.17.0; Debian InfoZIP 6.00                               |
| Collection instant             | `2026-10-08T05:01:47.873Z`                                                                    |
| Provider modified date         | `2026-10-08`                                                                                  |
| Archive SHA-256                | `9e3690f17227bdd5bbe77a6432f688de8dc7a07d06c5bf2e06d29b3ed907a22b`                            |
| Archive bytes                  | 217,058,182                                                                                   |
| Complete categories            | 195                                                                                           |
| Parsed rows                    | 2,947,874                                                                                     |
| Validation result              | `review_required` (the research observation omits operator policy and baseline configuration) |
| Dataset SHA-256                | `685f70453b604b8240477de89052ca3629eb8fe484a148933d56a9397e498fe6`                            |
| Dataset bytes                  | 2,446,180,373                                                                                 |
| Elapsed time                   | 535,629 ms                                                                                    |
| Peak Node RSS                  | 2,345,760 KiB                                                                                 |
| Observation receipt SHA-256    | `da71610d3f5a3486c9b8441f6cb793896afde80179b555e0e724655730c2bf4a`                            |
| Committed JSON SHA-256         | `b6beec462b77197de0d92778439fc51626e96251a2a9e88a800fd76e6b7f0764`                            |

Implementation provenance: [retained implementation binding](calibration-2026-10-04-implementation-binding.md).

The full report is `reports/observation-2026-10-08-bounded-source.json`. The distinct source
archive is retained outside Git at
`/Users/sonmyeong-gwan/Documents/open-store-searcher-task008-calibration/archives/9e3690f17227bdd5bbe77a6432f688de8dc7a07d06c5bf2e06d29b3ed907a22b.zip`.
The complete 279,698-byte execution log is retained at
`/Users/sonmyeong-gwan/Documents/open-store-searcher-task008-calibration/logs/2026-10-08-observation.log`
with SHA-256 `84b80fad8ceb076631a78b6cb935086bd46cf73c34fdb356319eedadebd61d70`.

## Transition from 2026-10-07

The archive bytes and dataset bytes are distinct from the previous complete observation. Total
rows increased by 659. Sixty-four categories changed across all recorded metrics. No category
total decreased, and the same 23 categories remain empty. Missing names remain 29 and
missing-both-addresses remain zero. Total display-status deltas are +321 administratively
operating, +1 suspended, +275 closed, and +62 unverified.

Twenty-one category/status counts have a negative transition. Administratively operating counts
decreased in categories `15006697`, `15044952`, `15044960`, `15044964`, `15044976`,
`15044983`, `15044984`, `15045013`, `15045024`, `15045032`, `15045035`, `15045048`,
`15045057`, `15045073`, `15045079`, `15045089`, `15045099`, `15045104`, `15045109`,
and `15045112`. Suspended decreased by two in `15045060`. Collision-group counts decreased by
one in `15045064` and `15045073`, and by two in `15107029` and `15107032`.
Collision-record counts decreased by one in `15045028` and `15045064`. All decreases remain
review evidence; no limit, status rule, or baseline is selected from them.

Unknown-pair rows increased by 58 to 187,982. All remain within the approved 68 exact 05/06
pair/category scopes. Six existing 05 scopes increased; no reviewed scope was added, removed, or
decreased.

An independent reviewer recomputed the archive, receipt, JSON, and log hashes; decoded the
framed log back to the committed JSON; and confirmed the completeness, distinct-archive count,
decreases, empty-category set, and exact reviewed scopes without discrepancy.

## Continuation

This is the sixteenth distinct complete daily observation in the approved interval beginning
2026-09-17. The decreases require review but do not interrupt later non-publishing observations.
Policy, the exact allowed-empty list, and the initial baseline remain unselected until the
interval-completion approval packet.
