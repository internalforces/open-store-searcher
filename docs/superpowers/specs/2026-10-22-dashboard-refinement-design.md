<!--
Purpose:        Propose a restrained dashboard and purposeful interaction feedback
Owner:          Planner / Designer / Reviewer
Update Trigger: When the user reviews the proposed visual or motion direction
Harness Version: 1.1
-->

# Dashboard Refinement Design Proposal

Date: 2026-10-22
Status: Proposed, planning only. The user requested less AI-styled presentation and animation
in a follow-up; the exact treatments below are coordinator recommendations, not approved values.
Proposed owner: TASK-028, unactivated. TASK-027 remains the sole active task.

## Intent and evidence

People search a Seoul administrative record and compare identity, status, uncertainty and source.
The surface remains in Operate mode. Success is a calmer, identifiable search tool with responsive
feedback, without making evidence harder to inspect or claiming an objective AI-style score.

Visual evidence is the implemented [desktop capture](../../../reports/screenshots/2026-10-22-task-027/selected-1586.png)
and [mobile capture](../../../reports/screenshots/2026-10-22-task-027/selected-390-full.png),
source checkpoint `8ed3ddb156f12cd83d4037b0026b0ca28b5b5dbf`, `src/app/app.css`, and the
[approved Prism design](2026-10-22-prism-glass-dashboard-design.md).

Observed design candidates for refinement: three broad pastel canvas gradients, a large rounded
search shell, repeated bordered/pill containers, a large first-use prism, and decorative sweeps
on several events. These observations are a design judgment, not evidence that AI authored them.
The existing blue search identity and bright material remain recognizable. This is a refinement,
not a replacement product or an instruction to copy a commercial dashboard.

## Recommended direction and alternatives

| Direction | Tradeoff | Recommendation |
|---|---|---|
| Restrained Prism | Neutral evidence workspace, one blue action accent, small cyan/lilac brand detail; motion explains accepted actions | Recommend: preserves identity while reducing repeated decoration |
| Flat monochrome | Removes nearly all prism expression | Do not select by default: discards more of the approved identity than requested |
| Richer glass spectacle | Adds moving gradients, more glow and floating panels | Do not select by default: adds the repeated visual motifs being questioned |

## Proposed visual contract

- Keep search, candidates, selected detail and evidence as distinct information roles. Use spacing,
  headings and separators before adding another card. Do not remove source/status evidence from
  candidate summaries to make the layout look sparse.
- Use a quiet `#F7F8FA` canvas and opaque white evidence planes. Reserve `#2456E8` for the primary
  action, selected state and links. Propose main ink `#202936` and secondary `#4B5563`; retain the
  existing four semantic status palettes and `#1338B4` focus outline. Rendered contrast must be
  measured; these proposed colors are not already verified acceptance evidence.
- Remove broad canvas color clouds and gradient borders around routine panels. Limit cyan/lilac
  to the small brand prism or one narrow static search accent. No gradient body text, sparkle
  particles, oversized marketing title, new mascot or ornamental field icons.
- Propose 16px outer panel corners, 12px controls and 8px quiet inner groups. Use pills for mapped
  status only where the existing badge semantics require them. Prefer simple separators for
  evidence fields and contiguous candidate rows; do not imply nested interactive containers.
- Reduce the search shell's redundant title/spacing. Keep one clear query input and search action;
  retain the example action, validation, result shortcut and present-tense limitation notice.
  The first-use illustration becomes a small supporting mark, at most80px high on desktop and
 48px on mobile. Do not invent facts, totals or statuses to fill empty space.
- Preserve system fonts, 16px body, labels at least14px, controls at least44px and search controls
  at least48px. Retain72px/64px wide-screen rails and the existing1280/1024 breakpoints, with body
  scrolling and natural single-column reflow below1024. No sticky overlay or independent scroll.

## Proposed motion contract

The focal interaction is selecting a candidate and seeing exactly which record's evidence is
being inspected. Supporting feedback acknowledges accepted searches/pages. Essential text,
new data and keyboard focus update immediately; nothing waits for an animation.

