<!--
Purpose:        Record delegated exact policy adoption and non-publishing validation with failure preservation
Owner:          Implementer / Tester / Reviewer
Update Trigger: When scoped acceptance evidence changes
Harness Version: 1.1
-->

# TASK-008 Local Policy Adoption — verified 2026-10-17

Related requirements: FR-08/13/14; ADR-014/016; approved TASK-008 completion ownership.

## Authority and scope

The user's exact instruction was "open-store-searcher 결정해": the user delegated the decision
to dot. Dot selected the complete conservative proposal at
`fd6f79f1be1cff31f04ef679394ec7b4b76260ad`. This is delegated adoption, not a claim that the
user personally stated or approved each numeric threshold verbatim. The October 17 resumption
request retained the same local-only scope. The original machine-readable proposal is unchanged.

The main checkout contains unrelated untracked work and was preserved. The clean calibration
checkout matches the cited commit. Remote branch readback on October 17 still identifies
calibration `fd6f79f1be1cff31f04ef679394ec7b4b76260ad` and main
`eca8448f9b4ebc41c0ed4708130c3a7fac9854d2`; the preceding PR/issue inspection found no later
policy decision. No local memory was treated as approval and no handbook was read. The repository
has no `.agents/skills`; the home frontend skill does not apply to this configuration task.

The isolated clone is `<local-task-root>/open-store-searcher`,
on `codex/task-008-policy-adoption-local`, based on the cited commit. Changes remain uncommitted;
its origin points to the original local repository. No push, PR, merge, publication, deployment,
recurring collection, credential, security-setting, dependency, product-source or workflow change
was performed. The existing stopped task-specific Docker container was started for local checks;
its earlier source/evidence directories were preserved.

## Exact configuration

`publication/validation-config.json` contains `policy`, `baseline`, and `reviewedUnverifiedPairs`.
These are respectively the proposal's complete nested policy, `initialBaselineCandidate.baseline`,
and unchanged approved `src/pipeline/contracts/reviewed-unverified-pairs-v1.json`.
`publication/config.json` remains absent; no production URL or resource settings were invented.

| Input | Exact identity |
| --- | --- |
| Revision | `task-008-calibration-2026-10-16-v1-proposed` (suffix retained) |
| Policy canonical bytes / SHA-256 | 76,642 / `090973f79398f45d52262958e2887497652cec13b4d95b608eb84c691070feff` |
| Initial baseline canonical bytes / SHA-256 | 135,061 / `9234ed3297166a08b500356ac01f5bcd150276c04a2bdd129d399fa0bdc6b183` |
| Initial baseline date basis / date / rows | `collection` / `2026-10-16` / 2,951,024 |
| Archive SHA-256 | `c90758c2d3922e78d636ab2c9967b80c690bdcd8aeca283cf9f6ecc2cc992352` |
| Schema-manifest SHA-256 | `6254a2b3d6626c41f625bb98d79399bdd40318632ce0d54561a997fdd039ceb6` |
| Approved pair-contract canonical SHA-256 | `d698ac34c7485c9e09dfec425a0195bcc56d9644f25479aefc350c5969998cb2` |

Canonical means UTF-8 `JSON.stringify(object)`. All 195 category limit objects and their evidence
references remain exact. Aggregate count range is 2,940,295–2,952,182; absolute change 1,158;
relative change 0.000392825474; missing-name rate 0.000009859074; missing-both-address rate zero.
Status-share limits in the four-status contract order remain 0.000102338285, 0.000001288694,
0.000091661403, and 0.000012010517. JSON ceiling remains 691,319,965 bytes.

The exact 23 allowed-empty IDs are `15006727`, `15044963`, `15044965`, `15044988`, `15044989`,
`15044993`, `15045012`, `15045019`, `15045022`, `15045031`, `15045040`, `15045041`, `15045043`,
`15045051`, `15045053`, `15045055`, `15045056`, `15045065`, `15045083`, `15045114`, `15045115`,
`15101548`, and `15113628`.

## Complete replay and recovery audit

[Aggregate machine-readable evidence](validation-2026-10-17-task-008-adoption.json) binds the
completed replay, recovery rehash and test results. This replays the retained October 16 archive
using the reviewed October 16 baseline; it is not a new daily collection or evidence of a later
transition. Original collection instant `2026-10-16T01:52:52.043Z` is preserved. `sourceDataAsOf`
remains null and `source_coverage_unverified` is the sole warning.

`.testagent/replay-adopted-policy.mjs` strictly parses every category through existing production
modules, hashes the archive before/after reading, compares every measured metric to the selected
baseline, stages compact output under the unchanged policy, and injects failure-preservation checks.
It reuses the research observation's resource ceilings (512 MiB per extracted category, 3,000,000
rows, 120,000 ms entry timeout); these are not an adopted production resource policy.

