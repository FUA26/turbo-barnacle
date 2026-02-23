# Project Structure

Complete guide to the Naiera Starter file structure.

## Directory Overview

```
naiera-starter/
├── app/                          # Next.js App Router
│   ├── (dashboard)/             # Dashboard route group (auth required)
│   │   ├── analytics/           # Analytics dashboard
│   │   ├── dashboard/           # Main dashboard
│   │   ├── demo/                # Demo pages
│   │   ├── manage/              # Admin management
│   │   │   ├── permissions/     # Permission management
│   │   │   ├── roles/           # Role management
│   │   │   ├── users/           # User management
│   │   │   └── system-settings/ # System settings
│   │   ├── profile/             # User profile
│   │   ├── settings/            # User settings
│   │   ├── layout.tsx           # Dashboard layout wrapper
│   │   └── loading.tsx          # Dashboard loading skeleton
│   ├── (auth)/                  # Authentication route group
│   │   ├── forgot-password/     # Forgot password
│   │   ├── register/            # User registration
│   │   ├── reset-password/      # Password reset
│   │   └── verify-email/        # Email verification
│   ├── (marketing)/             # Public pages
│   │   ├── features/            # Features page
│   │   ├── layout.tsx           # Marketing layout
│   │   └── page.tsx             # Landing page
│   ├── api/                     # API routes
│   │   ├── auth/                # Authentication endpoints
│   │   ├── files/               # File upload/management
│   │   ├── permissions/         # Permission CRUD
│   │   ├── roles/               # Role CRUD
│   │   ├── search/              # Global search
│   │   ├── system-settings/     # Settings management
│   │   └── users/               # User CRUD
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   ├── not-found.tsx            # 404 page
│   ├── error.tsx                # Error boundary
│   ├── page.tsx                 # Home page
│   └── unauthorized.tsx         # 403 page
├── components/                  # React components
│   ├── analytics/               # Analytics components
│   │   ├── activity-section.tsx
│   │   ├── chart-wrapper.tsx
│   │   ├── filter-bar.tsx
│   │   ├── resource-section.tsx
│   │   ├── summary-cards.tsx
│   │   ├── system-stats-section.tsx
│   │   └── user-stats-section.tsx
│   ├── admin/                   # Admin components
│   │   └── data-table/          # Advanced data table
│   ├── auth/                    # Authentication forms
│   │   ├── forgot-password-form.tsx
│   │   ├── login-form.tsx
│   │   ├── register-form.tsx
│   │   └── reset-password-form.tsx
│   ├── dashboard/               # Dashboard components
│   │   ├── breadcrumbs.tsx
│   │   ├── dashboard-layout.tsx
│   │   ├── dashboard-skeleton.tsx
│   │   ├── header.tsx
│   │   ├── search-command/      # Global search command palette
│   │   ├── sidebar.tsx
│   │   └── user-dropdown.tsx
│   ├── error/                   # Error handling
│   │   ├── error-boundary.tsx
│   │   └── error-fallback.tsx
│   ├── file-upload/             # File upload components
│   │   ├── file-dropzone.tsx
│   │   └── file-upload.tsx
│   ├── form/                    # Form components
│   │   └── fields/
│   ├── profile/                 # Profile components
│   │   ├── avatar-upload-simple.tsx
│   │   ├── avatar-upload.tsx
│   │   ├── change-password-form.tsx
│   │   └── profile-form.tsx
│   ├── rbac/                    # RBAC components
│   │   ├── ProtectedRoute.tsx
│   │   └── Shield.tsx
│   ├── shared/                  # Shared components
│   │   └── providers.tsx        # Context providers
│   └── ui/                      # shadcn/ui components
├── docs/                        # Documentation
│   ├── architecture/            # Architecture docs
│   ├── designs/                 # Design documents
│   ├── guides/                  # How-to guides
│   └── plans/                   # Implementation plans
├── emails/                      # Email templates
│   └── templates/               # React Email templates
├── hooks/                       # Custom React hooks
├── lib/                         # Business logic
│   ├── analytics/               # Analytics data
│   ├── api/                     # API utilities
│   │   ├── errors/              # Error classes
│   │   ├── middleware/          # API middleware
│   │   ├── response/            # Response helpers
│   │   └── routes/              # Route builders
│   ├── auth/                    # Authentication
│   ├── dashboard/               # Dashboard utilities
│   ├── email/                   # Email service
│   ├── env.ts                   # Environment validation
│   ├── errors/                  # Error logging
│   ├── file-upload/             # File upload logic
│   ├── files/                   # File utilities
│   ├── form/                    # Form utilities
│   ├── rbac-client/             # Client RBAC
│   ├── rbac-server/             # Server RBAC
│   ├── state/                   # State management
│   ├── storage/                 # File storage
│   ├── table/                   # Table utilities
│   ├── tokens.ts                # Token utilities
│   ├── utils.ts                 # General utilities
│   └── validations/             # Zod schemas
├── prisma/                      # Database
│   ├── migrations/              # SQL migrations
│   ├── schema.prisma            # Database schema
│   ├── seed-permissions.ts      # Seed permissions
│   ├── seed-roles.ts            # Seed roles
│   └── seed-system-settings.ts  # Seed settings
├── public/                      # Static assets
├── scripts/                     # Utility scripts
├── shared-data-table/           # Shared data table package
├── tests/                       # Tests
│   ├── components/              # Component tests
│   ├── e2e/                     # E2E tests
│   ├── lib/                     # Library tests
│   ├── setup/                   # Test configuration
│   └── utils/                   # Test utilities
├── templates/                   # Code templates
├── .docker/                     # Docker files
├── .env.example                 # Environment template
├── CLAUDE.md                    # AI assistant guide
├── CHANGELOG.md                 # Version history
├── next.config.ts               # Next.js config
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
└── vitest.config.ts             # Test config
```

