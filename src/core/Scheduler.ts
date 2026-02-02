/**
 * Frame scheduling system using requestAnimationFrame with FPS monitoring
 * and performance tracking for adaptive quality management.
 * 
 * Requirements: 2.5, 8.1, 8.2, 8.3
 */

import type { PerformanceMetrics, QualityLevel } from '../types/QualityTypes';

export interface FrameContext {
  /** Time elapsed since last frame in milliseconds */
  deltaMs: number;
  /** Current timestamp from performance.now() */
  currentTime: number;
  /** Current frames per second */
  fps: number;
  /** Frame number since start */
  frameNumber: number;
  /** Current performance metrics */
  metrics: PerformanceMetrics;
}

export interface SchedulerOptions {
  /** Target FPS (default: 60) */
  targetFps?: number;
  /** FPS monitoring window size in frames (default: 60) */
  fpsWindowSize?: number;
  /** Performance monitoring interval in milliseconds (default: 1000) */
  monitoringInterval?: number;
  /** Whether to enable adaptive quality (default: true) */
  enableAdaptiveQuality?: boolean;
}

export class Scheduler {
  private isRunning = false;
  private animationFrameId: number | null = null;
  private lastFrameTime = 0;
  private frameCallbacks: ((context: FrameContext) => void)[] = [];
  
  // Performance monitoring
  private frameNumber = 0;
  private frameTimes: number[] = [];
  private currentFps = 0;
  private lastMonitoringTime = 0;
  private performanceMetrics: PerformanceMetrics;
  
  // Configuration
  private options: Required<SchedulerOptions>;
  
  // Quality system integration
  private qualityChangeCallbacks: ((metrics: PerformanceMetrics) => void)[] = [];
  
