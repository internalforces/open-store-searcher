<!--
Purpose:        Project constitution and operating boundaries that every AI agent must follow
Owner:          All agents (read), Project lead (write)
Update Trigger: When roles, constraints, approval gates, routing rules, or harness language policy change
Harness Version: 1.1
-->

# AGENTS.md — open-store-searcher Project Constitution

> Every agent must read this document before starting work. If instructions conflict, the user's current request and this document take precedence over other project documents.

_Last updated: 2026-08-20_

## Project Overview

| Item | Value |
|---|---|
| Project | open-store-searcher |
| Goal | A free, open-source static dashboard that searches Seoul-licensed businesses by name or address and shows their administrative status with the source, as-of date, and uncertainty |
| Language | TypeScript 7.0.2 on Node.js 24.19.0 LTS |
| Framework | Preact 10.29.8 + Vite 8.2.1 |
| Database | None — built static JSON only |
| Infrastructure | GitHub Pages + GitHub Actions |
| Repository structure | Single repository and single npm package with module directories |
| Harness tier | standard |
| Harness documentation language | English only |

## Harness Language Policy

- All harness documents, including metadata, headings, prose, tables, templates, prompts, task records, memory, and reports, must be written in English.
- Exact Korean product copy or source-system values may appear only when preserved as quoted literals, test fixtures, or glossary terms whose exact spelling matters.
- New or updated harness content must not introduce Korean explanatory prose.
- `handbook/ko/**` is exempt because it is human-facing explanatory output rather than harness content.

## Human Handbook Boundary

- `handbook/ko/**` is written in Korean for people who want to understand the project. It is not an implementation specification or source of truth.
- Planner, Architect, Researcher, Implementer, Debugger, Tester, Reviewer, Security Reviewer, Performance Engineer, and Release Manager must not read, search, summarize, cite, or use `handbook/ko/**` during implementation workflows.
- Repository-wide implementation searches must exclude `handbook/ko/**`.
- The Documenter may access the handbook only after milestone implementation, testing, and review gates pass, or when a human explicitly requests handbook work.
- The project constitution, source PRD, accepted ADRs, active task, implementation, tests, and verification evidence remain authoritative.
- If handbook content conflicts with an authoritative source, correct the handbook during an authorized documentation pass. Do not change implementation to match the handbook.

## Agent Registry

| Role | Status | Primary responsibility |
|---|---|---|
| Planner | Active | Break the PRD into milestones and executable tasks |
| Architect | Active | Decide the static architecture, data pipeline, and search design |
| Implementer | Active | Implement the approved active task |
| Reviewer | Active | Review quality, accessibility, and PRD compliance |
| Researcher | Active | Research public data and evidence for technical choices |
| Debugger | Active | Reproduce issues, analyze root causes, and record them |
| Tester | Active | Run unit, pipeline, UI, and accessibility tests |
| Documenter | Active | Maintain setup, deployment, source, disclaimer, and contribution documentation |
| Security Reviewer | Active | Review privacy, input handling, external links, and supply-chain security |
| Performance Engineer | Active | Validate bundle size, search latency, and static data size |
| Release Manager | Active | Coordinate versions, release criteria, and GitHub Pages deployment |

## Absolute Constraints

Do not take any of the following actions. If the user requests a change, identify it as a product-scope change and obtain confirmation first.

- Do not write directly to production data.
- Do not use paid APIs or services that require a payment method without approval.
- Do not print or modify `.env` files, secrets, tokens, or key files.
- Do not commit directly to `main` or `master`.
- Do not make a server, runtime database, sign-up flow, or admin page a required part of the architecture.
- Do not collect, transmit, or store search terms, clicks, location, or usage behavior.
- Do not add analytics, advertising, or tracking scripts.
- Do not scrape or inspect Naver, Kakao, or Google Maps pages with a headless browser.
- Do not use paid APIs, external real-time search, or AI classification to determine status.
- Do not classify a business as closed merely because no result was found.
- Do not arbitrarily map unknown source status codes to operating, suspended, or closed.
- Do not describe `행정상 영업` (administratively operating) as `영업 중` (open now).
- Do not overwrite the last known-good deployment data with new data that failed validation.

## Actions Requiring Human Approval

- Initial selection of the language, framework, package manager, or repository structure
- Addition of any external dependency or external service
- Changes to the source-data delivery method or status-mapping rules
- Changes to the static deployment architecture, GitHub Actions permissions, or infrastructure
- Changes to public interfaces such as public URLs or share-identifier formats
- Security-related fixes, release tag creation, and all deployments
- Changes to PRD non-goals or the zero-cost operating principle

## Product Safety Invariants

1. The UI may use only `행정상 영업` (administratively operating), `휴업` (suspended), `폐업` (closed), and `확인되지 않음` (unverified) as display statuses.
2. Show the raw status, processed status, source, and data as-of date together.
3. Do not auto-confirm a match when names are identical but addresses conflict.
4. Process input only in the browser and never execute it as HTML.
5. Show a delay warning when data freshness exceeds seven days.
6. If refresh validation fails, continue serving the previous known-good data.

## Context Loading Order

1. `AGENTS.md`
2. `memory/project.md`
3. `memory/session.md`
4. `tasks/active.md`
5. The role-appropriate `prompts/*.md`
6. `docs/prd-traceability.md` and the source PRD when needed

Never add `handbook/ko/**` to implementation context loading. The Documenter exception is governed by the Human Handbook Boundary above.

## Working Rules

- Implement only one `tasks/active.md` task at a time.
- Link PRD requirement IDs and acceptance criteria to tasks, tests, and reviews.
- Do not replace unconfirmed technical placeholders with assumptions presented as facts.
- Verify source-data terms of use and attribution requirements before implementation.
- Keep changes minimal and run relevant verification before claiming completion.

## Session-End Checklist

- [ ] Updated `memory/session.md`.
- [ ] Moved completed work to `tasks/completed.md`.
- [ ] Recorded new decisions in `memory/decisions.md`.
- [ ] Recorded bugs and debt in `memory/known-issues.md`.
- [ ] Updated `memory/architecture.md` when structure changed.
- [ ] Updated `docs/prd-traceability.md` when traceability changed.
- [ ] At milestone close, recorded each Korean handbook document as updated or reviewed without change and obtained human language review.
