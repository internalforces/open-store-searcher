<!--
Purpose:        Bind PR32 review repairs to regressions, private preservation evidence and final verification
Owner:          Implementer / Tester / Independent Reviewer
Update Trigger: When review repairs, exact verification inputs, results or deployment boundaries change
Harness Version: 1.1
-->

# PR 32 review remediation — 2026-10-18

Scope: [PR32](https://github.com/internalforces/open-store-searcher/pull/32), original head
`2801d8e89fbe371fdc9e6e3e91383603065c1298`, base `c521467f4b31375e6fc19284ea9c22dd1b37e38c`.
The user explicitly instructed the parent to proceed after its offer to fix/push/reverify this PR.
This authorizes the four review fixes, regressions, preservation checks, independent review,
logical commits/push and evidenced review replies/resolution. No merge/auto-merge, publication,
deployment, recurring collection or credential/security-setting change is included.

The original PR32 checkout is clean at the original head. Its branch and the original main
checkout's unrelated untracked duplicates remain untouched locally. Work uses the already
isolated workspace checkout on local `codex/pr32-review-fixes`, tracking the PR's remote
`codex/task-008-calibration`; push explicitly targets that PR branch. No force push is used.
Repository AGENTS, role prompts and standards are read; no repository `.agents/skills` exists.
The home frontend skill does not apply. `handbook/ko/**` is excluded throughout.

## Four findings and repairs

| Review | Assessment and correction | Exact regression / document evidence |
| --- | --- | --- |
| [4307085804](https://github.com/internalforces/open-store-searcher/pull/32#discussion_r4307085804) | Valid. Replay reads positive safe-integer `config.maxEntryBytes`, `config.maxTotalRows`, `config.entryTimeoutMs` directly; receipt records those actual ceilings. No observation fallback remains. | `uses adopted extraction and timeout limits plus the cumulative adopted row budget`; `rejects cumulative rows crossing the adopted ceiling without historical fallback`; truncated-extraction and invalid-limit cases |
| [4307085808](https://github.com/internalforces/open-store-searcher/pull/32#discussion_r4307085808) | Valid. Audit requires `REPLAY-ROOT SOURCE-ARCHIVE`, resolves the explicit archive and checks its hash/size against receipt/baseline before injection and unchanged hash after injection. | `audits a relocated archive and separates rejection reasons from retained warnings`; `requires an explicit audit archive before any artifact reads or failure injection`; hash/size and during-injection mutation cases |
| [4307085811](https://github.com/internalforces/open-store-searcher/pull/32#discussion_r4307085811) | Valid. Actual structured validator diagnostics classify the same complete 195-empty-category injection. The actual staging error's code set must match that result. Only `severity: rejection` enters `reasonCodes`; warning severity is preserved separately. | `audits a relocated archive and separates rejection reasons from retained warnings`; `rejects inconsistent stage diagnostics instead of recording a false preservation receipt` |
| [4307085814](https://github.com/internalforces/open-store-searcher/pull/32#discussion_r4307085814) | Valid. Active-task context names committed acceptance `2be9077de3b04f34e17e9297d43d86f099289993`, reconciliation `2801d8e89fbe371fdc9e6e3e91383603065c1298`, relative reports and current authorized remediation. | [tasks/active.md](../tasks/active.md): no stale local checkout requirement or current uncommitted/no-push claim; repository-local links verified |

Additional mutation/cleanup cases prevent a successful preservation receipt after archive or
accepted-byte mutation, a retained rejected candidate or owned scratch. These tests exercise
the actual CLI modules, with mocked process/filesystem/Vite collaborators. Real archive and
accepted-file preservation are verified separately below; unit mocks are not presented as raw
source validation. No application/status/collector implementation, dependency, workflow or
quality configuration changed.

## Regression and verification sequence

The first regression run reproduces seven failures / three passes against the original scripts:
historical limits still win, row overflow is missed and the audit rejects the new explicit path
interface. Initial test-only tuple typing was corrected without changing compiler settings.
After repair, ten tests pass; archive-argument/noninteger and independent-review mutation/cleanup
cases extend the suite to **18 passed**, with typecheck exit 0. No tests are skipped or weakened.

Successful narrow command on macOS Node22 (supplementary, not the pinned runtime):
`node node_modules/vitest/vitest.mjs run --configLoader runner --project=pipeline src/pipeline/adopted-validation-adapters.test.ts`.
The runner loader avoids writing through the shared dependency symlink. The tests belong to
the unchanged pipeline project, so ordinary coverage and hosted `verify:full` include them.

Independent review reruns all 18 adapter cases. It also ran 188 combined adapter/parser/validator
checks before the final four mutation cases and independently compared actual validator/stager
diagnostics for the complete empty-category injection. A first exploratory reviewer Vite helper
hit the shared-cache permission error; its isolated temporary-cache retry passes. No product
test or environment policy was altered. See [independent review](review-2026-10-18-pr32-remediation.md).

Pinned full verification runs sequentially after the audit, without concurrent raw processing:
`npm run verify:full && node --test scripts/check-pages-artifact.test.mjs`.
The first 14-case snapshot passed. The final 18-case snapshot exits **0**: **831 automated tests
in 45 files**, **68 four-browser checks**, **20 accessibility checks**, and **4 packaging checks**.
Lint, formatting, types, coverage, build and both search-quality checks pass. Coverage is 92.79%
statements, 91.33% branches, 95.36% functions and 94.47% lines. Default browser concurrency and
strict flaky-test failure policy are unchanged. Full private log SHA-256:
`2e3490a563749ecc712bfd24e052beb135b71c38bd5aa952c9b30e93b15ea830`.
The [verification receipt](verification-2026-10-18-pr32-remediation.json) binds exact inputs/logs.
Exact final-head hosted CI is checked after push and retained on the PR; no earlier run is claimed
as the new head's result.

## Fresh private preservation audit

Copied the accepted 726-file output and its inventory/receipt to a new private audit root, leaving
the original untouched. Copied the retained archive to a separate directory whose path includes
a space, outside the historical archive layout. Ran the corrected actual audit CLI with both
explicit arguments on Ubuntu24.04 / Node24.19.0 / npm11.17.0. It exits **0**:

- All 195 complete empty categories reject under the exact adopted policy.
- Structured diagnostics and actual staging failure code sets agree: 693 diagnostics, including
  the separate source-coverage warning. Rejection reasons are exactly `count_below_minimum`,
  `count_change_exceeded`, `empty_category_not_approved`, `empty_refresh`.
- `source_coverage_unverified` retains `severity: warning`; it is absent from `reasonCodes`.
- Rejected candidate and owned temporary output are absent. All **726** accepted files rehash
  unchanged, totaling **691,143,712** JSON bytes, under unchanged ceiling **691,319,965**.
- Before/after inventory SHA-256:
  `3de3740d37241d204e558f74295ee8d07f4a0a051497116823cad85b878cedf0`.
- Relocated archive before/after: **217,307,219 bytes**, SHA-256
  `c90758c2d3922e78d636ab2c9967b80c690bdcd8aeca283cf9f6ecc2cc992352`.

The new [aggregate preservation receipt](preservation-2026-10-18-pr32-remediation.json) has
SHA-256 `4130c38b10ce7b46bffb4855f27fa236b3d4d313acd0ea12f472a234ad0f3f61`.
It contains only category/metric diagnostics and hashes, no raw business rows or private paths.
Original private datasets, raw logs and per-file inventories remain local.
The historical committed [old receipt](preservation-2026-10-18-task-008.json) is retained unchanged
as evidence of the pre-review script. Its warning-as-reason classification is superseded by this
fresh audit; it is not silently rewritten as if produced by the corrected script.

## Exact inputs and replay-equivalence boundary

`publication/validation-config.json` is byte-identical to original PR32 head, SHA-256
`f3feafd8d37d30e859b7797fe753277d2091cb7383009e035dff60edb76987f1`.
Actual adopted ceilings are **536,870,912 bytes/member**, **3,000,000 total rows** and
**120,000 ms/member**, exactly equal to the historical observation ceilings in this instance.
Tests deliberately make them different to prevent a hidden future fallback. Policy revision
`task-008-calibration-2026-10-16-v1-proposed`, all 195 category limits, exact 23 empty IDs, initial
October 16 baseline and approved reviewed-pair contract remain unchanged:

| Object | Canonical SHA-256 |
| --- | --- |
| Policy | `090973f79398f45d52262958e2887497652cec13b4d95b608eb84c691070feff` |
| Initial baseline | `9234ed3297166a08b500356ac01f5bcd150276c04a2bdd129d399fa0bdc6b183` |

The stager, unzip adapter, parser, validator and compact writer are unchanged. Thus the retained
complete replay of 195 categories / 2,951,024 rows remains historical accepted-data evidence for
identical processing inputs; this continuation does not claim a second complete raw replay or a
new collection. Fresh verification here is the relocated actual preservation audit, adapter
regressions and pinned/hosted full suites. Independent review confirms this equivalence boundary.

ISS-003 remains Open upstream, and original source coverage remains unverified. Original
collection is October 16, not this verification instant. The 79 nonempty zero-tolerance categories,
one-transition JSON ceiling and 176,253-byte headroom remain conservative limitations.
`publication/config.json` is absent. TASK-009/010/021 publication/recovery, physical/mobile/hosted
performance and release gates remain open. No merge, auto-merge, deployment/publication,
recurring collection, credentials or security setting was changed.
