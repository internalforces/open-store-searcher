# TASK-009 Operational Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. The user already selected subagent implementation followed by independent review. Steps use checkbox (`- [ ]`) syntax for tracking. The user approved this execution plan on 2026-10-19; execute the local implementation and verification scope.

**Goal:** Implement the approved operational configuration, default-off scheduling, complete verified backups and current-main restoration/reconciliation tools without performing a remote operation.

**Architecture:** Compose existing compact V2 validators with a complete site inventory and bounded archive verification. A reviewed current-main recovery approval file selects exact same-repository Release assets; a manual restore run verifies and re-uploads one same-run Pages artifact. Protected environment approval, current-main guards and publication concurrency remain in place.

**Tech Stack:** Existing TypeScript, Node.js 24.19.0, npm 11.17.0, Ubuntu 24.04, Vite SSR, Vitest, Node test runner and Playwright; Node filesystem/crypto/zlib/HTTP only, with no dependency addition.

**Spec:** [Approved operational/recovery design](../specs/2026-10-19-task-009-operational-recovery-design.md), FR-13 and AC-009-4/5. Existing local acceptance and [operations evidence](../../../reports/operations-2026-10-19-task-009.md) remain dated prerequisites, not hosted passes.

## Global Constraints

- TASK-009 only; TASK-010 and recurring operation stay paused. Reuse `codex/task-009-publication-acceptance` and preserve every prior change, branch, original file and private backup.
- Approved site: `https://internalforces.github.io/open-store-searcher/`; deployed descriptor: `https://internalforces.github.io/open-store-searcher/release.json`.
- Source resource ceilings: `maxEntryBytes=536870912`, `maxTotalRows=3000000`, `entryTimeoutMs=120000`; copy all quality/baseline/reviewed-pair objects unchanged.
- `PAGES_SCHEDULE_ENABLED` defaults false. Deployment remains independently gated by `PAGES_PUBLICATION_ENABLED` and protected `github-pages` human approval.
- Recovery preparation receives `contents: read` only. Only deployment receives `pages: write` and `id-token: write`. No archival writer token, `actions: read`, new service, paid storage or package is introduced.
- Use only current trusted code to validate backups; never import/execute their JavaScript, run their package scripts or rebuild their application. Restore the complete app/data/baseline bytes together.
- Retain collection timestamps and null source coverage. Ordinary collection-date regression stays rejected. No older-snapshot rollback override or retained-input bootstrap is implemented.
- No remote settings, workflow dispatch, environment approval, push/PR/merge, release/tag creation, asset upload or deployment is authorized by this implementation plan.
- Keep source rows and large diagnostic output outside Git; do not access secrets or `handbook/ko/**`. All harness records remain English.

## Review Focus

- An apparently valid gzip contains path aliases, links, duplicate files or trailing members: reject before promoting an output (Task 2).
- A release asset is replaced, renamed, points to another repository or carries forged provenance: current-main approval and exact IDs/hashes must reject it (Task 3).
- A coherent newer public snapshot appears while approval waits: refuse a stale recovery and require a new explicit decision (Tasks 3 and 4).
- Main advances or a scheduled event fires while one-time preparation is authorized: stale code must fail and scheduled preparation must remain off (Task 4).
- A deployment times out or the descriptor stays fixed while a data/app asset changes: report unverified public state, never a preservation/success claim (Task 3).

## File and interface map

