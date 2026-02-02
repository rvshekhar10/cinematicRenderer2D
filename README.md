# cinematicRenderer2D

High-performance, framework-agnostic NPM library that renders cinematic experiences from JSON specifications targeting 60-120fps performance across web frameworks.

## Features

- 🚀 **High Performance**: Targets 60-120fps with optimized rendering backends and precompiled animations
- 🎯 **Framework Agnostic**: Works with React, Angular, Vue, Next.js, or plain JavaScript
- 🎨 **Multiple Backends**: DOM, Canvas2D rendering with future WebGL support
- 📱 **Adaptive Quality**: Automatic performance optimization based on device capabilities
- 🎵 **Audio Integration**: Synchronized audio tracks with fade effects and WebAudio API
- 🔧 **TypeScript**: Full type safety with comprehensive interfaces and definitions
- 📦 **Tree Shakeable**: ESM/CJS dual output with optimized bundles and tree-shaking
- 🎭 **Layer System**: Extensible plugin architecture for custom visual elements
- 🎬 **CLI Tools**: Validation and preview tools for development workflow

## Installation

```bash
npm install cinematic-renderer2d
```

## Documentation

📚 **[Complete Documentation](./docs/index.html)** - Interactive documentation landing page

### Quick Links
- 🚀 [Getting Started Guide](./docs/GETTING_STARTED.md) - Installation and quick start
- 📖 [API Reference](./docs/API.md) - Complete API documentation
- 💡 [Examples Guide](./docs/EXAMPLES.md) - Learn from example patterns
- ⚛️ [React Integration](./docs/REACT_INTEGRATION.md) - Using with React
- 🅰️ [Angular Integration](./docs/ANGULAR_INTEGRATION.md) - Using with Angular
- ⚡ [Performance Guide](./docs/PERFORMANCE.md) - Optimization tips
- 🎮 [Interactive Playground](./playground/index.html) - Try it live!

## Quick Start

### Basic Usage

```typescript
import { CinematicRenderer2D } from 'cinematic-renderer2d';

const renderer = new CinematicRenderer2D({
  container: document.getElementById('cinematic-container'),
  spec: {
    schemaVersion: '1.0.0',
    engine: { 
      targetFps: 60, 
      quality: 'auto',
      debug: false 
    },
    events: [{
      id: 'intro',
      name: 'Introduction',
      scenes: ['scene1']
    }],
    scenes: [{
      id: 'scene1',
      name: 'Opening Scene',
      duration: 5000,
      layers: [{
        id: 'background',
        type: 'gradient',
        zIndex: 1,
        config: {
          opacity: 1,
          colors: ['#000000', '#333333']
        },
        animations: [{
          property: 'opacity',
          from: 0,
          to: 1,
          startMs: 0,
          endMs: 1000,
          easing: 'ease-in-out'
        }]
      }]
    }]
  }
});

// Mount and start playback
await renderer.mount();
renderer.play();

// Event handling
renderer.on('play', () => console.log('Playback started'));
renderer.on('pause', () => console.log('Playback paused'));
renderer.on('end', () => console.log('Playback completed'));
```

### Navigation and Control

```typescript
// Playback control
renderer.play();
renderer.pause();
renderer.stop();

// Navigation
renderer.seek(2500); // Seek to 2.5 seconds
renderer.goToEvent('intro');
renderer.goToScene('scene1');

// Quality control
renderer.setQuality('high'); // 'low', 'medium', 'high', 'ultra', 'auto'

// Cleanup
renderer.destroy();
```

## Framework Adapters

### React

```tsx
import { CinematicPlayer } from 'cinematic-renderer2d/react';

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  
  return (
    <CinematicPlayer
      spec={cinematicSpec}
      autoplay={true}
      onPlay={() => setIsPlaying(true)}
      onPause={() => setIsPlaying(false)}
      onEnd={() => setIsPlaying(false)}
      onError={(error) => console.error('Playback error:', error)}
    />
  );
}
```

