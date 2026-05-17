---
name: planning-output-contract
description: >
  Required output format for every implementation plan. Use this skill
  to ensure plans are complete, unambiguous, and agent-executable.
---

# Planning Output Contract

Every plan produced by architecture-planner must include all sections below.
Scale depth to complexity — a simple fix gets short sections; a major feature
gets detailed ones. Never omit a section; write "N/A — [reason]" if it does not apply.

---

## Required sections

### 1. Goal
One sentence. What does this plan achieve?

### 2. Mode
State which pipeline mode applies:
- **Portfolio Site Mode** — static HTML/CSS/JS, no framework
- **Full-Stack App Template Mode** — Next.js / Node / Prisma / PostgreSQL

### 3. Approach Selected
Which of the 2-3 options was chosen and why. Name the alternatives considered.

### 4. Scope — In
Explicit bulleted list of what this plan changes.

### 5. Scope — Out
Explicit bulleted list of what this plan does NOT change.

### 6. Assumptions
List every assumption made. Mark each as:
- **Confirmed** — verified from repo files or tool output
- **Assumed** — not verified, stated as working assumption
- **Blocker** — cannot proceed until owner confirms

### 7. Implementation Steps
Ordered list. Each step must include:
- Step number and title
- Which agent executes it
- Input required (which file or previous step output)
- Exact task description
- Validation: how to confirm the step succeeded

### 8. File Changes
Table of every file this plan touches:

| File | Action | Reason |
|------|--------|--------|
| path/to/file.ext | Create / Modify / Delete | Why |

### 9. API Contract Changes
If applicable — list every new or changed endpoint:
- Method + path
- Request shape
- Response shape
- Breaking change? Yes/No

Write "N/A" if no API changes.

### 10. Database Changes
If applicable — list every migration:
- Table / column affected
- Migration type (additive / destructive / rename)
- Safe to run on live data? Yes/No + reason

Write "N/A" if no DB changes.

### 11. Validation Plan
End-to-end checklist to verify the complete feature works:
- [ ] Each acceptance criterion from task breakdown is met
- [ ] Tests pass (unit, integration, E2E as applicable)
- [ ] No regressions in existing tests
- [ ] Manual smoke-check steps

### 12. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|

### 13. Rollback Procedure
Step-by-step: how to safely undo this change if it causes problems in production.

### 14. Architecture Decision Records
One ADR per significant decision. Follow the adr-generator skill format.
Write "N/A" if no significant architectural decisions were made.

### 15. Recommended Agent Route
Ordered list of which agents should run next:

```
1. schema-designer    (if DB changes)
2. backend-builder    (if backend changes)
3. frontend-builder   (if frontend changes)
4. test-writer
5. e2e-tester
6. security-agent
7. pr-reviewer
8. devops-agent       (if CI/CD changes)
9. docs-agent
```

---

## Quality gate

Before delivering the plan, check:

- [ ] All 15 sections present (or marked N/A with reason)
- [ ] No step requires unverified information
- [ ] Every step has a named owner agent
- 