# TASK-009 Retained-Source Initial Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task, preserving the previously selected TASK-009 implementation/independent-review method unless the human changes it. Steps use checkbox (`- [ ]`) syntax. The user approved this detailed plan and authorized local implementation, verification, and independent task review on 2026-10-21. Upload and deployment remain withheld.

**Goal:** Prepare a verified first-publication artifact from the exact approved October 16 original source, preserving every existing quality criterion and stopping before upload or deployment.

**Architecture:** A separate inactive current-main source registry selects immutable same-repository Release source assets. A manual importer verifies historical source evidence, reruns current production inspection/parsing/staging, then builds and inventories one complete publication artifact. Ordinary refresh stays live-only; later successful first-import backups use a narrowly extended origin allowlist, with existing deployment/history/public-verification authority intact.

**Tech Stack:** Existing TypeScript, Node.js 24.19.0, npm 11.17.0, Ubuntu 24.04, Linux Info-ZIP, Vite SSR, Vitest, Node test runner and existing pinned GitHub Actions. No dependency, service or runner addition.

**Spec:** [Approved initial-import design](../specs/2026-10-20-task-009-initial-import-design.md), approved by the user on 2026-10-21; [source selection](../../../memory/decisions.md#task-009-initial-source-selected--2026-10-20). Local execution approved by the user on 2026-10-21.

## Global Constraints

- TASK-009 only; TASK-010 and recurring operation remain paused. Reuse `codex/task-009-first-publication-analysis` in the calibration checkout. Preserve all earlier uncommitted analysis/design, branches, private receipts and original-checkout files.
- Source ID `seoul-2026-10-16-initial`; archive SHA-256 `c90758c2d3922e78d636ab2c9967b80c690bdcd8aeca283cf9f6ecc2cc992352`, 217,307,219 bytes, original collection `2026-10-16T01:52:52.043Z`, 195 categories / 2,951,024 rows, null source coverage.
- Original observation file SHA-256 `3d23a3c770b24039a6690f2db8022eb610ffb5b56a9efee031f78b78918b4626`, 356,005 bytes; canonical historical collection SHA-256 `3817b6e8d7621c12c7ce4a3b5ae8c581c28340284ec001737900a2744d6ac22b`.
- Schema-manifest SHA-256 `6254a2b3d6626c41f625bb98d79399bdd40318632ce0d54561a997fdd039ceb6`.
- Policy revision `task-008-calibration-2026-10-16-v1-proposed`; canonical policy SHA-256 `090973f79398f45d52262958e2887497652cec13b4d95b608eb84c691070feff`; initial-baseline SHA-256 `9234ed3297166a08b500356ac01f5bcd150276c04a2bdd129d399fa0bdc6b183`; reviewed-pair SHA-256 `d698ac34c7485c9e09dfec425a0195bcc56d9644f25479aefc350c5969998cb2`.
- Node `JSON.stringify(object)` UTF-8 without newline defines canonical object hashes. Exact file hashes bind file bytes. Preserve all three approved quality objects and 23 empty-category IDs in both configuration files byte-for-byte; never regenerate either file during this work.
- `maxJsonBytes=691319965`, `maxEntryBytes=536870912`, `maxTotalRows=3000000`, `entryTimeoutMs=120000`; no count/share tolerance, synthetic policy, rebasing, row filtering or observation-mode acceptance.
- Site `https://internalforces.github.io/open-store-searcher/`; descriptor `https://internalforces.github.io/open-store-searcher/release.json`. Initial import requires direct 404; source/transport/import/build dates are distinct. Warning starts at age >=7 Seoul calendar days, October 23 for this source.
- Source transport tag `initial-source-seoul-2026-10-16`, assets `seoul-source-2026-10-16.zip` and `source-observation.json`. Actual IDs/tag target must come from a later approved upload/readback; never populate production with fixture IDs.
- Prepare stays `contents:read`; protected deploy alone gets existing `contents:read`, `pages:write`, `id-token:write`. No `actions:read`, `contents:write`, new secret/action/package or self-hosted runner. Retain default-off schedule/publication flags and shared `pages-publication` concurrency.
- No upload, tag/Release creation, source-registry activation, repository settings, workflow dispatch, environment approval, deployment, backup adoption, push/PR/merge or recurrence is authorized. Future operational instructions are a separate non-executable gate list below.
- Do not access `.env`/secrets or `handbook/ko/**`. Keep raw data, big artifacts and code/proof fingerprints outside Git; harness prose remains English.
- Each implementation task gets focused red/green verification and independent spec/quality review before its consumer begins. Actions/security review is additionally required for Tasks 5–6. Commit checkpoints are future local execution steps only when authorized, never on main/master or including unrelated earlier edits.

## Review Focus

- A downloaded observation is valid JSON but carries rewritten collection time or a new baseline: reject its exact binding and preserve historical age/quality (Tasks 1–3).
- An approved asset ID disappears or its tag/metadata changes during streaming: refuse promotion, cancel/clean only owned downloads, and do not switch to the live provider (Task 2).
- The deployed descriptor appears during a long import, after preparation or while environment approval waits: refuse the first-import artifact without touching the existing site (Tasks 4–5).
- A preparation is local, stale, from another run/SHA, or at/after one-day expiry: it cannot supply a hosted deployment even if its tar is otherwise valid (Tasks 4–5).
- A successful initial-import backup uses a new workflow path: admit exactly that path while still rejecting source assets, false successful-history claims and unverified public bytes (Task 6).

---

## File and responsibility map

All paths are repository-relative. New paths below are planned, not existing implementation.

| Task / ownership | Create or modify | Responsibility |
| --- | --- | --- |
| 1 — authority | Create `src/pipeline/initial-import-types.ts`, `src/pipeline/initial-import-approval.ts`, `src/pipeline/initial-import-approval.test.ts`, `tests/fixtures/initial-import.ts`, `publication/initial-import-approvals.json` | Immutable selection, strict config/registry contracts and inactive authority. |
| 2 — transport | Create `src/pipeline/initial-source-download.ts`, `src/pipeline/initial-source-download.test.ts` | Bounded exact-asset reads, tag/metadata continuity and owned download transaction. |
| 3 — staging | Create `src/pipeline/stage-initial-source.ts`, `src/pipeline/stage-initial-source.test.ts` | Historical observation admission, safe input reads, fresh ZIP inspection, complete production staging and retained dates. |
| 4 — operators | Create `scripts/initial-import-support.mjs`, `scripts/stage-initial-import.mjs`, `scripts/verify-initial-import.mjs`, `scripts/initial-import-operators.test.mjs` | Hosted/local composition, build/inspection/GNU tar, absence checks and atomic complete output. |
| 5 — workflow | Create `src/pipeline/initial-import-run.ts`, `src/pipeline/initial-import-run.test.ts`, `scripts/bind-initial-import-run.mjs`, `scripts/check-initial-import-run.mjs`, `.github/workflows/initial-import.yml`; extend `scripts/initial-import-operators.test.mjs`, `scripts/check-publication-workflows.test.mjs`, `.github/workflows/verify.yml` and the Node-check list only in `.github/workflows/refresh.yml` | Same-run metadata binding, postapproval guards, read-only CI coverage and inactive manual workflow. |
| 6 — recovery continuity | Modify `src/pipeline/recovery-approval.ts`, `src/pipeline/recovery-approval.test.ts`, `scripts/publication-operators.test.mjs` | Exact two-path origin admission, with all existing recovery authority preserved. |
| 7 — evidence/docs | Update `publication/README.md`, `docs/deployment.md`, `tasks/active.md`, `memory/{session,project,architecture,decisions}.md`, `docs/prd-traceability.md`; create `reports/{test,review,security}-2026-10-21-task-009-initial-import.md` and `reports/verification-2026-10-21-task-009-initial-import.json` | Actual local raw-source proof, accumulated checks, independent review and precise remaining gates. |

Reuse `inspectArchive`, `UnzipArchiveAdapter`, `iterateLicenseCsv`, `stageBoundedRelease`, `readRecoveryResource`, `readDeployedBaseline`, `verifyPublicationDirectory`, `inventoryBytes`, `newOutput`, `trustedCode`, `build-publication.mjs` and `check-publication-state.mjs`. Do not restructure these modules or change collector, validator, status mapper, codecs, public URL or current config values merely to implement the importer.

## Shared interfaces fixed before consumers

Task 1 owns the following definitions in `initial-import-types.ts`:

- `INITIAL_SOURCE`: frozen selected values from Global Constraints, including purpose `initial-publication-recovery-verification`, asset names and canonical hashes; never derive approval from the downloaded observation.
- `InitialImportConfigV1`: the exact seven current `publication/config.json` keys: `previousReleaseUrl`, `policy:ValidationPolicyV1`, `baseline:ValidationBaselineV1`, `reviewedUnverifiedPairs:ReviewedUnverifiedPairsContractV1`, `maxEntryBytes`, `maxTotalRows`, `entryTimeoutMs`. Fix URL/resource/hash values as above.
- `InitialSourceApprovalV1`: the exact source-entry fields in the spec table; `archive`/`observation` use existing `ByteBinding`, and `assets.archive`/`assets.observation` use `{id,name,byteLength,sha256}`. Require real-format positive safe integers, fixed tag, 40-lowercase-hex `tagCommit`, unique asset IDs and exact role/name/hash/length bindings.
- `InitialImportRegistryV1`: `{version:1,kind:'initial-source-approvals',repository:string,siteUrl:string,activeSourceId:string|null,sources:InitialSourceApprovalV1[]}` with fixed repository/site, max one source and exact active-ID admission. Null/empty is a valid inactive record, never selected authority.
- `InitialReleaseTransportV1`: `{kind:'github-release',releaseId,tag,tagCommit,assets:{archive,observation},downloadedAt}` matching the validated authority. `InitialLocalTransportV1`: `{kind:'local-proof'}`; no invented Release/run/deployment IDs.
- `InitialSourceFilesV1`: `{archivePath:string,observationPath:string,transport:InitialReleaseTransportV1|InitialLocalTransportV1}`.
- `InitialOperatorV1`: `{commit:string,uncommitted:boolean,codeBindings:Record<string,ByteBinding>,runId:number|null}`. Hosted mode requires clean trusted current-main/GitHub SHA and actual run ID. Local dirty snapshots record base SHA plus exact current file bindings; never describe base SHA as the complete uncommitted implementation.
- `RetainedSourceImportReceiptV1`: strict `{version:1,kind:'retained-source-import-verified',sourceId,mode:'hosted'|'local-proof',archive,observation,collectedAt,sourceDataAsOf:null,schemaManifestSha256,categoryCount:195,recordCount:2951024,policyRevision,policyCanonicalSha256,baselineCanonicalSha256,reviewedPairsCanonicalSha256,validationNow,verifiedAt,operator,transport,warnings:ValidationDiagnosticV1[]}`.
- `InitialPreparationV1`: strict `{version:1,kind:'initial-publication-prepared',mode:'hosted'|'local-proof',sourceId:string,operator:InitialOperatorV1,sourceReceipt:ByteBinding,identity:PublicationIdentityV1,inventory:ByteBinding,tar:ByteBinding,preparedAt:string,expiresAt:string,precondition}`. Hosted `precondition` is `{status:404,releaseSha256:null}`; local proof uses `null` and cannot bind a hosted run. `expiresAt` is exactly `preparedAt+24h`.

Use existing shared validation/recovery type imports. Do not add two copies of a type or a general-purpose policy engine. JSON receipts use current `writeJson` canonical object-plus-newline bytes; the approved object hashes retain the no-newline convention.

## Task 1: Immutable source selection and inactive approval registry

**Files:** Task 1 ownership above. **Depends on:** approved spec only. **Covers:** II-01; first Review Focus item.

**Interfaces produced:**

- `validateInitialImportConfig(value:unknown):InitialImportConfigV1`.
- `validateInitialSourceApproval(value:unknown):InitialSourceApprovalV1`.
- `selectInitialSourceApproval(registry:unknown,sourceId:string,config:InitialImportConfigV1):InitialSourceApprovalV1`.
- Test-only `createInitialImportFixture():{config:InitialImportConfigV1,registry:InitialImportRegistryV1,approval:InitialSourceApprovalV1,observation:unknown}`. Load real approved config/observation, clone in memory and use explicitly synthetic transport IDs; never write them to production.

- [x] **Step 1: Add behavior tests** for selected values, canonical hashes, zero-change policy preservation, inactive registry, unknown/extra fields, duplicate/unsafe IDs, wrong source/date/coverage/tag/URL, altered policy/baseline/pair contract, resource overrides and numeric-serialization identity.

```ts
const { config, registry } = createInitialImportFixture();
expect(() => selectInitialSourceApproval({ ...registry, activeSourceId: null }, INITIAL_SOURCE.id, config)).toThrow();
const altered = structuredClone(config);
altered.policy.categories['15045103']!.maxAbsoluteCountChange = 1;
expect(() => validateInitialImportConfig(altered)).toThrow();
expect(INITIAL_SOURCE.archive.byteLength).toBe(217307219);
```

- [x] **Step 2: Observe focused RED**: `npx --no-install vitest run --project=pipeline src/pipeline/initial-import-approval.test.ts`; failure must identify missing behavior, not a fixture/environment error.
- [x] **Step 3: Implement the exact contracts and pure validators**. Enforce exact registry shape `{version:1,kind:'initial-source-approvals',repository,siteUrl,activeSourceId,sources}`; initial file has null/empty selection. Permit at most the one selected source; selecting null/inactive authority throws before any I/O. Reject changed canonical objects, not merely changed revision strings.
- [x] **Step 4: Run focused GREEN and typecheck**: previous command and `npm run typecheck`, exit 0. Read the production registry back and require `activeSourceId:null,sources:[]`; both approved configuration files must retain pre-task SHA-256 values.
- [x] **Step 5: Obtain independent spec/quality review** of authority and frozen object identity. Record only local evidence. If local commit is authorized, checkpoint only owned files with `feat(initial-import): define exact retained-source authority`; otherwise preserve the reviewed diff.

## Task 2: Bounded same-repository source transport

**Files:** Task 2 ownership above. **Depends on:** Task 1 Approved. **Covers:** II-02; asset replacement Review Focus.

**Interfaces produced in `initial-source-download.ts`:**

- `downloadInitialAsset(asset:{id:number,name:string,byteLength:number,sha256:string},newFile:string,fetcher:typeof fetch=fetch):Promise<ByteBinding>`; fixed repository API endpoint only, owned regular output, streamed exact binding.
- `downloadInitialSource(approval:InitialSourceApprovalV1,newDirectory:string,fetcher:typeof fetch=fetch):Promise<InitialSourceFilesV1>`; validate selected authority again before output creation; return only complete verified Release transport.

- [x] **Step 1: Add tests** for real streamed small-byte hashing/cancellation via the low-level asset primitive, and high-level metadata/role/tag-chain admission. Test a replacement between before/after metadata reads, same name with another ID, another repository, non-uploaded/draft asset, missing/duplicate roles, byte truncation/overflow, malicious redirects, timeout, short write and cleanup failure.

```ts
await expect(downloadInitialAsset(bindingFor(Buffer.from('abc')), output, truncatedFetch)).rejects.toThrow();
expect(await exists(output)).toBe(false);
await expect(downloadInitialSource(approval, directory, replacedAssetFetch)).rejects.toThrow();
expect(providerFetches).toBe(0);
```

`bindingFor(bytes)` is a local test helper returning a synthetic positive asset ID, the fixed archive asset name and the exact supplied bytes' length/SHA-256; fake fetch routes serve only test bytes. Low-level small bindings are not source approvals. High-level admission stays pinned to the actual selected hashes; the full 217 MB happy path belongs to Task 7, not a production synthetic-data switch.

- [x] **Step 2: Observe focused RED**: `npx --no-install vitest run --project=pipeline src/pipeline/initial-source-download.test.ts`.
- [x] **Step 3: Implement transport only**, using `readRecoveryResource` for <=1 MiB JSON and exact-length binary streaming. Preserve its five-redirect limit, 30-second inactivity and 15-minute overall deadline; do not loosen them. Check same-repository API URLs, published Release, exact tag target (cycle detection/max five annotated-tag hops), both asset metadata sets before/after download, lengths and independently computed hashes. Never log signed redirect URLs/body/credentials. Remove only operation-owned partial output.
- [x] **Step 4: Run GREEN and existing reader regressions**: `npx --no-install vitest run --project=pipeline src/pipeline/initial-source-download.test.ts src/pipeline/recovery-download.test.ts`; exit 0. Assert no real network in all fixture tests and no source-provider fallback. Retain both config hashes.
- [x] **Step 5: Obtain independent spec/quality review** of metadata continuity, output ownership, cancellations and authority-before-materialization. Conditional local checkpoint: `feat(initial-import): verify exact source asset downloads`.

## Task 3: Historical evidence and full unchanged production staging

**Files:** Task 3 ownership above. **Depends on:** Task 1; Task 2 for hosted inputs. **Covers:** II-03/04/05, rewritten-date Review Focus.

**Interfaces produced in `stage-initial-source.ts`:**

- `readInitialObservation(bytes:Uint8Array,archivePath:string):Omit<Extract<CollectionResult,{kind:'accepted'}>,'archivePath'> & {archivePath:string}`: check exact observation bytes/canonical collection, return historical provider evidence with only the local path supplied by the caller.
- `stageInitialSource(config:InitialImportConfigV1,files:InitialSourceFilesV1,newOutput:string,context:{now:string,operator:InitialOperatorV1}):Promise<{stageDirectory:string,metrics:ValidationMetricsV1,receipt:RetainedSourceImportReceiptV1}>`.

- [x] **Step 1: Add tests** using the actual small committed observation and module-level trusted I/O seams for argument/cleanup assertions. Verify altered UTF-8/JSON/date/policy binding rejects, input symlinks/mutation reject, inspection failure/duplicate or missing category rejects, wrong final metrics reject, and interrupted staging removes only its scratch. Prove existing zero-change rejection through the actual validator; do not introduce a synthetic production acceptance flag.

```ts
expect(readInitialObservation(observationBytes, zipPath).fetchedAt).toBe('2026-10-16T01:52:52.043Z');
expect(stageCall.input.baseline).toEqual(config.baseline);
expect(stageCall.input.now).toBe(clock);
expect(stageCall.input.collection.fetchedAt).not.toBe(clock);
expect(warningsAt('2026-10-22T14:59:59.999Z')).not.toContain('collection_stale');
expect(warningsAt('2026-10-22T15:00:00.000Z')).toContain('collection_stale');
```

`stageCall` observes actual adapter wiring via a test-owned mock; `warningsAt` invokes current `validateMeasuredRefresh` on the exact admitted collection and approved baseline metrics. These unit results do not claim a full raw-source import.

- [x] **Step 2: Observe focused RED**: `npx --no-install vitest run --project=pipeline src/pipeline/stage-initial-source.test.ts`.
- [x] **Step 3: Implement admission and staging**: safe regular file reads, ZIP hash/length before/after, Linux Info-ZIP environment check, fresh `inspectArchive` against current contracts, exact historical archive evidence, all-category bounded extraction and `iterateLicenseCsv`, then `stageBoundedRelease` with unchanged approved inputs/current clock. Require accepted full metrics deeply equal to `config.baseline.metrics`; no early candidate promotion if a post-stage comparison fails. Own an outer new-output transaction so even a metrics mismatch cannot leak an accepted final path. Retain coverage/age warnings and write the new import receipt only after success.
- [x] **Step 4: Run GREEN and relevant production regressions**: `npx --no-install vitest run --project=pipeline src/pipeline/stage-initial-source.test.ts src/pipeline/validate-license-refresh.test.ts src/pipeline/adopted-validation-adapters.test.ts`; exit 0. Assert configs/inputs unchanged and no live collector calls.
- [x] **Step 5: Obtain independent spec/quality review** of every trust handoff, exact dates, all-row accounting and outer transaction. Conditional checkpoint: `feat(initial-import): stage inspected retained source without policy changes`.

## Task 4: Complete local/hosted preparation operators

**Files:** Task 4 ownership above. **Depends on:** Tasks 1–3 Approved. **Covers:** II-05/06/08 and first-publication/local-proof Review Focus.

**Interfaces produced:**

- `prepareInitialImport(request:{mode:'hosted',configPath:string,registryPath:string,sourceId:string,output:string}|{mode:'local-proof',configPath:string,archivePath:string,observationPath:string,output:string}):Promise<{outputDirectory:string,preparation:InitialPreparationV1}>` in `scripts/initial-import-support.mjs`.
- Hosted CLI exactly `node scripts/stage-initial-import.mjs CONFIG REGISTRY SOURCE-ID NEW-OUTPUT`; local CLI exactly `node scripts/verify-initial-import.mjs CONFIG ZIP OBSERVATION NEW-OUTPUT`. No mode flags, URL/policy/date overrides or arbitrary executable paths.
- Complete output: `artifact.tar`, `source-import.json`, `preparation.json`, `identity.json`, `inventory.json`. Raw source/observation and intermediates never enter the tar; cleanup owned staging after checking complete site bindings.

- [x] **Step 1: Add Node tests** for strict CLI arguments and current-root loading, local mode with zero network and null public precondition/run ID, hosted inactive authority before network, first/final 404 handling, source/stage/build/inspection/tar failures, output race, cleanup failure, matching receipt/tar/inventory and config preservation. Use test-owned dependency/module hooks only in the test process for small orchestration fixtures; real production-source success is Task 7. Include a real GNU tar package/inventory comparison using the existing two-record recovery fixture.

```js
assert.equal(localReceipt.precondition, null);
assert.equal(localReceipt.mode, 'local-proof');
assert.equal(networkCalls, 0);
assert.equal(failedPreparation.outputExists, false);
assert.deepEqual(afterPriorSite, beforePriorSite);
assert.equal(finalDescriptor200.exitCode, 1);
```

- [x] **Step 2: Observe RED**: `node --test scripts/initial-import-operators.test.mjs`.
- [x] **Step 3: Implement trusted composition** with current `main`, `newOutput`, `trustedCode`, fixed config/registry paths and shell-free child invocations of current `build-publication.mjs`; inspect through `verifyPublicationDirectory`. Package using the exact existing GNU tar flags from refresh, with no links/raw source added. Use existing `createRecoveryArchive(tarPath,ownedTemporaryGzip,inventory)` to inspect every tar member/hash against the full inventory before output promotion; remove only that owned temporary gzip afterward. This private packaging check grants no backup/provenance authority. Hash actual tar and canonical inventory. Hosted mode uses direct `readDeployedBaseline(...,{baseline:config.baseline})` checks before input work and immediately before complete-output promotion; local mode never claims a public absence or hosted authority. Capture actual operator identity and dirty bindings; container local proofs use a host-generated code manifest verified against actual snapshot bytes, not an invented clean SHA.
- [x] **Step 4: Implement receipt output** with actual preparation time, `expiresAt=preparedAt+24h`, SHA/length bindings, actual original collection and mode. Promote only a complete owned outer transaction; preserve all existing outputs/inputs on error. Hosted metadata has real run ID/operator SHA; local proof has `runId:null` and can never be turned into a hosted receipt by a CLI option. No `GITHUB_OUTPUT` from the local CLI.
- [x] **Step 5: Run GREEN and existing composition/package checks**: `node --test scripts/initial-import-operators.test.mjs scripts/publication-operators.test.mjs scripts/check-pages-artifact.test.mjs`; exit 0. Logs identify synthetic wiring tests separately from the later real-source proof.
- [x] **Step 6: Obtain independent spec/quality review** of the full transaction, packaging and no-network local mode. Conditional checkpoint: `feat(initial-import): prepare complete verified site artifacts locally`.

## Task 5: Inactive manual workflow and exact run binding

**Files:** Task 5 ownership above. **Depends on:** Tasks 1–4 Approved. **Covers:** II-06/07, changed public state and stale/local/expired run Review Focus.

**Interfaces produced in `initial-import-run.ts`:**

- `InitialImportRunV1`: strict `{version:1,kind:'initial-import-run-bound',workflowPath:'.github/workflows/initial-import.yml',sourceId,operatorSha,runId,candidateArtifactId,artifactName:'github-pages',preparationSha256,tarSha256,inventorySha256,preparedAt,expiresAt}`.
- `bindInitialImportRun(preparation:unknown,candidateArtifactId:number,context:{sha:string,runId:number}):InitialImportRunV1`: hosted only, exact same current SHA/run, actual positive upload ID.
- `validateInitialImportRun(value:unknown,context:{sha:string,runId:number,now:string}):InitialImportRunV1`: reject mismatches/local/expired/extra fields; at or after expiry is rejected.
- `scripts/bind-initial-import-run.mjs PREPARED-DIR CANDIDATE-ARTIFACT-ID NEW-METADATA-DIR` writes `run.json` plus canonical source/preparation/identity/inventory records; context comes from actual `GITHUB_SHA`/`GITHUB_RUN_ID`.
- `scripts/check-initial-import-run.mjs RUN-BINDING-JSON` validates a trusted prepare-job scalar JSON output against current GitHub context/current clock. JSON is passed via a quoted environment variable, never interpolated as shell code; no arbitrary file/URL/command input.

- [x] **Step 1: Add pipeline and composed Node tests** for local-receipt admission, another run/SHA/artifact/name, missing/nonpositive IDs, actual before/at/after expiry, forged expiry longer than 24 hours, main advancement, descriptor 404-to-200 during environment wait and malicious `source_id`. Extend actual workflow predicate truth-table tests to cover manual/main/publication flag combinations, all non-manual events, shared concurrency, no auto-approval and the fixed artifact/service selection.

```ts
expect(() => bindInitialImportRun(localPreparation, 12, runContext)).toThrow();
expect(() => validateInitialImportRun(bound, { ...runContext, now: bound.expiresAt })).toThrow();
expect(evaluatePrepare('pull_request', 'main')).toBe(false);
expect(evaluatePrepare('workflow_dispatch', 'other')).toBe(false);
```

- [x] **Step 2: Observe RED**: `npx --no-install vitest run --project=pipeline src/pipeline/initial-import-run.test.ts` and `node --test scripts/initial-import-operators.test.mjs scripts/check-publication-workflows.test.mjs`.
- [x] **Step 3: Implement the run validators and tiny fixed-root CLI adapters**. Bound run JSON to the existing 64 KiB provenance-size cap, reject extra fields and noncanonical timestamps, and require exact 24-hour expiry rather than trusting a supplied later expiry. Hash the actual local tar again after artifact upload before final metadata binding. Distinguish raw tar SHA from the upload service's wrapper/archive digest; no source-preparation field may be relabeled as a real artifact ID.
- [x] **Step 4: Add `.github/workflows/initial-import.yml`**: manual `source_id` only, fixed registry/config paths, main-only prepare/deploy, shared noncancelling publication group, 60/10-minute existing job budgets, exact existing pinned actions and existing permissions. Prepare runs pinned full verification and extended Node checks, hosted preparation, current-main guard, one `github-pages` upload with one-day retention, binder using that step's actual `artifact-id`, then a distinct `initial-import-metadata` upload with one-day retention. Never overwrite an existing same-name artifact.
- [x] **Step 5: Add protected deploy wiring** with existing publication flag, human environment and fresh main guard, actual current checkout/Node, run-binding guard and existing `check-publication-state.mjs` fixed URL/404/absent guard. `actions/deploy-pages` selects only fixed `github-pages` from this same run. Pass the trusted prepare-job binding as a job output; verify its source/run/SHA/expiry without downloading an arbitrary artifact or adding `actions:read`. Actual candidate ID/tar/inventory and metadata-upload ID are exposed for human action-time review. Missing/expired artifact failure never triggers rebuilding/recollection/old-run fallback.
- [x] **Step 6: Extend verify/refresh and new initial-import Node-check command lists** to include `scripts/initial-import-operators.test.mjs`; keep existing four files, permissions, triggers and assertions. No restore behavior change is needed merely to add test coverage. Run `npm run typecheck`, focused pipeline checks and the now-five-file Node suite, exit 0; parse workflow YAML with existing available tooling and test actual predicates/CLI arguments.
- [x] **Step 7: Obtain independent spec/quality and Actions/security review** of all trust boundaries, job outputs, new manual entry point and guard order. Registry stays inactive and no workflow is dispatched. Conditional checkpoint: `feat(initial-import): add guarded manual preparation workflow`.

## Task 6: First-import backup provenance continuity

**Files:** Task 6 ownership above. **Depends on:** Task 5 path/contracts fixed. **Covers:** II-09; backup-origin Review Focus.

**Interface:** Existing `validateRecoveryProvenance(value:unknown,config:{siteUrl:string,policyRevision:string}):RecoveryProvenanceV1` retains its signature and all other invariants. Derive this existing recovery config from the fixed site URL and approved `InitialImportConfigV1.policy.revision`; do not pass the seven-key import config directly. Origin-path set becomes exactly `.github/workflows/refresh.yml` and `.github/workflows/initial-import.yml`; no new provenance kind, source-archive recovery role or registry shape.

- [x] **Step 1: Add regressions** for actual two-path successful provenance/backup composition and unchanged rejection of restore/PR/arbitrary paths, failed/missing deployment outcome, absent public verification, mismatched public/inventory/date/hash, and attempts to register an initial-source transport record as a backup.

```ts
expect(validateRecoveryProvenance(initialOriginSuccess, config).workflowPath).toBe('.github/workflows/initial-import.yml');
expect(() => validateRecoveryProvenance({ ...initialOriginSuccess, deploymentOutcome: 'failure' }, config)).toThrow();
expect(() => validateRecoveryProvenance(sourceTransportRecord, config)).toThrow();
expect(() => selectRecoveryApproval(emptyRegistry, INITIAL_SOURCE.id, config)).toThrow();
```

- [x] **Step 2: Observe RED**: `npx --no-install vitest run --project=pipeline src/pipeline/recovery-approval.test.ts`; run composed Node regression for the new origin and retain a failing receipt before changing admission.
- [x] **Step 3: Change only the closed origin-path predicate** and corresponding fixtures/operators' documented source expectations. Keep actual publication run's source/workflow SHA distinct from the historical transport tag/collection implementation. Do not change recovery resource caps, successful-history/public-equality requirements, active backup selection or empty production registry.
- [x] **Step 4: Run GREEN**: previous pipeline command plus `node --test scripts/publication-operators.test.mjs scripts/initial-import-operators.test.mjs`; exit 0. Diff-check the existing provenance/registry logic to confirm no other admission rule changed.
- [x] **Step 5: Obtain independent spec/quality and security review** of exact admission scope and historical compatibility. Conditional checkpoint: `fix(recovery): admit verified initial-import publication origin`.

## Task 7: Current-code full-source proof, accumulated review and handoff

**Files:** Task 7 ownership above. **Depends on:** Tasks 1–6 Approved. **Covers:** II-08 and local readiness for II-10; no hosted criterion is claimed complete.

- [x] **Step 1: Capture execution preflight**: original/other worktree and prior-file inventories, current operator/configuration/source/observation hashes, inactive source registry and empty recovery registry. Reuse existing pinned Ubuntu/Node/npm/browser/Info-ZIP caches; no global changes or new source collection. Run heavy proof/full-suite jobs sequentially. Preserve existing failed attempts as evidence. If execution starts after October 21, replace the Task 7 report date stem with that actual Seoul execution date consistently in filenames and links; never backdate execution evidence.
- [x] **Step 2: Run the real local proof** through the actual new local CLI with the exact retained ZIP and observation, both read-only, in a new owned directory outside Git. In the existing container source snapshot this is `node scripts/verify-initial-import.mjs publication/config.json /work/task008-calibration-archives/c90758c2d3922e78d636ab2c9967b80c690bdcd8aeca283cf9f6ecc2cc992352.zip reports/observation-2026-10-16-bounded-source.json NEW-PRIVATE-OUTPUT`. Resolve and record a new actual output path before executing; do not reuse an old proof directory.
- [x] **Step 3: Audit complete results**: 195 categories, 2,951,024 rows, exact initial-baseline metrics, current compact/site byte guards, current built identity and full inventory, original collection/null coverage, correct clock-driven warnings, original archive/configuration hashes unchanged and tar/unpack equality for every file. Record actual file count/size/hashes rather than hardcoding the historical 730-file package. This local proof must emit no Release/run/deployment-success authority.
- [x] **Step 4: Exercise meaningful preservation failures** against the composed current implementation: damaged input copy (selected-hash rejection), interrupted category, occupied output, metadata mismatch and existing/uncertain public descriptor in controlled fetch fixtures. Separately run an actual `validateMeasuredRefresh` control using the admitted original collection and a coherent private metric clone with one extra row in zero-change category `15045103`; require count rejection with unchanged policy. Label this as a measured-metric control, not a raw-source replay: a changed ZIP would reject at source identity before reaching quality. Rehash the complete earlier accepted proof/input inventory afterward. Never alter original ZIP, final proof, public site, approved config or baseline.
- [x] **Step 5: Run exact accumulated checks** under pinned runtime: `npm run verify:full`; `node --test scripts/check-pages-artifact.test.mjs scripts/check-publication-state.test.mjs scripts/check-publication-workflows.test.mjs scripts/publication-operators.test.mjs scripts/initial-import-operators.test.mjs`; `git diff --check`. Require exit 0 and report actual counts/coverage/browser/a11y plus known diagnostics without guessing future totals. No skip, concurrency, retry, flaky-policy or threshold weakening.
- [x] **Step 6: Update exact operator/runbook/handoff records** for both CLI forms, inactive source authority, actual output/mode/time/run schemas, warning date, fixed two-path backup admission, default-off flags and all remaining approval gates. Distinguish current proof from historical evidence and local readiness from operational acceptance. Do not access the handbook or close a milestone.
- [x] **Step 7: Obtain whole-diff independent review** after task reviews/full checks, including Actions/security review evidence and all exact source/config/operator fingerprints. Fix scoped findings and rerun checks justified by fixes. Record current code/proof identities honestly; a later guard-only fix must not falsely rebind a historical heavy proof to different code.
- [x] **Step 8: Deliver reviewable local changes and stop**. Record actual diff, preserved prior work, proof/check/review results and remaining real source-asset/activation/performance/hosted gates. No upload, tag, settings change, dispatch, environment approval, push/PR/merge, deployment or recurring operation occurs. Future local checkpoint, if authorized: `test(initial-import): record full retained-source readiness`.

## Operational gates after local implementation — not execution steps in this plan

1. Obtain exact code delivery/PR/protected-main integration authorization and passing actual current-main CI.
2. Confirm attribution/redistribution and account/resource evidence; separately approve the exact source transport tag target, both public asset names/lengths/hashes, upload and publication. Actual Release/asset IDs do not exist in this plan.
3. Redownload approved uploaded bytes and re-read metadata/tag target; separately review/deliver the exact real source-registry entry to protected main. Until then it remains null/empty and hosted import must reject.
4. Satisfy existing full-data performance/applicable release prerequisites, re-read repository/environment protections and actual public state, and obtain concrete Pages setup/one-time flag/dispatch authorization. Scheduling remains off.
5. Review exact same-run candidate/metadata IDs, operator/config/identity/tar/inventory hashes and URL before a separately approved protected-environment first deployment. Reset one-time publication enablement afterward/failure.
6. Verify complete public equality and actual successful deployment history; separately approve complete backup assets/tag, redownload equality, registry adoption, then exact durable recovery deployment/public verification. No source ZIP or local proof becomes recovery authority.
7. Keep routine operation paused for its separate live-policy/operational decision. The initial source is five Seoul calendar days old on October 21; rebuild/import time never refreshes it.

## Plan self-review and requirement map

| Spec criterion | Owning tasks | Concrete proof |
| --- | --- | --- |
| II-01 | 1, 3 | Strict pinned authority/quality and original observation binding; null production registry. |
| II-02 | 2 | Small actual stream/hash tests, replacement/metadata/tag/redirect/cleanup cases; real archive proof in 7. |
| II-03 | 3, 7 | Existing production parser/validator, exact baseline metrics/full raw source, no live fallback. |
| II-04 | 3, 4, 7 | Original collection/null coverage, midnight warning boundary, actual current proof clock. |
| II-05 | 2–4, 7 | Owned transaction, complete prior inventory preserved after failures and output races. |
| II-06 | 4, 5 | Before/final/postapproval 404, stale main, changing/uncertain state and no hosted local proof. |
| II-07 | 4, 5 | Composed CLI/predicate/argument tests, minimal permissions, fixed same-run artifact and run metadata. |
| II-08 | 7 | Actual current-code original-ZIP proof, compact/site byte checks and complete tar equality. |
| II-09 | 6, 7 | Exact two-path origin with all existing history/public/registry guards. |
| II-10 | Operational gates only | Separate actual approved publication/backup/recovery evidence; never passed by local tests. |

Self-review completed: all spec sections are mapped to the seven sequential testable ownership units; later signatures match earlier definitions; all five Review Focus items have explicit owner tests; no duplicated validator, hidden numeric default, fabricated operational ID or active registry remains. Corrections made during this review: typed registry fixture instead of spreading unknown, explicit refresh test-list ownership, full tar/inventory admission using the existing inspector, and separation of hash rejection from measured quality controls. Test snippets express behavior without implementing bodies. Uploads/deployments remain outside execution scope; internal source/transport names do not change the approved design behavior.

## Execution handoff

Status: Detailed plan approved for local implementation and verification on 2026-10-21; local implementation, verification and independent whole-diff review are complete for local delivery. Tasks 1–6 have independent Approved spec/quality reviews; Task 5 Actions/security and Task 6 provenance-security reviews are also Approved. Task 7 actual-source proof/check/documentation steps 1–6 pass with1,366/68/20 plus96 Node tests and complete730-file package/preservation equality; its independent scoped spec/quality review and final whole-diff review are Approved for local technical delivery. Checked steps record local implementation/review only; conditional commit checkpoints were not executed and require separate code-delivery authorization. Preserve the established TASK-009 subagent implementation plus independent task/whole-diff/security review method unless the user changes it. The user explicitly authorized execution after reviewing the detailed plan. Upload and deployment remain expressly withheld even if local implementation is later authorized.


Final local delivery evidence: `final-whole-review.md`, checkpoint `whole-review-100856954058.diff`,
SHA-256 `e6808de92225e08b9dfe2dcd20b9f68f6ca9af968ef3926638ebc3fad76f8f35`;
0 Critical, 0 Important, 0 new Minor; existing M1 is informational/nonblocking. Steps 7–8 close
only the local reviewable delivery. TASK-009/II-10/hosted AC-009-4/5 remain active/open and every
operational gate above remains separately required. No conditional commit or remote action occurred.
