# TASK-009 initial-import local verification — 2026-10-21

Status: actual retained-source proof and accumulated local checks passed. Task 7 independent
scoped spec/quality review is Approved; final independent whole-diff review is Approved for local technical delivery. TASK-009 remains active; II-10/AC-009-4/5 remain
open and TASK-010 stays paused. No commit or remote operation, milestone or handbook closure.

## Scope and environment

The user approved the exact October 16 source, unchanged quality, complete initial-import design
and seven-task local implementation/review plan. Tasks 1–6 are independently Approved; Task 5
Actions/security and Task 6 provenance-security reviews have zero open findings. Task 7 changed
only mapped documentation/evidence and private proof scripts. Existing analysis/design and
failed receipts remain preserved. The original checkout's 73 untracked files and exact Git status
were rehashed unchanged. No secrets or handbook were accessed; no dependencies/configuration,
policy/baseline/status/public URL/permission/threshold/retry/skip/flaky policy changed.

All heavy checks ran sequentially in the existing pinned Ubuntu 24.04.4 LTS / Node 24.19.0 /
npm 11.17.0 / Info-ZIP 6.0 container, reusing dependency/browser caches. The wrapper generates
`.initial-import-local-code.json` from actual host HEAD/dirty state and the complete current
source/scripts/public/workflow/root configuration/trust-contract set; the actual CLI verifies its
exact bytes. No `.git` metadata is copied into the container; no Python runs there.

## Actual current-code source and artifact proof

The real `downloadInitialSource` → `downloadInitialAsset` → `readRecoveryResource` chain first
streamed the exact retained ZIP and observation using an injected local fetcher with actual local
file-byte streams. All downloader/reader/writer/hash/continuity logic was production code.
Twelve metadata/binary calls and two complete binary streams passed exact selected lengths and
hashes. API metadata, IDs and tag commit are explicitly synthetic local fixture values, never
uploaded source authority; zero real network requests or production-registry activation occurred.
This closes the real-byte composition gap left by earlier primitive/mocked wiring tests.

The actual new local CLI then ran on the original read-only selected ZIP and observation into
`/work/task009-initial-import-proof-20261021/accepted-local-cli`:

```text
node scripts/verify-initial-import.mjs publication/config.json /work/task008-calibration-archives/c90758c2d3922e78d636ab2c9967b80c690bdcd8aeca283cf9f6ecc2cc992352.zip reports/observation-2026-10-16-bounded-source.json /work/task009-initial-import-proof-20261021/accepted-local-cli
```

It freshly inspected and parsed all 195 categories/2,951,024 rows with complete metrics exactly
equal to the original approved initial baseline. Its actual validation clock is
`2026-10-21T00:43:17.542Z`, verified at `2026-10-21T00:53:39.788Z` and prepared at `2026-10-21T00:54:19.326Z`.
The original collection remains `2026-10-16T01:52:52.043Z`; source coverage remains null/unverified.
It emits local mode, null run ID, local-only transport and null public precondition. No Release,
run, artifact-ID or deployment-success authority is emitted. Exact expiry is `2026-10-22T00:54:19.326Z`.

| Actual measurement | Value | Guard/result |
| --- | ---: | --- |
| Complete compact JSON including manifest/baseline/descriptor | 691,143,712 bytes | <= 691,319,965 |
| Complete built site | 691,233,995 bytes / 730 files | <= 1,000,000,000 bytes |
| Original GNU tar | 691,804,160 bytes | Verified by current archive inspector |
| Canonical inventory | 140,217 bytes | All 730 unpacked file bytes equal |
| Operator code bindings | 178 exact entries | Complete current dirty snapshot |

The actual file count is measured, not inferred from a historical package. The complete tar was
unpacked into a new private directory, checked by `verifyPublicationDirectory`, and every length/
SHA-256 compared with the exact inventory. Built identity matches preparation and identity.json;
source receipt/tar/canonical-inventory bindings match. Raw ZIP/observation, staged rows and private
source-import/identity/inventory/preparation receipts are absent from the public tar/site.

Base host HEAD is `b586e72e88cb41b9988a62d70f9cd5b5503b53bc`, `uncommitted:true`, `runId:null`.
Complete operator-binding canonical SHA-256 is `23b8b780cd3eebb46d3b9fe95ca33ba7b2d662fbed1f0304864a5d961ac71750`;
base SHA alone does not represent the uncommitted implementation. Full code bindings, exact
accepted-file/site inventories and all-file hashes remain in private evidence outside Git.

