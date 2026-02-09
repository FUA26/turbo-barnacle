# Quick Reference - Development Commands

## Development

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
```

## Code Quality

```bash
pnpm lint         # Run ESLint
pnpm format       # Format code with Prettier
pnpm format:check # Check formatting
pnpm knip         # Find unused code
pnpm knip:fix     # Auto-fix unused imports
pnpm tsc --noEmit # TypeScript type check
```

## Database

```bash
pnpm prisma generate    # Generate Prisma client
pnpm prisma db push     # Push schema to database
pnpm prisma studio      # Open Prisma Studio
docker compose up -d    # Start PostgreSQL
```

## Git Workflow

```bash
pnpm commit      # Interactive commit (Commitizen)
git commit -m "type: message"  # Manual commit
lefthook install # Install git hooks
```

## Commit Message Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Code style
- `refactor` - Refactoring
- `perf` - Performance
- `test` - Tests
- `build` - Build system
- `ci` - CI/CD
- `chore` - Other changes
- `revert` - Revert commit

## Git Hooks (Automatic)

- **pre-commit**: Format + Lint + Type check
- **pre-push**: Type check + Tests
- **commit-msg**: Validate commit message

## Troubleshooting

```bash
# Skip hooks (not recommended)
git commit --no-verify -m "message"
git push --no-verify

# Reinstall hooks
lefthook install
```

## Admin User

Create with:

```bash
curl -X POST http://localhost:3000/api/seed
```

Credentials:

- Email: admin@example.com
- Password: admin123

## Documentation

- `DEV_TOOLS_GUIDE.md` - Detailed tools guide
- `DEV_TOOLS_SUMMARY.md` - Implementation summary
- `IMPLEMENTATION_SUMMARY.md` - Project overview
- `README.md` - Main project readme
