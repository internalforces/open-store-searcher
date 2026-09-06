<!--
Purpose:        Define the initial search page and evidence-card implementation proposal
Owner:          Architect / Implementer
Update Trigger: Human design review or a TASK-014 scope change
Harness Version: 1.1
-->

# TASK-014: Initial Search Page and Evidence Cards

Date: 2026-09-06
Status: Accepted by the user on 2026-09-06; implementation authorized
Requirements: FR-04 through FR-09, FR-11; PRD sections 9, 11 and 21

## Context and boundaries

The reviewed TASK-013 tree at 5b9b2d5 contains the TASK-011/012 search engine and
TASK-013 quality checks. Its App renders only the product heading. Session evidence
records a tree-identical merge at main 9160d5. The original checkout contains unrelated,
uncommitted TASK-008 work and must be preserved. Inspect an existing clean worktree
and the merged baseline again before implementation; do not reset or discard work.

TASK-008 remains deferred and incomplete. Production public JSON, publication, and
verified source-cut evidence remain unavailable. This task delivers a working synthetic
UI with an internal data boundary; it cannot establish production availability or close M2.
No source fixture from TASK-013 may acquire an invented status or as-of date.

## Approaches

1. Recommended: typed internal display records, existing generic search engine, and a
   small explicitly synthetic dataset. This supports the full interaction and evidence
   tests while keeping later public serialization independent.
2. Build isolated cards only. This is smaller but fails to demonstrate search-to-card
   behavior and leaves the main TASK-014 integration untested.
3. Wait for production publication. This avoids a demo dataset but prevents the accepted
   M2 priority from progressing and cannot resolve the outstanding provider evidence.

## Screen and interaction

- Retain the product name as the single h1. Place the PRD purpose sentence below it:
  `상호명이나 주소로 공개 행정 데이터상의 사업체 상태를 확인하세요.`
- Show a prominent persistent `합성 예시 데이터 · 실제 사업체 조회가 아닙니다` notice.
  Never describe demo records as Ministry-provided records.
- Provide one labeled name/address input and a submit button. Enter submits through
  the same form handler. Keep draft text separate from the last submitted result.
- Include one reproducible synthetic name-plus-address example as a button that fills
  the input without automatically submitting. Show the input requirements alongside it.
- Keep the page as-of line and `현재 문이 열려 있는지는 확인할 수 없습니다` visible before
  and after search. For the demo, label any fixed date `예시 데이터 기준일`.
- Initially show instructions, not unrequested result cards. Invalid input uses the
  existing validation outcome and inline associated guidance; it clears obsolete results.
- Build the search index once per supplied dataset. Call the existing search function
  on valid submission, keeping its ranking, conflict, confidence and tie rules unchanged.
- Show a primary card only when primaryMatch exists. Show the remaining topMatches
  in engine order, at most three total including primary. Deduplicate by record ID.
- When ambiguousTop is true, explain that multiple candidates need checking. Never
  select a primary merely because it sorts first. Display low-confidence results in
  a separately labeled `유사 후보` section, with explicit identity uncertainty.
- Use the engine's bounded returned candidate lists and counts. Do not implement a
  separate ranking, probabilistic confidence percentage, selection confirmation or pagination.
- Use the PRD empty-result sentence when both returned groups are empty. This is the
  minimum safe TASK-014 behavior; TASK-015 owns expanded recovery and state UX.

## Evidence-card contents

Each semantic article contains the original business name, textual status badge, distinct
match-confidence label, original road and parcel addresses, business category/type, raw
operating code/name and detailed code/name, available lifecycle dates, source attribution,
and the dataset as-of line. Display missing values as `제공되지 않음` and missing verified
as-of evidence as `확인되지 않음`; do not synthesize dates from retrieval, ZIP or row updates.

Preserve all provided permit, suspension, resumption, closure and modification values.
Label row modification separately from dataset coverage. Render source strings as escaped
text. Use only the four existing ProcessedStatusV1 values, with the existing ADR-013 mapper
for raw aggregate status pairs. Confidence describes identity matching and must not change
the administrative status or suggest that a low-confidence candidate is the user's business.

Unknown status pairs remain unverified with their literal raw evidence shown. Badge color
is supplemental to text. Place the PRD administrative-status disclaimer near the result
evidence and keep the page source/disclaimer region accessible in every state.

