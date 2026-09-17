<!--
Purpose: Reconcile remaining TASK-008 quality completion gates and historical evidence
Owner: Researcher / Planner
Update Trigger: When pair acceptance, calibration, policy, or baseline is approved
Harness Version: 1.1
-->

# TASK-008 Quality Completion Gates

Date: 2026-09-17. Prepared before the subsequent explicit pair-contract approval.
The pair decision below is now accepted; see the approved reviewed-pairs design.
Numeric policy, empty-category policy and initial baseline remain unapproved.

## Result and authority

The completion request authorizes investigation, preparation, implementation after applicable
decisions, testing, and review. It does not choose previously unpresented production limits or
supersede ADR-014's reviewed-policy and baseline requirements. This review used only local
repository evidence; it did not read the Korean handbook, collect data, dispatch a workflow,
change validation, create configuration, bootstrap, publish, or approve release.

TASK-008's quality gate cannot close from these observations alone without inventing limits. A third complete historical
observation exists, but it adds one longer interval and no category decrease. It is potential
calibration input after compatibility review, not an approved policy, baseline, or
current-validator result.

## Exact decision requiring approval

Approve a category-bound validator contract for exact pair 05 / "제외/삭제/전출" in its
66 observed categories and exact pair 06 / "기타" only in categories 15045089 and
15045092. Preserve all rows and display them as "확인되지 않음". Continue returning
review_required for new spelling, missing/partial pairs, code/name mismatch, or appearance in
an unlisted category. This acknowledges observed literals without asserting their semantics; it
does not change ADR-013 or approve limits, empties, baseline, or publication.

After approval, the minimal surfaces are refresh-validation-types.ts for a versioned,
evidence-bound contract; refresh-validation-metrics.ts to preserve raw and unknownPairCount
metrics; validate-license-refresh.ts for exact scoped suppression; and stage-refresh.mjs plus
tests for fail-closed configuration parsing. This is an outline, not approval to edit.

## Historical observation

| Item | Exact reference |
|---|---|
| Commit | 3c8f20b2068f529efdbf61df7c1fbef3f93615cd |
| Aggregate | reports/observation-2026-09-04-task-008-complete.json; SHA-256 1e218c054100dc8dbdccf387a383ab37e85e0797d82e72a7ba341755bc6edab6 |
| Audit | reports/observation-2026-09-04-task-008-complete-audit.json; SHA-256 0e7ffda54b8d52b058a311f4e2c4502c0305c61c98f468d0a8026f7da773b481 |
| Summary | reports/research-2026-09-04-task-008-first-complete-observation.md; SHA-256 3811a7be1c454ab596cdd5ca0001a5387f15ed5b18768e7e04aea1184048078c |
| Review | reports/review-2026-09-04-task-008-disk-observation.md; SHA-256 4dacc1ee024c8955d880885e48f5851bc60cf9315deec037f99fb13449f442f7 |
| Archive | SHA-256 9cbe96a9bdadb46b8e0bb8034b6b8b60ea133598f6125ba0cfc954bbc31c898c |

It completed 195 categories and 2,936,760 rows. Against 2026-09-12 it shows +3,187
rows, 75 increased / 0 decreased / 120 unchanged categories, largest increase +1,436 in
15045060, the same 23 empties, 29 missing names, and zero rows missing both addresses.
Together with 2026-09-12 to 2026-09-13, evidence has two transitions: about eight days and one
day, both with no decreases.

Compatibility limits: the result is historical observationVersion 1, has dataAsOf null,
predates current production/compact contracts, and its archive is unavailable for current
validator replay. Its review approved research evidence only. Independent compatibility review
must bind metric, mapping, category-contract, and evidence versions before calibration use.

## Completion path

1. Approve and implement the exact 05/06 contract.
2. Approve a calibration protocol and retain distinct complete archives; identical bytes are not
   independent observations.
3. Derive and review all total/195-category limits, JSON bytes, and explicit allowed empties.
4. Bind the approved policy revision to a compatible collection-date baseline; 2026-09-13 is the
   strongest candidate but remains publicationApproved false.
5. Create configuration, obtain an accepted complete revalidation, and independently review it.

No responsible numeric ValidationPolicyV1 follows from three snapshots and two all-positive
transitions. A 30-Seoul-day daily-observation interval is one conservative proposal for user
decision, not a TASK-008 mandate, PRD threshold-calibration requirement, or Section 18 reliability
criterion. Any approved interval must retain failures/decreases and exclude identical bytes.

Sources: AGENTS.md; memory/decisions.md ADR-013/014/016; tasks/active.md; reports/research-2026-09-16-task-008-quality-gates.md (SHA-256
cb1489e9a5b3399aac5e0e442fcaa3f92e7d458132edcaca2285072070cadf4e);
reports/decision-inputs-2026-09-16-task-008-quality.json;
reports/observation-2026-09-12-bounded-source.json; and
reports/observation-2026-09-13-hosted-source.json.raw.
