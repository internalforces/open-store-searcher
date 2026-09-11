<!--
Purpose:        Propose explicit recognition of observed uncertain status pairs without reclassifying records
Owner:          Architect / Researcher
Update Trigger: When independent review or human approval changes the proposed vocabulary contract
Harness Version: 1.1
-->

# TASK-008 Observed Vocabulary Review Proposal

Status: Accepted by explicit user approval; implementation in progress. Related: ADR-009, ADR-013, ADR-014;
FR-04, FR-07, FR-13. This is a validation-vocabulary decision, not a new business-status inference.

## Verified problem

The complete original source archive contains two exact pairs outside the accepted four-pair
vocabulary. The 195-category aggregate and its implementation audit are unchanged evidence:
`reports/observation-2026-09-04-task-008-complete{,-audit}.json`.

| Code | Exact name | Observed rows | Existing and proposed display status |
|---|---|---:|---|
| `05` | `제외/삭제/전출` | 186,864 | `확인되지 않음` |
| `06` | `기타` | 23 | `확인되지 않음` |

These produce 186,887 unknown-pair rows across 68 categories. `mapLicenseStatusV1` already returns
unverified for both; it must remain unchanged. The decision concerns whether these two observed
exact pairs should continue to signal vocabulary drift on every otherwise identical refresh.

## Accepted decision

Recognize those exact two code/name pairs as known uncertain vocabulary. Continue classifying
all of their records as unverified, preserve raw fields, and never exclude them from the dataset.
Retain the original four exact pairs. Code-only matching, different names, whitespace, fullwidth
codes, Unicode variants and any additional pair remain unregistered and require review.

The user explicitly approved ADR-017 under AGENTS.md and the accepted source/status vocabulary
review boundary. ADR-016 only covered the decoder dependency; ADR-017 separately authorizes this change.
The observed official source values are evidence of occurrence, not evidence for operating/closed
classification. This proposal makes no such inference.

## Historical metric compatibility

Do not modify the default semantics of `knownAggregatePair` or overwrite archived V1 reports.
Their `unknownPairCount=186887` is correct under the rules used for that observation. There is no
accepted production baseline to migrate. The current report has no explicit vocabulary revision,
so a silent global allowlist edit would make its previously valid metrics fail validation.

Implement a separately selected validation vocabulary revision 2, while retaining revision 1 for
historical validation. Newly produced validation/research report and baseline envelopes must carry
an explicit vocabulary revision and a new validation/report version; do not infer a revision from
the pair values or from the current source code. A V2 baseline must match the V2 policy/report
contract. Legacy baseline/report input must use the legacy path or return a revision-mismatch
review result; never silently treat it as V2 or bootstrap afresh. Identifier V1, normalization V1
and transformed record schema V2 remain unchanged.

The new envelope fields are explicit: `validationVersion: 2` for validation results/baselines,
`observationVersion: 2` together with `validationVersion: 2` for newly derived or newly read research reports, and
`aggregateVocabularyVersion: 2` in each new report, baseline and policy. A new policy uses
`version: 2` plus its own reviewed revision; all numeric-bound definitions are unchanged. The
legacy V1 entry points and report/baseline/policy formats remain valid only with vocabulary 1.
Missing or mixed revision fields in the V2 path require review/rejection, never inferred defaults.
Implementation should share the existing validation machinery through an explicit revision
context rather than duplicate the engine or silently change V1 function defaults.

Every V2 envelope also contains `aggregateVocabularySha256`, hashing a canonical vocabulary
object with `aggregateVocabularyVersion: 2` and the six exact `{code, name}` pairs in ascending
code order. Code/name fields have nullable-string types, but no null pair is registered. Hash
canonicalization recursively sorts object keys lexicographically, preserves array order, and
encodes compact JSON as UTF-8 without a trailing newline. The proposal impact JSON preserves the
complete vocabulary object and this hash; it is explicitly an unapproved impact proposal, not a
V2 observation. Its `proposedEnvelope` fields do not change the source V1 observation version.

| Input | Selected vocabulary | Result |
|---|---|---|
| Legacy V1 report, metrics or baseline | Explicit legacy V1 entry point | Validate using the original four pairs |
| V2 report, metrics or baseline and matching V2 policy/hash | Explicit V2 context | Validate using the six exact pairs |
| V1 input through V2 path, or V2 input through V1 path | Incompatible | Typed `vocabulary_revision_mismatch` review/rejection |
| V2 input with missing version/hash or differing policy/baseline hash | Missing or incompatible | Typed `vocabulary_revision_mismatch` review/rejection |

