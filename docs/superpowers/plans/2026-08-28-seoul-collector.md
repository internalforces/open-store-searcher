# Seoul Source Probe and Staged Collector Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build TASK-005's fail-safe, change-detecting Seoul ZIP contract probe and staged collector without adding a publication path.

**Architecture:** Native Node.js streams perform the HTTP probe, temporary download, and SHA-256 calculation. An injected Info-ZIP adapter inspects archives without extraction; pure contract and CSV modules validate schema-only evidence before an orchestrator returns a typed accepted or rejected result.

**Tech Stack:** Node.js 24.19.0, npm 11.17.0, TypeScript 7.0.2, Vitest 4.1.11, Info-ZIP 6.x, and `@types/node` 24.13.3.

**Spec:** `docs/superpowers/specs/2026-08-28-seoul-collector-design.md`

## Global Constraints

- Work only on `codex/m1-data-pipeline`; never implement on `main` or `master`.
- Use Node.js 24.19.0 and npm 11.17.0 for installation and verification.
- Add exactly one direct development dependency: `@types/node` 24.13.3 under MIT.
- Follow strict TypeScript with erasable syntax and no new runtime ZIP package.
- Write every production behavior through a failing pipeline test first.
- Keep tests deterministic and offline; the one official-source probe is a separate manual gate.
- Never commit a complete source archive, source records, a secret, or a production artifact.
- Never publish, deploy, create a workflow, map a processed status, or derive `dataAsOf` in TASK-005.
- Reject provider, redirect, archive, permission, schema, or timestamp drift; do not retry around a denial.
- Do not read or use `handbook/ko/**`.

---

### Task 1: Confirm the design gate and install approved Node type declarations

**Files:**
- Modify: `docs/superpowers/specs/2026-08-28-seoul-collector-design.md`
- Modify: `tasks/active.md`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `scripts/report-dependency-licenses.mjs`
- Create: `reports/dependency-licenses-2026-08-28.md`
- Modify: `dependencies.md`

**Interfaces:**
- Consumes: user approval of the written TASK-005 specification and ADR-010.
- Produces: direct development dependency `@types/node@24.13.3` and a reproducible TASK-005 license report.

- [ ] **Step 1: Mark the written specification approved**

Change the specification status to:

```markdown
_Status: Approved by the user on 2026-08-28_
```

Check the first TASK-005 acceptance criterion in `tasks/active.md`.

- [ ] **Step 2: Install the exact approved dependency**

Run:

```bash
task_node_dir='/Users/sonmyeong-gwan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin'
PATH="$task_node_dir:$PATH" npx --yes npm@11.17.0 install --save-dev --save-exact @types/node@24.13.3
```

Expected: `package.json` and the lockfile contain exactly `@types/node: 24.13.3`; no ZIP runtime package appears.

- [ ] **Step 3: Make the license generator accept an explicit task and date**

Replace the hard-coded report metadata with validated CLI arguments:

```js
const taskArg = process.argv.find((value) => value.startsWith('--task='));
const dateArg = process.argv.find((value) => value.startsWith('--date='));
const reportTask = taskArg?.slice('--task='.length) ?? 'TASK-003';
const reportDate = dateArg?.slice('--date='.length) ?? '2026-08-24';

if (!/^TASK-\d{3}$/.test(reportTask) || !/^\d{4}-\d{2}-\d{2}$/.test(reportDate)) {
  throw new Error('License report task or date is invalid.');
}
```

- [ ] **Step 4: Generate and verify the TASK-005 license report**

Run:

```bash
task_node_dir='/Users/sonmyeong-gwan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin'
PATH="$task_node_dir:$PATH" node scripts/report-dependency-licenses.mjs --task=TASK-005 --date=2026-08-28
PATH="$task_node_dir:$PATH" npx --yes npm@11.17.0 ls --depth=0
```

Expected: the direct package list contains approved packages only, and every locked package has a non-empty license.

- [ ] **Step 5: Run dependency-scope verification**

Run:

```bash
npm run format:check
npm run typecheck
git diff --check
```

Expected: all commands exit zero.

- [ ] **Step 6: Commit the dependency gate**

```bash
git add package.json package-lock.json scripts/report-dependency-licenses.mjs \
  reports/dependency-licenses-2026-08-28.md dependencies.md \
  docs/superpowers/specs/2026-08-28-seoul-collector-design.md tasks/active.md
git commit -m "chore(data): add approved node type declarations"
```

