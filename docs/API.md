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
  
  // Camera methods (NEW)
  getCameraState(): CameraState;
  setCameraState(state: Partial<CameraState>): void;
  addCameraAnimation(animation: CameraAnimation): void;
  resetCamera(): void;
  getCameraTransformMatrix(): DOMMatrix;
  
  // Audio methods (NEW)
  setMasterVolume(volume: number): void;
  getMasterVolume(): number;
  isWebAudioAvailable(): boolean;
  getActiveAudioTrackCount(): number;
  
  // Performance methods (NEW)
  getCurrentFps(): number;
  getPerformanceMetrics(): PerformanceMetrics;
  getQualitySettings(): QualitySettings;
  getDeviceCapabilities(): DeviceCapabilities;
  
  // Debug methods (NEW)
  isDebugEnabled(): boolean;
  toggleDebug(): void;
  showDebug(): void;
  hideDebug(): void;
  
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
  autoplay?: boolean;            // Auto-start playback
  quality?: QualityLevel;        // Override quality setting
  debug?: boolean;               // Enable debug mode
}
```

#### Events

The renderer emits the following events:

**Playback Events:**
- `play` - Playback started
- `pause` - Playback paused
- `stop` - Playback stopped
- `ended` - Playback completed
- `seek` - Playback position changed

**State Events:**
- `ready` - Renderer mounted and ready
- `loading` - Assets loading
- `stateChange` - Renderer state changed
- `error` - Error occurred

**Scene Events:**
- `sceneChange` - Scene changed
- `eventChange` - Event changed

**System Events:**
- `qualityChange` - Quality level changed
- `resize` - Container resized
- `frame` - Frame rendered (high frequency)

**Audio Events (NEW):**
- `audioError` - Audio track error
- `autoplayBlocked` - Autoplay blocked by browser

**Lifecycle Events (NEW):**
- `destroy` - Renderer destroyed

## Enhanced Systems

### Camera System (NEW)

Control viewport transformations for cinematic effects.

```typescript
interface CameraState {
  x: number;              // Horizontal position
  y: number;              // Vertical position
  zoom: number;           // Zoom level (1.0 = 100%)
  rotation: number;       // Rotation in degrees
}

interface CameraAnimation {
  property: 'x' | 'y' | 'zoom' | 'rotation';
  from: number;
  to: number;
  startMs: number;
  endMs: number;
  easing?: EasingType;
}

// Usage
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

### Transition Engine (NEW)

Smooth transitions between scenes.

```typescript
interface TransitionSpec {
  type: 'crossfade' | 'slide' | 'zoom' | 'wipe' | 'dissolve' | 'blur';
  duration: number;       // Duration in milliseconds
  easing?: EasingType;    // Easing function
  direction?: 'up' | 'down' | 'left' | 'right';  // For slide/wipe
}

// In scene specification
{
  "scenes": [...],
  "transitions": [{
    "fromScene": "scene1",
    "toScene": "scene2",
    "type": "crossfade",
    "duration": 1000,
    "easing": "ease-in-out"
  }]
}
```

### State Machine (NEW)

Well-defined renderer and scene states.

```typescript
// Renderer States
type RendererState = 'IDLE' | 'READY' | 'PLAYING' | 'PAUSED' | 'STOPPED' | 'DESTROYED';

// Scene States  
type SceneState = 'CREATED' | 'MOUNTED' | 'ACTIVE' | 'EXITING' | 'UNMOUNTED';

// Check current state
const state = renderer.getState();

// State transitions are validated automatically
renderer.play();  // Only works from READY or PAUSED states
```

### Scene Lifecycle Manager (NEW)

Manages scene lifecycle phases.

```typescript
// Lifecycle phases (automatic):
// 1. prepare() - Preload assets
// 2. mount() - Create DOM nodes
// 3. play() - Start animations/audio
// 4. unmount() - Remove DOM nodes
// 5. destroy() - Release resources

// Access lifecycle manager
const manager = renderer.getSceneLifecycleManager();
```

### Asset Preloader (NEW)

Preload and cache assets efficiently.

