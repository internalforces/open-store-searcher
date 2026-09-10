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
| DEBT-004 | Resolved for TASK-013: reviewed 25-district restaurant snapshot and independent source replay | Source 98/100 and synthetic 28/30 meet the bounded >=90% criterion; all-category accuracy is not claimed | Verified 2026-09-05 |
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

## TASK-013 measured search limitations — 2026-09-05

The unchanged accepted engine returns low-only results for fictional names `"별담문구"` and
`"신사동"` because their suffixes look like address components. Five identical licensing targets
cannot all appear in a Top-3 and correctly suppress primary selection. These five misses are
preserved in reports/quality-2026-09-05-task-013.json (25/30), not relabeled or filtered away.
A reviewed parser improvement and representative source-backed corpus remain required before
claiming the release criterion; TASK-013 stays active. No status-mapping defect was found.

## TASK-013 completion evidence supersedes the initial quality deficit — 2026-09-05

The earlier 25/30 and missing-source notes are historical. Query/address interpretation corrections
now preserve the same synthetic labels at 28/30 and the reviewed source corpus at 98/100. The
source sample was deterministically selected before scoring and independently replayed, including
all declared collision/core competitors. Thus DEBT-004's fixture-location/source-evidence gap is
resolved for this bounded task. Remaining intentional misses are tied licensing IDs and ambiguous
historical-road annotations; no unsafe status inference or relaxed conflict veto is introduced.
These results do not establish all-category or full-dataset performance or overall release approval.


## PR #14 regressions resolved — 2026-09-05

R1 address-only parenthesized locality loss, R2 unchecked source corpus/audit digest mismatch,
and R3 adjacent floor/unit ambiguity were reproduced and corrected. Twelve additional test
cases cover the regressions and valid-binding paths; reports/review-2026-09-05-pr14.md records
verification. Existing tied-ID and historical-road benchmark misses remain unchanged.


## TASK-014 review outcome — 2026-09-06

Independent review Approved; no new unresolved implementation defect. The UI defaults to
explicitly synthetic fixtures because source-cut and production publication remain gated.
TASK-015 owns loading/recovery/staleness, TASK-016 maps and TASK-017 full assistive-technology
flow. TASK-018 must resolve full-data candidate-list rendering and partitioning/performance;
TASK-014's six-record demo is not evidence for production-scale rendering or search latency.


## PR #15 review remediation — 2026-09-06

User authorized review fixes, commit and push. Resolved five findings: >=7 Seoul-day warnings,
shared midnight/focus/visibility clock, repeat live-region announcements, obsolete invalid
state clearing, missing-name fallback, and dataset-level provenance visible without cards.
The current user-provided ADR-015 boundary supersedes the older merged AGENTS wording;
aligned the invariant but preserved V1 pipeline helper behavior. No dependency/public schema,
source mapping, workflow, production deployment or handbook change.
Pinned verify:full passed 492 tests, 24 browser tests and 8 zero-violation axe scans.
Independent re-review Approved after 38 component tests and typecheck. Evidence:
reports/review-2026-09-06-pr15.md and reports/pr15-verification-manifest.json.
TASK-014 is complete again; TASK-015 is next and TASK-008 remains deferred/incomplete.


## TASK-016 accepted compatibility limitation — 2026-09-07

Naver HTTPS /p/search/{encodedTerms} has no verified official support guarantee in inspected
provider documentation. The user accepted this limitation with the bounded design. Tests verify
local URL generation and intercepted navigation only, not live provider matching/availability.
Revisit if the provider route changes. This does not weaken status or source evidence rules.


## Resolved: PR #17 nonportable evidence reference — 2026-09-07

FR-10 previously referred to .worktrees/task013-quality, which is absent in a fresh
checkout. Comment 3949635920 is addressed by repository-relative links to both committed
TASK-016 verification reports. Git-tracked target validation passed; no runtime defect.


## TASK-017 manual evidence gate resolved — 2026-09-08

The tall-card focus defect is fixed and covered in four browser projects. User-assisted
VoiceOver observations now pass all seven cases in reports/voiceover-2026-09-08-task-017.md.
CUA still cannot capture speech directly; user confirmations supply the manual evidence.
No rotor, measured announcement latency or other AT combination is claimed. This limitation
does not invalidate the bounded assisted matrix. No TASK-017 blocker remains.


## PR #18 review remediation — 2026-09-08

PR #18 comments 3953627026 and 3953627033 resolved: identical candidate identity and suppressed overlapping live guidance. Regression/full-check evidence: reports/review-2026-09-08-pr18.md. Changed speech has automated coverage; manual VoiceOver was not repeated.


## Open: TASK-018 measured search/rendering and production performance gaps — 2026-09-08

Owner: Performance Engineer / Implementer; TASK-021 must keep performance release acceptance
open until approved remediation and remeasurement pass. The TASK-014 assignment of full-data
rendering/partitioning to TASK-018 is not resolved by completing a bounded measurement audit.
See reports/performance-2026-09-08-task-018.md and its bound JSON.

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
not discovered exploits or a reason to resume held TASK-008. See the
[TASK-019 security report](../reports/security-2026-09-09-task-019.md). No architectural or security-policy decision changed.


### PR #20 evidence corrections — 2026-09-10

Three documentation/evidence findings are resolved: checkout-dependent FR-12 evidence pointer,
public transcript local-path disclosure and missing artifact-scan definition. Exact scan replay
and full verification pass; see reports/review-2026-09-10-pr20.md. Historical Git objects and
existing review comments may retain the former local path; no history rewrite was performed.
No new application vulnerability or architecture decision was introduced.
