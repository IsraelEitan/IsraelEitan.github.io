# Full AI-Only Production Pipeline
## Eitan Proshizki — End-to-End Build Plan
_Last updated: May 2026_

> **Status**: Template and roadmap. This document describes the reusable
> full-stack AI production pipeline. It is not a statement of the current
> `eitan-site` runtime architecture. For current repo instructions, use
> `AGENTS.md`, which defines Portfolio Site Mode for this static HTML/CSS/JS
> site and Full-Stack App Template Mode for future projects.

---

## 1. Current State Assessment

### What You Have (and it's solid)

Your **eitan-site** project already has a 3-agent pipeline that is production-grade in design:

| Agent | Role | Tools | Skills |
|---|---|---|---|
| `repo-auditor` | Read-only codebase analysis | Read, Glob, Grep | — |
| `architecture-planner` | Safe implementation planning (no coding) | Read, Glob, Grep | architecture-planning-governance, planning-output-contract, ai-safe-change-management |
| `implementation-engineer` | Execute approved plans on feature branches | Read, Glob, Grep, Bash, Edit, Write | main-branch-protection, scoped-implementation-with-tests, validation-and-pr-reporting |

Your **global skills** cover:
- ✅ Document creation (docx, xlsx, pptx, pdf)
- ✅ Frontend (frontend-design, frontend-dev-guidelines, frontend-patterns, frontend-testing, react-best-practices, web-development)
- ✅ Code quality (engineering-standards, production-code-audit)
- ✅ Meta / utility (schedule, skill-creator, prompt-lookup)

### What's Missing (honest gaps)

**Agents:**
- ❌ No product manager / orchestrator agent (who takes a raw user story and routes it)
- ❌ No design agent (UI/UX wireframes → component specs)
- ❌ No backend agent (API, services, business logic)
- ❌ No database agent (schema design, migrations, query review)
- ❌ No QA / test-writer agent (unit, integration, E2E)
- ❌ No security agent (OWASP, secrets, dependency audit)
- ❌ No DevOps / CI-CD agent (pipelines, Docker, deploy)
- ❌ No mobile agent (React Native / Expo)
- ❌ No PR reviewer agent (code review before merge)
- ❌ No documentation agent (README, API docs, ADRs)

**Skills:**
- ❌ No backend skill (Node.js / Python / Java patterns)
- ❌ No database skill (SQL, ORMs, migrations)
- ❌ No comprehensive testing skill (unit + integration + E2E)
- ❌ No security review skill
- ❌ No DevOps / CI-CD skill (GitHub Actions, Docker, K8s)
- ❌ No mobile skill (React Native, Expo)
- ❌ No API design skill (OpenAPI, REST contracts, GraphQL)
- ❌ No architecture diagram skill (Mermaid, C4 model)

**MCP Connectors (zero currently):**
- ❌ GitHub — can't read repos, create branches, open PRs, check CI
- ❌ Jira / Linear — no ticket management
- ❌ Figma — no design spec access
- ❌ Slack — no team communication
- ❌ Database connector — no direct DB access for schema inspection

---

## 2. The Target Pipeline: Idea → Production, AI-Only

