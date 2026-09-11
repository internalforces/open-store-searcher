<!--
Purpose:        Assess the first complete hash-bound Seoul observation and unresolved production inputs
Owner:          Researcher
Update Trigger: When comparable observations, vocabulary approval, coverage evidence or policy review arrive
Harness Version: 1.1
-->

# TASK-008 First Complete Observation

FR-08, FR-13, FR-14. Encoding investigation and complete research ingestion are finished. TASK-008
production evidence is incomplete, so the user's sequential TASK-009 implementation remains pending.

## Evidence and integrity

- Aggregate report: `reports/observation-2026-09-04-task-008-complete.json`.
- Run/implementation audit: `reports/observation-2026-09-04-task-008-complete-audit.json`.
- Independent review: `reports/review-2026-09-04-task-008-disk-observation.md`.
- Archive SHA-256: `9cbe96a9bdadb46b8e0bb8034b6b8b60ea133598f6125ba0cfc954bbc31c898c`.
- All 195 category files reached EOF with matching headers and archive hash; all 893,115,870
  uncompressed source bytes were read. Exact identity and complete collision indexes passed replay.
- Command exit 2 is the documented review-required result, not an execution crash. The report is
  complete:true, kind:review_required, dataAsOf:null. It is not an accepted candidate or baseline.
- All 30 audited implementation/contract/dependency hashes matched Mac/Linux before and after.
  The archive and owned scratch were removed; external staging was empty after command completion.
- Run window: started after the 2026-09-04T13:04:43Z pre-command clock sample; completion was
  confirmed at 2026-09-04T13:13:01Z. These are observation bounds, not a provider source cutoff.

## Initial measured distribution

| Metric | Complete observed value |
|---|---:|
| Total rows | 2,936,760 |
| Completed categories | 195 |
| Header-only categories | 23 |
| Missing normalized business names | 29 (0.000987%) |
| Missing both normalized addresses | 0 |
| Unregistered aggregate status pairs | 186,887 (6.363714%) across 68 categories |
| Normalized collision groups | 1,120,410 |
| Records participating in at least one normalized collision | 2,732,334 (93.039063%) |

All 29 missing names are whitespace-only source cells: 10 rows in category 15045104 and 19 in
15101549. Both address fields are retained; 694,135 raw road addresses are empty, while parcel
addresses have 135,096 empty and 188 whitespace cells. These observations justify retaining both
address alternatives; they are not approved missing-value thresholds. Collision counts refer to
search keys, not duplicate exact source identities, and must not trigger automatic entity merging.

| Exact source code | Exact source name | Rows | Existing processed status |
|---|---|---:|---|
| `01` | `영업/정상` | 976,815 | `행정상 영업` |
| `02` | `휴업` | 3,783 | `휴업` |
| `03` | `폐업` | 1,575,877 | `폐업` |
| `04` | `취소/말소/만료/정지/중지` | 193,398 | `확인되지 않음` |
| `05` | `제외/삭제/전출` | 186,864 | `확인되지 않음` |
| `06` | `기타` | 23 | `확인되지 않음` |

Codes 05/06 remain unregistered vocabulary, so the validator correctly requests review. No rule
was changed and no record was removed or classified as closed because of these values. A possible
future proposal can recognize those two exact pairs while retaining the unverified display result;
that vocabulary decision requires explicit source-contract review/approval. It must also preserve
historical metrics: changing `knownAggregatePair` changes `unknownPairCount` validation semantics,
so the existing hash-bound observation must never be rewritten to pretend it used new rules.

The 23 empty category IDs, every category count and all per-category quality metrics are retained
in the aggregate report. A header-only file proves completed empty input in this snapshot; it does
not by itself prove that the real-world category contains no businesses. Do not infer an approved
zero-category allowlist without review.

## Resource results and limits

Peak sampled RSS: 465,375,232 bytes; heap: 151,790,672 bytes. Scratch serialization: 1,936,106,760
bytes across 14,683,800 indexes; largest partition: 36,800,148 bytes; peak retained buffers:
14,704,708 bytes. Each remains below its reviewed cap. The row budget has only 63,240 rows of
headroom above this snapshot. These are execution stops, not production quality thresholds.
The one live attempt approved by independent review has been consumed; no automatic retry is set.

## What can and cannot be established now

| Production input | Evidence now available | Still required |
|---|---|---|
| Initial counts/completeness | One complete archive-bound 195-category metrics snapshot | Explicit bootstrap review after other gates pass |
| Absolute/zero-category policy | Actual counts, 23 empty categories and per-category missing rates | Reviewed bounds and explicit zero-category rationale |
| Count/status drift policy | Initial four-bucket shares and exact raw pairs | Comparable complete changed-archive observations over a stated interval and approved tolerances |
| Source cutoff | Official daily D-2 statement; hash-bound retrieval evidence | Archive-bound common coverage date and timezone from an authoritative provider source |
| Vocabulary | Actual exact 05/06 pairs and category-level counts | Explicit review/approval, preserving unverified output and metric-version compatibility |
| Public JSON budget | Source CSV and temporary index sizes only | Agreed public representation, measured serialized bytes and reviewed budget |

The current archive hash matches earlier same-day downloads. Repeating it cannot establish normal
inter-refresh variation. No numerical production default, coverage date, accepted baseline or JSON
budget has been fabricated. The provider inquiry is prepared in
`reports/research-2026-09-04-task-008-source-cut-followup.md`; no external message was sent.

The next useful evidence is provider source-cut confirmation plus a comparable complete observation
from a later actual refresh (or a trustworthy historical archive with complete ingestion evidence).
Then propose the exact vocabulary/policy/bootstrap inputs for review and revalidation. TASK-009's
atomic publication and preservation implementation starts only after TASK-008 acceptance is real.
