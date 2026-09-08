<!--
Purpose:        Verify approved large-result pagination against the 500 ms target
Owner:          Implementer / Performance Engineer / Reviewer
Update Trigger: When current measurement or independent review completes
Harness Version: 1.1
-->

# TASK-018 bounded result-page performance

Status: Approved. Full correctness, all measured result-page budgets and independent review passed.

## Approved behavior and measurement contract

The user requested achievement of the remaining 500 ms large-card display target and explicitly
approved the concrete 20-item pagination design. Search still computes every ranked candidate,
conflict and ambiguity. Primary/Top-3 results remain visible; similar candidates render in pages
of at most 20. The interface displays total/range/page, native first/previous/next/last controls,
absolute candidate positions and list set positions. Page changes move focus to the similar
heading and announce the new range. New submissions, including repeated identical queries,
start on the first page. Dataset replacement clears obsolete results. Page navigation performs
no I/O, does not rerun search and does not accumulate cards.

The measured endpoint is **complete search plus the first visible page**, not simultaneous
construction of every result card. This user-approved behavior change is explicit: previous
unpaginated measurements remain immutable. Next/last/previous/first transitions have their own
500 ms gate. Two animation frames plus layout remain a paint opportunity, not INP or physical
pixel timing. Full candidate counts and visible identities/order are checked against the real
engine's diagnostic result, independently of the displayed slice. The oracle compares accessible card labels containing
name, distinguishing road/parcel address and absolute candidate position, so equal business
names cannot conceal stale or incorrectly ordered page contents. The eight formerly skipped
large-card search cells must now run; no time budget, fixture count or CPU profile is relaxed.

## Verification

- Pinned Node 24.19.0/npm 11.17.0 `npm run verify:full`: exit 0; 598 Vitest tests, 68 browser
  tests, 20 accessibility tests. 26 axe scans report zero violations, including first/final
  result pages on desktop/mobile. Existing search quality gates remain unchanged and pass.
- Coverage: 92.89% statements, 92.41% branches, 96.23% functions, 94.99% lines.
- Final full log: `/tmp/task018-pagination-full.log`.
- Test-first: initial correct regression run reproduced unbounded cards and missing page controls
  (two failing, two existing small-result cases passing). A test setup import typo was corrected
  before the valid red run. After implementation all four component regressions pass.
- A readonly-fixture assignment in the new test was caught by typechecking and replaced with an
  immutable fixture copy before the successful full run. No production contract was weakened.

| Requirement | Exact regression evidence |
|---|---|
| All candidates reachable in bounded ordered pages, absolute positions, focus and status | `reaches every candidate in order with bounded pages, absolute positions and focused announcements` |
| Small-result boundary | `keeps all %s small-result candidates visible without pagination controls` (1 and 20) |
| New submissions and datasets reset pagination | `resets to the first page on repeated submission and dataset replacement` |
| Real browser keyboard, reachability and privacy | `TASK-018 paginates all candidates with keyboard focus and no page requests` (four engines/profiles) |
| Page accessibility and horizontal overflow | `TASK-018 pagination remains accessible on first and final pages` (desktop/mobile) |

Existing synthetic/source search equivalence from the preceding continuation remains applicable:
this change does not modify the candidate engine, normalization, scoring, status or source data.
The 4,484-query evidence is preserved separately. New rendering tests check full traversal rather
than hiding candidates to obtain a lower DOM count. No new manual screen-reader observation is
claimed; previous assisted VoiceOver coverage is historical, not observation of these new controls.

Independent review found that the initial benchmark compared names only, which was insufficient
for the identical-name workload. The oracle was corrected to compare addresses and absolute
positions too. The provisional run is not acceptance evidence; the entire benchmark is rerun
with the strengthened oracle. Product and tests are unchanged from the full successful run;
post-fix typecheck and targeted lint also pass.

## Performance evidence

Final `node scripts/measure-performance.mjs --check` exited **0**. Raw evidence:
[measured JSON](performance-2026-09-08-task-018-paginated.json). `labTargetsMet=true`;
`productionVerified=false`. All 24 search cells (120 samples) and 16 applicable navigation
groups (320 transitions) pass the inclusive 500 ms all-samples gate. No search cells are
unavailable. Eight groups have no page controls because all similar candidates fit on one page.

| Profile / records | Exact first page | Common first page | Address first page | Absent result | Worst page change |
|---|---:|---:|---:|---:|---:|
| desktop / 1,000 | 30.5 ms | 28.4 ms | 29.5 ms | 28.9 ms | 33.4 ms |
| desktop / 10,000 | 26.9 ms | 29.0 ms | 29.1 ms | 29.2 ms | 32.9 ms |
| desktop / 50,000 | 44.3 ms | 30.4 ms | 50.6 ms | 29.5 ms | 33.4 ms |
| mobile-lab / 1,000 | 57.9 ms | 28.8 ms | 43.5 ms | 28.0 ms | 46.9 ms |
| mobile-lab / 10,000 | 84.0 ms | 45.4 ms | 69.2 ms | 28.9 ms | 42.4 ms |
| mobile-lab / 50,000 | 182.8 ms | 57.0 ms | 158.7 ms | 30.9 ms | 41.5 ms |

Mobile first-page maximum is **182.8 ms**, including full search over 50,000 records.
Mobile navigation maximum is **46.9 ms**. The former 1,000-row mobile address display was
1410.8 ms for all cards; it is now 43.5 ms for the first page with every candidate reachable.
The 50,000-row common-name display changes from 690.2 ms for all cards to 57.0 ms for its
first page. These are different, explicitly approved display behaviors, not faster construction
of the same complete DOM. The formerly unavailable 50,000-row exact/address cases now measure
182.8/158.7 ms respectively with full-count and ordered card-identity assertions.

Initial HTML/CSS/JS is 49,377 bytes (under 300,000); three JSON assets remain unchanged.
Mobile cold search readiness is 1071.9 ms and warm is 96.2 ms, both below 2500 ms. All primary
and LCP startup cells pass. All 92 measured source hashes match the current implementation;
scale fixture hashes and profile settings match the earlier evidence. Earlier audit and
optimization JSON/Markdown/review files remain unmodified.

The same local host, five repetitions, 1,000/10,000/50,000 fixtures, fourfold mobile CPU and
startup network/cache profiles are retained. No test run overlaps the benchmark. Page navigation
sample counts reflect applicable pages; datasets with at most 20 similar candidates have no
navigation controls and are explicitly not applicable rather than failed or missing search cells.

## Boundaries

The result-page target is a bounded lab outcome, not production-data or physical-device certification.
All data is still downloaded and indexed. The unresolved source-cut/publication gates remain with
TASK-008/009/010; TASK-008 stays on hold. No dependency, status rule, public URL, infrastructure,
commit, push, deployment or handbook change is included. No next task is activated.


[Independent final review](review-2026-09-08-task-018-paginated.md) approved the implementation,
reran four component regressions and verified 92 current source hashes and 96 metric groups.
No blocking findings remain. Production/release acceptance is outside this bounded approval.
