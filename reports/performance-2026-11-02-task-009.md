<!--
Purpose:        Record the bounded TASK-009 mixed-query and preparation continuation
Owner:          Implementer / Performance Engineer
Update Trigger: When final source verification or hosted measurements change
Harness Version: 1.1
-->

# TASK-009 mixed-query performance continuation — 2026-11-02

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
