/**
 * cinematicRenderer2D - High-performance, framework-agnostic cinematic rendering library
 * 
 * This library renders cinematic experiences from JSON specifications targeting 60-120fps performance.
 * It provides DOM, Canvas2D, and future WebGL rendering backends with adaptive quality systems.
 */

// Core engine exports
export { CinematicRenderer2D } from './core/CinematicRenderer2D';
export type { ICinematicRenderer2D } from './core/interfaces/ICinematicRenderer2D';
export type { PlaybackState } from './core/CinematicRenderer2D';

// Specification types
export type {
  CinematicSpec,
  CinematicEvent,
  CinematicScene,
  LayerSpec,
  LayerType,
  LayerConfig,
  TransformConfig,
  AnimationTrackSpec,
  AnimationValue,
  AnimationValueObject,
  EasingType,
  AudioTrackSpec,
  AudioTrackType,
  TransitionSpec,
  TransitionType,
  TransitionConfig,
  AssetDefinition,
  AssetType,
  AssetMetadata,
  EngineConfig,
  QualityLevel,
} from './types/CinematicSpec';

export type {
  CompiledSpec,
  CompiledEvent,
  CompiledScene,
  CompiledLayer,
  CompiledAnimationTrack,
  CompiledAudioTrack,
  CompiledTransition,
  InterpolationFunction,
  EasingFunction,
  TransitionFunction,
  CompilationContext,
  CompilationDiagnostic,
  CompilationOptimizations,
} from './types/CompiledSpec';

// Layer system exports
export type { ICinematicLayer } from './core/interfaces/ICinematicLayer';
export type { LayerMountContext, FrameContext } from './core/interfaces/LayerContext';
export { LayerRegistry } from './core/LayerRegistry';
export type { LayerFactory } from './core/LayerRegistry';

// Built-in layer types
export {
  GradientLayer,
  ImageLayer,
  TextBlockLayer,
  VignetteLayer,
  GlowOrbLayer,
  NoiseOverlayLayer,
  ParticlesLayer,
  StarfieldLayer,
  DustLayer,
  NebulaNoiseLayer,
} from './core/layers/BuiltInLayers';
export { LightLayer } from './core/layers/LightLayer';
export type { LightLayerConfig } from './core/layers/LightLayer';
export { ShapeLayer } from './core/layers/ShapeLayer';

// Shape rendering system
export type { IShapeRenderer, ShapeLayerConfig } from './core/shapes/IShapeRenderer';
export { DOMShapeRenderer } from './core/shapes/DOMShapeRenderer';
export { Canvas2DShapeRenderer } from './core/shapes/Canvas2DShapeRenderer';
export { ShapeGeometry } from './core/shapes/ShapeGeometry';

// Animation system exports
export { AnimationCompiler } from './animation/AnimationCompiler';
export type { CompiledAnimationTrack as AnimationTrack } from './types/CompiledSpec';

// Rendering backends
export { DOMRenderer } from './rendering/dom/DOMRenderer';
export { Canvas2DRenderer } from './rendering/canvas2d/Canvas2DRenderer';
export { RenderBackend } from './rendering/RenderBackend';

// Asset management
export { AssetManager } from './assets/AssetManager';
export type { 
  Asset, 
  AssetData,
  AssetLoadProgress,
  AssetLoadOptions,
  AssetCacheConfig,
  AssetPriority,
} from './types/AssetTypes';

// Audio system
export { AudioSystem } from './audio/AudioSystem';

// Quality and performance
export type { 
  QualitySettings,
  PerformanceMetrics,
  DeviceCapabilities,
  QualitySystemConfig,
  PerformanceEvent,
} from './types/QualityTypes';
export { QUALITY_PRESETS } from './types/QualityTypes';
export { QualitySystem } from './performance/QualitySystem';

// Utilities
export { SpecParser } from './parsing/SpecParser';
export { Scheduler } from './core/Scheduler';

// Camera system
export { CameraSystem } from './core/CameraSystem';
export type { CameraState, CameraAnimation } from './core/CameraSystem';

// Debug system
export { DebugOverlay } from './debug/DebugOverlay';
export type { DebugInfo, DebugOverlayOptions } from './debug/DebugOverlay';

// Editor mode
export { EditorMode } from './editor/EditorMode';
export type { EditorModeConfig, TimelineMarker } from './editor/EditorMode';

// Utility types
export type {
  Viewport,
  Point2D,
  Vector2D,
  Rectangle,
  Color,
  HSLColor,
  TimeValue,
  EventCallback,
  Disposable,
  Observable,
  DeepPartial,
  DeepRequired,
} from './types/UtilityTypes';

// Scene templates
export {
  SceneTemplates,
  SceneTemplateManager,
  createSunriseScene,
  createCosmicBirthScene,
  createRainScene,
  createDivineAuraScene,
  createUnderwaterScene,
} from './templates';
export type {
  TemplateCustomization,
  TemplateType,
  TemplateInfo,
} from './templates';

// Version
export const VERSION = '0.1.0';