  constructor(options: SchedulerOptions = {}) {
    this.options = {
      targetFps: options.targetFps || 60,
      fpsWindowSize: options.fpsWindowSize || 60,
      monitoringInterval: options.monitoringInterval || 1000,
      enableAdaptiveQuality: options.enableAdaptiveQuality !== false,
    };
    
    this.performanceMetrics = {
      fps: 0,
      frameTime: 0,
      activeParticles: 0,
      activeLayers: 0,
      domNodes: 0,
      drawCalls: 0,
    };
  }
  
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.frameNumber = 0;
    this.frameTimes = [];
    this.lastFrameTime = performance.now();
    this.lastMonitoringTime = this.lastFrameTime;
    this.scheduleFrame();
  }
  
  stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    // Reset performance tracking
    this.frameNumber = 0;
    this.frameTimes = [];
    this.currentFps = 0;
  }
  
  addFrameCallback(callback: (context: FrameContext) => void): void {
    this.frameCallbacks.push(callback);
  }
  
  removeFrameCallback(callback: (context: FrameContext) => void): void {
    const index = this.frameCallbacks.indexOf(callback);
    if (index > -1) {
      this.frameCallbacks.splice(index, 1);
    }
  }
  
  addQualityChangeCallback(callback: (metrics: PerformanceMetrics) => void): void {
    this.qualityChangeCallbacks.push(callback);
  }
  
  removeQualityChangeCallback(callback: (metrics: PerformanceMetrics) => void): void {
    const index = this.qualityChangeCallbacks.indexOf(callback);
    if (index > -1) {
      this.qualityChangeCallbacks.splice(index, 1);
    }
  }
  
  getCurrentFps(): number {
    return this.currentFps;
  }
  
  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }
  
  updateMetrics(updates: Partial<PerformanceMetrics>): void {
    this.performanceMetrics = { ...this.performanceMetrics, ...updates };
  }
  
  private scheduleFrame(): void {
    if (!this.isRunning) return;
    
    this.animationFrameId = requestAnimationFrame((currentTime) => {
      const deltaMs = currentTime - this.lastFrameTime;
      this.lastFrameTime = currentTime;
      this.frameNumber++;
      
      // Update FPS tracking
      this.updateFpsTracking(deltaMs);
      
      // Update performance metrics
      this.performanceMetrics.fps = this.currentFps;
      this.performanceMetrics.frameTime = deltaMs;
      
      // Create frame context
      const frameContext: FrameContext = {
        deltaMs,
        currentTime,
        fps: this.currentFps,
        frameNumber: this.frameNumber,
        metrics: { ...this.performanceMetrics },
      };
      
      // Execute all frame callbacks
      this.frameCallbacks.forEach(callback => {
        try {
          callback(frameContext);
        } catch (error) {
          console.error('Error in frame callback:', error);
        }
      });
      
      // Check for performance monitoring
      if (this.options.enableAdaptiveQuality && 
          currentTime - this.lastMonitoringTime >= this.options.monitoringInterval) {
        this.performPerformanceCheck();
        this.lastMonitoringTime = currentTime;
      }
      
      // Schedule next frame
      this.scheduleFrame();
    });
  }
  
  private updateFpsTracking(deltaMs: number): void {
    // Add current frame time to tracking window
    this.frameTimes.push(deltaMs);
    
    // Keep only the last N frame times for rolling average
    if (this.frameTimes.length > this.options.fpsWindowSize) {
      this.frameTimes.shift();
    }
    
    // Calculate FPS from average frame time
    if (this.frameTimes.length > 0) {
      const averageFrameTime = this.frameTimes.reduce((sum, time) => sum + time, 0) / this.frameTimes.length;
      this.currentFps = averageFrameTime > 0 ? 1000 / averageFrameTime : 0;
    }
  }
  
  private performPerformanceCheck(): void {
    const targetFps = this.options.targetFps;
    const currentFps = this.currentFps;
    
    // Check if we're significantly below target FPS
    const fpsRatio = currentFps / targetFps;
    const isPerformancePoor = fpsRatio < 0.8; // 20% below target
    const isPerformanceGood = fpsRatio > 0.95; // Within 5% of target
    
    // Notify quality system callbacks
    this.qualityChangeCallbacks.forEach(callback => {
      try {
        callback(this.performanceMetrics);
      } catch (error) {
        console.error('Error in quality change callback:', error);
      }
    });
    
    // Log performance warnings in development
    if (typeof process !== 'undefined' && process.env && process.env['NODE_ENV'] === 'development') {
      if (isPerformancePoor) {
        console.warn(`Performance warning: FPS ${currentFps.toFixed(1)} is below target ${targetFps}`);
      }
    }
  }
  
  // Utility methods for performance monitoring
  
  /** Get average frame time over the monitoring window */
  getAverageFrameTime(): number {
    if (this.frameTimes.length === 0) return 0;
    return this.frameTimes.reduce((sum, time) => sum + time, 0) / this.frameTimes.length;
  }
  
  /** Get frame time variance (measure of frame time consistency) */
  getFrameTimeVariance(): number {
    if (this.frameTimes.length < 2) return 0;
    
    const average = this.getAverageFrameTime();
    const variance = this.frameTimes.reduce((sum, time) => {
      const diff = time - average;
      return sum + (diff * diff);
    }, 0) / this.frameTimes.length;
    
    return variance;
  }
  
  /** Check if performance is stable (low variance) */
  isPerformanceStable(): boolean {
    const variance = this.getFrameTimeVariance();
    const averageFrameTime = this.getAverageFrameTime();
    
    // Consider performance stable if variance is less than 10% of average frame time
    return variance < (averageFrameTime * 0.1);
  }
  
  /** Get performance grade (A, B, C, D, F) */
  getPerformanceGrade(): string {
    const fpsRatio = this.currentFps / this.options.targetFps;
    const isStable = this.isPerformanceStable();
    
    if (fpsRatio >= 0.95 && isStable) return 'A';
    if (fpsRatio >= 0.85 && isStable) return 'B';
    if (fpsRatio >= 0.70) return 'C';
    if (fpsRatio >= 0.50) return 'D';
    return 'F';
  }
}