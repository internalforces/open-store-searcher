<!--
Purpose:        Record the approved TASK-001 technology-stack design and its evidence
Owner:          Architect
Update Trigger: When ADR-004 is superseded or a selected major technology changes
Harness Version: 1.1
-->

# Technology Stack Design

_Date: 2026-08-20_

_Status: Approved in conversation; written-spec review pending_

_Related task: TASK-001_

_Decision record: ADR-004_

## Objective

Select a small, maintainable, zero-cost implementation stack for a GitHub Pages application that searches validated static JSON in the browser while GitHub Actions runs the data pipeline. The stack must preserve the PRD's 300 KB initial code target, 500 ms post-load search target, WCAG 2.1 AA baseline, browser-only search, fail-safe status rules, and last-known-good deployment boundary.

## Approved Constraints

- Use one language and runtime family for browser code, shared rules, tests, and the GitHub Actions pipeline.
- Support the modern-browser baseline used by Vite 8: Chrome 111+, Edge 111+, Firefox 114+, and Safari 16.4+.
- Use one repository and one npm package. Preserve module boundaries with directories rather than workspaces.
- Do not add a router, global state-management library, runtime server, database, telemetry, or search API.
- Keep generated JSON outside the JavaScript bundle and load it as a static asset.
- Treat validation and publication as separate stages. TASK-009 will define the atomic publication mechanism.

## Approaches Considered

| Approach | Advantages | Disadvantages | Outcome |
|---|---|---|---|
| TypeScript + Preact + Vite | Approximately 3.5 kB UI runtime, declarative state-driven UI, React-like contributor model, direct static build | Smaller ecosystem than React; compatibility packages require care | Selected |
| TypeScript without a UI framework + Vite | Minimum runtime dependency and direct platform APIs | Manual DOM/state synchronization increases complexity for candidates, errors, live regions, and keyboard behavior | Rejected |
| TypeScript + React + Vite | Broad contributor familiarity and ecosystem | More runtime and framework surface than this single-screen static dashboard needs | Rejected |

The selected approach keeps the runtime small without giving up declarative rendering for the dashboard's loading, candidate, result, warning, and failure states.

## Selected Versions and License Baseline

Versions were verified from the Node.js download page and npm registry metadata on 2026-08-20. Direct versions are pinned initially; `package-lock.json` pins the complete dependency graph.

| Layer | Selection | Version | License |
|---|---|---|---|
| Runtime | Node.js | 24.19.0 LTS | Node.js license |
| Package manager | npm | 11.17.0 | Artistic-2.0 |
| Language | TypeScript | 7.0.2 | Apache-2.0 |
| UI runtime | Preact | 10.29.8 | MIT |
| Build | Vite | 8.2.1 | MIT |
| Preact build integration | `@preact/preset-vite` | 2.10.6 | MIT |
| Unit and pipeline tests | Vitest | 4.1.11 | MIT |
| Coverage | `@vitest/coverage-v8` | 4.1.11 | MIT |
| Component tests | `@testing-library/preact` | 3.2.4 | MIT |
| Interaction tests | `@testing-library/user-event` | 14.6.5 | MIT |
| DOM test environment | jsdom | 30.0.1 | MIT |
| End-to-end tests | Playwright | 1.62.1 | Apache-2.0 |
| Automated accessibility | `@axe-core/playwright` | 4.13.0 | MPL-2.0 |

Linting, formatting, exact coverage thresholds, and their dependencies remain TASK-002 and TASK-003 decisions.

## Repository and Module Design

```text
src/
├── app/        Preact components and browser state
├── search/     Input normalization, scoring, ranking, and confidence
├── domain/     Records, display statuses, evidence, and safety rules
├── pipeline/   Collection, transformation, validation, and staged output
└── shared/     Browser/Node-compatible schemas and utilities
tests/
├── unit/
├── pipeline/
├── e2e/
└── fixtures/
```

The UI uses Preact hooks and `useReducer` where state transitions benefit from an explicit reducer. No external state store is approved. Search, status mapping, and validation remain pure TypeScript modules wherever practical so they can be tested without a browser or network.

