# TASK-008 compact delivery implementation and verification

Date: 2026-09-14. Scope: user-approved compact-delivery design; TASK-008 remains active.
Checkout: `.worktrees/task013-quality`, `codex/pr21-release-descriptor-followup`, HEAD `e8f8c92`.
Its tracked tree was verified identical to merged PR #22 (`81a1441`) before editing. Existing
uncommitted work was retained. No commit, push, merge, deployment, dependency or security-setting
change was performed. TASK-009/010, status-pair review and production release gates remain open.

## Implemented behavior

- A bounded three-pass producer emits versioned JSON columns with local/shared dictionaries,
  immutable content-addressed blocks and a manifest. It retains the existing source validation,
  external sorting, global identities and prior-good output transaction. Observation-only legacy
  output remains a research oracle; accepted compact sites do not also deploy the legacy dataset.
- Shared validators check exact fields/types, raw evidence, status semantics, schema/identity/
  normalization versions, references, hashes, UTF-8 byte lengths, complete paired ranges, counts
  and global IDs. The release timestamp's Seoul date, manifest coverage and baseline date agree;
  baseline versions, archive, policy and count also agree. Null-policy research output cannot
  pass the publication binding. The deployed reader retains legacy-v1 recovery compatibility.
- The builder includes all assets/baseline/release bytes in the unchanged decimal 1 GB limit,
  rechecks copied files and promotes only a complete owned candidate directory.
- The Worker alone prepares production search data. It retains compact columns/projections and
  complete ranked ordinal arrays, and materializes only Top-3 and the requested 20-item page.
  Candidate flags reuse the unchanged name/literal/address predicates; every ordinal is visited.
  Bidirectional containment, numeric tokens, conflicting addresses and broad relevant candidates
  survive. No result is capped. Scheduler yielding remains cancellable with a timer fallback.
- The UI exchanges versioned request/page messages, ignores stale generations, cancels obsolete
  work and keeps the accepted Worker until a replacement is fully ready. Candidate failure keeps
  old search; accepted Worker failure disables search and allows retry. No browser database,
  service, analytics or query/click-dependent data fetch is added.

## Complete-source evidence

The original `/Users/sonmyeong-gwan/Downloads/dataset.json` matches the recorded observation:
2,439,358,850 bytes, SHA-256 `34ac368f16a578b3af96cd083d73efe698d7b3ec01f400b5162e37a42f6b85cc`.
The 143,806-byte observation hash is
`aea7b04eaa936be4b8eb08144bb92ef7f3875a780a278f517903927ccdbea302`.
The codec replay checks the original hash on every source traversal.

All **2,939,947 records** round-trip with deep equality, including exact raw values, null/empty
strings, business-type order, lifecycle evidence, full IDs and original row ordering. Ordered IDs
retain SHA-256 `ae6597150d357ab703df0358c22d9a1b63334ec6c8f2015551cd5b87138acf34`.
The producer's own integrity verifier and an independent source-by-source reconstruction both run.

| Actual serialized content | UTF-8 bytes |
|---|---:|
| Search blocks | 503,811,866 |
| Evidence blocks | 183,937,992 |
| Shared dictionaries | 511,775 |
| Manifest | 171,764 |
| Complete compact data | **688,433,397** |
| Actual per-file gzip data | **198,433,476** |
| Functional local research site, including actual JS/CSS/HTML | **688,506,488** |

The research site is functional, contains all data and has no legacy dataset. It has no approved
production baseline or release descriptor; the exact accepted production-site total cannot yet be
reported. The real-build synthetic tests verify inclusion of those artifacts and fail-closed size
accounting. This distinction does not waive the complete-site limit.

The production codec took 123,564 ms to encode; conversion plus complete verification/gzip/
round-trip took 168,269 ms, with Node max RSS 750,764,032 bytes. These are local producer research
measurements, not CI or browser timings. Detailed field/repetition/cardinality and tuple/column/
index tradeoffs remain in [feasibility](feasibility-2026-09-14-static-delivery.md).
Optional deployed exact-key postings measured 252,210,834 bytes and were not selected. The
implemented projection filter proves a superset of the oracle acceptance predicate; it does not
rely on incomplete substring postings. Detailed proof is in the independent review.

## Search equivalence

The complete-source oracle probe uses the unchanged engine on bounded decoded search blocks,
then globally merges all similar matches using the original conflict/score/full-ID ordering.
It explicitly asserts zero eligible matches for these four probes, avoiding an invalid merge of
per-block Top-3 lists. Every ranked ID, score, confidence, name/address match and ordered reason
matches the new store across every page; total counts, primary and tie state also match.

| Complete-source query | Complete similar results |
|---|---:|
| `강남구` | 322,339 |
| `스타벅스` | 1,275 |
| `테헤란로 123` | 32,248 |
| `龘靐齉爩` | 0 |

