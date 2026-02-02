/**
 * JSON Specification Types for cinematicRenderer2D
 * 
 * These types define the structure of JSON specifications that describe
 * cinematic experiences with events, scenes, layers, and animations.
 * 
 * Requirements: 3.1, 3.5 - JSON specification processing with schema versioning
 */

export interface CinematicSpec {
  /** Schema version for backward compatibility (e.g., "1.0.0") */
  schemaVersion: string;
  /** Engine configuration and global settings */
  engine: EngineConfig;
  /** Array of cinematic events that define high-level sequences */
  events: CinematicEvent[];
  /** Array of scenes containing layers and timing information */
  scenes: CinematicScene[];
  /** Optional asset definitions for preloading and caching */
  assets?: AssetDefinition[];
}

export interface EngineConfig {
  /** Target frame rate (default: 60, supports up to 120fps) */
  targetFps?: number;
  /** Quality level for performance optimization */
  quality?: QualityLevel;
  /** Enable debug mode with performance overlay */
  debug?: boolean;
  /** Auto-start playback after mounting */
  autoplay?: boolean;
}

export interface CinematicEvent {
  /** Unique identifier for the event */
  id: string;
  /** Human-readable name for the event */
  name: string;
  /** Array of scene IDs that make up this event */
  scenes: string[];
  /** Optional transitions between scenes */
  transitions?: TransitionSpec[];
}

export interface CinematicScene {
  /** Unique identifier for the scene */
  id: string;
  /** Human-readable name for the scene */
  name: string;
  /** Duration of the scene in milliseconds */
  duration: number;
  /** Array of layers that make up this scene */
  layers: LayerSpec[];
  /** Optional audio tracks for this scene */
  audio?: AudioTrackSpec[];
}

export interface LayerSpec {
  /** Unique identifier for the layer */
  id: string;
  /** Layer type - determines which renderer handles this layer */
  type: LayerType;
  /** Z-index for layer ordering (higher values render on top) */
  zIndex: number;
  /** Layer-specific configuration properties */
  config: LayerConfig;
  /** Optional animation tracks for this layer */
  animations?: AnimationTrackSpec[];
}

/** Supported layer types for different rendering backends */
export type LayerType = 
  // DOM-based layers
  | 'gradient' 
  | 'image' 
  | 'textBlock' 
  | 'vignette' 
  | 'glowOrb' 
  | 'noiseOverlay'
  // Canvas2D-based layers
  | 'particles' 
  | 'starfield' 
  | 'dust' 
  | 'nebulaNoise'
  // Future WebGL layers
  | 'webgl-custom';

/** Base configuration for all layer types */
export interface LayerConfig {
  /** Layer opacity (0-1) */
  opacity?: number;
  /** Layer visibility */
  visible?: boolean;
  /** Position and transform properties */
  transform?: TransformConfig;
  /** Layer-specific properties (varies by type) */
  [key: string]: any;
}

/** Transform configuration for layer positioning and animation */
export interface TransformConfig {
  /** X position (pixels or percentage) */
  x?: number | string;
  /** Y position (pixels or percentage) */
  y?: number | string;
  /** Scale factor */
  scale?: number;
  /** Rotation in degrees */
  rotation?: number;
  /** Transform origin point */
  origin?: string;
}

export interface AnimationTrackSpec {
  /** CSS property path to animate (e.g., 'opacity', 'transform.scale', 'filter.blur') */
  property: string;
  /** Starting value for the animation */
  from: AnimationValue;
  /** Ending value for the animation */
  to: AnimationValue;
  /** Animation start time in milliseconds */
  startMs: number;
  /** Animation end time in milliseconds */
  endMs: number;
  /** Easing function name or cubic-bezier values */
  easing?: EasingType;
  /** Whether to loop the animation */
  loop?: boolean;
  /** Whether to reverse the animation on each loop */
  yoyo?: boolean;
}

