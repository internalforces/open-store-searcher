<!--
Purpose:        Record the lossless TASK-009 search follow-up and corrected full-data browser observations
Owner:          Implementer / Performance Engineer
Update Trigger: When the bound code, evidence or remaining acceptance gates change
Harness Version: 1.1
-->

# TASK-009 search performance follow-up — 2026-10-23

The final local run retains all 2,951,024 records and the existing candidate counts.
All 24 observed searches finish within 500 ms through two animation-frame opportunities:
the maximum is 365.2 ms. This is desktop Chrome evidence, including a narrow viewport.
Physical/mobile/hosted performance acceptance remains open; no deployment is authorized by
these measurements. TASK-009 alone stays active; TASK-028 remains paused and TASK-010 sequential.

Related requirements: FR-02/03/07 and the complete-search 500 ms NFR; supporting FR-08/12/14.
This continues [the checkpoint report](performance-2026-10-23-task-009.md) on draft PR41.

## Environment and identity

| Item | Binding or condition |
| --- | --- |
| Data | Earlier exact-source replay: 195 categories / 2,951,024 records; no new provider collection in this continuation |
| Compact manifest SHA-256 | `1f5ec4815d7412021ee9b7a6703ee8c3141ab853479413e5d7d1ea9f2f7f06c1` |
| Source/date | The approved October 16 ZIP; collection `2026-10-16T01:52:52.043Z`; source coverage null/unverified |
| Node | 24.19.0 on macOS; unchanged existing dependencies |
| Browser | Local desktop Chrome through the existing Vite server on port 5199 |
| Viewports | Desktop default, uncontrolled dimensions; then verified 393x727 desktop viewport, scroll width393 |
| Input bindings | 185 files; exactly two changed source/test files, all 183 other bindings equal hosted preparation |
| Aggregate code-binding SHA-256 | `8f456be11a9b1b997f092046dfded16296bf5946a49f05d825ab01f04637e0be` |
| Final code/build | 93,599 bytes for HTML/CSS/pageJS/WorkerJS including diagnostic instrumentation |

The unchanged compact loader validates the complete snapshot. App builders rehash every linked
data asset and their 185 input bindings. The final build's Worker, page JS and CSS equal the
preceding district build; only the local diagnostic HTML/observer protocol changes.
The final builder correctly binds its own executed helper.

Final source SHA-256: `compact-search.ts`
`64c68505ecf04da2a767ec538d2472da46ec0796d25f8f8fb1cc9f259d493d39`;
test SHA-256:
`4cb89e79405f9f9eeed4e61d460902db2e297803cb5e98f8614abead10564600`.
No compact serialization, status/date mapping, data-delivery method, dependency, public URL,
Actions permission, infrastructure or publication flag changes.

## Final observed search times

Elapsed milliseconds from actual form submission through two frame opportunities, with a
nonzero result-region layout check. Each final cell contains three observations.
Every final observation reports visible state at start, Worker reply and frames.

| Fixed fixture | Similar candidates | Previous checkpoint | Final desktop | Final 393x727 desktop |
| --- | ---: | ---: | --- | --- |
| Broad district | 323,695 | 675.6–757.8 | 326.6 /328.5 /329.0 | 346.3 /312.0 /330.3 |
| Partial address | 32,399 | 564.3 | 222.7 /196.4 /194.1 | 195.6 /195.6 /195.1 |
| Business name | 1,282 | 450.4 | 365.2 /345.4 /329.8 | 319.6 /329.2 /316.1 |
| Absent | 0 | 421.8 | 318.5 /279.6 /293.4 | 280.0 /310.7 /294.1 |

These are descriptive samples from separate uncontrolled sessions, not a percentile or a precise
causal speedup. The narrow run changes viewport size only; it is not phone CPU/memory/network
emulation. No search cutoff, sampling, pruning, posting limit or result cap was introduced.

Ready round trip was 67,402.9ms: load 33,059.4ms and prepare 34,303.6ms.
Loading/network/cache/JIT/thermal conditions are uncontrolled. No controlled cold/warm, LCP,
initial real-data usability or browser-memory acceptance is inferred.

DOM checks separately confirmed 20 articles on each of the first two pages, the correct
21–40 second-page range out of 323,695 candidates, raw and processed status/source/date evidence,
the explicit October 16 collection date, unverified coverage, the age-seven warning, and
absence-not-closure copy. Viewport overrides were reset and diagnostic tabs closed.

## Bottlenecks and bounded fixes

1. Candidate admission previously constructed full address-comparison results for every distinct
   address projection. The new boolean retains district relevance, same-family anchor relevance,
   and equal nonempty keys. Core/partial matches already require relevance; the equal-key term
   conservatively covers the remaining exact path. Unchanged scoring still decides evidence,
   conflicts, ambiguity and confidence.
