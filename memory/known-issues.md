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
| DEBT-006 | Recorded source PRD path is absent on this Windows host; repository PRD-name search found only traceability | Exact source-PRD design acceptance cannot be claimed; user was asked for the current location | TASK-008 design |
| DEBT-007 | Current Windows host fails the real collector environment gate; no WSL installation or retained Actions archive exists | Cannot collect accepted production calibration observations here until approved Linux access/setup is available | TASK-008 evidence collection |
| DEBT-008 | TASK-008 calibration needs row observations, while accepted ADR-014 defers production row-parser integration to sequential TASK-009 | Requires an explicitly reviewed observation path or ingestion-prerequisite scope decision; schema-only probe cannot supply row metrics | TASK-008 completion |

TASK-008 implementation confirms DEBT-002 remains unresolved: the two sampled official dataset pages
still state daily D-2 coverage, but do not prove complete archive source-cut or timezone semantics.
No production row parser exists. Proposed validation fixtures must remain synthetic; TASK-009
must provide reviewed production ingestion and serialized-artifact binding before integration.

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
