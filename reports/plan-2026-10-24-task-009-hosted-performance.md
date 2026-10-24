<!--
Purpose:        Bind the read-only full-source hosted diagnostic and actual Android connection boundary
Owner:          Implementer / Performance Engineer
Update Trigger: When diagnostic code, hosted results or physical-device access changes
Harness Version: 1.1
-->

# TASK-009 hosted performance continuation — 2026-10-24

The user requests resolving access blockers and completing the active task, and reports a
Galaxy Z Flip7 connected to the Mac. That model is user-reported; no actual Android device
connection or physical performance result has been verified. Local ADB is absent. Chrome
internal-page automation was explicitly rejected by browser URL policy; do not use an alternate
surface, raw CDP or indirect execution to circumvent that denial. The user must perform the
phone's USB-debugging authorization and Chrome device-recognition steps directly. This is
separate from the controlled isolated browser tests below.

Requirements: FR-02/03/08/12/13/14, performance NFR and the existing pre-publication acceptance.
TASK-009 remains the sole active task; TASK-028 stays paused and TASK-010 sequential.

## Bounded implementation

The existing Ubuntu24.04 Verify workflow gains a read-only diagnostic job restricted to this
TASK-009 feature-branch prefix. It uses the existing pinned actions, Node24.19.0/npm11.17.0,
Playwright and approved retained-source registry. Source assets are downloaded and freshly
verified by the existing production adapter, then the existing local-proof importer parses,
validates, builds and packages the complete retained source. This is not a hosted publication
candidate and supplies no source, deployment or recovery authority. No public descriptor or
publication flag is changed. No new dependency, service or permission is added.

After extracting only that locally generated trusted tar, the runner verifies every site file
and the exact preparation/source/code identity. Its private inventory-only loopback server
does not log requests, queries or behavior. The isolated Playwright Chromium instance is owned
by this hosted test; it does not attach to the user's Chrome or connected phone.

One controlled cold/warm observation is recorded for desktop and a Pixel5 viewport with
main-thread CPU rate4. Three repetitions of each fixed broad-district, partial-address and
absent fixture retain all counts and individual timing observations. Missing cells, wrong
source/record counts, hidden or unrendered results, query-time requests, censored readiness and
over-budget samples cannot pass. All failures remain in the uploaded diagnostic report.

Evidence records visible heading/input, separate complete readiness, pre-interaction observed
LCP, submit-through-two-frame/layout endpoints, code size and sampled RSS of CDP-reported Linux
browser processes. The site inventory is checked again after measurement. Missing physical,
Pages delivery, Worker throttling coverage, continuous peak memory and percentile evidence
remain explicit; a diagnostic pass cannot authorize publication or close the task.

## Verification checkpoint

Test-first behavior proof: interface-only implementation yields two assertion failures; after
implementation all four evidence-admission/resource tests pass. A further contradictory-repeat
regression fails before its fix, then passes. The new tests plus all existing workflow tests
pass20/20 on local Node22.22.3. Scoped Biome and syntax/whitespace checks pass. This is local
compatibility evidence only; supported full CI and actual hosted diagnostic execution remain
required. No local server/phone bypass or unsupported full-verification pass is claimed.

The complete local Vitest compatibility run records1,432passed/4failed across59files. All four
failures remain visible: recovery-archive's actual GNU-tar round trip; unzip-archive's UTF-8
DOS-origin filename and valid-local-archive cases; and transform-license-records' pinned
runtime/Unicode boundary (actual Node22.22.3 instead of required24.19.0). No assertion is changed
or skipped. The approved Ubuntu runtime remains the canonical verification environment.

Review focus: actual preparation path/identity and immutable registry reuse; clean Git SHA in
the PR-run local proof; all complete data before search; no filtered/capped candidate acceptance;
correct Playwright wait argument ordering; all repetition outcomes and missing/error cells;
cache conditions and instrumentation overhead; least-privilege branch-only job with no deploy
step; accurate separation of diagnostic, physical-device and release acceptance.

Next: independent whole-change review and exact-head Ubuntu execution. Continue physical-device
verification only after a permitted, user-authorized connection is available. Keep the existing
performance-before-publication, complete public equality and durable backup/recovery gates.

## Independent review and one fix pass

The independent whole-change review requested changes for four Important findings: caught
post-search errors could pass, raw repetitions were optional, application files were not bound
to the prepared complete inventory, and an interrupted fixture discarded completed repetitions.
Four dedicated regressions first fail (4failed/4passed), then all8tests pass after one fix pass.
Error-bearing cells now reject; three raw outcomes are mandatory; the complete canonical inventory
must match preparation length/SHA-256 before browser startup; and each repetition is attached
before the next begins, retaining failed ordinal and earlier observations. An unavailable RSS
sample becomes an explicit error, and the overall diagnostic summary includes every failure.
No independent post-fix re-review is claimed. Supported final-head CI remains required.

The reviewer declined to certify actual execution, cache effectiveness, instrumentation overhead,
performance/memory outcomes, physical-phone connectivity, publication/recovery and supported
full verification. These remain unresolved evidence, rather than accepted exceptions. Measured
results must keep those limits explicit; no physical or publication gate is closed by this code.
