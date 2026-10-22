<!--
Purpose:        Record PR37 CI root cause, bounded remediation and exact-head delivery gates
Owner:          Debugger / Coordinator
Update Trigger: When the fix, independent review, CI or integration evidence changes
Harness Version: 1.1
-->

# PR37 CI Remediation

Date: 2026-10-22
Status: Artifact fix, canonical hosted CI and final task acceptance pass; final evidence-head integration checks remain.
Failing head: `e994ae74d4d19d1cd65e43b7733e9daa28d1cf81`
PR: [#37](https://github.com/internalforces/open-store-searcher/pull/37)
Run: [39754874448](https://github.com/internalforces/open-store-searcher/actions/runs/39754874448)
Job: `119744234884`

The user requests fixing CI, requesting review and merging to main after those checks. This
supersedes earlier no-merge delivery instructions for PR37 only; no deployment, source activation,
workflow/security permission change, TASK-028 implementation or task-acceptance waiver is inferred.

## Observed failure and root cause

The hosted workflow succeeds through checkout/runtime/dependency/browser setup and lint, then
fails `npm run format:check` before types, coverage, build, quality, browser or packaging tests.
Biome reports exactly one formatting error in
`reports/design-prototypes/2026-10-22/task-027-shell/before-metrics.json`: the two color arrays
must use the formatter's inline representation and the file needs its final newline. Hosted
format checks 299 files. The same locked Biome check reproduces exit 1 on the unchanged local file.
This is distinct from the earlier local WebKit readiness failure; no new browser result exists
in this failed CI run.

Earlier successful task-runner style logs checked only 205 files and did not establish parity
with the full delivered tracked artifact set. Those historical outputs remain preserved and
must not be presented as full artifact-inventory equivalence. Remediation uses a clean stage
from all tracked eligible inputs/artifacts, excluding handbook and secret/environment files,
with COPYFILE_DISABLE and no-xattrs/no-fflags to avoid AppleDouble sidecars.

## Fix and pre-acceptance gates (historical)

Preserve original before-metrics bytes as a raw sibling, format the JSON reading view and require
exact original raw SHA plus parsed-object equality. No sample, product source, test assertion,
config exclusion, retry/deadline/worker policy or performance budget changes. Re-run only the
applicable pinned style checks for this artifact-only correction; new exact-head hosted Verify
must run its canonical full command and packaging stage. Independent fix review and GitHub
review are required before the authorized protected merge. Actual spoken AT remains separately
unverified until supported observation or an explicit applicable human disposition.

## Pinned remediation evidence

The clean runner uses Node 24.19.0, npm 11.17.0 and locked Biome 2.5.9.
The complete eligible tracked snapshot contains 666 staged files (673 tracked paths minus
8 handbook paths plus the preserved raw sibling). Every staged byte matches the checkout at staging time;
no AppleDouble files remain. The later coordinator Markdown updates to this record,
`memory/session.md`, `tasks/active.md` and the public review are outside Biome formatting
and are verified separately for whitespace and local links. Formatter reproduction exits 1 on 299 files, then the corrected
view exits 0 on the same 299 files. Lint exits 0 on 301 files with five existing informational
suggestions. The earlier 205-file style snapshot was incomplete for this delivered inventory.

The original 508-byte JSON is preserved as `before-metrics.json.raw`, SHA-256
`c56920af9d1ff915a26c99a6b861e70b9b90eb89a2ce598c2047a05616b1ede7`.
The formatted 461-byte view is SHA-256
`e20ce5ea7401bd07d702ea9db9b277d07402266b4ea564efdda468a34a4aecbf`.
Parsed objects are deeply equal; all 152 measured-source hashes remain current. This corrects
artifact presentation only. No application suite or performance repeat is claimed locally.

## Manual acceptance access

A supported screen-reader reattempt was prepared under the existing specific authorization.
The computer-use tool reports that macOS is locked and cannot unlock it automatically. The
user was asked to unlock it; no setting was changed in this attempt. PG-10 remains unverified.

## Independent review

Fresh GPT-6.1 Sol / xhigh review approves the bounded correction with zero findings, after
independent raw/view equality, source hashes, complete input inventory, runtime and evidence
hash checks. See [review](review-2026-10-22-pr37-ci-remediation.md). This is fix approval;
canonical exact-head CI and actual PG-10 observation remain separate gates.


## Current acceptance disposition

Exact head `d4f9b9e` canonical [Verify39757243712](https://github.com/internalforces/open-store-searcher/actions/runs/39757243712)
passes lint301/format299,1,423tests/59files,92browser and20accessibility with normal two-worker
workflow settings, plus101 packaging tests (zero failures/skips). The GitHub Codex exact-head
review completes with no findings; inline review threads are empty. This resolves the previously
missing canonical default pass without rewriting historical failed evidence.

The user subsequently unlocks, starts VoiceOver directly, and confirms actual current-source
search, inspection/return and both page/range announcements without decorative speech.
See [manual evidence](manual-2026-10-22-task-027-voiceover-final.md) and
[final independent acceptance](review-2026-10-22-pr37-final-acceptance.md). No criterion is waived.
Final evidence-head CI/review and normal protected-main merge remain mandatory delivery checks.
