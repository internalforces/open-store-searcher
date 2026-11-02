<!--
Purpose:        Record the bounded TASK-009 mixed-query and preparation continuation
Owner:          Implementer / Performance Engineer
Update Trigger: When final source verification or hosted measurements change
Harness Version: 1.1
-->

# TASK-009 mixed-query performance continuation — 2026-11-02

## Owned progressive storage after retained mobile failures

Run 41416612445 at be30350 passes canonical 1,461 Vitest / 92 browser / 20 accessibility
and 102 operator / 9 admission checks. Full-source performance still fails three of
60 observations: mobile-cold name598.0/693.5 ms and mobile-warm partial-address891.1 ms.
Worker MajorGC402.5/803.8 ms remains. Every desktop observation passes; result counts,
layout and query-time request checks remain correct and browser errors are empty.
Readiness is65.3–72.4 seconds, initial code117,935 bytes, sampled browser-process RSS
2.28–3.30 GB. Primary/LCP meet unchanged budgets; the overall run is still a failure.

Retained-memory experiments are separate Node22 diagnostics with explicit GC before/
after offline mutations. They are not application latency or hosted acceptance. One
in-place experiment on the preceding representation records:

| Stage | Managed heap bytes | ArrayBuffer bytes |
|---|---:|---:|
| Original prepared state | 1,952,067,328 | 78,723,076 |
| Equal parsed component strings shared | 1,780,790,896 | 78,723,076 |
| Numeric column references packed | 1,349,523,576 | 294,776,132 |

There are103,773 unique province/district/locality/road/number values across millions
of repeated fields, and54,013,264 references in6,608 columns. Packed references use
216,053,056 native buffer bytes. Managed heap decreases602,543,752 bytes while buffers
increase216,053,056 bytes; this is a representation trade-off, not an RSS claim. RSS
in this same in-place experiment increases219,840,512 bytes. No peak or isolated
cross-process memory improvement is inferred.

Production code now shares only equal primitive component strings, preserving full
address keys, family, ambiguity and scoring values. It copies reference columns into
owned Uint32 buffers after checking integer/range exactness. Original column values
and dictionaries remain shared immutable data; caller inputs are never changed. The
wire validator still requires JSON arrays, with its original bounds and semantic
checks. The TypeScript Column union additionally permits private prepared Uint32 refs;
no public compact JSON, delivery, status, source or interface changes.

Preparation maintains a complete per-call retryable block list. Each completed pair
replaces obsolete references in owned/local lists before its cooperative checkpoint.
Cancellation retains all data for retry; final containers release on success. Worker
captures metadata/count and releases its input snapshot before preparation. Its
generation/request/abort checks and final store replacement are preserved. No query
warming, forced app GC, wait, result pooling or changed acceptance budget is added.

Initial storage-ownership and evidence-packing cancellation tests are observed RED/
GREEN. The progressive retry-ownership assertion is also observed RED/GREEN. All129
search tests/types pass; full local verification has1,459 passes/four unchanged
Node22/macOS failures (1,463 total). Build, both quality checks and9admission checks pass.
Two independent reviewers approve hosted verification with no findings. Independent
checks reject typed wire refs and negative/fractional/overflowing/nonfinite conversion;
overlapping prepare cancellation/retry and accepted-result preservation also pass.

The actual progressive production-code diagnostic, with the caller snapshot released,
records heap1,388,610,672 bytes before explicit diagnostic GC and1,349,576,040 afterward;
post-GC ArrayBuffers294,776,132 and RSS1,968,046,080 bytes. Basic final-copy storage had
before-GC heap1,821,374,616 in a separate run. These snapshots are not continuous peaks
or an isolated causal comparison. All three recorded source hashes match current code.
All56 final progressive complete-source vectors/counts/full-field boundary pages match
frozen main. Receipt SHA256:
`72157bf06cbebeb62c8f4dc127f62ab153e4148846873a75c8952a43da27ed0d`.
Current code bindings match. Original/current preparation33.14/31.76 seconds is
descriptive, not an isolated causal comparison. The production-memory diagnostic SHA256
is`4b16ce323fa39a6fbb338dc7ab4bcb8b1e128cb11a0a0d2233cc38137c86e30d`.
Separate unprofiled serial observations (caller snapshot released before preparation,
without sampling or forced GC) are district159–181 ms, partial-address169–179 ms,
absent128–137 ms, name185–190 ms and mixed219–244 ms. All15 meet500 ms. Preparation
is31.03 seconds after5.88 seconds validated load; ready heap1,388,555,304 bytes.
These remain Node22 diagnostics. New-head supported ordinary/full-source browser
outcomes remain pending. Earlier failures remain evidence.