#### React Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `spec` | `CinematicSpec` | required | JSON specification for the cinematic experience |
| `autoplay` | `boolean` | `false` | Start playback automatically when mounted |
| `quality` | `QualityLevel` | `'auto'` | Quality level: 'low', 'medium', 'high', 'ultra', 'auto' |
| `debug` | `boolean` | `false` | Enable debug overlay with performance metrics |
| `onPlay` | `() => void` | - | Called when playback starts |
| `onPause` | `() => void` | - | Called when playback pauses |
| `onStop` | `() => void` | - | Called when playback stops |
| `onEnd` | `() => void` | - | Called when playback completes |
| `onError` | `(error: Error) => void` | - | Called when an error occurs |

### Angular

```typescript
import { CinematicPlayerComponent } from 'cinematic-renderer2d/angular';

@Component({
  selector: 'app-root',
  template: `
    <cinematic-player
      [spec]="cinematicSpec"
      [autoplay]="true"
      [quality]="'auto'"
      [debug]="false"
      (play)="onPlay()"
      (pause)="onPause()"
      (end)="onEnd()"
      (error)="onError($event)">
    </cinematic-player>
  `
})
export class AppComponent {
  cinematicSpec: CinematicSpec = {
    // Your specification here
  };
  
  onPlay() { console.log('Playing'); }
  onPause() { console.log('Paused'); }
  onEnd() { console.log('Ended'); }
  onError(error: Error) { console.error('Error:', error); }
}
```

#### Angular Inputs/Outputs

**Inputs:**
- `spec: CinematicSpec` - JSON specification (required)
- `autoplay: boolean` - Auto-start playback (default: false)
- `quality: QualityLevel` - Quality level (default: 'auto')
- `debug: boolean` - Enable debug mode (default: false)

**Outputs:**
- `play: EventEmitter<void>` - Playback started
- `pause: EventEmitter<void>` - Playback paused
- `stop: EventEmitter<void>` - Playback stopped
- `end: EventEmitter<void>` - Playback completed
- `error: EventEmitter<Error>` - Error occurred

## JSON Specification Format

### Schema Structure

```typescript
interface CinematicSpec {
  schemaVersion: string;           // Currently '1.0.0'
  engine: EngineConfig;           // Engine configuration
  events: CinematicEvent[];       // High-level sequences
  scenes: CinematicScene[];       // Individual scenes
  assets?: AssetDefinition[];     // Optional assets
}

interface EngineConfig {
  targetFps?: number;             // Target frame rate (default: 60)
  quality?: QualityLevel;         // Quality level (default: 'auto')
  debug?: boolean;                // Debug mode (default: false)
  autoplay?: boolean;             // Auto-start (default: false)
}
```

### Events and Scenes

```typescript
interface CinematicEvent {
  id: string;                     // Unique identifier
  name: string;                   // Display name
  scenes: string[];               // Scene IDs in order
  transitions?: TransitionSpec[]; // Optional transitions
}

interface CinematicScene {
  id: string;                     // Unique identifier
  name: string;                   // Display name
  duration: number;               // Duration in milliseconds
  layers: LayerSpec[];            // Visual layers
  audio?: AudioTrackSpec[];       // Optional audio tracks
}
```

### Layers and Animations

```typescript
interface LayerSpec {
  id: string;                     // Unique identifier
  type: LayerType;                // Layer type (see Layer Types)
  zIndex: number;                 // Rendering order
  config: LayerConfig;            // Layer-specific configuration
  animations?: AnimationTrackSpec[]; // Optional animations
}

interface AnimationTrackSpec {
  property: string;               // Property to animate
  from: any;                      // Starting value
  to: any;                        // Ending value
  startMs: number;                // Start time in milliseconds
  endMs: number;                  // End time in milliseconds
  easing?: EasingType;            // Easing function (default: 'ease')
  loop?: boolean;                 // Loop animation (default: false)
  yoyo?: boolean;                 // Reverse on loop (default: false)
}
```

## Layer Types

### DOM Layers

#### Gradient Layer
```json
{
  "type": "gradient",
  "config": {
    "colors": ["#ff0000", "#0000ff"],
    "direction": "to bottom",
    "opacity": 1
  }
}
```

