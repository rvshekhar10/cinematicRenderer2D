#!/bin/bash

# CinematicRenderer2D Playground - Hostinger Deployment Script
# This script prepares and packages the playground for Hostinger deployment

set -e  # Exit on error

echo "🚀 CinematicRenderer2D Playground - Hostinger Deployment"
echo "========================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Clean previous build
echo -e "${BLUE}Step 1: Cleaning previous build...${NC}"
if [ -d "dist-playground" ]; then
    rm -rf dist-playground
    echo -e "${GREEN}✓ Cleaned dist-playground${NC}"
fi

# Step 2: Build playground
echo -e "${BLUE}Step 2: Building playground...${NC}"
npm run build:playground
echo -e "${GREEN}✓ Playground built successfully${NC}"

# Step 3: Copy assets
echo -e "${BLUE}Step 3: Copying assets...${NC}"
cp -r public/assets/audio dist-playground/assets/
cp -r public/assets/images dist-playground/assets/
cp -r public/assets/video dist-playground/assets/
cp public/assets/index.json dist-playground/assets/
echo -e "${GREEN}✓ Assets copied${NC}"

# Step 4: Copy documentation
echo -e "${BLUE}Step 4: Copying documentation...${NC}"
cp -r docs dist-playground/
echo -e "${GREEN}✓ Documentation copied${NC}"

# Step 5: Create .htaccess if it doesn't exist
echo -e "${BLUE}Step 5: Checking .htaccess...${NC}"
if [ ! -f "dist-playground/.htaccess" ]; then
    cat > dist-playground/.htaccess << 'EOF'
# Enable rewrite engine
RewriteEngine On

# Set default charset
AddDefaultCharset UTF-8

# Enable compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType video/mp4 "access plus 1 year"
  ExpiresByType audio/mpeg "access plus 1 year"
</IfModule>

# Prevent directory browsing
Options -Indexes

# Allow CORS for assets
<IfModule mod_headers.c>
  <FilesMatch "\.(ttf|ttc|otf|eot|woff|woff2|css|js|gif|png|jpe?g|svg|ico|webp|mp4|mp3)$">
    Header set Access-Control-Allow-Origin "*"
  </FilesMatch>
</IfModule>
EOF
    echo -e "${GREEN}✓ Created .htaccess${NC}"
else
    echo -e "${GREEN}✓ .htaccess already exists${NC}"
fi

# Step 6: Create deployment package
echo -e "${BLUE}Step 6: Creating deployment package...${NC}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PACKAGE_NAME="cinematicrenderer2d-playground-${TIMESTAMP}.zip"

cd dist-playground
zip -r "../${PACKAGE_NAME}" . -x "*.DS_Store" -x "__MACOSX/*"
cd ..

echo -e "${GREEN}✓ Created deployment package: ${PACKAGE_NAME}${NC}"

# Step 7: Verify package
echo -e "${BLUE}Step 7: Verifying package contents...${NC}"
unzip -l "${PACKAGE_NAME}" | head -20
echo ""
PACKAGE_SIZE=$(du -h "${PACKAGE_NAME}" | cut -f1)
echo -e "${GREEN}✓ Package size: ${PACKAGE_SIZE}${NC}"

# Step 8: Summary
echo ""
echo -e "${GREEN}========================================================"
echo "✅ Deployment package ready!"
echo "========================================================${NC}"
echo ""
echo -e "${YELLOW}Package: ${PACKAGE_NAME}${NC}"
echo -e "${YELLOW}Location: $(pwd)/${PACKAGE_NAME}${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Log in to Hostinger control panel (hPanel)"
echo "2. Go to File Manager"
echo "3. Navigate to public_html directory"
echo "4. Upload and extract ${PACKAGE_NAME}"
echo "5. Visit your domain to verify deployment"
echo ""
echo -e "${BLUE}Or use FTP:${NC}"
echo "1. Connect to your Hostinger FTP"
echo "2. Navigate to public_html"
echo "3. Upload contents of dist-playground/ folder"
echo ""
echo -e "${GREEN}📖 See HOSTINGER_DEPLOYMENT_GUIDE.md for detailed instructions${NC}"
echo ""
