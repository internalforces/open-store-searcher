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
| DEBT-010 | Strict EUC-KR body decoding failed for category 15045028 in archive 9cbe96a9bdadb46b8e0bb8034b6b8b60ea133598f6125ba0cfc954bbc31c898c; the header-only contract does not prove body encoding | No complete observation or production baseline; investigate encoding without row disclosure, lossy replacement, or silent fallback | TASK-008 source evidence |

TASK-008 implementation confirms DEBT-002 remains unresolved: the two sampled official dataset pages
still state daily D-2 coverage, but do not prove complete archive source-cut or timezone semantics.
The ADR-015 research reader now exists and rejects invalid body encoding. Validation fixtures
remain synthetic; TASK-009 must provide production ingestion and serialized-artifact binding.

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

## Resolved

| ID | Description | Resolved | Resolution |
|---|---|---|---|
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
