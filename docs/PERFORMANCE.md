# Performance Optimization Guide

This guide provides comprehensive recommendations for optimizing cinematicRenderer2D performance across different devices and use cases.

## Performance Overview

CinematicRenderer2D is designed for high-performance rendering with the following targets:
- **Desktop**: 120fps with 50+ layers
- **Mobile**: 60fps with 20+ layers  
- **Bundle Size**: ~83KB minified + gzipped
- **Memory Usage**: <50MB for complex scenes
- **Startup Time**: <100ms initialization

## Quality System

### Quality Levels

The library provides five quality levels that automatically adjust rendering parameters:

```typescript
type QualityLevel = 'low' | 'medium' | 'high' | 'ultra' | 'auto';
```

#### Quality Level Details

| Level | Particle Count | Texture Resolution | Shadow Quality | Animation Precision |
|-------|---------------|-------------------|----------------|-------------------|
| **Low** | 50-100 | 0.5x | Disabled | 30fps interpolation |
| **Medium** | 100-300 | 0.75x | Basic | 60fps interpolation |
| **High** | 300-500 | 1.0x | Enhanced | 60fps interpolation |
| **Ultra** | 500-1000+ | 1.5x | Maximum | 120fps interpolation |
| **Auto** | Dynamic | Dynamic | Dynamic | Dynamic |

### Auto Quality Adaptation

The auto quality system monitors performance and adapts in real-time:

```typescript
// Enable auto quality (default)
renderer.setQuality('auto');

// Monitor quality changes
renderer.on('qualityChange', (newQuality: QualityLevel) => {
  console.log('Quality adapted to:', newQuality);
});
```

#### Adaptation Triggers

- **FPS drops below 55**: Reduce to lower quality level
- **Consistent 60+ FPS**: Gradually increase quality
- **Memory pressure**: Reduce particle counts and texture resolution
- **Battery low**: Switch to power-efficient rendering
- **Thermal throttling**: Reduce computational load

## Layer Optimization

### Layer Count Guidelines

Recommended maximum layer counts per scene:

| Device Type | Recommended | Maximum |
|-------------|-------------|---------|
| **High-end Desktop** | 30-50 | 100+ |
| **Mid-range Desktop** | 20-30 | 50 |
| **High-end Mobile** | 15-25 | 40 |
| **Mid-range Mobile** | 10-15 | 25 |
| **Low-end Mobile** | 5-10 | 15 |

### Layer Type Performance

Different layer types have varying performance characteristics:

#### DOM Layers (Fastest)
```typescript
// Highly optimized - use for static content
{
  type: 'gradient',     // Fastest - CSS gradients
  type: 'image',        // Fast - cached images
  type: 'textBlock',    // Fast - text rendering
  type: 'vignette'      // Medium - CSS filters
}
```

#### Canvas2D Layers (Medium)
```typescript
// Moderate performance - use for dynamic content
{
  type: 'particles',    // Medium - depends on count
  type: 'starfield',    // Medium - optimized rendering
  type: 'dust',         // Medium - particle-based
  type: 'nebulaNoise'   // Slower - complex calculations
}
```

### Layer Optimization Techniques

#### 1. Z-Index Optimization
```typescript
// Group layers by z-index to minimize state changes
const optimizedLayers = [
  { id: 'bg1', zIndex: 1, type: 'gradient' },
  { id: 'bg2', zIndex: 2, type: 'image' },
  { id: 'fg1', zIndex: 10, type: 'particles' },
  { id: 'fg2', zIndex: 11, type: 'textBlock' }
];
```

#### 2. Visibility Culling
```typescript
// Use visibility to disable off-screen layers
{
  id: 'offscreen-layer',
  type: 'particles',
  config: {
    visible: false  // Completely skips rendering
  }
}
```

