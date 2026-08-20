<!--
Purpose:        Define shared project domain terms, status language, and abbreviations
Owner:          All agents (contribute), Documenter (maintain)
Update Trigger: When a term or status code is introduced or its meaning changes
Harness Version: 1.1
-->

# Glossary — open-store-searcher

_Last updated: 2026-08-18_

## Domain Terms

| Term | Definition |
|---|---|
| `행정상 영업` (administratively operating) | Operating according to public licensing data; does not mean the business is open at the current moment |
| `휴업` (suspended) | Explicitly classified as temporarily suspended in the public administrative data |
| `폐업` (closed) | Explicitly classified as closed by the source public administrative data |
| `확인되지 않음` (unverified) | A state that cannot be concluded because of a missing result, candidate conflict, unknown status code, data error, or similar uncertainty |
| Raw status | The operating-status and detailed-operating-status values supplied by the data provider |
| Display status | A conservative mapping of raw values into the four user-facing statuses |
| Data as-of date | The point in time represented by the public data shown on the page and result |
| Low-confidence candidate | A candidate that requires user verification because only the name matches or the address is incomplete |
| Last known-good data | The newest artifact, current or previous, that passed all validation and was published |

## Abbreviations

| Abbreviation | Full name | Description |
|---|---|---|
| ADR | Architecture Decision Record | Record of an important technical decision |
| ETL | Extract, Transform, Load | Data collection, transformation, and publication pipeline |
| FR | Functional Requirement | PRD functional-requirement ID |
| MVP | Minimum Viable Product | Smallest releasable scope |
| P0 | Priority 0 | Requirement mandatory for release |
| P1 | Priority 1 | Requirement after initial stabilization |
| WCAG | Web Content Accessibility Guidelines | Web accessibility guidance |

## Harness Terms

| Term | Definition |
|---|---|
| Harness | The complete documentation structure that manages agent roles, memory, tasks, and workflows |
| Session | One unit of work by an agent |
| Active Task | The task currently being performed in `tasks/active.md` |
| Human Gate | A point that requires explicit user approval before proceeding |

