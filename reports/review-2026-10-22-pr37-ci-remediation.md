# PR #37 bounded CI remediation review

Date: 2026-10-22
Verdict: **Approved for the bounded artifact-format correction.**
Findings: **0 Critical, 0 Important, 0 Minor.**

## Scope

Reviewed the uncommitted correction over HEAD
`e994ae74d4d19d1cd65e43b7733e9daa28d1cf81`: the formatted
`reports/design-prototypes/2026-10-22/task-027-shell/before-metrics.json`, its new exact
`.json.raw` sibling, the public remediation record, and the coordinator's current
`memory/session.md` / TASK-027 authority updates in `tasks/active.md`.
Read the required constitution, project/session context, active task, review prompt, standards,
and relevant PG-10/PG-15 traceability. No handbook content was accessed. This is not a repeat
of the earlier whole-branch product review.

## Evidence and assessment

- The diff changes only two JSON array layouts and the final LF. The raw sibling equals
  `git show HEAD:reports/design-prototypes/2026-10-22/task-027-shell/before-metrics.json`
  byte for byte. Raw and formatted JSON parse to deeply equal values.
- Independently computed raw SHA-256 is
  `c56920af9d1ff915a26c99a6b861e70b9b90eb89a2ce598c2047a05616b1ede7` (508 bytes);
  formatted SHA-256 is
  `e20ce5ea7401bd07d702ea9db9b277d07402266b4ea564efdda468a34a4aecbf` (461 bytes).
- All 152 measured-source hashes match current files. Independently audited the clean
  container's complete 666-file path/size/hash inventory; every entry matches the retained
  post-format snapshot, with no AppleDouble files. Node v24.19.0, npm 11.17.0 and Biome 2.5.9
  were read directly from that runner. The single changed-file Biome check independently
  exits 0.
- Inspected canonical logs and exit files: original `format:check` exits 1 on 299 files
  with precisely the hosted JSON error; corrected `format:check` exits 0 on 299 files;
  canonical lint exits 0 on 301 files with the same five existing informational notices.
  All ten evidence hashes listed in the worker's final report match their files.
  Diagnostic helper failures are explicitly separated from canonical results.
- The public record correctly qualifies inventory equality as applying at staging time.
  Subsequent coordinator Markdown updates are administrative deltas outside Biome's
  formatting scope. Current `git diff --check` exits 0; final public-review/link bookkeeping
  remains the coordinator's delivery responsibility.

| Dimension | Assessment |
|---|---|
| Correctness | Original evidence is retained exactly; measurements and parsed values are preserved. |
| Security/privacy | No executable code, dependencies, permissions, data policy or network behavior changes. |
| Performance | No runtime change; measured-source bindings remain intact. No new performance run is claimed. |
| Maintainability | Minimal formatter-aligned repair and explicit historical-verification limitation. |

The root cause and repair are supported by the diff and the red/green style evidence.
No application suite or performance suite was rerun by this review.

## Remaining integration and acceptance gates

This approval closes only the bounded CI-format review. PG-15/I1 still needs a successful
canonical hosted Verify on the exact pushed head, including its normal full verification and
packaging stages. The failed hosted run reached neither browser checks nor packaging and
cannot resolve the prior strict-default WebKit failure. Required GitHub review and normal
protected-main integration checks also remain pending.

PG-10/I2 actual spoken VoiceOver output remains unverified. The locked-Mac retry record is
an access limitation, not AT evidence. Main merge remains blocked under the existing
acceptance contract until this gate is supported by observation or an explicit applicable
human disposition; a merge request alone does not waive it. TASK-027 remains active and
incomplete. Deployment, source activation, TASK-028 implementation and release acceptance
are outside this approval.