## Key Files Explained

### App Directory

#### `app/layout.tsx`

Root layout that wraps all pages. Contains:

- HTML structure
- Metadata configuration
- Global providers
- Font configuration

#### `app/(dashboard)/layout.tsx`

Dashboard route group layout. Provides:

- Authentication check (redirects to /login if unauthenticated)
- Permission loading
- DashboardLayout wrapper with sidebar and header
- User data fetching

#### `app/(marketing)/layout.tsx`

Public pages layout. Used for:

- Landing page
- Features page
- Any public marketing pages

### API Routes

#### `app/api/auth/[...nextauth]/route.ts`

NextAuth.js handler. Manages:

- Login/logout
- Session management
- OAuth callbacks
- CSRF protection

#### `app/api/users/route.ts`

User CRUD operations:

- `GET` - List users (with pagination, filtering)
- `POST` - Create new user

#### `app/api/users/[id]/route.ts`

Single user operations:

- `GET` - Get user by ID
- `PATCH` - Update user
- `DELETE` - Delete user

### Components

#### `components/dashboard/sidebar.tsx`

Main navigation sidebar. Features:

- Collapsible menu
- Permission-based filtering
- Active page highlighting
- Grouped navigation items

#### `components/admin/data-table/`

Advanced data table with:

- Column visibility toggle
- Sorting
- Filtering
- Pagination
- Bulk actions

#### `components/ui/`

shadcn/ui components. Auto-generated from shadcn CLI. Modify with caution.

### Library (`lib/`)

#### `lib/rbac-server/api-protect.ts`

API route protection decorator:

```typescript
export const POST = protectApiRoute({
  permissions: ["USER_CREATE_ANY"],
  handler: async (req, session) => {
    // Your handler code
  },
});
```

#### `lib/rbac-client/hooks.ts`

Client-side permission hooks:

```typescript
const { can, isLoading } = usePermissions();

{can("USER_DELETE_ANY") && <DeleteButton />}
```

#### `lib/api/response.ts`

API response helpers:

```typescript
return apiSuccess({ user });
return apiError(new ValidationError("Invalid email"));
```

#### `lib/storage/minio-client.ts`

MinIO/S3 client wrapper. Handles:

- File upload
- File deletion
- Bucket operations

#### `lib/file-upload/upload-service.ts`

File upload orchestration:

- Validation
- Upload to storage
- Database record creation
- Error handling

#### `lib/dashboard/page-title.ts`

Page title and icon mapping. Maps routes to titles and icons for smart header.

### Database (`prisma/`)

#### `prisma/schema.prisma`

Database schema. Defines:

- Models (User, Role, Permission, File, etc.)
- Relationships
- Indexes
- Enums

#### `prisma/seed-roles.ts`

Seeds default roles:

- ADMIN - Full access
- USER - Basic access
- Custom roles

#### `prisma/seed-permissions.ts`

Defines all permissions in the system. Add new permissions here.

### Tests

#### `tests/e2e/`

Playwright end-to-end tests. Covers:

- Authentication flows
- CRUD operations
- Navigation
- Permissions

#### `tests/components/`

