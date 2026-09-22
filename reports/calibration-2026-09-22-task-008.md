<!--
Purpose:        Record the sixth current TASK-008 calibration observation and its transition evidence
Owner:          Researcher / Planner
Update Trigger: When this observation is corrected, reviewed, or used in the final calibration proposal
Harness Version: 1.1
-->

# TASK-008 Calibration Observation — 2026-09-22

Status: complete non-publishing observation; calibration remains in progress; three category-level
status corrections are retained for review.

## Observation receipt

| Item | Value |
|---|---|
| Source commit | `a51479097c910862e0e63b3ed6d1e7e7fa477a85` |
| Runtime | Ubuntu 24.04; Node.js 24.19.0; npm 11.17.0; Debian InfoZIP 6.00 |
| Collection instant | `2026-09-22T00:03:36.857Z` |
| Provider modified date | `2026-09-22` |
| Archive SHA-256 | `4499866d702a449eef6478f2221d45f35ecaa36c23164e789a8a39eb1ea0d7d1` |
| Archive bytes | 216,665,468 |
| Complete categories | 195 |
| Parsed rows | 2,942,813 |
| Validation result | `review_required` (the research observation omits operator policy and baseline configuration) |
| Dataset SHA-256 | `fbad6734be92b3070ebbf752c93d1798d0da422c17e3bc0744d28b286ede8641` |
| Dataset bytes | 2,441,822,149 |
| Elapsed time | 549,835 ms |
| Peak Node RSS | 2,340,948 KiB |
| Observation receipt SHA-256 | `596a72cd83cf2319f98eec58e573585df2f5a5aed21d6e27a5df519eb8e0f189` |
| Committed JSON SHA-256 | `e657e0bb75b5ec2cf561cc0c3e84f30936d7097389b586390f2706e968d1e2de` |

The full report is `reports/observation-2026-09-22-bounded-source.json`. The distinct source archive
is retained outside Git at
`/Users/sonmyeong-gwan/Documents/open-store-searcher-task008-calibration/archives/4499866d702a449eef6478f2221d45f35ecaa36c23164e789a8a39eb1ea0d7d1.zip`.
The complete 279,687-byte execution log is retained at
`/Users/sonmyeong-gwan/Documents/open-store-searcher-task008-calibration/logs/2026-09-22-observation.log`
with SHA-256 `18838783f7e6aa259784dc71b730994834f5aa175099fbd52ed433e3033573bc`.

## Transition from 2026-09-21

The archive bytes and dataset bytes are distinct from the previous observation. Total rows
increased by four. Six category metrics changed, no category total decreased, and the same 23
categories remain empty. Missing names remain 29 and missing-both-addresses remain zero. Total
display-status deltas are -121 administratively operating, zero suspended, +125 closed, and zero
unverified.

Three categories contain negative display-status transitions that must remain visible during
calibration. Category `15006730` changed nine administratively operating rows to closed; category
`15044977` changed 25 administratively operating rows to closed; and category `15045016` changed
89 administratively operating rows to closed while adding one net row. Other category changes
offset two of these decreases at the total level. No limit, status rule, or baseline is selected
from the corrections.

Unknown-pair rows remain 187,498. All remain within the approved 68 exact 05/06 pair/category
scopes; no new, missing, or out-of-scope reviewed pair appeared.

## Continuation

This is the sixth distinct complete daily observation in the approved interval beginning
2026-09-17. The status corrections require review as calibration evidence, but do not interrupt
later non-publishing observations. Policy, the exact allowed-empty list, and the initial baseline
remain unselected until the interval-completion approval packet.