2. A nameless district-only query has no strong/core address, so the existing scorer gives every
   admitted candidate score 0/low confidence. Its unspecified address family permits only district
   conflicts. A strict guard now uses this fact for complete ranking, checking both address
   fields; full scoring/reasons are still materialized for each requested page. Named, strong,
   road/locality/number and ambiguous-address queries keep their original scoring path.

The district shortcut deliberately follows existing scoring rules. Future changes to those
rules must retain the guard proof and oracle parity. This is a trade-off in internal duplication,
not an approved change to matching/confidence policy.

## Completeness proof and test-first evidence

Before product edits, the exact-source Node diagnostic failed its 500ms diagnostic assertion.
A separate all-projection probe compared both candidate bitmaps over 2,318,683 distinct parsed
addresses for four fixed fixtures; every bitmap matched. The detailed-comparison probe took
155–190ms versus27–55ms for the boolean predicate, with fixed-order/cache caveats.
After the first filter change, its third broad browser sample still took 570.8ms; that miss is
retained and led to the district investigation rather than a premature pass.

For all 25 Seoul districts, province-prefixed variants and five guard cases, the before/after
district probe independently matches all 55 complete eligible/similar ordinal vectors, counts,
and first/last full-page hashes. Full-field hashing is limited to those boundary pages.
The unchanged scorer/evidence codec and complete-page unit oracle provide complementary coverage.
Node timing still includes misses, including the unchanged ambiguous-district case; it is not
browser or mobile latency acceptance.

Two new tests cover11 address-filter queries and a 93-record district/guard corpus.
They verify every result field across all pages, zero-score/low-confidence weak district evidence,
both-field conflicts, missing/name-only/ambiguous/unknown-status cases, and a retained 500/high
exact named match. The previous4,500-record/225-page parity and later-boundary cancellation
regressions remain.

## Observer correction and retained observations

An intermediate controller waited using a repeated-marker regular expression over growing
timing JSON. Failed lookups became expensive: the same expression over serialized observed DOM
payloads cost 0/11/433/1,711ms at 6/12/18/20 existing markers in the controller JS engine.
That reproduced observer cost; it does not assign the exact cause of every browser delay.

The affected set is retained, including narrow business-name Worker replies
1,191.2/2,140.0/3,251.2ms and the tool timeouts. It is not final budget evidence.
The final local observer sets a public data-samples attribute after writing each completed
two-frame measurement; the controller waits for one exact CSS selector. A fresh full-data page
then produced the 24 observations above, with the same185 code-input digest and identical Worker,
page JS and CSS. The observer remains outside shipped product code and records fixed fixture
timings/counts, not user queries or behavior.

A copied intermediate builder also recorded its reference helper in its helper field.
The intermediate build retains that original field with an explicit correction note and
separate executed-helper post-readback binding; no pre-execution helper binding is claimed.
The final linear-observer builder records its own correct helper hash. Data/source/build-file
bindings remain independently checked.

## Verification and remaining gates

- Final focused run: 50 tests pass in four files.
- Scoped Biome, TypeScript no-emit and whitespace checks pass.
- Full local run: 1,433 pass / the same three pre-existing macOS platform failures.
  GNU tar's hard-dereference option is unavailable in recovery-archive's real-tar case;
  unzip-archive's UTF-8 DOS-origin and valid-local-archive cases reject this environment.
  Tests were not skipped or altered. Supported Ubuntu final-head verification remains separate.
- Existing scorer-quality corpora pass: synthetic 28/30 (93.33%) and source-sample 98/100 (98%),
  with no safety failures. These are existing bounded corpora, not full-population accuracy.
- Independent source/test review approves the conservative filter and district shortcut with
  zero open findings; final browser/build evidence and fresh final-head CI are separately recorded.

A fresh physical-device inventory exits 1 with a CoreDeviceService diagnostic. This establishes
a current tool-access limit, not the absence of a device. Physical/mobile/hosted full-data
performance, controlled load/LCP, memory and release gates remain open. No performance waiver,
task/milestone completion, merge, deployment, schedule activation, backup/recovery authority
or thirty-day reliability acceptance is inferred.

After the existing performance gates pass, first publication still requires a fresh current-main
candidate. The old successful preparation's skipped deployment cannot be resumed. Complete public
equality, durable backup/redownload/adoption and expired-original-artifact recovery follow;
TASK-010 retains actual 30-day success >=95%.

Evidence:
[final browser](task-009-2026-10-23/performance-search-browser.json),
[final build](task-009-2026-10-23/performance-search-build.json),
[local verification](task-009-2026-10-23/performance-search-verification.json),
[district before](task-009-2026-10-23/performance-district-node-before.json) /
[after](task-009-2026-10-23/performance-district-node-after.json),
[filter before](task-009-2026-10-23/performance-filter-node-before.json) /
[after](task-009-2026-10-23/performance-filter-node-after.json),
[intermediate browser](task-009-2026-10-23/performance-filter-intermediate-browser.json),
[intermediate build](task-009-2026-10-23/performance-filter-intermediate-build.json),
[observer-affected set](task-009-2026-10-23/performance-observer-affected-browser.json).

