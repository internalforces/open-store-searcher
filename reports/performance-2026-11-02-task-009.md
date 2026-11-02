<!--
Purpose:        Record the bounded TASK-009 mixed-query and preparation continuation
Owner:          Implementer / Performance Engineer
Update Trigger: When final source verification or hosted measurements change
Harness Version: 1.1
-->

# TASK-009 mixed-query performance continuation — 2026-11-02

## Supported scalar-ranking result

PR45 head`fef1e36a8b9144722faee5961bf9e80c1a35e436` passes both jobs in
Verify41458949548. Ordinary125322738634 passes1,468 Vitest/92 browser/20 accessibility
plus102 operator/9 admission checks. Full-source125322739275 passes all60 unchanged
search observations: desktop179.3–332.6 ms and emulated-mobile191.4–436.3 ms. Every
candidate count, visible layout and zero-query-request check passes; browser errors
and assessment failures are empty. Primary26.3–228.9 ms/LCP44–244 ms and120,681 code
bytes meet unchanged budgets. Full searchable readiness remains64.6–71.7 seconds;
sampled browser-process RSS3.63–3.84GB is not a continuous peak or a mobile guarantee.
No major collection appears among retained longest traced query events; this does
not prove an absence of every GC event.

Actual checkout/operator`9a23b6ed09636d9dedf6016bf93cdfd6aea0dae0` is the PR merge
revision. All194 code bindings were checked:193 match local bytes; the only mismatch
is the local additional inferred-boundary regression in search-candidates.test.ts,
which was inadvertently omitted from the six-file delivery. It adds one test and
changes no product code. Include it in the final continuation, preserving this
successful measurement and all older failed outcomes. The final test/evidence-only
head still requires its actual canonical outcomes before integration.

This closes the measured hosted/emulated search-budget gap for the reviewed product
bytes, not physical-device, Pages delivery, publication, public equality, backup or
recovery acceptance. TASK-009 remains active and TASK-010 remains sequential. Raw
hosted-scalar-rank.json.raw and the independent review remain retained locally.

## Scalar ranking after the native-store hosted failure

Actual native-store run41432858991/head2f26f05 passes canonical1,467 Vitest/92 browser/
20 accessibility plus102 operator/9 admission checks, without the previous decoration
flake. Full-source55/60 is still a failure: first mixed desktop cold879.8/warm892.1/
mobile warm876.6 ms and mobile-cold district614.4/624.5 ms exceed500 ms. MajorGC614.9/
353.2/395.4/768.6 ms remains; first mobile district also records Layout235.7 ms.
Readiness67.3–77.5 s, code120,481 bytes, sampled RSS2.15–2.50GB. Counts/layout/query
requests are correct, browser errors empty. All failed observations remain retained.

Worker trace chronology places two collections before the mixed-start marker, during
the preceding name fixture. The first mixed query absorbs collection time; these
events do not establish mixed-query initiation. The actual checkout/operator SHA is
12095942e94f0409853d828aee082213145df4ac, the PR merge revision. Its code bindings,
including the native module, match the reviewed source. No performance acceptance.

A separate current-code fixed-sequence diagnostic includes allocations collected by
both minor and major GC. Across three queries each, name sampling estimates13,774,288
allocated bytes and mixed17,578,176. Detailed scoring/name comparisons, address token
splits and Sets are prominent. These sampled estimates perturb timing and are not
browser acceptance or proof that those allocations initiated the observed collections.

The bounded follow-up caches interpreted/literal exact/partial match flags in the
existing byte workspace, retaining fallback precedence. No-address admitted rows
rank at score0/low/no-conflict. Address-bearing rows compare both fields through the
existing cached primitive, including name-qualified rows. A shared scalar scorer
retains the existing500/400/300/100 score and confidence rules for both compact ranking
and detailed scoring. Detailed reasons/independent address objects are produced only
when materializing a page; inferred-boundary reasons survive later demotions.

Observed REDs: name-only ranking hydrates400 fields versus expected0; matching-name
mixed ranking calls200 detailed scorers versus0. GREEN requires0 detailed rank calls,
one cached name comparison and exactly2 primitive address comparisons/read calls on
one query-local target. The conflicting secondary field still yields score500/low.
All135 search tests/types, lint/format, build, both quality and9 admission checks pass.
Full local suite1,465 passes/four unchanged Node22/macOS compatibility failures
(1,469 total). No skips, new buffers, policy, budget, warming or forced app GC.

All56 full-source candidate vectors/counts/full-field boundary pages equal frozen
main. Receipt SHA256:
`7ad8f5d6d51d5fdfca2cc59a0fa477d42fed9e436ba4667283f438e81c3bf418`.
Every current source binding, including the changed scorer, independently matches.
Independent reviews approve:7,680 score/confidence/reason combinations;69 queries on
2,156 synthetic records with full vectors/every page; a second1,053-record/23-query
comparison with596 page objects. Cancellation/overlap and all45 focused checks pass.
Collected-allocation remeasurement uses the same fixed five-fixture sequence, three
queries per fixture, without forcing application GC. Sampling estimates, including
objects collected by minor/major GC, are:

| Fixture | Native detailed ranking | Scalar ranking |
|---|---:|---:|
| District | 3,217,112 bytes | 3,237,344 bytes |
| Partial address | 3,188,640 bytes | 3,313,168 bytes |
| Absent | 2,730,360 bytes | 2,578,888 bytes |
| Name | 13,774,288 bytes | 4,587,520 bytes |
| Mixed | 17,578,176 bytes | 5,003,488 bytes |

