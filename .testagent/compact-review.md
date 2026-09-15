# TASK-008 independent compact-delivery review

Date: 2026-09-14. Reviewer: independent reviewer subagent.
Checkout: `.worktrees/task013-quality`; uncommitted coordinated compact migration.
Requirements: FR-02/03/07/08/12/13/14, last-good preservation, privacy and existing performance budgets.

## Verdict and scope

**Approved for the bounded code-correctness review after the fixes below.** No unresolved
actionable correctness or privacy finding was confirmed in the reviewed final code. This does
not approve production readiness, TASK-008 completion, TASK-009/010, quality-policy/bootstrap
decisions, release, deployment, or budgets that have not passed measurement.

Read AGENTS.md, current project/session/task context, reviewer prompt, standards, approved
2026-09-14 compact-delivery design and implementation plan. Reviewed codec, loader, writer,
directory verifier, bounded/reference staging, publication builder, deployed baseline reader,
scoring extraction, compact search, Worker protocol, hook, App/results integration and tests.
Excluded `handbook/ko/**`. No implementation file was edited. The parent explicitly authorized
this report as the reviewer's sole file edit.

## Findings and resolution

1. **P1, resolved: replacement manifest discarded last-good Worker before acceptance.**
   `src/app/use-compact-data.ts` originally terminated the accepted Worker when the immutable
   URL changed, and cleared its visible dataset. A corrupt replacement therefore removed usable
   data. The final hook preserves accepted data and search while loading a different manifest,
   switches only on candidate ready, and retains accepted search after candidate error. The added
   different-manifest failure regression passes. Relevant: FR-08/14, last-good invariant.
2. **P1, resolved: compact release date/count binding was incomplete.**
   `scripts/build-publication.mjs` and `src/pipeline/read-deployed-baseline.ts` originally checked
   manifest archive/policy/count but did not bind collection date and baseline record count.
   An independent in-memory deployed-reader reproduction returned a baseline despite release
   collection `2026-09-01`, manifest coverage `2026-09-14`, baseline date `2026-08-01`, and
   manifest/baseline counts 0/123, with all declared hashes valid. The shared
   `validateCompactReleaseBinding` now binds the release's valid Seoul collection date to the
   manifest and baseline, and checks archive, policy, date basis and baseline total count.
   Both builder and reader call it. Five mismatch regressions pass. The exact timestamp stays
   in the release descriptor; the hash-bound manifest carries its calendar date. Relevant:
   FR-08/13/14, freshness and same-release baseline integrity.
3. **P2, resolved: leaving compact mode retained its Worker/store.**
   The null-URL effect previously returned without terminating accepted data. It now terminates
   the accepted Worker and clears metadata/search availability. Code inspection also confirmed
   clearing the stale state needed for a later null-to-compact transition. The compact-to-null
   termination assertion passes; the full return-to-compact sequence is not separately tested.
4. **Approved verification detail, resolved:** the publication copy path originally hashed
   only source-stream bytes. It now reads back copied destination bytes and verifies length/hash
   before promotion. This review inspected the fix; it did not inject destination disk corruption.

## Verification performed independently

- Initial focused run: 4 files, 27 tests passed.
- Final focused run at 17:15:38 Asia/Seoul: 6 files, 47 tests passed in 762 ms, pinned Node
  24.19.0 runtime path. This includes the added binding/lifecycle regressions and unchanged
  candidate/optimization tests. The final run follows removal of redundant identity sorting
  from CompactSearch; loadCompactSnapshot still validates global IDs before construction.
- Source-quality oracle comparison: 2,803 source records, all 100 source-corpus queries and
  695 pages matched deeply. Checked every returned field, complete similar ordering/counts,
  Top-3, scores, confidence, ordered reasons, primary/ties, validation and diagnostics.
  Names, addresses and full IDs are source-derived. Missing display-evidence fields use a
  synthetic null-evidence adapter. This is correctness evidence, not full-source performance.
- Privacy inspection found fixed manifest-derived fetch URLs with omitted credentials/referrer,
  no query-dependent fetches, no persistent store, and page navigation confined to Worker
  messages. Evidence remains text-rendered. Exact field/reference/archive/hash validation and
  staged candidate cleanup were retained.

Final focused command:

```sh
PATH=/private/tmp/open-store-pr21-runtime.gmFKJN:$PATH npm exec vitest run src/shared/compact-data.test.ts src/pipeline/compact-delivery.test.ts src/search/compact-search.test.ts src/app/use-compact-data.test.tsx src/search/search-candidates.test.ts src/search/search-optimization.test.ts
```

Reproducible source-corpus comparison, run from the checkout root:

```sh
PATH=/private/tmp/open-store-pr21-runtime.gmFKJN:$PATH node --input-type=module <<'JS'
import { createServer } from 'vite';
import { readFile } from 'node:fs/promises';
import { isDeepStrictEqual } from 'node:util';
const server = await createServer({
  configFile: false, appType: 'custom', logLevel: 'error',
  server: { middlewareMode: true, watch: null, ws: false },
});
try {
  const { CompactSearch } = await server.ssrLoadModule('/src/search/compact-search.ts');
  const { flattenRecord, encodeColumns } = await server.ssrLoadModule('/src/shared/compact-data.ts');
  const { createSearchIndex, searchCandidates } = await server.ssrLoadModule('/src/search/search-candidates.ts');
  const corpus = JSON.parse(await readFile('tests/fixtures/search/seoul-source-quality.json', 'utf8'));
  const records = corpus.records.map(({ id, name, roadAddress, parcelAddress }) => ({
    id, name, roadAddress, parcelAddress, categoryName: 'test-evidence', businessTypes: [],
    rawStatus: { operatingCode: null, operatingName: null, detailedCode: null, detailedName: null },
    processedStatus: '확인되지 않음',
    lifecycle: {
      licensedOn: null, licenseCancelledOn: null, suspendedFrom: null, suspendedThrough: null,
      reopenedOn: null, closedOn: null, sourceUpdatedAt: null, sourceLastModifiedAt: null,
    },
    sourceLabel: 'test-evidence', sourceUrl: null,
  }));
  const archive = 'a'.repeat(64), dictionaries = Array(21).fill(null), blocks = [];
  for (let start = 0; start < records.length; start += 256) {
    const rows = records.slice(start, start + 256).map(flattenRecord);
    const columns = encodeColumns(rows);
    blocks.push(
      { version: 1, archiveSha256: archive, role: 'search', start, count: rows.length, columns: columns.slice(0, 4) },
      { version: 1, archiveSha256: archive, role: 'evidence', start, count: rows.length, columns: columns.slice(4) },
    );
  }
  const store = new CompactSearch({ archiveSha256: archive, recordCount: records.length, metadata: {} }, blocks, dictionaries);
  await store.prepare();
  const index = createSearchIndex(records);
  let pages = 0;
  for (const c of corpus.cases) {
    const oracle = searchCandidates(index, c.query);
    await store.search(c.query);
    const complete = [];
    for (let page = 0; page < Math.max(1, Math.ceil(oracle.similarCount / 20)); page++) {
      const actual = store.page(page);
      const expected = { ...oracle, similarCandidates: oracle.similarCandidates.slice(page * 20, page * 20 + 20), page };
      if (!isDeepStrictEqual(actual, expected)) throw new Error(`Parity mismatch: ${c.id}, page ${page}`);
      complete.push(...actual.similarCandidates);
      pages++;
    }
    if (!isDeepStrictEqual(complete, oracle.similarCandidates)) throw new Error(`Incomplete: ${c.id}`);
  }
  console.log(JSON.stringify({ sourceRecords: records.length, queries: corpus.cases.length, pages, completeResultFieldParity: true }));
} finally {
  await server.close();
}
JS
```

## Remaining acceptance gates

The parent owns full required project checks, final formatting/types/coverage, real compact
browser integration, full-source production-code round-trip and real cold/warm readiness,
transfer, memory, old/new overlap, query-to-page and pagination measurements. This reviewer
does not independently claim those passed. Ordinary demo browser checks do not prove the new
production Worker path. Preserve the 500 ms loaded-search, 2.5 s shell and 300 KB initial-code
budgets and report any observed failures. Approved Ubuntu verification and existing policy,
bootstrap and release gates remain separate. No push, workflow dispatch or deployment occurred.

## Follow-up: lossless retrieval and cooperative scheduling optimization

Reviewed only the new changes in `src/search/compact-search.ts` and the scoring/helper
extraction in `src/search/search-candidates.ts`. Read their existing parsing dependencies to
establish the acceptance semantics. **Bounded correctness verdict remains Approved.** Final
browser timing, memory and cancellation measurements remain the parent's responsibility.

Reviewed content hashes, before any later formatting-only pass:

| File | SHA-256 |
| --- | --- |
| `src/search/compact-search.ts` | `b7ce2b620c84c5fb702e8aefe5d651b652887709567fc91d3f213b070cdcad29` |
| `src/search/search-candidates.ts` | `a64e3e3f61ae89715136e0546ccc35e5b8f02406a9b56d13c88445bcdd5044b3` |

### Completeness argument

The scorer's only null-return condition is the conjunction of no name match, no address match,
no literal-address fallback and no relevant address. Therefore a row is safely discarded only
when every corresponding filter condition is false.

- Name: the filter tests the same `matchName` function for both the interpreted name key and
  the full validated literal name key. The scorer may use the latter only as fallback, so the
  filter is a safe superset even when it tests the literal key unnecessarily. Bidirectional
  containment and the two-grapheme rule remain in that single shared function.
- Recognized address: the filter independently compares each road/parcel projection and accepts
  `comparison.match !== 'none' || comparison.relevant`. The scorer accepts the same disjunction
  across both fields. A relevant same-district or same-family anchor remains admitted when
  district, road, locality or number conflicts make its match `none`.
- Unrecognized/literal address: both paths call the extracted, unchanged per-field token
  predicate. Every query token must match within that one address field, with whole-token
  numeric equality and substring matching for nonnumeric text. No cross-field combination
  or token loss is introduced.
- Each cache is new for its query and keyed by the exact prepared projection reference. A
  cached result changes evaluation frequency, not truth value. Every ordinal is still visited,
  each admitted row receives the original complete scorer, and all ranked references remain
  available. The optimization adds no postings, truncation or candidate caps.
- Flat identifier references are appended in validated contiguous block/row order and indexed
  by the same ordinal. Sorting still compares full public-ID strings, independently of source
  ordering. Cooperative sorting and result-state publication retain their cancellation guards.

### Follow-up finding and verification

**P2, resolved:** checking that a scheduler object exists does not establish that its `yield`
method exists. Calling an absent method would abort preparation in a partial-API environment.
The parent changed the guard to `typeof scheduler?.yield === 'function'`, retaining the timer
fallback. No implementation edit was made by the reviewer.

- Focused run at 17:19:29 Asia/Seoul: 3 files, 19 tests passed, including preparation, scanning
  and sorting cancellation cases, existing candidate behavior and optimization regressions.
- Re-ran the exact source-corpus command above: 2,803 records, 100 queries, 695 pages, complete
  deep result-field parity passed after the optimization.
- Additional adversarial cross-product: 16 names x 12 road values x 3 parcel values = 576
  records with deliberately descending full IDs and repeated name/address projections.
  Twenty-one queries yielded 207 deeply identical pages. Oracle evidence included 468
  `literal_name_fallback`, 624 `literal_address_fallback`, 1,000 `address_conflict:district`
  and 592 `address_conflict:number` occurrences. These counts include repeated rows across
  queries, not distinct source records.
- The adversarial preparation ran with a scheduler object lacking `yield` and crossed the
  512-row yield boundary successfully. Subsequent queries used an asynchronous scheduler stub;
  its `yield` method was called 142 times. These are feature-detection/unit scheduling checks,
  not evidence about browser scheduling latency or Worker-message priority.

