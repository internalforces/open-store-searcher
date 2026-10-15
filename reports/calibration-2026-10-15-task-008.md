<!--
Purpose:        Record the twenty-first distinct current TASK-008 calibration observation and its transition evidence
Owner:          Researcher / Planner
Update Trigger: When this observation is corrected, reviewed, or used in the final calibration proposal
Harness Version: 1.1
-->

# TASK-008 Calibration Observation — 2026-10-15

Status: complete distinct-archive non-publishing observation; calibration remains in progress;
fifteen category/status and ten collision-metric decreases are retained for review.

## Observation receipt

| Item                           | Value                                                                                         |
| ------------------------------ | --------------------------------------------------------------------------------------------- |
| Source commit                  | `a9374640a7b764d42b6d3b51d8155db724bf7cc5`                                                    |
| Retained implementation anchor | `a51479097c910862e0e63b3ed6d1e7e7fa477a85`                                                    |
| Runtime                        | Ubuntu 24.04; Node.js 24.19.0; npm 11.17.0; Debian InfoZIP 6.00                               |
| Collection instant             | `2026-10-15T02:31:29.751Z`                                                                    |
| Provider modified date         | `2026-10-15`                                                                                  |
| Archive SHA-256                | `f83b990a62e21e6ea232899c98a2ac3cca32141061b08a18eb03935b245a6b4d`                            |
| Archive bytes                  | 217,262,969                                                                                   |
| Complete categories            | 195                                                                                           |
| Parsed rows                    | 2,950,403                                                                                     |
| Validation result              | `review_required` (the research observation omits operator policy and baseline configuration) |
| Dataset SHA-256                | `4b44f99233a472c54b5a24aa95fa0a7ebb9516197fd120243683296af34207ec`                            |
| Dataset bytes                  | 2,448,359,608                                                                                 |
| Elapsed time                   | 525,501 ms                                                                                    |
| Peak Node RSS                  | 2,308,588 KiB                                                                                 |
| Observation receipt SHA-256    | `f6d9eafedba2cc72f7665513f23b6c1ada32fdc9379d1508bb497e67bf9ecb24`                            |
| Committed JSON SHA-256         | `1afb364fdea1d2a1d6b02007226084147dcc3433ca8edbcce08f350fcc14fed5`                            |

Implementation provenance: [retained implementation binding](calibration-2026-10-04-implementation-binding.md).

The full report is `reports/observation-2026-10-15-bounded-source.json`. The distinct source
archive is retained outside Git at
`/Users/sonmyeong-gwan/Documents/open-store-searcher-task008-calibration/archives/f83b990a62e21e6ea232899c98a2ac3cca32141061b08a18eb03935b245a6b4d.zip`.
The complete 279,743-byte execution log is retained at
`/Users/sonmyeong-gwan/Documents/open-store-searcher-task008-calibration/logs/2026-10-15-observation.log`
with SHA-256 `f1ec34ffa7b4c51713e5931e24bfd980db365464d24915c13d7e7f1ac06fb33b`.

## Transition from 2026-10-14

The archive bytes and dataset bytes are distinct from the preceding complete receipt. Total rows
increased by 624 across 63 categories with changed metrics. No category total decreased. Missing
names remain 29, missing-both-addresses remain zero, and unknown-pair rows increased by 59 to
188,231. The same 23 categories remain empty. Total display-status deltas are +341
administratively operating, -3 suspended, +224 closed, and +62 unverified.

Fifteen category/status counts have a negative transition. Administratively operating counts
decreased by one in `15006741`, five in `15044950`, one in `15044960`, two in `15044975`, two in
`15044976`, two in `15044983`, one in `15044996`, three in `15045032`, one in `15045045`, one in
`15045059`, two in `15045107`, and one in `15101549`. Suspended counts decreased by one in
`15044961` and two in `15045060`. The unverified count decreased by two in `15045109`.

Collision-group counts decreased by three in `15006697`, one in `15045002`, two in `15045024`,
one in `15045029`, one in `15045045`, one in `15045064`, one in `15045073`, one in `15045107`,
and one in `15107030`. `15045064` also has one fewer collision record. All decreases remain
review evidence; no limit, status rule, or baseline is selected from them.

All unknown-pair rows remain within the approved exact 68 reviewed 05/06 scopes. The scope set
did not change. Counts increased in thirteen existing 05 scopes: by three in `15044952`, one in
`15044960`, one in `15044996`, one in `15045000`, one in `15045006`, two in `15045032`, one in
`15045035`, two in `15045048`, two in `15045058`, one in `15045059`, 42 in `15045060`, one in
`15045074`, and one in `15045101`. No reviewed scope count decreased.

An independent reviewer recomputed the archive, receipt, JSON, and log hashes; decoded the
framed log back to the committed JSON; and confirmed completeness, the distinct-archive count,
all transition counts and decreases, the reviewed scopes, and the empty-category set without
discrepancy.

## Continuation

This is the twenty-first distinct complete daily observation and the twenty-second complete
receipt in the approved interval beginning 2026-09-17. Policy, the exact allowed-empty list, and
the initial baseline remain unselected until the interval-completion approval packet. No
publication, deployment, source/status rule, or known-good replacement was accepted.
