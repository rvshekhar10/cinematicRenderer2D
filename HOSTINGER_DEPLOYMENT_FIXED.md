# Hostinger Deployment Guide - Fixed for v0.2.0

## Issue Fixed ✅

The playground was not working on Hostinger because Vite was generating **absolute paths** (`/assets/...`) instead of **relative paths** (`./assets/...`).

### What Was Changed:

In `vite.config.ts`, added:
```typescript
base: './', // Use relative paths for assets
```

This ensures assets load correctly regardless of the deployment directory structure.

## Deployment Options

### Option 1: Upload via File Manager (Recommended)

1. **Download the deployment package:**
   - File: `cinematicrenderer2d-playground-v0.2.0.zip` (8.8 MB)

2. **Upload to Hostinger:**
   - Log in to Hostinger control panel
   - Go to File Manager
   - Navigate to `public_html` (or your desired directory)
   - Upload the zip file
   - Extract it in place

3. **Access your playground:**
   - If extracted to `public_html`: `https://yourdomain.com/`
   - If extracted to subdirectory: `https://yourdomain.com/playground/`

### Option 2: Git Auto-Deployment

1. **Connect GitHub repository to Hostinger:**
   - Repository: `https://github.com/rvshekhar10/cinematicRenderer2D.git`
   - Branch: `main`
   - Build command: `npm run build:playground`
   - Output directory: `dist-playground`

2. **Hostinger will automatically:**
   - Pull latest code
   - Run `npm install`
   - Run `npm run build:playground`
   - Deploy `dist-playground` contents

### Option 3: Manual FTP Upload

1. **Build locally:**
   ```bash
   npm run build:playground
   ```

2. **Upload via FTP:**
   - Connect to your Hostinger FTP
   - Upload contents of `dist-playground/` folder
   - Ensure all files maintain their directory structure

## Verification

After deployment, verify:

1. **Homepage loads:** Check `index.html` loads without errors
2. **Assets load:** Open browser DevTools → Network tab
   - All assets should load with 200 status
   - No 404 errors for `/assets/...` paths
3. **Examples work:** Try loading different examples from dropdown
4. **Renderer works:** Click "Create Renderer" and "Play"

## Troubleshooting

### Assets Still Not Loading?

Check the browser console for errors. If you see 404 errors:

1. **Verify file structure:**
   ```
   public_html/
   ├── index.html
   ├── getting-started.html
   ├── assets/
   │   ├── main-CAz7xJvJ.js
   │   ├── audio/
   │   ├── images/
   │   └── video/
   └── examples/
       ├── enhanced-story.json
       ├── simple-demo-spec.json
       └── ...
   ```

2. **Check file permissions:**
   - Files: 644
   - Directories: 755

3. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### MIME Type Errors?

Add to `.htaccess` in your deployment directory:
```apache
AddType application/javascript .js
AddType application/json .json
AddType video/mp4 .mp4
AddType audio/mpeg .mp3
AddType image/jpeg .jpg
```

## What's Included

The deployment package contains:

- ✅ Playground interface (`index.html`)
- ✅ Getting started guide (`getting-started.html`)
- ✅ Bundled JavaScript (`assets/main-CAz7xJvJ.js`)
- ✅ Example specifications (8 examples)
- ✅ Sample assets (audio, images, video)
- ✅ All with **relative paths** for subdirectory compatibility

## Testing Locally

Before deploying, test the build locally:

```bash
# Build
npm run build:playground

# Serve locally (simulates Hostinger environment)
npx serve dist-playground

# Open http://localhost:3000
```

## Support

If issues persist:
1. Check browser console for specific errors
2. Verify all files uploaded correctly
3. Check Hostinger error logs
4. Ensure Node.js version matches (v18+)

---

**Version:** 0.2.0  
**Build Date:** February 3, 2026  
**Status:** ✅ Fixed and Ready for Deployment
