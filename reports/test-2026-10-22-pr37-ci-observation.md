<!--
Purpose:        Preserve repeated CI failures and scope the hosted failure-timeline observation
Owner:          Debugger / Tester / Coordinator
Update Trigger: When observation review, exact-head CI or root-cause evidence changes
Harness Version: 1.1
-->

# PR37 CI Failure Observation

Date: 2026-10-22
Application source checkpoint: `5524090793ffcffcabc8d81dc2925ea0a42d7fe5`
Status: Independently Approved for intentional hosted observation only; CI cause unresolved.

## Failed canonical observations

[Verify39778033230](https://github.com/internalforces/open-store-searcher/actions/runs/39778033230)
on the checkpoint above fails twice under the unchanged normal two-worker profile and
fail-on-flaky policy. Both attempts pass static checks,59files/1,425tests, coverage
93.92/92.59/96.47/95.60, quality and build. Accessibility/packaging stages are not reached.

| Attempt | Job | Browser result and original failure |
|---|---|---|
|1|119821864391|91pass/1flaky: WebKit `loads built data parts after shell paint in bounded query-independent batches` receives0of2requests within5s; built-inretry passes.|
|2|119835178890|89pass/3flaky: same startup failure; WebKit `retries a failed built data part without exposing a partial searchable snapshot` keeps submit disabled; Chromium `decoration preserves immediate content, stable geometry and resource boundaries` records initial layoutshift0.028657389322916667 instead of[]. All pass only on built-inretry.|

Further unchanged canonical reruns stop. This is a previously observed nondeterministic startup
failure with unresolved cause, not a proven main/external failure. The busy correction is not
rendered before the first accepted dataset/search result. Earlier TASK027 evidence contains a
similar startup failure, but predates only that correction and does not exclude the redesign.
No timeout, retry, assertion, worker, flaky policy or performance budget is relaxed.

## Bounded local diagnosis

One instrumented isolated startup test passes first attempt/effective1worker; three predetermined
cold startup/map pairs pass all6 first attempts/effective2workers. Original test/hooks/helpers
are retained; measured frame waits are longer under the paired workload, but no5s failure is
captured. Three earlier collection failures caused by the private hook interceptor are retained
separately; no browser ran in those failed preparations. The interceptor was removed and exact
collection verified before the three actual samples. No successful sample erases a failure.

One private full-equivalent92test/four-project/two-worker browser-stage diagnosis exits1 with
91pass/1flaky. All three WebKit targets pass first attempt. Chromium's decoration test fails at a
later animation-count boundary (baseline1/end2), then passes its built-inretry. Its initial
no-input layoutshift assertion passes. Observed shifts have recent input and do not attribute
the hosted initial0.028657 failure. The rich observations cannot establish actual replay/remount;
a delayed first legitimate accepted/detail animation event is a hypothesis. Mocked-clock DOM
phases, native LayoutShift startTime and native animation elapsedTime are distinct clock domains.

The independent assessment recommends capturing the actual failing host boundary before any
production fix or test-baseline change. Keep strict initial zero-shift and zero-replay criteria;
do not add thresholds, filters or wait out decoration. Original failures, attempts, bounded
sample counts and private timelines remain preserved.

## Intentional test-only observation

Only `tests/setup/failure-observation.ts` and ordinary hooks/passive additions in the existing
search/workspace specs change. WebKit observation targets only the startup, failed-part recovery
and keyboard map cases. Chromium observation targets only the existing decoration case.

- Record native frame/timer schedule/fire/cancel, known local demo fetch/request/response/finish,
  shell/readiness booleans, visibility/focus and popup open/close without URL payloads.
- Capture rich sources/rectangles from the existing LayoutShift callback and native animation
  names/pseudo-elements/target identities/event order. Mark existing counter evaluations without
  new await, readiness polling or clock changes.
- Print bounded Node JSON only after a failed/unexpected attempt. Limit browser events128,
  host events64, shifts16/five sources each and animation events64; retain drop counts. No query,
  input/text, business/address, DOM ID, provider path, full URL or browser console/error payload.
- Preserve native arguments/this/return values/IDs/cancellation and string timer handlers.
  Chromium decoration has no frame/timer wrappers. No product, workflow, dependency or runner
  configuration changes. The original assertions, clock actions and evaluation counts remain.

Listeners, stack inspection and wrappers can perturb timing. A passing concurrent map test is
silent, so its own popup timeline is absent; no cross-worker popup causality is inferred. A
closed page may yield unavailable browser state, and capped buffers may lose middle events.
The observation is diagnostic, not a repair or acceptance result.

## Preparation verification and source scope

Pinned Node24.19.0/npm11.17.0/Biome2.5.9: typecheck, targeted lint/format, exact92test collection
and whitespace checks pass. Inverse removal of the diagnostic additions restores the original
spec bytes and preserves all hooks/helpers. These are static/collection checks. Subsequent narrow runtime evidence is recorded below;
no full browser-suite or acceptance pass follows.

One `build:e2e` produces all7 production assets byte-equal. All152 inputs in the
[current performance report](performance-2026-10-22-pr37-refresh.json) still match current files;
the new E2E/helper paths are outside that measured-input manifest and production bundle graph.
The older pre-busy-correction manifest remains150/152. No measurement or historical report is
rebound, overwritten or rerun. The [busy-fix evidence](test-2026-10-22-pr37-refresh.md) and scoped
performance approval retain their original scope.

## Narrow observation review and runtime evidence

Independent Sol/xhigh [review](review-2026-10-22-pr37-ci-observation.md) approves intentional
hosted failure observation only. Its P2 (diagnostic exception could skip original shift entries)
is addressed by running the original filter/push first and containing each optional observation;
all checkpoint observations are contained before the unchanged return/focus action. Its Minor
stack-filter mismatch is addressed by safe candidate parsing and exact local origin/path checks.

Two private smoke commands retain all original outcomes and built-in retries:

- The two-mode command exits1: Chromium clock/decoration passes, including deliberate optional
  layout/lookup/mark failures that preserve shifts[0.1,0.2], counter returns7 and focus dispatch.
  WebKit native this/extra-args/IDs/cancel/string-handler/fetch-Promise/init/snapshot/report checks
  execute successfully, then a synthetic Function sourceURL positive assertion fails on both
  attempts. No real local frame was captured by that unsupported probe assumption.
- The replacement WebKit-only command exits1: a real local script frame is captured and a real
  localhost-origin mismatch executes the wrapper while yielding no accepted site. A subsequent
  query-bearing identical-script provenance assertion fails on both attempts; wrong-path/final
  checks are not reached. Do not call either WebKit smoke command a clean pass.

The reviewer judges this adequate for the emitted-data contract: the parser rejects candidate
frames containing query/hash/credentials, and output contains only sanitized allowlisted local
paths, never query/full URL/provider data. The query-probe result is consistent with WebKit omitting or reusing a source location
for identical code; these observations do not distinguish those hypotheses. Sites are advisory,
not proof that the original resource URL had no query or that a frame identifies a unique request.
Both failed commands and their traces remain preserved. No further probe or speculative parser
change is required for this limited diagnostic use.

Frozen source SHA256:

- `tests/setup/failure-observation.ts`: `fa5bdc6dde61a44a30bd4a7fa7e08b9535eefa95a614d40c264051e4dcee8ab4`.
- `tests/e2e/search.spec.ts`: `32615857347df969d9fc4bf9ab264ce4ae6f7850920a469fcdf6be68457c05dc`.
- `tests/e2e/workspace.spec.ts`: `718699118bf89b69f23e47fbc85e34870c16a2c40701eac8a05ddf645eb98433`.

## Acceptance and integration gates

Independent observation review is Approved. One intentional hosted execution of the diagnostic
head may capture the boundary; the live PR records that exact delivery SHA and outcome. It is not another blind rerun of the unchanged failed head. Diagnose
its evidence and repair only the supported cause; no CI success or final acceptance is claimed.

TASK027 remains active. Actual affected pending-refresh VoiceOver is unperformed because the
human cannot restart it now; prior ordinary-flow AT carries forward only through the reviewed
bridge. The user selected actual verification before merge. Original settings remain restored,
owned QA tab/server stopped. Final actual AT, independent acceptance, exact-head canonical CI,
GitHub review and protected-main/conversation checks remain before the authorized merge.
TASK028 remains proposed/unactivated; no deployment or operational/release gate closes.
