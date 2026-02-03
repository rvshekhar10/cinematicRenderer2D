# 🚀 GoDaddy Deployment - Quick Start

Deploy your playground to cinematicrenderer2d.purpuldigital.com in 10 minutes.

## Prerequisites

- GoDaddy hosting with Node.js support
- SSH access to your server
- Domain configured: cinematicrenderer2d.purpuldigital.com

## Quick Deploy (10 Minutes)

### Step 1: Install Dependencies (Local)

```bash
npm install
```

### Step 2: Create Deployment Package

```bash
./create-deploy-package.sh
```

This creates `cinematicrenderer2d-deploy.tar.gz` (~150KB)

### Step 3: Upload to GoDaddy

```bash
# Replace with your actual server details
scp cinematicrenderer2d-deploy.tar.gz username@your-server.godaddy.com:/home/username/
```

### Step 4: SSH into Server

```bash
ssh username@your-server.godaddy.com
```

### Step 5: Extract and Setup

```bash
# Create app directory (if it doesn't exist)
mkdir -p ~/cinematicrenderer2d.purpuldigital.com
cd ~/cinematicrenderer2d.purpuldigital.com

# Extract files
tar -xzf ~/cinematicrenderer2d-deploy.tar.gz

# Install dependencies
npm install --production
```

### Step 6: Start the Server

#### Option A: Using PM2 (Recommended)

```bash
# Install PM2 globally (if not installed)
npm install -g pm2

# Start your app
pm2 start server.js --name cinematicrenderer2d

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
```

#### Option B: Using GoDaddy cPanel

1. Log into GoDaddy cPanel
2. Go to "Software" → "Setup Node.js App"
3. Click "Create Application"
4. Configure:
   - **Application root**: `/home/username/cinematicrenderer2d.purpuldigital.com`
   - **Application URL**: `cinematicrenderer2d.purpuldigital.com`
   - **Application startup file**: `server.js`
5. Click "Create" and "Start"

### Step 7: Configure Domain (If Not Done)

1. In GoDaddy cPanel, go to "Domains"
2. Add subdomain: `cinematicrenderer2d`
3. Point to: `/home/username/cinematicrenderer2d.purpuldigital.com`
4. Enable SSL (Let's Encrypt - free)

### Step 8: Verify

Visit: https://cinematicrenderer2d.purpuldigital.com

Check:
- ✅ Playground loads
- ✅ HTTPS works
- ✅ Examples load
- ✅ Controls work

## Automated Deployment

For future updates, use the automated script:

```bash
./deploy.sh your-server.godaddy.com username
```

This will:
1. Build the playground
2. Create deployment package
3. Upload to server
4. Extract and install
5. Restart the application

## Troubleshooting

### Server Won't Start

Check logs:
```bash
pm2 logs cinematicrenderer2d
```

### Port Issues

GoDaddy assigns ports automatically. The server uses `process.env.PORT`.

### Permission Issues

```bash
chmod -R 755 ~/cinematicrenderer2d.purpuldigital.com
```

### Can't Access Site

1. Check if app is running: `pm2 status`
2. Check domain configuration in cPanel
3. Verify SSL certificate is active
4. Check firewall settings

## Useful Commands

```bash
# Check status
pm2 status

# View logs
pm2 logs cinematicrenderer2d

# Restart app
pm2 restart cinematicrenderer2d

# Stop app
pm2 stop cinematicrenderer2d

# Monitor resources
pm2 monit
```

## File Structure on Server

```
/home/username/cinematicrenderer2d.purpuldigital.com/
├── dist-playground/
│   ├── index.html
│   ├── getting-started.html
│   ├── assets/
│   └── examples/
├── server.js
├── package.json
└── node_modules/
```

## Updating Your Site

When you make changes:

```bash
# Local machine
./deploy.sh your-server.godaddy.com username
```

Or manually:

```bash
# 1. Create package
./create-deploy-package.sh

# 2. Upload
scp cinematicrenderer2d-deploy.tar.gz username@server:/home/username/

# 3. SSH and extract
ssh username@server
cd ~/cinematicrenderer2d.purpuldigital.com
tar -xzf ~/cinematicrenderer2d-deploy.tar.gz

# 4. Restart
pm2 restart cinematicrenderer2d
```

## Support

- Full guide: [GODADDY_DEPLOYMENT.md](./GODADDY_DEPLOYMENT.md)
- GoDaddy Support: https://www.godaddy.com/help
- PM2 Docs: https://pm2.keymetrics.io/

---

**Ready?** Run `./create-deploy-package.sh` to start! 🚀