| Trigger | Proposed effect and normal duration | Reduced motion / forced colors |
|---|---|---|
| First paint | Static brand/search accent; remove the current650ms entrance sweep | Same static content |
| Fine-pointer hover | Background/border feedback120ms; remove floating-card lift | Immediate state |
| Search-button press | Existing up-to1px press offset80ms; no bounce | Immediate press state |
| Accepted search or page | One blue160ms underline on submitted context/range; no colored sheen | Immediate context and existing announcement |
| Changed inspected record | One180ms blue edge/selection-marker trace; replace the current220ms multicolor glint | Immediate selected edge/detail/focus |
| Loading, rejection or stale warning | Existing truthful static busy/error/warning content; no synthetic progress or pulse | Same |

Use one iteration, `cubic-bezier(0.16, 1, 0.3, 1)`, transform/opacity on empty pointer-inert,
aria-hidden decoration only. No content opacity animation, layout animation, per-row stagger,
scroll reveal, parallax, animated blur or perpetual shimmer. Forced colors uses system borders.
Do not erase meaningful static state when reduced motion disables decoration.

Reuse existing submission/page keys and selected-record keys. Draft edits, focus/return,
CoverageClock updates and background/foreground changes must not restart effects. Accepted
identical resubmission may replay response feedback because it is a new accepted action.
Failed/obsolete responses never animate as successful. Rapid changes cancel the old decorative
layer; they never delay new evidence or restore an old identity. No new dependency, global timer,
motion-owned record state or animation promise in the search/Worker completion path.

The proposed motion and material values intentionally differ from parts of the approved TASK-027
spec. They become authority only after full follow-up design approval. Existing tests for180/220ms
Prism sweeps may be updated only for that approved change; unrelated assertions remain intact.

## Safety and delivery boundaries

All original raw status quartet, both addresses, repeated business types, eight lifecycle fields,
source/date basis, synthetic/collection/source distinctions, uncertainty and seven-day warnings
remain visible and correct. Only the four approved display statuses are allowed. Existing
classification, search/ranking/count/20-item pages, request guards, Worker/data contracts,
last-known-good behavior, map click/privacy and public URLs do not change.

No new service/dependency/font request, analytics, history/favorites/share feature, generated
business facts, pipeline change, security setting, workflow permission or deployment is proposed.
TASK-023 enhanced keyboard navigation and TASK-009/010/021 operational gates remain separate.
Do not access handbook/ko/** during this workflow.

## Acceptance proposal

| ID | Required proof before follow-up completion |
|---|---|
| QM-01 | User approves reference-sized desktop/mobile direction and exact motion/material contract; qualitative comparison answers whether ornament competes with search/evidence |
| QM-02 | No full-page pastel clouds or routine gradient frames; repeated card nesting reduced without hiding any evidence or controls |
| QM-03 | All existing identity/status/date/uncertainty/count/order and explicit selection/return invariants pass on local and Worker paths |
| QM-04 | Normal feedback follows the proposed table; repeated/rapid/rejected/obsolete actions never replay success on the wrong record or move evidence/focus |
| QM-05 | Reduced/forced/no-blur views retain static feedback, all content and native focus; every tested axe violation list is empty; real screen-reader output observed |
| QM-06 | Long evidence, 320/390/768/1023/1024/1279/1280/1586px, all-element2x text and actual200% browser zoom retain readable controls/evidence without page overflow |
| QM-07 | Default pinned verify:full passes, all unchanged2.5s/500ms/300000byte performance budgets pass, no motion-induced geometry shift; physical/hosted/production limits remain explicit |
| QM-08 | Independent Sol/xhigh review, bounded desktop/mobile visual pass plus at most one correction/confirmation, and traceability/current records agree |

## Preconditions and calls for human review

Current TASK-027 PG-15 default full verification and PG-10 actual VoiceOver output are still open
in [the current evidence](../../../reports/test-2026-10-22-task-027.md). Publishing its branch/PR
is not completion or permission to merge. Read any new PR CI result separately; do not guess it.
No follow-up product implementation starts until full design approval and an explicit active-slot
handoff after TASK-027 acceptance, or a human explicitly changes that sequencing/acceptance contract.
The recommended visual restraint and exact durations above are the coordinator's calls to review.


Independent planning check: Sol/xhigh reports no material unanswered question after clarifying
conditional future routing. See [the planning review](../../../reports/review-2026-10-22-dashboard-refinement-plan.md).
Human design review and execution/active-slot authority remain outstanding.
