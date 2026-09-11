<!--
Purpose:        Bind the TASK-008 encoding root cause and proposed correction to measured evidence
Owner:          Debugger / Researcher
Update Trigger: When decoder approval, complete observation, or source evidence changes
Harness Version: 1.1
-->

# TASK-008 Encoding Root Cause and Correction Proposal

Date: 2026-09-04. FR-08/13/14. Branch: `codex/task-008-continuation`, starting at
`7c05b820f877e17a47d19f29169cf0d7c4aca359`. TASK-008 remains the sole active task.

## Conclusion

The observed `csv_invalid_encoding` is a processing/runtime decoder mismatch, not malformed
bytes under the WHATWG EUC-KR contract. The complete category `15045028` file
(`건강_안경업.csv`) is valid Windows-949/WHATWG EUC-KR. Native Node 24.19.0/ICU 78.3 rejects
it, both whole-buffer and streamed. The GNU strict EUC-KR codec also rejects it, while GNU
CP949 and the specification-conforming comparator accept all bytes and produce identical UTF-8
hashes. This distinction matters: classic EUC-KR and WHATWG's encoding named `euc-kr` are not
identical repertoires. No evidence supports changing this file to UTF-8, replacing characters,
skipping rows, or changing source delivery or status mapping.

This proves the cause for the investigated file only. It does not prove validity of every other
category, completed CSV ingestion, shared source coverage, production thresholds, or a baseline.

## Live evidence

The existing Ubuntu 24.04 research container was restarted. Node 24.19.0/npm 11.17.0 and the
existing compatible Info-ZIP collector were retained. GNU iconv is the existing Ubuntu GLIBC
2.39-0ubuntu8.8 tool; no package or service was installed. The diagnostic used the unchanged
collector and its normal gates, with a 16 MiB target-entry cap and 60-second subprocess caps.
Independent review approved the diagnostic after explicit before/after hash and limit fields and
the specification comparator were added. The source archive was deleted before report output;
`/work/staging` was inspected empty after success. No provider rows or byte context were printed
or copied into the repository.

Machine evidence: `reports/encoding-2026-09-04-task-008.json`.

| Measurement | Result |
|---|---|
| Archive SHA-256, before and after | `9cbe96a9bdadb46b8e0bb8034b6b8b60ea133598f6125ba0cfc954bbc31c898c` |
| Archive bytes | 216,180,315 |
| Entry SHA-256 | `23ff0cf2b0a4e9c79210bbccd3d94a689a9786e4f360e6b1753f082e99f5077c` |
| Complete entry bytes | 1,390,700 |
| Native fatal EUC-KR, whole / 65,536 / 4,096 / 1-byte chunks | All rejected |
| Native first failing byte-feed offset | 155,177, zero-based; this is the triggering byte, not necessarily the start of its sequence |
| Pinned `@exodus/bytes@1.15.1`, same four granularities | All accepted |
| GNU iconv strict EUC-KR / CP949 | Rejected / accepted |
| Every successful comparator's decoded UTF-8 SHA-256 | `5b2eb3ffc4cad41d44d334fbaf9ad4a040bed028a34c691dd56eab181f6bce8a` |
| Unchanged application CSV parser | `csv_invalid_encoding` |

The archive hash matches the earlier two failed attempts. This is still one source snapshot,
not another independent calibration observation. A whole-buffer failure rules out a streaming
chunk-boundary defect as the cause of this rejection. The four matching successful decoded
hashes and the independent CP949 result establish lossless, chunk-independent interpretation.

## Synthetic specification comparison

