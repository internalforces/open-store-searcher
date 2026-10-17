<!--
Purpose:        Record the nineteenth distinct current TASK-008 calibration observation and its transition evidence
Owner:          Researcher / Planner
Update Trigger: When this observation is corrected, reviewed, or used in the final calibration proposal
Harness Version: 1.1
-->

# TASK-008 Calibration Observation — 2026-10-13

Status: complete distinct-archive non-publishing observation; calibration remains in progress;
six category/status decreases are retained for review.

## Observation receipt

| Item                           | Value                                                                                         |
| ------------------------------ | --------------------------------------------------------------------------------------------- |
| Source commit                  | `786c242e66a6693bf39fd07700f3d1d0947ccb4e`                                                    |
| Retained implementation anchor | `a51479097c910862e0e63b3ed6d1e7e7fa477a85`                                                    |
| Runtime                        | Ubuntu 24.04; Node.js 24.19.0; npm 11.17.0; Debian InfoZIP 6.00                               |
| Collection instant             | `2026-10-13T08:53:54.165Z`                                                                    |
| Provider modified date         | `2026-10-13`                                                                                  |
| Archive SHA-256                | `7eb7904f62554e8989973e5b4bd4dfe931bf53454c0a3a392c8634d98bedfe5d`                            |
| Archive bytes                  | 217,167,475                                                                                   |
| Complete categories            | 195                                                                                           |
| Parsed rows                    | 2,949,086                                                                                     |
| Validation result              | `review_required` (the research observation omits operator policy and baseline configuration) |
| Dataset SHA-256                | `81211801bec864f5d130ba290f6d32731b39a8d7f37edf1434b3ec97b5064f53`                            |
| Dataset bytes                  | 2,447,223,951                                                                                 |
| Elapsed time                   | 527,054 ms                                                                                    |
| Peak Node RSS                  | 2,332,724 KiB                                                                                 |
| Observation receipt SHA-256    | `17fba07e1a0118fff96268c421da57430a2cec7c7080ab8381233434fe8acece`                            |
| Committed JSON SHA-256         | `dfc2e783e5cfcd0b7be6f7312bfa20163ef578ca7d919f8bafa7da9a71f9546e`                            |

Implementation provenance: [retained implementation binding](calibration-2026-10-04-implementation-binding.md).

The full report is `reports/observation-2026-10-13-bounded-source.json`. The distinct source
archive is retained outside Git at
`<local-calibration-root>/archives/7eb7904f62554e8989973e5b4bd4dfe931bf53454c0a3a392c8634d98bedfe5d.zip`.
The complete 279,691-byte execution log is retained at
`<local-calibration-root>/logs/2026-10-13-observation.log`
with SHA-256 `45ea4eacb336b1e6c6bfa96b6a72f4dd51cc7a04e1249747925ee9ea8e9c0c9c`.

## Transition from 2026-10-12

The archive bytes and dataset bytes are distinct from the preceding complete receipt. Total rows
increased by 19 across 11 categories with changed metrics. No category total or collision metric
decreased. Missing names remain 29, missing-both-addresses remain zero, and unknown-pair rows
remain 188,096. The same 23 categories remain empty. Total display-status deltas are -40
administratively operating, zero suspended, +56 closed, and +3 unverified.

Six category/status counts have a negative transition. Administratively operating counts
decreased by three in `15006730`, one in `15044973`, 25 in `15044977`, one in `15044997`, 25
in `15045016`, and three in `15045104`. The first five have equal paired closed-count increases;
`15045104` has a paired unverified-count increase of three. All decreases remain review evidence;
no limit, status rule, or baseline is selected from them.

All unknown-pair rows remain within the approved exact 68 reviewed 05/06 scopes. No reviewed
scope was added, removed, increased, or decreased.

An independent reviewer recomputed the archive, receipt, JSON, and log hashes; decoded the
framed log back to the committed JSON; and confirmed completeness, the distinct-archive count,
all transition counts and decreases, the unchanged reviewed scopes, and the empty-category set
without discrepancy.

## Continuation

This is the nineteenth distinct complete daily observation and the twentieth complete receipt in
the approved interval beginning 2026-09-17. Policy, the exact allowed-empty list, and the initial
baseline remain unselected until the interval-completion approval packet. No publication,
deployment, source/status rule, or known-good replacement was accepted.
