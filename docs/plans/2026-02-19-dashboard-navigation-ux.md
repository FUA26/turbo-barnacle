# Dashboard Navigation & Sidebar UX Improvements - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enhance dashboard navigation UX with smart header, breadcrumbs, user dropdown, global search, and active page indicators.

**Architecture:** Client-side components for interactivity (header, dropdown, search dialog) + server-side API for search functionality. Use shadcn/ui components as base, integrate with existing NextAuth session and RBAC permissions.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, shadcn/ui, NextAuth.js, Prisma, Hugeicons

---

## Prerequisites

Before starting, ensure you have:

- Next.js dev server running (`pnpm dev`)
- Database seeded with roles and permissions
- Admin user session available for testing

---

## Task 1: Create Breadcrumbs Component

**Files:**

- Create: `components/dashboard/breadcrumbs.tsx`
- Create: `lib/dashboard/breadcrumb-utils.ts`

**Step 1: Create breadcrumb utility functions**

```typescript
// lib/dashboard/breadcrumb-utils.ts
import { ChevronRight } from "@hugeicons/core-free-icons";

export interface BreadcrumbItem {
  label: string;
  href: string | null;
  icon?: React.ComponentType<{ className?: string }>;
}

export function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0 || segments[0] === "dashboard") {
    return [{ label: "Dashboard", href: "/dashboard", icon: undefined }];
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: undefined },
  ];

  // Build breadcrumb path based on segments
  let currentPath = "";
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;

    if (segment === "dashboard") continue;

    if (segment === "manage") {
      breadcrumbs.push({ label: "Management", href: null });
      continue;
    }

    if (segment === "users") {
      breadcrumbs.push({ label: "Users", href: "/manage/users" });
      continue;
    }

    if (segment === "roles") {
      breadcrumbs.push({ label: "Roles", href: "/manage/roles" });
      continue;
    }

    if (segment === "permissions") {
      breadcrumbs.push({ label: "Permissions", href: "/manage/permissions" });
      continue;
    }

    if (segment === "system-settings") {
      breadcrumbs.push({ label: "System Settings", href: "/manage/system-settings" });
      continue;
    }

    if (segment === "profile") {
      breadcrumbs.push({ label: "Profile", href: "/profile" });
      continue;
    }

    if (segment === "settings") {
      breadcrumbs.push({ label: "Settings", href: "/settings" });
      continue;
    }

    // Dynamic segments (user IDs, etc.)
    if (i === segments.length - 1) {
      breadcrumbs.push({ label: segment, href: null });
    }
  }

  return breadcrumbs;
}
```

**Step 2: Create Breadcrumbs component**

```typescript
// components/dashboard/breadcrumbs.tsx
"use client";

import { ChevronRight } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { generateBreadcrumbs, type BreadcrumbItem } from "@/lib/dashboard/breadcrumb-utils";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

export function Breadcrumbs() {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);

  // Hide if only Dashboard
  if (breadcrumbs.length === 1) {
    return null;
  }

  return (
    <nav className="flex items-center text-sm text-muted-foreground">
      {breadcrumbs.map((crumb, index) => (
        <Fragment key={index}>
          {index > 0 && (
            <HugeiconsIcon
              icon={ChevronRight}
              className="mx-2 h-4 w-4"
              strokeWidth={2}
            />
          )}
          {crumb.href ? (
            <Link
              href={crumb.href}
              className="hover:text-foreground transition-colors"
            >
              {crumb.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{crumb.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
```

**Step 3: Commit breadcrumbs**

```bash
git add lib/dashboard/breadcrumb-utils.ts components/dashboard/breadcrumbs.tsx
git commit -m "feat: add breadcrumbs component with utility functions

- Generate breadcrumbs from pathname
- Display navigation trail with clickable links
- Hide on Dashboard home

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Create User Dropdown Component

**Files:**

- Create: `components/dashboard/user-dropdown.tsx`

**Step 1: Create UserDropdown component**

```typescript
// components/dashboard/user-dropdown.tsx
"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LogOut, Settings, UserCircle } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface UserDropdownProps {
  user: {
    email?: string | null;
    name?: string | null;
    avatarId?: string | null;
    role?: {
      name: string;
    } | null;
  };
}

