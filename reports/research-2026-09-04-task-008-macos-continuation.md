<!--
Purpose:        Record recovered PRD evidence, macOS environment checks, and concrete continuation decisions
Owner:          Researcher / Planner
Update Trigger: When environment recovery, freshness reconciliation, or observation approval changes
Harness Version: 1.1
-->

# TASK-008 macOS Continuation

Date: 2026-09-04. Status: historical pre-approval investigation; TASK-008 remains active.

Follow-up: the user explicitly approved the three proposed actions. Accepted ADR-015 records
that approval. Implementation, reconstructed runtime, and verification are recorded in
`reports/test-2026-09-04-task-008-observation.md`; the proposals below preserve the original
investigation and must not be read as a current unanswered approval request.

## Scope and verified facts

The user requested Git synchronization, session review, and continuation. The initial working
tree was clean. Fetch showed the former TASK-005 branch was deleted remotely and its HEAD was
15 commits behind, with no unique commits relative to `origin/main`. Created
`codex/task-008-continuation` from `origin/main` at `095683a`, which contains merged PR #12.
No merge, deployment, source-record operation, or new implementation occurred in this pass.

## Original PRD recovered

Read the original file at
`/Users/sonmyeong-gwan/Documents/Codex/2026-08-18/new-chat/outputs/zero-cost-open-business-dashboard-prd.md`.
It identifies itself as version 1.0, dated 2026-08-18, with review-request status. Its SHA-256 is
`33f3bcb2f0c9f7e03b7edb5acdffe8cad054b0716fa578ed3be5eef8495b91b7`.
This resolves file access, not every requirements acceptance question. The source was not edited
or copied into the English harness; accepted ADRs remain separately recorded decisions.

| Source requirement | Comparison with TASK-008 | Disposition |
|---|---|---|
| FR-08, line 177 | Requires the as-of date on the page and result cards. The staged validator requires reviewed coverage evidence; UI remains TASK-014. | Traceability is consistent; production coverage and UI are incomplete. |
| FR-13, line 182; section 12.3 | Requires retaining previous good data after a refresh failure. TASK-008 rejection alone does not prove atomic preservation. | TASK-009/010 recovery evidence remains necessary. |
| FR-14, line 183 | Requires a warning at age **at least seven days**. ADR-014, AGENTS.md invariant 5, and the helper use **more than seven days**. | Explicit boundary reconciliation is required; do not claim exact source compliance. |
| Section 16.2 | Requires column, count-change, duplicate, missing-value, status-vocabulary, as-of, and JSON checks. | V01–V13 cover the bounded synthetic implementation; production measurements remain absent. |
| Section 11.4 | Describes excluding a malformed record while keeping browser search available. | This is a UI-loading requirement; it does not authorize silently dropping source rows from a failed refresh. |

Concrete freshness decision: retain Seoul calendar arithmetic, but propose warning at `ageDays >= 7`
to match FR-14. For `dataAsOf = 2026-08-28`, the proposed first warning is September 4 at Seoul
midnight; the accepted implementation starts September 5. This proposal requires explicit approval
because it changes accepted ADR-014 and the constitution's boundary. If approved, the project lead
must authorize the AGENTS.md amendment, and the implementer must update the helper, day-6/7/8 and
midnight tests, ADR/design, architecture, and traceability together. Alternatively, the user may
retain the accepted boundary and explicitly authorize a PRD amendment. Neither was inferred here.

## Existing Docker environment

| Check | Result |
|---|---|
| Docker CLI/context | `/opt/homebrew/bin/docker`; selected `desktop-linux` |
| Initial daemon access | Docker Desktop was stopped; started the existing application after tool approval. |
| Project container | `open-store-searcher-task005-unzip`, initially exited with status 137 |
| Start configuration | `sleep infinity`, no entrypoint; only host `/tmp` bound read/write to container `/tmp` |
| Referenced image | `sha256:33ceb71981b602c1a7443a53469e4dba065f7503eab3078a2d7a57a2ab987517` |
| Start attempt | Failed: Docker reported missing snapshot `68143a49f1f1a056cf1c039049ab30bbc24977ac3361cc844d683fcbc7f7d684`. |
| Image inspection | Docker reported `No such image` for the referenced digest. |
| Available image inventory | No Ubuntu or Node image appeared in the inspected list. |
| Host runtime | Shell defaults are Node.js 22.22.3 / npm 10.9.8, not the project pins. |

No container process ran, so Ubuntu version, installed packages, and the actual adapter gate
could not be revalidated. Do not attribute the missing snapshot to a specific cleanup event:
the historical TASK-005 test report records removal of a temporary container/image, but does
not identify this container. Docker Desktop remains running; unrelated containers were not started.

