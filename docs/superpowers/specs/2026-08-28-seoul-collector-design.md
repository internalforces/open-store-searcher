<!--
Purpose:        Define the approved TASK-005 fail-safe Seoul source probe and staged collector
Owner:          Architect
Update Trigger: When the source HTTP contract, archive adapter, safety limits, or collector boundary changes
Harness Version: 1.1
-->

# Seoul Source Probe and Staged Collector Design

_Date: 2026-08-28_

_Status: Approved by the user on 2026-08-28_

## Objective

TASK-005 will add a build-time TypeScript collector for the Seoul all-category ZIP candidate
approved by ADR-009. The collector will verify the observed provider contract, transfer one complete
archive into temporary staging, calculate change evidence, inspect the archive without extracting
it, and return a typed accepted or rejected result to later pipeline tasks.

The collector is deliberately unable to publish data. TASK-006 through TASK-009 own transformation,
status mapping, validation, and last-known-good publication. TASK-010 owns scheduled automation.

## Approved Approach

Use Node.js 24.19.0 native HTTP, stream, filesystem, child-process, and SHA-256 capabilities. Use the
system Info-ZIP `unzip` executable behind an injected archive interface. GitHub-hosted Ubuntu 24.04
runners and the current macOS development environment provide `unzip`; the collector will reject
the run with a clear environment error if the executable is absent or incompatible.

Add exactly one direct development dependency, `@types/node` 24.13.3 under the MIT license, so the
approved Node APIs remain strictly typed. No ZIP package enters the npm dependency graph or browser
bundle. A later change to a JavaScript ZIP library requires a separate dependency decision.

The alternatives were rejected for this task:

- A JavaScript ZIP package would improve operating-system portability but adds an unnecessary
  supply-chain dependency before the provider contract is stable.
- A handwritten ZIP parser would duplicate a security-sensitive file-format implementation and
  create unnecessary ZIP64, filename-encoding, and malformed-archive risk.

## Scope and Non-Goals

TASK-005 includes:

- an honest, bounded HTTP contract probe;
- complete temporary download and SHA-256 calculation;
- archive integrity, entry, encoding, delimiter, header, and timestamp-evidence inspection;
- comparison with the approved 195-category permission manifest;
- deterministic change detection;
- offline tests for success and every specified rejection path;
- one manually initiated, non-production live probe that records schema-only contract evidence.

TASK-005 excludes:

- scheduled GitHub Actions or Pages permissions;
- production collection, publication, or deployment;
- record transformation or static JSON output;
- processed-status mapping;
- a global data-as-of value;
- API keys, accounts, cookies, or OpenAPI calls;
- production records or complete source archives committed to Git.

## Trust Boundaries

The provider response, redirect target, headers, byte counts, ZIP metadata, filenames, CSV bytes,
and timestamps are untrusted input. The committed permission manifest and reviewed archive contract
are repository-controlled expectations. Temporary staging is the only writable data boundary.

The collector will not accept a repository output directory as its staging root. The caller creates
an isolated temporary directory and passes its absolute path. No archive entry is extracted to the
filesystem; CSV header inspection streams entry bytes through `unzip -p`.

## Module Layout

```text
src/pipeline/
├── collector-types.ts          # Public results, evidence, limits, and rejection codes
├── calendar-date.ts            # Shared real-calendar validation
├── source-contract.ts          # Approved URLs, headers, manifest parsing, and invariants
├── probe-source.ts             # Limit check, redirect/range probe, and HTTP evidence
├── staged-download.ts          # Complete streamed transfer, byte count, and SHA-256
├── unzip-archive.ts            # Info-ZIP process adapter with no shell invocation
├── csv-header.ts               # Strict encoding, delimiter, and first-record parsing
├── inspect-archive.ts          # Integrity, entry, schema, timestamp, and manifest checks
├── manual-probe.ts             # Manual-probe argument and fail-early orchestration boundary
└── collect-seoul-archive.ts    # Orchestrator returning accepted or rejected outcomes

src/pipeline/contracts/
└── seoul-archive-contract.json # Reviewed schema-only output of the first live probe

tests/fixtures/pipeline/
└── collector/                  # Synthetic archives and HTTP response fixtures only
```

Every module has one responsibility. Network and archive process adapters are injected so pipeline
tests remain offline and do not mock the behavior being asserted.

## Public Interfaces

