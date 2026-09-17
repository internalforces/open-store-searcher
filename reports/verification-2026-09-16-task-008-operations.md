# TASK-008 operational verification

Observation date: 2026-09-16. Finalization: 2026-09-17. Status: Bounded evidence complete and independently Approved; overall task incomplete.
Requirements: FR-02/03/08/12/13/14; performance NFR; TASK-008 production acceptance.

## Authorization and baseline

The user requested activation/execution of the next task and use of subagents. This bounded
continuation measures the approved compact implementation and prepares outstanding operational
and quality decisions. It does not adopt new policy, change statuses or delivery contracts,
change repository settings, publish data, dispatch workflows, or authorize release.

The existing `.worktrees/task013-quality` checkout is reused on
`codex/task-008-operational-verification`. Implementation HEAD `da9e63c864a45e2073f75f27aa32ef8370258e85`
is the head of merged [PR #23](https://github.com/internalforces/open-store-searcher/pull/23).
Its tracked tree matches origin/main `bac6dce`; ordinary hosted Verify passed. No application,
dependency or workflow changes are made by this continuation. Other checkouts remain untouched.

## Evidence streams

| Stream | Evidence | Boundary |
| --- | --- | --- |
| Actual-source mobile emulation | [Performance report](performance-2026-09-16-task-008-mobile.md) | Local emulation is not a physical-device or CDN guarantee |
| Hosted checks and prerequisites | [Hosted assessment](verification-2026-09-16-task-008-hosted.md) | CI success does not establish deployment/recovery |
| Quality, status pairs and bootstrap | [Quality decision packet](research-2026-09-16-task-008-quality-gates.md) | Observations do not automatically approve thresholds or baselines |

## Acceptance disposition

The original PRD access/comparison gate is resolved. Two complete changed-archive observations
and exact category-bound 05/06/empty scopes are preserved in the quality packet. They do not
establish calibrated limits: only one transition, with no count decrease, is observed. The
current validator always requires review of unknown pairs; a quality policy alone cannot make
these snapshots accepted. A proposed exact reviewed-unverified pair contract is ready for human
review, with the display mapping unchanged. It is not implemented or approved.

The completed actual-source mobile-emulated run verifies the manifest and all 719 assets,
then loads all 2,939,947 records. Page CPU is throttled 4x; dedicated Worker CPU coverage is not
established. Shell primary is 154.1 ms; full readiness is 49,238.4 ms. Broad district search
is 566.4 ms and exceeds the unchanged 500 ms target; two other search samples and one page
transition pass. Query/page data requests are zero. Sampled browser-tree RSS is 2,955,870,208
bytes. The 200,000 B/s aggregate gzip observation is not ready at 60,003.3 ms and is retained as
censored. Physical mobile, CDN and general mobile performance are not certified. The report also
retains the later 50,348 ms LCP entry sampled after searches. Its field name was corrected
from preInteractionLcpMs to postSearchLatestObservedLcpMs without changing the measured value. It cannot establish pre-interaction or readiness LCP; neither this entry
nor the finite shell-window observation establishes a final-page LCP pass.

[Independent review](review-2026-09-16-task-008-operations.md) Approved the bounded evidence
packet on 2026-09-17 with no remaining actionable finding. Overall TASK-008,
TASK-009/010, TASK-019's Actions criterion and release gates remain open. The historical compact
implementation is complete; ordinary hosted CI is no longer a missing implementation check.

## Validation

The existing validator suite passed all 119 tests on Node 24.19.0/npm 11.17.0, including
`validates aggregate pair %j / %j without detailed inference`,
`does not waive quality policy or initial baseline review for collection dates`, and
`requires explicit bootstrap review before accepting a complete synthetic candidate`.
The attempted `npm exec vitest run src/pipeline/validate-license-refresh.test.ts -t ...`
invocation did not forward the filter through npm, so the entire file ran and passed in 12.90 s.
No tests or assertions were changed. The test process ended before final browser measurement.

Full product tests are not repeated solely for English documentation and local measurement
artifacts; exact hosted 755/68/20 evidence is recorded in the hosted assessment. Biome does not
process Markdown in this project; the targeted Markdown formatter invocation processed zero
files and is not claimed as a pass. Whitespace, report links and structured artifacts receive
separate final validation. Final scoped Biome checks passed for the delivered harness and both
new formatted JSON artifacts; Node syntax passed. All 25 local link targets in the bounded
reports/task/operator set resolve. The three JSON payloads parse, the original receipt SHA-256
is unchanged, and `git diff --check` passes. The exact minified receipt uses `.json.raw` to preserve
its source bytes rather than introducing a formatter exemption or rewriting evidence.
Application/dependency/workflow paths remain identical to HEAD. Harness execution and
failed/censored outcomes are recorded with the performance evidence.


## Next concrete decision

The [quality proposal](research-2026-09-16-task-008-quality-gates.md#minimal-safe-status-pair-proposal--unapproved)
and [exact review inputs](decision-inputs-2026-09-16-task-008-quality.json) define a bounded
category-specific acknowledgment for the exact 05/06 raw pairs, preserving all rows and
`"확인되지 않음"`. New or mismatched pairs still require review. Adoption changes the existing
validation acceptance contract and requires human approval; it is not a display-status fix.
Count/drift/missing-value limits still need a separately reviewed calibration basis. This packet
is reviewable preparation, not a runnable publication configuration.

The current complete-download model remains a practical slow-mobile readiness blocker. Do not
silently change completeness, privacy or delivery to bypass it. Existing broad-query profiling
and target-device measurement can proceed separately; any regional/offline/remote-delivery
change needs its own concrete design and applicable human approval. TASK-009/010 and deployment
remain paused until their production prerequisites are satisfied.


Final repository checks on 2026-09-17: `npm run lint` and `npm run format:check` both exit 0.
Lint reports five informational suggestions in unchanged existing scripts, not new warnings or
errors. No unrelated cleanup was applied. Independent review is for evidence correctness and
honest scope, not approval of any pending policy, performance, deployment or release gate.
