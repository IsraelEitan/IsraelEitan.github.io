---
name: adr-generator
description: >
  Architecture Decision Record (ADR) generator. Produces consistent, well-
  reasoned ADRs for every significant technical decision made during the
  pipeline. Covers format, decision quality standards, and when to write one.
when_to_use: >
  Use when architecture-planner or docs-agent documents a technical decision.
  Every ADR must capture context, decision, rationale, alternatives rejected,
  and consequences. ADRs are append-only — never delete, only supersede.
---

# ADR Generator

## When to Write an ADR

Write an ADR for decisions that are:
- **Hard to reverse** — database choice, auth strategy, API versioning
- **Affects multiple teams** — shared API contract, monorepo vs. polyrepo
- **Non-obvious** — any decision where "why didn't you just use X?" is likely
- **Architecture-level** — not implementation details

Do NOT write ADRs for:
- Library version bumps
- File naming conventions
- Routine bug fixes

---

## ADR Format

File: `docs/adr/ADR-{NNN}-{kebab-case-title}.md`
Numbering: sequential from 001, never reuse a number

```markdown
# ADR-{NNN}: {Decision Title}

**Date**: {YYYY-MM-DD}
**Status**: {Proposed | Accepted | Deprecated | Superseded by ADR-NNN}
**Deciders**: {Who made this decision — AI pipeline / Eitan Proshizki}
**Feature**: {Which feature/pipeline stage triggered this decision}

---

## Context

{What situation, problem, or constraint forced this decision?
Be specific — what would happen if no decision was made?
What constraints exist (technical, business, team, time)?}

## Decision

{What was decided, stated clearly in one or two sentences.
"We will use X for Y because Z."}

## Rationale

{Why this option was chosen.
What evidence or reasoning supports it?
Reference benchmarks, docs, or prior experience where possible.}

## Alternatives Considered

### Option A: {Name}
- **Description**: {What this option is}
- **Pros**: {advantages}
- **Cons**: {disadvantages}
- **Why rejected**: {specific reason}

### Option B: {Name}
- **Description**: {What this option is}
- **Pros**: {advantages}
- **Cons**: {disadvantages}
- **Why rejected**: {specific reason}

## Consequences

### Positive
- {What gets better, easier, or more reliable}

### Negative
- {What gets harder, more complex, or is a trade-off}

### Risks
- {What could go wrong — and how we'd detect/handle it}

## Review Trigger

{When should this decision be revisited?
e.g. "When monthly active users exceed 100k" or "When team grows beyond 5 engineers"}
```

---

## Example — Auth Strategy ADR

```markdown
# ADR-001: JWT with Short-Lived Access Tokens + Rotating Refresh Tokens

**Date**: 2026-05-17
**Status**: Accepted
**Deciders**: AI Pipeline (architecture-planner) / Eitan Proshizki
**Feature**: User Authentication System

---

## Context

The application requires stateless authentication that works across the web
frontend, future mobile app, and any third-party API integrations. Session-based
auth would require sticky sessions or a shared session store, complicating
horizontal scaling. We need a strategy that is stateless, revocable, and
secure enough for a production application handling user PII.

## Decision

We will use JWT access tokens (15 min expiry) paired with rotating refresh
tokens (7 day expiry, invalidated on use and stored in DB).

## Rationale

- 15-minute access tokens limit the window of exposure if a token is leaked
- Refresh token rotation detects token theft (if the old token is presented
  after rotation, it indicates compromise — invalidate all sessions)
- Storing refresh tokens in DB allows logout-all-devices functionality
- Stateless access tokens avoid a Redis dependency for most requests
- Industry standard pattern (Auth0, Okta use this approach)

## Alternatives Considered

### Option A: Session Cookies + Server-Side Sessions
- **Pros**: Simple revocation, no token expiry management
- **Cons**: Requires shared session store (Redis) for horizontal scaling;
  doesn't work natively for mobile or API clients
- **Why rejected**: Adds Redis as a required dependency before scale justifies it

### Option B: Long-Lived JWT (7 days, no refresh)
- **Pros**: Simpler implementation
- **Cons**: No revocation possible without a token blacklist; 7-day exposure
  window on token theft
- **Why rejected**: Unacceptable security risk for a user data application

## Consequences

### Positive
- Stateless — no DB hit on every authenticated request
- Works for web, mobile, and API clients identically
- Refresh token rotation detects compromise

### Negative
- Slightly more complex client implementation (token refresh logic)
- Refresh tokens must be stored in DB (small schema addition)
- Access token cannot be revoked mid-life (only 15 min window)

### Risks
- If JWT_SECRET is compromised, all tokens are compromised — mitigate with
  secret rotation procedure and short access token expiry

## Review Trigger

Revisit if we add OAuth/SSO requirements or exceed 10k concurrent users.
```

---

## ADR Index File

Maintain `docs/adr/README.md`:

```markdown
# Architecture Decision Records

| ADR | Title | Status | Date |
|---|---|---|---|
| [ADR-001](./ADR-001-jwt-auth-strategy.md) | JWT with Short-Lived Access + Rotating Refresh | Accepted | 2026-05-17 |
| [ADR-002](./ADR-002-postgresql-prisma.md) | PostgreSQL + Prisma ORM | Accepted | 2026-05-17 |
```

## Quality Checklist

Before finalising an ADR:
- [ ] Context explains WHY a decision was needed (not just WHAT was decided)
- [ ] At least 2 alternatives considered with specific rejection reasons
- [ ] Consequences include both positive AND negative
- [ ] Decision is stated in one clear sentence
- [ ] Review trigger defined
- [ ] ADR number is sequential and unique
