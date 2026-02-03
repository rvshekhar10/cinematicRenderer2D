# Design Document: Cinematic Renderer 2D Enhancements

## Overview

This design document outlines the architecture and implementation approach for transforming the cinematic-renderer2d library into a production-ready "JSON → Cinema Engine". The enhancements address critical bugs in scene lifecycle management, add professional cinematic features (transitions, camera, lighting), improve performance and developer experience, and expand framework support.

The design follows a modular architecture where each major feature is implemented as a distinct subsystem that integrates with the existing core renderer. This approach minimizes disruption to existing functionality while enabling incremental adoption of new features.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   CinematicRenderer2D                       │
│                     (Core Orchestrator)                     │
└────────────┬────────────────────────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌─────────┐      ┌─────────────┐
│ State   │      │   Scene     │
│ Machine │◄────►│  Lifecycle  │
│         │      │   Manager   │
└────┬────┘      └──────┬──────┘
     │                  │
     │                  ▼
     │           ┌──────────────┐
     │           │  Transition  │
     │           │    Engine    │
     │           └──────┬───────┘
     │                  │
     ▼                  ▼
┌─────────────────────────────────┐
│      Rendering Pipeline         │
├─────────────────────────────────┤
│  Camera System                  │
│  Layer Registry (+ Light Layer) │
│  DOM Renderer / Canvas Renderer │
└─────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│    Supporting Systems           │
├─────────────────────────────────┤
│  Animation System (Enhanced)    │
│  Audio Engine (Enhanced)        │
│  Asset Preloader                │
│  Performance Monitor            │
│  Editor Mode                    │
└─────────────────────────────────┘
```

### Component Relationships

1. **State Machine** manages renderer and scene states, enforcing valid transitions
2. **Scene Lifecycle Manager** orchestrates scene phases (prepare → mount → play → unmount → destroy)
3. **Transition Engine** handles visual transitions between scenes with proper cleanup
4. **Camera System** provides viewport transformations applied to all layers
5. **Light Layer** is a new layer type registered in the Layer Registry
6. **Enhanced Animation System** extends existing AnimationCompiler with new features
7. **Enhanced Audio Engine** extends existing AudioSystem with crossfade and better control
8. **Asset Preloader** works with existing AssetManager to preload scene assets
9. **Performance Monitor** extends existing QualitySystem with adaptive quality
10. **Editor Mode** is a new debug tool that extends DebugOverlay

## Components and Interfaces

### 1. State Machine

**Purpose:** Manage renderer and scene states with strict transition rules to prevent race conditions and invalid states.

**Interface:**

```typescript
enum RendererState {
  IDLE = 'idle',
  READY = 'ready',
  PLAYING = 'playing',
  PAUSED = 'paused',
  STOPPED = 'stopped',
  DESTROYED = 'destroyed'
}

enum SceneState {
  CREATED = 'created',
  MOUNTED = 'mounted',
  ACTIVE = 'active',
  EXITING = 'exiting',
  UNMOUNTED = 'unmounted'
}

interface StateTransition {
  from: RendererState | SceneState;
  to: RendererState | SceneState;
  guard?: () => boolean;
  action?: () => void | Promise<void>;
}

class StateMachine {
  private currentState: RendererState | SceneState;
  private transitions: Map<string, StateTransition>;
  
  constructor(initialState: RendererState | SceneState);
  
  // Attempt state transition, throws if invalid
  transition(to: RendererState | SceneState): Promise<void>;
  
  // Check if transition is valid
  canTransition(to: RendererState | SceneState): boolean;
  
  // Get current state
  getState(): RendererState | SceneState;
  
  // Register valid transitions
  registerTransition(transition: StateTransition): void;
}
```

**State Transition Rules:**

Renderer States:
- IDLE → READY (when mount() completes)
- READY → PLAYING (when play() called)
- PLAYING → PAUSED (when pause() called)
- PLAYING → STOPPED (when stop() called or playback ends)
- PAUSED → PLAYING (when play() called again)
- PAUSED → STOPPED (when stop() called)
- STOPPED → PLAYING (when play() called)
- Any state → DESTROYED (when destroy() called)

Scene States:
- CREATED → MOUNTED (when mount() called)
- MOUNTED → ACTIVE (when play() called)
- ACTIVE → EXITING (when transition starts)
- EXITING → UNMOUNTED (when transition completes)
- UNMOUNTED → CREATED (scene can be reused)

**Key Constraint:** Only one scene can be in ACTIVE state at any time.

### 2. Scene Lifecycle Manager

**Purpose:** Manage scene lifecycle phases ensuring proper resource initialization and cleanup.

**Interface:**

```typescript
interface SceneLifecyclePhase {
  name: 'prepare' | 'mount' | 'play' | 'unmount' | 'destroy';
  execute: (scene: CompiledScene) => Promise<void>;
}

class SceneLifecycleManager {
  private activeScene: CompiledScene | null;
  private sceneStates: Map<string, SceneState>;
  private assetPreloader: AssetPreloader;
  private layerRegistry: LayerRegistry;
  
  constructor(
    assetPreloader: AssetPreloader,
    layerRegistry: LayerRegistry
  );
  
  // Execute full lifecycle for a scene
  async activateScene(scene: CompiledScene): Promise<void>;
  
  // Execute specific lifecycle phase
  async executePhase(
    scene: CompiledScene,
    phase: SceneLifecyclePhase
  ): Promise<void>;
  
  // Get current active scene
  getActiveScene(): CompiledScene | null;
  
