<!--
Purpose:        Current session state and handoff for the next agent
Owner:          Currently active agent
Update Trigger: Read at session start and update before session end
Harness Version: 1.1
-->

# Current Session — open-store-searcher

_Last updated: 2026-09-02_

> After a session, add a snapshot to `memory/sessions/YYYY-MM-DD-ROLE.md` when useful.

## Session Information

- Date: 2026-09-02
- Agent role: Architect / Researcher / Planner
- Session goal: Complete TASK-006 pre-implementation design and approval preparation without
  transforming production records or writing implementation code

## Previous Session Summary

TASK-005 received independent final re-review approval and was completed. TASK-006 became the only
active task, with design and implementation not started. Status mapping, `dataAsOf`, validation,
publication, deployment, and production-data work remain assigned to later tasks.

## Current Work

- [x] Confirm clean `main`, fetch `origin`, fast-forward with `--ff-only`, and create
      `codex/task-006-design` before changing files.
- [x] Read the mandated Architect, Researcher, and Planner context and the accepted TASK-004/005
      source, schema, collector, test, and review evidence without accessing `handbook/ko/**`.
- [x] Audit the accepted 195-category schema contract without downloading production data.
- [x] Research current official identity, permission, Unicode, canonical-encoding, and SHA-256
      sources; record URLs and the 2026-09-02 check date.
- [x] Draft the English TASK-006 transformation and identifier design and Proposed ADR-012.
- [x] Record identity, business-type, collision-threshold, and public-format open questions.
- [x] Complete formatting, whitespace, language, forbidden-scope, and repository-state audits.
- [ ] Commit, push, and open the design-only PR without merging it.

## Completed This Session

- [x] Defined separate exact display/evidence and versioned search-only fields.
- [x] Defined NFKC, lowercase, and explicit Unicode-whitespace normalization plus rules that are not
      applied.
- [x] Defined inert-text and JSON/render safety boundaries without overwriting source evidence.
- [x] Confirmed from provider guidance that source identity uses service ID, authority code, and
      management number and that management number alone can repeat across industries.
- [x] Confirmed the accepted TASK-005 schemas omit provider service ID; file-data ID equivalence and
      public stability remain unverified.
- [x] Compared raw source, opaque hash, surrogate registry, and prohibited descriptive alternatives.
- [x] Proposed a conditional length-prefixed UTF-8 SHA-256 contract, collision rejection,
      reproducibility vectors, versioning, and migration policy without approving a public format.
- [x] Defined fail-closed missing/duplicate/collision/order rules and a schema-only synthetic test
      matrix.
- [x] Passed `npm run format:check` and `git diff --check`.
- [x] Confirmed every changed harness document is English except exact quoted source/product
      literals, all required design sections and open questions are present, and ADR-012 remains
      Proposed with no TASK-006 acceptance checkbox completed.
- [x] Confirmed the staged scope has no handbook, production data, environment/secret, workflow,
      deployment, dependency, application implementation, or test implementation change.

## Issues and Decisions Found

- ADR-012 remains Proposed and every TASK-006 acceptance checkbox remains incomplete.
- The recommended progress option is an opaque hash that treats `fileDataId` only as a versioned
  project category namespace. It must not claim provider-primary-key equivalence.
- The safer identity-claim option is to obtain a current official service-ID mapping first.
- The public prefix, encoding, truncation, and share-URL placement remain TASK-022 decisions.
- The business-type header registry, optional-cell policy, invalid-control policy, and production
  normalization-collision thresholds remain open.

## Next Session

1. Review the design-only PR and choose identity direction A, B, or C from the design.
2. Approve or revise ADR-012 and resolve the exact business-type registry before implementation.
3. Keep ADR-012 Proposed and do not start TASK-006 implementation until approval is explicit.
4. After approval, implement only TASK-006 with synthetic fixtures and its required verification.

## Important Context

TASK-006 design is reviewable but not approved or implemented. Official evidence does not support
management number alone as identity and does not establish `fileDataId` as provider service ID.
Status mapping remains TASK-007, conservative `dataAsOf` derivation remains TASK-008, publication
remains prohibited, and no deployment, production-data operation, workflow, external service,
dependency, application implementation, or handbook change occurred.
