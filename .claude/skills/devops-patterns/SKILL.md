---
name: devops-patterns
description: >
  CI/CD patterns for GitHub Actions, multi-stage Docker builds, docker-compose
  for local dev, environment configuration, and deployment strategies.
  Informed by aj-geddes/useful-ai-prompts (179★) and extended with Docker +
  Supabase migration + multi-environment deploy patterns.
when_to_use: >
  Use when devops-agent writes or updates GitHub Actions workflows, Dockerfiles,
  docker-compose files, or deployment configuration. Never hardcode secrets.
  Produces config files only — does not run deployments.
---

# DevOps Patterns

## GitHub Actions — Complete CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

permissions:
  contents: read
  pull-requests: write
  packages: write

jobs:
  # ── Job 1: Quality checks ──────────────────────────────
  quality:
    name: Lint + Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck

  # ── Job 2: Tests with real DB ──────────────────────────
  test:
    name: Tests
    runs-on: ubuntu-latest
    needs: quality
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: testuser
          POSTGRES_PASSWORD: testpass
          POSTGRES_DB: testdb
        ports: ['5432:5432']
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - name: Run DB migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://testuser:testpass@localhost:5432/testdb
      - name: Run tests with coverage
        run: npm test -- --coverage --coverageReporters=lcov
        env:
          DATABASE_URL: postgresql://testuser:testpass@localhost:5432/testdb
          JWT_SECRET: ${{ secrets.JWT_SECRET_TEST || 'test-secret-min-32-characters-long' }}
          NODE_ENV: test
      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with: { token: ${{ secrets.CODECOV_TOKEN }} }

  # ── Job 3: Build Docker image ──────────────────────────
  build:
    name: Build + Push Image
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ghcr.io/${{ github.repository }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # ── Job 4: Deploy (requires manual approval in prod) ───
  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    environment: production   # ← requires manual approval gate in GitHub
    steps:
      - name: Deploy to production
        # Replace with your actual deploy command:
        # Railway: railway up
        # Render: curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
        # K8s: kubectl set image deployment/app app=ghcr.io/${{ github.repository }}:${{ github.sha }}
        run: echo "Deploy step — customise per platform"
        env:
          DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
```

---

## Dockerfile — Multi-Stage (Node.js)

```dockerfile
# syntax=docker/dockerfile:1

# ── Stage 1: Dependencies ──────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production=false

# ── Stage 2: Build ────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
# Remove dev dependencies
RUN npm ci --only=production && npm cache clean --force

# ── Stage 3: Runtime (minimal image) ─────────────────
FROM node:20-alpine AS runtime

# Security: non-root user
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 appuser

WORKDIR /app
COPY --from=builder --chown=appuser:nodejs /app/dist ./dist
COPY --from=builder --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:nodejs /app/package.json ./

USER appuser
EXPOSE 3000
ENV NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]
```

## .dockerignore
```
node_modules
.env
.env.*
dist
coverage
.git
*.log
README.md
```

---

## docker-compose — Local Development

```yaml
# docker-compose.yml
version: '3.9'

services:
  api:
    build:
      context: .
      target: builder          # use build stage for hot-reload in dev
    ports:
      - '3000:3000'
    volumes:
      - ./src:/app/src:ro      # mount source for dev server
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://devuser:devpass@postgres:5432/devdb
      JWT_SECRET: dev-secret-change-in-production-min-32-chars
      REDIS_URL: redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
    command: npm run dev

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: devuser
      POSTGRES_PASSWORD: devpass
      POSTGRES_DB: devdb
    ports:
      - '5432:5432'            # expose for local DB tools (TablePlus etc.)
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U devuser -d devdb']
      interval: 10s
      timeout: 5s
      retries: 5

  redis:                       # optional — for rate limiting, caching
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

---

## Environment Configuration

### Required files

```
.env.example        ← committed — all keys with placeholder values
.env                ← NOT committed — local dev values
.env.test           ← committed — test environment (no real secrets)
.gitignore          ← must contain: .env, .env.local, .env.production
```

### .env.example template
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Auth
JWT_SECRET=replace-with-min-32-char-random-string
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# App
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug

# Email (optional)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# External APIs
# STRIPE_SECRET_KEY=
```

---

## GitHub Actions — Best Practices

### DO
- Use `actions/checkout@v4`, `setup-node@v4` (pinned major versions)
- Cache dependencies: `cache: 'npm'` in setup-node
- Cache Docker layers: `cache-from: type=gha`
- Set `permissions:` explicitly — principle of least privilege
- Use `environment: production` for deploy jobs — forces manual approval
- Store ALL secrets in GitHub Secrets — never in workflow files
- Use matrix strategy for multi-version testing

### NEVER
- `secrets.*` with pull requests from forks (security risk)
- Hardcode credentials, tokens, or connection strings
- Skip test job with `if: always()` on deploy
- Use `continue-on-error: true` on security/test steps
- Echo secrets to logs

---

## Deployment Strategies

| Strategy | When to use | Rollback |
|---|---|---|
| **Rolling deploy** | Stateless services, low traffic | Re-deploy previous image |
| **Blue/Green** | Zero-downtime, database migrations | Switch traffic back to blue |
| **Canary** | High-risk changes, A/B testing | Route 100% back to stable |

For Prisma migrations in production:
```yaml
- name: Run migrations
  run: npx prisma migrate deploy
  # migrate deploy is safe for production:
  # - applies only pending migrations
  # - never resets data
  # - idempotent
```
