<!--
Purpose:        Resolve the evidence state and exact remaining decisions for TASK-008 quality gates
Owner:          Researcher / Planner
Update Trigger: When a reviewed status-pair contract, quality policy, or bootstrap baseline is approved
Harness Version: 1.1
-->

# TASK-008 Production Quality and Bootstrap Gates

Date: 2026-09-16. Status: evidence review complete; policy, status-pair acceptance, and
bootstrap remain unapproved. This report does not change status mapping, validation behavior,
thresholds, configuration, task state, or publication state.

## Question

Which TASK-008 acceptance gates can be closed from existing evidence, and which exact decisions
still block a production validation policy and initial baseline?

## Scope

This review uses the source PRD, accepted ADR-013/014/016, the checked-in 2026-09-12 complete
source observations, the latest successful 2026-09-13 hosted observation, the current validator
and publication configuration contracts, and existing test/review reports. It does not read the
Korean handbook, contact the provider, collect another archive, create a production policy,
create `publication/config.json`, bootstrap, deploy, or change a mapping.

## Result

Three conclusions are actionable now:

1. The source PRD is accessible on this host. The unchecked "obtain source PRD" gate and the
   active-task risk that says the PRD is unavailable are obsolete. The PRD supplies required
   checks, but it does not supply numeric production thresholds.
2. There are two complete observations of different daily archives. They show a small positive
   one-day change and a stable set of 23 empty categories, but they do not establish safe normal
   variation limits, especially for decreases or longer source corrections.
3. Keeping raw pairs `05` / `"제외/삭제/전출"` and `06` / `"기타"` mapped to
   `"확인되지 않음"` is the safe display behavior, but that behavior alone cannot produce an
   accepted refresh. The validator raises `aggregate_pair_review_required` before it evaluates
   policy, and `ValidationPolicyV1` has no reviewed-unknown allowlist. A policy file cannot waive
   this result. Production acceptance therefore needs a separately approved validator acceptance
   contract for exact reviewed-but-unverified pairs, or it remains blocked. No display remapping is
   required or recommended.

## Verified Facts

### Source PRD access and requirements

The source PRD is present at
`/Users/sonmyeong-gwan/Documents/Codex/2026-08-18/new-chat/outputs/zero-cost-open-business-dashboard-prd.md`.
It is 21,377 bytes, was last modified on 2026-08-20, and has SHA-256
`33f3bcb2f0c9f7e03b7edb5acdffe8cad054b0716fa578ed3be5eef8495b91b7`.

The relevant requirements agree with the implemented evidence-gated direction:

| PRD requirement | Required evidence | Current state |
|---|---|---|
| FR-08 | Display the data date | ADR-016 authorizes an explicitly labeled collection date while source coverage remains unverified. This is implemented; it is not proof of source coverage. |
| FR-13 and Section 12.3 | Preserve the previous good data when refresh validation fails | Staged replacement and deployed-baseline binding are implemented and tested. Publication approval remains separate. |
| FR-14 | Warn on stale data | The current constitution and ADR-016 require a warning at collection age >= 7 Seoul days. |
| Section 16.2 | Check count drops/increases, duplicate IDs, blank name/address rates, status-list changes, a data date, and JSON syntax/size | The validator exposes these checks or fail-closed transformation checks. Production values are unapproved. |
| Section 17 | Never classify no result or an unknown status as operating/closed; preserve last good data | Current conservative mapping and staging behavior satisfy the bounded implementation direction. |
| Section 18 | Measure 30-day refresh success and freshness | No 30-day operational evidence exists. This is not a source for daily quality thresholds. |

The PRD contains no numerical limits for record change, per-category change, missing-field rates,
status-share drift, category emptiness, or JSON data bytes. It therefore cannot fill the policy
fields without a separate reviewed calibration decision.

Collection-date mode resolved the date-basis choice under ADR-016. Source coverage remains an
explicit warning, not a proven fact. It is not a validator acceptance blocker in collection mode,
but the project must not mark source coverage as verified.

### Two complete changed-archive observations

