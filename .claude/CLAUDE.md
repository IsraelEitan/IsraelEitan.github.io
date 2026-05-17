# Claude Pipeline Instructions

This folder is a Claude Code compatibility export for the AI-driven pipeline.
The canonical project instructions live in `AGENTS.md`.

Agents must follow the mode split defined there:

- **Portfolio Site Mode** for this repository as it exists today.
- **Full-Stack App Template Mode** only for projects that actually have, or are intentionally adding, a full-stack surface.

---

## Current Project Mode

Use **Portfolio Site Mode** for `eitan-site`.

Confirmed current stack:

| Area | Current Reality |
|---|---|
| Runtime | Static HTML, CSS, and vanilla JavaScript |
| Pages | `index.html`, `resume.html`, `projects.html`, `about.html`, `stats.html` |
| Shared assets | `style.css`, `main.js`, `avatar.png`, `favicon.svg` |
| Build step | None |
| Backend | None |
| Database | None |
| Deployment target | GitHub Pages-compatible static hosting |

Do not assume Next.js, Fastify, Prisma, Supabase, Docker, or mobile code exists in this repository.

---

## Portfolio Site Pipeline

```
Request
  -> pm-agent                 (scope and acceptance criteria, if non-trivial)
  -> repo-auditor             (read-only repo analysis)
  -> design-agent             (only for meaningful UI/UX changes)
  -> architecture-planner     (implementation plan for risky or broad changes)
  -> frontend-builder         (HTML/CSS/JS implementation)
  -> test-writer / e2e-tester (validation, smoke tests, link checks)
  -> security-agent           (static-site security/config review)
  -> pr-reviewer              (diff review + PR notes)
  -> docs-agent               (README, audit, changelog updates)
```

Skip backend, schema, mobile, database migration, and container agents unless the repository actually grows those surfaces.

---

## Connector Policy

MCP integrations are optional. Use them only when the corresponding tools are actually callable in the current session.

| MCP | Use When Available | Fallback |
|---|---|---|
| GitHub | PRs, issues, CI checks, file contents | Local `git`; `gh` if authenticated |
| Linear | Create project issues | Handoff documents in `pipeline/{feature}` |
| Figma | Inspect design files/tokens | Text design specs |
| Supabase | Inspect/apply DB schema changes | Migration plan only |
| Datadog | Runtime logs/metrics/monitors | Mark telemetry unknown |

Do not say a connector is connected unless it was actually available in that run.

---

## Handoff Documents

Use `pipeline/{feature-slug}/` for non-trivial work. The full handoff list is documented in `AGENTS.md`.

For this static portfolio, the most common documents are:

- `00-task-breakdown.md`
- `01-audit-report.md`
- `03-architecture-plan.md` for broad/risky changes
- `06-frontend-implementation-report.md`
- `08-e2e-report.md`
- `09-security-report.md`
- `10-pr-description.md`
- `12-documentation-updates.md`

---

## Operating Rules

1. Never work on `main` or `master`.
2. Verify facts from repo files or available tools.
3. Use the smallest safe change.
4. Match validation to the real repo.
5. Do not deploy, push, open PRs, run migrations, or use external write APIs unless the user explicitly asks.
6. State whether the work is in Portfolio Site Mode or Full-Stack App Template Mode.
