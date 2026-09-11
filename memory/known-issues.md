<!--
Purpose:        Track known bugs, technical debt, unresolved risks, and workarounds
Owner:          Debugger / Reviewer
Update Trigger: When a bug or debt is found, a risk changes, or an issue is resolved
Harness Version: 1.1
-->

# Known Issues — open-store-searcher

_Last updated: 2026-09-04_

## Active Bugs

| ID | Severity | Description | Found | Owner |
|---|---|---|---|---|
| ISS-001 | High | macOS bundled Info-ZIP and Homebrew Info-ZIP 6.00_8 transform UTF-8 Korean filenames in the official Seoul ZIP inventory, so the exact schema contract cannot be accepted locally | 2026-08-28 | Architect / Implementer |

## Technical Debt and Unresolved Risks

| ID | Description | Impact | Target resolution |
|---|---|---|---|
| DEBT-002 | ADR-009 permission coverage and TASK-005 delivery, schema, integrity, and entry-date contracts are verified, but conservative data as-of derivation remains undecided | Production publication remains prohibited until freshness semantics and later validation gates pass | M1 / TASK-008 |
| DEBT-003 | Atomic preservation method for the last known-good data is undecided | A failed refresh could regress the service | M1 / TASK-009 |
| DEBT-004 | Location of the Seoul search-quality test set is undecided | Top-3 recall cannot be verified | M2 / TASK-013 |
| DEBT-005 | No reviewed Seoul count/missing-value baseline or JSON budget exists; ADR-014 proposes explicit policy with no defaults | TASK-008 production acceptance cannot pass before measured evidence and reviewed limits | M1 / TASK-008 |

TASK-008 implementation confirms DEBT-002 remains unresolved: the two sampled official dataset pages
still state daily D-2 coverage, but do not prove complete archive source-cut or timezone semantics.
The ADR-016 decoder correction and bounded research reader completed all 195 categories. The
accepted ADR-017 implementation recognizes the exact observed uncertain pairs in an explicit V2
vocabulary without changing display status. Production coverage, calibrated policy, public JSON
budget and baseline evidence remain absent; TASK-009 still owns publication and byte binding.

The official cutoff follow-up inspected current Ministry API attachments and historical migration
Q&A, but found no binding coverage/timezone rule for the current ZIP. A reviewed repeat retrieval
returned identical archive bytes and therefore adds no temporal drift sample. DEBT-002 and
DEBT-005 remain unresolved; concrete provider questions and the same-byte audit are recorded in
`reports/research-2026-09-04-task-008-cutoff-comparison.md`. No new code bug was identified.

TASK-008 independent review found sparse-array header/policy bypasses and impossible baseline
collision participation during implementation. Both were reproduced and fixed before delivery;
regressions and malformed-policy precedence cases pass. No new unresolved code bug was identified.

TASK-007 verification introduced no new known bug. Windows retains two existing Info-ZIP
integration skips; all status-mapping tests execute. Category-specific detailed vocabularies remain
intentionally uninterpreted under ADR-013. Any later refinement requires official evidence and
human approval; production status-distribution validation remains TASK-008.

### ISS-001: macOS Info-ZIP transforms official UTF-8 entry names

- Severity: High
- Found: 2026-08-28
- Reproduction: List the verified 215,968,197-byte official Seoul archive through either
  `/usr/bin/unzip -Z1` or Homebrew Info-ZIP 6.00_8 on the current macOS host.
- Root cause: Both local Info-ZIP builds emit transformed Unicode representations for entries whose
  ZIP metadata identifies UTF-8 Korean filenames; other archive readers preserve the names.
- Impact: Exact one-to-one matching against the 195 approved permission titles cannot be accepted
  from this host. The collector now detects the incompatible signature before contacting the
  provider and returns `environment_unavailable`.
- Temporary workaround: Run the committed manual probe on the approved Ubuntu 24.04 environment
  with a compatible Info-ZIP build. Do not normalize or guess transformed names.
- Permanent fix direction: Use the verified compatible Ubuntu 24.04 Info-ZIP 6.0-28ubuntu4.1
  environment for contract probing and future automation; retain the fail-early capability gate.
- Related FR and tests: FR-13; `src/pipeline/unzip-archive.test.ts`,
  `src/pipeline/discover-archive-contract.test.ts`, and
  `reports/probe-2026-08-28-seoul-archive-contract.md`.

### ISS-003: Native EUC-KR decoder does not implement the expected WHATWG repertoire

