/**
 * Quality and Performance Types for cinematicRenderer2D
 * 
 * These types define the adaptive quality system that monitors performance
 * and automatically adjusts rendering quality to maintain target frame rates.
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5 - Adaptive quality system
 */

export type QualityLevel = 'low' | 'medium' | 'high' | 'ultra' | 'auto';

export interface QualitySettings {
  /** Maximum number of particles to render */
  particleCount: number;
  /** Canvas resolution multiplier (0.5 = half resolution) */
  canvasResolution: number;
  /** Animation interpolation precision (higher = smoother) */
  animationPrecision: number;
  /** Whether to enable blur effects */
  enableBlur: boolean;
  /** Whether to enable shadow effects */
  enableShadows: boolean;
  /** Target frame rate for this quality level */
  targetFps: number;
  /** Whether to enable advanced visual effects */
  enableAdvancedEffects: boolean;
  /** Texture quality multiplier */
  textureQuality: number;
  /** Whether to use hardware acceleration */
  useHardwareAcceleration: boolean;
}

export interface PerformanceMetrics {
  /** Current frames per second */
  fps: number;
  /** Frame time in milliseconds */
  frameTime: number;
  /** Memory usage in MB */
  memoryUsage?: number;
  /** GPU memory usage in MB */
  gpuMemory?: number;
  /** Number of active particles */
  activeParticles: number;
  /** Number of active layers */
  activeLayers: number;
  /** Number of DOM nodes created */
  domNodes: number;
  /** Canvas draw calls per frame */
  drawCalls: number;
  /** Asset loading time in milliseconds */
  assetLoadTime?: number;
  /** Compilation time in milliseconds */
  compilationTime?: number;
}

export interface DeviceCapabilities {
  /** Device memory in GB */
  memory?: number;
  /** Number of CPU cores */
  cores?: number;
  /** GPU information */
  gpu?: string;
  /** User prefers reduced motion */
  prefersReducedMotion: boolean;
  /** Device power mode */
  powerMode?: 'high-performance' | 'balanced' | 'power-saver';
  /** Screen refresh rate */
  refreshRate?: number;
  /** Device pixel ratio */
  devicePixelRatio: number;
  /** Whether device supports hardware acceleration */
  supportsHardwareAcceleration: boolean;
  /** Maximum texture size supported */
  maxTextureSize?: number;
  /** Whether device is mobile */
  isMobile: boolean;
  /** Network connection type */
  connectionType?: 'slow-2g' | '2g' | '3g' | '4g' | '5g' | 'wifi' | 'ethernet';
}

/** Quality system configuration */
export interface QualitySystemConfig {
  /** How often to check performance (milliseconds) */
  monitoringInterval: number;
  /** FPS threshold for quality reduction */
  fpsThreshold: number;
  /** Number of consecutive bad frames before reducing quality */
  badFrameThreshold: number;
  /** Number of consecutive good frames before increasing quality */
  goodFrameThreshold: number;
  /** Whether to respect user preferences */
  respectUserPreferences: boolean;
  /** Whether to use device capability detection */
  useDeviceDetection: boolean;
  /** Custom quality level mappings */
  customLevels?: Record<string, QualitySettings>;
}

/** Performance monitoring event data */
export interface PerformanceEvent {
  /** Event type */
  type: 'fps-drop' | 'memory-warning' | 'quality-change' | 'performance-good';
  /** Current performance metrics */
  metrics: PerformanceMetrics;
  /** Previous quality level (for quality-change events) */
  previousQuality?: QualityLevel;
  /** New quality level (for quality-change events) */
  newQuality?: QualityLevel;
  /** Timestamp of the event */
  timestamp: number;
  /** Additional context data */
  context?: Record<string, any>;
}

/** Quality preset configurations */
export const QUALITY_PRESETS: Record<QualityLevel, QualitySettings> = {
  low: {
    particleCount: 50,
    canvasResolution: 0.5,
    animationPrecision: 30,
    enableBlur: false,
    enableShadows: false,
    targetFps: 30,
    enableAdvancedEffects: false,
    textureQuality: 0.5,
    useHardwareAcceleration: false,
  },
  medium: {
    particleCount: 200,
    canvasResolution: 0.75,
    animationPrecision: 60,
    enableBlur: true,
    enableShadows: false,
    targetFps: 60,
    enableAdvancedEffects: false,
    textureQuality: 0.75,
    useHardwareAcceleration: true,
  },
  high: {
    particleCount: 500,
    canvasResolution: 1.0,
    animationPrecision: 60,
    enableBlur: true,
    enableShadows: true,
    targetFps: 60,
    enableAdvancedEffects: true,
    textureQuality: 1.0,
    useHardwareAcceleration: true,
  },
  ultra: {
    particleCount: 1000,
    canvasResolution: 1.5,
    animationPrecision: 120,
    enableBlur: true,
    enableShadows: true,
    targetFps: 120,
    enableAdvancedEffects: true,
    textureQuality: 1.5,
    useHardwareAcceleration: true,
  },
  auto: {
    // Auto mode uses dynamic settings based on device capabilities
    particleCount: 200,
    canvasResolution: 1.0,
    animationPrecision: 60,
    enableBlur: true,
    enableShadows: true,
    targetFps: 60,
    enableAdvancedEffects: true,
    textureQuality: 1.0,
    useHardwareAcceleration: true,
  },
};