The synthetic dataset uses conspicuously invented names, fictional raw evidence and dates,
and a synthetic source label on every card. A separate explanatory page link may reference
the existing approved official source URL, labeled as the intended production source rather
than provenance for these examples. Never interpolate search terms into any URL.

## Internal architecture

- App owns local input/submission state and accepts an internal dataset prop, defaulting
  to the explicit demo dataset for this development build.
- SearchForm owns accessible input, example and validation presentation.
- SearchResults owns group order, ambiguity and minimal no-result presentation.
- ResultCard owns original business evidence; shared status and source/date presentation
  may be factored only where it prevents conflicting copy.
- An internal display-data module extends SearchRecord with original category, raw status,
  lifecycle and source fields. Dataset metadata distinguishes synthetic coverage from
  verified production coverage and unavailable coverage. Production mode has no loader
  in this task. Missing evidence must remain representable without a fallback date.
- Use type-only references where reusing pipeline record types; never import Node pipeline
  execution code into the browser. This model is not a public JSON schema or share contract.
- Use existing Preact hooks, native HTML and local CSS. No external packages, fonts,
  icons, images, services, network data loading, URL state or persistent storage.

## Visual and accessibility treatment

Use a restrained light background, dark text, one search accent and a centered readable
content width. Keep result cards in a vertical list at all widths, expanding definition-list
columns on desktop. Long addresses and raw values wrap without horizontal overflow at
320 CSS pixels. Do not use fixed-height evidence areas or color-only status distinctions.

Use native landmarks, headings, labels, buttons and definition lists. Provide visible focus,
comfortable touch targets and a polite result-count announcement after submission. Keep
keyboard focus predictable and avoid moving focus while typing. TASK-017 retains the fuller
keyboard/screen-reader flow and manual assistive-technology verification.

## Acceptance and verification

| ID | Requirement | Evidence required |
|---|---|---|
| U01 | FR-04/05 | Four statuses, unknown raw pair, exact raw aggregate/detail text, no executable HTML |
| U02 | FR-06 | Both addresses, category and every provided lifecycle value; explicit missing fields |
| U03 | FR-08 | Page/card synthetic and verified/unavailable coverage cases; no timestamp substitution |
| U04 | FR-09 | Source and disclaimer visible initially and in every search state; truthful demo provenance |
| U05 | FR-07 | Exact primary, same-name address conflict, equal top tie, name-only low confidence and no results |
| U06 | FR-11 | Search-to-card flow on desktop/mobile; 320px wrapping; visible keyboard focus |
| U07 | FR-04–09 | Repeated submissions and invalid input cannot leave misleading old results |
| U08 | Privacy | Search remains local; browser network/storage/logging sentinels cover actual form interaction |

Use existing Vitest/Testing Library for component and integration cases. Extend existing
Playwright smoke/search tests to operate the real UI under the Pages subpath across the
configured browser matrix. Run axe on initial and populated result states at desktop/mobile
sizes. Preserve the search-quality check unchanged. Run pinned Node 24.19.0/npm 11.17.0
`npm run verify:full` and `git diff --check`; record actual results and any limitations.

## Deferred work and approval

TASK-015 retains loader failure, retry and stale-data UX. TASK-016 owns map links; omit
nonfunctional map buttons. TASK-017 owns the fuller accessibility workflow. TASK-008/009/010
retain production evidence, serialization, refresh and publication. No deployment, commit,
push, dependency adoption, status-policy change or handbook work is authorized by this spec.

Self-review: requirements have explicit UI/test outcomes; synthetic dates cannot masquerade
as source evidence; confidence and status remain separate; no new public contract is assumed.
After human approval, prepare the implementation plan and execute only TASK-014.


## User-authorized PR #15 corrections — 2026-09-06

The user requested implementation and commit/push of review findings. Baseline stale warnings
are now included in TASK-014 to honor the current >=7 Seoul-calendar-day safety invariant;
TASK-015 retains broader recovery/loading UX. Add dataset-level sourceLabel/sourceUrl so
provenance is independent of search results. Blank names use explicit missing-value fallback,
invalid state clears on editing, and every submission changes live-region context.
These local corrections were independently Approved; see reports/review-2026-09-06-pr15.md.
