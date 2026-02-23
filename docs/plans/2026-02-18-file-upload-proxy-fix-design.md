# Design: File Upload Proxy Pattern Fix

**Date**: 2026-02-18
**Status**: Approved
**Author**: Claude Code + User

## Problem Statement

File upload system uploads files successfully to MinIO, but when accessing the files, direct MinIO URLs (`http://172.16.25.61:9000/...`) result in `ERR_CONNECTION_TIMED_OUT` errors. This is because MinIO server is not accessible from browser/client side.

## Root Cause

The system stores `cdnUrl` (direct MinIO URL) in the database and front-end components attempt to use this URL directly. However, the MinIO endpoint is not reachable from browsers, causing connection timeouts.

## Solution Overview

**Use Proxy Pattern**: Keep storing `cdnUrl` in database (tech debt) but enforce all front-end file access through Next.js proxy API `/api/files/[id]/serve`.

## Architecture

### Current Flow (Broken)

```
Upload → MinIO → Save cdnUrl to DB → Front-end uses cdnUrl → ❌ TIMEOUT
```

### Fixed Flow

```
Upload → MinIO → Save cdnUrl to DB (internal/admin only)
Front-end uses: /api/files/[id]/serve → Next.js proxy → MinIO → ✅ SUCCESS
```

## Key Principles

1. **cdnUrl stays in database** - Kept for admin/internal use, documented as tech debt
2. **Proxy enforcement** - All front-end access goes through `/api/files/[id]/serve`
3. **Helper functions** - `getFileServeUrl()` enforces proxy pattern
4. **No database changes** - Schema remains the same
5. **RBAC preserved** - Proxy API respects existing permission system

## Implementation Details

### 1. Helper Functions (`lib/files/file-url.ts`)

```typescript
/**
 * Get the proper URL for serving a file
 * Always uses proxy API, not direct MinIO URL
 */
export function getFileServeUrl(fileId: string): string {
  return `/api/files/${fileId}/serve`;
}

/**
 * Transform file object to use proxy URL
 */
export function transformFileUrl<T extends { id: string }>(file: T): T & { url: string } {
  return {
    ...file,
    url: getFileServeUrl(file.id),
  };
}
```

### 2. Profile Page Changes

**Server Component** (`app/(dashboard)/profile/page.tsx`):

- Query database for `fileId` from avatar relation
- Transform to proxy URL using `getFileServeUrl()`
- Pass both `avatarId` and `avatarUrl` to client component

**Client Component** (`profile-client.tsx`):

- Receive `avatarId` and `avatarUrl` (proxy URL)
- Update form state to use `avatarId`
- On form submit, send `avatarId` to update API

### 3. Avatar Upload Component

Update component to:

- Receive `fileId` from upload API response
- Call `onAvatarSelect(fileId, getFileServeUrl(fileId), file)`
- Parent component receives proxy URL, not direct MinIO URL

### 4. API Changes

**No changes needed** - Existing APIs already work:

- ✅ `POST /api/files` - Upload (returns fileId and cdnUrl)
- ✅ `GET /api/files/[id]/serve` - Proxy serve (already implemented)

## Error Handling

### Upload Failures

- File size limit (enforced in API)
- Invalid file type (magic bytes validation)
- Network errors (show toast message)
- Permission denied (RBAC check)

### Display Failures

- File not found → Show default avatar
- Permission denied → Show error + default avatar
- Network timeout → Show error message
- Corrupted file → Show error + default avatar

### User Experience

- Disable upload button during upload
- Show error toast on failure
- Revert to previous avatar on failure
- Keep old avatar until new upload succeeds

## Testing Strategy

### Unit Tests

- `getFileServeUrl()` returns correct proxy URL
- `transformFileUrl()` adds url property correctly

### Integration Tests

- Upload file → get fileId → verify proxy URL works
- Access `/api/files/[id]/serve` → verify returns file
- RBAC: user without permission cannot access file

### Manual Testing Checklist

- [ ] Upload new avatar → displays immediately
- [ ] Refresh page → avatar persists
- [ ] Access direct MinIO URL → times out (expected)
- [ ] Orphan file access → shows default avatar
- [ ] Large file upload → shows error
- [ ] Invalid file type → shows error
- [ ] No permission → shows error

## Implementation Phases

### Phase 1: Helper & Infrastructure (High Priority)

1. Create `lib/files/file-url.ts` with helper functions
2. Add tech debt documentation
3. Verify `/api/files/[id]/serve` API works

### Phase 2: Profile Page Fix (High Priority)

1. Update `profile/page.tsx` to return avatarId
2. Update `profile-client.tsx` to use proxy URL
3. Update form submission to use avatarId

### Phase 3: Avatar Upload Component (High Priority)

1. Update avatar upload component to return fileId
2. Update component to use proxy URL
3. Test upload flow end-to-end

### Phase 4: Cleanup & Documentation (Medium Priority)

1. Remove debug console.logs
2. Add comments explaining proxy pattern
3. Update CLAUDE.md with best practices
4. Create TECH_DEBT.md

## Tech Debt Documentation

Create `TECH_DEBT.md`:

```markdown
# Technical Debt

## File Upload System

### Issue: Direct MinIO URLs (`cdnUrl`) stored but not used in front-end

**Background**:

- Database stores `cdnUrl` field with direct MinIO URL
- Direct URLs not accessible from browser (connection timeout)
- Front-end uses proxy API `/api/files/[id]/serve` instead

**Current Workaround**:

- All file access from front-end goes through Next.js proxy
- `cdnUrl` kept for admin/internal use only
- Helper function `getFileServeUrl()` enforces proxy pattern

**Future Considerations**:

- [ ] Decide: Remove `cdnUrl` from DB entirely? Keep for admin?
- [ ] Setup MinIO to be accessible from browser (if needed)
- [ ] Implement CDN (CloudFlare, etc.) for better performance
- [ ] File expiration/cleanup policy

**Related Files**:

- `lib/files/file-url.ts` - Helper functions
- `app/api/files/[id]/serve/route.ts` - Proxy API
```

## Rollback Plan

If something goes wrong:

1. Revert profile page changes (`git checkout`)
2. Revert avatar upload component changes
3. System still works (with timeout issue)
4. No database migration needed (no schema changes)

## Scalability Considerations

This solution is designed to scale when additional file upload features are added:

- Helper functions work for any file type (avatar, attachments, etc.)
- Proxy API already handles any file by ID
- RBAC permissions already in place
- Pattern can be reused for future file features

## Success Criteria

- [ ] Avatar uploads successfully and displays immediately
- [ ] Avatar persists across page refreshes
- [ ] No more `ERR_CONNECTION_TIMED_OUT` errors
- [ ] Tech debt documented
- [ ] Code is clean (no debug logs)
- [ ] Future developers understand the proxy pattern
