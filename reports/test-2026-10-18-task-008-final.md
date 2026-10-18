<!--
Purpose:        Record exact approved quality inputs and fresh TASK-008 final acceptance verification
Owner:          Implementer / Tester
Update Trigger: When final validation, failure preservation, full verification or review evidence changes
Harness Version: 1.1
-->

# TASK-008 final quality acceptance — 2026-10-18

Delivery provenance update: this report's raw replay and 797/68/20 suite bind the independently
reviewed pre-integration tree preserved in commit `2be9077`. A later fetch found merged PR #31
(`c521467`), including earlier adoption and collector mitigation. Those main changes are retained.
The five producer/validator/parser/codec input hashes remain identical, so the complete offline
raw replay remains applicable to that unchanged path; the later integrated full suite is recorded
separately. Raw configuration JSON spelling changed during merge, but the complete parsed object,
exact canonical approved policy/baseline and local resource values remain identical.

Status: TASK-008 complete; fresh complete-source/full-suite verification passed and independent final review Approved.
Related requirements: FR-08, FR-13, FR-14; quality/freshness NFRs under accepted collection-date
operation. TASK-009/010 publication/recovery and TASK-018/021 performance/release remain separate.

## Authorization and exact input identity

On 2026-10-18 the user explicitly approved all three exact inputs from the
[2026-10-16 proposal](calibration-2026-10-16-approval-packet.md) as conservative initial criteria
and requested the remaining verification and independent final review. The installed
[`publication/validation-config.json`](../publication/validation-config.json) contains only the
exact approved policy, exact initial baseline, existing approved reviewed-unverified contract,
and resource ceilings from the original observation (512 MiB/member, 3,000,000 rows,
120,000 ms/member). It has no credential or deployment URL.

| Approved input | Canonical SHA-256 |
| --- | --- |
| Policy | `090973f79398f45d52262958e2887497652cec13b4d95b608eb84c691070feff` |
| Initial baseline | `9234ed3297166a08b500356ac01f5bcd150276c04a2bdd129d399fa0bdc6b183` |

Canonical means Node.js `JSON.stringify(object)` encoded as UTF-8. The policy revision remains
`task-008-calibration-2026-10-16-v1-proposed` to preserve the exact approved identity. The original
machine-readable proposal remains historical and unmodified; adoption is recorded separately.
The workflow's `publication/config.json` remains absent. This work neither enables nor dispatches
publication and does not choose a public interface or deployment destination.

## Source and execution boundary

The retained 2026-10-16 accepted archive is replayed offline through the unchanged production
`iterateLicenseCsv` and `stageBoundedRelease` implementations on the existing Ubuntu 24.04 ARM64
container, using Node.js 24.19.0/npm 11.17.0 and approved Debian Info-ZIP 6.00. Dependencies are
reused from a matching locked installation; no new package or global runtime change occurs.

- Archive SHA-256: `c90758c2d3922e78d636ab2c9967b80c690bdcd8aeca283cf9f6ecc2cc992352`.
- Archive bytes: 217,307,219.
- Original collection instant: `2026-10-16T01:52:52.043Z`.
- Explicit validation clock: `2026-10-18T12:00:00.000Z`.
- Source coverage remains unknown (`sourceDataAsOf: null`).

The original collection instant is preserved; replay time does not become a new collection date
or a source as-of date. All source extraction and intermediates stay outside Git in the existing
container's new `/work/task008-final-20261018` directory. Older task directories are preserved.
No hosted baseline is installed, no deployed release is replaced, and no new source is fetched.

Reproduction in that isolated snapshot:

```text
NODE_OPTIONS=--max-old-space-size=6144 node .testagent/replay-adopted-policy.mjs /work/task008-calibration-archives/c90758c2d3922e78d636ab2c9967b80c690bdcd8aeca283cf9f6ecc2cc992352.zip /work/task008-final-20261018/validation
node .testagent/audit-adopted-release.mjs /work/task008-final-20261018/validation
npm run verify:full
```

## Fresh complete-source replay and failure preservation

The raw-source replay exited 0 after 701,823 ms. All 195 categories and 2,951,024 rows passed
strict parsing, transformation, complete/global identity and collision measurement, actual
approved policy validation and production compact staging. Full measured metrics exactly match
the explicitly approved initial baseline. Archive hashes match before and after ingestion.

