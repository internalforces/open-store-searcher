<!--
Purpose:        Record TASK-005 live source and archive-contract probe evidence
Owner:          Implementer / Reviewer
Update Trigger: When the official probe is rerun or the environment compatibility gate changes
Harness Version: 1.1
-->

# TASK-005 Seoul Archive Contract Probe

_Probe date: 2026-08-28 (Asia/Seoul)_

## Outcome

**Blocked at one explicit category-mapping approval gate.** The official HTTP contract, full
transfer, digest, ZIP integrity, and Ubuntu 24.04 filename checks passed. Exactly 194 of 195 archive
filenames match approved permission titles. One filename differs from its portal title, so no
schema contract was accepted or committed. The collector correctly remains fail-closed.

## Recorded Evidence

| Check | Result |
|---|---|
| Download-limit endpoint | HTTP 200; no request retry |
| One-byte range request | HTTP 206; `Content-Range: bytes 0-0/215968197`; one response byte |
| Redirects | None observed |
| Full archive request | HTTP 200; 215,968,197 bytes |
| Full archive SHA-256 | `1058ca425f1b59d6fb4bdee53d524a99fdc10b32684dd9805013e1c459506dc8` |
| ZIP integrity | Passed with Info-ZIP test mode |
| ZIP entry count | 195 |
| ZIP entry date evidence | One provider-local date, 2026-08-28; retrieval time was not used as data as-of |
| macOS bundled Info-ZIP | Incompatible: emitted transformed UTF-8 filenames |
| Homebrew Info-ZIP 6.00_8 | Incompatible: emitted a different transformed filename representation |
| Ubuntu 24.04 Info-ZIP 6.0-28ubuntu4.1 | Compatible: preserved all 195 UTF-8 Korean filenames |
| Exact filename-to-permission-title matches | 194 of 195 |
| Unresolved archive filename | `자원환경_단독정화조-오수처리시설설계시공업.csv` |
| Related portal title | `행정안전부_자원환경_단독정화조 및 오수처리시설설계시공업` |
| Schema contract | Not accepted; no production record or archive was added to Git |

Requests sent the approved `Accept`, public portal `Referer`, and honest project `User-Agent`
headers. They sent no authorization, cookie, key, search term, or user-derived value. Although the
provider responses set cookies, the probe neither persisted nor replayed them.

## Required Follow-up

Obtain user approval before recording the one exact archive-name alias to the already audited
file-data identifier. Then rerun the committed probe on Ubuntu 24.04, review the schema-only
candidate, and verify it against the same staged archive before accepting
`src/pipeline/contracts/seoul-archive-contract.json`.
