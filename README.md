# cinematicRenderer2D

High-performance, framework-agnostic NPM library that renders cinematic experiences from JSON specifications targeting 60-120fps performance.

## Features

- 🚀 **High Performance**: Targets 60-120fps with optimized rendering backends
- 🎯 **Framework Agnostic**: Works with React, Angular, Vue, or plain JavaScript
- 🎨 **Multiple Backends**: DOM, Canvas2D, and future WebGL support
- 📱 **Responsive**: Automatic quality adaptation based on device capabilities
- 🎵 **Audio Integration**: Synchronized audio tracks with fade effects
- 🔧 **TypeScript**: Full type safety with comprehensive interfaces
- 📦 **Tree Shakeable**: ESM/CJS dual output with optimized bundles

## Installation

```bash
npm install cinematic-renderer2d
```

## Quick Start

```typescript
import { CinematicRenderer2D } from 'cinematic-renderer2d';

const renderer = new CinematicRenderer2D({
  container: document.getElementById('cinematic-container'),
  spec: {
    schemaVersion: '1.0.0',
    engine: { targetFps: 60, quality: 'auto' },
    events: [/* your cinematic events */],
    scenes: [/* your cinematic scenes */],
  },
});

await renderer.mount();
renderer.play();
```

## Framework Adapters

### React

```tsx
import { CinematicPlayer } from 'cinematic-renderer2d/react';

function App() {
  return (
    <CinematicPlayer
      spec={cinematicSpec}
      autoplay={true}
      onPlay={() => console.log('Playing')}
      onPause={() => console.log('Paused')}
    />
  );
}
```

### Angular

```typescript
import { CinematicPlayerComponent } from 'cinematic-renderer2d/angular';

@Component({
  template: `
    <cinematic-player
      [spec]="cinematicSpec"
      [autoplay]="true"
      (play)="onPlay()"
      (pause)="onPause()">
    </cinematic-player>
  `
})
export class AppComponent {
  cinematicSpec = { /* your spec */ };
}
```

## Development

This project is currently under development. The core infrastructure has been set up with:

- ✅ TypeScript configuration with strict settings
- ✅ ESM/CJS dual output build system with tsup
- ✅ Testing framework with Vitest and fast-check for property-based testing
- ✅ Development playground with Vite
- ✅ Linting with ESLint and TypeScript
- ✅ Semantic versioning with changesets

### Available Scripts

```bash
npm run dev        # Start development playground
npm run build      # Build library for production
npm run test       # Run test suite
npm run test:ui    # Run tests with UI
npm run lint       # Lint code
npm run typecheck  # Type checking
npm run preview    # Preview built playground
npm run release    # Publish to NPM
```

### Project Structure

```
src/
├── core/              # Core engine and interfaces
├── types/             # TypeScript type definitions
├── parsing/           # JSON specification parsing
├── animation/         # Animation compilation system
├── rendering/         # Rendering backends (DOM, Canvas2D)
├── assets/            # Asset management
├── audio/             # Audio system
├── performance/       # Quality and performance monitoring
└── adapters/          # Framework adapters (React, Angular)
```

## Roadmap

The library is being built incrementally with the following major milestones:

1. **Core Engine** - Basic renderer with lifecycle management
2. **JSON Specification System** - Parsing and validation with Zod
3. **Animation System** - Compiled animation tracks with easing
4. **Rendering Backends** - DOM and Canvas2D implementations
5. **Performance Systems** - Adaptive quality and scheduling
6. **Asset & Audio** - Resource management and audio integration
7. **Framework Adapters** - React and Angular components
8. **Developer Tools** - Debug system, CLI, and documentation

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

This project is currently in active development. Contributions will be welcomed once the core architecture is complete.