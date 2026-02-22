# E2E Tests

End-to-end tests for critical user flows using Playwright.

## Setup

### Prerequisites

**Linux users**: Install system dependencies for Chromium:

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y \
  libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \
  libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 \
  libxrandr2 libgbm1 libasound2

# Fedora
sudo dnf install \
  atk at-spi2-atk cups-libs libdrm libxkbcommon \
  libXcomposite libXdamage libXfixes libXrandr mesa-libgbm alsa-lib

# Arch Linux
sudo pacman -S \
  atk at-spi2-core cups libdrm libxkbcommon \
  libxcomposite libxdamage libxfixes libxrandr mesa alsa-lib
```

### Installation

1. Install Node.js dependencies:

   ```bash
   pnpm install
   ```

2. Install Playwright browsers:

   ```bash
   pnpm exec playwright install chromium
   ```

3. Verify setup:
   ```bash
   pnpm exec playwright --version
   ```

## Running Tests

### Run all E2E tests (headless)

```bash
pnpm test:e2e
```

### Run tests in UI mode (recommended for development)

```bash
pnpm test:e2e:ui
```

### Run tests in headed mode (watch browser)

```bash
pnpm test:e2e:headed
```

### Debug tests

```bash
pnpm test:e2e:debug
```

### Run specific test file

```bash
pnpm exec playwright test users.spec.ts
```

### Run tests matching a pattern

```bash
pnpm exec playwright test -g "should delete user"
```

## Test Structure

```
tests/e2e/
├── helpers/
│   └── auth.ts          # Authentication utilities
├── users.spec.ts        # User management tests
└── README.md            # This file
```

## Writing New Tests

1. Create a new test file in `tests/e2e/`:

   ```typescript
   import { test, expect } from "@playwright/test";

   test.describe("Feature Name", () => {
     test("should do something", async ({ page }) => {
       await page.goto("/some-page");
       await expect(page.locator("h1")).toContainText("Title");
     });
   });
   ```

2. Use helpers for common operations:

   ```typescript
   import { loginAsAdmin } from "./helpers/auth";

   test.beforeEach(async ({ page }) => {
     await loginAsAdmin(page);
   });
   ```

## Best Practices

1. **Use data-testid attributes**: For more stable selectors that don't break with UI changes
2. **Wait for elements**: Use `await expect(...).toBeVisible()` instead of `waitForTimeout`
3. **Clean up test data**: Tests should be idempotent and not affect each other
4. **Test user flows, not implementation**: Focus on what users see and do
5. **Use descriptive test names**: Should clearly describe what is being tested

## Test Data

Tests use the following admin credentials (configured in `tests/e2e/helpers/auth.ts`):

- Email: `admin@naiera.com`
- Password: `Admin123!`

Make sure this user exists in your test database.

## CI/CD

E2E tests run automatically in CI on:

- Every pull request
- Every push to main branch

Tests run in headless mode with retries enabled.

## Troubleshooting

### Tests fail with "Test timeout"

- Increase timeout in test: `test.setTimeout(60000)`
- Check if dev server is running properly
- Verify network requests are completing

### "Element not found" errors

- Use Playwright Inspector: `pnpm exec playwright codegen`
- Check if element is in iframe or shadow DOM
- Verify you're waiting for the element to be visible

### Tests pass locally but fail in CI

- Check for timing issues (add explicit waits)
- Verify test data exists in CI environment
- Check for environment-specific differences

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Guides](https://playwright.dev/docs/intro)
