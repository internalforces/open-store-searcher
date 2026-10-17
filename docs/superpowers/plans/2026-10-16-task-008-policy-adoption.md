# TASK-008 Exact Policy Adoption Implementation Plan

**Goal:** Adopt the three linked October 16 inputs under the user's delegated decision and verify them locally.

**Architecture:** Store complete quality inputs in `publication/validation-config.json`, separately from workflow publication configuration. Use the existing bounded pipeline and retained archive without source changes or a new collection.

**Spec:** `reports/calibration-2026-10-16-approval-packet.md` at `fd6f79f1be1cff31f04ef679394ec7b4b76260ad`, plus the user's current delegation.

## Constraints

- Preserve the complete proposed revision, all 195 category limits, exact 23-ID empty list and October 16 baseline.
- Preserve unrelated work and keep raw archives, datasets and logs local.
- No push, PR, merge, publication, deployment, automation resumption, credential or security-setting change.
- Do not equate collection date with source freshness or a successful replay with an ISS-003 diagnosis.

## Execution

- [x] Locate and inspect the existing checkout, constitution, role prompts and available `.agents/skills`; no relevant repository `.agents` directory exists. The only home skill is frontend-specific and does not apply.
- [x] Check remote heads and recent PR/issues for later decisions. Isolate a local clone on `codex/task-008-policy-adoption-local` from the exact cited commit.
- [x] Extract the nested policy/baseline unchanged; verify canonical SHA-256 values; copy the previously approved reviewed-pair contract.
- [x] Add `.testagent/replay-adopted-policy.mjs` to parse all retained source rows using the existing pipeline and original collection instant, with pre/post archive hashes and no network collection.
- [x] Accept complete bounded staging under the exact JSON ceiling and verify all measured metrics equal the selected baseline.
- [x] Inject an incomplete stream and an existing-output retry; rehash every accepted file and check cleanup. Run the existing failure matrix and full repository checks.
- [x] Obtain independent review, resolve findings, update task/session/decision/traceability records, and report local state.

## Review focus

Exact configuration identity; failure cleanup and immutable prior data; no publication linkage; original collection-date provenance; accurate delegated authority and unresolved limitations.

The user already explicitly authorized implementation and local verification, so no additional plan approval is required. No new product architecture is proposed.
