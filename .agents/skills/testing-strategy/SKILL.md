---
name: testing-strategy
description: >
  Comprehensive testing strategy covering unit, integration, and contract
  testing for Node.js/TypeScript backends and React/Next.js frontends.
  Covers what to test at each layer, mock patterns, test data factories,
  and coverage targets.
when_to_use: >
  Use when test-writer agent writes tests for any layer. Defines what belongs
  at each test level, how to mock dependencies, how to structure test data,
  and what coverage means for this pipeline.
---

# Testing Strategy

## The Testing Trophy (not pyramid)

```
        /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
       /   E2E Tests (few)   \    ← Playwright — critical journeys only
      /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
     / Integration Tests (many)\  ← API endpoints, DB queries, service ↔ repo
    /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
   /  Unit Tests (some)          \  ← Pure business logic, validators, utils
  /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
 /   Static Analysis (always)      \  ← TypeScript, ESLint, Zod schemas
```

**Key insight:** More integration tests than unit tests. Integration tests catch
real bugs. Unit tests catch logic bugs in isolation. Both matter.

---

## Layer 1: Static Analysis (always on)

Not "tests" — but catches the most bugs for free.

- **TypeScript strict mode** (`"strict": true` in tsconfig)
- **ESLint** with `@typescript-eslint/recommended`
- **Zod schemas** validate all external input at runtime
- **Prisma** validates DB queries at compile time

---

## Layer 2: Unit Tests — what belongs here

Unit tests cover **pure logic** that has no external dependencies.

### ✅ Unit test these
- Service methods that contain business logic
- Utility functions (date formatting, string manipulation, calculation)
- Validators and transformers
- Error handling logic
- DTO mapping functions

### ❌ Do NOT unit test these
- Database queries (test with real DB in integration)
- HTTP routing (test via integration)
- Framework wiring (Fastify plugins, middleware registration)

### Unit test pattern (Jest/Vitest)

```typescript
// services/__tests__/pricing.service.test.ts
import { PricingService } from '../pricing.service'

describe('PricingService', () => {
  let service: PricingService

  beforeEach(() => {
    service = new PricingService()
  })

  describe('calculateDiscount', () => {
    it('applies 10% discount for orders over $100', () => {
      expect(service.calculateDiscount(150)).toBe(15)
    })

    it('applies no discount for orders under $100', () => {
      expect(service.calculateDiscount(50)).toBe(0)
    })

    it('throws for negative amounts', () => {
      expect(() => service.calculateDiscount(-1)).toThrow('Amount must be positive')
    })
  })
})
```

### Mock pattern for services with dependencies

```typescript
// Create a mock repository in __mocks__/
export class MockUserRepository {
  findByEmail = jest.fn()
  create = jest.fn()
  findById = jest.fn()
  update = jest.fn()
  delete = jest.fn()
}

// Use in test
describe('UserService', () => {
  let service: UserService
  let mockRepo: MockUserRepository

  beforeEach(() => {
    mockRepo = new MockUserRepository()
    service = new UserService(mockRepo as any)
  })

  it('throws ConflictError when email already exists', async () => {
    mockRepo.findByEmail.mockResolvedValueOnce({ id: '1', email: 'x@y.com' })

    await expect(
      service.createUser({ email: 'x@y.com', password: 'pass', name: 'X' })
    ).rejects.toThrow('Email already in use')
  })

  it('never leaks password hash in returned user', async () => {
    mockRepo.findByEmail.mockResolvedValueOnce(null)
    mockRepo.create.mockResolvedValueOnce({
      id: '1', email: 'x@y.com', name: 'X', password: '$2b$hash'
    })

    const result = await service.createUser({
      email: 'x@y.com', password: 'password123', name: 'X'
    })
    expect(result).not.toHaveProperty('password')
  })
})
```

---

## Layer 3: Integration Tests — most important layer

Integration tests verify **real behaviour** end-to-end through the HTTP layer
using a real (test) database. These catch the most actual bugs.

### Setup: real test database

```typescript
// jest.setup.ts
import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient({
  datasources: { db: { url: process.env.TEST_DATABASE_URL } }
})

beforeEach(async () => {
  // Clean DB between tests — order matters for FK constraints
  await prisma.$transaction([
    prisma.session.deleteMany(),
    prisma.passwordResetToken.deleteMany(),
    prisma.user.deleteMany(),
  ])
})

afterAll(async () => {
  await prisma.$disconnect()
})
```

### API integration test pattern (Fastify)

