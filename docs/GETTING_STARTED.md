# Getting Started with cinematicRenderer2D

Welcome to **cinematicRenderer2D** - a high-performance, framework-agnostic library for creating cinematic experiences from JSON specifications.

## Installation

Install the library using npm or yarn:

```bash
# Using npm
npm install cinematic-renderer2d

# Using yarn
yarn add cinematic-renderer2d

# Using pnpm
pnpm add cinematic-renderer2d
```

## Quick Start

### 1. Basic Setup (Vanilla JavaScript)

Create a simple cinematic experience in just a few lines:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My First Cinematic</title>
</head>
<body>
  <div id="cinematic-container" style="width: 100vw; height: 100vh;"></div>
  
  <script type="module">
    import { CinematicRenderer2D } from 'cinematic-renderer2d';
    
    const renderer = new CinematicRenderer2D({
      container: document.getElementById('cinematic-container'),
      spec: {
        schemaVersion: '1.0.0',
        engine: { 
          targetFps: 60, 
          quality: 'auto' 
        },
        events: [{
          id: 'intro',
          name: 'Introduction',
          scenes: ['welcome']
        }],
        scenes: [{
          id: 'welcome',
          name: 'Welcome Scene',
          duration: 3000,
          layers: [{
            id: 'background',
            type: 'gradient',
            zIndex: 1,
            config: {
              colors: ['#667eea', '#764ba2'],
              direction: 'diagonal'
            }
          }]
        }]
      }
    });
    
    // Mount and play
    await renderer.mount();
    renderer.play();
  </script>
</body>
</html>
```

### 2. React Integration

```tsx
import { CinematicPlayer } from 'cinematic-renderer2d/react';
import type { CinematicSpec } from 'cinematic-renderer2d';

const spec: CinematicSpec = {
  schemaVersion: '1.0.0',
  engine: { targetFps: 60, quality: 'auto' },
  events: [{ id: 'intro', name: 'Intro', scenes: ['scene1'] }],
  scenes: [{
    id: 'scene1',
    name: 'First Scene',
    duration: 5000,
    layers: [{
      id: 'bg',
      type: 'gradient',
      zIndex: 1,
      config: { colors: ['#000', '#333'] }
    }]
  }]
};

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <CinematicPlayer
        spec={spec}
        autoplay={true}
        onPlay={() => console.log('Playing')}
        onEnd={() => console.log('Finished')}
      />
    </div>
  );
}

export default App;
```

### 3. Angular Integration

```typescript
// app.component.ts
import { Component } from '@angular/core';
import { CinematicPlayerComponent } from 'cinematic-renderer2d/angular';
import type { CinematicSpec } from 'cinematic-renderer2d';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CinematicPlayerComponent],
  template: `
    <div style="width: 100vw; height: 100vh;">
      <cinematic-player
        [spec]="spec"
        [autoplay]="true"
        (play)="onPlay()"
        (end)="onEnd()">
      </cinematic-player>
    </div>
  `
})
export class AppComponent {
  spec: CinematicSpec = {
    schemaVersion: '1.0.0',
    engine: { targetFps: 60, quality: 'auto' },
    events: [{ id: 'intro', name: 'Intro', scenes: ['scene1'] }],
    scenes: [{
      id: 'scene1',
      name: 'First Scene',
      duration: 5000,
      layers: [{
        id: 'bg',
        type: 'gradient',
        zIndex: 1,
        config: { colors: ['#000', '#333'] }
      }]
    }]
  };
  
  onPlay() { console.log('Playing'); }
  onEnd() { console.log('Finished'); }
}
```

## Core Concepts

### 1. Specifications

Cinematic experiences are defined using JSON specifications that describe:
- **Events**: High-level sequences of scenes
- **Scenes**: Individual moments with duration and layers
- **Layers**: Visual elements (gradients, images, text, particles, lights, fog, etc.)
- **Animations**: Property changes over time with easing, looping, and keyframes
- **Audio**: Synchronized sound tracks with fade effects and multi-track support
- **Transitions**: Smooth scene transitions (crossfade, slide, zoom, wipe, dissolve, blur)
- **Camera**: Viewport transformations for cinematic effects

### 2. Rendering Backends

The library supports multiple rendering backends:
- **DOM**: CSS-based rendering for text, images, and effects
- **Canvas2D**: High-performance particle systems and effects
- **WebGL** (coming soon): GPU-accelerated 3D rendering

### 3. Performance

Automatic quality adaptation ensures smooth performance:
- Targets 60-120fps on modern devices
- Adaptive quality based on device capabilities and FPS monitoring
- Object pooling for particle systems
- Precompiled animation tracks
- Automatic performance monitoring with quality adjustments
- Asset preloading and caching for optimal loading times

## New Features

### Camera System
Control viewport transformations for cinematic effects:
```typescript
renderer.setCameraState({ zoom: 2.0, x: 100, y: 50 });
renderer.addCameraAnimation({
  property: 'zoom',
  from: 1.0,
  to: 2.0,
  startMs: 0,
  endMs: 2000,
  easing: 'ease-in-out'
});
```

### Scene Transitions
Smooth transitions between scenes:
```json
{
  "transitions": [{
    "fromScene": "scene1",
    "toScene": "scene2",
    "type": "crossfade",
    "duration": 1000,
    "easing": "ease-in-out"
  }]
}
```

### Light Layers
Cinematic lighting effects:
```json
{
  "type": "light",
  "config": {
    "mode": "spot",
    "position": { "x": 50, "y": 50 },
    "radius": 200,
    "intensity": 0.8,
    "color": "#ffffff",
    "blendMode": "screen"
  }
}
```

### Enhanced Audio
Per-track control with fade effects:
```json
{
  "audio": [{
    "id": "music",
    "type": "ambience",
    "src": "audio/ambient.mp3",
    "volume": 0.6,
    "fadeIn": 1000,
    "fadeOut": 500,
    "loop": true
  }]
}
```

## Next Steps

- 📖 [Read the full API documentation](./API.md)
- 🎨 [Explore layer types and configurations](./API.md#layer-types)
- 🎬 [Learn about animations](./API.md#animation-system)
- 🎥 [Camera system guide](./API.md#camera-system-new)
- 🌟 [Light layers guide](./API.md#light-layer-new)
- 🔄 [Transitions guide](./API.md#transition-engine-new)
- ⚛️ [React integration guide](./REACT_INTEGRATION.md)
- 🅰️ [Angular integration guide](./ANGULAR_INTEGRATION.md)
- ⚡ [Performance optimization tips](./PERFORMANCE.md)
- 🎮 [Try the interactive playground](../playground)

## Examples

Check out the `/examples` directory for complete working examples:
- Simple demo with basic layers
- Story narration with multiple scenes
- Day & night transition effects
- Particle effects and animations

## Support

- 🐛 [Report issues on GitHub](https://github.com/rvshekhar10/cinematicRenderer2D/issues)
- 💬 [Join discussions](https://github.com/rvshekhar10/cinematicRenderer2D/discussions)
- 📧 Email: support@cinematicrenderer2d.com

---

**Ready to create something amazing?** Start with the [API documentation](./API.md) or jump into the [playground](../playground) to experiment!
