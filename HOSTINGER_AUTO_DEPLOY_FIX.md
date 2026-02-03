# 🔧 Hostinger Auto-Deploy Fix

## The Problem

You're using **Hostinger's built-in GitHub deployment**, which automatically runs `npm run build` when you push to GitHub.

**Issue**: `npm run build` was building the **library** instead of the **playground**.

## ✅ The Solution (Already Applied!)

I've updated your `package.json` so that `npm run build` now builds the **playground**:

```json
{
  "scripts": {
    "build": "npm run build:playground",  // ✅ Now builds playground
    "build:lib": "tsup",                   // Library build moved here
    "build:playground": "vite build"       // Playground build
  }
}
```

## 🚀 What This Means

### Now When You Push to GitHub:

1. **Hostinger detects the push**
2. **Runs**: `npm install && npm run build`
3. **`npm run build`** → Runs `npm run build:playground`
4. **Creates**: `dist-playground/` folder with your website
5. **Server serves**: The playground from `dist-playground/`
6. **Result**: ✅ Your site works!

### For NPM Publishing:

When you publish to NPM, it runs:
```bash
npm run prepublishOnly
# Which runs: npm run build:lib
```

So the library still builds correctly for NPM!

---

## 🎯 Next Steps

### 1. Push These Changes to GitHub

```bash
git add .
git commit -m "Fix Hostinger auto-deployment - build playground instead of library"
git push origin main
```

### 2. Wait for Hostinger Deployment

- Hostinger will detect the push
- It will run `npm install && npm run build`
- This time it will build the **playground** correctly!
- Wait 2-3 minutes for deployment

### 3. Verify Your Site

Visit: https://cinematicrenderer2d.purpuldigital.com

You should see:
- ✅ Playground interface (not 503 error)
- ✅ Interactive controls
- ✅ Example specs
- ✅ "Use This in Your Project" button

---

## 📊 Build Commands Reference

| Command | What It Does | When to Use |
|---------|--------------|-------------|
| `npm run build` | Builds playground | Hostinger auto-deploy |
| `npm run build:lib` | Builds library | NPM publishing |
| `npm run build:playground` | Builds playground | Manual deployment |
| `npm run build:check` | Builds & validates library | Testing library |

---

## 🔍 How to Verify It's Working

### Check Hostinger Deployment Logs

1. Go to **Hostinger hPanel**
2. **Advanced** → **Git**
3. Click on your repository
4. View **Deployment Logs**

Look for:
```
✅ npm run build:playground
✅ dist-playground/ created
✅ Deployment successful
```

### Check Your Server

SSH into Hostinger:
```bash
ssh u690876613@ssh.hostinger.com
cd ~/domains/cinematicrenderer2d.purpuldigital.com/public_html

# Check if dist-playground exists
ls -la dist-playground/

# Should show:
# - index.html
# - getting-started.html
# - assets/
# - examples/
```

---

## 🐛 If It Still Doesn't Work

### Option 1: Manual Fix (One Time)

SSH into Hostinger and build manually:
```bash
ssh u690876613@ssh.hostinger.com
cd ~/domains/cinematicrenderer2d.purpuldigital.com/public_html
npm run build:playground
mkdir -p tmp && touch tmp/restart.txt
```

### Option 2: Check Hostinger Settings

1. Go to **Hostinger hPanel**
2. **Advanced** → **Git**
3. Verify:
   - ✅ Repository is connected
   - ✅ Branch is `main`
   - ✅ Auto-deploy is enabled
   - ✅ Build command is `npm run build` (or empty)

### Option 3: Trigger Manual Deployment

In Hostinger hPanel:
1. Go to **Git** section
2. Click **Deploy** or **Redeploy**
3. Wait for completion
4. Check your site

---

## 🎉 Success Indicators

Your deployment is working when:

1. ✅ Push to GitHub triggers Hostinger deployment
2. ✅ Deployment logs show `npm run build:playground`
3. ✅ `dist-playground/` folder is created
4. ✅ Site loads at https://cinematicrenderer2d.purpuldigital.com
5. ✅ No 503 errors
6. ✅ Playground is interactive

---

## 📝 What Changed

### Before (Broken)

```json
{
  "scripts": {
    "build": "tsup"  // ❌ Built library
  }
}
```

**Result**: Hostinger built library → No website → 503 error

### After (Fixed)

```json
{
  "scripts": {
    "build": "npm run build:playground",  // ✅ Builds playground
    "build:lib": "tsup"                    // Library moved here
  }
}
```

**Result**: Hostinger builds playground → Website exists → Site works! 🎉

---

## 🔄 Workflow Summary

### Hostinger Auto-Deploy (Website)

```
Push to GitHub
    ↓
Hostinger detects push
    ↓
Runs: npm install && npm run build
    ↓
npm run build → npm run build:playground
    ↓
Creates: dist-playground/
    ↓
Server serves playground
    ↓
✅ Site is live!
```

### NPM Publishing (Library)

```
npm publish
    ↓
Runs: prepublishOnly
    ↓
npm run build:lib
    ↓
Creates: dist/
    ↓
✅ Library published!
```

---

## 🚀 Ready to Deploy!

Just push these changes to GitHub:

```bash
git add .
git commit -m "Fix Hostinger deployment - build playground"
git push origin main
```

Hostinger will automatically deploy, and your site will be live! 🎬

---

**Questions?** Check `HOSTINGER_SETUP.md` for more details.
