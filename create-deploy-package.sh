#!/bin/bash

# Script to create deployment package for GoDaddy
# Run this before uploading to your server

echo "🎬 Creating deployment package for cinematicRenderer2D..."
echo ""

# Step 1: Build the playground
echo "📦 Building playground..."
npm run build:playground

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"
echo ""

# Step 2: Create deployment directory
echo "📁 Creating deployment package..."
rm -rf deploy-package
mkdir -p deploy-package

# Step 3: Copy necessary files
echo "📋 Copying files..."
cp -r dist-playground deploy-package/
cp server.js deploy-package/
cp package.json deploy-package/
cp package-lock.json deploy-package/

# Create a minimal package.json for production
cat > deploy-package/package.json << 'EOF'
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

echo "✅ Files copied!"
echo ""

# Step 4: Create tarball
echo "📦 Creating tarball..."
cd deploy-package
tar -czf ../cinematicrenderer2d-deploy.tar.gz .
cd ..

echo "✅ Tarball created: cinematicrenderer2d-deploy.tar.gz"
echo ""

# Step 5: Show package contents
echo "📊 Package contents:"
tar -tzf cinematicrenderer2d-deploy.tar.gz | head -20
echo "..."
echo ""

# Step 6: Show package size
SIZE=$(du -h cinematicrenderer2d-deploy.tar.gz | cut -f1)
echo "📏 Package size: $SIZE"
echo ""

# Step 7: Show next steps
echo "✅ Deployment package ready!"
echo ""
echo "📤 Next steps:"
echo "1. Upload to your GoDaddy server:"
echo "   scp cinematicrenderer2d-deploy.tar.gz username@your-server:/home/username/"
echo ""
echo "2. SSH into your server:"
echo "   ssh username@your-server"
echo ""
echo "3. Extract and install:"
echo "   cd /home/username/cinematicrenderer2d.purpuldigital.com"
echo "   tar -xzf ~/cinematicrenderer2d-deploy.tar.gz"
echo "   npm install --production"
echo ""
echo "4. Start the server:"
echo "   pm2 start server.js --name cinematicrenderer2d"
echo "   pm2 save"
echo ""
echo "See GODADDY_DEPLOYMENT.md for complete instructions."
echo ""
