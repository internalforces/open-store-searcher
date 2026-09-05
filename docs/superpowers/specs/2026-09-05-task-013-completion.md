# TASK-013 completion scope — 2026-09-05

The user explicitly requested task completion after the initial quality-harness checkpoint.
Keep all 30 synthetic exact labels and the original 25/30 report as before evidence. Address-like
name handling may be corrected within FR-03/07; do not change ordinal scores, Top-3 size, tie
handling, status mapping, provider delivery, dependencies or deployment. Contradictions must
remain a low-confidence veto.

## Source-backed sample, fixed before retrieval/scoring

Use the already approved Seoul all-category archive and existing fail-closed Ubuntu collector.
Project only the general-restaurants category (fileDataId 15045016), whose official portal page
was rechecked on 2026-09-05: Ministry provider, free, unrestricted use. Do not publish the archive
or copy unrelated fields (phone, person, coordinates, status). This is an offline test snapshot,
not production data or evidence for TASK-008's unresolved coverage date.

Sampling frame: every row with nonempty business name and at least one address explicitly naming
one of Seoul's 25 districts. Record eligibility and missing-field exclusions. For each district,
select four targets by the smallest SHA-256 of category + source authority + management identity
(with source row ordinal as stable duplicate tie-break). Do not filter using parser output,
name syntax, confidence, status or measurement outcome. Select sixteen further rows per district
as background. Include every other source row whose projected normalized name or complete
road/parcel address equals a target's, up to an explicit 5,000-record corpus cap; exceeding the cap
must fail, never silently truncate distractors. Keep all source projection strings unchanged.

Create one exact name-plus-address query per selected business: prefer its nonempty road address,
otherwise its parcel address. This gives 100 independent target records with a fixed denominator.
Preserve full source details and punctuation. Record category/source row/identity hashes, archive
and selected-member hashes, retrieval runtime, seed/ordering, label policy and fixture digest.
Independent Reviewer checks selection against the retained temporary archive before cleanup.
The result describes this district-stratified restaurant snapshot, not all license categories,
all Seoul businesses, a confidence interval, actual opening status or overall release readiness.

## Verification

Observe baseline failures before fixes, add regressions for safe name/address boundaries,
retain existing conflict/ambiguous/tie safety tests, then measure both frozen corpora separately.
A >=90% result on the source sample plus reviewed provenance completes TASK-013's bounded quality
work; all broader M1, UI, performance and release gates stay with their existing tasks. Independent
review, pinned verify:full and session/traceability updates are required before task completion.

## Pre-selection independent-review clarifications

Accepted before extraction or scoring: assign one samplingDistrict using the road field when it
contains exactly one recognized Seoul district, otherwise the parcel field with exactly one;
record excluded no/ambiguous-district rows. Require nonempty exact authority and management IDs;
fail on duplicate framed identities. Use SHA-256 of the existing frameExactIdentityV1 bytes
(category, authority, management), with source ordinal solely as a deterministic hash-tie check.
The 16 backgrounds are the next 16 non-target eligible rows by that same ordering in each stratum.
Require >=20 eligible identities in every district and 100 unique targets.

Collision keys are nonempty nameKey or addressKey from projectSearchText, preserving original
fields in the fixture. In addition include every partial-name row (containment in either direction)
whose stored address has core/exact agreement with a target's selected address using the unchanged
compareSearchAddress function. This is a fixed pre-ranking competitor-closure predicate, never a
rank/score/success filter. The 5,000 cap applies after union/dedup of targets, backgrounds and all
competitors. Preserve only name, roadAddress, parcelAddress, opaque identity and source row/selection
metadata; no other raw fields or status data are retained.

## Parser correction and final competitor closure

Root cause was query span truncation and treating unit/floor/parenthetical lot details as new
administrative evidence. An explicit name-first province + known Seoul district boundary now
preserves the whole remaining address key. Prefix district/strong-address contradictions and
all conflicts within the address remain vetoes. Address-like names recovered at that boundary
are capped at medium confidence, so the existing synthetic no-primary assertion is preserved.

Address component parsing recognizes numbered legal localities, isolates floor/unit lists and
building-block details, and keeps road primary numbers separate from parenthesized parcel numbers.
Mountain lot qualifiers remain part of the compared number; they are never merged with ordinary
lots. Raw fields and exact address keys are unchanged. Conflicting parenthetical roads still fail
safely. The fixed 100 source targets/queries are not altered after measurement.

Replay the predeclared partial-name/core comparator closure with the final comparator, retain
all earlier candidates and add any newly recognized competitors. Fail the same 5,000 cap. Record
before/final corpus hashes and comparator hashes; this expands competing candidates, never the
success denominator or target selection. Require independent replay and both quality checks in
verify:full. This completes bounded TASK-013 quality evidence, not an all-category release claim.

## Final evidence

Implemented, independently Approved and completed on 2026-09-05. Both quality gates pass with
unchanged targets: synthetic 28/30 and source 98/100. Final comparator closure was byte-identical.
Pinned verify:full passed 443 tests, 8 browser tests, 2 a11y scans. Before reports, source audit,
final review and cleanup evidence are preserved; see reports/test-2026-09-05-task-013.md.
