<!--
Purpose:        Record the accepted TASK-005 Seoul archive and schema-contract probe evidence
Owner:          Implementer / Reviewer
Update Trigger: When the official archive contract or approved alias changes
Harness Version: 1.1
-->

# TASK-005 Seoul Archive Contract Probe

_Probe date: 2026-08-29 (Asia/Seoul)_

## Result

**PASS for implementation verification; independent review pending.** The official HTTP contract,
complete transfer, ZIP integrity, 195-category permission mapping, CSV header schemas, and shared
entry-date evidence passed on Ubuntu 24.04 with Info-ZIP 6.0-28ubuntu4.1.

## Source and Archive Evidence

| Check | Result |
|---|---|
| Download-limit endpoint | HTTP 200; no retry around a denial |
| One-byte range request | HTTP 206; one response byte; total 216,022,556 bytes |
| Redirects | None observed |
| Complete archive | HTTP 200; 216,022,556 bytes |
| Archive SHA-256 | `dce9c952348ad548db6714f12cbfed4a285b0705e851e929250f0c70122efc9e` |
| ZIP integrity | PASS |
| Archive entries | 195 distinct CSV files |
| ZIP entry-date evidence | One provider-local date: 2026-08-29 |
| CSV encodings | 195 strict EUC-KR headers |
| Permission mappings | 195 distinct audited file-data IDs |
| Exact title-derived mappings | 194 |
| User-approved literal alias mappings | 1 |

The request sent the approved archive `Accept`, public portal `Referer`, and honest project
`User-Agent` headers. It sent no authorization, persisted cookie, key, search term, or user-derived
value. Retrieval time and the ZIP entry date remain separate evidence and are not presented as
data as-of.

## Approved Literal Alias

The user approved retaining the category and mapping only this literal source exception:

| Archive entry | Audited file-data ID | Portal title |
|---|---|---|
| `자원환경_단독정화조-오수처리시설설계시공업.csv` | `15045011` | `행정안전부_자원환경_단독정화조 및 오수처리시설설계시공업` |

No generalized punctuation or word normalization is enabled. An alias to an unaudited ID or a
duplicate ID remains rejected.

## Schema-Only Contract Evidence

| Check | Result |
|---|---|
| Contract path | `src/pipeline/contracts/seoul-archive-contract.json` |
| Contract byte length | 237,349 bytes |
| Contract SHA-256 | `7cd8ce23032b491a4d9859c2cf50d7fa7505ea94c63523cb44bcb5e4242388ec` |
| Normalized schema-manifest SHA-256 | `6254a2b3d6626c41f625bb98d79399bdd40318632ce0d54561a997fdd039ceb6` |
| Root keys | `provider`, `permissionLabel`, `expectedEntryCount`, `entries` only |
| Entry keys | Filename, file-data ID, encoding, delimiter, headers, timestamp-field names only |
| Unique filenames / IDs | 195 / 195 |
| IDs present in permission manifest | 195 of 195 |
| Record values written | Zero |

The committed contract was parsed and applied to the same staged archive through the normal exact
inspection path. It reproduced 195 entries, the 2026-08-29 provider-local entry date, and schema
digest `6254a2b3d6626c41f625bb98d79399bdd40318632ce0d54561a997fdd039ceb6`.

## Remaining Gate

An eligible Reviewer who did not author the implementation must approve TASK-005 before the task is
closed or TASK-006 is activated.
