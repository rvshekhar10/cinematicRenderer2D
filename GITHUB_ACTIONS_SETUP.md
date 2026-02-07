# GitHub Actions Auto-Deploy Setup

Complete guide to set up automatic deployment to GoDaddy when you push to GitHub.

## Overview

Once configured, every time you push to the `main` branch:
1. GitHub Actions builds your playground
2. Creates deployment package
3. Uploads to your GoDaddy server
4. Extracts and installs dependencies
5. Restarts your application

**No manual deployment needed!** 🚀

## Prerequisites

- GitHub repository for your project
- GoDaddy server with SSH access
- PM2 installed on GoDaddy server

## Step 1: Generate SSH Key for GitHub Actions

On your **local machine**:

```bash
# Generate a new SSH key (don't use your personal key)
ssh-keygen -t ed25519 -C "github-actions@cinematicrenderer2d" -f ~/.ssh/github_actions_godaddy

# This creates two files:
# - github_actions_godaddy (private key)
# - github_actions_godaddy.pub (public key)
```

## Step 2: Add Public Key to GoDaddy Server

```bash
# Copy the public key
cat ~/.ssh/github_actions_godaddy.pub

# SSH into your GoDaddy server
ssh username@your-godaddy-server

# Add the public key to authorized_keys
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
exit
```

## Step 3: Test SSH Connection

```bash
# Test the connection with the new key
ssh -i ~/.ssh/github_actions_godaddy username@your-godaddy-server

# If it works, you're good to go!
```

## Step 4: Add Secrets to GitHub

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

Add these secrets:

### GODADDY_HOST
- **Name**: `GODADDY_HOST`
- **Value**: Your GoDaddy server address (e.g., `your-server.godaddy.com` or IP address)

### GODADDY_USERNAME
- **Name**: `GODADDY_USERNAME`
- **Value**: Your SSH username (e.g., `yourusername`)

### GODADDY_SSH_KEY
- **Name**: `GODADDY_SSH_KEY`
- **Value**: Your **private key** content

To get the private key:
```bash
cat ~/.ssh/github_actions_godaddy
```

Copy the **entire output** including:
```
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

### GODADDY_PORT
- **Name**: `GODADDY_PORT`
- **Value**: SSH port (usually `22`, but GoDaddy might use a different port)

## Step 5: Verify Secrets

Your GitHub secrets should look like:
- ✅ GODADDY_HOST
- ✅ GODADDY_USERNAME
- ✅ GODADDY_SSH_KEY
- ✅ GODADDY_PORT

## Step 6: Prepare GoDaddy Server

SSH into your GoDaddy server and set up the directory:

```bash
# Create app directory
mkdir -p ~/cinematicrenderer2d.purpuldigital.com
cd ~/cinematicrenderer2d.purpuldigital.com

# Install PM2 globally (if not installed)
npm install -g pm2

# Set up PM2 to start on boot
pm2 startup
# Follow the instructions shown
```

## Step 7: Push to GitHub

```bash
# Add all files
git add .

# Commit
git commit -m "Set up auto-deployment to GoDaddy"

# Push to main branch
git push origin main
```

## Step 8: Watch Deployment

1. Go to your GitHub repository
2. Click **Actions** tab
3. You'll see "Deploy to GoDaddy" workflow running
4. Click on it to see live logs

The deployment takes about 2-3 minutes.

## Workflow Triggers

The deployment runs automatically when:
- ✅ You push to `main` branch
- ✅ You manually trigger it from GitHub Actions UI

To manually trigger:
1. Go to **Actions** tab
2. Click "Deploy to GoDaddy"
3. Click "Run workflow"
4. Select branch and click "Run workflow"

## What Happens During Deployment

1. **Checkout code** - Gets latest code from GitHub
2. **Setup Node.js** - Installs Node.js 18
3. **Install dependencies** - Runs `npm ci`
4. **Build playground** - Runs `npm run build:playground`
5. **Create package** - Creates deployment tarball
6. **Upload to GoDaddy** - Transfers file via SCP
7. **Extract and install** - Unpacks and installs on server
8. **Restart app** - Restarts with PM2
9. **Verify** - Checks PM2 status

## Monitoring Deployments

### View Deployment Logs

1. Go to **Actions** tab in GitHub
2. Click on latest workflow run
3. Click on "Build and Deploy to GoDaddy"
4. Expand steps to see detailed logs

### Check Server Status

SSH into your server:
```bash
ssh username@your-godaddy-server

