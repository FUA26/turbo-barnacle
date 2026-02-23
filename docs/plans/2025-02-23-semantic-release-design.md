# Semantic Release Implementation Design

**Date:** 2025-02-23
**Status:** Approved
**Author:** Claude Sonnet 4.5

## Overview

Implement automated semantic versioning, changelog generation, and GitHub releases using semantic-release for the Naiera Next project.

## Goals

- **Automated versioning**: Automatically bump package.json version based on commit messages
- **Changelog generation**: Auto-generate and maintain CHANGELOG.md
- **GitHub releases**: Automatically create GitHub releases with release notes
- **Zero manual steps**: No manual version bumping or release creation

## Architecture

### Release Flow

```
Developer commit → GitHub → Push to master → GitHub Actions trigger
                                            ↓
                                    semantic-release runs
                                            ↓
                        Analyze commit messages (conventional commits)
                                            ↓
                        Determine version bump (major/minor/patch)
                                            ↓
                        Update package.json version
                        Generate CHANGELOG.md
                        Create Git tag
                        Push changes back to repo
                        Create GitHub Release with changelog
```

## Components

### 1. Core Tools

- **semantic-release** (^24.0.0) - Main automation engine
- **@semantic-release/commit-analyzer** - Analyze commits to determine release type
- **@semantic-release/release-notes-generator** - Generate release notes from commits
- **@semantic-release/changelog** - Update CHANGELOG.md
- **@semantic-release/git** - Commit changelog and package.json changes
- **@semantic-release/github** - Create GitHub releases and git tags
- **@semantic-release/npm** - (Optional) For npm package publishing

### 2. Configuration Files

#### `.releaserc.json`

```json
{
  "branches": ["master"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/git",
    "@semantic-release/github"
  ]
}
```

#### `package.json` updates

Add scripts:

```json
{
  "scripts": {
    "release": "semantic-release",
    "release:dry-run": "semantic-release --dry-run"
  }
}
```

#### `.github/workflows/release.yml`

```yaml
name: Release
on:
  push:
    branches: [master]
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          persist-credentials: false
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Version Bump Rules

Based on conventional commit prefixes:

| Commit Type                    | Bump      | Example       |
| ------------------------------ | --------- | ------------- |
| `feat:`                        | **minor** | 0.1.0 → 0.2.0 |
| `fix:`                         | **patch** | 0.1.0 → 0.1.1 |
| `feat!:` or `BREAKING CHANGE:` | **major** | 0.1.0 → 1.0.0 |
| `chore:`, `docs:`, `test:`     | **none**  | No release    |

## Development Workflow

### Current Workflow (Manual)

```bash
git add .
git commit -m "feat: add new feature"
git push origin feature-branch
# Manual: create PR, merge, manually bump version, create release
```

### New Workflow (Automated)

```bash
# 1. Development di feature branch
git checkout -b feature/new-analytics
git add .
git commit -m "feat: add analytics dashboard"
git push origin feature/new-analytics

# 2. Create & merge PR ke master (via GitHub)

# 3. Automated by semantic-release:
# - Analyze commits
# - Bump version
# - Create release
# - No manual steps!
```

## Testing Strategy

### Phase 1: Local Dry-Run Testing

```bash
# Install dependencies
pnpm add -D semantic-release @semantic-release/git @semantic-release/changelog @semantic-release/github

# Test locally without creating release
npm run release:dry-run
```

### Phase 2: Test Branch Testing

```bash
# Create test branch
git checkout -b test/semantic-release

# Add test commits
git commit -m "feat: test feature"
git commit -m "fix: test bug"

# Run dry-run
npm run release:dry-run
```

### Phase 3: Production Release

- Push to master and let GitHub Actions handle

## Error Handling

### Common Issues & Solutions

1. **No commits for release**
   - Cause: Only `chore:`, `docs:`, or `test:` commits
   - Solution: Add `feat:` or `fix:` commit

2. **Git authentication failed**
   - Cause: Missing GITHUB_TOKEN
   - Solution: Ensure GitHub Actions token is properly configured

3. **Changelog merge conflicts**
   - Cause: Manual edits to CHANGELOG.md
   - Solution: Let semantic-release manage CHANGELOG.md entirely

## Migration Steps

1. Install semantic-release packages
2. Create `.releaserc.json` configuration
3. Update `package.json` scripts
4. Create `.github/workflows/release.yml`
5. Test locally with `--dry-run`
6. Test on feature branch
7. Enable on master branch
8. Verify first automated release

## Success Criteria

- ✅ Version bumps automatically based on commits
- ✅ CHANGELOG.md generated and updated
- ✅ GitHub releases created automatically
- ✅ Git tags created for each release
- ✅ Zero manual intervention required
- ✅ Dry-run mode works for testing

## Future Enhancements

- Add npm package publishing (if needed)
- Add Slack/Discord notifications for releases
- Add release notes customization
- Add support for pre-releases (alpha, beta)