#### Image Layer
```json
{
  "type": "image",
  "config": {
    "src": "path/to/image.jpg",
    "width": "100%",
    "height": "100%",
    "objectFit": "cover"
  }
}
```

#### Text Block Layer
```json
{
  "type": "textBlock",
  "config": {
    "text": "Hello World",
    "fontSize": "24px",
    "color": "#ffffff",
    "textAlign": "center"
  }
}
```

#### Vignette Layer
```json
{
  "type": "vignette",
  "config": {
    "intensity": 0.5,
    "color": "#000000",
    "radius": "50%"
  }
}
```

### Canvas2D Layers

#### Particles Layer
```json
{
  "type": "particles",
  "config": {
    "count": 100,
    "size": 2,
    "color": "#ffffff",
    "speed": 1,
    "direction": "up"
  }
}
```

#### Starfield Layer
```json
{
  "type": "starfield",
  "config": {
    "density": 0.5,
    "twinkle": true,
    "colors": ["#ffffff", "#ffffcc"]
  }
}
```

## Animation System

### Easing Functions

Supported easing functions:
- **Linear**: `linear`
- **Standard**: `ease`, `ease-in`, `ease-out`, `ease-in-out`
- **Sine**: `ease-in-sine`, `ease-out-sine`, `ease-in-out-sine`
- **Quadratic**: `ease-in-quad`, `ease-out-quad`, `ease-in-out-quad`
- **Cubic**: `ease-in-cubic`, `ease-out-cubic`, `ease-in-out-cubic`
- **Quartic**: `ease-in-quart`, `ease-out-quart`, `ease-in-out-quart`
- **Quintic**: `ease-in-quint`, `ease-out-quint`, `ease-in-out-quint`
- **Exponential**: `ease-in-expo`, `ease-out-expo`, `ease-in-out-expo`
- **Circular**: `ease-in-circ`, `ease-out-circ`, `ease-in-out-circ`
- **Back**: `ease-in-back`, `ease-out-back`, `ease-in-out-back`
- **Elastic**: `ease-in-elastic`, `ease-out-elastic`, `ease-in-out-elastic`
- **Bounce**: `ease-in-bounce`, `ease-out-bounce`, `ease-in-out-bounce`
- **Custom**: `cubic-bezier(x1,y1,x2,y2)`

### Animation Examples

```json
{
  "animations": [
    {
      "property": "opacity",
      "from": 0,
      "to": 1,
      "startMs": 0,
      "endMs": 1000,
      "easing": "ease-in-out"
    },
    {
      "property": "transform.scale",
      "from": 0.5,
      "to": 1.2,
      "startMs": 500,
      "endMs": 1500,
      "easing": "ease-out-back"
    },
    {
      "property": "config.color",
      "from": "#ff0000",
      "to": "#0000ff",
      "startMs": 0,
      "endMs": 2000,
      "easing": "linear"
    }
  ]
}
```

## Audio System

### Audio Track Configuration

```typescript
interface AudioTrackSpec {
  id: string;                     // Unique identifier
  type: AudioTrackType;           // Track type
  src: string;                    // Audio file path/URL
  startMs: number;                // Start time in milliseconds
  endMs?: number;                 // End time (optional)
  volume?: number;                // Volume 0-1 (default: 1)
  fadeIn?: number;                // Fade in duration (default: 0)
  fadeOut?: number;               // Fade out duration (default: 0)
  loop?: boolean;                 // Loop track (default: false)
}

type AudioTrackType = 'voiceover' | 'ambience' | 'transition' | 'music' | 'sfx';
```