```
┌─────────────────────────────────────────────────────────────┐
│                    FEATURE REQUEST / BUG                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
              ┌───────▼────────┐
              │   PM-AGENT     │  ← breaks story into tasks,
              │ (Orchestrator) │    creates tickets, assigns agents
              └───────┬────────┘
                      │
              ┌───────▼────────┐
              │  REPO-AUDITOR  │  ← existing ✅ — read-only analysis
              └───────┬────────┘
                      │
              ┌───────▼────────┐
              │ DESIGN-AGENT   │  ← wireframes, design system,
              │                │    component specs → Figma/Canva
              └───────┬────────┘
                      │
         ┌────────────┴─────────────┐
         │                          │
┌────────▼─────────┐    ┌──────────▼────────┐
│ ARCH-PLANNER     │    │  SCHEMA-DESIGNER  │
│ (existing ✅)    │    │  DB + migrations  │
│ API contracts,   │    │  ER diagrams      │
│ ADRs, services   │    │                   │
└────────┬─────────┘    └──────────┬────────┘
         │                          │
         └────────────┬─────────────┘
                      │
         ┌────────────┴─────────────┐
         │                          │
┌────────▼─────────┐    ┌──────────▼────────┐
│ BACKEND-BUILDER  │    │ FRONTEND-BUILDER  │
│ API, services,   │    │ React/Next.js     │
│ business logic   │    │ components, pages │
└────────┬─────────┘    └──────────┬────────┘
         │                          │
         │              ┌──────────▼────────┐
         │              │  MOBILE-BUILDER   │ (optional)
         │              │  React Native     │
         │              └──────────┬────────┘
         │                          │
         └────────────┬─────────────┘
                      │
              ┌───────▼────────┐
              │  TEST-WRITER   │  ← unit + integration tests
              │                │    for all layers
              └───────┬────────┘
                      │
              ┌───────▼────────┐
              │  E2E-TESTER    │  ← Playwright / Cypress
              └───────┬────────┘
                      │
              ┌───────▼────────┐
              │ SECURITY-AGENT │  ← OWASP, secrets scan,
              │                │    dependency audit
              └───────┬────────┘
                      │
              ┌───────▼────────┐
              │  PR-REVIEWER   │  ← code review, diff analysis,
              │                │    PR description writer
              └───────┬────────┘
                      │
              ┌───────▼────────┐
              │  DEVOPS-AGENT  │  ← GitHub Actions, Docker,
              │                │    K8s, deploy scripts
              └───────┬────────┘
                      │
              ┌───────▼────────┐
              │   DOCS-AGENT   │  ← README, API docs,
              │                │    ADRs, changelogs
              └───────┬────────┘
                      │
              ┌───────▼────────┐
              │  PRODUCTION ✅  │
              └────────────────┘
```

---

## 3. Full Agent Roster — Definitions

### STAGE 0 — ORCHESTRATION

#### `pm-agent` (Product Manager / Orchestrator)
**Role:** Takes a raw feature request or bug report and decomposes it into an ordered task list. Routes to the right agents. Maintains state across the pipeline.

```yaml
name: pm-agent
description: >
  Use this agent when a new feature, bug, or change request arrives.
  It decomposes the request into an ordered task list, identifies which
  agents to invoke in sequence, creates a Jira/Linear ticket (if connected),
  and produces a pipeline kickoff document.
tools: Read, Glob, Grep, WebSearch
model: opus
effort: high
skills:
  - pm-decomposition         # NEW — to be built
  - ai-safe-change-management
color: purple
```

**Skills it needs:**
- `pm-decomposition` — how to break a feature into: design tasks, API contract, DB changes, frontend tasks, test plan, rollback plan
- `ai-safe-change-management` — already exists ✅

---

### STAGE 1 — DISCOVERY

#### `repo-auditor` — **EXISTS ✅**
No changes needed. Well designed. Keep as-is.

---

### STAGE 2 — DESIGN

#### `design-agent`
**Role:** Takes a feature spec and produces: wireframes (described or via Canva/Figma MCP), component hierarchy, design tokens, responsive breakpoints, accessibility checklist.

```yaml
name: design-agent
description: >
  Use this agent when a feature needs UI/UX design before implementation.
  Produces wireframe descriptions, component hierarchy, design tokens,
  responsive breakpoints, and accessibility requirements.
  If Figma or Canva MCP is connected, generates actual design files.
tools: Read, Glob, WebSearch
model: sonnet
skills:
  - ui-ux-design-patterns    # NEW
  - frontend-design          # existing ✅
  - accessibility-standards  # NEW
color: pink
```

**Skills it needs:**
- `ui-ux-design-patterns` — component hierarchy, atomic design, design tokens
- `accessibility-standards` — WCAG 2.1 AA checklist, ARIA patterns
- `frontend-design` — already exists ✅

---

### STAGE 3 — ARCHITECTURE & DATA

#### `architecture-planner` — **EXISTS ✅**
Extend it with two new skills:
- `api-contract-design` — OpenAPI spec generation, REST conventions, versioning
- `adr-generator` — Architecture Decision Records in standard format

#### `schema-designer` (NEW)
**Role:** Designs database schema, ER diagrams, migration scripts, index strategies, query optimization guidance.

