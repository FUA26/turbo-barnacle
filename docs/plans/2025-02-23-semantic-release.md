# Semantic Release Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Automate semantic versioning, changelog generation, and GitHub releases using semantic-release

**Architecture:** Install semantic-release and plugins, create configuration files (.releaserc.json, GitHub Actions workflow), update package.json scripts, and test with dry-run before enabling on master branch

**Tech Stack:** semantic-release, @semantic-release/git, @semantic-release/changelog, @semantic-release/github, GitHub Actions

---

### Task 1: Install semantic-release packages

**Files:**

- Modify: `package.json`

**Step 1: Install semantic-release and required plugins**

Run:

```bash
pnpm add -D semantic-release @semantic-release/commit-analyzer @semantic-release/release-notes-generator @semantic-release/changelog @semantic-release/git @semantic-release/github @semantic-release/npm
```

Expected: Packages installed successfully

**Step 2: Verify installation**

Run:

```bash
cat package.json | grep -A 10 "devDependencies"
```

Expected: See semantic-release packages in devDependencies

**Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: install semantic-release and plugins"
```

---

### Task 2: Create semantic-release configuration file

**Files:**

- Create: `.releaserc.json`

**Step 1: Create .releaserc.json with plugin configuration**

Create file `.releaserc.json`:

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

**Step 2: Verify file created**

Run:

```bash
cat .releaserc.json
```

Expected: JSON output with plugin configuration

**Step 3: Commit**

```bash
git add .releaserc.json
git commit -m "chore: add semantic-release configuration"
```

---

### Task 3: Update package.json with release scripts

**Files:**

- Modify: `package.json`

**Step 1: Add release scripts to package.json**

Add to `scripts` section in `package.json`:

```json
{
  "scripts": {
    "release": "semantic-release",
    "release:dry-run": "semantic-release --dry-run"
  }
}
```

**Step 2: Verify scripts added**

Run:

```bash
cat package.json | grep -A 2 '"release"'
```

Expected: See release and release:dry-run scripts

**Step 3: Commit**

```bash
git add package.json
git commit -m "chore: add release scripts to package.json"
```

---

### Task 4: Create GitHub Actions workflow for releases

**Files:**

- Create: `.github/workflows/release.yml`

**Step 1: Create GitHub Actions workflow file**

Create file `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    branches: [master]

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          persist-credentials: false

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Release
        run: npx semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Step 2: Verify workflow file**

Run:

```bash
cat .github/workflows/release.yml
```

Expected: YAML output with release job configuration

**Step 3: Commit**

```bash
git add .github/workflows/release.yml
git commit -m "ci: add semantic-release GitHub Actions workflow"
```

---

### Task 5: Create initial CHANGELOG.md

**Files:**

- Create: `CHANGELOG.md`

**Step 1: Create initial CHANGELOG.md**