### Audio Example

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
      "loop": true
    },
    {
      "id": "narrator",
      "type": "voiceover",
      "src": "audio/narration.mp3",
      "startMs": 2000,
      "volume": 1.0,
      "fadeIn": 500,
      "fadeOut": 500
    }
  ]
}
```

## Performance Optimization

### Quality Levels

The library automatically adapts performance based on device capabilities:

- **Ultra**: Maximum quality, all effects enabled
- **High**: High quality with some optimizations
- **Medium**: Balanced quality and performance
- **Low**: Optimized for performance, reduced effects
- **Auto**: Automatically adjusts based on device performance

### Performance Guidelines

1. **Layer Count**: Keep layers under 20 per scene for optimal performance
2. **Animation Complexity**: Prefer transform and opacity animations over layout changes
3. **Asset Optimization**: Use compressed images and audio files
4. **Canvas Particles**: Limit particle count based on target devices
5. **Audio Tracks**: Use compressed audio formats (MP3, AAC)

### Device-Specific Optimizations

```typescript
// The library automatically detects and optimizes for:
// - Device pixel ratio for sharp rendering
// - Available memory for asset caching
// - CPU capabilities for animation complexity
// - Network conditions for asset loading
// - Battery status for power-efficient rendering
```

## CLI Tools

### Installation

The CLI is included with the package:

```bash
npx cinematic-cli --help
```

### Commands

#### Validate Specification

```bash
# Basic validation
npx cinematic-cli validate --file spec.json

# Verbose output with details
npx cinematic-cli validate --file spec.json --verbose

# Save validation report
npx cinematic-cli validate --file spec.json --output report.json
```

#### Generate Preview

```bash
# Generate HTML preview
npx cinematic-cli preview --file spec.json

# Save to specific file
npx cinematic-cli preview --file spec.json --output preview.html
```

## TypeScript Support

### Core Interfaces

```typescript
import type {
  CinematicRenderer2D,
  CinematicSpec,
  CinematicEvent,
  CinematicScene,
  LayerSpec,
  AnimationTrackSpec,
  AudioTrackSpec,
  QualityLevel,
  LayerType,
  EasingType
} from 'cinematic-renderer2d';
```

### Custom Layer Development

```typescript
import type { ICinematicLayer, LayerMountContext, FrameContext } from 'cinematic-renderer2d';

class CustomLayer implements ICinematicLayer {
  id: string;
  type: string;
  zIndex: number;
  
  constructor(config: any) {
    this.id = config.id;
    this.type = config.type;
    this.zIndex = config.zIndex;
  }
  
  mount(ctx: LayerMountContext): void {
    // Initialize layer
  }
  
  update(ctx: FrameContext): void {
    // Update layer per frame
  }
  
  destroy(): void {
    // Cleanup resources
  }
}
```

## Examples

### Complete Specification Example

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
      "id": "intro",
      "name": "Introduction Sequence",
      "scenes": ["fade-in", "title-reveal", "fade-out"]
    }
  ],
  "scenes": [
    {
      "id": "fade-in",
      "name": "Fade In",
      "duration": 2000,
      "layers": [
        {
          "id": "background",
          "type": "gradient",
          "zIndex": 1,
          "config": {
            "colors": ["#000000", "#1a1a1a"],
            "direction": "to bottom"
          },
          "animations": [
            {
              "property": "opacity",
              "from": 0,
              "to": 1,
              "startMs": 0,
              "endMs": 2000,
              "easing": "ease-in-out"
            }
          ]
        }
      ]
    },
    {
      "id": "title-reveal",
      "name": "Title Reveal",
      "duration": 3000,
      "layers": [
        {
          "id": "title",
          "type": "textBlock",
          "zIndex": 2,
          "config": {
            "text": "Welcome to CinematicRenderer2D",
            "fontSize": "48px",
            "color": "#ffffff",
            "textAlign": "center"
          },
          "animations": [
            {
              "property": "transform.scale",
              "from": 0.5,
              "to": 1,
              "startMs": 0,
              "endMs": 1000,
              "easing": "ease-out-back"
            },
            {
              "property": "opacity",
              "from": 0,
              "to": 1,
              "startMs": 0,
              "endMs": 800,
              "easing": "ease-out"
            }
          ]
        }
      ],
      "audio": [
        {
          "id": "title-sound",
          "type": "sfx",
          "src": "audio/title-reveal.mp3",
          "startMs": 500,
          "volume": 0.8,
          "fadeIn": 200
        }
      ]
    }
  ]
}
```

## Development

### Project Structure