These estimates suggest reduced query allocation; sampling perturbs execution and
does not prove the cause of hosted collections. A separate unprofiled serial run
records district144–164, partial167–169, absent129–137, name182–184 and mixed218–230 ms.
All15 samples meet500 ms locally. Preparation31.73 s follows5.78 s validated loading.
Both diagnostic receipts bind the current scorer/compact/native modules. No sampling,
forced GC, query warming or additional wait occurs in the serial measurements.
Fresh resumption reruns all135 search tests/types successfully. Final-head supported
verification remains required; publication/public equality/durable backup/recovery
stay open. The archive snapshot's blanket lint sees ignored diagnostic scratch files;
source-only style checks and canonical clean-checkout checks determine source validity.
Source-only style, build, both quality checks and9admission checks freshly pass.
Fresh independent review approves focused delivery with no introduced findings:
126,720 frozen scorer cases,1,728 records/39queries/1,902 complete-page comparisons,
complete vectors and8,400-row overlap/cancellation/scratch clearing checks agree.
Returned reasons/scalar fields are independent. A nested businessTypes-array alias
reproduces identically on frozen main/current; existing read-only UI consumers do not
mutate it. Record that pre-existing consumer-mutation debt without changing this scope.

## Native address projections and isolated decoration measurement

Run 41424723438 at 43cd7f8 remains a failure. Full-source diagnostics pass 57/60:
desktop mixed809.5/767.7 ms and mobile-warm broad-district901.9 ms exceed500 ms.
MajorGC571.5/295.9/305.8 ms remains, while all source/count/layout/request checks pass
and browser errors are empty. Readiness is56.2–64.6 seconds and code118,406 bytes.
The ordinary job passes1,463 Vitest checks, but one Chromium decoration test fails on
its first attempt and passes its retry; failOnFlaky still fails the job. Accessibility/
operator steps do not run after that failure. No favorable rerun or pass is claimed.

The native store replaces2,318,683 retained AddressParts objects with five Uint32
component-reference columns, a Uint16 family/strong/core/ambiguity column and exact
keys. It retains103,773 source component strings; query lookup never inserts unknown
input (empty0, unknown-1). Growth/sealing preserves each value, and byte-identical raw
keys can share their source string. Ranking hydrates only two query-local targets;
page evidence receives fresh objects. Numeric relevance/district conflicts and the
original full-key fallback retain the original predicates. No source/schema/status/
interface/dependency or budget changes. Existing four byte-workspace and one score-
array assertions remain unchanged.

New storage roundtrip/growth/seal/input independence tests pass. The integrated target
regression is observed RED0 versus400 reads, then GREEN400 using exactly two targets.
All133 search tests/types pass; full local tests have1,463 passes/four unchanged Node22/
macOS failures (1,467 total). Build, both quality checks and9admission checks pass.
Independent reviews find no product defects:9,880 query/candidate predicate/flag pairs
and complete vectors/every page for53 queries on169 records agree with frozen main.

Final full-source parity agrees for all56 queries and2,951,024 records, including all
candidate vectors/counts/full-field boundary pages. Receipt SHA256:
`1d8fc76bccca7a5f3747e3dbaef91219cbb9f884b3f17fdb999eed3eeefd3ebf`.
An Important evidence omission is fixed: parity and profiler lists now bind the new
module, recording its actual absence on frozen main as null. Its current digest is
`8fca99fc15fb349d26ea9066610d55ae01756928965c2ed74053dce5ca3c70ca`.
Independent readback verifies every receipt source hash and resolves the finding.

Actual production-code offline memory diagnostics record before-GC heap1,151,200,816;
after diagnostic GC heap1,112,164,768 / ArrayBuffers345,787,158 / RSS1,978,007,552 bytes.
Native address columns use51,011,026 bytes; existing row-reference buffers216,053,056.
Diagnostic SHA256:`4e75cb727a6c32c147aa64a4162ae3ed54888171ef45894da78dd107537f85b2`.
These explicit-GC snapshots are not application timing, peak memory or an RSS reduction.
Separate unprofiled observations (no sampling/forced GC) are district142–167 ms,
partial-address161–169 ms, absent129–137 ms, name178–194 ms and mixed207–212 ms;
all15 meet500 ms. Preparation31.01 seconds follows6.08 seconds validated loading.
These remain Node22 diagnostics, not supported browser acceptance.

The ordinary failure records nativeCLS0.0267064 while initial data becomes ready;
the ready DOM gate plus34 ms virtual advance did not establish a native paint boundary.
The authoritative refinement design/QM-07 requires no motion-induced geometry shift.
The test-only correction holds actual untouched same-origin demo responses through the
static loading window, preserving editable input/disabled submit, exact bounds,
700 ms/zero-shift/static-accent assertions. It then releases in finally and awaits real
ready markers before the original request baseline and accepted-result/detail checks.
One recorder handles callbacks plus takeRecords; every strict sample drains pending
entries and atomically snapshots/switches delivery windows. Native clocks/all entries
remain, user actions are separate, and evidence attaches in teardown after timing checks.
Independent review approves after fixing queued-entry attribution and attachment-I/O
findings. No thresholds/retries/timeouts change. Actual browser verification remains
required on the next head, alongside unchanged full-source performance.

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
