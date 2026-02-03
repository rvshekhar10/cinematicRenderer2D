# Playground Examples - Complete List

## All 13 Examples Included ✅

The playground now includes **all 13 example specifications** showcasing different features of cinematicRenderer2D.

### Featured Examples (2)

1. **🎬 Cinematic Masterpiece** (`cinematic-masterpiece.json`)
   - Comprehensive showcase of all features
   - Camera movements, transitions, lighting, audio
   - Multiple scenes with complex animations
   - **Size:** 17 KB

2. **Enhanced Story** (`enhanced-story.json`)
   - Complete narrative with multiple scenes
   - Demonstrates storytelling capabilities
   - **Size:** 25 KB

### Feature Showcases (6)

3. **💡 Light Effects** (`light-effects-demo.json`)
   - Radial, spot, ambient, and vignette lighting
   - Different blend modes
   - Animated light properties
   - **Size:** 8 KB

4. **🔄 Transition Types** (`transition-types.json`)
   - All 6 transition types: crossfade, slide, zoom, wipe, dissolve, blur
   - Different durations and easing functions
   - **Size:** 6 KB

5. **✨ Animation Features** (`animation-features.json`)
   - Looping and yoyo animations
   - Keyframe animations
   - Stagger effects
   - Randomization
   - **Size:** 11 KB

6. **🔊 Audio Showcase** (`audio-showcase.json`)
   - Multi-track audio playback
   - Audio crossfading
   - Fade in/out effects
   - Volume control
   - **Size:** 9 KB

7. **📷 Camera Showcase** (`camera-showcase.json`)
   - Camera pan, zoom, rotate
   - Camera animations
   - Cinematic camera movements
   - **Size:** 6 KB

8. **🎨 Scene Templates** (`scene-templates-demo.json`)
   - Pre-built scene templates
   - Sunrise, cosmic birth, rain, divine aura, underwater
   - Template customization
   - **Size:** 6 KB

### Basic Examples (4)

9. **Simple Demo** (`simple-demo-spec.json`)
   - Basic gradient and text
   - Simple animations
   - Good starting point
   - **Size:** 21 KB

10. **Story Narration** (`story-narration-spec.json`)
    - Multi-scene story
    - Text-based narrative
    - Scene transitions
    - **Size:** 13 KB

11. **Day & Night Story** (`day-night-story-spec.json`)
    - Complex day-to-night transition
    - Multiple layers and effects
    - Comprehensive example
    - **Size:** 59 KB (largest)

12. **Night Sky Demo** (`night-sky-demo.json`)
    - Starfield and moon
    - Atmospheric effects
    - Particle systems
    - **Size:** 31 KB

### Template Usage (1)

13. **Template Demo** (`template-demo.json`)
    - How to use scene templates
    - Template customization examples
    - **Size:** 7 KB

## Total Package Size

- **Examples only:** ~200 KB (all 13 JSON files)
- **Complete package:** 8.9 MB (includes assets: audio, images, video)
- **Compressed:** Efficient gzip compression in production

## How Examples Are Loaded

The playground's dropdown menu organizes examples into categories:

```
⭐ Featured
  - Cinematic Masterpiece (NEW!)
  - Enhanced Story

🎯 Feature Showcases
  - Light Effects
  - Transition Types
  - Animation Features
  - Audio Showcase
  - Camera Showcase
  - Scene Templates

📚 Basic Examples
  - Simple Demo
  - Story Narration
  - Day & Night Story
  - Night Sky Demo
  - Template Demo

✏️ Custom
  - Custom Specification
```

## Example Loading in Code

All examples are loaded via the playground's main.ts:

```typescript
const exampleSpecs: Record<string, string> = {
  'masterpiece': './examples/cinematic-masterpiece.json',
  'enhanced': './examples/enhanced-story.json',
  'lights': './examples/light-effects-demo.json',
  'transitions': './examples/transition-types.json',
  'animations': './examples/animation-features.json',
  'audio': './examples/audio-showcase.json',
  'camera': './examples/camera-showcase.json',
  'templates': './examples/scene-templates-demo.json',
  'simple': './examples/simple-demo-spec.json',
  'story': './examples/story-narration-spec.json',
  'daynight': './examples/day-night-story-spec.json',
  'nightsky': './examples/night-sky-demo.json',
  'templateDemo': './examples/template-demo.json',
};
```

## Deployment

All 13 examples are automatically included when you:

1. **Build locally:** `npm run build:playground`
2. **Deploy to Hostinger:** Examples are copied to `dist-playground/examples/`
3. **Upload package:** `cinematicrenderer2d-playground-v0.2.0-complete.zip`

## Testing Examples Locally

```bash
# Build playground
npm run build:playground

# Serve locally
npx serve dist-playground

# Open http://localhost:3000
# Select examples from dropdown
```

## Adding New Examples

To add a new example:

1. Create JSON file in `playground/examples/`
2. Add filename to `vite.config.ts` examples array
3. Add entry to `playground/main.ts` exampleSpecs object
4. Add option to `playground/index.html` dropdown
5. Rebuild: `npm run build:playground`

---

**Version:** 0.2.0  
**Total Examples:** 13  
**Last Updated:** February 3, 2026