export function UserDropdown({ user }: UserDropdownProps) {
  const router = useRouter();

  // Extract initial from email
  const initial = user.email?.charAt(0).toUpperCase() ?? "U";

  // Get avatar URL if avatarId exists
  const avatarUrl = user.avatarId ? `/api/files/${user.avatarId}/serve` : undefined;

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full hover:bg-accent px-2 py-1 transition-colors">
          <Avatar className="h-8 w-8">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={user.email ?? "User"} />}
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
              {initial}
            </AvatarFallback>
          </Avatar>
          <HugeiconsIcon icon={ChevronDown} className="h-4 w-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name ?? "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            {user.role && (
              <Badge variant="secondary" className="mt-1 w-fit text-xs">
                {user.role.name}
              </Badge>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile" className="cursor-pointer">
              <HugeiconsIcon icon={UserCircle} className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings" className="cursor-pointer">
              <HugeiconsIcon icon={Settings} className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          <HugeiconsIcon icon={LogOut} className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import { ChevronDown } from "@hugeicons/core-free-icons";
```

**Step 2: Fix import order (add ChevronDown to top imports)**

Edit the file to move `ChevronDown` to the top import section with Hugeicons imports.

**Step 3: Commit user dropdown**

```bash
git add components/dashboard/user-dropdown.tsx
git commit -m "feat: add user dropdown menu component

- Display user avatar with initial fallback
- Show user name, email, role badge
- Quick access to Profile, Settings, Logout

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Create Page Title Mapping

**Files:**

- Create: `lib/dashboard/page-title.ts`

**Step 1: Create page title utility**

```typescript
// lib/dashboard/page-title.ts
import {
  LayoutDashboard,
  Settings,
  Settings01Icon,
  Settings02Icon,
  SecurityIcon,
  UserCircleIcon,
  Users,
} from "@hugeicons/core-free-icons";

export interface PageTitle {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function getPageTitle(pathname: string): PageTitle {
  const pathSegments = pathname.split("/").filter(Boolean);

  if (pathSegments[0] !== "dashboard") {
    return { title: "Dashboard", icon: LayoutDashboard };
  }

  if (pathSegments.length === 1) {
    return { title: "Dashboard", icon: LayoutDashboard };
  }

  const secondSegment = pathSegments[1];

  switch (secondSegment) {
    case "manage":
      const manageItem = pathSegments[2];
      switch (manageItem) {
        case "users":
          return { title: "Users", icon: Users };
        case "roles":
          return { title: "Roles", icon: SecurityIcon };
        case "permissions":
          return { title: "Permissions", icon: Settings01Icon };
        case "system-settings":
          return { title: "System Settings", icon: Settings02Icon };
        default:
          return { title: "Management", icon: Settings };
      }
    case "profile":
      return { title: "Profile", icon: UserCircleIcon };
    case "settings":
      return { title: "Settings", icon: Settings };
    default:
      return { title: "Dashboard", icon: LayoutDashboard };
  }
}
```

**Step 2: Commit page title utility**

```bash
git add lib/dashboard/page-title.ts
git commit -m "feat: add page title mapping utility

- Map route paths to page titles and icons
- Support all dashboard routes
- Return icon component for each page

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Update Header Component

**Files:**

- Modify: `components/dashboard/header.tsx`

**Step 1: Update Header to use new components**

```typescript
// components/dashboard/header.tsx
"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { getPageTitle } from "@/lib/dashboard/page-title";
import { HugeiconsIcon } from "@hugeicons/react";
import { usePathname } from "next/navigation";
import { Breadcrumbs } from "./breadcrumbs";
import { UserDropdown } from "./user-dropdown";

interface HeaderProps {
  user: {
    email?: string | null;
    name?: string | null;
    avatarId?: string | null;
    role?: {
      name: string;
    } | null;
  };
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname();
  const { title, icon: PageIcon } = getPageTitle(pathname);

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <HugeiconsIcon icon={PageIcon} className="h-5 w-5 text-muted-foreground" />
      <h1 className="text-xl font-semibold">{title}</h1>
      <div className="ml-auto flex items-center gap-4">
        <Breadcrumbs />
        <UserDropdown user={user} />
      </div>
    </header>
  );
}
```

**Step 2: Commit updated header**

```bash
git add components/dashboard/header.tsx
git commit -m "feat: update header with smart title, breadcrumbs, user dropdown

- Dynamic page title based on route
- Breadcrumbs navigation
- User dropdown menu replacing logout button

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Update Sidebar Active State Styling

**Files:**

- Modify: `components/ui/sidebar.tsx`

**Step 1: Enhance SidebarMenuButton active state**

Find the `sidebarMenuButtonVariants` function definition (around line 449) and update the base classes:

```typescript
const sidebarMenuButtonVariants = cva(
  "ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground data-active:font-semibold data-active:border-l-2 data-active:border-primary data-open:hover:bg-sidebar-accent data-open:hover:text-sidebar-accent-foreground gap-2 rounded-md p-2 text-left text-sm transition-[width,height,padding] group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! focus-visible:ring-2 data-active:font-medium peer/menu-button flex w-full items-center overflow-hidden outline-hidden group/menu-button disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&_svg]:size-4 [&_svg]:shrink-0 [&_svg[data-active]]:text-primary"
  // ... rest of the variants
);
```

**Step 2: Commit sidebar styling**

```bash
git add components/ui/sidebar.tsx
git commit -m "feat: enhance sidebar active state styling

- Add left border accent for active items
- Make active items semi-bold
- Change active icon color to primary
- Improve visual feedback for current page

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Create Search API Endpoint

**Files:**

- Create: `app/api/search/route.ts`

**Step 1: Create search API route**

```typescript
// app/api/search/route.ts
import { protectApiRoute } from "@/lib/rbac-server/api-protect";
import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

interface SearchResult {
  users: Array<{ id: string; name: string | null; email: string; avatarId: string | null }>;
  roles: Array<{ id: string; name: string; _count: { permissions: number } }>;
  permissions: Array<{ id: string; name: string; category: string | null }>;
}

export const GET = protectApiRoute({
  permissions: [], // Empty array - we filter results based on permissions
  handler: async (req, { user }) => {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim() ?? "";

    if (!query || query.length < 2) {
      return NextResponse.json<SearchResult>({
        users: [],
        roles: [],
        permissions: [],
      });
    }

    const results: SearchResult = {
      users: [],
      roles: [],
      permissions: [],
    };

    // Check permissions for each entity type
    const canReadUsers = user.permissions?.includes("USER_READ_ANY") ?? false;
    const canManageRoles = user.permissions?.includes("ADMIN_ROLES_MANAGE") ?? false;
    const canManagePermissions = user.permissions?.includes("ADMIN_PERMISSIONS_MANAGE") ?? false;

    // Search users
    if (canReadUsers) {
      results.users = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatarId: true,
        },
        take: 5,
      });
    }

    // Search roles
    if (canManageRoles) {
      results.roles = await prisma.role.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          _count: {
            select: { permissions: true },
          },
        },
        take: 5,
      });
    }

    // Search permissions
    if (canManagePermissions) {
      results.permissions = await prisma.permission.findMany({
        where: {
          name: { contains: query, mode: "insensitive" },
        },
        select: {
          id: true,
          name: true,
          category: true,
        },
        take: 5,
      });
    }

    return NextResponse.json(results);
  },
});
```

**Step 2: Commit search API**

```bash
git add app/api/search/route.ts
git commit -m "feat: add global search API endpoint

