# 🚀 Deployment Checklist

Complete checklist for deploying to cinematicrenderer2d.purpuldigital.com

## Pre-Deployment ✅

- [x] Build script added to package.json
- [x] Vite config updated to copy examples
- [x] Vercel config created (vercel.json)
- [x] Netlify config created (netlify.toml)
- [x] Build tested locally
- [x] Examples included in build

## Test Build Locally

```bash
# Build the playground
npm run build:playground

# Verify output
ls -la dist-playground/
ls -la dist-playground/examples/

# Preview locally
npm run preview:playground
```

Visit http://localhost:4173 and test:
- [ ] Playground loads
- [ ] Examples dropdown works
- [ ] All 3 examples load (Simple, Story, Day & Night)
- [ ] Play/Pause/Stop controls work
- [ ] "Use This in Your Project" button works
- [ ] Getting started page loads

## Choose Deployment Method

### Option 1: Vercel (Recommended)

```bash
# Install CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Add custom domain
vercel domains add cinematicrenderer2d.purpuldigital.com

# Deploy to production
vercel --prod
```

### Option 2: Netlify

```bash
# Install CLI
npm install -g netlify-cli

# Login
netlify login

# Build
npm run build:playground

# Deploy
netlify deploy --prod --dir=dist-playground
```

## DNS Configuration

Add these records to your domain (purpuldigital.com):

### For Vercel

**CNAME Record**:
```
Type: CNAME
Name: cinematicrenderer2d
Value: cname.vercel-dns.com
TTL: Auto
```

### For Netlify

**CNAME Record**:
```
Type: CNAME
Name: cinematicrenderer2d
Value: [your-site-name].netlify.app
TTL: Auto
```

## Post-Deployment Verification

### 1. Check Site is Live

```bash
curl -I https://cinematicrenderer2d.purpuldigital.com
```

Should return `200 OK`

### 2. Test All Features

Visit https://cinematicrenderer2d.purpuldigital.com and verify:

- [ ] Site loads with HTTPS
- [ ] Playground interface appears
- [ ] Examples dropdown populated
- [ ] Load "Simple Demo" - works
- [ ] Load "Story Narration" - works
- [ ] Load "Day & Night Story" - works
- [ ] Click "Create Renderer" - works
- [ ] Click "Play" - animation starts
- [ ] Click "Pause" - animation pauses
- [ ] Click "Stop" - animation stops
- [ ] Click "Use This in Your Project" - redirects to getting started
- [ ] Getting started page loads correctly
- [ ] "Back to Playground" link works
- [ ] Mobile responsive (test on phone)

### 3. Performance Check

- [ ] Page loads in < 3 seconds
- [ ] No console errors
- [ ] Assets load correctly
- [ ] Examples load quickly

## Update Project Links

### 1. Update package.json

```json
{
  "homepage": "https://cinematicrenderer2d.purpuldigital.com"
}
```

### 2. Update README.md

Add at the top:
```markdown
## 🎮 Live Demo

**Try it now**: [https://cinematicrenderer2d.purpuldigital.com](https://cinematicrenderer2d.purpuldigital.com)
```

### 3. Update NPM Package

```bash
npm version patch
npm publish
```

### 4. Update GitHub Repository

1. Go to repository settings
2. Add website: https://cinematicrenderer2d.purpuldigital.com
3. Add topics: `playground`, `demo`, `interactive`

## Set Up Continuous Deployment

### Vercel

1. Go to https://vercel.com/dashboard
2. Click "Import Project"
3. Select your GitHub repository
4. Configure:
   - Framework Preset: Vite
   - Root Directory: ./
   - Build Command: `npm run build:playground`
   - Output Directory: `dist-playground`
5. Deploy

Now every push to `main` will auto-deploy!

### Netlify

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Select your GitHub repository
4. Netlify will use `netlify.toml` automatically
5. Deploy

Now every push to `main` will auto-deploy!

## Monitoring

### Check Deployment Status

**Vercel**:
```bash
vercel ls
```

**Netlify**:
```bash
netlify status
```

### View Logs

**Vercel**:
- Dashboard: https://vercel.com/dashboard
- Logs show build and runtime errors

**Netlify**:
- Dashboard: https://app.netlify.com
- Deploy logs show build process

## Rollback (If Needed)

### Vercel

```bash
vercel rollback
```

### Netlify

Go to dashboard → Deploys → Click on previous deploy → "Publish deploy"

## Share Your Live Site! 🎉

Once deployed, share it:

**Twitter/X**:
```
🎮 Check out the live playground for cinematicRenderer2D!

Try it now: https://cinematicrenderer2d.purpuldigital.com

Create cinematic experiences with JSON specifications
• Interactive examples
• Real-time preview
• 60-120fps performance

#WebDev #JavaScript #Animation
```

**LinkedIn**:
```
Excited to share the live playground for cinematicRenderer2D! 🚀

Try it here: https://cinematicrenderer2d.purpuldigital.com

Features:
• Interactive playground with live examples
• Real-time cinematic rendering
• JSON-based specifications
• Framework-agnostic

Perfect for creating engaging web experiences!
```

## Troubleshooting

### Build Fails

```bash
rm -rf node_modules dist-playground
npm install
npm run build:playground
```

### Domain Not Resolving

- Wait 24-48 hours for DNS propagation
- Check DNS records with: `dig cinematicrenderer2d.purpuldigital.com`
- Verify CNAME points to correct target

### Examples Not Loading

Check browser console for errors:
- Verify examples folder exists in dist-playground
- Check network tab for 404s
- Ensure paths are correct in code

### SSL Certificate Issues

- Vercel/Netlify handle SSL automatically
- Wait a few minutes after adding domain
- Check certificate status in dashboard

## Success Criteria ✅

Your deployment is successful when:

- ✅ Site loads at https://cinematicrenderer2d.purpuldigital.com
- ✅ HTTPS certificate is active (padlock in browser)
- ✅ All examples work correctly
- ✅ No console errors
- ✅ Mobile responsive
- ✅ Fast load times (< 3 seconds)
- ✅ Continuous deployment configured

## Quick Commands

```bash
# Build
npm run build:playground

# Preview
npm run preview:playground

# Deploy to Vercel
vercel --prod

# Deploy to Netlify
netlify deploy --prod --dir=dist-playground

# Check status
curl -I https://cinematicrenderer2d.purpuldigital.com
```

---

**Ready to deploy?** Follow the checklist and your playground will be live in minutes! 🚀
