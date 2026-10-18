<!--
Purpose:        Independent review of the four PR 32 remediation changes
Owner:          Reviewer
Update Trigger: When the reviewed remediation or its verification evidence changes
Harness Version: 1.1
-->

# PR 32 remediation independent review — 2026-10-18

Verdict: **Approved** for the bounded local remediation reviewed below. No blocking findings.
Final pinned full verification has passed on the reviewed source, as confirmed in the addendum
below. Exact final-head hosted CI remains pending until commit/push and its actual readback.

## Scope and reference

Reviewed the working diff from PR 32 original head
`2801d8e89fbe371fdc9e6e3e91383603065c1298`, covering
`.testagent/replay-adopted-policy.mjs`, `.testagent/audit-adopted-release.mjs`,
`src/pipeline/adopted-validation-adapters.test.ts`, the appended test research/plan,
and `tasks/active.md`. The four reviewed threads are 4307085804, 4307085808,
4307085811, and 4307085814. Relevant requirements are FR-08, FR-13, and FR-14.

Read the constitution, review prompt, standards, current task, relevant ADR-014/adoption
decisions and traceability. No raw archive, private per-file inventory, credentials,
unrelated private logs, or `handbook/ko/**` was read. The reviewer made no implementation
edits, remote comments, merge, deployment, or settings changes.

## Findings and requirement evidence

| Requirement | Evidence |
| --- | --- |
| "Exercise the resource limits from the adopted config" | `uses adopted extraction and timeout limits plus the cumulative adopted row budget` checks exact extraction/timeout arguments and remaining budgets `[3, 2]` while observation defaults deliberately differ. `rejects cumulative rows crossing the adopted ceiling without historical fallback` checks `[1, 0]` and refusal to emit a receipt. Truncation and all three zero/fractional ceilings have separate failure cases. |
| "Accept the replay archive path in the audit" | `requires an explicit audit archive before any artifact reads or failure injection`, `audits a relocated archive and separates rejection reasons from retained warnings`, and `rejects an audit archive %s mismatch before failure injection` cover missing arguments, a path containing spaces, two archive hashes, receipt binding and separate hash/size mismatches. |
| "Exclude warnings from rejection reason codes" | `audits a relocated archive and separates rejection reasons from retained warnings` pins deduplicated rejection-only codes, retained warning objects and complete diagnostics. `rejects inconsistent stage diagnostics instead of recording a false preservation receipt` refuses an unexpected stage code set. The reviewer also directly checked real validator/stager equivalence for the 195 empty categories. |
| "Record committed evidence instead of a local worktree" | `tasks/active.md` references the original acceptance and merged-main reconciliation commits plus repository-relative reports. A read-only check resolved all 12 local Markdown targets and confirmed the stale checkout reference is absent. |
| Failure preservation must be demonstrated rather than inferred | `detects %s mutation during failure injection and refuses a preservation receipt` independently mutates the archive and accepted bytes. `rejects leftover %s output instead of claiming preservation cleanup` separately covers a candidate and scratch directory. Every case requires refusal to write the receipt. The relocated real-artifact audit is described below. |

The added tests import the actual adapters while mocking Vite/process/filesystem boundaries.
They prove adapter wiring and refusal behavior. They are complemented by existing real-parser
and staging preservation tests and the actual empty-category comparison; mock-only assertions
are not treated as proof of a complete source replay. The four mutation/leftover cases close
the nonblocking assertion gaps identified in the first independent pass.

## Independently executed checks

- `node node_modules/vitest/vitest.mjs run --configLoader runner --project pipeline src/pipeline/adopted-validation-adapters.test.ts`: **18 passed**, exit 0, on macOS Node 22.22.3.
- Earlier combined run of the adapter, `parse-license-csv.test.ts`, and
  `validate-license-refresh.test.ts`: **188 passed / 3 files**, exit 0, with the initial
  14-case adapter snapshot. The latest four adapter additions were then independently rerun.
- A read-only ad hoc runner passed the exact adopted configuration to actual
  `validateLicenseRefreshV1` and `stageBoundedRelease`, supplying all 195 complete empty
  categories and a synthetic archive path that was never read. Both paths rejected with the
  same code set: `count_below_minimum`, `count_change_exceeded`,
  `empty_category_not_approved`, `empty_refresh`, plus the separate warning
  `source_coverage_unverified`. The rejected output and owned scratch were absent. Exit 0.
  Its clean rerun used a temporary Vite cache; the initial exploratory run encountered
  a shared-dependency-cache permission error and is not used as clean validation evidence.
- `git diff --check`: clean.
- `publication/validation-config.json` remains byte-identical to original PR 32 head:
  SHA-256 `f3feafd8d37d30e859b7797fe753277d2091cb7383009e035dff60edb76987f1`.

Reviewed implementation SHA-256 values:

| File | SHA-256 |
| --- | --- |
| `.testagent/replay-adopted-policy.mjs` | `0b461876cb189a7e3d3b3e68ca9153cae146b04c66e5b1e196a6d2eacac254fa` |
| `.testagent/audit-adopted-release.mjs` | `82d3c4fdc3744475f91d89f9b865a8d06bd1b88cecd9355170d9c19b46e55dac` |
| `src/pipeline/adopted-validation-adapters.test.ts` | `17405a8ff8078dc552e2e534d36bd2433daa543a56e7604ab3bc1bed80ca44db` |
| `tasks/active.md` (final report-link additions included) | `2b235d356338702dd114d8fe6b27172ecedb86000f40a513503a866d14976b63` |

## Supplied fresh preservation evidence and replay equivalence

The implementer supplied a fresh relocated audit against a separate private copy of the
726 previously accepted files, leaving the original copy untouched. The reviewer read only
its aggregate preservation receipt and independently verified receipt SHA-256
`4130c38b10ce7b46bffb4855f27fa236b3d4d313acd0ea12f472a234ad0f3f61`.
It reports all 726 files rehashed, 691,143,712 JSON bytes, absent rejected output/scratch,
and matching before/after inventory digest
`3de3740d37241d204e558f74295ee8d07f4a0a051497116823cad85b878cedf0`.
Its source archive is bound by hash
`c90758c2d3922e78d636ab2c9967b80c690bdcd8aeca283cf9f6ecc2cc992352`
and size 217,307,219 bytes. Four rejection codes and the source-coverage warning match the
reviewer's independent real-validator exercise. This is implementer-executed evidence with
reviewer receipt inspection, not a reviewer-executed large-artifact rehash.

Not repeating the full raw-source replay is justified for this bounded repair. The reviewer
independently checked equality of adopted and historical observation ceilings:
536,870,912 entry bytes, 3,000,000 total rows and 120,000 ms per entry. The extraction runner,
CSV parser, validator, bounded stager, and approved configuration have no diff from original
PR 32 head. The repaired wiring changes which object supplies these same values; differing
synthetic values prove the new wiring. Prior complete-source replay remains historical evidence,
supplemented by the fresh relocated preservation audit. No new complete replay, collection,
provider-freshness claim, or timing measurement is inferred.

## Remaining gates

Pinned full verification on the latest 18-case snapshot is confirmed below. The delivery agent
must commit/push and read the exact final-head hosted CI before claiming delivery complete.
Source coverage remains unverified; ISS-003, TASK-009/010 publication/recovery, performance,
milestone and release gates remain open. No production task activation, tolerance change,
merge or deployment is authorized by this review.

## Final verification and documentation addendum

Final scoped verdict: **Approved**, with no blocking implementation or documentation findings.
The reviewer inspected the implementer's completed pinned full log and the new
[verification receipt](verification-2026-10-18-pr32-remediation.json), independently matched
all five helper/test/config/lockfile input hashes against the reviewed working tree, and matched
the full-log SHA-256
`2e3490a563749ecc712bfd24e052beb135b71c38bd5aa952c9b30e93b15ea830`.
The implementer ran the checks on Ubuntu 24.04 / Node 24.19.0 / npm 11.17.0. The log directly
confirms the following clean results for
`npm run verify:full && node --test scripts/check-pages-artifact.test.mjs`:

| Check | Result |
| --- | --- |
| Vitest including the latest 18 adapter regressions | 831 tests / 45 files passed |
| Four-browser checks | 68 passed |
| Accessibility checks | 20 passed |
| Pages packaging checks | 4 passed, zero failed/skipped |
| Global coverage: statements / branches / functions / lines | 92.79% / 91.33% / 95.36% / 94.47% |

The log shows four Playwright workers and ordinary repository commands. No workflow,
concurrency, retry/flakiness policy, compiler setting or product test was changed by this diff.
These are implementer-executed pinned checks with independent log/input readback; the reviewer's
separate direct reruns remain identified above.

The new public [preservation receipt](preservation-2026-10-18-pr32-remediation.json) is
byte-identical to the previously inspected private aggregate receipt and retains SHA-256
`4130c38b10ce7b46bffb4855f27fa236b3d4d313acd0ea12f472a234ad0f3f61`.
Its 693 diagnostics produce exactly the four rejection reasons, with the warning excluded;
before/after inventory digests match. No raw rows or private filesystem paths are included.

Reviewed the final additions to publication usage instructions, historical report header,
test report, active/completed-task records, session/architecture/issues records and PRD traceability.
They preserve the prior receipt as historical, supersede only its incorrect classification,
state replay equivalence accurately, and retain source/publication/release limitations.
The two newly introduced authorization quotations were changed to English to comply with the
harness language policy. The test report now explicitly records the full passing counts,
coverage, log hash and verification-receipt link. Independently checked 33 local Markdown targets
across the test report, publication README and historical report; all resolve. Final whitespace
check passes, and the five verified implementation/input hashes remain unchanged.

Commit/push and exact final-head hosted CI readback remain the delivery agent's next steps.
This addendum approves the bounded remediation and its recorded local evidence; it does not
preclaim hosted CI, merge, publication, deployment, source freshness or any remaining release gate.