React component tests using React Testing Library.

#### `tests/setup/test-setup.ts`

Global test configuration. Sets up:

- Test environment
- Mocks
- Test utilities

### Configuration Files

#### `next.config.ts`

Next.js configuration. Contains:

- Output mode (standalone)
- Image domains
- Feature flags

#### `tsconfig.json`

TypeScript configuration. Includes:

- Path aliases (@/\*)
- Strict mode
- Target configuration

#### `.env.example`

Template for environment variables. Copy to `.env` and configure.

## Adding New Features

### Add a New Page

1. Create page in appropriate route group:

```typescript
// app/(dashboard)/my-page/page.tsx
export default async function MyPage() {
  return (
    <div>
      <h2>My Page</h2>
      {/* Content */}
    </div>
  );
}
```

2. Add to sidebar navigation:

```typescript
// components/dashboard/sidebar.tsx
const navItems = [
  // ...
  { href: "/my-page", label: "My Page", icon: Icon, permission: null },
];
```

3. Add page title mapping:

```typescript
// lib/dashboard/page-title.ts
pageTitleMap: {
  "/my-page": { title: "My Page", icon: Icon },
}
```

### Add a New API Route

```typescript
// app/api/my-resource/route.ts
import { protectApiRoute } from "@/lib/rbac-server/api-protect";
import { apiSuccess, apiError } from "@/lib/api/response";

export const GET = protectApiRoute({
  permissions: ["MY_RESOURCE_READ_ANY"],
  handler: async (req, session) => {
    try {
      // Your logic here
      return apiSuccess({ data: "result" });
    } catch (error) {
      return apiError(error);
    }
  },
});
```

### Add New Permission

1. Define in `prisma/seed-permissions.ts`:

```typescript
export const PERMISSIONS = [
  // ...
  "MY_RESOURCE_CREATE_ANY",
  "MY_RESOURCE_READ_ANY",
  "MY_RESOURCE_UPDATE_ANY",
  "MY_RESOURCE_DELETE_ANY",
] as const;
```

2. Run seed:

```bash
pnpm tsx prisma/seed-permissions.ts
```

3. Assign to role in `prisma/seed-roles.ts` or through UI.

### Add New Validation Schema

```typescript
// lib/validations/my-resource.ts
import { z } from "zod";

export const myResourceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

export type MyResourceInput = z.infer<typeof myResourceSchema>;
```

### Add New Email Template

```typescript
// emails/templates/my-email.tsx
import { Email } from "@/email";

export function MyEmail({ name }: { name: string }) {
  return (
    <Email>
      <h1>Hello {name}!</h1>
      <p>This is my custom email.</p>
    </Email>
  );
}
```

## File Naming Conventions

- **Pages**: `page.tsx` (App Router convention)
- **Layouts**: `layout.tsx`
- **Loading states**: `loading.tsx`
- **Error states**: `error.tsx`
- **API routes**: `route.ts`
- **Components**: `kebab-case.tsx`
- **Utilities**: `kebab-case.ts`
- **Types**: `types.ts` or `*.types.ts`
- **Tests**: `*.test.ts` or `*.test.tsx`
- **Specs**: `*.spec.ts` or `*.spec.tsx`

## Import Conventions

```typescript
// External libraries
import { useState } from "react";
import { z } from "zod";

// Internal - use @ alias
import { Button } from "@/components/ui/button";
import { apiSuccess } from "@/lib/api/response";
import { myResourceSchema } from "@/lib/validations/my-resource";
```

## Best Practices

### Component Organization

```
components/
├── feature-name/           # Feature-specific components
│   ├── feature-component.tsx
│   └── feature-helpers.ts
├── ui/                     # Generic UI components
└── shared/                 # Shared components
```

### Library Organization

```
lib/
├── feature-name/           # Feature-specific logic
│   ├── crud.ts            # CRUD operations
│   ├── types.ts           # Feature types
│   └── utils.ts           # Feature utilities
├── api/                   # API utilities
└── utils.ts               # General utilities
```

### Route Organization

```
app/
├── (route-group)/         # Logical grouping (dashboard, auth, etc.)
│   ├── feature/
│   │   ├── [id]/         # Dynamic routes
│   │   └── page.tsx
│   └── layout.tsx        # Group layout
└── api/                   # API routes
    └── feature/
        └── route.ts
```

## Path Aliases

Configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

Usage:

```typescript
import { Component } from "@/components/component";
import { utility } from "@/lib/utility";
import { type } from "@/lib/feature/types";
```
