<!--
Purpose:        Record the approved bounded reviewed-unverified pair acceptance contract
Owner:          Architect / Implementer
Update Trigger: When the approved pair scope or evidence binding changes
Harness Version: 1.1
-->

# TASK-008 Reviewed-Unverified Pair Acceptance

Status: Accepted on 2026-09-17 by explicit user approval of the presented proposal.
Requirements: FR-04/07/13; TASK-008 V06 and production quality review.

## Approved behavior

The exact raw pair `05` / "제외/삭제/전출" may pass the pair-review gate only in the
66 categories enumerated in the preserved September 16 decision inputs. Exact pair `06` /
"기타" may pass only in `15045089` and `15045092`. Every row remains present, displayed
as "확인되지 않음", and counted in raw aggregate pairs and unknown-pair metrics. No
status meaning is inferred and `mapLicenseStatusV1` is unchanged.

The contract is a maximum allowed scope, not a required set of current occurrences. A candidate
may contain fewer approved occurrences or none. Ordinary count and status-share policy checks
still evaluate those changes. Any actual row with a new/mismatched spelling, missing code/name,
partial pair, unknown code or occurrence in an unlisted category still requires review.
A mixed candidate containing reviewed and unreviewed pairs cannot be accepted by this extension.

## Bounded interface

An optional `reviewedUnverifiedPairs` input contains the complete checked-in approved contract.
It is bound to its revision, validation/schema/status-mapping versions, schema-manifest hash,
two evidence archive hashes, the retained observation hash and the human review reference.
Only the exact approved value is valid; callers cannot widen the allowlist or substitute their
own review references. Malformed, sparse, duplicate, extended or incompatible input rejects.
Object property order has no semantic significance. Missing input preserves legacy pair review.
The staging CLI forwards this explicit field from its reviewed operator configuration.

This contract is itself the reviewed acceptance rule, not a general unknown-status exception.
Its evidence archives describe the review basis and are not a restriction that only those
archive hashes may ever be refreshed. The source schema must still match. Any future scope
change requires a new review, contract revision and applicable human approval.

## Remaining independent gates

Numeric policy, all 195 category limits, allowed empty categories, explicit initial baseline
and their compatibility checks remain mandatory. No numeric value, baseline or production
configuration is created by this approval. Collection dates retain source-coverage uncertainty.
This work does not waive resource/performance targets or authorize publication or deployment.

## Verification

Follow P01-P07 in `.testagent/research.md` and `.testagent/plan.md`. Use failing tests before
implementation, focused pipeline and actual staging/configuration checks, pinned full
verification and an independent Reviewer. Replay retained aggregate observations only as
research evidence: removing pair-review diagnostics must leave missing policy/baseline
diagnostics and must preserve every measured metric. This is not a raw archive replay,
production policy approval, successful refresh or publication evidence.
