/**
 * Type Definitions Index for cinematicRenderer2D
 * 
 * This file exports all type definitions used throughout the cinematic rendering system.
 * It provides a single entry point for importing types and ensures consistency.
 */

// Core specification types
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
} from './CinematicSpec';

// Compiled runtime types
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
} from './CompiledSpec';

// Asset management types
export type {
  Asset,
  AssetData,
  AssetLoadProgress,
  AssetLoadOptions,
  AssetCacheConfig,
  AssetPriority,
} from './AssetTypes';

// Quality and performance types
export type {
  QualitySettings,
  PerformanceMetrics,
  DeviceCapabilities,
  QualitySystemConfig,
  PerformanceEvent,
} from './QualityTypes';

export { QUALITY_PRESETS } from './QualityTypes';

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
  Thenable,
  ValidatedConfig,
  Factory,
  Plugin,
  Serializable,
  DeepPartial,
  DeepRequired,
  Parameters,
  ReturnType,
  Omit,
  PartialBy,
  RequiredBy,
  UnionToIntersection,
  KeysOfType,
  Brand,
  Opaque,
} from './UtilityTypes';