### Concrete environment recovery proposal

Create a separate disposable Ubuntu 24.04 research container after approval; preserve the broken
container and unrelated Docker state. Use the accepted Node.js 24.19.0/npm 11.17.0 pins and
Info-ZIP 6.0-28ubuntu4.1 if available from the approved distribution. Verify actual versions and
the existing `UnzipArchiveAdapter.checkEnvironment()` before provider requests; do not silently
substitute a package version if the historical one is unavailable.

Use a dedicated task directory, with a tracked-source snapshot at `/work/repository`, Linux-only
dependencies installed from the lockfile, staging at `/work/staging`, and schema/aggregate output
at `/work/evidence`. Staging must be outside the repository in the same container namespace.
Exclude `.git`, `.env`, keys, `node_modules`, generated outputs, and `handbook/ko/**` from the source
snapshot. Run the normal committed probe inside that environment with explicit canonical paths;
do not restore the removed Docker adapter flag. Record source commit and image digest. A schema
probe still deletes its archive and does not produce row-calibration evidence.

No environment was recreated or package installed. Environment setup approval does not approve
the row-observation contract below or any production policy.

## Proposed row-observation boundary

To resolve DEBT-008, propose a research-only ingestion prerequisite inside the still-active
TASK-008. TASK-009 retains public serialization, production parser wiring, baseline promotion,
and atomic recovery. This is a proposed data-contract extension, not an accepted implementation plan.

1. Consume an archive accepted by the unchanged collector, exact 195-entry contract, permission
   manifest, and archive hash. Read it only in isolated staging; verify its hash after observation
   as well, rejecting mutation. Never accept a manually supplied filename inventory as evidence.
2. Stream every entry through compatible Info-ZIP, preserve the exact approved encoding, and
   decode with fatal errors. Validate ordered headers against the committed contract. Parse
   commas, quoted commas/newlines, doubled quotes, LF/CRLF, trailing empty cells, and final EOF.
   Reject bare CR separators, malformed quoting, wrong field counts, invalid text, child-process
   failure, and incomplete reads. Preserve empty/whitespace values; do not invent CSV null values.
3. Produce `IngestionCategoryV1` only after successful EOF and process completion for each category;
   distinguish a completed header-only file from a missing entry. Bind every count to the same
   archive hash. Use the existing transformer and mapper, preserving their rejection behavior.
4. Report total/category counts, missing-value counts, aggregate-status histograms, collision
   counts, completed inventory, and resource usage. Do not emit names, addresses, management keys,
   or rows. Missing coverage/policy/baseline must still return `review_required`; an observation
   is never a publication candidate. Internal serialization bytes are not a public JSON budget.
5. Bound extraction and parsing with explicit measured/reviewed memory, byte, row, and time
   limits before a live run. Collector ZIP/header limits cannot stand in for decompressed-row
   limits. Those resource values remain unselected; exhausting a limit yields incomplete evidence,
   never a truncated successful observation.
6. Verify offline fixtures for quoting across chunks, split encoded characters, invalid encodings,
   zero-row categories, missing/duplicate categories, duplicate identities, process failure,
   archive mutation, resource limits, and aggregate/report privacy. Obtain independent review
   before using production rows. Record distinct hashes and observation intervals; repeated
   downloads of the same archive do not establish normal variation.

Approval requested at this stage is for the research-only TASK-008 scope. The exact resource
limits and executable parser design must be made reviewable before live observation; this report
does not authorize arbitrary thresholds or dependency additions.

## Source-cut evidence remains open

Rechecked the official [general-restaurant dataset](https://www.data.go.kr/data/15045016/fileData.do)
and [approved-alias dataset](https://www.data.go.kr/data/15045011/fileData.do). Their metadata states
daily refresh with a two-day lag. These are two metadata pages, not an archive-hash-bound coverage
manifest for all 195 categories. No new coverage assertion or production baseline follows from
this check. The earlier provider questions remain prepared but unsent.

## Verification and next decisions

This pass changed documentation only. Verified the PRD hash and targeted source sections, Git
ancestry, Docker inventory/start failure, relevant contracts, and the literal freshness comparison.
No full-suite result is claimed for this Mac; the prior 362-test result remains historical evidence.
Whitespace and changed-document reference checks are recorded in the session handoff.

Next human decisions: approve the FR-14-aligned boundary amendment, approve the separate Ubuntu
environment recreation, and authorize research-only row observation within TASK-008. Production
source-cut evidence and measured policy/bootstrap review remain separate gates. TASK-009 stays
inactive and TASK-008 does not enter the completed ledger.
