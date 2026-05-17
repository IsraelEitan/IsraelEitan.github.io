---
name: e2e-testing-patterns
description: >
  Core patterns for writing maintainable, reliable Playwright E2E tests with
  TypeScript. Use when writing new E2E tests, refactoring existing ones, or
  reviewing test quality. Covers test structure, selectors, waits, assertions,
  page objects, fixtures, test organisation, and CI integration.
when_to_use: >
  Use when e2e-tester agent writes or reviews Playwright tests. Ensures tests
  are reliable (no flakiness), fast (parallel), maintainable (page objects),
  and readable (clear intent). Sourced from SkillsMP community best practices.
---

# E2E Testing Patterns — Playwright + TypeScript

## Core Principles
1. **Reliable** — no flaky tests. Ever.
2. **Fast** — parallel execution, no hard-coded waits
3. **Maintainable** — page objects, single source of truth for selectors
4. **Readable** — self-documenting test names and structure
5. **Isolated** — no test depends on another test's state

---

## Selector Priority (use in this order)

```typescript
// 1. BEST — Role-based (accessible, semantic)
await page.getByRole('button', { name: 'Submit' }).click()
await page.getByRole('textbox', { name: 'Email' }).fill('user@example.com')

// 2. GOOD — Label-based (forms)
await page.getByLabel('Password').fill('SecurePass123')

// 3. ACCEPTABLE — Placeholder
await page.getByPlaceholder('Enter your email').fill('test@example.com')

// 4. LAST RESORT — Test ID (for complex/dynamic elements)
await page.getByTestId('prescription-card-123').click()

// ❌ NEVER — CSS selectors, XPath, nth-child
await page.locator('#submit-btn').click()           // brittle
await page.locator('div > button:nth-child(2)').click() // nightmare
```

### Chaining for specificity
```typescript
// Target button within a specific section
await page.getByRole('main').getByRole('button', { name: 'Add' }).click()

// Filter dynamic lists
await page.getByRole('listitem')
  .filter({ hasText: 'Order #123' })
  .getByRole('button', { name: 'Cancel' })
  .click()
```

---

## Waits — Auto-waiting is your friend

```typescript
// ✅ Playwright auto-waits on interactions — trust it
await page.getByRole('button', { name: 'Submit' }).click()
await expect(page.getByText('Success')).toBeVisible()

// ✅ Wait for specific condition
await page.getByRole('progressbar').waitFor({ state: 'hidden' })
await page.getByRole('alert').waitFor({ state: 'visible', timeout: 10000 })

// ✅ Wait for network response (SPAs)
await page.waitForResponse(resp =>
  resp.url().includes('/api/auth/login') && resp.status() === 200
)

// ❌ NEVER hardcode timeouts
await page.waitForTimeout(2000)  // DO NOT DO THIS
await page.waitForTimeout(5000)  // SERIOUSLY, DON'T
```

---

## Assertions — Use Playwright's built-in (auto-retrying)

```typescript
// Visibility
await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
await expect(page.getByRole('alert')).toBeHidden()

// Text
await expect(page.getByRole('status')).toHaveText('Order confirmed')
await expect(page.getByRole('heading')).toContainText('Welcome')

// URL
await expect(page).toHaveURL(/.*dashboard/)

// Form state
await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled()
await expect(page.getByRole('button', { name: 'Delete' })).toBeDisabled()
await expect(page.getByRole('checkbox', { name: 'Remember me' })).toBeChecked()

// Count
await expect(page.getByRole('listitem')).toHaveCount(5)

// ❌ Don't use weak assertions
const text = await page.locator('.message').textContent()
expect(text).toBe('Success') // doesn't auto-retry, bad error messages
```

---

## Page Object Model — mandatory for reusable flows

```typescript
// page-objects/LoginPage.ts
import { Page, Locator } from '@playwright/test'

export class LoginPage {
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator
  readonly errorMessage: Locator

  constructor(private page: Page) {
    this.emailInput = page.getByLabel('Email')
    this.passwordInput = page.getByLabel('Password')
    this.submitButton = page.getByRole('button', { name: 'Sign In' })
    this.errorMessage = page.getByRole('alert')
  }

  async navigate() {
    await this.page.goto('/login')
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }
}

// tests/auth/login.spec.ts
import { test, expect } from '@playwright/test'
import { LoginPage } from '../../page-objects/LoginPage'

test.describe('User Authentication', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.navigate()
    await loginPage.login('user@example.com', 'SecurePass123')
    await expect(page).toHaveURL(/.*dashboard/)
    await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible()
  })

  test('should show error with invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.navigate()
    await loginPage.login('user@example.com', 'WrongPassword')
    await expect(loginPage.errorMessage).toBeVisible()
    await expect(loginPage.errorMessage).toHaveText('Invalid credentials')
  })
})
```

