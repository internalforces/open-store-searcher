<!--
Purpose:        Record system components, data flow, boundaries, and architecture constraints
Owner:          Architect
Update Trigger: When components, data flow, deployment, or structural decisions change
Harness Version: 1.1
-->

# Architecture — open-store-searcher

_Last updated: 2026-09-04_

## System Overview

GitHub Actions collects, normalizes, and validates public administrative data into static JSON. A static web application on GitHub Pages downloads the JSON and searches it in the browser.

**Pattern**: Build-time ETL + Static Site + Client-side Search

## Trust Boundaries

- Build-time external boundary: download of local administrative licensing open data
- Repository boundary: collector, transformer, validator, fixtures, and static artifacts
- Deployment boundary: publication of validated artifacts from GitHub Actions to GitHub Pages
- User boundary: search-term normalization, candidate scoring, and presentation in the browser
- External maps: no automatic requests; navigation occurs only after an explicit user click

## Components

1. Data collector: downloads source files and metadata and detects changes.
2. Data transformer: cleans fields, maps statuses, separates display and search values, and creates identifiers.
3. Validator: checks schema, abrupt changes, duplicates, missing values, new statuses, as-of dates, JSON syntax, and size.
4. Publication stage: replaces artifacts only after complete validation and preserves existing artifacts after failure.
5. Static data: includes the minimum records plus source and as-of metadata needed for browser search.
6. Search engine: normalizes input and calculates candidate matches, scores, address conflicts, and confidence.
7. Dashboard: displays status, evidence, uncertainty, dates, external-verification links, and error states.
8. Test harness: Vitest projects separate Node unit, Node pipeline, and jsdom component ownership;
   Playwright projects cover Chromium, Firefox, WebKit, and mobile Chromium.
9. Staged Seoul collector: native Node HTTP streams and SHA-256 feed isolated temporary storage;
   a shell-free injected Info-ZIP adapter inspects integrity and schema without extraction or any
   publication capability. The repository root is passed explicitly to the downloader so staging
   isolation does not depend on the process working directory or a dotted child name. Download
   inactivity covers response headers and resets per received chunk; short filesystem writes are
   completed before the next chunk, and early response-contract rejections cancel the unconsumed
   response body. Already-aborted process requests are rejected before spawn. Before contacting the
   provider, both normal and manual collection require the approved Info-ZIP 6.00 Linux ELF Unicode
   capability signature; Apple builds fail with `environment_unavailable`.
10. TASK-006 transformer: a pure Node pipeline module consumes staged synthetic row-shaped input
    against the accepted archive schema contract, preserves exact display/evidence strings, derives
    versioned search-only values, creates full 256-bit internal identifiers, rejects invalid whole
    stages, and emits canonically ordered records and normalization-collision diagnostics.
11. TASK-007 domain mapper: a pure, exact aggregate-pair function returns only the four approved
    statuses. Transformation schema V2 adds `processedStatus` while retaining lossless raw evidence
    and identifier/normalization V1. Detailed statuses do not influence classification.
12. TASK-008 staged validator: `validate-license-refresh.ts` binds collector/schema/permission and
    completed per-category ingestion evidence, invokes the existing V2 transformer, and validates
    metrics against explicit reviewed policy/baseline inputs. It returns accepted, rejected, or
    review_required; missing evidence never becomes acceptance. Supporting metrics/types modules
    measure completeness, counts, aggregate status distributions, and collision participation.
    `shared/data-freshness.ts` evaluates date-only coverage against an injected Seoul calendar date;
    more than seven days is stale. `validate-json-bytes.ts` validates UTF-8, syntax, and an explicit
    byte bound independently of the future public artifact schema. These modules perform no I/O.

## Data Flow

```text
Local administrative licensing open data
  → Scheduled GitHub Actions run
  → Collection and change detection
  → Normalization and status mapping
  → Schema, quality, and size validation
  → Atomic publication of validated static JSON
  → GitHub Pages
  → Browser lazy loading
  → Input normalization, candidate ranking, and confidence
  → Administrative status, raw evidence, and as-of date
```

No external API or database request occurs during real-time search.

## Data Record Boundary

The approved TASK-006 boundary separates exact decoded display/evidence values from versioned
search-only normalization and preserves source identity inputs without normalization. It covers
business name, street and parcel addresses, category and category-specific business types, raw
operating and detailed status code/name pairs, available lifecycle dates, source timestamps, and
provenance. ADR-012 and the design were approved by the user on 2026-09-02. ADR-013 was accepted
on 2026-09-04 and adds processed display status through `mapLicenseStatusV1` and
`transformLicenseRecordsV2`. The result and record types are V2; staged inputs, identifiers,
normalization, and diagnostics retain their V1 contracts. `dataAsOf` remains TASK-008.

Accepted ADR-014 adds validation V1 around the unchanged transformed V2 records. Verified coverage
is metadata on the validation result and requires a reviewed, archive-bound assertion covering all
195 categories with one date. No production assertion is available yet. Retrieval time and the
ZIP modification date never become coverage automatically. Synthetic tests exercise the contract;
production parser/publication integration and exact artifact-byte binding remain TASK-009.