The run completed while the Mac command connection was lost. On resumption there was no running
replay process, and the durable receipt and private inventory existed. No duplicate ingestion was
started. A fresh read-only audit at `2026-10-17T04:09:09.898Z` rehashed every accepted file and the
retained archive, verified descriptor/baseline bindings and exact baseline metrics, and exited 0.

| Result | Value |
| --- | ---: |
| Categories / parsed rows | 195 / 2,951,024 |
| JSON artifacts | 726 |
| Total JSON bytes | 691,143,712 |
| Unchanged policy ceiling | 691,319,965 |
| Remaining bytes | 176,253 |
| Replay elapsed milliseconds | 740,884 |

The intentionally incomplete category stream was rejected and left no candidate or temporary
staging directory. Retrying the existing accepted output was rejected before source consumption.
All 726 accepted files were rehashed unchanged after these failures and again on recovery.
Before/after/recovery inventory canonical SHA-256 is
`3de3740d37241d204e558f74295ee8d07f4a0a051497116823cad85b878cedf0`.

Additional bindings:

- Completed receipt file SHA-256: `0a875fb1ef47f513be94f019d6e8186538423d78ec9a761b08d481d561f3fd12`.
- Accepted `release.json` SHA-256: `a85001ee0bca4be2fef7d667d3fe0e78e4ac2334a318353168a9f80655652190`.
- Generated next-baseline file SHA-256: `e44f4733f7d9551c92f5114a75b7d1377aa2800484c4128656d11e511b3aa399`.

The generated next baseline uses the policy evidence reference and newline serialization, so its
file hash differs from the reviewed initial baseline canonical hash. Metrics, archive, date and
contract bindings match; the adopted initial baseline remains unchanged. No authoritative deployed
baseline was replaced.

The source archive, 726 data artifacts, per-file inventory and raw logs remain local outside Git.
The accepted output is in Docker container `open-store-searcher-task008-research` at
`/work/task008-adoption-20261016-local/validation/accepted`. Recovered receipts, inventory and
logs are in the sibling task directory `private-validation`. Only aggregate evidence and hashes
are included in repository reports.

## Repository verification

Pinned Ubuntu 24.04, Node.js 24.19.0, npm 11.17.0 and Debian Info-ZIP 6.00 were reused in a new
owned container directory. Earlier evidence was preserved; no dependency install was needed.

The initial `npm run verify:full` stopped at lint because tar introduced AppleDouble metadata and
the new adapter had an empty-yield generator lint issue. Only generated metadata in the new copy
was removed. Lint-only adapter edits sorted imports, used equivalent template strings and yielded
an empty sequence before the must-not-consume throw. The executed replay snapshot's adapter SHA
is `8a716263ee1975990d2905ab3750d183ede0f3f6991fc80483e51d3d21006a51`; its retained source tar
SHA is `1e88a1c896866e3130317c3397e4356a61e640b509ea687d83eea7523826bf1c`. The final local adapter
SHA is `c1a08a51776d8f970400d2ea965d5fc6afe28b500ca58f7f86cacb2185b613ae`. No policy or production
module changed. Required checks then passed using the established one-worker browser setting:

- `npm run verify`: exit 0; 44 test files, 797 tests, including 161 validator tests; lint,
  formatting, types, coverage, build and both search-quality checks passed.
- Coverage: statements 92.72%, branches 91.09%, functions 95.36%, lines 94.44%.
- `npm run test:e2e:full -- --workers=1`: exit 0; 68 passed across all four browser projects.
- `npm run test:a11y -- --workers=1`: exit 0; 20 passed with zero asserted violations.

The unchanged validator matrix covers preservation under invalid/missing reviewed-pair contracts,
late ingestion, missing-name quality, total JSON budget, duplicate identities, incomplete categories,
disk-bucket bounds, late write failures and corrupted intermediates/artifacts. No test, assertion,
retry or threshold was weakened. The split commands complete all required full-suite checks;
no passing initial `verify:full` invocation is claimed. Recovery did not repeat unchanged tests.

`verify.log` SHA-256 is `882663619461ef1ba65bc162c8fe98f03b25ffaa39f264736dd07fe9d2b5f782`;
`browsers.log` SHA-256 is `60a4e82e4bb88a4529b35f84ed1147283eb9ec33c4f708f4117da35bbcf2321f`.
Both hashes were recomputed on recovery, and the independent reviewer inspected the logs.

## Review and remaining boundaries

Independent final review is recorded separately in
[the scoped review](review-2026-10-17-task-008-policy-adoption.md). The independent verdict is **Approved**, with no blocking findings. It completes the original
local staged-quality gate; this verification report does not supply its own final approval.

Seventy-nine nonempty categories retain zero count-change tolerance. First population of an empty
baseline still requires review. The size ceiling rests on one compact transition and is not a
statistical confidence bound. ISS-003 remains undiagnosed: offline replay does not exercise live
transfer. Collection time supplies no original source freshness. Physical/mobile/hosted performance,
Pages bootstrap/recovery, publication, milestone handbook review and release acceptance remain
separate gates. The calibration automation remains paused; no settings were changed.
