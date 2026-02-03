# 🚨 Hostinger 503 Error - Final Fix

## The Real Problem

Hostinger's Express preset is trying to start the server, but something is preventing it from running. The build works perfectly, but the server won't start.

## 🔍 Diagnosis

Your deployment log shows:
- ✅ Build completes successfully
- ✅ `dist-playground/` is created
- ✅ Files are in place
- ❌ Server doesn't start (503 error)

## 💡 Solution: Change Framework Preset

The issue is likely with the **Express preset**. Let's try a different approach.

### Option 1: Use "None" Preset with Custom Start Command

1. **Framework preset**: Change from "Express" to **"None"** or **"Other"**
2. **Entry file**: Keep as `app.js`
3. **Add Start Command** (if there's a field for it): `node app.js`

### Option 2: Add npm start Script

Hostinger might be looking for `npm start`. Let's verify it's correct:

```json
{
  "scripts": {
    "start": "node app.js"
  }
}
```

This is already in your package.json ✅

---

## 🔧 Alternative: Static Site Deployment

Since the playground is a static site (HTML/JS/CSS), we can serve it directly without Node.js!

### Change Hostinger Settings:

1. **Framework preset**: Change to **"Static Site"** or **"None"**
2. **Build command**: `npm run build:playground`
3. **Output directory**: `dist-playground`
4. **Entry file**: Leave empty or remove

This tells Hostinger to just serve the static files from `dist-playground/` without running a Node.js server.

---

## 🎯 Recommended Approach

### Try This First (Simplest):

**Change Framework Preset to "Static Site"**

Why? Your playground is actually a static site (Vite builds it to static HTML/JS/CSS). You don't need Node.js running - just serve the files!

1. Go to Hostinger settings
2. **Framework preset**: Change from "Express" to **"Static Site"** (or "Vite" if available)
3. **Build command**: Should auto-detect or set to `npm run build:playground`
4. **Output directory**: `dist-playground`
5. **Entry file**: Remove or leave empty
6. Click **"Save and redeploy"**

---

## 📊 Why This Works Better

### Current Setup (Not Working):
```
Build → dist-playground/ → Try to start Express server → ❌ 503
```

### Static Site Setup (Will Work):
```
Build → dist-playground/ → Serve static files → ✅ Works!
```

Your playground doesn't need a Node.js server running - it's all client-side JavaScript!

---

## 🔄 If Static Site Doesn't Work

### Manual Server Start (SSH Method):

1. **SSH into Hostinger**:
   ```bash
   ssh u690876613@your-hostinger-server
   ```

2. **Navigate to your app**:
   ```bash
   cd ~/domains/cinematicrenderer2d.purpuldigital.com/public_html
   ```

3. **Check if files exist**:
   ```bash
   ls -la
   ls -la dist-playground/
   ```

4. **Try starting the server manually**:
   ```bash
   node app.js
   ```

5. **Check for errors** - this will show you exactly what's wrong!

---

## 🐛 Common Issues

### Issue 1: Missing Dependencies

If you see "Cannot find module 'express'":
```bash
npm install --production
```

### Issue 2: Port Already in Use

Hostinger assigns ports automatically. Check if `process.env.PORT` is set:
```bash
echo $PORT
```

### Issue 3: Permission Issues

```bash
chmod +x app.js
chmod -R 755 .
```

---

## ✅ Quick Test

After changing to Static Site preset, test these URLs:

1. **Main page**: https://cinematicrenderer2d.purpuldigital.com
2. **Direct file**: https://cinematicrenderer2d.purpuldigital.com/index.html
3. **Assets**: https://cinematicrenderer2d.purpuldigital.com/assets/

If the direct file works but the main page doesn't, it's a routing issue.

---

## 🎯 Action Plan

### Step 1: Try Static Site Preset (Recommended)
- Change Framework preset to "Static Site"
- Set Output directory to `dist-playground`
- Remove Entry file
- Redeploy

### Step 2: If That Doesn't Work, SSH Debug
- SSH into server
- Check if files exist
- Try running `node app.js` manually
- Check error messages

### Step 3: Contact Hostinger Support
If neither works, contact Hostinger support with:
- "Node.js app showing 503 error"
- "Build completes successfully but server won't start"
- "Entry file: app.js"
- "Framework: Express"

---

**Try changing to Static Site preset first - it's the simplest solution!** 🚀
