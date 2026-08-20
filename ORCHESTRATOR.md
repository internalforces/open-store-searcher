<!--
Purpose:        Define the PRD-driven multi-agent workflow and human approval gates
Owner:          Architect / Planner
Update Trigger: When workflows, roles, approval policy, or release criteria change
Harness Version: 1.1
-->

# ORCHESTRATOR.md — open-store-searcher Workflow

_Last updated: 2026-08-18_

## Common Start

The Planner verifies PRD requirement IDs, scope, acceptance criteria, and expected tests, then promotes one task from `tasks/backlog.md` to `tasks/active.md`. Obtain human approval before implementation when the task includes an unresolved technical choice or a change to a product invariant.

## Feature Workflow

Planner → Architect (for complex features) → Implementer → Tester → Reviewer → Human merge approval

- New dependencies, stack choices, infrastructure, and public interfaces require approval during the Architect stage.
- Implementation deliverables: code, tests, and related documentation.
- Review deliverable: `reports/review-YYYY-MM-DD-topic.md`.

## Data Refresh Workflow

Researcher → Architect → Implementer → Tester → Security Reviewer → Reviewer

1. Research the source terms of use, schema, and attribution requirements.
2. Design collection, normalization, status mapping, validation, and atomic publication.
3. Implement transformers against fixtures.
4. Validate required columns, record-count shifts, duplicate IDs, status-code changes, and JSON size.
5. Verify that the last known-good data remains available after a failure.
6. Review GitHub Actions permissions and supply-chain risk before requesting deployment approval.

## Bug-Fix Workflow

Debugger → Implementer → Tester → Reviewer → Human deployment approval when required

The Debugger records reproduction steps and root cause in `memory/known-issues.md`. The Implementer performs only the approved fix, and the Tester adds a regression test.

## Search Quality Workflow

Planner → Architect → Implementer → Tester → Performance Engineer → Reviewer

- Achieve at least 90% Top-3 recall on the exact name-and-address test set.
- Never auto-confirm candidates whose addresses conflict.
- Target search results within 500 ms after data loading.
- Separate low-confidence matches into a similar-candidates area.

## Security and Privacy Workflow

Security Reviewer → Human approval → Implementer → Security Reviewer → Reviewer

Verify that search terms are not transmitted, input is treated as text, new-window external links are protected, secrets are absent, and GitHub Actions permissions are minimal.

## Release Workflow

Reviewer → Tester → Performance Engineer → Documenter → Architect → Release Manager → Human approval

Before release, verify every P0 item and release criterion in `docs/prd-traceability.md`. Only the Release Manager may run tagging and deployment procedures after approval. After deployment, verify the data as-of date and the latest successful refresh state.

## Milestone-Close Documentation Workflow

Planner → Tester / Reviewer → Documenter → Human Korean-language review → Planner closes milestone

1. Complete the milestone's implementation, automated and manual verification, and required role reviews.
2. The Planner identifies which files under `handbook/ko/**` are affected without loading their contents.
3. The Documenter reads authoritative outcomes and only the affected handbook files, then updates verified Korean explanations.
4. The Documenter adds one concise entry to `handbook/ko/milestone-history.md`.
5. Record every handbook file as Updated or Reviewed without change, with the reason and evidence.
6. A human reviews Korean clarity, safety terminology, and accuracy.
7. The Planner closes the milestone only after the documentation gate passes.

Work in progress must not be added to the handbook baseline. The handbook may intentionally lag active work, but its visible baseline and last review date must remain accurate.

## Approval Gate Summary

| Situation | Reason |
|---|---|
| Initial technology stack selection | The PRD requires a separate implementation-planning decision |
| New external dependency or service | Affects zero-cost operation, security, and licensing |
| Status-mapping change | Risks an incorrect operating or closure determination |
| GitHub Actions or Pages change | Affects supply-chain security, permissions, and deployment stability |
| Security-related change | Affects privacy, input handling, and external-link safety |
| PRD scope change | Affects non-goals and safety invariants |
| Release or deployment | Final responsibility remains with a human |
| Final milestone closure | Korean handbook impact and language accuracy require human review |
