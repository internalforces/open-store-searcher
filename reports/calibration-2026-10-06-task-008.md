<!--
Purpose:        Record the fourteenth current TASK-008 calibration observation and its transition evidence
Owner:          Researcher / Planner
Update Trigger: When this observation is corrected, reviewed, or used in the final calibration proposal
Harness Version: 1.1
-->

# TASK-008 Calibration Observation — 2026-10-06

Status: complete non-publishing observation; calibration remains in progress; 33 category/status
decreases, five collision-group decreases, and three collision-record decreases are retained for
review.

## Observation receipt

| Item                           | Value                                                                                         |
| ------------------------------ | --------------------------------------------------------------------------------------------- |
| Source commit                  | `3f85b4344770070c1bae39115c77f01ff2ee5000`                                                    |
| Retained implementation anchor | `a51479097c910862e0e63b3ed6d1e7e7fa477a85`                                                    |
| Runtime                        | Ubuntu 24.04; Node.js 24.19.0; npm 11.17.0; Debian InfoZIP 6.00                               |
| Collection instant             | `2026-10-06T00:09:18.341Z`                                                                    |
| Provider modified date         | `2026-10-06`                                                                                  |
| Archive SHA-256                | `1da388068282355367fbe79f883a5902dda6f02a422e9b58801f538305c47a5b`                            |
| Archive bytes                  | 217,021,922                                                                                   |
| Complete categories            | 195                                                                                           |
| Parsed rows                    | 2,947,214                                                                                     |
| Validation result              | `review_required` (the research observation omits operator policy and baseline configuration) |
| Dataset SHA-256                | `4eae3ef4bad0780b7f49492e4980c2be9102799d10dbc548c3351bd0a619a529`                            |
| Dataset bytes                  | 2,445,615,179                                                                                 |
| Elapsed time                   | 578,472 ms                                                                                    |
| Peak Node RSS                  | 2,348,732 KiB                                                                                 |
| Observation receipt SHA-256    | `d8705eb90368a1462581137637386cca19717fd3482e52295f0127e37d029eaf`                            |
| Committed JSON SHA-256         | `f14a0f186df22ca5ab35b08215255c22aeae8c0fbeb76fc77fdbd9d179c1f746`                            |

Implementation provenance: [retained implementation binding](calibration-2026-10-04-implementation-binding.md).

The full report is `reports/observation-2026-10-06-bounded-source.json`. The distinct source
archive is retained outside Git at
`/Users/sonmyeong-gwan/Documents/open-store-searcher-task008-calibration/archives/1da388068282355367fbe79f883a5902dda6f02a422e9b58801f538305c47a5b.zip`.
The complete 279,687-byte execution log is retained at
`/Users/sonmyeong-gwan/Documents/open-store-searcher-task008-calibration/logs/2026-10-06-observation.log`
with SHA-256 `71eecbee82d23905cde8b27cf13008760e6ad8a653bcf0f53d1a9cb55e742701`.

## Transition from 2026-10-02

No observation was completed on 2026-10-05 because that scheduled turn ended before collection
began; no provider or connectivity failure is inferred. The 2026-10-03 and 2026-10-04 attempts
were rejected before archive acceptance as recorded separately. This comparison therefore spans
four Seoul calendar days and demonstrates a later successful collection without establishing the
historical mismatch's root cause.

The archive bytes and dataset bytes are distinct from the previous complete observation. Total
rows increased by 1,076. Seventy-four categories changed record or status counts, and 77 changed
across all recorded metrics. No category total decreased, and the same 23 categories remain
empty. Missing names remain 29 and missing-both-addresses remain zero. Total display-status
deltas are +261 administratively operating, -1 suspended, +712 closed, and +104 unverified.

Thirty-three category/status counts have a negative transition. Administratively operating
counts decreased in categories `15006730`, `15044952`, `15044964`, `15044976`, `15044977`,
`15044978`, `15044981`, `15044983`, `15044984`, `15044998`, `15045008`, `15045016`,
`15045018`, `15045030`, `15045034`, `15045038`, `15045045`, `15045048`, `15045059`,
`15045079`, `15045081`, `15045089`, `15045092`, `15045101`, `15045104`, `15045107`,
`15045109`, `15045116`, and `15101549`. Suspended counts decreased in categories `15044961`,
`15045024`, `15045035`, and `15045104`. Collision-group counts decreased by one in categories
`15044976`, `15045018`, `15045048`, `15045079`, and `15045116`. Collision-record counts
decreased by one in categories `15045018`, `15045079`, and `15106987`. All decreases remain
review evidence; no limit, status rule, or baseline is selected from them.

Unknown-pair rows increased by 99 to 187,924. All remain within the approved 68 exact 05/06
pair/category scopes; no new, missing, or decreasing reviewed pair scope appeared.

An independent reviewer recomputed the archive, receipt, JSON, and log hashes; decoded the
framed log back to the committed JSON; and confirmed the completeness, distinct-archive count,
transition counts, empty-category set, and exact reviewed scopes without discrepancy.

## Continuation

This is the fourteenth distinct complete daily observation in the approved interval beginning
2026-09-17. The 2026-09-25, 2026-09-29, 2026-10-01, and 2026-10-05 pre-collection gaps remain
explicit. The two failed attempts remain evidence under ISS-003. This successful collection does
not identify their historical cause. Policy, the exact allowed-empty list, and the initial
baseline remain unselected until the interval-completion approval packet.
