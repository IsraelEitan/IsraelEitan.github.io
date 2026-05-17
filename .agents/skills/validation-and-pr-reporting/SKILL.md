---
name: validation-and-pr-reporting
description: >
  Post-implementation validation commands and PR report format. Covers what
  to run after coding (build, lint, typecheck, tests), how to review the diff,
  and the exact format for the implementation report that pr-reviewer consumes.
when_to_use: >
  Use after all code changes are made. Run every applicable validation command,
  capture results, then produce the implementation report file.
---

# Validation and PR Reporting

## Validation sequence (run in this order)

```bash
# 1. Check what changed
git diff --stat HEAD

# 2. TypeScript (if TypeScript project)
npm run typecheck    # or: npx tsc --noEmit

# 3. Linting
npm run lint         # or: npx eslint src/

# 4. Tests
npm test             # all tests must pass
npm test -- --coverage  # check coverage didn't drop

# 5. Build
npm run build        # production build must succeed

# 6. Review diff
git diff main...HEAD  # final review of all changes
```

## If any step fails

DO NOT produce the report. Fix the failure first.
Never leave the codebase in a broken state.
Never skip a validation step to "save time".

## Implementation Report Format

File: `pipeline/{feature}/05-backend-implementation-report.md`
  OR: `pipeline/{feature}/06-frontend-implementation-report.md`

```markdown
# Implementation Report: {Feature} — {Layer}

## Scope Implemented
{List the plan steps that were implemented — copied from architecture plan}

## Out of Scope (not touched)
{List what was explicitly left for other agents or future PRs}

## Files Changed
| File | Change type | Description |
|---|---|---|
| `src/routes/auth.ts` | Created | POST /auth/register + POST /auth/login routes |
| `src/services/user.service.ts` | Created | UserService with createUser, login methods |
| `src/repositories/user.repository.ts` | Created | UserRepository with findByEmail, create |
| `prisma/schema.prisma` | Modified | Added User model |

## Endpoints Implemented
| Method | Path | Auth | Status codes |
|---|---|---|---|
| POST | /v1/auth/register | None | 201, 400, 409 |
| POST | /v1/auth/login | None | 200, 400, 401 |

## Validation Results
- TypeScript: ✅ 0 errors
- Lint: ✅ 0 warnings
- Tests: ✅ 14 passed, 0 failed
- Coverage: ✅ 87% (was 84%)
- Build: ✅ succeeded

## Suggested Commit Message
```
feat(auth): add user registration and login endpoints

- POST /v1/auth/register with bcrypt password hashing
- POST /v1/auth/login with JWT token generation
- Rate limiting: 10 req/min on both endpoints
- Zod validation on all inputs
- Unit tests: UserService (8 tests)
- Integration tests: auth routes (6 tests)
```

## Risks / Follow-ups
- {Any risks introduced by this implementation}
- {Any out-of-scope issues noticed that need a separate PR}

## Next Agent
test-writer — needs to write E2E and additional integration tests
```
