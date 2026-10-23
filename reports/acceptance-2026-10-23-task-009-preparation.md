<!--
Purpose:        Record successful hosted real-source preparation and the remaining first-publication boundary
Owner:          Release Manager / Tester / Reviewer
Update Trigger: When candidate identity, performance acceptance, publication or recovery state changes
Harness Version: 1.1
-->

# TASK-009 hosted preparation acceptance — 2026-10-23

**Bounded result: actual-source preparation succeeded; TASK-009 and TASK-010 remain incomplete.**
The user authorized prerequisite resolution and real-data connection, then approved the exact
browser-extension local-file permission. Source publication and reviewed runtime adoption are
complete through [PR39](https://github.com/internalforces/open-store-searcher/pull/39), merged at
`bc7c3d3a43580084e6a1c7f3684c48b84cf802ca`. TASK-009 is the sole active task, TASK-028 is
paused with its retained acceptance gaps, and TASK-010 follows sequentially. This checkpoint
does not introduce a performance exception or mark an unperformed criterion passed.

## Executed hosted preparation

[Initial-import run39888491724](https://github.com/internalforces/open-store-searcher/actions/runs/39888491724),
attempt1, ran on that exact clean current-main commit. Prepare job120202265194 completed/success;
deploy job120208566175 completed/skipped because publication was disabled. The workflow's own
full verification and operator checks passed before the actual source import. Main push
[Verify39888449925](https://github.com/internalforces/open-store-searcher/actions/runs/39888449925)
also completed/success at the same main SHA. PR-head Verify39888022420 and complete-source-byte
run39888017380 passed before protected merge; all five automated review threads were resolved.

Actual source authority is Release421355167, tag `initial-source-seoul-2026-10-16` pointing to
`cd16e7c4dd84d6c8520399f3a7ffb72cc88f167a`, archive asset667614415 and observation667616298.
The production downloader rechecked complete lengths/hashes and Release/tag metadata. Production
staging parsed all195categories and admitted exactly2,951,024rows against the unchanged approved
initial baseline and quality policy. The builder, complete publication-directory verifier, tar
packager and archive/inventory checker succeeded. The binder rehashed the original tar after
upload and validated metadata before exposing the same-run scalar.

Collection remains `2026-10-16T01:52:52.043Z`; source coverage remains null/unverified. Import,
build and upload clocks do not refresh it. Age>=7Seoul-calendar-day warning behavior applies
from October23. No production-browser warning rendering or physical-device measurement is
claimed from this pipeline success.

| Executed check | Result |
| --- | --- |
| Vitest | 59files /1,432tests passed |
| Four-browser E2E | 92passed |
| Accessibility | 20passed |
| Node operators/packaging | 102passed,0failed |
| Coverage | 93.93% statements,92.62% branches,96.48% functions,95.62% lines |
| Hosted operator identity | Clean bc7c3d3 / run39888491724 /185exact code bindings |
| Source staging | 195categories /2,951,024rows; approved baseline/quality retained |
| Public precondition | Direct404/null before and after preparation |
| Publication | Skipped; no public deployment success claimed |

The approved configuration bytes are unchanged: production config403224bytes/SHA-256
`b7a64b46c49ad6d3ab10ba268becb6e62bb666d342bc4aa158898a37ac1e20ba`; validation config403320bytes/
`f3feafd8d37d30e859b7797fe753277d2091cb7383009e035dff60edb76987f1`. These actual bindings occur
in the logged operator identity, not just in a local configuration read.

## Exact candidate packet

Prepared at `2026-10-23T02:35:18.721Z`; expires exactly `2026-10-24T02:35:18.721Z`
(October24 11:35:18.721 Asia/Seoul). The prepared run cannot later acquire a skipped deployment
by changing a variable. Any eventual publication requires a new current-main run and its fresh
candidate review under the approved workflow.

| Binding | Bytes or ID | SHA-256 |
| --- | ---: | --- |
| Raw original tar | 691,824,640bytes | `67c29ff7ca453b2f4bc50f5372409e7f00c17cfa9e19924672de09c15da6ab8f` |
| Canonical inventory JSON | 140,218bytes | `eb177c5df45b231d6fa77de4fa45ef57a5ae1f80f0d6bf21aeab0577fbfe667b` |
| Source receipt | 26,146bytes | `20559d3b0ababe1248f80f530a3cbfe1c862b5268120cc256c2ffb05c2f84f5f` |
| Preparation JSON | Same-run binding | `53025e258cafe0470e3e3e31dde1ecbba40c1c01557e3b941708d85452e6d371` |
| Candidate ZIP service artifact | ID12473849713 /199,785,158bytes | `cde3c203ef23d2bcb8dff03abfc5148ae0616962026c293b44a9da42e66d0766` |
| Metadata ZIP service artifact | ID12474407680 /55,341bytes | `2257b81191f32f8729e3a546815b7dc4a02147e161ac62bc06159df41103c8bd` |

The ZIP wrapper service digests are distinct from the raw tar and metadata payload hashes.
Identity is release `1eab73cd5d2d7bed12178d13f9ecc580eaabbdbeed29de7ff06414de0f37559b`,
manifest `1f5ec4815d7412021ee9b7a6703ee8c3141ab853479413e5d7d1ea9f2f7f06c1` and baseline
`e44f4733f7d9551c92f5114a75b7d1377aa2800484c4128656d11e511b3aa399`, with the original archive
`c90758c2d3922e78d636ab2c9967b80c690bdcd8aeca283cf9f6ecc2cc992352`. Schema2, identifier1
and normalization1 remain unchanged. Full logged preparation/operator/run bindings and service
artifact metadata are retained in [the machine evidence](task-009-2026-10-23/hosted-preparation.json).

The metadata browser download helper hung despite the requested bounded timeout and reset its
runtime. No local ZIP was returned or found. No extracted metadata payload, complete local tar
redownload, or independently read site file count/total unpacked bytes is claimed. Historical
730-file/size values and185code bindings cannot supply those missing measurements. Actual
remote processing/inventory validation is supported by the successful trusted code path and
decoded job logs. The independent reviewer separately read run/jobs/logs/artifact metadata and
confirmed the supplied bindings; this scope does not certify future deployed bytes.

## Remaining first-publication boundary

The approved [initial-import design](../docs/superpowers/specs/2026-10-20-task-009-initial-import-design.md),
“Acceptance and verification matrix,” explicitly retains “Physical/mobile/hosted full-data
performance and applicable release prerequisites” before actual first deployment. Its bounded
source/recovery purpose supplies no performance exception. The [implementation plan](../docs/superpowers/plans/2026-10-21-task-009-initial-import.md),
“Operational gates after local implementation,” preserves that ordering. Existing emulated
full-source evidence reports49.24-second readiness, a566.4ms broad search against the500ms target
and approximately2.96GB sampled browser-tree RSS; it leaves Worker throttling and physical-device
readiness unverified. That older measurement is not a new measurement of this candidate. No new
memory threshold, device model or unrelated v1.0 release condition is invented.

No Pages setup, one-time publication flag, protected environment approval, deployment, backup
authority, restore dispatch or recurrence was changed by this checkpoint. Prior UI readbacks
verified required PR/strict GitHub Actions verify/conversation resolution/admin enforcement,
no force pushes/deletion, the protected main-only Pages environment, disabled Pages and no
repository/environment variables. The successful preparation independently confirmed direct
public404 before/final promotion. A later operation still needs fresh readbacks.

II-10 / hosted AC-009-4/5 still require actual first publication, complete public app/data/baseline
reconciliation, separate successful deployment history, durable complete backup publication/
redownload/adoption and recovery independent of the expired original one-day artifact. Source
assets and this preparation are not recovery authority. The original-artifact expiry evidence is
a real timing boundary, not an invitation to delete evidence or claim synthetic expiry.

TASK-010 AC-010-1–4 can follow after hosted TASK-009 acceptance and the live-policy decision.
AC-010-5 requires actual thirty-day refresh history; the publication design and PRD do not require
that history before first publication or TASK-009 completion. Full TASK-010 acceptance cannot
be completed instantly. Neither the user's operational authorization nor this passing pipeline
supplies missing physical, public, recovery or reliability evidence.

The concrete next decision is whether to satisfy the existing performance gate on a real device
or explicitly amend it for a diagnostic first publication. No such amendment is assumed here.
