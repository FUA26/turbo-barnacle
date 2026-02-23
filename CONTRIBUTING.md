# Contributing to Naiera Starter

Thank you for considering contributing to Naiera Starter! This guide will help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Convention](#commit-convention)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Testing Guidelines](#testing-guidelines)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. Be constructive, respectful, and collaborative.

## Getting Started

### Prerequisites

- Node.js 20 or higher
- pnpm package manager
- Docker (for PostgreSQL and MinIO)
- Git

### Initial Setup

```bash
# Fork and clone the repository
git clone https://github.com/yourusername/naiera-starter.git
cd naiera-starter

# Install dependencies
pnpm install

# Setup git hooks
pnpm prepare

# Start development services
docker-compose up -d

# Setup database
pnpm prisma:push
pnpm prisma:seed

# Start development server
pnpm dev
```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
# or
git checkout -b docs/your-documentation-update
```

### 2. Make Your Changes

- Write code following our [coding standards](#coding-standards)
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass

### 3. Test Your Changes

```bash
# Run linter and formatter
pnpm lint
pnpm format:check

# Run tests
pnpm test
pnpm test:e2e

# Type check
pnpm type-check
```

### 4. Commit Your Changes

Use [conventional commits](#commit-convention):

```bash
git add .
git commit -m "feat: add new feature description"
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Coding Standards

### TypeScript

- Use **strict mode** - All code must be type-safe
- Avoid `any` - Use `unknown` with type guards instead
- Use explicit return types for public functions
- Prefer `interface` for object shapes, `type` for unions/intersections

```typescript
// Good
interface User {
  id: string;
  name: string;
}

async function getUser(id: string): Promise<User | null> {
  // ...
}

// Bad
async function getUser(id: any): any {
  // ...
}
```

### React Components

- Use **function components** with hooks
- Follow **hooks rules** - Only call at top level
- Use **typescript** for props
- Keep components **small and focused**
- Use **proper TypeScript types**

```typescript
// Good
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

export function Button({ children, onClick, variant = "primary" }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>;
}

// Bad
export function Button(props: any) {
  return <button>{props.children}</button>;
}
```

### File Naming

- **Components**: `kebab-case.tsx` (e.g., `user-profile.tsx`)
- **Utilities**: `kebab-case.ts` (e.g., `date-utils.ts`)
- **Types**: `*.types.ts` (e.g., `user.types.ts`)
- **Tests**: `*.test.ts` or `*.test.tsx`

### Imports

```typescript
// 1. External libraries
import { useState } from "react";
import { z } from "zod";

// 2. Internal imports with @ alias
import { Button } from "@/components/ui/button";
import { apiSuccess } from "@/lib/api/response";

// 3. Relative imports (avoid when possible)
import { MyComponent } from "./my-component";
```

### Error Handling

- Use **custom error classes** from `@/lib/api/errors`
- Handle errors appropriately
- Never throw raw errors to the client

```typescript
// Good
import { ValidationError, NotFoundError } from "@/lib/api/errors";

export async function getUser(id: string) {
  if (!id) {
    throw new ValidationError("User ID is required");
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new NotFoundError("User not found");
  }

  return user;
}

// Bad
throw new Error("User not found");
```

### Prisma Queries

- Use **type-safe queries**
- **Select only needed fields** for performance
- Use **transactions** for multiple operations

```typescript
// Good
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    name: true,
    email: true,
  },
});

// Bad - fetches all fields
const user = await prisma.user.findUnique({ where: { id } });
```

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
- `ci` - CI/CD changes

### Scopes

Common scopes:

- `auth` - Authentication
- `rbac` - Role-based access control
- `ui` - UI components
- `api` - API routes
- `db` - Database/Prisma
- `docs` - Documentation

### Examples

```bash
# Feature
feat(auth): add OAuth2 Google provider

# Bug fix
fix(rbac): resolve permission cache invalidation issue

# Documentation
docs(readme): update installation instructions

# Refactor
refactor(api): simplify error handling middleware

# Tests
test(user): add unit tests for user service
```

### Commit Message Body

Add detailed explanation in the body for complex changes:

```bash
feat(storage): implement file upload progress tracking

- Add progress callback to uploadService
- Update FileUpload component to display progress
- Add cancellation support for large uploads

Closes #123
```

## Pull Request Guidelines

### PR Title

Use the same convention as commits:

```
feat(auth): add OAuth2 Google provider
fix(rbac): resolve permission cache issue
```

### PR Description

Include:

- **What** - Brief description of changes
- **Why** - Reason for the change
- **How** - Implementation approach
- **Screenshots** - For UI changes
- **Breaking changes** - If applicable
- **Related issues** - Closes #xxx

### PR Template

```markdown
## Summary

Brief description of changes

## Changes

- Change 1
- Change 2
- Change 3

## Testing

- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes (or documented)

## Related Issues

Closes #xxx
```

### Review Process

1. **Automated checks** - CI/CD must pass
2. **Code review** - At least one maintainer approval
3. **Changes requested** - Address feedback
4. **Approval** - Ready to merge

## Testing Guidelines

### Unit Tests

- Test **public APIs** and **components**
- Mock external dependencies
- Use **descriptive test names**

```typescript
describe("UserService", () => {
  describe("createUser", () => {
    it("should create user with valid data", async () => {
      const user = await createUser({
        email: "test@example.com",
        password: "SecurePass123!",
      });

      expect(user).toHaveProperty("id");
      expect(user.email).toBe("test@example.com");
    });

    it("should throw error for duplicate email", async () => {
      await expect(createUser({ email: "existing@example.com", password: "pass" })).rejects.toThrow(
        ConflictError
      );
    });
  });
});
```

### Component Tests

- Test **user interactions**
- Test **props and state**
- Test **error states**

```typescript
describe("Button", () => {
  it("renders with correct text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button")).toHaveTextContent("Click me");
  });

  it("calls onClick when clicked", async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    await userEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### E2E Tests

- Test **critical user flows**
- Test **authentication flows**
- Test **CRUD operations**

```typescript
test("user can login and view dashboard", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="email"]', "admin@example.com");
  await page.fill('input[name="password"]', "password");
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL("/dashboard");
  await expect(page.locator("h1")).toContainText("Dashboard");
});
```

### Test Coverage

- Maintain **80%+ coverage** for new code
- Focus on **critical paths**
- Review coverage reports:

```bash
pnpm test:coverage
```

## Documentation

### When to Document

- **New features** - Update README and feature docs
- **API changes** - Update API documentation
- **Breaking changes** - Update migration guide
- **New components** - Add JSDoc comments

### JSDoc Comments

````typescript
/**
 * Creates a new user in the system
 *
 * @param data - User creation data
 * @param data.email - User's email address
 * @param data.password - User's password (will be hashed)
 * @returns Created user object
 * @throws {ValidationError} If email is invalid
 * @throws {ConflictError} If email already exists
 *
 * @example
 * ```typescript
 * const user = await createUser({
 *   email: "user@example.com",
 *   password: "SecurePass123!"
 * });
 * ```
 */
export async function createUser(data: CreateUserInput): Promise<User> {
  // ...
}
````

## Getting Help

- 📖 Read the [documentation](docs/)
- 💬 Ask in [GitHub Discussions](https://github.com/yourorg/naiera-starter/discussions)
- 🐛 [Report bugs](https://github.com/yourorg/naiera-starter/issues)
- 💡 Join our community Discord

## Recognition

Contributors will be:

- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Recognized in our community

Thank you for contributing! 🙏
