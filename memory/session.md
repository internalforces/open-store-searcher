<!--
Purpose:        Current session state and handoff for the next agent
Owner:          Currently active agent
Update Trigger: Read at session start and update before session end
Harness Version: 1.1
-->

# Current Session — open-store-searcher

_Last updated: 2026-08-20_

> After a session, add a snapshot to `memory/sessions/YYYY-MM-DD-ROLE.md` when useful.

## Session Information

- Date: 2026-08-20
- Agent role: Architect
- Session goal: Complete TASK-001 technology-stack comparison, approval, and decision documentation

## Previous Session Summary

TASK-025 established the Korean handbook boundary. The source-data contract remains undecided, and TASK-001 was the next approved task.

## Current Work

- [x] Activate TASK-001 on `codex/task-001-tech-stack`.
- [x] Compare unified TypeScript stack approaches against the PRD and official documentation.
- [x] Obtain explicit human choices for language, browser baseline, UI framework, repository structure, package manager, and test stack.
- [x] Obtain section-by-section approval for architecture, data flow, failure boundaries, versions, licenses, and direct dependencies.
- [x] Write the technology-stack design and update ADR-004 and directly linked harness placeholders.
- [x] Obtain human review of the written specification and close TASK-001.

## Completed This Session

- [x] Selected Node.js 24.19.0 LTS, npm 11.17.0, TypeScript 7.0.2, Preact 10.29.8, and Vite 8.2.1.
- [x] Selected a single repository and single npm package with explicit app, search, domain, pipeline, and shared module directories.
- [x] Selected Preact-local state without a router or external store.
- [x] Selected Vitest, Testing Library, Playwright, and axe with manual keyboard and screen-reader review.
- [x] Approved the exact initial direct dependency and license baseline without installing packages.

## Issues and Decisions Found

- ADR-004 and the written technology-stack specification are accepted by the user.
- Node.js native TypeScript execution avoids a `tsx` dependency but requires erasable syntax and a separate `tsc --noEmit` check.
- Static JSON remains separate from the JavaScript bundle. Search starts on the main thread, and a Web Worker is deferred until performance evidence requires it.
- Linting, formatting, coverage thresholds, source-data terms, publication mechanics, and deployment remain deferred to their assigned tasks.
- No package installation, application scaffolding, deployment, or production-data operation occurred.

## Next Session

1. Obtain user authorization before activating TASK-002.
2. Compare and approve TASK-002 linting, formatting, style, and foundation choices before writing its implementation plan.
3. Preserve the handbook context boundary during all implementation work.

## Important Context

The approved stack does not change the PRD's zero-cost operation, static hosting, no-collection privacy model, scraping and paid-API prohibitions, or fail-safe status determination. No task is active after TASK-001 closure.