---

## Fixtures — shared setup/teardown

```typescript
// fixtures/auth.fixture.ts
import { test as base, Page } from '@playwright/test'
import { LoginPage } from '../page-objects/LoginPage'

type AuthFixtures = {
  loginPage: LoginPage
  authenticatedPage: Page
}

export const test = base.extend<AuthFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page))
  },

  // Auto-login fixture — reuse across tests that need auth
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page)
    await loginPage.navigate()
    await loginPage.login(
      process.env.TEST_USER_EMAIL!,
      process.env.TEST_USER_PASSWORD!
    )
    await page.waitForURL(/.*dashboard/)
    await use(page)
  },
})
export { expect } from '@playwright/test'

// Usage
import { test, expect } from '../fixtures/auth.fixture'

test('user can view orders after login', async ({ authenticatedPage }) => {
  await authenticatedPage.getByRole('link', { name: 'Orders' }).click()
  await expect(authenticatedPage).toHaveURL(/.*orders/)
})
```

---

## Test Organisation

```
tests/
├── auth/
│   ├── login.spec.ts
│   ├── logout.spec.ts
│   ├── password-reset.spec.ts
│   └── register.spec.ts
├── dashboard/
│   ├── overview.spec.ts
│   └── settings.spec.ts
├── api/                     ← API-level tests (faster, no UI)
│   └── auth.api.spec.ts
├── page-objects/
│   ├── LoginPage.ts
│   └── DashboardPage.ts
└── fixtures/
    └── auth.fixture.ts
```

**Naming rules:**
- Files: `feature-name.spec.ts` (kebab-case)
- Tests: start with "should", describe behavior: `'should display error when email is invalid'`
- Describe blocks: use component/page name: `'User Authentication'`

---

## Error Simulation

```typescript
test('shows error message when API fails', async ({ page }) => {
  // Simulate API failure
  await page.route('**/api/auth/login', route => route.abort())

  const loginPage = new LoginPage(page)
  await loginPage.navigate()
  await loginPage.login('user@example.com', 'pass')

  await expect(page.getByRole('alert')).toHaveText(
    'Unable to sign in. Please try again.'
  )
})

test('shows retry state on network error', async ({ page }) => {
  let calls = 0
  await page.route('**/api/data', route => {
    calls++
    calls < 3 ? route.abort() : route.continue()
  })
  await page.goto('/dashboard')
  await expect(page.getByRole('main')).toBeVisible()
})
```

---

## Anti-Patterns — Never Do These

| ❌ Anti-pattern | ✅ Fix |
|---|---|
| `waitForTimeout(2000)` | Use auto-wait or `waitFor({ state })` |
| `.locator('#email')` CSS selector | `getByLabel('Email')` |
| No page objects — selectors in every test | Create `LoginPage`, `DashboardPage` etc. |
| Tests depend on each other | Every test is fully independent |
| Test internal state: `window.__app__.state` | Test user-visible behavior only |
| `test.only` left in code | Never commit `.only` |

---

## CI Configuration (playwright.config.ts)

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,    // fail if .only committed
  retries: process.env.CI ? 2 : 0, // retry on CI only
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['github']],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 14'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

---

## Pre-Commit Checklist

Before committing any E2E test:
- [ ] Test name starts with "should" and describes expected behavior
- [ ] Uses `getByRole`, `getByLabel` — no CSS selectors
- [ ] No `waitForTimeout` anywhere
- [ ] Has page object for reusable flows
- [ ] Test is fully independent (no shared state with other tests)
- [ ] Tests both happy path AND error states
- [ ] No `test.only`, `page.pause()`, or `console.log` left in code
- [ ] Passes headless: `npx playwright test <file> --repeat-each=3`
- [ ] Organised in correct domain folder