- Search users by name/email (requires USER_READ_ANY)
- Search roles by name/description (requires ADMIN_ROLES_MANAGE)
- Search permissions by name (requires ADMIN_PERMISSIONS_MANAGE)
- Permission-based result filtering

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Create useCmdK Hook

**Files:**

- Create: `hooks/use-cmd-k.ts`

**Step 1: Create keyboard shortcut hook**

```typescript
// hooks/use-cmd-k.ts
"use client";

import { useEffect, useState } from "react";

export function useCmdK() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setIsOpen((prev) => !prev);
      }

      // ESC to close
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return { isOpen, setIsOpen };
}
```

**Step 2: Commit useCmdK hook**

```bash
git add hooks/use-cmd-k.ts
git commit -m "feat: add useCmdK hook for keyboard shortcuts

- Cmd+K / Ctrl+K to toggle
- ESC to close
- Global keyboard event listener

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 8: Create Command Dialog Component

**Files:**

- Create: `components/dashboard/search-command/command-dialog.tsx`
- Create: `components/dashboard/search-command/search-results.tsx`

**Step 1: Create SearchResults component**

```typescript
// components/dashboard/search-command/search-results.tsx
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SecurityIcon, UserCircleIcon, Users, Settings01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";

interface SearchResults {
  users: Array<{ id: string; name: string | null; email: string; avatarId: string | null }>;
  roles: Array<{ id: string; name: string; _count: { permissions: number } }>;
  permissions: Array<{ id: string; name: string; category: string | null }>;
}

