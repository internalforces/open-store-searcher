<!--
Purpose:        Record official evidence and a bounded recommendation for the source-data contract
Owner:          Researcher
Update Trigger: When the official delivery, schema, licensing, or attribution evidence changes
Harness Version: 1.1
-->

# Research: Local Administrative Licensing Source-Data Contract

_Research date: 2026-08-28_

_Decision: Approved by the user on 2026-08-28 through ADR-009, subject to the bounded TASK-005
contract probe described below._

## Question

Which official, zero-cost delivery contract can provide Seoul local administrative licensing data
for the static pipeline while preserving source evidence, freshness, uncertainty, and the last
known-good publication?

## Scope

This research covers the Ministry of the Interior and Safety data that replaced the former
LOCALDATA delivery surface in the Public Data Portal. It evaluates current file and OpenAPI
delivery, authentication, usage limits, update behavior, representative schema fields, identity,
licensing, redistribution, attribution, change detection, and failure behavior.

The work is evidence-only. It does not approve a delivery method, implement a collector, download a
complete production dataset, define processed-status mappings, or treat a representative category
schema as universal. The Architect must accept the contract and the human approval gate for a
source-data delivery choice must pass before implementation.

## Verified Facts

### Provider, coverage, and migration

- The Ministry of the Interior and Safety is the provider of the current local administrative
  licensing datasets in the Public Data Portal.
- The official 2026 service notice states that 195 licensing categories and 14 convenience
  datasets are available as both OpenAPI and file data. This is licensing-data coverage, not a
  registry of every business in Seoul.
- The former LOCALDATA service was integrated into the Public Data Portal in January 2026. The
  transition manual describes CSV-only file delivery in the new portal and nationwide or regional
  downloads. It also describes account sign-in and an application step for OpenAPI use.
- An official transition Q&A states that separate daily-difference files are no longer provided and
  that category history APIs are available instead.

### File delivery

The representative general-restaurant file dataset is an official nationwide CSV dataset. Its
portal metadata says that it is updated automatically every day, represents data through D-2, is
free to use, and has an unrestricted permission scope. The portal links to the current file
delivery page.

Direct observations made on 2026-08-28, using metadata requests and one-byte HTTP range requests
rather than full dataset downloads, established the following current behavior:

- The file page lists all 195 category downloads and regional download choices.
- `https://file.localdata.go.kr/file/download-all?orgCode=6110000_ALL` is the current Seoul
  all-category download endpoint. It returned a ZIP response with a total current size of
  215,968,197 bytes.
- A category-specific Seoul URL follows the form
  `https://file.localdata.go.kr/file/download/{category}/info?orgCode=6110000_ALL`. The tested
  general-restaurant response was CSV with a total current size of 161,582,317 bytes.
- The tested responses supported byte ranges but exposed neither `ETag` nor `Last-Modified`.
- A normal browser user agent and the Public Data Portal as referrer were required in the tested
  path. A default direct client request was redirected to an error page. This behavior is not a
  documented stable automation guarantee.
- The download page calls `/file/validate/download-count` before starting a download and treats an
  HTTP 429 response as a download-limit failure. No official numeric file-download limit was found.

These observations prove that the current endpoint can be probed without an API key. They do not
prove long-term endpoint stability or authorize a production collector.

### OpenAPI delivery

The representative general-restaurant OpenAPI is REST with JSON or XML responses. Its portal page
states that development and production access are automatically approved, the service is free,
and the development traffic allowance is 10,000 requests. A production increase may be requested
with a usage case. The official error contract includes invalid or expired keys, missing service
permission, daily or per-second traffic excess, invalid parameters, and server or system errors.

The current category Swagger documentation shows:

- A required `serviceKey`, `pageNo`, and `numOfRows`, with at most 100 records per page.
- A current-data `/info` endpoint and a `/history` endpoint.
- Current-data filters for license date, raw operating-status code, business name, road address,
  data-update timestamp, and licensing-authority group code.
- A history query that requires a base date and licensing-authority group code. Its documentation
  says history is available from 2026-01-01 through the day before the query.
- General-restaurant response fields including `OPN_ATMY_GRP_CD`, `MNG_NO`, `DAT_UPDT_SE`,
  `DAT_UPDT_PNT`, `ROAD_NM_ADDR`, `LOTNO_ADDR`, `BPLC_NM`, `SALS_STTS_CD`, `SALS_STTS_NM`,
  `DTL_SALS_STTS_CD`, `DTL_SALS_STTS_NM`, `BZSTAT_SE_NM`, `SNTTN_BZSTAT_NM`, `LCPMT_YMD`,
  `CLSBIZ_YMD`, and `LAST_MDFCN_PNT`.

An official Q&A identifies `OPN_ATMY_GRP_CD` plus `MNG_NO` as the composite identity and says a
`LAST_MDFCN_PNT` lower-bound condition covers new, modified, and status-changed records. The
representative current Swagger instead documents `DAT_UPDT_PNT` range filters. This inconsistency
must be resolved with a contract probe before any incremental algorithm is designed.

