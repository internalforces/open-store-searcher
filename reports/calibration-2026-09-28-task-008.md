<!--
Purpose:        Record the eleventh current TASK-008 calibration observation and its transition evidence
Owner:          Researcher / Planner
Update Trigger: When this observation is corrected, reviewed, or used in the final calibration proposal
Harness Version: 1.1
-->

# TASK-008 Calibration Observation — 2026-09-28

Status: complete non-publishing observation; calibration remains in progress; three category-level
status corrections and one collision-record decrease are retained for review.

## Observation receipt

| Item                        | Value                                                                                         |
| --------------------------- | --------------------------------------------------------------------------------------------- |
| Source commit               | `eb3b8b6941e495499ca9a0d87d0c14b46d1675e5`                                                    |
| Retained implementation anchor | `a51479097c910862e0e63b3ed6d1e7e7fa477a85` |
| Runtime                     | Ubuntu 24.04; Node.js 24.19.0; npm 11.17.0; Debian InfoZIP 6.00                               |
| Collection instant          | `2026-09-28T00:02:48.876Z`                                                                    |
| Provider modified date      | `2026-09-28`                                                                                  |
| Archive SHA-256             | `1d6d5b5ab83b03f0d8176b8cc7c9787b00e65febc1eee9a4a984b59a38f3cfb5`                            |
| Archive bytes               | 216,782,967                                                                                   |
| Complete categories         | 195                                                                                           |
| Parsed rows                 | 2,944,355                                                                                     |
| Validation result           | `review_required` (the research observation omits operator policy and baseline configuration) |
| Dataset SHA-256             | `e23b82a5f28598c8e63e750c24ffcda110a88e94b24dc4c42ce53e245d765b87`                            |
| Dataset bytes               | 2,443,150,768                                                                                 |
| Elapsed time                | 510,824 ms                                                                                    |
| Peak Node RSS               | 2,346,092 KiB                                                                                 |
| Observation receipt SHA-256 | `9818b97569182481998f4572c7d403f995983cb57e22bc26bf57093a6d0e9193`                            |
| Committed JSON SHA-256      | `0fa5cea82de6d1ab7851788e6fb4679c10ddefdd7c105e1e878ddd4bdd53701b`                            |

Implementation provenance: [retained implementation binding](calibration-2026-10-04-implementation-binding.md).

The full report is `reports/observation-2026-09-28-bounded-source.json`. The distinct source archive
is retained outside Git at
`/Users/sonmyeong-gwan/Documents/open-store-searcher-task008-calibration/archives/1d6d5b5ab83b03f0d8176b8cc7c9787b00e65febc1eee9a4a984b59a38f3cfb5.zip`.
The complete 279,679-byte execution log is retained at
`/Users/sonmyeong-gwan/Documents/open-store-searcher-task008-calibration/logs/2026-09-28-observation.log`
with SHA-256 `2a05d408e5a8133a63f1c1596b61255158d300f247e29d30ccd0fc8d5ae7e4bc`.

## Transition from 2026-09-27

The archive bytes and dataset bytes are distinct from the previous observation. Total rows
increased by six. Three categories changed record or status counts, while category `15045016`
also decreased its collision-record count by one. No category total decreased, and the same 23
categories remain empty. Missing names remain 29 and missing-both-addresses remain zero. Total
display-status deltas are -13 administratively operating, no suspended change, +19 closed, and no
unverified change.

Three categories contain a negative display-status transition that must remain visible during
calibration. Administratively operating counts decreased by one in category `15006730`, by ten
in `15044977`, and by two in `15045060`. Category `15045016` has one fewer collision record
without a record-count or display-status change. No limit, status rule, or baseline is selected
from these corrections.

Unknown-pair rows remain 187,653. All remain within the approved 68 exact 05/06 pair/category
scopes; no new, missing, or out-of-scope reviewed pair appeared.

## Continuation

This is the eleventh distinct complete daily observation in the approved interval beginning
2026-09-17, with the 2026-09-25 gap retained explicitly. The decreases and corrections require
review as calibration evidence, but do not interrupt later non-publishing observations. Policy,
the exact allowed-empty list, and the initial baseline remain unselected until the
interval-completion approval packet.
