<!--
Purpose:        Record approved and unresolved technology choices and PRD-based selection criteria
Owner:          Architect
Update Trigger: When technology adoption, versions, or architecture patterns change
Harness Version: 1.1
-->

# tech-stack.md — open-store-searcher Technology Stack

_Last updated: 2026-08-18_

## Stack Overview

| Layer | Technology | Version | Status and rationale |
|---|---|---|---|
| Language | [LANG] | [VER] | Undecided — maintainability in both the browser and GitHub Actions requires evaluation |
| Web framework | [FRAMEWORK] | [VER] | Undecided — must support static builds, small bundles, and subpath deployment |
| Data storage | Static JSON | Schema undecided | Runtime databases are prohibited; searches run in the browser |
| Hosting | GitHub Pages | Managed | Zero-cost static deployment |
| Automation and CI/CD | GitHub Actions | Managed | Daily data refresh, validation, and Pages deployment |
| Package manager | [PKG_MANAGER] | [VER] | Undecided |
| Test tools | [TEST_STACK] | [VER] | Undecided — must support unit, pipeline, E2E, and accessibility testing |

## Approved Architecture Patterns

- Structure: static frontend + CI-based ETL + client-side search
- API style: no runtime API
- State management: [STATE_MANAGEMENT]
- Data flow: local administrative licensing open data → GitHub Actions collection, normalization, and validation → static JSON → GitHub Pages → browser search
- Deployment model: publish only validated new artifacts atomically; preserve the last known-good deployment after a failure

## Technology Selection Criteria

1. Require no server, database, paid API, or mandatory payment method.
2. Operate entirely as static assets under a GitHub Pages subpath.
3. Support the 300 KB initial code-bundle target and the 500 ms search target.
4. Sharing a language between collection/transformation/validation and browser logic is beneficial but not mandatory.
5. Compare testing, accessibility, licensing, and long-term maintainability and decide through an ADR.

## Environments

| Environment | Purpose | Access |
|---|---|---|
| Local | Development and fixture-based data transformation and testing | localhost |
| Preview | Pull request verification and static build review | [STAGING_URL] |
| Production | Public dashboard | [PROD_URL] |

## Open Decisions

- [ ] Compare [LANG], [FRAMEWORK], [PKG_MANAGER], and [TEST_STACK], then obtain human approval.
- [ ] Define static JSON partitioning and the search-index format.
- [ ] Define the source-data download method and terms of use.
- [ ] Define the Pages deployment method and last-known-good artifact preservation strategy.

