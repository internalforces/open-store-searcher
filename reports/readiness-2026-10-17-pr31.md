<!--
Purpose:        Separate reviewed PR readiness from actual data publication and release readiness
Owner:          Implementer / Independent Reviewer
Update Trigger: When PR checks, reviewed changes, artifact evidence or deployment prerequisites change
Harness Version: 1.1
-->

# PR 31 readiness checkpoint

PR: [31](https://github.com/internalforces/open-store-searcher/pull/31), draft,
`codex/task-008-policy-adoption-local` into `main`. Implementation source:
`b9bc6590792b129de127c0764e088048c11c06f4`; base at inspection:
`eca8448f9b4ebc41c0ed4708130c3a7fac9854d2`, an ancestor with no merge conflict.
The delivery follow-up changes only documentation, path redaction and review receipts.

The user requested "pr 생성 후 리뷰 내용 검토 후 수정 처리 배포 가능상태로 만들어라".
This authorizes draft PR creation, review/fixes, verification and branch delivery. It does not
authorize merge/auto-merge, publication/deployment, recurring collection resumption or changes
to credentials/security settings. Historical no-PR/no-CI statements describe earlier checkpoints;
this record supersedes them for current delivery. No numeric approval is attributed verbatim
to the user: the original "open-store-searcher 결정해" delegated the decision to dot.

## Review and correction

The independent PR review covers all 43 original changed files, including inherited October
12–16 aggregate observations/proposal, exact policy adoption and bounded ISS-003 recovery.
It independently rechecks all 23 observation bindings, 22 distinct archives/21 transitions,
196 metric scopes and exact 23 always-empty IDs. It also independently runs 38 collector/download
and 161 staged-validation tests. The earlier medium timeout/cancellation finding is already
fixed with its failing/passing regression; no blocking code finding remains.

One new low-severity documentation/privacy observation is corrected: five added calibration
reports now use `<local-calibration-root>` instead of an absolute local account path. Archive
and log hashes remain intact. Existing unrelated historical files are preserved. No raw business
rows, private archives/logs, credentials or new dependency/workflow/security change is included.
`handbook/ko/**` is excluded from implementation and review.

At the checkpoint readback, GitHub reviews, conversation comments, inline comments and GraphQL
review threads are all empty; no remote finding is silently resolved. See the
[independent final review](review-2026-10-17-pr31-readiness.md).

## Actual hosted verification

[Verify run 39002989647](https://github.com/internalforces/open-store-searcher/actions/runs/39002989647)
passes on exact implementation HEAD `b9bc6590792b129de127c0764e088048c11c06f4` under
Ubuntu 24.04 / Node 24.19.0 / npm 11.17.0. The unchanged workflow runs `npm run verify:full`
and `node --test scripts/check-pages-artifact.test.mjs`, with no publication permissions:

- 813 tests in 44 files, lint, formatting, typecheck, build and both search-quality checks pass.
- 68 browser checks across Chromium, Firefox, WebKit and mobile Chromium pass.
- 20 accessibility checks and four exact workflow-packaging fixture checks pass.
- Coverage: 92.79% statements, 91.33% branches, 95.36% functions, 94.47% lines.

Private complete CI log SHA-256:
`23c2652e107cbe9120adf2ac3fd52e79b7f80107fe58c775c608d0c28928bfd1`.
The follow-up documentation commit must also have its exact-head Verify check read back as
successful before final delivery; its run belongs to the PR checks rather than this immutable
earlier-source receipt. No failure is ignored or converted into success.

## Full-data local production build and packaging

Ran the actual `scripts/build-publication.mjs` against retained, completely validated October 16
staging, using an exact Git archive of the implementation HEAD and pinned Ubuntu runtime.
This is a private non-publishing build, with no new collection or provider access:

| Check | Result |
| --- | --- |
| Accepted source | 195 categories, 2,951,024 rows; original collection date October 16; source coverage null |
| Exact quality configuration | `publication/validation-config.json`; revision `task-008-calibration-2026-10-16-v1-proposed`; complete 195-category policy, 23-ID list and initial baseline unchanged |
| Quality JSON budget | 691,143,712 bytes; ceiling 691,319,965; headroom 176,253 |
| Builder exit | 0; actual compact loader and relative asset URLs |
| Built site | 730 files, 691,233,971 bytes; below the decimal 1 GB Pages budget |
| Source-to-built identity | All 726 accepted files match corresponding built files by path, byte length and SHA-256 |
| Existing-output failure | Second builder invocation rejects; all built and accepted file hashes remain unchanged |
| Exact workflow packaging | Extracted the actual refresh-workflow shell; GNU tar exit 0; unpacked inventory equals the complete built inventory |
| Private tar | 691,804,160 bytes; never uploaded or published |

SHA-256 evidence (only aggregate results and hashes are committed):

- Site inventory: `896437143bcfa86d5c448fd49d08ca3f015709f1d59146653a90e66f45757ff9`.
- Private tar: `165135935a16e757afd68e4ed14a4011a4d6f6915c4503b047cd97d9fb4630c4`.
- Build log: `90cf4f74535826fdfa718db50e20216af9ee3ecfd16b4b2e3ed392d4a443deda`.
- Aggregate packaging receipt: `ea639123a4cbb5f29b0222a8e72c18eac8487f5db86b1ed13bbf1f011d5d93ff`.

The accepted artifact inventory remains unchanged. Earlier failure injection additionally
rejects incomplete ingestion and preserves all 726 accepted files; the independent staged
validator tests cover corruption and late-write failures. Neither package construction nor
local unpacking is a hosted deployment or a deployed-baseline recovery exercise.

## Private full-data browser smoke

The corrected helper passes against the actual 2,951,024-row production site in local headless
Chromium at `/open-store-searcher/`, without external access. It verifies the October16 collection
label, explicit unverified-source warning, a completed synthetic search, and a supplementary
private-use synthetic query with zero matches and the required no-closure-inference guidance.
Observed query network requests, nonlocal requests, page errors and HTTP errors are all zero.
Initial ready time is 57,628 ms; the Latin synthetic query returns zero eligible/15 similar
candidates in 362 ms. These are local observations, not physical/mobile/hosted performance
acceptance. The initial full-data load remains a material release-performance consideration.

Three earlier private helper invocations failed and are not presented as passes:

1. An arbitrary numeric/Latin token was incorrectly assumed to have zero candidates. The helper
   timed out waiting for an exact zero/zero summary. Later diagnostics observe a completed
   zero-eligible/25-similar search, rather than a product search timeout.
2. The diagnostic then used an ambiguous unqualified status locator; it matched the completed
   summary and result-pagination status. The helper failed strict-mode selection.
3. After fixing that selector, another arbitrary Latin token still incorrectly assumed zero
   candidates. The final run empirically observes its zero-eligible/15-similar result. Existing
   bidirectional substring matching can match short names inside arbitrary longer strings.

Only the private helper's oracle/selector/fixture changed; no product implementation, expected
safety behavior, quality gate, repository test or assertion was weakened. The final supplementary
fixture is empirically observed to have zero matches; no source-character-set proof is claimed.
All four helper runs and the complete data remain local. SHA-256:

| Receipt | SHA-256 |
| --- | --- |
| Initial failed helper | `39484b3a6c88f6ed2ecdf70f2e9c09865b6b8a9a369d5f9668fd57b5b0713a2e` |
| Failed selector diagnostic | `2bfe833053de3fdfe308d3399b63df0cb57f78026a16be8d8db2c0b7c118a6a1` |
| Failed Latin-zero oracle | `5f6fba6bff8646e4a8504ee3c15bfd002e82f0f87f1327f93f96a272e7ea3e1d` |
| Final passing helper log | `e60c0749f15019f2fbd0d3b1d5c5fffe2f2c3765b027e4b1896322fe33002e7e` |
| Final aggregate browser receipt | `af1b0c9b8c8a5a1f0b262ed087c5196514eb254f4106bfc078816c7561ebe7ce` |

## Remaining gates and operational limits

| Gate | Current evidence / next prerequisite |
| --- | --- |
| Code review and tests | No blocking finding; implementation CI passes; final delivery HEAD CI must also pass |
| Merge | Draft, no conflict at inspection; do not merge or enable auto-merge |
| Source transfer | ISS-003 stays Open upstream: one bounded live check rejected both incompatible range/full lengths and left zero staged files; coherent provider representation is still needed for a new candidate |
| Coverage | `sourceDataAsOf: null` and the collection-date warning remain; ADR-016 allows explicitly labeled collection-date operation, so this is not silently redefined as a new categorical deployment prohibition |
| Production configuration | `publication/config.json` absent; approved local inputs do not invent reviewed production URL, resource limits, bootstrap/reconciliation configuration |
| Repository publication state | Read-only Pages API and `PAGES_PUBLICATION_ENABLED` variable API each return HTTP 404; no active Pages source or enabled flag is established by these responses |
| Environment | Existing `github-pages` requires one reviewer, permits self-review under the prior approved policy and restricts deployments to the `main` branch rule; settings unchanged |
| Main protection | Existing strict `verify`/App 15368, administrator enforcement and conversation resolution remain; zero required PR approvals in current readback; settings unchanged |
| Production acceptance | Physical/mobile/hosted full-data performance, publication/recovery, TASK-009/010/021 and milestone/release requirements remain open |
| Calibrated limits | 79 nonempty categories have zero change tolerance; JSON ceiling has one observed transition; no relaxation is made to force acceptance |
| Execution authority | No merge, data publication/deployment, environment approval, schedule resume, credential or security-setting change executed |

Code changes can be assessed for merge separately from real data release. Local reproducible
build/package evidence is complete; it does not establish that only a deployment approval click
remains. Production settings, acquisition and outstanding acceptance evidence need their owners
and authorized actions before publication can be claimed ready.