---

### Task 2: Define collector outcomes, limits, and source-contract validation

**Files:**
- Create: `src/pipeline/collector-types.ts`
- Create: `src/pipeline/source-contract.ts`
- Create: `src/pipeline/source-contract.test.ts`

**Interfaces:**
- Consumes: `reports/source-permission-manifest-2026-08-28.json` as unknown JSON.
- Produces: `CollectorLimits`, `CollectionResult`, `SourceEvidence`, `ArchiveEvidence`, `PermissionManifest`, `parsePermissionManifest()`, `isAllowedProviderUrl()`, and `createProviderHeaders()`.

- [ ] **Step 1: Write failing manifest and URL tests**

Create tests with hand-derived expectations:

```ts
import { describe, expect, test } from 'vitest';
import {
  createProviderHeaders,
  isAllowedProviderUrl,
  parsePermissionManifest,
} from './source-contract.js';

describe('parsePermissionManifest', () => {
  test('accepts 195 unique category and file identifiers with the approved provider and permission', () => {
    const categories = Array.from({ length: 195 }, (_, index) => ({
      apiId: `api-${index}`,
      apiTitle: `행정안전부_분류-${index} 조회서비스`,
      fileDataId: `file-${index}`,
      fileDataTitle: `행정안전부_분류-${index}`,
      fileDataUrl: `https://www.data.go.kr/data/${index}/fileData.do`,
    }));

    const result = parsePermissionManifest({
      provider: '행정안전부',
      expectedCategoryCount: 195,
      verifiedCategoryCount: 195,
      permissionLabel: '이용허락범위 제한 없음',
      categories,
    });

    expect(result.categories).toHaveLength(195);
  });

  test('rejects a duplicate file identifier', () => {
    const categories = Array.from({ length: 195 }, (_, index) => ({
      apiId: `api-${index}`,
      apiTitle: `행정안전부_분류-${index} 조회서비스`,
      fileDataId: index < 2 ? 'duplicate' : `file-${index}`,
      fileDataTitle: `행정안전부_분류-${index}`,
      fileDataUrl: `https://www.data.go.kr/data/${index}/fileData.do`,
    }));

    expect(() =>
      parsePermissionManifest({
        provider: '행정안전부',
        expectedCategoryCount: 195,
        verifiedCategoryCount: 195,
        permissionLabel: '이용허락범위 제한 없음',
        categories,
      }),
    ).toThrow('duplicate file-data identifier');
  });
});

test('allows only HTTPS requests to the approved provider host', () => {
  expect(isAllowedProviderUrl('https://file.localdata.go.kr/file/download-all')).toBe(true);
  expect(isAllowedProviderUrl('http://file.localdata.go.kr/file/download-all')).toBe(false);
  expect(isAllowedProviderUrl('https://example.com/file/download-all')).toBe(false);
});

test('creates fixed headers without credentials or user input', () => {
  expect(createProviderHeaders('archive')).toEqual({
    accept: 'application/zip, application/octet-stream;q=0.9',
    referer: 'https://www.data.go.kr/',
    'user-agent':
      'Mozilla/5.0 (compatible; open-store-searcher/0.1; +https://github.com/internalforces/open-store-searcher)',
  });
});
```

- [ ] **Step 2: Run the tests and verify the expected failure**

Run:

```bash
npm run test:pipeline -- src/pipeline/source-contract.test.ts
```

Expected: FAIL because `source-contract.ts` does not exist.

- [ ] **Step 3: Implement the public types and minimal contract validation**

Define the rejection union exactly as the specification states. Add these limit defaults:

```ts
export const DEFAULT_COLLECTOR_LIMITS: CollectorLimits = {
  minArchiveBytes: 1024 * 1024,
  maxArchiveBytes: 512 * 1024 * 1024,
  maxProcessOutputBytes: 8 * 1024 * 1024,
  maxHeaderBytes: 256 * 1024,
  httpProbeTimeoutMs: 30_000,
  downloadInactivityTimeoutMs: 120_000,
  downloadDeadlineMs: 1_200_000,
  maxRedirects: 3,
};
```

`parsePermissionManifest()` must validate the object shape, exact count 195, approved provider,
approved permission, unique identifiers, matching API/file titles, and official file-data URLs.

- [ ] **Step 4: Run the focused and pipeline suites**

```bash
npm run test:pipeline -- src/pipeline/source-contract.test.ts
npm run test:pipeline
```

Expected: PASS.

- [ ] **Step 5: Commit contract types**

```bash
git add src/pipeline/collector-types.ts src/pipeline/source-contract.ts \
  src/pipeline/source-contract.test.ts