```yaml
name: schema-designer
description: >
  Use this agent when a feature requires database changes — new tables,
  schema modifications, migrations, index design, or query optimization.
  Produces: ER diagram (Mermaid), migration scripts, index recommendations,
  seed data plan. Does not run migrations directly.
tools: Read, Glob, Grep, Bash
model: sonnet
skills:
  - database-design          # NEW
  - ai-safe-change-management
color: orange
```

**Skills it needs:**
- `database-design` — ER modeling, normalization rules, migration patterns (Flyway/Liquibase/Prisma/Alembic), index design, query cost analysis

---

### STAGE 4 — IMPLEMENTATION

#### `implementation-engineer` — **EXISTS ✅**
This is your general-purpose implementer. It already handles frontend HTML/CSS/JS. Extend with two new skills:
- `backend-implementation` — Node.js/Express, Python/FastAPI patterns
- `api-implementation` — REST endpoint boilerplate, validation, error handling

#### `backend-builder` (NEW — specialized)
**Role:** Implements API layers, service classes, repositories, middleware, background jobs.

```yaml
name: backend-builder
description: >
  Use this agent when backend code needs to be written or modified:
  API routes, service layer, repository layer, middleware, auth,
  background jobs, event handlers. Requires an approved architecture plan.
tools: Read, Glob, Grep, Bash, Edit, Write
model: sonnet
skills:
  - backend-implementation   # NEW
  - api-implementation       # NEW
  - engineering-standards    # existing ✅
  - ai-safe-change-management
color: green
```

#### `frontend-builder` (NEW — specialized)
**Role:** Implements React/Next.js components, pages, state management, API integration.

```yaml
name: frontend-builder
description: >
  Use this agent when frontend React or Next.js code needs to be written.
  Implements components, pages, hooks, state management, API calls,
  and responsive styling. Requires an approved design spec and API contract.
tools: Read, Glob, Grep, Bash, Edit, Write
model: sonnet
skills:
  - frontend-dev-guidelines  # existing ✅
  - frontend-patterns        # existing ✅
  - react-best-practices     # existing ✅
  - engineering-standards    # existing ✅
  - ai-safe-change-management
color: green
```

#### `mobile-builder` (NEW — optional)
**Role:** React Native / Expo implementation. Shares logic with frontend-builder but adds native-specific patterns.

```yaml
name: mobile-builder
description: >
  Use this agent when React Native or Expo mobile screens need to be built.
  Handles navigation (React Navigation), native components, platform-specific
  code, push notifications, offline-first patterns.
tools: Read, Glob, Grep, Bash, Edit, Write
model: sonnet
skills:
  - react-native-patterns    # NEW
  - engineering-standards    # existing ✅
  - ai-safe-change-management
color: teal
```

---

### STAGE 5 — QUALITY ASSURANCE

#### `test-writer` (NEW)
**Role:** Writes unit tests, integration tests, and API contract tests for ALL layers — backend services, React components, hooks, utilities.

```yaml
name: test-writer
description: >
  Use this agent after implementation is complete to write unit tests,
  integration tests, and API contract tests. Covers backend (Jest/pytest/xUnit),
  frontend (Vitest + RTL), and API (Supertest/httpx).
  Does not modify production code.
tools: Read, Glob, Grep, Bash, Edit, Write
model: sonnet
skills:
  - testing-strategy         # NEW
  - frontend-testing         # existing ✅
  - engineering-standards    # existing ✅
  - ai-safe-change-management
color: yellow
```

#### `e2e-tester` (NEW)
**Role:** Writes and runs Playwright or Cypress end-to-end tests covering critical user journeys.

```yaml
name: e2e-tester
description: >
  Use this agent to write and run end-to-end tests using Playwright or Cypress.
  Covers: authentication flows, critical user journeys, form submissions,
  API integration smoke tests. Maps to the acceptance criteria from the PM plan.
tools: Read, Glob, Grep, Bash, Edit, Write
model: sonnet
skills:
  - e2e-testing-patterns     # NEW
  - ai-safe-change-management
color: yellow
```

---

### STAGE 6 — SECURITY & REVIEW

#### `security-agent` (NEW)
**Role:** OWASP Top 10 check, dependency vulnerability scan, secrets detection, auth review, input validation audit.

