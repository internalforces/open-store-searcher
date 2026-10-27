<!--
Purpose: Record source-bound CPU/heap investigation and lossless preparation optimization
Owner: Performance Engineer / Implementer / Tester
Update Trigger: When final source, verification or acceptance evidence changes
Harness Version: 1.1
-->

# TASK-009 preparation and retained-memory optimization — 2026-10-27

The user authorizes steps 2/3 and PR creation. This continuation reduces redundant projection
work and retained address allocation while preserving complete search. TASK-009 stays active;
TASK-028 remains paused, TASK-010 sequential and TASK-021 gated. No deployment is performed.

## Environment and unchanged source

The isolated checkout starts at main 65cb9e69427b2da84508abc9c5fe3ec44823f494 (merged PR43).
Existing dirty workspaces and their 2,412-entry preservation checkpoint remain untouched.
The retained local validation site's complete compact data is reused; original collection,
source replay and production publication are not repeated. The unchanged loadCompactSnapshot
validates every asset hash/length, complete schema, row coverage, global IDs and ordered-ID hash.
Every run confirms exactly 2,951,024 records and manifest
`1f5ec4815d7412021ee9b7a6703ee8c3141ab853479413e5d7d1ea9f2f7f06c1`.
Archive identity stays `c90758c2d3922e78d636ab2c9967b80c690bdcd8aeca283cf9f6ecc2cc992352`.

Measurements run on Apple M3/macOS with Node 22.22.3, not pinned Node 24.19.0/npm11.17.0.
The installed Homebrew Node 25 also fails dynamic-library loading; it is not substituted or
repaired. Existing installed dependencies are reused via an untracked local symlink; no dependency
or lockfile changes. These are Node compatibility diagnostics, not browser Worker, hosted network,
physical paint or mobile acceptance. No user searches or clicks are observed or stored.

## CPU/allocation findings and implementation

Node inspector samples preparation and each fixed search separately. Profiling and allocation
sampling perturb timing; unprofiled searches and a separate unprofiled preparation comparison
are retained. Inspector-control frames appear prominently in short CPU profiles; their self time
must not be counted as application work or used to invent application phase percentages.
The largest application preparation buckets are full text projection, normalization and address
parsing. Retained-allocation sampling attributes508,057,256 bytes to address token splitting.
This is a sampling estimate, not exact object accounting or peak memory.

Three bounded internal changes address those observations:

- Candidate-name preparation computes only the same name key. Address component tokens request
  only the same one-pass normalized notation, avoiding unused name/address projections.
- Prepared addresses retain AddressParts directly, without a wrapper and eager token array per
  distinct address. Literal admission tests the existing canonical key, requiring whole-token
  numeric matches and preventing literals from bridging spaces.
- The detailed scorer remains unchanged. It receives freshly split tokens only for admitted
  literal/name queries; parsed-address queries never consume those arrays and do not allocate them.

All rows are still scanned, sorting remains complete and identifiers remain full length. No
posting cutoff, result cap, data encoding/delivery change, cache policy, status mapping, public
interface, dependency, infrastructure, Actions permission or publication/recovery authority changes.
Cancellation checkpoints and atomic result assignment remain unchanged.

## Same-machine observations

| Observation | Original | Final | Interpretation |
| --- | ---: | ---: | --- |
| Unprofiled preparation, separate 55-query comparison |46,928.6 ms|30,106.9 ms|35.8% lower in these samples|
| Preparation with CPU/allocation sampling |49,951.7 ms|30,103.7 ms|39.7% lower; instrumentation applies|
| Post-GC Node heap after preparation |2,616,727,792 bytes|1,988,771,608 bytes|598.9 MiB/24.0% less|
| Instantaneous Node process RSS after preparation |2,851,520,512 bytes|2,232,041,472 bytes|590.8 MiB less; not peak/browser PSS|

The unprofiled comparison loads one validated snapshot and runs the separately frozen original
implementation first, then the current implementation. Each preparation is measured once; order,
JIT, cache and GC effects are not independently isolated. Do not interpret these samples as
percentiles, a typical-phone guarantee, or a causal comparison with October 25 cloud measurements.
The two stores retain identical1,729,684name and2,318,683address projection counts.

Unprofiled search plus first-page materialization, all three observations in milliseconds:

| Fixed fixture | Original | Final |
| --- | --- | --- |
| District |492.9 /480.9 /467.4|462.5 /435.6 /485.0|
| Name |395.9 /393.8 /400.2|364.0 /354.6 /346.8|
| Address |253.2 /240.7 /241.4|236.8 /231.2 /236.8|
| Source-verified zero candidate |342.7 /341.4 /346.0|274.5 /273.9 /283.9|
| Mixed name/address |804.4 /797.1 /789.1|802.2 /796.7 /781.8|

