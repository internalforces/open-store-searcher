# TASK-009 initial-import code delivery — 2026-10-21

## Authorized scope and exact implementation

The user explicitly requested commit, push, PR creation and subsequent verification after the
local implementation and independent reviews. The delivered implementation is
`fd8872dfb6703737731bde68e8688b73c28f9361` on
`codex/task-009-first-publication-analysis`, against main
`b586e72e88cb41b9988a62d70f9cd5b5503b53bc`.
[Draft PR #34](https://github.com/internalforces/open-store-searcher/pull/34) contains exactly
the 43 authorized implementation, analysis/design and evidence files. Initial remote readback
confirmed the exact head, base, branch and file set, with no conflict. No private corpus or
proof workspace was committed. Subsequent delivery bookkeeping changes documentation only.

## Fresh verification and preserved proof boundaries

Before the implementation commit, the exact pinned local `npm run verify:full` exited 0:
56 files / 1,366 Vitest tests, 68 browser checks and 20 accessibility tests. Coverage is
93.30% statements / 91.72% branches / 95.65% functions / 95.01% lines. The exact five-file
Node operator/workflow command exited 0 with 96 passed, zero failures/skips/cancellations/todos.
The five disclosed pre-existing informational lint notices remain unchanged. These commands
ran in the existing Ubuntu 24.04.4 / Node 24.19.0 / npm 11.17.0 container. No warning, retry,
flaky, concurrency or quality policy changed.

Private primary logs are `check-20261021-102250-735634.log` and
`check-20261021-102522-308587.log`; SHA-256 bindings and receipts are retained under the existing
ignored proof workspace's `delivery-2026-10-21/` directory. No new external dependency or
repository setting was introduced.

The complete 178 code bindings from the actual retained-source proof match the delivered
Git blobs byte for byte. The historical full-source proof still identifies its original
local dirty snapshot at base `b586e72`; it is not relabeled as a clean run of the new commit.
Original ZIP/observation, 195-category / 2,951,024-row metrics, historical collection date,
null source coverage, 730-file inventory and tar identities are unchanged. The full raw replay
was not rerun merely to replace its provenance label. All seven scoped reviews and required
security reviews, plus the final independent whole-diff review, remain Approved; no behavior
changed after them. See the [test record](test-2026-10-21-task-009-initial-import.md) and
[independent review](review-2026-10-21-task-009-initial-import.md).

## Remote verification

[GitHub Verify run 39527329529](https://github.com/internalforces/open-store-searcher/actions/runs/39527329529)
completed successfully for implementation head `fd8872dfb6703737731bde68e8688b73c28f9361`
on the pull-request event. Primary downloaded job logs confirm 1,366 Vitest tests, 68 browser
checks, 20 accessibility tests and the 96-test Node packaging/operator suite, all passed.
The job ran the pinned production verification and packaging commands without publication.
Remote logs and their SHA-256 binding are retained privately; the implementation log SHA-256 is
`d799b448dd5b8d51aac6ff800422640d199beb7e0f31736a993c6cb8e8624d2a`.

This is evidence for the named implementation head. The subsequent commit recording delivery
changes documentation only; its current PR head, file set and checks must also be read back
after pushing. Neither CI nor a local source proof establishes a successful hosted deployment.

## Operational boundary

The source registry remains inactive and the recovery registry empty. The original checkout's
73 untracked files and exact Git status are preserved, as are earlier analysis/design and all
private evidence. TASK-009 remains active for II-10 and hosted AC-009-4/5; TASK-010 is paused.
Code delivery does not authorize a main merge, source Release/assets or registry activation,
remote configuration, manual operational workflow dispatch, protected environment approval,
deployment, recovery, recurrence, milestone closure or handbook work. No such operation was
performed. The branch and worktree are retained for review.
