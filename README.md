# Naiera Starter

Production-ready Next.js 16 starter with enterprise-grade features for building internal tools.

## Quick Start

```bash
git clone https://github.com/yourorg/naiera-starter
cd naiera-starter
pnpm install
pnpm prisma:push
pnpm prisma:seed
cp .env.example .env
docker-compose up -d
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Features

- **Authentication** - NextAuth.js with RBAC
- **UI Components** - shadcn/ui + Tailwind CSS v4
- **File Upload** - MinIO object storage
- **Global Search** - Cmd+K anywhere
- **Dashboard** - Breadcrumbs, smart header
- **Testing** - Vitest + React Testing Library
- **Email** - React Email + Resend
- **Forms** - React Hook Form + Zod
- **State** - Jotai + TanStack Query

## Documentation

- [Architecture](docs/architecture/overview.md)
- [Getting Started](docs/guides/getting-started.md)
- [Deployment](docs/guides/deployment.md)

## Tech Stack

- **Framework**: Next.js 16, React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL + Prisma
- **Storage**: MinIO
- **Auth**: NextAuth.js v5

## License

MIT
