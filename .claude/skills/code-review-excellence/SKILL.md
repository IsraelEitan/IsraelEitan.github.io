---
name: code-review-excellence
description: >
  Code review standards for reviewing pull request diffs. Covers correctness,
  SOLID principles, security, performance, test coverage, naming, and PR
  description writing. Produces a structured review with severity-rated
  findings and a final recommendation.
when_to_use: >
  Use when pr-reviewer agent reviews a branch diff before merge. Read-only.
  Every finding must cite file:line, explain impact, and show the fix.
  End with a clear APPROVE, REQUEST CHANGES, or BLOCK verdict.
---

# Code Review Excellence

## What to Review — Priority Order

1. **Correctness** — Does it do what it's supposed to do?
2. **Security** — Does it introduce vulnerabilities?
3. **Tests** — Is the new code covered? Are tests meaningful?
4. **Architecture** — Does it respect layer boundaries and SOLID principles?
5. **Performance** — Any obvious N+1 queries, missing indexes, blocking calls?
6. **Naming & Readability** — Can a new team member understand this in 5 min?
7. **Error Handling** — Are all failure paths handled?

---

## SOLID Check — Quick Scan

```
Single Responsibility: Does each class/function do ONE thing?
  Red flag: "and", "also", "additionally" in a function name

Open/Closed: Can behaviour be extended without modifying existing code?
  Red flag: long switch/if-else chains on type — should be polymorphism

Liskov Substitution: Can subtypes replace base types without breaking things?
  Red flag: overriding a method to throw NotImplementedError

Interface Segregation: Are interfaces focused? No fat interfaces?
  Red flag: interface with 10+ methods, most implementations leave half empty

Dependency Inversion: Does high-level code depend on abstractions?
  Red flag: service directly instantiating repository with `new Repo()`
  (should be injected)
```

---

## Finding Severity

| Level | When | Action |
|---|---|---|
| **BLOCK** | Security vuln, data loss risk, broken auth, wrong DB constraint | Must fix before merge |
| **REQUEST CHANGES** | SOLID violation, missing error handling, missing test, bad naming | Must address |
| **SUGGESTION** | Performance improvement, code clarity, better pattern | Author decides |
| **PRAISE** | Good pattern, clean abstraction, well-named — say so | No action needed |

---

## Finding Format

```markdown
### [BLOCK] Missing ownership check — IDOR vulnerability

**File**: `src/routes/orders.ts:47`
**Code**:
```typescript
// Current — VULNERABLE
const order = await prisma.order.findUnique({ where: { id: params.id } })
```
**Issue**: Any authenticated user can retrieve any order by ID. No check that
the order belongs to the requesting user.

**Fix**:
```typescript
const order = await prisma.order.findFirst({
  where: { id: params.id, userId: req.user.id }  // ownership enforced
})
if (!order) throw new NotFoundError()  // same error for not-found and unauthorized
```
**Impact**: Any user can read any other user's order data.
```

---

## Test Coverage Review

For every new service method — check that tests exist for:
- [ ] Happy path (correct input → expected output)
- [ ] Invalid input (validation error)
- [ ] Business rule violation (conflict, not found, unauthorized)
- [ ] Edge case (empty list, zero, null optional field)

For every new API endpoint:
- [ ] Success status code (200/201/204)
- [ ] Every documented error status (400, 401, 403, 404, 409)
- [ ] Auth required — test with no token (401)

**If any of these are missing: REQUEST CHANGES.**

---

## PR Description Quality Check

A good PR description has all of these:

```markdown
## Problem
{What was broken, missing, or needed — why does this PR exist?}

## Solution
{What was built/changed and why this approach was chosen}

## Files Changed
- `src/routes/auth.ts` — added register + login endpoints
- `src/services/user.service.ts` — new UserService with createUser, login
- `src/repositories/user.repository.ts` — new UserRepository
- `prisma/migrations/...` — added user table

## Testing
- [x] Unit tests: UserService (8 tests)
- [x] Integration tests: POST /auth/register (3 tests), POST /auth/login (4 tests)
- [x] All tests passing: `npm test`
- [x] Build passing: `npm run build`

## Security
- Passwords hashed with bcrypt (12 rounds)
- Rate limiting: 10 req/min on auth endpoints
- Security report: PASS ✅

## Risks
- {What could go wrong in production}

## Rollback
- {How to revert safely if this breaks in production}
```

If the PR description is missing sections: add them before approving.

---

## Final Verdict

End every code review with exactly one of:

**✅ APPROVE** — No blocking issues. Suggestions noted but don't block merge.

**⚠️ REQUEST CHANGES** — Issues found that must be addressed. List them clearly.
Author should re-request review after fixing.

**❌ BLOCK** — Critical issue: security vulnerability, data integrity risk, or
broken functionality. Must not merge until resolved and re-reviewed.
