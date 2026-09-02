<!--
Purpose:        Permanently record important product and technical decisions as ADRs
Owner:          Architect / Researcher
Update Trigger: When an important choice is proposed, accepted, deprecated, or superseded
Harness Version: 1.1
-->

# Decision Log — open-store-searcher

_Last updated: 2026-08-28_

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

## ADR-007: MIT Repository Foundation and Biome Quality Tooling

- Date: 2026-08-20
- Status: Accepted
- Decision maker: User

**Context**: TASK-002 must establish the first reproducible repository foundation and resolve the deferred linting, formatting, style, and code-license choices before packages are installed. The source PRD and initial harness selected Apache-2.0, but the user explicitly requested MIT during the TASK-002 design review. The approved TypeScript version is 7.0.2, while the current typescript-eslint metadata supports TypeScript only below 6.1.0.

**Decision**: License the project source code under MIT. Use `@biomejs/biome` 2.5.9 under its MIT option as the sole additional direct development dependency for linting and formatting. Use two-space indentation, 100-column lines, LF endings, single-quoted TypeScript, double-quoted JSX attributes, semicolons, trailing commas, and conventional TypeScript naming. Pin Node.js 24.19.0, npm 11.17.0, and every direct dependency exactly.

**Rationale**: MIT matches the user's approved open-source preference. Biome provides officially documented TypeScript, TSX, JSX, formatter, linter, Hooks, and accessibility support without relying on the current typescript-eslint TypeScript-version range. One quality-tool dependency reduces configuration, transitive dependencies, and supply-chain surface.

**Trade-offs**: Biome has a smaller plugin ecosystem than ESLint and does not reproduce every ESLint or Prettier rule. The React-domain naming is used for Preact's compatible Hooks model. Changing the license requires coordinated updates to the source PRD and authoritative project documents.

**Consequences**: TASK-002 installs only the approved build dependencies plus Biome, commits an exact lockfile, records transitive licenses, and creates the minimal static build. TASK-003 remains responsible for tests and coverage. Future lint-tool changes or new dependencies require their normal approval gates. See `docs/superpowers/specs/2026-08-20-repository-foundation-design.md`.

## ADR-008: Layered Test Harness and Coverage Policy

- Date: 2026-08-20
- Status: Accepted
- Decision maker: User

**Context**: TASK-003 must configure the approved test stack before data, search, status, and
dashboard features exist. The project needs fast local verification, a full browser matrix,
deterministic offline fixtures, explicit coverage minimums, and GitHub Pages subpath validation
without assuming the unresolved source-data contract.

**Decision**: Use one Vitest configuration with Node unit, Node pipeline, and jsdom component
projects, plus one Playwright configuration with desktop Chromium, Firefox, WebKit, and mobile
Chromium projects. Enforce global minimums of 80% for statements, lines, and functions and 75%
for branches. Require 100% file-level coverage for the future status-mapping module after TASK-007
defines its exact path. Separate fast verification from the full browser and accessibility matrix,
and verify the built app at `/open-store-searcher/` on a local preview server.

**Rationale**: Shared root configurations avoid duplicated policy while project-specific
environments keep browser code separate from Node pipeline tests. The split command cadence keeps
routine feedback fast and retains a mandatory full gate for task completion and releases.

**Trade-offs**: Empty unit and pipeline projects temporarily permit no tests until their owning
features are implemented. Full verification requires installed Playwright browsers and takes
longer than routine verification. Automated accessibility testing remains incomplete without
manual keyboard and screen-reader review.

**Consequences**: TASK-003 installs only the seven already approved test dependencies, adds the
layered configurations and current-app smoke tests, and defines fixture rules without speculative
source data. Later feature tasks must add tests to their owning project, and TASK-007 must add the
100% status-mapping threshold. See
`docs/superpowers/specs/2026-08-20-test-harness-design.md`.

## ADR-009: Bounded Seoul All-Category ZIP Source Contract

- Date: 2026-08-28
- Status: Accepted
- Decision maker: User

**Context**: TASK-004 verified that the Public Data Portal currently exposes 195 local
administrative licensing categories through file data and OpenAPI. The representative OpenAPI
requires account application, an external service key, pagination, and quota handling. The current
Seoul all-category ZIP path requires no API key and supplies one Seoul-wide transfer artifact, but
its browser-like request requirements, complete schema, permissions, timestamp semantics, and
archive contract are not documented as stable automation guarantees.

**Decision**: Adopt the official Seoul all-category ZIP as the sole candidate default source for
the build-time pipeline. TASK-004 must verify permission and attribution coverage for every
selected category before TASK-005 or any collector implementation starts. After that gate passes,
TASK-005 must implement and pass the bounded contract probe defined in
`reports/research-2026-08-28-source-data-contract.md`. OpenAPI remains a manual diagnostic reference
and must not become a required pipeline dependency without separate human approval for account,
key, quota, and zero-key-scope changes.

**Rationale**: The ZIP candidate matches the static, zero-cost, no-runtime-service architecture and
avoids required sign-up, secret storage, and API-key lifecycle risks while providing a single
Seoul-wide transfer artifact. It does not prove that category entries share one source data cut.

**Trade-offs**: The current archive is large, lacks usable `ETag` and `Last-Modified` headers, and
depends on observed request behavior that may change. A full staged download and content hash are
needed for change detection. Every category's entries, schema, permission, identity, raw statuses,
and time fields still require validation.

