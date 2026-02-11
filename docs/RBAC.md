# RBAC (Role-Based Access Control) Implementation

This document describes the complete RBAC system implemented for the Next.js application.

## Overview

The RBAC system provides:

- **Two-layer Protection**: Frontend (UI access control) and Backend (API access control)
- **Split-Repository Ready**: Core logic can be extracted to a separate package
- **Resource-Level Permissions**: Granular permissions like `USER_UPDATE_OWN` vs `USER_UPDATE_ANY`
- **Database-Driven**: All role-permission mappings stored in the database
- **Role-Based Only**: Users get permissions through roles, no direct user permission overrides

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND                             │
│  React Client Components (useCan, Can, Shield)          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   SHARED LAYER                          │
│           lib/rbac/ (Extractable Package)               │
│  • types.ts - TypeScript definitions                    │
│  • checker.ts - Permission checking logic               │
│  • cache.ts - In-memory caching                         │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│               BACKEND (Database + API)                  │
│  • Prisma ORM - Role/Permission tables                  │
│  • API Route Protection Wrapper                         │
│  • Server-side permission loading                       │
└─────────────────────────────────────────────────────────┘
```

## Directory Structure

```
lib/
├── rbac/                           # Shared RBAC core (extractable)
│   ├── types.ts                    # Core TypeScript types
│   ├── checker.ts                  # Universal permission checker
│   └── cache.ts                    # In-memory caching
├── rbac-server/                    # Server-only utilities
│   ├── loader.ts                   # Load permissions from DB
│   ├── api-protect.ts              # API route protection wrapper
│   └── prisma.ts                   # Database operations
├── rbac-client/                    # Client-only utilities
│   ├── provider.tsx                # React context provider
│   └── hooks.ts                    # React hooks (useCan, useRole)
└── auth/
    ├── config.ts                   # NextAuth config
    └── types.ts                    # NextAuth type extensions

components/
└── rbac/                           # Permission-based UI components
    ├── ProtectedRoute.tsx          # Server component route guard
    ├── Can.tsx                     # Client-side permission wrapper
    └── Shield.tsx                  # Visual feedback component

app/
├── api/
│   ├── rbac/permissions/route.ts   # Get current user permissions
│   └── users/route.ts              # Example protected API
└── (dashboard)/
    ├── admin/
    │   ├── users/page.tsx          # Example protected page
    │   └── roles/page.tsx          # Role management UI
    └── layout.tsx                  # With PermissionProvider

prisma/
├── schema.prisma                   # Updated with Role/Permission models
├── migrate-final.ts                # Migration script
└── seed-roles.ts                   # Default roles seeder
```

## Available Permissions

### User Management

- `USER_READ_OWN` - View own profile
- `USER_READ_ANY` - View any user profile
- `USER_UPDATE_OWN` - Edit own profile
- `USER_UPDATE_ANY` - Edit any user
- `USER_DELETE_OWN` - Delete own account
- `USER_DELETE_ANY` - Delete any user
- `USER_CREATE` - Create new users

### Content Management

- `CONTENT_READ_OWN` - View own content
- `CONTENT_READ_ANY` - View any content
- `CONTENT_CREATE` - Create content
- `CONTENT_UPDATE_OWN` - Edit own content
- `CONTENT_UPDATE_ANY` - Edit any content
- `CONTENT_DELETE_OWN` - Delete own content
- `CONTENT_DELETE_ANY` - Delete any content
- `CONTENT_PUBLISH` - Publish content

### Settings

- `SETTINGS_READ` - View settings
- `SETTINGS_UPDATE` - Edit settings

### Analytics

- `ANALYTICS_VIEW` - View analytics
- `ANALYTICS_EXPORT` - Export analytics data

### Admin

- `ADMIN_PANEL_ACCESS` - Access admin panel
- `ADMIN_USERS_MANAGE` - Manage users
- `ADMIN_ROLES_MANAGE` - Manage roles
- `ADMIN_PERMISSIONS_MANAGE` - Manage permissions

## Default Roles

### VIEWER

Read-only access to own data

- Permissions: `USER_READ_OWN`, `CONTENT_READ_OWN`, `SETTINGS_READ`

### USER

Default role for regular users

- Permissions: `USER_READ_OWN`, `USER_UPDATE_OWN`, `USER_DELETE_OWN`, `CONTENT_READ_OWN`, `CONTENT_CREATE`, `CONTENT_UPDATE_OWN`, `CONTENT_DELETE_OWN`, `SETTINGS_READ`

### EDITOR

Can manage content and access analytics

- Permissions: `USER_READ_OWN`, `USER_UPDATE_OWN`, `CONTENT_READ_ANY`, `CONTENT_CREATE`, `CONTENT_UPDATE_ANY`, `CONTENT_DELETE_OWN`, `CONTENT_PUBLISH`, `SETTINGS_READ`, `ANALYTICS_VIEW`

### MODERATOR

Can moderate content and users

- Permissions: `USER_READ_ANY`, `CONTENT_READ_ANY`, `CONTENT_UPDATE_ANY`, `CONTENT_DELETE_ANY`, `ANALYTICS_VIEW`, `SETTINGS_READ`

### ADMIN

Full system access

- Permissions: All permissions

## Usage Examples

### 1. Protected API Route

```typescript
import { protectApiRoute } from "@/lib/rbac-server/api-protect";
import { prisma } from "@/lib/db/prisma";

