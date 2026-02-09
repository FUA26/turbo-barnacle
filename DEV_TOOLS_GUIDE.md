# Development Tools Guide

This project is equipped with a comprehensive set of developer experience tools to maintain code quality, enforce standards, and streamline the development workflow.

## Table of Contents

- [Tools Overview](#tools-overview)
- [Setup](#setup)
- [Usage](#usage)
- [Configuration Files](#configuration-files)
- [Git Workflow](#git-workflow)
- [Commit Message Convention](#commit-message-convention)
- [Troubleshooting](#troubleshooting)

---

## Tools Overview

### 💖 Prettier

**Code Formatter** - Automatically formats your code to maintain consistent style across the project.

**Features:**

- Automatic code formatting on save (in VS Code)
- Tailwind CSS class sorting
- Import organization
- Consistent code style across the team

### 🦊 Lefthook

**Git Hooks Manager** - Replaces Husky with better performance and more features.

**Features:**

- **pre-commit**: Runs Prettier, ESLint, and TypeScript type checking
- **pre-push**: Runs type checking and tests (when available)
- **commit-msg**: Validates commit messages with Commitlint
- **prepare-commit-msg**: Optionally launches Commitizen for interactive commits

### 🚫 Lint-staged

**File Linter** - Runs linters only on staged files for faster performance.

**Note:** This project uses Lefthook's built-in staged file handling instead of lint-staged for better integration. The lint-staged package is kept for future use if needed.

### 🚓 Commitlint

**Commit Linter** - Enforces conventional commit message standards.

**Features:**

- Validates commit messages before they're created
- Ensures consistent commit message format
- Helps generate better changelogs

### 📓 Commitizen

**Interactive Commit CLI** - Guides you through writing standard-compliant commit messages.

**Features:**

- Interactive prompt for commit messages
- Standardized commit types
- Supports breaking changes and scopes

### 🔍 Knip

**Unused Code Detector** - Finds unused files, exports, and dependencies.

**Features:**

- Detects unused dependencies
- Finds unused files and exports
- Identifies unlisted dependencies
- Helps keep the codebase clean

---

## Setup

### Initial Setup

The git hooks are automatically installed when you run:

```bash
pnpm install
```

This triggers the `prepare` script which installs Lefthook hooks.

### Manual Hook Installation

If you need to reinstall the hooks:

```bash
lefthook install
```

---

## Usage

### Code Formatting

#### Format all files:

```bash
pnpm format
```

#### Check formatting without changing files:

```bash
pnpm format:check
```

#### VS Code Integration

Formatting happens automatically on save (configured in `.vscode/settings.json`).

To manually format in VS Code:

- Windows/Linux: `Shift + Alt + F`
- Mac: `Shift + Option + F`

### Linting

#### Run ESLint:

```bash
pnpm lint
```

#### Run TypeScript type checking:

```bash
pnpm tsc --noEmit
```

### Detecting Unused Code

#### Run Knip to find unused files/dependencies:

```bash
pnpm knip
```

#### Auto-fix unused imports (safe operations):

```bash
pnpm knip:fix
```

### Creating Commits

#### Option 1: Interactive (Recommended)

Use Commitizen for guided commit messages:

```bash
pnpm commit
```

Or use git commit with the interactive prompt (if enabled):

```bash
git commit
```

#### Option 2: Manual with Commitlint validation

Write your commit message following the convention (see below):

```bash
git commit -m "feat: add user authentication"
```

The commit will be validated before being accepted.

---

## Configuration Files

### Prettier

**Location:** `.prettierrc`

**Key Settings:**

```json
{
  "printWidth": 100,
  "singleQuote": false,
  "trailingComma": "es5",
  "plugins": ["prettier-plugin-tailwindcss", "prettier-plugin-organize-imports"]
}
```

**Files to ignore:** `.prettierignore`

### Lefthook

**Location:** `lefthook.yml`

**Hooks Configured:**

- `pre-commit`: Prettier, ESLint, TypeScript check
- `pre-push`: TypeScript check, tests
- `commit-msg`: Commitlint validation

### Commitlint

**Location:** `commitlint.config.js`

**Supported Types:**

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `build` - Build system changes
- `ci` - CI/CD changes
- `chore` - Other changes
- `revert` - Revert a previous commit

### Commitizen

**Location:** `.czrc` and `package.json` config section

**Configuration:**

- Uses `cz-conventional-changelog` adapter
- Custom commit types defined
- Allows custom scopes
- Supports breaking changes

### Lint-staged

**Location:** `.lintstagedrc.json`

**Rules:**

```json
{
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,css,scss,md,prisma}": ["prettier --write"]
}
```

### Knip

**Location:** `knip.json`

**Configuration:**

- Entry points: app files and middleware
- Ignores: node_modules, .next, UI components
- Specific dependencies ignored for future use

---

## Git Workflow

### Pre-Commit Hook

When you run `git commit`, the following happens:

1. **Prettier** formats all staged files
2. **ESLint** fixes linting issues in staged files
3. **TypeScript** checks for type errors
4. Fixed files are automatically re-staged
5. If all checks pass, the commit proceeds

### Pre-Push Hook

When you run `git push`, the following happens:

1. **TypeScript** type checking runs
2. **Tests** run (when implemented)

### Commit Message Hook

Before the commit message is finalized:

1. **Commitlint** validates the message format
2. If invalid, you must edit the message to comply

---

## Commit Message Convention

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that don't affect code meaning (formatting, etc.)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvement
- **test**: Adding or updating tests
- **build**: Changes to build system or dependencies
- **ci**: CI/CD changes
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

### Examples

```bash
# Simple commit
git commit -m "feat: add user authentication"

# With scope
git commit -m "feat(auth): implement OAuth login"

# With body
git commit -m "fix: resolve memory leak in data fetching

The issue was caused by not cleaning up subscriptions
when components unmount. Added proper cleanup in useEffect."

# Breaking change
git commit -m "feat: redesign dashboard API

BREAKING CHANGE: The dashboard API now requires authentication
for all endpoints. Update your client code accordingly."
```

### Using Commitizen

Run `pnpm commit` and follow the prompts:

1. Select the **type** of change
2. Enter the **scope** (optional)
3. Write a short **subject**
4. Add a longer **description** (optional)
5. Specify **breaking changes** (if any)
6. Review affected **issues** (optional)

---

## NPM Scripts

All available scripts in `package.json`:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "format": "prettier --write .",
  "format:check": "prettier --check .",
  "prepare": "lefthook install",
  "commit": "cz",
  "knip": "knip",
  "knip:fix": "knip --fix"
}
```

---

## Troubleshooting

### Hooks Not Running

**Problem:** Git hooks aren't executing.

**Solution:**

```bash
# Reinstall hooks
lefthook install

# Verify hooks are installed
ls -la .git/hooks/
```

### Commitlint Failing

**Problem:** Commit message validation fails.

**Solution:**
Make sure your commit message follows the conventional format:

```
type(scope): subject
```

Use `pnpm commit` to be guided through the process.

### Prettier Conflicts

**Problem:** Prettier formatting conflicts with ESLint.

**Solution:**
Prettier is configured to disable ESLint formatting rules. If you still have conflicts:

1. Run `pnpm format` to apply Prettier
2. Run `pnpm lint` to check for ESLint issues
3. ESLint should only catch real problems, not formatting issues

### Skip Hooks (Not Recommended)

**Warning:** Only skip hooks if you know what you're doing!

```bash
# Skip pre-commit hook
git commit --no-verify -m "your message"

# Skip pre-push hook
git push --no-verify
```

### TypeScript Errors in Pre-Commit

**Problem:** Type errors prevent committing.

**Solutions:**

1. Fix the type errors (recommended)
2. Temporarily disable type checking in `lefthook.yml`
3. Use `git commit --no-verify` (not recommended)

### Knip False Positives

**Problem:** Knip reports dependencies as unused when they're needed.

**Solution:**
Add them to the `ignoreDependencies` array in `knip.json`:

```json
{
  "ignoreDependencies": ["package-name"]
}
```

---

## Best Practices

### 1. Commit Often, Commit Small

Small, focused commits are easier to review and revert if needed.

### 2. Write Meaningful Commit Messages

Follow the convention and be descriptive:

- ✅ `feat: add OAuth2 authentication`
- ❌ `update stuff`
- ❌ `wip`

### 3. Format Before Committing

Let the pre-commit hook handle formatting, but you can run `pnpm format` anytime.

### 4. Run Knip Regularly

Check for unused code periodically:

```bash
pnpm knip
```

### 5. Keep Dependencies Clean

Remove unused dependencies found by Knip to keep the bundle size down.

### 6. Use Commitizen for Complex Commits

For commits with detailed descriptions or breaking changes, use `pnpm commit`.

---

## Quick Reference

| Task                         | Command                  |
| ---------------------------- | ------------------------ |
| Format code                  | `pnpm format`            |
| Check format                 | `pnpm format:check`      |
| Lint code                    | `pnpm lint`              |
| Type check                   | `pnpm tsc --noEmit`      |
| Find unused                  | `pnpm knip`              |
| Interactive commit           | `pnpm commit`            |
| Install hooks                | `lefthook install`       |
| Skip hooks (not recommended) | `git commit --no-verify` |

---

## Additional Resources

- [Prettier Documentation](https://prettier.io/docs/en/)
- [Lefthook Documentation](https://github.com/evilmartians/lefthook)
- [Commitlint Documentation](https://commitlint.js.org/)
- [Commitizen Documentation](https://github.com/commitizen/cz-cli)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Knip Documentation](https://github.com/webpro-nz/knip)
