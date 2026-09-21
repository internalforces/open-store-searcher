<!--
Purpose:        Summarize the bounded calibration status and evidence-integrity check
Owner:          Researcher / Documenter
Update Trigger: When this dated check is corrected or its evidence is superseded
Harness Version: 1.1
-->

# Calibration status check — 2026-09-20

Disposition: the requested status check is complete; overall TASK-008 remains incomplete.
This is a local evidence/status check, not an independent final review or production acceptance.
Related requirements: FR-08, FR-13, FR-14; TASK-008 calibration and freshness evidence.

## Evidence checked

The inspected calibration branch was `codex/task-008-calibration` at
`fe81399508fcb8c1ba6207302a966d59fe6545b8`. A fresh GitHub branch read matched that commit.
The local automation configuration was ACTIVE with a daily 09:00 schedule. Observation
receipts establish completion on each of the four Seoul calendar days; they do not establish
that every invocation started on schedule. The reason for the September 19 delay was not checked.

| Seoul date | Collection time (KST) | Parsed rows | Daily delta | Receipt |
|---|---|---:|---:|---|
| 2026-09-17 | 12:56 | 2,941,453 | Interval start | [Day 1](calibration-2026-09-17-task-008.md) |
| 2026-09-18 | 09:02 | 2,941,941 | +488 | [Day 2](calibration-2026-09-18-task-008.md) |
| 2026-09-19 | 14:15 | 2,942,404 | +463 | [Day 3](calibration-2026-09-19-task-008.md) |
| 2026-09-20 | 09:01 | 2,942,802 | +398 | [Day 4](calibration-2026-09-20-task-008.md) |

All four observations cover 195 categories and have distinct archive hashes. Recomputed SHA-256
values for all four retained archives, committed JSON reports, and complete execution logs match
the corresponding receipts: 12 of 12 integrity checks passed. Archives remain outside Git.
No additional source download or observation was performed during this check.

The receipts retain one category-total decrease on September 18 (`15045026`, 95 to 94 rows)
and category-level status corrections on later days. These signals require calibration review;
they do not establish an application defect or justify changing display-status mapping.
Empty categories remain 23, missing names remain 29, and missing-both-addresses remain zero.
The daily receipts report no new or out-of-scope reviewed raw-status pairs. These conclusions
use existing metrics and pair assessments; the source archives were not parsed again here.

## Publication is separate

The fresh GitHub jobs response for
[scheduled refresh run 35475385424](https://github.com/internalforces/open-store-searcher/actions/runs/35475385424)
shows failure at `Require reviewed quality configuration`; subsequent preparation steps and
`deploy` were skipped. This is a publication prerequisite failure, not a failure of the daily
non-publishing calibration observation. No workflow or deployment was dispatched in this check.

## Remaining acceptance gates

Four daily observations are available in the approved 30-Seoul-calendar-day interval.
Counting September 17 as day 1 makes October 16 day 30; the date alone does not prove completion.
The interval evidence must be assessed, including duplicates, failures, decreases and corrections.
Then the numeric policy, exact allowed-empty list and initial baseline require explicit human
approval, followed by accepted complete validation and independent final review.
TASK-009/010 publication/recovery and TASK-021 release gates remain open.

The user authorized summarizing, committing and pushing this check on the existing calibration
branch. No new policy decision, source/status contract change, task-completion waiver, merge,
or deployment is authorized or claimed. Application tests were not rerun for this prose-only
update; no historical test evidence is relabeled as a current run.