```
src/
├── core/                    # Core engine and interfaces
│   ├── CinematicRenderer2D.ts
│   ├── LayerRegistry.ts
│   ├── Scheduler.ts
│   └── interfaces/
├── types/                   # TypeScript definitions
│   ├── CinematicSpec.ts
│   ├── CompiledSpec.ts
│   └── AssetTypes.ts
├── parsing/                 # JSON specification parsing
│   └── SpecParser.ts
├── animation/               # Animation system
│   └── AnimationCompiler.ts
├── rendering/               # Rendering backends
│   ├── RenderBackend.ts
│   ├── dom/
│   └── canvas2d/
├── assets/                  # Asset management
│   └── AssetManager.ts
├── audio/                   # Audio system
│   └── AudioSystem.ts
├── performance/             # Performance monitoring
│   └── QualitySystem.ts
├── debug/                   # Debug tools
│   └── DebugOverlay.ts
├── cli/                     # CLI tools
│   └── index.ts
└── adapters/                # Framework adapters
    ├── react/
    └── angular/
```

### Available Scripts

```bash
npm run dev              # Start development playground
npm run build            # Build library for production
npm run build:check      # Build and validate output
npm run test             # Run test suite
npm run test:ui          # Run tests with UI
npm run test:coverage    # Run tests with coverage
npm run lint             # Lint code
npm run lint:fix         # Fix linting issues
npm run typecheck        # Type checking
npm run preview          # Preview built playground
npm run changeset        # Create changeset for release
npm run version          # Update version with changesets
npm run release          # Publish to NPM
```

### Testing

The project uses comprehensive testing with:
- **Unit Tests**: Specific functionality testing
- **Property-Based Tests**: Universal behavior validation
- **Integration Tests**: End-to-end workflow testing
- **Build Tests**: Distribution package validation

```bash
# Run all tests
npm test

# Run specific test file
npm test -- src/core/Scheduler.test.ts

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm run test:coverage
```

## Browser Support

- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Node.js**: 16.0.0+ (for CLI tools)
- **ES Modules**: Full ESM support with CJS fallback
- **TypeScript**: 4.5+ for full type support

## Performance Benchmarks

Typical performance on modern devices:
- **Desktop**: 120fps with 50+ layers
- **Mobile**: 60fps with 20+ layers
- **Bundle Size**: ~83KB minified + gzipped
- **Memory Usage**: <50MB for complex scenes
- **Startup Time**: <100ms initialization

## Troubleshooting

### Common Issues

**Build Errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Type Errors**
```bash
# Ensure TypeScript is up to date
npm install typescript@latest --save-dev
npm run typecheck
```

**Performance Issues**
- Reduce layer count per scene
- Use 'low' or 'medium' quality settings
- Optimize asset file sizes
- Enable debug mode to monitor FPS

### Debug Mode

Enable debug mode to monitor performance:

```typescript
const renderer = new CinematicRenderer2D({
  container: element,
  spec: {
    // ... your spec
    engine: { debug: true }
  }
});
```

Debug overlay shows:
- Current FPS and frame time
- Active layers and their status
- Memory usage statistics
- Quality level and adaptations

## Contributing

This project follows semantic versioning and uses changesets for release management. 

### Development Setup

```bash
git clone https://github.com/rvshekhar10/cinematic-renderer2d.git
cd cinematic-renderer2d
npm install
npm run dev
```

### Creating Changes

```bash
# Make your changes
npm run changeset  # Document your changes
npm run test       # Ensure tests pass
npm run build      # Verify build works
```

### Publishing to NPM

See our publishing guides:
- 🚀 [Quick Publish Guide](./QUICK_PUBLISH.md) - Fast 5-minute guide
- 📚 [Complete Publishing Guide](./PUBLISHING.md) - Detailed instructions
- ✅ [Publishing Checklist](./PUBLISH_CHECKLIST.md) - Step-by-step checklist

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- 📖 **Documentation**: This README and TypeScript definitions
- 🐛 **Issues**: [GitHub Issues](https://github.com/rvshekhar10/cinematic-renderer2d/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/rvshekhar10/cinematic-renderer2d/discussions)
- 📧 **Email**: support@cinematicrenderer2d.com