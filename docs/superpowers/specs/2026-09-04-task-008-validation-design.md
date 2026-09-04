<!--
Purpose:        Define the reviewable TASK-008 validation and freshness contract
Owner:          Architect / Planner
Update Trigger: When validation policy, source evidence, or approval boundaries change
Harness Version: 1.1
-->

# TASK-008 Validation Design

_Date: 2026-09-04_

_Status: Accepted by the user on 2026-09-04; freshness boundary amended by accepted ADR-015_

## 1. Scope and decision requested

Implement a deterministic, offline validator over the accepted collector evidence and staged
row input, reusing the V2 transformer. Add freshness evaluation and JSON syntax/UTF-8 byte
validation. Return diagnostics and metrics; do not publish, write a baseline, or modify records.
Related requirements: FR-08, FR-13, FR-14 and the data-quality standard.

The user approved ADR-014's bounded implementation on 2026-09-04: explicit policy inputs, no invented production
thresholds, and a non-passing result whenever freshness or policy evidence is missing. This
authorizes synthetic implementation and tests, not production readiness. Production threshold
calibration and source-cut evidence remain explicit outstanding TASK-008 acceptance gates.

`ORCHESTRATOR.md` requires approval before implementation of unresolved technical choices;
`prompts/architecture.md` specifically includes data contracts. The execution request activates
TASK-008 design. The subsequent explicit approval selects the policies in this document.

## 2. Evidence and limits

- Accepted ADR-009 through ADR-011 and the committed archive contract cover exactly 195 category
  entries and their ordered CSV headers, encodings, permission mapping, and common entry date.
- `inspect-archive.ts` rejects mixed or invalid ZIP dates and returns `providerModifiedDate`.
  Its date is archive metadata, not a proven coverage timestamp or timezone-bearing instant.
- `collector-types.ts` separates canonical UTC retrieval time, archive hash, schema hash, and
  provider freshness evidence. `source-contract.ts` records daily cadence and a two-day lag.
