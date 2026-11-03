# TASK-009 native inline-string storage — 2026-11-03

## Retained supported failure

PR45 head `d383401d9ef53d1266167bf322ff2d7d849e6661`, Verify
[41505700206](https://github.com/internalforces/open-store-searcher/actions/runs/41505700206),
passes the ordinary job `125484346836` but the complete-source job `125484346436`
passes only 58 of 60 search observations. Mobile broad-district repetition 1 is
538.8 ms cold (439.0 worker reply + 99.8 render opportunity) and 554.9 ms warm
(452.1 + 102.8). Worker MajorGC events of 335.341 and 268.806 ms overlap these
observations. All earlier failures and the separate earlier 60/60 success remain
evidence; they do not establish acceptance of the current head.

## Bounded correction

The exact source contains 2,951,024 inline 64-character IDs, as well as millions
of inline source strings. Existing numeric packing leaves these individual heap
objects retained. `PackedStringValues` owns exact UTF-16 code units and offsets,
using one-byte Latin-1 storage where every unit permits it. It preserves empty
strings, surrogate pairs, lone surrogates and embedded NUL without transcoding.
All-string inline columns become owned native values during preparation; mixed,
null and business-type values remain unchanged. The normal complete search scan
still uses existing projections/references and decodes only returned page values.
Interrupted preparation can read its previously packed blocks and retry.

No wire JSON, source value, ID, ranking, query predicate, status/date evidence,
dependency, service, public interface, workflow permission or performance budget
changes. Wire validation continues to require JSON arrays and rejects native values.
The parity receipt now explicitly binds the new native-storage module.

## Verification so far

- The inline-ownership regression was observed failing before implementation.
- All 188 search/shared tests pass; types, format, build and both search-quality
  checks pass. All 111 packaging/operator/admission checks pass.
- Full local coverage executes 1,473 tests: 1,471 pass and two existing Info-ZIP
  integration cases fail because Debian `/usr/bin/unzip` lacks `-O UTF-8`.
  No test, threshold or runtime pin is skipped or weakened. Source reconstruction
  instead selects a genuine Ubuntu `6.0-28ubuntu4.1` executable through PATH.
- Independent review has no blocking findings: 60 focused tests, typecheck,
  514 randomized exact string round trips and cancellation after a packed block
  followed by retry. All 693 frozen source values and 33 ordered paginated records
  agree, including null, businessTypes, emoji, NUL and lone surrogates.
- The scratch regression now measures searches separately from native source
  storage: six complete-oracle-parity queries allocate zero new byte/score arrays.
  Preparation constructor counts are no longer covered by that specific test.

## Environment and limits

The continuation moved to a clean cloud checkout of the exact PR head. Node
24.19.0/npm 11.17.0 are installed separately, without modifying project dependencies.
Host OS is Debian 13, so local results are distinguished from canonical Ubuntu CI.
The original 217,307,219-byte source ZIP and 356,005-byte observation were redownloaded
from the adopted GitHub Release. SHA-256 values are respectively
`c90758c2d3922e78d636ab2c9967b80c690bdcd8aeca283cf9f6ecc2cc992352` and
`3d23a3c770b24039a6690f2db8022eb610ffb5b56a9efee031f78b78918b4626`.

Pinned Playwright browser download returns an unavailable HTML page. The installed
system Chromium 155 also cannot start: `socket() failed: Operation not permitted`.
No launch, UI or performance pass is inferred from those failed environment attempts.
Use actual final-head canonical ordinary/full-source CI for browser acceptance.

Complete-source reconstruction/parity and new-head hosted verification are still
pending at this checkpoint. No performance acceptance, merge, publication, durable
backup/recovery or whole-task completion is claimed. Physical-device testing remains
user-skipped; TASK-010 still requires its separate actual 30-day reliability interval.
