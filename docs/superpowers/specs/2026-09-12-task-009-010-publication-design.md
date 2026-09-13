<!--
Purpose:        Define the publication sequence and unresolved evidence gates for TASK-009/010
Owner:          Architect / Implementer / Release Manager
Update Trigger: When publication contracts or prerequisite evidence are approved
Harness Version: 1.1
-->

# TASK-009/010 publication design

Date: 2026-09-12
Status: Initial proposal below is historical; collection-date continuation authorized on 2026-09-12
Requirements: FR-08, FR-12, FR-13, FR-14; PRD Section 12.3; refresh reliability and recovery

## Authorized continuation and implemented boundary

The user explicitly kept real-data criteria on hold and requested collection-date operation.
This supersedes the pending resumption question and source-cut prerequisite in the initial
proposal below. It authorizes the collection-date branch, not fabricated quality calibration.
See ADR-016 in `memory/decisions.md` and `publication/README.md` for the current contract.

Implemented: explicit date basis, strict full-entry CSV parser, quality-gated staging of exact
dataset/baseline bytes, new-directory atomic promotion, descriptor-bound Vite build, collection
date loader/UI, deployed-baseline hash/revision reconciliation, daily/manual Actions and read-only
CI. The initial implementation uses one Vite-managed dataset asset; production partition sizing
and real-data performance remain open. It defines no share URL. Quality config is absent and
publication remains disabled. Hosted recovery, environment controls and independent review remain
required. Do not read the initial proposal below as a completion claim.

## Verified starting point of the initial proposal

The working branch is `codex/task-009-010-publication`, based on `ec6bb6f`.
The pre-existing synchronization note in `memory/session.md` is preserved.
TASK-009 is the sole active design task. TASK-010 follows its tested publication contract.
TASK-008 remains explicitly held until the user authorizes its resumption.

- `collectSeoulArchive` downloads into isolated staging, checks all 195 archive entries,
  and reports changed/unchanged using a caller-supplied previously accepted archive hash.
  A successful probe or unchanged hash is not proof of publication validation.
- `validateLicenseRefreshV1` requires complete ingestion, reviewed policy, compatible
  baseline and archive-bound coverage evidence. Missing evidence produces `review_required`.
- `TransformationResultV2` is an internal representation containing `Uint8Array` identity
  digests. Plain `JSON.stringify` does not establish an approved public identifier encoding.
- `validateJsonBytesV1` checks UTF-8, syntax and an explicit size limit only; it does not
  establish schema, record completeness, provenance or correspondence with validated rows.
- The browser entry uses `demoLoader` and three synthetic assets. `DisplayDataset` and
  `createPartitionLoader` are internal presentation contracts, not a production manifest.
- There are no workflow files. Existing full verification evidence is historical;
  no new implementation tests or hosted runs have occurred in this design pass.

## TASK-009: proposed transaction

1. Read the last successfully deployed release's descriptor and matching validation baseline.
   Check their version and hashes. A missing first-run baseline requires reviewed bootstrap
   evidence; a missing or corrupt existing baseline must not silently bootstrap a new one.
2. Collect into a unique non-public staging directory. Retain the deployed archive hash as
   the comparison reference. Collection failure leaves the previous release untouched.
3. Parse every approved category with its declared encoding and exact headers. Bind ingestion
   counts, rows and completion evidence to the collected archive. Parsing errors reject the
   refresh; never omit an unreadable category or silently drop a malformed source row.
4. Run the existing staged validator using explicitly reviewed coverage, policy and baseline.
   Both `rejected` and `review_required` stop publication with an unsuccessful run result.
5. Project the accepted candidate into the separately approved production record format.
   Preserve raw/processed status, source, coverage date, lifecycle and identity. Preserve
   normalized collisions as separate candidates; do not merge source identities. The public
   digest encoding, manifest paths, partition rule and byte budget require a concrete contract.
6. Serialize all data parts once. Validate the actual UTF-8 bytes and parse them back through
   the production schema. Check complete identity/count correspondence against the accepted
   candidate, fixed part ordering, and SHA-256/length for each part. Build a single manifest
   binding those bytes to source archive, schema, policy revision and coverage evidence.
7. Build the app against this complete manifest, with subpath-correct same-origin asset URLs.
   Run full verification, production loader checks, attribution/date checks and artifact-size
   checks before the artifact can be uploaded for Pages publication.
8. Package the complete app, data, descriptor and next validation baseline as one release.
   Promotion must select this whole release; never update data, manifest and baseline through
   independent live writes. No staging path may be inside the live output tree.
9. Advance the authoritative baseline only with a confirmed successful deployment of the
   matching release. A failed upload/deploy must not advance it. An uncertain deploy response
   requires reconciliation against the deployment record; do not assume either success or
   failure and overwrite the baseline. Keep the prior complete artifact for approved recovery.

The durable baseline/recovery store is unresolved. GitHub Actions caches and expiring build
artifacts cannot be assumed to be an authoritative permanent last-known-good store. The design
must select a durable zero-cost store with the required access rules before step 1 is executable.
If the baseline is delivered inside the Pages release, its metadata must be approved for public
exposure and reads must prove that it belongs to the currently deployed release. Full source
rows, research evidence or private repository configuration must not be copied by default.

