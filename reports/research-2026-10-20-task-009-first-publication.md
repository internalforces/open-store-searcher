<!--
Purpose:        Explain the October 19 source rejection and propose a first-publication source decision
Owner:          Researcher / Debugger
Update Trigger: When source selection, quality evidence, or initial-import authority changes
Harness Version: 1.1
-->

# TASK-009 source rejection and first-publication proposal — 2026-10-20

Source-selection update: the user subsequently approved the exact October 16 source with
quality unchanged and requested an [initial-import design](../docs/superpowers/specs/2026-10-20-task-009-initial-import-design.md).
The [decision](../memory/decisions.md#task-009-initial-source-selected--2026-10-20) supersedes
only pending source-selection statements below. The analysis/evidence remain historical;
the full import design, implementation and operational actions retain their separate gates.

Status: Analysis complete; source selection and any policy/import change remain unapproved.
TASK-009 stays active. TASK-010 and recurring publication stay paused.
Requirements: FR-13, supporting FR-02/08/12/14; hosted AC-009-4/5 remain open.

## Question and scope

Why did the complete October 19 collection fail the approved quality policy, and which source
should be proposed for the first publication/recovery acceptance exercise?

PR #33 merged as `b586e72e88cb41b9988a62d70f9cd5b5503b53bc`; its exact-main
[Verify run passed](https://github.com/internalforces/open-store-searcher/actions/runs/39277146906).
The existing calibration checkout was reused on `codex/task-009-first-publication-analysis`.
This continuation analyzes retained bytes only. It changes no application, source/status rule,
quality/configuration object, baseline, workflow, registry or remote state. It does not select a
source, implement an import, approve a deployment, or complete TASK-009.

## Verified facts and reproduction

The retained source identities are:

| Evidence | October 16 accepted source | October 19 rejected source |
| --- | --- | --- |
| Archive SHA-256 | `c90758c2d3922e78d636ab2c9967b80c690bdcd8aeca283cf9f6ecc2cc992352` | `4a0122435f1a3c998c6293f25eeb4338dcef1c36901fee268014b8d50ea787ff` |
| Original collection instant | `2026-10-16T01:52:52.043Z` | `2026-10-19T02:46:06.133Z` |
| Complete categories / rows | 195 / 2,951,024 | 195 / 2,952,086 |
| Source coverage | null, unverified | null, unverified |

The unchanged production parser, transformer, complete identity/collision checks and staged
validator were replayed on pinned Ubuntu 24.04 ARM64 / Node 24.19.0. A private Vite probe inserted
one in-memory assignment immediately after the production validation call to retain its full
result. It neither replaced the validator nor changed its return value or on-disk module. The
replay used the original October 19 validation clock, took 402,028 ms, and reproduced the exact
historical stager error string. All 195 categories completed; rejected candidate and owned
scratch were absent afterward. Archive and bound source/configuration hashes remained equal.

A separate read-only pass parsed both archives with the production CSV parser and compared
exact category/authority/management identities. All 96 changed category files were compared;
the other 99 file hashes matched the already accepted October 16 observation. Original CSV
values, not normalized names or addresses, determined changes. Each category's row and mapped
status accounting reconciled to the production metrics. Raw rows and identities were not emitted.

The [machine-readable analysis](analysis-2026-10-20-task-009-source-rejection.json) includes all
51 rejection details, all 18 affected scopes, source-change summaries, production controls,
module/configuration hashes and private-probe/receipt digests. A separate Python calculation
reconstructed all 51 rejection values and limits exactly without calling the production validator.

## Root cause: the approved observed envelope was exceeded

This is a reproduced quality rejection, not evidence of a collector/parser defect. The
approved policy is a conservative envelope from 22 distinct calibration archives, not a
confidence interval or a time-adjusted growth model. Fixed per-category ranges, absolute and
relative transitions, and each displayed-status share must all pass independently.

| Diagnostic | Items | Affected category scopes | Interpretation |
| --- | ---: | ---: | --- |
| `count_above_maximum` | 9 | 9 | Current count exceeds its fixed category maximum. |
| `count_change_exceeded` | 18 | 9 | The same nine scopes exceed both absolute and relative change limits. |
| `status_share_change_exceeded` | 24 | 16 | One or more status fractions exceed the observed transition limit. |
| `source_coverage_unverified` | 1 warning | Global | Required uncertainty disclosure; not a rejection. |

The rejection scopes overlap: 51 diagnostics concern 18 categories, not 51 distinct categories
or 51 invalid businesses. No global metric rejected. Total growth is 1,062 rows, within the
1,158-row transition limit; the 2,952,086 total is below the 2,952,182 maximum by only 96 rows.
That fixed maximum leaves little room for later growth even if these category issues are resolved.

### The nine count failures

Source-category names below are preserved literals.

| ID | Source category | October 16 | October 19 | Approved maximum | Increase / absolute limit |
| --- | --- | ---: | ---: | ---: | ---: |
| 15044968 | `숙박업` | 7,187 | 7,195 | 7,194 | 8 / 7 |
| 15044985 | `건강기능식품일반판매업` | 116,430 | 116,479 | 116,477 | 49 / 47 |
| 15045000 | `비디오물제작업` | 13,031 | 13,040 | 13,039 | 9 / 8 |
| 15045021 | `온라인음악서비스제공업` | 119 | 120 | 119 | 1 / 0 |
| 15045052 | `동물용의료용구판매업` | 816 | 818 | 817 | 2 / 1 |
| 15045089 | `테마파크업(기타)` | 791 | 796 | 794 | 5 / 3 |
| 15045103 | `담배도매업` | 564 | 565 | 564 | 1 / 0 |
| 15101549 | `축산판매업` | 42,042 | 42,054 | 42,046 | 12 / 4 |
| 15101551 | `식육포장처리업` | 1,794 | 1,795 | 1,794 | 1 / 0 |

Three of the 79 nonempty zero-count-change scopes each gained one row. The other six count
failures also exceed their explicit nonzero limits. Zero tolerance alone therefore does not
explain every rejection. The policy compares absolute and relative limits separately, accounting
for two diagnostics for each count-change scope.

### Status shares include real source edits and denominator changes

The displayed-status fractions use category count as denominator. A fraction can move even
when no existing business's source status changed:

- `15045103` gained one `행정상 영업` source row; all 564 existing rows were unchanged. Its
  unchanged suspended/unverified counts consequently have different fractions; their limits are zero.
- `15045052` gained two `행정상 영업` rows and changed none of its 816 existing rows. All four
  status fractions exceed their calibrated limits, including fractions for unchanged status counts.
- `15045097` retained 496 identities. One source pair changed from the mapping's
  `행정상 영업` to `폐업`; the closed-share change is 1/496 against a zero limit.
- `15045029` retained 2,538 identities. One source pair now maps to `확인되지 않음`, making the
  unverified-share change 1/2,538, above 0.000302427428.

These are source-file/mapping observations, not independent confirmation of administrative
truth. The status mapper, unknown-pair metrics and exact reviewed-pair contract were unchanged.
No new unreviewed-pair diagnostic appeared. Missing-name count remains 29, missing-both-address
count remains zero, and the exact 23 empty categories remain empty. No review-severity diagnostic
was emitted. The source-coverage warning must remain visible.

## Complete source-change accounting

| Comparison across all 195 categories | Rows |
| --- | ---: |
| Added exact source identities | 1,065 |
| Prior exact source identities absent in October 19 | 3 |
| Matched identities with one or more changed CSV values | 1,766 |
| Matched identities with all CSV values unchanged | 2,949,255 |
| Net count increase | 1,062 |

All 56 categories with changed counts increased; this does not imply that every prior identity
remained. All three absent identities belong to `15045037` (`미용업`), whose net count increased
by 29 after 32 additions. Their prior mapped status was `행정상 영업`. Their removal reason,
possible identity reassignment and real-world status are unknown. Absence must not be classified
as closure. These removals also need explicit attention before accepting the newer source.

Of the 1,766 changed matched rows, 787 changed mapped status: 670 from `행정상 영업` to `폐업`,
113 from `행정상 영업` to `확인되지 않음`, two from `행정상 영업` to `휴업`, one from `휴업` to
`행정상 영업`, and one from `폐업` to `행정상 영업`. Display fields changed in 280 rows and
detailed-status fields in 788; these field groups overlap and must not be added as disjoint totals.
The source edits and additions/removals exactly explain every aggregate displayed-status delta.
They do not establish why the provider made each edit or make every change acceptable by default.

A production-validator control with the October 19 metrics substituted only as a hypothetical
baseline still rejects all nine fixed count maxima. This control did not change configuration or
adopt a baseline. Rebasing the rejected snapshot would conceal transition comparisons and does
not resolve the fixed ranges; it is not an acceptance method.

## Alternatives and recommendation

| Route | Benefit | Required work and limitations |
| --- | --- | --- |
| A — retained October 16 source, unchanged policy | Already fully validated and independently reviewed; avoids tuning limits to a rejected candidate. Recommended for the bounded first publication/recovery exercise. | Explicit source selection and a separately approved trusted initial-import design are required. This source is four Seoul calendar days old on October 20, with the age-seven warning starting October 23. It does not establish sustainable daily refresh. |
| B — October 19 or a later source under a separately reviewed revised policy | Can support a more recent initial dataset and an operational policy supported by additional evidence. | Review the source deltas/removals, choose a new evidence-bound policy revision, review its baseline compatibility, replay complete input and measure compact bytes. Do not merely raise each failing limit to this snapshot's observed value. Any later archive is a different candidate requiring its own validation. |
| C — wait for another source to fit the unchanged policy | Avoids immediate policy/import changes. | No evidence predicts a return inside the fixed maxima; total headroom is 96 rows and new ordinary source edits may still reject. Not the recommended critical path. |

Recommend **Route A as a source-selection proposal for a bounded acceptance exercise**, while
retaining Route B as separate work before routine operation. This recommendation does not make
the retained data publishable now. It preserves the explicitly approved conservative policy and
keeps policy redesign separate from proving atomic first publication, backup and recovery.
If the objective is instead to start ordinary daily publication immediately, Route B's policy
decision must precede that objective; Route A does not solve it.

### Concrete proposed source identity

- Source archive: `c90758c2d3922e78d636ab2c9967b80c690bdcd8aeca283cf9f6ecc2cc992352`, 217,307,219 bytes.
- Original collection: `2026-10-16T01:52:52.043Z`; source coverage remains null. Rebuild/replay time must not replace it.
- Scope: all 195 categories / 2,951,024 records, with no row or status filtering.
- Policy revision: `task-008-calibration-2026-10-16-v1-proposed`; canonical policy hash
  `090973f79398f45d52262958e2887497652cec13b4d95b608eb84c691070feff`.
- Initial baseline canonical hash: `9234ed3297166a08b500356ac01f5bcd150276c04a2bdd129d399fa0bdc6b183`.
- Preserve the approved 23-ID empty list and exact reviewed-unverified-pair contract.

The existing 730-file local package proves retained-byte completeness only. It is not a
publicly verified backup, a selected final deployment artifact or a valid recovery-registry
entry. Current refresh always recollects live source; the restore workflow requires prior
successful-deployment provenance and cannot be repurposed as an initial import.

The next decision packet should approve this exact source first. A subsequent initial-import
design must bind immutable archive/receipt identities, original collection date, complete parsing
and unchanged quality gates, a fresh current-code build and full inventory, and a direct 404
bootstrap check. It must refuse arbitrary source URLs, freshness relabeling, invalid data and
recovery-registry bypass. No input path, workflow or trust rule is implemented by this report.

## Remaining gates and unknowns

The rejected October 19 source never reached compact serialization. Its JSON size is therefore
unmeasured; the 691,319,965-byte budget must not be marked passed or failed from row counts.
The accepted October 16 JSON has only 176,253 bytes of headroom. Provider edit reasons, the three
absent identities, original source coverage, ISS-003 upstream behavior, and future acceptance
frequency remain unresolved. A deterministic observed envelope cannot certify them.

Source selection/import approval is followed by fresh validation/package evidence and required
full-data physical/mobile/hosted performance and applicable release prerequisites. Remote Pages
setup, one-time preparation/dispatch, exact candidate deployment, archival tag/assets, recovery
deployment and recurring operation retain their separate action-time approvals. Recheck actual
protections and public state immediately before an authorized operation. No requested remote
action was performed or queued here. Independent policy/import review is still required;
this analysis is self-checked and does not claim a new independent reviewer verdict.

## Verification and evidence custody

Fresh diagnostic replay, both-archive hashes, per-category/total row and status accounting,
baseline-only production control, independent 51-item arithmetic reconstruction and current
configuration/module hash checks passed. Both configuration files retain the approved quality
objects. Only reports and current-work handoff records change. Application tests were not rerun
for this analysis/documentation-only continuation; the linked main CI remains dated evidence.
Local report links, JSON formatting and Git whitespace are checked before delivery.

Private probes and complete receipts remain in ignored
`.superpowers/sdd/2026-10-20-task-009-source-analysis/` and the existing container at
`/work/task009-source-analysis-20261020`; their exact hashes are in the analysis JSON. Raw archives
were read in place and rehashed unchanged. No new source was collected, dependency installed,
commit pushed, remote setting changed, archive published or deployment attempted.

## Sources

- [October 19 operational receipt](operations-2026-10-19-task-009.json) and [dated report](operations-2026-10-19-task-009.md).
- [Approved calibration envelope](calibration-2026-10-16-approval-packet.md) and [exact adopted inputs](../publication/validation-config.json).
- [October 16 accepted replay](validation-2026-10-18-task-008.json) and [independent final review](review-2026-10-18-task-008-final.md).
- [Production comparison and validation](../src/pipeline/validate-license-refresh.ts) and [bounded staging](../src/pipeline/stage-bounded-release.ts).
- [Approved operational design and initial-import boundary](../docs/superpowers/specs/2026-10-19-task-009-operational-recovery-design.md).
