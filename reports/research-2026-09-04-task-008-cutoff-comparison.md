<!--
Purpose:        Record official date semantics and a bounded repeat retrieval for TASK-008
Owner:          Researcher
Update Trigger: When the provider confirms file coverage or a distinct complete snapshot is observed
Harness Version: 1.1
-->

# TASK-008 Official Cutoff and Comparison Evidence

FR-08, FR-13, FR-14; accepted ADR-014 through ADR-017. The user explicitly requested official
cutoff/timezone evidence, comparison observations and final calibration. This is a new research
pass. It does not waive the accepted evidence gates or activate TASK-009.

## Scope and verified official facts

The current [eyeglass file-data page](https://www.data.go.kr/data/15045028/fileData.do) links to
`file.localdata.go.kr` and still describes daily updates with a two-day lag. Its portal modification
date and filename suffix are separate metadata. It does not identify the cutoff of a particular
Seoul ZIP or specify its generation timezone.

The official LOCALDATA administrator's [December 1, 2025 response, question 1815](https://www.localdata.go.kr/devcenter/bbs/devQnaDetail.do?bbsId=B0000100&menuNo=20003&nttId=1815)
distinguishes the former search screen's D-2 coverage from the former whole CSV delivery: monthly
refresh on the second day, containing data through the previous month. Changes within the current
month were separate files. The question references the former `/datafile/each/` ZIP delivery.
This historical response must not be applied as a current monthly schedule for the approved
`file.localdata.go.kr` service.

The official [February 19, 2026 response, question 1855](https://localdata.go.kr/devcenter/bbs/devQnaDetail.do?bbsId=B0000100&menuNo=20003&nttId=1855)
explains that the migrated portal does not separately provide daily change files and directs
users to history data. It points users to the migration manual and portal support. Together,
these sources establish a delivery transition; they do not resolve the new ZIP's common cutoff.
The Q&A contents were available through the web search index; direct legacy-page access was
unreliable. No unrelated business information from the questions is retained.

The current [Ministry notice 4566](https://www.data.go.kr/bbs/ntc/selectNotice.do?originId=NOTICE_0000000004566)
was registered March 24, 2026 and links revised July 27 attachments. The official download-limit
check returned `needCaptcha:false`; its 645,142-byte attachment ZIP was downloaded successfully.
The PDF has three pages. Its page 2 documents `BASE_DATE` for an example history-API request.
Page 3 explains that `DAT_UPDT_PNT` includes updates to added open-data information such as
coordinates; `LAST_MDFCN_PNT` refers to source-data modification. The mapping workbook records
the timestamp fields as `VARCHAR2(14)`. The inspected material specifies neither a file-archive
timezone nor a hash-bound common cutoff. API history semantics are not adopted for CSV files.
Document names, exact SHA-256 values and page-specific findings are in
`reports/source-cut-2026-09-04-official-documents.json`.

The current file-info HTML was fetched and inspected. It exposes no archive coverage field.
Its linked `file-download.js` returned HTTP 403 on direct retrieval; no access restriction was
bypassed. The previously unavailable migration manual was not treated as read. The official
notice supplies a new, actually retrieved document source instead.

## Comparison design and audit

At `2026-09-04T14:11:09.879Z`, the unchanged approved one-byte probe returned HTTP 206 and
`Content-Range: bytes 0-0/216180315`. There was no ETag or Last-Modified header. The HTTP Date is
the response timestamp in GMT, not the archive cutoff. The size equals the first complete
observation, but equality of size alone does not prove equality of content. The selected public
headers and exact probe outcome are recorded in
`reports/source-cut-2026-09-04-comparison-probe.json`.

Independent review approved one further bounded retrieval in the already approved Ubuntu
container. The temporary driver preflights its reviewed SHA, source manifest and payload hashes.
It uses the accepted collector once, without a production-baseline parameter. Identical content
is cleaned immediately and never parsed again; different content is passed directly to V2
observation using the same staged collection. The driver does not call the collecting CLI a
second time. The source/driver/payload hashes must still match after cleanup. Nonempty staging,
cleanup failure or an integrity failure prevents a complete observation report.

The original limits remain unchanged: 3,000,000 rows, 2 GiB source bytes, 65,536 record characters,
600 seconds for observation, 3 GiB RSS, 1.5 GiB observed heap and 4 GiB disk indexes. Collector
transfer limits remain separate. This is research evidence, never publication or bootstrap approval.

### Completed comparison outcome

The repeat collector started at `2026-09-04T14:17:43.833Z` and completed at
`2026-09-04T14:19:16.782Z`. It returned the same 216,180,315-byte archive with SHA-256
`9cbe96a9bdadb46b8e0bb8034b6b8b60ea133598f6125ba0cfc954bbc31c898c`.
All 195 ZIP entries passed the collector contract; their shared ZIP modification date remains
metadata only. The full original observation started after its pre-command clock at
`2026-09-04T13:04:43Z`; this repeat is a later retrieval of identical bytes, not a new generation.

The driver exited 0, skipped redundant row parsing, removed its archive and owned staging root,
and verified all 33 source hashes plus the driver/manifest/payload hashes after execution.
The audit is `reports/source-cut-2026-09-04-comparison-audit.json`; the exact driver text is
`reports/source-cut-2026-09-04-comparison-driver.txt`. `completeEvidenceWritten:false` correctly
means no new complete row-observation report was created. `collection.change:changed` is the
collector's no-production-baseline result; the explicit `archiveMatchesPrevious:true` is the
research comparison. No previous research hash was misrepresented as an accepted baseline.

## Calibration and baseline decisions

There is exactly one complete temporal row observation from one distinct archive. The original
V1 report and the independently reviewed V2 derived report are two representations of that same
observation. The V2 representation is
`reports/observation-2026-09-04-task-008-v2-derived.json`, SHA-256
`f1b5f59176c150e9766224dd5ddc1e85d7f2ab6429893defb3f59be8a916e9e7`.
It preserves the first full archive's 195-category ingestion and 2,936,760 rows. Its measured
facts can be used as a research comparison reference; they are not production acceptance limits.

| Candidate fact or gate | Current evidence | Decision |
|---|---|---|
| Complete category coverage | 195 completed CSVs, including 23 header-only categories | Verified for this archive; zero categories still require explicit policy entries |
| Missing business names | 29 normalized missing names, all whitespace-only | Measurement, not an approved future tolerance |
| Missing both addresses | 0 records | Measurement, not a statistically calibrated zero-tolerance policy |
| Unknown aggregate pairs | 0 under accepted vocabulary V2 | Keep the explicit vocabulary gate; uncertain pairs still display unverified |
| Source cutoff and timezone | Generic D-2 description; no common ZIP cutoff or timezone binding | Keep `dataAsOf:null`; do not derive it from maximum row time or HTTP Date |
| Count and status-share variation | One complete distinct snapshot before the repeat comparison | No production drift thresholds can be finalized from this sample |
| Bootstrap | Complete hash-bound research metrics | Not an accepted production baseline without coverage and a reviewed policy |
| Public JSON size | Public serialization remains unresolved | Source CSV/archive bytes cannot substitute for public artifact bytes |

For each future distinct complete observation, preserve the exact archive hash, current schema,
mapping/normalization/vocabulary versions, retrieval interval, evidence-supported coverage date,
all category counts, missing rates, and processed-status shares. Compare absolute and relative
count changes and percentage-point status-share differences at total and category levels.
Keep zero-to-positive categories as review events. Sample selection must include the actual
provider refresh cycle, with its interval evidenced; a duplicate download adds no normal drift
sample. The reviewer must assess the observed range and proposed operational margin before
numeric thresholds are committed. One observed difference alone does not establish a reliable
tail or normal range.

## Remaining provider inquiry

The remaining factual questions are concrete and are not answered by another approval of the
same source facts. The portal's official contact is `opendata_help@nia.or.kr` (notice footer).
The inquiry should identify the approved URL, the exact archive hash and retrieval times, ask
for the new file service's refresh cycle and timezone, the cutoff for every included category,
and the metadata or generation identifier that binds those facts to the ZIP. It should also ask
whether header-only categories and delayed upstream updates share the same cutoff.

The concrete inquiry was saved as a Gmail draft and read back for review. The user then explicitly
authorized sending. The unchanged draft was sent once to `opendata_help@nia.or.kr`, and Gmail
confirmed the SENT label. The message asks about the exact migrated file delivery, including
its cutoff/timezone, category coverage, metadata binding and comparable generation availability.
The existing inquiry in `reports/research-2026-09-04-task-008-source-cut-followup.md` remains the
historical preparation record. Delivery identifiers are retained outside the repository.
A successful send does not establish provider confirmation; the factual gates await its response.

Independent final review approved this bounded comparison evidence in
`reports/review-2026-09-04-task-008-cutoff-comparison.md`. JSON parsing, all current source and
driver hashes, cleanup flags, scoped whitespace and `git diff --check` passed. No production code
changed in this follow-up, so the previous 546-test run was not repeated or presented as new.
