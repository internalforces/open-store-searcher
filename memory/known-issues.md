<!--
Purpose:        Track known bugs, technical debt, unresolved risks, and workarounds
Owner:          Debugger / Reviewer
Update Trigger: When a bug or debt is found, a risk changes, or an issue is resolved
Harness Version: 1.1
-->

# Known Issues — open-store-searcher

_Last updated: 2026-08-29_

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

### ISS-001: macOS Info-ZIP transforms official UTF-8 entry names

- Severity: High
- Found: 2026-08-28
- Reproduction: List the verified 215,968,197-byte official Seoul archive through either
  `/usr/bin/unzip -Z1` or Homebrew Info-ZIP 6.00_8 on the current macOS host.
- Root cause: Both local Info-ZIP builds emit transformed Unicode representations for entries whose
  ZIP metadata identifies UTF-8 Korean filenames; other archive readers preserve the names.
- Impact: Exact one-to-one matching against the 195 approved permission titles fails closed, so no
  schema contract or production collection can be accepted from this host.
- Temporary workaround: Run the committed manual probe on the approved Ubuntu 24.04 environment
  with a compatible Info-ZIP build. Do not normalize or guess transformed names.
- Permanent fix direction: Use the verified compatible Ubuntu 24.04 Info-ZIP 6.0-28ubuntu4.1
  environment for contract probing and future automation.
- Related FR and tests: FR-13; `src/pipeline/unzip-archive.test.ts`,
  `src/pipeline/discover-archive-contract.test.ts`, and
  `reports/probe-2026-08-28-seoul-archive-contract.md`.

## Resolved

| ID | Description | Resolved | Resolution |
|---|---|---|---|
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
