<!--
Purpose:        Track the single active implementation task and its acceptance criteria
Owner:          Implementer / Planner
Update Trigger: When a task starts, is blocked, completes, or changes owner
Harness Version: 1.1
-->

# Active Tasks — open-store-searcher

_Last updated: 2026-10-18_

## In Progress

No implementation task is active. TASK-008 was already complete in merged PR #31; its quality
acceptance was independently reconfirmed on 2026-10-18 after explicit approval of
its exact conservative policy, 23 allowed-empty IDs and initial baseline; fresh complete-source
validation; local failure-preservation checks; pinned full verification; and independent
**Approved** final review. See the [completed task](completed.md#task-008-final-quality-acceptance--2026-10-18),
[verification report](../reports/test-2026-10-18-task-008-final.md) and
[final review](../reports/review-2026-10-18-task-008-final.md).

The evidence is committed in PR #32 on `codex/task-008-calibration`: original acceptance record
`2be9077de3b04f34e17e9297d43d86f099289993` and merged-main reconciliation
`2801d8e89fbe371fdc9e6e3e91383603065c1298`. Use the repository-relative reports above and the
[delivery record](../reports/delivery-2026-10-18-task-008.md), not a host-local checkout path.
Preserve unrelated checkouts and work. The current user-approved continuation addresses PR #32's
four review findings, adds regressions and fresh preservation verification, then commits/pushes
and checks the exact final-head CI. Current evidence:
[review verification](../reports/test-2026-10-18-pr32-remediation.md),
[corrected preservation receipt](../reports/preservation-2026-10-18-pr32-remediation.json),
[independent review](../reports/review-2026-10-18-pr32-remediation.md).
It does not activate TASK-009/010 or authorize merge,
auto-merge, workflow dispatch, publication/deployment, recurring collection or security changes.

## Next eligible work — TASK-009, then TASK-010

TASK-009/010 remain paused and incomplete; no next task is activated by TASK-008 completion.
The quality-policy/bootstrap approval dependency is now resolved. The collection-date staging
and workflow foundations remain implemented, with their dated verification and security evidence.
The following operational/publication gates remain:

- [ ] Complete TASK-009 atomic-publication/failure-injection and independent acceptance.
- [ ] Prepare reviewed operational `publication/config.json` with a verified destination and
      the exact approved quality objects; validate deployed-baseline/bootstrap reconciliation.
- [ ] Re-read actual repository/environment protections before any approved operation.
- [ ] Complete TASK-010 actual hosted ingestion/publication/recovery and independent review.
- [ ] Obtain concrete action-time approval before any publication/deployment.

The validation-only [`publication/validation-config.json`](../publication/validation-config.json)
contains approved inputs and no destination. The workflow entry point remains absent and
publication has not been enabled. TASK-008's offline accepted replay is not a hosted bootstrap,
public recovery exercise or operational reliability measurement.

Design and historical foundation evidence:
[publication design](../docs/superpowers/specs/2026-09-12-task-009-010-publication-design.md),
[foundation verification](../reports/test-2026-09-12-task-009-010.md),
[hosted CI](../reports/test-2026-09-12-publication-hosted.md),
[final Actions review](../reports/security-2026-09-18-task-019-final.md), and
[operator contract](../publication/README.md).

## Remaining release boundaries

Collection-date operation is approved; source coverage is still explicitly unverified. The
79 nonempty zero-change categories and narrow JSON budget may reject normal future updates;
new tolerance requires evidence and explicit approval. Retained calibration gaps, duplicate
receipt and all three transfer failures remain evidence; ISS-003 remains unresolved.

TASK-018/021 retain mobile/physical-device/hosted performance gates. TASK-021 is ineligible until
production/publication/recovery and other release prerequisites pass. No whole FR or milestone
is closed by TASK-008 alone. M1/M2/M3 and their TASK-026 handbook/human-language gates remain open;
no handbook was accessed or changed during this work.

TASK-019 and TASK-020 remain complete within their recorded review scope. The original TASK-020
review excludes the Korean handbook and predates README/security-contact follow-ups; those
later follow-ups have local verification only, not independent final-head approval.


## Retained merged-main collector state

PR #31 merged as `c521467` before this delivery. Its bounded ISS-003 client recovery and numeric
diagnostics remain intact. The provider inconsistency is reproduced and remains open upstream;
strict equality/size/hash/ZIP/schema gates remain unchanged. See the
[issue review](../reports/review-2026-10-17-iss-003.md) and
[PR #31 readiness](../reports/readiness-2026-10-17-pr31.md). This continuation adds fresh local
quality evidence and does not undo the prior adoption, client mitigation or independent reviews.
