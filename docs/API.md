# API Documentation

This document provides comprehensive API documentation for all TypeScript interfaces and classes in cinematicRenderer2D.

## Core Classes

### CinematicRenderer2D

The main engine class that orchestrates cinematic rendering.

```typescript
class CinematicRenderer2D implements ICinematicRenderer2D {
  constructor(options: CinematicRendererOptions);
  
  // Lifecycle methods
  mount(): Promise<void>;
  play(): void;
  pause(): void;
  stop(): void;
  destroy(): void;
  
  // Navigation methods
  seek(timeMs: number): void;
  goToEvent(eventId: string): void;
  goToScene(sceneId: string): void;
  
  // Configuration methods
  setQuality(level: QualityLevel): void;
  resize(width: number, height: number): void;
  
  // Event system
  on(event: string, callback: Function): void;
  off(event: string, callback: Function): void;
}
```

#### Constructor Options

```typescript
interface CinematicRendererOptions {
  container: HTMLElement;         // DOM container element
  spec: CinematicSpec;           // JSON specification
  quality?: QualityLevel;        // Override quality setting
  debug?: boolean;               // Enable debug mode
}
```

#### Events

The renderer emits the following events:

- `play` - Playback started
- `pause` - Playback paused
- `stop` - Playback stopped
- `end` - Playback completed
- `seek` - Playback position changed
- `error` - Error occurred
- `qualityChange` - Quality level changed
- `sceneChange` - Scene changed
- `eventChange` - Event changed

## Core Interfaces

### ICinematicRenderer2D

Main renderer interface defining the public API.

```typescript
interface ICinematicRenderer2D {
  // Lifecycle
  mount(): Promise<void>;
  play(): void;
  pause(): void;
  stop(): void;
  destroy(): void;
  
  // Navigation
  seek(timeMs: number): void;
  goToEvent(eventId: string): void;
  goToScene(sceneId: string): void;
  
  // Configuration
  setQuality(level: QualityLevel): void;
  resize(width: number, height: number): void;
  
  // Events
  on(event: string, callback: Function): void;
  off(event: string, callback: Function): void;
}
```

### ICinematicLayer

Interface for custom layer implementations.

```typescript
interface ICinematicLayer {
  id: string;                    // Unique identifier
  type: string;                  // Layer type name
  zIndex: number;                // Rendering order
  
  mount(ctx: LayerMountContext): void;
  update(ctx: FrameContext): void;
  destroy(): void;
}
```

#### LayerMountContext

Context provided during layer mounting.

```typescript
interface LayerMountContext {
  container: HTMLElement;        // Parent container
  canvas?: HTMLCanvasElement;    // Canvas element (for Canvas2D layers)
  renderer: RenderBackend;       // Rendering backend
  assetManager: AssetManager;    // Asset management system
  quality: QualityLevel;         // Current quality level
  viewport: ViewportInfo;        // Viewport dimensions
}
```

#### FrameContext

Context provided during frame updates.

```typescript
interface FrameContext {
  timeMs: number;                // Current time in milliseconds
  deltaMs: number;               // Time since last frame
  quality: QualityLevel;         // Current quality level
  viewport: ViewportInfo;        // Viewport dimensions
  fps: number;                   // Current FPS
}
```

## Specification Types

### CinematicSpec

Root specification interface.

```typescript
interface CinematicSpec {
  schemaVersion: string;         // Schema version (e.g., '1.0.0')
  engine: EngineConfig;          // Engine configuration
  events: CinematicEvent[];      // Event definitions
  scenes: CinematicScene[];      // Scene definitions
  assets?: AssetDefinition[];    // Optional asset definitions
}
```

### EngineConfig

Engine configuration options.

```typescript
interface EngineConfig {
  targetFps?: number;            // Target frame rate (default: 60)
  quality?: QualityLevel;        // Quality level (default: 'auto')
  debug?: boolean;               // Debug mode (default: false)
  autoplay?: boolean;            // Auto-start playback (default: false)
}
```

