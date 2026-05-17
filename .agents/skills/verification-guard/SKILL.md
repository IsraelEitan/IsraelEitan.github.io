---
name: verification-guard
description: >
  Retry and self-healing protocol for build agents. Defines how to validate
  output after each implementation step, how to analyze failures, how to
  attempt fixes autonomously, and when to escalate to a human.
  Maximum 3 retry attempts per validation gate. Never retry indefinitely.
when_to_use: >
  Use in every build agent (backend-builder, frontend-builder, test-writer,
  e2e-tester, schema-designer, devops-agent) after any code change.
  Read-only agents (auditor, planner, security, pr-reviewer) do not retry.
---

# Verification Guard — Retry Protocol

## Core principle

Every code change gets validated immediately. If validation fails, the agent
attempts to fix and re-validate — up to 3 times. After 3 failures, the agent
stops, writes a BLOCKER report, and surfaces the problem to the human.

**Never retry infinitely. 3 attempts maximum.**

---

## The Retry Loop

```
ATTEMPT 1
  → Make the change
  → Run validation gate
  → PASS? → Write output report → Done ✅
  → FAIL? → Read the error output carefully
           → Diagnose root cause
           → Apply targeted fix
           → ATTEMPT 2

ATTEMPT 2
  → Run validation gate again
  → PASS? → Write output report → note "fixed on attempt 2" ✅
  → FAIL? → Is this the same error or a new one?
           → Same → try a different fix strategy
           → New → diagnose new error
           → Apply fix
           → ATTEMPT 3

ATTEMPT 3
  → Run validation gate again
  → PASS? → Write output report → note "fixed on attempt 3" ✅
  → FAIL? → STOP. Write BLOCKER REPORT. Surface to human. ❌
```

---

## Validation gates by agent

### backend-builder
After each endpoint or service method:
```bash
npm run typecheck    # 0 type errors required
npm run lint         # 0 lint errors required
npm test             # all tests must pass
npm run build        # build must succeed
```

### frontend-builder
After each component or page:
```bash
npm run typecheck    # 0 type errors required
npm run build        # build must succeed (catches all import/prop errors)
npm run lint         # 0 lint errors
```

### test-writer
After writing each test file:
```bash
npm test -- {test-file-path}   # that specific test must pass
npm test                        # full suite must still pass (no regressions)
```

### e2e-tester
After writing each spec:
```bash
npx playwright test {spec-file}  # run headless, must pass
npx playwright test              # full E2E suite (for regressions)
```

### schema-designer
After writing migration SQL:
```bash
# Validate SQL syntax before applying
npx prisma validate              # schema file valid
npx prisma migrate deploy --preview-feature  # dry-run if available
# Only apply after human confirms
```

### devops-agent
After writing GitHub Actions YAML:
```bash
# Validate YAML syntax
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))"
# Or use actionlint if installed:
actionlint .github/workflows/ci.yml
```

---

## Error diagnosis rules

### TypeScript errors
```
Read the FULL error message — not just the first line.
TS2345: Argument of type X is not assignable to parameter of type Y
→ Fix: Check the function signature. Update the call site or the type.
TS2304: Cannot find name 'X'
→ Fix: Add the import. Check the export exists.
TS7006: Parameter 'X' implicitly has an 'any' type
→ Fix: Add explicit type annotation.
```

### Test failures
```
Expected: X  Received: Y
→ Fix: Either the assertion is wrong OR the implementation is wrong.
       Read both the test AND the implementation before deciding which to fix.
       Never change an assertion just to make a test pass — fix the code.

Cannot find module './X'
→ Fix: Check the import path. Verify the file exists. Check case sensitivity.

Timeout exceeded
→ Fix: Check for missing await. Check for unresolved promises.
        Check for real network calls in unit tests (mock them).
```

### Build failures
```
Module not found: Can't resolve 'X'
→ Fix: Install the package (npm install X) or fix the import path.

SyntaxError: Unexpected token
→ Fix: Syntax error in the file — read the line number carefully.

Type error in production build but not typecheck
→ Fix: Run typecheck again — it may have been a false pass.
```

---

## What NOT to retry

Immediately escalate to human (do not retry):

```
❌ Missing environment variable (process.env.X is undefined)
   → Human must set the env var. Cannot be fixed in code.

❌ Database connection refused
   → Database is not running or credentials wrong. Human issue.

❌ Authentication failure (401 from external API)
   → Credentials expired or wrong. Human must rotate.

❌ Dependency conflict (ERESOLVE)
   → Package version conflict. Human must resolve manually.

❌ Port already in use
   → Human must kill the conflicting process.
```

---

## BLOCKER REPORT format

When all 3 attempts fail, write this to the implementation report:

```markdown
## ⛔ BLOCKER — Requires Human Intervention

**What I tried to build**: {describe the change}

**Validation gate that failed**: {npm test / npm run build / etc.}

**Attempts made**:
1. Attempt 1: {what I tried} → {exact error}
2. Attempt 2: {what I tried} → {exact error}
3. Attempt 3: {what I tried} → {exact error}

**Root cause assessment**: {my best diagnosis of why this keeps failing}

**What the human needs to do**:
- {specific action required}
- {e.g., "Set DATABASE_URL in .env", "Install missing package X", etc.}

**Files I changed** (may need review/revert):
- {list files}

**Suggested next step**: {once human resolves the blocker, which step to retry}
```

---

## Retry budget tracking

In the implementation report, always note how many attempts were needed:

```markdown
## Validation
- TypeScript: ✅ PASS (attempt 1)
- Tests: ✅ PASS (attempt 2 — fixed missing mock for UserRepository)
- Build: ✅ PASS (attempt 1)
```

This creates an audit trail and helps improve the pipeline over time.
