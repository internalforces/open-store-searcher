<!--
Purpose:        Track the single active implementation task and its acceptance criteria
Owner:          Implementer / Planner
Update Trigger: When a task starts, is blocked, completes, or changes owner
Harness Version: 1.1
-->

# Active Tasks — open-store-searcher

_Last updated: 2026-09-02_

## In Progress

### TASK-006: Implement transformation schema and identifiers

- Owner: Architect / Implementer
- Priority: High
- Milestone: M1
- Related requirements: FR-05 through FR-06, Section 12.2
- Description: Design and implement a deterministic build-time transformation contract that
  separates exact source display values from normalized search values and defines stable business
  identifiers. Consume only TASK-005-accepted inputs and produce test artifacts for later status,
  validation, and publication tasks without publishing production records in this task.
- Dependencies: TASK-005 is complete and provides the accepted 195-entry source and schema
  contracts plus structured source and archive evidence.
- Risks:
  - Category-specific source columns may encode names, addresses, dates, or identifiers differently.
  - Normalization can destroy display evidence or collapse distinct businesses if it is applied to
    original values or identifier inputs.
  - A public identifier format becomes a compatibility boundary for later share URLs.
  - Status mapping and conservative `dataAsOf` derivation remain owned by TASK-007 and TASK-008.
- Acceptance criteria:
  - [ ] Write and obtain approval for an English transformation and identifier design before
        implementation, including an ADR for the exact record and public identifier contract.
  - [ ] Preserve source business name, street and parcel addresses, category, business type, raw
        operating and detailed status values, available lifecycle dates, and source provenance as
        separate display or evidence fields.
  - [ ] Define deterministic search-only normalization for names and addresses without modifying or
        executing original source strings as HTML.
  - [ ] Prefer the source management number for stable identity only after confirming its public-use
        contract; otherwise use an approved deterministic hash input and collision policy.
  - [ ] Detect missing identity inputs, duplicate identifiers, normalization collisions, and
        non-deterministic output ordering without inferring that any business is closed.
  - [ ] Cover representative category schemas, Unicode and whitespace boundaries, missing optional
        values, exact display preservation, normalized search values, and identifier stability with
        synthetic pipeline fixtures.
  - [ ] Do not map display statuses, derive `dataAsOf`, publish production records, add a workflow or
        deployment change, or add a dependency without its separate approval and owning task.
- Verification commands:
  - `npm run test:pipeline`
  - `npm run verify:full`
  - `git diff --check`
- Results and evidence: Activated after TASK-005 received independent final re-review approval on
  2026-09-02. Design and implementation have not started.

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
