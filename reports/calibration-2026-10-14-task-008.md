<!--
Purpose:        Record the twentieth distinct current TASK-008 calibration observation and its transition evidence
Owner:          Researcher / Planner
Update Trigger: When this observation is corrected, reviewed, or used in the final calibration proposal
Harness Version: 1.1
-->

# TASK-008 Calibration Observation — 2026-10-14

Status: complete distinct-archive non-publishing observation; calibration remains in progress;
fourteen category/status and three collision-metric decreases are retained for review.

## Observation receipt

| Item                           | Value                                                                                         |
| ------------------------------ | --------------------------------------------------------------------------------------------- |
| Source commit                  | `be687fa779d45622fc33410a57c5d70d823e6d5f`                                                    |
| Retained implementation anchor | `a51479097c910862e0e63b3ed6d1e7e7fa477a85`                                                    |
| Runtime                        | Ubuntu 24.04; Node.js 24.19.0; npm 11.17.0; Debian InfoZIP 6.00                               |
| Collection instant             | `2026-10-14T04:41:44.452Z`                                                                    |
| Provider modified date         | `2026-10-14`                                                                                  |
| Archive SHA-256                | `3ff2af414cde232179212e5eb1fbece87a170496f4822f0b1226330d7eeb9425`                            |
| Archive bytes                  | 217,206,759                                                                                   |
| Complete categories            | 195                                                                                           |
| Parsed rows                    | 2,949,779                                                                                     |
| Validation result              | `review_required` (the research observation omits operator policy and baseline configuration) |
| Dataset SHA-256                | `b2fdadba9cae869d017b2c7db7672268e5abc8adfe2e13f603b121f792af7868`                            |
| Dataset bytes                  | 2,447,822,518                                                                                 |
| Elapsed time                   | 558,644 ms                                                                                    |
| Peak Node RSS                  | 2,322,220 KiB                                                                                 |
| Observation receipt SHA-256    | `77698dc8c18caaf97f7ddf7dac0798749e0ffc9ec1ee6e8916ba783ae99b80d1`                            |
| Committed JSON SHA-256         | `0c08bda487dd637da08e5bc0da0383456c05ff7ff2717d0e87cc3826f482273c`                            |

Implementation provenance: [retained implementation binding](calibration-2026-10-04-implementation-binding.md).

The full report is `reports/observation-2026-10-14-bounded-source.json`. The distinct source
archive is retained outside Git at
`/Users/sonmyeong-gwan/Documents/open-store-searcher-task008-calibration/archives/3ff2af414cde232179212e5eb1fbece87a170496f4822f0b1226330d7eeb9425.zip`.
The complete 279,684-byte execution log is retained at
`/Users/sonmyeong-gwan/Documents/open-store-searcher-task008-calibration/logs/2026-10-14-observation.log`
with SHA-256 `88fcf5f8708553c50492827b57b60ec849694fb400182a6ba6b51461b32bee27`.

## Transition from 2026-10-13

The archive bytes and dataset bytes are distinct from the preceding complete receipt. Total rows
increased by 693 across 64 categories with changed metrics. No category total decreased. Missing
names remain 29, missing-both-addresses remain zero, and unknown-pair rows increased by 76 to
188,172. The same 23 categories remain empty. Total display-status deltas are +289
administratively operating, +1 suspended, +315 closed, and +88 unverified.

Fourteen category/status counts have a negative transition. Administratively operating counts
decreased by one in `15006697`, two in `15044960`, three in `15045000`, three in `15045016`,
one in `15045017`, one in `15045059`, one in `15045066`, one in `15045068`, one in `15045073`,
two in `15045089`, one in `15045097`, 12 in `15045104`, and two in `15045116`. The suspended
count decreased by one in `15045024`. Collision-group counts decreased by one in `15045017` and
one in `15045109`; `15045017` also has one fewer collision record. All decreases remain review
evidence; no limit, status rule, or baseline is selected from them.

All unknown-pair rows remain within the approved exact 68 reviewed 05/06 scopes. The scope set
did not change. Counts increased in ten existing 05 scopes: by two in `15044952`, two in
`15044960`, one in `15044997`, two in `15045000`, one in `15045024`, four in `15045032`, four in
`15045058`, two in `15045059`, 57 in `15045060`, and one in `15045101`. No reviewed scope count
decreased.

An independent reviewer recomputed the archive, receipt, JSON, and log hashes; decoded the
framed log back to the committed JSON; and confirmed completeness, the distinct-archive count,
all transition counts and decreases, the reviewed scopes, and the empty-category set without
discrepancy.

## Continuation

This is the twentieth distinct complete daily observation and the twenty-first complete receipt
in the approved interval beginning 2026-09-17. Policy, the exact allowed-empty list, and the
initial baseline remain unselected until the interval-completion approval packet. No publication,
deployment, source/status rule, or known-good replacement was accepted.
