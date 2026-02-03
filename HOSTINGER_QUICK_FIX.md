# 🚨 QUICK FIX: 503 Error on Hostinger

## Your Issue
Hostinger built the **library** (`npm run build`) instead of the **playground** (`npm run build:playground`).

## 5-Minute Fix

### 1. SSH into Hostinger
```bash
ssh u690876613@ssh.hostinger.com
```

### 2. Go to Your App Directory
```bash
cd ~/domains/cinematicrenderer2d.purpuldigital.com/public_html
```

### 3. Build the Playground
```bash
npm run build:playground
```

### 4. Restart the App
```bash
mkdir -p tmp && touch tmp/restart.txt
```

### 5. Test
Visit: https://cinematicrenderer2d.purpuldigital.com

## Done! 🎉

Your playground should now be live!

---

## What Happened?

- **Wrong**: `npm run build` → Creates `dist/` (library files)
- **Right**: `npm run build:playground` → Creates `dist-playground/` (website files)

## Prevent This

Update Hostinger's build command:
1. Go to Hostinger hPanel
2. **Git** → **Manage**
3. Change build command to: `npm run build:playground`

Or use GitHub Actions (see `HOSTINGER_SETUP.md`)

---

**Need more help?** See `FIX_503_ERROR.md` for detailed troubleshooting.
