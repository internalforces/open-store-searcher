# TASK-008 quality resumption and concrete decoding prerequisite

Date: 2026-09-12. User explicitly resumed real-data quality/baseline review.
TASK-008 is active; TASK-009/010 resume after this prerequisite. Collection-date mode remains.

## Verified outcome

The Ubuntu filename bug is fixed and regression-tested. Full Ubuntu verification at
`60692830880221275665217be64cfea7420fe52b` passed 639 Vitest, 68 browser and 20 accessibility
tests in [run 34692123385](https://github.com/internalforces/open-store-searcher/actions/runs/34692123385).
The new test first failed at `eb4903b` in
[run 34691848708](https://github.com/internalforces/open-store-searcher/actions/runs/34691848708),
with the expected Korean filename replaced by incorrectly recoded characters.

| Requirement | Evidence |
|---|---|
| Preserve literal ZIP names and CSV bytes (FR-13) | `preserves UTF-8 Korean DOS-origin filenames and exact entry bytes`; synthetic DOS-origin ZIP, flags 0x0808, exact name/date/body assertions |
| Full approved-runner verification | `npm run verify:full`, run 34692123385: 639/68/20 passed |
| Resume actual quality investigation | Read-only observation workflow and source metadata/member receipts below; no completed baseline claim |

The adapter now explicitly selects `-O UTF-8` for the approved provider's DOS-origin UTF-8
filenames, including list metadata, prefix/full reads and capability checks. CSV body encoding
and all 195 source/category/status mappings remain unchanged. This option is documented in
the [Ubuntu unzip manual](https://manpages.ubuntu.com/manpages/noble/man1/unzip.1.html) and
[zipinfo manual](https://manpages.ubuntu.com/manpages/noble/man1/zipinfo.1.html).

## Actual source evidence

Two early approved Ubuntu runs downloaded the archive and rejected its incorrectly decoded
inventory. Run 34691570910 bound the inventory diagnosis to archive SHA-256
`e2eeb1a868a2bfb94dbc9d193dae74707c0e27e38230376d5ad105e174a69faa`.
Subsequent bounded local range observations inspected the 65,536-byte ZIP suffix only:

- 195 central-directory filenames, all matching the committed contract as literal UTF-8.
- Every member reports DOS creator metadata and flags 2056 (UTF-8 plus data descriptor).
- Archive HTTP size 216,440,796 bytes; central-directory uncompressed total 894,143,343 bytes.
- Largest advertised member: 280,356,442 bytes, below the research 512 MiB per-member ceiling.

Receipts: [filename metadata](research-2026-09-12-zip-metadata.json) and
[advertised sizes](research-2026-09-12-zip-sizes.json). These partial-range observations are not
whole-archive hash/integrity verification or source freshness assertions. They contain no rows.

After the filename fix, [run 34692003541](https://github.com/internalforces/open-store-searcher/actions/runs/34692003541)
passed the real collector's inventory/schema gates and parsed the first three categories:
15045025: 930 rows; 15045030: 146 rows; 15045027: 244 rows. It then failed in the strict body
decoder for the fourth category, the quoted literal `건강_안경업.csv`. No complete metrics,
baseline, policy or publication was produced.

A bounded local member diagnostic retrieved only that member's compressed range, checked its
declared uncompressed size (1,391,915 bytes), deflate completion and CRC, and compared strict
standard-library decoders without persisting or printing its rows. Python's CP949 decoder
accepted the whole member; EUC-KR rejected byte offset 155448 (lead byte 0x98), and UTF-8
rejected the first byte. [Decoder receipt](research-2026-09-12-source-encoding.json).
This is a decoder-support gap; the evidence does not establish source corruption.

Pinned Node 24.19.0 further demonstrates the gap on a synthetic standard CP949 sequence:
`TextDecoder('euc-kr', { fatal: true })` decodes bytes `81 41` to U+0081 and U+0041, whereas
CP949 maps them to U+AC02. Thus simply disabling fatal decoding would not preserve source text.

## Proposed dependency and implementation for approval

Add exact `iconv-lite@0.7.3` as a **build-only devDependency**, with its `safer-buffer`
transitive dependency locked by npm. npm metadata reports MIT licensing and integrity
`sha512-IKXpvIzjnC9XTAUbVBcMfGS0EPaIXtW6v+zr+RRp+hqULEpo0owZax6wyRwPOJbWbzjYspQwusTsfVr0ifh4uQ==`.
The [maintainer documentation](https://github.com/pillarjs/iconv-lite#supported-encodings)
explicitly lists CP949 support. No package was added or installed by this proposal.

Implement one strict pipeline decoder: keep native fatal UTF-8; decode the existing `euc-kr`
source label with CP949 support; require re-encoding to reproduce the exact input bytes before
returning text. Reject lossy or invalid sequences. Use it in header inspection and whole-entry
parsing. The source filename contract, display statuses and source URL remain unchanged. The
decoder must stay outside the browser import graph; validate the production build graph and
bundle evidence after implementation. No row repair, replacement-character fallback or silent
category omission is proposed.

Acceptance: synthetic CP949 extension and ordinary Korean/ASCII preservation; malformed and
truncated multibyte rejection; quoted/multiline CSV with CP949 characters; unchanged header
evidence; complete actual archive replay; quality metrics and candidate sizing; full verification,
dependency/license audit and independent review. Exact initial thresholds are proposed only after
that complete observation. One snapshot cannot prove normal daily variation or 30-day reliability.

Approval basis: AGENTS.md explicitly lists "Addition of any external dependency or external
service" under actions requiring human approval. Resuming quality work does not itself select
this newly identified dependency. The proposal is ready for that concrete decision.

## Remaining external and acceptance limits

Several Ubuntu source attempts failed before HTTP with `UND_ERR_CONNECT_TIMEOUT` after 10 seconds.
The current host could access the same approved endpoint for bounded diagnostics. This is
intermittent hosted connectivity evidence, not a provider denial response or successful daily
refresh. Run 34692120763 and its one retry both failed at connection establishment. No unbounded
retry, alternate provider, identity change or lowered collector gate was introduced.

The research workflow keeps only `contents: read`, deny-all defaults and pinned checkout/setup
actions. It triggers only relevant pushes to this working branch, has no deployment/artifact
publication permissions, and logs aggregate evidence only. A later parser failure records an
incomplete category, discards candidate rows and prevents complete metrics/baseline approval.
No hosted publication, security-setting change, independent approval or task completion is claimed.