git commit -m "feat(data): define collector source contract"
```

---

### Task 3: Implement strict CSV header inspection

**Files:**
- Create: `src/pipeline/csv-header.ts`
- Create: `src/pipeline/csv-header.test.ts`

**Interfaces:**
- Consumes: a `Uint8Array` capped by the caller.
- Produces: `inspectCsvHeader(bytes): CsvHeaderEvidence` with `encoding`, `delimiter`, `headers`, and `timestampFields`.

- [ ] **Step 1: Write failing UTF-8, EUC-KR, quoted-field, and rejection tests**

Use literal byte fixtures and assert observable evidence:

```ts
test('parses a quoted UTF-8 header with CRLF', () => {
  const bytes = new TextEncoder().encode('사업장명,"주소,전체",최종수정시점\r\n');
  expect(inspectCsvHeader(bytes)).toEqual({
    encoding: 'utf-8',
    delimiter: ',',
    headers: ['사업장명', '주소,전체', '최종수정시점'],
    timestampFields: ['최종수정시점'],
  });
});

test('rejects duplicate normalized headers', () => {
  const bytes = new TextEncoder().encode('사업장명, 사업장명 \n');
  expect(() => inspectCsvHeader(bytes)).toThrow('duplicate CSV header');
});

test('rejects a first record larger than the supplied bytes', () => {
  const bytes = new TextEncoder().encode('"unterminated');
  expect(() => inspectCsvHeader(bytes)).toThrow('complete CSV header record');
});
```

Create the EUC-KR fixture from a fixed hexadecimal byte literal rather than a runtime encoder.

- [ ] **Step 2: Verify RED**

```bash
npm run test:pipeline -- src/pipeline/csv-header.test.ts
```

Expected: FAIL because `inspectCsvHeader` is missing.

- [ ] **Step 3: Implement minimal strict decoding and first-record parsing**

Try fatal UTF-8 decoding first, then fatal `euc-kr`. Remove only a leading BOM. Parse commas,
quoted fields, doubled quotes, CRLF, and LF. Normalize headers with Unicode NFC and trim outer
whitespace. Treat names containing `수정시점`, `데이터갱신시점`, or the exact English source fields
`LAST_MDFCN_PNT` and `DAT_UPDT_PNT` as timestamp-field evidence without assigning semantics.

- [ ] **Step 4: Run focused tests and refactor while green**

```bash
npm run test:pipeline -- src/pipeline/csv-header.test.ts
```

Expected: PASS with no warnings.

- [ ] **Step 5: Commit CSV inspection**

```bash
git add src/pipeline/csv-header.ts src/pipeline/csv-header.test.ts
git commit -m "feat(data): inspect source csv headers"
```

---

### Task 4: Implement the fail-closed HTTP contract probe

**Files:**
- Create: `src/pipeline/probe-source.ts`
- Create: `src/pipeline/probe-source.test.ts`

**Interfaces:**
- Consumes: `FetchLike`, `CollectorLimits`, and an optional `AbortSignal`.
- Produces: `probeSourceContract(options): Promise<SourceProbeResult>` with either source evidence or a typed rejection.

- [ ] **Step 1: Write failing success and denial tests using real `Response` objects**

```ts
test('accepts the limit check and one-byte range contract', async () => {
  const responses = [
    new Response('', { status: 204 }),
    new Response(new Uint8Array([0x50]), {
      status: 206,
      headers: {
        'content-range': 'bytes 0-0/215968197',
        'content-type': 'application/zip',
      },
    }),
  ];

  const result = await probeSourceContract({
    fetchImpl: async () => responses.shift() as Response,
    limits: DEFAULT_COLLECTOR_LIMITS,
  });

  expect(result).toMatchObject({
    kind: 'accepted',
    evidence: { expectedBytes: 215968197 },
  });
});