The first intermediate implementation retained unnecessary scoring-time splitting for parsed
addresses; mixed samples were833.5–841.2 ms. Those samples remain in optimized.json. Removing that
unused allocation yields the final samples above. Do not claim every search improved or discard
the intermediate regression. The mixed query still exceeds500 ms in this Node diagnostic. Original
browser/mobile/hosted budgets, full readiness, memory and the nearly691MB warm transfer remain open.

## Correctness, source binding and review

The new specialized projection and literal-key tests are observed RED (two missing-export
failures) then GREEN. The unchanged token-array predicate independently checks a
key/literal matrix including later numeric hits, substrings and cross-token rejection.
All-page compact/oracle tests include Unicode/notation, numeric boundaries and empty addresses;
existing conflict/tie, cancellation, aborted preparation/retry and retained-state tests remain.
The focused full search directory passes105 tests.

The five measured baseline/final searches preserve complete eligible/similar ordinal-vector
hashes and full-field first/middle/last page hashes. An independent unprofiled comparison loads
the original 142 src files frozen directly from 65cb9e6 and compares55 fixed searches: all 25districts,
their province-prefixed variants, name/address/zero/mixed/numeric-address fixtures. Every complete
vector, count and full-field boundary page matches. Ordered source-ID binding ensures the ordinal
identities represent the same complete records. The fixed zero fixture has0eligible/0similar;
the older negative-intent fixture with10 candidates is not relabeled as empty.

Independent static source/test/diagnostic review is Approved with no blocking findings. It does
not constitute final TASK-009 acceptance or a new browser/physical performance pass. The reviewer
identifies measurement qualifications above; no source fix is requested. Later55-query/report
evidence is separately checked for consistency.

## Verification and delivery boundaries

- Focused search105 pass; types, lint, formatting, production build and existing search-quality
  commands pass. Lint records 10nonblocking informational suggestions, including new helper style
  suggestions; they are not all attributed to the pre-existing baseline.
- Local verify:full reaches coverage:1,435 pass/4 fail across 1,439 tests. The failures are the explicit
  Node 24.19.0 runtime pin, two approved-Linux Info-ZIP integrations and GNU-tar packaging. No test is
  rewritten, skipped or weakened. The chained command stops before browser/a11y execution.
- Local operator suite records 63 pass/36 fail (99reported tests): macOS bsdtar lacks required GNU
  tar options and the packaging suite rejects the host before its individual cases. No supported
 102-test/operator success is inferred. Original operator/workflow code is unchanged.
- Canonical Ubuntu 24.04/Node 24.19.0 PR verification remains required; its live outcome is recorded
  on the PR. No local canonical full-suite, browser or accessibility pass is claimed here.

The user requested a PR, not merge or deployment. Performance/publication/recovery acceptance
remains open, including a fresh hosted candidate after performance acceptance, complete public
equality, durable backup/adoption and expired-artifact recovery. Physical measurement remains
explicitly skipped under the user's October 24 instruction; do not reopen phone troubleshooting.
Collection stays October 16 with null/unverified source coverage and the age>=7 Seoul-day warning.
TASK-010 still requires actual thirty-day reliability evidence.

## Evidence and reproduction

- [Original measurement](task-009-2026-10-27/baseline.json)
- [Intermediate measurement](task-009-2026-10-27/optimized.json)
- [Final measurement](task-009-2026-10-27/final.json)
- [Complete55-query parity](task-009-2026-10-27/parity-55.json)
- [Raw profile inventory](task-009-2026-10-27/raw-profile-inventory.json)
- Exact raw profiles, executed helpers and reports are retained locally; they are not published in this PR.

The local 196,503-byte archive contains28 diagnostic files and no source dataset/ZIP. Every original raw
profile and report is preserved byte-for-byte. Readable JSON summaries are formatted separately.
The baseline/final profile helpers differ only in formatting; independently formatting both
executed copies with Biome produces identical bytes. Final source bindings match current source.
CPU/allocation raw hashes and archive inventory are checked independently; sampling raw paths
describe this local workspace. The original and current detailed scorer remain semantically equal.

Run profile-compact-search.mjs with an existing verified site and a new report path. For the
55-query comparison, export src from 65cb9e6 into an isolated frozen source directory and pass
that directory to verify-compact-search-parity.mjs. Neither helper collects data, opens a map,
publishes files, emits a deployment receipt or changes source/recovery authority.

## Public evidence boundary

The user explicitly approved publishing code, tests and diagnostic summaries. Automatic approval
review separately rejected public upload of the opaque raw-profile archive. The PR therefore
contains readable measurement/parity summaries and the raw archive inventory/checksums, but no
raw archive or raw verification logs. All 28 exact diagnostic files and logs remain in the local
worktree. Independent review verified that local evidence before publication; its absence from
the public PR is not represented as a new performance or release acceptance result.