### PRD field evidence

The table distinguishes representative evidence from a project contract. A field is not accepted
as universal until all 195 category schemas or delivered file headers are validated.

| PRD need | Representative official evidence | Contract status |
|---|---|---|
| Stable identifier | `OPN_ATMY_GRP_CD` + `MNG_NO` | Composite identity is supported by official Q&A; uniqueness still requires whole-delivery validation |
| Original business name | `BPLC_NM` | Evidenced for general restaurants; validate every category |
| Road address | `ROAD_NM_ADDR`, with `ROAD_NM_ZIP` | Evidenced for general restaurants; validate every category |
| Parcel address | `LOTNO_ADDR` | Evidenced for general restaurants; validate every category |
| Raw operating status | `SALS_STTS_CD`, `SALS_STTS_NM` | Preserve both; no processed mapping is approved here |
| Raw detailed status | `DTL_SALS_STTS_CD`, `DTL_SALS_STTS_NM` | Preserve both; vocabulary may vary by category |
| Category and business type | Licensing category plus `BZSTAT_SE_NM` and `SNTTN_BZSTAT_NM` | Exact cross-category semantics remain unverified |
| License date | `LCPMT_YMD` | Evidenced for general restaurants; format and availability require validation |
| Suspension and reopening dates | Not present in the representative general-restaurant schema | Optional and unverified; never infer them |
| Closure date | `CLSBIZ_YMD` | Evidenced for general restaurants; preserve absence as absence |
| Last modified | `LAST_MDFCN_PNT`; also `DAT_UPDT_PNT` | The distinction and cross-category consistency remain unresolved |
| Processed display status | No authoritative output field | TASK-007 must map verified raw values; unknowns remain `확인되지 않음` |
| Source URL | Portal dataset and delivery URLs | Pipeline-generated provenance, not a source record field |
| Data as-of date | Portal says daily and D-2; no tested archive header supplied a global as-of date | Store retrieval time separately; define a conservative, validated as-of rule before publication |

### Licensing, redistribution, and attribution

- The representative file and OpenAPI pages both state that use is free and unrestricted.
- The Public Data Portal policy defines unrestricted Type 0 data as permitting commercial and
  noncommercial use and modification without an attribution requirement. Other Korea Open
  Government License types have attribution or additional conditions.
- No single current official statement was found proving that all 195 category datasets have the
  same permission type. A category manifest must capture the permission shown for every selected
  dataset and fail closed if it differs from the approved contract.
- Regardless of whether attribution is legally required for a Type 0 dataset, PRD FR-09 requires
  the product to show its source and data as-of date. Built artifacts therefore need explicit
  provenance.

A suitable product-facing provenance record would name the Ministry of the Interior and Safety and
the Public Data Portal local administrative licensing dataset, link to the applicable portal
dataset page, record retrieval time and the separately derived data as-of date, and state that the
project transformed the source. This is a product evidence requirement, not a claim that Type 0
legally requires attribution.

## Alternatives

| Alternative | Cost and access | Automation and maintenance | Privacy | Schema and change detection | Principal failure modes |
|---|---|---|---|---|---|
| Seoul all-category ZIP snapshot | Free; no API key observed; one Seoul request | Lowest request count, but about 206 MiB at the probe date and current browser-like headers/referrer are brittle | No user data and no runtime request | One atomic snapshot; no `ETag` or `Last-Modified`, so staged content hashing and entry/schema manifests are required | Redirect/WAF change, undocumented rate limit, partial/corrupt ZIP, category entry or header change |
| 195 category-specific Seoul CSV snapshots | Free; no API key observed | Easier category isolation, but 195 requests increase time, throttling, and manifest maintenance | No user data and no runtime request | Per-category hashes make change localization clearer | Partial category set, rate limiting, endpoint drift, inconsistent headers, accidental mixed vintages |
| 195 category OpenAPIs | Free, but account, application, and external API key are required | Incremental filters and history exist, but 100-record pages, per-category services, key lifecycle, quotas, and retries add substantial complexity | Build-only if correctly isolated; still requires secret handling | Documented fields and deltas help, but `LAST_MDFCN_PNT` versus `DAT_UPDT_PNT` is currently inconsistent | Key expiry or permission error, quota exhaustion, pagination gaps, late history, per-category schema drift |
| Bulk baseline plus OpenAPI deltas | Free monetary price, but API signup/key remain required | Potentially reduces transfer after baseline; has the highest reconciliation and recovery complexity | Build-only if correctly isolated; requires secret handling | Can compare baseline and deltas, but needs an authoritative reconciliation rule | Inherits all bulk and API failures, missed deltas, ordering conflicts, unrecoverable mixed snapshots |

The OpenAPI alternatives do not satisfy the current default-product constraint of zero external API
keys and no required sign-up. They would require an explicit product-scope approval before becoming
mandatory infrastructure.

## Recommendation