- Reproduction: Pinned Node 24.19.0 decodes synthetic `[0x81, 0x41]` as U+0081 U+0041,
  rather than U+AC02. On the hash-bound category 15045028 body, native fatal decoding fails
  at byte-feed offset 155,177 (zero-based), independently of whole/chunked reads.
- Evidence: `reports/research-2026-09-04-task-008-encoding.md` and its two aggregate JSON reports.
  Both the pinned specification comparator and GNU CP949 accept the entire 1,390,700-byte body
  with matching decoded hashes. All 17,048 standard mappings match the candidate comparator;
  native decoding differs on 8,824 and accepts 536 unassigned pairs in the tested range.
- Impact: False rejection prevents observation; silent native misdecoding can corrupt source text.
- Resolution: User-approved ADR-016 pins the existing MIT comparator as a direct development
  dependency and uses it in both CSV decoding modules with fatal decoding. Independent review
  and pinned full verification passed; the live retry passed the original encoding failure.
- Regression plan: Extension/base Hangul and euro, exact headers, all chunk splits/empty chunks,
  invalid trail, incomplete lead, invalid byte, and unassigned pair. Temporary candidate copies
  passed 60 assertions. Integrated full verification passed 433 tests, four browser smoke tests
  and two accessibility scans; independent review approved the decoder correction.

## Resolved

| ID | Description | Resolved | Resolution |
|---|---|---|---|
| DEBT-010 / ISS-003 | Native EUC-KR decoder rejects/misdecodes valid WHATWG input | 2026-09-04 | Accepted ADR-016 promotes @exodus/bytes@1.15.1 and corrects both CSV decoders; strict synthetic mapping/regression evidence, full verification and independent review pass. Live retry passed the original category 15045028 failure. |
| DEBT-008 | TASK-008/TASK-009 row-observation dependency cycle | 2026-09-04 | User approved ADR-015 research-only ingestion; implemented, independently reviewed, and exercised under the exact source contract. Production parser wiring remains TASK-009; decoding failure is DEBT-010. |
| DEBT-007 | Mac research collector environment unavailable | 2026-09-04 | Recreated separate Ubuntu 24.04 container under ADR-015; exact pinned Node/npm/Info-ZIP and existing adapter gate pass. Historical broken container retained. |
| DEBT-009 | Original FR-14 and accepted age boundary differed | 2026-09-04 | User accepted ADR-015 amendment; AGENTS.md, freshness helper and day-6/7/8/midnight tests now use age >= 7. |
| DEBT-006 | Original PRD could not be located on Windows | 2026-09-04 | Recovered and read the recorded original path on Mac; hash and FR-08/13/14 comparison recorded in `reports/research-2026-09-04-task-008-macos-continuation.md`. Boundary discrepancy is tracked separately as DEBT-009. |
| DEBT-001 | Language, framework, package manager, and test tools were undecided | 2026-08-20 | ADR-004 approved TypeScript, Node.js, Preact, Vite, npm, and the test stack. |
| ISS-002 | One official ZIP filename used a hyphen where the audited portal title used `및` | 2026-08-29 | The user approved one literal alias to audited file-data ID `15045011`; tests reject unapproved or duplicate IDs, and the 195-entry contract passed exact reinspection. |

## Issue Template

### ISS-XXX: Title

- Severity: Critical | High | Medium | Low
- Found: YYYY-MM-DD
- Reproduction:
- Root cause:
- Impact:
- Temporary workaround:
- Permanent fix direction:
- Related FR and tests:

## TASK-011 review outcome — 2026-09-05

Independent review found coupled candidate/query validation, dropped Unicode hyphens and
uppercase entity notation gaps. All were resolved with failing-then-passing regression tests
and an Approved re-review. No new open defect remains. TASK-012 owns ranking and candidate
integration; TASK-014/015 own UI input/guidance wiring, so their end-to-end checks remain pending.

## TASK-012 review outcome — 2026-09-05

Review resolved erased original-record field types and a strict descriptor typing issue in the
browser sentinel. Parent verification corrected inherited sendBeacon instrumentation and literal
partial-address fallback, with regression evidence. Independent final review Approved; no new
open implementation finding remains. The intentionally bounded address grammar leaves unsupported
or ambiguous syntax low-confidence; realistic Seoul coverage/90% recall remains TASK-013 and
full-data latency remains TASK-018. These synthetic results do not close either production gate.


