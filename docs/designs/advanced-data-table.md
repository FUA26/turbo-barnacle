# Advanced Data Table Design

> **Status:** Design Phase
> **Branch:** `feature/advanced-data-table`
> **Date:** 2026-02-18

## Goal

Enhance admin data tables (Users, Roles, Permissions) with advanced features from tablecn.com and diceui.com, including URL state management, advanced filtering, multi-column sorting, and keyboard navigation.

## Approach

**Selected:** Incremental Enhancement (Approach 1)

- Install nuqs for URL state management
- Create reusable table utilities and hooks
- Enhance all three tables consistently
- Phase 2: Migrate to server-side operations if needed

## Features to Implement

### 1. URL State Management (nuqs)

**Purpose:** Shareable table states, browser back/button support

**Implementation:**

```typescript
// Query params structure
?sort=name:asc,email:desc&filter[name]=admin&filter[role]=user&page=1&perPage=10&columns=name,email,role
```

**URL Schema:**

- `sort`: `column:direction` (multi: comma-separated)
- `filter[column]`: filter value per column
- `page`: current page number
- `perPage`: rows per page
- `columns`: visible columns (comma-separated)

### 2. Advanced Filtering

**Filter Types:**

- **Text**: Fuzzy search (name, email)
- **Select**: Single choice (role, category)
- **Multi-select**: Multiple choices (permissions)
- **Date**: Date range picker (createdAt, updatedAt)

**UI Components:**

- Command palette (Cmd+K) for quick filter access
- Filter chips with remove buttons
- Filter badge showing active count
- Clear all filters button

### 3. Multi-Column Sorting

**Features:**

- Click header to sort ascending
- Shift+click for multi-column sort
- Sort indicator with order number
- Sort removal button in dropdown

**Display:**

```
Name ↑ (1)  |  Email ↓ (2)  |  Role
```

### 4. Column Visibility Toggle

**UI:**

- Dropdown menu with checkboxes
- "Show/Hide Columns" button in toolbar
- Persist to URL
- "Reset to Defaults" option

### 5. Enhanced Action Bar

**Components:**

```
┌─────────────────────────────────────────────────────────────────┐
│ 📊 0 of 10 row(s) selected    [Clear] [Bulk Actions]    [▾]    │
└─────────────────────────────────────────────────────────────────┘
```

**Features:**

- Selection counter
- Clear selection button
- Bulk actions dropdown
- Column visibility button
- Export button (future)

### 6. Keyboard Shortcuts

| Shortcut       | Action                         |
| -------------- | ------------------------------ |
| `Ctrl+Shift+F` | Focus filter input             |
| `Ctrl+Shift+S` | Open sort dialog               |
| `Ctrl+Shift+C` | Open column visibility         |
| `Cmd+K`        | Open command palette           |
| `Esc`          | Close dialogs/modals           |
| `Ctrl+A`       | Select all rows (when focused) |

### 7. Responsive Design

**Breakpoints:**

- `< 640px`: Hide less important columns
- `< 768px`: Stack action bar vertically
- `< 1024px`: Hide column visibility button in dropdown

**Mobile Optimizations:**

- Horizontal scroll for table
- Card view alternative (optional)
- Touch-friendly row selection

## Component Structure

### New Components to Create

```
components/admin/data-table/
├── advanced-data-table.tsx       # Main wrapper component
├── data-table-toolbar.tsx        # Action bar with search
├── data-table-facade.tsx         # Filter/sort/command UI
├── data-table-pagination.tsx     # Enhanced pagination
├── data-table-column-visibility.tsx
├── data-table-row-actions.tsx    # Row action dropdown
└── hooks/
    ├── use-data-table-state.ts   # URL state management
    ├── use-data-table-sorting.ts
    ├── use-data-table-filters.ts
    └── use-keyboard-shortcuts.ts
```

### Utilities to Create

```
lib/table/
├── data-table-types.ts           # Shared TypeScript types
├── column-defs.ts                # Column definitions factory
├── filter-operators.ts           # Filter logic (contains, equals, etc.)
└── sort-utils.ts                 # Sort utilities
```

## Implementation Tasks

### Phase 1: Foundation

