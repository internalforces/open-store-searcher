<!--
Purpose:        Record the eighteenth distinct current TASK-008 calibration observation and its transition evidence
Owner:          Researcher / Planner
Update Trigger: When this observation is corrected, reviewed, or used in the final calibration proposal
Harness Version: 1.1
-->

# TASK-008 Calibration Observation — 2026-10-12

Status: complete distinct-archive non-publishing observation; calibration remains in progress;
six category/status decreases and one collision-group decrease are retained for review.

## Observation receipt

| Item                           | Value                                                                                         |
| ------------------------------ | --------------------------------------------------------------------------------------------- |
| Source commit                  | `eca8448f9b4ebc41c0ed4708130c3a7fac9854d2`                                                    |
| Retained implementation anchor | `a51479097c910862e0e63b3ed6d1e7e7fa477a85`                                                    |
| Runtime                        | Ubuntu 24.04; Node.js 24.19.0; npm 11.17.0; Debian InfoZIP 6.00                               |
| Collection instant             | `2026-10-12T01:39:26.808Z`                                                                    |
| Provider modified date         | `2026-10-12`                                                                                  |
| Archive SHA-256                | `a78f74e257076f3c639a3d4cb6b76f2f503c9cbc970e32e602e50cc6cf5b3710`                            |
| Archive bytes                  | 217,166,525                                                                                   |
| Complete categories            | 195                                                                                           |
| Parsed rows                    | 2,949,067                                                                                     |
| Validation result              | `review_required` (the research observation omits operator policy and baseline configuration) |
| Dataset SHA-256                | `a6889d95aaa36be79082eeb95f1758507a44302d1147898759cafac2d2db4219`                            |
| Dataset bytes                  | 2,447,207,705                                                                                 |
| Elapsed time                   | 511,762 ms                                                                                    |
| Peak Node RSS                  | 2,340,912 KiB                                                                                 |
| Observation receipt SHA-256    | `7d061b8520173e8a0fb669f34912a4357af4f60ba359894f88ae7d67b00b9423`                            |
| Committed JSON SHA-256         | `20f93a65f673c74e4407ebb2bb9cca04f58ac9274435a90adae39d2c121973c1`                            |

Implementation provenance: [retained implementation binding](calibration-2026-10-04-implementation-binding.md).

The full report is `reports/observation-2026-10-12-bounded-source.json`. The distinct source
archive is retained outside Git at
`<local-calibration-root>/archives/a78f74e257076f3c639a3d4cb6b76f2f503c9cbc970e32e602e50cc6cf5b3710.zip`.
The complete 279,684-byte execution log is retained at
`<local-calibration-root>/logs/2026-10-12-observation.log`
with SHA-256 `7b5808e205ece3b319718a9d138cd0229fce92ffa48f3353a09956d3d521c918`.

## Transition from 2026-10-11

The archive bytes and dataset bytes are distinct from the preceding complete receipt. Total rows
increased by 35 across 14 categories with changed metrics. No category total decreased. Missing
names remain 29, missing-both-addresses remain zero, and unknown-pair rows remain 188,096. The
same 23 categories remain empty. Total display-status deltas are -94 administratively operating,
zero suspended, +129 closed, and zero unverified.

Six category/status counts have a negative transition. Administratively operating counts
decreased by 38 in `15006730`, seven in `15044973`, 34 in `15044977`, two in `15044985`, 33
in `15045016`, and one in `15045024`. The paired closed counts increased by 39, eight, 34, two,
36, and one respectively. Collision-group count decreased by two in `15045017`; no
collision-record count decreased. All decreases remain review evidence; no limit, status rule,
or baseline is selected from them.

All unknown-pair rows remain within the approved exact 68 reviewed 05/06 scopes. No reviewed
scope was added, removed, increased, or decreased.

An independent reviewer recomputed the archive, receipt, JSON, and log hashes; decoded the
framed log back to the committed JSON; and confirmed completeness, the distinct-archive count,
all transition counts and decreases, the unchanged reviewed scopes, and the empty-category set
without discrepancy.

## Continuation

This is the eighteenth distinct complete daily observation and the nineteenth complete receipt
in the approved interval beginning 2026-09-17. Policy, the exact allowed-empty list, and the
initial baseline remain unselected until the interval-completion approval packet. No publication,
deployment, source/status rule, or known-good replacement was accepted.
