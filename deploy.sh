#!/bin/bash

# Quick deployment script for GoDaddy
# Usage: ./deploy.sh [server-address] [username]

# Configuration
SERVER=$1
USERNAME=$2
REMOTE_PATH="/home/$USERNAME/cinematicrenderer2d.purpuldigital.com"

if [ -z "$SERVER" ] || [ -z "$USERNAME" ]; then
    echo "Usage: ./deploy.sh [server-address] [username]"
    echo "Example: ./deploy.sh your-server.godaddy.com yourusername"
    exit 1
fi

echo "🚀 Deploying to GoDaddy..."
echo "Server: $SERVER"
echo "Username: $USERNAME"
echo "Remote path: $REMOTE_PATH"
echo ""

# Step 1: Create deployment package
echo "📦 Creating deployment package..."
./create-deploy-package.sh

if [ $? -ne 0 ]; then
    echo "❌ Failed to create deployment package!"
    exit 1
fi

echo ""

# Step 2: Upload to server
echo "📤 Uploading to server..."
scp cinematicrenderer2d-deploy.tar.gz $USERNAME@$SERVER:/home/$USERNAME/

if [ $? -ne 0 ]; then
    echo "❌ Upload failed!"
    exit 1
fi

echo "✅ Upload successful!"
echo ""

# Step 3: Extract and install on server
echo "📦 Extracting and installing on server..."
ssh $USERNAME@$SERVER << 'ENDSSH'
cd /home/$USERNAME/cinematicrenderer2d.purpuldigital.com
echo "Extracting files..."
tar -xzf ~/cinematicrenderer2d-deploy.tar.gz
echo "Installing dependencies..."
npm install --production
echo "Restarting application..."
pm2 restart cinematicrenderer2d || pm2 start server.js --name cinematicrenderer2d
pm2 save
echo "Deployment complete!"
ENDSSH

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed!"
    exit 1
fi

echo ""
echo "✅ Deployment successful!"
echo ""
echo "🌐 Your site should be live at:"
echo "   https://cinematicrenderer2d.purpuldigital.com"
echo ""
echo "📊 Check status:"
echo "   ssh $USERNAME@$SERVER"
echo "   pm2 status"
echo "   pm2 logs cinematicrenderer2d"
echo ""
