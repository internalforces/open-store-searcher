# Dashboard Visual Restraint and Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the dashboard's repeated visual decoration and make short animation communicate accepted actions and selected-record identity.

**Architecture:** Preserve App's accepted submission/dataset/request ownership, SearchResults' selected ID/origin/page derivation and stateless shared evidence. Change presentation and empty decorative layers only; animations never participate in data acceptance or focus timing.

**Tech Stack:** Existing pinned Node24.19.0/npm11.17.0, TypeScript7.0.2, Preact10.29.8, Vite8.2.1, CSS/SVG, Vitest and Playwright. No new package.

**Spec:** [Finalized dashboard refinement](../specs/2026-10-22-dashboard-refinement-design.md), QM-01–08. TASK-028 is active under the explicit 2026-10-23 instruction to finalize the design and implement. Remaining verification gates are recorded separately.

## Current execution authority — 2026-10-23

The user explicitly activated TASK-028 and requested design finalization followed by implementation.
The existing restrained Prism material/motion table is finalized under that delegation; the exact
values are the implementer's calls, not values directly supplied by the user. This instruction
changes sequencing while preserving TASK-027's pending-refresh/loader actual-speech gaps.
Execute the four stages inline and obtain one fresh whole-change review. Preserve every content,
focus, request, deadline, retry, performance and safety contract. Earlier proposed approval/status
statements below are retained historical planning context, superseded by this authority.
Git metadata is read-only: normal feature-branch creation failed, so owned source changes remain
in the already isolated checkout for review. No push, merge or deployment is included.

## Global Constraints

