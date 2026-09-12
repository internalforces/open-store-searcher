# TASK-008 full-source observation and bounded processing

Status: complete local source processing verified; production policy/browser/publication blocked.
Requirements: FR-08, FR-13, FR-14 and the existing performance/data-quality NFRs.

## Successful approved-runner parser inventory

[Ubuntu observation run 34692888618, attempt 3](https://github.com/internalforces/open-store-searcher/actions/runs/34692888618)
succeeded at `c3c474a7f148489b45473ee248cd17f9cae45d41`. All 195 categories completed: 2,939,947 rows,
894,143,343 uncompressed CSV bytes, 216,440,796 archive bytes and zero parser errors. Elapsed
observation time was 68,601 ms; peak Node RSS was 5,063,428 KiB. The original emitted report
SHA-256 was `078a85b215ef492c3440e47c9970c4973ff9075938969e803f799276a026d6d5`.
The checked-in inventory is formatted JSON with the same report values, not the original bytes.
Source/archive SHA-256: `e2eeb1a868a2bfb94dbc9d193dae74707c0e27e38230376d5ad105e174a69faa`.
This is one successful observation after connection failures, not daily reliability evidence.

## Memory implementation and actual-source result

The strict CSV iterator retains bounded member bytes/text and yields source rows. Staging keeps
1,000-row transformation/display batches, spills global identity and normalization diagnostics
to 256 disk buckets, bounds each bucket and uses 16-way external merge runs to retain exact
identity ordering. Quality/date/baseline rules are shared with the legacy in-memory oracle.
The final implementation hashes intermediate, dataset and metadata bytes against write-time
values before a new output directory can appear. A failed refresh does not replace old output.
The builder verifies and copies the single immutable data asset with streams instead of a whole
Vite buffer. No dependency, source transport, status mapping, workflow or settings changed.

The final local actual-source replay completed all rows, global identity/collision metrics and
serialization with a 2,048 MiB JavaScript heap: 1,349,416 ms (22.49 minutes) and peak Node RSS
1,822,576 KiB (about 1.74 GiB). The implementation hashes in
`resources-2026-09-12-bounded-source.json` were rechecked against the final source files.
Its dataset contains 2,439,358,850 bytes with SHA-256
`34ac368f16a578b3af96cd083d73efe698d7b3ec01f400b5162e37a42f6b85cc`.

An earlier complete replay before the final integrity checks used 2,117,580 KiB peak RSS and
1,388,461 ms. The final report, all metrics and exact dataset hash equal that earlier replay,
so its browser failure below applies to identical final dataset bytes. Resource timings are
observations, not comparative benchmarks: concurrent local work differed between runs.

Local extraction uses Python ZIP/CRC checking against the exact approved-runner archive hash.
It is a research adapter; production still uses the approved Ubuntu Info-ZIP collector.
Node RSS excludes child Python memory. Local wall times include workstation contention and are
not Ubuntu runner timings. Research files have no release descriptor or accepted baseline.

## Complete quality observations; no policy adopted

| Metric | Observation |
|---|---:|
| Total records | 2,939,947 |
| Missing normalized name | 29 (0.0009864%) |
| Both normalized addresses missing | 0 |
| Empty categories | 23 of 195 |
| Unknown aggregate status pair | 187,173 (6.3665%) across 68 categories |
| Global normalization collision groups | 1,121,711 |
| Records participating in any normalization collision | 2,735,507 |

Collisions include shared/empty normalized values; they are not duplicate source identities or
automatically confirmed business matches. Global identity checks completed without a duplicate
or digest-collision rejection. The unchanged mapping yields the following exact display values:

| Quoted display status | Records |
|---|---:|
| "행정상 영업" | 977,991 |
| "휴업" | 3,778 |
| "폐업" | 1,577,255 |
| "확인되지 않음" | 380,923 |

Unreviewed source pairs are exactly `05` / "제외/삭제/전출" (187,150) and `06` / "기타" (23).
They stay unverified and trigger `aggregate_pair_review_required`. The existing reviewed mixed
`04` pair remains unverified without being silently reclassified. Final validation correctly
returns `review_required`, also for missing reviewed policy and baseline. No threshold or
baseline has been created. One collection cannot establish normal day-to-day change bands.

## Actual browser loading failure

`measure-source-browser.mjs` ran the current publication loader and the hook's subsequent
preparation pass in Chromium 151.0.7922.34 on Windows, using an unthrottled local HTTP endpoint.
The 2,439,358,850-byte real dataset caused a renderer crash after 4,271 ms; the server had sent
892,534,784 bytes. This is a failure outcome, not a successful load-time measurement. See
`browser-2026-09-12-actual-source.json`. No search readiness, mobile budget or search latency
success can be claimed. Dataset download/JSON materialization/index preparation need a separate
reviewed delivery design before deployment. Streaming the producer does not solve the browser.

## Verification and remaining gates

Focused tests currently pass 130/130 under Node 24.19.0. The matrix is recorded in
`.testagent/status.md`; it includes exact release-byte parity, multiple write flushes, batch/global
collisions, duplicate identities, partial ingestion, policy/size rejection, intermediate-file and
metadata corruption, disk failures, existing-output protection and observation-only output.
Final pinned `npm run verify` passes 665 tests with three existing Windows native-tool skips
(668 total): coverage 92.10% statements, 91.19% branches, 95.41% functions and 93.68% lines.
The exact status mapper retains 100% coverage. Lint, formatting, type checking, build and both
search-quality checks pass. Chromium/mobile E2E passed 34/34 and
accessibility passed 20/20. The unchanged Windows WebKit issue remains previously documented.
No independent release approval, real publication build from an approved baseline, hosted memory
replay, protection change, deployment, recovery exercise or thirty-day reliability is claimed.

A cancelled local replay left an owned temporary scratch directory because automatic approval
review blocked deletion, including an explicit literal-path retry, with only "blocked by policy"
as the stated reason. It remains outside Git at
`C:/Users/0user-V/AppData/Local/Temp/.open-store-bounded-observation-final-20260912-work-34A0wI`.
