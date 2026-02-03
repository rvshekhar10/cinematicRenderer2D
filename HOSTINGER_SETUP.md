# 🚀 Hostinger Deployment Guide

Complete guide to deploy cinematicRenderer2D playground to Hostinger.

## 🔴 Fix Your Current 503 Error

Your deployment built the **library** instead of the **playground**. Here's how to fix it:

### Quick Fix (5 minutes)

1. **SSH into your Hostinger server**:
   ```bash
   ssh u690876613@your-hostinger-server
   ```

2. **Navigate to your app directory**:
   ```bash
   cd ~/domains/cinematicrenderer2d.purpuldigital.com/public_html
   ```

3. **Build the playground** (not the library):
   ```bash
   npm run build:playground
   ```

4. **Check if dist-playground exists**:
   ```bash
   ls -la dist-playground/
   ```

5. **Restart the application**:
   ```bash
   mkdir -p tmp
   touch tmp/restart.txt
   ```

6. **Visit your site**: https://cinematicrenderer2d.purpuldigital.com

---

## 📋 Understanding the Issue

Hostinger's auto-deploy ran `npm run build` which builds the **NPM library**, not the **playground website**.

**What you need**:
- `npm run build:playground` → Creates `dist-playground/` folder
- This folder contains the actual website files

**What happened**:
- `npm run build` → Created `dist/` folder (library files)
- No website to serve → 503 error

---

## 🎯 Proper Hostinger Setup

### Option 1: Manual Deployment (Recommended for First Time)

#### Step 1: Build Locally

```bash
# On your local machine
cd /path/to/cinematicRenderer2D

# Install dependencies
npm install

# Build the playground
npm run build:playground

# Verify build
ls -la dist-playground/
```

#### Step 2: Deploy to Hostinger

```bash
# Use the deployment script
./hostinger-deploy.sh ssh.hostinger.com u690876613
```

Or manually:

```bash
# Create deployment package
tar -czf hostinger-deploy.tar.gz dist-playground/ server.js .htaccess package.json

# Upload to Hostinger
scp hostinger-deploy.tar.gz u690876613@ssh.hostinger.com:~/

# SSH and extract
ssh u690876613@ssh.hostinger.com
cd ~/domains/cinematicrenderer2d.purpuldigital.com/public_html
tar -xzf ~/hostinger-deploy.tar.gz
npm install --production
mkdir -p tmp && touch tmp/restart.txt
```

#### Step 3: Configure Hostinger Control Panel

1. Log into **Hostinger hPanel**
2. Go to **Advanced** → **Node.js**
3. Click on your domain: `cinematicrenderer2d.purpuldigital.com`
4. Configure:
   - **Application Mode**: Production
   - **Application Root**: `/home/u690876613/domains/cinematicrenderer2d.purpuldigital.com/public_html`
   - **Application Startup File**: `server.js`
   - **Node.js Version**: 18.x or higher
5. Click **Update** and **Restart**

### Option 2: GitHub Actions Auto-Deploy

#### Step 1: Generate SSH Key

```bash
# On your local machine
ssh-keygen -t ed25519 -C "github-actions-hostinger" -f ~/.ssh/github_actions_hostinger
```

#### Step 2: Add Public Key to Hostinger

```bash
# Copy public key
cat ~/.ssh/github_actions_hostinger.pub

# SSH into Hostinger
ssh u690876613@ssh.hostinger.com

# Add to authorized_keys
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
exit
```

#### Step 3: Add GitHub Secrets

Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**

Add these secrets:

- **HOSTINGER_HOST**: `ssh.hostinger.com` (or your specific SSH host)
- **HOSTINGER_USERNAME**: `u690876613`
- **HOSTINGER_SSH_KEY**: Content of `~/.ssh/github_actions_hostinger` (private key)
- **HOSTINGER_PORT**: `22` (or your SSH port)

#### Step 4: Enable Workflow

The workflow file is already created at `.github/workflows/deploy-hostinger.yml`

Push to GitHub:
```bash
git add .
git commit -m "Set up Hostinger auto-deployment"
git push origin main
```

---

## 🔧 Hostinger-Specific Configuration

### .htaccess File

The `.htaccess` file is already created and configures:
- Node.js application routing
- HTTPS redirect
- Compression
- Cache control
- Security headers

### server.js

Your Express server is already configured for Hostinger:
- Serves from `dist-playground/`
- Handles SPA routing
- Uses `process.env.PORT` (Hostinger assigns this)

