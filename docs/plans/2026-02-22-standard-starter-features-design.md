# Standard Starter Features Design

**Date:** 2026-02-22
**Status:** Approved
**Version:** 1.0

## Overview

This document outlines the design for 8 essential features to transform Naiera Next into a production-ready standard starter. These features provide a solid foundation for building internal enterprise tools, with clear paths for future enterprise-grade enhancements.

## Goals

- Create a comprehensive Next.js starter with essential features
- Maintain YAGNI principle - standard features first, enterprise upgrades later
- Provide clear upgrade paths for future enterprise features
- Ensure all features are production-ready and well-documented

## Feature Summary

| #   | Feature            | Stack                                | Complexity | Priority |
| --- | ------------------ | ------------------------------------ | ---------- | -------- |
| 1   | Testing Foundation | Vitest, Testing Library, MSW         | Medium     | High     |
| 2   | API Layer          | Custom error handling, rate limiting | Medium     | High     |
| 3   | Form Handling      | React Hook Form, Zod, AutoForm       | High       | High     |
| 4   | State Management   | Jotai, TanStack Query                | Medium     | High     |
| 5   | Error Handling     | Error Boundaries, Logging            | Medium     | High     |
| 6   | Email System       | React Email, Resend                  | Medium     | Medium   |
| 7   | Documentation      | Markdown guides                      | Low        | High     |
| 8   | Deployment         | Docker, CI/CD                        | Medium     | High     |

---

## 1. Testing Foundation

### Stack

- **Vitest** - Fast, native ESM test runner
- **React Testing Library** - Component testing utilities
- **MSW** - API mocking

### Architecture

```
tests/
├── setup/
│   ├── vitest.config.ts      # Vitest configuration
│   ├── test-db.ts            # Test database setup
│   └── msw-handlers.ts       # API mocks
├── utils/
│   ├── test-helpers.ts       # Mock helpers
│   └── assertions.ts         # Custom assertions
└── e2e/                      # Playwright (future)
```

### Implementation

1. **Vitest Config**
   - Next.js integration
   - Path aliases support
   - TypeScript strict mode

2. **Test Database**
   - Separate test database
   - Auto-seed before tests
   - Cleanup after tests

3. **Test Helpers**

   ```typescript
   mockSession(); // Authenticated session mock
   mockUser(); // Test user data generator
   createTestFile(); // File upload test helper
   ```

4. **Example Tests**
   - Component test: Button
   - API test: Login endpoint
   - Auth test: Protected route

### Future Improvements (Enterprise)

- E2E testing with Playwright
- Visual regression testing
- Performance testing
- Load testing
- A/B testing framework

---

## 2. API Layer

### Architecture

```
lib/api/
├── errors/
│   ├── api-error.ts          # Base error class
│   ├── errors.ts             # Specific error types
│   └── handler.ts            # Error handler
├── response/
│   ├── api-response.ts       # Response format
│   └── paginator.ts          # Pagination helper
├── middleware/
│   ├── rate-limit.ts         # Rate limiting
│   ├── request-validator.ts  # Zod validation
│   └── error-handler.ts      # Middleware wrapper
└── routes/
    ├── index.ts              # Route builders
    └── examples/             # Example routes
```

### Implementation

1. **Standard Response Format**

   ```typescript
   // Success
   { success: true, data: {...}, meta: {...} }

   // Error
   { success: false, error: { code, message, details } }
   ```

2. **Error Classes**
   - ValidationError (400)
   - UnauthorizedError (401)
   - ForbiddenError (403)
   - NotFoundError (404)
   - ConflictError (409)
   - RateLimitError (429)

3. **Rate Limiting**
   - In-memory store (Map)
   - Per-IP and per-user limits
   - Configurable windows

4. **API Route Helpers**
   ```typescript
   export const POST = withApiHandler(
     withRateLimit({ max: 5, windowMs: 60000 }),
     withValidation(Schema),
     withAuth(),
     handler
   );
   ```

### Future Improvements (Enterprise)

- Redis-based rate limiting
- API versioning (/v1, /v2)
- Request logging/audit logs
- OpenAPI/Swagger docs
- GraphQL support
- Circuit breaker pattern

---

## 3. Form Handling

### Architecture

