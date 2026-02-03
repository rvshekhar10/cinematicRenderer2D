# 🚀 Deploy Your Playground Now

Quick guide to deploy the playground to cinematicrenderer2d.purpuldigital.com

## Fastest Method: Vercel (5 Minutes)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login

```bash
vercel login
```

Enter your email and verify.

### Step 3: Deploy

```bash
vercel
```

Answer the prompts:
- **Set up and deploy?** Y
- **Which scope?** Select your account
- **Link to existing project?** N
- **Project name?** cinematic-renderer2d
- **Directory?** Press Enter (uses current directory)
- **Override settings?** N

Vercel will deploy and give you a URL like: `https://cinematic-renderer2d-xxx.vercel.app`

### Step 4: Add Custom Domain

```bash
vercel domains add cinematicrenderer2d.purpuldigital.com
```

Vercel will show you DNS records to add. Add them to your domain provider.

### Step 5: Deploy to Production

```bash
vercel --prod
```

Done! Your playground is live at https://cinematicrenderer2d.purpuldigital.com

## Alternative: Netlify

### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

### Step 2: Login

```bash
netlify login
```

### Step 3: Build

```bash
npm run build:playground
```

### Step 4: Deploy

```bash
netlify deploy --prod --dir=dist-playground
```

### Step 5: Add Custom Domain

Go to Netlify dashboard → Domain settings → Add custom domain

## Verify Deployment

### 1. Test Build Locally

```bash
npm run build:playground
npm run preview:playground
```

Visit http://localhost:4173 to test.

### 2. Check Deployment

Once deployed, visit your site and verify:
- ✅ Playground loads
- ✅ Examples work (Simple Demo, Story Narration, Day & Night)
- ✅ Controls work (Play, Pause, Stop)
- ✅ "Use This in Your Project" button works
- ✅ Getting started page loads

## DNS Configuration

### If Using Vercel

Vercel will tell you what DNS records to add. Typically:

**Option 1: CNAME (Recommended)**
```
Type: CNAME
Name: cinematicrenderer2d
Value: cname.vercel-dns.com
```

**Option 2: A Record**
```
Type: A
Name: cinematicrenderer2d
Value: 76.76.21.21
```

### If Using Netlify

**CNAME Record**
```
Type: CNAME
Name: cinematicrenderer2d
Value: [your-site].netlify.app
```

## After Deployment

### 1. Update Package Homepage

Edit `package.json`:
```json
{
  "homepage": "https://cinematicrenderer2d.purpuldigital.com"
}
```

### 2. Update README

Add your live demo link:
```markdown
## 🎮 Live Demo

Try it now: https://cinematicrenderer2d.purpuldigital.com
```

### 3. Republish to NPM

```bash
npm version patch
npm publish
```

### 4. Update GitHub

Add website to repository settings:
- Go to repository settings
- Add website: https://cinematicrenderer2d.purpuldigital.com

## Continuous Deployment

### Vercel (Automatic)

Connect your GitHub repository:
1. Go to https://vercel.com/dashboard
2. Click "Import Project"
3. Select your repository
4. Vercel will auto-deploy on every push to main

### Netlify (Automatic)

Connect your GitHub repository:
1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Select your repository
4. Netlify will auto-deploy on every push to main

## Troubleshooting

### Build Fails

```bash
# Clean and try again
rm -rf node_modules dist-playground
npm install
npm run build:playground
```

### Domain Not Working

- Wait 24-48 hours for DNS propagation
- Check DNS records are correct
- Verify SSL certificate is active

### 404 Errors

The `vercel.json` and `netlify.toml` files handle this automatically.

## Quick Commands Reference

```bash
# Build playground
npm run build:playground

# Preview locally
npm run preview:playground

# Deploy to Vercel
vercel --prod

# Deploy to Netlify
netlify deploy --prod --dir=dist-playground

# Check deployment
curl -I https://cinematicrenderer2d.purpuldigital.com
```

## What Gets Deployed

Your deployment includes:
- ✅ Interactive playground
- ✅ All example specifications
- ✅ Getting started page
- ✅ Documentation links
- ✅ Fully functional renderer

## Support

- Vercel: https://vercel.com/docs
- Netlify: https://docs.netlify.com
- Full guide: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

**Ready?** Run `vercel` to deploy in 5 minutes! 🚀
