# AI-Driven Production Pipeline
## Project: Eitan Personal Portfolio

This repository uses an AI-assisted engineering pipeline. The pipeline has two modes:

1. **Portfolio Site Mode**: the mode for this repository as it exists today.
2. **Full-Stack App Template Mode**: a reusable target pipeline for future SaaS/app projects.

Agents must verify the actual repository before choosing a mode. Do not assume the full-stack template applies to this repo.

---

## Current Repository Facts

This project is currently a static personal portfolio site.

| Area | Current Reality |
|---|---|
| Runtime | Static HTML, CSS, and vanilla JavaScript |
| Pages | `index.html`, `resume.html`, `projects.html`, `about.html`, `stats.html` |
| Shared assets | `style.css`, `main.js`, `avatar.png`, `favicon.svg` |
| Build step | None |
| Package manager | None currently |
| Backend | None currently |
| Database | None currently |
| Deployment target | GitHub Pages-compatible static hosting |

The full-stack stack below is a template for future projects, not the current implementation.

---

## Portfolio Site Mode

Use this lightweight pipeline for changes to this repository until a backend, database, or framework is actually introduced.

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

Skip these agents in Portfolio Site Mode unless the repo actually needs them:

- `schema-designer`
- `backend-builder`
- `mobile-builder`
- database migrations
- API contract generation
- Docker/Kubernetes production deployment

---

## Full-Stack App Template Mode

Use this mode only for a project that actually has, or is intentionally adding, a full-stack app surface.

| Layer | Template Default |
|---|---|
| Frontend | Next.js App Router, Tailwind CSS, shadcn/ui |
| State | TanStack Query, Zustand |
| Backend | Node.js + TypeScript, Fastify |
| Validation | Zod |
| Database | PostgreSQL, Prisma ORM |
| Auth | JWT access/refresh tokens, bcrypt |
| Testing | Vitest/RTL, Jest/Supertest, Playwright |
| CI/CD | GitHub Actions |
| Containers | Docker, docker-compose |
| Mobile | Expo, optional |
| Monitoring | Datadog, optional if connected |

Full pipeline:

```
Feature Request
  -> pm-agent
  -> repo-auditor
  -> design-agent
  -> architecture-planner
  -> schema-designer
  -> backend-builder
  -> frontend-builder
  -> test-writer
  -> e2e-tester
  -> security-agent
  -> pr-reviewer
  -> devops-agent
  -> docs-agent
  -> production handoff
```

---

## Handoff Documents

Each non-trivial change should produce documents in `pipeline/{feature-slug}/`.
Small, obvious bug fixes may use a shorter path, but the decision to skip documents must be explicit.

| # | File | Produced by | Notes |
|---|---|---|---|
| 00 | `task-breakdown.md` | pm-agent | Scope, acceptance criteria, agent route |
| 01 | `audit-report.md` | repo-auditor | Existing facts and risks |
| 02 | `design-spec.md` | design-agent | Only when UI/UX choices matter |
| 03 | `architecture-plan.md` | architecture-planner | Required for broad/risky changes |
| 04 | `schema-plan.md` | schema-designer | Only when DB changes exist |
| 05 | `backend-implementation-report.md` | backend-builder | Only when backend changes exist |
| 06 | `frontend-implementation-report.md` | frontend-builder | Static or React frontend changes |
| 07 | `test-coverage-report.md` | test-writer | Unit/integration/static checks |
| 08 | `e2e-report.md` | e2e-tester | Browser flow verification |
| 09 | `security-report.md` | security-agent | Security/config review |
| 10 | `pr-description.md` | pr-reviewer | Review and PR body |
| 11 | `cicd-config-report.md` | devops-agent | Only when CI/CD changes exist |
| 12 | `documentation-updates.md` | docs-agent | Final docs summary |

---

## Global Rules

1. Never work on `main` or `master`; use a feature branch.
2. Never invent facts; if not verified from files or tools, say it is unknown.
3. Prefer the smallest safe change.
4. Do not commit secrets. Use environment variables or platform secrets.
5. Match validation to the repo that exists. For this static site, prioritize HTML validity, link checks, accessibility smoke checks, and browser rendering.
6. Do not run migrations, deploy, open PRs, or push unless explicitly asked.
7. Every agent must say which mode it is using: Portfolio Site Mode or Full-Stack App Template Mode.

---

## Connector Policy

External MCP connectors are optional capabilities, not assumptions.

Agents may use a connector only when its tools are actually available in the current Codex/Claude session. If a connector is not available, the agent must continue with local files and git where possible, and clearly mark the connector-dependent work as skipped or manual.

| MCP | Used By | Use When Available | Local Fallback |
|---|---|---|---|
| GitHub | pr-reviewer, devops-agent, implementation agents | PRs, commits, issues, file contents, CI checks | `git`, `gh` CLI if authenticated |
| Linear | pm-agent | Create/update issues and project tasks | Write `pipeline/{feature}/00-task-breakdown.md` |
| Figma | design-agent | Inspect design files, tokens, screenshots | Produce text wireframes and component specs |
| Supabase | schema-designer | Inspect/apply database schema changes | Produce migration plan only |
| Datadog | security/devops/future ops agents | Logs, metrics, monitors | Mark runtime telemetry unknown |

Do not write "connected" in agent output unless the tool was actually callable in that session.

---

## Branch And PR Conventions

Use the existing branch if already on a safe feature/chore branch. Otherwise create one with these prefixes:

```text
feat/{feature-slug}
fix/{bug-slug}
refactor/{area}
test/{area}
chore/{task}
docs/{topic}
```

Every PR should include:

- Problem
- Solution
- Files changed
- Validation performed
- Security/configuration notes
- Remaining risks or manual checks

---

## How To Start Work

For this repo, a good kickoff looks like:

```text
Use Portfolio Site Mode. Build a task breakdown for fixing the portfolio health issues from docs/audits/repo-audit-initial.md.
```

For a future full-stack app, a good kickoff looks like:

```text
Use Full-Stack App Template Mode. Build a user authentication system with JWT login, password reset, and a protected dashboard.
```