```
components/form/
├── form.tsx                   # Form wrapper
├── fields/
│   ├── form-field.tsx         # Field wrapper
│   ├── input.tsx
│   ├── textarea.tsx
│   ├── select.tsx
│   ├── checkbox.tsx
│   ├── switch.tsx
│   ├── date-picker.tsx
│   └── file-upload.tsx
├── combos/
│   ├── searchable-select.tsx
│   ├── multi-select.tsx
│   └── async-select.tsx
└── auto-form.tsx              # Auto-generate from schema

lib/form/
├── validators/
│   ├── common.ts
│   ├── user.ts
│   └── file.ts
└── form-actions.ts
```

### Implementation

1. **Enhanced Field Components**
   - Consistent API
   - Auto error display
   - Disabled state, helper text

2. **AutoForm Component**

   ```typescript
   <AutoForm
     schema={CreateUserSchema}
     onSubmit={handleCreate}
     submitLabel="Create User"
   />
   ```

3. **Server Actions**

   ```typescript
   createSafeAction(schema, handler);
   ```

4. **Common Validators**
   - Email, password, phone
   - File validation
   - Custom rules

### Future Improvements (Enterprise)

- Form autosave (localStorage)
- Dirty state detection
- Multi-step wizards
- Conditional fields
- Form versioning
- Real-time collaboration
- Dynamic form builder

---

## 4. State Management

### Stack

- **Jotai** - Client-side global state
- **TanStack Query** - Server state

### Architecture

```
lib/state/
├── atoms/
│   ├── ui.ts                  # UI state
│   ├── user.ts                # User preferences
│   └── index.ts
├── queries/
│   ├── client.ts              # QueryClient config
│   ├── provider.tsx
│   ├── hooks.ts               # Custom hooks
│   └── mutations.ts
└── cache/
    ├── keys.ts                # Query keys factory
    └── invalidation.ts

components/providers/
└── state-provider.tsx
```

### Implementation

1. **Jotai Atoms**

   ```typescript
   const sidebarOpenAtom = atom(true);
   const themeAtom = atom("light");
   ```

2. **QueryClient Configuration**
   - 5-minute stale time
   - Single retry
   - No refetch on focus

3. **Query Keys Factory**

   ```typescript
   queryKeys.users.lists();
   queryKeys.users.detail(id);
   ```

4. **Custom Hooks**
   ```typescript
   useUsers(params);
   useCreateUser();
   useUpdateUser();
   ```

### Future Improvements (Enterprise)

- Optimistic updates
- Infinite scroll
- Real-time subscriptions
- Offline support
- State persistence
- Time-travel debugging
- Cross-tab sync

---

## 5. Error Handling

### Architecture

```
components/error/
├── error-boundary.tsx
├── error-fallback.tsx
└── async-error-boundary.tsx

lib/errors/
├── logger.ts
├── error-tracker.ts
└── types.ts

app/
├── error.tsx
└── not-found.tsx

templates/
└── error-page.tsx
```

### Implementation

1. **Error Boundaries**
   - React Error Boundary wrapper
   - Fallback UI components
   - Error logging integration

2. **Error Logger**

   ```typescript
   logError(error, context);
   ```

3. **Custom Error Pages**
   - Global error boundary
   - Dashboard-specific
   - 404 page
   - 500 page

4. **Error Classes**
   ```typescript
   class AppError extends Error {
     constructor(message, code, statusCode, details);
   }
   ```

### Future Improvements (Enterprise)

- Sentry integration
- Error alerting (Slack/Email)
- Error dashboards
- Recovery strategies
- Client-side monitoring
- Performance monitoring
- User feedback system

---

## 6. Email System

### Architecture

```
lib/email/
├── service/
│   ├── email-service.ts       # Abstraction
│   ├── resend.ts              # Resend impl
│   └── mock.ts                # Mock impl
├── templates/
│   ├── base.tsx
│   ├── verification.tsx
│   ├── password-reset.tsx
│   ├── welcome.tsx
│   ├── invite.tsx
│   └── notification.tsx
└── utils.ts

app/api/email/preview/[...path]/route.ts
```

### Implementation

1. **Email Service Interface**

   ```typescript
   interface EmailService {
     send(data: EmailData): Promise<EmailResult>;
     bulkSend(data: EmailData[]): Promise<EmailResult[]>;
   }
   ```

2. **Email Templates**
   - React Email components
   - Verification, password reset, welcome
   - Invite, notification

3. **Sending Utilities**

   ```typescript
   sendVerificationEmail(email, token);
   sendPasswordResetEmail(email, token);
   ```

