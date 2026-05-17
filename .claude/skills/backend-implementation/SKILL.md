---
name: backend-implementation
description: >
  Backend implementation patterns for Node.js/TypeScript (Fastify/Express)
  and Python (FastAPI). Covers service/repository layering, validation,
  error handling, auth middleware, and background jobs.
when_to_use: >
  Use when writing or modifying backend API routes, service classes,
  repository layer, middleware, auth logic, or background jobs.
  Requires an approved architecture plan as input.
---

# Backend Implementation Skill

## Core Architecture: Layered Design

Always implement in this order and separation:

```
HTTP Layer (Routes/Controllers)
    ↓ validates input, calls service
Service Layer (Business Logic)
    ↓ orchestrates, applies business rules
Repository Layer (Data Access)
    ↓ queries database only, no business logic
Database (PostgreSQL / MySQL / MongoDB)
```

### Rules
- Routes only: parse request, validate input shape, call service, return response
- Services only: business logic, no direct DB calls, no HTTP concerns
- Repositories only: database queries, no business logic
- Never bypass layers (route calling DB directly is forbidden)

---

## Node.js / TypeScript Patterns (Fastify preferred)

### Project structure
```
src/
├── routes/          # HTTP handlers, input validation (Zod)
├── services/        # Business logic
├── repositories/    # Database queries (Prisma)
├── middleware/      # Auth, logging, error handler
├── schemas/         # Zod schemas (shared input/output types)
├── types/           # TypeScript type definitions
├── utils/           # Pure utility functions
└── config/          # Environment config (zod-validated)
```

### Route pattern (Fastify)
```typescript
// routes/users.ts
import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { UserService } from '../services/user.service'

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100),
})

const usersPlugin: FastifyPluginAsync = async (fastify) => {
  const userService = new UserService(fastify.prisma)

  fastify.post('/users', async (request, reply) => {
    const body = createUserSchema.parse(request.body)
    const user = await userService.createUser(body)
    return reply.status(201).send(user)
  })
}
export default usersPlugin
```

### Service pattern
```typescript
// services/user.service.ts
import { PrismaClient } from '@prisma/client'
import { UserRepository } from '../repositories/user.repository'
import { hashPassword } from '../utils/crypto'
import { ConflictError } from '../utils/errors'

export class UserService {
  private repo: UserRepository

  constructor(prisma: PrismaClient) {
    this.repo = new UserRepository(prisma)
  }

  async createUser(data: CreateUserDto): Promise<UserDto> {
    const existing = await this.repo.findByEmail(data.email)
    if (existing) throw new ConflictError('Email already in use')
    const hashed = await hashPassword(data.password)
    const user = await this.repo.create({ ...data, password: hashed })
    return this.toDto(user)
  }

  private toDto(user: User): UserDto {
    const { password, ...dto } = user  // never leak password hash
    return dto
  }
}
```

### Repository pattern
```typescript
// repositories/user.repository.ts
import { PrismaClient, User } from '@prisma/client'

export class UserRepository {
  constructor(private prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } })
  }

  async create(data: CreateUserData): Promise<User> {
    return this.prisma.user.create({ data })
  }
}
```

### Error handling
```typescript
// utils/errors.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string
  ) { super(message) }
}
export class NotFoundError extends AppError {
  constructor(msg = 'Not found') { super(msg, 404, 'NOT_FOUND') }
}
export class ConflictError extends AppError {
  constructor(msg = 'Conflict') { super(msg, 409, 'CONFLICT') }
}
export class UnauthorizedError extends AppError {
  constructor(msg = 'Unauthorized') { super(msg, 401, 'UNAUTHORIZED') }
}
export class ValidationError extends AppError {
  constructor(msg = 'Validation failed') { super(msg, 400, 'VALIDATION_ERROR') }
}
```

### Global error handler (Fastify)
```typescript
fastify.setErrorHandler((error, request, reply) => {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: { code: error.code, message: error.message }
    })
  }
  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: { code: 'VALIDATION_ERROR', issues: error.issues }
    })
  }
  fastify.log.error(error)
  return reply.status(500).send({
    error: { code: 'INTERNAL_ERROR', message: 'Internal server error' }
  })
})
```

---

## Python / FastAPI Patterns

### Project structure
```
app/
├── api/             # Routers (FastAPI APIRouter)
├── services/        # Business logic
├── repositories/    # SQLAlchemy / async queries
├── schemas/         # Pydantic models (request/response)
├── models/          # SQLAlchemy ORM models
├── core/            # Config, security, dependencies
└── utils/           # Pure utility functions
```

### Route pattern
```python
# api/users.py
from fastapi import APIRouter, Depends, status
from app.schemas.user import UserCreate, UserResponse
from app.services.user_service import UserService
from app.core.dependencies import get_user_service

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    body: UserCreate,
    service: UserService = Depends(get_user_service)
) -> UserResponse:
    return await service.create_user(body)
```

### Pydantic schema pattern
```python
# schemas/user.py
from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    name: str = Field(min_length=1, max_length=100)

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    model_config = {"from_attributes": True}
```

---

## Authentication Patterns

### JWT middleware (Node.js)
```typescript
// middleware/auth.ts
import { FastifyRequest, FastifyReply } from 'fastify'
import jwt from 'jsonwebtoken'

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const token = request.headers.authorization?.replace('Bearer ', '')
  if (!token) throw new UnauthorizedError()
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
    request.user = payload
  } catch {
    throw new UnauthorizedError('Invalid or expired token')
  }
}
```

### Password hashing
```typescript
import bcrypt from 'bcrypt'
const ROUNDS = 12  // minimum — never lower this

export const hashPassword = (plain: string) => bcrypt.hash(plain, ROUNDS)
export const verifyPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash)
```

---

## Required Non-Functionals

Every endpoint must have:
- Input validation (Zod / Pydantic) — reject before business logic
- Structured error responses `{ error: { code, message } }`
- Request logging (structured JSON, not console.log)
- No secrets in code — all from environment variables
- Rate limiting on auth endpoints (minimum: 10 req/min per IP)
- Pagination on all list endpoints (limit/offset or cursor)
- Health check endpoint: `GET /health → { status: "ok", version }`

## Never do
- `console.log` in production code — use fastify.log or Python logging
- Catch errors and swallow them silently
- Return raw database errors to the client
- Store passwords in plain text
- Put secrets in source code
- Return 200 for errors
