/**
 * Compiled Runtime Types for cinematicRenderer2D
 * 
 * These types represent the optimized, runtime-ready versions of the JSON specifications
 * after parsing, validation, and compilation. All animation tracks are precompiled into
 * optimized interpolation functions for maximum performance.
 * 
 * Requirements: 3.1, 3.5 - Compiled runtime models with performance optimization
 */

import type { ICinematicLayer } from '../core/interfaces/ICinematicLayer';
import type { Asset } from './AssetTypes';
import type { EngineConfig, AudioTrackType, TransitionType, EasingType } from './CinematicSpec';

export interface CompiledSpec {
  /** Map of event IDs to compiled event objects */
  events: Map<string, CompiledEvent>;
  /** Map of scene IDs to compiled scene objects */
  scenes: Map<string, CompiledScene>;
  /** Map of asset IDs to loaded asset objects */
  assets: Map<string, Asset>;
  /** Global engine configuration */
  globalConfig: EngineConfig;
  /** Schema version for compatibility checking */
  schemaVersion: string;
  /** Total duration of all content in milliseconds */
  totalDuration: number;
  /** Compilation timestamp for cache validation */
  compiledAt: number;
}

export interface CompiledEvent {
  /** Unique identifier for the event */
  id: string;
  /** Human-readable name for the event */
  name: string;
  /** Array of compiled scene objects (not just IDs) */
  scenes: CompiledScene[];
  /** Compiled transition effects between scenes */
  transitions: CompiledTransition[];
  /** Total duration of this event in milliseconds */
  duration: number;
  /** Start time of this event in the global timeline */
  startTime: number;
}

export interface CompiledScene {
  /** Unique identifier for the scene */
  id: string;
  /** Human-readable name for the scene */
  name: string;
  /** Duration of the scene in milliseconds */
  duration: number;
  /** Array of compiled layer objects with instances */
  layers: CompiledLayer[];
  /** Compiled audio tracks for this scene */
  audioTracks: CompiledAudioTrack[];
  /** Start time of this scene in the global timeline */
  startTime: number;
  /** End time of this scene in the global timeline */
  endTime: number;
}

export interface CompiledLayer {
  /** Unique identifier for the layer */
  id: string;
  /** Layer type for renderer selection */
  type: string;
  /** Z-index for rendering order */
  zIndex: number;
  /** Instantiated layer object ready for rendering */
  instance: ICinematicLayer;
  /** Precompiled animation tracks for optimal performance */
  animations: CompiledAnimationTrack[];
  /** Initial configuration values */
  initialConfig: Record<string, any>;
  /** Whether this layer is currently active */
  active: boolean;
}

export interface CompiledAnimationTrack {
  /** CSS property path being animated */
  property: string;
  /** Animation start time in milliseconds */
  startMs: number;
  /** Animation end time in milliseconds */
  endMs: number;
  /** Precompiled interpolation function for maximum performance */
  interpolate: (progress: number) => any;
  /** Whether the animation loops */
  loop: boolean;
  /** Whether the animation reverses on each loop */
  yoyo: boolean;
  /** Original easing type for debugging */
  easingType: EasingType;
  /** Current loop iteration (for looped animations) */
  currentLoop: number;
  /** Whether animation is currently in reverse (for yoyo) */
  isReverse: boolean;
  /** Compiled keyframe segments (if using keyframes) */
  keyframeSegments?: CompiledKeyframeSegment[];
}

/** Compiled keyframe segment for efficient interpolation */
export interface CompiledKeyframeSegment {
  /** Start time of this segment (0-1) */
  startTime: number;
  /** End time of this segment (0-1) */
  endTime: number;
  /** Precompiled interpolation function for this segment */
  interpolate: (segmentProgress: number) => any;
}

export interface CompiledAudioTrack {
  /** Unique identifier for the audio track */
  id: string;
  /** Type of audio content */
  type: AudioTrackType;
  /** Loaded asset reference */
  asset: Asset;
  /** Start time in milliseconds */
  startMs: number;
  /** End time in milliseconds */
  endMs: number;
  /** Volume level (0-1) */
  volume: number;
  /** Fade in duration in milliseconds */
  fadeIn: number;
  /** Fade out duration in milliseconds */
  fadeOut: number;
  /** Whether to loop the audio */
  loop: boolean;
  /** Audio context node for Web Audio API */
  audioNode?: AudioNode;
  /** HTML audio element for fallback */
  audioElement?: HTMLAudioElement;
}

export interface CompiledTransition {
  /** Type of transition effect */
  type: TransitionType;
  /** Duration of the transition in milliseconds */
  duration: number;
  /** Precompiled easing function */
  easingFunction: (t: number) => number;
  /** Transition-specific configuration */
  config: Record<string, any>;
  /** Precompiled transition function for performance */
  execute: (progress: number, fromElement: HTMLElement, toElement: HTMLElement) => void;
}

// Utility types for compilation process

/** Animation interpolation function signature */
export type InterpolationFunction = (progress: number) => any;

/** Easing function signature */
export type EasingFunction = (t: number) => number;

/** Transition execution function signature */
export type TransitionFunction = (progress: number, fromElement: HTMLElement, toElement: HTMLElement) => void;

/** Compilation context for tracking state during parsing */
export interface CompilationContext {
  /** Current schema version being processed */
  schemaVersion: string;
  /** Asset loading promises for dependency tracking */
  assetPromises: Map<string, Promise<Asset>>;
  /** Layer type registry for validation */
  layerTypes: Set<string>;
  /** Compilation warnings and errors */
  diagnostics: CompilationDiagnostic[];
  /** Performance optimization flags */
  optimizations: CompilationOptimizations;
}

/** Compilation diagnostic information */
export interface CompilationDiagnostic {
  /** Severity level */
  level: 'error' | 'warning' | 'info';
  /** Human-readable message */
  message: string;
  /** Location in the source specification */
  location?: {
    path: string;
    line?: number;
    column?: number;
  };
  /** Error code for programmatic handling */
  code?: string;
}

/** Compilation optimization settings */
export interface CompilationOptimizations {
  /** Precompile animation tracks */
  precompileAnimations: boolean;
  /** Optimize asset loading order */
  optimizeAssetLoading: boolean;
  /** Enable object pooling for particles */
  enableObjectPooling: boolean;
  /** Minimize DOM manipulations */
  minimizeDOMUpdates: boolean;
  /** Use Web Workers for heavy computations */
  useWebWorkers: boolean;
}