  // Get scene state
  getSceneState(sceneId: string): SceneState;
  
  // Cleanup and deactivate scene
  async deactivateScene(scene: CompiledScene): Promise<void>;
}
```

**Lifecycle Phases:**

1. **prepare()**: Preload all assets (images, audio, fonts) required by scene layers
2. **mount()**: Create layer instances and attach DOM nodes to container
3. **play()**: Start animations and audio tracks
4. **unmount()**: Remove DOM nodes and stop animations
5. **destroy()**: Release all resources, cancel pending operations, clear references

### 3. Transition Engine

**Purpose:** Handle smooth visual transitions between scenes with proper cleanup.

**Interface:**

```typescript
interface TransitionConfig {
  type: 'crossfade' | 'slide' | 'zoom' | 'wipe' | 'dissolve' | 'blur';
  duration: number; // milliseconds
  easing: EasingType;
  direction?: 'up' | 'down' | 'left' | 'right' | 'in' | 'out';
  blurAmount?: number; // for blur transitions
}

interface TransitionContext {
  fromScene: CompiledScene;
  toScene: CompiledScene;
  container: HTMLElement;
  onProgress: (progress: number) => void;
  onComplete: () => void;
}

class TransitionEngine {
  private activeTransition: Promise<void> | null;
  private transitionHandlers: Map<string, TransitionHandler>;
  
  constructor();
  
  // Execute transition between scenes
  async executeTransition(
    config: TransitionConfig,
    context: TransitionContext
  ): Promise<void>;
  
  // Register custom transition handler
  registerTransition(type: string, handler: TransitionHandler): void;
  
  // Check if transition is currently running
  isTransitioning(): boolean;
  
  // Cancel active transition
  cancelTransition(): void;
}

interface TransitionHandler {
  execute(
    config: TransitionConfig,
    context: TransitionContext
  ): Promise<void>;
}
```

**Built-in Transitions:**

1. **Crossfade**: Simultaneously fade out old scene (opacity 1→0) and fade in new scene (opacity 0→1)
2. **Slide**: Move old scene out and new scene in from specified direction
3. **Zoom**: Scale old scene down while scaling new scene up
4. **Wipe**: Reveal new scene with a moving edge (like a curtain)
5. **Dissolve**: Pixelated transition using noise pattern
6. **Blur**: Blur old scene while fading in new scene

### 4. Camera System

**Purpose:** Provide viewport transformation for cinematic camera movements.

**Interface:**

```typescript
interface CameraState {
  x: number;        // Camera position X (pixels)
  y: number;        // Camera position Y (pixels)
  zoom: number;     // Zoom level (1.0 = 100%, 2.0 = 200%)
  rotate: number;   // Rotation angle (degrees)
}

interface CameraAnimation {
  property: 'x' | 'y' | 'zoom' | 'rotate';
  from: number;
  to: number;
  startMs: number;
  endMs: number;
  easing: EasingType;
}

class CameraSystem {
  private state: CameraState;
  private animations: CameraAnimation[];
  private container: HTMLElement;
  
  constructor(container: HTMLElement);
  
  // Set camera state
  setState(state: Partial<CameraState>): void;
  
  // Get current camera state
  getState(): CameraState;
  
  // Add camera animation
  addAnimation(animation: CameraAnimation): void;
  
  // Update camera for current time
  update(timeMs: number): void;
  
  // Apply camera transform to container
  applyTransform(): void;
  
  // Reset camera to default state
  reset(): void;
  
  // Get transform matrix for canvas rendering
  getTransformMatrix(): DOMMatrix;
}
```

**Implementation Approach:**

- For DOM layers: Apply CSS transform to scene container
- For Canvas layers: Adjust rendering coordinates using transform matrix
- Camera animations use same timing/easing as layer animations
- Camera state is independent of scene state (persists across scenes unless reset)

### 5. Light Layer System

**Purpose:** Add cinematic lighting effects as a new layer type.

**Interface:**

```typescript
interface LightLayerConfig {
  mode: 'radial' | 'spot' | 'ambient' | 'vignette';
  position?: { x: number; y: number }; // for radial/spot
  radius?: number;                      // for radial/vignette
  intensity?: number;                   // 0-1
  color?: string;                       // CSS color
  angle?: number;                       // for spot (degrees)
  direction?: number;                   // for spot (degrees)
  blendMode?: 'screen' | 'overlay' | 'soft-light' | 'multiply';
}

class LightLayer implements ICinematicLayer {
  id: string;
  type: 'light';
  zIndex: number;
  private config: LightLayerConfig;
  private element: HTMLElement | null;
  
  constructor(id: string, config: LightLayerConfig);
  
  mount(context: LayerMountContext): void;
  update(context: FrameContext): void;
  destroy(): void;
  
  // Update light properties
  setPosition(x: number, y: number): void;
  setIntensity(intensity: number): void;
  setColor(color: string): void;
  setRadius(radius: number): void;
}
```

**Rendering Approach:**

- DOM Backend: Use CSS gradients with mix-blend-mode
- Canvas Backend: Use composite operations (globalCompositeOperation)
- Support animating all light properties (position, intensity, color, radius)

**Light Modes:**

1. **Radial**: Circular gradient from center point
2. **Spot**: Directional cone of light
3. **Ambient**: Uniform color overlay
4. **Vignette**: Darkening at edges

### 6. Enhanced Animation System

**Purpose:** Extend existing animation system with looping, keyframes, stagger, and randomization.

**Interface:**

```typescript
interface EnhancedAnimationTrack extends AnimationTrackSpec {
  loop?: boolean;
  yoyo?: boolean;
  keyframes?: AnimationKeyframe[];
  stagger?: StaggerConfig;
  randomize?: RandomizeConfig;
}