The user approved the Seoul all-category ZIP snapshot as the sole candidate default delivery
contract on 2026-08-28. It best matches the static, zero-cost, no-runtime-service design and avoids
account, secret, and API-key dependencies. ADR-009 accepts only the bounded contract below; it does
not assert that the currently observed endpoint behavior is a stable production interface.

Approval should be bounded by the following contract:

1. The collector may run only at build time and may request only the official Seoul all-category
   file endpoint after a lightweight download-limit check.
2. TASK-005 must first implement a non-production contract probe for redirect behavior, required
   headers, range/full-download support, archive integrity, category-entry completeness, CSV
   encoding, required headers, and per-category permission metadata. It must not silently work
   around a provider denial.
3. A complete archive must be downloaded into temporary staging. Because the tested endpoint has
   no usable `ETag` or `Last-Modified`, change detection must use a cryptographic content hash plus
   a normalized entry/schema manifest. Publication must never read an incomplete staging file.
4. Validation must require the approved 195-category manifest, expected identity fields, raw status
   code-and-name pairs, addresses, dates, licensing metadata, permission scope, and bounded record
   and size changes. Unknown fields or status values must stop publication until reviewed.
5. The pipeline must keep `fetchedAt`, provider-stated freshness, and the derived `dataAsOf`
   separate. Retrieval time must never be presented as data as-of. TASK-005 and TASK-008 must define
   and test a conservative deterministic as-of derivation using validated archive contents and the
   provider's D-2 statement.
6. The previous known-good archive and published static data remain untouched until collection,
   transformation, and all validation gates pass.
7. Built artifacts must include the provider, applicable Public Data Portal dataset URL, retrieval
   time, data as-of date, source permission, transformation notice, and raw status evidence needed
   by FR-09.
8. OpenAPI may be used only as a manual diagnostic reference under the current scope. It must not
   become a required pipeline dependency without separate approval for sign-up, API-key handling,
   quotas, and a changed zero-key product constraint.

No speculative source fixture, status mapping, processed status, production collection, workflow,
or deployment change is authorized by this report.

## Unknowns

- Whether the all-category ZIP endpoint, referrer requirement, and pre-download limit check are an
  officially supported automation contract rather than current implementation behavior.
- The numeric file-download limit and the provider's expected retry interval after HTTP 429.
- The exact ZIP entry set, filenames, encodings, delimiters, and required field headers across all
  195 categories at implementation time.
- Whether every category has unrestricted Type 0 permission; this must be captured in a validated
  category manifest.
- The precise distinction between `DAT_UPDT_PNT` and `LAST_MDFCN_PNT`, and which timestamp is
  authoritative for file change tracking and data as-of derivation.
- Category-specific availability and meaning of suspension, reopening, closure, business-type,
  and detailed-status fields.
- The complete category-specific raw status vocabularies. TASK-007 must derive mappings only from
  verified official values and route all unknowns to `확인되지 않음`.
- Whether a deterministic archive-wide source as-of date exists inside the ZIP. The portal's D-2
  statement alone must not be converted into a more precise claim without validation.
- How often the undocumented file path or browser-request requirements change. A failed probe must
  preserve the last known-good data and surface a maintenance alert.

## Sources

All sources are official Ministry of the Interior and Safety or Public Data Portal pages and were
retrieved or inspected through the official domains on 2026-08-28. The three current Public Data
Portal pages and the 2026 notice returned HTTP 200 during the final link audit. The legacy
LOCALDATA manual and Q&A URLs timed out during that audit; their official indexed evidence is
retained here, but TASK-005 must not depend on those legacy URLs being available.

1. [2026 local administrative licensing service notice: 195 categories and 14 convenience datasets](https://www.data.go.kr/bbs/ntc/selectNotice.do?originId=NOTICE_0000000004709)
2. [Public Data Portal transition manual](https://www.localdata.go.kr/images/egovframework/portal/manual_260106.pdf)
3. [General-restaurant file dataset](https://www.data.go.kr/data/15045016/fileData.do?recommendDataYn=Y)
4. [General-restaurant OpenAPI](https://www.data.go.kr/data/15154916/openapi.do?recommendDataYn=Y)
5. [Public Data Portal use policy and Korea Open Government License scope](https://www.data.go.kr/ugs/selectPortalPolicyView.do)
6. [Official Q&A: daily-difference files replaced by category history APIs](https://www.localdata.go.kr/devcenter/bbs/devQnaDetail.do?bbsId=B0000100&menuNo=20003&nttId=1855&pageIndex=1&searchCnd=&searchWrd=)
7. [Official Q&A: modification filter and composite identity](https://www.localdata.go.kr/devcenter/bbs/devQnaDetail.do?bbsId=B0000100&menuNo=20003&nttId=1859&pageIndex=1&searchCnd=&searchWrd=)
8. [Official Q&A: the service covers 195 licensed categories](https://www.localdata.go.kr/devcenter/bbs/devQnaDetail.do?bbsId=B0000100&menuNo=20003&nttId=1660&pageIndex=1&searchCnd=&searchWrd=)
