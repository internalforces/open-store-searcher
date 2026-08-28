<!--
Purpose:        Track the single active implementation task and its acceptance criteria
Owner:          Implementer / Planner
Update Trigger: When a task starts, is blocked, completes, or changes owner
Harness Version: 1.1
-->

# Active Tasks — open-store-searcher

_Last updated: 2026-08-28_

## In Progress

### TASK-004: Research the local administrative licensing source-data contract

- Owner: Researcher / Architect
- Priority: High
- Milestone: M1
- Related requirements: FR-09, Section 12.1, Section 20
- Description: Verify the official delivery methods, authentication requirements, schema, field
  semantics, terms of use, licensing, and attribution requirements for the local administrative
  licensing data needed by the Seoul static-data pipeline. Compare viable official delivery
  alternatives and establish a bounded contract without implementing a collector or inventing
  status mappings.
- Dependencies: TASK-001, TASK-002, TASK-003, and the TASK-026 M0 gate are complete.
- Risks:
  - The portal may expose different contracts for bulk files and OpenAPI access.
  - Field names, permission scopes, or status vocabularies may vary by licensing category.
  - One ZIP transfer does not prove that every category entry has the same source as-of date.
  - Selecting a delivery method or status interpretation without complete evidence could violate
    an approval gate or product safety invariant.
- Acceptance criteria:
  - [x] Record dated, official evidence for available download methods, authentication, rate or
        usage limits, update behavior, and zero-cost suitability.
  - [x] Record the official representative schema evidence for the PRD-required fields and identify
        every field or semantic that remains category-specific, undocumented, or unverified.
  - [x] Record the official general terms of use, licensing, redistribution, and attribution
        framework, including source URL and data as-of implications for built artifacts.
  - [ ] Verify an official permission and attribution manifest for every selected category, or an
        authoritative global permission statement covering all selected categories, before any
        collector implementation is authorized.
  - [x] Compare viable official delivery alternatives across cost, automation, privacy,
        maintainability, schema-change detection, and failure modes.
  - [x] Record the user-approved candidate contract in ADR-009, explicitly listing unresolved
        questions and prohibiting speculative fixtures, status mappings, or production collection.
  - [x] Publish an English report at `reports/research-2026-08-28-source-data-contract.md` with the
        required question, scope, verified facts, alternatives, recommendation, unknowns, and
        sources sections.
- Verification commands:
  - `npm run format:check`
  - `git diff --check`
  - Documentation evidence and link audit against official primary sources
- Results and evidence: The report and ADR-009 approve the zero-key Seoul all-category ZIP only as
  a candidate contract. PR review reopened TASK-004 because representative permission evidence
  does not clear all 195 selected categories. TASK-005 must remain inactive until the unchecked
  permission-manifest criterion passes. The future contract probe must also validate cross-entry
  timestamp consistency before treating the archive as a single data cut or deriving one as-of date.

## Task Detail Template

### TASK-XXX: Title

- Owner: Agent Role
- Priority: High | Medium | Low
- Milestone: M[N]
- Related requirements: FR-XX / NFR
- Description:
- Dependencies:
- Risks:
- Acceptance criteria:
  - [ ] Criterion 1
  - [ ] Criterion 2
- Verification commands:
- Results and evidence:
