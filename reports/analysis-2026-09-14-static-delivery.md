# Static delivery and search assessment

Date: 2026-09-14. Analysis against e8f8c92; recommendations only, not an accepted design.
Requirements: FR-02/03/07/08/12/13/14 and production performance/zero-cost constraints.

## Current structure

The collector and strict decoder feed bounded transformation batches in
`src/pipeline/stage-bounded-release.ts`. Disk-backed global checks and external merging
serialize a complete display dataset. `scripts/build-publication.mjs` hashes and streams that
dataset to one immutable asset; release metadata binds the asset and matching baseline.

`toDisplayRecord` repeats property names, category/provider/source values, raw and processed
statuses and nullable lifecycle fields for every record. These are compaction opportunities;
their individual byte shares have not been measured. Full evidence values must be recoverable.

`publication-loader.ts:24` parses the whole response and prepares the dataset/index. It returns
only the dataset, discarding that index. `use-display-data.ts:51` then prepares the index again.
This duplicates computation; simultaneous retention of two complete indexes is not established.

`createSearchIndex` constructs an identity map during preparation, normalized names, two parsed
address objects and token arrays per record. App searches synchronously on the main thread.
`searchCandidates` scans all entries and sorts every similar candidate. Top-3 is already bounded.
`SearchResults` displays 20 similar records per page after full result materialization; pagination
bounds DOM work but does not bound download, index construction or search-result memory.

The demo partition loader concatenates all parts before preparation. Production uses a separate
single-file loader. Reusing the demo partition loader unchanged will not solve total retention.

## Evidence

The 2026-09-12 observed dataset has 2,939,947 records and 2,439,358,850 bytes. The recorded Windows
Chromium test crashed after 4,271 ms with 892,534,784 bytes sent. This is historical failure evidence,
not a newly rerun test, measured heap usage or proof that a particular preparation stage crashed.
See `reports/test-2026-09-12-bounded-source.md` and `reports/browser-2026-09-12-actual-source.json`.
The later successful observation recorded 2,940,404 rows and 2,439,752,287 bytes; keep these snapshots
distinct. The bounded producer completed the earlier source on Ubuntu in about 15 minutes with
about 2.16 GiB peak Node RSS. Preserve that useful producer work.

[Official Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits),
checked 2026-09-14, specify a maximum 1 GB published site and a soft 100 GB/month bandwidth limit.
The existing builder rejects a complete site over 1,000,000,000 bytes. Fitting that limit alone
does not establish acceptable browser startup or download cost.

## Recommended direction

### Compact, lossless, versioned JSON blocks

Separate delivery encoding from transformation and quality rules. Evaluate tuple/column JSON,
shared category/source dictionaries, exact raw-status tuple dictionaries and compact nullable
lifecycle fields. Preserve original evidence, full identifiers and their comparison order.
Internal row ordinals can reference identities without changing public IDs. High-cardinality
fields or large posting lists can defeat compression; profile complete-source sizes first.

Separate search and evidence columns logically, retaining compact structures. Materialize current
DisplayRecord objects only for visible cards. Do not expand the package back into millions of
objects. Do not deploy both the legacy multi-GB file and its replacement.

Use bounded blocks and an explicit manifest binding versions, collection-date semantics, counts,
row ranges, file hashes/lengths and the matching baseline. Validate global identity and reference
completeness. The existing producer/builder/baseline reader expect exactly two descriptor entries;
changing this is a versioned migration, not merely emitting extra files. Preserve size checks,
atomic promotion, mixed-release rejection and previous-good-state protection.

### Worker-owned local storage and search

A Worker should load/validate blocks and own compact data, search structures and ranked row
references. The UI should hold dataset/search versions and bounded visible pages. Return Top-3,
full counts, uncertainty and page records, not the full dataset or all candidate objects.
Retain every result and stable order inside the Worker for navigation.

Give preparation one owner and eliminate the current double work without weakening publication
rejection of excluded records. Handle stale query messages, cancellation, Worker failure and
dataset replacement explicitly. Measure old/new snapshot overlap on refresh; preserving the
old dataset can double retained storage even when cold loading succeeds.

Under existing privacy/completeness rules, request all required search/evidence blocks independently
of queries and clicks before complete readiness. Splitting search/evidence does not itself reduce
total download. Fetching only a matching district or clicked record exposes input/behavior-dependent
access patterns even without literal query parameters. Persistent browser databases are not proposed.

### Candidate retrieval before unchanged scoring

Evaluate exact-name/address dictionaries and posting lists with lossless substring retrieval.
Reuse current scoring after retrieval and retain a local scan fallback wherever completeness is
unproven. Worker placement alone does not remove linear scan cost.

Exact matching alone is insufficient: names match containment in both directions, literal-name
fallback exists, literal address words use substrings and numeric tokens use exact equality.
`compareSearchAddress` treats a shared district or same-family anchor as relevant even with
conflicting components. Preserve those low-confidence candidates. Union every retrieval path;
do not silently intersect away valid candidates. Broad queries still require large-set budgets.

## Alternatives

| Change | Benefit | Limitation |
|---|---|---|
| Remove duplicate preparation | Local CPU reduction | Does not solve dataset bytes |
| Split existing JSON | Bounds individual parses if consumed incrementally | Concatenation retains total objects/bytes |
| Transport compression | Potentially fewer wire bytes | Whole decoded data/index still too large |
| Worker with current objects | Less UI blocking | Same bulk memory and linear computation |
| Compact blocks + Worker + local retrieval | Matches static/private direction | More complexity; feasibility unmeasured |
| Query-dependent region/detail requests | Potentially fewer downloads | Privacy/completeness/product changes |
| Runtime backend/database | Avoids whole-browser data | Conflicts with approved architecture |

## Execution order and acceptance

1. Profile a hash-verified complete existing dataset: field bytes, cardinalities, compact search,
   evidence and index sizes, and complete-site bytes. Select a format from measurements rather
   than an invented reduction ratio. No fresh source collection is necessary if verified input exists.
2. Present concrete codec/manifest, Worker lifecycle and migration design for approval under
   AGENTS.md's data-delivery/public-interface gates. This analysis adopts no new contract.
3. Verify exact evidence round-trip, IDs/counts, hashes/references, missing/corrupt/mixed blocks
   and preservation of prior output. Keep production quality acceptance separate.
4. Compare full result fields, scores/reasons, ties, order and counts against the current engine;
   include substring, broad district, conflicts, unknown statuses and missing-result cases.
5. Measure complete-source cold/warm readiness, wire/site bytes, preparation, peak memory,
   full-search-to-visible-page, navigation and refresh overlap on supported desktop/mobile browsers.
   Retain existing 2.5 s/500 ms/code budgets; distinguish shell paint from search readiness.

If compact complete-source loading still cannot meet budgets, present the conflict between
all-Seoul completeness, query-independent requests and mobile startup explicitly. Scope reduction,
region selection or remote search requires a separate product decision; none is assumed here.

Source pairs 05/06, empty-category review, approved initial policy/baseline and daily drift evidence
remain independent quality work. Encoding a status does not approve its mapping. One snapshot
cannot establish normal daily drift.

No source, dependency, workflow, mapping or deployment changed. No new tests or benchmarks ran.
PR #22 was observed merged with successful CI in the preceding assessment; older draft wording
is historical. TASK-008 remains active and TASK-009/010 prerequisites remain incomplete.