**Consequences**: TASK-004 subsequently verified official permission and attribution evidence for
all 195 selected categories in `reports/source-permission-manifest-2026-08-28.json`. TASK-005 may
therefore design and implement a non-production, fail-safe contract probe and staged collector. The
probe must validate cross-entry timestamp
consistency before treating the archive as a single data cut or deriving an archive-wide as-of
date. Publication remains prohibited until archive integrity, the approved 195-category manifest,
required schema, conservative as-of derivation, bounded change checks, and last-known-good
preservation are designed and verified by their owning tasks. Unknown statuses remain
`확인되지 않음`; ADR-009 does not authorize production data, workflows, or deployment.

## ADR-010: Native Node Collector with an Info-ZIP Adapter

- Date: 2026-08-28
- Status: Accepted
- Decision maker: User

**Context**: TASK-005 needs to stream and inspect an approximately 206 MiB ZIP without adding a ZIP
runtime package or implementing a security-sensitive archive parser. Strict TypeScript also needs
Node API declarations, which the existing dependency set does not include.

**Decision**: Implement the collector with Node.js 24.19.0 native HTTP, stream, filesystem,
child-process, and SHA-256 APIs. Put the system `unzip` executable behind an injected adapter and
invoke it without a shell. Add `@types/node` 24.13.3 as the sole new direct development dependency.

**Rationale**: GitHub-hosted Ubuntu 24.04 and the current macOS development environment provide
Info-ZIP. This approach streams large inputs, avoids a browser bundle effect, keeps the npm
supply-chain addition to type declarations, and makes the archive boundary replaceable.

**Trade-offs**: Local execution requires a compatible `unzip` executable and is not guaranteed on
Windows. A missing or incompatible executable fails closed with a typed environment rejection.
Changing to a JavaScript ZIP package requires a separate dependency decision.

**Consequences**: TASK-005 adds no workflow, deployment, production data, or publication path. It
must follow `docs/superpowers/specs/2026-08-28-seoul-collector-design.md`, use offline pipeline
tests, and record only schema-level evidence from its one manually initiated live probe.

## ADR-011: One Literal Archive Filename Alias

- Date: 2026-08-29
- Status: Accepted
- Decision maker: User

**Context**: Ubuntu 24.04 preserved all 195 official ZIP filenames. Exactly 194 matched the audited
Public Data Portal titles after removing only the fixed provider prefix and `.csv` suffix. The ZIP
entry `자원환경_단독정화조-오수처리시설설계시공업.csv` corresponds to portal file-data ID
`15045011`, whose title uses `단독정화조 및 오수처리시설설계시공업`.

**Decision**: Keep the category and record one literal filename-to-file-data-ID alias for that entry.
Do not introduce generalized hyphen, punctuation, or word normalization. Require the alias ID to
exist in the audited permission manifest and remain unique across the archive.

**Rationale**: Retaining all 195 approved categories preserves the all-category source contract.
The literal mapping is narrow, auditable, and supported by the unique official provider title and
file-data identifier without weakening fail-closed matching for other entries.

**Trade-offs**: A provider rename of either side requires an explicit contract review. The alias is
source-specific and cannot be reused as a general filename normalization rule.

**Consequences**: TASK-005 may generate and commit the schema-only 195-entry contract. Discovery
tests must reject aliases to unaudited IDs and all duplicate mappings. Publication, status mapping,
and data as-of derivation remain outside TASK-005.

## ADR-012: Lossless Transformation and Versioned Project Identifier

- Date: 2026-09-02
- Status: Accepted
- Decision maker: User

**Context**: TASK-006 needs a deterministic record contract that preserves exact source evidence
and derives separate search values. Official provider guidance uses service ID, licensing-authority
code, and management number as a composite key and warns that management number alone may repeat.
The TASK-005 schema contract contains authority code and management number in all 195 categories,
but it does not contain the provider service ID. No official evidence currently proves that the
Public Data Portal file-data ID is equivalent to that service ID or guarantees a public URL-key
contract.

**Decision**: The user approved option B on 2026-09-02. Preserve exact decoded display, raw status,
lifecycle, source identity, and provenance values separately from versioned search-only
NFKC/lowercase/Unicode-whitespace values. Never normalize identity inputs or use descriptive
fields for identity. Treat the accepted category `fileDataId` only as a versioned project
namespace, not as the provider's primary key, and hash the exact
`fileDataId`, licensing-authority code, and management number using the versioned, length-prefixed
UTF-8 SHA-256 contract in
`docs/superpowers/specs/2026-09-02-task-006-transformation-identifier-design.md`. Retain the full
digest internally, reject missing/duplicate/colliding identity evidence, and defer the public text
and share-URL format to TASK-022.

**Rationale**: Exact source values remain auditable and safe from lossy normalization. The proposed
opaque identifier is deterministic with currently accepted schema inputs and avoids publishing a
raw management number alone, while clearly distinguishing a project namespace from the provider's
documented primary key.

**Trade-offs**: File-data ID stability and its relationship to provider service ID are not
officially confirmed. A digest hides source-key text but does not create stronger identity evidence
or anonymize the record. Once exposed, identifier bytes become a compatibility boundary. Waiting
for provider service-ID evidence is safer but blocks implementation; a surrogate registry would
add state and migration complexity.

**Consequences**: TASK-006 may implement only the approved lossless record,
normalization, deterministic identity, diagnostics, and synthetic fixtures. TASK-007 still owns
status mapping, TASK-008 owns `dataAsOf`, TASK-009 and later tasks own validation/publication, and
TASK-022 owns the public URL format and migrations. Changing identity inputs, framing, hashing,
encoding, or public representation requires a new ADR and human approval. Management-number-only
and name/address-derived identifiers remain prohibited. No public textual encoding, prefix,
truncation, share-URL placement, or prior-URL compatibility policy is authorized by this ADR.
