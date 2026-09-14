# TASK-008 Compact Delivery Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans or subagent-driven-development for independently bounded tasks. Preserve the existing worktree and all user changes. No commits are authorized.

**Goal:** Publish lossless bounded compact JSON and search complete snapshots in a Worker.
**Architecture:** Shared strict codec and manifest validators connect a bounded producer, transactional builder, deployed-baseline reader and Worker-owned local store. UI receives metadata and visible pages only.
**Tech Stack:** Existing TypeScript/Preact/Vite, Node 24.19.0, npm 11.17.0, Vitest/Playwright; no added dependencies.
**Spec:** ../specs/2026-09-14-task-008-compact-delivery-design.md (user approved 2026-09-14).

## Global constraints

TASK-008 only; retain status/date/identity semantics, original record order, complete ranked results,
privacy, atomic replacement, existing quality gates and complete-site size enforcement. No changes
to workflows/settings/dependencies, no commit/push/deploy. No TASK-009/010/release completion.

## 1. Shared compact codec

- [x] Add src/shared/compact-data.ts and compact-data.test.ts. Define CompactManifest, CompactBlock,
  Column and CompactRecord; expose encodeColumns, decodeColumn, flattenRecord, materializeRecord,
  validateManifest and validateBlock. Existing display fields are the oracle.
- [x] Test exact null/empty/raw evidence and original ID order round-trip, invalid schemas/reference
  types/ranges, missing/overlapping roles and mixed versions before accepting snapshots.
- [x] Run focused unit tests and typecheck before integration.

## 2. Bounded producer and publication consumers

- [x] Add src/pipeline/write-compact-dataset.ts: consume a replayable async record iterator, retain
  at most 8192 rows, cap global dictionary collection and use local fallback. Emit immutable blocks
  and a content-hashed manifest. Preserve external identity checks in stage-bounded-release.ts.
- [x] Switch accepted bounded output to compact assets; keep observation legacy output only as a
  research oracle. Migrate in-memory reference output to the same codec, baseline and descriptor.
- [x] Migrate scripts/build-publication.mjs and read-deployed-baseline.ts together; validate listed
  files, hashes, ranges, counts and baseline bindings. Maintain legacy baseline reads and unchanged
  output-preservation/size tests. New production sites contain no legacy dataset.
- [x] Run pipeline round-trip, missing/corrupt/mixed-version and previous-output tests.

## 3. Worker store and unchanged scoring

- [x] Extract the existing scoring entry/comparators for reuse without changing its oracle API.
- [x] Add compact store that owns columns, bounded derived search preparation, complete ordinal
  result arrays and page materialization. Use cooperative yielding/cancellation and original IDs
  for ranking. Keep complete scan fallback; optional exact postings are not delivered.
- [x] Add versioned Worker protocol with load/search/page/cancel, metadata/ready/page/error replies.
  Validate all components before ready; no query-dependent network or persistent database.
- [x] Compare every complete result field against current searchCandidates for representative and
  source-derived queries, including broad district, reverse substring, conflict, numeric and absent.

## 4. UI lifecycle and recovery

- [x] Add worker client and production hook path. Keep accepted Worker alive while a replacement
  loads; reject stale responses, terminate only failed candidates, retry accepted version on crash.
- [x] Adapt App/SearchResults to async pages and full counts while retaining synthetic injection,
  existing copy, focus, keyboard and uncertainty behavior. Preparation has one production owner.
- [x] Test candidate failure retains accepted search; accepted crash disables search and retries;
  stale query/page/dataset replies cannot replace current results; pagination makes no request.

## 5. Full-source verification and delivery

- [x] Encode the verified complete source with production codec in observation-only research mode;
  independently round-trip evidence/count/IDs and validate actual full-site byte accounting.
- [x] Measure real cold/warm Worker readiness, transfer/preparation/memory, refresh overlap, broad
  search-to-page and navigation. Preserve budgets and distinguish shell from search readiness.
- [x] Run pinned required checks and report platform-specific/hosted limitations, without modifying
  workflow permissions or claiming unavailable Ubuntu evidence.
- [x] Review changed code/tests against the requirements, update English session/architecture/
  decisions/known-issues/traceability as applicable, and deliver concise Korean evidence summary.


Execution evidence: reports/test-2026-09-14-compact-delivery.md. Implementation and local
verification work is complete; these checkboxes do not close TASK-008 production acceptance.
Ubuntu 24.04 local verification passes all 754 tests plus 68 browser and 20 accessibility tests
with one worker. Native macOS InfoZIP has two unchanged failures; default-parallel Ubuntu
WebKit had two flakes. Hosted GitHub evidence remains unavailable for this uncommitted tree. Full-source physical/mobile readiness and memory are not
certified. No source/data scope, status rule, performance target or release gate was relaxed.
