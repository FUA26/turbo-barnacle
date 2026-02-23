# Semantic Release Setup

## Overview

This project uses [semantic-release](https://github.com/semantic-release/semantic-release) for automated versioning, changelog generation, and GitHub releases.

## How It Works

1. **Commit Analysis:** When code is pushed to `master`, semantic-release analyzes commit messages
2. **Version Bump:** Determines version bump based on commit types:
   - `feat:` → minor (0.1.0 → 0.2.0)
   - `fix:` → patch (0.1.0 → 0.1.1)
   - `feat!:` or `BREAKING CHANGE:` → major (0.1.0 → 1.0.0)
3. **Release Creation:** Updates package.json, generates CHANGELOG.md, creates Git tag, publishes GitHub release

## Configuration

- **Config file:** `.releaserc.json`
- **CI/CD:** `.github/workflows/release.yml`
- **Changelog:** `CHANGELOG.md` (auto-generated)

## Local Testing

Test locally without creating releases:

```bash
npm run release:dry-run
```

## Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `chore:` Build process or auxiliary tool changes
- `test:` Test changes
- `refactor:` Code refactoring
- `perf:` Performance improvements

## Troubleshooting

### No release created?

Check if commits include `feat:` or `fix:`. Only these trigger releases:

- `chore:`, `docs:`, `test:` don't trigger releases
- Need at least one `feat:` or `fix:` commit

### Release failed?

Check GitHub Actions logs for the `Release` workflow.

### Need to force a release?

Add empty commit:

```bash
git commit --allow-empty -m "chore: release $(npm version patch)"
```
