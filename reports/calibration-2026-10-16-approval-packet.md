<!--
Purpose:        Present the completed TASK-008 calibration evidence and one exact policy/baseline proposal for human approval
Owner:          Planner / Researcher / Reviewer
Update Trigger: When the proposal is approved, rejected, corrected, or replayed
Harness Version: 1.1
-->

# TASK-008 Calibration Completion Approval Packet — 2026-10-16

Status: the approved 30-Seoul-calendar-day interval is complete. Every object below is a proposal.
Nothing in this packet adopts a policy, approves an empty category, establishes a baseline,
publishes data, replaces known-good data, changes a source/status rule, or authorizes deployment.

## Decision requested

Human approval is required for these three linked inputs:

1. the complete `ValidationPolicyV1` object with revision
   `task-008-calibration-2026-10-16-v1-proposed`;
2. the exact 23-ID `allowedEmptyCategories` candidate list embedded in that policy; and
3. the 2026-10-16 `ValidationBaselineV1` candidate embedded in the proposal artifact.

The exact machine-readable objects are in
[`task-008-validation-policy-proposal-2026-10-16.json`](task-008-validation-policy-proposal-2026-10-16.json).
Its top-level status is `proposal-unapproved`; operational configuration must use only its nested
`policy` and `initialBaselineCandidate.baseline` objects after explicit approval.

## Evidence boundary

The interval ran from 2026-09-17 through 2026-10-16 in `Asia/Seoul`:

- 23 complete non-publishing receipts;
- 22 distinct archive SHA-256 values and 21 distinct-success transitions;
- one retained byte-identical receipt on 2026-10-11, excluded from independent numeric sampling;
- four pre-collection gaps on 2026-09-25, 2026-09-29, 2026-10-01, and 2026-10-05;
- three retained `transfer_incomplete` rejections on 2026-10-03, 2026-10-04, and 2026-10-09;
- 195 complete categories and one unchanged schema-manifest SHA-256 across every complete receipt;
- one unchanged exact 68-scope reviewed 05/06 contract; and
- null `sourceDataAsOf` throughout. Collection and provider-modified dates do not establish source
  coverage or freshness.

No value was imputed for a gap or rejected attempt. Numeric transitions compare consecutive
distinct complete archives, matching last-known-good baseline behavior.

## Proposed `ValidationPolicyV1`

For total and each exact category scope, the proposal uses:

- count range: observed minimum minus one maximum observed absolute transition through observed
  maximum plus that same transition, clamped at zero;
- absolute count change: maximum observed transition;
- relative count change: maximum observed absolute transition divided by the positive previous
  count;
- missing rates: maximum observed missing count divided by positive record count;
- status-share change: maximum observed absolute share transition where both counts are positive;
- rates and shares: compute maxima with Node.js runtime IEEE-754 arithmetic, then round
  upward to 12 decimal places; and
- empty categories: zero rows in every complete receipt and every distinct observation.

This formula is deterministic and replays all 22 distinct observations with zero numeric
violations. It is a fail-closed observed envelope, not a statistical confidence interval.
Seventy-nine nonempty categories had no observed count transition and therefore retain zero
absolute/relative change limits; unobserved movement in those categories will reject. A zero
baseline that becomes positive also remains subject to the validator's review gate.

Aggregate proposed limits:

| Field                                   | Proposed value |
| --------------------------------------- | -------------: |
| `minCount`                              |      2,940,295 |
| `maxCount`                              |      2,952,182 |
| `maxAbsoluteCountChange`                |          1,158 |
| `maxRelativeCountChange`                | 0.000392825474 |
| `maxMissingNameRate`                    | 0.000009859074 |
| `maxMissingBothAddressRate`             |              0 |
| `maxStatusShareChange["행정상 영업"]`   | 0.000102338285 |
| `maxStatusShareChange["휴업"]`          | 0.000001288694 |
| `maxStatusShareChange["폐업"]`          | 0.000091661403 |
| `maxStatusShareChange["확인되지 않음"]` | 0.000012010517 |
| `maxJsonBytes`                          |    691,319,965 |