```ts
type CollectorRejectionCode =
  | 'environment_unavailable'
  | 'download_limit_denied'
  | 'http_contract_changed'
  | 'redirect_not_allowed'
  | 'range_contract_changed'
  | 'archive_size_out_of_bounds'
  | 'transfer_incomplete'
  | 'archive_corrupt'
  | 'archive_entry_unsafe'
  | 'category_manifest_changed'
  | 'permission_manifest_changed'
  | 'csv_contract_changed'
  | 'timestamp_evidence_inconsistent';

interface CollectorOptions {
  stagingRoot: string;
  previousAcceptedSha256?: string;
  fetchedAt: string;
  signal?: AbortSignal;
  limits: CollectorLimits;
}

type CollectionResult =
  | {
      kind: 'accepted';
      change: 'changed' | 'unchanged';
      archivePath: string;
      sha256: string;
      byteLength: number;
      fetchedAt: string;
      sourceEvidence: SourceEvidence;
      archiveEvidence: ArchiveEvidence;
    }
  | {
      kind: 'rejected';
      code: CollectorRejectionCode;
      message: string;
      fetchedAt: string;
    };

async function collectSeoulArchive(options: CollectorOptions): Promise<CollectionResult>;
```

`fetchedAt` must be an externally supplied, valid UTC ISO 8601 timestamp. It is evidence about the
request and is never used as `dataAsOf`. Expected provider failures return a rejected result. A
programming error may throw, but the orchestrator still removes its partial staging file.

## Approved Source Contract

The source page is `https://file.localdata.go.kr/file/general_restaurants/info`. The download-limit
check is an unauthenticated `GET` to
`https://file.localdata.go.kr/file/validate/download-count`. The Seoul archive is an unauthenticated
`GET` to
`https://file.localdata.go.kr/file/download-all?orgCode=6110000_ALL`.

Requests use HTTPS only and send:

- `Accept: application/zip, application/octet-stream;q=0.9` for archive requests;
- `Referer: https://www.data.go.kr/`;
- an honest compatibility user agent containing `open-store-searcher/0.1` and the public repository
  URL;
- no authorization, cookie, search term, or user-derived header.

The collector performs these checks in order:

1. The approved Info-ZIP 6.00 Linux ELF build must advertise Unicode UTF-8, large-file, and ZIP64
   capabilities. An incompatible environment returns `environment_unavailable` before any provider
   request.
2. The download-limit endpoint must return 2xx. HTTP 429 becomes `download_limit_denied`. Other
   non-2xx results become `http_contract_changed`; the collector does not retry around a denial.
3. A one-byte range request uses `Range: bytes=0-0`. It must return HTTP 206 with a valid
   `Content-Range` containing a positive total length and exactly one response byte. The body is read
   incrementally and cancelled immediately if it exceeds one byte.
4. Every redirect is processed manually. At most three redirects are allowed, every target must be
   syntactically valid HTTPS on `file.localdata.go.kr`, and the final response must not be an HTML
   error page.
5. The total compressed length must be between 1 MiB and 512 MiB. A bound change requires review,
   rather than silent widening.
6. The full request must return HTTP 200. If present, `Content-Length` must equal the received byte
   count and the range-probed total. The complete response must have the ZIP `PK` signature.

No fallback user agent, alternate host, cookie acquisition, browser automation, or repeated retry
is allowed. A provider contract change is a rejected result requiring review.

## Staging and Change Detection

The caller supplies a new temporary directory outside the repository and passes the repository root
explicitly. The downloader resolves both paths independently of the process working directory and
rejects staging inside the repository by checking actual parent path segments rather than string
prefixes. It writes to a unique `.part` file with exclusive creation. SHA-256 and the byte count
are updated while streaming, and every chunk is written completely even if the filesystem reports
a short write. Only a complete, contract-conforming transfer is renamed to a `.zip` file within
the same staging directory. Every rejection removes both paths.

The accepted SHA-256 is compared with `previousAcceptedSha256` only after archive inspection passes.
An equal digest returns `unchanged`; a different digest returns `changed`. Both outcomes retain the
validated staging archive for the caller. Neither outcome writes a transformation or publication
artifact.

## Archive Inspection

The Info-ZIP adapter invokes executable paths and argument arrays through `spawn` with `shell: false`.
It never interpolates an archive path or entry name into a command string.

- `unzip -v` must identify Info-ZIP 6.00 compiled for Unix Linux ELF with Unicode UTF-8,
  large-file, and ZIP64 capabilities. Apple and other unapproved signatures are unavailable.
- `unzip -tqq <archive>` must complete successfully.
- `unzip -Z1 <archive>` provides the entry inventory.
- `unzip -p <archive> <entry>` streams bytes for schema-only inspection.

Entry names are rejected if empty, absolute, dot-segmented, backslash-separated, duplicated after
Unicode NFC normalization, start with a hyphen, or fall outside the reviewed archive contract.
Directory entries may be listed but are not counted as categories. The reviewed contract must
contain exactly 195 distinct CSV category entries, each mapped one-to-one to the TASK-004
permission manifest.