The checked-in 2026-09-12 bounded observation and the latest successful hosted observation are
complete and use the same 195-entry schema contract. The second observation is preserved with its
original decoded bytes in the [2026-09-13 hosted source receipt](observation-2026-09-13-hosted-source.json.raw)
from [run 34746029824](https://github.com/internalforces/open-store-searcher/actions/runs/34746029824)
at commit `7a1dd37ed0647707f3965a5ac49be9b7fce1d1f8`. Its decoded observation SHA-256 is
`f05984f434ff5553d65e5c22b50bf657e8ec65238be9d7c57c3b144cdd8d3b60`, matching the hash printed
by the run. The `.json.raw` extension keeps these exact minified source bytes outside JSON
formatting scope; the file content parses as JSON. The exact extracted decision scopes are
preserved separately in the
[unapproved quality decision inputs](decision-inputs-2026-09-16-task-008-quality.json), SHA-256
`a28cb65d3b3d5cee673b32d24934284dccdac273206e918e1458b3cb0287aa68`.

| Metric | 2026-09-12 observation | 2026-09-13 observation | Observed change |
|---|---:|---:|---:|
| Archive SHA-256 | `e2eeb1a868a2bfb94dbc9d193dae74707c0e27e38230376d5ad105e174a69faa` | `edb4be5b859ef0a8eaca0cd2a96f58ac82911d3db59775ecf9417d9beabf87ce` | Different complete archive |
| Archive bytes | 216,440,796 | 216,485,056 | +44,260 |
| Records | 2,939,947 | 2,940,404 | +457 (+0.01554%) |
| Categories with increased counts | n/a | 41 | 41 |
| Categories with decreased counts | n/a | 0 | 0 |
| Categories unchanged | n/a | 154 | 154 |
| Empty categories | 23 | 23 | Same exact ID set |
| Missing normalized names | 29 | 29 | 0 |
| Missing both normalized addresses | 0 | 0 | 0 |
| Unknown-pair records | 187,173 | 187,222 | +49 |
| Display `"행정상 영업"` | 977,991 | 978,170 | +179 |
| Display `"휴업"` | 3,778 | 3,779 | +1 |
| Display `"폐업"` | 1,577,255 | 1,577,479 | +224 |
| Display `"확인되지 않음"` | 380,923 | 380,976 | +53 |
| Collision groups | 1,121,711 | 1,121,894 | +183 |
| Collision participants | 2,735,507 | 2,735,961 | +454 |
| Legacy observation dataset bytes | 2,439,358,850 | 2,439,752,287 | +393,437 |

All 41 changed categories increased; the largest increase was 220 records in category `15045060`.
This pair of observations provides no empirical evidence for a permissible decrease. Treating zero
decrease as a production limit would convert absence of evidence into a threshold. It also provides
only one transition, so its maxima cannot represent daily, weekly, delayed-run, or source-correction
behavior.

### Exact 05/06 disposition

The aggregate pair vocabulary remained exactly six pairs in both observations. No new literal
pair appeared.

| Exact raw pair | 2026-09-12 | 2026-09-13 | Categories on 2026-09-13 | Display mapping |
|---|---:|---:|---:|---|
| `05` / `"제외/삭제/전출"` | 187,150 | 187,199 | 66 | `"확인되지 않음"` |
| `06` / `"기타"` | 23 | 23 | 2 | `"확인되지 않음"` |
| Combined | 187,173 | 187,222 | 68 | `"확인되지 않음"` |

Category `15045060` (`생활_통신판매업.csv`) contains 136,497 of the 2026-09-13 combined
unknown-pair records, about 72.9%. The exact `06` pair occurs only in `15045089` (21 records) and
`15045092` (2 records). The observations establish presence and exact spelling; they do not
establish official semantics. The prior official status research documents only exact aggregate
pairs `01` through `04`.

ADR-013 must remain unchanged: `01`, `02`, and `03` map to the three verified display states;
`04`, `05`, `06`, and every other unsafe pair remain `"확인되지 않음"`. A change that merely
acknowledges exact 05/06 literals for refresh validation need not and should not reclassify their
display status.

The current validator cannot express that distinction in configuration:

- `knownAggregatePair` recognizes mapped `01` through `03` plus exact mixed pair `04`.
- `05` and `06` contribute to `unknownPairCount`.
- every category with a positive `unknownPairCount` receives an unconditional
  `aggregate_pair_review_required` diagnostic before policy comparison;
- every review diagnostic makes the result `review_required`; and
- `ValidationPolicyV1` has no pair-review field or allowlist.

Consequently, approving only count/rate thresholds, a baseline, and the current display mapping
still cannot make the observed candidate acceptable. Removing those rows, raising a numeric limit,
or remapping them would violate the existing safety intent.

### Empty categories

The same 23 categories were complete zero-row CSVs in both changed archives:

| ID | Contract entry |
|---|---|
| `15006727` | `기타_국제물류주선업.csv` |
| `15044963` | `생활_의료기관세탁물처리업.csv` |
| `15044965` | `문화_관광펜션업.csv` |
| `15044988` | `자원환경_전력기술설계업체.csv` |
| `15044989` | `자원환경_전력기술감리업체.csv` |
| `15044993` | `자원환경_일반도시가스업체.csv` |
| `15045012` | `식품_옹기류제조업.csv` |
| `15045019` | `문화_음반물제작업.csv` |
| `15045022` | `문화_음반물배급업.csv` |
| `15045031` | `건강_응급환자이송업.csv` |
| `15045040` | `생활_등록체육시설업.csv` |
| `15045041` | `생활_승마장업.csv` |
| `15045043` | `생활_스키장.csv` |
| `15045051` | `동물_부화업.csv` |
| `15045053` | `동물_도축업.csv` |
| `15045055` | `식품_집유업.csv` |
| `15045056` | `동물_가축인공수정소.csv` |
| `15045065` | `자원환경_환경관리대행기관.csv` |
| `15045083` | `문화_관광궤도업.csv` |
| `15045114` | `문화_지방문화원.csv` |
| `15045115` | `자원환경_급수공사대행업.csv` |
| `15101548` | `동물_종축업.csv` |
| `15113628` | `문화_농어촌민박업.csv` |

Complete extraction, parsing, and category presence distinguish these from missing or failed
categories. Repetition across two changed archives is evidence for a reviewed bootstrap list, but
it is not provider documentation that these categories must always remain empty. Under the current
validator, the policy must list every permitted empty category explicitly; any unlisted empty
category rejects, and zero-to-positive change requires review.

## Exact Policy and Bootstrap Inputs Requiring Review

`publication/config.json` remains intentionally absent. A complete reviewed configuration needs
all of the following; synthetic fixture values are not production evidence.

### `policy: ValidationPolicyV1`

| Field | Required review |
|---|---|
| `version` | Must be `1`. |
| `revision` | Nonempty reviewed policy revision; it binds the baseline, manifest, and release. |
| `evidenceReference` | Review record supporting the policy as a whole. |
| `maxJsonBytes` | Positive safe integer for all staged compact JSON assets plus baseline and release metadata. The separate 1 GB complete-site guard is a hosting ceiling, not automatic approval of this quality limit. |
| `allowedEmptyCategories` | Unique category IDs. The 23 repeated empty IDs above are evidence candidates, not automatically approved. |
| `total` | One complete `MetricLimitsV1` for aggregate metrics. |
| `categories` | One complete `MetricLimitsV1` for each of all 195 exact contract IDs; missing, unknown, or partial coverage is invalid or incomplete. |

Every total/category `MetricLimitsV1` requires:

- `evidenceReference`;
- integer `minCount` and `maxCount`, with `minCount <= maxCount`;
- integer `maxAbsoluteCountChange`;
- finite nonnegative `maxRelativeCountChange`;
- `maxMissingNameRate` in `[0, 1]`;
- `maxMissingBothAddressRate` in `[0, 1]`; and
- `maxStatusShareChange` in `[0, 1]` for each exact display key:
  `"행정상 영업"`, `"휴업"`, `"폐업"`, and `"확인되지 않음"`.

The two observations can populate measured baseline metrics. They cannot justify these limit
values. In particular, there is no observed decrease and only one observed status-share transition.

### Initial `baseline: ValidationBaselineV1`

Human review must select and preserve one complete observation as the initial baseline. The latest
2026-09-13 receipt is the strongest existing candidate because it is the latest complete changed
archive and includes full metrics, but this recommendation is not approval. The baseline requires:

- `dateBasis: "collection"`;
- `validationVersion: 1`, `schemaVersion: 2`, `identifierContractVersion: 1`, and
  `normalizationContractVersion: 1`;
- `policyRevision` exactly matching the reviewed policy;
- exact `archiveSha256` and `schemaManifestSha256`;
- the Seoul collection `dataAsOf` date;
- a nonempty review `evidenceReference`; and
- structurally valid total and all-195-category metrics.

The baseline is evidence, not permission to exceed policy, waive unknown pairs, or claim source
coverage. An incompatible policy/schema/category/mapping/normalization version must not fall back
to a new baseline automatically.

### Operational configuration and bootstrap controls

The reviewed configuration also requires:

- `previousReleaseUrl`: credential-free HTTPS, ending in `/release.json`, with no query or fragment;
- positive safe integers `maxEntryBytes`, `maxTotalRows`, and `entryTimeoutMs`; and
- `baseline` only for the explicitly selected initial bootstrap.

Bootstrap is manual only. `--bootstrap` must be selected explicitly, the configured release URL
must return an actual HTTP 404, and the reviewed baseline must use collection-date mode. An existing
release, redirect, authentication/server response, timeout, or request failure aborts. Scheduled
runs never bootstrap. After first publication, refreshes must use the hash- and metadata-bound
baseline from the deployed release.

## Minimal Safe Status-Pair Proposal — Unapproved

The smallest safe design is a validator acceptance extension, not a display mapping change and not
a numeric threshold. It should add a reviewed, category-bound exact-pair contract with these
properties:

1. Preserve `mapLicenseStatusV1` and every 05/06 record as `"확인되지 않음"`.
2. Record exact `(code, name, categoryId)` scopes. For current evidence, `05` is scoped to its 66
   observed categories and `06` only to `15045089` and `15045092`.
3. Bind the review to a new revision, validation/schema/mapping versions, the schema-manifest hash,
   the two evidence archive hashes, the 2026-09-13 observation hash, and a human review reference.
4. During validation, suppress `aggregate_pair_review_required` only for an exact listed pair in
   an exact listed category. Keep its records in the unverified display bucket and in the raw pair
   and `unknownPairCount` metrics so drift remains visible.
5. Stop on any new spelling, code/name mismatch, missing/partial pair, or listed pair appearing in
   an unlisted category. A count threshold must never make a new pair acceptable.
6. Preserve all records and raw evidence. Do not drop 05/06 rows or interpret detailed statuses.
7. Require explicit human approval because this changes the validator acceptance contract even
   though it does not change the user-visible status mapping.

This design allows humans to acknowledge known unverified source values without asserting that
they mean operating, suspended, or closed. The existing official research documents only 01-04,
so approval should state whether the two complete provider archives plus conservative unverified
display are sufficient evidence, or require new authoritative provider documentation first.

## Exact Remaining Acceptance Blockers

| Blocker | Decision/evidence needed | Why existing evidence is insufficient |
|---|---|---|
| 05/06 validator acceptance | Approve a category-bound reviewed-unverified pair contract, or obtain stronger official evidence and then approve it | Current policy cannot waive the unconditional review; mapping them remains unsafe. |
| Numeric quality policy | Approve every total and 195-category count, change, missing-rate, status-share, and JSON-byte field with evidence | Two archives provide only one, all-positive transition and no longer-run or correction behavior. |
| Empty-category policy | Approve the exact allowed list and its evidence basis | The same 23 are empty twice, but provider permanence is unverified. |
| Initial baseline | Select a complete observation, bind it to the approved policy revision, and retain a review reference | Observation is complete but explicitly `publicationApproved: false` and `policyRevision: null`. |
| Production config revalidation | Run the unchanged complete validator using the approved pair contract, policy, and baseline and obtain `accepted` | Current observations correctly return `review_required`. |
| Independent approval | Review the final evidence/config and rerun bounded/hosted checks | Research evidence cannot self-approve a release input. |

The following are no longer TASK-008 evidence blockers:

- **Source PRD access:** the file is present and relevant requirements have been compared above.
- **Source coverage assertion in collection mode:** ADR-016 intentionally retains
  `source_coverage_unverified`; publication must keep the warning and must not claim coverage.
- **Complete row observation:** both 2026-09-12 and 2026-09-13 complete all 195 categories with
  zero parser errors.

## What Can Be Completed Now

Completed in this pass without inventing or approving policy:

1. Preserved the original decoded run 34746029824 receipt and verified its printed observation
   hash, so the latest baseline candidate is reviewable outside transient logs.
2. Preserved the exact per-category 05/06 counts, the 23 empty categories, source and schema
   hashes, both observation hashes, and explicit unapproved restrictions in the decision-input
   artifact.
3. Supplied the evidence needed for the parent task owner to mark the source-PRD access/comparison
   criterion complete and remove the obsolete unavailable-PRD risk wording.

The next authorized decision work is to present the reviewed-unverified pair proposal for human
approval. Numeric policy preparation still requires independent daily aggregate observations over
a stated calibration interval. Repeated downloads of identical bytes must not count as independent
observations.

TASK-008 cannot be marked complete from the current evidence because the first five blockers in
the preceding table remain open. No production threshold should be copied from the 2026-09-12 or
2026-09-13 snapshot, from synthetic tests, from the 1 GB Pages ceiling, or from the measured compact
site size.

## Sources

- Source PRD, Sections 10, 12-14, and 16-19, at the path and hash recorded above.
- `AGENTS.md`; `memory/decisions.md` ADR-013, ADR-014, and ADR-016.
- `docs/superpowers/specs/2026-09-04-task-008-validation-design.md`.
- `reports/research-2026-09-02-status-mapping.md`.
- `reports/research-2026-09-04-task-008-completion-gates.md`.
- `reports/research-2026-09-12-quality-resumption.md`.
- `reports/observation-2026-09-12-bounded-source.json`.
- `reports/observation-2026-09-12-ubuntu-bounded-source.json`.
- `reports/observation-2026-09-13-hosted-source.json.raw` (JSON content with original decoded receipt bytes).
- `reports/decision-inputs-2026-09-16-task-008-quality.json` (unapproved exact review inputs).
- `reports/test-2026-09-12-bounded-source.md`.
- GitHub Actions run 34746029824 and its hash-verified observation payload.
- `src/pipeline/refresh-validation-types.ts`.
- `src/pipeline/refresh-validation-metrics.ts`.
- `src/pipeline/validate-license-refresh.ts`.
- `src/pipeline/read-deployed-baseline.ts`.
- `scripts/stage-refresh.mjs`.
- `publication/README.md`.
