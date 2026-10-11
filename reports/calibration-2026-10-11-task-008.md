<!--
Purpose:        Record the complete duplicate-archive TASK-008 calibration observation and its evidence
Owner:          Researcher / Planner
Update Trigger: When this observation is corrected, reviewed, or used in the final calibration proposal
Harness Version: 1.1
-->

# TASK-008 Calibration Observation — 2026-10-11

Status: complete non-publishing observation; its archive is byte-identical to 2026-10-10 and
therefore does not count as an independent observation under the approved protocol.

## Observation receipt

| Item                           | Value                                                                                         |
| ------------------------------ | --------------------------------------------------------------------------------------------- |
| Source commit                  | `24d81d0bff7b43fd481049d6a8550d3266de3f10`                                                    |
| Retained implementation anchor | `a51479097c910862e0e63b3ed6d1e7e7fa477a85`                                                    |
| Runtime                        | Ubuntu 24.04; Node.js 24.19.0; npm 11.17.0; Debian InfoZIP 6.00                               |
| Collection instant             | `2026-10-11T00:06:19.951Z`                                                                    |
| Provider modified date         | `2026-10-10`                                                                                  |
| Archive SHA-256                | `7658ac7c27aa5a35698a946f4f4deafdea31f86f949277ab75a351030f5f77a6`                            |
| Archive bytes                  | 217,160,112                                                                                   |
| Complete categories            | 195                                                                                           |
| Parsed rows                    | 2,949,032                                                                                     |
| Validation result              | `review_required` (the research observation omits operator policy and baseline configuration) |
| Dataset SHA-256                | `45a68aac35cbafe8708883aa749d2ae21f522ae2c2fc0644b1af04360cd4429a`                            |
| Dataset bytes                  | 2,447,178,290                                                                                 |
| Elapsed time                   | 504,618 ms                                                                                    |
| Peak Node RSS                  | 2,356,744 KiB                                                                                 |
| Observation receipt SHA-256    | `5f348995b6b5bc1498b9830f64a06039dea7e9290fa42fbaf8f13bf118216227`                            |
| Committed JSON SHA-256         | `2153af995b20d17bb2fbfce6e9fde496a3f820d3c4f6a29dbf2a3c05087aede0`                            |

Implementation provenance: [retained implementation binding](calibration-2026-10-04-implementation-binding.md).

The full report is `reports/observation-2026-10-11-bounded-source.json`. The complete source
archive is already retained outside Git under its verified content hash at
`/Users/sonmyeong-gwan/Documents/open-store-searcher-task008-calibration/archives/7658ac7c27aa5a35698a946f4f4deafdea31f86f949277ab75a351030f5f77a6.zip`.
The complete 279,690-byte execution log is retained at
`/Users/sonmyeong-gwan/Documents/open-store-searcher-task008-calibration/logs/2026-10-11-observation.log`
with SHA-256 `379f3dd9aa1ee2962dd616f9db8718fbd26ea93354d9fe74d42af9b763fd1add`.

## Transition from 2026-10-10

The source archive SHA-256 and byte length are identical to 2026-10-10. All 195 stable entry
identities, byte counts, row counts, content hashes, and parse outcomes match. All category
metrics and validation diagnostics also match exactly: 2,949,032 rows, 188,096 unknown-pair
rows, the same 23 empty categories, and the same approved exact 68 reviewed 05/06 scopes. No
category count, display-status count, missing-value metric, unknown-pair count, or collision
metric changed or decreased.

The collection instant, per-entry elapsed times, overall resource measurements, observation
receipt, and generated dataset hash are run-specific. The generated dataset byte length remains
2,447,178,290. Those run-specific differences do not make the identical archive an independent
observation.

An independent reviewer recomputed the archive, receipt, JSON, and log hashes; decoded the
framed log back to the committed JSON; and confirmed completeness, matching stable entry and
category evidence, the distinct-archive count, and the unchanged reviewed scopes and empty set
without discrepancy.

## Continuation

This is the eighteenth complete daily receipt but the distinct-observation count remains
seventeen in the approved interval beginning 2026-09-17. No policy, allowed-empty list, baseline,
publication, deployment, source/status rule, or known-good replacement was selected. Continue
the bounded non-publishing schedule through the interval-completion approval packet.
