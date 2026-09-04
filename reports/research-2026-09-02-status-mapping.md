<!--
Purpose:        Record official evidence and a conservative TASK-007 status-mapping recommendation
Owner:          Researcher
Update Trigger: When official aggregate status semantics or source evidence changes
Harness Version: 1.1
-->

# TASK-007 Official Status-Mapping Research

_Checked: 2026-09-02_

## Question and Scope

Which raw local-administrative licensing status values can be mapped to the four allowed display
statuses without guessing category-specific semantics? This review uses provider documentation and
the accepted schema contract. It does not inspect production records, derive freshness, validate
distributions, or authorize publication.

## Verified Facts

The official LOCALDATA answer identifies this aggregate `영업상태` vocabulary:

| Exact code | Exact name |
|---|---|
| `01` | `영업/정상` |
| `02` | `휴업` |
| `03` | `폐업` |
| `04` | `취소/말소/만료/정지/중지` |

The same answer states that detailed terminology varies by licensed category and legal or
operational characteristics. It distinguishes voluntary suspension from administrative stop or
suspension. Therefore aggregate value `04` is not equivalent to either product `휴업` or `폐업`
without a narrower verified rule. TASK-006 preserves all four raw status fields exactly.

## Alternatives and Recommendation

Code-only mapping would accept contradictory or renamed source names. Interpreting every detailed
status lacks a verified complete vocabulary. Approve exact aggregate code/name pairs instead: map
`01` to `행정상 영업`, `02` to `휴업`, and `03` to `폐업`; map `04`, missing or partial pairs,
unknown or mismatched pairs, whitespace variants, and Unicode lookalikes to `확인되지 않음`.
Preserve detailed code and name but do not use them for V1 classification.

## Unknowns

- A complete, current, category-specific detailed-status vocabulary is not verified.
- Production frequencies and combinations remain outside TASK-007 and belong to TASK-008.
- A later category-specific mapping requires new official evidence, versioning, regression tests,
  and human approval.

## Sources

- LOCALDATA official data-use answer, “영업상태 와 상세영업상태의 용어에 대한 정의”:
  https://www.localdata.go.kr/devcenter/bbs/devQnaDetail.do?bbsId=B0000100&menuNo=20003&nttId=942
- `src/pipeline/contracts/seoul-archive-contract.json`
- `docs/superpowers/specs/2026-09-02-task-006-transformation-identifier-design.md`
