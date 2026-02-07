# Examples

This directory contains working examples demonstrating various features of cinematicRenderer2D.

## Available Examples

### 1. Simple Demo (`simple-demo-spec.json`)

A basic example showing fundamental concepts:
- Gradient background layer
- Text block with animations
- Fade in/out effects
- Basic scene transitions

**Use Case**: Perfect for learning the basics and understanding the JSON specification format.

### 2. Story Narration (`story-narration-spec.json`)

A more complex example with multiple scenes:
- Multiple events and scenes
- Text animations and transitions
- Layer composition
- Scene sequencing

**Use Case**: Ideal for creating narrative experiences, tutorials, or storytelling applications.

### 3. Day & Night Story (`day-night-story-spec.json`)

Advanced example demonstrating:
- Complex color transitions
- Multiple animated layers
- Particle effects
- Atmospheric effects
- Light layers for day/night simulation
- Camera movements
- Scene transitions

**Use Case**: Great for creating immersive environmental experiences or mood-based content.

### 4. Night Sky Demo (`night-sky-demo.json`)

Showcase of advanced features:
- Starfield and particle systems
- Light layers with blend modes
- Camera zoom and pan animations
- Fog effects
- Multi-track audio with crossfading
- Complex scene transitions

**Use Case**: Demonstrates the full capabilities of the rendering engine.

## Running Examples

### In the Playground

1. Open the [playground](../playground/index.html)
2. Select an example from the dropdown
3. Click "Create Renderer" and "Play"

### In Your Project

```typescript
import { CinematicRenderer2D } from 'cinematic-renderer2d';

// Load example specification
const response = await fetch('/path/to/example-spec.json');
const spec = await response.json();

// Create renderer
const renderer = new CinematicRenderer2D({
  container: document.getElementById('container'),
  spec
});

await renderer.mount();
renderer.play();
```

## Creating Custom Examples

### Basic Template

```json
{
  "schemaVersion": "1.0.0",
  "engine": {
    "targetFps": 60,
    "quality": "auto",
    "debug": false
  },
  "events": [
    {
      "id": "your-event-id",
      "name": "Your Event Name",
      "scenes": ["scene-1", "scene-2"]
    }
  ],
  "scenes": [
    {
      "id": "scene-1",
      "name": "First Scene",
      "duration": 3000,
      "layers": [
        {
          "id": "layer-1",
          "type": "gradient",
          "zIndex": 1,
          "config": {
            "colors": ["#667eea", "#764ba2"],
            "direction": "diagonal"
          },
          "animations": [
            {
              "property": "opacity",
              "from": 0,
              "to": 1,
              "startMs": 0,
              "endMs": 1000,
              "easing": "ease-in-out"
            }
          ]
        }
      ]
    }
  ]
}
```

## Example Patterns

### Fade In/Out Pattern

```json
{
  "animations": [
    {
      "property": "opacity",
      "from": 0,
      "to": 1,
      "startMs": 0,
      "endMs": 1000,
      "easing": "ease-in"
    },
    {
      "property": "opacity",
      "from": 1,
      "to": 0,
      "startMs": 2000,
      "endMs": 3000,
      "easing": "ease-out"
    }
  ]
}
```

### Scale and Rotate Pattern

```json
{
  "animations": [
    {
      "property": "transform.scale",
      "from": 0.5,
      "to": 1.2,
      "startMs": 0,
      "endMs": 1500,
      "easing": "ease-out-back"
    },
    {
      "property": "transform.rotate",
      "from": 0,
      "to": 360,
      "startMs": 0,
      "endMs": 2000,
      "easing": "linear",
      "loop": true
    }
  ]
}
```

### Color Transition Pattern

```json
{
  "animations": [
    {
      "property": "config.color",
      "from": "#ff0000",
      "to": "#0000ff",
      "startMs": 0,
      "endMs": 2000,
      "easing": "ease-in-out"
    }
  ]
}
```

### Camera Movement Pattern

```json
{
  "animations": [
    {
      "property": "camera.zoom",
      "from": 1.0,
      "to": 2.0,
      "startMs": 0,
      "endMs": 2000,
      "easing": "ease-in-out"
    },
    {
      "property": "camera.x",
      "from": 0,
      "to": 100,
      "startMs": 0,
      "endMs": 2000,
      "easing": "ease-in-out"
    }
  ]
}
```

### Light Layer Pattern

```json
{
  "id": "spotlight",
  "type": "light",
  "zIndex": 10,
  "config": {
    "mode": "spot",
    "position": { "x": 50, "y": 50 },
    "radius": 200,
    "intensity": 0.8,
    "color": "#ffffff",
    "angle": 45,
    "direction": 90,
    "blendMode": "screen"
  },
  "animations": [
    {
      "property": "config.intensity",
      "from": 0,
      "to": 0.8,
      "startMs": 0,
      "endMs": 1000,
      "easing": "ease-in"
    }
  ]
}
```

### Scene Transition Pattern

```json
{
  "transitions": [
    {
      "fromScene": "scene1",
      "toScene": "scene2",
      "type": "crossfade",
      "duration": 1000,
      "easing": "ease-in-out"
    },
    {
      "fromScene": "scene2",
      "toScene": "scene3",
      "type": "slide",
      "duration": 800,
      "easing": "ease-out",
      "direction": "left"
    }
  ]
}
```

### Audio with Fade Pattern

```json
{
  "audio": [
    {
      "id": "background-music",
      "type": "ambience",
      "src": "audio/ambient.mp3",
      "startMs": 0,
      "volume": 0.6,
      "fadeIn": 1000,
      "fadeOut": 500,
      "loop": true
    }
  ]
}
```

## Tips for Creating Examples

1. **Start Simple**: Begin with basic layers and add complexity gradually
2. **Use Debug Mode**: Enable debug mode to monitor performance and layer status
3. **Test Performance**: Verify your example runs smoothly on target devices
4. **Document Intent**: Add comments explaining what each section demonstrates
5. **Optimize Assets**: Use compressed images and audio files
6. **Consider Timing**: Ensure animations feel natural and well-paced

## Contributing Examples

Have a great example to share? We'd love to include it!

1. Create your specification file
2. Test it thoroughly in the playground
3. Add documentation explaining the example
4. Submit a pull request on GitHub

## Resources

- [API Documentation](./API.md)
- [Getting Started Guide](./GETTING_STARTED.md)
- [Performance Guide](./PERFORMANCE.md)
- [Interactive Playground](../playground/index.html)

---

**Need help?** Check out the [API documentation](./API.md) or ask in [GitHub Discussions](https://github.com/rvshekhar10/cinematicRenderer2D/discussions).