```typescript
interface AssetPreloaderConfig {
  maxConcurrentLoads?: number;    // Max parallel loads
  defaultTimeout?: number;        // Load timeout (ms)
  defaultRetries?: number;        // Retry attempts
  baseUrl?: string;              // Base URL for assets
}

// Assets are preloaded automatically per scene
// Cached assets are reused across scenes
```

### Performance Monitor (NEW)

Automatic performance adaptation.

```typescript
interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  droppedFrames: number;
  memoryUsage?: number;
  activeLayers: number;
  activeParticles: number;
}

// Get current metrics
const metrics = renderer.getPerformanceMetrics();

// Quality automatically adjusts based on FPS:
// - FPS < 30: Switch to low quality
// - FPS < 50: Reduce particle counts
// - FPS > 55: Increase quality if possible
```

## New Layer Types

### Light Layer (NEW)

Cinematic lighting effects.

```typescript
interface LightLayerConfig {
  mode: 'radial' | 'spot' | 'ambient' | 'vignette';
  position?: { x: number; y: number };
  radius?: number;
  intensity?: number;
  color?: string;
  angle?: number;          // For spot lights
  direction?: number;      // For spot lights (degrees)
  blendMode?: 'screen' | 'overlay' | 'soft-light' | 'multiply';
}

// Example
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
  }
}
```

### Fog Layer (NEW)

Atmospheric fog effects.

```typescript
interface FogLayerConfig {
  density: number;         // 0-1
  color: string;
  speed?: number;
  direction?: 'horizontal' | 'vertical';
  opacity?: number;
}
```

### Parallax Group Layer (NEW)

Group layers with depth-based scrolling.

```typescript
interface ParallaxGroupConfig {
  layers: string[];        // Layer IDs to group
  depth: number;          // Depth factor (0-1)
  scrollSpeed?: number;
}
```

### Glow Effect Layer (NEW)

Soft glow effects.

```typescript
interface GlowEffectConfig {
  position: { x: number; y: number };
  radius: number;
  intensity: number;
  color: string;
  blur?: number;
}
```

## Enhanced Animation System

### Looping and Yoyo (NEW)

```typescript
interface AnimationTrackSpec {
  property: string;
  from: any;
  to: any;
  startMs: number;
  endMs: number;
  easing?: EasingType;
  loop?: boolean;          // NEW: Loop animation
  yoyo?: boolean;          // NEW: Reverse on loop
}
```

### Keyframe Animations (NEW)

```typescript
interface KeyframeAnimation {
  property: string;
  keyframes: Array<{
    time: number;          // Time in ms
    value: any;
    easing?: EasingType;
  }>;
}
```

### Stagger Effects (NEW)

```typescript
interface StaggerConfig {
  count: number;           // Number of elements
  delay: number;           // Delay between each (ms)
  pattern?: 'start' | 'center' | 'end';
}
```

## Enhanced Audio System

### Per-Track Control (NEW)

```typescript
interface AudioTrackSpec {
  id: string;
  type: AudioTrackType;
  src: string;
  startMs: number;
  endMs?: number;
  volume?: number;         // 0-1
  fadeIn?: number;         // NEW: Fade in duration (ms)
  fadeOut?: number;        // NEW: Fade out duration (ms)
  loop?: boolean;          // NEW: Loop track
}

// Audio crossfading between scenes (automatic)
// Multi-track playback supported
```

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


## Developer Tools

### EditorMode (NEW)

Visual development tools for creating and debugging cinematic experiences.

```typescript
class EditorMode {
  constructor(
    renderer: CinematicRenderer2D,
    container: HTMLElement,
    config: EditorModeConfig
  );
  
  // Control methods
  enable(): void;
  disable(): void;
  toggle(): void;
  setConfig(config: Partial<EditorModeConfig>): void;
  
  // UI component methods
  showTimeline(): void;
  hideTimeline(): void;
  showBoundingBoxes(): void;
  hideBoundingBoxes(): void;
  showPropertyInspector(layerId: string): void;
  hidePropertyInspector(): void;
  
  // Timeline methods
  addMarker(marker: TimelineMarker): void;
  removeMarker(time: number): void;
  onTimelineScrub(time: number): void;
  
  // Layer interaction
  onLayerClick(layerId: string): void;
  
  // Cleanup
  destroy(): void;
}
```

