# Publishing cinematicRenderer2D to NPM

Complete guide for publishing this library to NPM.

## Prerequisites

### 1. NPM Account
- Create an account at [npmjs.com](https://www.npmjs.com/signup)
- Verify your email address

### 2. Login to NPM
```bash
npm login
```
Enter your username, password, and email when prompted.

### 3. Verify Login
```bash
npm whoami
```
Should display your NPM username.

## Pre-Publishing Checklist

### 1. Update Package Information

Edit `package.json` and update:

```json
{
  "name": "cinematic-renderer2d",
  "version": "0.1.0",
  "description": "High-performance, framework-agnostic NPM library that renders cinematic experiences from JSON specifications",
  "author": "Your Name <your.email@example.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/rvshekhar10/cinematicRenderer2D.git"
  },
  "bugs": {
    "url": "https://github.com/rvshekhar10/cinematicRenderer2D/issues"
  },
  "homepage": "https://github.com/rvshekhar10/cinematicRenderer2D#readme"
}
```

**Important**: Replace `rvshekhar10` with your actual GitHub username!

### 2. Check Package Name Availability

```bash
npm search cinematic-renderer2d
```

If the name is taken, you'll need to:
- Choose a different name, OR
- Use a scoped package: `@rvshekhar10/cinematic-renderer2d`

For scoped packages, update `package.json`:
```json
{
  "name": "@rvshekhar10/cinematic-renderer2d"
}
```

### 3. Verify Build Configuration

Check that `package.json` has correct build settings:

```json
{
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./react": {
      "types": "./dist/react.d.ts",
      "import": "./dist/react.js",
      "require": "./dist/react.cjs"
    },
    "./angular": {
      "types": "./dist/angular.d.ts",
      "import": "./dist/angular.js",
      "require": "./dist/angular.cjs"
    }
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ]
}
```

### 4. Run All Tests

```bash
# Type checking
npm run typecheck

# Run tests
npm run test:run

# Build the library
npm run build

# Validate build output
npm run build:check
```

All tests must pass before publishing!

### 5. Update Version (if needed)

```bash
# For patch release (0.1.0 -> 0.1.1)
npm version patch

# For minor release (0.1.0 -> 0.2.0)
npm version minor

# For major release (0.1.0 -> 1.0.0)
npm version major
```

Or manually edit `package.json` version field.

## Publishing Steps

### Option 1: Manual Publishing (Recommended for First Release)

#### Step 1: Build the Package
```bash
npm run build
```

#### Step 2: Test the Package Locally
```bash
# Create a tarball to inspect
npm pack

# This creates a file like: cinematic-renderer2d-0.1.0.tgz
# Extract and inspect it:
tar -xzf cinematic-renderer2d-0.1.0.tgz
ls -la package/
```

Verify that:
- ✅ `dist/` folder contains all built files
- ✅ `README.md` is included
- ✅ `LICENSE` is included
- ✅ No unnecessary files (node_modules, src, tests, etc.)

#### Step 3: Publish to NPM

For first-time publishing:
```bash
npm publish
```

For scoped packages (first time):
```bash
npm publish --access public
```

#### Step 4: Verify Publication
```bash
# Check on NPM
npm view cinematic-renderer2d

# Or visit
# https://www.npmjs.com/package/cinematic-renderer2d
```

### Option 2: Using Changesets (Recommended for Ongoing Releases)

This project is already configured with changesets!

#### Step 1: Create a Changeset
```bash
npm run changeset
```

Follow the prompts:
1. Select packages to include (press space to select, enter to confirm)
2. Choose version bump type (patch/minor/major)
3. Write a summary of changes

This creates a file in `.changeset/` directory.

#### Step 2: Version Packages
```bash
npm run version
```

This will:
- Update version in `package.json`
- Update CHANGELOG.md
- Delete changeset files

#### Step 3: Commit Changes
```bash
git add .
git commit -m "chore: release v0.1.0"
git push
```

#### Step 4: Publish
```bash
npm run release
```

This runs `changeset publish` which:
- Publishes to NPM
- Creates git tags
- Pushes tags to GitHub

## Post-Publishing Steps

### 1. Create GitHub Release

1. Go to your GitHub repository
2. Click "Releases" → "Create a new release"
3. Tag: `v0.1.0` (match your NPM version)
4. Title: `v0.1.0 - Initial Release`
5. Description: Copy from CHANGELOG.md
6. Publish release

### 2. Update Documentation Links

Update all documentation to use the correct NPM package name:
- README.md
- docs/GETTING_STARTED.md
- playground/getting-started.html

Replace installation commands with:
```bash
npm install cinematic-renderer2d
# or your actual package name
```

### 3. Test Installation

In a separate directory:
```bash
mkdir test-install
cd test-install
npm init -y
npm install cinematic-renderer2d

# Test import
node -e "console.log(require('cinematic-renderer2d'))"
```

### 4. Add NPM Badge to README

Add to the top of README.md:
```markdown
[![npm version](https://badge.fury.io/js/cinematic-renderer2d.svg)](https://www.npmjs.com/package/cinematic-renderer2d)
[![npm downloads](https://img.shields.io/npm/dm/cinematic-renderer2d.svg)](https://www.npmjs.com/package/cinematic-renderer2d)
```

## Updating the Package

### For Bug Fixes (Patch Release)

```bash
# Make your fixes
git add .
git commit -m "fix: description of fix"

# Create changeset
npm run changeset
# Select "patch"

# Version and publish
npm run version
git add .
git commit -m "chore: release v0.1.1"
npm run release
```

### For New Features (Minor Release)

```bash
# Add your feature
git add .
git commit -m "feat: description of feature"

# Create changeset
npm run changeset
# Select "minor"

# Version and publish
npm run version
git add .
git commit -m "chore: release v0.2.0"
npm run release
```

### For Breaking Changes (Major Release)

```bash
# Make breaking changes
git add .
git commit -m "feat!: description of breaking change"

# Create changeset
npm run changeset
# Select "major"

# Version and publish
npm run version
git add .
git commit -m "chore: release v1.0.0"
npm run release
```

## Troubleshooting

### Error: Package name already exists

**Solution**: Choose a different name or use a scoped package:
```json
{
  "name": "@rvshekhar10/cinematic-renderer2d"
}
```

### Error: You must be logged in to publish

**Solution**: 
```bash
npm logout
npm login
```

### Error: 402 Payment Required

**Solution**: Scoped packages require a paid account unless published as public:
```bash
npm publish --access public
```

### Error: Missing files in published package

**Solution**: Check `.npmignore` or `files` field in `package.json`:
```json
{
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ]
}
```

### Build fails before publishing

**Solution**: Run the prepublish script manually:
```bash
npm run clean
npm run typecheck
npm run test:run
npm run build
```

## NPM Scripts Reference

```bash
# Development
npm run dev              # Start playground dev server
npm run build            # Build library
npm run build:check      # Build and validate

# Testing
npm run test             # Run tests in watch mode
npm run test:run         # Run tests once
npm run test:coverage    # Run with coverage
npm run typecheck        # Type checking

# Publishing
npm run changeset        # Create a changeset
npm run version          # Update versions
npm run release          # Publish to NPM

# Maintenance
npm run clean            # Clean dist folder
npm run lint             # Lint code
npm run lint:fix         # Fix linting issues
```

## Best Practices

### 1. Semantic Versioning
- **Patch** (0.1.0 → 0.1.1): Bug fixes
- **Minor** (0.1.0 → 0.2.0): New features (backward compatible)
- **Major** (0.1.0 → 1.0.0): Breaking changes

### 2. Always Test Before Publishing
```bash
npm run typecheck && npm run test:run && npm run build:check
```

### 3. Keep CHANGELOG Updated
Document all changes in CHANGELOG.md (changesets does this automatically)

### 4. Tag Releases in Git
```bash
git tag v0.1.0
git push --tags
```

### 5. Use .npmignore or files field
Ensure only necessary files are published:
```
# .npmignore
src/
tests/
*.test.ts
.vscode/
.git/
node_modules/
```

Or use `files` in package.json (recommended):
```json
{
  "files": ["dist", "README.md", "LICENSE"]
}
```

## Security

### 1. Enable 2FA on NPM
```bash
npm profile enable-2fa auth-and-writes
```

### 2. Use NPM Tokens for CI/CD
- Go to npmjs.com → Account → Access Tokens
- Create an "Automation" token
- Add to GitHub Secrets as `NPM_TOKEN`

### 3. Audit Dependencies
```bash
npm audit
npm audit fix
```

## Continuous Integration

### GitHub Actions for Auto-Publishing

Create `.github/workflows/publish.yml`:

```yaml
name: Publish to NPM

on:
  push:
    branches:
      - main

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      
      - run: npm ci
      - run: npm run typecheck
      - run: npm run test:run
      - run: npm run build
      
      - name: Publish to NPM
        run: npm run release
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Quick Reference

### First-Time Publishing
```bash
# 1. Login
npm login

# 2. Build and test
npm run typecheck && npm run test:run && npm run build:check

# 3. Publish
npm publish

# 4. Verify
npm view cinematic-renderer2d
```

### Subsequent Releases
```bash
# 1. Make changes and commit
git add .
git commit -m "feat: new feature"

# 2. Create changeset
npm run changeset

# 3. Version and publish
npm run version
git add .
git commit -m "chore: release"
npm run release
```

## Support

- NPM Documentation: https://docs.npmjs.com/
- Changesets Documentation: https://github.com/changesets/changesets
- Semantic Versioning: https://semver.org/

---

**Ready to publish?** Follow the checklist above and run `npm publish`!