| Binding | SHA-256 |
| --- | --- |
| ZIP (217,307,219 bytes) | `c90758c2d3922e78d636ab2c9967b80c690bdcd8aeca283cf9f6ecc2cc992352` |
| Original observation (356,005 bytes) | `3d23a3c770b24039a6690f2db8022eb610ffb5b56a9efee031f78b78918b4626` |
| Production config | `b7a64b46c49ad6d3ab10ba268becb6e62bb666d342bc4aa158898a37ac1e20ba` |
| Validation config | `f3feafd8d37d30e859b7797fe753277d2091cb7383009e035dff60edb76987f1` |
| Source registry (inactive) | `9f8f59ffa77e132fa671c1ddaefa4cb181b96dfdcb1f982913d376d79512bff2` |
| Recovery registry (empty) | `d7f513067028d84f860d8ce0ee3d3bee8f04cdb0e009dd1003607b71f3683c74` |
| Release descriptor | `a85001ee0bca4be2fef7d667d3fe0e78e4ac2334a318353168a9f80655652190` |
| Compact manifest | `1f5ec4815d7412021ee9b7a6703ee8c3141ab853479413e5d7d1ea9f2f7f06c1` |
| Built baseline | `e44f4733f7d9551c92f5114a75b7d1377aa2800484c4128656d11e511b3aa399` |
| Canonical inventory | `8fb0b86c872c66532fd737952f700a55b94ce2356db8a251cdda63b7f030c97a` |
| Original tar | `237d60d3bc34d4422aee921977a736707bcdeb998dd7df9a974c59bde9aa93da` |
| Private source receipt | `0b20cc1e6854a82eef4af38325bb9810af7bf70f8cb7fd0f00b4ce4dc59ba280` |

## Meaningful rejection and warning evidence

The actual CLI on a same-length privately damaged ZIP rejected `Initial source byte binding
mismatch` (exit1); the original accepted output as target rejected `Operator output already
exists` (exit1). No failed output or owned scratch escaped. All five accepted private files,
six source/config inputs and all 730 unpacked site files rehashed unchanged afterward.

A separate actual `validateMeasuredRefresh` control admits the original observation and coherent
baseline metrics, then adds one administratively-operating metric row to category 15045103 and
the total (564→565;2,951,024→2,951,025). Counts/status/aggregate-pair totals remain coherent;
`invalid_measured_metrics` does not occur. With unchanged min/max 564 and zero absolute/relative
count-change allowances, the validator rejects `count_above_maximum` and `count_change_exceeded`,
plus the resulting zero-share-change violations. This is measured-metric evidence, not a raw
source replay: altered ZIP bytes reject identity before quality. Warning severity remains separate.

The actual validator accepts original metrics just before October 23 Seoul midnight
(`2026-10-22T14:59:59.999Z`) with only `source_coverage_unverified`; exactly at
`2026-10-22T15:00:00.000Z`, it additionally emits `collection_stale`, ageDays 7/limit 7.
Import/build time never refreshes the historical date. Full pipeline checks also cover interrupted
staging/category consumption and metadata mismatch; the five-file Node suite executes controlled
source/stage/build/inspection/tar/archive/cleanup and existing/uncertain public-state failures.
These controlled fixtures are labeled and do not claim a hosted failure exercise.

After every suite and controlled failure, the final fresh rehash confirms all 5 accepted proof
files,730 site files,6 inputs and178 current code bindings unchanged. Both registries remain
null/empty. Neither a local proof nor selected source assets provide recovery authority.

## Exact accumulated verification

| Command | Result |
| --- | --- |
| `npm run verify:full` | Exit0; 56 Vitest files / 1366 tests; 68 browser checks; 20 accessibility checks |
| Exact five-file Node command below | Exit0; 96 tests / 96 passed;0 failures, skips, cancellations or todos |
| `git diff --check` | Exit0 |

```text
node --test scripts/check-pages-artifact.test.mjs scripts/check-publication-state.test.mjs scripts/check-publication-workflows.test.mjs scripts/publication-operators.test.mjs scripts/initial-import-operators.test.mjs
```

Coverage: statements 93.3%, branches 91.72%, functions
95.65%, lines 95.01%. Lint/style/typecheck/build and both existing
search-quality checks pass. Four-browser matrix: Chromium, Firefox, WebKit and mobile Chromium.
Accessibility runs Chromium/mobile Chromium with zero axe violations. Complete logs and browser/
coverage artifacts are retained privately. Five pre-existing informational Biome `useTemplate`
notices are informational; no thresholds or policy were weakened. The initial controller baseline's ten
adapter failures came from omitted tracked `.testagent` snapshot files; inclusion was corrected
and affected18/18 passed before implementation. Earlier failed logs remain intact and are not
reported as current-code full-suite results.