#### EditorModeConfig

Configuration for editor mode.

```typescript
interface EditorModeConfig {
  enabled: boolean;                    // Enable editor mode
  showTimeline?: boolean;              // Show timeline scrubber (default: true)
  showBoundingBoxes?: boolean;         // Show layer bounding boxes (default: true)
  showPropertyInspector?: boolean;     // Show property inspector (default: true)
  showPerformanceMetrics?: boolean;    // Show performance metrics (default: true)
  autoEnableWithDebug?: boolean;       // Auto-enable with debug mode (default: true)
}
```

#### TimelineMarker

Timeline marker for scene/event visualization.

```typescript
interface TimelineMarker {
  time: number;                        // Time in milliseconds
  label: string;                       // Marker label
  type: 'scene' | 'event' | 'custom'; // Marker type
  color?: string;                      // Custom color (CSS format)
}
```

#### Usage Example

```typescript
import { CinematicRenderer2D } from 'cinematic-renderer2d';

const renderer = new CinematicRenderer2D({
  container: document.getElementById('container'),
  spec: cinematicSpec,
  editorMode: {
    enabled: true,
    showTimeline: true,
    showBoundingBoxes: true,
    showPropertyInspector: true,
    showPerformanceMetrics: true,
    autoEnableWithDebug: true
  }
});

await renderer.mount();

// Access editor mode
const editorMode = renderer.getEditorMode();

// Add custom timeline marker
editorMode?.addMarker({
  time: 5000,
  label: 'Important Moment',
  type: 'custom',
  color: '#ff0000'
});

// Toggle editor mode programmatically
renderer.toggleEditorMode();

// Keyboard shortcut: Ctrl+E (or Cmd+E on Mac) toggles editor mode
```

#### Editor Mode Features

**Timeline Scrubber:**
- Visual timeline with scene markers
- Draggable scrubber for precise time navigation
- Click-to-seek functionality
- Real-time time display

**Bounding Boxes:**
- Visual outlines around all layers
- Layer type and ID labels
- Click-to-inspect functionality
- Highlight selected layer

**Property Inspector:**
- Real-time property viewer for selected layers
- Display layer ID, type, z-index
- Show layer-specific properties
- Close button for dismissal

**Performance Metrics:**
- Integrated debug overlay
- FPS counter
- Frame time graph
- Quality level indicator

**Keyboard Shortcuts:**
- `Ctrl+E` / `Cmd+E`: Toggle editor mode
- Works globally when editor mode is enabled

### DebugOverlay (NEW)

Performance monitoring and debugging overlay.

```typescript
class DebugOverlay {
  constructor(
    renderer: CinematicRenderer2D,
    container: HTMLElement,
    config?: DebugOverlayConfig
  );
  
  // Control methods
  show(): void;
  hide(): void;
  toggle(): void;
  
  // Update methods
  update(metrics: PerformanceMetrics): void;
  
  // Cleanup
  destroy(): void;
}
```

#### DebugOverlayConfig

Configuration for debug overlay.

```typescript
interface DebugOverlayConfig {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showPerformanceGraph?: boolean;      // Show FPS graph (default: true)
  graphSamples?: number;               // Number of graph samples (default: 60)
  updateInterval?: number;             // Update interval in ms (default: 100)
}
```

#### Usage Example

```typescript
import { CinematicRenderer2D } from 'cinematic-renderer2d';

const renderer = new CinematicRenderer2D({
  container: document.getElementById('container'),
  spec: cinematicSpec,
  debug: true  // Enable debug overlay
});

await renderer.mount();

// Control debug overlay
renderer.showDebug();
renderer.hideDebug();
renderer.toggleDebug();

// Check debug status
const isDebugEnabled = renderer.isDebugEnabled();
```

## State Management

### StateMachine (NEW)

