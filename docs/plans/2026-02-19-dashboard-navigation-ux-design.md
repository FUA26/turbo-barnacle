# Dashboard Navigation & Sidebar UX Improvements - Design Document

**Date**: 2026-02-19
**Status**: Approved
**Author**: Claude Code

## Overview

Improve dashboard navigation and sidebar user experience with dynamic context, quick access features, and better visual feedback.

## Goals

- Improve navigation clarity with dynamic page context
- Provide quick access to frequently used features
- Enhance visual feedback for active navigation state
- Reduce clicks for common tasks

## Scope

1. **Smart Header** - Dynamic page title based on active route
2. **Breadcrumbs** - Navigation trail with clickable links
3. **User Dropdown Menu** - Profile, Settings, Logout with user avatar
4. **Global Search Command (Cmd+K)** - Search Users, Roles, Permissions
5. **Enhanced Active Indicator** - Better visual feedback in sidebar

## Features

### 1. Smart Header

**Current State**: Static "Dashboard" title regardless of active page.

**Proposed**: Dynamic title based on active route.

**Page Title Mapping**:

- `/dashboard` → "Dashboard"
- `/manage/users` → "Users"
- `/manage/users/[id]` → "User Details"
- `/manage/roles` → "Roles"
- `/manage/permissions` → "Permissions"
- `/manage/system-settings` → "System Settings"
- `/profile` → "Profile"
- `/settings` → "Settings"

**Implementation**:

- Server component passes `pageTitle` prop to layout
- Or client-side pathname detection with `usePathname()`
- Icon for each page type

**Visual**:

```
┌────────────────────────────────────────────────────────┐
│ [≡] 👤 Users  🏠 Dashboard / Management / Users    📧👤 admin@example.com  │
└────────────────────────────────────────────────────────┘
```

---

### 2. Breadcrumbs Navigation

**Current State**: No breadcrumbs, users don't know their position in hierarchy.

**Proposed**: Breadcrumb trail showing navigation path.

**Structure**:

```
Dashboard / Management / Users
Dashboard / Profile
Dashboard / Settings
```

**Implementation**:

- Function `generateBreadcrumbs(pathname)` returns array:
  ```typescript
  [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Management", href: null }, // Group, not clickable
    { label: "Users", href: "/manage/users" },
  ];
  ```
- Component `Breadcrumbs` with `/` separator
- Hide if depth = 1 (on Dashboard home)

**Special Cases**:

- Management items: `Dashboard > Management > [Item]`
- Account items: `Dashboard > [Item]` (no "Account" group)
- Detail pages: `Dashboard > Management > Users > John Doe`

---

### 3. User Dropdown Menu

**Current State**: Only logout button with icon. No quick access to profile/settings.

**Proposed**: User avatar/initial with dropdown menu.

**Menu Items**:

- User info (name, email, role badge)
- Separator
- Profile (link to /profile)
- Settings (link to /settings)
- Separator
- Logout

**Visual**:

```
┌────────────────────────────────────┐
│ 👤 AC                    ▼         │  <- Avatar + initial
└────────────────────────────────────┘
         ↓ on click
┌────────────────────────────────────┐
│ 👤 Admin                           │
│ admin@example.com                  │
│ [ADMIN] badge                      │
│ ─────────────────────────────────  │
│  👤 Profile                        │
│  ⚙️ Settings                       │
│ ─────────────────────────────────  │
│  🚪 Logout                        │
└────────────────────────────────────┘
```

**Implementation**:

- Use `DropdownMenu` from shadcn/ui
- User avatar: Display image if `avatarId` exists, otherwise show initial
- Initial: Extract from email (admin@example.com → "A")
- Role badge: Small badge with role name and color coding (ADMIN = red, USER = blue)

---

### 4. Global Search Command (Cmd+K)

**Current State**: No search functionality. Users must navigate to pages to find items.

**Proposed**: Global search dialog triggered with Cmd+K (Mac) or Ctrl+K (Windows).

**Search Entities**:

- Users (by name, email)
- Roles (by name, description)
- Permissions (by name)

**Visual Dialog**:

```
┌──────────────────────────────────────┐
│ 🔍 Search users, roles, permissions  │
│ ──────────────────────────────────── │
│                                      │
│ Users                                │
│  👤 Admin            admin@exa...   │
│  👤 John Doe         john@exa...    │
│                                      │
│ Roles                                │
│  🔐 ADMIN            32 permissions  │
│  👥 USER             4 permissions   │
│                                      │
│ Permissions                           │
│  ⚙️ ADMIN_USERS_MANAGE              │
│  ⚙️ FILE_UPLOAD_OWN                 │
│                                      │
│ ↓↑ navigate  ↵ select  esc close    │
└──────────────────────────────────────┘
```