[Replay receipt](validation-2026-10-18-task-008.json) records implementation/configuration hashes,
original collection metadata, exact policy/baseline hashes, the accepted aggregate control,
missing-policy review requirement and rejection of a one-record increase in zero-change category
`15006668`. No threshold, raw status, unknown count or source-coverage warning was changed.

| Result | Value |
| --- | ---: |
| Complete categories | 195 |
| Complete source rows | 2,951,024 |
| Compact JSON files, including baseline/release | 726 |
| Total JSON bytes | 691,143,712 |
| Approved JSON maximum | 691,319,965 |
| Remaining bytes | 176,253 |

Only `source_coverage_unverified` remains as a warning; no rejection or review diagnostic remains.
The aggregate metric control explicitly returned `accepted`; production staging produced a
validated descriptor only after the same gate passed for all parsed source rows.

The replay rejects an interrupted category stream and an existing output directory. The separate
[quality preservation audit](preservation-2026-10-18-task-008.json) also feeds all 195 complete but
empty categories through actual production staging under the exact approved policy. It rejects
empty counts, emits no candidate, and removes its owned scratch. All 726 accepted files were
rehashed after each failure exercise; the canonical inventory SHA-256 is unchanged:
`3de3740d37241d204e558f74295ee8d07f4a0a051497116823cad85b878cedf0`.
These are local accepted-staging preservation checks, not hosted deployment rollback/recovery.

## Verification attempts and limitations

Two initial verification-helper attempts stopped before ingestion. The injected count change
updated status and record counts but initially omitted matching raw aggregate-pair counts, so
the production validator correctly returned `invalid_measured_metrics`. Correcting that helper
input makes it reach the intended `count_change_exceeded` assertion. No product code or approved
threshold was changed, and neither failed attempt produced an accepted artifact.

The first full-suite attempt ran concurrently with the complete-source replay. Its non-browser
checks and all 797 unit/component/pipeline tests passed. Browser verification failed at
`tests/e2e/search.spec.ts:507` in Firefox and WebKit (66/68 passed): the advancing clock installed
one second before midnight crossed midnight before the initial zero-warning assertion. Failure
logs are retained at `/work/task008-final-20261018/verify-full.log`; no test, assertion, retry or
flaky-test policy is weakened. The unchanged exact full-suite rerun without concurrent source work passed at default browser concurrency. Both failed browser cases passed; no test or assertion was modified.

These are local Ubuntu checks, not hosted CI or real-device/hosted performance evidence.
Calibration gaps, the duplicate archive and all three transfer rejections remain preserved.
The recurring collector mismatch (ISS-003) remains unresolved and fail-closed.

## Conservative policy effects

All 195 category limits and total limits are an observed envelope over 22 distinct archives,
not a statistical confidence interval. Seventy-nine nonempty categories reject any count change.
The 23 allowed-empty IDs are exact, and first population remains review-gated. The compact JSON
budget is 691,319,965 bytes, based on one measured compact transition, with only 176,253 bytes of
expected headroom. Normal growth may block future refreshes. Further relaxation requires
evidence and explicit approval; no operational continuity or source-freshness waiver is inferred.


## Passing full verification

Fresh `npm run verify:full` exited **0** on pinned Ubuntu after raw-source work finished. All
**797 tests in 44 Vitest files**, **68 four-browser checks**, and **20 accessibility tests** passed.
Lint, format, typecheck, coverage, build and both search-quality checks passed. Default browser
concurrency and strict flaky-test failure policy were unchanged. Lint retains only the same five
pre-existing informational suggestions. No application code, test, dependency or workflow changed.

Coverage: 92.72% statements, 91.09% branches, 95.36% functions and 94.44% lines; the status mapper
remains 100% on every metric. All 156 product/test/tooling hashes match the current host before
and after the full run. Only task/documentation/receipt records are subsequently reconciled.

The [verification receipt](verification-2026-10-18-task-008.json) binds the successful log hash,
failed first-attempt log, current product fingerprints, approved config and both replay/audit
receipts. Full logs are retained in `/work/task008-final-20261018` inside the existing container;
local copies are in the ignored `.vite/task008-final-20261018` directory. The independent [final review](review-2026-10-18-task-008-final.md) is **Approved** with no actionable findings.
