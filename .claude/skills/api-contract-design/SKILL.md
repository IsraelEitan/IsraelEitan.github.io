---
name: api-contract-design
description: >
  API contract design rules. Covers RESTful conventions, OpenAPI 3.1 spec
  generation, versioning strategy, request/response shapes, error formats,
  pagination, authentication headers, and rate limiting headers.
when_to_use: >
  Use during architecture planning when API endpoints need to be defined
  before backend or frontend implementation starts. The contract is the
  single source of truth for both builders.
---

# API Contract Design Skill

## REST Conventions

### URL design
- Resources are plural nouns: `/users`, `/posts`, `/orders`
- Nested resources for clear ownership: `/users/{id}/posts`
- Max 2 levels of nesting — avoid `/users/{id}/posts/{postId}/comments/{commentId}`
- Use query params for filtering/sorting/pagination — not path params
- Actions that don't map to CRUD: use verb suffix `/users/{id}/activate`

### HTTP methods
| Method | Use | Idempotent |
|---|---|---|
| GET | Read resource(s) | Yes |
| POST | Create resource | No |
| PUT | Replace entire resource | Yes |
| PATCH | Partial update | No |
| DELETE | Delete resource | Yes |

### HTTP status codes — use precisely
| Code | When |
|---|---|
| 200 | Successful GET, PUT, PATCH |
| 201 | Successful POST (resource created) |
| 204 | Successful DELETE (no body) |
| 400 | Validation error (bad input) |
| 401 | Not authenticated (no/bad token) |
| 403 | Authenticated but not authorized |
| 404 | Resource not found |
| 409 | Conflict (duplicate email, etc.) |
| 422 | Semantically invalid (passes schema but fails business rules) |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Standard Response Shapes

### Success — single resource
```json
{
  "data": {
    "id": "clx1234",
    "email": "eitan@example.com",
    "name": "Eitan Proshizki",
    "createdAt": "2026-05-17T10:00:00Z"
  }
}
```

### Success — list with pagination
```json
{
  "data": [...],
  "pagination": {
    "total": 142,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

### Error — all errors use this shape
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "issues": [
      { "field": "email", "message": "Invalid email format" },
      { "field": "password", "message": "Must be at least 8 characters" }
    ]
  }
}
```

### Error codes (machine-readable)
```
VALIDATION_ERROR     — 400, input failed schema validation
UNAUTHORIZED         — 401, missing or invalid auth token
FORBIDDEN            — 403, authenticated but insufficient permissions
NOT_FOUND            — 404, resource does not exist
CONFLICT             — 409, duplicate or state conflict
RATE_LIMITED         — 429, too many requests
INTERNAL_ERROR       — 500, unexpected server error
```

---

## Versioning Strategy

### URL versioning (preferred for breaking changes)
```
/v1/users
/v2/users   ← breaking change in response shape
```

### Rules
- Never modify a released API version's response shape (breaking)
- Adding fields is non-breaking — always safe
- Removing fields is breaking — requires new version
- Deprecate old versions with `Deprecation` response header
- Support old version for minimum 6 months after new version ships

---

## OpenAPI 3.1 Spec Pattern

Produce a spec file at: `pipeline/{feature}/api-contract.yaml`

```yaml
openapi: 3.1.0
info:
  title: {App Name} API
  version: 1.0.0
  description: {Brief description}

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
            code: { type: string }
            message: { type: string }
            issues:
              type: array
              items:
                type: object
                properties:
                  field: { type: string }
                  message: { type: string }

    UserResponse:
      type: object
      required: [id, email, name, createdAt]
      properties:
        id: { type: string }
        email: { type: string, format: email }
        name: { type: string }
        createdAt: { type: string, format: date-time }

paths:
  /users:
    post:
      summary: Register a new user
      operationId: createUser
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password, name]
              properties:
                email: { type: string, format: email }
                password: { type: string, minLength: 8 }
                name: { type: string, minLength: 1, maxLength: 100 }
      responses:
        '201':
          description: User created
          content:
            application/json:
              schema:
                properties:
                  data: { $ref: '#/components/schemas/UserResponse' }
        '400':
          description: Validation error
          content:
            application/json:
              schema: { $ref: '#/components/schemas/Error' }
        '409':
          description: Email already in use
          content:
            application/json:
              schema: { $ref: '#/components/schemas/Error' }
```

---

## Required Headers

### Auth endpoints must set
```
Authorization: Bearer {jwt}        # client sends on all protected requests
X-Request-ID: {uuid}               # for tracing — server generates if absent
```

### Rate limiting — server must return
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 97
X-RateLimit-Reset: 1716000000
```

---

## Contract Design Checklist

Before the contract is handed to builders:
- [ ] Every endpoint has a defined request schema
- [ ] Every endpoint has success and error response schemas
- [ ] All error codes are documented
- [ ] Auth requirements are marked per endpoint
- [ ] Pagination defined for all list endpoints
- [ ] Rate limits documented
- [ ] OpenAPI YAML is valid (parseable)
- [ ] Frontend team has reviewed — no surprises