test('does not retry an HTTP 429 limit denial', async () => {
  let calls = 0;
  const result = await probeSourceContract({
    fetchImpl: async () => {
      calls += 1;
      return new Response('wait', { status: 429 });
    },
    limits: DEFAULT_COLLECTOR_LIMITS,
  });

  expect(result).toMatchObject({ kind: 'rejected', code: 'download_limit_denied' });
  expect(calls).toBe(1);
});
```

Add separate tests for a foreign redirect, four redirects, HTML error content, malformed
`Content-Range`, a non-206 range response, a two-byte range body, and a size outside bounds.

- [ ] **Step 2: Verify RED**

```bash
npm run test:pipeline -- src/pipeline/probe-source.test.ts
```

Expected: FAIL because the probe module does not exist.

- [ ] **Step 3: Implement manual redirect handling and range parsing**

Use `redirect: 'manual'`, resolve `Location` relative to the current URL, enforce the approved host
before the next request, and stop after `limits.maxRedirects`. Do not log or return response bodies.
Use a fresh timeout signal combined with the caller signal for each probe request.

- [ ] **Step 4: Run focused and full pipeline tests**

```bash
npm run test:pipeline -- src/pipeline/probe-source.test.ts
npm run test:pipeline
```

Expected: PASS.

- [ ] **Step 5: Commit HTTP probing**

```bash
git add src/pipeline/probe-source.ts src/pipeline/probe-source.test.ts
git commit -m "feat(data): probe source download contract"
```

---

### Task 5: Stream a complete archive into isolated staging

**Files:**
- Create: `src/pipeline/staged-download.ts`
- Create: `src/pipeline/staged-download.test.ts`

**Interfaces:**
- Consumes: accepted `SourceEvidence`, a `FetchLike`, an absolute staging root, `fetchedAt`, limits, and an abort signal.
- Produces: `downloadArchiveToStaging(options): Promise<StagedDownloadResult>` containing a `.zip` path, byte count, and SHA-256 only after a complete transfer.

- [ ] **Step 1: Write failing complete-transfer and cleanup tests**

Use `mkdtemp()` and real filesystem assertions. A successful test body is:

```ts
const zipBytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);
const response = new Response(zipBytes, {
  status: 200,
  headers: { 'content-length': String(zipBytes.length) },
});
const result = await downloadArchiveToStaging({
  fetchImpl: async () => response,
  stagingRoot,
  sourceEvidence: { expectedBytes: zipBytes.length, finalUrl: SOURCE_ARCHIVE_URL },
  fetchedAt: '2026-08-28T00:00:00.000Z',
  limits: { ...DEFAULT_COLLECTOR_LIMITS, minArchiveBytes: 4 },
});

expect(result.kind).toBe('accepted');
expect(await readFile(result.kind === 'accepted' ? result.archivePath : '')).toEqual(
  Buffer.from(zipBytes),
);
```

Add tests proving `.part` cleanup after body failure, content-length disagreement, expected-range
size disagreement, missing ZIP signature, overflow during streaming, invalid staging paths, and an
invalid non-UTC `fetchedAt`.

- [ ] **Step 2: Verify RED**

```bash
npm run test:pipeline -- src/pipeline/staged-download.test.ts
```

Expected: FAIL because the staging module is missing.

- [ ] **Step 3: Implement exclusive partial-file creation and streamed hashing**

Use `open(partPath, 'wx')`, iterate `response.body`, update `createHash('sha256')`, enforce byte
bounds during the stream, `sync()` and close the handle, then rename within the staging directory.
On every rejection or thrown I/O error, close the handle and remove partial and final paths.

- [ ] **Step 4: Run focused tests**

```bash
npm run test:pipeline -- src/pipeline/staged-download.test.ts
```

Expected: PASS and no temporary files remain after rejected cases.

- [ ] **Step 5: Commit staged download**

```bash
git add src/pipeline/staged-download.ts src/pipeline/staged-download.test.ts
git commit -m "feat(data): stage complete source archives"
```

---

### Task 6: Implement the shell-free Info-ZIP archive adapter

**Files:**
- Create: `src/pipeline/archive-adapter.ts`
- Create: `src/pipeline/unzip-archive.ts`
- Create: `src/pipeline/unzip-archive.test.ts`
- Create: `tests/fixtures/pipeline/collector/README.md`
- Create: `tests/fixtures/pipeline/collector/valid-two-category.zip`
- Create: `tests/fixtures/pipeline/collector/corrupt.zip`

**Interfaces:**
- Produces: `ArchiveAdapter` with `checkEnvironment()`, `testIntegrity()`, `listEntries()`, and `readEntryPrefix()`; `UnzipArchiveAdapter` implements it.

- [ ] **Step 1: Generate tiny deterministic archive fixtures**

Use a temporary directory, fixed file timestamps, two synthetic CSV files, and Info-ZIP `zip -X`.
The sibling README records purpose, synthetic status, TASK-005 ownership, expected behavior, and
update trigger. Create `corrupt.zip` by truncating a copy of the valid fixture mechanically.

- [ ] **Step 2: Write failing real-adapter integration tests**

```ts
test('lists and streams entries from a valid local archive', async () => {
  const adapter = new UnzipArchiveAdapter('/usr/bin/unzip');
  await expect(adapter.testIntegrity(validArchivePath)).resolves.toEqual({ ok: true });
  await expect(adapter.listEntries(validArchivePath)).resolves.toEqual([
    expect.objectContaining({ name: 'category-a.csv' }),
    expect.objectContaining({ name: 'category-b.csv' }),
  ]);
  const prefix = await adapter.readEntryPrefix(validArchivePath, 'category-a.csv', 256);
  expect(new TextDecoder().decode(prefix)).toContain('사업장명');
});