/** Supported animation value types */
export type AnimationValue = number | string | boolean | AnimationValueObject;

/** Complex animation values for multi-property animations */
export interface AnimationValueObject {
  [key: string]: number | string | boolean;
}

/** Supported easing function types */
export type EasingType = 
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'ease-in-sine'
  | 'ease-out-sine'
  | 'ease-in-out-sine'
  | 'ease-in-quad'
  | 'ease-out-quad'
  | 'ease-in-out-quad'
  | 'ease-in-cubic'
  | 'ease-out-cubic'
  | 'ease-in-out-cubic'
  | 'ease-in-quart'
  | 'ease-out-quart'
  | 'ease-in-out-quart'
  | 'ease-in-quint'
  | 'ease-out-quint'
  | 'ease-in-out-quint'
  | 'ease-in-expo'
  | 'ease-out-expo'
  | 'ease-in-out-expo'
  | 'ease-in-circ'
  | 'ease-out-circ'
  | 'ease-in-out-circ'
  | 'ease-in-back'
  | 'ease-out-back'
  | 'ease-in-out-back'
  | 'ease-in-elastic'
  | 'ease-out-elastic'
  | 'ease-in-out-elastic'
  | 'ease-in-bounce'
  | 'ease-out-bounce'
  | 'ease-in-out-bounce'
  | `cubic-bezier(${number},${number},${number},${number})`;

export interface AudioTrackSpec {
  /** Unique identifier for the audio track */
  id: string;
  /** Type of audio content */
  type: AudioTrackType;
  /** Source URL or asset ID for the audio file */
  src: string;
  /** Start time in milliseconds */
  startMs: number;
  /** End time in milliseconds (optional, defaults to audio duration) */
  endMs?: number;
  /** Volume level (0-1, default: 1) */
  volume?: number;
  /** Fade in duration in milliseconds */
  fadeIn?: number;
  /** Fade out duration in milliseconds */
  fadeOut?: number;
  /** Whether to loop the audio */
  loop?: boolean;
}

/** Supported audio track types */
export type AudioTrackType = 'voiceover' | 'ambience' | 'transition' | 'music' | 'sfx';

export interface TransitionSpec {
  /** Type of transition effect */
  type: TransitionType;
  /** Duration of the transition in milliseconds */
  duration: number;
  /** Easing function for the transition */
  easing?: EasingType;
  /** Additional transition-specific properties */
  config?: TransitionConfig;
}

/** Supported transition types */
export type TransitionType = 'fade' | 'slide' | 'zoom' | 'wipe' | 'dissolve' | 'blur';

/** Configuration for transition effects */
export interface TransitionConfig {
  /** Direction for slide/wipe transitions */
  direction?: 'up' | 'down' | 'left' | 'right' | 'in' | 'out';
  /** Blur amount for blur transitions */
  blurAmount?: number;
  /** Custom properties for advanced transitions */
  [key: string]: any;
}

export interface AssetDefinition {
  /** Unique identifier for the asset */
  id: string;
  /** Type of asset */
  type: AssetType;
  /** Source URL for the asset */
  src: string;
  /** Whether to preload this asset */
  preload?: boolean;
  /** Fallback asset ID or URL if loading fails */
  fallback?: string;
  /** Additional metadata for the asset */
  metadata?: AssetMetadata;
}

/** Supported asset types */
export type AssetType = 'image' | 'video' | 'audio' | 'font' | 'json' | 'binary';

/** Asset metadata for optimization and caching */
export interface AssetMetadata {
  /** Expected file size in bytes */
  size?: number;
  /** MIME type */
  mimeType?: string;
  /** Cache duration in milliseconds */
  cacheDuration?: number;
  /** Asset dimensions for images/videos */
  dimensions?: {
    width: number;
    height: number;
  };
  /** Audio duration in milliseconds */
  duration?: number;
}

export type QualityLevel = 'low' | 'medium' | 'high' | 'ultra' | 'auto';