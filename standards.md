<!--
Purpose:        Define code, data, testing, documentation, security, and quality standards
Owner:          Reviewer
Update Trigger: When coding rules, quality targets, or PRD release criteria change
Harness Version: 1.1
-->

# standards.md — open-store-searcher Quality Standards

_Last updated: 2026-08-18_

## Code Style

- Language: [LANG]
- Indentation: [INDENT]
- Maximum line length: [MAX_LINE_LENGTH]
- Naming: Define the standard conventions for the selected language in the stack-decision ADR.
- Keep collection, transformation, validation, status mapping, search scoring, and presentation in independent modules.
- Code and tests must share a single source of truth for status mapping.

## Commits and Pull Requests

- Commit format: `<type>(<scope>): <subject>`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `security`
- Pull request titles use the same format.
- Do not merge before Reviewer approval, and authors may not provide their own final approval.
- Pull request descriptions must include related FR IDs, risks, verification commands, and data/privacy impact.

## Testing Standards

- Minimum coverage: [MIN_COVERAGE]%
- Unit-test all status mappings and search-scoring business logic.
- The pipeline must be reproducible without network access by using small, fixed fixtures.
- Verify mobile and desktop UI, keyboard-only use, screen-reader status announcements, and the GitHub Pages subpath.
- Add a reproducing test before fixing a bug.

## Data Quality

- Check required columns, duplicate management IDs, missing-name and missing-address rates, abrupt record-count changes, new status codes, as-of dates, JSON syntax, and size.
- Unknown statuses must always fail safely to `확인되지 않음` (unverified).
- Keep normalized search values separate from original display values.
- Publish only complete artifacts that pass validation; preserve existing known-good artifacts after a failure.
- Include the data source URL and as-of date in build artifacts.

## Accessibility

- Follow baseline WCAG 2.1 AA requirements.
- Do not communicate status by color alone.
- Every function must be keyboard accessible.
- Provide accessible names and status announcements for input, candidate lists, results, and errors.
- Zero critical automated accessibility errors is a release gate.

## Privacy and Security

- Do not send search terms or user behavior to servers, analytics tools, or logs.
- Render input as text and never inject it as HTML.
- Do not place secrets or API keys in the frontend or static artifacts.
- Apply safe policies such as `noopener noreferrer` to external new-window links.
- Minimize GitHub Actions permissions and pin and review action versions.

## Performance Budgets

- Target primary content within 2.5 seconds on a typical mobile device.
- Target search within 500 ms after data loading.
- Target initial uncompressed HTML, CSS, and JavaScript below 300 KB.
- As data grows, first consider lazy loading by Seoul district or business category.

## Documentation Standards

- All harness documentation must comply with the English-only policy in `AGENTS.md`.
- Explain public functions/APIs and complex status or scoring logic where needed.
- Record important choices as ADRs in `memory/decisions.md`.
- Provide setup, deployment, source, terms-of-use, disclaimer, contribution, and security-reporting documentation before release.
- Do not alter the meaning of fixed product copy.

## Review Checklist

- [ ] Related FRs and acceptance criteria are satisfied.
- [ ] Tests and performance/accessibility verification pass.
- [ ] Status-safety rules and the no-collection privacy principle are preserved.
- [ ] Previous known-good data is preserved after validation failure.
- [ ] New dependencies, infrastructure, and public interfaces are approved.
- [ ] Related harness and user documentation is current and written in English.

