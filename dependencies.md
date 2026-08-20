<!--
Purpose:        Track code dependencies, external services, data sources, and licenses
Owner:          Architect / Implementer
Update Trigger: When dependencies, data sources, versions, or terms of use change
Harness Version: 1.1
-->

# dependencies.md — open-store-searcher Dependencies

_Last updated: 2026-08-20_

## Core Dependencies

TASK-001 approved the initial direct dependencies below. TASK-002 and TASK-003 will install them and record the resulting lockfile and transitive-license audit. Before adding any other package, record its purpose, exact version, license, bundle impact, alternatives, and human approval.

| Package | Version | Purpose | License | Approval |
|---|---|---|---|---|
| preact | 10.29.8 | Declarative browser UI; approximately 3.5 kB core runtime | MIT | User approved 2026-08-20 |

## Development Dependencies

| Package | Version | Purpose | License | Approval |
|---|---|---|---|---|
| typescript | 7.0.2 | Strict type checking | Apache-2.0 | User approved 2026-08-20 |
| vite | 8.2.1 | Static development and production build | MIT | User approved 2026-08-20 |
| @preact/preset-vite | 2.10.6 | Preact integration for Vite | MIT | User approved 2026-08-20 |
| @biomejs/biome | 2.5.9 | TypeScript/TSX linting and formatting; consumed under the MIT option | MIT OR Apache-2.0 | User approved MIT option 2026-08-20 |
| vitest | 4.1.11 | Unit and offline pipeline tests | MIT | User approved 2026-08-20 |
| @vitest/coverage-v8 | 4.1.11 | Vitest code coverage | MIT | User approved 2026-08-20 |
| @testing-library/preact | 3.2.4 | Accessible component tests | MIT | User approved 2026-08-20 |
| @testing-library/user-event | 14.6.5 | Keyboard and user-interaction simulation | MIT | User approved 2026-08-20 |
| jsdom | 30.0.1 | DOM environment for component tests | MIT | User approved 2026-08-20 |
| @playwright/test | 1.62.1 | Chromium, Firefox, WebKit, and viewport E2E tests | Apache-2.0 | User approved 2026-08-20 |
| @axe-core/playwright | 4.13.0 | Automated WCAG checks in Playwright | MPL-2.0 | User approved 2026-08-20 |

## External Services and Data

| Service or source | Purpose | Authentication | Runtime call | Notes |
|---|---|---|---|---|
| Local administrative licensing open data | Source data for Seoul-licensed businesses | To be confirmed | None | Terms of use and attribution requirements must be verified |
| GitHub Actions | Daily collection, transformation, validation, and deployment | GitHub permissions | None during user searches | Use minimal permissions and public-repository free limits |
| GitHub Pages | Host the static site and JSON | None | Static asset requests only | Default deployment target |
| Naver Map search URL | User-initiated additional verification | None | Navigation after a user click | Automated collection prohibited |
| Kakao Map search URL | User-initiated additional verification | None | Navigation after a user click | Automated collection prohibited |

## Prohibited Dependencies

- Required paid APIs or services that require a payment method
- Runtime servers or databases
- Map or search-page scrapers and headless browsers
- User analytics, advertising, or tracking SDKs
- AI-based status-determination services

## Version Policy

- New dependencies and major upgrades require human approval and the full test suite.
- Minor and patch upgrades may proceed after Reviewer approval.
- Security patches must record the risk and be applied promptly after human approval.
- Prefer pinning GitHub Actions to immutable commit SHAs.
