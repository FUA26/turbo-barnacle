# Architecture Overview

## System Layers

```
[Browser/Client]
↓
[Next.js App Router]
↓
[API Routes] → [Middleware (Auth)]
↓
[Business Logic (lib/)]
↓
[Database (Prisma)]
```

## Key Directories

- `app/` - Next.js App Router (pages + API routes)
- `components/` - React components (UI + custom)
- `lib/` - Business logic, utilities
- `prisma/` - Database schema + migrations

## Design Decisions

- **App Router** - Modern Next.js routing
- **RBAC** - Permission-based access control
- **File proxy** - All files served through API
- **Permission cache** - 5-min TTL in-memory cache
