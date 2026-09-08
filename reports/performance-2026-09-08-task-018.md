<!--
Purpose:        Reproducible TASK-018 performance measurements and release limitations
Owner:          Performance Engineer / Reviewer
Update Trigger: When the measured implementation, workload or environment changes
Harness Version: 1.1
-->

# TASK-018 performance evidence

Status: Bounded measurement complete; lab targets are not met. Full verification passed; independent review Approved for the bounded audit only. Production performance is not verified.

## Environment and method

Use the existing pinned runtime: `PATH=/tmp/open-store-task013-runtime:$PATH`, Node
24.19.0 / npm 11.17.0. Run `npm run performance -- --check` for an explicit lab-target gate,
or `node scripts/measure-performance.mjs` to collect a diagnostic report even when targets
are exceeded. JSON goes to stdout; progress/errors go to stderr. Exit 0 means the diagnostic
completed, not that budgets passed. `--check` returns 1 for an exceeded or unavailable
lab target, and operational/invalid-evidence errors return 2.

The driver builds the real application under the Pages subpath and a separate benchmark
entry into owned temporary directories. The test-only entry imports the real App, preparation
and search engine; it is never included in the normal build. No production instrumentation,
new dependencies, network service or user-input collection was added.

The driver asserts identical source/config/tool hashes before and after measurement.
All runs are sequential, in fresh pages, using desktop Chromium and Pixel 5 viewport/device
emulation with a fourfold host-relative CPU slowdown. Both profiles use 150 ms emulated
latency, 200,000 download bytes/s and 93,750 upload bytes/s. Assets are uncompressed. Startup
uses five cold/warm pairs per profile, with cold browser cache explicitly cleared and warm
navigation in the same page. Local responses use max-age=3600; resource timing records
are retained so cache behavior can be inspected rather than inferred from the label.