### CinematicEvent

High-level cinematic sequence.

```typescript
interface CinematicEvent {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  scenes: string[];              // Scene IDs in order
  transitions?: TransitionSpec[]; // Optional scene transitions
}
```

### CinematicScene

Individual scene definition.

```typescript
interface CinematicScene {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  duration: number;              // Duration in milliseconds
  layers: LayerSpec[];           // Visual layers
  audio?: AudioTrackSpec[];      // Optional audio tracks
}
```

### LayerSpec

Layer specification.

```typescript
interface LayerSpec {
  id: string;                    // Unique identifier
  type: LayerType;               // Layer type
  zIndex: number;                // Rendering order (higher = front)
  config: LayerConfig;           // Layer-specific configuration
  animations?: AnimationTrackSpec[]; // Optional animations
}
```

### LayerConfig

Base layer configuration.

```typescript
interface LayerConfig {
  opacity?: number;              // Opacity 0-1 (default: 1)
  visible?: boolean;             // Visibility (default: true)
  transform?: TransformConfig;   // Transform properties
  [key: string]: any;           // Layer-specific properties
}
```

### TransformConfig

Transform configuration for layers.

```typescript
interface TransformConfig {
  x?: number | string;           // X position
  y?: number | string;           // Y position
  scale?: number;                // Scale factor
  rotation?: number;             // Rotation in degrees
  origin?: string;               // Transform origin (CSS format)
}
```

## Animation System

### AnimationTrackSpec

Animation track specification.

```typescript
interface AnimationTrackSpec {
  property: string;              // Property path to animate
  from: AnimationValue;          // Starting value
  to: AnimationValue;            // Ending value
  startMs: number;               // Start time in milliseconds
  endMs: number;                 // End time in milliseconds
  easing?: EasingType;           // Easing function (default: 'ease')
  loop?: boolean;                // Loop animation (default: false)
  yoyo?: boolean;                // Reverse on loop (default: false)
}
```

### AnimationValue

Supported animation value types.

```typescript
type AnimationValue = 
  | number
  | string
  | boolean
  | Record<string, number | string | boolean>;
```

### EasingType

Supported easing functions.

```typescript
type EasingType = 
  | 'linear'
  | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out'
  | 'ease-in-sine' | 'ease-out-sine' | 'ease-in-out-sine'
  | 'ease-in-quad' | 'ease-out-quad' | 'ease-in-out-quad'
  | 'ease-in-cubic' | 'ease-out-cubic' | 'ease-in-out-cubic'
  | 'ease-in-quart' | 'ease-out-quart' | 'ease-in-out-quart'
  | 'ease-in-quint' | 'ease-out-quint' | 'ease-in-out-quint'
  | 'ease-in-expo' | 'ease-out-expo' | 'ease-in-out-expo'
  | 'ease-in-circ' | 'ease-out-circ' | 'ease-in-out-circ'
  | 'ease-in-back' | 'ease-out-back' | 'ease-in-out-back'
  | 'ease-in-elastic' | 'ease-out-elastic' | 'ease-in-out-elastic'
  | 'ease-in-bounce' | 'ease-out-bounce' | 'ease-in-out-bounce'
  | `cubic-bezier(${number},${number},${number},${number})`;
```

## Audio System

### AudioTrackSpec

Audio track specification.

```typescript
interface AudioTrackSpec {
  id: string;                    // Unique identifier
  type: AudioTrackType;          // Track type
  src: string;                   // Audio file path/URL
  startMs: number;               // Start time in milliseconds
  endMs?: number;                // End time (optional)
  volume?: number;               // Volume 0-1 (default: 1)
  fadeIn?: number;               // Fade in duration (default: 0)
  fadeOut?: number;              // Fade out duration (default: 0)
  loop?: boolean;                // Loop track (default: false)
}
```