The official [WHATWG index](https://encoding.spec.whatwg.org/index-euc-kr.txt), dated 2024-09-18,
has SHA-256 `89af20dd867c84cefb710b1790229786cfef2bf11916361a210d81b90381e267` and 17,048
assigned pairs. The [decoder algorithm](https://encoding.spec.whatwg.org/#euc-kr-decoder)
defines pair lookup and fatal errors. Synthetic exhaustive comparison checks all lead bytes
0x81–0xFE and trail bytes 0x41–0xFE, including unassigned pointers, plus splitting every assigned
pair between its two bytes. No source-business bytes are used in this comparison.

| Implementation on pinned Node | Assigned-pair mismatches | Split assigned-pair mismatches | Unassigned pairs accepted |
|---|---:|---:|---:|
| Native `TextDecoder` | 8,824 | 8,824 | 536 |
| Installed `@exodus/bytes@1.15.1` | 0 | 0 | 0 |

Machine evidence: `reports/encoding-2026-09-04-task-008-standard.json`. The native decoder
can also return wrong text without throwing: synthetic `[0x81, 0x41]` becomes U+0081 U+0041
instead of the standard U+AC02. `fatal:true` alone therefore cannot prove correct decoding.
[Node issue #61041](https://github.com/nodejs/node/issues/61041) independently identifies EUC-KR
among its confirmed decoder correctness issues; the local measurements establish applicability
to this project's pinned runtime.

Temporary copies of `stream-csv.ts` and `csv-header.ts` with only the comparator import
substituted passed 60 assertions: base Hangul, extension Hangul, euro, every chunk split with
empty chunks, exact headers, incomplete lead, malformed trail, invalid byte and unassigned pair.
An additional decoder-only check passed 13 assertions. These are candidate experiments, not a
claim that production code was fixed or that the project's full verification was rerun.

Reproduction scripts remain outside the repository in `/tmp/oss-task008-encoding/`:
`diagnose.mjs`, `compare-standard.mjs`, `candidate-check.mjs`, and `parser-candidate-check.mjs`.
The live script was copied to `/work/diagnose.mjs` in the research container and invoked with
`docker exec -w /work/repository open-store-searcher-task008-research node --max-old-space-size=2048 /work/diagnose.mjs`.
The synthetic scripts use the pinned Mac Node path recorded in the previous observation report.

## Correction: ADR-016 accepted after this investigation

Promote the already-installed, lockfile-pinned, MIT-licensed `@exodus/bytes@1.15.1` from a
transitive development dependency to an exact direct development dependency. Use its
`@exodus/bytes/encoding.js` `TextDecoder` export explicitly in both CSV decoding modules.
Do not modify globals or depend on accidental transitive installation. Keep `fatal:true`,
existing BOM behavior, all byte/row/time bounds, schema comparison, and rejection behavior.
The dependency is used during build-time collection, not required by browser search code.
Its package includes TypeScript declarations and supports Node 24.

The proposed source correction is only the following import in each of
`src/pipeline/csv-header.ts` and `src/pipeline/stream-csv.ts`:

```ts
import { TextDecoder } from '@exodus/bytes/encoding.js';
```

The source contract remains named WHATWG `euc-kr`, consistent with Node's documented API
contract and its Windows-949 alias. This is a decoder correction, not an automatic encoding
fallback or a change to status rules. The alternative is maintaining a separately audited
standard mapping implementation or moving to another verified runtime; both are broader changes.

The user subsequently explicitly approved ADR-016. Integrated changes and verification are in
`reports/test-2026-09-04-task-008-encoding.md`. The paragraphs below preserve the proposal boundary
at the time of the diagnostic; they are not a renewed approval request.

`AGENTS.md` requires human approval for external dependency additions. The installed transitive
package was used only as a temporary research comparator; neither `package.json`, the lockfile,
nor production source was changed. Approval of ADR-016 should authorize the exact direct
promotion, the two imports, synthetic regression tests, pinned verification, independent review,
and a bounded research retry under the existing observation ceilings. It must not imply acceptance
of unsupported freshness or calibration facts.

## Remaining evidence and next sequence

1. Approve the concrete dependency promotion; add failing regression cases for correct extension
   decoding and strict invalid-input rejection, then implement and verify the two decoder imports.
2. Repeat observation under the existing reviewed 100,000-row / 256 MiB / 3 GiB RSS / 600-second
   caps. A resource stop is an incomplete observation. Any larger experiment needs measured
   capacity assessment and independent review; never silently raise caps to claim success.
3. Obtain complete comparable snapshots over a stated interval. Measure actual output bytes only
   against a reviewed candidate serialization; neither archive size nor synthetic JSON is a
   production data-size budget. Review total/category count changes, missing rates, status drift,
   empty categories and bootstrap metrics before creating a production policy.
4. Resolve shared coverage evidence independently. The official
   [eyeglass dataset](https://www.data.go.kr/data/15045028/fileData.do) was fetched directly again;
   it states daily D-2 coverage and unrestricted permission. The general-restaurant file-info page
   was fetched with the documented headers. Neither inspected page supplies an archive-hash-bound
   common source cut and timezone for all 195 categories. The metadata date and latest row date
   must not be substituted. No provider message has been sent.
5. Close TASK-008 only after those gates and review pass; then activate the requested TASK-009
   atomic artifact/baseline publication and previous-good preservation. No TASK-009 implementation,
   workflow edit, publication, release, or deployment has occurred in this investigation.
