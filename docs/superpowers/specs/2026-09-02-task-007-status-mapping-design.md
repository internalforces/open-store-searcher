<!--
Purpose:        Define the proposed fail-safe TASK-007 raw-to-display status contract
Owner:          Architect
Update Trigger: When the status vocabulary, mapping version, or safety policy changes
Harness Version: 1.1
-->

# TASK-007 Fail-Safe Status-Mapping Design

_Status: Accepted by the user on 2026-09-04_

## Scope and Output

Add one pure domain mapping module and connect it to the TASK-006 transformer. Define
`ProcessedStatusV1` as exactly `행정상 영업`, `휴업`, `폐업`, or `확인되지 않음`, and add
`processedStatus` to each transformed record while preserving `rawStatus` unchanged. Increment the
transformation schema version because the record shape changes; keep identifier and normalization
contract versions unchanged.

Implementation names: `mapLicenseStatusV1`, `transformLicenseRecordsV2`,
`TransformedLicenseRecordV2`, and `TransformationResultV2`. Staged input and options remain V1;
no public URL or textual identifier format is introduced.

## Exact Mapping

| Aggregate code | Aggregate name | Processed status |
|---|---|---|
| `01` | `영업/정상` | `행정상 영업` |
| `02` | `휴업` | `휴업` |
| `03` | `폐업` | `폐업` |
| `04` | `취소/말소/만료/정지/중지` | `확인되지 않음` |

Every other pair returns `확인되지 않음`, including nulls, one-sided values, swapped or
contradictory known values, added whitespace, different normalization, Unicode lookalikes, new
codes, and new names. The mapper performs no trimming, normalization, fuzzy matching, date-based
inference, or category-based inference. Detailed status fields remain preserved evidence and do not
override or refine V1 classification.

## Module, Tests, and Boundaries

- Create `src/domain/map-license-status.ts` as a total, pure V1 function with exhaustive colocated
  unit tests.
- Call it from `src/pipeline/transform-license-records.ts` and add transformer regressions proving
  raw evidence preservation and deterministic output.
- Enforce 100% statements, branches, functions, and lines for the mapping file while retaining
  existing global thresholds.
- Unknown input is a valid unverified result, not a thrown pipeline error. TASK-008 may later reject
  a refresh based on production distribution policy.
- Do not alter identity, normalization, ordering, `dataAsOf`, validation, publication, workflows,
  dependencies, or production data.

Any mapping or conflict-policy change requires official evidence, versioning, tests, and human
approval.

## Verification and Evidence

Run `npm run test:unit`, `npm run test:pipeline`, `npm run test:coverage`, `npm run verify:full`, and
`git diff --check`. See `reports/research-2026-09-02-status-mapping.md` and accepted ADR-013.