interface AnimationKeyframe {
  time: number;      // 0-1 (percentage of animation duration)
  value: any;
  easing?: EasingType;
}

interface StaggerConfig {
  amount: number;    // Time offset between items (ms)
  from?: 'start' | 'center' | 'end';
  grid?: [number, number]; // For 2D stagger
}

interface RandomizeConfig {
  property: string;
  min: number;
  max: number;
  seed?: number;     // For reproducible randomness
}

class EnhancedAnimationCompiler extends AnimationCompiler {
  // Compile animation with enhanced features
  static compileEnhancedTrack(
    track: EnhancedAnimationTrack
  ): CompiledAnimationTrack;
  
  // Generate staggered animations for multiple targets
  static generateStaggeredAnimations(
    baseTrack: EnhancedAnimationTrack,
    targetCount: number,
    stagger: StaggerConfig
  ): CompiledAnimationTrack[];
  
  // Apply randomization to animation values
  static applyRandomization(
    track: EnhancedAnimationTrack,
    randomize: RandomizeConfig
  ): EnhancedAnimationTrack;
}
```

**New Features:**

1. **Loop**: Restart animation from beginning when complete
2. **Yoyo**: Reverse animation direction on each loop
3. **Keyframes**: Multiple intermediate values with individual easing
4. **Stagger**: Time-offset animations for multiple similar elements
5. **Randomization**: Apply random variations within bounds

### 7. Enhanced Audio Engine

**Purpose:** Extend existing AudioSystem with better per-scene control and crossfading.

**Interface:**

```typescript
interface EnhancedAudioTrack extends AudioTrackSpec {
  loop?: boolean;
  volume?: number;
  fadeIn?: number;
  fadeOut?: number;
  crossfade?: boolean; // Enable crossfade with next scene's audio
}

class EnhancedAudioSystem extends AudioSystem {
  private crossfadeQueue: Map<string, AudioCrossfade>;
  
  // Play audio track with enhanced features
  async playTrack(track: EnhancedAudioTrack): Promise<void>;
  
  // Crossfade between two tracks
  async crossfadeTracks(
    fromTrack: string,
    toTrack: string,
    duration: number
  ): Promise<void>;
  
  // Fade in track
  async fadeIn(trackId: string, duration: number): Promise<void>;
  
  // Fade out track
  async fadeOut(trackId: string, duration: number): Promise<void>;
  
  // Stop all tracks for a scene
  stopSceneTracks(sceneId: string): void;
}

interface AudioCrossfade {
  fromTrackId: string;
  toTrackId: string;
  duration: number;
  startTime: number;
  progress: number;
}
```

**Crossfade Implementation:**

- Use Web Audio API GainNode for smooth volume transitions
- Simultaneously fade out old track and fade in new track
- Support configurable crossfade duration
- Automatically clean up old track when crossfade completes

### 8. Asset Preloader & Performance System

**Purpose:** Preload assets before scenes and adapt quality based on performance.

**Interface:**

```typescript
interface PreloadConfig {
  priority: 'critical' | 'high' | 'normal' | 'low';
  timeout?: number;
  retries?: number;
}

interface PreloadProgress {
  total: number;
  loaded: number;
  failed: number;
  percentage: number;
}

class AssetPreloader {
  private assetManager: AssetManager;
  private preloadQueue: Map<string, PreloadConfig>;
  private cache: Map<string, Asset>;
  
  constructor(assetManager: AssetManager);
  
  // Preload assets for a scene
  async preloadScene(scene: CompiledScene): Promise<PreloadProgress>;
  
  // Preload specific assets
  async preloadAssets(
    assetIds: string[],
    config?: PreloadConfig
  ): Promise<PreloadProgress>;
  
  // Check if assets are loaded
  areAssetsLoaded(assetIds: string[]): boolean;
  
  // Get preload progress
  getProgress(): PreloadProgress;
  
  // Clear cache
  clearCache(): void;
}

interface PerformanceThresholds {
  fpsLow: number;      // Below this, reduce quality
  fpsCritical: number; // Below this, switch to low quality
  memoryHigh: number;  // Above this, reduce particle counts
}

class PerformanceMonitor extends QualitySystem {
  private thresholds: PerformanceThresholds;
  private metrics: PerformanceMetrics;
  
  constructor(thresholds: PerformanceThresholds);
  
  // Update performance metrics
  updateMetrics(metrics: PerformanceMetrics): void;
  
  // Check if quality adjustment needed
  shouldAdjustQuality(): boolean;
  
  // Get recommended quality level
  getRecommendedQuality(): QualityLevel;
  
  // Apply performance optimizations
  applyOptimizations(scene: CompiledScene): void;
}
```

**Performance Optimizations:**

- FPS < 50: Reduce particle counts by 50%
- FPS < 30: Switch to low quality, disable expensive effects
- Memory high: Clear unused asset cache
- Continuous monitoring with 1-second intervals

### 9. CLI Improvements

**Purpose:** Better command-line tools for validation, preview, and development.

**Interface:**

```typescript
interface CLICommand {
  name: string;
  description: string;
  options: CLIOption[];
  execute: (args: any) => Promise<void>;
}

interface CLIOption {
  name: string;
  alias?: string;
  description: string;
  required?: boolean;
  default?: any;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  stats: SpecStats;
}