4. **Email Preview**
   - Dev-only endpoint
   - Live preview at `/api/email/preview/:template`

### Future Improvements (Enterprise)

- Email queue (BullMQ)
- Email analytics
- Preferences center
- Multiple providers
- Template editor
- A/B testing
- Drip campaigns
- Localization

---

## 7. Documentation

### Architecture

```
docs/
├── architecture/
│   ├── overview.md
│   ├── directory-structure.md
│   ├── data-flow.md
│   └── authentication.md
├── guides/
│   ├── getting-started.md
│   ├── deployment.md
│   ├── env-setup.md
│   └── testing.md
├── api/
│   └── routes.md
├── contributing/
│   ├── index.md
│   ├── code-style.md
│   ├── commit-messages.md
│   └── pull-requests.md
└── changelog.md
```

### Implementation

1. **Enhanced README.md**
   - Quick start
   - Feature highlights
   - Tech stack
   - Links to docs

2. **Contributing Guide**
   - Development workflow
   - Code style
   - Commit conventions
   - PR guidelines

3. **Architecture Docs**
   - System overview
   - Directory structure
   - Design decisions

4. **API Documentation**
   - Endpoint catalog
   - Authentication requirements
   - Request/response formats

### Future Improvements (Enterprise)

- Storybook for components
- Swagger/OpenAPI docs
- Architecture Decision Records
- Video tutorials
- Interactive examples
- Migration guides
- Performance docs

---

## 8. Deployment

### Architecture

```
scripts/
├── build.sh
├── deploy.sh
├── db-backup.sh
├── db-restore.sh
└── env-setup.sh

.docker/
├── Dockerfile
├── Dockerfile.dev
├── docker-compose.prod.yml
└── docker-compose.test.yml

.github/workflows/
├── ci.yml
├── cd.yml
└── test.yml
```

### Implementation

1. **Production Dockerfile**
   - Multi-stage build
   - Alpine-based
   - Non-root user
   - Standalone output

2. **Docker Compose Production**
   - App + Postgres + MinIO
   - Persistent volumes
   - Health checks

3. **Deployment Scripts**

   ```bash
   ./scripts/deploy.sh        # Deploy to Docker
   ./scripts/db-backup.sh     # Backup database
   ./scripts/env-setup.sh     # Check environment
   ```

4. **CI/CD Workflow**
   - Lint, type-check, test
   - Build verification
   - Auto-deploy on merge

5. **Deployment Options**
   - Vercel (recommended)
   - Docker Compose
   - VPS (DigitalOcean, AWS)
   - Kubernetes (Helm)

### Future Improvements (Enterprise)

- Multi-environment support
- Blue-green deployment
- Canary deployments
- Rollback automation
- Load balancing
- CDN integration
- Infrastructure as Code
- Secrets management
- Monitoring & alerting

---

## Implementation Phases

### Phase 1: Foundation (Week 1)

1. Testing Foundation
2. API Layer
3. Error Handling

### Phase 2: Features (Week 2)

4. Form Handling
5. State Management
6. Email System

### Phase 3: Polish (Week 3)

7. Documentation
8. Deployment

---

## Success Criteria

- [ ] All 8 features implemented and tested
- [ ] Documentation complete and accurate
- [ ] Can deploy from scratch in < 10 minutes
- [ ] All tests passing (including example tests)
- [ ] No critical bugs or security issues
- [ ] Clean git history with conventional commits

---

## Next Steps

1. Create detailed implementation plan using `writing-plans` skill
2. Set up task tracking for all features
3. Begin Phase 1 implementation

---

## Appendix

### Dependencies to Add

```json
{
  "devDependencies": {
    "@vitest/ui": "^2.0.0",
    "vitest": "^2.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "msw": "^2.0.0"
  },
  "dependencies": {
    "@tanstack/react-query": "^5.0.0"
  }
}
```

### File Structure Summary

```
naiera-next/
├── tests/                    # NEW
├── lib/
│   ├── api/                  # NEW
│   ├── form/                 # NEW
│   ├── state/                # NEW
│   ├── email/                # NEW
│   └── errors/               # NEW
├── components/
│   ├── form/                 # NEW
│   └── error/                # NEW
├── docs/                     # ENHANCED
├── scripts/                  # NEW
├── .docker/                  # NEW
└── .github/workflows/        # NEW
```

---

**Document Status:** ✅ Approved
**Ready for Implementation Planning:** Yes
