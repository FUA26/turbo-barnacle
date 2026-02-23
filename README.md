# Naiera Starter

<div align="center">

![Naiera Starter Banner](public/logo.svg)

**Production-ready Next.js 16 boilerplate for building internal tools and SaaS applications**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](CONTRIBUTING.md)

</div>

---

## ✨ Features

### 🔐 Authentication & Authorization

- **NextAuth.js v5** - Credential and OAuth authentication
- **RBAC System** - Fine-grained permission-based access control
- **Email Verification** - Secure user registration flow
- **Password Reset** - Self-service password recovery
- **Protected Routes** - Server-side route protection

### 📁 File Management

- **MinIO/S3 Storage** - Scalable object storage integration
- **File Upload** - Drag-and-drop with progress tracking
- **Magic Byte Validation** - Secure file type verification
- **Avatar Upload** - User profile pictures
- **File Cleanup** - Automated orphan removal

### 🎨 UI Components

- **shadcn/ui** - Beautiful, accessible components
- **Tailwind CSS v4** - Modern utility-first styling
- **Dark Mode Ready** - Easy theme customization
- **Responsive Design** - Mobile-first approach
- **Hugeicons** - Consistent icon system

### 📊 Dashboard

- **Smart Navigation** - Dynamic sidebar with breadcrumbs
- **Global Search** - Cmd+K to find anything
- **Advanced Data Table** - Sort, filter, paginate
- **Analytics Dashboard** - User, system, and activity metrics
- **User Dropdown** - Quick settings access

### 🧪 Testing

- **Vitest** - Fast unit testing
- **Playwright** - End-to-end testing
- **React Testing Library** - Component testing
- **Test Coverage** - Built-in coverage reporting

### 📧 Email

- **React Email** - Component-based templates
- **Resend Integration** - Production email delivery
- **Transactional Templates** - Welcome, reset, verification

### 🔧 Developer Experience

- **TypeScript Strict Mode** - Type safety guaranteed
- **ESLint & Prettier** - Code quality enforced
- **Lefthook** - Git hooks automation
- **Hot Reload** - Instant feedback
- **Path Aliases** - Clean imports

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20 or higher
- **pnpm** - `npm install -g pnpm`
- **Docker** - For PostgreSQL and MinIO

### Installation

```bash
# Clone the repository
git clone https://github.com/yourorg/naiera-starter.git your-project
cd your-project

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Start services (PostgreSQL + MinIO)
docker-compose up -d

# Setup database
pnpm prisma:push
pnpm prisma:seed

# Start development server
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Default Credentials

```
Email: admin@example.com
Password: password
```

## 📚 Documentation

### Getting Started

- [Getting Started Guide](docs/guides/getting-started.md) - Complete setup instructions
- [Boilerplate Guide](docs/BOILERPLATE_GUIDE.md) - How to use as a template
- [Customization Guide](docs/CUSTOMIZATION.md) - Tailor to your needs

### Architecture

- [Architecture Overview](docs/architecture/overview.md) - System design
- [Project Structure](docs/STRUCTURE.md) - File organization
- [Features List](docs/FEATURES.md) - Complete feature documentation

### Guides

- [Deployment Guide](docs/guides/deployment.md) - Deploy to production
- [Contributing Guide](CONTRIBUTING.md) - Contribution workflow

## 🛠️ Tech Stack

| Category       | Technology              |
| -------------- | ----------------------- |
| **Framework**  | Next.js 16 (App Router) |
| **UI**         | React 19, TypeScript 5  |
| **Styling**    | Tailwind CSS v4         |
| **Database**   | PostgreSQL + Prisma ORM |
| **Storage**    | MinIO (S3-compatible)   |
| **Auth**       | NextAuth.js v5          |
| **Forms**      | React Hook Form + Zod   |
| **State**      | TanStack Query + Jotai  |
| **Testing**    | Vitest + Playwright     |
| **Email**      | React Email + Resend    |
| **Components** | shadcn/ui               |

## 📁 Project Structure

```
├── app/                      # Next.js App Router
│   ├── (dashboard)/         # Dashboard routes
│   ├── (auth)/              # Authentication routes
│   ├── api/                 # API routes
│   └── layout.tsx           # Root layout
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── dashboard/           # Dashboard components
│   ├── analytics/           # Analytics components
│   └── ...
├── lib/                     # Business logic
│   ├── auth/                # Authentication logic
│   ├── rbac-*/              # RBAC system
│   ├── api/                 # API utilities
│   └── ...
├── prisma/                  # Database
│   ├── schema.prisma        # Database schema
│   └── migrations/          # SQL migrations
├── tests/                   # Tests
├── docs/                    # Documentation
└── public/                  # Static assets
```

See [STRUCTURE.md](docs/STRUCTURE.md) for detailed structure.

## 🎯 Use Cases

### Perfect For

- ✅ **Internal Tools** - Admin panels, dashboards
- ✅ **SaaS Applications** - Multi-tenant platforms
- ✅ **Business Apps** - CRM, ERP, project management
- ✅ **Data Management** - Data entry and reporting
- ✅ **Team Collaboration** - Task management, communication

### Features You Can Build

- User management system
- Role-based permissions
- File upload/management
- Analytics dashboard
- Email notifications
- Multi-tenant SaaS
- Admin panels
- Content management

## 🔧 Available Scripts

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm prisma:generate  # Generate Prisma Client
pnpm prisma:push      # Push schema to database
pnpm prisma:migrate   # Run migrations
pnpm prisma:seed      # Seed database
pnpm prisma:studio    # Open Prisma Studio

# Testing
pnpm test             # Run tests
pnpm test:ui          # Run tests with UI
pnpm test:coverage    # Generate coverage report
pnpm test:e2e         # Run E2E tests

# Code Quality
pnpm lint             # Run ESLint
pnpm format           # Format with Prettier
pnpm format:check     # Check formatting
pnpm type-check       # TypeScript type check

# Deployment
pnpm release:dry-run  # Test release without publishing
```

## 🌐 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourorg/naiera-starter)

### Docker

```bash
docker build -f .docker/Dockerfile -t naiera-starter .
docker run -p 3000:3000 naiera-starter
```

See [Deployment Guide](docs/guides/deployment.md) for more options.

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [NextAuth.js](https://authjs.dev/) - Authentication for Next.js

## 📞 Support

- 📖 [Documentation](docs/)
- 🐛 [Issue Tracker](https://github.com/yourorg/naiera-starter/issues)
- 💬 [Discussions](https://github.com/yourorg/naiera-starter/discussions)
- 📧 Email: support@yourdomain.com

## 🔗 Links

- [Documentation](docs/)
- [Changelog](CHANGELOG.md)
- [Roadmap](docs/FEATURES.md#roadmap)
- [License](LICENSE)

---

<div align="center">
  <strong>Built with ❤️ by the Naiera team</strong>
</div>
