<!--
Purpose:        Record the bounded TASK-019 security and privacy review
Owner:          Security Reviewer
Update Trigger: When reviewed application, dependencies, or deployment scope changes
Harness Version: 1.1
-->

# TASK-019 Security and Privacy Review

| Severity | Confirmed actionable findings |
|---|---:|
| Critical | 0 |
| High | 0 |
| Medium | 0 |
| Low | 0 |

Review completed on 2026-09-09 against commit b614838 in the reused
`.worktrees/task013-quality` checkout. No actionable vulnerability was confirmed in the
reviewed application paths. This is a bounded security assessment, not independent merge
approval or production security certification. TASK-008's separate dirty checkout is excluded.

## Scope and threat model

Requirements: FR-12 and PRD Section 14.4; FR-10 explicit external navigation boundary.
Untrusted inputs are browser query text and displayed source fields. Trust boundaries are
local component state, static JSON loading, user-initiated external navigation, build dependencies,
and staged provider archives. Source, test and built artifact hashes are in
`security-2026-09-09-task-019-evidence.json`. No product or test code was changed.

## Evidence and disposition

| Threat | Severity / disposition | Evidence | Impact and recommendation | Approval required? |
|---|---|---|---|---|
| Query or behavior exfiltration | No finding | `src/app/app.tsx`, `search-form.tsx`, `demo-loader.ts`, `partition-loader.ts`; browser search tests at lines 8, 115, 422, 532 and 826 | Draft/submission stay in component memory; form prevents navigation; fixed three data assets use omitted credentials and no referrer; search and pagination cause no requests. Retain these tests. | No review approval needed |
| HTML/script execution | No finding | `src/app/result-card.tsx`, `search-results.tsx`; `result-card.test.tsx:128`, real-form browser test at line 422 | JSX renders query/name/raw evidence as text; hostile image markup creates no image. No application HTML injection, eval or dynamic function sink found. | No |
| Unsafe external navigation | No finding | `src/shared/map-search-links.ts:2`, `src/app/map-links.tsx:6`, `evidence-context.tsx:46`; browser tests at lines 611 and 785 | Map URLs encode candidate fields, use fixed HTTPS hosts, and disclose transfer before activation. New tabs have noopener/noreferrer; source links reject non-HTTPS and credentials. Browser tests intercept destinations locally and verify null opener/no Referer. No map provider page was inspected. | No |
| Frontend secret/tracking exposure | No finding within inspection | Entry HTML, Vite config, browser-reachable code and six built files | No environment injection in application code or common credential/tracker patterns in built files. The scan reports pattern names/paths only. No secret, key or environment file was opened. Pattern scanning cannot prove absence of every possible secret. | No |
| Dependency advisories / supply chain | No finding in current registry response | Saved npm audit JSON; lock inventory; dependency license report | npm audit returned zero advisories. All 307 non-root lock entries have integrity and registry.npmjs.org resolution; direct versions are exact. 304 unique package-version license declarations recorded. This is metadata evidence, not an upstream code audit or legal opinion. Recheck on lock changes and release. | Changes would require approval |
| Actions privilege escalation | Not applicable to current checkout | No `.github/workflows` files or `.github` directory | There are no triggers, run expressions, action refs, permissions, outputs, secrets or runner jobs to evaluate. Do not treat absence as a passing deployment gate. TASK-010/021 must review actual workflows and repository settings. | Workflow/permission changes require approval |
| Malicious provider archive | Bounded existing controls; production review deferred | `staged-download.ts`, `inspect-archive.ts`, `unzip-archive.ts`, `collector-types.ts` and existing pipeline tests | Staging is outside the repository; transfer has byte/deadline limits and SHA-256; integrity and entry/schema checks precede acceptance. Child processes use argument arrays without a shell, bounded output, timeout and prefix reads. No arbitrary archive extraction is performed. CRC/hash detect corruption, not independent publisher authenticity; integrity traversal can consume CPU until timeout. Live Linux execution and complete production ingestion were not rerun. | Production changes require approval |

SourceLink allows any credential-free HTTPS host; it is a protocol filter, not an official-source
allowlist. Current source provenance is supplied by reviewed static metadata. Production publication
must preserve trustworthy provenance. Map navigation intentionally transfers public candidate fields,
not the user's draft/submitted query; it is distinct from background telemetry under accepted FR-10.

## Verification

Pinned runtime: Node 24.19.0 / npm 11.17.0, using the existing
`PATH=/tmp/open-store-task013-runtime:$PATH` runtime.

- `npm run verify:full`: exit 0; lint, format, typecheck, coverage, build and both search-quality
  gates pass; 598 Vitest tests, 68 browser tests across four projects, 20 accessibility tests.
- Coverage: 92.89% statements, 92.41% branches, 96.23% functions, 94.99% lines.
- Browser evidence covers live-form network/storage/log/URL sentinels (including self-checks),
  inert input, fixed partition requests/retry, explicit source/map navigation and pagination.
  Static inspection additionally covered cookie, IndexedDB, geolocation and tracking API absence;
  those APIs are not all individually instrumented by the existing runtime sentinels.
- `npm audit --json`: zero reported vulnerabilities; saved response accompanies this report.
- `node scripts/report-dependency-licenses.mjs --task=TASK-019 --date=2026-09-09`:
  304 unique package versions, no missing declaration failure.
- Built artifact pattern scan: zero matches; SHA-256 inventory saved. The build is the tested
  Pages-subpath synthetic application. No external hosting headers or account settings were audited.

Full verification output: `security-2026-09-09-task-019-verify.txt`.

## Remaining release gates

TASK-019's current-code review is complete. TASK-010 owns workflow trigger/input/permission,
SHA pinning, credential persistence, environment and artifact trust review when workflows exist.
TASK-009/021 own production JSON byte limits, provenance and atomic known-good publication review;
current `prepareDisplayData` is presentation validation, not that publication gate. TASK-020 owns
public security-reporting documentation. Hosting configuration, live Linux collector execution,
production data and independent release/merge approval remain unverified here.

TASK-008 stays on hold. No dependency, security fix, workflow, infrastructure, public contract,
commit, push, merge, deployment or handbook change was made. No remediation approval is requested
because this review identified no concrete fix to apply.
