<!--
Purpose:        Record the ninth current TASK-008 calibration observation and its transition evidence
Owner:          Researcher / Planner
Update Trigger: When this observation is corrected, reviewed, or used in the final calibration proposal
Harness Version: 1.1
-->

# TASK-008 Calibration Observation — 2026-09-26

Status: complete non-publishing observation; calibration remains in progress; 12 category-level
status corrections are retained for review.

## Observation receipt

| Item                        | Value                                                                                         |
| --------------------------- | --------------------------------------------------------------------------------------------- |
| Source commit               | `118d10f7ac2b1c42d370b69798ef6d81ed828f97`                                                    |
| Runtime                     | Ubuntu 24.04; Node.js 24.19.0; npm 11.17.0; Debian InfoZIP 6.00                               |
| Collection instant          | `2026-09-26T14:20:54.376Z`                                                                    |
| Provider modified date      | `2026-09-26`                                                                                  |
| Archive SHA-256             | `2e3dc3acd818938056ee1dca438bffaffb58a1490994976e99b1fe9b738ec49c`                            |
| Archive bytes               | 216,779,714                                                                                   |
| Complete categories         | 195                                                                                           |
| Parsed rows                 | 2,944,343                                                                                     |
| Validation result           | `review_required` (the research observation omits operator policy and baseline configuration) |
| Dataset SHA-256             | `6ef25a5db4acd60ae2f7dfb625975b68928c42e80465f69aa2092d91b7425109`                            |
| Dataset bytes               | 2,443,140,939                                                                                 |
| Elapsed time                | 548,262 ms                                                                                    |
| Peak Node RSS               | 2,315,832 KiB                                                                                 |
| Observation receipt SHA-256 | `c552d29e570d4463918f58ba5d906cb36f42432c40112eb6526b0b339418c203`                            |
| Committed JSON SHA-256      | `a72e5c14fe3ba414f44fefc728503e82e63b86cb46e098fa05c1930cdb11b3fc`                            |

The full report is `reports/observation-2026-09-26-bounded-source.json`. The distinct source archive
is retained outside Git at
`/Users/sonmyeong-gwan/Documents/open-store-searcher-task008-calibration/archives/2e3dc3acd818938056ee1dca438bffaffb58a1490994976e99b1fe9b738ec49c.zip`.
The complete 279,698-byte execution log is retained at
`/Users/sonmyeong-gwan/Documents/open-store-searcher-task008-calibration/logs/2026-09-26-observation.log`
with SHA-256 `9191e3fc7ca9d079c3d400d261991cb80269b3fbff850f88e928b1380207359c`.
The observation path removed its temporary staging directory before the archive copy was made.
A bounded archive-only retrieval immediately afterward produced the exact observed SHA-256 and byte
length; that byte-identical file is the retained archive and is not an independent observation.

## Transition from 2026-09-24

No observation was completed on 2026-09-25 because the scheduled collection turn was interrupted
before collection began; no provider or connectivity failure was observed. This comparison
therefore spans two Seoul calendar days.

The archive bytes and dataset bytes are distinct from the previous observation. Total rows
increased by 458. Forty-six categories changed, no category total decreased, and the same 23
categories remain empty. Missing names remain 29 and missing-both-addresses remain zero. Total
display-status deltas are +200 administratively operating, -1 suspended, +210 closed, and +49
unverified.

Twelve category/status counts have a negative transition that must remain visible during
calibration. Administratively operating counts decreased in categories `15006730`, `15044952`,
`15044964`, `15044972`, `15044977`, `15044985`, `15045038`, `15045079`,
`15045104`, `15045109`, and `15101546`. Category `15045024` has one fewer suspended
row. No limit, status rule, or baseline is selected from these corrections.

Unknown-pair rows increased by 36 to 187,653. All remain within the approved 68 exact
05/06 pair/category scopes; no new, missing, or out-of-scope reviewed pair appeared.

## Continuation

This is the ninth distinct complete daily observation in the approved interval beginning
2026-09-17, with the 2026-09-25 gap retained explicitly. The status corrections require review as
calibration evidence, but do not interrupt later non-publishing observations. Policy, the exact
allowed-empty list, and the initial baseline remain unselected until the interval-completion
approval packet.
