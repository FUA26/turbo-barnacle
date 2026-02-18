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
