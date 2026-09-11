<!--
Purpose:        Independent review of the TASK-008 aggregate vocabulary decision proposal
Owner:          Reviewer
Update Trigger: When the proposed ADR, approval state, or derived evidence contract changes
Harness Version: 1.1
-->

# TASK-008 Vocabulary Proposal Independent Review

FR-04, FR-07, FR-13. **Approved for human ADR-017 decision review only.** This approval does not
approve a vocabulary implementation, a source/status mapping change, a new observation, a baseline,
publication, or TASK-009.

The proposal recognizes exactly the observed `05` / `제외/삭제/전출` and `06` / `기타` pairs as
known-but-unverified vocabulary. It retains all raw values and the processed `확인되지 않음` status.
The original four V1 pairs, code/name exactness and future-pair review behavior remain explicit.
This preserves the fail-safe display-status invariant.

The proposal now specifies V1/V2 compatibility and a typed `vocabulary_revision_mismatch` outcome.
V2 envelopes require `validationVersion:2`, `observationVersion:2`,
`aggregateVocabularyVersion:2` and a canonical vocabulary hash. V1 is retained as an explicit
legacy path, so its archived `unknownPairCount` remains historically valid.

I reran the no-network proposal script with pinned Node 24.19.0. Its output exactly matched
`reports/research-2026-09-04-task-008-vocabulary-impact.json` byte-for-byte (SHA-256
`c30ce73345dda9ba75dffe64d20f85ee22457edfdbe986095509094d889c897c`). The proposal binds the
source report and audit hashes, canonical six-pair vocabulary, derivation hashes, all 196 total and
category comparisons, and the immutable projection. It proves 68 pair-review diagnostics accounting
for 186,887 V1 unknown-pair rows are removed only in the proposed V2 diagnostic set; the remaining
three review diagnostics are preserved, and a future unregistered pair remains unknown.

The artifact identifies itself as `unapproved_vocabulary_impact_proposal`, has
`proposalApproved:false`, does not create a temporal observation or baseline, and leaves the source
V1 report unchanged. Implementation and regression coverage for the V2 path must follow explicit
human approval. Source-cut/timezone evidence, time-separated calibration, reviewed policy,
production JSON budget and bootstrap baseline remain independent blockers.

## ADR-017 Implementation Review

FR-04, FR-07, FR-08, FR-13, FR-14. **Approved for the accepted ADR-017
implementation and research-only V2 derivation.** This is not approval of a production
baseline, publication, deployment, or TASK-009.

The implementation keeps `validateLicenseRefreshV1`, legacy metric entry points and the original
V1 observation bytes on the four-pair vocabulary. V2 requires the validation version and the
canonical six-pair vocabulary hash before validation or source I/O. It accepts only the exact
observed `05` and `06` pairs as known uncertain values; their processed status remains
`확인되지 않음`. Whitespace, Unicode-normalized variants, mismatched pairs and future pairs remain
unknown and require review. V1/V2 policy and baseline mixing returns the typed
`vocabulary_revision_mismatch` result.

The offline derivation validates the complete V1 report's metric histogram, 195-entry ingestion
proof, audit report/archive bindings, historical cleanup assertions and its current derivation
implementation digest list before it recomputes only unknown-pair counts. It marks the output
`researchOnly:true`, `independentTemporalObservation:false` and
`productionBaselineCreated:false`. The reviewer found unbounded report/audit parsing; this was
fixed before decoding with fixed 16 MiB and 256 KiB research-only limits. Exact-bound and
next-byte rejection regressions pass. The accepted source contract itself fixes the 195-category
delivery count, so the derivation's matching count remains within the approved scope.

I reran the pinned Node 24.19.0 focused validation, observation and derivation suites: 159 tests
passed. I also reran the no-provider derivation command twice; it produced byte-identical output.
`reports/observation-2026-09-04-task-008-v2-derived.json` has SHA-256
`f1b5f59176c150e9766224dd5ddc1e85d7f2ab6429893defb3f59be8a916e9e7` and binds the unchanged V1
report SHA-256 `1e218c054100dc8dbdccf387a383ab37e85e0797d82e72a7ba341755bc6edab6` and audit SHA-256
`0e7ffda54b8d52b058a311f4e2c4502c0305c61c98f468d0a8026f7da773b481`. Its aggregate has
2,936,760 records, zero V2 unknown pairs and the unchanged 380,285 unverified records; only
baseline, data-as-of and policy review diagnostics remain. The implementer’s post-bounds pinned
`verify:full` evidence records 546 tests across 24 files, four browser tests and two
zero-violation accessibility scans passing, with coverage above project thresholds.

The remaining TASK-008 gates are unchanged: authoritative source-cut and timezone evidence,
time-separated calibration, reviewed policy, a production JSON budget and an approved bootstrap
baseline. Those gates must remain closed before production publication or TASK-009 activation.