Manages renderer and scene states with validated transitions.

```typescript
class StateMachine {
  constructor();
  
  // State management
  getState(): RendererState;
  canTransition(from: RendererState, to: RendererState): boolean;
  transition(to: RendererState): void;
  
  // Scene state management
  getSceneState(sceneId: string): SceneState | undefined;
  setSceneState(sceneId: string, state: SceneState): void;
  getActiveScene(): string | null;
  
  // Event system
  on(event: 'stateChange', callback: (event: StateChangeEvent) => void): void;
  off(event: 'stateChange', callback: (event: StateChangeEvent) => void): void;
}
```

#### RendererState

Renderer state enumeration.

```typescript
type RendererState = 
  | 'IDLE'        // Initial state, not mounted
  | 'READY'       // Mounted and ready to play
  | 'PLAYING'     // Currently playing
  | 'PAUSED'      // Paused
  | 'STOPPED'     // Stopped
  | 'DESTROYED';  // Destroyed and cleaned up
```

#### SceneState

Scene state enumeration.

```typescript
type SceneState = 
  | 'CREATED'     // Scene created but not mounted
  | 'MOUNTED'     // Scene mounted (DOM nodes created)
  | 'ACTIVE'      // Scene actively playing
  | 'EXITING'     // Scene transitioning out
  | 'UNMOUNTED';  // Scene unmounted (DOM nodes removed)
```

#### StateChangeEvent

State change event data.

```typescript
interface StateChangeEvent {
  previousState: RendererState;
  currentState: RendererState;
  timestamp: number;
}
```

#### Valid State Transitions

**From IDLE:**
- → READY (after mount)

**From READY:**
- → PLAYING (play)
- → DESTROYED (destroy)

**From PLAYING:**
- → PAUSED (pause)
- → STOPPED (stop)
- → DESTROYED (destroy)

**From PAUSED:**
- → PLAYING (resume)
- → STOPPED (stop)
- → DESTROYED (destroy)

**From STOPPED:**
- → READY (reset)
- → DESTROYED (destroy)

**From DESTROYED:**
- No transitions allowed (terminal state)

#### Usage Example

```typescript
// State machine is used internally by CinematicRenderer2D
// Access current state
const state = renderer.getState();

// Listen for state changes
renderer.on('stateChange', (event) => {
  console.log(`State changed from ${event.previousState} to ${event.currentState}`);
});

// State transitions are validated automatically
renderer.play();  // Only works from READY or PAUSED states
// Throws error if called from invalid state
```

### SceneLifecycleManager (NEW)

Manages scene lifecycle phases with proper resource management.

```typescript
class SceneLifecycleManager {
  constructor(
    renderer: CinematicRenderer2D,
    assetPreloader: AssetPreloader
  );
  
  // Lifecycle phase methods
  async prepareScene(sceneId: string): Promise<void>;
  async mountScene(sceneId: string): Promise<void>;
  async playScene(sceneId: string): Promise<void>;
  async unmountScene(sceneId: string): Promise<void>;
  async destroyScene(sceneId: string): Promise<void>;
  
  // Scene state queries
  getSceneState(sceneId: string): SceneState | undefined;
  getActiveScene(): string | null;
  
  // Cleanup
  destroy(): void;
}
```

#### Lifecycle Phases

**1. Prepare Phase:**
- Preload all scene assets
- Validate scene specification
- Mark scene as prepared
- Emit `scenePrepared` event

**2. Mount Phase:**
- Create layer instances from specs
- Attach DOM nodes to container
- Initialize layer state
- Mark scene as mounted
- Emit `sceneMounted` event

**3. Play Phase:**
- Start all scene animations
- Start all audio tracks
- Mark scene as active
- Emit `sceneActive` event

**4. Unmount Phase:**
- Remove layer DOM nodes
- Stop animations
- Stop audio tracks
- Mark scene as unmounted
- Emit `sceneUnmounted` event

**5. Destroy Phase:**
- Release all resources
- Cancel pending operations
- Clear references
- Remove scene from registry
- Emit `sceneDestroyed` event

