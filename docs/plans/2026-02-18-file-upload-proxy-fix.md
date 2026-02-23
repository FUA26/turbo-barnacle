# File Upload Proxy Pattern Fix Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix file upload system to use Next.js proxy API instead of direct MinIO URLs, resolving ERR_CONNECTION_TIMED_OUT errors.

**Architecture:** Keep storing `cdnUrl` in database (tech debt) but enforce all front-end file access through `/api/files/[id]/serve` proxy API. Helper functions ensure proxy pattern is always used.

**Tech Stack:** Next.js 16, React 19, TypeScript, MinIO, Prisma, shadcn/ui

---

## Prerequisites

**Read These First:**

- `docs/plans/2026-02-18-file-upload-proxy-fix-design.md` - Full design documentation
- `CLAUDE.md` - Project overview and RBAC system
- `lib/storage/file-validator.ts` - Current file validation logic
- `app/api/files/[id]/serve/route.ts` - Existing proxy API

**Verify Proxy API Works:**

```bash
# Check if proxy API route exists
ls app/api/files/\[id\]/serve/route.ts

# Should exist and handle GET requests with RBAC
```

---

## Task 1: Create Helper Functions for Proxy URL

**Files:**

- Create: `lib/files/file-url.ts`

**Step 1: Create directory structure**

Run: `mkdir -p lib/files`
Expected: Directory created (no error if exists)

**Step 2: Create helper functions file**

Write: `lib/files/file-url.ts`

````typescript
/**
 * File URL Helper Functions
 *
 * Enforces proxy pattern for file access.
 * All front-end file access MUST go through Next.js proxy API,
 * NOT direct MinIO URLs (which cause connection timeouts).
 *
 * TECH DEBT: Database File model stores 'cdnUrl' field with direct
 * MinIO URL, but we don't use it in front-end. This is kept for
 * admin/internal use only. Use getFileServeUrl() instead.
 */

/**
 * Get the proper URL for serving a file through Next.js proxy
 *
 * @param fileId - The file ID from database
 * @returns Proxy API URL (e.g., /api/files/cmlf6p4mo00009l3jo81imqki/serve)
 *
 * @example
 * ```tsx
 * <img src={getFileServeUrl(file.id)} alt="File" />
 * ```
 */
export function getFileServeUrl(fileId: string): string {
  if (!fileId) {
    throw new Error("getFileServeUrl: fileId is required");
  }
  return `/api/files/${fileId}/serve`;
}

/**
 * Transform file object to include proxy URL
 *
 * Use this when you have a file object from database and need to
 * pass it to a React component that displays the file.
 *
 * @param file - File object with at least { id: string }
 * @returns File object with additional 'url' property containing proxy URL
 *
 * @example
 * ```ts
 * const file = await prisma.file.findUnique({ where: { id } });
 * const fileWithUrl = transformFileUrl(file);
 * // Now component can use fileWithUrl.url
 * ```
 */
export function transformFileUrl<T extends { id: string }>(file: T): T & { url: string } {
  if (!file?.id) {
    throw new Error("transformFileUrl: file.id is required");
  }
  return {
    ...file,
    url: getFileServeUrl(file.id),
  };
}

/**
 * Check if a file URL is a proxy URL (not direct MinIO URL)
 *
 * @param url - URL to check
 * @returns true if URL is a proxy API URL
 *
 * @example
 * ```ts
 * if (isProxyUrl(fileUrl)) {
 *   // Good! This is the proxy pattern
 * } else {
 *   // Bad! This might be a direct MinIO URL
 * }
 * ```
 */
export function isProxyUrl(url: string): boolean {
  return url.startsWith("/api/files/") && url.includes("/serve");
}
````

**Step 3: Run TypeScript type check**

Run: `pnpm exec tsc --noEmit --skipLibCheck`
Expected: No type errors (or fix any)

**Step 4: Commit**

```bash
git add lib/files/file-url.ts
git commit -m "$(cat <<'EOF'
feat: add file URL helper functions for proxy pattern

Add getFileServeUrl(), transformFileUrl(), and isProxyUrl()
helper functions to enforce proxy pattern for file access.

TECH_DEBT: Documents that cdnUrl field exists but should not
be used in front-end - use proxy API instead.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Update Profile Server Component

**Files:**

- Modify: `app/(dashboard)/profile/page.tsx`
- Test: Manual (open profile page)

**Step 1: Read current implementation**

Run: `cat app/(dashboard)/profile/page.tsx`
Expected: See current server component that queries user with avatar

**Step 2: Modify to return avatarId and proxy URL**

Replace: `app/(dashboard)/profile/page.tsx:22-53`

Current code transforms `avatar.cdnUrl` to string. Change it:

```typescript
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { ProfileClient } from "./profile-client";
import { getFileServeUrl } from "@/lib/files/file-url";

