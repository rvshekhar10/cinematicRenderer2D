# Playground Examples

This directory contains interactive examples showcasing all features of cinematicRenderer2D. Load these examples in the playground to see them in action!

## Featured Examples

### 🎬 **cinematic-masterpiece.json** NEW!
A stunning day-to-night journey combining all major features in perfect harmony.
- **Features Demonstrated**:
  - 🌅 Complete day cycle (Dawn → Sunrise → Daylight → Sunset → Twilight → Night)
  - 💡 Advanced lighting (radial, spot, ambient with animations)
  - 🔄 All 5 transition types (crossfade, zoom, slide, dissolve, blur)
  - ✨ Complex animations (opacity, scale, rotation, position, yoyo, loop)
  - ⭐ Particle systems (starfield, particles, nebula)
  - 🌫️ Atmospheric effects (fog, vignette, glow)
  - 📝 Animated text with dynamic shadows
- **Scenes**: 6 beautifully crafted scenes
- **Duration**: ~34 seconds
- **Difficulty**: Showcase
- **Best For**: Seeing the full power of cinematicRenderer2D

### ⭐ **enhanced-story.json**
A comprehensive 5-act hero's journey with advanced features.
- **Features**: Light effects, fog, particles, noise overlay, vignette
- **Duration**: ~45 seconds
- **Difficulty**: Advanced

---

## Basic Examples

### 1. **simple-demo-spec.json**
Basic introduction to cinematicRenderer2D with simple scenes and animations.
- **Features**: Basic layers, simple animations, text blocks
- **Duration**: ~15 seconds
- **Difficulty**: Beginner

### 2. **story-narration-spec.json**
A narrative-driven cinematic with multiple scenes telling a story.
- **Features**: Multi-scene storytelling, text animations, scene transitions
- **Duration**: ~30 seconds
- **Difficulty**: Beginner

### 3. **day-night-story-spec.json**
A complete day-night cycle demonstration.
- **Features**: Gradient backgrounds, time-based scenes, smooth transitions
- **Duration**: ~40 seconds
- **Difficulty**: Intermediate

### 4. **night-sky-demo.json**
Beautiful night sky scene with stars and moon.
- **Features**: Starfield, light effects, atmospheric rendering
- **Duration**: ~20 seconds
- **Difficulty**: Intermediate

### 5. **template-demo.json**
Demonstration of scene templates for quick scene creation.
- **Features**: Pre-built scene templates, template customization
- **Duration**: ~25 seconds
- **Difficulty**: Beginner

---

## New Feature Showcases

> **Note**: Camera system is implemented but not yet supported in JSON specs. Camera animations must be added programmatically. See `CAMERA_SYSTEM_NOTE.md` for details.

### 7. **light-effects-demo.json** 💡
Comprehensive light system showcase.
- **Features Demonstrated**:
  - Radial lights (circular glow)
  - Spotlights (directional)
  - Ambient lights (color overlays)
  - Multiple light sources
  - Light animations (pulsing, moving)
  - Blend modes (screen, overlay)
- **Duration**: ~26 seconds
- **Best For**: Understanding lighting techniques

### 8. **transition-types.json** 🔄
All available transition types in one demo.
- **Features Demonstrated**:
  - Crossfade transition
  - Slide transition (left/right/up/down)
  - Zoom transition (in/out)
  - Wipe transition
  - Dissolve transition
  - Blur transition
- **Duration**: ~18 seconds
- **Best For**: Choosing the right transition

### 9. **animation-features.json** ✨
Enhanced animation capabilities showcase.
- **Features Demonstrated**:
  - Loop animations (continuous repeat)
  - Yoyo animations (back and forth)
  - Keyframe animations (complex paths)
  - Stagger animations (sequential timing)
- **Duration**: ~32 seconds
- **Best For**: Advanced animation techniques

### 10. **audio-showcase.json** 🔊
Audio system features and capabilities.
- **Features Demonstrated**:
  - Audio fade in
  - Audio fade out
  - Audio crossfading between scenes
  - Multi-track playback (3 simultaneous tracks)
- **Duration**: ~24 seconds
- **Best For**: Audio integration
- **Note**: Requires audio files in `/assets/audio/`

### 11. **scene-templates-demo.json** 🎨
Pre-built scene templates with customization.
- **Features Demonstrated**:
  - Sunrise template
  - Cosmic birth template
  - Rain template
  - Divine aura template
  - Underwater template
  - Template customization options
- **Duration**: ~30 seconds
- **Best For**: Quick scene creation

---

## How to Use

1. **Open the Playground**: Navigate to the playground in your browser
2. **Load an Example**: Click "Load Example" and select from the dropdown
3. **Play**: Click the play button to watch the cinematic
4. **Edit**: Modify the JSON to experiment with different settings
5. **Learn**: Check the code to understand how features work

## Learning Path

### Beginner
1. Start with `simple-demo-spec.json`
2. Try `story-narration-spec.json`
3. Explore `template-demo.json`
4. Experiment with `scene-templates-demo.json`

### Intermediate
1. Study `day-night-story-spec.json`
2. Learn from `night-sky-demo.json`
3. Try `transition-types.json`
4. Experiment with `animation-features.json`

### Advanced
1. Analyze `enhanced-story.json`
2. Master `light-effects-demo.json`
3. Practice with `animation-features.json`
4. Integrate `audio-showcase.json`

### 🎬 Masterclass
**Experience `cinematic-masterpiece.json`** - See all features working together in a stunning day-to-night journey. This is the ultimate showcase of what cinematicRenderer2D can do!

## Feature Reference

| Feature | Examples |
|---------|----------|
| Complete Showcase | **cinematic-masterpiece.json** ⭐ |
| Camera System | ⚠️ Not yet supported in JSON specs (programmatic API only) |
| Light Effects | cinematic-masterpiece.json, light-effects-demo.json, enhanced-story.json |
| Transitions | transition-types.json, enhanced-story.json |
| Animations | animation-features.json, enhanced-story.json |
| Audio | audio-showcase.json |
| Templates | scene-templates-demo.json, template-demo.json |
| Particles | enhanced-story.json, night-sky-demo.json |
| Fog Effects | enhanced-story.json |
| Multi-Scene | All examples |

## Tips

- **Performance**: Start with lower particle counts and increase gradually
- **Timing**: Use the timeline scrubber to fine-tune animation timing
- **Colors**: Experiment with different color combinations for unique looks
- **Layering**: Higher zIndex values appear on top
- **Easing**: Try different easing functions for varied animation feels
- **Audio**: Ensure audio files are properly loaded before playing

## Need Help?

- Check the [API Documentation](../../docs/API.md)
- Read the [Tutorials](../../docs/TUTORIALS.md)
- Browse the [Scene Cookbook](../../docs/SCENE_COOKBOOK.md)
- Review [Performance Guide](../../docs/PERFORMANCE.md)

## Contributing

Have a cool example? Consider contributing it to the playground! Make sure it:
- Demonstrates a specific feature or technique
- Is well-commented and easy to understand
- Runs smoothly at 60 FPS
- Follows the existing JSON structure

---

**Happy Creating!** 🎬✨