#### Usage Example

```typescript
// Scene lifecycle is managed automatically by CinematicRenderer2D
// Lifecycle phases execute in order during scene transitions

// Listen for lifecycle events
renderer.on('scenePrepared', (event) => {
  console.log(`Scene ${event.sceneId} prepared`);
});

renderer.on('sceneMounted', (event) => {
  console.log(`Scene ${event.sceneId} mounted`);
});

renderer.on('sceneActive', (event) => {
  console.log(`Scene ${event.sceneId} is now active`);
});

renderer.on('sceneUnmounted', (event) => {
  console.log(`Scene ${event.sceneId} unmounted`);
});

renderer.on('sceneDestroyed', (event) => {
  console.log(`Scene ${event.sceneId} destroyed`);
});
```

## Transition System (Detailed)

### TransitionEngine (NEW)

Manages smooth transitions between scenes with various effects.

```typescript
class TransitionEngine {
  constructor(container: HTMLElement);
  
  // Execute transition
  async executeTransition(
    fromScene: HTMLElement | null,
    toScene: HTMLElement,
    spec: TransitionSpec
  ): Promise<void>;
  
  // Cancel active transition
  cancelTransition(): void;
  
  // Check if transition is active
  isTransitioning(): boolean;
  
  // Cleanup
  destroy(): void;
}
```

#### Transition Types (Detailed)

**Crossfade:**
```typescript
{
  type: 'crossfade',
  duration: 1000,
  easing: 'ease-in-out'
}
```
- Simultaneously fades out old scene and fades in new scene
- Uses opacity animations
- Smooth and professional
- Default transition if none specified

**Slide:**
```typescript
{
  type: 'slide',
  duration: 800,
  easing: 'ease-out',
  direction: 'left'  // 'up' | 'down' | 'left' | 'right'
}
```
- Moves old scene out and new scene in
- Supports all four directions
- Uses CSS transforms for performance
- Hardware accelerated

**Zoom:**
```typescript
{
  type: 'zoom',
  duration: 600,
  easing: 'ease-in-out',
  direction: 'in'  // 'in' | 'out'
}
```
- Scales old scene down while scaling new scene up (or vice versa)
- Uses transform: scale() for performance
- Creates dramatic effect

**Wipe:**
```typescript
{
  type: 'wipe',
  duration: 700,
  easing: 'linear',
  direction: 'right'  // 'up' | 'down' | 'left' | 'right'
}
```
- Reveals new scene with moving edge
- Classic film transition
- Directional wipe effect

**Dissolve:**
```typescript
{
  type: 'dissolve',
  duration: 1200,
  easing: 'ease-in-out'
}
```
- Uses noise pattern for pixelated transition
- Creates organic, textured effect
- More complex than crossfade

**Blur:**
```typescript
{
  type: 'blur',
  duration: 900,
  easing: 'ease-in-out',
  blurAmount: 20  // Blur radius in pixels
}
```
- Blurs old scene while fading in new scene
- Creates dreamy, soft transition
- Uses CSS filters

#### Usage Example

```typescript
// Transitions are defined in the specification
{
  "events": [{
    "id": "story",
    "name": "Story",
    "scenes": ["scene1", "scene2", "scene3"]
  }],
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

// Default transition (if not specified)
// Uses 500ms crossfade with ease-in-out easing
```

## Camera System (Detailed)

### CameraSystem (NEW)

Controls viewport transformations for cinematic camera effects.

```typescript
class CameraSystem {
  constructor(container: HTMLElement);
  
  // State management
  getState(): CameraState;
  setState(state: Partial<CameraState>): void;
  reset(): void;
  
  // Animation
  addAnimation(animation: CameraAnimation): void;
  clearAnimations(): void;
  
  // Transform application
  applyTransform(): void;
  getTransformMatrix(): DOMMatrix;
  
  // Update
  update(timeMs: number): void;
  
  // Cleanup
  destroy(): void;
}
```

#### CameraState (Detailed)

Complete camera state interface.

