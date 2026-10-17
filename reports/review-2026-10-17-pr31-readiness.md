<!--
Purpose:        Independently assess PR 31 code readiness and local deployment simulation evidence
Owner:          Independent Reviewer
Update Trigger: When the reviewed head, CI result, local artifact evidence or deployment blockers change
Harness Version: 1.1
-->

# PR 31 readiness review — 2026-10-17

Verdict: **Approved** for the bounded code and local quality scope.

No unresolved merge-blocking correctness, privacy, regression or scope finding was identified.
Actual production data deployment is **not ready or authorized**. This verdict neither merges
the draft PR nor closes the separate production, recovery, performance or release gates.

## Exact scope and review method

Reviewed [draft PR 31](https://github.com/internalforces/open-store-searcher/pull/31), head
`b9bc6590792b129de127c0764e088048c11c06f4`, against base
`eca8448f9b4ebc41c0ed4708130c3a7fac9854d2` (`github/main`). The complete comparison contains
43 files: October 12–16 aggregate calibration evidence, the exact policy/baseline adoption,
local replay adapter, bounded ISS-003 repair and tests, and related documentation.
No workflow, dependency, product UI, status mapping or public URL contract changed.

Read the constitution, review prompt, quality standards, current task/ownership records,
traceability, implementation, changed assertions and supporting reports. The repository has
no relevant `.agents/skills`; the available home frontend skill does not apply. The test-generation
skill was inspected and excludes a review that only runs or audits existing tests; no tests were
generated. No further agents were spawned. `handbook/ko/**`, raw datasets and unrelated private
logs were excluded. Only current-task aggregate receipts and the retained CI log were inspected.
Prior Approved reports were supporting evidence, not substitutes for this review.

## Findings

No unresolved blocking finding.

**R1 — Low, resolved: local account paths in the five newly added calibration receipts.**
Locations: `reports/calibration-2026-10-12-task-008.md:35` and the corresponding October 13–16
receipts. Their archive/log references exposed an absolute local-user directory and were not
portable. Reproduction: inspect the two retained-file references in each receipt. The coordinator
replaced only those five reports' local path prefixes with `<local-calibration-root>`; the reviewer
inspected the resulting ten-line substitution and confirmed that archive/log hashes and all numeric
evidence remain unchanged. This is a documentation privacy improvement under FR-12, not a raw
business-record leak. No implementation was changed by the reviewer.

## Independent correctness and privacy checks

The reviewer deep-compared the complete configuration with the proposal and approved pair
contract. All 195 category limits, their evidence references, the exact ordered 23-ID empty list,
baseline metrics and original revision match. Canonical serialization is UTF-8 `JSON.stringify`.

| Object | Canonical SHA-256 |
| --- | --- |
| Policy | `090973f79398f45d52262958e2887497652cec13b4d95b608eb84c691070feff` |
| Initial baseline | `9234ed3297166a08b500356ac01f5bcd150276c04a2bdd129d399fa0bdc6b183` |
| Reviewed-pair contract | `d698ac34c7485c9e09dfec425a0195bcc56d9644f25479aefc350c5969998cb2` |

Verified SHA-256 bindings for all 23 complete aggregate observation files, deduplicated to
22 archive hashes and 21 transitions, and independently recomputed every documented count,
relative-change, missing-rate and status-share formula across all 196 scopes. Every threshold
matches, including upward rounding and the 23 always-empty categories. The 79 nonempty
zero-count-change scopes remain strict. October 12–16 row, status, changed-category and collision
transition summaries also match the observations. The 691,319,965-byte compact ceiling is derived
from the stated two measurements and one observed transition; it is not a statistical guarantee.

Scanned the schemas of all nine changed JSON files, including 12,448 string leaves. They contain
aggregate category/status metrics, approved status literals, dates, URLs, hashes and diagnostic
provenance. No raw business name, address, management identifier or contact string field was found.
Archives, source rows, per-file data inventories and raw logs are not added to Git. Harness prose
is English; exact Korean statuses and quoted user instructions retain their original spelling.

`publication/validation-config.json` has only `policy`, `baseline` and `reviewedUnverifiedPairs`.
The separate `publication/config.json` remains absent. The unchanged refresh workflow still
requires that production file; the local quality file supplies no deployed URL, production resource
configuration or publication enablement. The user's delegation to dot is correctly distinguished
from personally approving every numeric threshold verbatim.

The collector permits at most two acquisition transactions. Only a valid, safe-integer, in-bounds
pre-body range/full length mismatch can enable the second transaction, after successful response
cancellation and a combined caller/deadline/inactivity abort check. Malformed/out-of-bounds lengths,
HTTP/body failures, cancellation failures and aborts do not enable retry. A successful retry uses
fresh probe evidence; bounded numeric mismatch history survives success and later rejection.
Strict streamed equality/bounds, SHA-256, ZIP signature/integrity, schema and category checks remain.
Inspection failure still removes its rejected staged archive. No status or quality gate is waived.

The offline adapter preserves the original collection instant, verifies archive hashes before and
after ingestion, parses all 195 categories through the existing pipeline and compares all measured
metrics with the adopted baseline. Its fixed replay clock makes no new freshness assertion.
Existing-output rejection and incomplete-stream injection preserve accepted bytes. The existing
failure matrix also checks actual captured prior bytes after quality, budget, late-ingestion,
identity, corruption and write failures.

## Verification evidence and its limits

Reviewer-executed checks on the local macOS Node.js 22.22.3 runtime:

| Check | Result |
| --- | --- |
| `node node_modules/vitest/vitest.mjs run --configLoader runner --project=pipeline src/pipeline/collect-seoul-archive.test.ts src/pipeline/staged-download.test.ts` | 2 files, 38 tests passed; exit 0 |
| Vitest runner loader, pipeline project, selecting `validate-license-refresh.test.ts` | 1 file, 161 tests passed; exit 0 |
| Exact configuration, observation hashes and 196-scope formula recomputation | Passed |
| `git diff --check` for the complete head/base diff and path-only follow-up | Passed |

The initial default-loader test attempt could not create `.vite-temp` through the external shared
dependency symlink. The runner loader avoided that write and both completed test runs exited 0.
These supplemental local checks are not represented as the pinned production runtime.

The coordinator's live readback confirms [Verify run 39002989647](https://github.com/internalforces/open-store-searcher/actions/runs/39002989647)
succeeded for exact head `b9bc659`: pinned Ubuntu 24.04 / Node.js 24.19.0, `verify:full` and packaging,
with **813 automated tests in 44 files, 68 browser tests, 20 accessibility tests and 4 packaging
tests passed**. The reviewer inspected the retained run log's summaries and independently computed
its SHA-256 as `23c2652e107cbe9120adf2ac3fd52e79b7f80107fe58c775c608d0c28928bfd1`.
The coordinator also reports no merge conflict, reviews, comments or unresolved review threads
at its readback. Empty review threads are not an approval substitute.

Reviewed the coordinator's current-task local builder/packaging receipt, bound to `b9bc659`:

| Local simulation | Result |
| --- | --- |
| Production builder against the retained accepted staging | Exit 0; 730 site files / 691,233,971 bytes |
| Previously accepted staging | All 726 files identical in site; original staging unchanged |
| Existing-output rejection | Rejected; site and accepted staging preserved |
| Exact workflow tar packaging and unpack | Exit 0; unpacked file inventory identical |
| Site inventory SHA-256 | `896437143bcfa86d5c448fd49d08ca3f015709f1d59146653a90e66f45757ff9` |
| `artifact.tar` | 691,804,160 bytes; SHA-256 `165135935a16e757afd68e4ed14a4011a4d6f6915c4503b047cd97d9fb4630c4` |

This validates build/package compatibility and the existing 1,000,000,000-byte site guard locally.
It does not publish, bootstrap Pages, exercise a hosted recovery, or measure production readiness.
The source staging remains the retained October 16 replay: 2,951,024 rows, 726 JSON files,
691,143,712 bytes under the 691,319,965-byte quality cap. No new archive was acquired by this review.
The subsequent bounded full-source browser result is scoped separately in the addendum below.

## Merge readiness and actual deployment blockers

The bounded implementation is code-review ready with passing exact-head hosted CI and no blocking
finding. The PR remains a draft, and any later pushed head needs its own required check readback.
The path sanitization and this report are follow-up documentation to the reviewed code head.
No merge, auto-merge, publication, deployment, recurring collection, security or credential action
was performed or authorized by this verdict.

Actual deployment remains gated by separate production configuration and authorization, production
hosted/mobile performance and resource acceptance, initial Pages bootstrap/baseline reconciliation,
hosted recovery evidence, and the existing TASK-009/010/021 and milestone/release criteria. Historical
settings receipts are not current settings guarantees. Site size and tar equality close only their
local simulation checks.

ISS-003 remains open upstream: the retained one-time live check rejected both inconsistent length
pairs, 217,307,219 versus 217,356,588 bytes, and left zero staging files. Transient recovery is
proven by deterministic tests; coherent live acquisition and reliable future refresh are not proven.
Original source coverage/freshness remains unverified under explicit collection-date operation;
`sourceDataAsOf` stays null. Neither a successful local replay, ZIP entry date nor generic daily/D-2
guidance supplies an archive-bound source-cut attestation. These operational limits do not require
weakening or rejecting the reviewed client mitigation.

## Follow-up documentation and bounded browser addendum

Reviewed `reports/readiness-2026-10-17-pr31.md` and the follow-up additions to `memory/session.md`,
`tasks/active.md`, `tasks/completed.md` and `publication/README.md`. No accuracy or English-harness
policy blocker was found. Explanatory prose is English; Korean appears only in exact quoted user
instructions. Earlier no-PR/no-hosted-CI checkpoints are explicitly superseded, current evidence
remains bound to implementation `b9bc659`, and the final documentation delivery head still needs
its own passing required check readback. This review does not independently certify remote settings;
the readiness matrix attributes them to the coordinator's current readback.

Three earlier private browser-helper invocations failed and remain preserved:

| Attempt | Actual result and evidence |
| --- | --- |
| Initial helper | Timed out after 60 seconds waiting for an invented zero-eligible/zero-similar oracle for a synthetic query. Log SHA-256: `39484b3a6c88f6ed2ecdf70f2e9c09865b6b8a9a369d5f9668fd57b5b0713a2e`. |
| Diagnostic helper | Reached readiness in 57,665 ms and a completed first search with zero eligible / 25 similar candidates, then failed because an unqualified status locator matched both summary and pagination. Log SHA-256: `2bfe833053de3fdfe308d3399b63df0cb57f78026a16be8d8db2c0b7c118a6a1`. |
| First corrected helper | Reached readiness in 56,716 ms; the first search completed in 895 ms with zero eligible / 25 similar candidates. A second arbitrary Latin query again timed out at an unsupported zero/zero oracle. Log SHA-256: `5f6fba6bff8646e4a8504ee3c15bfd002e82f0f87f1327f93f96a272e7ea3e1d`. |

The reviewer independently checked these log hashes and relevant aggregate output. Existing
`matchName` deliberately allows bidirectional substring matches of at least two graphemes, so
an arbitrary Latin token cannot guarantee absence. The diagnostic DOM confirms completed search
and visible pagination. These helper failures are not reclassified as passes and do not establish
a product search timeout. Only private helper oracles/selectors changed; product code and search
thresholds did not change.

The final corrected helper completed with exit 0 against the unchanged production bundle at
`b9bc659`, all 2,951,024 records and the `/open-store-searcher/` base path. The reviewer inspected
only its aggregate receipt/log and independently recomputed both hashes:

| Final local Chromium observation | Result |
| --- | --- |
| Complete-data readiness | 57,628 ms |
| First synthetic query | Zero eligible / 15 similar candidates; completed in 362 ms |
| Second synthetic query | No-match safety copy passed; coordinator reports zero/zero for the two-private-use-code-point fixture |
| Collection date / source-coverage warning | Both correct |
| Query-triggered / nonlocal requests | 0 / 0 |
| Uncaught page / HTTP errors | 0 / 0 |
| Aggregate receipt SHA-256 | `af1b0c9b8c8a5a1f0b262ed087c5196514eb254f4106bfc078816c7561ebe7ce` |
| Completed log SHA-256 | `e60c0749f15019f2fbd0d3b1d5c5fffe2f2c3765b027e4b1896322fe33002e7e` |

The no-match fixture is an empirical observed case, not a proof that every possible source row
excludes those code points; source entity decoding makes a broader encoding-only proof unwarranted.
The receipt explicitly sets `performanceAcceptanceClaim: false`. This is one local desktop Chromium
functional observation, not physical-device/mobile/hosted performance, a statistically validated
latency benchmark, LCP verification or hosted recovery. The initial full-data readiness observation
must not be presented as satisfying the small-shell paint budget. The code-review verdict and
actual deployment blockers above remain unchanged.
