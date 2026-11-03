# PR45 native-column verification — 2026-11-03

## Outcome and exact delivery

Product commit `3c65585025405d6ef3550d7ed89d4b63fef2266c` passes the unchanged
complete-source performance budget and all ordinary canonical checks in
[Verify41566322384](https://github.com/internalforces/open-store-searcher/actions/runs/41566322384).
No main merge, production deployment, durable backup/recovery or whole-task closure
has occurred. Requirements: FR-02/03/07/08/12/13/14 and search-performance NFRs.

| Canonical check | Actual result |
|---|---|
| Unit, pipeline and component tests | 1,473 passed |
| Browser tests | 92 passed |
| Accessibility tests | 20 passed |
| Packaging/operator/admission checks | 102 + 9 passed |
| Complete-source desktop/mobile, cold/warm | All 60 observations passed, 112.4–283.9 ms |
| Initial code | 121,505 bytes |
| Primary content | 19.4–169.9 ms |
| Complete searchable readiness | 44.6–49.2 seconds |

The report has zero assessment failures, browser errors or query-time requests;
every expected candidate count and result layout passes. Actual tested checkout
`a5e910c77e86a896786ea3bae30ccc9121c85f3f` is GitHub's PR merge revision.
All 196 source/test/operator byte bindings match the delivered implementation.
Raw report SHA-256: `e8b41ba064960bcde59149c5c7b3240917db5943befc7c6ef9ca2ef62c380c07`.

## Complete-source correctness

The adopted source ZIP and observation were redownloaded with their exact approved
SHA-256 values. Current-code local reconstruction validates all 195 categories and
2,951,024 records. Data identity remains manifest
`1f5ec4815d7412021ee9b7a6703ee8c3141ab853479413e5d7d1ea9f2f7f06c1`, source archive
`c90758c2d3922e78d636ab2c9967b80c690bdcd8aeca283cf9f6ecc2cc992352`, collection
2026-10-16T01:52:52.043Z and unverified source coverage. Static safety/date policy
and the collection-age warning remain unchanged.

All 56 frozen-main/current queries preserve complete eligible/similar ordinal
vectors, counts and every field on first/middle/last pages. All eight current module
bindings match. Parity receipt SHA-256:
`3a3122b65094a85f06815dcd4f6d052cc7932ddeef182d116f953e63eda63aea`.

A separate full-source native-column round trip compares every one of 7,958,240
converted strings across 973 columns, including all 2,951,024 IDs, directly against
the original compact columns. Every value agrees. Receipt SHA-256:
`1b4d10ae9de122261c296a9437610edee807a3b9e3cc024d4abfa5c75cb88840`.

Independent review has no blockers: 60 focused tests, 514 randomized exact string
round trips and a frozen-input cancellation/retry comparison of 693 values and 33
ordered paginated records pass. The complete local search/shared suite has 188 passes.
Native storage preserves exact UTF-16 and chooses Latin-1 only where lossless; null
and businessTypes remain unchanged. Network JSON validation still requires arrays.

## Memory trade-off and retained limits

| Separate offline retained-size diagnostic | Before | After |
|---|---:|---:|
| Managed heap bytes | 1,110,743,736 | 622,057,056 |
| ArrayBuffer bytes | 357,781,983 | 671,619,547 |
| Process RSS bytes | 2,116,362,240 | 2,357,379,072 |

Native string storage accounts for 313,835,940 bytes. Explicit GC is used only in
this separate retained-size diagnostic. The managed heap decreases while native
buffers and sampled RSS increase; no total-memory, peak-memory or causal timing
improvement is inferred. Canonical browser sampled RSS spans 2.64–3.81 GiB, not a
continuous maximum. Physical-device testing remains user-skipped and Worker CPU
throttle coverage is unverified. Complete readiness remains a material limitation.

Local full coverage has 1,471 passes and two unchanged Debian `/usr/bin/unzip`
integration failures. Actual Ubuntu CI passes all 1,473. Local browser installation
and launch fail respectively on unavailable download content and socket policy;
neither is represented as a product/browser pass. No test, sample or threshold is
removed. Every earlier failed hosted observation remains retained, including the
prior d383401 mobile district 538.8/554.9 ms results.

## Integration and remaining work

Automatic approval review rejected the attempted Draft release, citing retained
Draft intent and missing explicit authorization. Later GitHub readback shows a
ready_for_review event attributed to internalforces at 2026-11-03T02:46:40Z; its
execution origin is unknown. No successful agent transition or merge authorization
is inferred. Main integration is held for explicit user approval, without an
alternate merge route.

The optional existing validation-site snapshot read was stopped when integration
was blocked. Exactly 476 of 723 compact files (453,360,322 bytes) match the trusted
manifest; this is partial evidence, not complete public equality or a new deployment.
Pages settings/workflow dispatch are absent from connected tools, and the inspected
cloud browser is signed out. Publication, complete public equality, durable backup
and recovery remain open. TASK-010 still needs its separate actual 30-day interval.

This evidence branch records results without changing the already verified PR45
product head or weakening any check. Raw source, logs and diagnostic receipts remain
outside the published change. The live PR description also records current outcomes.
