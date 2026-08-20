<!--
Purpose:        Current project-state snapshot that every agent reads first
Owner:          All agents (read), Planner / Release Manager (write)
Update Trigger: When the version, milestone, status, or key constraints change
Harness Version: 1.1
-->

# Project: open-store-searcher

_Last updated: 2026-08-20_

## Summary

A free, open-source dashboard that regularly transforms Seoul local administrative licensing open data into static JSON and lets users search by business name or address in the browser, showing administrative status and supporting evidence.

## Current Status

- Version: v0.1.0-dev
- Phase: M0 TASK-002 repository-foundation design approved; implementation pending written-spec review
- Next milestone: M0 — Technology decisions and foundation
- Overall health: 🟡 Caution — the technology stack is approved, but the source-data contract remains undecided
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

Approved source boundaries are `src/app`, `src/search`, `src/domain`, `src/pipeline`, and `src/shared`; TASK-002 will create them.

## Recent Changes

| Date | Change |
|---|---|
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