```yaml
name: security-agent
description: >
  Use this agent to audit code for security issues before any PR is merged.
  Covers: OWASP Top 10, dependency CVEs, hardcoded secrets, auth/authz logic,
  input validation, SQL injection, XSS, CSRF, rate limiting gaps.
  Read-only. Produces a security report — does not fix code.
tools: Read, Glob, Grep, Bash
disallowedTools: Edit, Write
model: sonnet
skills:
  - security-review-patterns # NEW
  - engineering-standards    # existing ✅
color: red
```

#### `pr-reviewer` (NEW)
**Role:** Reviews the full diff of a branch. Checks for: correctness, SOLID violations, test coverage, naming, security issues, performance red flags. Writes the PR description.

```yaml
name: pr-reviewer
description: >
  Use this agent when a branch is ready for review. It reads the full diff,
  reviews for code quality, SOLID adherence, test coverage, naming,
  performance, and security. Writes a complete PR description including
  problem, solution, files changed, test plan, risks, and rollback plan.
tools: Read, Glob, Grep, Bash
disallowedTools: Edit, Write
model: sonnet
skills:
  - production-code-audit    # existing ✅
  - engineering-standards    # existing ✅
  - planning-output-contract # existing ✅
color: red
```

---

### STAGE 7 — DEVOPS & DELIVERY

#### `devops-agent` (NEW)
**Role:** Writes CI/CD pipelines (GitHub Actions), Dockerfiles, docker-compose, Kubernetes manifests, deployment scripts. Never deploys directly — produces config files only.

```yaml
name: devops-agent
description: >
  Use this agent to create or update CI/CD configuration, Docker setup,
  Kubernetes manifests, GitHub Actions workflows, environment configs,
  and deployment scripts. Produces files only — does not run deployments.
tools: Read, Glob, Grep, Bash, Edit, Write
model: sonnet
skills:
  - devops-patterns          # NEW
  - ai-safe-change-management
color: orange
```

---

### STAGE 8 — DOCUMENTATION

#### `docs-agent` (NEW)
**Role:** Generates README updates, API documentation (OpenAPI YAML), Architecture Decision Records, changelogs, and inline code comments.

```yaml
name: docs-agent
description: >
  Use this agent after implementation and PR review to generate or update:
  README sections, OpenAPI/Swagger docs, Architecture Decision Records (ADRs),
  CHANGELOG entries, and inline JSDoc/docstring comments.
tools: Read, Glob, Grep, Edit, Write
model: sonnet
skills:
  - documentation-patterns   # NEW
  - planning-output-contract # existing ✅
color: blue
```

---

## 4. Skills Gap — What to Build

| Skill Name | Priority | Purpose |
|---|---|---|
| `pm-decomposition` | 🔴 P0 | Break feature requests into ordered pipeline tasks |
| `backend-implementation` | 🔴 P0 | Node.js/Python/FastAPI patterns, service/repository layers |
| `database-design` | 🔴 P0 | ER modeling, migrations, index design |
| `testing-strategy` | 🔴 P0 | Unit + integration testing patterns for all stacks |
| `api-contract-design` | 🔴 P0 | OpenAPI specs, REST conventions, versioning rules |
| `adr-generator` | 🟡 P1 | Architecture Decision Record format + examples |
| `security-review-patterns` | 🟡 P1 | OWASP Top 10, CVE scanning, secrets detection |
| `devops-patterns` | 🟡 P1 | GitHub Actions, Docker, K8s, Helm |
| `e2e-testing-patterns` | 🟡 P1 | Playwright / Cypress patterns |
| `documentation-patterns` | 🟡 P1 | README, OpenAPI, ADR, CHANGELOG patterns |
| `ui-ux-design-patterns` | 🟢 P2 | Atomic design, component hierarchy, design tokens |
| `accessibility-standards` | 🟢 P2 | WCAG 2.1 AA, ARIA patterns |
| `react-native-patterns` | 🟢 P2 | React Navigation, native components, offline-first |

---

## 5. MCP Connectors — What to Install

