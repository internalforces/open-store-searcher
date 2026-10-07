<!--
Purpose:        Record the fifteenth current TASK-008 calibration observation and its transition evidence
Owner:          Researcher / Planner
Update Trigger: When this observation is corrected, reviewed, or used in the final calibration proposal
Harness Version: 1.1
-->

# TASK-008 Calibration Observation — 2026-10-07

Status: complete non-publishing observation; calibration remains in progress; four operating-count
decreases paired with closed-count increases are retained as source-correction evidence.

## Observation receipt

| Item                           | Value                                                                                         |
| ------------------------------ | --------------------------------------------------------------------------------------------- |
| Source commit                  | `2e9d133a43f97a729f1a1e302276285590e3284b`                                                    |
| Retained implementation anchor | `a51479097c910862e0e63b3ed6d1e7e7fa477a85`                                                    |
| Runtime                        | Ubuntu 24.04; Node.js 24.19.0; npm 11.17.0; Debian InfoZIP 6.00                               |
| Collection instant             | `2026-10-07T05:42:00.226Z`                                                                    |
| Provider modified date         | `2026-10-07`                                                                                  |
| Archive SHA-256                | `07be68e7fa906a79db07f0f084d9bf80331052674ef84f45716274af804a0aa3`                            |
| Archive bytes                  | 217,022,078                                                                                   |
| Complete categories            | 195                                                                                           |
| Parsed rows                    | 2,947,215                                                                                     |
| Validation result              | `review_required` (the research observation omits operator policy and baseline configuration) |
| Dataset SHA-256                | `6df6ebf87d71d3149f87a9edbb77274ac498fb4529c7a1a735ddaa3082d20b57`                            |
| Dataset bytes                  | 2,445,615,592                                                                                 |
| Elapsed time                   | 526,329 ms                                                                                    |
| Peak Node RSS                  | 2,343,352 KiB                                                                                 |
| Observation receipt SHA-256    | `f65ec746f354823c32edb827f81136cff3605f32edc44ea3fe1a466c050d28d7`                            |
| Committed JSON SHA-256         | `b6d39749b1059654c99bbc760c221288d8a0bcdc854f95a53547af60ba575ab7`                            |

Implementation provenance: [retained implementation binding](calibration-2026-10-04-implementation-binding.md).

The full report is `reports/observation-2026-10-07-bounded-source.json`. The distinct source
archive is retained outside Git at
`/Users/sonmyeong-gwan/Documents/open-store-searcher-task008-calibration/archives/07be68e7fa906a79db07f0f084d9bf80331052674ef84f45716274af804a0aa3.zip`.
The complete 279,693-byte execution log is retained at
`/Users/sonmyeong-gwan/Documents/open-store-searcher-task008-calibration/logs/2026-10-07-observation.log`
with SHA-256 `f1276b5c7393cc0b78a27e386434c90d023aa1c3b59aebd0bb7cb956920c7182`.

## Transition from 2026-10-06

The archive bytes and dataset bytes are distinct from the previous complete observation. Total
rows increased by one. Five categories changed record or status counts. No category total,
collision-group count, or collision-record count decreased. The same 23 categories remain empty.
Missing names remain 29 and missing-both-addresses remain zero. Total display-status deltas are
-65 administratively operating, zero suspended, +66 closed, and zero unverified.

Four categories contain paired status corrections with unchanged row totals: administratively
operating decreased by seven and closed increased by seven in `15006730`; by one and one in
`15044973`; by 15 and 15 in `15044977`; and by 43 and 43 in `15045016`. Category `15045058`
added one administratively operating row. These corrections remain review evidence; no status
rule, limit, or baseline is inferred from them.

Unknown-pair rows remain 187,924. All remain within the approved 68 exact 05/06 pair/category
scopes; no reviewed scope or reviewed pair count changed.

An independent reviewer recomputed the archive, receipt, JSON, and log hashes; decoded the
framed log back to the committed JSON; and confirmed the completeness, distinct-archive count,
corrections, collision metrics, empty-category set, and exact reviewed scopes without discrepancy.

## Continuation

This is the fifteenth distinct complete daily observation in the approved interval beginning
2026-09-17. The four source corrections require review but do not interrupt later
non-publishing observations. Policy, the exact allowed-empty list, and the initial baseline
remain unselected until the interval-completion approval packet.