test('reports a corrupt archive without extracting it', async () => {
  const adapter = new UnzipArchiveAdapter('/usr/bin/unzip');
  await expect(adapter.testIntegrity(corruptArchivePath)).resolves.toEqual({ ok: false });
});
```

Add an unavailable-executable test using an explicit nonexistent absolute path. Define an injected
`ProcessRunner` interface in `archive-adapter.ts`, then use a deterministic fake runner to test the
output cap without starting a large child process.

- [ ] **Step 3: Verify RED**

```bash
npm run test:pipeline -- src/pipeline/unzip-archive.test.ts
```

Expected: FAIL because the adapter is missing.

- [ ] **Step 4: Implement bounded process execution**

Use `spawn(executable, args, { shell: false, stdio: ['ignore', 'pipe', 'pipe'] })`. Kill the process
on abort, timeout, or output overflow. Parse entry names from `unzip -Z1` and normalized modified
dates from `unzip -Z -T`. Reject undecodable process output rather than replacing bytes.

- [ ] **Step 5: Run focused tests**

```bash
npm run test:pipeline -- src/pipeline/unzip-archive.test.ts
```

Expected: PASS using only local fixtures.

- [ ] **Step 6: Commit the archive adapter and fixtures**

```bash
git add src/pipeline/archive-adapter.ts src/pipeline/unzip-archive.ts \
  src/pipeline/unzip-archive.test.ts tests/fixtures/pipeline/collector
git commit -m "feat(data): inspect zip archives without extraction"
```

---

### Task 7: Validate the archive, category, schema, permission, and timestamp contracts

**Files:**
- Create: `src/pipeline/archive-contract.ts`
- Create: `src/pipeline/inspect-archive.ts`
- Create: `src/pipeline/inspect-archive.test.ts`

**Interfaces:**
- Consumes: an `ArchiveAdapter`, `PermissionManifest`, and `ArchiveContract`.
- Produces: `inspectArchive(options): Promise<ArchiveInspectionResult>` and a deterministic schema-manifest SHA-256.

- [ ] **Step 1: Write failing safety and exact-contract tests**

Use a real in-memory adapter whose returned entries and bytes are explicit fixtures. Cover:

```ts
test.each(['', '/absolute.csv', '../escape.csv', 'dir\\entry.csv', '-option.csv'])(
  'rejects unsafe entry name %j',
  async (name) => {
    const result = await inspectArchive(makeInspectionOptions({ entryNames: [name] }));
    expect(result).toMatchObject({ kind: 'rejected', code: 'archive_entry_unsafe' });
  },
);

test('rejects one missing category rather than accepting a partial archive', async () => {
  const result = await inspectArchive(
    makeInspectionOptions({ entryNames: ['category-a.csv'], expectedEntryCount: 2 }),
  );
  expect(result).toMatchObject({ kind: 'rejected', code: 'category_manifest_changed' });
});

