# 🔧 Hostinger Entry File Fix

## The Issue

Hostinger's Entry file setting was pointing to `./dist/index.cjs` (library file) instead of the server file.

## ✅ Solution Applied

I've created `app.js` - a CommonJS-compatible server file specifically for Hostinger.

---

## 📝 Update Hostinger Settings

### Go to Hostinger Settings

1. Log into **Hostinger hPanel**
2. Go to your GitHub deployment settings
3. Find **"Build and output settings"**

### Change Entry File

**Change from**: `./dist/index.cjs`

**Change to**: `app.js`

### Save and Redeploy

1. Click **"Save and redeploy"**
2. Wait 2-3 minutes
3. Visit your site

---

## 📊 What Changed

### Files Created

1. **`app.js`** - CommonJS server (Hostinger-compatible)
   - Same functionality as `server.js`
   - Uses `require()` instead of `import`
   - Works with Hostinger's Node.js environment

### Package.json Updated

```json
{
  "scripts": {
    "start": "node app.js"  // Now uses app.js
  }
}
```

---

## 🎯 Complete Hostinger Settings

After the change, your settings should be:

### Build Configuration
- **Framework preset**: Express
- **Branch**: main
- **Node version**: 22.x
- **Root directory**: /

### Build and Output Settings
- **Entry file**: `app.js` ⭐ **CHANGE THIS**
- **Package manager**: npm

---

## 🔍 Why This Works

### Before (Broken)
```
Entry file: ./dist/index.cjs
↓
Tries to run library file
↓
❌ 503 Error (not a server!)
```

### After (Fixed)
```
Entry file: app.js
↓
Runs Express server
↓
Serves dist-playground/
↓
✅ Site works!
```

---

## 🚀 Deployment Steps

1. **Update Entry file** in Hostinger to `app.js`
2. **Click "Save and redeploy"**
3. **Wait 2-3 minutes** for deployment
4. **Visit**: https://cinematicrenderer2d.purpuldigital.com
5. **Success!** 🎉

---

## 🐛 If Still Not Working

### Check 1: Verify Files Exist

The deployment log should show:
```
✓ dist-playground/ created
✓ app.js exists
✓ server.js exists
```

### Check 2: View Hostinger Logs

In Hostinger hPanel:
1. Go to deployment logs
2. Look for:
   ```
   🎬 cinematicRenderer2D Playground Server
   ✅ Server is running!
   ```

### Check 3: Test Health Endpoint

Visit: https://cinematicrenderer2d.purpuldigital.com/health

Should return:
```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": 123,
  "environment": "production",
  "port": 3000
}
```

---

## 📚 File Reference

| File | Purpose | Used By |
|------|---------|---------|
| `app.js` | CommonJS server | Hostinger (Entry file) |
| `server.js` | ES Module server | Local development |
| `dist-playground/` | Built website | Both servers |

---

## ✅ Success Checklist

After updating Entry file to `app.js`:

- [ ] Changed Entry file in Hostinger settings
- [ ] Clicked "Save and redeploy"
- [ ] Waited for deployment to complete
- [ ] Site loads at https://cinematicrenderer2d.purpuldigital.com
- [ ] No 503 error
- [ ] Playground is interactive
- [ ] Examples load correctly

---

**Ready?** Change Entry file to `app.js` and redeploy! 🚀