Primary readiness requires a laid-out heading/input and an enabled submit button plus two
animation frames. The input alone remains editable during loading and is not a ready signal. LCP uses the latest buffered entry after readiness and a fixed additional 1,000 ms
without interaction. This is a finite local observation window, not field LCP. CDP emulation
parameters are explicit and do not establish equivalence to a physical mobile CPU.
References: [Chrome CPU emulation](https://chromedevtools.github.io/devtools-protocol/tot/Emulation/#method-setCPUThrottlingRate),
[Chrome network emulation](https://chromedevtools.github.io/devtools-protocol/tot/Network/#method-emulateNetworkConditions),
[LCP observation behavior](https://web.dev/articles/lcp).

Loaded-data submission timing begins immediately before the real form's requestSubmit and
ends after the actual submitted-query text, candidate count and nonzero results layout are
verified following two animation frames. This includes search, Preact update and a paint
opportunity. It excludes typing, transport, pre-dispatch scheduling delay and pixel presentation.
Results must not be described as physical-device interaction latency or INP.

Five fresh-page samples per scale/profile preserve every observation. Nearest-rank median,
p95 and maximum are reported; no outliers or first runs are dropped. The conservative local
budget verdict requires every observed sample to meet the inclusive PRD target. Raw PRD
14.2 is authoritative for <=300 KB, <=2.5 s and <=500 ms; KB is operationalized as decimal
300,000 bytes. Existing prompts using “below” are not used to reject the exact PRD boundary.

## Synthetic data and resource bounds

The fixtures contain 1,000, 10,000 and 50,000 invented records in one Seoul district, across
100 invented road names. One percent share a name; building numbers and IDs are distinct.
The full serialized display dataset's UTF-8 bytes and SHA-256 are recorded. This is a stress
fixture, not an estimate of Seoul's production distribution or final JSON schema.

Generation, JSON parsing, diagnostic preparation/index construction, search-only calculations
and App mounting are measured separately. Diagnostic preparation/search precedes real App
mounting and may warm code caches; it never replaces the App's own preparation path.
The exact and address queries retain every same-district record as a candidate under the
current accepted engine behavior. Rendering more than 1,000 cards is skipped as an explicit
resource bound: search-only diagnostics remain, but the end-to-end measurement is unavailable
and cannot pass. No candidate is silently truncated in the product or measured submission.

## Measurements

Raw evidence: [performance JSON](performance-2026-09-08-task-018.json).

Final run: `node scripts/measure-performance.mjs --check` returned **1**, correctly detecting
exceeded and unavailable lab targets. `labTargetsMet` and `productionVerified` are both
**false**. Source/config/tool manifests matched before and after measurement.

Host: Apple M3 / Chromium 151.0.7922.34. The production bundle totals
**47,806 bytes** before compression (HTML + CSS + JS), below the 300,000-byte target.

| Profile | Cache | Primary median / max (ms) | LCP median / max (ms) | Target |
|---|---|---:|---:|---|
| desktop | cold | 634.2 / 639.5 | 608.0 / 616.0 | Pass <=2,500 ms |
| desktop | warm | 41.8 / 43.0 | 16.0 / 20.0 | Pass <=2,500 ms |
| mobile-lab | cold | 693.0 / 701.2 | 660.0 / 668.0 | Pass <=2,500 ms |
| mobile-lab | warm | 65.3 / 74.5 | 44.0 / 44.0 | Pass <=2,500 ms |

| Profile | Records | Exact max (ms) | Common-name max (ms) | Address max (ms) | No-match max (ms) |
|---|---:|---:|---:|---:|---:|
| desktop | 1,000 | 372.2 | 30.5 | 313.2 | 34.7 |
| desktop | 10,000 | Unavailable (card cap) | 87.5 | Unavailable (card cap) | 49.1 |
| desktop | 50,000 | Unavailable (card cap) | 623.4 **exceeded** | Unavailable (card cap) | 369.1 |
| mobile-lab | 1,000 | 1433.9 **exceeded** | 130.2 | 1478.4 **exceeded** | 119.7 |
| mobile-lab | 10,000 | Unavailable (card cap) | 364.9 | Unavailable (card cap) | 227.0 |
| mobile-lab | 50,000 | Unavailable (card cap) | 2488.4 **exceeded** | Unavailable (card cap) | 1535.5 **exceeded** |

The search table shows maximum submission-to-paint-opportunity time; the target is <=500 ms.
JSON retains all five raw samples and nearest-rank median/p95/max for every measured cell.
A missing cell is not zero and does not pass. At five samples, nearest-rank p95 equals max.

| Records | Synthetic JSON bytes | Mobile preparation max (ms) | Mobile search-only max (ms) |
|---:|---:|---:|---:|
| 1,000 | 671,821 | 54.4 | 24.5 |
| 10,000 | 6,745,832 | 415.9 | 234.8 |
| 50,000 | 33,861,032 | 2105.3 | 1817.6 |

At 50,000 records, the invented serialized display fixture is 33.86 MB. At the configured
200,000 bytes/s, payload-only uncompressed transfer would take approximately 169 seconds
before latency/parsing/indexing. This arithmetic illustrates why code-size success cannot
certify data delivery; it is not measured production transfer or a final-schema size estimate.
No initial JSON request exists in the current production build; its tiny demo is bundled.

The 1,000-row mobile address query spends at most 18.4 ms in diagnostic search but 1,478.4 ms
in real submission/display. That isolates substantial rendering/layout cost. At 50,000 rows,
diagnostic exact search alone reaches 1,817.6 ms; reducing DOM work alone cannot resolve all
large-index latency. No match-quality or evidence behavior was changed to improve these numbers.

## Bottleneck, recommendations and trade-offs

The engine scans every loaded record. District relevance preserves conflicting or weak
address candidates; the UI currently renders every similar candidate as a full evidence card.
This confirms two separate scale risks: search CPU grows with the index, and DOM/layout work
grows with the candidate count. Any later optimization must preserve candidate availability,
raw evidence, status uncertainty, search quality and keyboard/screen-reader access.

District partitioning alone does not bound a dense district or same-name result list. Before
production publication, use the accepted final JSON and real distribution to compare district
and category sizes, startup requests and loading cost. Name-only searches must retain the
ability to search all relevant partitions. No new public partition URL, filter, byte budget,
status mapping or delivery contract is authorized or implemented here.

## Test requirements and evidence

| Requirement | Exact evidence |
|---|---|
| Inclusive code/display/search targets | `accepts the exact inclusive target %i` |
| Missing measurements never pass | `does not turn absent measurements into a pass` |
| Complete finite sample summaries | `keeps nearest-rank percentiles and the slowest sample without mutating input`; `rejects unusable samples $samples` |
| Actual UTF-8 data size | `counts UTF-8 bytes rather than characters` |
| Bounded deterministic fixtures | `rejects unsupported scale %s`; `generates deterministic unique identities with explicit synthetic provenance` |
| Real search outcomes including uncertainty and absence | `exercises exact, common-name, address and absent outcomes through real search` |
| Browser/display timing integrity | Built-page driver assertions require ready content/LCP, updated query, expected actual candidate counts, layout, deterministic fixture hashes and no browser/resource errors |

Initial helper stubs produced eight expected failing assertions before implementation. The
first browser attempt caught an incorrect fixture assumption (same-district candidates were
omitted from expected counts) and exited 2 without producing a report. Strengthened candidate
count assertions reproduced the discrepancy. The final workload preserves the broad relevance
behavior and records the rendering resource limit explicitly.

## Remaining limitations

TASK-008 remains explicitly on hold. Production source-cut, final public JSON, calibrated
publication and actual Pages/cache evidence remain unavailable. No physical mobile device,
field percentiles, production distribution or release signoff is claimed. No handbook was
read or changed. Final review and verification are recorded below when complete.


## Follow-up ownership and release impact

The approved task is a bounded budget audit; an exceeded target is a finding, not a passing
performance gate. The historical TASK-014 note assigning full-data rendering/performance to
TASK-018 remains unresolved as a product concern. Record it in memory/known-issues.md and
carry it into TASK-021 release verification. Owner: Performance Engineer / Implementer, with
Reviewer acceptance of any subsequent remediation.

A future approved remediation should (1) bound initial candidate DOM work while retaining
access to every candidate and accessible list/focus semantics, (2) profile and reduce
search-only CPU without changing score/conflict/uncertainty outcomes, and (3) assess real
partition sizes and complete-search behavior once a public dataset contract exists.
Potential pagination changes the product interaction and needs a concrete approved design;
partition URLs/delivery changes retain the constitution's separate approval gate. No such
change is silently introduced by this audit. No next task is activated.


## Verification

- Pinned `npm run verify:full`: exit 0; 580 Vitest tests, 56 cross-browser checks,
  18 accessibility tests / 22 axe scans with zero violations.
- Global coverage: 92.99% statements, 92.41% branches, 96.68% functions, 95.25% lines.
- Focused `npm run test:unit -- tests/performance/metrics.test.ts`: exit 0, 16 tests.
- Search quality checks (part of verify:full): existing synthetic/source criteria pass.
- `node scripts/measure-performance.mjs --check`: exit 1 with complete valid JSON;
  correctly detects measured misses and resource-capped unavailable cells.
- `node scripts/measure-performance.mjs --invalid`: exit 2 with usage error before build.
- `git diff --check`: exit 0.

The driver was measured without simultaneous builds/tests. Full verification ran only after
performance measurement ended. No product source changed, and no manual AT rerun is claimed.
Existing Playwright color-environment warnings were non-fatal. Raw full-check log is retained
locally at `/tmp/open-store-task018-verify.log`; the report and JSON are portable evidence.


## Closure

TASK-018 is complete as the approved bounded measurement/audit. Independent Reviewer Approved
in [the review report](review-2026-09-08-task-018.md), reran 16 tests and recomputed 80 metric
groups while verifying all 82 source hashes. Current measured hashes still match; all owned
temporary measurement directories were removed. No performance target waiver, production
signoff, milestone closure, next-task activation, commit or deployment is implied. The
performance failures and unavailable evidence above remain open product/release concerns.
