<!--
Purpose:        Define the remaining evidence, decisions, and execution order for TASK-008 completion
Owner:          Planner / Researcher / Implementer
Update Trigger: When calibration, scope ownership, policy, baseline, or final review changes
Harness Version: 1.1
-->

# TASK-008 Completion Plan

Date: 2026-09-17. Status: the reviewed-unverified 05/06 contract is implemented,
fully verified, and independently Approved. The recommended ownership and 30-Seoul-calendar-day
calibration protocol are now active. Overall TASK-008 remains incomplete until the interval,
policy/baseline approvals, accepted replay, and final review finish.
TASK-008 occupies no active implementation slot between observations; unrelated work may proceed
on a separate branch while the scheduled evidence collector runs.

## Current closed gates

- Collection-date semantics and the seven-Seoul-day warning are accepted and implemented.
- Complete parsing and lossless compact conversion cover all 195 categories and 2.94 million rows.
- Exact 05/06/category scopes are acknowledged without changing raw metrics or the
  `"확인되지 않음"` display status.
- The bounded validator, staging preservation, configuration forwarding, aggregate replay,
  full Ubuntu verification, and independent review pass.
- The source PRD is available and has been compared with the implementation.
- Ordinary hosted CI for the merged compact implementation passed.

## Shortest quality-completion path

1. **Approve a calibration protocol.** The current three complete observations provide only
   two all-positive transitions and no evidence for decreases or source corrections. A
   conservative proposal is to retain distinct complete daily archives for 30 Seoul calendar
   days. This duration is a proposal for threshold calibration, not a PRD mandate or the
   separate 30-day operational-reliability criterion. Identical archive bytes do not count as
   independent observations; failures and decreases must be retained.
2. **Collect calibration evidence without publication.** Use the existing bounded observation
   path. Preserve archive/schema/observation hashes, complete total and all-195-category metrics,
   failures, elapsed time, and source connectivity outcomes. Do not auto-accept or publish a
   candidate during calibration.
3. **Derive one complete proposed `ValidationPolicyV1`.** It must supply evidence-bound total and
   all-195-category count ranges, absolute/relative change limits, missing-name/address rates,
   four display-status share limits, and `maxJsonBytes`. The repeated 23-category empty set is a
   candidate for `allowedEmptyCategories`, not an automatic approval.
4. **Obtain explicit human approval of the policy and empty-category list.** ADR-014 requires
   reviewed limits and does not permit synthetic defaults. This is the next policy approval gate
   after calibration.
5. **Select and approve the initial baseline.** The 2026-09-13 complete observation is the
   strongest current candidate, but it can be bound only after the approved policy revision
   exists. The baseline must retain collection-date semantics, all contract versions and hashes,
   all 195 metrics, and an explicit review reference.
6. **Run an accepted complete validation.** Create the reviewed operator configuration, replay a
   complete candidate through the unchanged validator/staging path, require `accepted`, and prove
   that any failure preserves the previous known-good release.
7. **Obtain independent final review.** Review the policy derivation, empty list, baseline,
   accepted result, source hashes, configuration, and verification evidence. Only then can the
   original TASK-008 quality acceptance criterion be checked and the task moved to completed.

## Execution checkpoint — 2026-09-17

- [x] Recommended original TASK-008 ownership selected by the user's instruction to execute this
      plan. Mobile/hosted release evidence stays with its existing owner tasks.
- [x] Conservative 30-Seoul-calendar-day protocol activated from 2026-09-17.
- [x] First current observation completed: distinct archive
      `98e4a29352a4a6e39ddf58e50730ba1d2294dd402a88e96c2de34c32f388bf02`, all 195 categories,
      2,941,453 rows, no category-count decrease, and one retained display-status correction.
- [x] Daily 09:00 local heartbeat created as `task-008-30-day-quality-calibration`; source archives
      remain outside Git and publication is prohibited.
- [x] Second distinct current observation completed on 2026-09-18: all 195 categories and
      2,941,941 rows. Retain one category-count decrease and nine category-level status
      corrections for review; do not infer policy limits from them yet.
- [x] Third distinct current observation completed on 2026-09-19: all 195 categories and
      2,942,404 rows. No category total decreased; retain 30 category-level status corrections
      for review without inferring policy limits.
- [x] Fourth distinct current observation completed on 2026-09-20: all 195 categories and
      2,942,802 rows. No category total decreased; retain 20 category-level status corrections
      for review without inferring policy limits.
- [x] Fifth distinct current observation completed on 2026-09-21: all 195 categories and
      2,942,809 rows. No category total decreased; retain three category-level status corrections
      for review without inferring policy limits.
- [x] Sixth distinct current observation completed on 2026-09-22: all 195 categories and
      2,942,813 rows. No category total decreased; retain three category-level status corrections
      for review without inferring policy limits.
- [ ] Complete the approved interval and derive the full evidence-bound policy proposal.
- [ ] Obtain explicit policy, allowed-empty, and initial-baseline approval.
- [ ] Run accepted validation, failure preservation, and independent final review.

## Scope ownership decision

The original TASK-008 contract owns staged validation, production quality evidence, policy, and
baseline. Existing traceability assigns publication/recovery to TASK-009/010/021 and performance
to TASK-018/021. Later operational notes nevertheless added actual mobile/hosted acceptance to
TASK-008. Completion therefore needs one explicit scope decision:

- **Recommended:** restore the original ownership. Complete TASK-008 after the seven quality
  steps above, while keeping mobile performance, Pages publication/recovery, repository settings,
  and 30-day reliability open in their existing owner tasks.
- **Alternative:** retain the accumulated mobile/hosted gates in TASK-008. This requires more
  work before completion: solve or explicitly accept 49.24-second full readiness, the 566.4 ms
  broad search result, the censored slow-network load, and missing physical-device/Worker-CPU/CDN/
  final-LCP evidence; then perform an approved hosted publication and recovery exercise.

The alternative likely needs a separately approved delivery design because the current complete
download has a 992-second arithmetic lower bound at the measured slow-network rate. Regional,
query-dependent, installed/offline, or reduced-source delivery changes completeness, privacy,
public-interface, or architecture decisions and cannot be inferred from the completion request.

## External approvals and non-blocking ownership

- Numeric policy, the 23 allowed-empty candidates, and the initial baseline need explicit human
  approval after evidence is prepared.
- Any deployment, security-setting change, GitHub Pages environment/protection change, or new
  delivery architecture retains its existing human approval gate.
- Ordinary hosted CI is already closed. Hosted publication, recovery, and 30-day reliability are
  separate release evidence unless the scope decision explicitly keeps them in TASK-008.
- No dependency, status mapping, source-data method, workflow permission, public URL, publication,
  or deployment is authorized by this plan.

## Immediate next action

After this branch is delivered, the next actionable decision is the calibration protocol and its
observation interval. The repository already has a bounded observation path; no production
publication is needed to collect the evidence. The policy values should be derived and presented
for review after the approved interval, rather than requested as 195 manual values from the user.