An unchanged source archive may avoid transformation only when the deployed release and
baseline are verified and the code, schema, policy, serializer and partition versions also
match. Code-only updates must still rebuild and validate. Never advance `dataAsOf` to fetch time.
Asset retention and versioned requests must handle a browser opened before a deployment:
do not combine an old manifest with new parts; an unavailable old part must fail the complete
load and retain any accepted in-memory data. This needs an explicit production-loader test.

## TASK-010: proposed workflow boundaries

| Workflow/job | Trigger and trust | Proposed permissions | Required behavior |
|---|---|---|---|
| Verification | `pull_request`, default-branch `push`; fork code is untrusted | Top-level deny-all, job `contents: read` | Clean pinned install, full verification, offline failure injection; no deployment credentials |
| Refresh/build | Daily `schedule`, manual `workflow_dispatch`; default branch only | `contents: read`; add `actions: read` only if approved recovery lookup requires it | Collect, parse, validate, build and verify one candidate; upload only on success |
| Publish | Same trusted run, dependent on successful refresh/build | `pages: write`, `id-token: write` only here | Use the exact same-run Pages artifact and protected `github-pages` environment; execute no source/PR build code |

Proposed schedule: `17 21 * * *` UTC (06:17 Asia/Seoul daily). This is a daily attempt,
not an exact-time service guarantee. Scheduling only takes effect on the default branch;
GitHub documents possible delays and dropped jobs. Thirty-day >=95% success evidence must
come from actual history, with validation failures and missed refreshes reported honestly.

Use a single publication concurrency group with `cancel-in-progress: false`; reject stale
queued builds before publication so an older commit cannot replace a newer deployed release.
Manual dispatch must not allow arbitrary branch/ref/artifact selection into the privileged job.
Keep the complete validation/build/upload/deploy dependency chain in the same trusted run;
do not consume a fork workflow's artifact through `workflow_run`.

Pin every action to a verified 40-character commit SHA and record its version. Use
`persist-credentials: false` for checkout. Pass contextual values through environment variables,
not expression interpolation into shell scripts. Use explicit runner, timeouts and the approved
Node/npm versions; confirm the approved Info-ZIP environment before source downloads.
No new package, paid service, token file or runtime server is proposed.

The `github-pages` environment's human approval and branch protection must be inspected before
deployment. Do not treat a YAML environment name as proof that required reviewers are configured.
This task request authorizes preparation of the pipeline; it does not close P0/release gates.
Do not install a cron-only placeholder that reports success without validating/publishing data.

## Acceptance and failure-injection matrix

| Criterion | Proof required |
|---|---|
| AC-009-1 / FR-13 | Collector rejection, incomplete parse, missing coverage/policy/baseline, unknown status review: old release and baseline hashes remain unchanged |
| AC-009-2 / FR-13 | Failure during serialization, part write, manifest write, packaging or validation cannot expose a candidate |
| AC-009-3 / FR-08/14 | Tampered bytes, omitted/duplicate parts, wrong digest/size/date/schema and identity loss fail before upload |
| AC-009-4 / FR-13 | Successful publication selects one complete app/data/baseline release; failed or uncertain deployment never falsely promotes the baseline |
| AC-009-5 / FR-13 | Explicit bootstrap, corrupt/missing prior state, unchanged source with changed code/policy, stale queued build, rollback and interrupted promotion cases |
| AC-009-6 / FR-02/12 | Production browser assembly is complete and query-independent; old-manifest/new-deployment failure preserves accepted data |
| AC-010-1 / Section 12.3 | Daily/manual trusted runs execute change check, validation and Pages dependency chain on GitHub |
| AC-010-2 / FR-13 | Injected validation and deployment failures leave actual published content and accepted baseline unchanged |
| AC-010-3 / FR-12 | Actions security review covers triggers, injection, privileges, pins, credentials, same-run artifact trust and actual account/environment settings |
| AC-010-4 / Recovery | Successful hosted publication plus subpath/search/source/date smoke checks and approved previous-artifact recovery exercise |
| AC-010-5 / Reliability | Actual thirty-day refresh evidence; no synthetic pass or waived history |

Require `npm run verify:full`, focused pipeline tests, workflow syntax validation and independent
review before marking implementation complete. Hosted publication/recovery and 30-day reliability
are separate evidence gates; local tests cannot close them. TASK-019 AC-019-8 remains open until
actual workflows and settings are reviewed. TASK-026 applies at milestone closure.

## Prerequisites and next action

The user has been asked whether to resume TASK-008 or keep its hold and restrict work to the
testable publication foundation. The hold is an explicit existing user instruction, not a skill
approval requirement. Until clarified, do not resume its production calibration/coverage work
or represent an unapproved synthetic baseline as deployable data.

After resumption is authorized, activate TASK-008 alone while resolving its evidence gates,
then return to TASK-009 and TASK-010 sequentially. If the hold remains, implement only the
explicitly bounded internal publication foundation after settling its testable contract; retain
TASK-009/010 as incomplete for production integration and hosted verification.

## Official workflow references

- [Custom GitHub Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages): separate build/deploy jobs, Pages artifact and deployment permissions.
- [Workflow schedule semantics](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule): default-branch scheduling and delay/drop limitations.

References checked 2026-09-12. These document GitHub capabilities; they do not prove this
repository's settings or authorize a deployment.