Create file `CHANGELOG.md`:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
```

**Step 2: Verify file created**

Run:

```bash
cat CHANGELOG.md
```

Expected: Markdown output with changelog header

**Step 3: Commit**

```bash
git add CHANGELOG.md
git commit -m "chore: add initial CHANGELOG.md"
```

---

### Task 6: Test semantic-release locally with dry-run

**Files:**

- None (testing only)

**Step 1: Run semantic-release in dry-run mode**

Run:

```bash
npm run release:dry-run
```

Expected: Output showing analyzed commits and potential version bump, but no actual release created

**Step 2: Check output for errors**

Run:

```bash
echo "Exit code: $?"
```

Expected: Exit code 0 (success) or exit code 1 (no release needed - also OK for dry-run)

**Step 3: Document test results**

Create note in project docs or terminal:

```bash
echo "Semantic-release dry-run test completed on $(date)" > /tmp/semantic-release-test.log
```

---

### Task 7: Create test branch for validation

**Files:**

- None (git operations)

**Step 1: Create and checkout test branch**

Run:

```bash
git checkout -b test/semantic-release-validation
```

Expected: Switched to new branch 'test/semantic-release-validation'

**Step 2: Add test commits**

Run:

```bash
echo "# Test" > test-release.md
git add test-release.md
git commit -m "feat: add test file for semantic-release validation"
git push origin test/semantic-release-validation
```

Expected: Commit created and pushed

**Step 3: Verify branch exists**

Run:

```bash
git branch -a | grep test/semantic-release-validation
```

Expected: See test branch listed

---

### Task 8: Update .releaserc for test branch

**Files:**

- Modify: `.releaserc.json`

**Step 1: Temporarily update .releaserc.json for test branch**

Update `.releaserc.json`:

```json
{
  "branches": ["test/semantic-release-validation"],
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

**Step 2: Verify change**

Run:

```bash
cat .releaserc.json | grep branches
```

Expected: See "test/semantic-release-validation" branch

**Step 3: Commit**

```bash
git add .releaserc.json
git commit -m "test: configure semantic-release for test branch"
```

---

### Task 9: Run dry-run on test branch

**Files:**

- None (testing only)

**Step 1: Run semantic-release dry-run on test branch**

Run:

```bash
npm run release:dry-run
```

Expected: Output showing "feat: add test file" commit analyzed, version bump suggested

**Step 2: Check for release notes generation**

Run:

```bash
npm run release:dry-run 2>&1 | grep -i "release notes"
```

Expected: See release notes generated or message about next version

**Step 3: Document results**

Run:

```bash
echo "Test branch dry-run completed: $(date)" >> /tmp/semantic-release-test.log
```

---

### Task 10: Revert test branch configuration

**Files:**

- Modify: `.releaserc.json`

**Step 1: Restore .releaserc.json to master branch**

Update `.releaserc.json`:

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

**Step 2: Switch back to feature branch**

Run:

```bash
git checkout feature/advanced-data-table
```

Expected: Switched back to feature branch

**Step 3: Delete test branch**

Run:

```bash
git branch -D test/semantic-release-validation
```

Expected: Test branch deleted locally

**Step 4: Commit**

```bash
git add .releaserc.json
git commit -m "test: restore semantic-release config for master branch"
```

---

### Task 11: Add documentation to CLAUDE.md

**Files:**

- Modify: `CLAUDE.md`

**Step 1: Add semantic-release section to CLAUDE.md**

Add to `CLAUDE.md` (after existing sections):

```markdown
## Semantic Release

Automated versioning and release management using semantic-release:

- **Configuration:** `.releaserc.json` - Plugin configuration and branch settings
- **Release trigger:** Automatically triggered on push to `master` branch
- **Version rules:**
  - `feat:` → minor version bump (0.1.0 → 0.2.0)
  - `fix:` → patch version bump (0.1.0 → 0.1.1)
  - `feat!:` or `BREAKING CHANGE:` → major version bump (0.1.0 → 1.0.0)
  - `chore:`, `docs:`, `test:` → no release
- **Changelog:** Automatically generated in `CHANGELOG.md`
- **GitHub releases:** Auto-created with release notes
- **Local testing:** Run `npm run release:dry-run` to test without creating releases

**Development workflow:**

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make commits with conventional format: `feat: add new feature`
3. Push and create PR to master
4. After merge, semantic-release automatically creates release
5. No manual version bumping needed!
```

**Step 2: Verify documentation added**

Run:

```bash
cat CLAUDE.md | grep -A 5 "Semantic Release"
```

Expected: See semantic-release documentation

**Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add semantic-release documentation to CLAUDE.md"
```

---

### Task 12: Create README for semantic-release setup

**Files:**

- Create: `docs/semantic-release.md`

**Step 1: Create semantic-release documentation**

Create file `docs/semantic-release.md`:

````markdown
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
````

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

````

**Step 2: Verify file created**

Run:
```bash
cat docs/semantic-release.md | head -20
````

Expected: See semantic-release documentation

**Step 3: Commit**

```bash
git add docs/semantic-release.md
git commit -m "docs: add semantic-release setup documentation"
```

---

### Task 13: Verify all configuration files

**Files:**

- Check: `.releaserc.json`, `package.json`, `.github/workflows/release.yml`

**Step 1: Verify .releaserc.json exists and is valid**

Run:

```bash
cat .releaserc.json | jq .
```

Expected: Valid JSON output with plugins array

**Step 2: Verify package.json has release scripts**

Run:

```bash
cat package.json | jq '.scripts | keys | map(select(. | contains("release")))'
```

Expected: Array containing "release" and "release:dry-run"

**Step 3: Verify GitHub workflow exists**

Run:

```bash
ls -la .github/workflows/release.yml
```

Expected: File exists and is readable

**Step 4: Document verification**

Run:

```bash
echo "Configuration verification completed: $(date)" >> /tmp/semantic-release-test.log
```

---

### Task 14: Final test with current commits

**Files:**

- None (testing only)

**Step 1: Run final dry-run test**

Run:

```bash
npm run release:dry-run 2>&1 | tee /tmp/semantic-release-final.log
```

Expected: Detailed output showing commit analysis and version bump decision

**Step 2: Check for any errors or warnings**

Run:

```bash
cat /tmp/semantic-release-final.log | grep -i "error\|warning"
```

Expected: No critical errors (warnings about GitHub token in local mode are OK)

**Step 3: Review commit analysis**

Run:

```bash
cat /tmp/semantic-release-final.log | grep -A 5 "Analyzing commit"
```

Expected: List of analyzed commits with types

**Step 4: Document completion**

Run:

```bash
echo "Semantic-release setup completed: $(date)" >> /tmp/semantic-release-test.log
cat /tmp/semantic-release-test.log
```

---

### Task 15: Commit all changes and create summary

**Files:**

- None (final git operations)

**Step 1: Review all changes**

Run:

```bash
git status
```

Expected: List of all modified/created files

**Step 2: Create final summary commit**

Run:

```bash
git add .
git commit -m "feat: implement semantic-release automation

- Install semantic-release and plugins
- Add .releaserc.json configuration
- Create GitHub Actions workflow for automated releases
- Add release scripts to package.json
- Initialize CHANGELOG.md
- Add documentation to CLAUDE.md and docs/
- Configure for master branch releases
- Support conventional commits for version bumping

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

**Step 3: Display implementation summary**

Run:

```bash
echo "=== Semantic Release Implementation Complete ==="
echo ""
echo "Files created:"
echo "  - .releaserc.json (configuration)"
echo "  - .github/workflows/release.yml (CI/CD)"
echo "  - CHANGELOG.md (auto-generated changelog)"
echo "  - docs/semantic-release.md (documentation)"
echo ""
echo "Files modified:"
echo "  - package.json (added release scripts)"
echo "  - CLAUDE.md (added semantic-release section)"
echo ""
echo "Next steps:"
echo "  1. Merge feature branch to master"
echo "  2. Push to master"
echo "  3. GitHub Actions will automatically create first release"
echo ""
echo "Local testing:"
echo "  npm run release:dry-run"
```

Expected: Summary displayed

**Step 4: Cleanup test files**

Run:

```bash
rm -f test-release.md
rm -f /tmp/semantic-release-test.log
rm -f /tmp/semantic-release-final.log
```

Expected: Test files cleaned up