**Implementation**:

- `CommandDialog` from shadcn/ui (or custom with Dialog)
- `useCmdK()` hook for keyboard shortcut
- Search API with debounced input (300ms)
- Display max 5 results per entity
- Keyboard navigation (arrow keys + enter)
- Click result to navigate

**Keyboard Shortcuts**:

- `Cmd/Ctrl + K` → Open search
- `ESC` → Close
- `↑↓` → Navigate results
- `Enter` → Select result

---

### 5. Enhanced Active Page Indicator

**Current State**: Sidebar has `isActive={pathname === item.href}` but visual feedback is subtle.

**Proposed Enhancements**:

**A. Sidebar Active State** (improve existing):

- More prominent background color
- Left border accent (2px solid primary color)
- Icon color changes to primary
- Font weight: semi-bold

**B. Header Active Indicator** (optional):

- Small indicator in header showing current section
- Icon + label next to breadcrumbs

**Visual Sidebar**:

_Before_:

```
┌─────────────────────┐
│ Overview            │
│   Dashboard         │
│ Management          │
│   Users          ←  │  (subtle highlight)
│   Roles             │
│   Permissions       │
└─────────────────────┘
```

_After_:

```
┌─────────────────────┐
│ Overview            │
│   Dashboard         │
│ Management          │
│   ▌Users         ← │  (bold + left border + bg)
│   Roles             │
│   Permissions       │
└─────────────────────┘
```

**Implementation**:

- Update `SidebarMenuButton` styling in `components/ui/sidebar.tsx`
- Add accent border with `data-active` state
- Add left border: `border-l-2 border-primary`

---

## Architecture

### Component Structure

```
components/dashboard/
├── dashboard-layout.tsx (existing - modify)
├── header.tsx (existing - modify)
├── sidebar.tsx (existing - modify)
├── breadcrumbs.tsx (NEW)
├── user-dropdown.tsx (NEW)
└── search-command/
    ├── command-dialog.tsx (NEW)
    ├── search-results.tsx (NEW)
    └── use-cmd-k.tsx (NEW)
```

### Data Flow

**1. Smart Header & Breadcrumbs**:

```
Server Component → pass pageTitle/breadcrumbs → Client Header
```

**2. User Dropdown**:

```
session.user → Header → UserDropdown → fetch additional data if needed
```

**3. Search Command**:

```
Cmd+K trigger → open Dialog → type query → debounced API call → display results → navigate on selection
```

### New API Endpoints

**GET /api/search?q={query}**

Search across all entities with permissions check.

**Response**:

```typescript
{
  users: Array<{
    id: string;
    name: string;
    email: string;
    avatarId?: string;
  }>,
  roles: Array<{
    id: string;
    name: string;
    permissionsCount: number;
  }>,
  permissions: Array<{
    id: string;
    name: string;
    category: string;
  }>
}
```

**Permissions**:

- Users search: `USER_READ_ANY`
- Roles search: `ADMIN_ROLES_MANAGE`
- Permissions search: `ADMIN_PERMISSIONS_MANAGE`

Filter results based on user permissions.

---

## Implementation Details

### Technology Stack

- **Components**: shadcn/ui (Dialog, DropdownMenu, Command, existing Sidebar)
- **Framework**: Next.js 16 App Router
- **Auth**: NextAuth.js session
- **Database**: Prisma ORM
- **Icons**: Hugeicons
- **Styling**: Tailwind CSS v4

### Implementation Approach

1. **Client-side components** for interactivity (dropdown, dialog)
2. **Server-side data fetching** for search (performance)
3. **React hooks** for keyboard shortcuts
4. **shadcn/ui components** as base

### Key Dependencies

```json
{
  "dependencies": {
    "@hugeicons/react": "*",
    "@radix-ui/react-dialog": "*",
    "@radix-ui/react-dropdown-menu": "*"
  }
}
```

All required dependencies should already be installed.

---

## Error Handling

### Search Command

- **Empty query**: Show recent items or empty state
- **No results**: Display "No results found" message
- **API error**: Show error message with retry option
- **Network timeout**: Show loading state, then error message

### User Dropdown

- **Avatar load error**: Fallback to initial
- **Session error**: Redirect to login

### Breadcrumbs

- **Invalid path**: Gracefully degrade, show last valid segment
- **Missing page data**: Show raw path segment

