<!--
Purpose:        Track code dependencies, external services, data sources, and licenses
Owner:          Architect / Implementer
Update Trigger: When dependencies, data sources, versions, or terms of use change
Harness Version: 1.1
-->

# dependencies.md — open-store-searcher Dependencies

_Last updated: 2026-08-18_

## Core Dependencies

The technology stack has not yet been selected. Before adding a package, record its purpose, exact version, license, bundle size, alternatives, and human approval in this table.

| Package | Version | Purpose | License | Approval |
|---|---|---|---|---|
| [package] | [version] | [purpose] | [license] | Pending |

## Development Dependencies

| Package | Version | Purpose | License | Approval |
|---|---|---|---|---|
| [package] | [version] | [purpose] | [license] | Pending |

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

