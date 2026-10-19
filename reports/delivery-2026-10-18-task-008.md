<!--
Purpose:        Bind TASK-008 evidence delivery to merged main without reverting prior adoption or collector fixes
Owner:          Implementer / Reviewer
Update Trigger: When integrated verification, delivery review, commit or PR state changes
Harness Version: 1.1
-->

# TASK-008 evidence delivery — 2026-10-18

Status: integrated full verification passed; independent delivery review **Approved** with no actionable findings.
Related requirements: FR-08, FR-13, FR-14; approved local quality acceptance only.

The user explicitly requested commit, push and PR creation after the October 18 final quality
verification. Commit `2be9077` preserves that independently reviewed state. Fresh remote readback
then found that PR #31 had already merged as `c521467`, adopting the same canonical policy and
baseline plus bounded ISS-003 collector recovery and readiness evidence. That history is merged
and preserved; this delivery adds fresh verification rather than reopens a completed task.

## Actual PR difference

- Add the October 18 complete-source replay, exact-policy rejection, preservation, verification
  and independent review receipts. All 195 categories and 2,951,024 rows passed; 726 JSON files
  total 691,143,712 bytes and retain identical hashes after failure injection.
- Extend the local replay adapter with exact input fingerprints and internally consistent
  negative count/missing-policy checks; add a local artifact/policy-failure audit adapter.
- Preserve the already approved main policy, baseline and reviewed-pair objects. Add only three
  explicit previously observed local resource ceilings to validation-only configuration:
  536,870,912 bytes/member, 3,000,000 rows and 120,000 ms/member.
- Reconcile completion, decision, issue, traceability and operator documentation while retaining
  earlier main history. TASK-008 remains complete; no implementation task is active.

There is no production source, script, test, dependency, workflow, status-mapping, public-URL or
infrastructure difference against `c521467`. The workflow's `publication/config.json` remains
absent. No deployment destination, publication flag, hosted bootstrap or deployment is created.

## Evidence identity

The complete parsed local configuration exactly equals the reviewed `2be9077` object. JSON
spelling follows main to avoid numeric-format churn; raw configuration file SHA-256 differs
from the historical replay snapshot, while both exact canonical approved objects are unchanged.

| Object | Canonical SHA-256 |
| --- | --- |
| Policy | `090973f79398f45d52262958e2887497652cec13b4d95b608eb84c691070feff` |
| Initial baseline | `9234ed3297166a08b500356ac01f5bcd150276c04a2bdd129d399fa0bdc6b183` |

The earlier [raw replay](validation-2026-10-18-task-008.json),
[preservation](preservation-2026-10-18-task-008.json),
[797/68/20 suite receipt](verification-2026-10-18-task-008.json), and
[quality review](review-2026-10-18-task-008-final.md) explicitly bind the pre-integration snapshot.
The raw replay's producer, unzip adapter, parser, validator and compact writer are byte-identical
to integrated main, as are its contracts, lockfile and replay helper. Its offline result remains
applicable to that unchanged path. The collector repair from main is retained and covered by
fresh integrated full-suite evidence, separately from the historical 797-test run.

## Verification and remaining boundaries

Fresh integrated verification uses a new isolated directory in the existing Ubuntu 24.04 ARM64
container with pinned Node.js 24.19.0/npm 11.17.0 and matching locked dependencies. The first
integrated attempt stopped at an expanded two-item JSON-array formatting difference; it did not
run product tests. Formatting was corrected with the existing project formatter and the exact
full command was restarted. All previous failed helper/timing attempts remain disclosed in the
[original final test report](test-2026-10-18-task-008-final.md).

The 79 zero-count-change categories, review-gated empty growth and 176,253-byte size headroom
remain accepted conservative restrictions. ISS-003 remains open upstream, with the merged
bounded client mitigation intact. Source freshness, hosted/mobile performance, hosted
publication/recovery, operational reliability, milestone handbook and release gates remain open.
No merge to main, collection resumption, security setting, tag or deployment is authorized here.


## Fresh integrated full verification

`npm run verify:full` exited 0 with **813 tests, 68 browser checks and 20 accessibility tests**
at unchanged default browser concurrency and strict flaky policy. Lint, formatting, types,
coverage, build and both search-quality checks pass. Coverage is 92.79% statements, 91.33%
branches, 95.36% functions and 94.47% lines; the status mapper remains 100%.

The [integrated receipt](verification-2026-10-18-task-008-delivery.json) binds the exact current-main
base, log digest, 156 current product/test/tooling fingerprints, current raw config and unchanged
canonical approved objects, plus the historical raw-replay/preservation receipts. These are local
Ubuntu checks, separate from the prior PR #31 hosted CI and any new PR's hosted checks.


## Independent delivery review

The [delivery review](review-2026-10-18-task-008-delivery.md) is **Approved**. It independently
verifies the preserved main changes, exact parsed configuration and approved canonical identities,
nine unchanged raw-replay input hashes, all 156 integrated product/test/tooling hashes and the
bound successful 813/68/20 log. Final lint/format/typecheck and whitespace checks pass; only the
same five existing informational lint suggestions remain. A new PR's exact-head hosted CI is
separate and must not be inferred from this local run or PR #31's historical CI.
