<!--
Purpose:        Record the attempted resolution of TASK-008 production evidence gates
Owner:          Researcher / Planner
Update Trigger: When source evidence, PRD access, execution environment, or calibration inputs change
Harness Version: 1.1
-->

# TASK-008 Completion-Gate Investigation

Date: 2026-09-04. Trigger: the user requested completion of the remaining work after the
bounded implementation and independent review passed.

## Result

Historical Windows investigation. The subsequent Mac pass recovered the original PRD and found
the prior Docker container, but its snapshot/image is missing. Current findings and concrete
next decisions are in `reports/research-2026-09-04-task-008-macos-continuation.md`.

The investigation did not supply the missing production evidence. TASK-008 remains active;
no evidence assertion, production policy, bootstrap baseline, or task completion was invented.
The earlier 362-test full-verification result remains the implementation evidence. This pass
performed read-only source, repository, and environment investigation, not new code verification.

## PRD search

- The recorded original path is a macOS path absent on the Windows host.
- Filename searches covered `C:/dev` and the current user's Documents, Desktop, Downloads,
  and OneDrive directories. No original PRD was found; the repository match was
  `docs/prd-traceability.md`.
- A filename search across all locally available Git history for PRD-named paths likewise found
  only the traceability document. This does not prove that no copy exists on another device or
  under an unrelated filename.
- The accessible task listing and the project development-environment setup conversation provided
  no usable original PRD path on this host. The available task listing is bounded, not an exhaustive
  search of all account history.
- The user was asked for the original PRD path/link. No answer was received in this pass.

The recovery action is to provide the original file/link, or explicitly designate the current
traceability plus accepted ADRs as the authoritative implementation baseline. No such substitution
was inferred from the general request to finish work.

## Approved execution environment

| Check | Observed result | Meaning |
|---|---|---|
| Existing `UnzipArchiveAdapter.checkEnvironment()` | `{ "ok": false }` | The real collector environment gate does not pass on this host |
| `wsl --list --quiet` | WSL is not installed | No WSL Ubuntu execution environment is available |
| Available shell commands | No `unzip` or Docker command found | No compatible local collector runtime found through those commands |
| Existing VirtualBox inventory | A powered-off VM is configured as Ubuntu 24.10 | This is not verified Ubuntu 24.04/Info-ZIP evidence; no VM was started or modified |
| GitHub Actions run history | Empty run list | No run provides accessible calibration observations |
| GitHub Actions artifacts | `total_count: 0` | No retained artifact supplies a prior archive or baseline |
| TASK-005 manual probe code | Returns a schema contract and deletes the staged archive in `finally` | The previous probe report cannot substitute for retained production row metrics |

The adapter check loaded existing modules through the installed Vite runtime and did not call
the provider, download an archive, or write a contract. No environment check was bypassed and no
alternative ZIP implementation, new OS, dependency, service, or workflow was installed.

The prior verified environment was Ubuntu 24.04 with Info-ZIP 6.0-28ubuntu4.1; its recorded
archive hashes and schema counts remain useful historical metadata, not a record-count baseline.
The user was asked how to access that environment.

### Local Docker follow-up

The user recalled accessing Ubuntu through local Docker. Repository history supports the
existence of that execution path, but does not identify a currently accessible container:

- Commit `b980169` (2026-08-28) added `--docker-container=<name>` to the manual probe and
  invoked archive commands through `docker exec`. The recorded development environment at
  that time was macOS; the reports separately record successful Ubuntu 24.04 filename checks.
  These records do not establish the actual container name or host used for those checks.
- Commit `fd009ef` (2026-08-30) removed the Docker option. PR #6 review found that host staging
  paths were passed into the container without an approved mount/path contract. The current
  probe accepts a compatible host `unzip`; restoring the removed flag would not restore a
  working execution environment.
- On the current Windows host, Docker and Podman are absent from PATH; no matching running
  process, Docker service, standard Docker Desktop installation/configuration directory,
  Start Menu entry, or uninstall-registry entry was found. No matching executable was found
  in the searched Program Files and user-local directories. Docker host/context/config
  environment variables are unset. These checks do not prove absence from every disk path
  or another computer.
- The only discovered configured Ubuntu environment remains the powered-off VirtualBox
  Ubuntu 24.10 VM. Docker cannot currently be queried for containers or images because its
  CLI is unavailable. No VM was started and no installation or configuration was changed.