```typescript
interface CameraState {
  x: number;              // Horizontal position in pixels (default: 0)
  y: number;              // Vertical position in pixels (default: 0)
  zoom: number;           // Zoom level, 1.0 = 100% (default: 1.0)
  rotation: number;       // Rotation in degrees (default: 0)
}
```

#### CameraAnimation (Detailed)

Camera animation specification.

```typescript
interface CameraAnimation {
  property: 'x' | 'y' | 'zoom' | 'rotation';
  from: number;
  to: number;
  startMs: number;
  endMs: number;
  easing?: EasingType;
  loop?: boolean;
  yoyo?: boolean;
}
```

#### Camera Transform Application

**For DOM Layers:**
```css
/* Applied to scene container */
transform: translate(x, y) scale(zoom) rotate(rotation);
transform-origin: center center;
```

**For Canvas Layers:**
```typescript
// Transform matrix calculated and applied to canvas context
ctx.setTransform(matrix);
// All rendering coordinates adjusted automatically
```

#### Usage Example

```typescript
// Set camera state programmatically
renderer.setCameraState({
  x: 100,
  y: 50,
  zoom: 1.5,
  rotation: 15
});

// Add camera animation
renderer.addCameraAnimation({
  property: 'zoom',
  from: 1.0,
  to: 2.0,
  startMs: 0,
  endMs: 2000,
  easing: 'ease-in-out'
});

// In specification
{
  "scenes": [{
    "id": "scene1",
    "name": "Zoom Scene",
    "duration": 5000,
    "camera": {
      "animations": [{
        "property": "zoom",
        "from": 1.0,
        "to": 2.0,
        "startMs": 0,
        "endMs": 2000,
        "easing": "ease-in-out"
      }, {
        "property": "x",
        "from": 0,
        "to": 200,
        "startMs": 1000,
        "endMs": 3000,
        "easing": "ease-out"
      }]
    },
    "layers": [...]
  }]
}

// Reset camera to default state
renderer.resetCamera();

// Get current camera state
const cameraState = renderer.getCameraState();
console.log(`Zoom: ${cameraState.zoom}, Position: (${cameraState.x}, ${cameraState.y})`);
```

## Scene Templates

### SceneTemplates (NEW)

Pre-built scene templates for common cinematic patterns.

```typescript
class SceneTemplates {
  // Template creation methods
  static createSunriseScene(options?: SunriseSceneOptions): CinematicScene;
  static createCosmicBirthScene(options?: CosmicBirthSceneOptions): CinematicScene;
  static createRainScene(options?: RainSceneOptions): CinematicScene;
  static createDivineAuraScene(options?: DivineAuraSceneOptions): CinematicScene;
  static createUnderwaterScene(options?: UnderwaterSceneOptions): CinematicScene;
  
  // Template customization
  static customizeTemplate(
    template: CinematicScene,
    customizations: TemplateCustomizations
  ): CinematicScene;
}
```

#### Template Options

**SunriseSceneOptions:**
```typescript
interface SunriseSceneOptions {
  duration?: number;              // Scene duration (default: 10000ms)
  colors?: {
    sky?: string[];              // Sky gradient colors
    sun?: string;                // Sun color
  };
  particleCount?: number;         // Atmosphere particles (default: 50)
  audioTrack?: string;            // Morning ambience audio
}
```

**CosmicBirthSceneOptions:**
```typescript
interface CosmicBirthSceneOptions {
  duration?: number;              // Scene duration (default: 15000ms)
  starCount?: number;             // Number of stars (default: 200)
  nebulaColors?: string[];        // Nebula colors
  explosionIntensity?: number;    // Particle explosion intensity (0-1)
  audioTrack?: string;            // Cosmic audio
}
```

**RainSceneOptions:**
```typescript
interface RainSceneOptions {
  duration?: number;              // Scene duration (default: 12000ms)
  rainIntensity?: number;         // Rain particle count (default: 100)
  fogDensity?: number;            // Fog density (0-1, default: 0.3)
  audioTrack?: string;            // Rain sounds audio
}
```

