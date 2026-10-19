# TASK-009 operational recovery verification — 2026-10-19

Current local verification: **PASS**. TASK-009 remains active; TASK-010 stays paused.
Task5 scoped Spec/Quality review is **Approved**. Initial whole-branch review was
**Request Changes** (I1/M1/M2/M3); final scoped re-review is **Approved**, all four findings
addressed and zero new breakage. FR-13, supporting FR-02/08/12/14;
hosted AC-009-4/5 remain open. No commit, push, PR, merge or remote mutation occurred.

## Current checks

Executed in existing pinned Ubuntu24.04 ARM64 container, Node24.19.0/npm11.17.0,
source `/work/task009-operational-recovery-20261019`. `PATH` selects the pinned Node;
`NODE_OPTIONS=--max-old-space-size=6144` matches the existing workflow allowance.
No installs, concurrency/threshold/flaky changes, new source collection or policy changes.
Heavy proof and full-suite jobs ran sequentially.

| Check | Result |
| --- | --- |
| Exact `npm run verify:full` | Exit0;52 files/1125 Vitest tests;68 browser tests across Chromium/Firefox/WebKit/mobile Chromium;20 accessibility tests. |
| Coverage | 92.99% statements /91.42% branches /95.27% functions /94.79% lines. |
| Explicit four-file Node command | Exit0;45 passed,0 failed,0 skipped, including actual GNU tar workflow packaging and composed operator CLIs. |
| Full configuration | Entire production config equals approved proposal.configuration; policy/baseline/reviewedUnverifiedPairs unchanged. |
| Current host/runtime fingerprints | All188 product/test/tooling/config/workflow files equal; extends historical155-file map with actual current paths. |
| YAML syntax | Ruby/Psych parses refresh/restore/verify; independent Task4 Actions/security Approved with zero findings. Static evidence only. |
| New/changed local Markdown targets / record format+lint / whitespace | Exit0;16 Markdown files,0 local target issues; no handbook targets/content accessed. |
| Original preservation | Original checkout HEAD/all73 original files and11 immutable prior-work files equal their receipts. |

Exact four-file command:

```text
node --test scripts/check-pages-artifact.test.mjs scripts/check-publication-state.test.mjs scripts/check-publication-workflows.test.mjs scripts/publication-operators.test.mjs
```

Full lint retains exactly five existing informational `useTemplate` diagnostics: three in
`.testagent/static-delivery-research/{browser-profile,full-search-parity}.mjs` and two in
`scripts/sample-search-source.mjs` (lines253 and301). No helper was changed;
the required lint/format/types/coverage/build/quality/browser/accessibility chain exits0.
Synthetic quality stays28/30, source98/100, with zero safety failures; those snapshot-scoped
corpora do not resolve current-source production acceptance or performance gates.

## Real complete-package proof

The preserved successful private attempt `/work/task009-recovery-proof-fix1-20261019-D0EyJy`
uses only current trusted modules, with original retained site/tar/inventory read-only.
All730 files /691,233,947 site bytes match the full pre-existing path/length/SHA map.
V2 semantics passed in that original proof; compressed original tar restores to the exact full map and semantic
identity; restored raw tar length/SHA equals the original. It never executes archived code.

| Binding | Bytes | SHA-256 |
| --- | ---: | --- |
| Original and restored tar | 691804160 | `a171ea86858cbed0455b999579bd6d22d5ac97986728dad2df4f7475136cde7e` |
| Actual new gzip | 199765282 | `33921c7258286b63bf8d3323fef28708a3b1313e1514df22d5d1a2e7f9af9378` |
| Canonical complete inventory | See verification receipt/full private inventory | `1a539f01a9ba2b5111334c8dc9baa4c1fdf72ae81f21289fd190114019f5ddb5` |

Current gzip differs from the earlier207,515,860-byte compression; no old gzip identity is
required or substituted. Original raw tar and all original inputs remain preserved. Collection
is still `2026-10-16T01:52:52.043Z`, source coverage null, record count2,951,024. No public receipt,
successful deployment provenance, Release asset or registry authority was fabricated.