The first non-production live probe may emit a candidate schema-only contract only after every ZIP
entry reports one common real calendar date. The candidate contains entry names, the mapped
file-data identifier, detected encoding, delimiter, normalized header list, and timestamp-field
presence. It may not emit record values. The candidate receives Architect and Reviewer inspection
before it becomes `src/pipeline/contracts/seoul-archive-contract.json`.

The user approved one literal source exception on 2026-08-29:
`자원환경_단독정화조-오수처리시설설계시공업.csv` maps to audited file-data ID `15045011`, whose
portal title uses `단독정화조 및 오수처리시설설계시공업`. No generalized punctuation or word
normalization is allowed; every other entry must retain exact title matching.

Subsequent collection accepts only an exact match to that committed contract. Missing, extra,
renamed, duplicated, or remapped entries reject the archive.

## CSV Contract Inspection

Each CSV stream is decoded strictly as UTF-8 with an optional BOM or as `euc-kr`. A decoder failure
rejects the entry. The collector parses only the first complete CSV record and supports quoted
fields, escaped quotes, commas inside quotes, CRLF, and LF. It rejects ambiguous decoding, an empty
header, duplicate normalized headers, or a delimiter other than the reviewed per-entry delimiter.

TASK-005 records header and timestamp-field evidence without assigning business meaning. Identity,
name, address, raw-status, date, and permission expectations come from ADR-009 and the reviewed
contracts. TASK-006 through TASK-008 decide transformation semantics and validation policy.

## Timestamp Separation

The collector keeps four concepts separate:

- `fetchedAt`: caller-supplied UTC retrieval time;
- provider freshness statement: structured evidence containing the portal's current daily cadence,
  two-day coverage lag, and official dataset URL;
- archive entry timestamps: ZIP metadata reported by the archive adapter;
- CSV timestamp-field evidence: field presence and observed format metadata from the probe.

TASK-005 does not derive an archive-wide `dataAsOf`. If entries do not provide consistent timestamp
evidence, the result is rejected as `timestamp_evidence_inconsistent`. TASK-008 later defines the
conservative derivation and stale-data checks.

## Safety Limits

The default compressed archive bound is 512 MiB. Process output used for inventory and diagnostics
is capped at 8 MiB, each header probe is capped at 256 KiB before a complete first record must be
found, HTTP probe calls time out after 30 seconds, full download inactivity times out after 2
minutes, and the total full-download deadline is 20 minutes. Abort signals terminate the HTTP
request and child process. The inactivity timer starts before the full-download request so it
covers response-header stalls, then resets for each received chunk. A child-process request whose
signal is already aborted is rejected before spawn.

Archive entry dates must be one common real calendar date, not merely a `YYYY-MM-DD`-shaped string.

Because no entry is extracted, archive contents cannot overwrite repository files. Any change to a
limit is a reviewed contract change and must be justified with recorded probe evidence.

## Testing Strategy

Implementation follows red-green-refactor cycles in the pipeline Vitest project.

- Pure tests cover URL allowlisting, redirect limits, range parsing, permission-manifest integrity,
  safe entry names, CSV header parsing, timestamp separation, and digest comparison.
- Injected HTTP tests cover 2xx success, 429 denial, other non-2xx responses, redirects, HTML error
  pages, absent or malformed range headers, partial bodies, aborts, and byte-count disagreement.
- Synthetic ZIP fixtures cover valid archives, corruption, duplicate and unsafe names, missing and
  extra categories, encoding failure, delimiter drift, header drift, and inconsistent timestamps.
- Adapter integration tests run only against local synthetic archives and the installed `unzip`
  executable. They make no network request.
- One manual contract-probe command may access the official source. It writes only temporary ZIP
  bytes and schema-only evidence, then deletes source bytes after review. It checks the approved
  host Info-ZIP environment before any provider request. The command accepts an explicit local
  `--unzip` executable but exposes no container mode or implicit host-to-container path mapping.

TASK-005 completes only after `npm run test:pipeline`, `npm run verify:full`, changed-scope checks,
dependency-license regeneration, and Reviewer approval pass under Node.js 24.19.0 and npm 11.17.0.

## Failure Reporting

Every rejected result has a stable code and a concise message naming the observed mismatch without
including response bodies or source records. Logs may contain the official URL, status code, byte
counts, hashes, archive entry names, and schema names. They must not contain cookies, secrets,
record values, or user data.

## Acceptance Mapping

| TASK-005 criterion | Design coverage |
|---|---|
| Approved design | This specification and ADR-010 |
| HTTP contract probe | Approved Source Contract |
| Complete temporary staging | Staging and Change Detection |
| ZIP, category, encoding, delimiter, header, and permission checks | Archive and CSV Inspection |
| SHA-256 and normalized manifests | Staging and Archive Inspection |
| Timestamp separation | Timestamp Separation |
| Required rejection tests | Testing Strategy |
| No dependency, production, workflow, or publication expansion | Scope and Approved Approach |
