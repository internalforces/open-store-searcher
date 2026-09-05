<!--
Purpose:        Bind the isolated TASK-011/012 PR to its actual baseline and validation
Owner:          Release Manager
Update Trigger: PR delivery contents or verification change
Harness Version: 1.1
-->

# TASK-012 PR delivery — 2026-09-05

The user authorized commit, push and PR creation. Delivery branch:
`codex/task-012-candidate-search`, based on `origin/main` at `095683a`.

## Scope

The PR contains the reviewed TASK-012 browser candidate engine and the uncommitted TASK-011
normalization prerequisite it imports. Search implementation and test files are byte-identical
to the independently approved integration worktree. Search-only harness records and both tasks'
review/test reports are included. TASK-008 continuation code, decoder dependency promotion,
source observation/research reports, status/data contracts and infrastructure are excluded.
The original checkout and its unrelated uncommitted work remain intact.

Imported TASK-011/012 reports preserve historical integration evidence (557/581 tests).
Those totals do not describe this isolated baseline. The imported TASK-012 package.json digest
also describes the original integration worktree, which included a TASK-008 dependency change.
The separate package digest below binds this PR, whose only package changes are browser test
command additions. The lockfile and dependency declarations are identical to origin/main.

## Verification on the actual PR contents

- Pinned Node.js 24.19.0 / npm 11.17.0.
- `npm ci --ignore-scripts` succeeded against the unchanged lockfile.
- `npm run verify:full` exited 0: lint, formatting, typecheck, coverage, build,
  **399 tests across 19 files**, **8 browser tests**, and **2 accessibility scans**.
- No tests skipped or failed. Four browser projects execute the real search engine with
  self-tested network/storage/logging sentinels; the other four check the Pages-subpath shell.
- Global coverage: statements 91.96%, branches 91.04%, functions 95.91%, lines 94.51%.
- Search coverage: statements 97.75%, branches 96.09%, functions 100%, lines 98.91%.
- All copied search source/tests and browser test bytes match the reviewed original files.
- `git diff --check` passed; no pipeline, shared freshness, dependency, lockfile, workflow,
  constitution, or handbook change is included.

This is PR delivery, not a merge or deployment. TASK-013 realistic recall and TASK-014/015 UI
remain pending. TASK-008 remains deferred and incomplete; no milestone is closed by this PR.

## Delivery hashes

| File | SHA-256 |
|---|---|
| `src/search/interpret-search-query.ts` | `522e3d41db40ff6cbe9ae27aeaf6f144d0ecc540f3250b7c0cf61d629aa64ab5` |
| `src/search/search-candidates.test.ts` | `afeb9a6f7d01114805eed5353a49a494b9f2f3d32400e00af0c70949c5c2a934` |
| `src/search/search-candidates.ts` | `0667fbc5642fff12c6427d538223674037b88e6ec22b2b2d74ae2ac84ae46f9e` |
| `src/search/prepare-search-query.test.ts` | `3486479f9a73c08d008b9cfcd5c6f7f9067fcfc5880609adad7b4927b784bf61` |
| `src/search/compare-search-address.test.ts` | `046f510cf600685296e18f19f3dc732cefed03b05c18a16ab9440f73c77636e3` |
| `src/search/compare-search-address.ts` | `4927eabe28b10f710483317227f1b6c916b55b4daa005033e4d2208b311525b3` |
| `src/search/prepare-search-query.ts` | `279c78dfbdd111e90dd6a4e1378277435b2deb3a05c0d0493e3bbc6346df2dae` |
| `tests/e2e/search.spec.ts` | `e9a86e31f515d51f5f88b48d3cbffb83244f1b77ccaf9429b4f1cbede3556bc1` |
| `package.json` | `5a9edd3cd62e7dd66470b67e1d9c57c4d816a3a33e2f08a7579a849457e203d4` |
