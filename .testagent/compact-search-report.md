# Compact search implementation report

Date: 2026-09-14
Scope: `src/search/compact-search.ts`, `src/search/compact-search.test.ts`, and the scoring extraction in `src/search/search-candidates.ts`.

## Implemented behavior

- `CompactSearch` exposes manifest metadata and record count, prepares normalized name/address projections, retains compact source/evidence columns, and searches every row.
- Successful query state retains complete eligible and similar rankings as `Uint32Array` ordinals. `CandidateMatch` and record evidence are reconstructed only for Top-3 and the requested zero-based 20-item similar page.
- The existing scoring, ordered reasons, confidence downgrades, conflict ordering, score ordering, and lexical full-ID tie break are exported from and reused by `search-candidates.ts`.
- Preparation validates paired contiguous search/evidence coverage and global ID uniqueness. Preparation, scan, and merge-sort work yield to the event loop and honor `AbortSignal`. Cancelled searches leave the previous complete result state intact.
- Page numbers outside the current result range reset to page zero. A new successful or invalid query replaces the previous range only after its work succeeds.

## Requirement evidence

| Requirement | Evidence |
| --- | --- |
| "preserving existing exact score/reason/confidence/tie/order/count semantics" | `matches every oracle result field across complete pages for broad district, reverse substring, conflict, numeric, unknown-status, and absent queries` |
| "Complete ranked references retained only as numeric arrays/ordinals" | `returns only Top-3 and the requested 20-item similar page, then resets an invalid range after a new search`; source review of `SearchState` (`Uint32Array` only) |
| "materialize only page20 and Top3" | `returns only Top-3 and the requested 20-item similar page, then resets an invalid range after a new search` |
| "Full IDs lexical tie order, original row order preserved" | `matches every oracle result field across complete pages for broad district, reverse substring, conflict, numeric, unknown-status, and absent queries` asserts literal full-ID tie order over reverse source order |
| "Complete scan fallback required" | The same oracle-parity test covers broad district, reverse substring, conflict, numeric, unknown-status, and absent queries without a retrieval filter |
| "cancellation cooperatively yields during preparation, search and sorting" | `cancels preparation cooperatively and can prepare successfully afterward`; `cancels complete scanning without replacing the last successful query state`; `cancels cooperative sorting without publishing partial ranked references` |
| "metadata available manifest.metadata" and "Expose recordCount" | The oracle-parity test asserts metadata reference identity and exact record count |
| Focused regression validation | `PATH=/private/tmp/open-store-pr21-runtime.gmFKJN:$PATH npm run test:unit -- src/search/compact-search.test.ts src/search/search-candidates.test.ts src/search/search-optimization.test.ts` — 3 files, 19 tests passed |
| Full unit validation | `PATH=/private/tmp/open-store-pr21-runtime.gmFKJN:$PATH npm run test:unit` — 11 files, 248 tests passed |

## Assumptions and concerns

- `page()` uses zero-based pages, matching the existing UI state. Invalid, fractional, negative, or stale out-of-range pages return page zero.
- The store expects blocks and dictionaries that already passed the shared codec validators. `prepare()` additionally verifies role coverage, archive binding, paired ranges, column widths, record count, and global ID uniqueness.
- Complete scans and cooperative merge sorting prioritize result completeness and cancellability. No exact-posting accelerator is used.
- Preparation retains three 32-bit per-row projection-reference arrays plus unique normalized projections. Search uses temporary score/conflict typed arrays and candidate ordinal arrays. Actual full-source readiness, peak memory, and latency remain unmeasured and must not be inferred from these synthetic unit tests.
- The focused implementation does not implement the Worker message protocol or UI client lifecycle; those are owned by the coordinating task.
- Full `npm run typecheck` was blocked during this run by a concurrent out-of-scope type mismatch in `src/pipeline/validate-license-refresh.test.ts:1096` (`sourceUpdatedAt: string | null` versus a callback requiring `string`). No error referenced the owned compact-search or scoring files.