| Unit / ownership | Files | Responsibility |
| --- | --- | --- |
| Task 1 | `src/pipeline/recovery-types.ts`, `recovery-inventory.ts`, `verify-publication-directory.ts`, matching tests; expose existing baseline-state helper from `validate-license-refresh.ts`; `tests/fixtures/publication-recovery.ts` | Shared bindings, complete regular-file inventory and read-only V2 verification |
| Task 2 | `src/pipeline/recovery-archive.ts`, `recovery-archive.test.ts` | Bounded original-tar compression and verified extraction with transactional cleanup |
| Task 3 | `src/pipeline/recovery-approval.ts`, `recovery-download.ts`, `reconcile-publication.ts`, matching tests; `publication/recovery-approvals.json` | Current-main trust root, Release metadata/download and complete public readback |
| Task 4 | `scripts/inspect-publication.mjs`, `prepare-publication-backup.mjs`, `restore-publication.mjs`, `check-publication-state.mjs`, `check-publication-state.test.mjs`, `check-publication-workflows.test.mjs`, `publication-operators.test.mjs`; `.github/workflows/{refresh,restore,verify}.yml`; `publication/config.json` | Operator adapters, same-run workflow integration and default-off schedule |
| Task 5 | `publication/README.md`, `docs/deployment.md`, active/session/project/architecture/decisions/traceability; `reports/{test,verification,review,security}-2026-10-19-task-009-operational-recovery.{md,json}` (verification uses JSON; others Markdown) | Verified operator sequence, evidence and remaining approval gates |

The names in this plan are internal operator interfaces. The app's existing public identifiers,
URL formats and record/status schema do not change. New operator registry/contracts start empty;
the local October 16 candidate is never registered as a successful hosted backup.

## Shared contract decisions

Use strict version-1 JSON envelopes; reject unknown/missing fields and unsafe integers.
`ByteBinding` is `{ byteLength: number; sha256: string }` with a nonnegative safe length and a
64-character lowercase SHA-256. Archive/JSON bindings require positive length; regular files
may be empty (for example `.nojekyll`). A `SnapshotFile` adds a normalized relative `name`.
`SnapshotInventoryV1` is `{ version: 1; kind: 'publication-inventory'; files: SnapshotFile[];
totalBytes: number }`; sort names using ordinal string comparison, require uniqueness, and
hash the exact UTF-8 `JSON.stringify(inventory) + '\n'` representation.

`PublicationIdentityV1` contains `releaseSha256`, `manifestSha256`, `baselineSha256`,
`archiveSha256`, `collectedAt`, `recordCount`, `policyRevision`, `schemaVersion: 2`,
`identifierVersion: 1`, `normalizationVersion: 1`. `VerifiedPublicationV1` adds
`inventory` and `inventorySha256`. Existing `verifyCompactDirectory` and
`validateCompactReleaseBinding` own compact semantics; do not fork their rules.

Builder-selected safety bounds for this implementation: at most 10,000 regular files and
20,001 tar members including directories,
1,000,000,000 total site bytes, 536,870,912 bytes per file, 1,020,000,000 bytes each for raw tar
and gzip, 4 MiB inventory, 64 KiB provenance, 1 MiB registry/API JSON, and 255 UTF-8 path bytes.
Use the existing 8 MiB compact-file limit for compact payloads. Reject limits before allocation
and enforce them while streaming; do not trust Content-Length. Network reads use a 30-second
inactivity limit and a 15-minute overall archive-download limit; at most five redirects.

Approved metadata is a trust root, not a claim that matching hashes establish a history.
Task 1 declares the shared shapes; Task 3 implements their strict validation:

```ts
interface PublicVerificationReceiptV1 {
  version: 1;
  kind: 'public-bytes-verified';
  siteUrl: string;
  checkedAt: string;
  inventorySha256: string;
  releaseSha256: string;
}
interface RecoveryProvenanceV1 {
  version: 1;
  kind: 'verified-publication-backup';
  repository: string;
  siteUrl: string;
  sourceCommit: string;
  workflowCommit: string;
  workflowPath: string;
  runId: number;
  artifactId: number;
  deploymentId: string;
  deploymentOutcome: 'success';
  verifiedAt: string;
  identity: PublicationIdentityV1;
  inventory: ByteBinding;
  tar: ByteBinding;
  gzip: ByteBinding;
  publicVerification: { receipt: PublicVerificationReceiptV1; binding: ByteBinding };
}
interface RecoveryAssetBinding extends ByteBinding { id: number; name: string }
interface RecoveryApprovalV1 {
  id: string;
  repository: string;
  siteUrl: string;
  releaseId: number;
  tag: string;
  assets: { snapshot: RecoveryAssetBinding; inventory: RecoveryAssetBinding; provenance: RecoveryAssetBinding };
  expectedProvenance: RecoveryProvenanceV1;
}
```

