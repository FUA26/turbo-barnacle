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
```

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

## Development Environment

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

This project uses lefthook for Git hooks:

- Pre-commit: prettier + eslint (must pass to commit)
- Pre-push: TypeScript type-check (must pass to push)
- Type safety: Use `unknown` instead of `any`, with type guards like `error instanceof Error`
- Unused variables: prefix with `_` (e.g., `_req`) or remove
- Bypass hooks (not recommended): `git commit --no-verify` or `git push --no-verify`

## Environment Configuration

Required environment variables (see `.env.example`):

- Database: `DATABASE_URL`, `DIRECT_URL`
- MinIO: `MINIO_ENDPOINT`, `MINIO_PORT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET`
- NextAuth: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- App: `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_APP_NAME`
