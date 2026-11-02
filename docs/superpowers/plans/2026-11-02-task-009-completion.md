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

### Cached admission after final-head variance

Run41500086829/head346de5c passes ordinary1,469/92/20 plus102/9 but retains one519.3ms
mobile-cold mixed observation:403.5ms worker reply plus115.8ms paint opportunity.
All59other observations pass; priorfef1e36's60/60pass remains evidence, not a waiver.
Current-code CPU sampling places most mixed cost in per-row name/address admission.
A private cache-hit prototype records mixed193–199ms versus separate scalar218–230ms;
these uncontrolled Node observations are not browser acceptance.

Preserve all cache sentinels/flags and short-circuit order. Read cached admission
bytes directly in the scan, call the unchanged computation only on a zero byte,
and reuse the row's name flags/reference scalars. No algorithm, rank, record, buffer,
page, ownership, cancellation, source/status/date or budget change. Existing semantic/
call-count tests plus full frozen-main parity and fresh independent review precede
delivery; actual final-head ordinary/full-source verification remains mandatory.

Cache-hit final verification:135search/types/style/build/quality/9admission pass;
full local1,465pass/four unchanged platform failures. All56complete-source vectors/
counts/pages equal frozen main with all bindings verified, receipt24abd14f8673c34dd2c33d72a71b12fd5ba816875e7b4df8372876079f27ab85.
Separate final serial all15 meet500ms, mixed194.5–195.3ms; no sampling/GC/warming.
Fresh independent exact-delta/oracle/every-page/cancellation review approves with no
findings. Deliver the four owned source/report/plan/active files, then read both real
canonical jobs; no prior observation or budget is replaced.

Run41458949548/headfef1e36 passes canonical1,468/92/20 plus102/9 and all60 complete-source
searches179.3–436.3 ms, preserving all prior failures. Product bindings match; one
existing local inferred-boundary regression was omitted from delivery and is included
in the final test/evidence-only continuation. Final continuation checks precede merge.
Readiness64.6–71.7s and sampled3.63–3.84GB RSS remain limitations; physical testing
remains user-skipped and publication/recovery acceptance is separate.

### Rank-only allocation follow-up after native-store failure

Actual run41432858991/head2f26f05 passes canonical1,467/92/20 plus102/9 but full-source
55/60 only: mixed879.8/892.1/876.6 ms and mobile-cold district614.4/624.5 ms. Preserve
the raw report and all failed samples. Two collections begin during the preceding
name fixture, so the first mixed search is not proven to initiate them. Current-code
collected-object sampling measures13.77MB across three name searches and17.58MB across
three mixed searches, with detailed scorer/name/split/Set allocations prominent.
Sampling perturbs timings and does not establish browser acceptance.

Bounded design: existing byte name workspace caches exact/partial/none interpreted
and literal matches. No-address admitted rows rank at score0/low/no-conflict, deferring
exact reasons to page materialization. Address-bearing rows reuse projection flags
even when names qualify. Extract the existing score/confidence policy into one shared
scalar primitive consumed by both detailed scoring and compact ranking; preserve all
500/400/300/100 scores, ambiguity/conflict/fallback/inferred-boundary behavior, complete
vectors/page reasons and independent state. No new buffers, policy, data, budget,
warming, app GC, source/schema or public interface changes.

- [x] Observe rank-only detailed-scorer and repeated named-projection regression failures.
- [x] Implement shared scalar ranking, then run all search/types/quality checks.
- [x] Compare collected allocations and separate unprofiled full-source observations.
- [x] Run fresh56-query frozen-main parity binding every changed scorer/module.
- [x] Obtain independent policy/cache/alias review.
- [ ] Obtain final-head supported verification.

The reviewed native parsed-address follow-up addresses retained collections after43cd7f8:
replace per-projection AddressParts objects with five Uint32 component-reference
columns, a small Uint16 flag column and exact keys. Source components are interned;
query lookup is read-only and unknown values are never inserted. Preserve every
field/key/family/strong/core/ambiguity value, reuse one explicit address target for
ranking, and reconstruct fresh objects only for page evidence. Keep existing byte/
score workspace allocation assertions and all budgets. Roundtrip/growth/input independence/unknown lookup tests and integrated target RED/GREEN
pass;133search tests and56full-source vectors/counts/pages agree. Source receipts bind
thenewmodule with frozen-originalnull. Independent semantic/evidence review and memory/
unprofiled Node checks pass; fresh supported ordinary/full-source outcomes remain.

The ordinary43cd7f8 decoration flake is separately addressed by a test-only held-response
loading window. Keep zero motion thresholds, all native observations, atomic takeRecords
snapshots/delivery phases, unchanged user-action/resource checks and teardown attachment.
Independent review/type/style pass; its real browser check remains required.

**Files:** Existing full-source diagnostic support/tests and focused evidence/handoff records.

- [x] Add fixed name/mixed fixtures with exact source counts while keeping all existing fixtures and budgets.
- [x] Run local full verification; identify unsupported Node/macOS failures explicitly.
- [x] Obtain a fresh independent review of production changes, tests and evidence.
- [ ] Deliver only the requested source/tests and readable evidence in a focused PR; read final-head canonical ordinary and full-source browser outcomes.
- [ ] Record complete readiness, primary/LCP, sampled memory, full-source identity and limitations.

Hosted follow-ups retain every failure, including be30350's three mobile misses in
run41416612445. Final reviewed preparation shares only equal address components,
owns packed Uint32 column refs and releases completed original reference containers
through a complete retryable per-call list. Worker drops its caller snapshot before
preparing while retaining metadata/count and original publication guards. Strict wire
JSON arrays, source/status/date, full matching/ranking and input immutability remain.

Observed RED/GREEN ownership/cancellation/progressive-retry regressions and all129
search tests/types pass. Final56-query source parity passes with source hashes bound;
local full1463 retains four unchanged unsupported-host errors. Actual production-code
offline memory snapshots show1.39GB managed heap before diagnostic GC/1.35GB afterward,
plus216MB of typed reference buffers. These are not peak/RSS or hosted latency claims.
All15 final unprofiled Node serial observations meet500 ms, with source/host limitations
retained. Supported final-head ordinary/full-source browser outcomes remain pending.

## Task 4: Publication/recovery, then TASK-010

**Files:** Existing publication operators, approval records and workflow configuration only as authorized.

- [ ] After performance acceptance, prepare a new current-main candidate; recheck same-run identity/expiry and applicable deployment prerequisites.
- [ ] Complete protected publication, full public-byte equality, durable backup/redownload/adoption and expired-artifact recovery under the existing approval contract.
- [ ] Complete TASK-009 only when its actual acceptance criteria pass, then activate TASK-010 sequentially.
- [ ] Configure/verify the authorized daily refresh and collect its real 30-day reliability interval; preserve previous good data on every failed refresh.

## Verification

Use focused RED/GREEN tests, `npm run typecheck`, `npm run quality:search:check`, full-source parity, `npm run verify:full`, operator/admission tests and the existing canonical hosted runner. Every claim cites the actual command/run and preserves failed samples.
