# PR #37 animation baseline scoped review

Date: 2026-10-22
Base HEAD: `b3d1033e5436893931ef17c08dde9a2e626fe6e2`
Scope: Only the new `tests/e2e/workspace.spec.ts` baseline correction over that head.
Reviewed SHA-256: `314cc0f8f447a411a59f3ac34f1a3d653e2b64cef633aef9b40af9f1385a0270`
Previous SHA-256: `718699118bf89b69f23e47fbc85e34870c16a2c40701eac8a05ddf645eb98433`
Verdict: **Approved for this bounded test correction.**
Findings: **0 Critical, 0 Important, 0 Minor.**

## Correctness and assertion preservation

The hosted b3 diagnostic established the missing precondition for this particular failure:
accepted-underline started before the count baseline, while the first detail-rim start arrived
after it and before the post-midnight/focus checkpoints. Both related effects started exactly
once and the recorder dropped no events. That explains the observed count 1 to 2 without
establishing a duplicate replay, a physical scheduler cause or a general product-remount result.

The patch supplies an authoritative test ledger independent of optional diagnostic hooks. It
installs the listener before search/inspection and verifies both target spans are absent before
those actions. It saves the actual native DOM nodes, records animation names with event.target
references, and requires exactly one accepted-underline and one detail-rim on those saved nodes,
zero related starts on any other node, and unchanged current identities. The cumulative ledger
has no cap, truncation or reset; a duplicate cannot be discarded to obtain a passing baseline.

The condition uses the existing assertion timeout rather than an extra fixed delay or waiting
for animation completion. Existing immediate-content, 250ms, geometry and zero non-input
LayoutShift checks remain. Geometry and zero-shift checks are repeated after the added wait.
The final synchronous browser evaluation then rechecks the complete exact-once ledger and
current node identities while reading the original unfiltered global counter. No animation
callback can interleave between those synchronous reads, so the poll-to-baseline gap cannot
absorb a duplicate start unnoticed.

The original 61-second advancement, focus dispatch and unchanged-global-counter requirement
remain; an additional saved-node equality check rejects remounts across that interval. The
global counter is not narrowed to the two named effects. Initial zero-shift, resource-origin,
request-list, URL, storage/cookie and no-prefetch/image assertions are retained. No CSS,
product behavior, timeout, worker, retry or failOnFlaky policy is changed.

## Verification consumed

Independently inspected the complete diff, original saved file, final source/proof hashes,
static/collection records, final focused runtime log/exit and stage preservation proof.
The exact final hash passes typecheck, targeted lint/format and collection of the unchanged
92-case inventory. Its own focused runtime run exits 0 with all four configured engines
(Chromium, mobile Chromium, Firefox and WebKit) passing on their first attempts, with no
retries, in 9.9 seconds using four effective local workers. This also validates the native
pseudo-element target assumptions across those engines. The earlier pre-atomic four-case
pass is separate historical evidence and is not substituted for this final-hash run.

Final focused-run log SHA-256:
`cc7df5535e0c26fd49adf4160ba46023792901aa2484a35cc62709867f3b816e`.
Final static/collection log SHA-256:
`67364cf6c55a3479820d2702762e33d219d39c6f303e4be842a0a3d9184ed2b9`.

All 152 current performance source bindings still match current files. The seven existing
production assets match the retained stage proof; no build or performance measurement was
repeated. The older pre-refresh-fix report remains historical at 150/152, differing in App and
its workspace component test. This E2E-only change does not rebind or alter either report.

## Limits and remaining gates

This approval repairs the replay test's underspecified baseline. It does not attribute or
resolve the older hosted initial no-input LayoutShift value 0.028657389322916667 or the earlier
WebKit initial-fetch/recovery failures. Those outcomes remain preserved; their absence in the
latest diagnostic does not prove an external or harmless cause. The zero-shift oracle remains
strict and will still reject a recurrence within its observation window.

The b3 canonical run remains a failure under failOnFlaky despite its built-in retry passing.
A focused four-case local pass is not a full CI pass. Delivery requires canonical full CI and
GitHub review on the new exact committed head, original review-thread resolution and normal
protected integration checks. Affected pending-refresh human AT remains unverified. PG-15,
final TASK-027 acceptance and merge remain open; no deployment or other task/milestone gate is
closed here. No tests were run by this reviewer. Only this private report was written; no
source, public document, remote state or handbook was changed or accessed.
