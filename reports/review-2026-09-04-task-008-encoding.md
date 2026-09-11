<!--
Purpose:        Record independent review of the TASK-008 encoding diagnosis and proposed investigation
Owner:          Reviewer
Update Trigger: When the proposed dependency correction, its verification, or the next observation changes
Harness Version: 1.1
-->

# TASK-008 Encoding Diagnosis Review

Date: 2026-09-04. Verdict: **Approved for investigation.** This review approves neither an
external-dependency addition nor a production correction. Human approval of ADR-016 remains
required before changing `package.json`, the lockfile, or source imports. TASK-008 remains active;
TASK-009 remains inactive.

## Scope and evidence

I reviewed the aggregate live diagnostic, the exhaustive synthetic comparison, the research
proposal, the current native decoder call sites, and the temporary scripts. I did not read or copy
provider rows or byte context, rerun collection, change files outside this review report, or run a
complete observation.

The live diagnostic is bound to archive SHA-256
`9cbe96a9bdadb46b8e0bb8034b6b8b60ea133598f6125ba0cfc954bbc31c898c`: its recorded before and
after hashes match and `archiveHashStable` is true. The 1,390,700-byte target entry has SHA-256
`23ff0cf2b0a4e9c79210bbccd3d94a689a9786e4f360e6b1753f082e99f5077c`. The report records its
16 MiB entry limit, 60-second subprocess cap, and existing collector limits. The research
container has no staged archive; its evidence directory contains aggregate reports only.

The result distinguishes the decoder paths without a source-data fallback:

| Decoder path | Strict outcome | Interpretation |
|---|---|---|
| Native Node 24.19.0 / ICU 78.3 `TextDecoder('euc-kr')` | Rejects for whole input and each tested chunk size | Matches the current parser failure. |
| Pinned `@exodus/bytes@1.15.1` WHATWG decoder | Accepts at all four chunk sizes | Produces one stable decoded UTF-8 SHA-256. |
| GNU iconv EUC-KR | Rejects | Classic EUC-KR repertoire is narrower than the WHATWG contract here. |
| GNU iconv CP949 | Accepts | Produces the same decoded UTF-8 SHA-256 as the WHATWG comparator. |

This supports the stated conclusion: the target file is valid for the committed WHATWG `euc-kr`
contract and the observed `csv_invalid_encoding` is caused by the pinned native Node decoder.
It does not establish that every archive category is valid, that a complete observation will fit its
budget, or any freshness, threshold, baseline, publication, or deployment fact.

## Independent checks

The recorded official index SHA-256 is
`89af20dd867c84cefb710b1790229786cfef2bf11916361a210d81b90381e267`. The official decoder
defines EUC-KR leading bytes from `0x81` through `0xFE`, trailing bytes from `0x41` through
`0xFE`, and lookup through the EUC-KR index. [WHATWG Encoding Standard](https://encoding.spec.whatwg.org/#euc-kr-decoder)

I reran the temporary exhaustive comparison without provider data. On the local Node 22.22.3
runtime, it reproduced 17,048 assigned pairs, 8,824 native mapped and split mismatches, 536 native
acceptances of unassigned pairs, and zero mismatches or unassigned acceptances for the installed
`@exodus/bytes@1.15.1` implementation. The different local Node version is not a substitute for
the live Node 24.19.0 evidence; it independently confirms the deterministic test and comparator
result. The temporary candidate checks also passed 13 decoder assertions and 60 parser/header
assertions. No production source was changed or full project verification claimed.

The upstream Node issue independently lists `euc-kr` among confirmed legacy multi-byte decoder
correctness failures, consistent with the local evidence. [Node issue #61041](https://github.com/nodejs/node/issues/61041)

## Dependency and approval boundary

The proposed exact direct development dependency is a focused correction to the two pipeline
decoder call sites. It preserves `fatal: true`, the contract label, existing bounds, parsing,
and rejection behavior. It is neither a permissive decoding fallback nor a status or source-delivery
change. `@exodus/bytes@1.15.1` is currently only an already-installed, MIT-licensed transitive
development dependency; the current repository has no direct dependency declaration or pipeline
import.

Promoting it to a direct dependency is an external-dependency addition under `AGENTS.md` and
therefore requires the pending explicit human approval. If approved, implementation must add the
regressions before the two imports, run pinned verification, obtain independent review, and repeat
the bounded research observation. No result from this review authorizes a production artifact,
baseline promotion, release, deployment, or TASK-008 completion.

## Findings

No open findings within the diagnosis and proposed investigation scope.

## ADR-016 Implementation Review

Date: 2026-09-04. Verdict: **Approved for the decoder correction and one same-budget research
retry.** This is a separate review of the user-approved ADR-016 implementation. It does not
approve publication, a production artifact, a baseline, a source-cut assertion, deployment,
TASK-008 completion, or TASK-009 activation.

The implementation exactly promotes `@exodus/bytes` at version `1.15.1` to a direct development
dependency in both package manifests and imports its `TextDecoder` in exactly the two approved
pipeline modules: `csv-header.ts` and `stream-csv.ts`. The pinned install remains deduplicated at
that exact version. No client module imports the decoder, and the production client bundle remains
seven modules and 11.55 kB uncompressed. The implementation preserves the contract labels,
fatal mode, BOM behavior, CSV parsing, resource limits, and status handling.

The eight regression cases cover extension Hangul, the Euro mapping, every split point with an
empty chunk, extension-header equality, and strict incomplete, malformed, invalid-byte, and
unassigned-pair rejection. I independently confirmed the relevant native Node 24.19.0 behavior on
synthetic bytes: it silently accepts `8141`, `C9A1`, an incomplete `81`, and `812C`, while it
rejects `A2E6` and `FF`. This supports the recorded seven-test native red run and confirms that
the tests exercise both silent misdecoding and false rejection.

Independent verification under the project-pinned Node 24.19.0 and npm 11.17.0 passed:

- Focused pipeline suites: 30 tests in two files.
- Typecheck and Biome checks for the changed modules/tests and manifests.
- `npm run verify:full`: 433 tests, 91.52% statements, 89.75% branches, 94.77% functions, and
  94.16% lines; four browser smoke tests and two zero-violation accessibility scans passed.
- `git diff --check` passed.

No open implementation findings. The authorized retry must retain the reviewed 100,000-row,
256 MiB source-byte, 65,536-code-point, 600-second, and 3 GiB RSS ceilings. A complete retry
still produces research-only evidence and cannot by itself resolve the outstanding source-cut,
calibration, baseline, publication, or recovery gates.
