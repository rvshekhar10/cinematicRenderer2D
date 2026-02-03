# 🚀 Publish Your Package Now

You're almost there! Just need to enable 2FA and you can publish.

## Quick Steps

### 1. Enable 2FA (One Time Setup)

```bash
npm profile enable-2fa auth-and-writes
```

This will:
1. Show you a QR code
2. You scan it with Google Authenticator, Authy, or similar app
3. Enter the 6-digit code from the app
4. Save the recovery codes shown

**Takes 2 minutes!**

### 2. Publish

```bash
npm publish
```

When prompted, enter the 6-digit code from your authenticator app.

## That's It!

Your package will be live at:
- https://www.npmjs.com/package/cinematic-renderer2d
- `npm install cinematic-renderer2d`

## Need Help with 2FA?

See the complete guide: [ENABLE_2FA.md](./ENABLE_2FA.md)

## Quick 2FA Setup

**Don't have an authenticator app?**

Download one of these (free):
- **Authy** - https://authy.com/download/ (Recommended - has backup)
- **Google Authenticator** - Search in App Store/Play Store
- **Microsoft Authenticator** - Search in App Store/Play Store

Then run:
```bash
npm profile enable-2fa auth-and-writes
```

## After Publishing

1. ✅ Visit your package: https://www.npmjs.com/package/cinematic-renderer2d
2. ✅ Test install: `npm install cinematic-renderer2d`
3. ✅ Create GitHub release
4. ✅ Share on social media!

---

**You're one command away from publishing!** 🎉

```bash
npm profile enable-2fa auth-and-writes
```