interface ValidationError {
  path: string;
  message: string;
  suggestion?: string;
}

interface SpecStats {
  eventCount: number;
  sceneCount: number;
  layerCount: number;
  totalDuration: number;
  assetCount: number;
}

class CLI {
  private commands: Map<string, CLICommand>;
  
  // Register command
  registerCommand(command: CLICommand): void;
  
  // Execute command
  async execute(commandName: string, args: any): Promise<void>;
  
  // Built-in commands
  async validate(file: string, options: any): Promise<ValidationResult>;
  async preview(file: string, options: any): Promise<void>;
  async dev(file: string, options: any): Promise<void>;
}
```

**Commands:**

1. **validate**: Check JSON spec for errors with detailed messages
2. **preview**: Generate standalone HTML preview file
3. **dev**: Start live preview server with hot reload

### 10. New Layer Types

**Purpose:** Add common cinematic layer types to the registry.

**New Layer Types:**

```typescript
// Fog layer
interface FogLayerConfig {
  density: number;    // 0-1
  color: string;
  speed: number;      // Movement speed
  direction: number;  // Movement direction (degrees)
}

class FogLayer implements ICinematicLayer {
  // Renders moving fog using Canvas2D or CSS animation
}

// Noise overlay (film grain)
interface NoiseOverlayConfig {
  intensity: number;  // 0-1
  scale: number;      // Grain size
  animated: boolean;  // Animate grain
}

class NoiseOverlayLayer implements ICinematicLayer {
  // Renders film grain using Canvas2D noise
}

// Image layer (enhanced)
interface ImageLayerConfig {
  src: string;
  format: 'png' | 'svg' | 'jpg';
  position: { x: number; y: number };
  scale: number;
  rotation: number;
  objectFit: 'cover' | 'contain' | 'fill';
}

class ImageLayer implements ICinematicLayer {
  // Renders images with positioning and transforms
}

// Parallax group
interface ParallaxGroupConfig {
  layers: ParallaxLayerConfig[];
  scrollSpeed: number;
}

interface ParallaxLayerConfig {
  layerId: string;
  depth: number;      // 0-1 (0=background, 1=foreground)
  speed: number;      // Relative scroll speed
}

class ParallaxGroupLayer implements ICinematicLayer {
  // Groups layers with different scroll speeds
}

// Glow effect
interface GlowEffectConfig {
  position: { x: number; y: number };
  radius: number;
  intensity: number;
  color: string;
  blur: number;
}

class GlowEffectLayer implements ICinematicLayer {
  // Renders soft glow using CSS filters or Canvas
}
```

### 11. Editor Mode

**Purpose:** Visual development tools for debugging and timeline scrubbing.

**Interface:**

```typescript
interface EditorModeConfig {
  enabled: boolean;
  showTimeline: boolean;
  showBoundingBoxes: boolean;
  showPropertyInspector: boolean;
  showPerformanceMetrics: boolean;
}

interface TimelineMarker {
  time: number;
  label: string;
  type: 'scene' | 'event' | 'custom';
}

class EditorMode {
  private config: EditorModeConfig;
  private renderer: CinematicRenderer2D;
  private timeline: TimelineUI;
  private inspector: PropertyInspector;
  private overlay: EditorOverlay;
  
  constructor(renderer: CinematicRenderer2D, config: EditorModeConfig);
  
  // Enable/disable editor mode
  setEnabled(enabled: boolean): void;
  
  // Show timeline scrubber
  showTimeline(): void;
  
  // Show bounding boxes around layers
  showBoundingBoxes(): void;
  
  // Show property inspector for selected layer
  showPropertyInspector(layerId: string): void;
  
  // Handle timeline scrubbing
  onTimelineScrub(time: number): void;
  
  // Handle layer selection
  onLayerClick(layerId: string): void;
}

class TimelineUI {
  private container: HTMLElement;
  private markers: TimelineMarker[];
  private scrubber: HTMLElement;
  
  // Render timeline
  render(): void;
  
  // Update scrubber position
  updateScrubber(time: number): void;
  
  // Add timeline marker
  addMarker(marker: TimelineMarker): void;
}

class PropertyInspector {
  private container: HTMLElement;
  private selectedLayer: ICinematicLayer | null;
  
  // Show properties for layer
  showLayer(layer: ICinematicLayer): void;
  
  // Update property values in real-time
  updateProperties(): void;
}
```

**Editor Features:**

1. **Timeline Scrubber**: Visual timeline with scene markers, draggable scrubber
2. **Bounding Boxes**: Outline all layers with IDs
3. **Property Inspector**: Show current values for selected layer
4. **Performance Metrics**: FPS, memory, active layers
5. **Layer Selection**: Click layers to inspect

### 12. Framework Wrappers Enhancement

**Purpose:** Improve React and Angular wrappers with better lifecycle integration.

**React Wrapper:**

```typescript
interface CinematicPlayerProps {
  spec: CinematicSpec;
  autoplay?: boolean;
  quality?: QualityLevel;
  debug?: boolean;
  editorMode?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
  onSceneChange?: (sceneId: string) => void;
}