#### 3. Layer Pooling
```typescript
// Reuse layer configurations for similar content
const layerTemplate = {
  type: 'particles',
  config: {
    count: 100,
    size: 2,
    speed: 1
  }
};

// Create variations without duplicating heavy configs
const layer1 = { ...layerTemplate, id: 'particles1', config: { ...layerTemplate.config, color: '#ff0000' }};
const layer2 = { ...layerTemplate, id: 'particles2', config: { ...layerTemplate.config, color: '#00ff00' }};
```

## Animation Optimization

### Animation Performance Best Practices

#### 1. Prefer Transform and Opacity
```typescript
// GOOD - GPU accelerated properties
{
  property: 'transform.scale',
  from: 0.5,
  to: 1.2,
  easing: 'ease-out'
}

{
  property: 'opacity',
  from: 0,
  to: 1,
  easing: 'ease-in-out'
}

// AVOID - Layout-triggering properties
{
  property: 'config.width',    // Triggers layout
  property: 'config.height',   // Triggers layout
  property: 'config.left'      // Triggers layout
}
```

#### 2. Animation Compilation
```typescript
// Animations are precompiled for optimal performance
const optimizedTrack: AnimationTrackSpec = {
  property: 'transform.scale',
  from: 1,
  to: 1.5,
  startMs: 0,
  endMs: 1000,
  easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)' // Precompiled easing
};
```

#### 3. Animation Batching
```typescript
// Batch similar animations to the same timeframe
const batchedAnimations = [
  {
    property: 'opacity',
    from: 0, to: 1,
    startMs: 0, endMs: 500,
    easing: 'ease-out'
  },
  {
    property: 'transform.scale',
    from: 0.8, to: 1,
    startMs: 0, endMs: 500,  // Same timing
    easing: 'ease-out'       // Same easing
  }
];
```

### Easing Function Performance

Different easing functions have varying computational costs:

| Easing Type | Performance | Use Case |
|-------------|-------------|----------|
| `linear` | Fastest | Simple transitions |
| `ease`, `ease-in-out` | Fast | Standard animations |
| `cubic-bezier()` | Medium | Custom curves |
| `ease-*-elastic` | Slower | Special effects |
| `ease-*-bounce` | Slower | Playful animations |

## Asset Optimization

### Image Optimization

#### 1. Format Selection
```typescript
// Recommended formats by use case
const assetOptimization = {
  // Photos and complex images
  photos: 'webp',      // Best compression
  fallback: 'jpg',     // Wide support
  
  // Graphics and logos
  graphics: 'webp',    // Best compression
  fallback: 'png',     // Transparency support
  
  // Simple graphics
  simple: 'svg',       // Vector, scalable
  
  // Animations
  animations: 'webp',  // Animated WebP
  fallback: 'gif'      // Wide support
};
```

#### 2. Resolution Guidelines
```typescript
const resolutionGuidelines = {
  // Base resolution for 1x displays
  base: { width: 1920, height: 1080 },
  
  // High DPI displays (2x)
  highDPI: { width: 3840, height: 2160 },
  
  // Mobile optimization
  mobile: { width: 1280, height: 720 },
  
  // Thumbnail/preview
  thumbnail: { width: 640, height: 360 }
};
```

#### 3. Preloading Strategy
```typescript
const assetPreloadingStrategy = {
  // Critical assets - preload immediately
  critical: {
    preload: true,
    priority: 'high'
  },
  
  // Scene-specific assets - lazy load
  sceneSpecific: {
    preload: false,
    priority: 'normal'
  },
  
  // Background assets - lowest priority
  background: {
    preload: false,
    priority: 'low'
  }
};
```

### Audio Optimization

#### 1. Audio Format Selection
```typescript
const audioFormats = {
  // High quality music
  music: {
    format: 'aac',      // Best quality/size ratio
    bitrate: '128kbps', // Sufficient for most content
    fallback: 'mp3'
  },
  
  // Voice/narration
  voice: {
    format: 'aac',
    bitrate: '64kbps',  // Lower bitrate for voice
    fallback: 'mp3'
  },
  
  // Sound effects
  sfx: {
    format: 'webm',     // Good for short clips
    bitrate: '96kbps',
    fallback: 'ogg'
  }
};
```

