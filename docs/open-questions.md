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
| Which additional category-specific headers are approved as business-type evidence? | V1 accepts exact `업태구분명` as common, exact `의료기관종별명` for four reviewed medical category IDs, and exact `업종구분명` for ADR-011 category `15045011`; all other candidate headers remain unmapped | Later schema-evidence review and Proposed ADR if semantics expand | Transformer registry and synthetic fixtures |
| Which malformed text conditions should production ingestion classify as archive-wide versus row-level failures? | TASK-006 safely rejects unpaired UTF-16 surrogates, NUL, DEL, and non-whitespace C0 controls at the whole staged-transform boundary; production decoder/archive policy is not yet approved | TASK-009 validation design | Decoder, transformer, validator, publication gate |
| How should upstream ingestion distinguish absent, empty, and whitespace-only optional cells? | TASK-006 preserves supplied `null`, empty strings, and whitespace-only strings exactly; the production CSV row parser contract remains unimplemented | Future row-ingestion design before production transformation | Row parser, transformer input, validator |
| What public identifier text and share-URL format should be stable? | No prefix, encoding, truncation, or URL placement is approved | TASK-022 public-interface design | Static schema, routes, bookmarks, migration policy |
| Which normalization-collision metrics permit publication? | TASK-006 must preserve and report every collision; thresholds remain unapproved | TASK-009 validation design | Validator, publication gate, search quality |

## Confirmed Answers

- On 2026-09-02, the user approved ADR-012 option B: `fileDataId` is only a versioned project
  category namespace, and the exact length-prefixed UTF-8 SHA-256 tuple contract is approved for a
  full 256-bit internal identifier. This does not claim provider-primary-key equivalence and does
  not approve a public textual identifier or share-URL format.

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