// Hook for imperative control
function useRenderer(
  spec: CinematicSpec,
  options?: Partial<CinematicPlayerProps>
): {
  renderer: CinematicRenderer2D | null;
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  goToScene: (sceneId: string) => void;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

// Component with ref forwarding
const CinematicPlayer = React.forwardRef<
  CinematicRenderer2D,
  CinematicPlayerProps
>((props, ref) => {
  // Implementation
});
```

**Angular Wrapper:**

```typescript
@Component({
  selector: 'cinematic-player',
  template: '<div #container class="cinematic-container"></div>'
})
export class CinematicPlayerComponent implements OnInit, OnDestroy {
  @Input() spec!: CinematicSpec;
  @Input() autoplay = false;
  @Input() quality: QualityLevel = 'auto';
  @Input() debug = false;
  @Input() editorMode = false;
  
  @Output() play = new EventEmitter<void>();
  @Output() pause = new EventEmitter<void>();
  @Output() stop = new EventEmitter<void>();
  @Output() end = new EventEmitter<void>();
  @Output() error = new EventEmitter<Error>();
  @Output() sceneChange = new EventEmitter<string>();
  
  @ViewChild('container', { static: true }) container!: ElementRef;
  
  private renderer: CinematicRenderer2D | null = null;
  
  ngOnInit(): void {
    // Initialize renderer
  }
  
  ngOnDestroy(): void {
    // Cleanup renderer
  }
  
  // Public methods for imperative control
  playRenderer(): void;
  pauseRenderer(): void;
  stopRenderer(): void;
  seekTo(time: number): void;
  goToScene(sceneId: string): void;
}
```

## Data Models

### Enhanced Specification Types

```typescript
// Extended scene specification
interface EnhancedCinematicScene extends CinematicScene {
  camera?: CameraAnimation[];
  transition?: TransitionConfig;
  preload?: string[]; // Asset IDs to preload
}

// Extended layer specification
interface EnhancedLayerSpec extends LayerSpec {
  animations?: EnhancedAnimationTrack[];
}

// Extended audio specification
interface EnhancedAudioTrackSpec extends AudioTrackSpec {
  loop?: boolean;
  fadeIn?: number;
  fadeOut?: number;
  crossfade?: boolean;
}

// Light layer specification
interface LightLayerSpec extends LayerSpec {
  type: 'light';
  config: LightLayerConfig;
}
```

### Runtime State Models

```typescript
// Scene runtime state
interface SceneRuntimeState {
  id: string;
  state: SceneState;
  layers: ICinematicLayer[];
  audioTracks: AudioTrack[];
  startTime: number;
  endTime: number;
  preloaded: boolean;
}

// Transition runtime state
interface TransitionRuntimeState {
  active: boolean;
  fromSceneId: string;
  toSceneId: string;
  progress: number;
  startTime: number;
  duration: number;
}

// Camera runtime state
interface CameraRuntimeState {
  current: CameraState;
  animations: CameraAnimation[];
  transformMatrix: DOMMatrix;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Before defining the correctness properties, let me analyze each acceptance criterion for testability:



### Scene Cleanup Properties

Property 1: Layer destruction before mounting
*For any* scene transition, all layers from the previous scene should be destroyed before any layers from the new scene are mounted.
**Validates: Requirements 1.1**

Property 2: Animation loop cancellation on destroy
*For any* layer with active animations, when the layer is destroyed, all animation loops should be cancelled and no animation callbacks should continue executing.
**Validates: Requirements 1.2**

Property 3: DOM node removal on destroy
*For any* layer, when destroyed, all DOM nodes created by that layer should be removed from the container, returning the DOM node count to its pre-mount value.
**Validates: Requirements 1.3**

Property 4: Memory stability across scenes
*For any* sequence of scene transitions, the number of tracked objects (layers, animations, audio tracks) should not grow beyond the maximum required for a single scene.
**Validates: Requirements 1.4**

Property 5: Interrupted transition cleanup
*For any* scene transition that is interrupted by another transition, the original scene should complete its cleanup (reach UNMOUNTED state) before the new scene begins mounting.
**Validates: Requirements 1.5**

### Transition Engine Properties

Property 6: Transition type support
*For any* transition type in the set {crossfade, slide, zoom, wipe, dissolve, blur}, the Transition Engine should be able to execute that transition without error.
**Validates: Requirements 2.1**

Property 7: Transition configuration acceptance
*For any* valid duration (positive number) and easing function, the Transition Engine should accept and apply these configuration values.
**Validates: Requirements 2.2**

Property 8: Crossfade simultaneity
*For any* crossfade transition, at any point during the transition, the sum of the old scene opacity and new scene opacity should remain constant (approximately 1.0).
**Validates: Requirements 2.3**

Property 9: Transition cleanup order
*For any* transition, the old scene should reach UNMOUNTED state before the new scene reaches ACTIVE state.
**Validates: Requirements 2.4**

### State Machine Properties

Property 10: Valid state transitions from IDLE
*For any* state transition attempt from IDLE state, only the transition to READY state should succeed; all other transitions should throw an error.
**Validates: Requirements 3.3**

Property 11: Valid state transitions from PLAYING
*For any* state transition attempt from PLAYING state, only transitions to PAUSED, STOPPED, or DESTROYED states should succeed; all other transitions should throw an error.
**Validates: Requirements 3.4**

Property 12: Single active scene invariant
*For any* point in time during renderer execution, at most one scene should be in ACTIVE state.
**Validates: Requirements 3.5, 4.7**

Property 13: Invalid transition error handling
*For any* invalid state transition attempt, the State Machine should throw an error with a message describing the invalid transition.
**Validates: Requirements 3.6**

### Scene Lifecycle Properties

Property 14: Lifecycle phase ordering
*For any* scene activation, the lifecycle phases should execute in the order: prepare() → mount() → play(), and deactivation phases should execute in the order: unmount() → destroy().
**Validates: Requirements 4.1**

Property 15: Asset preloading in prepare phase
*For any* scene, when prepare() completes, all assets referenced by that scene's layers should be loaded and cached.
**Validates: Requirements 4.2**

Property 16: DOM node creation in mount phase
*For any* scene, when mount() completes, all layers should have their DOM nodes created and attached to the container.
**Validates: Requirements 4.3**

Property 17: Animation and audio start in play phase
*For any* scene, when play() is called, all animations and audio tracks for that scene should transition from inactive to active state.
**Validates: Requirements 4.4**

Property 18: DOM node removal in unmount phase
*For any* scene, when unmount() completes, all layer DOM nodes should be removed from the container.
**Validates: Requirements 4.5**

Property 19: Resource release in destroy phase
*For any* scene, when destroy() completes, all resources (layers, animations, audio) should be released and no pending operations should remain.
**Validates: Requirements 4.6**

### Light Layer Properties

Property 20: Light mode support
*For any* light mode in the set {radial, spot, ambient, vignette}, a Light Layer should be creatable with that mode and should render without error.
**Validates: Requirements 5.1**

Property 21: Blend mode support
*For any* blend mode in the set {screen, overlay, soft-light, multiply}, a Light Layer should accept that blend mode and apply it to the rendered output.
**Validates: Requirements 5.4**

Property 22: Light property animation
*For any* Light Layer and any animatable property in the set {position, intensity, color, radius}, animating that property should cause the rendered light to change over time.
**Validates: Requirements 5.5**

### Camera System Properties

Property 23: Camera transform application
*For any* camera state change, the Camera System should apply the corresponding transforms to both DOM layers (via CSS transform) and Canvas layers (via coordinate adjustment).
**Validates: Requirements 6.2, 6.3**

Property 24: Camera animation interpolation
*For any* camera animation, sampling the camera property at intermediate times should yield values that smoothly interpolate between the start and end values according to the specified easing function.
**Validates: Requirements 6.4**

Property 25: Camera animation feature parity
*For any* timing or easing option supported by layer animations, camera animations should also support that option.
**Validates: Requirements 6.5**

### Advanced Animation Properties

Property 26: Animation looping
*For any* animation with loop enabled, when the animation completes, it should restart from the beginning and continue playing.
**Validates: Requirements 7.1**

Property 27: Animation yoyo behavior
*For any* animation with yoyo and loop enabled, the animation direction should reverse on each loop iteration, alternating between forward and backward.
**Validates: Requirements 7.2**

Property 28: Keyframe interpolation
*For any* keyframe animation, sampling the animated property at times between keyframes should yield values that smoothly interpolate through all keyframes using the specified easing functions.
**Validates: Requirements 7.3, 7.6**

Property 29: Stagger timing
*For any* staggered animation set with N targets and stagger amount S, the start time of target i should be i * S milliseconds after the start time of target 0.
**Validates: Requirements 7.4**

Property 30: Randomization bounds
*For any* animation with randomization, all generated random values should fall within the specified min and max bounds.
**Validates: Requirements 7.5**

### Audio Engine Properties

Property 31: Audio track feature support
*For any* audio track, the properties {loop, volume, fadeIn, fadeOut} should be configurable and should affect playback behavior.
**Validates: Requirements 8.1**

Property 32: Audio crossfade simultaneity
*For any* scene transition with audio crossfade, at any point during the crossfade, one track should be fading out while the other fades in, with volumes changing in opposite directions.
**Validates: Requirements 8.2**

Property 33: Volume fade behavior
*For any* audio track with fadeIn or fadeOut, sampling the volume at intermediate times should show gradual change from the start volume to the target volume over the specified duration.
**Validates: Requirements 8.3, 8.4**

Property 34: Multi-track playback
*For any* set of audio tracks playing simultaneously, each track should maintain its independent volume level and playback state.
**Validates: Requirements 8.5**

Property 35: Audio cleanup on unmount
*For any* scene with audio tracks, when the scene is unmounted, all audio tracks should stop playing and audio resources should be released.
**Validates: Requirements 8.6**

### Asset Preloader & Performance Properties

Property 36: Scene asset preloading
*For any* scene, when prepare() completes, all assets required by that scene should be loaded and available in the cache.
**Validates: Requirements 9.1**

Property 37: Asset cache reuse
*For any* asset referenced by multiple scenes, the asset should be loaded only once and reused from cache for subsequent scenes.
**Validates: Requirements 9.2**

Property 38: Priority-based loading order
*For any* set of assets with different priorities, critical priority assets should complete loading before high priority assets, which should complete before normal priority assets.
**Validates: Requirements 9.3**

Property 39: Performance adaptation at 50 FPS
*For any* renderer state where measured FPS drops below 50, the Performance Monitor should reduce particle counts and disable expensive effects.
**Validates: Requirements 9.4**

Property 40: Quality downgrade at 30 FPS
*For any* renderer state where measured FPS drops below 30, the Performance Monitor should automatically switch to low quality mode.
**Validates: Requirements 9.5**

Property 41: Performance metrics tracking
*For any* frame rendered, the Performance Monitor should update metrics for frame time, memory usage, and dropped frames.
**Validates: Requirements 9.6**

Property 42: Auto quality adjustment
*For any* renderer with quality set to 'auto', when performance metrics change significantly, the quality level should adjust to maintain target FPS.
**Validates: Requirements 9.7**

### CLI Properties

Property 43: Validation error reporting
*For any* invalid specification, the validate command should output error messages that include the error location (path) and a suggestion for fixing the error.
**Validates: Requirements 10.2**

Property 44: Dev server hot reload
*For any* specification file change while the dev server is running, the preview should automatically reload within a reasonable time (< 2 seconds).
**Validates: Requirements 10.4**

Property 45: Validation success reporting
*For any* valid specification, the validate command should output a success message that includes statistics (event count, scene count, layer count, total duration).
**Validates: Requirements 10.6**

### Layer Registry Properties

Property 46: Layer interface validation
*For any* layer type registration, if the layer does not implement the ICinematicLayer interface, the registration should fail with a descriptive error.
**Validates: Requirements 11.7**

### Template Properties

Property 47: Template customization
*For any* template and any customizable property (color, timing, effect), modifying that property should result in the rendered scene reflecting the customization.
**Validates: Requirements 12.3**

### Framework Wrapper Properties

Property 48: Angular lifecycle integration
*For any* Angular component using the cinematic wrapper, when the component's ngOnDestroy is called, the renderer's destroy() method should be called automatically.
**Validates: Requirements 13.3, 13.6**

Property 49: React cleanup on unmount
*For any* React component using the cinematic wrapper, when the component unmounts, the renderer's destroy() method should be called automatically.
**Validates: Requirements 13.5**

### Editor Mode Properties

Property 50: Timeline scrubber seeking
*For any* timeline scrubber drag to position P (where P is a time in milliseconds), the renderer should seek to time P within a reasonable tolerance (< 100ms).
**Validates: Requirements 14.2**

Property 51: Layer inspector display
*For any* layer click in editor mode, the property inspector should display and show the current values of all animatable properties for that layer.
**Validates: Requirements 14.4**

## Error Handling

### Error Categories

1. **Validation Errors**: Invalid specification format, missing required fields, invalid values
2. **State Errors**: Invalid state transitions, operations in wrong state
3. **Resource Errors**: Asset loading failures, audio playback failures
4. **Lifecycle Errors**: Lifecycle phase failures, cleanup failures
5. **Rendering Errors**: Layer rendering failures, animation errors

### Error Handling Strategy

```typescript
class CinematicError extends Error {
  code: string;
  category: ErrorCategory;
  recoverable: boolean;
  context?: Record<string, any>;
  
  constructor(
    message: string,
    code: string,
    category: ErrorCategory,
    recoverable: boolean = false,
    context?: Record<string, any>
  ) {
    super(message);
    this.code = code;
    this.category = category;
    this.recoverable = recoverable;
    this.context = context;
  }
}

type ErrorCategory = 
  | 'validation'
  | 'state'
  | 'resource'
  | 'lifecycle'
  | 'rendering';
```

### Error Recovery

- **Validation Errors**: Fail fast during initialization, provide detailed error messages
- **State Errors**: Throw errors for invalid transitions, log warnings for recoverable issues
- **Resource Errors**: Retry with exponential backoff, fall back to default assets if available
- **Lifecycle Errors**: Attempt cleanup, emit error event, prevent further operations
- **Rendering Errors**: Skip failed layer, log error, continue rendering other layers

### Error Events

All errors should be emitted through the renderer's event system:

```typescript
renderer.on('error', (error: CinematicError) => {
  console.error(`[${error.category}] ${error.code}: ${error.message}`);
  if (error.context) {
    console.error('Context:', error.context);
  }
});
```

## Testing Strategy

### Dual Testing Approach

This project requires both unit tests and property-based tests for comprehensive coverage:

- **Unit Tests**: Verify specific examples, edge cases, and error conditions
- **Property Tests**: Verify universal properties across all inputs using randomized testing

Both testing approaches are complementary and necessary. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across a wide range of inputs.

### Unit Testing Guidelines

Unit tests should focus on:
- Specific examples that demonstrate correct behavior (e.g., "crossfade transition with 500ms duration")
- Edge cases (e.g., "transition interrupted immediately after starting")
- Error conditions (e.g., "invalid state transition throws error")
- Integration points between components (e.g., "State Machine coordinates with Scene Lifecycle Manager")

Avoid writing too many unit tests for scenarios that property tests can cover. For example, instead of writing 10 unit tests for different animation durations, write one property test that validates animation behavior for any duration.

### Property-Based Testing Configuration

- **Library**: Use `fast-check` for TypeScript property-based testing
- **Iterations**: Minimum 100 iterations per property test (due to randomization)
- **Tagging**: Each property test must reference its design document property

Tag format:
```typescript
// Feature: cinematic-renderer2d-enhancements, Property 1: Layer destruction before mounting
test('property: layer destruction before mounting', () => {
  fc.assert(
    fc.property(
      sceneGenerator(),
      sceneGenerator(),
      (scene1, scene2) => {
        // Test implementation
      }
    ),
    { numRuns: 100 }
  );
});
```

### Test Organization

```
tests/
├── unit/
│   ├── state-machine.test.ts
│   ├── scene-lifecycle.test.ts
│   ├── transition-engine.test.ts
│   ├── camera-system.test.ts
│   ├── light-layer.test.ts
│   ├── animation-system.test.ts
│   ├── audio-engine.test.ts
│   ├── asset-preloader.test.ts
│   ├── performance-monitor.test.ts
│   ├── cli.test.ts
│   ├── layer-types.test.ts
│   ├── editor-mode.test.ts
│   └── framework-wrappers.test.ts
├── property/
│   ├── scene-cleanup.property.test.ts
│   ├── transitions.property.test.ts
│   ├── state-machine.property.test.ts
│   ├── lifecycle.property.test.ts
│   ├── camera.property.test.ts
│   ├── animations.property.test.ts
│   ├── audio.property.test.ts
│   ├── performance.property.test.ts
│   └── wrappers.property.test.ts
├── integration/
│   ├── full-playback.test.ts
│   ├── scene-transitions.test.ts
│   ├── camera-with-layers.test.ts
│   └── audio-with-transitions.test.ts
└── generators/
    ├── scene-generator.ts
    ├── layer-generator.ts
    ├── animation-generator.ts
    └── spec-generator.ts
```

### Property Test Generators

Create reusable generators for property-based tests:

```typescript
// Scene generator
function sceneGenerator(): fc.Arbitrary<CompiledScene> {
  return fc.record({
    id: fc.string(),
    name: fc.string(),
    duration: fc.integer({ min: 100, max: 10000 }),
    layers: fc.array(layerGenerator(), { minLength: 1, maxLength: 10 }),
    audioTracks: fc.array(audioTrackGenerator(), { maxLength: 3 }),
    startTime: fc.integer({ min: 0, max: 100000 }),
    endTime: fc.integer({ min: 0, max: 100000 })
  });
}

// Layer generator
function layerGenerator(): fc.Arbitrary<CompiledLayer> {
  return fc.record({
    id: fc.string(),
    type: fc.constantFrom('gradient', 'particles', 'textBlock', 'light'),
    zIndex: fc.integer({ min: 0, max: 100 }),
    instance: fc.constant({} as any), // Mock layer instance
    animations: fc.array(animationGenerator(), { maxLength: 5 }),
    initialConfig: fc.object(),
    active: fc.boolean()
  });
}

// Animation generator
function animationGenerator(): fc.Arbitrary<CompiledAnimationTrack> {
  return fc.record({
    property: fc.constantFrom('opacity', 'x', 'y', 'scale', 'rotation'),
    from: fc.oneof(fc.float(), fc.string()),
    to: fc.oneof(fc.float(), fc.string()),
    startMs: fc.integer({ min: 0, max: 5000 }),
    endMs: fc.integer({ min: 0, max: 10000 }),
    easingFunction: fc.func(fc.float()),
    loop: fc.boolean(),
    yoyo: fc.boolean()
  }).filter(anim => anim.endMs > anim.startMs);
}
```

### Coverage Goals

- **Unit Test Coverage**: Minimum 80% line coverage
- **Property Test Coverage**: All 51 correctness properties must have corresponding property tests
- **Integration Test Coverage**: All major workflows (playback, transitions, camera, audio)
- **Edge Case Coverage**: All error conditions and boundary cases

### Continuous Integration

- Run all tests on every commit
- Run property tests with increased iterations (1000) on main branch
- Generate coverage reports and fail if below threshold
- Run performance benchmarks to detect regressions

## Implementation Notes

### Backward Compatibility

All enhancements must maintain backward compatibility with existing specifications:

- Existing specs without new features should continue to work
- New features should be opt-in through configuration
- Default behavior should match current behavior
- Schema version should remain '1.0.0' unless breaking changes are required

### Performance Considerations

- Scene transitions should complete within the specified duration ±10ms
- Camera transforms should not cause layout thrashing (use transform instead of position)
- Light layers should use GPU-accelerated blend modes when available
- Asset preloading should not block the main thread
- Performance monitoring should have minimal overhead (<1% CPU)

### Browser Compatibility

- Modern browsers: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- Graceful degradation for older browsers (disable advanced features)
- Polyfills for missing APIs (ResizeObserver, IntersectionObserver)
- Feature detection for Web Audio API, CSS blend modes

### Accessibility

- Editor mode should be keyboard navigable
- Timeline scrubber should support keyboard control
- Error messages should be screen reader friendly
- Debug overlay should respect prefers-reduced-motion

### Security

- Validate all user-provided URLs for assets
- Sanitize all user-provided text content
- Prevent XSS through proper escaping
- Limit asset sizes to prevent memory exhaustion
- Rate limit asset loading to prevent DoS

## Migration Guide

For users upgrading from the current version:

1. **No Breaking Changes**: All existing code continues to work
2. **Opt-in Features**: New features require explicit configuration
3. **Deprecation Warnings**: Old patterns emit console warnings
4. **Migration Helpers**: Utility functions to convert old specs to new format

Example migration:

```typescript
// Old code (still works)
const renderer = new CinematicRenderer2D({
  container: element,
  spec: oldSpec
});

// New code with enhancements
const renderer = new CinematicRenderer2D({
  container: element,
  spec: enhancedSpec, // Can include new features
  editorMode: true,   // Enable new editor mode
});

// Use new features
renderer.on('sceneChange', (sceneId) => {
  console.log('Scene changed:', sceneId);
});
```

## Future Enhancements

Features not included in this spec but planned for future versions:

1. **WebGL Renderer**: Hardware-accelerated rendering for complex scenes
2. **3D Layer Support**: Basic 3D transforms and perspective
3. **Video Layer**: Support for video playback as layers
4. **Interactive Layers**: Click handlers and hover effects
5. **Timeline Editor**: Visual timeline editing tool
6. **Export to Video**: Render cinematic to video file
7. **Collaborative Editing**: Real-time collaborative spec editing
8. **Cloud Asset Storage**: CDN integration for assets
9. **Analytics Integration**: Track playback metrics
10. **A/B Testing**: Test different cinematic variations