Require 40-character lowercase commit hashes, positive safe numeric IDs, nonempty deployment ID
and canonical UTC timestamps; `verifiedAt` equals the receipt's `checkedAt`. Canonical receipt
binding uses the same `JSON.stringify(value) + '\n'` convention as the inventory. The approved
workflow path is `.github/workflows/refresh.yml`; recovery re-publication retains original
snapshot provenance. Require simple approval IDs (`^[a-z0-9-]{1,64}$`) and exactly the three
asset names `snapshot.tar.gz`, `inventory.json`, `provenance.json`.

Registry shape is `{ version: 1, kind: 'publication-recovery-approvals',
repository: 'internalforces/open-store-searcher', siteUrl, activeBackupId: string | null,
backups: RecoveryApprovalV1[] }`. Initialize `activeBackupId:null, backups:[]`.
Only its active entry can restore; there is no arbitrary historical-backup selector.
Human-reviewed main commits adopt entries only after exact asset download and public-success
evidence review. A prepared/local-only receipt cannot satisfy this contract.

## Task 1: Complete inventory and read-only publication validation

**Interfaces:**
- `scanPublicationDirectory(siteDir: string): Promise<SnapshotInventoryV1>`.
- `verifyPublicationDirectory(siteDir: string, expected?: SnapshotInventoryV1): Promise<VerifiedPublicationV1>`.
- Export the existing private `baselineState` as `validationBaselineState(value: unknown, ids: string[], policy: ValidationPolicyV1 | null, schemaHash: string): 'valid' | 'missing' | 'invalid' | 'incompatible'` from `validate-license-refresh.ts`, changing its internal call name only. Preserve its body and semantics.
- `createRecoveryFixture(): Promise<{ root: string; siteDir: string; identity: PublicationIdentityV1; cleanup(): Promise<void> }>` in the test fixture module; small two-record V2 data only.

- [x] **Step 1: Write failing pipeline tests** in `recovery-inventory.test.ts` and `verify-publication-directory.test.ts`: valid two-record V2 site includes app/Worker/baseline files and an empty `.nojekyll`; every expected length/hash matches; removing/adding/modifying a file rejects; a rehashed but mismatched manifest/baseline/date/count/policy or invalid category/status metrics/schema-contract hash rejects; directory symlinks, file symlinks/hardlink aliases, traversal names, forbidden repository/secret metadata and output-limit excess reject without reading protected files. Include an app script that creates a sentinel if executed; assert no sentinel exists.

```ts
expect((await verifyPublicationDirectory(siteDir)).recordCount).toBe(2);
await expect(verifyPublicationDirectory(siteDir, alteredInventory)).rejects.toThrow();
expect(existsSync(sentinelPath)).toBe(false);
```

- [x] **Step 2: Confirm RED**: `npx --no-install vitest run --project=pipeline src/pipeline/recovery-inventory.test.ts src/pipeline/verify-publication-directory.test.ts` fails for missing new exports, not fixture/environment errors.
- [x] **Step 3: Implement** strict types/limits and inventory using `lstat`/regular-file checks, no-follow file opens and streaming hashes. Parse exact V2 descriptor roles/path/hash/size; verify baseline/manifest; compose existing `verifyCompactDirectory` and `validateCompactReleaseBinding`. Full baseline metrics/category/schema compatibility uses the exposed existing `validationBaselineState`, current approved archive-contract IDs/hash and `policy:null` (Task 3 separately requires exact current policy revision). The test fixture uses the current schema hash/complete category map with only two synthetic records; it does not run production quality thresholds. Preserve helper body and existing builder/reader behavior; no broad refactor or historical app import.
- [x] **Step 4: Verify GREEN** with the same command plus existing `compact-delivery.test.ts` and `publication-transaction.test.ts`; run `npm run typecheck`.
- [x] **Step 5: Review gate**: independent spec/quality review with the approved spec and this plan. Resolve findings, record file fingerprints and passing command; no commit without authorization.

