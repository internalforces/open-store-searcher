# PR37 loader liveness review

Date: 2026-10-22

Verdict: **Approved for the bounded source/test correction.** No blocking or
non-blocking code findings. This is not final task acceptance or merge approval.

## Reviewed state

Base HEAD: `4c55774230707a0e0200c29a857f055d00c4774d`.

| File | SHA256 |
|---|---|
| `src/app/partition-loader.ts` | `88a8c509bc2c62cd2e9420966be9095e23c817edc4001e808fd125a3528503b0` |
| `src/app/partition-loader.test.tsx` | `63afc78613661f353d4e0857b83c0aa35e44b5fe9373f4600b6e95ef1e251ce1` |

I independently read the current files, frozen diff, diagnosis and RED/GREEN
logs, checked these hashes and inspected the architecture/decision wording.
I ran no tests, browsers or performance measurements and changed only this report.

## Assessment

The two sequential phases remain asynchronous. Each races one native animation
frame against a 35 ms timer; the first phase cannot release the loader. Its local
`advanced` guard is set before clearing both handles and scheduling the next
phase, so late or repeated losing callbacks cannot cancel the next phase's work.
The global `settled` guard prevents progress after resolution or abort. Pre-abort
allocates nothing; abort retains the original reason and cleanup removes both
pending handles and the listener. Normal completion performs the same cleanup.
Native scheduling callbacks are asynchronous; no new exception recovery or retry
policy is introduced.

The public API and `createPartitionLoader` implementation are unchanged: fixed
query-independent batches of at most two, ordered complete assembly, validation
boundaries, cancellation of obsolete work, failure propagation and retained-data
behavior remain intact. The patch changes neither UI/live-region/focus/Worker
code nor test deadlines, assertions, worker counts, retries or `failOnFlaky`.

The tests meaningfully cover missing outer, inner and both frame callbacks; no
release after only one phase; normal two-frame progress; both directions of
frame/timer loser delivery; repeated callbacks; phase-specific and pre-abort
reason/cleanup; and absence of early, duplicate or later-batch requests. Existing
batching, partial-snapshot, failure/retry and App retention tests remain. Removing
an over-specific abort listener-removal spy assertion is sound: native `once`
removes that listener on dispatch, while the tests retain behavioral cleanup and
late-callback assertions and the implementation explicitly cleans up.

## Verification evidence and limits

The final RED log against the original loader records 6 failures and 13 passes,
exit 1; the initial RED history is retained separately. GREEN records 19 loader
and 32 workspace tests passing, followed by typecheck and targeted lint/format,
exit 0. The archived GREEN production input exactly matches the frozen loader;
its test input differs only in formatter whitespace, applied before the logged
test execution. The current frozen test matches the supplied hash.

The architecture and decision edits accurately describe preferred frame
opportunities with task-based liveness, not certified physical paint or a
wall-clock bound. The locked Preact source independently confirms the nominal
35 ms precedent. In documentation, unchanged static asset identities should mean
managed data URLs/content; the application bundle will be regenerated.

The conditional normal-flow VoiceOver bridge in `pr37-loader-at-impact.md` still
applies after this final inspection: accepted-data search, inspection/return and
ordinary paging contracts are unchanged. Initial/loading transition timing is
not spoken-verified, and the actual human pending-refresh paging/range/heading
observation remains open. No AT waiver is inferred.

Focused unchanged startup/recovery browser results were pending at this review
cutoff. Fresh source-bound build/performance evidence, strict exact-head canonical
verification and fresh exact-head review remain required. Earlier hosted failures,
including the historical initial layout shift, remain part of the record; this
review does not claim their physical cause or a full CI pass. PG15, affected AT
and merge acceptance remain pending. No deployment or wider milestone gate closes.

## Final local evidence addendum — 2026-10-22

Scoped disposition: **Approved**, with no findings in the newly supplied browser
and performance evidence. The two reviewed source hashes above remain current.
This addendum supersedes only the earlier pending local-evidence statements.

The unchanged startup and failed-part recovery tests passed all eight cases across
Chromium, Firefox, WebKit and mobile Chromium on their first attempts, with no
retries, in 22.6 seconds. This focused run used four local workers; it is not the
canonical full browser suite. Its build/browser exit records are both 0.

The single recorded fresh performance `--check` invocation exited 0. Its public
raw report is byte-identical to the private captured output; Node
`assert.deepStrictEqual` confirms the parsed formatted view is identical.

| Report | SHA256 |
|---|---|
| `reports/performance-2026-10-22-pr37-paint-wait.json.raw` | `21d1a9ecec51c536d775e52b62858f3ac9c4f3b553a85252b81f94e21f4c7623` |
| `reports/performance-2026-10-22-pr37-paint-wait.json` | `16132ec84b8816a72c4e65980b86381212ef842a7e2cc520cb7d10419a038fc1` |

I independently traced all 20 startup observations and 30 workload samples into
their reported arrays, recalculated all 96 nearest-rank statistical summaries and
all 49 inclusive all-sample gates, and checked fixture hashes, complete candidate
counts and recorded page navigation. All pass. Both profiles, all three scales,
five repetitions, environment, methodology, limits and limitations match the
previous refresh report. No sample was discarded from an aggregate.

The conservative HTML/CSS/JS total is 93,525 bytes against 300,000. Observed maxima
are primary readiness 1,246.6 ms and LCP 1,172 ms against 2,500 ms, submit 252.4 ms
and page navigation 234.4 ms against 500 ms. `labTargetsMet` is true;
`productionVerified` remains false.

All 152 implementation bindings equal current files and the pre-run manifest.
Read-only direct hashing inside the existing runner independently confirms all
201 recorded code/test/config inputs and seven current build assets. Reported
asset bytes/hashes match those assets, including the regenerated
`index-CkTI7Y6B.js`; startup resource sizes match the reported outputs. All ten
historical reports match both their preservation manifest and base HEAD byte for
byte. The previous refresh report now has 150/152 current bindings, and remains
historical evidence without relabeling.

The decision wording now explicitly distinguishes unchanged managed data
URLs/content from regenerated bundle bytes. The final code inspection preserves
the conditional normal-flow AT bridge. It supplies no actual speech observation
for changed loading timing or pending-refresh paging. Fresh exact-head canonical
verification/review, PG15 and affected actual AT remain pending; merge remains
withheld. Historical failures and wider acceptance boundaries are unchanged.
