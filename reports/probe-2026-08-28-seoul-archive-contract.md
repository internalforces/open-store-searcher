<!--
Purpose:        Record TASK-005 live source and archive-contract probe evidence
Owner:          Implementer / Reviewer
Update Trigger: When the official probe is rerun or the environment compatibility gate changes
Harness Version: 1.1
-->

# TASK-005 Seoul Archive Contract Probe

_Probe date: 2026-08-28 (Asia/Seoul)_

## Outcome

**Blocked at the compatible archive-listing environment gate.** The official HTTP contract, full
transfer, digest, and ZIP integrity checks passed. The current macOS Info-ZIP executables do not
preserve the UTF-8 Korean entry names from this archive, so no schema contract was accepted or
committed. The collector correctly remains fail-closed.

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
| Schema contract | Not accepted; no production record or archive was added to Git |

Requests sent the approved `Accept`, public portal `Referer`, and honest project `User-Agent`
headers. They sent no authorization, cookie, key, search term, or user-derived value. Although the
provider responses set cookies, the probe neither persisted nor replayed them.

## Required Follow-up

Run the committed probe command with a compatible Info-ZIP executable on the approved Ubuntu 24.04
environment, or obtain user approval for a revised archive adapter. Review the schema-only candidate
and verify it against the same staged archive before accepting
`src/pipeline/contracts/seoul-archive-contract.json`.