## Task 2: Bounded complete archive and safe transactional restoration

**Interfaces:**
- `createRecoveryArchive(tarPath: string, gzipPath: string, expected: SnapshotInventoryV1): Promise<{ tar: ByteBinding; gzip: ByteBinding }>` compresses the existing Pages tar unchanged after validating all members against the expected inventory.
- `restoreRecoveryArchive(gzipPath: string, binding: { tar: ByteBinding; gzip: ByteBinding }, expected: SnapshotInventoryV1, newOutputDir: string): Promise<{ siteDir: string; tarPath: string }>` returns paths only after complete byte and Task 1 V2 verification.

- [x] **Step 1: Write failing `recovery-archive.test.ts`**: actual GNU-tar valid regular files/directories round-trip; original tar digest preserved; paths `../x`, `/x`, `a/../b`, backslash/percent aliases, duplicate names, file/directory conflicts, symlink/hardlink/device/GNU-longlink/PAX members, bad checksum/octal overflow, truncated header/body/end, unexpected trailing nonzero member, wrong gzip/tar/file hash and decompression expansion all reject. Failure during write or competing final output preserves the complete previous inventory and leaves no owned candidate. Boundary tests use injected small limits, not giant fixtures.

```ts
await expect(restoreRecoveryArchive(bomb, bindings, inventory, output)).rejects.toThrow();
expect(await scanPublicationDirectory(previousSite)).toEqual(previousInventory);
expect(existsSync(output)).toBe(false);
```

- [x] **Step 2: Confirm RED**: `npx --no-install vitest run --project=pipeline src/pipeline/recovery-archive.test.ts`.
- [x] **Step 3: Implement** streaming Node gzip and strict 512-byte tar parsing. Accept the current GNU/ustar header forms only for regular files and zero-length directories; normalize one leading `./`, preserve root directory semantics, verify checksums and reject unsupported extensions. Validate all names/bounds/hashes before extraction into a uniquely owned directory; use exclusive regular-file writes and complete cleanup. Refuse existing output and publish a complete new output only after verification. Rehash original inputs to detect mutation; no `tar -x`, shell interpolation, archive execution or in-place replacement.
- [x] **Step 4: Verify GREEN** with the same command and Task 1 tests. Exercise the existing workflow's actual GNU tar output in the pinned Ubuntu environment; prove restored files and raw tar are identical.
- [x] **Step 5: Review gate**: independent parser/filesystem/resource-boundary review and report before downstream integration.

## Task 3: Approved Release selection and complete public reconciliation

**Interfaces:**
- `selectRecoveryApproval(registry: unknown, id: string, config: { siteUrl: string; policyRevision: string }): RecoveryApprovalV1` accepts only the active exact approved entry.
- `downloadApprovedRecovery(approval: RecoveryApprovalV1, newDirectory: string, fetcher?: typeof fetch): Promise<{ gzipPath: string; inventory: SnapshotInventoryV1; provenance: RecoveryProvenanceV1 }>` retrieves exact read-only Release metadata/assets and verifies bindings; Task 2 performs restoration.
- `reconcilePublication(siteUrl: string, expected: VerifiedPublicationV1, fetcher?: typeof fetch): Promise<{ kind: 'verified'; receipt: PublicVerificationReceiptV1 } | { kind: 'unverified'; reason: string }>` checks every expected file, then re-reads descriptor; it never claims a deployment outcome from HTTP alone.
- `readRecoveryPrecondition(siteUrl: string, approval: RecoveryApprovalV1, fetcher?: typeof fetch): Promise<{ kind: 'same-snapshot' | 'absent' | 'corrupt'; status: 200 | 404; releaseSha256: string | null }>` accepts the active approved same-snapshot state, or confirmed absent/corrupt state recorded for action-time review; rejects a coherent different/newer snapshot or collection-date regression. Even a partially corrupt descriptor exposing a later collection timestamp requires a separate rollback decision. Other transport/status uncertainty aborts preparation; do not reclassify timeouts as corruption.

