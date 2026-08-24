# TASK-003 Test Harness Design

_Last updated: 2026-08-20_

## Status

Approved in chat by the user on 2026-08-20. This specification activates TASK-003 and
defines the test-harness boundary for M0.

## Goal

Configure reproducible unit, offline pipeline, Preact component, browser E2E, and automated
accessibility test harnesses without implementing data-pipeline, search, status-mapping, or
dashboard behavior owned by later tasks.

## Scope

TASK-003 will:

- install only the seven previously approved test dependencies at their exact versions;
- configure Vitest projects for Node unit tests, Node pipeline tests, and jsdom component tests;
- configure Playwright projects for Chromium, Firefox, WebKit, and mobile Chromium;
- verify the built application under the `/open-store-searcher/` GitHub Pages subpath;
- define deterministic offline fixture rules without assuming an unverified source-data schema;
- add minimal component, E2E smoke, and automated accessibility tests for the current app;
- define exact test, coverage, and full-verification commands;
- enforce global coverage thresholds and record the future safety-critical threshold rule; and
- update task, command, dependency, quality, traceability, decision, and session records.

TASK-003 will not:

- fetch, model, transform, validate, or publish administrative data;
- invent a source-data contract or fixture schema before TASK-004;
- implement search, candidate ranking, status mapping, result cards, or failure-state UX;
- add GitHub Actions, deployment, analytics, runtime services, or production data;
- access or update `handbook/ko/**`; or
- complete the recurring TASK-026 M0 handbook gate.

## Approved Dependencies

The following exact development dependencies were approved through TASK-001 and may be
installed by TASK-003. No other package may be added without separate human approval.

| Package | Version | Purpose | License |
|---|---:|---|---|
| `vitest` | 4.1.11 | Unit, pipeline, and component test runner | MIT |
| `@vitest/coverage-v8` | 4.1.11 | V8 coverage collection | MIT |
| `@testing-library/preact` | 3.2.4 | Accessible Preact component queries | MIT |
| `@testing-library/user-event` | 14.6.5 | Keyboard and user interaction simulation | MIT |
| `jsdom` | 30.0.1 | DOM environment for component tests | MIT |
| `@playwright/test` | 1.62.1 | Browser and viewport E2E tests | Apache-2.0 |
| `@axe-core/playwright` | 4.13.0 | Automated accessibility checks | MPL-2.0 |

These dependencies are development-only and must not enter the browser runtime bundle.
Playwright browser binaries and generated reports must remain untracked.

## Vitest Architecture

One root `vitest.config.ts` will define three projects:

| Project | Environment | Test ownership |
|---|---|---|
| `unit` | Node | `src/domain`, `src/search`, and `src/shared` pure TypeScript tests |
| `pipeline` | Node | `src/pipeline` offline fixture and pipeline tests |
| `component` | jsdom | `src/app` Preact component tests |

The unit and pipeline projects may pass with no tests during TASK-003 because their production
modules are intentionally empty. Each later implementation task must add tests with its feature.
The component project must contain a real smoke test before TASK-003 completes.

V8 coverage is collected across the full Vitest process. Coverage includes testable TypeScript
and TSX under `src/app`, `src/domain`, `src/search`, `src/pipeline`, and `src/shared`. It excludes
tests, declarations, configuration, and `src/app/main.tsx`. The bootstrap entry is excluded from
Vitest coverage because its successful execution and asset loading are verified by Playwright.

The approved global minimums are:

| Metric | Minimum |
|---|---:|
| Statements | 80% |
| Lines | 80% |
| Functions | 80% |
| Branches | 75% |

Coverage auto-update is disabled. The status-mapping module will receive a 100% file-level
threshold in TASK-007 after that task defines its exact path. Tests or exclusions added only to
inflate coverage are prohibited.

## Playwright Architecture

One root `playwright.config.ts` will define these projects:

- `chromium` using desktop Chromium;
- `firefox` using desktop Firefox;
- `webkit` using desktop WebKit; and
- `mobile-chromium` using an approved Playwright mobile-device profile.

The Playwright web server builds and previews the static app with the absolute test base
`/open-store-searcher/`. Tests use
`http://127.0.0.1:4173/open-store-searcher/` as `baseURL`. The server is local-only, uses a strict
port, and makes no request to an external site or production-data source.

The initial E2E smoke test verifies that the app loads at the subpath and exposes its level-one
heading. This proves that the built HTML and JavaScript assets load from the tested subpath
without inventing future product behavior.

