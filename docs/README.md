<!--
Purpose:        Index harness documents and reference the source PRD location
Owner:          Documenter
Update Trigger: When documents are added or moved, or the source-requirements location changes
Harness Version: 1.1
-->

# Documentation Index

_Last updated: 2026-09-18_

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
- `superpowers/specs/2026-08-20-technology-stack-design.md`: approved TASK-001 technology-stack design
- `superpowers/specs/2026-08-20-repository-foundation-design.md`: approved TASK-002 repository-foundation design including written review
- `superpowers/plans/2026-08-20-repository-foundation.md`: detailed TASK-002 repository-foundation implementation plan
- `superpowers/specs/2026-08-18-korean-human-handbook-design.md`: approved design for a Korean human-facing handbook that is excluded from implementation context
- `superpowers/plans/2026-08-18-korean-human-handbook.md`: implementation plan for the handbook boundary, workflow, and Pre-M0 baseline

## Public Documentation

- `../README.md`: product purpose, safety summary, current release state, and quick start
- `development.md`: pinned setup, commands, repository layout, and verification workflow
- `data-and-safety.md`: source permission, public schema, status/date interpretation, privacy, and disclaimer
- `deployment.md`: publication prerequisites, approved deployment sequence, failure handling, and recovery limits
- `../CONTRIBUTING.md`: contribution workflow and safety requirements
- `../CODE_OF_CONDUCT.md`: community participation and enforcement expectations
- `../SECURITY.md`: supported version and vulnerability-reporting process
- `../.github/ISSUE_TEMPLATE/`: safe bug and feature-request intake
- `../.github/pull_request_template.md`: requirements, safety, and verification checklist

All harness documents must be written in English under the policy in `../AGENTS.md`.

The implemented `../handbook/ko/` tree is human-facing explanatory documentation, not harness content or implementation evidence. Implementation roles must not load it. The Documenter may access it only during an authorized milestone-close pass or after an explicit human request.

## Remaining Documentation Gates

- Update operational claims when TASK-008 calibration and TASK-009/010 publication gates close.
- Complete TASK-021 release-candidate documentation verification.
- Run the separate TASK-026 Korean handbook review at the applicable milestone close.
