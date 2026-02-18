# Known Issues & Lessons Learned

This document tracks issues we encountered during development and their solutions, serving as a knowledge base for future reference.

---

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

### References

- NextAuth.js Session Callbacks: https://next-auth.js.org/configuration/callbacks#session-callback
- JWT Callbacks: https://next-auth.js.org/configuration/callbacks#jwt-callback
- RBAC Implementation: `CLAUDE.md` - RBAC System section
- Permission Cache: `TECH_DEBT.md` - Technical debt notes

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