#### 2. Audio Loading Strategy
```typescript
// Optimize audio loading based on usage
const audioLoadingStrategy = {
  // Background music - stream
  ambience: {
    preload: 'metadata',  // Load metadata only
    streaming: true
  },
  
  // Sound effects - preload
  sfx: {
    preload: 'auto',      // Fully preload
    streaming: false
  },
  
  // Voiceover - progressive
  voiceover: {
    preload: 'metadata',
    streaming: true,
    buffering: 'progressive'
  }
};
```

## Memory Management

### Memory Usage Guidelines

#### 1. Asset Memory Limits
```typescript
const memoryLimits = {
  // Total asset memory budget
  total: '100MB',
  
  // Per-asset type limits
  images: '50MB',
  audio: '30MB',
  other: '20MB',
  
  // Individual asset limits
  singleImage: '5MB',
  singleAudio: '10MB'
};
```

#### 2. Garbage Collection Optimization
```typescript
// Implement proper cleanup
class OptimizedCinematicRenderer {
  private assets = new Map();
  private layers = new Map();
  
  destroy(): void {
    // Clear all references
    this.assets.clear();
    this.layers.clear();
    
    // Force garbage collection hint
    if (window.gc) {
      window.gc();
    }
  }
  
  // Implement object pooling for frequently created objects
  private particlePool: Particle[] = [];
  
  getParticle(): Particle {
    return this.particlePool.pop() || new Particle();
  }
  
  releaseParticle(particle: Particle): void {
    particle.reset();
    this.particlePool.push(particle);
  }
}
```

### Memory Monitoring

```typescript
// Monitor memory usage in development
function monitorMemory(): void {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    console.log({
      used: `${Math.round(memory.usedJSHeapSize / 1048576)}MB`,
      total: `${Math.round(memory.totalJSHeapSize / 1048576)}MB`,
      limit: `${Math.round(memory.jsHeapSizeLimit / 1048576)}MB`
    });
  }
}

// Call periodically during development
setInterval(monitorMemory, 5000);
```

## Device-Specific Optimizations

### Mobile Optimization

#### 1. Touch and Gesture Handling
```typescript
// Optimize for mobile interactions
const mobileOptimizations = {
  // Reduce particle counts on mobile
  particleCount: window.innerWidth < 768 ? 50 : 200,
  
  // Lower quality on mobile by default
  defaultQuality: window.innerWidth < 768 ? 'medium' : 'high',
  
  // Disable expensive effects on mobile
  enableComplexEffects: window.innerWidth >= 768,
  
  // Optimize for touch
  touchOptimized: true
};
```

#### 2. Battery and Thermal Management
```typescript
// Respect battery and thermal states
function adaptToPowerState(): void {
  // Battery API (where supported)
  if ('getBattery' in navigator) {
    (navigator as any).getBattery().then((battery: any) => {
      if (battery.level < 0.2) {
        renderer.setQuality('low');
      }
      
      battery.addEventListener('levelchange', () => {
        if (battery.level < 0.2) {
          renderer.setQuality('low');
        }
      });
    });
  }
  
  // Thermal state (experimental)
  if ('deviceMemory' in navigator) {
    const deviceMemory = (navigator as any).deviceMemory;
    if (deviceMemory < 4) {
      renderer.setQuality('medium');
    }
  }
}
```

### Desktop Optimization

#### 1. High Refresh Rate Support
```typescript
// Optimize for high refresh rate displays
function optimizeForHighRefreshRate(): void {
  const refreshRate = screen.refreshRate || 60;
  
  if (refreshRate >= 120) {
    renderer.setTargetFPS(120);
    renderer.setQuality('ultra');
  } else if (refreshRate >= 90) {
    renderer.setTargetFPS(90);
    renderer.setQuality('high');
  }
}
```

