# NPM Publishing Checklist

Quick checklist for publishing cinematicRenderer2D to NPM.

## Pre-Publishing ✅

- [ ] **NPM Account Created** - Sign up at [npmjs.com](https://www.npmjs.com/signup)
- [ ] **NPM Login** - Run `npm login` and verify with `npm whoami`
- [ ] **Package Name Available** - Run `npm search cinematic-renderer2d`
- [ ] **Update package.json** - Set correct author, repository, homepage URLs
- [ ] **Update GitHub URLs** - Replace `rvshekhar10` with actual username
- [ ] **All Tests Pass** - Run `npm run test:run`
- [ ] **Type Check Passes** - Run `npm run typecheck`
- [ ] **Build Succeeds** - Run `npm run build`
- [ ] **Build Validation** - Run `npm run build:check`
- [ ] **README Complete** - Installation instructions, examples, API docs
- [ ] **LICENSE File** - MIT license included
- [ ] **Version Set** - Correct version in package.json (e.g., 0.1.0)

## Publishing 🚀

### Quick Publish (First Time)
```bash
# 1. Final checks
npm run typecheck && npm run test:run && npm run build:check

# 2. Test package contents
npm pack
tar -xzf cinematic-renderer2d-0.1.0.tgz
ls -la package/

# 3. Publish
npm publish

# For scoped packages:
npm publish --access public
```

### Using Changesets (Recommended)
```bash
# 1. Create changeset
npm run changeset

# 2. Version packages
npm run version

# 3. Commit
git add .
git commit -m "chore: release v0.1.0"

# 4. Publish
npm run release
```

## Post-Publishing ✅

- [ ] **Verify on NPM** - Visit https://www.npmjs.com/package/cinematic-renderer2d
- [ ] **Test Installation** - `npm install cinematic-renderer2d` in a test project
- [ ] **Create GitHub Release** - Tag and release on GitHub
- [ ] **Update Documentation** - Ensure all docs reference correct package name
- [ ] **Add NPM Badges** - Add version and download badges to README
- [ ] **Announce Release** - Share on social media, forums, etc.

## Quick Commands

```bash
# Login to NPM
npm login

# Check login status
npm whoami

# Build and test
npm run build:check

# Publish
npm publish

# View published package
npm view cinematic-renderer2d

# Test installation
mkdir test && cd test
npm init -y
npm install cinematic-renderer2d
```

## Version Updates

### Patch (Bug Fixes) - 0.1.0 → 0.1.1
```bash
npm run changeset  # Select "patch"
npm run version
npm run release
```

### Minor (New Features) - 0.1.0 → 0.2.0
```bash
npm run changeset  # Select "minor"
npm run version
npm run release
```

### Major (Breaking Changes) - 0.1.0 → 1.0.0
```bash
npm run changeset  # Select "major"
npm run version
npm run release
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Package name taken | Use scoped package: `@username/package-name` |
| Not logged in | Run `npm logout` then `npm login` |
| 402 Payment Required | Add `--access public` for scoped packages |
| Missing files | Check `files` field in package.json |
| Build fails | Run `npm run clean && npm run build` |

## Security

- [ ] **Enable 2FA** - `npm profile enable-2fa auth-and-writes`
- [ ] **Audit Dependencies** - `npm audit && npm audit fix`
- [ ] **Review .npmignore** - Ensure no sensitive files included

## Resources

- 📚 [Full Publishing Guide](./PUBLISHING.md)
- 📦 [NPM Documentation](https://docs.npmjs.com/)
- 🔄 [Changesets Guide](https://github.com/changesets/changesets)
- 📊 [Semantic Versioning](https://semver.org/)

---

**First time?** Read the [complete publishing guide](./PUBLISHING.md) for detailed instructions.

**Ready to publish?** Run through this checklist and execute `npm publish`!
