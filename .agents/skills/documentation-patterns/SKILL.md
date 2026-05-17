---
name: documentation-patterns
description: >
  Documentation patterns for README sections, OpenAPI/Swagger YAML, CHANGELOG
  entries (Keep a Changelog format), JSDoc/docstrings, and environment variable
  docs. All documentation must reflect actual implemented code — never speculate.
when_to_use: >
  Use when docs-agent writes any documentation. Always read the actual source
  files before writing docs. Use these templates to ensure consistency and
  completeness across all documentation types.
---

# Documentation Patterns

## Rule #1: Read Before You Write

Before writing any documentation:
1. Read the actual implementation files
2. Read the implementation report from the builder agent
3. Verify every endpoint, parameter, and behaviour against the real code
4. Never document what isn't there. Never omit what is.

---

## README Structure

Every feature adds a section to README.md:

```markdown
## {Feature Name}

### Overview
{One paragraph — what this feature does for the end user. No jargon.}

### API Reference

#### {Method} {/path}
{Brief description}

**Authentication**: {None | Bearer JWT required}
**Rate limit**: {e.g. 10 req/min per IP}

**Request body** (for POST/PUT/PATCH):
| Field | Type | Required | Description |
|---|---|---|---|
| `email` | string (email) | Yes | User's email address |
| `password` | string, min 8 chars | Yes | Plain text — hashed server-side |

**Response 201**:
```json
{
  "data": {
    "id": "clx1234",
    "email": "user@example.com",
    "name": "Eitan Proshizki",
    "createdAt": "2026-05-17T10:00:00Z"
  }
}
```

**Errors**:
| Status | Code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Invalid input format |
| 409 | `CONFLICT` | Email already registered |

### Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `JWT_SECRET` | Yes | — | Min 32 chars. Used to sign access tokens. |
| `JWT_ACCESS_EXPIRES_IN` | No | `15m` | Access token lifetime |
| `JWT_REFRESH_EXPIRES_IN` | No | `7d` | Refresh token lifetime |

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your values

# 3. Run database migrations
npx prisma migrate dev

# 4. Start development server
npm run dev
# API available at http://localhost:3000
```

### Running Tests

```bash
# Unit + integration tests
npm test

# With coverage report
npm test -- --coverage

# E2E tests (requires running server)
npx playwright test
```
```

---

## OpenAPI 3.1 YAML Pattern

File: `docs/api.yaml` or `openapi.yaml`

```yaml
openapi: 3.1.0
info:
  title: {App Name} API
  version: 1.0.0
  description: |
    {One paragraph describing the API purpose}

    **Base URL**: `https://api.yourdomain.com/v1`
    **Authentication**: Bearer JWT — include `Authorization: Bearer {token}` header

servers:
  - url: http://localhost:3000/v1
    description: Local development
  - url: https://api.yourdomain.com/v1
    description: Production

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    Error:
      type: object
      required: [error]
      properties:
        error:
          type: object
          required: [code, message]
          properties:
            code:
              type: string
              example: VALIDATION_ERROR
            message:
              type: string
              example: Request validation failed
            issues:
              type: array
              items:
                type: object
                properties:
                  field: { type: string }
                  message: { type: string }

    Pagination:
      type: object
      properties:
        total: { type: integer }
        limit: { type: integer }
        offset: { type: integer }
        hasMore: { type: boolean }

paths:
  /auth/register:
    post:
      summary: Register a new user
      operationId: registerUser
      tags: [Authentication]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password, name]
              properties:
                email:
                  type: string
                  format: email
                  example: user@example.com
                password:
                  type: string
                  minLength: 8
                  example: SecurePass123!
                name:
                  type: string
                  minLength: 1
                  maxLength: 100
                  example: Eitan Proshizki
      responses:
        '201':
          description: User registered successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    $ref: '#/components/schemas/UserResponse'
        '400':
          description: Validation error
          content:
            application/json:
              schema: { $ref: '#/components/schemas/Error' }
        '409':
          description: Email already registered
          content:
            application/json:
              schema: { $ref: '#/components/schemas/Error' }
```

---

## CHANGELOG — Keep a Changelog Format

File: `CHANGELOG.md` — always updated, never deleted.

```markdown
# Changelog

All notable changes to this project will be documented in this file.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)

## [Unreleased]

### Added
- User authentication system: registration, login, JWT tokens, password reset (#1)
- Protected dashboard page with JWT auth middleware
- Rate limiting on all auth endpoints (10 req/min per IP)

### Changed
- Nothing yet

### Fixed
- Nothing yet

## [1.0.0] — 2026-05-17

### Added
- Initial project setup
- Health check endpoint (`GET /health`)
- PostgreSQL + Prisma configuration

[Unreleased]: https://github.com/yourorg/yourrepo/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/yourorg/yourrepo/releases/tag/v1.0.0
```

**CHANGELOG rules:**
- Entries go in `[Unreleased]` during development
- On release: rename `[Unreleased]` to `[X.Y.Z] — YYYY-MM-DD`
- Categories: Added / Changed / Deprecated / Removed / Fixed / Security
- Link PRs/issues when referencing changes: `(#123)`

---

## JSDoc Patterns (TypeScript)

```typescript
/**
 * Creates a new user with hashed password.
 *
 * @param data - User creation data (plain text password — hashed internally)
 * @returns Created user data without password hash
 * @throws {ConflictError} If email is already registered
 * @throws {ValidationError} If data fails schema validation
 *
 * @example
 * const user = await userService.createUser({
 *   email: 'user@example.com',
 *   password: 'SecurePass123!',
 *   name: 'Eitan Proshizki'
 * })
 * // user.password is undefined — never returned
 */
async createUser(data: CreateUserDto): Promise<UserDto> { ... }
```

**When to add JSDoc:**
- All public service methods
- All exported utility functions
- Complex business logic where intent isn't obvious

**When NOT to add JSDoc:**
- Private methods with self-explanatory names
- Simple getters/setters
- Trivial one-liners

---

## Documentation Output Checklist

For each feature, docs-agent must produce:

- [ ] README section added with API reference and environment variables
- [ ] OpenAPI YAML updated for all new endpoints
- [ ] ADR written for every archi