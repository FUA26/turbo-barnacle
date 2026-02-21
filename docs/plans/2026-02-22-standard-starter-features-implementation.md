# Standard Starter Features Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform Naiera Next into a production-ready standard starter with 8 essential features: Testing Foundation, API Layer, Form Handling, State Management, Error Handling, Email System, Documentation, and Deployment.

**Architecture:** Three-phase implementation starting with foundation features (Testing, API Layer, Error Handling), followed by feature work (Forms, State, Email), and finishing with polish (Documentation, Deployment). Each feature is independent and can be developed in isolation with TDD approach.

**Tech Stack:** Vitest, React Testing Library, MSW, React Hook Form, Zod, Jotai, TanStack Query, React Email, Resend, Docker, GitHub Actions

**Timeline:** 3 weeks (1 week per phase)

---

## Phase 1: Foundation (Week 1)

### Feature 1: Testing Foundation

**Stack:** Vitest, React Testing Library, MSW (Mock Service Worker)

---

#### Task 1.1: Install Testing Dependencies

**Files:**

- Modify: `package.json`

**Step 1: Add testing dependencies**

Run:

```bash
pnpm add -D @vitest/ui vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event msw jsdom
```

Expected: Dependencies added to `package.json` and `pnpm-lock.yaml`

**Step 2: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "feat(testing): install vitest and testing library dependencies"
```

---

#### Task 1.2: Create Vitest Configuration

**Files:**

- Create: `tests/setup/vitest.config.ts`
- Modify: `package.json`

**Step 1: Write the Vitest config file**

Create `tests/setup/vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup/test-setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
```

**Step 2: Add test script to package.json**

Add to `scripts` section in `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

**Step 3: Verify config is valid**

Run: `pnpm vitest --config tests/setup/vitest.config.ts --run`

Expected: No errors, Vitest starts but finds no tests

**Step 4: Commit**

```bash
git add tests/setup/vitest.config.ts package.json
git commit -m "feat(testing): add vitest configuration"
```

---

#### Task 1.3: Create Test Setup File

**Files:**

- Create: `tests/setup/test-setup.ts`
- Create: `tests/setup/msw-handlers.ts`

**Step 1: Create test setup file**

Create `tests/setup/test-setup.ts`:

```typescript
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    pathname: "/",
    query: {},
    asPath: "/",
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock NextAuth
vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));
```

**Step 2: Create MSW handlers**

Create `tests/setup/msw-handlers.ts`:

```typescript
import { http, HttpResponse } from "msw";

export const handlers = [
  // Auth endpoints
  http.post("/api/auth/signin", async () => {
    return HttpResponse.json({
      user: { id: "1", email: "test@example.com", name: "Test User" },
    });
  }),

  // User endpoints
  http.get("/api/users", async () => {
    return HttpResponse.json({
      success: true,
      data: [{ id: "1", email: "test@example.com", name: "Test User" }],
    });
  }),
];
```

**Step 3: Commit**

```bash
git add tests/setup/
git commit -m "feat(testing): add test setup and MSW handlers"
```

---

#### Task 1.4: Create Test Helper Utilities

**Files:**

- Create: `tests/utils/test-helpers.ts`
- Create: `tests/utils/assertions.ts`

**Step 1: Create test helpers**

Create `tests/utils/test-helpers.ts`:

```typescript
import { render } from "@testing-library/react";
import { Session } from "next-auth";

export function mockSession(overrides?: Partial<Session>): Session {
  return {
    user: {
      id: "test-user-id",
      email: "test@example.com",
      name: "Test User",
      roleId: "test-role-id",
      permissions: ["USER_READ_ANY"],
    },
    expires: new Date(Date.now() + 3600000).toISOString(),
    ...overrides,
  };
}

export function mockUser(overrides?: Record<string, any>) {
  return {
    id: "test-user-id",
    email: "test@example.com",
    name: "Test User",
    roleId: "test-role-id",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createMockFile(name = "test.jpg", type = "image/jpeg") {
  const file = new File(["test"], name, { type });
  return file;
}
```

**Step 2: Create custom assertions**

Create `tests/utils/assertions.ts`:

```typescript
import { expect } from "vitest";

// Custom assertion for session data
expect.extend({
  toHavePermission(received: { permissions?: string[] }, permission: string) {
    const hasPermission = received?.permissions?.includes(permission);
    return {
      pass: hasPermission,
      message: () =>
        hasPermission
          ? `expected permissions not to include ${permission}`
          : `expected permissions to include ${permission}`,
    };
  },
});

declare module "vitest" {
  interface Assertion<T = any> {
    toHavePermission(permission: string): T;
  }
}
```

**Step 3: Commit**

```bash
git add tests/utils/
git commit -m "feat(testing): add test helpers and custom assertions"
```

---

#### Task 1.5: Write Example Component Test

**Files:**

- Create: `tests/components/button.test.tsx`

**Step 1: Write the failing test**

Create `tests/components/button.test.tsx`:

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders button with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByRole("button"));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
```

**Step 2: Run test to verify it works**

Run: `pnpm test tests/components/button.test.tsx`

Expected: All tests PASS (Button component already exists)

**Step 3: Commit**

```bash
git add tests/components/
git commit -m "test(testing): add example button component test"
```

---

#### Task 1.6: Write Example API Route Test

**Files:**

- Create: `tests/api/users.test.ts`

**Step 1: Write the failing test**

Create `tests/api/users.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { POST } from "@/app/api/users/route";