- Preserve all AGENTS.md product safety, privacy, source/status/date/uncertainty and last-good invariants. No new dependency/service, public interface, pipeline/Worker contract, security setting or deployment.
- Only approved display statuses; all raw quartet/source/date/warnings, both addresses, repeated business types and all eight lifecycle fields remain available before/after selection as currently required.
- Keep engine order, primary/Top-3 ambiguity/confidence, total counts and20-item similar pages; never fetch off-page records for decoration.
- Keep current native inspect/return/page/submit focus semantics; no URL/hash/query persistence or additional live region for animation.
- Retain body scrolling,1280/1024 breakpoint semantics,72/64px rails,16px body,14px minimum labels,44px controls and48px search controls. No essential opacity delay, clipping or independent scroll panel.
- Proposed visual changes are the spec's neutral canvas/ink, reduced panel nesting and small prism accent; status palettes/focus policy remain unchanged. Obtain full design approval before applying them.
- Proposed motion: no entrance sweep,120ms hover,80ms press,160ms accepted-response underline,180ms selected-edge trace. One iteration, no success effect on stale/rejected work, no clock/focus replay. Reduced/forced media removes decoration and retains static state.
- Preserve existing5s assertion deadlines, retries/failOnFlaky, runner defaults and all2.5s primary/LCP,500ms loaded-search/page,300000byte initial-code budgets. Alternative serial results do not replace the required default pass.
- All harness content is English; never access handbook/ko/**. TASK-009 waits,010paused,021gated; TASK-023 enhancements are excluded. No merge/deploy is implied by this plan.

## Implementation checkpoint — 2026-10-23

Stages 2 and 3 product edits are implemented; component189/type/style/build/search quality pass.
The [current verification record](../../../reports/test-2026-10-23-task-028.md) records exact source
bindings and all outstanding checks. Three unchanged macOS archive-tool tests fail; local server
and browser execution are blocked. Fresh rendered comparison, browser RED/GREEN, media/axe/zoom/
actual speech and runtime performance cannot be claimed. Checkboxes below remain open wherever
the full step's verification contract is unmet. Final source review is in progress; no task or
release acceptance is inferred from implementation.

## Review Focus

1. Same-name/address-conflict candidates keep complete uncertainty/evidence after denser row styling (Task2).
2. A clock tick/focus return/background-tab change never remounts feedback or duplicates announcement (Task3).
3. Repeated identical search, rapid page changes and reused-ID replacement never animate old detail as current (Task3).
4. Fixed14px labels doubled to28px, long raw URL/type fields and200%zoom remain reachable without ellipsis/clipping (Task4).
5. Changing reduced/forced media during an effect leaves immediate static selected state and visible focus (Task3/4).

## File responsibilities and interfaces

| Files | Responsibility and preserved boundary |
|---|---|
| src/app/app.css | Material/hierarchy/motion tokens and responsive/fallback rendering only |
| src/app/workspace-intro.tsx | Quieter first-use composition with existing coverage/source props and truthful no-record guidance |
| src/app/app.tsx / search-form.tsx | Only markup/layout hooks if needed; App dataset/submission/request guards and SearchForm value/onChange/onSubmit/busy/disabled contract stay unchanged |
| src/app/candidate-summary.tsx / result-card.tsx / record-evidence.tsx | Preserve existing props/stateless evidence; only structural classes if separators cannot be expressed in CSS |
| src/app/search-results.tsx | Keep selected-ID/origin/page logic and existing keyed empty decorations; no animation state owner |
| tests/e2e/workspace.spec.ts and existing app tests | Update only approved decorative assertions, retain meaningful content/identity/focus/privacy/race checks |
| tests/performance/browser.tsx / scripts/measure-performance.mjs | Preserve complete oracle and methodology; do not alter to manufacture a better score |
| reports and task/memory/traceability | Exact new source bindings, design comparison, tests, limits and independent findings |

### Task1: Resolve delivery gates and approve the design

**Files:** Read current task/test/review records; refine the linked proposed design only when the human reviews it. Record new decisions in memory/decisions.md.
**Interfaces:** Consumes TASK-027's unchanged implementation and actual PR CI/manual evidence. Produces explicit design approval, current baseline and active-slot authority; it produces no application change.

- [ ] Read the new PR's exact-head Verify result. Preserve the local91/92failure as historical; a new hosted pass is separate evidence, never a rewritten local result.
- [ ] Obtain current-source real screen-reader observations of repeated search/page announcements, inspection heading and exact/fallback return; record actual output, OS/browser/AT and source binding. Do not treat nativeAX/axe as spoken output.
- [ ] Resolve TASK-027 completion or obtain an explicit sequencing change. Do not activate TASK-028 alongside it.
- [ ] Prepare one bounded desktop1586/mobile390 direction comparison from real content, including selected/tied/empty/error states; no fabricated photographs or business facts. Capture the user's approval of the full design/material/motion table.
- [ ] Establish a before-change source/hash/visual/performance baseline under the same existing profiles. Reuse current evidence only when all relevant hashes/configuration match; label historical evidence honestly.
- [ ] Commit approved planning records on an isolated feature branch, preserving existing worktrees. Treat the prior Sol/high implementation and Sol/xhigh review method as a proposal for later
  confirmation. At execution, obey the latest host routing and any applicable explicit human
  override; this document does not grant a model-routing exception.

### Task2: Refine hierarchy and materials without behavior changes

**Files:** Modify src/app/app.css, workspace-intro.tsx; App/SearchForm/CandidateSummary/ResultCard markup only where necessary. Preserve record-evidence.tsx logic. Verify existing workspace, evidence, accessibility and recovery tests.
**Interfaces:** Consumes approved Task1 visual contract. Produces the same component props, readable complete evidence and quieter first-use/selected views for Task3.

- [ ] Before editing, record baseline content and accessible names for unique/tied/similar/empty/retained-failure states. Add a regression only for a newly identified behavior gap, not one test per CSS declaration.
- [ ] Implement the approved neutral planes, reduced radii/card nesting, compact search and small prism mark. Prefer CSS on existing DOM; do not replace repeated raw evidence with hidden accordions or tooltips.
- [ ] Keep same-name identities distinguishable by address/absolute position, and all original date/status/source labels and missing-value fallbacks. Check both default ResultCard and workspace mode.
- [ ] Run npm run test:component, npm run typecheck, npm run lint and npm run format:check on the pinned runtime; require no regression. Retain raw output and source hashes.
- [ ] Inspect one batched desktop/mobile visual round against the approved comparison. Save correction needs for one coherent batch; do not start an open-ended polish loop.
- [ ] Commit owned presentation changes and obtain independent task-scoped Sol/xhigh review before motion work.

### Task3: Add purposeful bounded feedback and interruption coverage

**Files:** Modify src/app/app.css and existing empty decoration markup in search-results.tsx/result-card.tsx only when needed; adapt tests/e2e/workspace.spec.ts. No new animation package, event bus or source-data state.
**Interfaces:** Consumes Task2 component props/layout and existing submission/page/selected-record keys. Produces approved effects without changing accepted data, native focus, live-region count or CSS-independent visibility.

- [ ] First adapt/add the named browser regression `accepted actions show quiet feedback without replay or stale identity` to assert the approved160/180ms decorations, immediate visible evidence/focus and unchanged record identity. Run it against old effects and retain the meaningful failing result.
- [ ] Replace the650ms entrance and multicolor sweeps with the approved static accent/blue feedback table. Empty aria-hidden layers remain absolute and pointer-inert. No essential text transform/opacity or search completion chained to animation.
- [ ] Extend the same bounded regression for repeated identical submit, accepted page, selecting the same/different record, clock/focus/visibility rerender, rapid changes and rejected/obsolete replies. Reuse existing deferred integration fixtures rather than inventing a second request lifecycle.
- [ ] Add/retain `motion preference changes preserve immediate evidence and focus`: switch reduced motion and forced colors during an active effect; verify selected identity, heading focus, all raw evidence and static selected boundary survive. Check completed effects do not remain on an invisible interactive overlay.
- [ ] Run focused workspace browser cases on Chromium/mobile and affected component regressions; preserve RED/GREEN/source binding. Keep all unrelated assertions and existing deadlines unchanged.
- [ ] Commit owned motion/test changes and obtain task-scoped Sol/xhigh review. Fix substantive feedback with focused reproductions; do not broaden into engine or runner refactors.

### Task4: Verify the final presentation and close only supported gates

**Files:** Existing tests/e2e/{workspace,search,accessibility}.spec.ts; new dated test/review/performance/capture reports; tasks/active.md, completed.md, memory/{project,session,decisions,architecture,known-issues}.md and docs/prd-traceability.md only as supported by results.
**Interfaces:** Consumes the approved visual/motion contract and Task2/3 reviewed source. Produces QM01–08 evidence, whole-branch review and explicit disposition of remaining external gates.

- [ ] Exercise exact320/390/768/1023/1024/1279/1280/1586px widths, long raw source/type/status text, all-element2x fonts including14→28px, and actual200%browser zoom. Require page scrollWidth<=viewport, readable source/warnings and visible search/return controls.
- [ ] Verify normal/reduced/forced/no-blur media, forward/reverse keyboard, immediate content and stable geometry before/during/after effects. Run axe on initial, unique, tied/neutral, similar, empty, rejected/retained and first/last-page states; every violation array must be empty.
- [ ] Perform current-source manual screen-reader observation, with actual repeated search/page announcement and inspection/return output. Preserve original system settings after any separately authorized temporary change.
- [ ] Run npm run verify:full under the pinned supported contract, then npm run performance:check with unchanged profiles/scales/repetitions/oracle and all samples. Require default exit0 and unchanged budgets; retain failures and physical/hosted/production limits.
- [ ] Complete at most one correction batch and one batched confirmation round. Compare with Task1's approved references using a human judgment of hierarchy/restraint, not an invented AI-score target.
- [ ] Record QM01–08 requirement-to-named-test/evidence mapping and an independent whole-branch Sol/xhigh review; do not let a plan or screenshot substitute for verification.
- [ ] Update task/memory/traceability. Move only truly completed work to completed.md; do not infer milestone/handbook/release/operational acceptance or authorization to push/merge/deploy.

## Self-review and execution handoff

Spec coverage: material/hierarchy ->Task2; motion/interruptions ->Task3; readable evidence,
responsive/media/AT/budgets ->Task4; approval/active-slot/prior gates ->Task1. All five Review Focus
conditions have owning tasks. No new prop/type/state contract or dependency is invented; only
approved decorative timing assertions are replaced. The plan does not require routine CSS-only
unit tests or relax the current WebKit readiness failure.

This is a proposed plan delivered for review, not an execution approval. The recommended sequence
is sequential implementation/review per unit followed by whole-branch review. Retaining the
prior Sol/high and Sol/xhigh method requires later confirmation or an applicable explicit user
override; otherwise follow the latest host routing. Review this full design/plan before any
follow-up product change. No TASK-028 activation or product implementation occurs in this pass.


Independent planning check: Sol/xhigh reports no material unanswered question after clarifying
conditional future routing. See [the planning review](../../../reports/review-2026-10-22-dashboard-refinement-plan.md).
Human design review and execution/active-slot authority remain outstanding.
