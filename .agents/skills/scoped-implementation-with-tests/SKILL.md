---
name: scoped-implementation-with-tests
description: >
  Rules for implementing only the approved scope from an architecture plan,
  with tests written alongside or immediately after each change. Prevents
  scope creep, gold-plating, and untested code from reaching PR.
when_to_use: >
  Use during any implementation phase. Every file change must map to an
  approved plan step. Every new function or endpoint must have a test.
---

# Scoped Implementation with Tests

## The Rule: Plan step → Code → Test. Repeat.

Never implement more than one plan step at a time.
After each step: write the test before moving to the next step.

## Scope verification checklist (before starting)

- [ ] Architecture plan exists: `pipeline/{feature}/03-architecture-plan.md`
- [ ] I have read and understand every step in the plan
- [ ] I know exactly which files will change
- [ ] I know what is explicitly OUT OF SCOPE

## What "scoped" means

If the architecture plan says: "Add POST /v1/auth/register endpoint"

✅ IN SCOPE:
- The route handler
- The service method it calls
- The repository method the service calls
- The Zod validation schema
- The unit test for the service
- The integration test for the endpoint

❌ OUT OF SCOPE (unless in the plan):
- Changing an unrelated endpoint
- Refactoring existing auth code "while I'm in there"
- Adding a feature that "seems related"
- Upgrading a dependency because it's outdated

## Implementation order per plan step

1. Read the specific plan step
2. Identify the exact files to change
3. Make the minimal correct change
4. Write/update tests for that change
5. Run tests: `npm test` or equivalent
6. Only move to next step if tests pass

## When you find something wrong "while in there"

Do NOT fix it in this PR. Instead:
1. Note it in the implementation report under "Follow-ups"
2. Suggest a separate chore PR for it
3. Continue with the approved scope

## Scope creep red flags

- "Since I'm already touching this file..."
- "It would be cleaner if I also..."
- "This other thing is broken and it'll only take a minute..."
- Adding more than 50% extra lines compared to what the plan described
