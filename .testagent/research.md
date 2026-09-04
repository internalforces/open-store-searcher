# TASK-008 Test Research

Broad scope: staged refresh validation, shared freshness, and JSON-byte validation.
ADR-014 explicitly approved on 2026-09-04. Only synthetic inputs and reviewed policy-shaped
fixtures are authorized; no production defaults or publication path.

Targets: new src/pipeline/validate-license-refresh.ts, validation metrics/contracts if needed,
src/shared/data-freshness.ts, src/pipeline/validate-json-bytes.ts. Existing collector, transformer,
and mapper stay authoritative. Vitest colocated unit/pipeline tests, exact assertions, Node
24.19.0, global coverage 80/80/80/75 and mapper 100% apply.

Checklist: approved design V01-V13: provenance/complete ingestion; duplicates and identity;
count/missing/status distributions; date evidence and seven-day Seoul boundaries; baseline and
policy gaps; UTF-8 JSON byte validation; deterministic non-mutating results. V14 publication,
source-cut evidence, production calibration, and original PRD access remain explicit blockers.

No callable source-pairing, test-gap-analysis, assertion-quality, or named testing-generator tool
was found. Bounded inventory and quality review run inline, with delegated helper implementation
and an independent final reviewer. Existing TASK-007 evidence remains in its reports.
