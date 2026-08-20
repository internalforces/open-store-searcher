<!--
Purpose:        Single reference for approved development, verification, build, and deployment commands
Owner:          Implementer / Release Manager
Update Trigger: When the technology stack or automation commands are approved or changed
Harness Version: 1.1
-->

# commands.md — open-store-searcher Command Reference

_Last updated: 2026-08-18_

> The PRD defers the technology stack to a later implementation plan. Replace the placeholders below with real commands after stack approval.

## Install

```bash
[PKG_MANAGER] install
```

## Develop

```bash
[DEV_COMMAND]
[TYPE_CHECK_COMMAND]
[LINT_COMMAND]
[FORMAT_COMMAND]
```

## Test

```bash
[UNIT_TEST_COMMAND]
[PIPELINE_TEST_COMMAND]
[E2E_TEST_COMMAND]
[ACCESSIBILITY_TEST_COMMAND]
[COVERAGE_COMMAND]
```

## Data Pipeline

```bash
[DATA_FETCH_COMMAND]
[DATA_TRANSFORM_COMMAND]
[DATA_VALIDATE_COMMAND]
[DATA_BUILD_COMMAND]
```

Do not run the publication command when data validation fails. Production data refreshes and manual workflow dispatches require human approval.

## Build and Deploy

```bash
[BUILD_COMMAND]
[PREVIEW_COMMAND]
[PAGES_DEPLOY_COMMAND]
```

GitHub Pages deployment requires both Reviewer approval and final human approval.

## Verify PRD Targets

```bash
[BUNDLE_SIZE_CHECK_COMMAND]      # Target total uncompressed HTML/CSS/JS <= 300 KB
[SEARCH_BENCHMARK_COMMAND]       # Target search latency <= 500 ms after data loading
[TOP3_RECALL_COMMAND]            # Target Top-3 recall >= 90% on exact name-and-address set
[STALE_DATA_CHECK_COMMAND]       # Warn when data is more than seven days old
```

