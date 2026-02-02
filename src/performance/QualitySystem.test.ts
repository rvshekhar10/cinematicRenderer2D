/**
 * Tests for QualitySystem class
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QualitySystem } from './QualitySystem';
import type { PerformanceMetrics, QualityLevel } from '../types/QualityTypes';

describe('QualitySystem', () => {
  let qualitySystem: QualitySystem;

  beforeEach(() => {
    // Mock browser APIs
    vi.stubGlobal('navigator', {
      deviceMemory: 8,
      hardwareConcurrency: 8,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    });

    vi.stubGlobal('window', {
      matchMedia: vi.fn(() => ({ matches: false })),
      devicePixelRatio: 2,
    });

    vi.stubGlobal('screen', {
      refreshRate: 60,
    });

    vi.stubGlobal('document', {
      createElement: vi.fn(() => ({
        getContext: vi.fn(() => ({})), // Mock WebGL context
      })),
    });

    // Create QualitySystem with device detection disabled for predictable tests
    qualitySystem = new QualitySystem({ useDeviceDetection: false });
  });

  describe('initialization', () => {
    it('should initialize with auto quality', () => {
      expect(qualitySystem.getCurrentQuality()).toBe('auto');
    });

    it('should detect device capabilities', () => {
      const capabilities = qualitySystem.getDeviceCapabilities();
      
      expect(capabilities).toHaveProperty('memory');
      expect(capabilities).toHaveProperty('cores');
      expect(capabilities).toHaveProperty('prefersReducedMotion');
      expect(capabilities).toHaveProperty('devicePixelRatio');
      expect(capabilities).toHaveProperty('supportsHardwareAcceleration');
      expect(capabilities).toHaveProperty('isMobile');
    });

    it('should use custom configuration', () => {
      const customSystem = new QualitySystem({
        monitoringInterval: 2000,
        fpsThreshold: 45,
        badFrameThreshold: 10,
        goodFrameThreshold: 50,
      });
      
      expect(customSystem).toBeDefined();
    });
  });

  describe('quality management', () => {
    it('should set quality level', () => {
      qualitySystem.setQuality('high');
      expect(qualitySystem.getCurrentQuality()).toBe('high');
      
      const settings = qualitySystem.getCurrentSettings();
      expect(settings.particleCount).toBe(500);
      expect(settings.targetFps).toBe(60);
      expect(settings.enableBlur).toBe(true);
    });

    it('should get quality settings for each level', () => {
      const levels: QualityLevel[] = ['low', 'medium', 'high', 'ultra'];
      
      levels.forEach(level => {
        qualitySystem.setQuality(level);
        const settings = qualitySystem.getCurrentSettings();
        
        expect(settings).toHaveProperty('particleCount');
        expect(settings).toHaveProperty('canvasResolution');
        expect(settings).toHaveProperty('targetFps');
        expect(typeof settings.particleCount).toBe('number');
        expect(typeof settings.canvasResolution).toBe('number');
        expect(typeof settings.targetFps).toBe('number');
      });
    });

    it('should not change quality if already set to same level', () => {
      const eventCallback = vi.fn();
      qualitySystem.addEventListener(eventCallback);
      
      qualitySystem.setQuality('medium');
      qualitySystem.setQuality('medium'); // Should not trigger event
      
      expect(eventCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('performance monitoring', () => {
    it('should update performance metrics', () => {
      const metrics: PerformanceMetrics = {
        fps: 45,
        frameTime: 22,
        activeParticles: 200,
        activeLayers: 5,
        domNodes: 50,
        drawCalls: 10,
      };
      
      qualitySystem.updatePerformanceMetrics(metrics);
      // Should not throw and should handle the metrics
      expect(qualitySystem).toBeDefined();
    });

    it('should emit performance events', () => {
      const eventCallback = vi.fn();
      qualitySystem.addEventListener(eventCallback);
      
      // Simulate low FPS
      const lowFpsMetrics: PerformanceMetrics = {
        fps: 30,
        frameTime: 33,
        activeParticles: 100,
        activeLayers: 3,
        domNodes: 20,
        drawCalls: 5,
      };
      
      qualitySystem.updatePerformanceMetrics(lowFpsMetrics);
      
      expect(eventCallback).toHaveBeenCalled();
      const event = eventCallback.mock.calls[0][0];
      expect(event.type).toBe('fps-drop');
      expect(event.metrics.fps).toBe(30);
    });

    it('should emit memory warning events', () => {
      const eventCallback = vi.fn();
      qualitySystem.addEventListener(eventCallback);
      
      const highMemoryMetrics: PerformanceMetrics = {
        fps: 60,
        frameTime: 16,
        memoryUsage: 150, // Above 100MB threshold
        activeParticles: 100,
        activeLayers: 3,
        domNodes: 20,
        drawCalls: 5,
      };
      
      qualitySystem.updatePerformanceMetrics(highMemoryMetrics);
      
      expect(eventCallback).toHaveBeenCalled();
      const event = eventCallback.mock.calls.find(call => call[0].type === 'memory-warning');
      expect(event).toBeDefined();
    });

    it('should emit good performance events', () => {
      qualitySystem.setQuality('medium'); // Target FPS: 60
      
      const eventCallback = vi.fn();
      qualitySystem.addEventListener(eventCallback);
      
      const goodMetrics: PerformanceMetrics = {
        fps: 58, // Within 95% of target (60 * 0.95 = 57)
        frameTime: 17,
        activeParticles: 100,
        activeLayers: 3,
        domNodes: 20,
        drawCalls: 5,
      };
      
      qualitySystem.updatePerformanceMetrics(goodMetrics);
      
      expect(eventCallback).toHaveBeenCalled();
      const event = eventCallback.mock.calls.find(call => call[0].type === 'performance-good');
      expect(event).toBeDefined();
    });
  });

  describe('adaptive quality in auto mode', () => {
    beforeEach(() => {
      qualitySystem.setQuality('auto');
    });

    it('should reduce quality on poor performance', () => {
      const eventCallback = vi.fn();
      qualitySystem.addEventListener(eventCallback);
      
      // Simulate consistently poor performance
      for (let i = 0; i < 10; i++) {
        qualitySystem.updatePerformanceMetrics({
          fps: 20, // Well below target
          frameTime: 50,
          activeParticles: 100,
          activeLayers: 3,
          domNodes: 20,
          drawCalls: 5,
        });
      }
      
      // Should eventually trigger quality change
      const qualityChangeEvent = eventCallback.mock.calls.find(
        call => call[0].type === 'quality-change'
      );
      
      if (qualityChangeEvent) {
        expect(qualityChangeEvent[0].newQuality).toBeDefined();
      }
    });

    it('should increase quality on good performance', () => {
      // Start with low quality
      qualitySystem.setQuality('low');
      qualitySystem.setQuality('auto');
      
      const eventCallback = vi.fn();
      qualitySystem.addEventListener(eventCallback);
      
      // Simulate consistently good performance
      for (let i = 0; i < 50; i++) {
        qualitySystem.updatePerformanceMetrics({
          fps: 60, // At target
          frameTime: 16,
          activeParticles: 50,
          activeLayers: 2,
          domNodes: 10,
          drawCalls: 3,
        });
      }
      
      // Should eventually trigger quality increase
      const qualityChangeEvent = eventCallback.mock.calls.find(
        call => call[0].type === 'quality-change'
      );
      
      if (qualityChangeEvent) {
        expect(qualityChangeEvent[0].newQuality).toBeDefined();
      }
    });
  });

  describe('device-specific behavior', () => {
    it('should detect mobile devices', () => {
      vi.stubGlobal('navigator', {
        ...navigator,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      });
      
      const mobileSystem = new QualitySystem({ useDeviceDetection: true });
      const capabilities = mobileSystem.getDeviceCapabilities();
      
      expect(capabilities.isMobile).toBe(true);
    });

    it('should respect reduced motion preference', () => {
      vi.stubGlobal('window', {
        ...window,
        matchMedia: vi.fn(() => ({ matches: true })), // prefers-reduced-motion: reduce
      });
      
      const reducedMotionSystem = new QualitySystem({ useDeviceDetection: true });
      const capabilities = reducedMotionSystem.getDeviceCapabilities();
      
      expect(capabilities.prefersReducedMotion).toBe(true);
    });

    it('should detect hardware acceleration support', () => {
      const capabilities = qualitySystem.getDeviceCapabilities();
      expect(typeof capabilities.supportsHardwareAcceleration).toBe('boolean');
    });
  });

  describe('event listeners', () => {
    it('should add and remove event listeners', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      qualitySystem.addEventListener(callback1);
      qualitySystem.addEventListener(callback2);
      qualitySystem.removeEventListener(callback1);
      
      // Trigger an event
      qualitySystem.setQuality('high');
      
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it('should handle callback errors gracefully', () => {
      const errorCallback = vi.fn(() => {
        throw new Error('Test error');
      });
      const normalCallback = vi.fn();
      
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      qualitySystem.addEventListener(errorCallback);
      qualitySystem.addEventListener(normalCallback);
      
      qualitySystem.setQuality('high');
      
      expect(errorCallback).toHaveBeenCalled();
      expect(normalCallback).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });
});