### File Structure on Hostinger

```
/home/u690876613/domains/cinematicrenderer2d.purpuldigital.com/public_html/
├── dist-playground/          # Built playground files
│   ├── index.html
│   ├── getting-started.html
│   ├── assets/
│   └── examples/
├── server.js                 # Express server
├── .htaccess                 # Apache/Passenger config
├── package.json              # Production dependencies
├── node_modules/             # Installed dependencies
└── tmp/
    └── restart.txt           # Touch to restart app
```

---

## 🐛 Troubleshooting

### 503 Service Unavailable

**Cause**: Application not running or wrong build

**Fix**:
```bash
ssh u690876613@ssh.hostinger.com
cd ~/domains/cinematicrenderer2d.purpuldigital.com/public_html

# Check if dist-playground exists
ls -la dist-playground/

# If not, build it
npm run build:playground

# Restart app
mkdir -p tmp && touch tmp/restart.txt
```

### Application Won't Start

**Cause**: Missing dependencies or wrong Node.js version

**Fix**:
```bash
# Install dependencies
npm install --production

# Check Node.js version (should be 16+)
node --version

# Restart
touch tmp/restart.txt
```

### Port Already in Use

**Cause**: Hostinger manages ports automatically

**Fix**: Don't specify a port in server.js. Use `process.env.PORT` (already configured)

### Files Not Updating

**Cause**: Passenger cache

**Fix**:
```bash
# Restart application
touch tmp/restart.txt

# Or restart from hPanel
# Go to Node.js section → Click Restart
```

### Permission Errors

**Fix**:
```bash
chmod -R 755 ~/domains/cinematicrenderer2d.purpuldigital.com/public_html
chmod 644 ~/domains/cinematicrenderer2d.purpuldigital.com/public_html/.htaccess
```

---

## 📊 Monitoring Your Application

### Check Application Status

**Via SSH**:
```bash
ssh u690876613@ssh.hostinger.com
cd ~/domains/cinematicrenderer2d.purpuldigital.com/public_html

# Check if files exist
ls -la dist-playground/

# Check Node.js process
ps aux | grep node

# View application logs
tail -f ~/domains/cinematicrenderer2d.purpuldigital.com/logs/error.log
```

**Via hPanel**:
1. Go to **Advanced** → **Node.js**
2. Click on your domain
3. View status and logs

### Test Endpoints

```bash
# Health check
curl https://cinematicrenderer2d.purpuldigital.com/health

# Main page
curl -I https://cinematicrenderer2d.purpuldigital.com/

# Examples API
curl https://cinematicrenderer2d.purpuldigital.com/api/examples
```

---

## 🔄 Updating Your Site

### Manual Update

```bash
# Local machine
npm run build:playground
./hostinger-deploy.sh ssh.hostinger.com u690876613
```

### Auto-Deploy (GitHub Actions)

```bash
# Just push to main branch
git add .
git commit -m "Update playground"
git push origin main

# GitHub Actions will automatically deploy
```

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Site loads at https://cinematicrenderer2d.purpuldigital.com
- [ ] HTTPS works (no certificate errors)
- [ ] Playground interface appears
- [ ] Examples load correctly
- [ ] "Use This in Your Project" button works
- [ ] Getting started page loads
- [ ] No console errors in browser
- [ ] Health check responds: `/health`

---

## 🆘 Quick Commands Reference

```bash
# SSH into Hostinger
ssh u690876613@ssh.hostinger.com

# Navigate to app
cd ~/domains/cinematicrenderer2d.purpuldigital.com/public_html

# Build playground
npm run build:playground

# Install dependencies
npm install --production

# Restart application
mkdir -p tmp && touch tmp/restart.txt

# Check files
ls -la dist-playground/

# View logs
tail -f ~/domains/cinematicrenderer2d.purpuldigital.com/logs/error.log

# Check Node.js version
node --version

# Test locally
curl http://localhost:$PORT/health
```

---

## 📚 Additional Resources

- **Hostinger Node.js Docs**: https://support.hostinger.com/en/articles/5617851-how-to-deploy-node-js-application
- **Passenger Docs**: https://www.phusionpassenger.com/docs/
- **Express.js Docs**: https://expressjs.com/

---

## 🎉 Success!

Once deployed, your playground will be live at:
**https://cinematicrenderer2d.purpuldigital.com**

The playground serves as your landing page, showcasing the library's capabilities!

---

**Need help?** Check the troubleshooting section or contact Hostinger support.
