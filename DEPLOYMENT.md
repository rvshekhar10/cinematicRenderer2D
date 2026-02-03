# Deploying to cinematicrenderer2d.purpuldigital.com

Complete guide for deploying the playground as your landing page.

## Overview

The playground will be deployed as the main landing page at:
- **URL**: https://cinematicrenderer2d.purpuldigital.com
- **Content**: Interactive playground with examples
- **Documentation**: Accessible via the "Use This in Your Project" button

## Deployment Options

### Option 1: Vercel (Recommended - Easiest)

#### Setup

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy**:
```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- Project name? **cinematic-renderer2d**
- Directory? **./playground**
- Override settings? **N**

4. **Set Custom Domain**:
```bash
vercel domains add cinematicrenderer2d.purpuldigital.com
```

Then add DNS records (Vercel will show you what to add).

#### Production Deploy

```bash
vercel --prod
```

### Option 2: Netlify

#### Setup

1. **Install Netlify CLI**:
```bash
npm install -g netlify-cli
```

2. **Login**:
```bash
netlify login
```

3. **Initialize**:
```bash
netlify init
```

4. **Deploy**:
```bash
netlify deploy --prod --dir=dist-playground
```

5. **Set Custom Domain** in Netlify dashboard

### Option 3: GitHub Pages

#### Setup

1. **Build the playground**:
```bash
npm run build:playground
```

2. **Create gh-pages branch**:
```bash
git checkout -b gh-pages
git add dist-playground -f
git commit -m "Deploy playground"
git push origin gh-pages
```

3. **Configure custom domain** in GitHub repository settings

### Option 4: Your Own Server

#### Build

```bash
npm run build:playground
```

#### Upload

Upload the `dist-playground` folder to your server:
```bash
scp -r dist-playground/* user@server:/var/www/cinematicrenderer2d.purpuldigital.com/
```

## Build Configuration

### Add Playground Build Script

Add to `package.json`:
```json
{
  "scripts": {
    "build:playground": "vite build --config vite.config.ts",
    "preview:playground": "vite preview"
  }
}
```

### Update vite.config.ts

The config is already set up correctly with:
- Root: `playground`
- Output: `dist-playground`

## DNS Configuration

### For Vercel/Netlify

Add these DNS records to your domain:

**A Record**:
```
Type: A
Name: cinematicrenderer2d
Value: [Vercel/Netlify IP]
```

**CNAME Record** (alternative):
```
Type: CNAME
Name: cinematicrenderer2d
Value: [your-project].vercel.app
```

### For Your Own Server

**A Record**:
```
Type: A
Name: cinematicrenderer2d
Value: [Your Server IP]
```

## Environment Setup

### Production Build

```bash
# Build the playground
npm run build:playground

# Preview locally
npm run preview:playground
```

### Verify Build

Check that `dist-playground` contains:
- `index.html`
- `assets/` folder with JS/CSS
- `examples/` folder with JSON specs

## Deployment Checklist

- [ ] Build succeeds: `npm run build:playground`
- [ ] Preview works: `npm run preview:playground`
- [ ] All examples load correctly
- [ ] "Use This in Your Project" button works
- [ ] Documentation links work
- [ ] Custom domain configured
- [ ] SSL certificate active (HTTPS)
- [ ] DNS propagated (can take 24-48 hours)

## Post-Deployment

### 1. Test Your Site

Visit: https://cinematicrenderer2d.purpuldigital.com

Check:
- ✅ Playground loads
- ✅ Examples work
- ✅ Controls function
- ✅ Documentation accessible
- ✅ Mobile responsive

### 2. Update Links

Update these files with your live URL:
- README.md
- package.json (homepage field)
- docs/index.html
- playground/getting-started.html

### 3. Add to NPM Package

Update `package.json`:
```json
{
  "homepage": "https://cinematicrenderer2d.purpuldigital.com"
}
```

Then republish:
```bash
npm version patch
npm publish
```

## Continuous Deployment

### Vercel (Automatic)

Connect your GitHub repo:
1. Go to vercel.com/dashboard
2. Import your repository
3. Set root directory to `playground`
4. Every push to main will auto-deploy

### GitHub Actions

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy Playground

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npm run build:playground
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./
```

## Troubleshooting

### Build Fails

```bash
# Clean and rebuild
npm run clean
npm ci
npm run build:playground
```

### 404 Errors

Ensure your hosting platform is configured for SPA:
- Vercel: Automatic
- Netlify: Add `_redirects` file
- Apache: Configure `.htaccess`

### Assets Not Loading

Check that paths are relative in built files:
```bash
grep -r "src=\"/" dist-playground/
```

Should be `src="./` not `src="/`

## Quick Deploy Commands

### Vercel
```bash
vercel --prod
```

### Netlify
```bash
netlify deploy --prod --dir=dist-playground
```

### Manual
```bash
npm run build:playground
# Upload dist-playground/* to your server
```

## Support

- Vercel Docs: https://vercel.com/docs
- Netlify Docs: https://docs.netlify.com
- Vite Docs: https://vitejs.dev/guide/build.html

---

**Ready to deploy?** Choose your platform and follow the steps above!