| Connector | Priority | What it unlocks |
|---|---|---|
| **GitHub MCP** | 🔴 P0 | Read repos, create branches, open PRs, check CI status, read diffs |
| **Linear or Jira MCP** | 🔴 P0 | Create tickets, assign to sprints, mark done — PM-agent becomes real |
| **Figma MCP** | 🟡 P1 | Read design specs, export component tokens, sync with design-agent |
| **Slack MCP** | 🟡 P1 | Post pipeline status, notify team, send PR summaries |
| **PostgreSQL/MySQL MCP** | 🟡 P1 | Direct DB schema inspection for schema-designer |
| **Sentry MCP** | 🟢 P2 | Error monitoring — feed real bugs back into PM-agent |
| **Datadog/Grafana MCP** | 🟢 P2 | Performance metrics — feed into architecture decisions |

---

## 6. Agent Communication Protocol

Agents hand off via **structured documents**, not free-form chat. Each agent produces a named output file that the next agent reads as its primary input.

```
pm-agent          →  /pipeline/{feature}/00-task-breakdown.md
repo-auditor      →  /pipeline/{feature}/01-audit-report.md
design-agent      →  /pipeline/{feature}/02-design-spec.md
architecture-planner → /pipeline/{feature}/03-architecture-plan.md
schema-designer   →  /pipeline/{feature}/04-schema-plan.md
backend-builder   →  /pipeline/{feature}/05-backend-implementation-report.md
frontend-builder  →  /pipeline/{feature}/06-frontend-implementation-report.md
test-writer       →  /pipeline/{feature}/07-test-coverage-report.md
e2e-tester        →  /pipeline/{feature}/08-e2e-report.md
security-agent    →  /pipeline/{feature}/09-security-report.md
pr-reviewer       →  /pipeline/{feature}/10-pr-description.md
devops-agent      →  /pipeline/{feature}/11-cicd-config-report.md
docs-agent        →  /pipeline/{feature}/12-documentation-updates.md
```

Every agent starts by reading its predecessor's output document. This creates a full **audit trail** and makes the entire pipeline reproducible and reviewable.

---

## 7. Tech Stack Recommendations (AI-native defaults)

### Frontend
- **Framework:** Next.js 14+ (App Router) — AI codegen works best with this
- **UI:** Tailwind CSS + shadcn/ui — components are describable in plain English
- **State:** Zustand (simple) or TanStack Query (server state)
- **Testing:** Vitest + React Testing Library + Playwright

### Backend
- **Language:** Node.js (TypeScript) with Fastify — OR Python with FastAPI
- **Architecture:** Domain-driven, layered: Controller → Service → Repository
- **Validation:** Zod (TypeScript) or Pydantic (Python)
- **Testing:** Jest / Supertest OR pytest / httpx

### Database
- **Primary:** PostgreSQL — best AI codegen support, Prisma ORM
- **Migrations:** Prisma Migrate or Flyway
- **Cache:** Redis (via Upstash for serverless)

### Mobile
- **Framework:** Expo (React Native) — shares 70%+ code with Next.js frontend
- **Navigation:** React Navigation v6

### Infrastructure
- **CI/CD:** GitHub Actions — best AI codegen support
- **Containers:** Docker + docker-compose for dev, K8s for prod
- **Cloud:** Vercel (frontend) + Railway or Render (backend) — fastest to ship

---

## 8. Implementation Roadmap

### Phase 1 — Foundation (Do First)
1. Install **GitHub MCP connector** — unlocks real repo access for all agents
2. Install **Linear MCP** — gives PM-agent a real task system
3. Build `pm-decomposition` skill
4. Build `backend-implementation` skill
5. Build `database-design` skill
6. Create `pm-agent` agent definition
7. Create `schema-designer` agent definition
8. Create `backend-builder` agent definition

### Phase 2 — Quality Layer
1. Build `testing-strategy` skill
2. Build `e2e-testing-patterns` skill
3. Build `security-review-patterns` skill
4. Create `test-writer` agent
5. Create `e2e-tester` agent
6. Create `security-agent` agent
7. Create `pr-reviewer` agent

### Phase 3 — Delivery Layer
1. Build `devops-patterns` skill
2. Build `api-contract-design` skill
3. Build `adr-generator` skill
4. Create `devops-agent` agent
5. Create `docs-agent` agent
6. Extend `architecture-planner` with API contract + ADR skills

### Phase 4 — Design Layer
1. Install **Figma MCP** (or Canva)
2. Build `ui-ux-design-patterns` skill
3. Build `accessibility-standards` skill
4. Create `design-agent` agent

