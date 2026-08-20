<!--
Purpose:        Index harness documents and reference the source PRD location
Owner:          Documenter
Update Trigger: When documents are added or moved, or the source-requirements location changes
Harness Version: 1.1
-->

# Documentation Index

_Last updated: 2026-08-18_

## Source Requirements

- Project PRD: `/Users/sonmyeong-gwan/Documents/Codex/2026-08-18/new-chat/outputs/zero-cost-open-business-dashboard-prd.md`
- PRD version: 1.0
- Authored: 2026-08-18
- Status: Review requested

The source PRD is the source of truth for product requirements. This harness turns the PRD into implementation work. If meanings conflict, consult the user's latest instructions and the source PRD.

## Harness Documents

- `../AGENTS.md`: project constitution and absolute constraints
- `../ORCHESTRATOR.md`: cross-role workflows and approval gates
- `../roadmap.md`: implementation milestones
- `../tasks/backlog.md`: executable task backlog
- `prd-traceability.md`: requirement-to-task-to-verification traceability matrix
- `open-questions.md`: unresolved questions that replace placeholders
- `../memory/architecture.md`: system structure and data flow
- `../memory/decisions.md`: architecture decision records
- `superpowers/specs/2026-08-18-korean-human-handbook-design.md`: approved design for a Korean human-facing handbook that is excluded from implementation context
- `superpowers/plans/2026-08-18-korean-human-handbook.md`: implementation plan for the handbook boundary, workflow, and Pre-M0 baseline

All harness documents must be written in English under the policy in `../AGENTS.md`.

The implemented `../handbook/ko/` tree is human-facing explanatory documentation, not harness content or implementation evidence. Implementation roles must not load it. The Documenter may access it only during an authorized milestone-close pass or after an explicit human request.

## User Documentation to Add During Implementation

- Root README and setup/local-development guide
- Data source, terms-of-use, and schema documentation
- Deployment and recovery runbook
- Disclaimer, privacy, and security-reporting policies
- CONTRIBUTING, CODE_OF_CONDUCT, and issue and pull request templates
