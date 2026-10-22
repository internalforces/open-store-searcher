<!--
Purpose:        Record TASK-009 evidence/approval waiting state and exact resumption criteria
Owner:          Planner / Release Manager
Update Trigger: When missing materials arrive, action-time approval changes, or TASK-009 resumes
Harness Version: 1.1
-->

# TASK-009 materials and approval waiting disposition — 2026-10-22

## Waiting-transition decision

The user explicitly requested that TASK-009's materials/approval waiting state be clarified and
completed. This completes that administrative disposition. **TASK-009 itself is incomplete and
awaiting materials and action-time approval; it does not occupy the active implementation slot.**
No implementation task is active after this transition. TASK-010 stays paused; TASK-021 remains
gated. TASK-027 is not activated by this request. A later implementation task still needs its own
activation and applicable design/plan gates. This decision supersedes earlier active-task and
calibration-pending start guidance in both the original and reused TASK-009 checkouts.

TASK-008 is complete under its October 18 final acceptance. TASK-009's local implementation,
verification, independent reviews and recorded PR #34 integration remain retained dated evidence.
The October 22 [source preflight](research-2026-10-22-task-009-source-transport.md) and
[exact transport request](source-transport-2026-10-22.json) remain unchanged.
Their remote/service observations were not freshly revalidated in this documentation pass.

## Subsequent activation request

After this waiting transition, the user authorized local-state commit/push/PR/main integration
and TASK-027 activation. TASK-027 becomes the sole active task on handoff integration; see the
[current active record](../tasks/active.md) and [delivery record](delivery-2026-10-22-task-027-handoff.md).
The no-active-task statements above describe the earlier waiting transition only. TASK-009
remains waiting and incomplete with all gates below unchanged.

## Waiting register and ownership

| Gate | Current evidence and missing item | Responsible owner / evidence needed to advance |
| --- | --- | --- |
| W-01 Original source bytes | The earlier scoped search did not locate `seoul-source-2026-10-16.zip`: 217,307,219 bytes, SHA-256 `c90758c2d3922e78d636ab2c9967b80c690bdcd8aeca283cf9f6ecc2cc992352`. This is not proof of loss elsewhere. | Source holder/user supplies a readable location; Researcher/Tester verifies the exact bytes and the observation asset. Never substitute a newly collected mutable archive. |
| W-02 Source transport approval | Source selection, import design and local implementation are already approved. Actual public tag/Release/two-asset upload is awaiting concrete action-time approval. | Release Manager reconfirms the exact request, tag target, redistribution scope and resource availability; human approves that concrete upload. Prior approvals remain valid within their original scope. |
| W-03 Source authority | No real uploaded asset receipt or adopted source-registry entry is established by this pass. | After authorized upload, Release Manager reads back actual tag/Release/asset IDs, redownloads and hashes both assets, then delivers the reviewed registry entry through protected main. |
| W-04 Hosted readiness | Full-data performance, physical/mobile and release prerequisites remain open with TASK-018/021. Detailed protection readback previously returned 403; current public descriptor/readiness is unverified here. | Performance/Release owners provide scoped acceptance evidence; an authorized operator obtains permitted fresh full protection/environment/public-state readback. No permission expansion or protection bypass. |
| W-05 First publication | Local proof and ordinary CI do not satisfy hosted AC-009-4/5. | Release Manager prepares exact one-time Pages settings/flags/manual dispatch and candidate identities; human gives the required action-time and protected candidate approval before deployment. Verify successful history, complete public bytes and baseline reconciliation. |
| W-06 Durable recovery | Complete public backup/adoption and current-code hosted restoration remain unaccepted. | After successful publication, separately authorize backup publication/adoption and restoration, verify actual redownload/public equality and recovery after original Actions artifact expiry. Obtain required final independent acceptance. |

W-01 and W-02 jointly unblock source transport only. They do not close W-03 through W-06.
The observation asset remains `source-observation.json`, 356,005 bytes, SHA-256
`3d23a3c770b24039a6690f2db8022eb610ffb5b56a9efee031f78b78918b4626`.
The fixed proposed tag is `initial-source-seoul-2026-10-16`, targeting
`cd16e7c4dd84d6c8520399f3a7ffb72cc88f167a`. Reconfirm absence at action time; never overwrite
conflicting assets/tags or silently retarget the request.

## Resumption and completion rules

1. The source holder identifies the exact original ZIP; verify both assets against the unchanged
   request and record actual results. A fresh replay also needs the approved runtime/tooling;
   the preflight's unavailable Docker environment is not a passing replay.
2. Prepare the concrete action and obtain any still-required action-time approval. Record which
   waiting gate is now satisfied and retain every later unsatisfied gate.
3. Explicitly reactivate TASK-009 as the sole implementation/operational task before resuming
   execution. If another task owns the slot, resolve its disposition first. Receipt of materials,
   elapsed time, this status change or documentation integration does not automatically resume it.
4. Complete the remaining sequence and final acceptance before closing TASK-009. FR-13,
   II-10 and hosted AC-009-4/5 stay open. TASK-010 follows sequentially; TASK-021 and milestone/
   handbook gates retain their existing requirements.

Preserve approved quality/baseline/reviewed-pair objects, collection-date mode, unverified source
coverage, inactive registries and default-off scheduling. The selected October 16 collection
reaches the seven-day warning at October 23 00:00 Asia/Seoul; this warning is not import expiry.
A prepared candidate retains its separate 24-hour expiry. Current-source quality rejection,
ISS-003 and performance limitations are not waived by the waiting disposition.

## Administrative acceptance and verification scope

- [x] Explicit user-authorized waiting state and release of the active implementation slot.
- [x] Materials, action approvals, owners, resumption conditions and later acceptance distinguished.
- [x] Original and operational checkout handoffs reconciled without activating another task.
- [x] Administrative completion recorded separately from overall TASK-009 completion.

This is documentation-only work. Local checks cover changed Markdown links, state assertions,
whitespace, lint/format and preservation fingerprints. No fresh application/full suite, archive
search/replay, remote readback or independent reviewer verdict is claimed. Historical test counts
retain their original dates. No code, tests, dependency, workflow, quality/configuration, registry,
remote setting, upload, dispatch, deployment, recurrence or handbook changed. Commit/push/merge
are outside this request. Existing unrelated working-tree changes remain preserved.

Fresh documentation verification passed in both checkouts: original `npm run lint` and
`npm run format:check`; operational checkout's equivalent installed Biome lint/format commands;
and both `git diff --check` runs. Each lint run retains the same five pre-existing informational
notices, with no errors or warnings. Read-only assertions passed 372 local Markdown file targets,
six waiting gates, matching current-state/administrative-completion boundaries, inactive registries
byte-equal to HEAD, no unexpected changed paths, and 83 unchanged prior/protected file hashes
outside this task's documentation targets. Existing status entries remain present. These counts
cover both checkouts together, including older links in the edited documents. Runtime:
macOS Node.js 22.22.3/npm 10.9.8, not pinned application verification tooling. This provides
administrative/document preservation evidence only, not hosted or application acceptance.
