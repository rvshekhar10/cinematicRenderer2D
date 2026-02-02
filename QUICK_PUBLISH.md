# Quick Publish Guide

The fastest way to publish cinematicRenderer2D to NPM.

## 🚀 First Time Publishing (5 Minutes)

### Step 1: Setup (One Time)
```bash
# Create NPM account at npmjs.com if you don't have one
# Then login:
npm login
```

### Step 2: Update Package Info
Edit `package.json` and replace:
- `"author": "Your Name"` → Your actual name
- `rvshekhar10` in URLs → Your GitHub username

### Step 3: Run Pre-Publish Check
```bash
npm run pre-publish-check
```

Fix any errors shown.

### Step 4: Publish!
```bash
npm publish
```

That's it! Your package is now on NPM 🎉

## 📦 Verify Publication

```bash
# Check it's published
npm view cinematic-renderer2d

# Test installation
mkdir test-install && cd test-install
npm init -y
npm install cinematic-renderer2d
```

Visit: https://www.npmjs.com/package/cinematic-renderer2d

## 🔄 Publishing Updates

### Quick Update (Bug Fix)
```bash
# 1. Make your changes
# 2. Run checks
npm run pre-publish-check

# 3. Update version
npm version patch  # 0.1.0 → 0.1.1

# 4. Publish
npm publish
```

### Using Changesets (Recommended)
```bash
# 1. Make your changes
# 2. Create changeset
npm run changeset

# 3. Version and publish
npm run version
npm run release
```

## 🛠️ Useful Commands

```bash
# Check if you're logged in
npm whoami

# Check package info
npm view cinematic-renderer2d

# Run all checks before publishing
npm run pre-publish-check

# Build and validate
npm run build:check

# See what will be published
npm pack
tar -xzf cinematic-renderer2d-*.tgz
ls -la package/
```

## ⚠️ Common Issues

### "Package name already taken"
**Solution**: Use a scoped package
```json
{
  "name": "@rvshekhar10/cinematic-renderer2d"
}
```
Then publish with:
```bash
npm publish --access public
```

### "You must be logged in"
**Solution**:
```bash
npm logout
npm login
```

### "Build failed"
**Solution**:
```bash
npm run clean
npm run build
```

## 📚 More Info

- **Full Guide**: See [PUBLISHING.md](./PUBLISHING.md)
- **Checklist**: See [PUBLISH_CHECKLIST.md](./PUBLISH_CHECKLIST.md)
- **NPM Docs**: https://docs.npmjs.com/

## 🎯 TL;DR

```bash
# First time
npm login
npm run pre-publish-check
npm publish

# Updates
npm run changeset
npm run version
npm run release
```

Done! 🚀