- On 2026-09-04, the official [general-restaurant dataset](https://www.data.go.kr/data/15045016/fileData.do)
  and [approved filename-alias dataset](https://www.data.go.kr/data/15045011/fileData.do) still
  described daily refresh with data through two days earlier. Both named the Ministry as provider
  and unrestricted permission. This is a two-page metadata recheck, not a new 195-category audit.
- Those pages do not establish that the ZIP modification date denotes the common source cut,
  its timezone, or the semantics of every row update timestamp. Their national row counts cannot
  be used as Seoul category baselines.
- ADR-012 and `transform-license-records.ts` already reject missing identities, duplicate exact
  tuples, digest collisions, changed row header mappings, and malformed source text. They retain
  null, empty, and whitespace-only cells separately when supplied and preserve normalization
  collisions. V2 adds the exact ADR-013 mapper without changing those rules.
- There is no production CSV row parser, approved public JSON serializer, prior accepted record
  baseline, measured Seoul missing-value distribution, or JSON-size budget in this repository.
  The 300 KB application-code budget and 512 MiB collector ZIP ceiling are not JSON budgets.
- The recorded source PRD path is absent on this Windows host. The repository PRD-name search
  found only `docs/prd-traceability.md`; exact source-PRD acceptance cannot be claimed yet.

## 3. Proposed input and output boundaries

Implement `validateLicenseRefreshV1` in `src/pipeline/validate-license-refresh.ts` with:

1. An accepted `CollectionResult`, the approved archive and permission contracts, and staged
   `StagedLicenseRowV1[]`. Reject a rejected collection before transformation. Never trust a
   caller-supplied transformed record as proof that its raw status, digest, and ordering are valid.
2. Ingestion coverage evidence for every category: exact entry name, file-data ID, ordered
   headers, completed-read flag, row count, and archive hash. This future adapter contract must
   distinguish an empty successfully read CSV from a missing/unread category. Synthetic fixtures
   can supply it; production wiring must await a reviewed parser that actually proves it.
3. Optional previous accepted metrics, bound to archive hash, schema/validation versions,
   policy revision, category set, and coverage date. The caller supplies a previously reviewed
   baseline; validation does not create or promote one.
4. Explicit versioned validation policy, reviewed coverage evidence, and injected canonical UTC
   `now`. No network, filesystem, system-clock, or production-policy fallback inside validation.

Return a discriminated result with `validationVersion: 1`, candidate archive hash, policy
revision, available metrics, and sorted diagnostics:

- `rejected`: objective contract, integrity, or approved-limit failure; no accepted candidate.
- `review_required`: structurally measurable candidate but missing evidence, baseline, policy,
  or reviewed vocabulary. No accepted candidate and never a success exit code.
- `accepted`: all applicable checks passed under a complete reviewed policy; contains the
  transformed V2 result and verified `dataAsOf`. This is a validation result, not publication
  authorization. No public textual identifier format is introduced.

Precedence is rejected over review_required over accepted. On an early structural failure,
return available diagnostics without pretending later metrics were computed. Reject malformed
runtime shapes with typed codes rather than trusting TypeScript casts. Known transformer
rejections retain their codes; unexpected exceptions propagate and cannot become acceptance.

Validate provenance binding: collection and ingestion hashes agree; contracts and permission
mapping agree; schema hash is reproduced using the collector's existing schema representation;
every row URL matches its audited category URL; ingestion counts equal supplied row counts;
every accepted category has exactly one completed inventory entry. Reuse existing parsers/checks
where possible and do not change the collector's hash algorithm or source-delivery behavior.

## 4. Freshness and conservative dataAsOf

### 4.1 Evidence policy

Keep `fetchedAt`, `providerModifiedDate`, raw row timestamps, and `dataAsOf` distinct. Do not derive
coverage from retrieval time, a portal page's modification date, a filename suffix, or the maximum
row modification time. Old unchanged licenses can legitimately have old row timestamps.

The immediately implementable rule is evidence-gated: accept a reviewed date-only coverage
assertion bound to the candidate archive hash and all 195 categories, with an evidence reference
and explicit `Asia/Seoul` calendar interpretation. Require one common coverage date under ADR-009;
reject inconsistent category coverage rather than inventing a mixed-vintage publication format.
No such production assertion is presently evidenced. Missing evidence returns
`review_required: data_as_of_unverified` with `dataAsOf: null`.

The possible future rule `providerModifiedDate minus 2 calendar days` is an inference, not an
approved fact. Enabling it requires evidence that the common entry date is the source generation
date, the relevant timezone, and D-2 coverage for the complete selected category set. Preserve
the derivation version and evidence when that rule is eventually approved. Do not silently enable
it through this design's approval, and do not manufacture an assertion from it.

Source lifecycle/update strings stay lossless. Do not parse undocumented row date formats to
compute freshness, discard a record, or revise its mapped status.

### 4.2 Seven-day warning convention proposed for approval

Use calendar dates in `Asia/Seoul`, since the contract exposes a date rather than a precise source
instant. Compute `ageDays = ordinal(SeoulDate(now)) - ordinal(dataAsOf)` using calendar arithmetic.
Both date parsing and `now` validation must reject invalid dates instead of accepting rollover.

- Age 0 through 6: `fresh`.
- Age at least 7: `stale`; emit `data_stale` warning, not automatic structural rejection.
- Future coverage date, retrieval after `now`, or coverage after the Seoul retrieval date:
  reject inconsistent evidence. A timezone-less ZIP date is not compared as an exact instant.
- Unknown coverage: `unknown`, never `fresh` and never accepted by the refresh validator.
- Coverage older than a compatible accepted baseline: reject `data_as_of_regressed`.
- Re-fetching identical archive bytes cannot advance their coverage date. An incompatible claimed
  date for the same hash is rejected. Recompute staleness using the current injected clock.

Example: for `dataAsOf = 2026-08-28`, the warning starts at
`2026-09-04T00:00:00+09:00` (`2026-09-03T15:00:00.000Z`). Exactly seven calendar days is stale under ADR-015.
This is an explicit product boundary proposal, not a claim about provider timestamp precision.
The shared helper belongs in `src/shared/data-freshness.ts` for later TASK-015 UI reuse.

## 5. Quality metrics and policy

Compute total and per-category record counts, missing-name counts, missing-both-address counts,
exact aggregate-pair histograms, four processed-status counts, unknown-pair counts, and
normalization-collision group/record counts. Include zero-row categories from completed ingestion
evidence. A zero-total refresh is rejected; a zero-row category requires explicit reviewed
permission in policy and must not be mistaken for a missing file.

For search completeness, a value is missing when its existing V1 normalized value is null or
empty. Count raw null, empty, and whitespace-only cells separately for diagnostics. Missing one
address when the other is present is not missing-both-addresses. Optional business-type/lifecycle
absence is informational; it is not proof of closure or failure. Retain incomplete records and
measure them; never silently filter them to make thresholds pass.

### 5.1 Explicit configurable thresholds

There are no production numeric defaults. A reviewed policy must supply:

- Absolute minimum and maximum total/category counts and an explicit zero-category list.
- Maximum absolute and relative total/category count changes versus a compatible baseline.
- Maximum missing-name and missing-both-address rates, total and per category.
- Maximum status-share changes for each of the four processed buckets, total and per category.
- Maximum JSON bytes for the artifact being checked; later partition-specific limits are TASK-009.
- A policy revision and evidence reference supporting each category's values.

For previous count `p > 0`, compare `abs(current - p)` and `abs(current - p) / p`; crossing either
approved maximum rejects. Equality passes. For `p = 0`, do not divide: zero to zero has zero change,
and zero to positive requires review. Missing rates use category/total row count as denominator;
an empty category has no rate, not 100% missing. Status-share changes are absolute percentage-point
differences, not relative growth of a possibly empty status bucket. Validate finite nonnegative
limits, integer byte/count bounds, rates in [0, 1], complete category coverage, and min <= max.

Missing policies produce review_required; malformed policies produce rejected. Synthetic limits
are labelled test-only and never become committed production defaults. Before calibration, obtain
read-only aggregate evidence from a separately reviewed ingestion path. One snapshot cannot
establish normal inter-refresh variation; record the observation interval and justification.

### 5.2 Baselines and first run

With no baseline, compute a candidate metrics report and return `baseline_review_required`.
Do not self-approve the first artifact. An explicitly reviewed bootstrap metrics record may serve
as the baseline for revalidation, bound to the exact candidate hash. It does not waive absolute
limits, freshness evidence, structural checks, or vocabulary review.

Incompatible schema, category set, mapping/normalization version, policy revision, or corrupted
metrics require review/rejection rather than a silent first-run fallback. TASK-009 owns persistence
and atomic promotion of baselines together with their artifacts.

### 5.3 Status changes and collisions

Call the existing mapper; do not create another raw-to-display mapping. The four exact ADR-013
aggregate pairs are known, including `04` which remains unverified. An unrecognized, missing,
partial, or contradictory pair stays unverified and raises `aggregate_pair_review_required`.
This candidate is not accepted until the new evidence is reviewed under a later explicit policy;
neither a high threshold nor a previous unknown pair silently permits it. This retains ADR-009's
unknown-value publication stop while preserving ADR-013's total mapper behavior.

Detailed status fields remain uninterpreted; preserve them and report aggregate presence/missing
counts without deriving a vocabulary or overriding status. A known aggregate pair changing to
another known pair is ordinary data change unless approved distribution limits are crossed.

Exact identity duplicates and digest collisions remain whole-stage rejections via the existing
transformer, including duplicates with identical row content. Equal names/addresses across
different identities remain distinct records. Emit existing normalization-collision metrics;
do not add publication thresholds for them here. TASK-009 still owns that publication decision.

## 6. JSON boundary

Add a pure `validateJsonBytesV1` helper in `src/pipeline/validate-json-bytes.ts`: check a nonempty
UTF-8 byte buffer against an explicit positive safe-integer limit before decoding/parsing; reject
invalid UTF-8, malformed JSON, and lengths above the limit. Equality passes. Measure bytes, not
JavaScript string length, gzip size, or ZIP size. Check Korean text, escapes, and truncated input.

This helper validates syntax/encoding/size, not a public record schema. A syntactically valid
scalar is not thereby a publishable artifact. Integration tests use the existing
`serializeTransformationForInternalTest`; its name and private digest-byte representation remain
internal. Do not promote it to a public serializer. TASK-009 must bind validation to the exact
serialized bytes and apply a separately approved artifact schema before publication. Do not
return a publication token based on unrelated caller-supplied JSON or a caller-supplied byte count.

## 7. Diagnostics and unchanged ownership

Diagnostics contain code, severity, category ID, metric name, counts/limits, and evidence references.
Sort by code, category ID, and metric using deterministic byte comparison. Do not dump rows,
names, addresses, raw management keys, or entire transformer collision diagnostics into reports.
No search terms or user behavior enter this build-time interface.

TASK-008 owns staged validation and its policy evidence. TASK-009 owns the upstream production
parser integration, publication collision policy, serialized public schema, atomic replacement,
and last-known-good persistence; those are prerequisites before a production integration claim.
The existing transformer malformed-text policy remains unchanged. TASK-010 owns Actions wiring.
No new dependency, service, source mapping, public ID, workflow, or deployment is proposed.

## 8. Requirements and test matrix

| ID | Requirement / constraint | Planned executable evidence |
|---|---|---|
| V01 | FR-13; approved source contract | Rejected collection short-circuits; schema/hash/permission/URL mismatches reject |
| V02 | FR-13; complete ingestion | Missing/duplicate/incomplete category and row-count mismatch reject; explicitly empty file differs from missing |
| V03 | FR-13; identity | Missing identity, duplicate tuple and digest collision retain transformer failures; same name with distinct identity survives |
| V04 | Data quality | Total/category abrupt increase/decrease at, below, above limits; zero denominator; hidden category loss despite stable total |
| V05 | Data quality | Null/empty/whitespace name and addresses; one valid address; missing-rate boundaries; optional absence |
| V06 | FR-07 / FR-13; ADR-013 | Four exact pairs; unknown/partial/conflicting pairs require review and remain unverified; detailed fields do not override |
| V07 | FR-13 | Per-category and total status-share changes; zero buckets; normalization collisions preserve all records |
| V08 | FR-08 | Missing coverage, mixed categories, wrong hash, unsupported evidence and retrieval-only/D-2-only claims cannot pass |
| V09 | FR-08 / FR-14 | Before/at/after seven-day Seoul boundary, leap/year/month rollover, invalid dates, future time and regressed coverage |
| V10 | FR-14 | Unchanged hash does not reset coverage; later `now` changes fresh to stale; stale data produces warning |
| V11 | FR-13 | No baseline, malformed/incompatible baseline, complete reviewed bootstrap, absent/invalid limits |
| V12 | FR-13; JSON | UTF-8 byte boundaries with Korean text, invalid UTF-8/JSON, empty buffer, internal serialization integration |
| V13 | Determinism | Shuffled rows/inventory yield equal metrics and diagnostics; inputs unchanged; no filesystem or publication effects |
| V14 | FR-13 ownership | TASK-009 follow-up must test exact artifact-byte binding and preservation; no TASK-008 claim that atomic recovery already passes |

Use offline fixtures and test-first implementation after approval. Reuse the accepted 195-entry
schema with synthetic rows and labelled limits; no production row fixture. Run focused unit and
pipeline tests, coverage, `npm run verify:full`, and `git diff --check` with the pinned runtime.
Preserve mapper 100% coverage and global thresholds. An independent Reviewer must approve before
completion; the implementation author cannot provide final approval.

## 9. Completion and handoff gates

1. Human approves the contract, calendar-day boundary, and evidence-gated policy through ADR-014.
2. Implement and verify V01–V13; document synthetic versus production evidence explicitly.
3. Obtain source-PRD access or explicit authoritative traceability-baseline direction.
4. Resolve complete source-cut evidence and production threshold/baseline calibration. If these
   remain unavailable, report the validator as implemented but TASK-008 still open; do not silently
   transfer its acceptance criteria to TASK-009 or mark FR-08/FR-14 Done.
5. Obtain independent review, update the task ledger and memory, then activate TASK-009 sequentially.

This design does not pass implementation, full-verification, independent-review, or milestone
closure gates. It is the concrete approval deliverable for the currently active task.