Top-3, eligible counts, primary/ties, unknown statuses, conflicting/numeric addresses and literal
fallbacks additionally have deep oracle parity in focused tests and the independently executed
2,803-source-record corpus: **100 queries / 695 complete pages**. Adversarial repeated projections
and descending IDs cover another **576 rows / 21 queries / 207 pages**, including 468 literal-name,
624 literal-address, 1,000 district-conflict and 592 number-conflict matches. Those corpora are
correctness evidence; their timings are not extrapolated to Seoul production.

## Actual complete-source browser observations

Chromium 151.0.7922.34, headless, macOS, 16 GiB host; local HTTP with actual gzip bodies, no CPU or
network throttle. Two navigations, one accepted refresh and one deliberately missing-manifest
candidate. This is a desktop observation, not a physical/mobile or hosted benchmark. The warm
navigation reused its browser context, but its approximately 198 MB transfer shows that HTTP
cache reuse did not keep most of this complete dataset resident.

| Observation | Cold | Warm navigation |
|---|---:|---:|
| DOMContentLoaded shell (not LCP/paint) | 21.1 ms | 16.2 ms |
| Complete search readiness | 48,352.8 ms | 49,463.4 ms |
| Fetch/parse/integrity phase | 15,768.2 ms | 16,867.5 ms |
| Worker projection preparation | 32,524.4 ms | 32,543.9 ms |
| Gzip response payload bytes served | 198,460,913 | 198,441,850 |
| District search to visible page | 493.5 ms | 478.1 ms |
| Name search to visible page | 333.7 ms | 317.3 ms |
| Address search to visible page | 346.6 ms | 330.6 ms |
| Additional literal query to visible page | 241.8 ms | 241.4 ms |
| District next-page navigation | 52.0 ms | 57.0 ms |

The additional literal query was not absent: bidirectional containment correctly returned 15
candidates. The separately verified complete-source absent probe above returned zero.
All eight searches and both page transitions generated **zero data requests**. The injected
candidate failure retained accepted search. Successful replacement took 52,503.7 ms with the
accepted snapshot kept alive. Browser process-tree RSS sampled once per second reached
4,483,792,896 bytes during refresh overlap and 4,555,177,984 bytes across the whole run. RSS sums
include renderer/Worker, browser and utility processes and may double-count shared pages; these
are observed sampled maxima, not exact JS heap peaks or mobile memory requirements.

The initial implementation measured 8–16 second searches. Removing timer clamping, repeated
per-record acceptance work and binary ID lookup during sorting reduced the observed searches to
241–494 ms without altering results. The two desktop observations meet the unchanged inclusive
500 ms search target, but do not establish a general mobile/hosted or percentile guarantee.
Search readiness remains separate from the unchanged 2.5-second shell-paint target.
At the existing 200,000 B/s mobile lab throughput, measured gzip data alone imposes an arithmetic
lower bound of 992.2 seconds before protocol and CPU cost. This is not a measured mobile result.

## Verification commands and limits

Runtime: Node 24.19.0, npm 11.17.0 via
`PATH=/private/tmp/open-store-pr21-runtime.gmFKJN:$PATH`. No runtime or project dependency version was changed. The existing Ubuntu container installs
the approved lockfile and CI-declared browser test prerequisites in its local verification environment.

- `npm run lint`, `npm run format:check`, `npm run typecheck`: passed.
- `npm run verify:full`: attempted; native macOS InfoZIP causes two unchanged filename/stream
  failures. An App announcement-count regression discovered in the first run was repaired.
- `npm test -- --coverage --exclude src/pipeline/unzip-archive.test.ts`: 744 passed at that
  checkpoint. The final rerun passes **747 tests** with coverage thresholds unchanged. The
  full macOS rerun passes752 of 754, with only the two unchanged InfoZIP failures. No test/configuration/budget was deleted or weakened.
- `npm run build` and `npm run quality:search:check`: passed, including source-quality safety.
- `npm run test:e2e:full`: 68 passed (Chromium, Firefox, WebKit, mobile Chromium).
- `npm run test:a11y`: 20 passed. These standard browser suites primarily cover the existing
  demo path; the actual complete-source run and real protocol tests cover compact delivery.
- `npm run performance:check`: passed all unchanged lab targets across the existing desktop/mobile
  shell and synthetic-scale regressions. This certifies that regression suite only; it is not
  full-source mobile evidence. Its legacy "production startup" label refers to the normal demo
  build. [Raw regression measurements](measurements-2026-09-14-compact-regression-performance.json).
- Independent code review approved correctness after lifecycle and binding fixes, then rechecked
  the candidate-filter proof, source/adversarial parity and scheduler fallback.