test('rejects entries from different provider dates', async () => {
  const result = await inspectArchive(
    makeInspectionOptions({ modifiedDates: ['2026-08-25', '2026-08-26'] }),
  );
  expect(result).toMatchObject({
    kind: 'rejected',
    code: 'timestamp_evidence_inconsistent',
  });
});
```

Add distinct tests for duplicate NFC names, corrupt archives, extra entries, permission drift,
encoding failure, delimiter drift, header drift, and a successful deterministic schema digest.

- [ ] **Step 2: Verify RED**

```bash
npm run test:pipeline -- src/pipeline/inspect-archive.test.ts
```

Expected: FAIL because inspection is missing.

- [ ] **Step 3: Implement exact matching and evidence hashing**

Never extract. Sort entries by normalized name, map each exact archive-contract entry to one exact
permission-manifest file-data identifier, read only the capped first-record prefix, inspect it with
`inspectCsvHeader()`, and compare literal encoding, delimiter, and header arrays. Hash stable JSON
with sorted keys and arrays. Require one shared provider-local modified date without deriving
`dataAsOf`.

- [ ] **Step 4: Run inspection and full pipeline tests**

```bash
npm run test:pipeline -- src/pipeline/inspect-archive.test.ts
npm run test:pipeline
```

Expected: PASS.

- [ ] **Step 5: Commit archive validation**

```bash
git add src/pipeline/archive-contract.ts src/pipeline/inspect-archive.ts \
  src/pipeline/inspect-archive.test.ts
git commit -m "feat(data): validate archive source contracts"
```

---

### Task 8: Orchestrate collection and prove changed, unchanged, and rejected outcomes

**Files:**
- Create: `src/pipeline/collect-seoul-archive.ts`
- Create: `src/pipeline/collect-seoul-archive.test.ts`

**Interfaces:**
- Consumes: `CollectorOptions` and default or injected `CollectorDependencies`.
- Produces: public `collectSeoulArchive(options)` and testable `createSeoulCollector(dependencies)`.

- [ ] **Step 1: Write failing end-to-end orchestration tests**

```ts
test('returns changed only after probe, complete download, and archive inspection accept', async () => {
  const collector = createSeoulCollector({
    probeSource: async () => ({ kind: 'accepted', evidence: sourceEvidence }),
    downloadArchive: async () => ({
      kind: 'accepted',
      archivePath: '/tmp/staged/source.zip',
      sha256: 'new-digest',
      byteLength: 4,
    }),
    inspectArchive: async () => ({ kind: 'accepted', evidence: archiveEvidence }),
    cleanupRejectedDownload: async () => undefined,
    loadContracts: async () => contracts,
  });

  await expect(
    collector({
      stagingRoot: '/tmp/staged',
      previousAcceptedSha256: 'old-digest',
      fetchedAt: '2026-08-28T00:00:00.000Z',
      limits: DEFAULT_COLLECTOR_LIMITS,
    }),
  ).resolves.toMatchObject({ kind: 'accepted', change: 'changed' });
});
```

Add an unchanged-digest test, rejection propagation for every stage, cleanup after inspection
rejection, and proof that no publication or repository output path is accepted.

- [ ] **Step 2: Verify RED**

```bash
npm run test:pipeline -- src/pipeline/collect-seoul-archive.test.ts
```

Expected: FAIL because the orchestrator is missing.

- [ ] **Step 3: Implement the minimal factory and default collector**

The factory calls stages in order and short-circuits on rejection. It compares digests only after
inspection accepts. The default dependency loader reads the committed permission and archive
contracts relative to the repository root, validates them, and uses the native HTTP and Info-ZIP
adapters.

- [ ] **Step 4: Run all pipeline tests and coverage**

```bash
npm run test:pipeline
npm run test:coverage
```

Expected: all tests pass and repository coverage remains above configured thresholds.

- [ ] **Step 5: Commit orchestration**

```bash
git add src/pipeline/collect-seoul-archive.ts src/pipeline/collect-seoul-archive.test.ts
git commit -m "feat(data): orchestrate staged source collection"
```

---

### Task 9: Run the bounded live probe and commit schema-only archive evidence

**Files:**
- Create: `scripts/probe-seoul-source.ts`
- Create: `src/pipeline/discover-archive-contract.ts`
- Create: `src/pipeline/discover-archive-contract.test.ts`
- Create: `src/pipeline/contracts/seoul-archive-contract.json`
- Create: `reports/probe-2026-08-28-seoul-archive-contract.md`
- Modify: `commands.md`

**Interfaces:**
- Consumes: official source endpoints, audited permission manifest, temporary staging, and the archive adapter.
- Produces: schema-only reviewed archive contract and a report containing no record values.

- [ ] **Step 1: Write failing discovery tests**

Test exact one-to-one mapping from category titles to entry names, schema-only output, deterministic
sorting, and rejection when a filename cannot be mapped uniquely. The output contract contains:

```ts
interface ArchiveContractEntry {
  entryName: string;
  fileDataId: string;
  encoding: 'utf-8' | 'euc-kr';
  delimiter: ',';
  headers: string[];
  timestampFields: string[];
}
```

- [ ] **Step 2: Verify RED, implement discovery, and verify GREEN**

```bash
npm run test:pipeline -- src/pipeline/discover-archive-contract.test.ts
```

Expected before implementation: FAIL because discovery is missing. Implement schema-only discovery,
then rerun and expect PASS.

- [ ] **Step 3: Implement the manual probe command**

The command requires `--staging=<absolute-temporary-directory>` and `--output=<absolute-report-path>`.
It refuses paths inside the repository for ZIP bytes, invokes limit/range/full-transfer checks,
records source and schema evidence, writes no record values, and removes the source ZIP after the
candidate contract is written.

- [ ] **Step 4: Run the official non-production probe**

Create staging with `mktemp -d`, run with Node.js 24.19.0, and inspect the candidate before copying
schema-only JSON into `src/pipeline/contracts/seoul-archive-contract.json`. Stop without guessing if
the provider rejects the request, any category mapping is ambiguous, entries have inconsistent
dates, or a required header is not evidenced.

- [ ] **Step 5: Verify the committed contract against the staged archive before deletion**

Run the normal collector in verification mode against the same temporary archive. Expected: 195
distinct categories, exact permission mapping, consistent timestamp evidence, and zero source
records in Git. Delete the temporary archive after verification.

- [ ] **Step 6: Commit probe implementation and schema-only evidence**

```bash
git add scripts/probe-seoul-source.ts src/pipeline/discover-archive-contract.ts \
  src/pipeline/discover-archive-contract.test.ts \
  src/pipeline/contracts/seoul-archive-contract.json \
  reports/probe-2026-08-28-seoul-archive-contract.md commands.md