**DivineAuraSceneOptions:**
```typescript
interface DivineAuraSceneOptions {
  duration?: number;              // Scene duration (default: 8000ms)
  auraColor?: string;             // Aura color (default: '#ffffff')
  glowIntensity?: number;         // Glow intensity (0-1, default: 0.8)
  particleCount?: number;         // Soft particles (default: 30)
}
```

**UnderwaterSceneOptions:**
```typescript
interface UnderwaterSceneOptions {
  duration?: number;              // Scene duration (default: 10000ms)
  waterColor?: string;            // Water tint color (default: '#0066cc')
  particleCount?: number;         // Floating debris (default: 40)
  lightRayCount?: number;         // Light rays (default: 5)
  audioTrack?: string;            // Underwater ambience
}
```

#### TemplateCustomizations

General template customization options.

```typescript
interface TemplateCustomizations {
  duration?: number;              // Override duration
  colors?: Record<string, string | string[]>; // Override colors
  timing?: {                      // Override timing
    [key: string]: { startMs: number; endMs: number };
  };
  effects?: {                     // Override effect parameters
    [key: string]: any;
  };
}
```

#### Usage Example

```typescript
import { SceneTemplates } from 'cinematic-renderer2d';

// Create sunrise scene with defaults
const sunriseScene = SceneTemplates.createSunriseScene();

// Create customized rain scene
const rainScene = SceneTemplates.createRainScene({
  duration: 15000,
  rainIntensity: 150,
  fogDensity: 0.5,
  audioTrack: '/assets/audio/heavy-rain.mp3'
});

// Customize existing template
const customScene = SceneTemplates.customizeTemplate(sunriseScene, {
  duration: 12000,
  colors: {
    sky: ['#ff6b6b', '#feca57', '#48dbfb'],
    sun: '#ff9ff3'
  },
  effects: {
    particleCount: 100
  }
});

// Use in specification
const spec: CinematicSpec = {
  schemaVersion: '1.0.0',
  engine: { targetFps: 60, quality: 'auto' },
  events: [{
    id: 'nature',
    name: 'Nature Scenes',
    scenes: ['sunrise', 'rain', 'underwater']
  }],
  scenes: [
    sunriseScene,
    rainScene,
    SceneTemplates.createUnderwaterScene()
  ]
};
```

## CLI Tools

### Command Line Interface

The CLI provides tools for validating, previewing, and developing cinematic specifications.

#### validate Command

Validate a cinematic specification file.

```bash
# Basic validation
npx cinematic-renderer2d validate spec.json

# Verbose output with statistics
npx cinematic-renderer2d validate spec.json --verbose

# Output validation report to file
npx cinematic-renderer2d validate spec.json --output report.json
```

**Output:**
```
✓ Validation successful!

Specification Statistics:
  Schema Version: 1.0.0
  Events: 3
  Scenes: 8
  Total Duration: 45.2s
  Target FPS: 60
  Quality: auto
  Assets: 12 (5 images, 4 audio, 3 video)

Layers by Type:
  gradient: 8
  textBlock: 12
  particles: 6
  light: 4
  image: 3
```

#### dev Command

Start development server with live preview and hot reload.

```bash
# Start dev server
npx cinematic-renderer2d dev spec.json

# Custom port
npx cinematic-renderer2d dev spec.json --port 8080

# Open browser automatically
npx cinematic-renderer2d dev spec.json --open
```

**Features:**
- Live preview in browser
- Watch specification file for changes
- Hot reload on save
- Error overlay for validation errors
- Performance metrics display

#### preview Command

Generate standalone HTML preview file.

```bash
# Generate preview
npx cinematic-renderer2d preview spec.json

# Custom output file
npx cinematic-renderer2d preview spec.json --output preview.html

# Embed all assets inline
npx cinematic-renderer2d preview spec.json --inline-assets
```

**Generated HTML includes:**
- Embedded specification
- Inline assets (if --inline-assets flag used)
- Playback controls
- Sharing metadata (Open Graph, Twitter Cards)
- Responsive design

## Best Practices

### Performance Optimization