---

## Testing Checklist

### Visual Testing

- [ ] Header title changes correctly on each page
- [ ] Breadcrumbs display correctly on all pages
- [ ] Breadcrumb links navigate correctly
- [ ] User dropdown opens/closes smoothly
- [ ] User avatar displays correctly (or initial fallback)
- [ ] Role badge shows correct color
- [ ] Search dialog opens with Cmd+K
- [ ] Search dialog closes with ESC
- [ ] Active page indicator shows in sidebar
- [ ] Active page has correct styling (bold, border, bg)

### Functional Testing

- [ ] Can navigate via breadcrumbs
- [ ] Can access profile from user dropdown
- [ ] Can access settings from user dropdown
- [ ] Can logout from user dropdown
- [ ] Search returns correct users
- [ ] Search returns correct roles
- [ ] Search returns correct permissions
- [ ] Search results are keyboard navigable
- [ ] Clicking search result navigates correctly
- [ ] Search respects permissions (admin vs regular user)

### Responsive Testing

- [ ] Header works on mobile
- [ ] Breadcrumbs truncate correctly on small screens
- [ ] User dropdown works on mobile
- [ ] Search dialog works on mobile
- [ ] Sidebar collapse/expand works smoothly

### Accessibility Testing

- [ ] All interactive elements are keyboard accessible
- [ ] Cmd+K shortcut works on Mac
- [ ] Ctrl+K shortcut works on Windows
- [ ] Focus management is correct
- [ ] ARIA labels are present
- [ ] Screen reader announces navigation changes

---

## Performance Considerations

### Search Optimization

- Debounce input to 300ms
- Limit results to 5 per entity
- Use database indexes on searchable fields
- Cache recent search queries

### Lazy Loading

- Load search dialog code on demand (only when Cmd+K pressed)
- Lazy load user dropdown content

### Bundle Size

- Use dynamic imports for search command dialog
- Ensure shadcn/ui components are tree-shakeable

---

## Future Enhancements

Out of scope for this implementation but worth considering:

1. **Recent items** in search dialog (quick access to recently viewed)
2. **Advanced search filters** (by role, by date range)
3. **Search history** (previous search queries)
4. **Quick actions in search** (create user, create role directly from search)
5. **Mobile bottom navigation bar** (tab bar for mobile)
6. **Notification center** in header
7. **Favorites/bookmarked pages**
8. **Collapsible sidebar sections**

---

## Migration Notes

### Breaking Changes

None. This is purely additive - existing functionality remains intact.

### Backward Compatibility

- Existing sidebar navigation continues to work
- Existing header elements preserved
- No changes to routes or pages

### Rollback Plan

If issues arise:

1. Revert `header.tsx` to original
2. Remove new components
3. Remove search API route
4. No database changes required (easy rollback)

---

## Success Criteria

Implementation is successful when:

1. ✅ User can identify current page at a glance (smart header + breadcrumbs)
2. ✅ User can quickly access profile/settings (user dropdown)
3. ✅ User can search across entities without navigating (Cmd+K)
4. ✅ User knows which navigation item is active (enhanced indicator)
5. ✅ All features work on mobile devices
6. ✅ No performance degradation (search < 300ms)
7. ✅ No accessibility regressions

---

## References

- shadcn/ui Documentation: https://ui.shadcn.com
- Next.js App Router: https://nextjs.org/docs/app
- Hugeicons: https://hugeicons.com
- Command Palette Pattern: https://www.patterns.dev/posts/command-palette/

---

## Appendix: Page Title Mappings

Complete mapping of routes to page titles and icons:

| Route                     | Title           | Icon            | Breadcrumb Path                          |
| ------------------------- | --------------- | --------------- | ---------------------------------------- |
| `/dashboard`              | Dashboard       | LayoutDashboard | Dashboard                                |
| `/manage/users`           | Users           | Users           | Dashboard / Management / Users           |
| `/manage/users/[id]`      | User Details    | UserCircle      | Dashboard / Management / Users / [Name]  |
| `/manage/roles`           | Roles           | SecurityIcon    | Dashboard / Management / Roles           |
| `/manage/permissions`     | Permissions     | Settings01Icon  | Dashboard / Management / Permissions     |
| `/manage/system-settings` | System Settings | Settings02Icon  | Dashboard / Management / System Settings |
| `/profile`                | Profile         | UserCircleIcon  | Dashboard / Profile                      |
| `/settings`               | Settings        | Settings        | Dashboard / Settings                     |
