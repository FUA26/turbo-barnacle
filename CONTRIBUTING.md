# Contributing to Naiera Starter

Thank you for considering contributing!

## Development Setup

1. Fork and clone
2. Install dependencies: `pnpm install`
3. Setup git hooks: `pnpm prepare`
4. Create feature branch: `git checkout -b feature/your-feature`

## Development Workflow

```bash
# Make changes
pnpm format && pnpm lint
pnpm test
git commit -m "feat: add your feature"
git push origin feature/your-feature
# Open PR
```

## Code Style

- TypeScript strict mode
- Follow existing conventions
- Write tests for new features
- Run `pnpm format` before commit

## Commit Messages

Use Conventional Commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `refactor:` Code refactoring
- `test:` Adding tests

## Pull Request Guidelines

- Link related issues
- Describe changes
- Ensure checks pass
- Request review
