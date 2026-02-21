# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 application using React 19, TypeScript, and Tailwind CSS v4. The project uses the App Router architecture and is configured with shadcn/ui components for the UI layer.

## Package Manager

This project uses **pnpm** as the package manager.

## Development Commands

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm format       # Format code with Prettier
pnpm format:check # Check code formatting
pnpm test         # Run tests
pnpm test:ui      # Run tests with UI
pnpm test:coverage # Run tests with coverage
```

### Database Commands

```bash
pnpm prisma:generate  # Generate Prisma Client
pnpm prisma:migrate   # Run database migrations
pnpm prisma:push      # Push schema changes to database (dev only)
pnpm prisma:seed      # Seed database with initial data
pnpm prisma:studio    # Open Prisma Studio (database GUI)
```

**Note**: After RBAC role/permission changes, restart dev server to clear permission cache.

## Architecture

### Directory Structure

- `app/` - Next.js App Router pages and layouts
- `components/ui/` - shadcn/ui components (auto-generated, modify with caution)
- `components/` - Custom application components
- `lib/` - Utility functions and shared code
- `public/` - Static assets

### Path Aliases

The project uses TypeScript path aliases configured in `tsconfig.json`:

- `@/*` maps to the project root
- Common aliases: `@/components`, `@/lib`, `@/lib/utils`, `@/hooks`

### Component Architecture

- **shadcn/ui** components are built on Radix UI primitives
- Uses **CVA (Class Variance Authority)** for component variants
- **Hugeicons** is the icon library
- Components use the `cn()` utility from `lib/utils.ts` for className merging

### Styling

- **Tailwind CSS v4** with configuration in `app/globals.css`
- Uses CSS custom properties for theming (light/dark mode support)
- Base color theme: neutral
- Style variant: radix-vega
- Menu styling: inverted with bold accent

### Adding shadcn/ui Components

The project is configured with the shadcn MCP server. Use the shadcn tools to:

- Search for components: `mcp__shadcn__search_items_in_registries`
- View component details: `mcp__shadcn__view_items_in_registries`
- Get add commands: `mcp__shadcn__get_add_command_for_items`

### TypeScript Configuration

- Strict mode enabled
- Target: ES2017
- JSX: react-jsx

### Framework Versions

- Next.js: 16.1.6
- React: 19.2.3
- TypeScript: 5
- Tailwind CSS: 4.0

## RBAC System (Role-Based Access Control)

Permission-based authorization system:

- Database models: `Permission`, `Role`, `RolePermission`, `PermissionCache`
- Seed scripts: `prisma/seed-permissions.ts`, `prisma/seed-roles.ts`
- API protection: `protectApiRoute({ permissions: [...], handler: ... })` from `@/lib/rbac-server/api-protect`
- Permission format: `RESOURCE_ACTION_SCOPE` (e.g., `FILE_UPLOAD_OWN`, `USER_READ_ANY`)
- In-memory permission cache (5-min TTL) - invalidate with `invalidateUserPermissions(userId)` or restart dev server after role changes
- Run seeds: `pnpm tsx prisma/seed-permissions.ts && pnpm tsx prisma/seed-roles.ts`

## File Upload System

MinIO-based object storage with Next.js proxy:

- Upload API: `POST /api/files` - requires `FILE_UPLOAD_OWN` permission
- File serving: `GET /api/files/[id]/serve` - **USE THIS URL in clients!**
- DO NOT use direct MinIO URLs (`cdnUrl` field) - see TECH_DEBT.md
- File validation: magic bytes checking in `@/lib/storage/file-validator.ts`
- Components: `@/components/file-upload/FileUpload`, `@/components/profile/AvatarUpload`
- Cleanup admin API: `POST /api/files/admin/cleanup` - requires `FILE_MANAGE_ORPHANS` permission

**See Also**: `TECH_DEBT.md` for cdnUrl field documentation

### File Serving Best Practices

**IMPORTANT**: Always use proxy API for front-end file access

- ✅ **DO**: Use `getFileServeUrl(fileId)` from `@/lib/files/file-url`
- ✅ **DO**: Access files via `/api/files/[id]/serve`
- ❌ **DON'T**: Use direct MinIO URLs (`cdnUrl` field)
- ❌ **DON'T**: Construct file URLs manually

**Example**:

```typescript
import { getFileServeUrl } from "@/lib/files/file-url";

// In Server Component
const fileId = user.avatar?.id;
const avatarUrl = fileId ? getFileServeUrl(fileId) : null;

// In Client Component
<img src={avatarUrl} alt="Avatar" />
```

**Why**: Direct MinIO URLs cause connection timeouts from browser. Proxy API provides:

- RBAC permission checks
- Server-side file access (no network issues)
- Future flexibility for CDN integration

## Dashboard Navigation

Smart header and navigation system with breadcrumbs, user menu, and global search:

- **Smart Header**: Dynamic page title and icon based on current route
- **Breadcrumbs**: Navigation trail showing current position in hierarchy
- **User Dropdown**: Quick access to Profile, Settings, Logout from avatar menu
- **Global Search**: Press Cmd+K / Ctrl+K to search users, roles, permissions
- **Active Indicators**: Enhanced sidebar styling for current page

**Usage**:

```typescript
// Smart header and breadcrumbs work automatically
// Just navigate to routes in app/(dashboard) directory

// Global search
// Press Cmd+K (Mac) or Ctrl+K (Windows) anywhere in dashboard
// Search results are permission-filtered
```

**Components**:

- `components/dashboard/header.tsx` - Smart header with breadcrumbs and user dropdown
- `components/dashboard/breadcrumbs.tsx` - Breadcrumb navigation
- `components/dashboard/user-dropdown.tsx` - User menu with avatar
- `components/dashboard/search-command/command-dialog.tsx` - Global search dialog
- `lib/dashboard/page-title.ts` - Page title and icon mapping
- `lib/dashboard/breadcrumb-utils.ts` - Breadcrumb generation utilities

## Testing

Testing foundation with Vitest and React Testing Library:

### Test Setup

- **Config**: `tests/setup/vitest.config.ts` - Vitest configuration
- **Setup**: `tests/setup/test-setup.ts` - Global test setup and mocks
- **MSW Handlers**: `tests/setup/msw-handlers.ts` - API route mocks

### Test Helpers

Utilities in `tests/utils/`:

- `test-helpers.ts` - Mock data generators (sessions, users, files)
- `assertions.ts` - Custom Vitest assertions (e.g., `toHavePermission`)

### Running Tests

```bash
pnpm test           # Run all tests
pnpm test:ui        # Run tests with UI
pnpm test:coverage  # Run tests with coverage report
```

### Writing Tests

**Component Test Example**:

```typescript
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders button with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
  });
});
```

**API Route Test Example**:

```typescript
import { POST } from "@/app/api/users/route";

describe("POST /api/users", () => {
  it("requires authentication", async () => {
    const request = new Request("http://localhost:3000/api/users", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });
});
```

## API Layer

Structured API error handling and response utilities:

### Error Classes

Location: `lib/api/errors/`

- `ApiError` - Base error class
- `ValidationError` (400) - Request validation failures
- `UnauthorizedError` (401) - Authentication failures
- `ForbiddenError` (403) - Authorization failures
- `NotFoundError` (404) - Resource not found
- `ConflictError` (409) - Resource conflicts
- `RateLimitError` (429) - Rate limit exceeded

### API Response Helpers

Location: `lib/api/response.ts`

```typescript
import { apiSuccess, apiError } from "@/lib/api/response";

// Success response
return apiSuccess({ user: { id: "1", email: "test@example.com" } });

// Error response
return apiError(new ValidationError("Invalid email"));
```

### API Route Protection

```typescript
import { protectApiRoute } from "@/lib/rbac-server/api-protect";

export const POST = protectApiRoute({
  permissions: ["USER_CREATE_ANY"],
  handler: async (req, session) => {
    // Handler code here
    return apiSuccess({ user });
  },
});
```

## Form Handling

React Hook Form + Zod validation:

### Form Schema

```typescript
import { z } from "zod";

export const userFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  roleId: z.string().min(1, "Role is required"),
});

export type UserFormData = z.infer<typeof userFormSchema>;
```

### Form Component

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export function UserForm() {
  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      roleId: "",
    },
  });

  const onSubmit = async (data: UserFormData) => {
    // Submit to API
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

### Form UI Components

Use shadcn/ui form components:

- `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`
- `Input`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`

## State Management

Jotai for local state, TanStack Query for server state:

### Jotai (Local State)

```typescript
import { atom, useAtom } from "jotai";

// Define atom
export const sidebarOpenAtom = atom(false);

// Use in component
function Sidebar() {
  const [isOpen, setIsOpen] = useAtom(sidebarOpenAtom);
  return <div>{isOpen ? "Open" : "Closed"}</div>;
}
```

### TanStack Query (Server State)

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Fetch data
function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => fetch("/api/users").then((res) => res.json()),
  });
}

// Mutate data
function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserInput) =>
      fetch(`/api/users/${data.id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
```

## Email System

React Email templates + Resend sending:

### Email Templates

Location: `emails/`

```typescript
import { Button } from "./components/button";

export function WelcomeEmail({ name }: { name: string }) {
  return (
    <Email>
      <h1>Welcome, {name}!</h1>
      <Button href="https://example.com">Get Started</Button>
    </Email>
  );
}
```

### Sending Emails

```typescript
import { Resend } from "resend";
import { WelcomeEmail } from "@/emails/welcome-email";

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: "noreply@example.com",
  to: "user@example.com",
  subject: "Welcome!",
  react: <WelcomeEmail name="User" />,
});
```

## Deployment

### Production Deployment Options

**Vercel (Recommended)**:

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy automatically

**Docker**:

```bash
# Build and run with docker-compose
docker-compose -f .docker/docker-compose.prod.yml up -d
```

**VPS/Server**:

```bash
# Use deployment script
./scripts/deploy.sh
```

### Docker Configuration

- **Dockerfile**: `.docker/Dockerfile` - Multi-stage production build
- **Compose**: `.docker/docker-compose.prod.yml` - Production services
- **Output**: `next.config.ts` - Standalone output configured

### Deployment Scripts

- `scripts/deploy.sh` - Deploy application
- `scripts/db-backup.sh` - Backup database

### CI/CD

GitHub Actions workflow: `.github/workflows/ci.yml`

Runs on push to main/develop:

- Install dependencies
- Lint code
- Type check
- Run tests
- Build application

## Development Environment

### Local Services (Docker)

Start required services (MinIO for object storage):

```bash
docker-compose up -d
```

This starts:

- MinIO (ports 9000 API, 9001 console)
- PostgreSQL (if configured in docker-compose.yml)

Stop services:

```bash
docker-compose down
```

### MinIO (Object Storage)

- Docker service: see `docker-compose.yml` for configuration
- Default: `minioadmin:minioadmin`, port 9000 (API), 9001 (console)
- Bucket: `naiera-uploads`

### Troubleshooting Caching Issues

- Browser cache: Hard refresh `Ctrl+Shift+R` or clear DevTools → Application → Clear storage
- Next.js cache: Delete `.next` directory and restart dev server
- Permission cache: Restart dev server after role/permission changes
- Always check Network tab in DevTools to verify actual API responses

## Code Quality Standards

### Formatting

```bash
pnpm format        # Format all files
pnpm format:check  # Check formatting without modifying
```

This project uses:

- **Prettier** for code formatting
- **prettier-plugin-organize-imports** for import organization
- Lefthook runs prettier + eslint on pre-commit

This project uses lefthook for Git hooks:

- Pre-commit: prettier + eslint (must pass to commit)
- Pre-push: TypeScript type-check (must pass to push)
- Type safety: Use `unknown` instead of `any`, with type guards like `error instanceof Error`
- Unused variables: prefix with `_` (e.g., `_req`) or remove
- Bypass hooks (not recommended): `git commit --no-verify` or `git push --no-verify`

## Additional Documentation

- **KNOWN_ISSUES.md** - Runtime issues and troubleshooting
- **TECH_DEBT.md** - Technical debt tracking and cdnUrl field documentation

## Environment Configuration

Required environment variables (see `.env.example`):

- Database: `DATABASE_URL`, `DIRECT_URL`
- MinIO: `MINIO_ENDPOINT`, `MINIO_PORT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET`
- NextAuth: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- App: `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_APP_NAME`