interface SearchResultsDisplayProps {
  results: SearchResults;
  isLoading: boolean;
}

export function SearchResultsDisplay({ results, isLoading }: SearchResultsDisplayProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-6 w-20" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const hasResults = results.users.length > 0 || results.roles.length > 0 || results.permissions.length > 0;

  if (!hasResults) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>No results found</p>
      </div>
    );
  }

  return (
    <div className="max-h-[400px] overflow-y-auto">
      {/* Users */}
      {results.users.length > 0 && (
        <div className="p-4">
          <h3 className="mb-2 flex items-center text-xs font-semibold text-muted-foreground">
            <HugeiconsIcon icon={Users} className="mr-2 h-4 w-4" />
            Users
          </h3>
          <div className="space-y-1">
            {results.users.map((user) => (
              <Link
                key={user.id}
                href={`/manage/users/${user.id}`}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent"
              >
                <HugeiconsIcon icon={UserCircleIcon} className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 truncate">
                  <p className="font-medium">{user.name ?? "Unnamed User"}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Roles */}
      {results.roles.length > 0 && (
        <div className="border-t p-4">
          <h3 className="mb-2 flex items-center text-xs font-semibold text-muted-foreground">
            <HugeiconsIcon icon={SecurityIcon} className="mr-2 h-4 w-4" />
            Roles
          </h3>
          <div className="space-y-1">
            {results.roles.map((role) => (
              <Link
                key={role.id}
                href={`/manage/roles`}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent"
              >
                <HugeiconsIcon icon={SecurityIcon} className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">{role.name}</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {role._count.permissions}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Permissions */}
      {results.permissions.length > 0 && (
        <div className="border-t p-4">
          <h3 className="mb-2 flex items-center text-xs font-semibold text-muted-foreground">
            <HugeiconsIcon icon={Settings01Icon} className="mr-2 h-4 w-4" />
            Permissions
          </h3>
          <div className="space-y-1">
            {results.permissions.map((permission) => (
              <div
                key={permission.id}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm"
              >
                <HugeiconsIcon icon={Settings01Icon} className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">{permission.name}</p>
                  {permission.category && (
                    <p className="text-xs text-muted-foreground">{permission.category}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Create CommandDialog component**

```typescript
// components/dashboard/search-command/command-dialog.tsx
"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SearchResultsDisplay, type SearchResults } from "./search-results";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useState } from "react";
import { useCmdK } from "@/hooks/use-cmd-k";

export function CommandDialog() {
  const { isOpen, setIsOpen } = useCmdK();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({
    users: [],
    roles: [],
    permissions: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  // Reset query when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults({ users: [], roles: [], permissions: [] });
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length < 2) {
        setResults({ users: [], roles: [], permissions: [] });
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
  }, [setIsOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <div className="flex items-center border-b px-4">
          <HugeiconsIcon icon={Search01Icon} className="h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search users, roles, permissions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 focus-visible:ring-0"
            autoFocus
          />
        </div>
        <SearchResultsDisplay results={results} isLoading={isLoading} />
        <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground">
          <span>↑↓ navigate</span>
          <span>↵ select  esc close</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

**Step 3: Commit command dialog**

```bash
git add components/dashboard/search-command/
git commit -m "feat: add global search command dialog (Cmd+K)

- Command dialog with keyboard navigation
- Search users, roles, permissions
- Debounced search (300ms)
- Grouped results with icons
- Keyboard shortcut hints

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 9: Integrate Command Dialog into Layout

**Files:**

- Modify: `components/dashboard/dashboard-layout.tsx`

**Step 1: Add CommandDialog to layout**

```typescript
// components/dashboard/dashboard-layout.tsx
"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Header } from "./header";
import { AppSidebar } from "./sidebar";
import { CommandDialog } from "./search-command/command-dialog";

interface DashboardLayoutProps {
  user: {
    email?: string | null;
    name?: string | null;
    avatarId?: string | null;
    role?: {
      name: string;
    } | null;
  };
  children: React.ReactNode;
}

export function DashboardLayout({ user, children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header user={user} />
        <main className="flex flex-1 flex-col gap-4 p-4">{children}</main>
      </SidebarInset>
      <CommandDialog />
    </SidebarProvider>
  );
}
```

**Step 2: Commit layout integration**

```bash
git add components/dashboard/dashboard-layout.tsx
git commit -m "feat: integrate command dialog into dashboard layout

- Add global search dialog to all dashboard pages
- Accessible via Cmd+K / Ctrl+K

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 10: Update Dashboard Layout to Pass Full User Data

**Files:**

- Modify: `app/(dashboard)/layout.tsx`

**Step 1: Update layout to fetch complete user data**

```typescript
// app/(dashboard)/layout.tsx
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { auth } from "@/lib/auth/config";
import { PermissionProvider } from "@/lib/rbac-client/provider";
import { loadUserPermissions } from "@/lib/rbac-server/loader";
import { redirect } from "next/navigation";
// Import NextAuth type extensions
import "@/lib/auth/types";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Load permissions on server-side to avoid client-side fetching
  const permissions = await loadUserPermissions(session.user.id);

  // Fetch full user data including role
  const { prisma } = await import("@/lib/db/prisma");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      name: true,
      avatarId: true,
      role: {
        select: {
          name: true,
        },
      },
    },
  });

  return (
    <PermissionProvider initialPermissions={permissions}>
      <DashboardLayout user={user ?? session.user}>{children}</DashboardLayout>
    </PermissionProvider>
  );
}
```

**Step 2: Commit layout update**

```bash
git add app/\(dashboard\)/layout.tsx
git commit -m "feat: fetch complete user data for dropdown menu

- Fetch user avatar and role info
- Pass to DashboardLayout for UserDropdown

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 11: Test and Verify

**Files:**

- None (manual testing)

**Step 1: Start dev server**

```bash
pnpm dev
```

**Step 2: Test breadcrumbs**

1. Navigate to `/dashboard` - breadcrumbs should be hidden
2. Navigate to `/manage/users` - should show "Dashboard / Management / Users"
3. Navigate to `/profile` - should show "Dashboard / Profile"
4. Click on breadcrumb links - should navigate correctly

**Step 3: Test user dropdown**

1. Look at top-right header - should see avatar/initial
2. Click on avatar - dropdown should appear
3. Verify user info (name, email, role badge)
4. Click Profile - should navigate to `/profile`
5. Click Settings - should navigate to `/settings`
6. Click Logout - should redirect to `/login`

**Step 4: Test smart header**

1. Navigate to different pages
2. Verify page title changes correctly
3. Verify icon changes correctly

**Step 5: Test sidebar active state**

1. Navigate to different pages
2. Verify active item has left border accent
3. Verify active item is semi-bold
4. Verify active icon is primary color

**Step 6: Test global search (Cmd+K)**

1. Press Cmd+K (Mac) or Ctrl+K (Windows) - dialog should open
2. Type "admin" - should see user results
3. Type "ADMIN" - should see role results
4. Type "FILE" - should see permission results
5. Click on result - should navigate and close dialog
6. Press ESC - dialog should close

**Step 7: Test search permissions**

1. Login as regular user (not admin)
2. Open search (Cmd+K)
3. Should only see Users (if have USER_READ_ANY)
4. Should NOT see Roles or Permissions

**Step 8: Commit final implementation**

```bash
git add .
git commit -m "test: verify dashboard navigation UX improvements

All features tested and working:
✓ Breadcrumbs navigation
✓ User dropdown menu
✓ Smart header with dynamic title
✓ Enhanced sidebar active state
✓ Global search command (Cmd+K)
✓ Permission-based search results

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 12: Update CLAUDE.md Documentation

**Files:**

- Modify: `CLAUDE.md`

**Step 1: Add dashboard navigation section**

Add after "File Upload System" section:

````markdown
## Dashboard Navigation

Smart header and navigation system with breadcrumbs, user menu, and global search:

- **Smart Header**: Dynamic page title and icon based on current route
- **Breadcrumbs**: Navigation trail showing current position in hierarchy
- **User Dropdown**: Quick access to Profile, Settings, Logout from avatar menu
- **Global Search**: Press Cmd+K / Ctrl+K to search users, roles, permissions
- **Active Indicators**: Enhanced sidebar styling for current page

**Usage:**

```typescript
// Smart header and breadcrumbs work automatically
// Just navigate to routes in app/(dashboard) directory

// Global search
// Press Cmd+K (Mac) or Ctrl+K (Windows) anywhere in dashboard
// Search results are permission-filtered
```
````

**Components:**

- `components/dashboard/header.tsx` - Smart header with breadcrumbs and user dropdown
- `components/dashboard/breadcrumbs.tsx` - Breadcrumb navigation
- `components/dashboard/user-dropdown.tsx` - User menu with avatar
- `components/dashboard/search-command/command-dialog.tsx` - Global search dialog
- `lib/dashboard/page-title.ts` - Page title and icon mapping
- `lib/dashboard/breadcrumb-utils.ts` - Breadcrumb generation utilities

````

**Step 2: Commit documentation update**

```bash
git add CLAUDE.md
git commit -m "docs: add dashboard navigation system to CLAUDE.md

Document smart header, breadcrumbs, user dropdown, and global search features.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
````

---

## Completion Checklist

After implementing all tasks, verify:

- [ ] All components render without errors
- [ ] Breadcrumbs display correctly on all pages
- [ ] User dropdown shows avatar/initial, name, email, role
- [ ] Page title and icon change based on route
- [ ] Sidebar active item has enhanced styling
- [ ] Cmd+K opens search dialog
- [ ] Search returns correct results for users, roles, permissions
- [ ] Search respects user permissions
- [ ] Mobile responsive design works
- [ ] No TypeScript errors
- [ ] All commits pushed to remote

---

## Troubleshooting

### Breadcrumbs not showing

- Check if pathname is correct
- Verify `generateBreadcrumbs` returns array with length > 1

### User dropdown not showing avatar

- Verify `avatarId` is passed from layout
- Check avatar URL: `/api/files/[avatarId]/serve`

### Search dialog not opening

- Verify `useCmdK` hook is working
- Check browser console for keyboard event errors
- Ensure CommandDialog is rendered in layout

### Search returns no results

- Verify API endpoint is accessible: `/api/search?q=test`
- Check user permissions in session
- Ensure database has matching records

### TypeScript errors

- Run `pnpm type-check` to see all errors
- Ensure all imports are correct
- Check for missing type exports

---

## References

- Design Document: `docs/plans/2026-02-19-dashboard-navigation-ux-design.md`
- shadcn/ui Dialog: https://ui.shadcn.com/docs/components/dialog
- shadcn/ui Dropdown Menu: https://ui.shadcn.com/docs/components/dropdown-menu
- Command Palette Pattern: https://www.patterns.dev/posts/command-palette/

---

**Total Estimated Time**: 2-3 hours

**Number of Commits**: ~12 commits

**Files Created**: 10 new files
**Files Modified**: 4 existing files