- [x] **Step 1: Write failing tests**: empty/nonactive registry, forged local-only public provenance, wrong repository/site/commit/workflow/IDs/hashes/policy/version, draft/missing/renamed/replaced assets and unsupported redirect all reject. A legitimate active backup succeeds with stubbed GitHub/Pages responses; source code from its archive is never called. Full public checks catch wrong app bytes as well as wrong data, descriptor replacement, stale baseline and network timeout; these yield `unverified`, not success/preservation. A newer coherent descriptor blocks recovery even if the backup was previously approved.

```ts
expect(() => selectRecoveryApproval(emptyRegistry, 'local-proof', config)).toThrow();
expect((await reconcilePublication(siteUrl, expected, timedOutFetch)).kind).toBe('unverified');
await expect(readRecoveryPrecondition(siteUrl, approval, newerReleaseFetch)).rejects.toThrow();
```

- [x] **Step 2: Confirm RED** with `npx --no-install vitest run --project=pipeline src/pipeline/recovery-approval.test.ts src/pipeline/recovery-download.test.ts src/pipeline/reconcile-publication.test.ts`.
- [x] **Step 3: Implement** strict registry/provenance checks and bounded unauthenticated reads for this public repository. Read `/repos/internalforces/open-store-searcher/releases/{id}`, exact tag reference/commit and approved asset metadata; resolve at most five annotated-tag hops, rejecting cycles/mismatches, and require uploaded state and exact IDs/names/lengths. Download API binary by immutable asset ID, handling 200/302 without forwarding credentials. Allow only HTTPS `api.github.com`, `github.com`, `release-assets.githubusercontent.com` and `objects.githubusercontent.com` for bounded redirects; fail closed for a changed host contract. Never log signed redirect URLs or archive bodies. Compare expected hashes independently of GitHub's optional digest. Public file fetches use exact same-origin subpath URLs, no redirects/credentials/cache, per-file bounds and at most four concurrent requests; assert descriptor equality before/after the complete inventory. Missing/corrupt public state can only restore the active known-good entry and must remain explicit in the operation receipt; it is not bootstrap or an older-snapshot override.
- [x] **Step 4: Verify GREEN** with the same tests plus `read-deployed-baseline.test.ts`; confirm no network is used in tests. Registry stays empty. No live asset or provenance is invented.
- [x] **Step 5: Review gate**: independent trust/provenance/network review. Verify that the reviewed main registry, not downloaded self-asserted metadata, supplies authority.

## Task 4: Operator adapters, schedule hold and protected restore workflow

**Interfaces:**
- `node scripts/inspect-publication.mjs SITE-DIR NEW-OUTPUT`: use Task 1 verification and emit canonical `inventory.json` and `identity.json` into a new metadata directory, without app execution.
- `node scripts/prepare-publication-backup.mjs CONFIG ARTIFACT-TAR INVENTORY PROVENANCE-DRAFT NEW-OUTPUT`: validate/compress the exact original tar against the inventory, extract/verify into owned scratch through Task 2, reconcile full public bytes, and write gzip/inventory/provenance plus verification receipt. All output is proposed until human archival/registry approval. Never uploads, tags or mutates GitHub. This accepts the downloaded Pages tar and small metadata artifact, so it does not depend on an expired runner filesystem or an unsafe manual extraction.
- `node scripts/restore-publication.mjs CONFIG REGISTRY BACKUP-ID NEW-OUTPUT`: load current-main approval, fetch/verify/restore, verify public recovery precondition and emit a fixed-schema preparation receipt plus exact `artifact.tar`; no deployment. Use Vite SSR only for current pipeline code, never restored files.
- `node scripts/check-publication-state.mjs URL EXPECTED-STATUS EXPECTED-SHA`: dependency-free Node guard rechecks the exact recorded public descriptor status/hash immediately before promotion; rejects redirects, changed/new coherent state, oversize and timeouts. `EXPECTED-SHA` is exactly 64 lowercase hex characters for status200 or the literal `absent` for status404. Native `.mjs` is used so deployment needs no package installation.
- Restore workflow input is only `backup_id`; code/config/registry come from current main. Paths and hashes become validated environment values/outputs, never pasted into shell expressions.