```typescript
// routes/__tests__/auth.integration.test.ts
import { buildApp } from '../../app'
import { prisma } from '../../test-setup'

describe('POST /v1/auth/register', () => {
  let app: FastifyInstance

  beforeAll(async () => { app = await buildApp() })
  afterAll(async () => { await app.close() })

  it('201 — creates user and returns data (no password)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/auth/register',
      payload: { email: 'new@test.com', password: 'Password123!', name: 'Test' }
    })

    expect(res.statusCode).toBe(201)
    const body = res.json()
    expect(body.data.email).toBe('new@test.com')
    expect(body.data).not.toHaveProperty('password')

    // Verify actually saved to DB
    const dbUser = await prisma.user.findUnique({ where: { email: 'new@test.com' } })
    expect(dbUser).not.toBeNull()
    expect(dbUser!.password).not.toBe('Password123!')  // must be hashed
  })

  it('400 — returns VALIDATION_ERROR on invalid email', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/auth/register',
      payload: { email: 'not-an-email', password: 'Password123!', name: 'X' }
    })
    expect(res.statusCode).toBe(400)
    expect(res.json().error.code).toBe('VALIDATION_ERROR')
  })

  it('409 — returns CONFLICT on duplicate email', async () => {
    // First registration
    await app.inject({
      method: 'POST', url: '/v1/auth/register',
      payload: { email: 'dup@test.com', password: 'Password123!', name: 'X' }
    })
    // Second registration with same email
    const res = await app.inject({
      method: 'POST', url: '/v1/auth/register',
      payload: { email: 'dup@test.com', password: 'Password123!', name: 'Y' }
    })
    expect(res.statusCode).toBe(409)
    expect(res.json().error.code).toBe('CONFLICT')
  })

  it('401 — protected endpoint rejects missing token', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/v1/dashboard',
      // No Authorization header
    })
    expect(res.statusCode).toBe(401)
  })
})
```

### Test data factory pattern

```typescript
// factories/user.factory.ts
import { prisma } from '../test-setup'
import bcrypt from 'bcrypt'

interface CreateUserOptions {
  email?: string
  password?: string
  name?: string
  isActive?: boolean
}

export async function createTestUser(opts: CreateUserOptions = {}) {
  const password = opts.password || 'TestPassword123!'
  return prisma.user.create({
    data: {
      email: opts.email || `test-${Date.now()}@example.com`,
      password: await bcrypt.hash(password, 12),
      name: opts.name || 'Test User',
      isActive: opts.isActive ?? true,
    }
  })
}

export async function createAuthenticatedRequest(app: FastifyInstance, opts = {}) {
  const user = await createTestUser(opts)
  const loginRes = await app.inject({
    method: 'POST',
    url: '/v1/auth/login',
    payload: { email: user.email, password: 'TestPassword123!' }
  })
  const { token } = loginRes.json().data
  return { user, token, authHeader: `Bearer ${token}` }
}
```

---

## Layer 4: Frontend Component Tests

```typescript
// components/__tests__/LoginForm.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { LoginForm } from '../LoginForm'
import * as authApi from '../../api/auth'

vi.mock('../../api/auth')

describe('LoginForm', () => {
  it('shows email validation error when submitted empty', async () => {
    render(<LoginForm onSuccess={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    expect(screen.getByText(/email is required/i)).toBeInTheDocument()
  })

  it('shows loading state while submitting', async () => {
    vi.mocked(authApi.login).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    )
    render(<LoginForm onSuccess={vi.fn()} />)
    await userEvent.type(screen.getByLabelText(/email/i), 'user@test.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
  })

  it('calls onSuccess after successful login', async () => {
    const onSuccess = vi.fn()
    vi.mocked(authApi.login).mockResolvedValueOnce({ token: 'jwt' })
    render(<LoginForm onSuccess={onSuccess} />)
    await userEvent.type(screen.getByLabelText(/email/i), 'user@test.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await screen.findByText(/welcome/i)
    expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({ token: 'jwt' }))
  })
})
```

---

## Coverage Targets

| Layer | Target | Measured by |
|---|---|---|
| Service methods | 90%+ line coverage | Jest --coverage |
| API endpoints | 100% — every status code | Integration test count |
| React components | 80%+ — all user interactions | Vitest coverage |
| Utils/validators | 100% | Jest --coverage |
| E2E journeys | All critical paths | Manual checklist |

## Test Naming Convention

```
Unit:        {method}_{condition}_{expectedOutcome}
             calculateDiscount_overHundred_returnsTenPercent

Integration: {METHOD} {/path}_{condition}_{statusCode}
             POST /auth/register_duplicateEmail_returns409

Component:   {component}_{action}_{expectedBehavior}
             LoginForm_submitWithEmptyEmail_showsValidationError
```
