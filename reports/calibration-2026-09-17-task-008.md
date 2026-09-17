<!--
Purpose:        Record the approved TASK-008 calibration protocol and its first current observation
Owner:          Researcher / Planner
Update Trigger: When a daily observation, calibration failure, policy proposal, or approval changes
Harness Version: 1.1
-->

# TASK-008 Calibration Observation — 2026-09-17

Status: complete non-publishing observation; calibration remains in progress.

## Approved protocol

The user's instruction to complete TASK-008 according to the completion plan activates the
recommended scope disposition and the conservative 30-Seoul-calendar-day protocol beginning
2026-09-17. Retain distinct complete daily archives, exclude identical bytes from independent
observation counts, and retain failures, decreases, and source corrections. Mobile performance,
Pages publication/recovery, repository settings, and 30-day release reliability remain with
their existing owner tasks.

This approval does not select unseen numeric policy values, approve the 23 empty-category
candidates, select the initial baseline, publish data, or deploy the site. Those gates remain
explicit under ADR-014 and the project constitution.

## Observation receipt

| Item | Value |
|---|---|
| Source commit | `e5ba5c6413e37e8e192789586f5b02e7b9dcde38` |
| Runtime | Ubuntu 24.04; Node.js 24.19.0; npm 11.17.0; Debian InfoZIP 6.00 |
| Collection instant | `2026-09-17T03:56:19.438Z` |
| Provider modified date | `2026-09-17` |
| Archive SHA-256 | `98e4a29352a4a6e39ddf58e50730ba1d2294dd402a88e96c2de34c32f388bf02` |
| Archive bytes | 216,557,847 |
| Complete categories | 195 |
| Parsed rows | 2,941,453 |
| Validation result | `review_required` (research observation omitted operator configuration, so pair, policy, baseline, and source-coverage reviews are present) |
| Dataset SHA-256 | `4d572b11ff25bbfc446828bb623310913eeafaef5ae196237bf21f7f59ed1512` |
| Dataset bytes | 2,440,652,317 |
| Elapsed time | 518,641 ms |
| Peak Node RSS | 2,352,400 KiB |
| Observation receipt SHA-256 | `cf35deccaa973467d8671385180801c0ff00da6d067b629308333ac87593e239` |
| Committed JSON SHA-256 | `392fc9a70f04dc81d8aaaac6aa0c6dbfbdb53743bd29d3d759b00e57b3ede37a` |

The full 195-category report is
`reports/observation-2026-09-17-bounded-source.json`. The source archive is deliberately outside
Git at
`/Users/sonmyeong-gwan/Documents/open-store-searcher-task008-calibration/archives/98e4a29352a4a6e39ddf58e50730ba1d2294dd402a88e96c2de34c32f388bf02.zip`;
its copied bytes re-hash to the receipt above. The complete 279,680-byte execution log is retained
beside it with SHA-256
`109ef1c3cd7c5e1066ed31d4710e1b8e688d7ff5baf81b70ca238e96fc42bbd7`.

## Transition from 2026-09-13

The new archive is distinct from the retained 2026-09-13 archive. Total rows increased by 1,049:
58 categories increased, 137 were unchanged, and none decreased in total count. The same 23
categories remain empty. Missing names remain 29 and missing-both-addresses remain zero.

Display-status deltas are +299 administratively operating, -1 suspended, +622 closed, and +129
unverified. The suspended decrease is retained as a source-status correction signal even though
no category total decreased. Unknown raw-pair rows increased by 126. A separate exact comparison
found all 187,348 rows across 68 pair/category scopes match the approved reviewed-unverified
contract, with no new or out-of-scope pair.

This third all-positive total-count transition still does not justify numeric limits. It adds a
current, contract-compatible observation to the calibration series and preserves the correction
that earlier observations did not contain.

## Continuation

The Codex heartbeat automation `task-008-30-day-quality-calibration` runs daily at 09:00 local
time. It is restricted to non-publishing observation, external source-archive retention, bounded
metadata commits on the existing branch, and notification only for actionable failure,
decrease/correction review, or interval completion. At interval completion it must prepare the
policy, empty-category, and baseline proposal, then pause pending explicit human approval.
