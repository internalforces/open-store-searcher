# Prism Glass Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved Prism Glass search workspace while preserving complete candidate results, evidence, uncertainty and recovery behavior.

**Architecture:** App retains dataset/submission/request ownership. SearchResults owns ephemeral inspection alongside pagination; summaries and the selected article consume the same accepted matches and coverage. CSS supplies the replacement visual identity without changing search, Worker, loader or publication contracts.

**Tech Stack:** Existing TypeScript 7.0.2, Preact 10.29.8, Vite 8.2.1, Vitest, Testing Library, Playwright and axe; Node.js 24.19.0/npm 11.17.0 on the approved runner.

**Spec:** [Approved Prism Glass design](../specs/2026-10-22-prism-glass-dashboard-design.md), PG-01 through PG-15. The user approved the detailed design on 2026-10-22 after execution intake. The user approved continuation and specified GPT-6.1 Sol/high implementation and GPT-6.1 Sol/xhigh review; execution is authorized.

## Global Constraints

- Work only on TASK-027 in `.worktrees/task013-quality`, branch `codex/task-027-prism-glass`, base `596080a41b6b5884a73a9bdffb52333548441fe5` (PR #36). Preserve existing administrative edits and all other checkouts.
- No dependency, service, source-delivery, status-mapping, public-URL, data-pipeline, Worker-protocol, security-setting or infrastructure change.
- No photos, history, favorites, share controls, personal/registration fields, dragging or enhanced TASK-023 navigation.
- Display only `"행정상 영업"`, `"휴업"`, `"폐업"`, `"확인되지 않음"`; preserve all original evidence, missing-value fallbacks and synthetic/collection/source-date distinctions.
- Reuse mapLicenseStatusV1, EvidenceContext, SourceLink, CoverageClock and MapLinks as policy owners. Queries/selections stay ephemeral and browser-only; external maps require explicit action.
- Keep engine order, Top-3 separation, confidence, ambiguity, total counts and 20-item similar pages. Do not fetch off-page records for presentation.
- Use the spec's exact palette, spacing and motion table. Desktop >=1280px has a 72px rail and three visual columns; 1024–1279px has a 64px rail and two columns; below 1024px uses normal-flow navigation and one column.
- Body is the scroll container. No fixed canvas height, horizontal page scroll, sticky search header, drawer, independent scrolling panel or clipped evidence.
- Blur at most two bounded decorative shells at 12px on wide screens; disable below 1024px. Evidence stays opaque/at least 96% white. Body text 16px, small text >=14px, controls >=44px, search controls >=48px.
- Motion is finite and decorative; content appears immediately. Reduced-motion removes spatial/sheen effects; forced colors uses system surfaces and hides glints.
- Required budgets: first content/LCP <=2500ms, loaded search/page display <=500ms, uncompressed initial code <=300000 bytes. Synthetic lab success does not establish physical-device, hosted or production readiness.
- All harness updates are English. Do not access `handbook/ko/**`. TASK-009 waits, TASK-010 is paused, TASK-021 remains gated. No push, merge, publication, deployment or release action is included.

## Review Focus

1. Identical names, IDs reused by a replacement dataset, and repeated identical submissions must never retain the wrong inspected record (Task 3).
2. A selected similar candidate leaving the visible page, including return to a removed invoking button, must clear inspection or restore a meaningful fallback focus (Task 3).
3. Deferred search/page replies and rejected refreshes must retain the accepted query/page/evidence association without an intermediate mismatched article (Task 3).
4. Very long raw evidence/URLs, missing values and repeated business-type source fields must remain readable at narrow widths and enlarged text (Tasks 2 and 4).
5. An entrance/detail effect interrupted by reduced motion, forced colors or absent blur support must never hide text, controls, focus or evidence (Tasks 1 and 4).

## File responsibilities and internal interfaces

| File | Responsibility |
|---|---|
| `src/app/app.tsx`, `search-form.tsx`, `app.css` | Workspace composition, truthful first-use state, local navigation, approved materials and responsive/motion rules. Preserve existing submission/loader guards. |
| New `src/app/workspace-intro.tsx` | `WorkspaceIntro({ coverage: Coverage, sourceLabel: string, sourceUrl: string | null }): JSX.Element`; guidance, local decorative prism and real dataset context only. No business article, candidate, status or invented totals. |
| New `src/app/record-evidence.tsx` | `RecordEvidence({ record: DisplayRecord, coverage: Coverage, synthetic?: boolean }): JSX.Element`; raw status quartet, source, EvidenceContext and statusDisclaimer. Export `EvidenceField({ label: string, value: string | null }): JSX.Element` for unchanged missing-value formatting. No state, lifecycle or external-map action. |
| New `src/app/candidate-summary.tsx` | `CandidateSummary({ match: CandidateMatch<DisplayRecord>, coverage: Coverage, synthetic?: boolean, position: number, selected: boolean, onInspect: (button: HTMLButtonElement) => void }): JSX.Element`; one mapped status/confidence, original identity/category, shared evidence and native inspect button. |
| `src/app/result-card.tsx` | Preserve default complete-card API; add optional `layout?: 'card' | 'workspace'`, `headingRef?: Ref<HTMLHeadingElement>`, `onReturn?: () => void`. Workspace article owns identity, shared evidence, both addresses, every business type, eight lifecycle fields and MapLinks. Import `Ref`/`JSX` types from Preact where needed. |
| `src/app/search-results.tsx` | Preserve current props (`result`, `coverage`, optional `synthetic`, `onPage`, `busy`); own selected ID, invoking button and originating group ref. Derive the selected match from current visible candidates, never a separate copied record/status/date. |
| New `src/app/workspace.test.tsx` | Local/Worker-shaped selection, focus, pagination, replacement and failure regressions using existing fixture conventions. |
| New `tests/e2e/workspace.spec.ts` | Responsive, keyboard, visual/media and resource-boundary evidence. Add it to existing e2e script file lists without changing project definitions. |
| `tests/performance/browser.tsx` | Adapt the existing complete-result oracle to summaries plus at most one separate selected article. Keep full identities/order/count, absolute positions, focus and paint-opportunity checks. |

Candidate summaries use `<article className="candidate-summary">` with the existing candidate accessible identity (`name + address + absolute position`). The selected article adds `workspace-detail` to `result-card`; candidate-list assertions scope to summaries, not every article. The selected heading is focusable only programmatically. RecordEvidence is inside its owning summary/article; its appearance never implies independent record selection. Forward the existing explicit synthetic flag so synthetic loaders with unavailable coverage still label summaries/details as synthetic, without repeating EvidenceContext's notice when coverage already identifies it. No stable public ID or URL format is introduced.

## Execution and review method

Recommended: sequential subagent-driven implementation, one bounded task at a time, with spec and quality review before advancing and a final independent whole-diff review. The user confirmed this method with an explicit model override: implementations use GPT-6.1 Sol/high and independent reviews use GPT-6.1 Sol/xhigh, per the user's explicit override. Workers receive explicit file ownership and must preserve others' edits; implementation workers do not recursively delegate.

The coordinator prepares context, verifies outputs, records evidence and resolves interfaces. This plan's self-review is performed by the coordinator, without a new reviewer dispatch. The user confirmed continuation with the explicit model override; product execution is authorized.

### Task 1: Responsive workspace shell and first-use screen

**Owns:** `src/app/app.tsx` composition only, `src/app/search-form.tsx`, `src/app/app.css`, new `src/app/workspace-intro.tsx`, shell cases in `src/app/workspace.test.tsx`. Preserve existing event/request logic.

**Consumes:** Existing AppProps, Coverage, SourceLink, EvidenceContext and statusDisclaimer. **Produces:** WorkspaceIntro signature above and classes `workspace-rail`, `workspace-intro`, `workspace-grid`; buttons focus/scroll existing search, results or guidance targets without URL/hash mutation.

- [x] Record available runtime, browser binaries and approved runner access without changing global tools. Run the existing component baseline and `node scripts/measure-performance.mjs --check > reports/performance-2026-10-22-task-027-before.json` on the pinned environment; preserve exit status and failures. If unavailable, record the exact gap and keep final acceptance open.
- [x] Add failing component cases: initial view has no candidate/detail business article; intro has real coverage/source and no invented status/total; the example fills without submitting; navigation reaches input/results/guidance and leaves URL unchanged. Assert loading disables submit and synthetic/unavailable notices remain truthful. Run `npm run test:component -- src/app/workspace.test.tsx` and confirm expected missing-shell failures.

  Pin `it('shows a truthful empty workspace and navigates without changing the URL')` using
  `render(<App dataset={demoDataset} />)` and these assertions before/after activating the
  navigation's `"검색"`, `"결과"` and `"안내"` buttons (not the form submit):

  ```tsx
  expect(screen.queryByRole('article')).toBeNull();
  expect(screen.getByRole('navigation', { name: '작업 공간' })).toBeTruthy();
  expect(window.location.href).toBe(originalUrl);
  expect(screen.getByRole('searchbox')).toBe(document.activeElement); // after search navigation
  ```

- [x] Implement the shell/intro signatures above. Keep the current valid results visible until the later selection integration; do not relocate loader state into a new owner. Use local CSS/SVG prism art with `aria-hidden` and `pointer-events:none`.
- [x] Replace incumbent colors/materials with spec section 4 tokens, including canvas `#F5F8FF`, ink `#15234D`, secondary `#46577A`, primary `#2456E8`, focus `#1338B4`, structural border `#7384A8` and the exact four status palettes. Implement the documented responsive rail, spacing, control heights and finite motion/fallback rules; no essential content opacity animation.
- [x] Run shell cases plus `src/app/app.test.tsx` and `src/app/recovery.test.tsx`; distinguish layout-derived assertion changes from behavior regressions. Capture initial 1586×992 and 390px views against the selected image before expanding detail work. Preserve search prominence, panel density and luminous materials; excluded photos/actions are intentional.
- [x] Review the task diff/spec coverage, record checks and obtain independent task review under the selected execution method before Task 2.

### Task 2: Shared evidence, compact candidate and complete selected article

**Owns:** New `record-evidence.tsx`, new `candidate-summary.tsx`, `result-card.tsx`, corresponding styles in `app.css`, new `candidate-summary.test.tsx` and `record-evidence.test.tsx`, existing `result-card.test.tsx`. SearchResults integration belongs to Task 3.

**Consumes/produces:** Use exactly the interfaces in the file table. Keep ResultCard's existing `match`, optional `position`, `coverage` and optional `synthetic` props compatible. No component caches raw status, mapped status, coverage or record fields in local state.

- [x] Add failing tests for summary all four statuses/raw quartet/source/date/disclaimer before inspection, original address/category/confidence and inspect button name containing identity/address/position. Assert `aria-pressed` and `onInspect` receives the actual native button, not a nested article/link event target.

  Name the parameterized case `it.each(... )('keeps %s raw evidence visible before inspection')`;
  reuse the four operating-code/name/status triples from `result-card.test.tsx` and create a
  local DisplayRecord/CandidateMatch fixture there. For position 7 and selected=false assert:

  ```tsx
  expect(screen.getByText(status, { selector: '.status-badge' })).toBeTruthy();
  expect(screen.getByText('원본 상세상태 코드', { selector: 'dt' })
    .nextElementSibling?.textContent).toBe('D1');
  expect(inspectButton.getAttribute('aria-pressed')).toBe('false');
  expect(inspectButton.textContent).toContain('상세');
  expect(onInspect).toHaveBeenCalledWith(inspectButton); // after button activation
  ```

- [x] Add focused RecordEvidence/ResultCard tests: null/empty evidence fallback, all eight lifecycle values, both addresses, absent and repeated business-type fields without loss, long unbroken values, collected/synthetic/verified/unavailable/future dates and 6/7/8-day warnings. Include explicit synthetic=true with unavailable coverage and verify the synthetic notice in each summary/detail without a false date. Default full-card behavior remains tested; workspace heading ref focuses correctly and return invokes once. Run the three focused files and observe the expected missing-interface failures.
- [x] Extract only read-only shared evidence. Render business-type entries with stable occurrence-aware keys so repeated `sourceField` values remain distinct. Keep lifecycle values separately labeled and MapLinks on complete details; synthetic details have no external map actions.
- [x] Implement CandidateSummary and ResultCard optional workspace layout. Exactly one mapped status per owning record view, with an appropriate non-color glyph; evidence remains visible without tabs/hover. Desktop evidence is within the same selected article, with responsive DOM reading order identity/status/confidence, evidence, basic details, lifecycle and external actions. Preserve default card semantics.
- [x] Run `npm run test:component -- src/app/record-evidence.test.tsx src/app/candidate-summary.test.tsx src/app/result-card.test.tsx src/app/evidence-context.test.tsx src/app/map-links.test.tsx`. Require unchanged URL safety/date policies and complete field assertions.
- [x] Review the diff and PG-04/05/06/13 evidence; obtain independent task review before Task 3.

### Task 3: Deterministic inspection, pagination, focus and recovery

**Owns:** `search-results.tsx`, necessary App busy/empty-workspace composition, selection styles in `app.css`, `workspace.test.tsx`, and directly affected component assertions in `app.test.tsx`, `pagination.test.tsx`, `accessibility.test.tsx`, `recovery.test.tsx`, `pr16-regressions.test.tsx`, `prepare-display-data.test.tsx`, `use-compact-data.test.tsx` and `map-links.test.tsx`; the single obsolete article-count assertion in `partition-loader.test.tsx` is also included after a bounded execution-time ownership correction. No Worker/loader/search policy changes.

**Consumes:** Task 2 summaries/article and unchanged SearchResult/CompactPage inputs. **Produces:** The original SearchResults API with the approved inspection behavior; no public interface.

- [x] Add failing selection cases using unique-primary, tied-primary, similar-only and empty results: unique primary alone auto-inspects; ties/similar-only show a neutral prompt; inspecting never changes confidence/status/engine order; editing the draft preserves the accepted result. Clicking/Enter/Space focuses the detail heading and return restores the invoking button, with originating list-heading fallback if it is disconnected.

  Pin `it('inspects a tied candidate without confirming identity and returns focus')` and
  `it('clears off-page inspection while retaining persistent top matches')`. Obtain matches
  from the existing demo/47-row fixture engines, not a replacement ranking function. Use
  `.workspace-detail` to distinguish detail from candidate-summary articles and assert:

  ```tsx
  expect(document.querySelector('.workspace-detail')).toBeNull(); // accepted tied search
  expect(inspectButton.getAttribute('aria-pressed')).toBe('true'); // after explicit inspection
  expect(document.querySelector('.workspace-detail h3')).toBe(document.activeElement);
  expect(inspectButton).toBe(document.activeElement); // after returning
  expect(document.querySelector('.workspace-detail')).toBeNull(); // selected row leaves page
  expect(screen.getByRole('heading', { name: '유사 후보' })).toBe(document.activeElement);
  ```

- [x] Add local and Worker-shaped page fixtures for 0/1/20/21/47 similar candidates. Assert exact full count, absolute positions and all candidates reachable; retain inspection in persistent Top-3 or the new visible page, clear off-page inspection, focus `similar-heading` and announce the new range. Include rapid previous/next operations, busy controls and attempted repeated page action.
- [x] Add App/deferred compact-loader cases: resubmitting the same query resets inspection; replacement with reused record IDs clears old results/selection; page/search rejection preserves accepted query/page/inspection plus error; refresh failure retains previous good data/inspection; late replies and old-dataset completions cannot overwrite newer state. Run focused files and verify failures reflect the missing inspection behavior.
- [x] Implement selection derived from current top/visible-similar matches; never default to the first similar/tied row. Use existing App submission keys and dataset guards. Resolve invalidated selection during render/layout before a mismatched detail can paint; page acceptance retains only visible/permanent top identity. Explicit activation alone moves focus to the detail, while automatic primary selection keeps normal submission focus.
- [x] Integrate summary lists in existing engine groups, their explicit buttons, selected article or neutral prompt, busy state and return control. Keep the old accepted workspace while requests run/fail. Invalid query validation retains existing product behavior; operational rejection must not masquerade as a successful new result. Use immutable accepted `result`, not the edited draft, for displayed submitted context.
- [x] Adapt affected assertions to named candidate summaries versus selected detail. Preserve every raw-evidence/date/privacy/conflict assertion and test external map behavior after explicit inspection of each relevant candidate. Run `npm run test:component` and `npm run typecheck`; no test-count/coverage reductions or skipped safety assertions.
- [x] Obtain independent spec/quality review of both local and Worker-shaped paths before Task 4.

### Task 4: Browser, accessibility, visual and performance acceptance

**Owns:** `tests/e2e/{search,smoke,accessibility}.spec.ts`, new `tests/e2e/workspace.spec.ts`, existing `tests/setup/{pagination,map,recovery}-browser.ts` when necessary, `tests/performance/browser.tsx`, narrowly needed `scripts/measure-performance.mjs` methodology text, e2e script lists in `package.json`, final corrective UI changes, reports and task/memory/traceability records. Do not edit lockfile/dependencies, workflow or runner policy.

**Consumes:** Tasks 1–3. **Produces:** Current-state PG-01–15 evidence, bounded performance comparison and independent whole-diff verdict; existing operational/release gates remain open.

- [x] Add workspace.spec.ts to existing `test:e2e` and `test:e2e:full` file lists. Add failing browser tests for forward/reverse keyboard inspection/return, repeated submission announcements, all pagination controls and selection invalidation; adapt existing structural expectations without weakening business assertions. Add axe scans for selected, tied with neutral prompt, empty, initial/failure and retained-failure inspection states.

  Name browser cases `test('inspection and return preserve keyboard focus')`,
  `test('long evidence reflows across workspace breakpoints')` and
  `test('fallback media never hides evidence or controls')`. After fixture mounting/search,
  the responsive/media cases assert at every relevant viewport/media setting:

  ```ts
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.getByRole('button', { name: '검색', exact: true })).toBeVisible();
  await expect(page.locator('.workspace-detail .record-evidence')).toBeVisible();
  expect((await scanPageForWcag21Violations(page)).violations).toEqual([]);
  ```

- [x] Adapt `tests/performance/browser.tsx`'s `checkPage(query, page)` to enumerate only candidate summaries and separately assert zero/one correct selected article. Retain original exact name/address/absolute-position labels, full ordered oracle, full count, laid-out geometry, heading focus and two animation frames; a summary count alone cannot establish correctness. Update methodology labels to distinguish summary display from selected detail; preserve all scales/profiles/repetitions/budgets, no discarded samples or extra retries.
- [x] Implement browser assertions for 320/390/768/1024/1280/1586px widths, doubled text and a real 200% browser-zoom manual observation (do not equate font enlargement or CSS transform with browser zoom). Use long raw/status/URL/business-type fixtures and verify no overflow, clipping, hidden controls or obscured focus. At 1024/1280px test both breakpoint sides.
- [x] Add emulated reduced-motion and forced-color checks, and an explicit CSS no-blur fallback check. Verify essential text remains present during initial/detail effects, motion ends as specified, no animation restarts on clock/focus updates, focus/contrast survive and background highlights create no content layout shift. Resource/storage sentinels must detect any query-derived request, third-party image/font, navigation hash or persistence.
- [x] Run the focused workspace browser file on Chromium/mobile first. Then use one batched desktop/mobile visual inspection (first viewport and full page at 1586×992/390px, plus narrow/media/zoom cases), apply one coherent correction batch and perform at most one visual confirmation round. Compare to the hash-bound selected reference; record deliberately excluded photos/history/favorites/share controls. Report manual AT observations and limitations without presenting axe as a screen-reader test.
- [ ] Run `npm run verify:full` on pinned Node.js 24.19.0/npm 11.17.0 and the approved runner; require coverage thresholds, search-quality checks, four-browser search and zero axe violations. Run `node scripts/measure-performance.mjs --check > reports/performance-2026-10-22-task-027-after.json` (the `performance:check` command's underlying measurement); require all budgets, compare before/after under identical conditions and preserve failed/censored outcomes. Run `git diff --check`. Preserve reports from the exact tested source hashes.
- [x] Write `reports/test-2026-10-22-task-027.md` with PG-by-PG evidence paths, commands/exit status, runtime, contrasts, screenshots, performance deltas and physical/hosted limits. Do not close PG-09/10/14/15 on unavailable zoom/AT/pinned/performance evidence; resolve available gaps and clearly identify any external blocker.
- [ ] Dispatch final independent whole-diff review on GPT-6.1 Sol/xhigh under the selected method. Reviewer examines the spec/plan, final diff and current evidence, including privacy, stale-reply safety, focus and oracle integrity; save its exact scope/verdict/findings in `reports/review-2026-10-22-task-027.md`. Fix substantive findings with focused reproductions and rerun affected checks; broader checks repeat only if changes invalidate them.
- [x] Update `memory/session.md`, `memory/project.md`, `memory/decisions.md`, `memory/architecture.md` for actual new presentation structure, `docs/prd-traceability.md` and task records. Move TASK-027 to completed only after required checks and independent review pass. Record confirmed unresolved issues in `memory/known-issues.md`; no milestone/handbook/release closure or automatic next-task activation.

## PG coverage and self-review

| Acceptance | Owning tasks / evidence |
|---|---|
| PG-01 | Task 1 reference-sized opening screen; Task 4 final paired visual captures. |
| PG-02 | Tasks 1/3 form and submitted-context regressions; Task 4 four browsers. |
| PG-03 | Task 3 unique/tie/conflict/similar selection and unchanged engine-order assertions. |
| PG-04/05 | Task 2 complete and missing/repeated evidence fixtures; Task 4 selected/summary browser assertions. |
| PG-06 | Task 2 date-basis/age cases; Task 3 retained/replaced coverage; Task 4 midnight/focus regressions on page/summary/detail. |
| PG-07/08 | Task 3 deferred load/search/page and 0/1/20/21/47 cases on both paths; Task 4 large-result oracle. |
| PG-09 | Tasks 1/4 responsive media, long text, enlarged text and actual zoom evidence. |
| PG-10/11/12 | Tasks 2/3 semantic controls/focus; Task 4 keyboard, axe, contrast, AT, motion/forced-color/no-blur observations. |
| PG-13 | Tasks 1/2 local navigation/source/map rules; Task 4 resource/storage sentinels. |
| PG-14/15 | Task 4 identical-condition performance, pinned full suite, current hash-bound reports and independent final review. |

Self-review completed against all ten spec sections and PG-01–15. Interfaces above match the existing generic match/coverage and optional Worker page inputs. The five Review Focus conditions are assigned concrete regressions. No plan step requires policy, infrastructure, data access or an invented field; no production performance claim follows from synthetic measurements. Task 4 owns the necessary measurement-oracle migration rather than weakening it in an untracked test adjustment.

## Human review handoff

The user confirmed continuation with Sol/high implementation and Sol/xhigh review. Sequential subagent-driven execution is authorized because evidence extraction, selection and measurement share interfaces whose mistakes could misassociate a business with another record's evidence. This plan itself does not authorize any remote operation.


## Current verification disposition — 2026-10-22

Implementation checkpoint8ed3ddb is committed. Final same-source verify stage passes1,423tests,
static/build/bothquality; defaultfull fails91/92browser(WebKit startup5s both attempts), while
approved serial92browser/20accessibility pass without retries/flakes. All performance budgets
and current-source actual200%Chrome keyboard/focus proof pass. Actual VoiceOver output remains
unverified after authorized restoration-safe attempts. Scoped/final independent code quality is Approved; acceptance Request Changes retains the
same two Important blockers, with Minor backlog prose independently ADDRESSED and scoped rereview Approved. PG10/strictdefaultPG15 stay open; completion/milestone/handbook/release is withheld.
Completed checklist preparation does not imply those acceptance gates passed.