## TASK-016 accepted compatibility limitation — 2026-09-07

Naver HTTPS /p/search/{encodedTerms} has no verified official support guarantee in inspected
provider documentation. The user accepted this limitation with the bounded design. Tests verify
local URL generation and intercepted navigation only, not live provider matching/availability.
Revisit if the provider route changes. This does not weaken status or source evidence rules.


## TASK-017 manual evidence gate resolved — 2026-09-08

The tall-card focus defect is fixed and covered in four browser projects. User-assisted
VoiceOver observations now pass all seven cases in .worktrees/task013-quality/reports/voiceover-2026-09-08-task-017.md.
CUA still cannot capture speech directly; user confirmations supply the manual evidence.
No rotor, measured announcement latency or other AT combination is claimed. This limitation
does not invalidate the bounded assisted matrix. No TASK-017 blocker remains.


## Open: TASK-018 measured search/rendering and production performance gaps — 2026-09-08

Owner: Performance Engineer / Implementer; TASK-021 must keep performance release acceptance
open until approved remediation and remeasurement pass. The TASK-014 assignment of full-data
rendering/partitioning to TASK-018 is not resolved by completing a bounded measurement audit.
See .worktrees/task013-quality/reports/performance-2026-09-08-task-018.md and its bound JSON.

On Apple M3 with Chromium Pixel 5 emulation and fourfold CPU slowdown, 1,000 same-district
address candidates take up to 1,478.4 ms to reach the measured display/paint opportunity.
At 50,000 synthetic records, common-name display takes 2,488.4 ms, no-match display 1,535.5 ms,
and diagnostic exact search alone 1,817.6 ms. These exceed the 500 ms target. Same-district
address queries at 10,000/50,000 candidates were not rendered above the 1,000-card harness
resource cap; their end-to-end result is unavailable, not pass. No product truncation exists.

Follow-up: design accessible bounded initial rendering with access to every candidate;
profile semantic-preserving search CPU improvements; evaluate real data partitioning when
source/publication contracts exist. Any interaction or delivery/interface change retains its
approval gate. Production scale, physical mobile devices and Pages/CDN performance remain
unverified. TASK-018 audit completion is not performance or release approval; TASK-008 remains
explicitly on hold. No subsequent task was activated or security/status behavior changed.


## TASK-018 optimization follow-up — 2026-09-08

The optimized report supersedes baseline search-cost estimates, not its production warning.
Mobile 50,000-record exact computation falls from 1817.6 to 146.6 ms; common-name display falls
from 2488.4 to 690.2 ms and absent-result display from 1535.5 to 69.8 ms. Three display cells
still exceed 500 ms, eight are unavailable above the harness's 1,000-card cap, and thirteen
pass. Mobile 1,000-record address display is 1410.8 ms. labTargetsMet and productionVerified
remain false. Performance Engineer / Implementer must address broad candidate DOM cost and
measure full production data before TASK-021 release acceptance. Index preparation at 50,000
mobile records is 2056.1 ms; partitioning still downloads all records. Current three-part
synthetic loading is implemented and tested, while production delivery stays with the existing
TASK-008/009/010 gates. TASK-008 remains on hold. Evidence:
reports/performance-2026-09-08-task-018-optimized.md and matching JSON.


## TASK-018 result-page performance remediation

The previously open lab display misses and eight unavailable search cells are resolved for
the user-approved 20-item pagination behavior. All 24 search cells and 16 applicable navigation
groups pass 500 ms. Mobile first-page maximum is 182.8 ms and navigation maximum is 46.9 ms.
This does not claim simultaneous full-card DOM rendering within 500 ms. ProductionVerified
remains false: all-data download/index preparation, production source-cut/publication and
physical-device verification retain their existing gates. Earlier issue measurements are
historical evidence. No remaining known implementation issue is inferred from these closed
lab misses. Evidence: reports/performance-2026-09-08-task-018-paginated.md in the working checkout.


## TASK-019 security review follow-up — 2026-09-09

No confirmed current-application vulnerability requires remediation. TASK-010/021 must review
actual Actions workflows and repository permissions when available (none exist in reviewed
b614838); TASK-009/021 retain production artifact limits/provenance/publication security gates.
TASK-020 retains public security-reporting documentation. These are deferred release checks,
not discovered exploits or a reason to resume held TASK-008. See the TASK-019 security report
in .worktrees/task013-quality. No architectural or security-policy decision changed.