The user subsequently confirmed that the recalled Docker environment was on their Mac and
requested branch/PR delivery to continue there. The host is now user-confirmed; the container
name, current state, mounts, and compatible tooling still require inspection on that Mac.
Supporting review: [PR #6 container-path finding](https://github.com/internalforces/open-store-searcher/pull/6#discussion_r3886210193)
and [removal confirmation](https://github.com/internalforces/open-store-searcher/pull/6#discussion_r3889238722).

## Official freshness investigation

The official [general-restaurant dataset](https://www.data.go.kr/data/15045016/fileData.do)
still describes daily refresh and coverage through two days earlier. It does not bind that
statement to the hash of a particular Seoul archive, define the timezone of ZIP modification
metadata, or establish a shared coverage cut across all 195 categories. Its national row count
must not be used as the Seoul category baseline.

The [official 195-category service notice](https://www.data.go.kr/bbs/ntc/selectNotice.do?originId=NOTICE_0000000004709)
supports the selected inventory and file/API availability. It is a service-maintenance notice,
not an archive coverage attestation.

The legacy provider Q&A URL now redirects to the
[LOCALDATA closure page](https://www.localdata.go.kr/portal/end.do), which directs users to the
Public Data Portal. This pass could not recover the legacy answer as current source-cut evidence.
The linked current API-reference notice did not expose a coverage-date rule in its page text;
its downloadable attachment was not inspected, so no claim is made about its contents.

The official general-restaurant file information page was also retrieved successfully using the
already documented project User-Agent and portal Referer. A request lacking those documented
headers returned 403. No archive download was attempted. The inspected metadata lines did not
provide a named archive coverage-date assertion; absence from those lines is not proof that every
provider response lacks one.

## Concrete evidence required before the remaining checks can pass

| Gate | Required input or action | Acceptance evidence |
|---|---|---|
| Authoritative requirements | Original PRD file/link, or explicit baseline designation | Source path/reference and FR-08/13/14 acceptance comparison |
| Collection capability | Access to the existing approved Linux host, or separately approved environment setup | Existing adapter passes and the normal bounded collector accepts a staged archive |
| Row observation | Reviewed complete CSV row-ingestion path | Exact schema/encoding, complete-read and per-category row counts bound to the accepted archive hash |
| Coverage semantics | Provider evidence or a reviewed source assertion covering all 195 categories | One common coverage date, explicit timezone, archive hash, category set, evidence reference |
| Calibration | Comparable complete observations over a stated interval | Total/category counts, missing rates, status shares, zero-category observations, measured JSON bytes |
| Bootstrap review | Explicit reviewed policy and initial metrics snapshot | No fabricated defaults; normal validator revalidation succeeds under the reviewed inputs |

One snapshot can establish initial measured counts and completeness, but cannot establish normal
inter-refresh variation. Repeated downloads of the same bytes are not independent observations.
The 300 KB application-code budget and ZIP ceiling are not substitutes for a JSON-data budget.

## Dependency issue and recommended next action

Accepted ADR-014 keeps production row-parser integration in TASK-009, but TASK-008 production
calibration needs complete row observations before TASK-009 can be activated sequentially. This
dependency cannot be satisfied by the schema-only manual probe. Resolve it explicitly through a
reviewed research-only observation path or an approved move of the ingestion prerequisite into
TASK-008; do not silently transfer TASK-008's remaining acceptance criteria to TASK-009.

Once the source/runtime access is available, prepare that exact ingestion contract and collect
read-only aggregate evidence. Keep source rows in isolated staging, do not publish or commit them,
and preserve every category and uncertainty diagnostic. Produce a concrete calibration proposal
from the observations for review. No numerical production threshold is justified by this pass.

Questions for the provider, prepared but not sent:

1. Does the common ZIP entry date identify generation time, and in what timezone?
2. Does each Seoul all-category archive represent one common D-2 coverage cut across all categories?
3. Is there an archive- or category-bound coverage manifest/date that remains accurate after a
   delayed job or repeated download?

No contact message was sent. Further implementation cannot create these external facts. The
next required user input is the original PRD location and access to the prior approved Linux
environment, or explicit directions for replacement requirements/environment setup.
