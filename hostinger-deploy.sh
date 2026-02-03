#!/bin/bash

# Hostinger Deployment Script for cinematicRenderer2D
# This script builds and deploys the playground to Hostinger

set -e  # Exit on error

echo "🎬 cinematicRenderer2D - Hostinger Deployment"
echo "=============================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if server details are provided
if [ -z "$1" ] || [ -z "$2" ]; then
    echo -e "${RED}Usage: ./hostinger-deploy.sh <server> <username>${NC}"
    echo "Example: ./hostinger-deploy.sh ssh.hostinger.com u690876613"
    exit 1
fi

SERVER=$1
USERNAME=$2
REMOTE_PATH="/home/${USERNAME}/domains/cinematicrenderer2d.purpuldigital.com/public_html"

echo -e "${BLUE}📦 Step 1: Installing dependencies...${NC}"
npm install

echo -e "${BLUE}🔨 Step 2: Building playground...${NC}"
npm run build:playground

echo -e "${BLUE}📋 Step 3: Creating deployment package...${NC}"
rm -rf deploy-hostinger
mkdir -p deploy-hostinger

# Copy built playground
cp -r dist-playground deploy-hostinger/

# Copy server files
cp server.js deploy-hostinger/
cp .htaccess deploy-hostinger/

# Create production package.json
cat > deploy-hostinger/package.json << 'EOF'
{
  "name": "cinematic-renderer2d-server",
  "version": "1.0.0",
  "description": "Server for cinematicRenderer2D playground",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "compression": "^1.7.4"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
EOF

echo -e "${BLUE}📤 Step 4: Uploading to Hostinger...${NC}"
echo "Connecting to ${SERVER}..."

# Create tarball
cd deploy-hostinger
tar -czf ../hostinger-deploy.tar.gz .
cd ..

# Upload tarball
scp hostinger-deploy.tar.gz ${USERNAME}@${SERVER}:~/

echo -e "${BLUE}🚀 Step 5: Extracting and installing on server...${NC}"
ssh ${USERNAME}@${SERVER} << 'ENDSSH'
cd ~/domains/cinematicrenderer2d.purpuldigital.com/public_html

# Backup existing files (if any)
if [ -d "dist-playground" ]; then
    echo "Creating backup..."
    tar -czf ~/backup-$(date +%Y%m%d-%H%M%S).tar.gz .
fi

# Extract new files
echo "Extracting files..."
tar -xzf ~/hostinger-deploy.tar.gz

# Install dependencies
echo "Installing dependencies..."
npm install --production

# Clean up
rm ~/hostinger-deploy.tar.gz

echo "Deployment completed!"
ENDSSH

# Clean up local files
rm -rf deploy-hostinger
rm hostinger-deploy.tar.gz

echo -e "${GREEN}✅ Deployment successful!${NC}"
echo -e "${GREEN}🌐 Your site should be live at: https://cinematicrenderer2d.purpuldigital.com${NC}"
echo ""
echo "If you see a 503 error, you may need to:"
echo "1. Restart the Node.js app in Hostinger control panel"
echo "2. Check that Node.js is enabled for your domain"
echo "3. Verify the application root path is correct"
