<!--
Purpose:        Track known bugs, technical debt, unresolved risks, and workarounds
Owner:          Debugger / Reviewer
Update Trigger: When a bug or debt is found, a risk changes, or an issue is resolved
Harness Version: 1.1
-->

# Known Issues — open-store-searcher

_Last updated: 2026-08-20_

## Active Bugs

| ID | Severity | Description | Found | Owner |
|---|---|---|---|---|
| — | — | No bugs are registered before implementation | — | — |

## Technical Debt and Unresolved Risks

| ID | Description | Impact | Target resolution |
|---|---|---|---|
| DEBT-002 | Source-data download contract, fields, and terms of use are unverified | Collector and attribution design cannot be finalized | M1 / TASK-004 |
| DEBT-003 | Atomic preservation method for the last known-good data is undecided | A failed refresh could regress the service | M1 / TASK-009 |
| DEBT-004 | Location of the Seoul search-quality test set is undecided | Top-3 recall cannot be verified | M2 / TASK-013 |

## Resolved

| ID | Description | Resolved | Resolution |
|---|---|---|---|
| DEBT-001 | Language, framework, package manager, and test tools were undecided | 2026-08-20 | ADR-004 approved TypeScript, Node.js, Preact, Vite, npm, and the test stack. |

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