## TypeScript Execution Policy

Vite compiles browser TypeScript and TSX. Node.js 24 runs pipeline TypeScript using its stable built-in type stripping; no separate `tsx` runtime is approved. Pipeline and shared code must therefore use erasable TypeScript syntax and explicit type imports, avoid enums, runtime namespaces, parameter properties, decorators, and TypeScript path aliases, and use Node-compatible module specifiers. `tsc --noEmit` remains the separate type-checking gate because Node's type stripping does not type-check.

## Build and Data Flow

```text
Public administrative source
  -> Node.js TypeScript collection
  -> pure transformation and status mapping
  -> staged static JSON
  -> schema, status, freshness, count, syntax, and size validation
  -> separately approved publication stage
  -> GitHub Pages static assets
  -> browser manifest and partition loading
  -> in-browser normalization and candidate ranking
  -> Preact evidence and uncertainty UI
```

Vite's configurable `base` and `import.meta.env.BASE_URL` provide GitHub Pages project-subpath support. Static data is not bundled into application JavaScript. Search starts on the main thread; a Web Worker is added only if TASK-018 measurements show that the 500 ms target cannot be met without it.

## Failure Handling

- Collection, transformation, or validation failure exits non-zero and does not authorize publication.
- Pre-validation output is written only to a staging location.
- TASK-009 defines the atomic replacement and last-known-good preservation contract before deployment is implemented.
- Browser data-load failure produces an accessible error state and does not infer a business status.
- Unknown source statuses, missing results, and conflicting candidates resolve to `확인되지 않음` (unverified), never to operating or closed.
- No search term, click, location, or behavior data leaves the browser.

## Test Design

- Vitest runs unit tests for normalization, ranking, status mapping, schemas, validators, and pipeline modules against offline fixtures.
- Testing Library exercises Preact components through accessible roles, names, labels, and user interactions rather than component internals.
- Playwright verifies Chromium, Firefox, WebKit, mobile and desktop viewports, keyboard flows, failure states, network behavior, and GitHub Pages subpaths.
- `@axe-core/playwright` checks automatically detectable WCAG 2.1 A and AA violations. Manual keyboard and screen-reader review remains required because automated accessibility testing is incomplete.
- Build verification checks the 300 KB uncompressed HTML/CSS/JavaScript target. Search and data-size benchmarks remain separate milestone gates.

## Version and Dependency Policy

- Pin Node.js 24.19.0 and npm 11.17.0 in repository tool-version metadata during TASK-002.
- Pin the approved direct dependency versions initially and commit `package-lock.json`.
- Apply the existing policy: new dependencies and major upgrades require human approval; minor and patch upgrades require review and relevant tests.
- Record transitive licenses during TASK-002 before the first dependency installation is accepted.
- Pin GitHub Actions to immutable commit SHAs when workflows are implemented.

## Deferred Decisions

- TASK-002: linting, formatting, indentation, line length, source scaffolding, and complete development/build commands.
- TASK-003: minimum coverage, exact CI test commands, fixture conventions, and browser-matrix cadence.
- TASK-004: public source download contract, schema, terms, and attribution.
- TASK-009: atomic publication and last-known-good preservation.
- TASK-018: measured need for data partition changes or Web Workers.

## Evidence Sources

- [Node.js releases and LTS policy](https://nodejs.org/en/about/previous-releases)
- [Node.js 24.19.0 and npm 11.17.0](https://nodejs.org/en/download)
- [Node.js native TypeScript execution](https://nodejs.org/api/typescript.html)
- [Preact project goals](https://preactjs.com/about/project-goals/)
- [Preact with Vite](https://preactjs.com/guide/v10/getting-started/)
- [Vite static and GitHub Pages deployment](https://vite.dev/guide/static-deploy.html)
- [Vite production browser baseline](https://vite.dev/guide/build.html)
- [Playwright browser coverage](https://playwright.dev/docs/browsers)
- [Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing)
- [axe-core rules, limits, and license](https://github.com/dequelabs/axe-core)