### Phase 5 — Mobile (if needed)
1. Build `react-native-patterns` skill
2. Create `mobile-builder` agent

---

## 9. What a Real Build Session Looks Like

Once this pipeline is complete, a full feature build looks like this:

```
You: "Build a user authentication system with JWT, email/password,
      password reset via email, and a protected dashboard page"

→ PM-AGENT reads the request, creates 8 tasks in Linear,
  produces task-breakdown.md

→ REPO-AUDITOR scans current repo, checks for existing auth code,
  produces audit-report.md

→ DESIGN-AGENT designs login/register/reset pages,
  produces design-spec.md with component hierarchy

→ ARCHITECTURE-PLANNER designs JWT flow, refresh token strategy,
  writes ADR, produces architecture-plan.md

→ SCHEMA-DESIGNER writes User table migration,
  password_reset_tokens table, indexes, produces schema-plan.md

→ BACKEND-BUILDER implements: POST /auth/register, POST /auth/login,
  POST /auth/refresh, POST /auth/reset-password (2 steps),
  JWT middleware, produces backend-report.md

→ FRONTEND-BUILDER implements: LoginPage, RegisterPage,
  ForgotPasswordPage, ResetPasswordPage, ProtectedRoute HOC,
  produces frontend-report.md

→ TEST-WRITER writes unit tests for all service methods,
  integration tests for all 5 endpoints, produces test-report.md

→ E2E-TESTER writes Playwright tests for full auth journey,
  produces e2e-report.md

→ SECURITY-AGENT checks for: JWT secret exposure, bcrypt rounds,
  rate limiting on auth endpoints, produces security-report.md

→ PR-REVIEWER reviews full diff, writes PR description,
  produces pr-description.md

→ DEVOPS-AGENT updates GitHub Actions workflow to run new tests,
  produces cicd-config-report.md

→ DOCS-AGENT updates README auth section, writes OpenAPI spec
  for auth endpoints, produces documentation-updates.md

→ You review → approve → merge → deploy
```

**Total AI involvement: ~95%. Your role: review, approve, merge.**

---

## 10. Folder Structure for the Pipeline

```
your-project/
├── .claude/
│   ├── agents/
│   │   ├── pm-agent.md
│   │   ├── repo-auditor.md          ✅ exists
│   │   ├── design-agent.md
│   │   ├── architecture-planner.md  ✅ exists
│   │   ├── schema-designer.md
│   │   ├── backend-builder.md
│   │   ├── frontend-builder.md
│   │   ├── mobile-builder.md
│   │   ├── test-writer.md
│   │   ├── e2e-tester.md
│   │   ├── security-agent.md
│   │   ├── pr-reviewer.md
│   │   ├── devops-agent.md
│   │   └── docs-agent.md
│   ├── skills/
│   │   ├── ai-safe-change-management/    ✅ exists
│   │   ├── architecture-planning-governance/ ✅ exists
│   │   ├── planning-output-contract/     ✅ exists
│   │   ├── pm-decomposition/             ← build this
│   │   ├── backend-implementation/       ← build this
│   │   ├── database-design/              ← build this
│   │   ├── api-contract-design/          ← build this
│   │   ├── testing-strategy/             ← build this
│   │   ├── e2e-testing-patterns/         ← build this
│   │   ├── security-review-patterns/     ← build this
│   │   ├── devops-patterns/              ← build this
│   │   ├── adr-generator/               ← build this
│   │   └── documentation-patterns/       ← build this
│   └── CLAUDE.md                         ← build this (pipeline instructions)
└── pipeline/
    └── {feature-name}/
        ├── 00-task-breakdown.md
        ├── 01-audit-report.md
        ├── 02-design-spec.md
        ├── 03-architecture-plan.md
        ├── 04-schema-plan.md
        ├── 05-backend-implementation-report.md
        ├── 06-frontend-implementation-report.md
        ├── 07-test-coverage-report.md
        ├── 08-e2e-report.md
        ├── 09-security-report.md
        ├── 10-pr-description.md
        ├── 11-cicd-config-report.md
        └── 12-documentation-updates.md
```

---

_This plan covers the complete picture. The foundation (Phase 1) can be operational in a single session._
