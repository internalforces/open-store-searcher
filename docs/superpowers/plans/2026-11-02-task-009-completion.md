# TASK-009 Performance and Publication Completion Plan

> **For agentic workers:** Use superpowers:executing-plans for this continuation. Track each step below and obtain a fresh whole-change review before delivery.

**Goal:** Close measured complete-data performance gaps before publication/recovery and sequential TASK-010 reliability work.

**Architecture:** Preserve the existing static compact dataset, browser Worker, complete candidate scan, scorer, ordering and publication transaction. Reuse immutable address projections for mixed-query rows without a name match; measure preparation separately before selecting a bounded optimization.

**Tech Stack:** Existing TypeScript, Preact, Vite, Vitest, Node and pinned Ubuntu Actions; no new dependencies or services.

**Spec:** `tasks/active.md`, `standards.md`, the accepted TASK-009 initial-import specification, and the user's 2026-11-02 instruction to execute the identified priorities. Requirements: FR-02/03/07/08/12/13/14 and performance NFRs.

## Global Constraints

- TASK-009 alone is active; TASK-010 follows acceptance, TASK-028 remains paused and TASK-021 gated.
- Preserve every source record, exact IDs, full ranking, page evidence, cancellation and accepted state.
- Keep the 500 ms search, 2.5 s primary-content and 300 KB initial-code budgets unchanged.
- Preserve source collection 2026-10-16, unverified source coverage, status mapping and quality policy.
- Physical-device measurement remains user-skipped; retain hosted/emulated/public distinctions.
- No `.env`, credentials, paid services, new interfaces, telemetry or source delivery change.
- Preserve all existing dirty workspaces. The exact main snapshot is `2344bb6080fd534e51cb269eb4379d2fdaf487db`.
- Record actual deployment/recovery outcomes; a passing diagnostic cannot supply missing authority.
- Actual 30-day reliability cannot be inferred from synthetic tests or compressed time.

## Review Focus

- Mixed queries with a blank candidate name must retain exact-address score 100.
- A nonmatching nonempty candidate name must not gain eligibility from its address alone.
- Literal-name fallback, ambiguous addresses and contradictory secondary fields retain low confidence.
- Cancellation/overlapping searches must preserve accepted results and cleared scratch ownership.
- Every hosted fixture/repetition remains measured; add mixed coverage without replacing old fixtures.

## Task 1: Reproduce and remove mixed-query comparison duplication

**Files:** `src/search/compact-search.ts`, `src/search/compact-search.test.ts`.

- [x] Run the unchanged 110 search tests and profile the complete retained source on current main.
- [x] Add a repeated-address mixed-query comparison regression and blank/nonblank-name oracle cases.
- [x] Observe the expected repeated-comparison failure before changing production code.
- [x] Reuse query-local address ranks for rows with neither interpreted nor literal name matches; preserve score 100 only where the existing scorer permits it.
- [x] Run search/type/quality checks and complete-source rank/count/page parity; retain timings.
- [x] If ranking still exceeds budget, profile and test a bounded ranking correction before adopting it.

## Task 2: Preparation and memory follow-up

**Files:** The measured preparation bottleneck and its existing owning test file only.

- [x] Use actual CPU/allocation evidence to identify redundant preparation work.
- [x] Write and observe a failing regression for the chosen behavior, implement the smallest correction and run its complete relevant tests.
- [x] Compare full-source preparation, memory and search identities without treating Node diagnostics as browser acceptance.

## Task 3: Supported hosted verification and independent review

**Files:** Existing full-source diagnostic support/tests and focused evidence/handoff records.

- [x] Add fixed name/mixed fixtures with exact source counts while keeping all existing fixtures and budgets.
- [x] Run local full verification; identify unsupported Node/macOS failures explicitly.
- [x] Obtain a fresh independent review of production changes, tests and evidence.
- [ ] Deliver only the requested source/tests and readable evidence in a focused PR; read final-head canonical ordinary and full-source browser outcomes.
- [ ] Record complete readiness, primary/LCP, sampled memory, full-source identity and limitations.

Hosted follow-ups retain every failure. Query-phase allocation sampling after run
41410100414 suggests numeric-mask boxing. Final reviewed storage keeps the full
32-bit predicate as two interleaved Uint16 values, preserving four retained bytes
per projection. Observed RED/GREEN, 127 search tests and all 56 final split complete-
source comparisons pass. Sampled allocations decrease 63,805,840 to 39,898,904 bytes;
all 15 unprofiled Node serial samples meet 500 ms. Profiling/host limitations and
temporary preparation entries remain explicit.

## Task 4: Publication/recovery, then TASK-010

**Files:** Existing publication operators, approval records and workflow configuration only as authorized.

- [ ] After performance acceptance, prepare a new current-main candidate; recheck same-run identity/expiry and applicable deployment prerequisites.
- [ ] Complete protected publication, full public-byte equality, durable backup/redownload/adoption and expired-artifact recovery under the existing approval contract.
- [ ] Complete TASK-009 only when its actual acceptance criteria pass, then activate TASK-010 sequentially.
- [ ] Configure/verify the authorized daily refresh and collect its real 30-day reliability interval; preserve previous good data on every failed refresh.

## Verification

Use focused RED/GREEN tests, `npm run typecheck`, `npm run quality:search:check`, full-source parity, `npm run verify:full`, operator/admission tests and the existing canonical hosted runner. Every claim cites the actual command/run and preserves failed samples.
