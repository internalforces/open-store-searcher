<!--
Purpose:        Record scoped verification and delivery of the TASK-009 source transport preflight
Owner:          Tester / Reviewer / Release Manager
Update Trigger: When this change is verified, reviewed, delivered or integrated
Harness Version: 1.1
-->

# TASK-009 source transport preflight verification — 2026-10-22

## Scope

Evidence-only source transport request, its research report and current task/deployment handoff.
No application/test/dependency/workflow/configuration or runtime registry changed. TASK-009
II-10/hosted AC-009-4/5 remains open; TASK-010 paused and TASK-021 gated. The user's instruction
covers preparation, verification and protected-main integration. Source transport and later
hosted actions still require actual input/evidence and action-time review as specified in the
[preflight](research-2026-10-22-task-009-source-transport.md).

## Local checks

Local runtime is macOS Node.js 22.22.3, not pinned Node.js 24.19.0/Ubuntu. Existing Biome 2.5.9
was reused from the original checkout's installed dependencies; no package installation or
runtime change occurred. Lint exits 0 with only the same five pre-existing informational notices.
The first formatting run found one new JSON array layout; targeted formatting corrected it.
Final repository formatting exits 0 (282 files); Git whitespace validation passes. All 117
local Markdown file targets in the changed documents resolve. All 73 original untracked file
fingerprints and the original checkout status match; all five protected configuration,
registry and observation fingerprints remain unchanged. The 23 allowed-empty IDs are retained.

The executed Node assertion pass verifies exact observation length/SHA-256; source ZIP identity
against the committed observation (not the absent raw ZIP bytes); unchanged original collection
and null source coverage; all 195 unique category IDs against the accepted permission manifest;
production/validation equality and approved hashes for policy, baseline and reviewed pairs;
asset-size sums and resource-limit arithmetic; and inactive source/recovery authority. It exits 0.
The raw ZIP was not found in the scoped local search. No fresh raw archive replay, full-data
build or performance/physical-device verification is claimed.

Fresh GitHub reads confirm exact main `cd16e7c4dd84d6c8520399f3a7ffb72cc88f167a`, its completed
successful [Verify run](https://github.com/internalforces/open-store-searcher/actions/runs/39553203980),
no source tag, and no Releases. The branch endpoint confirms protected main/required `verify`;
the detailed protection endpoint returns integration 403. This does not establish actual public
site absence or fresh detailed environment/protection readiness. Official policy/resource pages
and four current category permission labels were checked; the full-category audit remains dated.

## Review and integration boundary

An independent whole-change review and exact PR/main CI are required for this delivery. Their
actual results are recorded in the live PR; this report does not infer an unknown future result.
No operational source assets, fabricated IDs, registry adoption, settings change, dispatch,
deployment, backup/recovery, recurrence or milestone/handbook completion is included.
