# cinematicRenderer2D Documentation

Welcome to the complete documentation for **cinematicRenderer2D** - a high-performance, framework-agnostic library for creating cinematic experiences from JSON specifications.

## 📚 Documentation Index

### Getting Started
- **[Documentation Home](./index.html)** - Main documentation landing page with overview
- **[Getting Started Guide](./GETTING_STARTED.md)** - Installation and quick start
- **[Examples Guide](./EXAMPLES.md)** - Learn from example patterns and templates

### Core Documentation
- **[API Reference](./API.md)** - Complete API documentation with all interfaces and methods
- **[Performance Guide](./PERFORMANCE.md)** - Optimization tips and best practices

### Framework Integration
- **[React Integration](./REACT_INTEGRATION.md)** - Using with React applications
- **[Angular Integration](./ANGULAR_INTEGRATION.md)** - Using with Angular applications

### Interactive Tools
- **[Playground](../playground/index.html)** - Interactive playground for testing specifications

## 🚀 Quick Links

### For New Users
1. Start with the [Getting Started Guide](./GETTING_STARTED.md)
2. Try the [Interactive Playground](../playground/index.html)
3. Explore [Examples](./EXAMPLES.md)

### For Developers
1. Review the [API Reference](./API.md)
2. Check [Performance Guidelines](./PERFORMANCE.md)
3. See framework-specific guides: [React](./REACT_INTEGRATION.md) | [Angular](./ANGULAR_INTEGRATION.md)

## 📦 Installation

```bash
npm install cinematic-renderer2d
```

## ⚡ Quick Example

```typescript
import { CinematicRenderer2D } from 'cinematic-renderer2d';

const renderer = new CinematicRenderer2D({
  container: document.getElementById('container'),
  spec: {
    schemaVersion: '1.0.0',
    engine: { targetFps: 60, quality: 'auto' },
    events: [{ id: 'intro', name: 'Intro', scenes: ['scene1'] }],
    scenes: [{
      id: 'scene1',
      name: 'First Scene',
      duration: 3000,
      layers: [{
        id: 'bg',
        type: 'gradient',
        zIndex: 1,
        config: { colors: ['#667eea', '#764ba2'] }
      }]
    }]
  }
});

await renderer.mount();
renderer.play();
```

## 🎯 Key Features

- **High Performance**: 60-120fps with optimized rendering
- **Framework Agnostic**: Works with React, Angular, Vue, or vanilla JS
- **Multiple Backends**: DOM and Canvas2D rendering
- **Adaptive Quality**: Automatic performance optimization
- **Audio Integration**: Synchronized audio tracks
- **TypeScript**: Full type safety and auto-completion

## 📖 Documentation Structure

```
docs/
├── index.html              # Main documentation landing page
├── README.md               # This file - documentation index
├── GETTING_STARTED.md      # Installation and quick start
├── API.md                  # Complete API reference
├── EXAMPLES.md             # Example patterns and templates
├── REACT_INTEGRATION.md    # React integration guide
├── ANGULAR_INTEGRATION.md  # Angular integration guide
└── PERFORMANCE.md          # Performance optimization guide
```

## 🎮 Interactive Playground

The [playground](../playground/index.html) provides an interactive environment to:
- Load and test example specifications
- Edit JSON specifications in real-time
- Preview rendering with live controls
- Monitor performance metrics
- Export specifications for your projects

## 🤝 Contributing

We welcome contributions! Please see our [GitHub repository](https://github.com/rvshekhar10/cinematic-renderer2d) for:
- Issue tracking
- Feature requests
- Pull request guidelines
- Development setup

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/rvshekhar10/cinematic-renderer2d/issues)
- **Discussions**: [GitHub Discussions](https://github.com/rvshekhar10/cinematic-renderer2d/discussions)
- **Email**: support@cinematicrenderer2d.com

## 📄 License

MIT License - see [LICENSE](../LICENSE) file for details.

---

**Ready to get started?** Head to the [Getting Started Guide](./GETTING_STARTED.md) or try the [Interactive Playground](../playground/index.html)!