# Check PM2 status
pm2 status

# View logs
pm2 logs cinematicrenderer2d

# Monitor resources
pm2 monit
```

## Troubleshooting

### Deployment Fails at "Deploy to GoDaddy via SSH"

**Issue**: SSH connection failed

**Solutions**:
1. Verify `GODADDY_HOST` is correct
2. Verify `GODADDY_PORT` is correct (try 22 or 2222)
3. Check `GODADDY_SSH_KEY` includes full key with headers
4. Verify public key is in `~/.ssh/authorized_keys` on server

Test manually:
```bash
ssh -i ~/.ssh/github_actions_godaddy username@host -p port
```

### Deployment Fails at "Extract and restart"

**Issue**: PM2 not found or directory doesn't exist

**Solutions**:
1. SSH into server and install PM2: `npm install -g pm2`
2. Create directory: `mkdir -p ~/cinematicrenderer2d.purpuldigital.com`
3. Check path in workflow matches your server structure

### Deployment Succeeds but Site Doesn't Update

**Issue**: Old files cached or PM2 not restarting

**Solutions**:
```bash
# SSH into server
ssh username@your-godaddy-server

# Force restart
pm2 restart cinematicrenderer2d --update-env

# Or delete and restart
pm2 delete cinematicrenderer2d
pm2 start server.js --name cinematicrenderer2d
pm2 save
```

### "Permission Denied" Errors

**Issue**: File permissions

**Solutions**:
```bash
# On server
chmod -R 755 ~/cinematicrenderer2d.purpuldigital.com
```

## Customizing the Workflow

### Deploy to Different Branch

Edit `.github/workflows/deploy-godaddy.yml`:

```yaml
on:
  push:
    branches:
      - main
      - production  # Add more branches
```

### Add Deployment Notifications

Add Slack, Discord, or email notifications:

```yaml
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Run Tests Before Deploy

Add before the build step:

```yaml
- name: Run tests
  run: npm run test:run
```

## Security Best Practices

1. ✅ Use dedicated SSH key (not your personal key)
2. ✅ Store keys as GitHub Secrets (never commit)
3. ✅ Use SSH key authentication (not passwords)
4. ✅ Limit key permissions on server
5. ✅ Regularly rotate SSH keys
6. ✅ Monitor deployment logs

## Workflow File Location

The workflow file is at:
```
.github/workflows/deploy-godaddy.yml
```

You can edit it directly in GitHub:
1. Go to repository
2. Navigate to `.github/workflows/deploy-godaddy.yml`
3. Click edit (pencil icon)
4. Make changes and commit

## Testing the Setup

### First Deployment

1. Make a small change (e.g., update README)
2. Commit and push:
```bash
git add .
git commit -m "Test auto-deployment"
git push origin main
```
3. Watch Actions tab
4. Verify site updates at https://cinematicrenderer2d.purpuldigital.com

### Manual Test

1. Go to Actions tab
2. Click "Deploy to GoDaddy"
3. Click "Run workflow"
4. Select `main` branch
5. Click "Run workflow"

## Deployment Status Badge

Add to your README.md:

```markdown
[![Deploy to GoDaddy](https://github.com/rvshekhar10/cinematicRenderer2D/actions/workflows/deploy-godaddy.yml/badge.svg)](https://github.com/rvshekhar10/cinematicRenderer2D/actions/workflows/deploy-godaddy.yml)
```

## Quick Reference

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions_godaddy

# Copy public key to server
ssh-copy-id -i ~/.ssh/github_actions_godaddy.pub username@server

# Test connection
ssh -i ~/.ssh/github_actions_godaddy username@server

# View private key (for GitHub secret)
cat ~/.ssh/github_actions_godaddy

# Check deployment on server
ssh username@server
pm2 status
pm2 logs cinematicrenderer2d
```

## Support

- GitHub Actions Docs: https://docs.github.com/en/actions
- SSH Action: https://github.com/appleboy/ssh-action
- SCP Action: https://github.com/appleboy/scp-action

---

**Ready?** Follow the steps above and your deployments will be automatic! 🚀

Every push to `main` → Automatic deployment to GoDaddy!
