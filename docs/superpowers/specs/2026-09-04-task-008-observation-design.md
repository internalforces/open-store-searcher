<!--
Purpose:        Specify the approved research-only observation prerequisite and bounded first run
Owner:          Architect / Reviewer
Update Trigger: When observation semantics, resource bounds, or live-run evidence changes
Harness Version: 1.1
-->

# TASK-008 Research Observation Design

Date: 2026-09-04. Scope approved by the user through ADR-015. Executable design and operational
limits require independent review before live ingestion, not another approval of the same scope.
FR-13 and section 16.2 are the validation requirements; FR-14 is amended to age >= 7.

## Contract

`observeLicenseArchive` receives the existing collector result, exact archive/permission contracts,
an injected observation time, and explicit operational limits. Its preflight calls the existing
validator with an empty stage to reuse collection/schema/permission guards, disregarding only the
expected empty-refresh rejection. No preflight output is claimed as production ingestion evidence.

Hash the accepted staged file before reading, then stream each exact contract entry using Linux
Info-ZIP. `streamProcessBytes` uses shell:false, bounds output and runtime, drains stderr without
retaining its text, rejects any stderr/nonzero exit, and kills/awaits the child on cancellation or
consumer early exit. The source generator ends only after successful child completion.

`parseCsvRows` decodes fatal UTF-8/EUC-KR according to the contract, compares exact ordered headers,
and preserves CSV cells. Support LF/CRLF, quoted commas/newlines, doubled quotes, empty/trailing
cells, an initial BOM, and final EOF without a record terminator. Reject malformed text/quotes,
bare CR, missing or differing headers, and wrong field counts. CSV empty cells stay empty strings;
no null inference. Record-character limits count Unicode code points inside the logical record, including commas,
quotes, and quoted newlines. The terminating unquoted LF/CRLF is excluded; it is consumed as
a boundary without retaining it in the record buffer.

Mark each category complete only after parser and child EOF. Preserve all data rows in a bounded
in-memory stage for the existing transformer and global collision/identity checks. Hash the file
again after ingestion; any disagreement rejects all aggregates. Invoke the unchanged validator
without coverage, policy, or baseline. Return only metrics, ingestion counts, safe diagnostic codes,
archive hash, and resource counts. No transformed records or normalization strings enter output.
`complete` means all categories were ingested, not that the candidate was accepted. Validation can
reject a completely read archive. Read/resource/hash failures return complete:false and null metrics.

The research command accepts only explicit staging/output/limit arguments. It rejects output
inside the repository, existing output, duplicate/unknown arguments, and invalid or above-budget limits before
provider calls. `observation-limits.ts` enforces the reviewed live ceilings; callers may only lower
them for a smaller experiment. It uses the unchanged collector with its existing limits and deletes the staged
archive before writing the aggregate report. Exit 2 means review_required; exit 1 means rejected;
there is no acceptance exit, publication flag, production policy, or baseline promotion.

## Recreated environment and initial resource budget

- Separate container: `open-store-searcher-task008-research`; Ubuntu 24.04 ARM64.
- Base image digest: `sha256:33ceb71981b602c1a7443a53469e4dba065f7503eab3078a2d7a57a2ab987517`.
- Verified versions: Node 24.19.0, npm 11.17.0, Info-ZIP 6.0-28ubuntu4.1; actual adapter returns ok:true.
- Container hard cap: 6 GiB and 2 CPUs, within the inspected Docker VM's approximately 7.65 GiB.
- Node heap cap for the first run: 2048 MiB, with RSS ceiling 3 GiB.
- Explicit first-run ingestion ceilings: 100,000 data rows total; 256 MiB source bytes
  (measured before decoding); 65,536 code points per record; 600,000 ms observation runtime.
- These are conservative experiment stop conditions to leave room for raw rows, transformed
  objects, and global collision maps under the existing in-memory validator. They are not
  measured production quality thresholds and cannot establish an expected Seoul record count.
- RSS/time are checked during ingestion and before/after synchronous validation. The container
  memory cap is the final guard during synchronous validation; a killed process cannot emit a
  complete report. The observation timeout excludes the existing bounded collector phase.
- Limit exhaustion remains an incomplete observation; do not raise caps automatically to force a
  passing report. A later capacity assessment can propose a measured budget or separately reviewed
  disk-backed strategy. Source-cut and inter-refresh calibration remain external evidence gates.

## Verification

Offline fixtures cover day 6/7/8, midnight, quote/encoding/chunk/EOF boundaries, complete versus
empty/missing reads, exact 195-category provenance, hashes before/after, duplicate identities,
resource limits, subprocess completion/cancellation, sanitized errors, and aggregate-only output.
Run focused Vitest tests, full pinned verification, and independent review before a live attempt.
No handbook, provider rows, archive, dependency addition, workflow, or public artifact is committed.