### AudioTrackType

Audio track types.

```typescript
type AudioTrackType = 
  | 'voiceover'    // Narration or dialogue
  | 'ambience'     // Background ambient sounds
  | 'transition'   // Transition sound effects
  | 'music'        // Background music
  | 'sfx';         // Sound effects
```

## Asset Management

### AssetDefinition

Asset definition for preloading.

```typescript
interface AssetDefinition {
  id: string;                    // Unique identifier
  type: AssetType;               // Asset type
  src: string;                   // Asset path/URL
  preload?: boolean;             // Preload asset (default: true)
  fallback?: string;             // Fallback asset path
  metadata?: AssetMetadata;      // Optional metadata
}
```

### AssetType

Supported asset types.

```typescript
type AssetType = 
  | 'image'        // Image files (jpg, png, webp, etc.)
  | 'video'        // Video files (mp4, webm, etc.)
  | 'audio'        // Audio files (mp3, wav, ogg, etc.)
  | 'font'         // Font files (woff, woff2, ttf, etc.)
  | 'json'         // JSON data files
  | 'binary';      // Binary data files
```

### AssetMetadata

Optional asset metadata.

```typescript
interface AssetMetadata {
  size?: number;                 // File size in bytes
  mimeType?: string;             // MIME type
  cacheDuration?: number;        // Cache duration in milliseconds
  dimensions?: {                 // Image/video dimensions
    width: number;
    height: number;
  };
  duration?: number;             // Audio/video duration in milliseconds
}
```

## Layer Types

### LayerType

Supported layer types.

```typescript
type LayerType = 
  // DOM-based layers
  | 'gradient'       // CSS gradient backgrounds
  | 'image'          // Image elements
  | 'textBlock'      // Text content
  | 'vignette'       // Vignette overlay
  | 'glowOrb'        // Glowing orb effect
  | 'noiseOverlay'   // Noise texture overlay
  
  // Canvas2D-based layers
  | 'particles'      // Particle systems
  | 'starfield'      // Animated starfield
  | 'dust'           // Floating dust particles
  | 'nebulaNoise'    // Nebula-like noise patterns
  
  // Future WebGL layers
  | 'webgl-custom';  // Custom WebGL shaders
```

## Quality System

### QualityLevel

Performance quality levels.

```typescript
type QualityLevel = 
  | 'low'          // Optimized for performance
  | 'medium'       // Balanced quality/performance
  | 'high'         // High quality rendering
  | 'ultra'        // Maximum quality
  | 'auto';        // Automatic adaptation
```

### QualitySettings

Quality-specific settings.

```typescript
interface QualitySettings {
  particleCount: number;         // Maximum particles per system
  textureResolution: number;     // Texture resolution multiplier
  shadowQuality: number;         // Shadow quality level
  effectComplexity: number;      // Effect complexity level
  animationPrecision: number;    // Animation interpolation precision
}
```

## Transition System

### TransitionSpec

Scene transition specification.

```typescript
interface TransitionSpec {
  type: TransitionType;          // Transition type
  duration: number;              // Duration in milliseconds
  easing?: EasingType;           // Easing function (default: 'ease')
  config?: TransitionConfig;     // Transition-specific config
}
```

### TransitionType

Supported transition types.

```typescript
type TransitionType = 
  | 'fade'         // Fade in/out
  | 'slide'        // Slide transition
  | 'zoom'         // Zoom in/out
  | 'wipe'         // Wipe transition
  | 'dissolve'     // Dissolve effect
  | 'blur';        // Blur transition
```

### TransitionConfig

Transition configuration options.

```typescript
interface TransitionConfig {
  direction?: 'up' | 'down' | 'left' | 'right' | 'in' | 'out';
  blurAmount?: number;           // Blur intensity
  [key: string]: any;           // Transition-specific properties
}
```

## Compiled Runtime Types

### CompiledSpec

Compiled specification for runtime execution.