- [x] **Step 1: Write failing Node operator/workflow/guard tests** in the three new `.test.mjs` files. Assert the exact reviewed schedule predicate and enumerate its intended truth table (scheduled false/unset skips; scheduled true and main can prepare; manual main can prepare; other events/refs cannot). This is a static policy check, not a hosted Actions evaluation. Assert restore has manual-only trigger, default-branch gates, deny-all top permissions, prepare `contents: read`, same-run single artifact, shared concurrency, protected environment and both source-SHA checks. Malicious backup input such as `x;$(touch marker)` must remain data/reject without a marker. Guard rejects a public descriptor changed after environment approval and any unexpected 404; deployment success cannot be inferred from guard status. Exercise actual CLIs against owned small V2 fixtures, malformed arguments, mismatched receipt metadata, output competition and empty registry. Use existing test-only child preload conventions for simulated public fetches; add no production bypass or endpoint flag.
- [x] **Step 2: Confirm RED**: `node --test scripts/check-publication-state.test.mjs scripts/check-publication-workflows.test.mjs scripts/publication-operators.test.mjs` on pinned Ubuntu.
- [x] **Step 3: Implement adapters** with strict argument validation, new-output refusal and Task 1–3 interfaces. Expose only bounded trusted outputs. Require operator draft metadata naming successful run/deployment for backup preparation; preserve its attestation as a proposal, not automatic history verification. Actual GitHub deployment-state readback and human registry review remain mandatory. Ensure child failures clean only their owned output. Report all uncertain public outcomes and exit nonzero. Never accept a retained candidate as known-good.
- [x] **Step 4: Implement workflows/config**. First gate refresh preparation with current-main AND `(workflow_dispatch OR (schedule AND PAGES_SCHEDULE_ENABLED == 'true'))`; then create `publication/config.json` from the approved proposal's `configuration` object, with exact deep equality apart from the approved URL. Emit verified inventory/identity during preparation and upload them as one additional small same-run `publication-metadata` artifact using the existing pinned uploader and one-day retention; add no public site files or automated archival writer. Add `restore.yml` prepare/guard/upload/deploy dependency chain using Task 3's empty registry by default. Keep original restore tar unchanged; upload only after complete verification and current-main check. Use the same `pages-publication` concurrency and existing pinned checkout/setup-node/upload/deploy actions. In restore deployment recheck main, then use current-main checkout (`persist-credentials:false`) and pinned Node to run only the trusted dependency-free descriptor guard; no archive scripts/build/install. Grant only the existing deploy Pages/OIDC scopes. Wire Node structural/guard tests beside existing packaging tests in `verify.yml` and in both preparation jobs. Do not set any GitHub variable.
- [x] **Step 5: Verify GREEN** with the Node commands, existing `scripts/check-pages-artifact.test.mjs`, focused pipeline tests and `npm run typecheck`. Exercise the literal shell packaging under GNU tar; no synthetic network success may become a hosted acceptance claim.
- [x] **Step 6: Review gate**: independent Actions hardening/security review of changed YAML, scripts, inputs, outputs, pins and permission scopes. No new dependency, remote permission or protection change; findings requiring scope change return to the owner.

Reuse these exact existing pins: checkout `08c6903cd8c0fde910a37f88322edcfb5dd907a8`, setup-node
`a0853c24544627f65ddf259abe73b1d18a591444`, upload-artifact
`ea165f8d65b6e75b540449e92b4886f43607fa02`, deploy-pages
`d6db90164ac5ed86f2b6aed7e0febac5b3c0c03e`. Keep human-readable versions, Ubuntu 24.04,
Node 24.19.0/npm 11.17.0 and one-day same-run artifact semantics. Restoration does not depend on
the original expired artifact; it creates a fresh same-run artifact from approved durable bytes.