1. **Use Quality Levels Appropriately:**
```typescript
// Let the engine auto-adjust
{ quality: 'auto' }

// Or set explicitly for target devices
{ quality: 'medium' }  // Mobile devices
{ quality: 'high' }    // Desktop
```

2. **Limit Particle Counts:**
```typescript
// Good: Reasonable particle count
{ particleCount: 100 }

// Bad: Too many particles
{ particleCount: 10000 }  // Will cause performance issues
```

3. **Preload Assets:**
```typescript
// Define assets for preloading
{
  "assets": [{
    "id": "background",
    "type": "image",
    "src": "/images/bg.jpg",
    "preload": true
  }]
}
```

4. **Use Appropriate Layer Types:**
```typescript
// Use DOM layers for simple effects
{ type: 'gradient' }

// Use Canvas layers for complex animations
{ type: 'particles' }
```

### Memory Management

1. **Clean Up Resources:**
```typescript
// Always destroy renderer when done
renderer.destroy();
```

2. **Limit Scene Complexity:**
```typescript
// Good: Focused scene with few layers
{ layers: [/* 5-10 layers */] }

// Bad: Too many layers
{ layers: [/* 50+ layers */] }  // May cause memory issues
```

3. **Reuse Assets:**
```typescript
// Define assets once, reference multiple times
{
  "assets": [{ "id": "logo", "src": "/logo.png" }],
  "scenes": [{
    "layers": [
      { "type": "image", "config": { "assetId": "logo" } }
    ]
  }]
}
```

### Accessibility

1. **Provide Alternative Content:**
```html
<div id="cinematic-container" aria-label="Cinematic presentation">
  <noscript>
    This content requires JavaScript to display.
  </noscript>
</div>
```

2. **Respect User Preferences:**
```typescript
// Check for reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  // Disable or simplify animations
  spec.engine.quality = 'low';
}
```

3. **Keyboard Navigation:**
```typescript
// Add keyboard controls
document.addEventListener('keydown', (e) => {
  if (e.key === ' ') renderer.isPlaying() ? renderer.pause() : renderer.play();
  if (e.key === 'Escape') renderer.stop();
});
```

### Error Handling

1. **Handle Errors Gracefully:**
```typescript
renderer.on('error', (error) => {
  console.error('Cinematic error:', error);
  // Show user-friendly error message
  showErrorMessage('Unable to load cinematic content');
});
```

2. **Validate Specifications:**
```typescript
// Use CLI to validate before deployment
// npx cinematic-renderer2d validate spec.json
```

3. **Provide Fallbacks:**
```typescript
{
  "assets": [{
    "id": "video",
    "type": "video",
    "src": "/video.mp4",
    "fallback": "/video-poster.jpg"  // Fallback image
  }]
}
```

## Migration Guide

### Upgrading from v0.1.x to v0.2.x

**Breaking Changes:**
- None (fully backward compatible)

**New Features:**
- Camera system
- Transition engine
- Light layers
- Enhanced animations (looping, yoyo, keyframes)
- Enhanced audio (per-track control, crossfading)
- Editor mode
- Scene templates
- Performance monitoring
- State machine
- Scene lifecycle management

**Recommended Updates:**

1. **Add Transitions:**
```typescript
// Old (no transitions)
{ "scenes": [...] }

// New (with transitions)
{
  "scenes": [...],
  "transitions": [{
    "fromScene": "scene1",
    "toScene": "scene2",
    "type": "crossfade",
    "duration": 1000
  }]
}
```

2. **Use Camera Animations:**
```typescript
// Add camera animations to scenes
{
  "scenes": [{
    "camera": {
      "animations": [{
        "property": "zoom",
        "from": 1.0,
        "to": 2.0,
        "startMs": 0,
        "endMs": 2000
      }]
    }
  }]
}
```

3. **Enable Editor Mode:**
```typescript
// Add editor mode for development
const renderer = new CinematicRenderer2D({
  container,
  spec,
  editorMode: true  // NEW
});
```

---

For more examples and tutorials, see the [Examples](./EXAMPLES.md) and [Getting Started](./GETTING_STARTED.md) guides.
