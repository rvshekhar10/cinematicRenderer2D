# 🔴 Fix Your 503 Error - Quick Guide

Your Hostinger deployment built the **library** instead of the **playground**. Here's the 5-minute fix:

## The Problem

Your build log shows:
```
> cinematic-renderer2d@0.1.0 build
> tsup
```

This built the **NPM library** (`dist/` folder), not the **playground website** (`dist-playground/` folder).

## The Solution

### Step 1: SSH into Hostinger

```bash
ssh u690876613@ssh.hostinger.com
```

### Step 2: Navigate to Your App

```bash
cd ~/domains/cinematicrenderer2d.purpuldigital.com/public_html
```

### Step 3: Build the Playground

```bash
npm run build:playground
```

This will create the `dist-playground/` folder with your website files.

### Step 4: Verify the Build

```bash
ls -la dist-playground/
```

You should see:
- `index.html`
- `getting-started.html`
- `assets/` folder
- `examples/` folder

### Step 5: Restart the Application

```bash
mkdir -p tmp
touch tmp/restart.txt
```

### Step 6: Test Your Site

Visit: https://cinematicrenderer2d.purpuldigital.com

You should see the playground interface!

---

## If It Still Doesn't Work

### Check 1: Verify Files Exist

```bash
cd ~/domains/cinematicrenderer2d.purpuldigital.com/public_html
ls -la
```

You should see:
- `dist-playground/` folder ✅
- `server.js` file ✅
- `package.json` file ✅
- `node_modules/` folder ✅

### Check 2: Install Dependencies

```bash
npm install --production
```

### Check 3: Check Node.js Configuration

1. Log into **Hostinger hPanel**
2. Go to **Advanced** → **Node.js**
3. Find your domain: `cinematicrenderer2d.purpuldigital.com`
4. Verify settings:
   - **Application Root**: `/home/u690876613/domains/cinematicrenderer2d.purpuldigital.com/public_html`
   - **Application Startup File**: `server.js`
   - **Node.js Version**: 18.x or higher
5. Click **Restart Application**

### Check 4: View Logs

```bash
# Check error logs
tail -50 ~/domains/cinematicrenderer2d.purpuldigital.com/logs/error.log

# Check if Node.js is running
ps aux | grep node
```

### Check 5: Test Server Locally

```bash
cd ~/domains/cinematicrenderer2d.purpuldigital.com/public_html

# Check if server.js exists
cat server.js | head -20

# Test if port is assigned
echo $PORT
```

---

## Understanding the Build Commands

### ❌ Wrong Command (What Hostinger Did)
```bash
npm run build
```
- Builds the **NPM library** for publishing
- Creates `dist/` folder
- Not a website - just library files

### ✅ Correct Command (What You Need)
```bash
npm run build:playground
```
- Builds the **playground website**
- Creates `dist-playground/` folder
- Contains HTML, CSS, JS for the website

---

## Prevent This in the Future

### Option 1: Update Hostinger Build Command

In Hostinger hPanel:
1. Go to **Git** → **Manage**
2. Find your repository
3. Change **Build Command** to: `npm run build:playground`
4. Save

### Option 2: Use GitHub Actions

Set up auto-deployment with GitHub Actions (see `HOSTINGER_SETUP.md`):
- Builds correctly every time
- Deploys automatically on push
- No manual intervention needed

---

## Quick Test

After fixing, test these URLs:

1. **Main page**: https://cinematicrenderer2d.purpuldigital.com
   - Should show playground interface

2. **Health check**: https://cinematicrenderer2d.purpuldigital.com/health
   - Should return JSON: `{"status":"ok",...}`

3. **Examples API**: https://cinematicrenderer2d.purpuldigital.com/api/examples
   - Should return list of examples

4. **Getting started**: https://cinematicrenderer2d.purpuldigital.com/getting-started.html
   - Should show getting started guide

---

## Still Having Issues?

### Contact Hostinger Support

Provide them with:
- Domain: `cinematicrenderer2d.purpuldigital.com`
- Issue: "Node.js application showing 503 error"
- What you've tried: "Built playground with `npm run build:playground`, restarted application"

### Check Full Guide

See `HOSTINGER_SETUP.md` for complete deployment instructions.

---

**TL;DR**: Run `npm run build:playground` on your Hostinger server, then `touch tmp/restart.txt` to restart the app.