export default async function ProfilePage() {
  // Check authentication
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch current user's profile
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: {
        select: {
          id: true,
          cdnUrl: true, // Keep for admin/internal use (TECH_DEBT)
        },
      },
      bio: true,
      role: {
        select: {
          id: true,
          name: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Transform avatar: use proxy URL instead of direct MinIO URL
  const transformedUser = {
    ...user,
    // Both avatarId (for form submission) and avatarUrl (for display)
    avatarId: user.avatar?.id ?? null,
    avatarUrl: user.avatar?.id ? getFileServeUrl(user.avatar.id) : null,
  };

  return <ProfileClient user={transformedUser} />;
}
```

**Step 3: Verify TypeScript compiles**

Run: `pnpm exec tsc --noEmit --skipLibCheck`
Expected: No type errors

**Step 4: Manual test - check profile page loads**

Run: `pnpm dev` (in background if not running)
Open: `http://localhost:3000/profile` in browser
Expected: Page loads without errors, avatar shows (if exists) or default icon

**Step 5: Commit**

```bash
git add app/\(dashboard\)/profile/page.tsx
git commit -m "$(cat <<'EOF'
feat(profile): use proxy URL for avatar instead of direct MinIO URL

- Return both avatarId (for form) and avatarUrl (for display)
- Use getFileServeUrl() helper to generate proxy API URL
- Fixes ERR_CONNECTION_TIMED_OUT when accessing avatar

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Update Profile Client Component

**Files:**

- Modify: `app/(dashboard)/profile/profile-client.tsx`
- Test: Manual (update profile with avatar)

**Step 1: Read current implementation**

Run: `cat app/(dashboard)/profile/profile-client.tsx`
Expected: See client component with form and avatar upload

**Step 2: Update type to accept avatarId and avatarUrl**

Find the interface or type definition for user prop. Add fields:

```typescript
interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  bio: string | null;
  role: { id: string; name: string };
  createdAt: Date;
  updatedAt: Date;
  avatarId: string | null; // NEW
  avatarUrl: string | null; // NEW (proxy URL)
}
```

**Step 3: Update avatar display to use avatarUrl**

Find where avatar is displayed (likely `<Avatar>` component). Change src:

```typescript
<Avatar className="h-20 w-20">
  <AvatarImage src={user.avatarUrl || undefined} alt={user.name || "User"} />
  <AvatarFallback>
    <HugeiconsIcon icon={UserIcon} className="h-10 w-10 text-muted-foreground" />
  </AvatarFallback>
</Avatar>
```

**Step 4: Update form state to use avatarId**

Find form state initialization. Change:

```typescript
const [avatarId, setAvatarId] = useState<string | null>(user.avatarId || null);

// Remove or comment out any state for avatarUrl if it exists
// We only track avatarId now, URL is generated on the fly
```

**Step 5: Update avatar upload handler**

Find `onAvatarSelect` callback from avatar upload component. Change:

```typescript
const handleAvatarSelect = (fileId: string, url: string, file: File) => {
  console.log("Avatar selected:", fileId, url);
  setAvatarId(fileId);
  // URL is already the proxy URL from SimpleAvatarUpload component
};

const handleAvatarRemove = () => {
  setAvatarId(null);
};
```

**Step 6: Update form submission**

Find form submit handler. Change payload:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  // ... validation ...

  const payload = {
    name: formData.name,
    bio: formData.bio,
    avatarId: avatarId, // Send avatarId instead of avatar URL
  };

  // ... API call ...
};
```

**Step 7: Verify TypeScript compiles**

Run: `pnpm exec tsc --noEmit --skipLibCheck`
Expected: No type errors

**Step 8: Manual test - update profile**

1. Open `http://localhost:3000/profile`
2. Upload new avatar
3. Submit form
4. Expected: Avatar updates immediately without page reload
5. Refresh page
6. Expected: Avatar persists

**Step 9: Commit**

```bash
git add app/\(dashboard\)/profile/profile-client.tsx
git commit -m "$(cat <<'EOF'
feat(profile): update client to use avatarId and proxy URL

- Add avatarId and avatarUrl (proxy) to user props
- Update form state to track avatarId only
- Use proxy URL for avatar display
- Submit avatarId to API instead of URL

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Update SimpleAvatarUpload Component

**Files:**

- Modify: `components/profile/avatar-upload-simple.tsx`
- Test: Manual (upload avatar)

**Step 1: Read current implementation**

Run: `cat components/profile/avatar-upload-simple.tsx`
Expected: See debug version with console.logs

**Step 2: Remove DEBUG VERSION label**

Edit file header and remove "DEBUG VERSION" text:

```typescript
/**
 * Simple Avatar Upload Component
 *
 * Direct file input for avatar upload with preview.
 * Uses proxy pattern: returns fileId and proxy URL (not direct MinIO URL).
 */
```

**Step 3: Update onAvatarSelect callback type**

Interface already correct. Verify callback signature:

```typescript
interface SimpleAvatarUploadProps {
  currentAvatarUrl?: string | null;
  userName?: string;
  onAvatarSelect: (fileId: string, url: string, file: File) => void;
  onAvatarRemove?: () => void;
  disabled?: boolean;
  className?: string;
}
```

**Step 4: Update upload handler to use proxy URL**

Find `handleUpload` function. Change the `onAvatarSelect` call:

```typescript
const handleUpload = async () => {
  if (!selectedFile || disabled || isUploading) {
    return;
  }

  setIsUploading(true);

  try {
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("category", "AVATAR");

    const response = await fetch("/api/files", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Upload failed");
    }

    // IMPORTANT: Use proxy URL, not result.file.cdnUrl
    const fileId = result.file.id;
    const proxyUrl = `/api/files/${fileId}/serve`;

    // Call parent with fileId and proxy URL
    onAvatarSelect(fileId, proxyUrl, selectedFile);

    // Reset preview
    setPreviewUrl(null);
    setSelectedFile(null);
  } catch (error) {
    console.error("Upload failed:", error);
    // TODO: Show toast notification to user
  } finally {
    setIsUploading(false);
  }
};
```

**Step 5: Remove debug console.logs**

Remove or comment out all console.log statements:

```typescript
// Remove these lines:
console.log("[DEBUG] File selected:", file.name, file.size, "bytes");
console.log("[DEBUG] Preview created:", objectUrl);
console.log("[DEBUG] Starting upload...");
console.log("[DEBUG] Sending request...");
console.log("[DEBUG] Upload response:", result);
console.log("[DEBUG] Upload successful:", result.file);
console.log("[DEBUG] Cannot upload - no file selected");
console.error("[ERROR] Upload failed:", error);
```

**Step 6: Update UI labels**

Remove "DEBUG VERSION" text from UI:

```typescript
<div className="flex flex-col gap-2">
  <p className="text-sm font-medium">Profile Picture</p>
  <p className="text-xs text-muted-foreground">
    Upload a photo to personalize your profile
  </p>
</div>
```

**Step 7: Verify TypeScript compiles**

Run: `pnpm exec tsc --noEmit --skipLibCheck`
Expected: No type errors

**Step 8: Manual test - upload avatar**

1. Open `http://localhost:3000/profile`
2. Click "Choose Photo"
3. Select image file
4. Click "Upload Avatar"
5. Expected: Avatar displays immediately with proxy URL
6. Check browser DevTools Network tab
7. Expected: Image loads from `/api/files/[id]/serve`, not from MinIO URL

**Step 9: Commit**

```bash
git add components/profile/avatar-upload-simple.tsx
git commit -m "$(cat <<'EOF'
fix(avatar): use proxy URL instead of direct MinIO URL

- Remove debug console.logs and labels
- Generate proxy URL from fileId in upload handler
- Pass proxy URL to parent component
- Fixes ERR_CONNECTION_TIMED_OUT when displaying uploaded avatar

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Create Tech Debt Documentation

**Files:**

- Create: `TECH_DEBT.md`

**Step 1: Create TECH_DEBT.md**

Write: `TECH_DEBT.md`

```markdown
# Technical Debt

This document tracks known technical debt items that need future consideration.

## File Upload System

### Issue: Direct MinIO URLs (`cdnUrl`) stored but not used in front-end

**Status**: Documented workaround in place

**Background**:

The `File` model in database stores a `cdnUrl` field containing direct MinIO URLs (e.g., `http://172.16.25.61:9000/naiera-uploads/...`). However, these URLs are not accessible from browsers due to network configuration, causing `ERR_CONNECTION_TIMED_OUT` errors.

**Current Workaround**:

- All front-end file access goes through Next.js proxy API: `/api/files/[id]/serve`
- The proxy API (`app/api/files/[id]/serve/route.ts`) fetches files from MinIO server-side
- Helper functions in `lib/files/file-url.ts` enforce the proxy pattern:
  - `getFileServeUrl(fileId)` - Always returns proxy URL
  - `transformFileUrl(file)` - Adds proxy URL to file objects
  - `isProxyUrl(url)` - Validates proxy URL format
- `cdnUrl` field is kept in database for potential admin/internal use

**Why This Approach**:

1. **Security**: MinIO server not exposed to internet
2. **RBAC**: Proxy API can enforce permission checks
3. **Caching**: Next.js can add caching headers at proxy level
4. **Flexibility**: Can swap storage backend without changing database

**Future Considerations**:

- [ ] **Decision needed**: Should we remove `cdnUrl` from database entirely?
  - Pro: Simpler data model, no confusion
  - Con: Lose ability to quickly reference file location for admin/debugging
- [ ] **MinIO networking**: Make MinIO accessible from browser (if needed)
  - Requires network/firewall configuration
  - Security implications of exposing MinIO endpoint
- [ ] **CDN integration**: Implement CDN (CloudFlare, etc.) for better performance
  - Could cache files at edge locations
  - Would need to update URL generation logic
- [ ] **File cleanup**: Implement automated orphan file cleanup
  - Current: Admin API exists (`POST /api/files/admin/cleanup`)
  - Future: Scheduled job or event-based cleanup

**Related Files**:

- `lib/files/file-url.ts` - Helper functions for proxy pattern
- `app/api/files/[id]/serve/route.ts` - Proxy API implementation
- `lib/db/prisma/schema.prisma` - File model with cdnUrl field
- `docs/plans/2026-02-18-file-upload-proxy-fix-design.md` - Design documentation

**Decision Log**:

| Date       | Decision                                 | Rationale                                                |
| ---------- | ---------------------------------------- | -------------------------------------------------------- |
| 2026-02-18 | Keep cdnUrl field, enforce proxy in code | Minimal changes, maintain admin access to file locations |

---

## Other Debt

_Add new sections here as technical debt is identified._
```

**Step 2: Commit**

```bash
git add TECH_DEBT.md
git commit -m "$(cat <<'EOF'
docs: add TECH_DEBT.md documenting file upload proxy pattern

Documents the cdnUrl field situation and proxy pattern workaround.
Includes future considerations and related files.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Update CLAUDE.md with Best Practices

**Files:**

- Modify: `CLAUDE.md`
- Test: N/A (documentation)

**Step 1: Add File Serving Best Practices section**

Add to `CLAUDE.md` after "File Upload System" section:

```markdown
### File Serving Best Practices

**IMPORTANT**: Always use proxy API for front-end file access

- ✅ **DO**: Use `getFileServeUrl(fileId)` from `@/lib/files/file-url`
- ✅ **DO**: Access files via `/api/files/[id]/serve`
- ❌ **DON'T**: Use direct MinIO URLs (`cdnUrl` field)
- ❌ **DON'T**: Construct file URLs manually

**Example**:

\`\`\`typescript
import { getFileServeUrl } from "@/lib/files/file-url";

// In Server Component
const fileId = user.avatar?.id;
const avatarUrl = fileId ? getFileServeUrl(fileId) : null;

// In Client Component
<img src={avatarUrl} alt="Avatar" />
\`\`\`

**Why**: Direct MinIO URLs cause connection timeouts from browser. Proxy API provides:

- RBAC permission checks
- Server-side file access (no network issues)
- Future flexibility for CDN integration
```

**Step 2: Update File Upload System section**

Add reference to tech debt:

```markdown
## File Upload System

MinIO-based object storage with Next.js proxy:

- Upload API: `POST /api/files` - requires `FILE_UPLOAD_OWN` permission
- File serving: `GET /api/files/[id]/serve` - **USE THIS URL in clients!**
- DO NOT use direct MinIO URLs (`cdnUrl` field) - see TECH_DEBT.md
- File validation: magic bytes checking in `@/lib/storage/file-validator.ts`
- Components: `@/components/file-upload/FileUpload`, `@/components/profile/AvatarUpload`
- Cleanup admin API: `POST /api/files/admin/cleanup` - requires `FILE_MANAGE_ORPHANS` permission

**See Also**: `TECH_DEBT.md` for cdnUrl field documentation
```

**Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "$(cat <<'EOF'
docs: add file serving best practices to CLAUDE.md

Document proxy pattern usage and reference TECH_DEBT.md.
Clarify that cdnUrl should not be used in front-end code.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Final Testing & Verification

**Files:**

- Test all modified components
- Verify no regressions

**Step 1: Start dev server**

Run: `pnpm dev`
Expected: Server starts on http://localhost:3000

**Step 2: Test profile page loads**

1. Open browser to `http://localhost:3000/profile`
2. Expected: Page loads, avatar shows (if exists) or default icon
3. Check browser DevTools Console: No errors
4. Check Network tab: All requests succeed

**Step 3: Test avatar upload (no existing avatar)**

1. On profile page, click "Choose Photo"
2. Select a valid image file (JPG/PNG)
3. See preview
4. Click "Upload Avatar"
5. Expected: Avatar displays immediately
6. Check Network tab: Avatar loads from `/api/files/[id]/serve`
7. Refresh page
8. Expected: Avatar persists

**Step 4: Test avatar upload (replace existing avatar)**

1. With avatar already set, click "Choose Photo"
2. Select different image
3. Upload
4. Expected: New avatar displays immediately
5. Old avatar not displayed (but file still in MinIO - expected behavior)

**Step 5: Test avatar removal**

1. Click "Remove" button (if available)
2. Expected: Avatar removed, default icon shows
3. Refresh page
4. Expected: Default icon persists

**Step 6: Test direct MinIO URL fails (expected)**

1. Get fileId from database (check avatar column in User table)
2. Try to access: `http://172.16.25.61:9000/naiera-uploads/...`
3. Expected: `ERR_CONNECTION_TIMED_OUT` (this is expected)
4. Verify proxy URL works: `http://localhost:3000/api/files/[fileId]/serve`
5. Expected: File loads successfully

**Step 7: Test RBAC permissions**

1. Try uploading without `FILE_UPLOAD_OWN` permission
2. Expected: Upload fails with permission error
3. Try accessing file without permission
4. Expected: Access denied error

**Step 8: Check TypeScript compilation**

Run: `pnpm exec tsc --noEmit`
Expected: No type errors

**Step 9: Run linter**

Run: `pnpm lint`
Expected: No linting errors (or fix any)

**Step 10: Final commit if needed**

```bash
# If any minor fixes needed during testing
git add .
git commit -m "chore: minor fixes from testing"
```

---

## Completion Checklist

After implementing all tasks, verify:

- [ ] `getFileServeUrl()` helper created and used
- [ ] Profile page returns `avatarId` and `avatarUrl` (proxy)
- [ ] Profile client uses proxy URL for display
- [ ] Avatar upload component generates proxy URL
- [ ] No direct MinIO URLs used in front-end code
- [ ] TECH_DEBT.md created with documentation
- [ ] CLAUDE.md updated with best practices
- [ ] All TypeScript checks pass
- [ ] Manual testing complete:
  - [ ] Avatar upload works
  - [ ] Avatar displays correctly
  - [ ] Avatar persists across refreshes
  - [ ] No ERR_CONNECTION_TIMED_OUT errors
- [ ] No debug console.logs remain

---

## Success Criteria

✅ **Done when**:

1. User can upload avatar and see it immediately
2. Avatar persists across page refreshes
3. No `ERR_CONNECTION_TIMED_OUT` errors in browser
4. All file access goes through `/api/files/[id]/serve`
5. Code is clean (no debug logs)
6. Tech debt documented in TECH_DEBT.md

---

## Rollback Plan

If something goes wrong:

```bash
# Revert all changes
git reset --hard HEAD~7  # Go back 7 commits (number of tasks)

# Or selectively revert
git revert <commit-hash>  # Revert specific commit

# System will still work (with timeout issue)
# No database migration needed (no schema changes)
```

---

## Next Steps After Implementation

1. **Monitor**: Check if any other parts of app use file uploads
2. **Extend**: Apply same pattern when adding new file upload features
3. **Optimize**: Consider CDN integration if performance issues
4. **Cleanup**: Run admin cleanup API periodically for orphan files

---

**Implementation Time Estimate**: 2-3 hours (including testing)

**Risk Level**: Low (no database changes, easy rollback)

**Dependencies**: None (all code is self-contained)