The adversarial matrix included empty fields, same-name/different-address pairs, same-district
different roads, same-road different districts/numbers, differing road/parcel evidence,
ambiguous repeated districts, reverse name containment, one-grapheme and multi-grapheme emoji,
entity notation, whitespace, absent/invalid input, and numeric `12` / `120` / `12-1` literals.
All display-only fields used the same synthetic null-evidence adapter as the source command.
No regression or completeness counterexample was found. Actual performance budgets were not
relaxed and are not approved by this correctness follow-up.

## Final bounded follow-up: release versions and Worker request ordering

The parent froze implementation source for performance hashing and requested review only of
the added release-binding checks, stale Worker-request guard, real Worker-module protocol test,
and null-to-compact lifecycle assertion. **Approved; no new actionable finding.** This reviewer
edited only this report and did not change frozen implementation or tests.

- Release binding now rejects null/empty/whitespace policy revisions and requires baseline
  validation version 1 plus exact schema/identifier/normalization versions from the already
  validated manifest. The earlier date/archive/policy/count bindings remain enforced. A
  research snapshot can still use a null policy at codec level; it cannot pass this publication
  binding check. Legacy v1 deployed-reader behavior remains separate.
- Non-load Worker messages must carry integer protocol identifiers, the accepted load
  generation, and a request sequence newer than the latest request. These checks run before
  cancellation or search-state changes. Each hook-owned Worker still receives one initial load;
  this guard is not a contract for reusing one Worker for multiple load generations.
- The new protocol test imports the actual Worker module with a controlled scope/fetch adapter,
  produces data with the production writer, and covers full readiness, superseded search,
  stale generation, network-free paging and corrupt-candidate rejection. It is a module
  integration test, not a real-browser scheduling measurement.
- The lifecycle regression now explicitly covers compact ready -> different candidate failure
  -> null -> compact loading, asserting cleared metadata and unavailable search after re-entry.
  This supersedes the earlier report's note that the return-to-compact sequence was untested.

Independent final verification at 17:28:26 Asia/Seoul: **4 files, 31 tests passed** in 784 ms.

```sh
PATH=/private/tmp/open-store-pr21-runtime.gmFKJN:$PATH npm exec vitest run src/shared/compact-data.test.ts src/pipeline/compact-delivery.test.ts src/pipeline/compact-worker.test.ts src/app/use-compact-data.test.tsx
```

Additional in-memory checks imported the actual modules without writing test files:

- Valid Seoul midnight-boundary binding passed; 19 combinations of invalid policy values and
  validation/schema/identifier/normalization versions all rejected.
- After ready at generation 7, request 10 search survived stale request 9 cancellation and
  generation 6/request 999 cancellation. Stale search and duplicate page requests produced
  no reply; valid request 11 page succeeded. Fetch count stayed at two for the empty verified
  manifest/dictionary fixture; search and paging issued no request.

Final reviewed frozen hashes:

| File | SHA-256 |
| --- | --- |
| `src/shared/compact-data.ts` | `762bdefcbe61fd9aceafad7e48461defd8a4f74e4dbc41d4ab1eb612c84fda83` |
| `src/app/compact-search.worker.ts` | `d04cd54a1507b8b4efe2714f16e0f015d211e3f37a90c434f2701674e230a6d9` |
| `src/app/compact-worker-protocol.ts` | `f0734b1129d68a0c479bf633b49869ba65ca1650ed8b2a4c146a3b61f42c7304` |
| `src/pipeline/compact-worker.test.ts` | `24ef2ac99ac57ddd4ab5b65d7d4efcc84467cf2f6c10e9a87cdcac73e2d9030b` |
| `src/app/use-compact-data.test.tsx` | `9b2e88e79b1cd5482f8f3250d4971e625ae1e5edd6d759b7f703f5163a63e7a9` |

The parent separately reports full-source oracle parity and optimized desktop browser results.
Those measurements were not independently rerun in this bounded follow-up and must be cited
from the parent's recorded evidence rather than attributed to this reviewer. Overall task,
production policy, mobile performance, approved-runner and release boundaries remain explicit.
