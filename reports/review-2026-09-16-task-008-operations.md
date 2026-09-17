<!--
Purpose:        Independent review of bounded TASK-008 operational verification evidence
Owner:          Reviewer
Update Trigger: When the reviewed evidence packet or its stated boundaries change
Harness Version: 1.1
-->

# TASK-008 Operational Verification Review

Observation date: 2026-09-16. Review finalized: 2026-09-17.
Reviewer scope: the operational summary, hosted assessment, full-source mobile-emulation
measurement and harness, quality decision packet, exact source receipt, decision-input artifact,
and related task/traceability documentation. No product change, benchmark rerun, deployment,
workflow dispatch, repository-setting change, policy adoption, or release action was reviewed or
authorized here.

## Verdict

**Approved for the bounded operational evidence packet only.** No blocking evidence-integrity,
safety, privacy, or approval-scope finding remains after the LCP label correction. This verdict
accepts that the reports accurately record what was observed and what remains unknown. It does not
approve production quality limits, the 05/06 validator acceptance proposal, an initial baseline,
`publication/config.json`, practical mobile readiness, hosted full-source operation, publication,
recovery, TASK-008 completion, or release.

## Findings

No actionable finding remains in the reviewed packet.

During review, the mobile artifact's late LCP value was found to have been read after the scripted
search sequence. The final evidence now names it `postSearchLatestObservedLcpMs`, attributes it to
the search sequence rather than readiness, and treats the 108 ms value only as a fixed one-second
shell-window observation. Final standards-style LCP remains unverified. This correction did not
change the measured value or require a benchmark rerun.

## Evidence assessment

| Dimension | Rating | Review result |
| --- | --- | --- |
| Correctness and provenance | Pass for bounded evidence | The merged implementation head and `main` tree relationship is exact. The mobile run binds `da9e63c`, verifies the manifest plus all 719 declared assets, records the executed harness hash, and distinguishes the mechanically formatted delivered harness. Structured artifacts parse and their recorded hashes match current bytes. |
| Performance methodology | Pass with explicit failed/open gates | Search and paging wait for the Worker reply, nonzero result layout, and two animation frames. The server-side 200,000 B/s limiter applies one aggregate compressed-body schedule across all requests. Page-target CPU throttling is disclosed; dedicated Worker CPU coverage is not claimed. The single 566.4 ms broad search is correctly reported as over budget, the slow load is retained as censored at 60 seconds, and no percentile or physical-device claim is made. |
| Data quality and status safety | Pass as decision preparation | The two complete receipts support the exact transition, 05/06 category scopes, and 23 repeated empty categories. The packet keeps 05/06 mapped to `"확인되지 않음"`, proposes no numeric threshold, marks every decision input unapproved, and identifies the validator contract change that requires human approval. |
| Privacy and security scope | Pass | Search and pagination produced zero data requests in the measured run. No analytics, query-dependent fetch, credential, setting, permission, environment, workflow, or deployment change is introduced. Missing repository protections and hosted prerequisites remain open rather than being inferred from CI. |
| Documentation and approval boundaries | Pass | The reports distinguish normal hosted CI from full-source hosting and recovery, close only the verified source-PRD access/comparison criterion, preserve collection-date uncertainty, and leave production policy, baseline, mobile/hosted acceptance, TASK-009/010, TASK-019's Actions criterion, milestone, and release gates open. |

## Independent checks

- Recomputed the source PRD byte length and SHA-256, the archive-contract SHA-256, both observation
  hashes, and the current decision-input hash.
- Reconciled 2,940,404 rows across all 195 completed 2026-09-13 entries with zero parser errors;
  independently reproduced the +457 total transition, 41 increased / 0 decreased / 154 unchanged
  categories, unchanged 23-category empty set, exact 05 totals across 66 categories, and exact 06
  totals across two categories.
- Reconciled the mobile JSON with the report: 2,939,947 ready records, expected manifest hash,
  49,238.4 ms readiness, 566.4 / 383.5 / 349.5 ms searches, 69.1 ms paging, zero query/page data
  requests, 2,955,870,208-byte sampled process-tree RSS peak, and the 60,003.3 ms censored slow run.
- Verified the final mobile field name and bounded LCP language, JSON parsing for all structured
  artifacts, harness syntax, and `git diff --check` for the current packet.
- Reviewed the hosted workflow boundaries and confirmed that normal `verify:full` does not perform
  complete collection, build a full-source publication, exercise Pages recovery, or certify a
  physical mobile device.

## Remaining gates

The evidence requires the following gates to stay open:

- human approval of any reviewed-unverified 05/06 acceptance contract before implementation;
- calibrated total and per-category quality limits, explicit empty-category approval, and a
  policy-bound initial baseline;
- accepted production configuration followed by complete validator revalidation;
- relevant target-device and hosted/CDN full-source performance evidence, including final LCP and
  Worker/device CPU and memory behavior;
- approved Pages/security controls, initial publication, known-good recovery exercise, and the
  30-day reliability criterion.

Evidence reviewed: [operational summary](verification-2026-09-16-task-008-operations.md),
[mobile report](performance-2026-09-16-task-008-mobile.md),
[mobile JSON](performance-2026-09-16-task-008-mobile.json),
[hosted assessment](verification-2026-09-16-task-008-hosted.md),
[quality packet](research-2026-09-16-task-008-quality-gates.md), and
[quality decision inputs](decision-inputs-2026-09-16-task-008-quality.json).
