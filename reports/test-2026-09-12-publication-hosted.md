# TASK-009/010 approved-runner verification

Date: 2026-09-12. Head: `3745940f215a5e4d295539ff31fe3c4e040820b2`.
[Draft PR #21](https://github.com/internalforces/open-store-searcher/pull/21).
[GitHub run 34691119664](https://github.com/internalforces/open-store-searcher/actions/runs/34691119664)
completed successfully on Ubuntu 24.04, from 11:27:57 through 11:30:23 UTC.
This supersedes the earlier lack of approved-runner full verification, not the production gates.

## Results

The PR workflow used pinned Node 24.19.0/npm 11.17.0, clean `npm ci`, installed Playwright
browsers and executed `npm run verify:full` successfully.

| Check | Result |
|---|---|
| Lint, formatting, TypeScript, build | Passed |
| Vitest | 638 passed across 35 files; the two Windows-only skips run on Linux |
| Coverage | Statements 92.98%, branches 92.16%, functions 96.42%, lines 95.02% |
| Both search-quality checks | Passed |
| Chromium, Firefox, WebKit, mobile Chromium | 68 passed |
| Accessibility | 20 passed |

Reproduce the hosted evidence with `gh run view 34691119664 --log` and
`gh run view 34691119664 --json headSha,event,conclusion,url`.
The event is `pull_request`; this is not a refresh, publication or recovery run.

## Windows root-cause isolation

Both failing E2E tests were reproduced unchanged with the pinned runtime. Their assertions
fail before navigation, when a native source/map anchor should receive keyboard focus.
`node reports/webkit-link-focus-2026-09-12.mjs` reproduces the behavior with only an input,
native anchor and button, no application code, no stylesheet and no network request.
On Windows with the installed WebKit build 2336, both Tab and Alt+Tab focus the button,
skipping the anchor. No product change, programmatic link focus, skip or weakened assertion
was introduced. The Windows engine limitation remains recorded separately from the passing
approved Ubuntu-runner gate. This diagnosis does not claim real Safari manual certification.

## Acceptance state

| Criteria | Current evidence and remaining boundary |
|---|---|
| AC-009-1/2 | Existing validation rejection, partial-write and lock tests pass on Ubuntu; complete failure matrix and independent review remain open |
| AC-009-3 | Existing hash/length/identity/budget tests and real Vite build test pass; production calibration remains held |
| AC-009-4/5 | Local whole-directory staging and baseline reconciliation pass; actual deployment failure, uncertain outcome and rollback remain untested |
| AC-009-6 | Consumer completeness tests pass; full official-archive production browser/performance evidence remains absent |
| AC-010-1 | Actual PR CI now passes; scheduled/manual production refresh has not run |
| AC-010-2/4 | No deployed baseline exists in inspected evidence; publication/recovery exercise remains pending |
| AC-010-3 | Workflow and actual settings author assessment recorded; independent approval and required protection configuration remain pending |
| AC-010-5 | No thirty-day production history; cannot be inferred from one successful CI run |

Settings and proposed remedies: [Actions assessment](security-2026-09-12-publication-settings.md).
TASK-009/010 remain incomplete. Production config was not fabricated, held TASK-008 work was
not resumed, and no merge, account-setting change or deployment occurred.