V2 metric validation must receive this context end-to-end, including histogram recomputation and
all baseline/report callsites. No implicit vocabulary default is permitted in a V2 path. Existing
legacy V1 entry points remain explicitly V1. Exact 05/06 pairs become known-but-unverified in
diagnostics; other new pairs still produce `aggregate_pair_review_required`. Raw aggregate pairs
remain visible so recognition cannot be mistaken for a processed-status mapping change.

The new path recomputes only unknown-pair counts from the complete exact aggregate-pair histogram.
This is a derivation of an existing observation, not a second observation. Preserve the original
report and audit bytes, bind any separately written derived report to their SHA-256 and the new
vocabulary reference, and mark it research-only. All other metrics and all ingestion evidence must
remain byte-for-byte equivalent in value. No derived report may become a bootstrap baseline or
an accepted publication candidate without the outstanding source-cut/policy/bootstrap evidence.

A future derived artifact must include `derivationVersion: 1`, `sourceReportSha256`,
`sourceAuditSha256`, `derivationImplementation` path/hash entries and
`independentTemporalObservation: false`, alongside its explicit V2 envelope. The source audit
binds the original run implementation; the derivation hashes bind the new offline computation.
This avoids calling the derived artifact a new temporal observation while preserving the fact
that it derives from an actual source observation. Source-as-of, record/schema/identifier fields,
all non-unknown-count metrics, histograms, ingestion proofs, source archive hash and resource
evidence remain unchanged in value. Equality means canonical JSON equality under the rule above,
not a claim that newly serialized files have identical bytes.

The offline proposal script `scripts/analyze-task008-vocabulary-proposal.mjs` verifies all 195
category IDs/counts, the 68 changed categories summing to 186,887 rows, and canonical equality of
an immutable report projection. The projection excludes unknown counts, vocabulary review
diagnostics, and the explicit version/derivation fields listed in the script. All other fields,
including unrelated diagnostics, must remain equal. Separately, all 68 old pair-review diagnostics
must match the original category unknown counts and disappear from the proposed diagnostic set;
exactly the baseline, source-as-of and policy review diagnostics remain. A future unregistered pair
still requires `aggregate_pair_review_required`; implementation regression tests must exercise that
diagnostic path after approval. Its JSON contains all 196 total
and category comparisons plus hashes of unchanged evidence. It outputs a proposal only and does
not enable V2 validation. After approval, a deterministic derivation implementation and tests
must verify these same invariants and hash bindings without provider retrieval.

## Expected measured effect

- Unknown-pair count: 186,887 under revision 1; zero under the proposed revision 2 for this snapshot.
- Processed unverified count: 380,285 under both revisions.
- Every other processed-status count, record count, raw pair, missing-value count, collision count,
  category count and ingestion proof remains unchanged.
- The original report continues to verify under V1 and its existing implementation audit.
- Coverage remains unknown; calibrated limits, public JSON budget and reviewed bootstrap remain
  absent. Recognizing vocabulary does not waive those independent gates or complete TASK-008.

## Verification required after approval

1. V1 retains the four-pair vocabulary and the archived observation still validates unchanged.
2. V2 recognizes exactly the six approved pairs; codes 05/06 still display unverified.
3. Code/name mismatches, whitespace and Unicode variants remain unknown under V2.
4. Total and all category unknown counts recompute exactly from the preserved histogram; every
   non-unknown-count metric and ingestion value remains unchanged.
5. Missing/mismatched vocabulary revisions cannot be accepted as a compatible baseline/report.
6. Derived evidence binds the original report hash, new vocabulary reference and implementation;
   it does not create an independent temporal observation or a production baseline.
7. Existing missing coverage/policy/bootstrap checks continue to return review_required.
8. Pinned full verification and independent review pass before any V2 live use. No new provider
   retrieval, dependency, publication or TASK-009 activation is authorized by this proposal.

## Alternatives

Retaining the current rule is safe but requires explicit vocabulary review for every refresh
containing these common observed pairs. Mapping either pair to closed or operating is unsupported
and rejected. Accepting all unknown strings, suppressing the diagnostic through thresholds, or
rewriting historical metrics would defeat the accepted drift/evidence guards and is rejected.
