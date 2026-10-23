<!--
Purpose:        Record authorized TASK-028 feature-branch delivery and screen-launch limits
Owner:          Implementer / Release Manager
Update Trigger: When exact-head CI, review, local checkout or acceptance status changes
Harness Version: 1.1
-->

# TASK-028 Draft PR Delivery

Date: 2026-10-23
PR: [#38](https://github.com/internalforces/open-store-searcher/pull/38), Draft/open.
Branch: `codex/task-028-dashboard-refinement`; base main `c0d0e6c3d304e9b7c9c50352aba463679fd7451e`.
Implementation commit: `7d259f97d62333f8c64446ef107ff2d3386e04b8`.

The user explicitly requested commit, push, PR creation and opening the dashboard after being
informed of incomplete verification. Local feature-branch creation still fails read-only
`index.lock`; the connected GitHub Git-data API created the isolated feature branch, one atomic
scoped tree/commit, and a non-forced ref update guarded by the expected base SHA. This publishes
the requested changes without altering main, the local index or other checkouts.

The initial22 files contain the12 changed tracked task/source/test files and10 explicitly selected
TASK-028 review/verification/evidence files. The ignored raw test logs are intentionally included
so cited evidence remains available. The coordinator independently recomputed every local Git
blob SHA and matched all22 published paths and100644 modes. The remote tree is
`1e6cde3d00be9dd33cfcd39c6a4af391a8d772a8`. No unrelated duplicate file, archive, production
source, secret or environment file is included. A subsequent documentation-only commit records
this handoff; the live PR holds its final exact head.

At implementation-head readback, canonical [Verify39876304272](https://github.com/internalforces/open-store-searcher/actions/runs/39876304272)
is in progress. This is not a passing result or task acceptance. Read the final pushed head's
own CI before any future completion or merge decision. Local189 component/type/style/build/search
quality passes and the1429pass/3platform-failure full run retain their exact scope in the
[verification report](test-2026-10-23-task-028.md). The [independent source review](review-2026-10-23-task-028.md)
is Approved with one Minor precondition finding; its prepared assertion correction is statically
checked and still lacks current browser execution. Real speech, rendered comparison/zoom/axe
and runtime performance remain open. TASK-027 residual AT is not waived.

## Screen launch

No project server was listening on4173/5173/5199. A fresh normal `npm run dev -- --host 127.0.0.1 --port 5199 --strictPort` attempt fails bind `EPERM`; no owned process remains serving the app.
The browser tool's existing file-protocol restriction is respected, with no alternate-surface
workaround. The requested live dashboard has **not been opened**. A PR page or historical image
must not be represented as the current app screen. The app's PR attachment helper also returns
a Codex-app tool error; the ordinary GitHub PR URL remains available.

Local work remains preserved in `.worktrees/task013-quality` on its old local branch because
Git metadata is read-only. Remote publication does not clean or switch the local checkout.
TASK-028 remains active for outstanding acceptance. TASK-009 waits, TASK-010 paused and TASK-021
gated. No merge, release, source upload, settings change, workflow dispatch or deployment occurs.