An existing Ubuntu 24.04 ARM64 container has verified all 754 tests and the full non-browser
`npm run verify` chain against 150 matching implementation/test/configuration hashes. The first
default parallel browser run had two WebKit initial-load flakes (both passed retry), so strict
`failOnFlakyTests` correctly failed it. The same two tests passed 10 repeated baseline executions;
this does not establish that the new-tree flake is pre-existing. A full single-worker browser run
passed **68 browser tests and 20 accessibility tests**, without retries or failures. No retry, timeout, assertion or budget setting was weakened. This local ARM64
container is not a hosted GitHub AMD64 run. Historical PR #22 CI does not certify this change. Full-source mobile/physical-device readiness, memory and latency, an accepted
production baseline/site, hosted recovery and release review remain unverified. The 05/06 pair
review and all production quality gates are unchanged. No production completion is claimed.

## Requirement-to-evidence matrix

| Requirement | Exact evidence |
|---|---|
| Full source hash and compact tradeoffs | `production-profile.mjs`; feasibility and production measurement JSON |
| Exact evidence, IDs, order and counts | `production codec preserves all exact evidence, original identifier order and count`; full-source deep round-trip |
| Missing/corrupt/incomplete/versioned blocks | `rejects %s blocks without accepting a partial snapshot`; `rejects correctly hashed %s content before readiness and builder acceptance`; `rejects manifest %s` |
| Correct baseline and collection uncertainty | `rejects correctly hashed baseline/release %s mismatch`; real staged build/baseline read regression |
| Bounded/global checks and previous output | `preserves exact release bytes across multiple merge and dataset write flushes`; `preserves known-good release and leaves no candidate after %s failure`; original late-write/bucket-corruption tests |
| Site size and atomic promotion | `rejects combined Pages assets and staging bytes and removes only its candidate`; real collection-date assets/tampered staging test |
| Complete search parity and pagination | `matches every oracle result field across complete pages for broad district, reverse substring, conflict, numeric, unknown-status, and absent queries`; full-source parity JSON and independent reproducible review commands |
| Cancellation and no partial ranks | `cancels preparation cooperatively and can prepare successfully afterward`; `cancels complete scanning without replacing the last successful query state`; `cancels cooperative sorting without publishing partial ranked references` |
| Accepted refresh failure and retry | `keeps the accepted snapshot searchable after candidate failure and retries atomically`; `preserves old data when a different manifest fails and releases it on leaving compact mode`; actual source failure/overlap measurement |
| Worker crash and stale responses | `disables search on accepted Worker crash and recovers through a new Worker`; `rejects superseded queries and ignores stale query and dataset responses; paging only messages the Worker` |
| Actual Worker protocol and privacy | `real Worker protocol accepts only complete data, cancels stale work and pages without fetches`; all-source browser zero-request counts |

## Reproduction and artifacts

Research runners: `.testagent/static-delivery-research/production-profile.mjs`,
`browser-profile.mjs`, `full-search-parity.mjs`; use new output directories and the pinned runtime.
They create no production baseline, release descriptor or deployment. Large local artifacts remain
at `/private/tmp/seoul-compact-production-20260914`; the v3 browser experiment is `site-v3`.

- [Production codec measurement](measurements-2026-09-14-compact-production.json)
- [Browser measurements and memory samples](measurements-2026-09-14-compact-browser.json)
- [Complete-source ordered search parity digests](measurements-2026-09-14-compact-search-parity.json)
- [Independent review and reproduction](review-2026-09-14-compact-delivery.md)
- [Environment outcomes and verified source hashes](verification-2026-09-14-compact-environments.json)


### Final environment evidence

The existing `open-store-searcher-task008-research` container was restarted after restoring its
missing empty read-only `/private/tmp/oss-task008-runtime` mount directory. Node 24.19.0 and
npm 11.17.0 were already installed. A new isolated `/work/task008-compact-20260914` directory
received the uncommitted source; the old repository and research artifacts were preserved.
`npm ci --ignore-scripts --no-audit --no-fund` installed the unchanged approved lockfile. The
project's locked Playwright executable installed the browser/system prerequisites already used
by `.github/workflows/verify.yml`; no project dependency, version or workflow was changed.
150 implementation/test/configuration file hashes matched before and after verification.
The container was returned to its previously stopped state after the checks.

Successful Ubuntu commands:

```text
npm run verify
npm run test:e2e:full -- --workers=1
npm run test:a11y -- --workers=1
```

The default-parallel `npm run verify:full` attempt remains recorded as failed because of its two
WebKit flakes; a serial pass is not relabeled as that default command passing. The normal macOS
browser suites pass at their default concurrency. No hosted GitHub verification was requested or
performed for this uncommitted tree. The complete-source performance observations are from macOS
before Docker startup; the synthetic regression budgets also passed before this setup work.
