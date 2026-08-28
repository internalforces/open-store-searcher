<!--
Purpose:        Record system components, data flow, boundaries, and architecture constraints
Owner:          Architect
Update Trigger: When components, data flow, deployment, or structural decisions change
Harness Version: 1.1
-->

# Architecture — open-store-searcher

_Last updated: 2026-08-28_

## System Overview

GitHub Actions collects, normalizes, and validates public administrative data into static JSON. A static web application on GitHub Pages downloads the JSON and searches it in the browser.

**Pattern**: Build-time ETL + Static Site + Client-side Search

## Trust Boundaries

- Build-time external boundary: download of local administrative licensing open data
- Repository boundary: collector, transformer, validator, fixtures, and static artifacts
- Deployment boundary: publication of validated artifacts from GitHub Actions to GitHub Pages
- User boundary: search-term normalization, candidate scoring, and presentation in the browser
- External maps: no automatic requests; navigation occurs only after an explicit user click

## Components

1. Data collector: downloads source files and metadata and detects changes.
2. Data transformer: cleans fields, maps statuses, separates display and search values, and creates identifiers.
3. Validator: checks schema, abrupt changes, duplicates, missing values, new statuses, as-of dates, JSON syntax, and size.
4. Publication stage: replaces artifacts only after complete validation and preserves existing artifacts after failure.
5. Static data: includes the minimum records plus source and as-of metadata needed for browser search.
6. Search engine: normalizes input and calculates candidate matches, scores, address conflicts, and confidence.
7. Dashboard: displays status, evidence, uncertainty, dates, external-verification links, and error states.
8. Test harness: Vitest projects separate Node unit, Node pipeline, and jsdom component ownership;
   Playwright projects cover Chromium, Firefox, WebKit, and mobile Chromium.

## Data Flow

```text
Local administrative licensing open data
  → Scheduled GitHub Actions run
  → Collection and change detection
  → Normalization and status mapping
  → Schema, quality, and size validation
  → Atomic publication of validated static JSON
  → GitHub Pages
  → Browser lazy loading
  → Input normalization, candidate ranking, and confidence
  → Administrative status, raw evidence, and as-of date
```

No external API or database request occurs during real-time search.

## Data Record Boundary

The output schema must at minimum represent an identifier; original and normalized business names; original and tokenized street and parcel addresses; category and business type; raw operating and detailed statuses; display status; licensing, suspension, reopening, closure, and last-modified dates; source URL; and data as-of date. Define the exact format through an ADR after the stack decision.

## Decision Summary

| Decision | Choice | Date |
|---|---|---|
| Implementation stack | TypeScript 7.0.2, Node.js 24.19.0 LTS, Preact 10.29.8, Vite 8.2.1, npm 11.17.0 | 2026-08-20 |
| Repository | Single repository and single npm package with module directories | 2026-08-20 |
| Repository foundation | MIT-licensed single npm package; strict TypeScript; Biome; relative Vite base | 2026-08-20 |
| Test stack | Vitest, Testing Library, Playwright, and axe | 2026-08-20 |
| Candidate source contract | Official Seoul all-category ZIP with TASK-004 permission coverage, gated by a fail-safe TASK-005 contract probe | 2026-08-28 |
| Harness | AI Development Harness v1.1 Standard | 2026-08-18 |
| Runtime | Static site with in-browser search | 2026-08-18 |
| Data processing | GitHub Actions ETL and static JSON | 2026-08-18 |
| Failure policy | Uncertain determinations become `확인되지 않음`; validation failures stop publication | 2026-08-18 |
| Harness language | English, except exact quoted product/source literals | 2026-08-18 |

See `memory/decisions.md` for details.

## Architecture Constraints

- Separate source modules for collection, transformation, validation, status mapping, search, and UI.
- Support splitting data files by Seoul district or business category as data grows.
- Do not assume a static-site base path; test GitHub Pages subpath deployment.
- Do not deploy a pipeline that lacks a last-known-good data preservation strategy.
- ADR-009 accepts the official zero-key Seoul all-category ZIP as the candidate default source.
  TASK-004 verified permission and attribution coverage for all 195 selected categories. The
  TASK-005 probe must validate automation stability, the complete category
  manifest, schema, archive integrity, cross-entry timestamp consistency, and as-of inputs before
  production collection or publication is allowed.
- Do not make the account- and API-key-dependent OpenAPI a required path without explicit approval
  to change the zero-external-key product constraint.
- Keep browser, search, domain, pipeline, and shared TypeScript modules in explicit directories within one npm package.
- Use Preact-local state only; no router or external state-management dependency is approved.
- Keep Node-executed pipeline and shared code compatible with native erasable TypeScript syntax.
- Use the committed Node.js, npm, package-lock, TypeScript, Biome, and Vite configuration as the reproducible foundation.
- Implement TASK-005 with native Node.js streaming and hashing plus an injected, shell-free
  Info-ZIP adapter. Collector output is temporary evidence only and cannot publish artifacts.
- Build and preview browser tests locally at `/open-store-searcher/` without changing the
  production Vite base or contacting a deployed environment.
- Use `npm run verify` for the fast lint, format, typecheck, coverage, and build loop. Use
  `npm run verify:full` for task completion and release-oriented verification by adding the full
  browser matrix and desktop/mobile Chromium accessibility scans.
- Keep `handbook/ko/**` outside linting, formatting, and all implementation context.
