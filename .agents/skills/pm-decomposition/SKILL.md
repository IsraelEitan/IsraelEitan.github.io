---
name: pm-decomposition
description: >
  Product Manager decomposition rules. Use when a raw feature request,
  bug report, or change request must be broken down into an ordered
  pipeline task list before any agent starts working.
when_to_use: >
  Use at the start of every new feature or bug. Decompose before designing,
  before planning, before coding. Never skip this step.
---

# PM Decomposition Skill

## Purpose

Transform a raw human request into a structured pipeline kickoff document
that every downstream agent can consume.

## Non-negotiable rules

1. Never assume scope. Extract only what the request states.
2. Always identify the affected layers: frontend, backend, database, mobile, infra.
3. Always produce an ordered task list — each task maps to exactly one agent.
4. Mark dependencies explicitly: which tasks block which.
5. Identify open questions before the pipeline starts — not during.
6. Do not start implementation planning — that is the architecture-planner's job.
7. Estimate relative complexity: Small / Medium / Large for each task.
8. Identify the Definition of Done (DoD) for the whole feature.

## Decomposition Process

### Step 1 — Understand the request

Read the full request. Identify:
- What the user/product wants to happen
- What layers are affected (frontend / backend / database / mobile / infra / docs)
- What already exists vs. what is new
- What the acceptance criteria are (infer from the request if not stated)

### Step 2 — Identify agents needed

For each affected layer, map to the responsible agent:

| Layer | Agent |
|---|---|
| Discovery | repo-auditor |
| UI/UX design | design-agent |
| Architecture + API contracts | architecture-planner |
| Database schema + migrations | schema-designer |
| Backend API + services | backend-builder |
| Frontend components + pages | frontend-builder |
| Mobile screens | mobile-builder |
| Unit + integration tests | test-writer |
| End-to-end tests | e2e-tester |
| Security review | security-agent |
| Code review + PR | pr-reviewer |
| CI/CD + deployment config | devops-agent |
| Documentation | docs-agent |

### Step 3 — Order the tasks

Required ordering rules:
1. repo-auditor ALWAYS runs first
2. design-agent BEFORE frontend-builder
3. architecture-planner BEFORE any builder (backend, frontend, mobile)
4. schema-designer BEFORE backend-builder (if DB changes exist)
5. backend-builder BEFORE frontend-builder (API contract must exist first)
6. All builders BEFORE test-writer
7. test-writer BEFORE e2e-tester
8. All testing BEFORE security-agent
9. security-agent BEFORE pr-reviewer
10. pr-reviewer BEFORE devops-agent
11. devops-agent BEFORE docs-agent

### Step 4 — Write the task breakdown document

## Required Output Format

Produce a document at: `pipeline/{feature-slug}/00-task-breakdown.md`

```markdown
# Task Breakdown: {Feature Name}

## Request Summary
{One paragraph describing what was asked for}

## Acceptance Criteria
- [ ] {criterion 1}
- [ ] {criterion 2}
- [ ] {criterion n}

## Affected Layers
- Frontend: yes/no — {brief reason}
- Backend: yes/no — {brief reason}
- Database: yes/no — {brief reason}
- Mobile: yes/no — {brief reason}
- Infrastructure: yes/no — {brief reason}

## Open Questions
{Questions that must be answered before work starts — or "None" if clear}

## Ordered Task List

| # | Agent | Task | Complexity | Depends On | Output File |
|---|---|---|---|---|---|
| 1 | repo-auditor | Audit current codebase for {feature area} | Small | — | 01-audit-report.md |
| 2 | design-agent | Design {screens/components} | Medium | #1 | 02-design-spec.md |
| ... | ... | ... | ... | ... | ... |

## Definition of Done
- All acceptance criteria checked
- All tests passing
- Security report clean
- PR approved and merged
- Docs updated
```

## Complexity Guide

- **Small**: 1–3 files changed, single agent, well-understood pattern
- **Medium**: 4–10 files, 2–4 agents, requires planning
- **Large**: 10+ files, 5+ agents, architectural decisions needed
