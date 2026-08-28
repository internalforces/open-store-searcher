<!--
Purpose:        Current session state and handoff for the next agent
Owner:          Currently active agent
Update Trigger: Read at session start and update before session end
Harness Version: 1.1
-->

# Current Session — open-store-searcher

_Last updated: 2026-08-28_

> After a session, add a snapshot to `memory/sessions/YYYY-MM-DD-ROLE.md` when useful.

## Session Information

- Date: 2026-08-28
- Agent role: Researcher / Planner
- Session goal: Complete TASK-004 source-data contract research for M1

## Previous Session Summary

TASK-026 completed the handbook gate and closed M0 through pull request #4 at `798d9a1` after the
required human Korean-language review. No source-data contract or M1 implementation was complete.

## Current Work

- [x] Fast-forward local `main` to the merged TASK-026 result.
- [x] Obtain user approval to perform TASK-004.
- [x] Create `codex/task-004-source-contract` and activate TASK-004.
- [x] Research official delivery methods, schema, terms, and attribution requirements.
- [x] Compare official alternatives and document a bounded recommendation and unknowns.
- [x] Verify the report and update task, project, decision-gate, issue, and traceability records.
- [x] Receive human approval for the bounded source contract and accept ADR-009.
- [x] Evaluate all PR #5 review findings against the repository constraints.
- [ ] Complete the all-category permission and attribution evidence gate before closing TASK-004.

## Completed This Session

- [x] Confirmed TASK-026 pull request #4 was merged and fast-forwarded local `main` to `798d9a1`.
- [x] Promoted TASK-004 from the backlog with traceable acceptance criteria and verification.
- [x] Verified current official file, OpenAPI, migration, schema, identity, freshness, permission,
      and attribution evidence without downloading a complete production dataset.
- [x] Published `reports/research-2026-08-28-source-data-contract.md` with an alternatives analysis,
      a bounded zero-key ZIP recommendation, explicit unknowns, and implementation prohibitions.
- [x] Updated the project, architecture, open-question, issue, and traceability records without
      recording the unapproved recommendation as an accepted decision.
- [x] Passed format, changed-line whitespace, report-section, official-host, approval-boundary,
      handbook-scope, and temporary-artifact checks. Current Public Data Portal links returned HTTP
      200; legacy LOCALDATA links timed out and are explicitly non-dependencies.
- [x] Received the user's approval and accepted ADR-009's candidate source contract.
- [x] Passed the final `npm run verify:full` gate: lint, format, typecheck, one coverage test at 100%,
      build, four-browser Pages-subpath smoke tests, and two zero-violation automated WCAG scans.
- [x] Reopened TASK-004 after PR review showed that representative permission evidence cannot clear
      the all-category source-terms gate or authorize TASK-005 collector implementation.
- [x] Restored the traceable TASK-004 detail and corrected the ZIP description from an atomic data
      snapshot to a single transfer artifact whose cross-entry timestamps must be validated.

## Issues and Decisions Found

- ADR-009 accepts the current official Seoul all-category ZIP as the zero-key candidate. Its
  permission and attribution coverage across all selected categories must be verified in TASK-004.
  Its automation stability, full schema, cross-entry timestamp consistency, and as-of rule then
  require a TASK-005 contract probe before production use.
- OpenAPI requires account application and an external service key, so it is not recommended as the
  mandatory default under the current zero-key constraint.
- TASK-004 is research only. It does not authorize collector implementation, status mapping,
  production-data publication, an external dependency, or a deployment change.

## Next Session

1. Complete TASK-004's official permission and attribution manifest for every selected category.
2. Only after that gate passes, close TASK-004 and design TASK-005's bounded contract probe.

## Important Context

TASK-004 is active at the all-category permission and attribution gate. ADR-009 accepts only the
candidate source choice; it does not authorize TASK-005 or collector implementation. The handbook
remains human-facing output rather than implementation evidence and was not read. No collector,
fixture schema, status mapping, production-data operation, dependency, workflow, or deployment
change occurred.
