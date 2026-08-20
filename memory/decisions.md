<!--
Purpose:        Permanently record important product and technical decisions as ADRs
Owner:          Architect / Researcher
Update Trigger: When an important choice is proposed, accepted, deprecated, or superseded
Harness Version: 1.1
-->

# Decision Log — open-store-searcher

_Last updated: 2026-08-20_

## ADR Template

### ADR-NNN: Title

- Date: YYYY-MM-DD
- Status: Proposed | Accepted | Deprecated | Superseded
- Decision maker: Role or user

**Context**: Why a decision is needed  
**Decision**: What was selected  
**Rationale**: Why it was selected  
**Trade-offs**: Disadvantages  
**Consequences**: What changes

## ADR-001: Adopt AI Development Harness v1.1

- Date: 2026-08-18
- Status: Accepted
- Decision maker: User

**Context**: Multiple AI roles must share the same constraints and state while moving from the PRD to implementation.  
**Decision**: Adopt the Standard tier of AI Development Harness v1.1.  
**Rationale**: Maintain roles, approval gates, memory, tasks, prompts, and traceability consistently.  
**Trade-offs**: The documentation requires ongoing maintenance.  
**Consequences**: Every agent works from `AGENTS.md` and the memory and task documents.

## ADR-002: Zero-Cost Static Runtime

- Date: 2026-08-18
- Status: Accepted
- Decision maker: User through the approved PRD

**Context**: The product must eliminate long-term operating costs and risks from automated collection of external sites.  
**Decision**: GitHub Actions builds the data, GitHub Pages serves the static application and JSON, and search runs in the browser.  
**Rationale**: This satisfies the core requirements without a server, database, paid API, sign-up flow, or API key.  
**Trade-offs**: Static file size, browser memory use, and search performance require active management.  
**Consequences**: Runtime API and database dependencies are prohibited; data partitioning and lazy loading remain design considerations.

## ADR-003: Fail-Safe Status Determination

- Date: 2026-08-18
- Status: Accepted
- Decision maker: User through the approved PRD

**Context**: Missing results, same-name businesses, address conflicts, and new raw statuses could produce incorrect closure determinations.  
**Decision**: Without clear evidence, display `확인되지 않음` (unverified) and separate low-confidence matches into similar candidates.  
**Rationale**: The harm from a false certainty is greater than the cost of asking the user to inspect candidates.  
**Trade-offs**: The automatic-confirmation rate may be lower.  
**Consequences**: Search and status tests include these safety rules as regression gates.

## ADR-004: Implementation Technology Stack

- Date: 2026-08-18
- Status: Accepted
- Decision maker: User

**Context**: The PRD defers the language, framework, package manager, and test tools to the implementation plan.  
**Decision**: Use TypeScript 7.0.2 on Node.js 24.19.0 LTS for browser, shared, test, and pipeline code; Preact 10.29.8 with Vite 8.2.1 for the static UI; npm 11.17.0 in a single repository and single package; Preact-local state without a router or external store; and Vitest, Testing Library, Playwright, and axe for testing. Use Node's native erasable TypeScript execution for pipeline scripts and keep static JSON outside the JavaScript bundle.
**Rationale**: One language reduces schema and safety-rule drift. Preact provides declarative UI state with an approximately 3.5 kB runtime, while Vite directly supports static builds and GitHub Pages subpaths. The selected test layers cover pure logic, offline pipeline fixtures, accessible component behavior, three browser engines, and automated WCAG checks.
**Trade-offs**: Preact has a smaller ecosystem than React. Native Node TypeScript execution excludes transform-required syntax and ignores `tsconfig.json` at runtime. The single-package structure provides less enforced isolation than workspaces. Automated accessibility tests still require manual keyboard and screen-reader review.
**Consequences**: TASK-002 may scaffold the approved module directories and pinned build dependencies. TASK-003 may configure the approved test tools. New dependencies, major upgrades, lint/format choices, and coverage thresholds still require their applicable approval and review gates. See `docs/superpowers/specs/2026-08-20-technology-stack-design.md`.

## ADR-005: English-Only Harness Documentation

- Date: 2026-08-18
- Status: Accepted
- Decision maker: User

**Context**: The harness needs one consistent language for governance, handoffs, tasks, prompts, and reviews.  
**Decision**: Write all harness documentation in English. Preserve Korean text only as exact quoted product copy, source-system values, test fixtures, or glossary terms when spelling is semantically necessary.  
**Rationale**: A single documentation language improves consistency and makes agent instructions and handoffs easier to audit.  
**Trade-offs**: Korean product copy needs an English explanation when it appears in harness documents.  
**Consequences**: Existing harness Markdown is translated to English, and future updates must pass the same language rule.

## ADR-006: Separate Korean Human Handbook from AI Implementation Context

- Date: 2026-08-18
- Status: Accepted
- Decision maker: User

**Context**: Korean-speaking people need project-understanding documentation, while implementation agents need a small, authoritative English context without duplicated explanatory material.

**Decision**: Place curated Korean explanations under `handbook/ko/**` and classify them as human-facing output rather than harness content. Implementation roles must not read or use the handbook. The Documenter may access it only during an authorized milestone-close documentation pass or after an explicit human request. Every milestone closes only after affected handbook files are updated or reviewed without change and a human reviews the Korean text.

**Rationale**: A separate repository boundary and explicit role routing make the audience and authority clear while keeping documentation versioned with the project.

**Trade-offs**: The access restriction is policy-enforced rather than a universal technical sandbox. The handbook may intentionally lag work in progress until milestone close.

**Consequences**: The English harness and verification evidence remain authoritative. `AGENTS.md`, role prompts, workflow, roadmap, and task routing enforce the boundary. Conflicts are fixed in the handbook rather than in implementation.