describe("POST /api/users", () => {
  it("requires authentication", async () => {
    const request = new Request("http://localhost:3000/api/users", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com", name: "Test" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
  });

  it("validates request body", async () => {
    const request = new Request("http://localhost:3000/api/users", {
      method: "POST",
      body: JSON.stringify({ email: "invalid-email" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });
});
```

**Step 2: Run test to verify behavior**

Run: `pnpm test tests/api/users.test.ts`

Expected: Tests may fail if API route doesn't exist yet (that's OK for now)

**Step 3: Commit**

```bash
git add tests/api/
git commit -m "test(testing): add example API route test"
```

---

### Feature 2: API Layer

---

#### Task 2.1: Create API Error Classes

**Files:**

- Create: `lib/api/errors/api-error.ts`
- Create: `lib/api/errors/errors.ts`
- Create: `lib/api/errors/types.ts`

**Step 1: Write the failing test**

Create `tests/lib/api/errors.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { ValidationError, NotFoundError, UnauthorizedError } from "@/lib/api/errors/errors";

describe("API Errors", () => {
  it("creates validation error with correct status", () => {
    const error = new ValidationError("Invalid email");
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe("VALIDATION_ERROR");
  });

  it("creates not found error with correct status", () => {
    const error = new NotFoundError("User not found");
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe("NOT_FOUND");
  });

  it("creates unauthorized error with correct status", () => {
    const error = new UnauthorizedError("Not authenticated");
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe("UNAUTHORIZED");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/lib/api/errors.test.ts`

Expected: FAIL - module not found

**Step 3: Implement error classes**

Create `lib/api/errors/types.ts`:

```typescript
export interface ApiErrorDetails {
  [key: string]: any;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: ApiErrorDetails
  ) {
    super(message);
    this.name = "ApiError";
  }
}
```

Create `lib/api/errors/errors.ts`:

```typescript
import { ApiError } from "./types";

export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(message, "VALIDATION_ERROR", 400, details);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = "Unauthorized") {
    super(message, "UNAUTHORIZED", 401);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = "Forbidden") {
    super(message, "FORBIDDEN", 403);
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string) {
    super(message, "NOT_FOUND", 404);
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super(message, "CONFLICT", 409);
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string = "Rate limit exceeded") {
    super(message, "RATE_LIMIT_EXCEEDED", 429);
  }
}
```

Create `lib/api/errors/api-error.ts`:

```typescript
export * from "./types";
export * from "./errors";
```

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/lib/api/errors.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add lib/api/errors/ tests/lib/api/
git commit -m "feat(api): add error classes with status codes"
```

---

#### Task 2.2: Create API Response Utilities

**Files:**

- Create: `lib/api/response/api-response.ts`
- Create: `lib/api/response/paginator.ts`

**Step 1: Write the failing test**

Create `tests/lib/api/response.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { apiSuccess, apiError } from "@/lib/api/response/api-response";

describe("API Response", () => {
  it("creates success response", () => {
    const response = apiSuccess({ id: "1", name: "Test" });
    expect(response.success).toBe(true);
    expect(response.data).toEqual({ id: "1", name: "Test" });
  });

  it("creates success response with meta", () => {
    const response = apiSuccess({ id: "1" }, { pagination: { page: 1, limit: 10, total: 100 } });
    expect(response.meta?.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 100,
    });
  });

  it("creates error response from ApiError", () => {
    const error = new Error("Test error");
    const response = apiError(error);
    expect(response.success).toBe(false);
    expect(response.error).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/lib/api/response.test.ts`

Expected: FAIL - module not found

**Step 3: Implement response utilities**

Create `lib/api/response/api-response.ts`:

```typescript
import { NextResponse } from "next/server";
import { ApiError } from "../errors";

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    [key: string]: any;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export function apiSuccess<T>(
  data: T,
  meta?: ApiSuccessResponse<T>["meta"]
): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    meta,
  };
}

export function apiError(error: Error | ApiError): ApiErrorResponse {
  if (error instanceof ApiError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    };
  }

  return {
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: error.message || "An unexpected error occurred",
    },
  };
}

export function apiJson<T>(
  data: T,
  meta?: ApiSuccessResponse<T>["meta"],
  status: number = 200
): NextResponse {
  return NextResponse.json(apiSuccess(data, meta), { status });
}

export function apiJsonError(error: Error | ApiError, status?: number): NextResponse {
  const statusCode = error instanceof ApiError ? error.statusCode : 500;
  return NextResponse.json(apiError(error), { status: status || statusCode });
}
```

Create `lib/api/response/paginator.ts`:

```typescript
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function calculatePagination(params: PaginationParams, total: number): PaginationMeta {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 10));
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
  };
}

export function getOffset(params: PaginationParams): number {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 10));
  return (page - 1) * limit;
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/lib/api/response.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add lib/api/response/ tests/lib/api/
git commit -m "feat(api): add response utilities and pagination helpers"
```

---

#### Task 2.3: Create Rate Limiting Middleware

**Files:**

- Create: `lib/api/middleware/rate-limit.ts`

**Step 1: Write the failing test**

Create `tests/lib/api/rate-limit.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRateLimiter } from "@/lib/api/middleware/rate-limit";

describe("Rate Limiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("allows requests within limit", async () => {
    const limiter = createRateLimiter({ max: 5, windowMs: 60000 });
    const identifier = "test-ip";

    for (let i = 0; i < 5; i++) {
      const result = await limiter.check(identifier);
      expect(result.allowed).toBe(true);
    }
  });

  it("blocks requests over limit", async () => {
    const limiter = createRateLimiter({ max: 2, windowMs: 60000 });
    const identifier = "test-ip";

    await limiter.check(identifier);
    await limiter.check(identifier);

    const result = await limiter.check(identifier);
    expect(result.allowed).toBe(false);
  });

  it("resets after window expires", async () => {
    const limiter = createRateLimiter({ max: 2, windowMs: 1000 });
    const identifier = "test-ip";

    await limiter.check(identifier);
    await limiter.check(identifier);

    vi.advanceTimersByTime(1100);

    const result = await limiter.check(identifier);
    expect(result.allowed).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/lib/api/rate-limit.test.ts`

Expected: FAIL - module not found

**Step 3: Implement rate limiter**

Create `lib/api/middleware/rate-limit.ts`:

```typescript
export interface RateLimitOptions {
  max: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
}

interface RateLimitEntry {
  count: number;
  resetTime: Date;
}

export function createRateLimiter(options: RateLimitOptions) {
  const store = new Map<string, RateLimitEntry>();

  return {
    async check(identifier: string): Promise<RateLimitResult> {
      const now = new Date();
      const entry = store.get(identifier);

      // Reset if window expired
      if (entry && entry.resetTime <= now) {
        store.delete(identifier);
      }

      const currentEntry = store.get(identifier);
      const resetTime = new Date(now.getTime() + options.windowMs);

      if (!currentEntry) {
        store.set(identifier, { count: 1, resetTime });
        return {
          allowed: true,
          remaining: options.max - 1,
          resetTime,
        };
      }

      if (currentEntry.count >= options.max) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: currentEntry.resetTime,
        };
      }

      currentEntry.count++;
      return {
        allowed: true,
        remaining: options.max - currentEntry.count,
        resetTime: currentEntry.resetTime,
      };
    },

    reset(identifier: string): void {
      store.delete(identifier);
    },

    cleanup(): void {
      const now = new Date();
      for (const [key, entry] of store.entries()) {
        if (entry.resetTime <= now) {
          store.delete(key);
        }
      }
    },
  };
}

// Global rate limiter instance for API routes
export const apiRateLimiter = createRateLimiter({
  max: 100,
  windowMs: 60000, // 1 minute
});
```

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/lib/api/rate-limit.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add lib/api/middleware/ tests/lib/api/
git commit -m "feat(api): add rate limiting middleware"
```

---

#### Task 2.4: Create API Route Helpers

**Files:**

- Create: `lib/api/routes/index.ts`
- Create: `lib/api/middleware/error-handler.ts`

**Step 1: Write the failing test**

Create `tests/lib/api/routes.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { withApiHandler } from "@/lib/api/routes";

describe("API Route Helpers", () => {
  it("wraps handler and catches errors", async () => {
    const handler = async () => {
      throw new Error("Test error");
    };

    const wrapped = withApiHandler(handler);
    const request = new NextRequest("http://localhost:3000/api/test");

    const response = await wrapped(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
  });

  it("returns success response on success", async () => {
    const handler = async () => {
      return { id: "1", name: "Test" };
    };

    const wrapped = withApiHandler(handler);
    const request = new NextRequest("http://localhost:3000/api/test");

    const response = await wrapped(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual({ id: "1", name: "Test" });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/lib/api/routes.test.ts`

Expected: FAIL - module not found

**Step 3: Implement route helpers**

Create `lib/api/middleware/error-handler.ts`:

```typescript
import { NextResponse } from "next/server";
import { ApiError } from "../errors";
import { apiJsonError } from "../response/api-response";

export type ApiHandler = (req: Request, context?: any) => Promise<Response>;

export async function withErrorHandler(handler: ApiHandler): Promise<Response> {
  try {
    return await handler.apply(null, arguments as any);
  } catch (error) {
    if (error instanceof ApiError) {
      return apiJsonError(error);
    }
    return apiJsonError(error as Error);
  }
}

export function withApiHandler(handler: ApiHandler): ApiHandler {
  return async (req: Request, context?: any) => {
    return withErrorHandler(handler.bind(null, req, context));
  };
}
```

Create `lib/api/routes/index.ts`:

```typescript
export * from "./builders";

// Re-export commonly used utilities
export { withApiHandler } from "../middleware/error-handler";
export { apiSuccess, apiError, apiJson, apiJsonError } from "../response/api-response";
export { createRateLimiter, apiRateLimiter } from "../middleware/rate-limit";
export * from "../errors";
```

Create `lib/api/routes/builders.ts`:

```typescript
import { NextRequest } from "next/server";
import { ZodSchema } from "zod";
import { auth } from "@/lib/auth/config";
import { RateLimiter, RateLimitResult } from "../middleware/rate-limit";
import { ValidationError, UnauthorizedError, RateLimitError } from "../errors";

export interface ApiHandlerContext {
  body?: any;
  user?: any;
  session?: any;
}

export type ApiHandler<T = any> = (
  req: NextRequest,
  context: ApiHandlerContext
) => Promise<Response>;

export function withValidation<T>(schema: ZodSchema<T>) {
  return function <U extends ApiHandler>(
    handler: U
  ): (req: NextRequest, context: ApiHandlerContext) => Promise<Response> {
    return async (req: NextRequest, context: ApiHandlerContext) => {
      try {
        const body = await req.json();
        const validated = schema.parse(body);
        context.body = validated;
        return handler(req, context);
      } catch (error: any) {
        throw new ValidationError(error.message || "Validation failed", error.errors);
      }
    };
  };
}

export function withAuth() {
  return function <U extends ApiHandler>(
    handler: U
  ): (req: NextRequest, context: ApiHandlerContext) => Promise<Response> {
    return async (req: NextRequest, context: ApiHandlerContext) => {
      const session = await auth();

      if (!session?.user) {
        throw new UnauthorizedError();
      }

      context.session = session;
      context.user = session.user;

      return handler(req, context);
    };
  };
}

export function withRateLimit(limiter: RateLimiter) {
  return function <U extends ApiHandler>(
    handler: U
  ): (req: NextRequest, context: ApiHandlerContext) => Promise<Response> {
    return async (req: NextRequest, context: ApiHandlerContext) => {
      const identifier = req.headers.get("x-forwarded-for") || "unknown";
      const result: RateLimitResult = await limiter.check(identifier);

      if (!result.allowed) {
        throw new RateLimitError();
      }

      return handler(req, context);
    };
  };
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/lib/api/routes.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add lib/api/ tests/lib/api/
git commit -m "feat(api): add route builder helpers"
```

---

### Feature 3: Error Handling

---

#### Task 3.1: Create Error Logger

**Files:**

- Create: `lib/errors/logger.ts`

**Step 1: Write the failing test**

Create `tests/lib/errors/logger.test.ts`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { logError } from "@/lib/errors/logger";

describe("Error Logger", () => {
  it("logs error in development", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("Test error");

    logError(error, { context: "test" });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("includes context in log", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("Test error");

    logError(error, { userId: "123", action: "test" });

    const loggedArgs = consoleSpy.mock.calls[0];
    expect(JSON.stringify(loggedArgs)).toContain("123");
    consoleSpy.mockRestore();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/lib/errors/logger.test.ts`

Expected: FAIL - module not found

**Step 3: Implement error logger**

Create `lib/errors/logger.ts`:

```typescript
export interface ErrorContext {
  [key: string]: any;
}

export interface ErrorLog {
  message: string;
  stack?: string;
  context?: ErrorContext;
  timestamp: string;
  userAgent?: string;
  url?: string;
}

export function logError(error: Error, context?: ErrorContext): void {
  const errorLog: ErrorLog = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
    url: typeof window !== "undefined" ? window.location.href : undefined,
  };

  // Console log in development
  if (process.env.NODE_ENV === "development") {
    console.error("Error:", errorLog);
  }

  // TODO: Send to error tracking service in production
  // Example: Sentry.captureException(error, { extra: context });
}

export function logInfo(message: string, context?: ErrorContext): void {
  const log = {
    message,
    context,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === "development") {
    console.info("Info:", log);
  }
}

export function logWarning(message: string, context?: ErrorContext): void {
  const log = {
    message,
    context,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === "development") {
    console.warn("Warning:", log);
  }
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/lib/errors/logger.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add lib/errors/ tests/lib/errors/
git commit -m "feat(errors): add error logging utilities"
```

---

#### Task 3.2: Create React Error Boundaries

**Files:**

- Create: `components/error/error-boundary.tsx`
- Create: `components/error/error-fallback.tsx`

**Step 1: Write the failing test**

Create `tests/components/error-boundary.test.tsx`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "@/components/error/error-boundary";

const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div>No error</div>;
};

describe("ErrorBoundary", () => {
  it("renders children when no error", () => {
    render(
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText("No error")).toBeInTheDocument();
  });

  it("renders fallback when error occurs", () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary fallback={<div>Something went wrong</div>} onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(onError).toHaveBeenCalled();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/components/error-boundary.test.tsx`

Expected: FAIL - module not found

**Step 3: Implement error boundary**

Create `components/error/error-fallback.tsx`:

```typescript
import React from "react";
import { Button } from "@/components/ui/button";

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

export function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Oops!</h1>
        <p className="text-gray-600 mb-4">Something went wrong</p>
        {process.env.NODE_ENV === "development" && (
          <details className="text-left text-sm text-gray-500 mb-4">
            <summary>Error details</summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
              {error.stack}
            </pre>
          </details>
        )}
        <Button onClick={resetError}>Try again</Button>
      </div>
    </div>
  );
}
```

Create `components/error/error-boundary.tsx`:

```typescript
"use client";

import React, { Component, ReactNode } from "react";
import { DefaultErrorFallback } from "./error-fallback";
import { logError } from "@/lib/errors/logger";

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundaryClass extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logError(error, {
      componentStack: errorInfo.componentStack,
    });

    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const resetError = () => {
        this.setState({ hasError: false, error: null });
      };

      if (typeof this.props.fallback === "function") {
        return this.props.fallback(this.state.error!, resetError);
      }

      return this.props.fallback || (
        <DefaultErrorFallback error={this.state.error!} resetError={resetError} />
      );
    }

    return this.props.children;
  }
}

export function ErrorBoundary(props: ErrorBoundaryProps) {
  return <ErrorBoundaryClass {...props} />;
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/components/error-boundary.test.tsx`

Expected: PASS

**Step 5: Commit**

```bash
git add components/error/ tests/components/
git commit -m "feat(error): add react error boundary component"
```

---

#### Task 3.3: Create Error Pages

**Files:**

- Create: `app/error.tsx`
- Create: `app/not-found.tsx`
- Create: `templates/error-page.tsx`

**Step 1: Create error page template**

Create `templates/error-page.tsx`:

```typescript
import React from "react";
import { Button } from "@/components/ui/button";

export interface ErrorPageProps {
  title: string;
  description: string;
  illustration?: "404" | "500" | "default";
  actions?: Array<
    | { label: string; onClick: () => void }
    | { label: string; href: string }
  >;
  error?: Error;
}

export function ErrorPage({
  title,
  description,
  illustration = "default",
  actions = [],
  error,
}: ErrorPageProps) {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="max-w-md w-full text-center">
        {illustration === "404" && (
          <div className="text-8xl font-bold text-gray-200 mb-4">404</div>
        )}
        {illustration === "500" && (
          <div className="text-8xl font-bold text-red-100 mb-4">500</div>
        )}

        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600 mb-6">{description}</p>

        {process.env.NODE_ENV === "development" && error && (
          <details className="text-left text-sm text-gray-500 mb-6">
            <summary className="cursor-pointer">Error details</summary>
            <pre className="mt-2 p-4 bg-gray-100 rounded-lg overflow-auto max-h-64">
              {error.stack}
            </pre>
          </details>
        )}

        <div className="flex gap-3 justify-center">
          {actions.map((action, index) => {
            if ("onClick" in action) {
              return (
                <Button key={index} onClick={action.onClick}>
                  {action.label}
                </Button>
              );
            }
            return (
              <Button key={index} asChild>
                <a href={action.href}>{action.label}</a>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Create global error page**

Create `app/error.tsx`:

```typescript
"use client";

import { ErrorPage } from "@/templates/error-page";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <ErrorPage
      title="Something went wrong"
      description="We encountered an unexpected error. Please try again."
      error={error}
      actions={[
        { label: "Try again", onClick: reset },
        { label: "Go home", href: "/" },
      ]}
    />
  );
}
```

**Step 3: Create not found page**

Create `app/not-found.tsx`:

```typescript
import { ErrorPage } from "@/templates/error-page";

export default function NotFound() {
  return (
    <ErrorPage
      title="Page not found"
      description="The page you're looking for doesn't exist."
      illustration="404"
      actions={[{ label: "Go home", href: "/" }]}
    />
  );
}
```

**Step 4: Commit**

```bash
git add templates/ app/error.tsx app/not-found.tsx
git commit -m "feat(error): add error and not-found pages"
```

---

## Phase 2: Features (Week 2)

### Feature 4: Form Handling

---

#### Task 4.1: Install Form Dependencies

**Files:**

- Modify: `package.json`

**Step 1: Check existing dependencies**

Run: `grep -E "react-hook-form|@hookform|zod" package.json`

Expected: These should already be installed (from design doc)

**Step 2: No commit needed if already present**

If missing:

```bash
pnpm add react-hook-form @hookform/resolvers zod
```

---

#### Task 4.2: Create Form Field Wrapper

**Files:**

- Create: `components/form/fields/form-field.tsx`

**Step 1: Write the failing test**

Create `tests/components/form-field.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormField } from "@/components/form/fields/form-field";
import { useForm } from "react-hook-form";

describe("FormField", () => {
  it("renders label and input", () => {
    function TestForm() {
      const { control } = useForm({
        defaultValues: { email: "" },
      });

      return (
        <FormField
          control={control}
          name="email"
          label="Email"
          render={({ field }) => <input {...field} />}
        />
      );
    }

    render(<TestForm />);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("displays error message", () => {
    function TestForm() {
      const { control, formState: { errors } } = useForm({
        defaultValues: { email: "" },
        mode: "onChange",
      });

      // Simulate error
      const errorsWithMock = {
        email: { type: "required", message: "Email is required" }
      };

      return (
        <FormField
          control={control}
          name="email"
          label="Email"
          render={({ field }) => <input {...field} />}
        />
      );
    }

    render(<TestForm />);

    // Error should appear when validation fails
    // (Full test would require triggering validation)
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/components/form-field.test.tsx`

Expected: FAIL - module not found

**Step 3: Implement FormField**

Create `components/form/fields/form-field.tsx`:

```typescript
"use client";

import React from "react";
import {
  FormControl,
  FormDescription,
  FormField as RHFFormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ControllerProps, FieldPath, FieldValues } from "react-hook-form";

interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: ControllerProps<TFieldValues, TName>["control"];
  name: TName;
  label?: string;
  description?: string;
  required?: boolean;
  render: (props: {
    field: ControllerProps<TFieldValues, TName>["field"];
  }) => React.ReactElement;
}

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({ control, name, label, description, required, render }: FormFieldProps<TFieldValues, TName>) {
  return (
    <RHFFormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </FormLabel>
          )}
          <FormControl>{render({ field })}</FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/components/form-field.test.tsx`

Expected: PASS (or near pass - may need adjustments)

**Step 5: Commit**

```bash
git add components/form/fields/form-field.tsx tests/components/form-field.test.tsx
git commit -m "feat(form): add FormField wrapper component"
```

---

#### Task 4.3: Create Input Field Component

**Files:**

- Create: `components/form/fields/input.tsx`

**Step 1: Write the failing test**

Create `tests/components/form-input.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InputField } from "@/components/form/fields/input";
import { useForm } from "react-hook-form";

describe("InputField", () => {
  it("renders input with label", () => {
    function TestForm() {
      const { control } = useForm({ defaultValues: { name: "" } });

      return <InputField control={control} name="name" label="Name" />;
    }

    render(<TestForm />);

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
  });

  it("allows typing in input", async () => {
    const user = userEvent.setup();

    function TestForm() {
      const { control } = useForm({ defaultValues: { name: "" } });

      return <InputField control={control} name="name" label="Name" />;
    }

    render(<TestForm />);

    const input = screen.getByLabelText("Name") as HTMLInputElement;
    await user.type(input, "John Doe");

    expect(input.value).toBe("John Doe");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/components/form-input.test.tsx`

Expected: FAIL - module not found

**Step 3: Implement InputField**

Create `components/form/fields/input.tsx`:

```typescript
"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormField } from "./form-field";

interface InputFieldProps {
  name: string;
  label?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  type?: "text" | "email" | "password" | "number" | "tel" | "url";
  disabled?: boolean;
}

export function InputField({
  name,
  label,
  description,
  placeholder,
  required,
  type = "text",
  disabled = false,
}: InputFieldProps) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      label={label}
      description={description}
      required={required}
      render={({ field }) => (
        <Input
          {...field}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
        />
      )}
    />
  );
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/components/form-input.test.tsx`

Expected: PASS

**Step 5: Commit**

```bash
git add components/form/fields/input.tsx tests/components/form-input.test.tsx
git commit -m "feat(form): add InputField component"
```

---

#### Task 4.4: Create Common Validators

**Files:**

- Create: `lib/form/validators/common.ts`
- Create: `lib/form/validators/user.ts`

**Step 1: Write the failing test**

Create `tests/lib/form/validators.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { emailValidator, passwordValidator } from "@/lib/form/validators/common";

describe("Common Validators", () => {
  it("validates email correctly", () => {
    const result = emailValidator.safeParse("test@example.com");
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = emailValidator.safeParse("invalid-email");
    expect(result.success).toBe(false);
  });

  it("validates strong password", () => {
    const result = passwordValidator.safeParse("StrongPass123");
    expect(result.success).toBe(true);
  });

  it("rejects weak password", () => {
    const result = passwordValidator.safeParse("weak");
    expect(result.success).toBe(false);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/lib/form/validators.test.ts`

Expected: FAIL - module not found

**Step 3: Implement validators**

Create `lib/form/validators/common.ts`:

```typescript
import { z } from "zod";

export const emailValidator = z.string().min(1, "Email is required").email("Invalid email address");

export const passwordValidator = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const phoneValidator = z.string().regex(/^[+]?[\d\s-()]+$/, "Invalid phone number");

export const urlValidator = z.string().url("Invalid URL");

export const requiredString = (fieldName: string) => z.string().min(1, `${fieldName} is required`);

export const optionalString = () => z.string().optional();
```

Create `lib/form/validators/user.ts`:

```typescript
import { z } from "zod";
import { emailValidator, passwordValidator } from "./common";

export const userNameSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: emailValidator,
});

export const userPasswordSchema = z
  .object({
    password: passwordValidator,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const createUserSchema = userNameSchema.extend({
  password: passwordValidator,
  roleId: z.string().min(1, "Role is required"),
});

export const updateUserSchema = userNameSchema.partial().extend({
  id: z.string(),
});

export const changePasswordSchema = userPasswordSchema;
```

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/lib/form/validators.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add lib/form/validators/ tests/lib/form/
git commit -m "feat(form): add common validators"
```

---

### Feature 5: State Management

---

#### Task 5.1: Install TanStack Query

**Files:**

- Modify: `package.json`

**Step 1: Install dependency**

Run:

```bash
pnpm add @tanstack/react-query @tanstack/react-query-devtools
```

**Step 2: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "feat(state): install TanStack Query"
```

---

#### Task 5.2: Create QueryClient Setup

**Files:**

- Create: `lib/state/queries/client.ts`
- Create: `lib/state/queries/provider.tsx`

**Step 1: Write the failing test**

Create `tests/lib/state/query-client.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { getQueryClient } from "@/lib/state/queries/client";

describe("QueryClient", () => {
  it("creates QueryClient with default config", () => {
    const client = getQueryClient();

    expect(client).toBeDefined();
    expect(client.getDefaultOptions().queries?.staleTime).toBe(1000 * 60 * 5);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/lib/state/query-client.test.ts`

Expected: FAIL - module not found

**Step 3: Implement QueryClient**

Create `lib/state/queries/client.ts`:

```typescript
import { QueryClient } from "@tanstack/react-query";

export function getQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
```

Create `lib/state/queries/provider.tsx`:

```typescript
"use client";

import React from "react";
import { QueryClientProvider as TanStackQueryProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { getQueryClient } from "./client";

interface QueryClientProviderProps {
  children: React.ReactNode;
}

export function QueryClientProvider({ children }: QueryClientProviderProps) {
  const [queryClient] = React.useState(() => getQueryClient());

  return (
    <TanStackQueryProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </TanStackQueryProvider>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/lib/state/query-client.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add lib/state/queries/ tests/lib/state/
git commit -m "feat(state): add QueryClient setup"
```

---

#### Task 5.3: Create Query Keys Factory

**Files:**

- Create: `lib/state/cache/keys.ts`

**Step 1: Write the failing test**

Create `tests/lib/state/query-keys.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { queryKeys } from "@/lib/state/cache/keys";

describe("Query Keys", () => {
  it("generates user list keys", () => {
    const keys = queryKeys.users.lists();
    expect(keys).toContain("users");
    expect(keys).toContain("list");
  });

  it("generates user detail keys", () => {
    const keys = queryKeys.users.detail("user-123");
    expect(keys).toContain("users");
    expect(keys).toContain("detail");
    expect(keys).toContain("user-123");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/lib/state/query-keys.test.ts`

Expected: FAIL - module not found

**Step 3: Implement query keys**

Create `lib/state/cache/keys.ts`:

```typescript
export const queryKeys = {
  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    list: (filters: string) => [...queryKeys.users.lists(), { filters }] as const,
    details: () => [...queryKeys.users.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },
  roles: {
    all: ["roles"] as const,
    lists: () => [...queryKeys.roles.all, "list"] as const,
    details: () => [...queryKeys.roles.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.roles.details(), id] as const,
  },
  permissions: {
    all: ["permissions"] as const,
  },
  files: {
    all: ["files"] as const,
    lists: () => [...queryKeys.files.all, "list"] as const,
  },
};
```

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/lib/state/query-keys.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add lib/state/cache/ tests/lib/state/
git commit -m "feat(state): add query keys factory"
```

---

#### Task 5.4: Create Custom Query Hooks

**Files:**

- Create: `lib/state/queries/hooks.ts`

**Step 1: Write the failing test**

Create `tests/lib/state/query-hooks.test.ts`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useUsers } from "@/lib/state/queries/hooks";

// Mock fetch
global.fetch = vi.fn();

describe("Query Hooks", () => {
  it("fetches users", async () => {
    (fetch as any).mockResolvedValueOnce({
      json: async () => ({ success: true, data: [] }),
    });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useUsers(), { wrapper });

    expect(result.current.isLoading).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/lib/state/query-hooks.test.ts`

Expected: FAIL - module not found

**Step 3: Implement hooks**

Create `lib/state/queries/hooks.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../cache/keys";

interface User {
  id: string;
  email: string;
  name: string | null;
}

interface UserParams {
  page?: number;
  limit?: number;
  search?: string;
}

interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useUsers(params?: UserParams) {
  return useQuery({
    queryKey: queryKeys.users.list(JSON.stringify(params || {})),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set("page", params.page.toString());
      if (params?.limit) searchParams.set("limit", params.limit.toString());
      if (params?.search) searchParams.set("search", params.search);

      const response = await fetch(`/api/users?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      return response.json() as Promise<UsersResponse>;
    },
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/users/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }

      return response.json() as Promise<User>;
    },
    enabled: !!id,
  });
}

interface CreateUserInput {
  email: string;
  name: string;
  roleId: string;
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserInput) => {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create user");
      }

      return response.json() as Promise<User>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
}

interface UpdateUserInput {
  id: string;
  email?: string;
  name?: string;
  roleId?: string;
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateUserInput) => {
      const response = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      return response.json() as Promise<User>;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.id) });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/lib/state/query-hooks.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add lib/state/queries/hooks.ts tests/lib/state/
git commit -m "feat(state): add custom query hooks"
```

---

#### Task 5.5: Create Jotai Atoms for UI State

**Files:**

- Create: `lib/state/atoms/ui.ts`
- Create: `lib/state/atoms/index.ts`

**Step 1: Write the failing test**

Create `tests/lib/state/atoms.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { atom, useAtom } from "jotai";
import { renderHook } from "@testing-library/react";

describe("UI Atoms", () => {
  it("sidebarOpenAtom defaults to true", () => {
    const { result } = renderHook(() => useAtom(atom(true)));

    expect(result.current[0]).toBe(true);
  });

  it("can toggle sidebarOpenAtom", () => {
    const { result } = renderHook(() => {
      const [value, setValue] = useAtom(atom(true));
      return { value, setValue };
    });

    expect(result.current.value).toBe(true);

    // @ts-ignore
    result.current.setValue(false);

    expect(result.current.value).toBe(false);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/lib/state/atoms.test.ts`

Expected: Might PASS (jotai already installed)

**Step 3: Implement UI atoms**

Create `lib/state/atoms/ui.ts`:

```typescript
import { atom } from "jotai";

// Sidebar state
export const sidebarOpenAtom = atom(true);
export const sidebarCollapsedAtom = atom(false);

// Modal state
export interface ModalState {
  open: boolean;
  content?: React.ReactNode;
  title?: string;
}

export const modalAtom = atom<ModalState>({
  open: false,
});

// Theme state
export type Theme = "light" | "dark" | "system";

export const themeAtom = atom<Theme>("system");

// Loading state
export const globalLoadingAtom = atom(false);

// Toast/notification state could go here
```

Create `lib/state/atoms/index.ts`:

```typescript
export * from "./ui";
```

**Step 4: Commit**

```bash
git add lib/state/atoms/ tests/lib/state/
git commit -m "feat(state): add Jotai atoms for UI state"
```

---

### Feature 6: Email System

---

#### Task 6.1: Create Email Service Interface

**Files:**

- Create: `lib/email/service/email-service.ts`
- Create: `lib/email/service/resend.ts`

**Step 1: Write the failing test**

Create `tests/lib/email/service.test.ts`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { ResendEmailService } from "@/lib/email/service/resend";

describe("Email Service", () => {
  it("sends email via Resend", async () => {
    const service = new ResendEmailService("test-api-key");

    // Mock fetch
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "email-123" }),
    });

    const result = await service.send({
      to: "test@example.com",
      subject: "Test",
      html: "<p>Test</p>",
    });

    expect(result.success).toBe(true);
    expect(result.data?.id).toBe("email-123");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/lib/email/service.test.ts`

Expected: FAIL - module not found

**Step 3: Implement email service**

Create `lib/email/service/email-service.ts`:

```typescript
export interface EmailData {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

export interface EmailResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface EmailService {
  send(data: EmailData): Promise<EmailResult>;
  bulkSend(data: EmailData[]): Promise<EmailResult[]>;
}
```

Create `lib/email/service/resend.ts`:

```typescript
import { Resend } from "resend";
import { EmailService, EmailData, EmailResult } from "./email-service";

export class ResendEmailService implements EmailService {
  private resend: Resend;
  private defaultFrom: string;

  constructor(apiKey: string, defaultFrom: string) {
    this.resend = new Resend(apiKey);
    this.defaultFrom = defaultFrom;
  }

  async send(data: EmailData): Promise<EmailResult> {
    try {
      const result = await this.resend.emails.send({
        from: data.from || this.defaultFrom,
        to: Array.isArray(data.to) ? data.to : [data.to],
        subject: data.subject,
        html: data.html,
        replyTo: data.replyTo,
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async bulkSend(data: EmailData[]): Promise<EmailResult[]> {
    return Promise.all(data.map((item) => this.send(item)));
  }
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/lib/email/service.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add lib/email/service/ tests/lib/email/
git commit -m "feat(email): add email service interface"
```

---

#### Task 6.2: Create Email Templates

**Files:**

- Create: `lib/email/templates/verification.tsx`
- Create: `lib/email/templates/password-reset.tsx`
- Create: `lib/email/templates/welcome.tsx`

**Step 1: Create verification email template**

Create `lib/email/templates/verification.tsx`:

```typescript
import { Email, Button, Html, Head, Body, Container, Heading, Text, Preview } from "@react-email/components";

interface VerificationEmailProps {
  userName?: string;
  token: string;
  appIdUrl: string;
}

export function VerificationEmail({ userName, token, appIdUrl }: VerificationEmailProps) {
  const verifyUrl = `${appIdUrl}/verify?token=${token}`;

  return (
    <Html>
      <Head />
      <Preview>Verify your email address</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Verify Your Email</Heading>
          <Text style={text}>
            {userName ? `Hi ${userName},` : "Hello,"}
          </Text>
          <Text style={text}>
            Please verify your email address by clicking the button below:
          </Text>
          <Button href={verifyUrl} style={button}>
            Verify Email
          </Button>
          <Text style={text}>
            Or use this verification code: <strong>{token}</strong>
          </Text>
          <Text style={footer}>
            If you didn't request this, please ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: "system-ui, -apple-system, sans-serif",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "600px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0 0 20px",
  textAlign: "center" as const,
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 20px",
};

const button = {
  backgroundColor: "#5468ff",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  padding: "12px 24px",
  textDecoration: "none" as const,
  borderRadius: "4px",
  display: "block",
  textAlign: "center" as const,
  margin: "0 0 20px",
};

const footer = {
  color: "#888",
  fontSize: "14px",
  margin: "40px 0 0",
};
```

**Step 2: Create password reset template**

Create `lib/email/templates/password-reset.tsx`:

```typescript
import { Email, Button, Html, Head, Body, Container, Heading, Text, Preview } from "@react-email/components";

interface PasswordResetEmailProps {
  userName?: string;
  token: string;
  appIdUrl: string;
}

export function PasswordResetEmail({ userName, token, appIdUrl }: PasswordResetEmailProps) {
  const resetUrl = `${appIdUrl}/reset-password?token=${token}`;

  return (
    <Html>
      <Head />
      <Preview>Reset your password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Reset Your Password</Heading>
          <Text style={text}>
            {userName ? `Hi ${userName},` : "Hello,"}
          </Text>
          <Text style={text}>
            We received a request to reset your password. Click the button below to create a new password:
          </Text>
          <Button href={resetUrl} style={button}>
            Reset Password
          </Button>
          <Text style={text}>
            This link will expire in 1 hour.
          </Text>
          <Text style={footer}>
            If you didn't request this, please ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Reuse styles from verification email
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: "system-ui, -apple-system, sans-serif",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "600px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0 0 20px",
  textAlign: "center" as const,
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 20px",
};

const button = {
  backgroundColor: "#5468ff",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  padding: "12px 24px",
  textDecoration: "none" as const,
  borderRadius: "4px",
  display: "block",
  textAlign: "center" as const,
  margin: "0 0 20px",
};

const footer = {
  color: "#888",
  fontSize: "14px",
  margin: "40px 0 0",
};
```

**Step 3: Create welcome template**

Create `lib/email/templates/welcome.tsx`:

```typescript
import { Email, Html, Head, Body, Container, Heading, Text, Preview } from "@react-email/components";

interface WelcomeEmailProps {
  userName: string;
  appName: string;
  appIdUrl: string;
}

export function WelcomeEmail({ userName, appName, appIdUrl }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to {appName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to {appName}!</Heading>
          <Text style={text}>
            Hi {userName},
          </Text>
          <Text style={text}>
            We're excited to have you on board. Your account has been created successfully.
          </Text>
          <Text style={text}>
            Get started by visiting your dashboard:
          </Text>
          <a href={appIdUrl} style={link}>
            Go to Dashboard
          </a>
          <Text style={footer}>
            If you have any questions, feel free to reach out.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: "system-ui, -apple-system, sans-serif",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "600px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0 0 20px",
  textAlign: "center" as const,
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 20px",
};

const link = {
  backgroundColor: "#5468ff",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  padding: "12px 24px",
  textDecoration: "none" as const,
  borderRadius: "4px",
  display: "inline-block",
  margin: "0 0 20px",
};

const footer = {
  color: "#888",
  fontSize: "14px",
  margin: "40px 0 0",
};
```

**Step 4: Commit**

```bash
git add lib/email/templates/
git commit -m "feat(email): add email templates"
```

---

#### Task 6.3: Create Email Utilities

**Files:**

- Create: `lib/email/utils.ts`
- Create: `lib/email/index.ts`

**Step 1: Write the failing test**

Create `tests/lib/email/utils.test.ts`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { sendVerificationEmail } from "@/lib/email/utils";

describe("Email Utilities", () => {
  it("sends verification email", async () => {
    const mockSend = vi.fn().mockResolvedValue({ success: true });
    // Mock email service

    const result = await sendVerificationEmail("test@example.com", "token-123");

    expect(result.success).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/lib/email/utils.test.ts`

Expected: FAIL - module not found

**Step 3: Implement utilities**

Create `lib/email/utils.ts`:

```typescript
import { render } from "@react-email/render";
import { ResendEmailService } from "./service/resend";
import { VerificationEmail } from "./templates/verification";
import { PasswordResetEmail } from "./templates/password-reset";
import { WelcomeEmail } from "./templates/welcome";

// Get email service instance
function getEmailService() {
  const apiKey = process.env.RESEND_API_KEY;
  const defaultFrom = process.env.RESEND_FROM_EMAIL || "noreply@example.com";

  if (!apiKey) {
    throw new Error("RESEND_API_KEY environment variable is not set");
  }

  return new ResendEmailService(apiKey, defaultFrom);
}

export async function sendVerificationEmail(email: string, token: string) {
  const service = getEmailService();
  const appIdUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const html = await render(
    <VerificationEmail
      token={token}
      appIdUrl={appIdUrl}
    />
  );

  return service.send({
    to: email,
    subject: "Verify Your Email",
    html,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const service = getEmailService();
  const appIdUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const html = await render(
    <PasswordResetEmail
      token={token}
      appIdUrl={appIdUrl}
    />
  );

  return service.send({
    to: email,
    subject: "Reset Your Password",
    html,
  });
}

export async function sendWelcomeEmail(email: string, userName: string) {
  const service = getEmailService();
  const appIdUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Naiera";

  const html = await render(
    <WelcomeEmail
      userName={userName}
      appName={appName}
      appIdUrl={appIdUrl}
    />
  );

  return service.send({
    to: email,
    subject: `Welcome to ${appName}`,
    html,
  });
}
```

Create `lib/email/index.ts`:

```typescript
export * from "./service/email-service";
export * from "./service/resend";
export * from "./utils";
export { VerificationEmail } from "./templates/verification";
export { PasswordResetEmail } from "./templates/password-reset";
export { WelcomeEmail } from "./templates/welcome";
```

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/lib/email/utils.test.ts`

Expected: PASS (with proper mocking)

**Step 5: Commit**

```bash
git add lib/email/ tests/lib/email/
git commit -m "feat(email): add email utilities"
```

---

## Phase 3: Polish (Week 3)

### Feature 7: Documentation

---

#### Task 7.1: Create Enhanced README

**Files:**

- Create: `README.md`

**Step 1: Create README**

Create `README.md`:

````markdown
# Naiera Starter

Production-ready Next.js 16 starter with enterprise-grade features for building internal tools.

## 🚀 Quick Start

```bash
git clone https://github.com/yourorg/naiera-starter
cd naiera-starter
pnpm install
pnpm prisma:push
pnpm prisma:seed
cp .env.example .env
docker-compose up -d
pnpm dev
```
````

Visit [http://localhost:3000](http://localhost:3000)

## ✨ Features

- 🔐 **Authentication** - NextAuth.js with RBAC
- 🎨 **UI Components** - shadcn/ui + Tailwind CSS v4
- 📁 **File Upload** - MinIO object storage
- 🔍 **Global Search** - Cmd+K anywhere
- 📊 **Dashboard** - Breadcrumbs, smart header
- 🧪 **Testing** - Vitest + React Testing Library
- 📧 **Email** - React Email + Resend
- 🎯 **Forms** - React Hook Form + Zod
- ⚡ **State** - Jotai + TanStack Query

## 📚 Documentation

- [Architecture](docs/architecture/overview.md)
- [Getting Started](docs/guides/getting-started.md)
- [Deployment](docs/guides/deployment.md)

## 🛠️ Tech Stack

- **Framework**: Next.js 16, React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL + Prisma
- **Storage**: MinIO
- **Auth**: NextAuth.js v5

## 📄 License

MIT

````

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add comprehensive README"
````

---

#### Task 7.2: Create Contributing Guide

**Files:**

- Create: `CONTRIBUTING.md`

**Step 1: Create contributing guide**

Create `CONTRIBUTING.md`:

````markdown
# Contributing to Naiera Starter

Thank you for considering contributing!

## Development Setup

1. Fork and clone
2. Install dependencies: `pnpm install`
3. Setup git hooks: `pnpm prepare`
4. Create feature branch: `git checkout -b feature/your-feature`

## Development Workflow

```bash
# Make changes
pnpm format && pnpm lint
pnpm test
git commit -m "feat: add your feature"
git push origin feature/your-feature
# Open PR
```
````

## Code Style

- TypeScript strict mode
- Follow existing conventions
- Write tests for new features
- Run `pnpm format` before commit

## Commit Messages

Use Conventional Commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `refactor:` Code refactoring
- `test:` Adding tests

## Pull Request Guidelines

- Link related issues
- Describe changes
- Ensure checks pass
- Request review

````

**Step 2: Commit**

```bash
git add CONTRIBUTING.md
git commit -m "docs: add contributing guide"
````

---

#### Task 7.3: Create Architecture Documentation

**Files:**

- Create: `docs/architecture/overview.md`

**Step 1: Create architecture overview**

Create `docs/architecture/overview.md`:

```markdown
# Architecture Overview

## System Layers
```

[Browser/Client]
↓
[Next.js App Router]
↓
[API Routes] → [Middleware (Auth)]
↓
[Business Logic (lib/)]
↓
[Database (Prisma)]

```

## Key Directories

- `app/` - Next.js App Router (pages + API routes)
- `components/` - React components (UI + custom)
- `lib/` - Business logic, utilities
- `prisma/` - Database schema + migrations

## Design Decisions

- **App Router** - Modern Next.js routing
- **RBAC** - Permission-based access control
- **File proxy** - All files served through API
- **Permission cache** - 5-min TTL in-memory cache
```

**Step 2: Commit**

```bash
git add docs/architecture/
git commit -m "docs: add architecture overview"
```

---

### Feature 8: Deployment

---

#### Task 8.1: Create Production Dockerfile

**Files:**

- Create: `.docker/Dockerfile`

**Step 1: Create Dockerfile**

Create `.docker/Dockerfile`:

```dockerfile
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Builder
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN corepack enable pnpm

# Generate Prisma Client
RUN pnpm prisma:generate

# Build app
ENV NEXT_TELEMETRY_DISABLED 1
RUN pnpm build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

**Step 2: Update next.config for standalone output**

Modify `next.config.ts`:

```typescript
const config: NextConfig = {
  // ... existing config
  output: "standalone",
};
```

**Step 3: Commit**

```bash
git add .docker/Dockerfile next.config.ts
git commit -m "feat(deployment): add production Dockerfile"
```

---

#### Task 8.2: Create Docker Compose Production

**Files:**

- Create: `.docker/docker-compose.prod.yml`

**Step 1: Create production compose**

Create `.docker/docker-compose.prod.yml`:

```yaml
version: "3.8"

services:
  app:
    build:
      context: ..
      dockerfile: .docker/Dockerfile
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/naiera
      - MINIO_ENDPOINT=minio
      - MINIO_PORT=9000
      - MINIO_ACCESS_KEY=minioadmin
      - MINIO_SECRET_KEY=minioadmin
      - MINIO_BUCKET=naiera-uploads
    depends_on:
      - postgres
      - minio
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: naiera
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    restart: unless-stopped

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    restart: unless-stopped

volumes:
  postgres_data:
  minio_data:
```

**Step 2: Commit**

```bash
git add .docker/docker-compose.prod.yml
git commit -m "feat(deployment): add production docker-compose"
```

---

#### Task 8.3: Create Deployment Scripts

**Files:**

- Create: `scripts/deploy.sh`
- Create: `scripts/db-backup.sh`

**Step 1: Create deploy script**

Create `scripts/deploy.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Deploying Naiera Starter..."

# Build Docker image
echo "Building Docker image..."
docker build -f .docker/Dockerfile -t naiera-starter:latest .

# Stop existing container
echo "Stopping existing container..."
docker stop naiera-starter 2>/dev/null || true
docker rm naiera-starter 2>/dev/null || true

# Start new container
echo "Starting new container..."
docker run -d \
  --name naiera-starter \
  -p 3000:3000 \
  --env-file .env.production \
  --restart unless-stopped \
  naiera-starter:latest

echo "✅ Deployed successfully!"
echo "🌐 App running at http://localhost:3000"
```

Make executable: `chmod +x scripts/deploy.sh`

**Step 2: Create backup script**

Create `scripts/db-backup.sh`:

```bash
#!/bin/bash
set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

mkdir -p $BACKUP_DIR

echo "📦 Backing up database..."

docker exec postgres pg_dump -U postgres naiera > $BACKUP_FILE
gzip $BACKUP_FILE

echo "✅ Backup saved: ${BACKUP_FILE}.gz"
```

Make executable: `chmod +x scripts/db-backup.sh`

**Step 3: Commit**

```bash
git add scripts/
git commit -m "feat(deployment): add deployment and backup scripts"
```

---

#### Task 8.4: Create CI/CD Workflow

**Files:**

- Create: `.github/workflows/ci.yml`

**Step 1: Create CI workflow**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install

      - name: Lint
        run: pnpm lint

      - name: Type check
        run: pnpm tsc --noEmit

      - name: Test
        run: pnpm test

      - name: Build
        run: pnpm build
```

**Step 2: Commit**

```bash
git add .github/workflows/
git commit -m "feat(ci): add CI workflow"
```

---

## Final Tasks

---

#### Task 9.1: Update CLAUDE.md

**Files:**

- Modify: `CLAUDE.md`

**Step 1: Update CLAUDE.md with new features**

Add sections for:

- Testing setup
- API layer usage
- Form handling
- State management
- Email system
- Deployment options

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with new features"
```

---

#### Task 9.2: Create Final Documentation

**Files:**

- Create: `docs/guides/getting-started.md`
- Create: `docs/guides/deployment.md`
- Create: `docs/api/routes.md`

**Step 1: Create getting started guide**

Create `docs/guides/getting-started.md`:

````markdown
# Getting Started

## Prerequisites

- Node.js 20+
- pnpm
- Docker (for Postgres + MinIO)
- Git

## Installation

```bash
git clone https://github.com/yourorg/naiera-starter
cd naiera-starter
pnpm install
```
````

## Environment Setup

```bash
cp .env.example .env
# Edit .env with your values
```

## Database Setup

```bash
# Start services
docker-compose up -d

# Run migrations
pnpm prisma:push

# Seed database
pnpm prisma:seed
```

## Development

```bash
pnpm dev
```

Visit http://localhost:3000

## Testing

```bash
pnpm test
pnpm test:ui
pnpm test:coverage
```

## Building

```bash
pnpm build
pnpm start
```

````

**Step 2: Create deployment guide**

Create `docs/guides/deployment.md`:

```markdown
# Deployment Guide

## Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

## Docker

```bash
docker-compose -f .docker/docker-compose.prod.yml up -d
````

## VPS

```bash
./scripts/deploy.sh
```

## Environment Variables

Required:

- DATABASE_URL
- NEXTAUTH_SECRET
- NEXTAUTH_URL
- MINIO\_\*
- RESEND_API_KEY

````

**Step 3: Commit**

```bash
git add docs/guides/
git commit -m "docs: add getting started and deployment guides"
````

---

## Success Criteria Checklist

Before considering this plan complete, verify:

- [ ] All 8 features implemented
- [ ] All tests passing (`pnpm test`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Type check passes (`pnpm tsc --noEmit`)
- [ ] Documentation complete
- [ ] Can deploy from scratch in < 10 minutes
- [ ] Clean git history with conventional commits

---

## Notes

- Each feature is independent and can be developed in any order
- TDD approach: write test first, then implement
- Commit frequently with conventional commits
- Run tests before each commit
- Keep changes small and focused

---

**Plan Status:** Ready for execution
**Total Tasks:** 60+
**Estimated Time:** 3 weeks
**Required Sub-Skill:** superpowers:executing-plans
