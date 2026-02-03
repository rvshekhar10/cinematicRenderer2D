# Deploying to GoDaddy Node.js Server

Complete guide for deploying the playground to cinematicrenderer2d.purpuldigital.com on GoDaddy.

## Overview

We'll deploy the playground as a static site served by a simple Node.js/Express server on GoDaddy.

## Prerequisites

- GoDaddy hosting account with Node.js support
- SSH access to your server
- Domain: cinematicrenderer2d.purpuldigital.com configured

## Step 1: Build the Playground

On your local machine:

```bash
# Build the playground
npm run build:playground

# This creates the dist-playground folder with:
# - index.html
# - getting-started.html
# - assets/ (JS and CSS)
# - examples/ (JSON specs)
```

## Step 2: Create Server File

Create a simple Express server to serve the static files:

```bash
# This file is already created for you: server.js
```

The server will:
- Serve static files from dist-playground
- Handle SPA routing (all routes → index.html)
- Serve on port 3000 (or GoDaddy's assigned port)

## Step 3: Prepare for Upload

Create a deployment package:

```bash
# Create deployment folder
mkdir deploy-package
cp -r dist-playground deploy-package/
cp server.js deploy-package/
cp package.json deploy-package/
cp package-lock.json deploy-package/

# Create a tarball
cd deploy-package
tar -czf ../cinematicrenderer2d-deploy.tar.gz .
cd ..
```

## Step 4: Upload to GoDaddy

### Option A: Using SSH/SCP

```bash
# Upload the tarball
scp cinematicrenderer2d-deploy.tar.gz username@your-server-ip:/home/username/

# SSH into your server
ssh username@your-server-ip

# Extract files
cd /home/username/cinematicrenderer2d.purpuldigital.com
tar -xzf ~/cinematicrenderer2d-deploy.tar.gz

# Install dependencies (production only)
npm install --production
```

### Option B: Using FTP/SFTP

1. Connect to your GoDaddy server via FTP/SFTP
2. Navigate to your domain folder (usually `/home/username/cinematicrenderer2d.purpuldigital.com`)
3. Upload these files:
   - `dist-playground/` folder (entire folder)
   - `server.js`
   - `package.json`
   - `package-lock.json`
4. SSH into server and run `npm install --production`

### Option C: Using GoDaddy File Manager

1. Log into GoDaddy cPanel
2. Open File Manager
3. Navigate to your domain folder
4. Upload the files
5. Use Terminal in cPanel to run `npm install --production`

## Step 5: Configure GoDaddy

### Set Up Node.js Application

1. Log into GoDaddy cPanel
2. Go to "Software" → "Setup Node.js App"
3. Click "Create Application"
4. Configure:
   - **Node.js version**: 18.x or higher
   - **Application mode**: Production
   - **Application root**: `/home/username/cinematicrenderer2d.purpuldigital.com`
   - **Application URL**: `cinematicrenderer2d.purpuldigital.com`
   - **Application startup file**: `server.js`
   - **Environment variables**: (if needed)
     - `PORT`: (GoDaddy will assign this)
     - `NODE_ENV`: production

5. Click "Create"

### Configure Domain

1. In cPanel, go to "Domains"
2. Add subdomain: `cinematicrenderer2d.purpuldigital.com`
3. Point to your application folder
4. Enable SSL (Let's Encrypt is usually free)

## Step 6: Start the Application

### Using GoDaddy cPanel

1. Go to "Setup Node.js App"
2. Find your application
3. Click "Start" or "Restart"

### Using SSH

```bash
# SSH into your server
ssh username@your-server-ip

# Navigate to app directory
cd /home/username/cinematicrenderer2d.purpuldigital.com

# Start with PM2 (if available)
pm2 start server.js --name cinematicrenderer2d

# Or start with node
node server.js &

# Or use GoDaddy's node command
/opt/alt/alt-nodejs18/root/usr/bin/node server.js &
```

## Step 7: Verify Deployment

### Check if Server is Running

```bash
# On the server
curl http://localhost:3000

# Should return the HTML of your playground
```

### Check from Browser

Visit: https://cinematicrenderer2d.purpuldigital.com

Verify:
- ✅ Playground loads
- ✅ HTTPS works (padlock icon)
- ✅ Examples load
- ✅ Controls work
- ✅ "Use This in Your Project" button works

## Step 8: Set Up Process Manager (Recommended)

### Using PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start your app
pm2 start server.js --name cinematicrenderer2d

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup

# Check status
pm2 status

# View logs
pm2 logs cinematicrenderer2d
```

### PM2 Commands

```bash
# Restart app
pm2 restart cinematicrenderer2d

# Stop app
pm2 stop cinematicrenderer2d

# View logs
pm2 logs cinematicrenderer2d

# Monitor
pm2 monit
```

## Troubleshooting

### Port Issues

If GoDaddy assigns a specific port, update `server.js`:

```javascript
const PORT = process.env.PORT || 3000;
```

### Permission Issues

```bash
# Fix permissions
chmod -R 755 /home/username/cinematicrenderer2d.purpuldigital.com
chown -R username:username /home/username/cinematicrenderer2d.purpuldigital.com
```

### Application Won't Start

Check logs:
```bash
# GoDaddy logs location (varies)
tail -f /home/username/logs/cinematicrenderer2d.log

# Or PM2 logs
pm2 logs cinematicrenderer2d
```

### 502 Bad Gateway

- Check if Node.js app is running
- Verify port configuration
- Check GoDaddy proxy settings

### Static Files Not Loading

- Verify `dist-playground` folder uploaded correctly
- Check file permissions (755 for folders, 644 for files)
- Verify paths in `server.js`

## Updating Your Deployment

When you make changes:

```bash
# 1. Build locally
npm run build:playground

# 2. Create new tarball
cd deploy-package
tar -czf ../cinematicrenderer2d-deploy.tar.gz .

# 3. Upload to server
scp cinematicrenderer2d-deploy.tar.gz username@your-server-ip:/home/username/

# 4. SSH and extract
ssh username@your-server-ip
cd /home/username/cinematicrenderer2d.purpuldigital.com
tar -xzf ~/cinematicrenderer2d-deploy.tar.gz

# 5. Restart application
pm2 restart cinematicrenderer2d
# Or use GoDaddy cPanel to restart
```

## Automated Deployment Script

Create `deploy.sh` for easier updates:

```bash
#!/bin/bash
# This file is created for you: deploy.sh

# Run this script to deploy updates
./deploy.sh
```

## SSL Certificate

### Using Let's Encrypt (Free)

1. In GoDaddy cPanel, go to "Security" → "SSL/TLS"
2. Click "Manage SSL sites"
3. Select your domain
4. Choose "Let's Encrypt" certificate
5. Install

### Force HTTPS

The `server.js` file includes HTTPS redirect middleware.

## Performance Optimization

### Enable Gzip Compression

Already included in `server.js`:
```javascript
app.use(compression());
```

### Set Cache Headers

Already configured in `server.js` for static assets.

### Monitor Performance

```bash
# Check memory usage
pm2 monit

# Check server resources
top
htop
```

## Backup

### Backup Your Deployment

```bash
# On server
cd /home/username
tar -czf cinematicrenderer2d-backup-$(date +%Y%m%d).tar.gz cinematicrenderer2d.purpuldigital.com/

# Download backup
scp username@your-server-ip:/home/username/cinematicrenderer2d-backup-*.tar.gz ./
```

## GoDaddy-Specific Tips

1. **Node.js Version**: Use the version GoDaddy supports (usually 14.x, 16.x, or 18.x)
2. **File Paths**: Use absolute paths or paths relative to app root
3. **Environment Variables**: Set in cPanel Node.js App settings
4. **Logs**: Check GoDaddy's log directory for errors
5. **Restart**: Use cPanel interface or PM2 for restarts

## Quick Reference

```bash
# Build
npm run build:playground

# Create deployment package
./create-deploy-package.sh

# Upload
scp cinematicrenderer2d-deploy.tar.gz user@server:/path/

# Extract and install
ssh user@server
cd /path/to/app
tar -xzf ~/cinematicrenderer2d-deploy.tar.gz
npm install --production

# Start with PM2
pm2 start server.js --name cinematicrenderer2d
pm2 save

# Check status
pm2 status
pm2 logs cinematicrenderer2d
```

## Support

- GoDaddy Support: https://www.godaddy.com/help
- Node.js on GoDaddy: https://www.godaddy.com/help/nodejs
- PM2 Documentation: https://pm2.keymetrics.io/docs/usage/quick-start/

---

**Ready to deploy?** Follow the steps above and your playground will be live on GoDaddy! 🚀
