# Assets Guide for Cinematic Renderer 2D

## Directory Structure

Your project now has two asset directories:

### 1. `public/assets/` - Library Default Assets
**Purpose**: Default demo assets that ship with the npm package

```
public/assets/
├── audio/          # Default audio files
├── video/          # Default video files
├── images/         # Default image files
└── README.md
```

**When to use**: 
- Demo assets for documentation
- Default fallback assets
- Example assets for tutorials

**These files will be**:
- Included in the npm package
- Available to all users of your library
- Committed to git

### 2. `playground/assets/` - Development Assets
**Purpose**: Assets for local development and playground testing

```
playground/assets/
├── audio/          # Test audio files
├── video/          # Test video files
├── images/         # Test image files
└── README.md
```

**When to use**:
- Testing during development
- Playground demos
- Large files you don't want in the npm package

**These files**:
- Are NOT included in the npm package
- Can be larger (for testing)
- Can be added to .gitignore if needed

## How to Add Your Assets

### Step 1: Place Your Files

**For default library assets:**
```bash
# Copy your files to the appropriate directory
cp your-audio.mp3 public/assets/audio/
cp your-video.mp4 public/assets/video/
cp your-image.png public/assets/images/
```

**For playground testing:**
```bash
# Copy your files to playground assets
cp your-audio.mp3 playground/assets/audio/
cp your-video.mp4 playground/assets/video/
cp your-image.png playground/assets/images/
```

### Step 2: Reference in Your Specs

**In playground specs** (`playground/examples/*.json`):
```json
{
  "scenes": [{
    "id": "scene1",
    "duration": 5000,
    "layers": [{
      "type": "image",
      "id": "background",
      "config": {
        "src": "/playground/assets/images/your-image.png"
      }
    }],
    "audio": [{
      "id": "bgm",
      "src": "/playground/assets/audio/your-audio.mp3",
      "loop": true,
      "volume": 0.7
    }]
  }]
}
```

**In library examples** (for documentation):
```json
{
  "scenes": [{
    "layers": [{
      "type": "image",
      "config": {
        "src": "/assets/images/your-image.png"
      }
    }],
    "audio": [{
      "src": "/assets/audio/your-audio.mp3"
    }]
  }]
}
```

## Recommended Asset Specifications

### Audio Files
- **Format**: MP3 (best compatibility) or OGG (smaller size)
- **Bitrate**: 128-192 kbps for music, 64-96 kbps for effects
- **Size**: Keep under 5MB for library defaults
- **Sample Rate**: 44.1 kHz or 48 kHz

### Video Files
- **Format**: MP4 with H.264 codec
- **Resolution**: 1920x1080 or lower
- **Bitrate**: 2-5 Mbps
- **Size**: Keep under 10MB for library defaults
- **Frame Rate**: 30 fps or 60 fps

### Image Files
- **PNG**: For images with transparency, icons, graphics
- **JPG**: For photos and complex images without transparency
- **SVG**: For vector graphics, logos, simple illustrations
- **Size**: Optimize for web (use tools like TinyPNG, ImageOptim)
- **Resolution**: 2x for retina displays (e.g., 2000x1000 for 1000x500 display)

## Asset Optimization Tips

### Audio
```bash
# Convert to MP3 with optimal settings
ffmpeg -i input.wav -codec:a libmp3lame -b:a 128k output.mp3

# Normalize audio levels
ffmpeg -i input.mp3 -af "loudnorm" output.mp3
```

### Video
```bash
# Optimize video for web
ffmpeg -i input.mp4 -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k output.mp4

# Create smaller version
ffmpeg -i input.mp4 -vf scale=1280:720 -c:v libx264 -crf 28 output.mp4
```

### Images
```bash
# Optimize PNG
pngquant --quality=65-80 input.png -o output.png

# Optimize JPG
jpegoptim --max=85 input.jpg

# Convert to WebP (modern format)
cwebp -q 80 input.png -o output.webp
```

## Example Assets Structure

Here's what a complete assets directory might look like:

```
public/assets/
├── audio/
│   ├── ambient-morning.mp3
│   ├── ambient-night.mp3
│   └── transition-whoosh.mp3
├── video/
│   └── intro-animation.mp4
├── images/
│   ├── logo.svg
│   ├── background-gradient.png
│   └── particle-star.png
└── README.md

playground/assets/
├── audio/
│   ├── test-music.mp3
│   └── test-sfx.mp3
├── video/
│   └── test-video.mp4
├── images/
│   ├── test-bg.jpg
│   └── test-sprite.png
└── README.md
```

## Build Configuration

Make sure your build tools are configured to copy assets:

### Vite Configuration
Your `vite.config.ts` should include:
```typescript
export default defineConfig({
  publicDir: 'public', // This copies public/ to dist/
  // ...
});
```

### TypeScript Configuration
Assets are already handled by Vite, no changes needed to `tsconfig.json`.

## Git Configuration

**Default library assets** (`public/assets/`):
- ✅ Commit to git (users need these)
- ✅ Include in npm package

**Playground assets** (`playground/assets/`):
- ⚠️ Optional: Add to .gitignore if files are large
- ❌ NOT included in npm package

To ignore large playground assets:
```bash
# Add to .gitignore
echo "playground/assets/*.mp4" >> .gitignore
echo "playground/assets/*.mov" >> .gitignore
```

## Next Steps

1. **Add your default assets** to `public/assets/`
2. **Add test assets** to `playground/assets/`
3. **Update your example specs** to reference these assets
4. **Test in the playground** to ensure assets load correctly
5. **Commit default assets** to git

## Need Help?

- Check the README.md in each assets directory
- See example specs in `playground/examples/`
- Review the Asset Preloader implementation (coming in Task 6)
