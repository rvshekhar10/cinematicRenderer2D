# Hostinger Deployment Guide for CinematicRenderer2D Playground

## 🚀 Quick Deployment Steps

### 1. Build the Playground
The playground has already been built and is ready in the `dist-playground` folder.

```bash
npm run build:playground
```

### 2. Prepare Deployment Package

All files are ready in `dist-playground/`:
- ✅ `index.html` - Main playground page
- ✅ `getting-started.html` - Getting started guide
- ✅ `assets/` - JavaScript bundles and media files
- ✅ `examples/` - JSON specification examples
- ✅ `docs/` - Complete documentation
- ✅ `.htaccess` - Server configuration

### 3. Upload to Hostinger

#### Option A: File Manager (Recommended for first-time)

1. Log in to Hostinger control panel (hPanel)
2. Go to **File Manager**
3. Navigate to `public_html` directory
4. Delete any existing files (or backup first)
5. Upload all contents from `dist-playground/` folder
6. Ensure `.htaccess` file is uploaded (enable "Show hidden files" if needed)

#### Option B: FTP Upload

1. Use an FTP client (FileZilla, Cyberduck, etc.)
2. Connect using your Hostinger FTP credentials:
   - Host: Your domain or FTP hostname
   - Username: Your FTP username
   - Password: Your FTP password
   - Port: 21 (or 22 for SFTP)
3. Navigate to `public_html` directory
4. Upload all contents from `dist-playground/`

#### Option C: Git Deployment (Advanced)

If you have Git enabled on Hostinger:

```bash
# On your local machine
cd dist-playground
git init
git add .
git commit -m "Deploy playground"
git remote add hostinger <your-hostinger-git-url>
git push hostinger main
```

### 4. Verify Deployment

After uploading, visit your domain:
- Main page: `https://yourdomain.com/`
- Getting started: `https://yourdomain.com/getting-started.html`
- Documentation: `https://yourdomain.com/docs/`

### 5. Test Functionality

Check that:
- ✅ Playground loads without errors
- ✅ Examples can be loaded and played
- ✅ Assets (images, audio, video) load correctly
- ✅ Navigation between pages works
- ✅ Documentation is accessible

## 📁 Deployment Structure

```
public_html/
├── .htaccess                    # Server configuration
├── index.html                   # Main playground
├── getting-started.html         # Getting started guide
├── assets/
│   ├── main-[hash].js          # Bundled JavaScript
│   ├── index.json              # Asset manifest
│   ├── audio/                  # Audio files
│   │   └── waves-crashing-397977.mp3
│   ├── images/                 # Image files
│   │   └── full-moon-image-in-center-screen.jpg
│   └── video/                  # Video files
│       └── free_milky_way_galaxy_from_ground_with_treeline.mp4
├── examples/
│   ├── simple-demo-spec.json
│   ├── story-narration-spec.json
│   ├── day-night-story-spec.json
│   ├── night-sky-demo.json
│   └── enhanced-story.json
└── docs/
    ├── index.html
    ├── API.md
    ├── GETTING_STARTED.md
    ├── EXAMPLES.md
    ├── REACT_INTEGRATION.md
    ├── ANGULAR_INTEGRATION.md
    ├── PERFORMANCE.md
    └── ...
```

## 🔧 Configuration

### .htaccess Features

The included `.htaccess` file provides:
- ✅ Gzip compression for faster loading
- ✅ Browser caching for static assets
- ✅ CORS headers for cross-origin requests
- ✅ Security headers
- ✅ Proper MIME types
- ✅ Directory browsing protection

### Performance Optimizations

The build includes:
- Minified JavaScript bundles
- Optimized asset loading
- Lazy loading for examples
- Efficient caching strategy

## 🐛 Troubleshooting

### Assets Not Loading

If assets (images, audio, video) don't load:
1. Check file permissions (should be 644 for files, 755 for directories)
2. Verify `.htaccess` is uploaded and active
3. Check browser console for CORS errors
4. Ensure asset paths are correct in `assets/index.json`

### 404 Errors

If you get 404 errors:
1. Verify all files are in the correct location
2. Check that `.htaccess` is present
3. Ensure mod_rewrite is enabled on your hosting

### JavaScript Errors

If the playground doesn't work:
1. Check browser console for errors
2. Verify JavaScript bundle loaded correctly
3. Clear browser cache and try again
4. Check that all dependencies are bundled

### Slow Loading

If the site loads slowly:
1. Verify gzip compression is working (check response headers)
2. Check that caching headers are set correctly
3. Consider using a CDN for large assets
4. Optimize images and videos if needed

## 📊 Monitoring

After deployment, monitor:
- Page load times
- Asset loading performance
- Browser console for errors
- User feedback

## 🔄 Updates

To update the playground:

1. Make changes to source files
2. Rebuild: `npm run build:playground`
3. Upload new files to Hostinger
4. Clear browser cache to see changes

## 🔐 Security

The deployment includes:
- Hidden file protection (`.htaccess`, `.git`, etc.)
- Directory browsing disabled
- Secure MIME types
- HTTPS redirect (optional, uncomment in `.htaccess`)

## 📞 Support

If you encounter issues:
1. Check Hostinger documentation
2. Contact Hostinger support
3. Review browser console errors
4. Check server error logs in hPanel

## ✅ Deployment Checklist

Before going live:
- [ ] Build completed successfully
- [ ] All files uploaded to `public_html`
- [ ] `.htaccess` file present
- [ ] Assets folder uploaded with all media
- [ ] Examples folder uploaded
- [ ] Docs folder uploaded
- [ ] Test main page loads
- [ ] Test getting started page
- [ ] Test documentation pages
- [ ] Test example playback
- [ ] Test asset loading
- [ ] Check browser console for errors
- [ ] Test on mobile devices
- [ ] Verify performance

## 🎉 Success!

Once deployed, your CinematicRenderer2D playground will be live and accessible to users worldwide!

Share your deployment:
- Main playground: `https://yourdomain.com/`
- Documentation: `https://yourdomain.com/docs/`
- Getting started: `https://yourdomain.com/getting-started.html`
