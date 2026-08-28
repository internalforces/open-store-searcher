<!--
Purpose:        Convert the PRD into implementation milestones and release gates
Owner:          Planner
Update Trigger: When milestones, priorities, scope, or the PRD change
Harness Version: 1.1
-->

# roadmap.md — open-store-searcher Roadmap

_Last updated: 2026-08-28_

## Goal

Deliver a zero-cost, open-source static dashboard that lets users search Seoul-licensed businesses by name or address and check administrative status, source, as-of date, and uncertainty within 30 seconds.

## M0 — Technology Decisions and Foundation

- [x] Approve the language, framework, package manager, and repository structure through an ADR.
- [x] Set up the MIT-licensed repository and development, testing, and static-build foundation.
- [x] Verify GitHub Pages subpath deployment and the accessibility-test foundation.
- [x] Update or review the Korean human handbook for verified M0 outcomes and pass human language review.

## M1 — Verifiable Data Pipeline

- [x] Confirm source-data delivery alternatives, representative schema, terms, and attribution;
      ADR-009 accepts the bounded ZIP candidate and leaves complete contract validation to TASK-005.
- [ ] Implement collection, change detection, normalization, and status mapping for Seoul data.
- [ ] Validate required columns, abrupt changes, duplicates, status codes, as-of dates, and output size.
- [ ] Preserve the last known-good data when validation fails.
- [ ] Configure a least-privilege GitHub Actions workflow that runs once per day.
- [ ] Update or review the Korean human handbook for verified M1 outcomes and pass human language review.

## M2 — P0 Search and Dashboard

- [ ] Implement business-name and address normalization, candidate scoring, and confidence.
- [ ] Display the four UI statuses, raw evidence, and as-of date.
- [ ] Provide fail-safe UX for low confidence, address conflicts, and empty results.
- [ ] Add external map-search links and responsive, keyboard, and screen-reader UI.
- [ ] Handle data-loading, delayed-refresh, and malformed-record errors.
- [ ] Update or review the Korean human handbook for verified M2 outcomes and pass human language review.

## M3 — Quality and Open-Source Release

- [ ] Verify at least 90% Top-3 recall, 500 ms search, and a 300 KB bundle target.
- [ ] Test mobile, desktop, keyboard, accessibility, and Pages subpaths.
- [ ] Write setup, deployment, data-source, disclaimer, contribution, code-of-conduct, and security-reporting documentation.
- [ ] Pass every P0 traceability item and PRD release criterion.
- [ ] Create the v1.0 tag and deploy to GitHub Pages after human approval.
- [ ] Review the complete Korean human handbook against the release candidate and pass human language review.

## M4 — P1 Stabilization

- [ ] Design and implement identifier-based share URLs that exclude search terms.
- [ ] Improve keyboard navigation for the candidate list.
- [ ] Design and verify regional expansion through separate static files outside Seoul.
- [ ] Update or review the Korean human handbook for verified M4 outcomes and pass human language review.

## Out of Scope

- Real-time open/closed status, opening hours, or holiday determination
- Collection or scraping of maps, reviews, ratings, or photos
- Paid APIs, servers, databases, accounts, or admin pages
- User tracking, synchronized search history, or AI status determination
- Commercial SaaS or paid features
