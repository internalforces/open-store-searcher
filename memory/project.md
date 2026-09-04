<!--
Purpose:        Current project-state snapshot that every agent reads first
Owner:          All agents (read), Planner / Release Manager (write)
Update Trigger: When the version, milestone, status, or key constraints change
Harness Version: 1.1
-->

# Project: open-store-searcher

_Last updated: 2026-09-04_

## Summary

A free, open-source dashboard that regularly transforms Seoul local administrative licensing open data into static JSON and lets users search by business name or address in the browser, showing administrative status and supporting evidence.

## Current Status

- Version: v0.1.0-dev
- Phase: M1 — TASK-008 validator and research observation implemented and verified
- Next milestone: M1 — resolve TASK-008 source-body encoding, production coverage, and policy/baseline evidence
- Overall health: 🟡 Caution — collector, synthetic transformation, and staged validation gates pass, while no
  production publication path exists and live research ingestion is blocked by source-body decoding
- PRD: `/Users/sonmyeong-gwan/Documents/Codex/2026-08-18/new-chat/outputs/zero-cost-open-business-dashboard-prd.md`

## Technical Summary

| Item | Value |
|---|---|
| Language | TypeScript 7.0.2 on Node.js 24.19.0 LTS |
| Framework | Preact 10.29.8 + Vite 8.2.1 |
| Data storage | No runtime database; static JSON |
| Infrastructure | GitHub Pages + GitHub Actions |
| Package manager | npm 11.17.0 |
| Repository structure | Single repository and single npm package with module directories |

## Key Paths

```text
open-store-searcher/
├── AGENTS.md
├── ORCHESTRATOR.md
├── memory/
├── tasks/
├── prompts/
├── reports/
├── docs/
└── handbook/ko/    # Human-facing Korean explanations; excluded from implementation context
```

Approved source boundaries are `src/app`, `src/search`, `src/domain`, `src/pipeline`, and `src/shared`; TASK-002 created them.

## Recent Changes

| Date | Change |
|---|---|
| 2026-09-04 | Accepted ADR-015; amended FR-14 to age >= 7, recreated verified Ubuntu research environment, and implemented reviewed bounded observation; 425 tests pass, live retry rejects category 15045028 body encoding without partial metrics |
| 2026-09-04 | Synced Mac continuation to merged PR #12; recovered original PRD, identified FR-14 boundary discrepancy, and confirmed historical Docker container cannot start because its snapshot/image is missing; recorded recovery and observation proposals |
| 2026-09-04 | User accepted ADR-014; implemented evidence-gated validation with 144 new offline tests and pinned full verification; production coverage/calibration and PRD gates remain open |
| 2026-09-04 | Activated TASK-008 on user request; prepared proposed ADR-014 and validation/test matrix, retaining explicit source-cut, threshold, baseline, and PRD evidence gates |
| 2026-09-04 | User accepted ADR-013; completed TASK-007 through test-first exact mapping, schema V2 integration, 100% mapper coverage, pinned full verification, and independent Approved review |
| 2026-09-02 | User accepted TASK-006 and requested completion; TASK-007 became the only active task, with exact status-mapping research and approval required before implementation |
| 2026-09-02 | Completed TASK-005 after independent final re-review approved `a1a018d..19a6522`, pinned full verification passed, and TASK-006 design was activated sequentially |
| 2026-08-31 | Reopened TASK-005 after PR #7 found swallowed response-cancellation failures; added typed fail-closed handling and three TDD regressions |
| 2026-08-31 | Completed TASK-005 after pinned verification and independent Reviewer APPROVED; activated TASK-006 design sequentially |
| 2026-08-31 | Remediated the fifth PR #6 review cycle and first follow-up review: awaited all unconsumed probe-body cancellations and moved `fetchedAt` validation before all collector work |
| 2026-08-30 | Remediated the fourth PR #6 review cycle by cancelling every unconsumed full-download response rejected before streaming |
| 2026-08-30 | Remediated the third PR #6 review cycle: exact staging ancestry, pre-header inactivity cancellation, fail-early manual probing, removal of the broken Docker option, and complete short-write handling |
| 2026-08-29 | Remediated the second PR #6 review cycle: shared discovery-date validation, fail-early approved Info-ZIP environment gating, malformed redirect rejection, and bounded one-byte range streaming |
| 2026-08-29 | Reproduced and fixed all five PR #6 findings: inactivity cancellation, pre-aborted processes, repository-root staging isolation, calendar-valid ZIP dates, and structured provider freshness evidence |
| 2026-08-29 | User approved one literal source filename alias; generated and revalidated the schema-only 195-entry contract against the latest official archive on Ubuntu 24.04 |
| 2026-08-28 | Implemented and fully tested the TASK-005 fail-closed staged collector; Ubuntu verified 195 preserved filenames, with 194 exact permission-title matches and one explicit alias awaiting approval before schema-contract review |
| 2026-08-28 | Completed TASK-004 after the 195-category live permission audit and Reviewer APPROVED; activated TASK-005 design |
| 2026-08-28 | Audited 195 distinct official file-data pages and verified that every selected category names the Ministry as provider and displays unrestricted permission; TASK-004 review remains before TASK-005 activation |
| 2026-08-28 | User approved ADR-009's bounded Seoul all-category ZIP candidate; PR review kept TASK-004 open until permission and attribution evidence covers every selected category |
| 2026-08-28 | Completed TASK-004 official-source research and recommended the Seoul all-category ZIP as the bounded zero-key candidate; Architect and human approval remain required before collector implementation |
| 2026-08-24 | Completed the M0 TASK-026 handbook gate after all eight documents were updated or reviewed and the user approved Korean clarity, safety terminology, and accuracy; M0 is closed and TASK-004 is next |
| 2026-08-24 | Activated TASK-026 for the M0 handbook update-or-review and human Korean-language-review gate |
| 2026-08-24 | Completed TASK-003 after independent Tester PASS and Reviewer APPROVED: the required clean install, 100% Vitest coverage, four-browser Pages-subpath smoke matrix, two zero-violation axe scans, and 302 dependency-license rows passed; TASK-026 is now the required M0 close gate |
| 2026-08-24 | Implemented and locally verified TASK-003: the fast and full command sets pass with 100% Vitest coverage, four browser smoke projects, two zero-violation axe projects, and a 302-version dependency-license report; independent gates remain pending |
| 2026-08-20 | Activated TASK-003 after user approval and approved its test-harness design |
| 2026-08-20 | Completed TASK-002 after independent Tester PASS and Reviewer APPROVED; TASK-003 and the M0 milestone handbook gate remain outstanding |
| 2026-08-20 | Approved TASK-002 and changed the project code license from Apache-2.0 to MIT through ADR-007 |
| 2026-08-20 | Approved the TypeScript, Node.js, Preact, Vite, npm, and test-stack baseline through ADR-004 |
| 2026-08-18 | Established a separate Korean human handbook, implementation-context boundary, and recurring milestone review gate |
| 2026-08-18 | Established English as the required language for all harness documentation |
| 2026-08-18 | Created the PRD-based AI Development Harness v1.1 Standard |

## Key Constraints

- Zero mandatory monthly cost and no payment method required for the default deployment
- Static hosting with no runtime server, database, or paid API
- No collection of search terms or usage behavior and no analytics, advertising, or tracking
- No automated map-page collection and no AI status determination
- Missing results, conflicts, and new status codes map to `확인되지 않음` (unverified)
- Preserve the last known-good data after validation failure
- Initial region: Seoul; code license: MIT
- Korean human explanations live under `handbook/ko/**` and are not implementation input
