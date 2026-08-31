<!--
Purpose:        Record technical evaluation and remediation of PR #6 review feedback
Owner:          Implementer / Reviewer
Update Trigger: When PR #6 feedback disposition or verification changes
Harness Version: 1.1
-->

# TASK-005 PR #6 Feedback Review

_Date: 2026-08-31_

## Scope

This report evaluates the inline findings produced by the automated Codex reviews of commits
`412b271`, `cfc5269`, `3eec332`, `fd009ef`, and `f4941cd` on pull request #6. It records
implementation evidence, not the role-separated final Reviewer decision required to close
TASK-005.

## Disposition

| Review comment | Evaluation | Remediation and regression evidence |
|---|---|---|
| [Download inactivity timeout](https://github.com/internalforces/open-store-searcher/pull/6#discussion_r3886093310) | Valid | The full-download signal now includes a per-chunk inactivity controller. Its timer starts before body iteration, resets for every received chunk, aborts a stalled body, and leaves no partial file. A fake-timer streaming test fails when the inactivity signal is removed. |
| [Already-aborted child-process signal](https://github.com/internalforces/open-store-searcher/pull/6#discussion_r3886093311) | Valid | The process runner rejects an already-aborted signal before spawning. A real Node subprocess regression test previously resolved successfully and now rejects as aborted. |
| [Repository-root staging boundary](https://github.com/internalforces/open-store-searcher/pull/6#discussion_r3886093312) | Valid | The downloader now receives the repository root explicitly, resolves it independently of the current working directory, and rejects any staging directory inside it. Tests cover an in-repository staging directory and the trailing separator returned by `import.meta.url` directory resolution. |
| [Impossible archive dates](https://github.com/internalforces/open-store-searcher/pull/6#discussion_r3886093315) | Valid | Uniform ZIP dates must now round-trip through a UTC calendar parse. Tests reject month zero, February 30, and month 13 as `timestamp_evidence_inconsistent`. |
| [Structured provider freshness](https://github.com/internalforces/open-store-searcher/pull/6#discussion_r3886093318) | Valid | Accepted source evidence now carries the reviewed daily update cadence, two-day coverage lag, and official dataset URL separately from `fetchedAt`. TASK-005 still does not derive `dataAsOf`. |

## Second Review Cycle

| Review comment | Evaluation | Remediation and regression evidence |
|---|---|---|
| [Contract-discovery calendar dates](https://github.com/internalforces/open-store-searcher/pull/6#discussion_r3886135508) | Valid | Contract discovery and normal inspection now share one round-trip calendar-date validator. A malformed common date previously emitted a candidate and now rejects before any candidate is written. |
| [Info-ZIP filename compatibility](https://github.com/internalforces/open-store-searcher/pull/6#discussion_r3886135509) | Valid | Environment validation now requires the approved Info-ZIP 6.00 Linux ELF signature with Unicode UTF-8, large-file, and ZIP64 capabilities. Apple builds fail the gate. The default collector runs this check before any provider probe or full download and returns `environment_unavailable` on failure. The prior Ubuntu 24.04 live archive probe remains the filename round-trip evidence. |
| [Malformed redirect locations](https://github.com/internalforces/open-store-searcher/pull/6#discussion_r3886135511) | Valid | Redirect parsing is now guarded. A syntactically invalid `Location` returns `redirect_not_allowed` instead of throwing outside the typed collector result. |
| [Bounded one-byte range body](https://github.com/internalforces/open-store-searcher/pull/6#discussion_r3886135512) | Valid | The range probe now reads the body incrementally, cancels immediately after more than one byte, and never calls `arrayBuffer()`. The regression stream proves that a two-byte first chunk is cancelled before a second pull. |

## Third Review Cycle

| Review comment | Evaluation | Remediation and regression evidence |
|---|---|---|
| [Dotted child staging directory](https://github.com/internalforces/open-store-searcher/pull/6#discussion_r3886210184) | Valid | Repository ancestry now accepts only an actual `..` parent segment, not any relative path whose name begins with two dots. A real temporary directory named `..staging-*` previously accepted and stored a ZIP inside the repository; it now rejects before transfer. |
| [Pre-header download inactivity](https://github.com/internalforces/open-store-searcher/pull/6#discussion_r3886210188) | Valid | The inactivity timer now starts before `fetch` and continues to reset for every body chunk. A fake provider that never resolves response headers previously remained pending after the inactivity limit and now aborts with cleanup at that limit. |
| [Fail-early manual environment gate](https://github.com/internalforces/open-store-searcher/pull/6#discussion_r3886210190) | Valid | The manual command now uses a tested coordinator whose first operation is the approved archive-environment check. An unavailable environment returns `environment_unavailable` without invoking the provider probe or download. |
| [Broken Docker archive path](https://github.com/internalforces/open-store-searcher/pull/6#discussion_r3886210193) | Valid | No container execution contract was approved. The nonfunctional `--docker-container` option was removed rather than preserving an implicit host-path assumption. Argument validation now rejects that and every other unsupported option before provider work; `commands.md` documents only the optional host `--unzip` executable. |
| [Short filesystem writes](https://github.com/internalforces/open-store-searcher/pull/6#discussion_r3886210196) | Valid | Staging now advances by the actual `bytesWritten`, retries every unwritten suffix, and rejects a zero-progress or invalid write. Regression tests demonstrate multiple short writes reconstruct the exact input and a zero-byte write fails closed. |

## Fourth Review Cycle

| Review comment | Evaluation | Remediation and regression evidence |
|---|---|---|
| [Unconsumed rejected response](https://github.com/internalforces/open-store-searcher/pull/6#discussion_r3889254253) | Valid | Every full-download response rejected before body iteration is now explicitly cancelled. Three real `ReadableStream` regressions previously remained uncancelled for non-success status, HTML content, and a declared-length mismatch; all now cancel before the typed rejection returns. |

## Fifth Review Cycle

| Review comment | Evaluation | Remediation and regression evidence |
|---|---|---|
| [Unconsumed non-206 range response](https://github.com/internalforces/open-store-searcher/pull/6#discussion_r3889296061) | Valid | A non-206 range response previously returned before its body was cancelled. The probe now awaits body cancellation before every rejection that occurs before bounded body reading: non-206 status, HTML, malformed `Content-Range`, and an out-of-bounds archive total. Four gated `ReadableStream` regressions fail if a result settles before cancellation completes. |
| [Late `fetchedAt` validation](https://github.com/internalforces/open-store-searcher/pull/6#discussion_r3889296063) | Valid | The public collector previously loaded contracts, checked the archive environment, and could probe the provider before the downloader validated `fetchedAt`. It now applies the shared canonical UTC validator at entry and returns `transfer_incomplete` before contract loading or external work. |

## Verification

- Each behavioral change was introduced by a focused failing test and observed failing for the
  reviewed reason before production code changed.
- Node 24.19.0 and npm 11.17.0 execute `npm run test:pipeline` successfully with 82 tests across
  ten files.
- `npm run test:coverage` passes 83 tests across eleven files at 86.14% statements, 84.78% branches,
  87.77% functions, and 89.64% lines.
- `npm run verify:full` passed formatting, lint, type, coverage, build, four-browser smoke, and two
  accessibility projects. `git diff --check` also passed.

## Remaining Gate

The merged PR #6 head did not contain the fifth-cycle remediations. The follow-up branch must
receive an independent review after these fixes are pushed. This report does not mark TASK-005
complete and does not authorize TASK-006.