A full-sized copied tar with one payload byte flipped rejects `Tar file hash mismatch` with no
output. A tar ceiling one byte below the actual binding rejects before extraction. A1KiB gzip
output ceiling rejects while streaming and removes owned scratch. Existing-output sentinel
survives refusal. Every failed requested output is absent, no owned scratch remains, and the
successful restored site was fully verified before the rejection injections. After the
injections, the original full site and both original/restored raw tars were rechecked. No
post-injection whole-restored-site scan was performed; the receipt field
`originalInputsAndSuccessfulOutputPreserved` must be read within this exact scope.
These lower limits only test rejection; production limits are unchanged.

## Integration finding and correction

The first actual package proof rejected the valid producer descriptor's existing `warnings`
field because the new verifier's exact-key allowlist omitted it. No input/output was modified.
The Task1 owner added strict bounded existing-warning admission,24 net suite tests and the genuine warning
in the shared fixture. Independent spec/quality correction review is Approved with zero findings.
The initial failed proof and pre-fix1092/68/20 full run remain preserved; they are historical,
not current acceptance. The preserved successful real proof supersedes the failed proof;
the fresh full counts above supersede both historical1092 and1116 full-suite runs.

## UTF-8 guard correction and current proof scope

I1 reproduced eight literal/escaped key/value cases with unrelated invalid UTF-8 before/after
the visible later timestamp. They resolved as recoverable corruption before the fix (RED8
failed/35 passed). Fatal UTF-8 decoding still exclusively supplies coherent semantic JSON; a
replacement-decoded, bounded evidence scan now conservatively rejects later dates even when
other bytes cannot decode. All eight cases reject after exactly one descriptor request, with
no dependency fetch or corruption result. A ninth control keeps stable invalid UTF-8 without
later evidence as corrupt after two descriptor reads. Focused GREEN43/43; original malformed-
prefix/escaped guards remain covered. An initial green attempt used a control date later than
the synthetic approval; its retained log records the failure, then the control was corrected
to the actual approved date before the successful run.

Only `reconcile-publication.ts` and its test changed in the188-file runtime map. All186 other
fingerprints, including the inventory/archive/V2 verification modules used by the730-file
proof, remain identical to the original successful proof binding. The original helper, proof
receipt and15 hash-bound logs are immutable. No heavy proof rerun was necessary; the retained
proof does not exercise the changed public descriptor guard. Fresh full/Node checks and current
fingerprints bind the corrected source independently. Final scoped review is Approved; all four findings are addressed with zero new breakage.

## Logs and file bindings

Private log paths below are relative to
`.superpowers/sdd/2026-10-19-task-009-operational-recovery/`; they contain no source rows.
The `whole-fix-*` entries bind current checks; the15 `task-5-*` entries remain immutable
historical evidence. Current file map and preservation results are in the
[verification receipt](verification-2026-10-19-task-009-operational-recovery.json).