## Split numeric filters after retained hosted failure

Run 41410100414 at PR head a3c58f1 passes canonical 1,458 Vitest / 92 browser /
20 accessibility plus 102 operator / 9 admission checks. Its full-source diagnostic
retains five failures among 60 observations: desktop partial-address 753.4 ms, desktop
mixed 920.3 ms, mobile-cold partial-address 516.4/805.3 ms and mobile-warm partial-address
802.0 ms. Counts/layouts remain correct, query-time requests are zero and browser errors
are empty. Worker major collections remain; primitive comparisons alone do not resolve
performance. Readiness is 65.0–72.6 seconds. Primary/LCP and 117,745 initial code bytes
meet unchanged budgets; the run is still a failure.

Query-phase Node sampling includes objects collected by major/minor GC, without an
explicit collection command. Stopping the profiler records a collection after queries;
profiled timings are not acceptance evidence. Estimated sampled bytes are:

| Variant | Total sampled bytes | `possibleName` bytes |
|---|---:|---:|
| Original unsigned masks | 63,805,840 | 22,148,480 |
| Intermediate two-bit omission | 38,153,016 | 66,600 |
| Intermediate folded bits | 40,960,024 | 331,816 |
| Final two 16-bit halves | 39,898,904 | 225,504 |

Inference: the profiles are consistent with numeric boxing. V8 describes signed
31-bit small integers under pointer compression in its
[primary explanation](https://v8.dev/blog/pointer-compression). Final storage retains
the original 32 membership bits as two interleaved Uint16 values. Each candidate read
fits the small-integer range; comparing both halves implements exactly the original
unsigned containment predicate, including bit 31 and both substring directions.
Literal-address tokens retain overlap semantics. No additional filter collision or
weakened rejection is introduced. Retained capacity stays four bytes per projection
(15.44 MiB on this source); preparation uses two temporary numeric entries instead of
one, so no peak-preparation-memory reduction is claimed.

Both intermediate variants remain in raw evidence. Omission/folding can only add
comparisons, but offline name cost rises; final split storage preserves the original
filter. The numeric-range regression is observed RED/GREEN. The `an`/z fixture records
RED200 comparisons with omitted bits, and `nn`/f records RED200 with folded bits; both
are GREEN0 with split storage. All 127 search tests/types pass. Independent final review
approves hosted verification with no findings: 96 extra oracle queries exercise all
32 hash buckets and reconstruct every stored name/address mask from four bytes.

All 56 final split complete-source vectors/counts/full-field boundary pages match
frozen main. Receipt SHA256:
`7cb04bcffe20ca8fbb4f9ac935bb8bfd35039d02c4d275de80c057bae2bf5d7d`.
Current source bindings match that receipt. Original/current preparation is 34.58/31.34
seconds, original first and not an isolated speed comparison. Local full execution has
1,457 passes/four unchanged Node22/macOS failures (1,461 total); build, both quality
checks and 9 admission checks pass. Separate unprofiled serial observations are district176–190 ms, partial-address170–172 ms,
absent128–137 ms, name188–194 ms and mixed219–230 ms. All15 meet500 ms; preparation
is32.07 seconds after6.15 seconds validated loading. These are Node diagnostics, not
browser/hosted acceptance, without sampling or forced collection.
All intermediate receipts remain historical: omitted-bit 56-query receipt
`11e7034cef4a4fe31c057dca55c6cc2784b818729162356a1588b582263340b5`, folded-bit receipt
`34df89bfd3f951991c8f1be30b91708ebbf2e7e3d310d3e71152f145ccee417a`.
No source/schema/ranking/status/interface/dependency, accepted-state ownership or
publication contract changes. Every failed observation, fixture and repetition remains;
no favorable rerun, warming, forced collection, artificial delay or budget waiver occurs.
Fresh supported ordinary and full-source browser outcomes remain required.

## Remaining field-comparison allocation correction

Run41404984533 at115de55 passes supported1454Vitest/92browser/20accessibility,
102operator and9admission checks. Its extended diagnostic passes59of60observations.
Only mobile-cold partial-address repetition1 fails at790.6ms, with a726.6ms Worker
MajorGC event. Names are230–316ms and mixed329–447ms across the retained cells.
All counts/layouts/requests remain correct and browser errors are empty. The failure
is preserved; it is not a performance pass or permission to publish.

Ranking still constructed detailed comparison objects, conflict arrays and component
iteration arrays for each distinct admitted address. A shared primitive now computes
the same match/conflict/relevance flags as one number. The existing detailed comparison
API decodes those flags into fresh ordered conflict arrays only where needed. Ranking
retains its low-byte cache; high bits preserve full district/road/locality/number
evidence for the detailed scorer. No input/output status, ranking rule or source/schema
contract changes. The new regression is observed RED201detailed calls→GREEN0, with
ordered multiple-conflict/relevance cases and all124search tests/types passing.

The independent reviewer found no production differences in1125000component combinations
against frozen main, including all family pairs and byte truncation. Review required
strengthening both reuse tests to assert exactly2primitive calls and0detailed calls.
The known slow-path mutation is observed RED(0versus2primitive calls), restored code
passes all124search tests/types, and fresh reviewer confirmation approves hosted
verification with no remaining findings. Assertions are strengthened, not relaxed.

All56complete-source vectors/counts/full-field boundary pages remain identical to
main after the final correction; both source hashes still match the receipt after
the intentional mutation was restored. Receipt SHA256:
`b5aa6809f024b76a04c7d0f7e25e16a6bb9b7152c52e233008148e19c9b54047`.
Local full execution has1454passes/four unchanged Node22/macOS failures (1458total).
Build, both quality checks and9admission checks pass. Separate offline observations
are district163–185ms, partial address170–171ms, absent124–133ms, name171–177ms and
mixed209–211ms; all15meet500ms. Preparation is30.81s after6.16s validated loading.
These remain Node evidence. Actual final-head supported browser outcomes must show
whether the retained collection pause is resolved. No retry, dropped sample, warming,
forced GC, artificial delay, fixture change or budget waiver is introduced.

## Extended hosted failure and measured follow-up

Actual run41400869374 at a3dc00a passes canonical1448Vitest/92browser/20accessibility
verification. Its extended complete-source diagnostic fails: mobile name598–639ms,
mixed536–601ms, additional address/absent misses and a946ms desktop district sample.
Worker MajorGC715–835ms events remain recorded. Counts/layout/requests remain correct
and browser errors are empty. The failed run is preserved; no retry-to-green occurs.

The bounded follow-up avoids duplicate identical interpreted/literal name checks,
uses static32-bit necessary-character masks to reject incompatible projections before
substring/token comparison, and counts rank groups during the complete scan without
transient JS ordinal arrays. Mask collisions can only admit extra comparisons. Names
retain both substring directions; literal-token masks omit separators because tokens
may overlap inside one candidate word. Original detailed scoring remains unchanged.
Masks retain4bytes per distinct name/address projection (16193468bytes on this source).
Reusable flag/score storage is initialized during preparation before full-ID ordering,
with unchanged exclusive leases/clearing. No query warming, forced GC or artificial
delay is added. Whether this prevents the observed hosted pauses remains unproven.

New regression evidence: duplicate comparisons RED400→GREEN200; incompatible name/
literal comparisons RED200/201→GREENbelow100; transient ordinal appends RED200→GREEN
below200; first-query scratch allocation RED804bytes→GREEN0. The exact-one-score-array
lifetime assertion is retained and now measures preparation as well as later searches.
The duplicate-check fixture survives the mask so its exact200-call assertion remains
an independent regression. Unicode, unsigned-bit membership, substring directions,
overlapping tokens and full-page evidence are exercised by the120passing search tests.
Types, build, quality checks and9diagnostic-admission checks pass. Local full execution
has1450pass/4unchanged Node22/macOS failures (1454total), without skips or weakened gates.

All56complete-source vectors/counts/full-field boundary pages match main again;
receipt SHA256:`1dd05ae930457ff12029dcdd2fdad8d7a9dabf021eecca8847d243887c948f04`.
Single original/current preparation observations are33.78/33.59s. A separate offline
run without sampling or forced GC records district175–190ms, partial address175–183ms,
absent127–136ms, name172–175ms and mixed235–250ms. All15observations meet500ms;
preparation is31.61s after6.26s validated load. These remain Node diagnostics.

A fresh independent whole-change review approves hosted verification, finding no
Critical/Important source issue. The duplicate-name test fixture was strengthened as
noted above. Final supported ordinary and unchanged five-fixture browser outcomes
remain required before any performance/publication acceptance. Sparse-query full-ID
traversal and dedicated placement-cancellation regression coverage remain follow-ups.

Earlier pending/initial-source measurements below are retained as historical evidence.

Requirements: FR-02/03/07; performance NFRs. FR-08/12/13/14 and all source,
quality, collection-date, privacy and publication contracts remain unchanged.

## Baseline and environment

The user instructed execution of the identified priorities. Fresh remote main is
`2344bb6080fd534e51cb269eb4379d2fdaf487db`, including merged PR42. Existing dirty
workspaces are preserved. Native worktree creation is unavailable and Git metadata
writes are denied, so this continuation uses an exact source snapshot of that commit.
Local runtime is Node 22.22.3/macOS, explicitly not canonical Node 24.19.0/Ubuntu.

The unchanged retained source has 195 categories and 2,951,024 records. Its complete
hash-validating loader is reused; no new collection, row filtering or fixture source
is substituted. Fixed-fixture CPU/allocation profiles show mixed searches taking
823.61/813.54/801.92 ms, with repeated address scoring and comparison-based ID sorting.

## Changes and preservation

- Reuse address comparison flags for mixed-query rows with neither an interpreted
  nor literal name match. Exact address evidence earns score 100 only where the
  original scorer permits an absent query or candidate name. Nonmatching nonempty
  names remain low-confidence; original page scoring/reasons remain authoritative.
- Count observed score/conflict groups, then place every admitted candidate in
  precomputed full-ID order. This preserves complete ranking without query-sized
  merge scratch arrays. No score values, cutoffs or candidate caps are introduced.
- Drop the identifier-reference vector after its final preparation use. Retain
  only required address projections; query/name normalization remains unchanged.
- Extend the hosted diagnostic with fixed name and mixed fixtures while retaining
  all previous district/address/absent fixtures and every three-repetition outcome.
  Required similar counts are 323695/32399/0/1282/325012; eligible counts are zero.

## Tests and complete-source evidence

The repeated mixed-address regression is observed RED400 comparisons then GREENat
most2. Blank-name exact eligibility and nonmatching-name low confidence have full
page-oracle checks. The ordinal-allocation regression is observed RED400 entries
then GREEN200 for 200 candidates. All114 search tests and type checking pass.
The missing-name/mixed diagnostic regression is observed RED before the fixture
extension; all9 admission tests pass afterward. Lint/format, build and both existing
search-quality checks pass.

Complete-source parity passes all56 original/current queries: complete eligible/
similar ordinal vectors, counts, and every field on first/middle/last result pages
are equal. This retains all55 existing fixtures and adds the fixed partial address.
The actual single unprofiled preparation pair is35.19/31.94 seconds. Profiled
preparation samples are35.21/31.42 seconds; post-GC Node heap snapshots are
1989065992/1953451120bytes. These are bounded diagnostics, not browser memory,
percentiles, controlled causal effects or release acceptance.

An intermediate key-reuse experiment reduced preparation but increased retained
heap; it is not adopted. The intermediate mixed samples581–605ms remain failures.
The final profiled run overlaps the full test suite and retains436/1053/881ms mixed
samples. Those observations are preserved, not discarded or represented as a pass.
Serial offline follow-up, with no concurrent suite, sampling profiler or forced GC,
records all15fixed observations within500ms: district226–241ms, partial address
212–226ms, absent278–284ms, name356–359ms and mixed335–354ms. Preparation is31.00s
after6.08s validated loading. These remain Node diagnostics; supported hosted browser
verification must establish its own actual outcome. Complete-source parity receipt
SHA-256:`503bda91e2953f4933fed786fc7dfc0484a18182d7f872215f61e067e5a62f1c`.

Local full verification executes1448tests:1444pass/four existing unsupported-runtime/
tool failures: Node24Unicode pin, GNU tar archive round-trip, UTF-8 DOS-origin unzip,
and valid local ZIP streaming. Operator/admission execution has72pass/36GNU-tar-host
failures. No assertion, test, coverage gate or runtime pin is weakened or skipped.

## Independent review and remaining acceptance

A fresh independent source/test review approves hosted verification, with no
Critical/Important findings. The reviewer independently exercised new counting
and placement cancellation boundaries with8200records and overlapping accepted
state; both preserve that state and later scratch reuse. Minor follow-ups remain:
the checked-in cancellation suite does not isolate both new boundaries, and sparse
queries traverse the complete immutable ID ordering. Local name samples increase
from333–345to354–376ms; final hosted name measurements must retain that trade-off.

Actual final-head ordinary Ubuntu and extended complete-source browser verification
are pending. TASK-009 remains active; physical measurement stays explicitly user-
skipped, TASK-028 paused, TASK-010 sequential and TASK-021 gated. No publication,
deployment, backup authority, schedule, task closure or performance waiver occurs
from these local results. Read the eventual live PR checks for canonical outcomes.

Raw profiles, full source data and operator logs remain local; only source/tests and
this readable summary are intended for the focused delivery.