git commit -m "feat(data): record seoul archive contract"
```

---

### Task 10: Complete TASK-005 verification and handoff records

**Files:**
- Modify: `tasks/active.md`
- Modify: `tasks/completed.md` only after an eligible Reviewer approves
- Modify: `memory/project.md`
- Modify: `memory/session.md`
- Modify: `memory/architecture.md`
- Modify: `memory/known-issues.md`
- Modify: `docs/prd-traceability.md`
- Create: `reports/test-2026-08-28-task-005.md`
- Create: `reports/review-2026-08-28-task-005.md` only through an eligible Reviewer

**Interfaces:**
- Consumes: implementation diff, pipeline tests, live-probe evidence, dependency report, and full verification output.
- Produces: traceable TASK-005 test evidence and an explicit final-review gate.

- [ ] **Step 1: Run the exact pinned runtime verification**

```bash
task_node_dir='/Users/sonmyeong-gwan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin'
PATH="$task_node_dir:$PATH" node --version
PATH="$task_node_dir:$PATH" npx --yes npm@11.17.0 --version
PATH="$task_node_dir:$PATH" npx --yes npm@11.17.0 run test:pipeline
PATH="$task_node_dir:$PATH" npx --yes npm@11.17.0 run verify:full
git diff --check
```

Expected: Node `v24.19.0`, npm `11.17.0`, all pipeline tests pass, full verification passes, and
changed-line whitespace is clean.

- [ ] **Step 2: Audit repository scope**

Verify no complete ZIP, source record, workflow, deployment, status mapping, publication output,
secret, `.env`, or handbook path changed. Verify the browser production bundle does not include
pipeline modules or `@types/node`.

- [ ] **Step 3: Record test evidence and update task traceability**

Write exact command exits, test counts, coverage, live-probe results, dependency rows, changed paths,
and scope-audit results in the English test report. Check acceptance criteria supported by evidence,
but leave TASK-005 active until an eligible Reviewer approves.

- [ ] **Step 4: Run the final-review gate**

An eligible Reviewer who did not author the implementation reviews FR-13, ADR-009, ADR-010, the
design, implementation, fixtures, test report, live-probe evidence, dependency scope, and diff. The
Reviewer records `Approved` or `Request Changes` with findings.

- [ ] **Step 5: Close or hand off TASK-005**

If Approved, move TASK-005 to `tasks/completed.md`, activate TASK-006, and commit the records. If an
eligible Reviewer is unavailable, keep TASK-005 active with implementation and verification
complete and record final review as the only remaining gate.
