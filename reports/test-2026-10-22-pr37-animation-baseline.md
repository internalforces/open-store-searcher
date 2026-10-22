<!--
Purpose:        Record the source-bound correction of the decoration test's start precondition
Owner:          Debugger / Tester / Coordinator
Update Trigger: When exact-head CI or remaining acceptance evidence changes
Harness Version: 1.1
-->

# PR37 Animation Start Baseline Correction

Date: 2026-10-22
Base: `b3d1033e5436893931ef17c08dde9a2e626fe6e2`
Status: Local scoped correction and independent review pass; exact-head full CI remains separate.
Requirements: TASK027 PG-10/15, supporting accessibility/performance NFRs.

## Trigger and correction

The [hosted observation](test-2026-10-22-pr37-ci-observation.md) captures the original
`decoration preserves immediate content, stable geometry and resource boundaries` failure:
global count1 becomes2 because the first recorded detail-rim start arrives after the baseline.
Shared event order supports this attribution; it does not establish why delivery was deferred,
snapshot detail identity at the old baseline, or prove a scheduler/product-remount cause.

Only this existing E2E case changes. A separate native ledger, installed before the target spans
exist and before actions, retains names and actual target references without reset/truncation.
Default5s polling requires exactly one accepted-underline and one detail-rim on the saved current
nodes, with no other related starts. It waits for starts, not effect completion.

The original immediate content,250ms geometry/zero non-input shifts, unfiltered global animation
counter,61s/focus, resource, URL and storage checks remain. Geometry/shifts are rechecked after
polling. The same synchronous evaluation rechecks exact ledger/node state and samples the global
counter, preventing a duplicate between polling and baseline from being absorbed. The original
global count must remain unchanged after61s/focus; the saved nodes must also remain current.
No production code, dependency, timeout, retry, worker, failOnFlaky or performance budget changes.

## Validation

Final E2E source SHA-256:
`314cc0f8f447a411a59f3ac34f1a3d653e2b64cef633aef9b40af9f1385a0270`.

Pinned existing Node24.19.0/npm11.17.0 runtime:

```sh
npm run typecheck
./node_modules/.bin/biome lint --error-on-warnings tests/e2e/workspace.spec.ts
./node_modules/.bin/biome format tests/e2e/workspace.spec.ts
./node_modules/.bin/playwright test tests/e2e/smoke.spec.ts tests/e2e/search.spec.ts tests/e2e/workspace.spec.ts --project=chromium --project=firefox --project=webkit --project=mobile-chromium --list
```

All exit0; unchanged inventory92. Final focused command:

```sh
docker exec -w /work/pr37-refresh-fix open-store-searcher-task008-research ./node_modules/.bin/playwright test --config .superpowers/sdd/2026-10-22-task-027-prism-glass/pr37-animation-baseline/playwright.config.ts tests/e2e/workspace.spec.ts --grep 'decoration preserves immediate content, stable geometry and resource boundaries'
```

Exit0: all four configured projects pass first attempts, no retries,9.9s with four effective local
workers. Native target/name assertions therefore execute in Chromium, mobile Chromium, Firefox
and WebKit. The private config inherits all existing devices/policies; only paths/output/cwd
relocate and preview serves the already verified assets without rebuilding. Hosted two-worker
policy is untouched. This focused pass is not canonical full CI.

The first pre-atomic implementation separately passes4/4 in10.2s. Its source/results are retained
as historical evidence; the necessary final-hash repeat above follows the atomic snapshot fix.
An initial anchored collection command matched0 tests; its log is preserved, then corrected
collection lists the four intended cases before runtime. No failed preparation is relabeled.

The original counter setup,250ms oracle and61s/focus blocks remain byte-for-byte substrings;
source outside this case matches the base. All152 current performance input hashes and all7
existing built assets still match. No build, full suite or performance measurement was repeated
locally. Raw proof, source snapshots, diff, config, logs/exits and result archive are retained
in the task's private evidence directory.

## Review and remaining gates

Independent GPT-6.1 Sol/xhigh [review](review-2026-10-22-pr37-animation-baseline.md) is Approved,
with0 Critical/Important/Minor findings, for the exact final source above. The implementation
uses the user's TASK027-specific GPT-6.1 Sol/high choice.

The earlier hosted initial non-input CLS0.028657389322916667 and WebKit initial-fetch/recovery
failures remain unresolved historical risks. This repair addresses the captured counter failure
only. Prior failures/retries remain preserved; unchanged strict assertions reject recurrence.
Canonical full CI and completed GitHub review must bind the new pushed head; live PR37 records
those final identities/results. No success is inferred before readback.

Affected pending-refresh actual VoiceOver remains unperformed because the human cannot enable
it now. Their explicit actual-verification-before-merge condition remains. TASK027 stays active,
TASK028 proposed/unactivated; no final acceptance, thread resolution, main merge or deployment.
