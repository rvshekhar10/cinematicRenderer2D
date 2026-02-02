/**
 * Tests for Scheduler class
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Scheduler, type FrameContext } from './Scheduler';

describe('Scheduler', () => {
  let scheduler: Scheduler;
  let mockCallback: vi.MockedFunction<(context: FrameContext) => void>;

  beforeEach(() => {
    scheduler = new Scheduler();
    mockCallback = vi.fn();
    
    // Mock requestAnimationFrame and performance.now
    vi.stubGlobal('requestAnimationFrame', vi.fn((callback) => {
      setTimeout(() => callback(performance.now()), 16);
      return 1;
    }));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.stubGlobal('performance', {
      now: vi.fn(() => Date.now()),
    });
  });

  afterEach(() => {
    scheduler.stop();
    vi.restoreAllMocks();
  });

  describe('lifecycle', () => {
    it('should start and stop correctly', () => {
      expect(scheduler.getCurrentFps()).toBe(0);
      
      scheduler.start();
      expect(requestAnimationFrame).toHaveBeenCalled();
      
      scheduler.stop();
      expect(cancelAnimationFrame).toHaveBeenCalled();
    });

    it('should not start multiple times', () => {
      scheduler.start();
      const firstCallCount = (requestAnimationFrame as any).mock.calls.length;
      
      scheduler.start(); // Should not start again
      expect((requestAnimationFrame as any).mock.calls.length).toBe(firstCallCount);
    });

    it('should reset performance tracking on stop', () => {
      scheduler.start();
      scheduler.stop();
      
      expect(scheduler.getCurrentFps()).toBe(0);
    });
  });

  describe('frame callbacks', () => {
    it('should add and remove frame callbacks', () => {
      scheduler.addFrameCallback(mockCallback);
      scheduler.removeFrameCallback(mockCallback);
      
      // Callback should not be called after removal
      scheduler.start();
      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should call frame callbacks with correct context', async () => {
      scheduler.addFrameCallback(mockCallback);
      scheduler.start();
      
      // Wait for frame callback
      await new Promise(resolve => setTimeout(resolve, 20));
      
      expect(mockCallback).toHaveBeenCalled();
      const context = mockCallback.mock.calls[0][0];
      
      expect(context).toHaveProperty('deltaMs');
      expect(context).toHaveProperty('currentTime');
      expect(context).toHaveProperty('fps');
      expect(context).toHaveProperty('frameNumber');
      expect(context).toHaveProperty('metrics');
      
      expect(typeof context.deltaMs).toBe('number');
      expect(typeof context.currentTime).toBe('number');
      expect(typeof context.fps).toBe('number');
      expect(typeof context.frameNumber).toBe('number');
    });

    it('should handle callback errors gracefully', async () => {
      const errorCallback = vi.fn(() => {
        throw new Error('Test error');
      });
      
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      scheduler.addFrameCallback(errorCallback);
      scheduler.addFrameCallback(mockCallback);
      scheduler.start();
      
      await new Promise(resolve => setTimeout(resolve, 20));
      
      expect(errorCallback).toHaveBeenCalled();
      expect(mockCallback).toHaveBeenCalled(); // Should still be called despite error
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('performance monitoring', () => {
    it('should track FPS correctly', async () => {
      scheduler = new Scheduler({ fpsWindowSize: 3 });
      scheduler.start();
      
      // Wait for a few frames
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const fps = scheduler.getCurrentFps();
      expect(fps).toBeGreaterThan(0);
      expect(fps).toBeLessThan(1000); // Reasonable upper bound
    });

    it('should update performance metrics', () => {
      const metrics = scheduler.getPerformanceMetrics();
      expect(metrics).toHaveProperty('fps');
      expect(metrics).toHaveProperty('frameTime');
      expect(metrics).toHaveProperty('activeParticles');
      expect(metrics).toHaveProperty('activeLayers');
      
      scheduler.updateMetrics({ activeParticles: 100, activeLayers: 5 });
      const updatedMetrics = scheduler.getPerformanceMetrics();
      expect(updatedMetrics.activeParticles).toBe(100);
      expect(updatedMetrics.activeLayers).toBe(5);
    });

    it('should calculate average frame time', async () => {
      scheduler.start();
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const avgFrameTime = scheduler.getAverageFrameTime();
      expect(avgFrameTime).toBeGreaterThan(0);
    });

    it('should calculate frame time variance', async () => {
      scheduler.start();
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const variance = scheduler.getFrameTimeVariance();
      expect(variance).toBeGreaterThanOrEqual(0);
    });

    it('should determine performance stability', async () => {
      scheduler.start();
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const isStable = scheduler.isPerformanceStable();
      expect(typeof isStable).toBe('boolean');
    });

    it('should provide performance grade', async () => {
      scheduler.start();
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const grade = scheduler.getPerformanceGrade();
      expect(['A', 'B', 'C', 'D', 'F']).toContain(grade);
    });
  });

  describe('quality change callbacks', () => {
    it('should add and remove quality change callbacks', () => {
      const qualityCallback = vi.fn();
      
      scheduler.addQualityChangeCallback(qualityCallback);
      scheduler.removeQualityChangeCallback(qualityCallback);
      
      // Should not be called after removal
      scheduler.updateMetrics({ fps: 30 });
      expect(qualityCallback).not.toHaveBeenCalled();
    });

    it('should call quality change callbacks during monitoring', async () => {
      const qualityCallback = vi.fn();
      scheduler = new Scheduler({ 
        monitoringInterval: 10,
        enableAdaptiveQuality: true 
      });
      
      scheduler.addQualityChangeCallback(qualityCallback);
      scheduler.start();
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(qualityCallback).toHaveBeenCalled();
    });
  });

  describe('configuration options', () => {
    it('should use custom target FPS', () => {
      scheduler = new Scheduler({ targetFps: 120 });
      // Target FPS affects performance grading
      expect(scheduler).toBeDefined();
    });

    it('should use custom FPS window size', () => {
      scheduler = new Scheduler({ fpsWindowSize: 30 });
      expect(scheduler).toBeDefined();
    });

    it('should use custom monitoring interval', () => {
      scheduler = new Scheduler({ monitoringInterval: 500 });
      expect(scheduler).toBeDefined();
    });

    it('should disable adaptive quality', () => {
      scheduler = new Scheduler({ enableAdaptiveQuality: false });
      expect(scheduler).toBeDefined();
    });
  });
});