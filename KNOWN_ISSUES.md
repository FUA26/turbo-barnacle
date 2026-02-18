# Known Issues & Lessons Learned

This document tracks issues we encountered during development and their solutions, serving as a knowledge base for future reference.

---

## Quick Index / Issue Map

| #   | Title                                                | Severity | Component  | Status   | Keywords                                                            |
| --- | ---------------------------------------------------- | -------- | ---------- | -------- | ------------------------------------------------------------------- |
| 1   | [Permission Not Loading in Session (RBAC)](#issue-1) | High     | Auth, RBAC | ✅ Fixed | `session`, `permissions`, `RBAC`, `cache`, `admin access`           |
| 2   | [Unauthorized Redirect After Logout](#issue-2)       | Medium   | Middleware | ✅ Fixed | `middleware`, `logout`, `redirect`, `roleName`, `session structure` |

**Legend**:

- **Severity**: High (blocks core features), Medium (impacts UX), Low (cosmetic)
- **Status**: ✅ Fixed, 🔄 In Progress, ❌ Unresolved, 📝 Documented Only
- **Keywords**: Use these terms to search for related issues

---

## Detailed Issues

---

<a id="issue-1"></a>

## Issue #1: Permission Not Loading in Session (RBAC)

**Date**: 2026-02-18
**Severity**: High - Users couldn't access admin features
**Symptom**: Users with ADMIN role couldn't access Management, Users, Roles, Permissions, and System Settings menus.

### Root Cause Analysis

#### Problem 1: Permission Cache Not Created

**What**: Permission cache table was empty for existing users.

**Why**:

- Permission cache is created on-demand (lazy loading)
- Seed script only creates roles and permissions, NOT cache entries
- Cache entry only created when `getUserPermissions()` is called

**Evidence**:

```sql
-- Empty cache table
SELECT * FROM "PermissionCache"; -- Returns 0 rows

-- But user has role with permissions
SELECT u.email, r.name, COUNT(rp.permissionId)
FROM "User" u
JOIN "Role" r ON u."roleId" = r.id
JOIN "_RoleToPermission" rp ON r.id = rp."roleId"
WHERE u.email = 'admin@example.com';
-- Returns: admin@example.com | ADMIN | 32
```

**Solution**:
Manually create cache entries for existing users:

```typescript
await prisma.permissionCache.create({
  data: {
    userId: user.id,
    permissions: user.role.permissions.map((rp) => rp.permission.name),
  },
});
```

**Prevention**:

- Add cache creation to user registration flow
- Create cache entries in seed script for existing users
- Consider cache invalidation endpoint

---

#### Problem 2: Permissions Not Included in Session Object

**What**: `session.user.permissions` was undefined, even though role object was loaded.

**Why**:
Auth config only passed role object to session, but didn't extract permissions as flat array:

```typescript
// ❌ WRONG - Only role object, no permissions
async session({ session, token }) {
  if (token.role) {
    session.user.role = token.role; // Nested object, hard to use
  }
  return session;
}
```

**Evidence**:

```typescript
// Session object inspection
console.log(session.user);
// Output:
{
  id: "cmlf6p4mo00009l3jo81imqki",
  email: "admin@example.com",
  role: {
    id: "admin_role_default_001",
    name: "ADMIN",
    permissions: [...] // Nested, hard to access
  }
  // ❌ Missing: permissions: string[]
}
```

**Solution**:
Extract permissions in JWT callback and pass to session:

```typescript
// ✅ CORRECT - Extract permissions as flat array
async jwt({ token, user }) {
  if (user) {
    token.id = user.id;
    token.roleId = user.roleId;
    token.role = user.role;
    // Extract permissions as flat array for easier access
    if (user.role) {
      token.permissions = user.role.permissions.map(rp => rp.permission.name);
    }
  }
  return token;
}

async session({ session, token }) {
  if (token.id) {
    session.user.id = token.id as string;
    session.user.roleId = token.roleId as string;
  }
  if (token.role) {
    session.user.role = token.role;
  }
  if (token.permissions) {
    session.user.permissions = token.permissions as string[];
  }
  return session;
}
```

**Type Definition**:

```typescript
// types/next-auth.d.ts
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roleId: string;
      permissions?: string[]; // ✅ Flat array for easy access
    } & DefaultSession["user"];
  }
}
```

---

### Impact & Symptoms

#### User Impact:

1. **Authorization checks failed** - Components using `Can` component couldn't verify permissions
2. **Menu items hidden** - Admin menus were hidden due to missing permissions
3. **API calls rejected** - Server-side `protectApiRoute` rejected valid requests

#### Error Messages:

```
Frontend: Menu items not rendering (Can component returns false)
Backend: 403 Forbidden "You don't have permission"
Console: session.user.permissions is undefined
```

---

### Resolution Steps

#### For Users Already Logged In:

1. **Logout** from application
2. **Clear browser cache** (Ctrl+Shift+R)
3. **Login** again with admin account
4. Verify permissions loaded in DevTools:
   ```javascript
   // In browser console
   // After login, check session
   fetch("/api/auth/session")
     .then((r) => r.json())
     .then((d) => console.log(d));
   // Should see: user.permissions: ["ADMIN_PANEL_ACCESS", ...]
   ```

#### For Development:

1. Create permission cache manually:

   ```bash
   pnpm tsx -e "
   import { prisma } from './lib/db/prisma';
   const admin = await prisma.user.findUnique({
     where: { email: 'admin@example.com' },
     include: { role: { include: { permissions: { include: { permission: true } } } } }
   });
   await prisma.permissionCache.create({
     data: {
       userId: admin.id,
       permissions: admin.role.permissions.map(rp => rp.permission.name)
     }
   });
   "
   ```

2. Update auth config to include permissions in session (see Solution above)

3. Restart dev server and logout/login

---

### Prevention Strategies

#### 1. Seed Script Enhancement

Add permission cache creation to seed script:

```typescript
// prisma/seed-roles.ts
async function seedPermissionCaches() {
  const users = await prisma.user.findMany({
    include: { role: { include: { permissions: { include: { permission: true } } } } },
  });

  for (const user of users) {
    if (user.role) {
      await prisma.permissionCache.upsert({
        where: { userId: user.id },
        update: {
          permissions: user.role.permissions.map((rp) => rp.permission.name),
        },
        create: {
          userId: user.id,
          permissions: user.role.permissions.map((rp) => rp.permission.name),
        },
      });
    }
  }
}
```

#### 2. Auto-Create Cache on Login

Modify auth config to create/update cache on login:

```typescript
async authorize(credentials) {
  const user = await prisma.user.findUnique({ ... });

  // Update permission cache on login
  if (user?.role) {
    await prisma.permissionCache.upsert({
      where: { userId: user.id },
      update: {
        permissions: user.role.permissions.map(rp => rp.permission.name)
      },
      create: {
        userId: user.id,
        permissions: user.role.permissions.map(rp => rp.permission.name)
      }
    });
  }

  return user;
}
```

#### 3. Permission Invalidation Endpoint

Create API endpoint to manually invalidate cache:

```typescript
// POST /api/users/invalidate-permissions
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await invalidateUserPermissions(session.user.id);

  return NextResponse.json({ success: true });
}
```

---

### Related Files

**Auth Configuration**:

- `lib/auth/config.ts` - JWT and session callbacks
- `types/next-auth.d.ts` - Type definitions

**RBAC System**:

- `lib/rbac-server/api-protect.ts` - Server-side authorization
- `lib/rbac-client/provider.tsx` - Client-side permission context
- `lib/rbac-client/hooks.ts` - useCan, usePermissions hooks

**Database**:

- `prisma/schema.prisma` - PermissionCache model
- `prisma/seed-permissions.ts` - Permission seeds
- `prisma/seed-roles.ts` - Role seeds

---

### Key Takeaways

1. **Session Data Design**: Always consider what data your app needs in session and structure it accordingly
2. **Lazy Loading**: Be careful with on-demand cache creation - consider seeding in development
3. **Type Safety**: TypeScript types should match runtime data structures exactly
4. **Testing**: Always test authorization with both fresh login and existing sessions
5. **Migration**: When adding new session fields, existing users must logout/login

---

[↑ Back to Index](#quick-index--issue-map)

### References

- NextAuth.js Session Callbacks: https://next-auth.js.org/configuration/callbacks#session-callback
- RBAC Implementation: `CLAUDE.md` - RBAC System section
- Permission Cache: `TECH_DEBT.md` - Technical debt notes

---

[↑ Back to Index](#quick-index--issue-map)

- JWT Callbacks: https://next-auth.js.org/configuration/callbacks#jwt-callback
- RBAC Implementation: `CLAUDE.md` - RBAC System section
- Permission Cache: `TECH_DEBT.md` - Technical debt notes

---

<a id="issue-2"></a>

## Issue #2: Unauthorized Redirect After Logout (Middleware)

**Date**: 2026-02-18
**Severity**: Medium - Broken user flow
**Symptom**: After clicking logout, user is redirected to `/unauthorized` page instead of staying on `/login` or being redirected appropriately.

### Root Cause Analysis

#### Problem: Middleware Using Deprecated Session Structure

**What**: Middleware was checking for `req.auth?.user?.roleName` which no longer exists after auth config refactor.

**Why**:

After refactoring auth config to include permissions, session structure changed from:

```typescript
// Old structure
{
  user: {
    id: string,
    email: string,
    roleName: string, // ❌ Removed
  }
}
```

To new structure:

```typescript
// New structure
{
  user: {
    id: string,
    email: string,
    roleId: string,
    role: {
      id: string,
      name: string, // ✅ Now nested
      permissions: [...]
    },
    permissions: string[]
  }
}
```

Middleware code was not updated to reflect this change.

**Evidence**:

```typescript
// middleware.ts (line 34) - OLD CODE
const userRole = req.auth?.user?.roleName; // ❌ Undefined after auth refactor

// This caused:
// 1. userRole = undefined
// 2. Check (userRole !== "ADMIN") = true
// 3. Redirect to /unauthorized
```

**Solution**:
Update middleware to use new session structure and add null checks:

```typescript
// ✅ CORRECT
const userRole = req.auth?.user?.role?.name;

if (!userRole || userRole !== "ADMIN") {
  return NextResponse.redirect(new URL("/unauthorized", req.url));
}

// Also add /unauthorized to isOnAuthPage to prevent redirect loop
const isOnAuthPage =
  pathname.startsWith("/login") ||
  pathname.startsWith("/register") ||
  pathname.startsWith("/unauthorized"); // ✅ Add this
```

**Prevention**:

- Always update middleware when changing session structure
- Add comprehensive TypeScript types for session
- Test auth flows (login, logout, protected routes) after auth changes

---

### Impact & Symptoms

#### User Impact:

1. **Confusing logout flow** - User clicks logout, expects to see login page but sees "Unauthorized" instead
2. **Redirect loop** - In some cases, user gets stuck in redirect loop between pages
3. **Loss of trust** - Makes the application feel broken

#### Error Messages:

```
No visible error in console (redirect happens at middleware level)
User sees: /unauthorized page with message "You don't have permission to access this page"
Expected: Stay on /login page after logout
```

---

### Resolution Steps

1. **Update middleware** (already done):
   - Change `req.auth?.user?.roleName` to `req.auth?.user?.role?.name`
   - Add `/unauthorized` to `isOnAuthPage` check
   - Add null check: `if (!userRole || userRole !== "ADMIN")`

2. **Clear browser cache**:
   - Open DevTools → Application → Clear Storage
   - Or hard refresh: Ctrl+Shift+R

3. **Test logout flow**:
   - Login as admin
   - Click logout
   - Should redirect to `/login` (not `/unauthorized`)

---

### Prevention Strategies

#### 1. Type-Safe Middleware Helper

Create helper function to safely extract role:

```typescript
function getUserRole(session: Session | null): string | null {
  return session?.user?.role?.name || null;
}

// Usage
const userRole = getUserRole(req.auth);
if (userRole !== "ADMIN") {
  return NextResponse.redirect(new URL("/unauthorized", req.url));
}
```

#### 2. Comprehensive Auth Testing

Test checklist for auth changes:

- [ ] Login flow works
- [ ] Logout redirects correctly
- [ ] Protected routes redirect to login (when not authenticated)
- [ ] Protected routes accessible (when authenticated with correct role)
- [ ] Role-based routes work (e.g., /manage requires ADMIN)
- [ ] Session refresh doesn't break auth
- [ ] Browser back button doesn't create auth loops

#### 3. Session Structure Documentation

Keep documentation in sync with actual session structure:

```typescript
// docs/auth-session-structure.md
/**
 * Session Object Structure
 *
 * @example
 * {
 *   user: {
 *     id: string,
 *     email: string,
 *     name: string | null,
 *     roleId: string,
 *     role: {
 *       id: string,
 *       name: string,
 *       permissions: [{ permission: { name: string } }]
 *     },
 *     permissions: string[] // Flat array for convenience
 *   }
 * }
 */
```

---

### Related Files

**Middleware**:

- `middleware.ts` - Route protection logic

**Auth Config**:

- `lib/auth/config.ts` - Session structure definition
- `types/next-auth.d.ts` - TypeScript types

**Testing**:

- Test with: Login → Dashboard → Logout → Verify on /login (not /unauthorized)

---

### Key Takeaways

1. **Middleware depends on session structure** - Any change to auth/session requires middleware update
2. **Nested object access needs null checks** - Always check for intermediate properties: `req.auth?.user?.role?.name`
3. **Test logout flow** - Logout is often overlooked in testing but critical for UX
4. **Redirect loops are tricky** - Always check if destination page has its own redirects
5. **Keep types in sync** - TypeScript types must match runtime session structure exactly

---

[↑ Back to Index](#quick-index--issue-map)

---

## Template for Future Issues

```markdown
## Issue #[NUMBER]: [Title]

**Date**: YYYY-MM-DD
**Severity**: High/Medium/Low
**Symptom**: [What user experiences]

### Root Cause Analysis

#### Problem:

[Description]

#### Why:

[Explanation]

#### Evidence:

[Code/logs/error messages]

### Solution:

[Fix description]

### Impact & Symptoms

- [User impact]
- [Error messages]

### Resolution Steps

1. [Step 1]
2. [Step 2]

### Prevention Strategies

- [Strategy 1]
- [Strategy 2]

### Related Files

- [File list]

### Key Takeaways

1. [Lesson 1]
2. [Lesson 2]
```