## Task 5: Full verification, real-package proof and approval-ready handoff

**Interfaces:** Tasks 1–4 exports/CLIs; existing pinned full verification and original preservation receipts. No new runtime interface.

- [x] **Step 1: Run local complete-package proof** in a fresh owned private output directory. Verify the retained 730-file site, compress its exact tar, restore and compare every file/hash and raw tar digest. Exercise bounded rejection/cleanup against copies. Mark this low-level test as local-only; the real production registry remains empty and no successful deployment provenance is fabricated. Do not collect new source, rewrite the October 16 date or change the rejected October 19 quality outcome.
- [x] **Step 2: Run required current-tree checks**: pinned `npm run verify:full`, `node --test scripts/check-pages-artifact.test.mjs scripts/check-publication-state.test.mjs scripts/check-publication-workflows.test.mjs scripts/publication-operators.test.mjs`, current YAML/security review, approved-config deep equality, local Markdown targets and `git diff --check`. Record actual test counts, coverage, logs and all current file fingerprints. Fix regressions within scope, then rerun affected checks; do not relax concurrency, coverage or flaky policy.
- [x] **Step 3: Write operator docs and records**: exact backup/restore commands; registry promotion and asset readback; keep each successful publication's complete verified backup registered before another publication; keep scheduling off and reset one-run publication flags. Explain skipped versus environment-waiting jobs, main advancement, expiry, unavailable/mismatched public state, post-deploy full reconciliation and action-time approval. Record unperformed hosted/physical/mobile/reliability cases and the current quality blocker. Update architecture/decisions/traceability without activating TASK-010 or reading the handbook.
- [x] **Step 4: Obtain whole-diff independent review** after task reviews and final checks, including approval boundaries and current evidence. Recheck original root HEAD/73-file hashes and prior protected work. No commit/push/PR/merge without authority; report exact local diff and concrete next approval packet.
- [ ] **Step 5: Stop at the next real gate**: obtain a separate quality/source-candidate decision and required performance/release evidence before proposing an actual first preparation/deployment. For later authorized operations present exact code/config/asset/run/URL identities and fresh environment/branch readbacks. Existing no-Pages state means first hosted backup/recovery cannot be completed by local implementation alone.

Current execution: Tasks1–5 local implementation and scoped Spec/Quality reviews are Approved.
Initial whole-branch review returned Request Changes for I1/M1/M2/M3. The bounded final
correction passes fresh1125/68/20,Node45 and preservation/current-fingerprint checks; the
independent final scoped re-review is Approved (all four findings addressed; zero new breakage).
Step4 local review and preservation checks are complete; actual hosted acceptance is still open. The
unchanged730-file proof retains its original exact receipt; no hosted acceptance is implied.

## Plan self-review and execution handoff

Spec coverage: config/schedule in Task 4; complete backup and trust in Tasks 1–3; protected
restoration in Task 4; public reconciliation in Task 3; source/performance/remote approval
boundaries and actual-operation sequence in Task 5. All five Review Focus cases have named
owning tests. Interface names/types and limits above are shared across tasks. New code stays
in pipeline/operator modules; app/search/source-policy behavior and dependencies are unchanged.

The user approved design, GitHub Release storage and this detailed execution plan on 2026-10-19.
Remote actions remain separately gated. Preserve the selected execution method and
use a fresh implementer and fresh independent reviewer for each task sequentially, with the
previous task's interface evidence attached. Apply the test-generation/TDD skills before writing
tests or implementation and Actions hardening at the workflow review gate.

API details checked against [GitHub Release assets](https://docs.github.com/en/rest/releases/assets)
and [Release metadata](https://docs.github.com/en/rest/releases/releases) on 2026-10-19: public
read endpoints need no write privilege; binary responses can be 200 or 302; IDs plus independent
hashes are required instead of relying on editable names. This is protocol research, not proof
of this repository's still-unperformed hosted archival path.
