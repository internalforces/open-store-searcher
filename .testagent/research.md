# TASK-007 Test Research

Scope: domain mapper and transformer integration (FR-04, FR-07, Section 12.2).
ADR-013 was accepted by the user on 2026-09-04. Fixtures are synthetic and offline.

Targets: new `src/domain/map-license-status.ts` and existing
`src/pipeline/transform-license-records.ts`; colocated Vitest tests use exact assertions.
The domain belongs to the unit project and the transformer to the pipeline project.
No test-generator, source-pairing, gap-analysis, or assertion-quality tool is available;
the Research → Plan → Implement workflow runs inline using this bounded inventory.

Acceptance checklist:
- Exact approved pairs return the four allowed statuses; all other combinations fail safely.
- Null, partial, contradictory, unknown, whitespace, and Unicode variants remain unverified.
- Detailed evidence never overrides aggregate mapping; source fields remain unchanged.
- Transformation schema V2 adds processed status without changing identity, normalization, or order.
- Tests precede production edits; mapper file statements, branches, functions, and lines reach 100%.
- Focused tests, pipeline tests, full verification, and whitespace checks pass.
- No dependencies, production data, freshness, publication, workflows, or public URL changes.