```typescript
interface CompiledSpec {
  events: Map<string, CompiledEvent>;
  scenes: Map<string, CompiledScene>;
  assets: Map<string, Asset>;
  globalConfig: EngineConfig;
  schemaVersion: string;
  totalDuration: number;
  compiledAt: number;
}
```

### CompiledAnimationTrack

Compiled animation track with optimized interpolation.

```typescript
interface CompiledAnimationTrack {
  property: string;              // Property path
  startMs: number;               // Start time
  endMs: number;                 // End time
  interpolate: (progress: number) => any; // Optimized interpolation function
  loop: boolean;                 // Loop flag
  yoyo: boolean;                 // Yoyo flag
  easingType: EasingType;        // Original easing type
  currentLoop: number;           // Current loop iteration
  isReverse: boolean;            // Reverse direction flag
}
```

## Error Types

### CinematicError

Base error class for cinematic-specific errors.

```typescript
class CinematicError extends Error {
  code: string;                  // Error code
  context?: any;                 // Additional context
  
  constructor(message: string, code: string, context?: any);
}
```

### Common Error Codes

- `SPEC_VALIDATION_ERROR` - JSON specification validation failed
- `ASSET_LOAD_ERROR` - Asset loading failed
- `RENDER_ERROR` - Rendering error occurred
- `AUDIO_ERROR` - Audio system error
- `LAYER_ERROR` - Layer-specific error
- `ANIMATION_ERROR` - Animation compilation/execution error

## Utility Types

### ViewportInfo

Viewport information.

```typescript
interface ViewportInfo {
  width: number;                 // Viewport width
  height: number;                // Viewport height
  devicePixelRatio: number;      // Device pixel ratio
  aspectRatio: number;           // Width/height ratio
}
```

### PerformanceMetrics

Performance monitoring data.

```typescript
interface PerformanceMetrics {
  fps: number;                   // Current FPS
  frameTime: number;             // Frame time in milliseconds
  memoryUsage: number;           // Memory usage in MB
  activeLayerCount: number;      // Number of active layers
  qualityLevel: QualityLevel;    // Current quality level
}
```

## Framework Adapter Types

### React Types

```typescript
interface CinematicPlayerProps {
  spec: CinematicSpec;           // Required specification
  autoplay?: boolean;            // Auto-start playback
  quality?: QualityLevel;        // Quality override
  debug?: boolean;               // Debug mode
  
  // Event handlers
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
  onQualityChange?: (quality: QualityLevel) => void;
}
```

### Angular Types

```typescript
// Component inputs
@Input() spec: CinematicSpec;
@Input() autoplay: boolean = false;
@Input() quality: QualityLevel = 'auto';
@Input() debug: boolean = false;

// Component outputs
@Output() play = new EventEmitter<void>();
@Output() pause = new EventEmitter<void>();
@Output() stop = new EventEmitter<void>();
@Output() end = new EventEmitter<void>();
@Output() error = new EventEmitter<Error>();
@Output() qualityChange = new EventEmitter<QualityLevel>();
```

## CLI Types

### CLIOptions

CLI command options.

```typescript
interface CLIOptions {
  command: 'validate' | 'preview';
  file: string;                  // Input file path
  verbose?: boolean;             // Verbose output
  output?: string;               // Output file path
}
```

### ValidationReport

Validation report structure.

```typescript
interface ValidationReport {
  valid: boolean;                // Validation result
  file: string;                  // Input file path
  validatedAt: string;           // Validation timestamp
  spec?: {                       // Spec details (if valid)
    schemaVersion: string;
    events: number;
    scenes: number;
    assets: number;
    totalDuration: number;
    targetFps: number;
    quality: QualityLevel;
  };
  error?: string;                // Error message (if invalid)
}
```

This API documentation covers all major interfaces and types in the cinematicRenderer2D library. For implementation examples and usage patterns, refer to the main README.md file.