#### 2. Multi-core Utilization
```typescript
// Use Web Workers for heavy computations (when available)
const useWebWorkers = {
  // Particle system calculations
  particles: true,
  
  // Audio processing
  audio: true,
  
  // Asset loading
  assetLoading: true,
  
  // Animation calculations
  animations: false  // Keep on main thread for DOM access
};
```

## Profiling and Debugging

### Performance Monitoring

#### 1. Built-in Debug Mode
```typescript
// Enable debug mode for performance monitoring
const renderer = new CinematicRenderer2D({
  container: element,
  spec: cinematicSpec,
  debug: true  // Shows FPS, memory, layer count
});
```

#### 2. Custom Performance Metrics
```typescript
// Implement custom performance tracking
class PerformanceTracker {
  private frameCount = 0;
  private lastTime = performance.now();
  
  trackFrame(): void {
    this.frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - this.lastTime >= 1000) {
      const fps = this.frameCount;
      console.log(`FPS: ${fps}`);
      
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
  }
  
  trackMemory(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      };
    }
  }
}
```

### Browser DevTools Integration

#### 1. Performance Timeline
```typescript
// Mark important events for DevTools
function markPerformanceEvents(): void {
  performance.mark('cinematic-start');
  
  // ... cinematic operations
  
  performance.mark('cinematic-end');
  performance.measure('cinematic-duration', 'cinematic-start', 'cinematic-end');
}
```

#### 2. Memory Profiling
```typescript
// Profile memory usage patterns
function profileMemory(): void {
  // Take heap snapshots at key points
  console.profile('cinematic-memory');
  
  // ... operations to profile
  
  console.profileEnd('cinematic-memory');
}
```

## Bundle Size Optimization

### Tree Shaking

```typescript
// Import only what you need
import { CinematicRenderer2D } from 'cinematic-renderer2d';

// Instead of importing everything
// import * from 'cinematic-renderer2d';  // DON'T DO THIS
```

### Code Splitting

```typescript
// Lazy load cinematic features
const CinematicPlayer = lazy(() => 
  import('cinematic-renderer2d/react').then(module => ({
    default: module.CinematicPlayer
  }))
);

// Or use dynamic imports
async function loadCinematicRenderer() {
  const { CinematicRenderer2D } = await import('cinematic-renderer2d');
  return CinematicRenderer2D;
}
```

### Bundle Analysis

```bash
# Analyze bundle size
npm run build:analyze

# Check individual bundle sizes
npm run size-check
```

## Performance Checklist

### Pre-Production Checklist

- [ ] **Layer Count**: ≤20 layers per scene for mobile, ≤50 for desktop
- [ ] **Asset Sizes**: Images <5MB, Audio <10MB each
- [ ] **Animation Properties**: Prefer transform/opacity over layout properties
- [ ] **Quality Settings**: Test auto-quality adaptation on target devices
- [ ] **Memory Usage**: Monitor for memory leaks during long sessions
- [ ] **Bundle Size**: Keep total bundle <100KB gzipped
- [ ] **Loading Performance**: Critical assets load in <2 seconds
- [ ] **Frame Rate**: Maintain 60fps on target devices
- [ ] **Battery Impact**: Test on mobile devices with low battery
- [ ] **Thermal Throttling**: Test sustained performance on mobile

### Runtime Monitoring

```typescript
// Implement runtime performance monitoring
const performanceMonitor = {
  fps: 0,
  memoryUsage: 0,
  layerCount: 0,
  qualityLevel: 'auto',
  
  update(): void {
    // Update metrics
    this.fps = this.calculateFPS();
    this.memoryUsage = this.getMemoryUsage();
    this.layerCount = this.getActiveLayerCount();
    
    // Alert if performance degrades
    if (this.fps < 30) {
      console.warn('Low FPS detected:', this.fps);
    }
    
    if (this.memoryUsage > 100 * 1024 * 1024) { // 100MB
      console.warn('High memory usage:', this.memoryUsage);
    }
  }
};
```

This performance guide provides comprehensive optimization strategies for cinematicRenderer2D. Regular profiling and testing on target devices is essential for maintaining optimal performance in production applications.