All 195 category limit objects are preserved in the machine-readable artifact. Canonical here
means the UTF-8 bytes of Node.js `JSON.stringify(object)`. The canonical `policy` object is
76,642 bytes with SHA-256
`090973f79398f45d52262958e2887497652cec13b4d95b608eb84c691070feff`.

### Compact JSON evidence

The daily research `dataset.byteLength` values describe a different, legacy observation
serialization and were not reused as `maxJsonBytes`. Two bounded, non-publishing interval-end
staging measurements used the actual compact manifest, 723 blocks, `baseline.json`, and
`release.json`:

| Candidate  | Baseline   | JSON files | Total JSON bytes |
| ---------- | ---------- | ---------: | ---------------: |
| 2026-10-15 | 2026-10-14 |        726 |      690,967,459 |
| 2026-10-16 | 2026-10-15 |        726 |      691,143,712 |

The second total includes the deterministic 10-byte increase for the final evidence-reference
string. The proposed ceiling is the larger total plus their observed 176,253-byte transition:
691,319,965 bytes. This is one compact transition, not a long-run size distribution. The
separate 1 GB site guard remains an infrastructure ceiling and is not used as the quality limit.

## Exact allowed-empty candidate list

The following IDs were empty in all 23 complete receipts and all 22 distinct archives:

```text
15006727
15044963
15044965
15044988
15044989
15044993
15045012
15045019
15045022
15045031
15045040
15045041
15045043
15045051
15045053
15045055
15045056
15045065
15045083
15045114
15045115
15101548
15113628
```

This allowlist only prevents rejection while a listed category remains empty. It does not prove
that the provider intends those categories to remain empty. First population of an empty baseline
continues to require review and must also satisfy the proposed count gates.

## Strongest compatible initial-baseline candidate

The 2026-10-16 observation is the latest distinct complete interval receipt and has all 195
metrics, the current schema and contract versions, and independent hash/transition review.

| Field                           | Candidate value                                                    |
| ------------------------------- | ------------------------------------------------------------------ |
| Date basis                      | `collection`                                                       |
| Data date                       | `2026-10-16`                                                       |
| Rows                            | 2,951,024                                                          |
| Archive SHA-256                 | `c90758c2d3922e78d636ab2c9967b80c690bdcd8aeca283cf9f6ecc2cc992352` |
| Schema-manifest SHA-256         | `6254a2b3d6626c41f625bb98d79399bdd40318632ce0d54561a997fdd039ceb6` |
| Source observation JSON SHA-256 | `3d23a3c770b24039a6690f2db8022eb610ffb5b56a9efee031f78b78918b4626` |
| Observation receipt SHA-256     | `6f0903860438d22ef10839e77121c300919cbe1aac802ac2f06a67aca068f91d` |
| Proposed policy revision        | `task-008-calibration-2026-10-16-v1-proposed`                      |
| Canonical baseline bytes        | 135,061                                                            |
| Canonical baseline SHA-256      | `9234ed3297166a08b500356ac01f5bcd150276c04a2bdd129d399fa0bdc6b183` |

The source observation says `publicationApproved: false` and has no adopted policy. Selection here
is a proposal, not promotion.

## Review and next gates

Independent review found no discrepancy in the 2026-10-16 observation, its transition, or source
binding. Separate read-only policy reviews agreed on distinct-archive deduplication, failure/gap
handling, the 23 empty candidates, and the latest-observation baseline choice. The compact staging
measurement closes the identified `maxJsonBytes` evidence gap.

After explicit approval, the remaining TASK-008 sequence is to install the exact approved policy
and baseline in reviewed configuration, run one accepted complete non-publishing validation,
verify failure preservation, and obtain independent final review. Deployment and publication
remain separate approval gates.
