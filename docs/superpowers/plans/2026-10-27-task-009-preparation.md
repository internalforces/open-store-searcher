# TASK-009 preparation optimization implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Reduce measured redundant preparation work and retained address allocation without changing search results.

**Architecture:** Reuse complete validated compact inputs. Specialize projection work and use the
existing canonical address key during the admission scan; retain the unchanged detailed scorer.

**Tech Stack:** Existing TypeScript, Vite, Vitest and Node inspector; no dependencies added.

**Spec:** docs/superpowers/specs/2026-10-27-task-009-preparation-design.md

## Global Constraints

- Preserve all 2,951,024 records, complete ranking/page evidence and cancellation.
- Preserve collection-date/null source coverage/status mapping and browser-only query handling.
- No data-format, source, workflow, infrastructure, dependency or public-interface changes.
- Node 22/local profiles do not establish pinned/mobile/hosted acceptance; physical testing remains skipped.
- User authorizes implementation and PR creation; no deployment or main merge is included.

## Review Focus

- Nested notation and compatibility Unicode retain the same one-pass normalization at each existing stage.
- Numeric literals match entire tokens even after a failed earlier substring occurrence.
- Empty addresses, repeated spaces and multiword query tokens preserve original predicate behavior.
- Aborted preparation/search never publishes partial state and remains retryable.
- Real-source ordinal vectors and full-field boundary pages stay identical, including conflicts/ties.

### Task 1: Profile the unchanged full snapshot

**Files:** scripts/profile-compact-search.mjs; private .testagent/task009-profile-20261027.
**Interfaces:** Consumes verified site release and existing loadCompactSnapshot/CompactSearch.
Produces hashed CPU/allocation profiles, source-bound summaries and ordered/page identities.

- [x] Validate all retained compact assets with the unchanged loader; assert2,951,024 records.
- [x] Profile preparation and fixed district/name/address/zero/mixed searches; preserve raw profiles.
- [x] Run the existing46focused search/projection/address tests; expected46 pass.

### Task 2: Implement measured lossless preparation changes

**Files:** src/search/prepare-search-query.ts and test; compare-search-address.ts;
search-candidates.ts and test; compact-search.ts and test.
**Interfaces:** projectSearchName(value:string):string; normalizeSearchNotation(value:string):string;
matchesLiteralAddressKey(key:string,literalTokens:readonly{value:string;numeric:boolean}[]):boolean.

- [x] Write semantic projection/predicate regressions and observe missing-export failures.
- [x] Factor exact existing normalization/name projection; avoid unused per-token projection fields.
- [x] Remove eager address token arrays/wrappers; evaluate key admission and split only for scoring.
- [x] Run full search/address/projection/compact suites including all-page parity and cancellation.
- [x] Reprofile the same immutable full data; require identical complete vectors and boundary pages.

### Task 3: Verify and deliver

**Files:** reports/performance-2026-10-27-task-009.md and bounded JSON evidence;
memory/session.md, project.md, decisions.md, known-issues.md; tasks/active.md; docs/prd-traceability.md.
**Interfaces:** Record actual commands, runtime limits, before/after measurements and PR identity.

- [x] Run applicable types, lint, format, unit/component/pipeline, quality and build checks.
- [x] Review complete changes independently; address material findings with regressions.
- [ ] Commit scoped files on a new branch via available Git tooling and create the requested PR.
- [ ] Read actual CI outcome; keep canonical/environment/performance limits explicit.

## Execution record

Native inline execution. Existing isolated worktree65cb9e6/codex/task-009-preparation-profile is clean
before this continuation; old dirty workspaces and their preservation archives remain untouched.
The user's explicit execution request covers this bounded internal design; no repeated approval gate.
Baseline tests46 pass. Full preparation profile49,951.7 ms includes inspector sampling overhead.
Retained sampled split allocation508,057,256 bytes; application CPU concentrates in full projections
and normalization. The true empty fixture is source-verified as0eligible/0similar.

Task 2 complete: search 105 pass; original/current full-source 55-query parity passes.
Task 3 verification records local unsupported-host failures; canonical PR CI remains pending.