Private full log: `check-20261021-095520-634800.log`. Node log: `check-20261021-095815-488310.log`.
Actual source CLI: `check-20261021-094317-186335.log`; download proof:
`check-20261021-094309-215764.log`; complete audit: `check-20261021-095427-487159.log`;
actual failure preservation: `check-20261021-095454-336366.log`; measured/midnight control:
`check-20261021-095511-522996.log`. Machine-readable summary:
[verification](verification-2026-10-21-task-009-initial-import.json).

## Requirement / evidence map

| Requirement | Concrete current evidence |
| --- | --- |
| II-01 | `pins the complete selected source and freezes nested authority constants`; `keeps production authority inactive and both approved files byte-for-byte unchanged`; final input/registry rehash |
| II-02 | Real high-level retained-byte local-fetcher proof; `checks individual asset metadata before creating private downloads`; actual selected-hash rejection |
| II-03 | Actual CLI all 195 categories/2,951,024 rows; full baseline metrics equality; `refuses wrong final metrics even after the inner stager has accepted its private output` |
| II-04 / FR-08/14 | Actual receipt clocks/original collection/null coverage; actual validator before/at Oct23 midnight; `uses the actual validator for the Seoul seven-day boundary and zero-change rejection` |
| II-05 / FR-13 | Actual damaged/occupied CLI rejection + complete preservation; `removes only its scratch on interrupted staging and preserves an existing output`; `rejects an inner stager that stops consuming categories or rows` |
| II-06 | `hosted first 200 refuses promotion preserving prior site`; `hosted final 200 refuses promotion preserving prior site`; `hosted uncertain transport refuses promotion preserving prior site`; postapproval main/descriptor checks |
| II-07 | `binder records actual upload ID and post-upload raw tar hash separately from service digest`; `run guard uses the actual clock before at and after expiry and rejects forged extended expiry`; independent Task 5 Actions/security review |
| II-08 | Current exact CLI, compact/site byte gates, complete identity/inventory/tar/unpack equality, private/raw exclusion and final178-code-binding rehash |
| II-09 | Real operator composition tests for exactly refresh/initial-import origins; `rejects initial-source transport and source registry records as recovery authority`; independent Task 6 provenance-security review |
| II-10 / AC-009-4/5 | Open: real approved source upload/readback/registry, hosted same-run/public outcome, durable backup/recovery and operational acceptance |

## Handoff and review boundary

Both exact CLI forms, five-file output, mode/operator/transport/run/clock schemas, October 23
warning date, two-path backup admission and future gates are documented in
[operator contract](../publication/README.md#initial-import-local-implementation--2026-10-21) and
[runbook](../docs/deployment.md#initial-import-operational-gates--2026-10-21). Scheduling and
publication remain default-off. No upload/tag/Release, settings change, dispatch, environment
approval, deployment, backup adoption, commit/push/PR/merge or recurrence occurred.

Task 7 independent scoped spec/quality review is Approved; final independent whole-diff review is Approved for local technical delivery. The
[review record](review-2026-10-21-task-009-initial-import.md) and
[security record](security-2026-10-21-task-009-initial-import.md) distinguish earlier Approved
scoped reviews from the final Approved whole-diff verdict. Later code changes must retain this proof's original exact
binding, with justified fresh focused/full checks and honest proof scope. Real source assets,
protected-main CI, attribution/resources/protections, full-data/physical/mobile performance,
hosted/public equality/deployment outcome, complete durable backup/recovery and routine policy
remain separate. No milestone or handbook gate closes.

## Administrative review update

Independent Task 7 scoped spec/quality review is Approved in private `task-7-review.md`, exact
checkpoint `task-7-review-100303476184.diff`, with no Critical/Important findings. M1 is the
already disclosed five pre-existing informational `useTemplate` notices, nonblocking/no fix;
no heavy rerun was requested. The controller's fresh `controller-final-preservation.json`
confirms all 178 actual-proof code bindings equal the host, original 73 files/exact Git status
and four prior report/spec hashes unchanged. Only current status records changed afterward;
proof/source/config/test/workflow bytes remain untouched. Final independent whole-diff review is Approved for local technical delivery.

## Final independent verdict — administrative record

Final independent whole-diff review is **Approved for local delivery on technical quality** in
private `final-whole-review.md`, covering checkpoint `whole-review-100856954058.diff`
(SHA-256 `e6808de92225e08b9dfe2dcd20b9f68f6ca9af968ef3926638ebc3fad76f8f35`).
Findings: 0 Critical, 0 Important, 0 new Minor. Existing M1 remains the five disclosed
informational `useTemplate` notices, nonblocking/no fix. No corrective wave or heavy rerun
was requested. This external verdict closes local plan review/delivery only; no commit,
protected-main integration, source upload/activation, deployment, recovery, recurrence,
hosted acceptance or milestone authorization follows. Historical proof/core/artifact bindings
remain unchanged; only administrative status records changed after the reviewed checkpoint.