Official provider guidance defines source identity as service ID plus licensing-authority code plus
management number and warns that management number alone may repeat. The accepted TASK-005 CSV
schemas omit service ID. Approved option B treats `fileDataId` only as a versioned project category
namespace, not as the provider's primary key, for the exact length-prefixed UTF-8 SHA-256 tuple.
The full 256-bit digest remains internal; no public identifier text or share-URL format is authorized.

The v1 implementation uses the exact `fileDataId`, authority code, and management number bytes with
length-prefix framing and native SHA-256. Record order uses the length-prefixed exact identity tuple.
The common business-type registry accepts exact `업태구분명`; the reviewed category-specific subset
accepts exact `의료기관종별명` for four medical category IDs and exact `업종구분명` for the
ADR-011 alias category. Other semantically unconfirmed headers remain unmapped and open for review.

## Decision Summary

| Decision | Choice | Date |
|---|---|---|
| Implementation stack | TypeScript 7.0.2, Node.js 24.19.0 LTS, Preact 10.29.8, Vite 8.2.1, npm 11.17.0 | 2026-08-20 |
| Repository | Single repository and single npm package with module directories | 2026-08-20 |
| Repository foundation | MIT-licensed single npm package; strict TypeScript; Biome; relative Vite base | 2026-08-20 |
| Test stack | Vitest, Testing Library, Playwright, and axe | 2026-08-20 |
| Candidate source contract | Official Seoul all-category ZIP with TASK-004 permission coverage, gated by a fail-safe TASK-005 contract probe | 2026-08-28 |
| Transformation and identifier | Approved lossless record plus versioned full-digest internal project identifier; public text and URL format deferred | 2026-09-02 |
| Staged validation and freshness | ADR-014: explicit reviewed policy/baseline/coverage inputs; Seoul date-only seven-day boundary; internal JSON-byte helper; production evidence pending | 2026-09-04 |
| Harness | AI Development Harness v1.1 Standard | 2026-08-18 |
| Runtime | Static site with in-browser search | 2026-08-18 |
| Data processing | GitHub Actions ETL and static JSON | 2026-08-18 |
| Failure policy | Uncertain determinations become `확인되지 않음`; validation failures stop publication | 2026-08-18 |
| Harness language | English, except exact quoted product/source literals | 2026-08-18 |

See `memory/decisions.md` for details.

## Architecture Constraints

- Separate source modules for collection, transformation, validation, status mapping, search, and UI.
- Support splitting data files by Seoul district or business category as data grows.
- Do not assume a static-site base path; test GitHub Pages subpath deployment.
- Do not deploy a pipeline that lacks a last-known-good data preservation strategy.
- ADR-009 accepts the official zero-key Seoul all-category ZIP as the candidate default source.
  TASK-004 verified permission and attribution coverage for all 195 selected categories. The
  TASK-005 probe must validate automation stability, the complete category
  manifest, schema, archive integrity, cross-entry timestamp consistency, and as-of inputs before
  production collection or publication is allowed.
- Do not make the account- and API-key-dependent OpenAPI a required path without explicit approval
  to change the zero-external-key product constraint.
- Keep browser, search, domain, pipeline, and shared TypeScript modules in explicit directories within one npm package.
- Use Preact-local state only; no router or external state-management dependency is approved.
- Keep Node-executed pipeline and shared code compatible with native erasable TypeScript syntax.
- Use the committed Node.js, npm, package-lock, TypeScript, Biome, and Vite configuration as the reproducible foundation.
- Implement TASK-005 with native Node.js streaming and hashing plus an injected, shell-free
  Info-ZIP adapter. Collector output is temporary evidence only and cannot publish artifacts.
- Carry the provider's reviewed daily cadence, two-day coverage lag, and official source URL as
  structured source evidence separate from retrieval time and any later `dataAsOf` derivation.
- Treat compatible UTF-8 filename handling as part of the Info-ZIP environment gate. The current
  macOS builds fail that gate, while Ubuntu 24.04 Info-ZIP 6.0-28ubuntu4.1 passes it. Run this gate
  before any provider request. Never guess or normalize transformed provider entry names into an
  accepted archive contract.
- Parse redirect locations defensively and bound the range-probe body to one byte without buffering
  a drifting response. Apply the same real-calendar-date validator to contract discovery and normal
  archive inspection.
- Run the manual probe only with a compatible host Info-ZIP executable. It has no Docker-container
  option because an implicit host archive path is not a valid container path contract.
- The only approved archive-name exception is the literal
  `자원환경_단독정화조-오수처리시설설계시공업.csv` mapping to audited file-data ID `15045011`.
  Do not generalize this decision into punctuation or word substitution.
- Build and preview browser tests locally at `/open-store-searcher/` without changing the
  production Vite base or contacting a deployed environment.
- Use `npm run verify` for the fast lint, format, typecheck, coverage, and build loop. Use
  `npm run verify:full` for task completion and release-oriented verification by adding the full
  browser matrix and desktop/mobile Chromium accessibility scans.
- Keep `handbook/ko/**` outside linting, formatting, and all implementation context.
