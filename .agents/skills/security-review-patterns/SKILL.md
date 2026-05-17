---
name: security-review-patterns
description: >
  Security review checklist and patterns for OWASP Top 10, secrets detection,
  authentication review, dependency CVE scanning, and input validation audit.
  Produces a security report with severity-rated findings and exact remediation.
when_to_use: >
  Use when security-agent audits implemented code before PR review. Read-only
  analysis — finds issues, does not fix them. Every finding must include
  file+line evidence, impact, and a concrete remediation code example.
---

# Security Review Patterns

## OWASP Top 10 — 2021 Checklist

### A01 — Broken Access Control
```
Checks:
□ Every protected route has auth middleware applied
□ Resource ownership verified: user can only access their own data
  e.g. GET /orders/:id must verify order.userId === req.user.id
□ Admin-only endpoints have role check, not just auth check
□ No direct object references without ownership check (IDOR)
□ CORS configured restrictively — not wildcard (*) in production

grep patterns:
  rg "findUnique|findFirst" --type ts  → check each has userId filter
  rg "req\.params\.id" --type ts       → verify ownership check nearby
  rg "cors\(\)" --type ts              → verify not cors({ origin: '*' })
```

### A02 — Cryptographic Failures
```
Checks:
□ Passwords hashed with bcrypt/argon2 — NEVER md5/sha1/sha256
□ bcrypt rounds >= 12 (not 10)
□ JWT signed with strong secret (>= 32 chars), not hardcoded
□ JWT has expiry (exp claim) set
□ No PII (email, name, SSN) in JWT payload beyond user ID
□ Sensitive data not logged: passwords, tokens, card numbers
□ HTTPS enforced — no http:// internal redirects in prod

grep patterns:
  rg "md5|sha1|sha256|createHash" --type ts  → flag all non-bcrypt hashing
  rg "bcrypt" --type ts                       → verify rounds >= 12
  rg "sign\(|jwt\.sign" --type ts             → verify expiresIn is set
  rg "console\.log.*password|console\.log.*token" --type ts → data leak
```

### A03 — Injection
```
Checks:
□ No raw SQL string concatenation — use parameterized queries / Prisma
□ No eval(), new Function(), or dynamic require() with user input
□ File paths not constructed from user input without sanitization
□ Shell commands not constructed from user input

grep patterns:
  rg "prisma\.\$queryRaw|prisma\.\$executeRaw" --type ts → verify params
  rg "eval\(|new Function\(" --type ts                   → flag all
  rg "exec\(|execSync\(" --type ts                       → flag shell calls
```

### A04 — Insecure Design
```
Checks:
□ Password reset tokens are single-use (marked used_at after use)
□ Password reset tokens expire (not valid forever)
□ Email enumeration prevented (same response for existing/non-existing user)
□ Rate limiting on: /login, /register, /forgot-password, /reset-password
□ Account lockout after N failed attempts (or CAPTCHA)
```

### A05 — Security Misconfiguration
```
Checks:
□ No debug mode / verbose errors exposed in production responses
□ Stack traces not returned to client in error responses
□ Default credentials not present anywhere
□ Unnecessary HTTP methods disabled
□ Security headers set: X-Content-Type-Options, X-Frame-Options,
  Content-Security-Policy, Strict-Transport-Security

grep patterns:
  rg "NODE_ENV|process\.env\.DEBUG" --type ts → verify prod handling
  rg "stack|stackTrace" --type ts             → verify not in responses
```

### A06 — Vulnerable & Outdated Components
```bash
# Run and capture output
npm audit --audit-level=high

# Check for critical/high CVEs
npm audit --json | jq '.vulnerabilities | to_entries[] |
  select(.value.severity == "high" or .value.severity == "critical")'
```

### A07 — Identification & Authentication Failures
```
Checks:
□ Login endpoint rate-limited (e.g. 10 req/min per IP)
□ Brute-force protection on password reset
□ JWT refresh tokens rotated on use (old one invalidated)
□ Session invalidated on logout (token blacklist or short expiry)
□ Passwords meet minimum complexity (length >= 8, ideally 12)
□ "Remember me" uses secure, HttpOnly cookies — not localStorage
```

### A08 — Software & Data Integrity Failures
```
Checks:
□ No user-controlled data used to construct file paths for require/import
□ Webhook signatures verified before processing
□ No untrusted data passed to deserializers
```

### A09 — Security Logging & Monitoring Failures
```
Checks:
□ Failed login attempts logged with IP, timestamp, username (not password)
□ Successful logins logged
□ Password changes, email changes logged
□ Admin actions logged
□ Logs do NOT contain passwords, tokens, card numbers, SSNs

grep patterns:
  rg "logger\.|fastify\.log\." --type ts → verify auth events logged
```

### A10 — Server-Side Request Forgery (SSRF)
```
Checks:
□ Any user-provided URLs are validated against allowlist before fetch
□ Internal IP ranges (127.x, 10.x, 192.168.x) blocked in URL validator
□ Redirect URLs validated against allowlist
```

---

## Secrets Detection

```bash
# Check for hardcoded secrets
rg "password\s*=\s*['\"](?!process\.env)" --type ts
rg "secret\s*=\s*['\"](?!process\.env)" --type ts
rg "api[_-]?key\s*=\s*['\"](?!process\.env)" --type ts
rg "token\s*=\s*['\"](?!process\.env)" --type ts
rg "DATABASE_URL\s*=\s*postgres" --type ts  # real connection string

# Check .env files aren't committed
git ls-files .env .env.local .env.production
```

---

## Severity Levels

| Level | Definition | Action required |
|---|---|---|
| **CRITICAL** | Exploitable remotely, no auth needed, data breach risk | Block PR — must fix |
| **HIGH** | Exploitable with auth, significant data/system impact | Block PR — must fix |
| **MEDIUM** | Exploitable with specific conditions, moderate impact | Fix before next release |
| **LOW** | Defense-in-depth, minimal direct impact | Fix in backlog |
| **INFO** | Best practice suggestion, no direct exploit | Optional |

---

## Report Format

For each finding:
```markdown
### [CRITICAL] Finding Title

- **File**: `src/routes/auth.ts:47`
- **Description**: The password reset endpoint does not invalidate tokens
  after use. An attacker who intercepts a reset link can reuse it indefinitely.
- **Impact**: Full account takeover without knowing current password.
- **Remediation**:
  ```typescript
  // After successful reset, mark token as used
  await prisma.passwordResetToken.update({
    where: { id: token.id },
    data: { usedAt: new Date() }
  })
  // At token validation, check: if (token.usedAt) throw new Error('Token already used')
  ```
- **Reference**: OWASP A04:2021 — Insecure Design
```

## Final Verdict

End every security report with ONE of:
- **✅ PASS** — no CRITICAL or HIGH findings. Safe for PR review.
- **⚠️ PASS WITH CONDITIONS** — MEDIUM findings only. List what must be tracked.
- **❌ FAIL** — CRITICAL or HIGH findings present. Must fix before PR.