The initial accessibility test scans the full current page with axe rules tagged for WCAG 2.1 A
and AA. Any automatically detected violation fails the test, which is stricter than the release
gate of zero critical automated errors. Automated checks do not replace later manual keyboard
and screen-reader review.

Trace collection is retained on the first retry only. Video recording is disabled. Browser
reports and test results remain excluded by `.gitignore`.

## Fixture Rules

Unit and component tests live beside their source as `*.test.ts` or `*.test.tsx`. Shared fixed
fixtures live under `tests/fixtures/<domain>/`, Playwright tests live under `tests/e2e/`, and
shared test setup lives under `tests/setup/`.

Every fixture must be:

- small, deterministic, and executable without network access;
- synthetic unless a later approved task records a permitted source and attribution basis;
- limited to the fields and rows required by the tested behavior;
- named for the scenario it represents; and
- documented with its purpose, synthetic/source status, owning task, expected behavior, and
  update trigger.

Exact Korean source values may appear only when their spelling is necessary to the test. No
fixture may assume the administrative-data schema before TASK-004 verifies it. TASK-003 creates
the fixture policy but does not create speculative data fixture directories or records.

## Commands

TASK-003 adds these exact package scripts:

| Script | Command responsibility |
|---|---|
| `test` | Run all Vitest projects once |
| `test:unit` | Run the Vitest `unit` project |
| `test:pipeline` | Run the Vitest `pipeline` project |
| `test:component` | Run the Vitest `component` project |
| `test:coverage` | Run all Vitest projects with V8 coverage thresholds |
| `test:e2e` | Run smoke tests in desktop and mobile Chromium |
| `test:e2e:full` | Run smoke tests in Chromium, Firefox, WebKit, and mobile Chromium |
| `test:a11y` | Run accessibility tests in desktop and mobile Chromium |
| `build:e2e` | Build with `--base=/open-store-searcher/` |
| `preview:e2e` | Preview with the same base on `127.0.0.1:4173` using a strict port |
| `verify` | Run lint, format check, typecheck, coverage, and the normal relative-base build |
| `verify:full` | Run `verify`, the full browser smoke matrix, and accessibility tests |

Commands fail immediately when a required step fails. TASK-003 completion and release-oriented
verification require `verify:full`; the faster `verify` command does not replace it.

## Error Handling and Safety

- Missing tests are tolerated only in the intentionally empty unit and pipeline projects.
- Coverage thresholds cannot be automatically reduced or rewritten.
- E2E setup fails if the strict port is occupied or the subpath preview does not become ready.
- Browser or accessibility failures produce local diagnostic artifacts without committing them.
- Input rendering, status mapping, source data, and external map navigation are outside this task.
- No test may scrape or inspect Naver, Kakao, or Google Maps pages.
- No test may send search terms, clicks, location, or usage behavior to an external service.

## Documentation and Traceability

Implementation updates will:

- replace TASK-003 test and coverage placeholders in `commands.md` and `standards.md`;
- record the exact locked dependencies and refreshed license evidence;
- resolve the TASK-003 coverage and test-command questions in `docs/open-questions.md`;
- keep later pipeline, deployment, performance, recall, freshness, and publication commands open;
- link TASK-003 activation, acceptance criteria, test evidence, and review evidence; and
- keep M0 open until TASK-003 passes independent Tester and Reviewer gates and TASK-026 completes
  the separate handbook and human-language-review gate.

## Verification and Acceptance

TASK-003 is complete only when all of the following are true:

1. A clean install uses Node.js 24.19.0 and npm 11.17.0 with the exact approved lockfile.
2. Only the seven approved test dependencies are added directly.
3. Unit, pipeline, component, coverage, browser, and accessibility commands exist and run.
4. The component smoke test passes.
5. The Pages subpath smoke test passes in Chromium, Firefox, WebKit, and mobile Chromium.
6. The accessibility test passes in desktop and mobile Chromium with zero detected violations.
7. Statements, lines, and functions meet 80%, and branches meet 75%.
8. `npm run verify` and `npm run verify:full` pass without warnings or hidden failures.
9. Every locked dependency has a declared, reviewed license compatible with project distribution.
10. No production behavior, production data, workflow, deployment, or handbook file changes.
11. An independent Tester records PASS evidence.
12. An independent Reviewer records APPROVED after reviewing the implementation and test report.

## References

- Source PRD Sections 16 through 18
- `AGENTS.md`
- `memory/decisions.md` ADR-004 and ADR-007
- Vitest 4 test-project and V8 coverage documentation
- Playwright project, web-server, and accessibility-testing documentation
- Vite CLI base-path documentation
