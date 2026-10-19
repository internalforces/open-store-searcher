# TASK-009 operational recovery test plan

The approved execution plan is the per-requirement test checklist; each task report must map exact requested behavior to concrete test names, RED/GREEN evidence and final successful commands. Unit/pipeline tests use actual filesystem/codec behavior; HTTP alone is stubbed. No source network, secrets or hosted-success fabrication. Final full checks include existing packaging/browser/a11y/quality gates. Task-specific assertions are reviewed inline; final reviewer checks the accumulated mapping.

## Task 3 sequential RED/GREEN plan
1. Strict active registry/provenance tests: exact keys/versions/IDs/commits/site/repo/policy, positive bindings and canonical public receipt.
2. Release/download tests: exact release/tag/commit and asset IDs/name/state/size; annotated chain/cycle/limit; binary 200/302 allowlist and independent hashes; cleanup/bounds/timeouts.
3. Public reconciliation/precondition tests: complete app/data/baseline bytes, before/after descriptor, <=4 requests, same-origin/no credentials/cache/redirect; absent/corrupt explicit, later/different descriptor blocks, transport uncertainty aborts.
Tests use synthetic identities only; registry stays empty. Run narrow RED/GREEN, baseline integration, one final npm test and owned static checks.

## Task 3 review fix round 1 — I1 plan
Add five HTTP-stub cases for escaped key, escaped value, malformed versions and combined escaped malformed timestamp; assert rejection and exactly one descriptor request before dependencies/coherence/corruption classification. RED current source, then compare parsed decoded timestamp and decode JSON string-token pairs during malformed extraction. Run covering reconciliation + deployed baseline, typecheck and two-file lint/format only; no unchanged whole-suite repeat.

## Task 3 review fix round 2 — I1
Add four literal/escaped broken-prefix-string variants before implementation. RED then independently decode bounded candidate key/value strings from every quote, preserving decoded parsed-field guard; cap candidate key/value representations using collectedAt length 11 and canonical UTC length 24. Verify all Task 3 + baseline and two-file static checks only.

## Task 4 sequential test plan
Write three Node suites first. Guard suite runs CLI through child-only fetch preload for status/hash transition, unsafe args, redirects, over-limit stream and accelerated timeout; workflow suite evaluates actual if expression for event/ref/variable contexts and inspects structural trust gates; adapters suite uses genuine current V2 fixture, actual GNU tar, SSR and actual child CLIs for metadata/proposal/composed active restoration, identity mismatch and cleanup/races. Confirm pinned RED; implement focused adapters/internal support and workflows/config; confirm GREEN with old packaging suite; run relevant pipeline tests, typecheck, owned lint/format and one npm test; preserve exact logs/hash equality and per-behavior evidence. No full verify:full or hosted acceptance claim.

## Task 4 trusted-root RED/GREEN addition
Run absolute current CLI from a malicious cwd containing a fake src/pipeline verifier and vite.config sentinel. RED must demonstrate sentinel execution, then pin helper createServer.root to its repository via import.meta.url and configFile:false. GREEN runs inspect, backup and restore from that cwd against genuine current V2 fixture, asserting successful trusted results and no sentinel. Revalidate current Node tests/static checks and the full test suite after the production fix.
