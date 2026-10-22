<!--
Purpose:        Record the captured loader wait and source-bound cancellable liveness correction
Owner:          Debugger / Tester / Coordinator
Update Trigger: When final measurement, review or exact-head verification changes
Harness Version: 1.1
-->

# PR37 Loader Frame-Wait Correction

Date: 2026-10-22
Base: `4c55774230707a0e0200c29a857f055d00c4774d`
Status: Local code, focused checks and fresh performance pass; canonical CI remains separate.
Requirements: TASK027 PG-10/15, supporting accessibility/performance NFRs; fixed complete-data loading.

## Captured cause boundary

[Verify39795194051](https://github.com/internalforces/open-store-searcher/actions/runs/39795194051)
fails91browserpass/1flaky WebKit startup after successful static checks and1,425unit tests.
All four corrected decoration cases pass first attempts. The failed observation maps exactly
to the delivered partition-loader: an outer frame fires, then the inner callback is scheduled
but does not fire before the existing5s assertion; no fetch begins. Buffers have0drops and
recorded visibility/focus remain visible/true. See the [complete observation record](test-2026-10-22-pr37-ci-observation.md).

The function has no completion path except that second callback or abort. This establishes
the frame-notification dependency at this failed boundary, not why WebKit delayed it, whether
it would eventually fire, or a browser/GPU/OS root cause. The earlier initial non-input
CLS0.028657389322916667 remains a distinct unattributed observation.

## Minimal production correction

`afterShellPaint` keeps two sequential preferred native frame opportunities, each raced with
a cancellable35ms task timer. This nominal delay matches locked Preact10.29.8's existing effect
scheduler fallback; it is not derived from the5s assertion or a changed budget. Each phase
advances once and cleans both handles before the next phase. Only the second phase resolves.
Global settlement/abort guards ignore late/repeated losing callbacks, detach the listener,
and preserve the original abort reason. Pre-abort schedules no work.

Timers allow progress when browser tasks resume. Neither the timer nor two frame callbacks
certify physical paint or a wall-clock deadline. Architecture/decision records now state this
honestly. The loader API, fixed two-request batches/order, query-independent data URLs/content,
complete-snapshot assembly/validation, retry and accepted-data retention remain unchanged.
The publication loader shares this gate; its transport/schema and the compact Worker are
unchanged. No source publication, dependency, workflow, deadline, retry/flaky policy or budget
change follows. The application JS/index regenerate; data/Worker/CSS assets remain unchanged.

## Regression and focused verification

Implementation uses the user's TASK027-specific GPT-6.1 Sol/high choice.
The final deterministic RED on original source is6fail/13pass, exit1; GREEN is19/19, exit0.
An earlier RED with an overly specific explicit-listener-removal spy assertion is retained
separately; native once-removal satisfies cancellation and that assertion was removed.
Final RED still reproduces missing-frame progress and late-callback cleanup failures.

Exact cases include:

- `completes two deferred phases when outer frame callbacks are withheld`
- `completes two deferred phases when inner frame callbacks are withheld`
- `completes two deferred phases when both frame callbacks are withheld`
- `keeps one fixed batch when a timer wins and cancelled frame callbacks arrive late`
- `cancels deferred work with the original reason when aborted in pre-abort`,
  `outer` and `inner` parameter states.

The original normal-two-frame, batching, malformed/duplicate data, failure/retry, no-partial
search and retained-data cases remain. New cases assert no premature or duplicated batch,
single settlement, original abort identity, no residual frame/timer work and inert late
cancelled frame/timer callbacks.

Pinned Node24.19.0/npm11.17.0: focused partition19 + existing workspace32 pass51/51; typecheck,
targeted lint/format and whitespace checks exit0. One fresh E2E build succeeds. The unchanged
`loads built data parts after shell paint in bounded query-independent batches` and
`retries a failed built data part without exposing a partial searchable snapshot` pass across
all four configured projects:8/8 first attempts, no retries,22.6s. Original assertions,5s
deadlines and all runner policies remain; this focused run is not canonical full CI.

Clean focused unit command in the existing pinned runner:

```sh
./node_modules/.bin/vitest run --project=component src/app/partition-loader.test.tsx src/app/workspace.test.tsx
```

Source SHA-256:

| File | SHA-256 |
|---|---|
| partition-loader.ts | `88a8c509bc2c62cd2e9420966be9095e23c817edc4001e808fd125a3528503b0` |
| partition-loader.test.tsx | `63afc78613661f353d4e0857b83c0aa35e44b5fe9373f4600b6e95ef1e251ce1` |

Exact commands, RED/GREEN logs/exits, both RED preparations, source diff, controlled-callback
proof,201-input runner audit and fresh build/browser evidence are retained under the task's
private evidence directory. No passing sample erases the original hosted failures.

## Measurement, review and actual AT

The earlier refresh performance report now retains150/152 matching inputs; its two loader
bindings are historical. One fresh unchanged-profile/repetition/budget
[measurement](performance-2026-10-22-pr37-paint-wait.json) exits0 and passes all49 inclusive gates:
initial93,525B; maximum primary1246.6ms/LCP1172ms/submit252.4ms/page234.4ms.
All152 final source bindings and7 current assets match; all10 earlier performance files remain
byte-preserved. Raw/view parse equally; rawSHA256
`21d1a9ecec51c536d775e52b62858f3ac9c4f3b553a85252b81f94e21f4c7623`,
viewSHA256 `16132ec84b8816a72c4e65980b86381212ef842a7e2cc520cb7d10419a038fc1`.
All raw samples are retained; no retry/discard or new measurement is added.
This is synthetic lab evidence, productionVerified=false.

Independent [source/test/performance review](review-2026-10-22-pr37-load-liveness.md) is
Approved with no findings. The reviewer recomputes all96 summaries/49inclusive gates and checks
strict Node raw/view equality, public/private raw identity,201 runner inputs/seven assets,
all152 final source bindings and10 preserved old reports. Exact-head canonical CI/completed
GitHub review remain delivery checks; live PR37 records the final pushed identity and result.

The prior normal accepted-data search/detail-return/paging VoiceOver observations carry
forward only through the conditional unchanged-behavior bridge and final source review.
They do not verify spoken loading/ready/failure/retry/cancellation under the new scheduling
path. Pending-refresh page/range/heading actual AT remains required; the human cannot enable
VoiceOver now. No AT waiver, final task acceptance, thread resolution, main merge, deployment
or TASK028 activation is inferred.
