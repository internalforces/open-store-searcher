# TASK-013 Seoul search quality corpora

Purpose: deterministic offline FR-03/07 regression and PRD sections 16–18 Top-3 measurement.
Both corpora are consumed by `src/search/search-quality.test.ts` and `quality:search:check`.

## Synthetic regression corpus

`seoul-quality.json` retains all 24 fictional records and 42 original cases from the first
TASK-013 checkpoint. All business/address combinations, identifiers, statuses and dates are
invented test literals, not administrative observations or user queries. Its 30 exact targets
include road/parcel inputs, five identical licensing records, and address-like business names.
No failed target was removed or relabeled. Original recall was 25/30; corrected recall is 28/30.
Two of five equally strong licensing IDs remain outside Top-3; no primary is selected for ties.

## Source-backed corpus

`seoul-source-quality.json` contains 2,803 projected records and 100 exact target queries from
the Ministry's Seoul general-restaurants CSV (fileDataId 15045016), inside the already approved
Seoul all-category ZIP. The [official source page](https://www.data.go.kr/data/15045016/fileData.do)
was rechecked on 2026-09-05 and names the Ministry as provider, free access and unrestricted use.
Attribution: Ministry of the Interior and Safety / local administrative licensing data.

The accepted collector retrieved 216,223,358 ZIP bytes at 2026-09-05T11:52:59.156Z; archive SHA-256
`fd95ab10c6b0cbb5e638b36b911da66880b0a42e429f4bea50b97292862ae4e5`.
The CSV member contains 538,191 rows. This is a retrieval snapshot, not a verified coverage date:
`dataAsOf` remains null and TASK-008's freshness/publication gates remain separate.

Selection was fixed before scoring in `docs/superpowers/specs/2026-09-05-task-013-completion.md`:

- Assign each eligible record to exactly one district: the road address if its normalized tokens
  contain exactly one of the 25 Seoul districts, otherwise the parcel address. Keep original strings.
- Require nonempty exact category/authority/management identity, name and at least one address.
  Check all framed identities for duplicates. Exactly 13 rows lacked an unambiguous district;
  other missing-field exclusion counts were zero. No parser success/status/score filtering occurs.
- Sort by SHA-256 of the existing versioned length-prefixed identity framing. Select the first
  four records per district as targets and the next sixteen as backgrounds: 100 unique targets
  plus 400 disjoint backgrounds. One full literal name-plus-address query per target; prefer a
  nonempty road field, otherwise parcel. These 54 road and 46 parcel labels never change after scoring.
- Include every nonempty normalized name/address collision and every partial-name/core-or-exact
  address competitor under the declared predicate. Enforce a 5,000-record cap after union/dedup.
  The final comparator replay retained byte-identical corpus/labels: 2,402 collision rows, one
  additional partial/core row, 2,803 union records. No competitor was removed to improve recall.

Only opaque identity, original business name, road/parcel address, source ordinal and selection
metadata are stored. No status, phone, person field, coordinates or other raw source fields are
copied. These are source records used as offline tests, not collected user behavior or a public
production dataset. Independent review replayed the sample against the retained archive and
confirmed every immutable selection/audit field and byte-identical raw corpus before cleanup.

`seoul-source-audit.json` binds archive/member/script/comparator hashes, counts, all target and
background IDs/districts and runtime/resource evidence. Its `corpusSha256` binds the raw extractor
JSON; `formattedFixtureSha256` binds the repository's Biome-formatted JSON. Only whitespace changed.
The final checked CLI separately hashes the actual fixture and audit bytes.

## Metric, scope and reproduction

Exact Top-3 recall = exact cases whose single target ID occurs in the first three `topMatches` /
all cases labeled exact. Low-only targets remain misses. Empty denominators return null rather
than 100%. Reports retain all target labels, ranks, counts, family metrics, misses and safety
failures. Similar-ID previews are limited to ten with explicit total/truncation fields; target
membership is checked against the full result before preview truncation.

`npm run quality:search` prints synthetic results. Add `-- --source` for the source sample;
add `--check` to return 1 for below-90%, empty-denominator or safety failure, 0 for a passing
numeric/safety check, and 2 for invalid input/execution. `npm run quality:search:check` checks both
corpora and is part of `verify:full`. No runtime network or output-file writes occur in measurement.
For pure JSON without npm banners, run `node scripts/measure-search-quality.mjs [--source]`.

Source extraction is a separate research-only operation documented in the completion report;
it uses the approved Ubuntu collector/decoder and `scripts/sample-search-source.mjs`, never a
fixture test's network path. Reproduction from an archived snapshot must preserve selection policy,
source hashes and exact labels; a later ZIP is a new benchmark version, not the same evidence.

Final source recall is 98/100, with two retained ambiguous historical-road annotations. This
establishes the tested district-stratified restaurant snapshot's result, not accuracy for all
licensing categories, a population confidence interval, actual opening status or overall release
approval. Synthetic cases are correlated regression cases; source cases each target a distinct
record. Other production/UI/performance/release gates remain their owning tasks.

Update trigger: reviewed regression fixes or a separately reviewed source snapshot. Preserve
before/after evidence and labels; never tune the denominator or discard misses to meet 90%.
