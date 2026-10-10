<!--
Purpose:        Record the bounded TASK-008 calibration failure on 2026-10-09
Owner:          Researcher / Planner
Update Trigger: When this recurring failure is diagnosed, corrected, or used in the final calibration proposal
Harness Version: 1.1
-->

# TASK-008 Calibration Failure — 2026-10-09

Status: actionable source-transfer failure recurred after three successful observation days; no
complete observation was produced and calibration remains in progress.

## Attempt receipt

| Item                           | Value                                                              |
| ------------------------------ | ------------------------------------------------------------------ |
| Source commit                  | `c52c1c2ba6971c6470ecbc9d77821744af07f87a`                         |
| Retained implementation anchor | `a51479097c910862e0e63b3ed6d1e7e7fa477a85`                         |
| Runtime                        | Ubuntu 24.04; Node.js 24.19.0; npm 11.17.0; Debian InfoZIP 6.00    |
| Result                         | `observation-rejected`                                             |
| Failure code                   | `transfer_incomplete`                                              |
| Failure message                | `Declared archive size disagrees with range evidence.`             |
| Complete categories            | 0                                                                  |
| Accepted archive               | none                                                               |
| Publication approved           | no                                                                 |
| Execution log SHA-256          | `5abed7ee788809bcd8fa39e81786e2df6962e8cad2a7ff058b62c1ebe0254075` |

Implementation provenance: [retained implementation binding](calibration-2026-10-04-implementation-binding.md).

The complete 126-byte execution log is retained outside Git at
`/Users/sonmyeong-gwan/Documents/open-store-searcher-task008-calibration/logs/2026-10-09-observation.log`.
The bounded collector rejected the transfer before accepting archive bytes because the full
response's declared length disagreed with the immediately preceding range evidence. This is the
same rejection code, message, and log bytes recorded on 2026-10-03 and 2026-10-04. No raw
archive, 195-category metrics, dataset, or independent observation exists for this attempt.

An independent reviewer verified the external log's bytes, hash, and exact rejection content;
confirmed that no 2026-10-09 observation JSON or accepted archive exists; checked the retained
implementation binding; and found no discrepancy in this failure receipt.

## Safety disposition

The recurring failure is retained as calibration evidence under ISS-003 and requires review. No
retry was made during this automation turn, no source or status rule changed, and no policy value
or baseline was inferred. The last complete non-publishing observation remains 2026-10-08. No
publication, deployment, or known-good replacement occurred.