1. Install dependencies (`nuqs`, required shadcn components)
2. Create `use-data-table-state` hook with nuqs integration
3. Build `DataTableToolbar` with search and actions
4. Create `DataTableViewOptions` (column visibility)
5. Add keyboard shortcuts hook

### Phase 2: Filtering & Sorting

6. Implement advanced filter facade with Command
7. Add multi-column sorting UI
8. Create filter chips display
9. Build sort indicator components

### Phase 3: Table Migration

10. Migrate `UsersDataTable` → `AdvancedDataTable`
11. Migrate `RolesTanStackTable` → `AdvancedDataTable`
12. Migrate `PermissionsDataTable` → `AdvancedDataTable`
13. Update skeleton components to match new structure

### Phase 4: Polish

14. Add loading states with skeletons
15. Implement empty states with illustrations
16. Add error states with retry
17. Accessibility audit (ARIA labels, keyboard nav)
18. Write tests for hooks and utilities

## API Changes

### Current (Client-side)

```typescript
// No API calls for pagination/filtering
fetch("/api/users"); // Returns all users
```

### Phase 1 (Still client-side, but URL-managed)

```typescript
// Same API, but URL params control view
fetch("/api/users"); // Returns all, client filters/sorts
// URL: ?page=2&sort=name:asc&filter[name]=admin
```

### Phase 2 (Future - Server-side)

```typescript
// Server-side operations
fetch("/api/users?page=2&sort=name&order=asc&filter[name]=admin");
// Returns paginated, filtered, sorted results
```

## Dependencies to Install

```bash
pnpm add nuqs
pnpm add date-fns  # For date filtering
```

### shadcn Components (check existing)

```bash
# Command components (if not present)
npx shadcn@latest add command
npx shadcn@latest add popover
npx shadcn@latest add calendar  # For date range picker
npx shadcn@latest add separator
```

## Design Decisions

### Why Approach 1 (Incremental)?

1. **Dataset Size**: Current admin tables have < 1000 rows, client-side is sufficient
2. **Time to Market**: Faster to ship with major UX improvements (URL state)
3. **Migration Path**: Can upgrade to server-side without breaking URL schema
4. **Complexity**: Lower risk, easier to test and maintain

### Why nuqs?

- Type-safe URL state management
- Next.js App Router compatible
- SSR-friendly
- Minimal boilerplate

### Why Multi-Phase?

- Phase 1: Foundation + major UX wins (URL state, advanced filters)
- Phase 2: Server-side if/when dataset grows
- Allows validation of UX patterns before full investment

## Migration Strategy

### Step 1: Create New Components Alongside Existing

```typescript
// components/admin/advanced-users-data-table.tsx
export function AdvancedUsersDataTable() {
  // New implementation
}

// Keep old component as fallback
export function UsersDataTable() {
  // Existing implementation
}
```

### Step 2: Feature Flag for Gradual Rollout

```typescript
const useAdvancedTable = process.env.NEXT_PUBLIC_ADVANCED_TABLE === 'true';

export default function UsersPage() {
  return useAdvancedTable ? <AdvancedUsersTable /> : <UsersTable />;
}
```

### Step 3: A/B Test Before Full Migration

- Monitor performance
- Gather user feedback
- Compare metrics (engagement, filter usage)

## Success Criteria

- [ ] All three tables use `AdvancedDataTable` component
- [ ] URL state persists and is shareable
- [ ] Keyboard shortcuts work on all pages
- [ ] Filters persist across navigation
- [ ] Column visibility persists to URL
- [ ] Multi-column sorting works with Shift+click
- [ ] Responsive on mobile devices
- [ ] Accessibility passes WAVE test
- [ ] No TypeScript errors
- [ ] All tests pass

## Open Questions

1. **Date Range Picker**: Use shadcn calendar or custom component?
2. **Export Feature**: Include CSV/Excel export in Phase 1 or later?
3. **Row Detail View**: Add expandable rows for detailed info?
4. **Virtual Scrolling**: Implement for very large datasets (1000+ rows)?

## References

- [tablecn.com](https://tablecn.com/) - Server-side operations, command filters
- [diceui.com/data-table](https://diceui.com/docs/components/data-table) - URL state, advanced filters
- [TanStack Table](https://tanstack.com/table/latest) - Core table library
- [nuqs](https://nuqs.47ng.com/) - URL state management
