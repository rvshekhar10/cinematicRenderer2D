/**
 * Adaptive quality system for performance optimization
 * 
 * This system monitors performance metrics and automatically adjusts
 * rendering quality to maintain target frame rates while respecting
 * user preferences and device capabilities.
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */

import type { 
  QualityLevel, 
  QualitySettings, 
  PerformanceMetrics, 
  DeviceCapabilities,
  QualitySystemConfig,
  PerformanceEvent,
  QUALITY_PRESETS 
} from '../types/QualityTypes';

export class QualitySystem {
  private currentQuality: QualityLevel = 'auto';
  private currentSettings: QualitySettings;
  private deviceCapabilities: DeviceCapabilities;
  private config: Required<QualitySystemConfig>;
  
  // Performance tracking
  private performanceHistory: PerformanceMetrics[] = [];
  private badFrameCount = 0;
  private goodFrameCount = 0;
  private lastQualityChange = 0;
  
  // Event callbacks
  private eventCallbacks: ((event: PerformanceEvent) => void)[] = [];
  
  constructor(config: Partial<QualitySystemConfig> = {}) {
    this.config = {
      monitoringInterval: config.monitoringInterval || 1000,
      fpsThreshold: config.fpsThreshold || 50,
      badFrameThreshold: config.badFrameThreshold || 5,
      goodFrameThreshold: config.goodFrameThreshold || 30,
      respectUserPreferences: config.respectUserPreferences !== false,
      useDeviceDetection: config.useDeviceDetection !== false,
      customLevels: config.customLevels || {},
    };
    
    // Detect device capabilities
    this.deviceCapabilities = this.detectDeviceCapabilities();
    
    // Start with auto quality
    this.currentQuality = 'auto';
    this.currentSettings = this.getQualitySettings('auto');
    
    // Apply initial quality based on device capabilities if device detection is enabled
    if (this.config.useDeviceDetection) {
      const initialQuality = this.determineInitialQuality();
      // Only change from auto if we determined a specific quality
      if (initialQuality !== 'auto') {
        this.currentQuality = initialQuality;
        this.currentSettings = this.getQualitySettings(initialQuality);
      }
    }
  }
  
  setQuality(level: QualityLevel): void {
    if (this.currentQuality === level) return;
    
    const previousQuality = this.currentQuality;
    this.currentQuality = level;
    this.currentSettings = this.getQualitySettings(level);
    this.lastQualityChange = performance.now();
    
    // Reset frame counters
    this.badFrameCount = 0;
    this.goodFrameCount = 0;
    
    // Emit quality change event
    this.emitEvent({
      type: 'quality-change',
      metrics: this.getLatestMetrics(),
      previousQuality,
      newQuality: level,
      timestamp: performance.now(),
    });
  }
  
  getCurrentQuality(): QualityLevel {
    return this.currentQuality;
  }
  
  getCurrentSettings(): QualitySettings {
    return { ...this.currentSettings };
  }
  
  getDeviceCapabilities(): DeviceCapabilities {
    return { ...this.deviceCapabilities };
  }
  
  updatePerformanceMetrics(metrics: PerformanceMetrics): void {
    // Add to performance history
    this.performanceHistory.push({ ...metrics, timestamp: performance.now() } as any);
    
    // Keep only recent history (last 60 seconds)
    const cutoffTime = performance.now() - 60000;
    this.performanceHistory = this.performanceHistory.filter(
      m => (m as any).timestamp > cutoffTime
    );
    
    // Only adjust quality in auto mode
    if (this.currentQuality === 'auto') {
      this.evaluatePerformanceAndAdjust(metrics);
    }
    
    // Check for performance warnings
    this.checkPerformanceWarnings(metrics);
  }
  
  addEventListener(callback: (event: PerformanceEvent) => void): void {
    this.eventCallbacks.push(callback);
  }
  
  removeEventListener(callback: (event: PerformanceEvent) => void): void {
    const index = this.eventCallbacks.indexOf(callback);
    if (index > -1) {
      this.eventCallbacks.splice(index, 1);
    }
  }
  
  // Get quality settings for a specific level
  private getQualitySettings(level: QualityLevel): QualitySettings {
    // Check for custom levels first
    if (this.config.customLevels[level]) {
      return { ...this.config.customLevels[level] };
    }
    
    // Use preset levels
    const presets = this.getQualityPresets();
    
    if (level === 'auto') {
      // Auto mode: determine best quality based on device capabilities
      const autoLevel = this.determineAutoQuality();
      return { ...presets[autoLevel] };
    }
    
    return { ...presets[level] };
  }
  
  private getQualityPresets() {
    // Import QUALITY_PRESETS or define inline to avoid circular dependency
    return {
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
    } as Record<QualityLevel, QualitySettings>;
  }
  
  private detectDeviceCapabilities(): DeviceCapabilities {
    const nav = navigator as any;
    
    // Safe access to browser APIs with fallbacks for test environments
    const getMatchMedia = () => {
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      }
      return false;
    };
    
    const getDevicePixelRatio = () => {
      if (typeof window !== 'undefined' && window.devicePixelRatio) {
        return window.devicePixelRatio;
      }
      return 1;
    };
    
    const getRefreshRate = () => {
      if (typeof screen !== 'undefined' && (screen as any).refreshRate) {
        return (screen as any).refreshRate;
      }
      return undefined;
    };
    