| Evidence | Bytes | SHA-256 |
| --- | ---: | --- |
| `whole-fix-red.log` | 18906 | `e8a30a8d8744b02843559524e165ad8a42a9ac135c6d8616fb48f8b4585531d4` |
| `whole-fix-green-initial.log` | 8569 | `02f1535a3951e2a1a23897155d5546cc1dad331919b8358a4e0ff26749720153` |
| `whole-fix-green.log` | 630 | `0eca1392b39271166097bd5a60b45d074b33071839890c0a02d4ed02cf6e41ed` |
| `whole-fix-format-write.log` | 40 | `34b9af3407d56e7910ae381630b8f16406869612e18f85eab4cfc50474eeeb36` |
| `whole-fix-verify-full.log` | 206529 | `ce365952b8c01f5c70ce49cbca99d1afcc6e88eeab69074298397aa8524dd81f` |
| `whole-fix-node.log` | 4795 | `f40949616d731926cc9cb5e383b0f417d8a626ddaedc3afbdac3b221b4cf8e0b` |
| `whole-fix-source-lint.log` | 42 | `cfc44eee29bc0c3e74191c4443141ef74fcc5cdf5d6335942c98d2d05ab84aa1` |
| `whole-fix-source-format.log` | 42 | `1d8961d250c4f27d6ab333755021aa5c213b35a554b6b28b863a341ec48a6684` |
| `whole-fix-typecheck.log` | 59 | `91ed2156c2998c02867fe0cfc0a211f3947d7220b139d6f84ae1045d1774856f` |
| `whole-fix-yaml.log` | 89 | `6a083a9ef9212df7305fc15e389d90e23ff4e2aa77f6a897481c0f91d895e5d0` |
| `whole-fix-evidence.log` | 141 | `7b73dfa1e1ead5ecf2712316325c02c68d463755b95a67024bc7f75645b502e7` |
| `whole-fix-preservation.json` | 4899 | `365c3a8dcfc0d680a9c2d75f47606599b1e2b7b49b4a158d4fcce05c39a63e11` |
| `whole-fix-fingerprints.json` | 20629 | `59cc7e2624fee7e8d4e3076b9baf665d6da1ff9282e6428323efdd60b9cf1ff5` |
| `task-5-verify-full-final.log` | 206529 | `7e134d88d8a7222222b4233cdc1bffeccf547d0bb48083a3edb696571b3e3ae7` |
| `task-5-node-final.log` | 4786 | `7a1a66ad3b94b0574820b048faeafef1c191ed57182b3151741dc186ab7847b6` |
| `task-5-proof-fix1.log` | 2746 | `7ac14fde61d47ddf410b9329ee5f312ce4dd52d9bedb4a0ebdfd54e1b094753f` |
| `task-5-proof-fix1.json` | 2145 | `72eca7483046fed08c68025d956099bc2efa9eb84a309968f10d1cda83642a80` |
| `task-5-evidence.log` | 141 | `7b73dfa1e1ead5ecf2712316325c02c68d463755b95a67024bc7f75645b502e7` |
| `task-5-preservation.json` | 4899 | `0f4276be5d3c7f04e131968834fc215945c1405af022faf4e384c4ee72d6f174` |
| `task-5-yaml.log` | 89 | `6a083a9ef9212df7305fc15e389d90e23ff4e2aa77f6a897481c0f91d895e5d0` |
| `task-5-remote-readback.json` | 983 | `a63b3b8ef2ad08497ebc9e18b40df13f42b30d31164ca3b7f4834a6b4734d55f` |
| `task-5-proof.log` | 1654 | `6c105d9e6264cb024476cca11fb22e211b1364f2f2a0ed3cd71fd0ac590ab849` |
| `task-5-verify-full.log` | 206531 | `6d89782037b02dfd1ad320cf0595a27b254dffd25b0457f590492f178445fc85` |
| `task-5-markdown-check.log` | 102 | `5733313055730e0c93b7b7312d9e035d0ce1875ef326078d6df146db6e365314` |
| `task-5-markdown-check.json` | 102 | `5733313055730e0c93b7b7312d9e035d0ce1875ef326078d6df146db6e365314` |
| `task-5-record-format.log` | 41 | `9db65e5b8464d24822105a525af2b621ca9d3a5e56b109b66ca01893241df743` |
| `task-5-record-lint.log` | 41 | `9db65e5b8464d24822105a525af2b621ca9d3a5e56b109b66ca01893241df743` |
| `task-5-diff-check.log` | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |

## Remaining gates

Preserved dated read-only main/Pages/flag API observation at `2026-10-19T09:36:15.588123+00:00` records unchanged
main9569ffb and404 for Pages/both enable variables. Earlier dated receipts record zero releases/
artifacts, strict verification/admin enforcement and main-only protected reviewer/no bypass;
the direct public probe was404. Tool/Python transport failures are uncertain and never evidence
of absence. Every setting/public-state check must be repeated before an authorized operation.

The production registry stays empty and refuses recovery. October19 strict validation rejected
195 categories/2,952,086 rows; retained October16 proof is not an approved initial candidate or
hosted last-known-good backup. Source/candidate decision, full-data physical/mobile/hosted
performance, applicable release prerequisites, exact protected-main CI and code delivery remain
separate. No actual Pages success/failure/uncertainty, durable upload/redownload/registry adoption,
original-artifact-expired hosted recovery, full public equality or30-day reliability is claimed.
Obtain separate concrete approvals for setup, one-time dispatch, each pending environment job/
candidate deployment, tag/Release/assets, registry delivery and recurring operation. Follow the
[runbook](../docs/deployment.md) and [exact operator/registry contract](../publication/README.md).