export const GET = protectApiRoute({
  permissions: ["USER_READ_ANY"],
  handler: async (req, { user, permissions }) => {
    const users = await prisma.user.findMany();
    return NextResponse.json({ users });
  },
});
```

### 2. Protected Page (Server Component)

```typescript
import { ProtectedRoute } from "@/components/rbac/ProtectedRoute";

export default function AdminUsersPage() {
  return (
    <ProtectedRoute permissions={["ADMIN_USERS_MANAGE"]}>
      <AdminUsersContent />
    </ProtectedRoute>
  );
}
```

### 3. Permission-Based UI (Client Component)

```typescript
"use client";

import { useCan } from "@/lib/rbac-client/hooks";

export function UserActions() {
  const canDeleteAny = useCan(["USER_DELETE_ANY"]);
  const canEditAny = useCan(["USER_UPDATE_ANY"]);

  return (
    <div>
      {canEditAny && <button>Edit User</button>}
      {canDeleteAny ? (
        <button>Delete User</button>
      ) : (
        <button disabled>Need Admin Access</button>
      )}
    </div>
  );
}
```

### 4. Conditional Rendering with Can Component

```typescript
import { Can } from "@/components/rbac/Can";

export function PageActions() {
  return (
    <Can permissions={["USER_CREATE"]}>
      <button>Create User</button>
    </Can>
  );
}
```

### 5. Shield Component for Visual Feedback

```typescript
import { Shield } from "@/components/rbac/Shield";

export function DeleteButton() {
  return (
    <Shield
      permissions={["USER_DELETE_ANY"]}
      message="Only administrators can delete users"
      type="tooltip"
    >
      <button>Delete</button>
    </Shield>
  );
}
```

## Setup Instructions

### 1. Database Migration

If you're migrating from an existing system with a `role` enum:

```bash
pnpm tsx prisma/migrate-final.ts
pnpm tsx prisma/add-roleid.ts
pnpm prisma db push
```

For new installations:

```bash
pnpm prisma db push
pnpm tsx prisma/seed-roles.ts
```

### 2. Start Development Server

```bash
pnpm dev
```

### 3. Create Admin User

Create a user with the ADMIN role to manage other users and roles.

## API Endpoints

### GET /api/rbac/permissions

Returns the current user's permissions and role information.

**Response:**

```json
{
  "userId": "user-123",
  "roleId": "role-456",
  "roleName": "ADMIN",
  "permissions": ["USER_READ_ANY", "USER_UPDATE_ANY", ...],
  "loadedAt": 1234567890
}
```

## Database Schema

### Role Model

```prisma
model Role {
  id          String       @id @default(cuid())
  name        String       @unique
  permissions Permission[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  users User[]
}
```

### PermissionCache Model

```prisma
model PermissionCache {
  id          String   @id @default(cuid())
  userId      String   @unique
  permissions Permission[]
  updatedAt   DateTime @updatedAt
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### User Model (Updated)

```prisma
model User {
  // ... existing fields
  roleId            String
  role              Role      @relation(fields: [roleId], references: [id], onDelete: Restrict)
  permissionCache   PermissionCache?
}
```

## Testing Permissions

### Server-Side Testing

```typescript
import { loadUserPermissions } from "@/lib/rbac-server/loader";
import { hasPermission } from "@/lib/rbac/checker";

const permissions = await loadUserPermissions(userId);
if (hasPermission(permissions, ["USER_DELETE_ANY"])) {
  // Allow deletion
}
```

### Client-Side Testing

```typescript
import { useCan } from "@/lib/rbac-client/hooks";

const canDelete = useCan(["USER_DELETE_ANY"]);
if (canDelete) {
  // Show delete button
}
```

## Caching

Permissions are cached in-memory for 5 minutes (configurable). To manually invalidate:

```typescript
import { invalidateUserPermissions, invalidateAllPermissions } from "@/lib/rbac-server/loader";

// Invalidate specific user
invalidateUserPermissions(userId);

// Invalidate all permissions (after role changes)
invalidateAllPermissions();
```

## Troubleshooting

### Permission errors after role changes

If you change a user's role, the permission cache may be stale. Invalidate the cache:

```typescript
invalidateUserPermissions(userId);
```

### Middleware not redirecting

Ensure your middleware imports the updated auth config with RBAC fields.

### Client components not showing permissions

Ensure `PermissionProvider` is added to your layout:

```typescript
import { PermissionProvider } from "@/lib/rbac-client/provider";

export default function Layout({ children }) {
  return (
    <PermissionProvider>
      {children}
    </PermissionProvider>
  );
}
```

## Future Enhancements

- Permission inheritance (roles extending other roles)
- Custom permission sets per user (in addition to roles)
- Permission audit logging
- Time-based permissions (temporary access)
- IP-based restrictions
- Multi-tenancy support
