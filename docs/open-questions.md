<!--
Purpose:        Link unverified project information to placeholders and approval tasks
Owner:          Architect / Planner
Update Trigger: When an unresolved item is added, answered, approved, or discarded
Harness Version: 1.1
-->

# Open Questions — open-store-searcher

_Last updated: 2026-09-02_

Values that cannot be confirmed from the PRD and empty repository are not assumed. When an item below is decided, update the related placeholders across all linked documents.

| Question | Current placeholder | Decision location | Affected documents |
|---|---|---|---|
| What are the data-pipeline, deployment, performance, recall, freshness, and publication commands? | Remaining `[*_COMMAND]` values in `commands.md` | Later assigned tasks | commands |
| What are the Preview and Production URLs? | [STAGING_URL], [PROD_URL] | Deployment design | tech-stack |
| Can the provider's service ID be obtained or authoritatively mapped for every TASK-005 category? | TASK-005 exposes file-data ID, authority code, and management number, but not the documented provider service ID | TASK-006 identity approval / ADR-012 | TASK-006 design, memory/decisions, tasks/active |
| May `fileDataId` serve as a versioned project namespace for an opaque identifier without claiming provider-key equivalence? | Conditional SHA-256 alternative recommended; not approved | Human approval of ADR-012 | TASK-006 design, future transformer, TASK-022 |
| Which exact category-specific headers are approved as business-type evidence? | Only exact `업태구분명` is identified as a common candidate in 54 schema contracts; no cross-category registry is approved | TASK-006 design review | TASK-006 design and future synthetic fixtures |
| What public identifier text and share-URL format should be stable? | No prefix, encoding, truncation, or URL placement is approved | TASK-022 public-interface design | Static schema, routes, bookmarks, migration policy |
| Which normalization-collision metrics permit publication? | TASK-006 must preserve and report every collision; thresholds remain unapproved | TASK-009 validation design | Validator, publication gate, search quality |

## Confirmed Answers

- Project name: open-store-searcher
- Project phase: new, pre-implementation
- Database: none; static JSON
- Infrastructure and CI/CD: GitHub Pages + GitHub Actions
- Code license: MIT
- Runtime and language: Node.js 24.19.0 LTS, npm 11.17.0, and TypeScript 7.0.2
- UI and build: Preact 10.29.8 with Vite 8.2.1 and local hook/reducer state only
- Repository: one repository and one npm package with explicit module directories
- Tests: Vitest, Testing Library, Playwright, and axe, plus manual keyboard and screen-reader review
- Coverage: 80% statements, 80% lines, 80% functions, and 75% branches globally; the
  TASK-007 status-mapping file will require 100% after its exact path is defined
- Test commands: `test`, `test:unit`, `test:pipeline`, `test:component`, `test:coverage`,
  `test:e2e`, `test:e2e:full`, `test:a11y`, `verify`, and `verify:full`; the Vitest 4
  `--passWithNoTests` allowance is scoped only to `test:unit` and `test:pipeline`
- Lint and format: Biome 2.5.9 under the MIT license option; two-space indentation and a 100-column line limit
- Active roles: six core roles plus Tester, Documenter, Security Reviewer, Performance Engineer, and Release Manager
- Absolute constraints: zero-cost operation, static hosting, no collection of personal or usage data, no paid APIs/scraping/AI determination, and fail-safe status determination
- Harness documentation language: English only, except exact quoted product/source literals
- Source delivery: ADR-009 accepts the official zero-key Seoul all-category ZIP as the candidate
  default; TASK-004 verified permission and provenance across 195 categories, and TASK-005
  completed the fail-closed collector plus accepted schema-level contract