    return {
      memory: nav.deviceMemory,
      cores: nav.hardwareConcurrency,
      prefersReducedMotion: getMatchMedia(),
      devicePixelRatio: getDevicePixelRatio(),
      supportsHardwareAcceleration: this.detectHardwareAcceleration(),
      isMobile: this.detectMobile(),
      connectionType: this.detectConnectionType(),
      refreshRate: getRefreshRate(),
    };
  }
  
  private detectHardwareAcceleration(): boolean {
    try {
      if (typeof document === 'undefined') return false;
      
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!gl;
    } catch {
      return false;
    }
  }
  
  private detectMobile(): boolean {
    if (typeof navigator === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  
  private detectConnectionType(): DeviceCapabilities['connectionType'] {
    if (typeof navigator === 'undefined') return undefined;
    
    const nav = navigator as any;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
    
    if (connection) {
      return connection.effectiveType || connection.type;
    }
    
    return undefined;
  }
  
  private determineInitialQuality(): QualityLevel {
    const caps = this.deviceCapabilities;
    
    // Respect user preferences
    if (this.config.respectUserPreferences && caps.prefersReducedMotion) {
      return 'low';
    }
    
    // Mobile devices default to medium
    if (caps.isMobile) {
      return 'medium';
    }
    
    // Low memory devices
    if (caps.memory && caps.memory < 4) {
      return 'low';
    }
    
    // High-end devices
    if (caps.memory && caps.memory >= 8 && caps.cores && caps.cores >= 8) {
      return 'high';
    }
    
    // Default to medium
    return 'medium';
  }
  
  private determineAutoQuality(): QualityLevel {
    const recentMetrics = this.getRecentMetrics();
    
    if (recentMetrics.length === 0) {
      return this.determineInitialQuality();
    }
    
    const avgFps = recentMetrics.reduce((sum, m) => sum + m.fps, 0) / recentMetrics.length;
    const targetFps = this.currentSettings.targetFps;
    
    // Determine quality based on performance
    if (avgFps >= targetFps * 0.95) {
      // Performance is good, can potentially increase quality
      if (this.currentQuality === 'low') return 'medium';
      if (this.currentQuality === 'medium') return 'high';
      if (this.currentQuality === 'high' && !this.deviceCapabilities.isMobile) return 'ultra';
    } else if (avgFps < targetFps * 0.8) {
      // Performance is poor, should decrease quality
      if (this.currentQuality === 'ultra') return 'high';
      if (this.currentQuality === 'high') return 'medium';
      if (this.currentQuality === 'medium') return 'low';
    }
    
    return this.currentQuality;
  }
  
  private evaluatePerformanceAndAdjust(metrics: PerformanceMetrics): void {
    const targetFps = this.currentSettings.targetFps;
    const currentFps = metrics.fps;
    
    // Avoid frequent quality changes
    const timeSinceLastChange = performance.now() - this.lastQualityChange;
    if (timeSinceLastChange < this.config.monitoringInterval * 2) {
      return;
    }
    
    // Track performance
    if (currentFps < targetFps * 0.8) {
      this.badFrameCount++;
      this.goodFrameCount = 0;
    } else if (currentFps >= targetFps * 0.95) {
      this.goodFrameCount++;
      this.badFrameCount = 0;
    }
    
    // Adjust quality based on frame counts
    if (this.badFrameCount >= this.config.badFrameThreshold) {
      this.reduceQuality();
    } else if (this.goodFrameCount >= this.config.goodFrameThreshold) {
      this.increaseQuality();
    }
  }
  
  private reduceQuality(): void {
    const qualityLevels: QualityLevel[] = ['ultra', 'high', 'medium', 'low'];
    const currentIndex = qualityLevels.indexOf(this.currentQuality);
    
    if (currentIndex < qualityLevels.length - 1) {
      const newQuality = qualityLevels[currentIndex + 1];
      if (newQuality) {
        this.setQuality(newQuality);
      }
    }
  }
  
  private increaseQuality(): void {
    const qualityLevels: QualityLevel[] = ['low', 'medium', 'high', 'ultra'];
    const currentIndex = qualityLevels.indexOf(this.currentQuality);
    
    // Don't increase to ultra on mobile devices
    const maxLevel = this.deviceCapabilities.isMobile ? 'high' : 'ultra';
    const maxIndex = qualityLevels.indexOf(maxLevel);
    
    if (currentIndex < maxIndex) {
      const newQuality = qualityLevels[currentIndex + 1];
      if (newQuality) {
        this.setQuality(newQuality);
      }
    }
  }
  
  private checkPerformanceWarnings(metrics: PerformanceMetrics): void {
    // Check for FPS drops
    if (metrics.fps < this.config.fpsThreshold) {
      this.emitEvent({
        type: 'fps-drop',
        metrics,
        timestamp: performance.now(),
      });
    }
    
    // Check for memory warnings
    if (metrics.memoryUsage && metrics.memoryUsage > 100) { // 100MB threshold
      this.emitEvent({
        type: 'memory-warning',
        metrics,
        timestamp: performance.now(),
      });
    }
    
    // Check for good performance
    if (metrics.fps >= this.currentSettings.targetFps * 0.95) {
      this.emitEvent({
        type: 'performance-good',
        metrics,
        timestamp: performance.now(),
      });
    }
  }
  
  private getRecentMetrics(): PerformanceMetrics[] {
    const cutoffTime = performance.now() - this.config.monitoringInterval;
    return this.performanceHistory.filter(m => (m as any).timestamp > cutoffTime);
  }
  
  private getLatestMetrics(): PerformanceMetrics {
    if (this.performanceHistory.length > 0) {
      const latest = this.performanceHistory[this.performanceHistory.length - 1];
      if (latest) {
        return latest;
      }
    }
    
    return {
      fps: 0,
      frameTime: 0,
      activeParticles: 0,
      activeLayers: 0,
      domNodes: 0,
      drawCalls: 0,
    };
  }
  
  private emitEvent(event: PerformanceEvent): void {
    this.eventCallbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in performance event callback:', error);
      }
    });
  }
}